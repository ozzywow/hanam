/* ═══════════════════════════════════════════════════════════════
   전 지역 실시간 돌발상황(사고·공사·통제) 프록시 (Cloudflare Pages Function)

   두 출처를 합친다:
   (1) 경기도교통정보센터(GITS) webLoadINCIData.do — 경기 전역(시내도로 포함). 상세·구조적.
   (2) 국토교통부 ITS eventInfo — 전국 고속도로. GITS 커버(경기 bbox) 밖 구간을 채운다
       (경부 천안 이남, 그 밖 노선 등). apiKey = env.ITS_API_KEY.

   GITS 원본 필드(0-base, 15개):
     0 id · 1 lng · 2 lat · 3 시작 · 4 종료('미정') · 5 시작linkId · 6 종료linkId
     · 7 cctvId · 8 cctvUrl · 9 통제차로 · 10 도로명 · 11 "(방향) A → B"
     · 12 전체메시지("[유형] …") · 13 인근CCTV명 · 14 분류(사고/공사/통제)
   ITS eventInfo 필드: type("고속도로"…) · eventType(공사/교통사고/기타돌발/기상/재난/기타)
     · eventDetailType · coordX/Y · linkId · roadName · roadDrcType · lanesBlocked · message
     · startDate/endDate ("YYYYMMDDHHmmss")

   정규화 공통 형태:
     { type, msg, road, dir, from, place, lanes, at, endAt, lat, lng, linkId, cctv }
   클라이언트(docs/assets/js/incidents.js)는 좌표 기준으로만 매칭 → 이 함수만 고치면 됨.

   - GITS bbox 안 = GITS 우선(ITS 중복 제외). bbox 밖 = ITS 만.
   - 노출시간: 사고·고장 12h / 공사·통제 30일 (종료시각이 미래면 유지).
   - 엣지 캐시 120초. 한 출처가 실패해도 다른 출처만으로 200 반환.

   2026-09-05: GITS BBOX 가 하남 전용이던 버그 수정 — PTS 전체 범위로 확장.
   2026-09-08: ITS eventInfo 병합 — 경기 밖 고속도로(경부·중부 등) 돌발 커버.
   ═══════════════════════════════════════════════════════════════ */

const GITS_URL = "https://gits.gg.go.kr/web/map/webLoadINCIData.do";
const GITS_REFERER = "https://gits.gg.go.kr/web/map/webMap.do?opt=2";
const ITS_URL = "https://openapi.its.go.kr:9443/eventInfo";
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
          "(KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36";
const CACHE_SEC = 120;
const ITS_TIMEOUT_MS = 9000;

/* GITS 가 커버하는 범위(경기 + 서울 동·남부). 이 안은 GITS 우선, 밖은 ITS. */
const GITS_BBOX = { latMin: 37.35, latMax: 37.65, lngMin: 126.40, lngMax: 127.35 };

/* ITS eventInfo 를 받아올 범위 — 현재 노선 페이지(경부: 서울~부산, 중부: 하남~청주)를
   넉넉히 덮는다. 노선 추가로 범위 벗어나면 여기를 넓힌다. */
const ITS_BBOX = { minX: 126.4, maxX: 129.4, minY: 34.9, maxY: 38.3 };

/* 유형별 노출 시간(발생시각 기준, 시간). 넘으면 제외(종료시각이 미래면 유지). */
const MAX_AGE_H = {
  "교통사고": 12, "차량사고": 12, "사고": 12,
  "차량고장": 12, "기타돌발": 12, "기상": 12,
  "공사": 720, "통제": 720, "도로폐쇄": 720, "행사": 720, "재난": 720,
};
const DEFAULT_AGE_H = 12;

/* ITS 공사 중 실제 영향이 미미한 이동·유지관리성 작업은 걸러 노이즈를 줄인다. */
const ITS_MAINT_RE = /이동|풀\s?베기|제초|청소|세척|점검|비탈면|살수|방제|예초|도색|표지/;
/* 국민참여단·도로안심서비스 등 시민 제보성 텍스트는 확정 돌발이 아니라 노이즈 → 제외.
   물음표·"부탁"조 문장도 제보성(관제 메시지는 평서문) → 함께 제외. */
const ITS_UGC_RE = /국민참여단|도로안심.?서비스|제보|[?？]|부탁/;

export async function onRequestGet({ request, env }) {
  const headers = {
    "content-type": "application/json; charset=utf-8",
    "access-control-allow-origin": "*",
    "cache-control": `public, max-age=${CACHE_SEC}`,
  };

  const cache = caches.default;
  const cacheKey = new Request(new URL("/api/incidents", request.url).toString());
  const hit = await cache.match(cacheKey);
  if (hit) return hit;

  const now = Date.now();
  const [gits, its] = await Promise.all([
    fetchGits(now).catch(() => null),
    fetchItsEvents(env && env.ITS_API_KEY, now).catch(() => null),
  ]);

  if (gits == null && its == null) {
    return new Response(
      JSON.stringify({ ok: false, error: "both upstreams failed" }),
      { headers: { ...headers, "cache-control": "public, max-age=90" } },
    );
  }

  const items = (gits || []).slice();
  /* ITS 항목은 GITS bbox 밖(= GITS 가 못 보는 곳)만 채택 */
  for (const it of (its || [])) {
    if (inGitsBox(it.lat, it.lng)) continue;
    items.push(it);
  }
  items.sort((a, b) => sev(a.type) - sev(b.type) || (b.at || "").localeCompare(a.at || ""));

  const src = [gits && "경기도교통정보센터(GITS)", its && "국토교통부 ITS"]
    .filter(Boolean).join(" · ") || "경기도교통정보센터(GITS)";

  const res = new Response(JSON.stringify({
    ok: true, updated: new Date().toISOString(), source: src, items,
  }), { headers });
  await cache.put(cacheKey, res.clone());
  return res;
}

