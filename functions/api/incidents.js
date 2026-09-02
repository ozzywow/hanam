/* ═══════════════════════════════════════════════════════════════
   하남 주변 실시간 돌발상황(사고·공사·통제) 프록시 (Cloudflare Pages Function)

   원본: GET https://gits.gg.go.kr/web/map/webLoadINCIData.do  (경기도교통정보센터·GITS)
   - text/plain, 레코드 '@' · 필드 '::' 구분. CORS 헤더 없음 → 브라우저 직접
     호출 불가. 이 함수가 서버측에서 받아 파싱·필터해 CORS 붙여 돌려준다.
   - 필드(0-base, 15개):
       0 id · 1 lng · 2 lat · 3 시작 · 4 종료('미정') · 5 시작linkId · 6 종료linkId
       · 7 cctvId · 8 cctvUrl · 9 통제차로 · 10 도로명 · 11 "(방향) A → B"
       · 12 전체메시지("[유형] …") · 13 인근CCTV명 · 14 분류(사고/공사/통제)
   - 하남 좌표 범위(+여유) + 유형별 노출시간(사고 3h · 공사/통제 24h ·
     차량고장 1h) 안의 항목만. 종료시각이 실제 미래면 시간 무관하게 유지.
   - 엣지 캐시 120초.

   라우트: GET /api/incidents
   응답: { ok, updated, source,
           items:[{type,msg,road,dir,from,place,lanes,at,endAt,lat,lng,linkId,cctv}] }
   ═══════════════════════════════════════════════════════════════ */

const API_URL = "https://gits.gg.go.kr/web/map/webLoadINCIData.do";
const REFERER = "https://gits.gg.go.kr/web/map/webMap.do?opt=2";
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
          "(KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36";
const CACHE_SEC = 120;

/* cams.js 좌표 범위(lat 37.405–37.604, lng 127.095–127.303) + 약 2.5km 여유 */
const BBOX = { latMin: 37.38, latMax: 37.63, lngMin: 127.07, lngMax: 127.33 };

/* 유형별 노출 시간(발생시각 기준, 시간). 넘으면 제외(종료시각이 미래면 유지).
   GITS 피드는 큐레이션돼 있어(경기 전체 20건 안팎) 계획성 통제(공사·통제)는
   길게 두고, 사고·고장 등 일시적 항목만 짧게 자른다. */
const MAX_AGE_H = {
  "교통사고": 3, "차량사고": 3, "사고": 3,
  "차량고장": 1, "기타돌발": 1,
  "공사": 720, "통제": 720, "도로폐쇄": 720, "행사": 720,   // 30일 sanity 상한
};
const DEFAULT_AGE_H = 6;

export async function onRequestGet({ request }) {
  const headers = {
    "content-type": "application/json; charset=utf-8",
    "access-control-allow-origin": "*",
    "cache-control": `public, max-age=${CACHE_SEC}`,
  };

  const cache = caches.default;
  const cacheKey = new Request(new URL("/api/incidents", request.url).toString());
  const hit = await cache.match(cacheKey);
  if (hit) return hit;

  try {
    const items = await fetchIncidents();
    const res = new Response(JSON.stringify({
      ok: true,
      updated: new Date().toISOString(),
      source: "경기도교통정보센터(GITS)",
      items,
    }), { headers });
    await cache.put(cacheKey, res.clone());
    return res;
  } catch (err) {
    // 실패해도 200 + ok:false → 클라이언트가 조용히 숨기고 재시도(실패도 90초 캐시)
    return new Response(
      JSON.stringify({ ok: false, error: String((err && err.message) || err) }),
      { headers: { ...headers, "cache-control": "public, max-age=90" } },
    );
  }
}

/* "YYYY-MM-DD HH:MM(:SS)" (KST) → epoch ms, 아니면 null */
function kstMs(s) {
  const m = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?/.exec(s || "");
  return m ? Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4] - 9, +m[5], +m[6] || 0) : null;
}

/* "(일산방향) 김포IC → 자유로JC" → {dir, from, to} */
function parseSect(s) {
  const m = /^\(([^)]*)\)\s*(.*)$/.exec((s || "").trim());
  const dir = m ? m[1].trim() : "";
  const rest = (m ? m[2] : (s || "")).trim();
  const p = rest.split(/\s*→\s*/);
  return {
    dir,
    from: p.length > 1 ? p[0].trim() : "",
    to: (p.length > 1 ? p[1] : p[0] || "").trim(),
  };
}

/* 전체메시지에서 도로·구간 중복을 걷어낸 짧은 설명 */
function shortMsg(full, lanesRaw) {
  let t = (full || "").replace(/\s+/g, " ").trim().replace(/^\[[^\]]*\]\s*/, "");
  const i = t.indexOf("통제");
  if (i >= 0) {
    const tail = t.slice(i + 2).replace(/^[\s,]+/, "").trim();
    const lane = lanesRaw && !/정보없음/.test(lanesRaw) ? lanesRaw + " 통제" : "차로 통제";
    return tail ? lane + " · " + tail : lane;
  }
  return t;
}

function sev(t) {
  return { "교통사고": 0, "차량사고": 0, "사고": 0, "통제": 1, "도로폐쇄": 1, "공사": 2, "차량고장": 3 }[t] ?? 3;
}

async function fetchIncidents() {
  const opts = {
    headers: {
      "user-agent": UA,
      "referer": REFERER,
      "accept": "text/plain, */*",
      "accept-language": "ko-KR,ko;q=0.9",
    },
  };
  let r = await fetch(API_URL, opts);
  if (!r.ok) { await new Promise(res => setTimeout(res, 900)); r = await fetch(API_URL, opts); }
  if (!r.ok) throw new Error("api http " + r.status);

  const text = (await r.text()).trim();
  const now = Date.now();
  const out = [];

  for (const rec of text.split("@")) {
    const f = rec.split("::");
    if (f.length < 15) continue;

    const lng = +f[1], lat = +f[2];
    if (!isFinite(lat) || !isFinite(lng)) continue;
    if (lat < BBOX.latMin || lat > BBOX.latMax || lng < BBOX.lngMin || lng > BBOX.lngMax) continue;

    const full = f[12] || "";
    const br = (full.match(/^\s*\[([^\]]+)\]/) || [])[1] || "";
    const type = (br || f[14] || "돌발").trim();

    const startMs = kstMs(f[3]);
    const endMs = kstMs(f[4]);           // '미정' → null
    const okByAge = startMs != null &&
      (now - startMs) <= (MAX_AGE_H[type] || DEFAULT_AGE_H) * 3600000;
    const okByEnd = endMs != null && endMs > now;
    if (!okByAge && !okByEnd) continue;

    const s = parseSect(f[11]);
    const lanesRaw = (f[9] || "").trim();

    out.push({
      type,
      msg: shortMsg(full, lanesRaw),
      road: (f[10] || "").trim(),
      dir: s.dir,
      from: s.from,
      place: s.to,
      lanes: /정보없음/.test(lanesRaw) ? "일부 차로" : lanesRaw,
      at: startMs != null ? new Date(startMs).toISOString() : null,
      endAt: endMs != null ? new Date(endMs).toISOString() : null,
      lat, lng,
      linkId: (f[6] && f[6] !== "0000000000") ? f[6]
            : (f[5] && f[5] !== "0000000000" ? f[5] : null),
      cctv: (f[8] && f[8] !== "null") ? f[8] : null,
    });
  }

  out.sort((a, b) => sev(a.type) - sev(b.type) || (b.at || "").localeCompare(a.at || ""));
  return out;
}
