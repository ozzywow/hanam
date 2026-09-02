/* ═══════════════════════════════════════════════════════════════
   하남 주변 실시간 돌발상황(사고·공사·통제) 프록시 (Cloudflare Pages Function)

   원본: POST https://www.hanam.go.kr/its/getUnexpect.do  (경기도교통정보센터)
   - JSON POST 필수(text/plain 은 415), CORS 프리플라이트(OPTIONS) 미지원
     → 브라우저(hanamlife.com)에서 직접 못 부른다. 이 함수가 서버측에서 대신 호출.
   - 최근 2일치를 받아 진행중(END_YN != "Y") + cams.js 좌표 범위(+여유) +
     유형별 노출시간(사고 3h · 공사 24h · 기타돌발/고장 1h) 안의 항목만 추리고,
     필요한 필드만 남겨 CORS 붙여 돌려준다.
   - 엣지 캐시 120초.

   라우트: GET /api/incidents     (functions/api/incidents.js)
   응답:  { ok, updated, source, items:[{type,msg,place,from,at,lat,lng,linkId}] }
   ═══════════════════════════════════════════════════════════════ */

const API_URL = "https://www.hanam.go.kr/its/getUnexpect.do";
const REFERER = "https://www.hanam.go.kr/its/mapWebView.do?key=11891&display=unexpect";
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
          "(KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36";
const CACHE_SEC = 120;

/* cams.js 좌표 범위(lat 37.405–37.604, lng 127.095–127.303) + 약 2.5km 여유 */
const BBOX = { latMin: 37.38, latMax: 37.63, lngMin: 127.07, lngMax: 127.33 };

/* 유형별 노출 시간(발생시각 기준, 시간). 넘으면 제외. 시각 파싱 실패도 제외. */
const MAX_AGE_H = { "교통사고": 3, "차량사고": 3, "공사": 24, "차량고장": 1, "기타돌발": 1 };
const DEFAULT_AGE_H = 3;

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
      source: "하남시 교통정보센터 · 경기도교통정보센터",
      items,
    }), { headers });
    await cache.put(cacheKey, res.clone());
    return res;
  } catch (err) {
    // 실패해도 200 + ok:false → 클라이언트가 조용히 숨기고 재시도.
    // 원본이 간헐적으로 429/500(레이트리밋) → 실패도 90초 캐시해 재호출 억제.
    return new Response(
      JSON.stringify({ ok: false, error: String((err && err.message) || err) }),
      { headers: { ...headers, "cache-control": "public, max-age=90" } },
    );
  }
}

function fmt(d) {
  const p = n => String(n).padStart(2, "0");
  return d.getFullYear() + p(d.getMonth() + 1) + p(d.getDate()) +
         p(d.getHours()) + p(d.getMinutes()) + p(d.getSeconds());
}

/* "2026-09-02 11:48:44" (KST) → ISO 문자열 (뷰어 시간대와 무관하게 정확) */
function toIso(s) {
  const m = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?/.exec(s || "");
  if (!m) return null;
  return new Date(Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4] - 9, +m[5], +m[6] || 0)).toISOString();
}

async function fetchIncidents() {
  const now = new Date();
  const from = new Date(now.getTime() - 2 * 24 * 3600 * 1000);
  const body = JSON.stringify({ sdtm: fmt(from), edtm: fmt(now), endYn: null });
  const opts = {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "accept": "application/json, application/*+json",
      "user-agent": UA,
      "referer": REFERER,
      "origin": "https://www.hanam.go.kr",
      "x-requested-with": "XMLHttpRequest",
      "accept-language": "ko-KR,ko;q=0.9",
    },
    body,
  };

  let r = await fetch(API_URL, opts);
  if (!r.ok) {
    // 간헐적 레이트리밋 → 짧게 한 번 더
    await new Promise(res => setTimeout(res, 900));
    r = await fetch(API_URL, opts);
  }
  if (!r.ok) throw new Error("api http " + r.status);

  const j = await r.json();
  const raw = (j && Array.isArray(j.items)) ? j.items : [];

  const seen = new Set();
  const out = [];
  for (const it of raw) {
    if (it.END_YN === "Y") continue;
    const lat = +it.LAT, lng = +it.LNG;
    if (!isFinite(lat) || !isFinite(lng)) continue;
    if (lat < BBOX.latMin || lat > BBOX.latMax || lng < BBOX.lngMin || lng > BBOX.lngMax) continue;

    const msg = (it.UNXP_MSG || "").replace(/\s+/g, " ").trim();
    const place = (it.ENODE_NM || "").trim();
    if (!msg && !place) continue;
    const type = (it.UNXP_TYPE || "돌발").trim();
    // 내용 없는 '기타돌발'은 노이즈 → 제외
    if (!msg && type === "기타돌발") continue;

    // 유형별 노출 시간 필터 (발생시각 기준)
    const at = toIso(it.OCRN_DT || it.START_DT);
    if (!at) continue;
    const ageH = (Date.now() - Date.parse(at)) / 3600000;
    if (ageH > (MAX_AGE_H[type] || DEFAULT_AGE_H)) continue;

    const key = (it.LINK_ID || "") + "|" + (it.OCRN_DT || "") + "|" + msg;
    if (seen.has(key)) continue;
    seen.add(key);

    out.push({
      type,
      msg,
      place,
      from: (it.SNODE_NM || "").trim(),
      at,
      lat, lng,
      linkId: it.LINK_ID || null,
    });
  }
  out.sort((a, b) => (b.at || "").localeCompare(a.at || ""));
  return out;
}