function inGitsBox(lat, lng) {
  return lat >= GITS_BBOX.latMin && lat <= GITS_BBOX.latMax &&
         lng >= GITS_BBOX.lngMin && lng <= GITS_BBOX.lngMax;
}

/* "YYYY-MM-DD HH:MM(:SS)" (KST) → epoch ms */
function kstMs(s) {
  const m = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?/.exec(s || "");
  return m ? Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4] - 9, +m[5], +m[6] || 0) : null;
}
/* "YYYYMMDDHHmmss" (KST) → epoch ms */
function kstMsCompact(s) {
  const m = /^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})?$/.exec((s || "").trim());
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
  return { "교통사고": 0, "차량사고": 0, "사고": 0, "통제": 1, "도로폐쇄": 1,
           "공사": 2, "기상": 2, "재난": 1, "차량고장": 3 }[t] ?? 3;
}

async function fetchGits(now) {
  const opts = {
    headers: {
      "user-agent": UA, "referer": GITS_REFERER,
      "accept": "text/plain, */*", "accept-language": "ko-KR,ko;q=0.9",
    },
  };
  let r = await fetch(GITS_URL, opts);
  if (!r.ok) { await new Promise(res => setTimeout(res, 900)); r = await fetch(GITS_URL, opts); }
  if (!r.ok) throw new Error("gits http " + r.status);

  const text = (await r.text()).trim();
  const out = [];

  for (const rec of text.split("@")) {
    const f = rec.split("::");
    if (f.length < 15) continue;

    const lng = +f[1], lat = +f[2];
    if (!isFinite(lat) || !isFinite(lng)) continue;
    if (!inGitsBox(lat, lng)) continue;

    const full = f[12] || "";
    const br = (full.match(/^\s*\[([^\]]+)\]/) || [])[1] || "";
    const type = (br || f[14] || "돌발").trim();

    const startMs = kstMs(f[3]);
    const endMs = kstMs(f[4]);
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
  return out;
}

async function fetchItsEvents(key, now) {
  if (!key) return null;
  const q = `${ITS_URL}?apiKey=${key}&type=all&eventType=all&getType=json` +
    `&minX=${ITS_BBOX.minX}&maxX=${ITS_BBOX.maxX}&minY=${ITS_BBOX.minY}&maxY=${ITS_BBOX.maxY}`;
  const r = await fetch(q, {
    headers: { "user-agent": UA, "accept": "application/json" },
    signal: AbortSignal.timeout(ITS_TIMEOUT_MS),
  });
  if (!r.ok) throw new Error("its http " + r.status);
  const j = JSON.parse(await r.text());
  const rows = j && j.body && Array.isArray(j.body.items) ? j.body.items : [];
  const out = [];

  for (const e of rows) {
    if (e.type !== "고속도로") continue;                 // 고속도로 돌발만
    const lat = parseFloat(e.coordY), lng = parseFloat(e.coordX);
    if (!isFinite(lat) || !isFinite(lng)) continue;

    const et = (e.eventType || "").trim();
    const detail = (e.eventDetailType || "").trim();
    const lanes = (e.lanesBlocked || "").trim();
    /* 선행 "<사고>::" 같은 태그 제거 + 공백 정리 */
    const msg = (e.message || "").replace(/^<[^>]*>::?/, "").replace(/\s+/g, " ").trim();

    if (ITS_UGC_RE.test(msg)) continue;                 // 시민 제보성 텍스트 제외

    /* 노이즈 컷 — 이동/유지관리성 공사(차로 차단 없거나 청소·풀베기류)는 뺀다.
       사고·정체·기상·재난, 그리고 실제 차로 차단이 있는 공사만 남긴다. */
    if (et === "공사") {
      const realClosure = /[0-9]\s*차로/.test(lanes) && !ITS_MAINT_RE.test(msg);
      if (!realClosure) continue;
    } else if (et !== "교통사고" && et !== "기타돌발" && et !== "기상" && et !== "재난") {
      continue;
    }

    const type = et === "교통사고" ? "교통사고"
      : et === "공사" ? "공사"
      : et === "기상" ? "기상"
      : et === "재난" ? "재난"
      : "기타돌발";

    const startMs = kstMsCompact(e.startDate);
    const endMs = kstMsCompact(e.endDate);
    const okByAge = startMs != null &&
      (now - startMs) <= (MAX_AGE_H[type] || DEFAULT_AGE_H) * 3600000;
    const okByEnd = endMs != null && endMs > now;
    if (!okByAge && !okByEnd && startMs != null) continue;   // 날짜 파싱 실패면 일단 유지

    out.push({
      type,
      msg: msg || (lanes ? lanes + " 차단" : detail || "돌발"),
      road: (e.roadName || "").trim(),
      dir: "",
      from: "",
      place: "",
      lanes: lanes || "",
      at: startMs != null ? new Date(startMs).toISOString() : null,
      endAt: endMs != null ? new Date(endMs).toISOString() : null,
      lat, lng,
      linkId: e.linkId || null,
      cctv: null,
    });
  }
  return out;
}
