/* ═══════════════════════════════════════════════════════════════
   하남 구간별 실시간 소통(원활/서행/정체) 프록시 (Cloudflare Pages Function)

   원본: GET https://gits.gg.go.kr/web/map/webLoadTrafficData.do?mapLevel=8&lon=<x>&lat=<y>
     - GITS 지도 소통 레이어의 내부 엔드포인트(지도 JS엔 주석 처리, 서버는 응답).
     - text/plain, '#' 구분 9필드 단일 레코드 = 지정 좌표의 최근접 도로 링크:
         0 linkId · 1 도로명 · 2 from · 3 to · 4 통행시간(분) · 5 링크길이(km) · 6 LOS · 7 SPD(km/h) · 8 geometry
       LOS: 1 원활 · 2 서행 · 3 정체(4까지 방어). CORS 헤더 없음 → 이 함수가 대행.
       geometry = "lng,lat|lng,lat|…" 폴리라인 — 클라가 스냅 거리·방향 검증에 씀.

   라우트: GET /api/traffic?pts=<lng,lat>;<lng,lat>;...      (최대 24점)
   응답:   { ok, updated, source, results:[ {lng,lat,linkId,road,from,to,los,spd,travelMin,lengthKm,geom} | null, ... ] }
           results 는 pts 순서 그대로(조회 실패한 점은 null). 엣지 캐시 120초.
   ═══════════════════════════════════════════════════════════════ */

const BASE = "https://gits.gg.go.kr/web/map/webLoadTrafficData.do";
const REFERER = "https://gits.gg.go.kr/web/map/webMap.do?opt=1";
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
          "(KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36";
const MAP_LEVEL = 8;
const MAX_PTS = 24;
const CACHE_SEC = 120;
const FETCH_TIMEOUT_MS = 8000;

export async function onRequestGet({ request }) {
  const headers = {
    "content-type": "application/json; charset=utf-8",
    "access-control-allow-origin": "*",
    "cache-control": `public, max-age=${CACHE_SEC}`,
  };

  const raw = (new URL(request.url).searchParams.get("pts") || "").trim();
  const pts = raw
    ? raw.split(";")
        .map(s => s.split(",").map(Number))
        .filter(p => p.length === 2 && isFinite(p[0]) && isFinite(p[1]))
        .slice(0, MAX_PTS)
    : [];
  if (!pts.length) {
    return new Response(JSON.stringify({ ok: false, error: "no pts" }), { headers });
  }

  // 캐시 키는 정규화된 pts(소수 4자리)로 — 클라이언트 반올림 차이 흡수
  const norm = pts.map(p => p[0].toFixed(4) + "," + p[1].toFixed(4)).join(";");
  const cache = caches.default;
  const cacheKey = new Request(
    new URL("/api/traffic?pts=" + encodeURIComponent(norm), request.url).toString(),
  );
  const hit = await cache.match(cacheKey);
  if (hit) return hit;

  try {
    const results = await Promise.all(pts.map(p => probe(p[0], p[1])));
    const res = new Response(JSON.stringify({
      ok: true,
      updated: new Date().toISOString(),
      source: "경기도교통정보센터(GITS)",
      results,
    }), { headers });
    await cache.put(cacheKey, res.clone());
    return res;
  } catch (err) {
    return new Response(
      JSON.stringify({ ok: false, error: String((err && err.message) || err) }),
      { headers: { ...headers, "cache-control": "public, max-age=60" } },
    );
  }
}

async function probe(lng, lat) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
  try {
    const r = await fetch(`${BASE}?mapLevel=${MAP_LEVEL}&lon=${lng}&lat=${lat}`, {
      signal: ctrl.signal,
      headers: {
        "user-agent": UA,
        "referer": REFERER,
        "accept": "text/plain, */*",
        "accept-language": "ko-KR,ko;q=0.9",
      },
    });
    if (!r.ok) return null;
    const f = (await r.text()).trim().split("#");
    if (f.length < 8) return null;
    const los = parseInt(f[6], 10);
    if (!(los >= 1 && los <= 4)) return null;
    const spd = parseFloat(f[7]);
    const travelMin = parseFloat(f[4]);
    const lengthKm = parseFloat(f[5]);
    return {
      lng, lat,
      linkId: f[0] || null,
      road: (f[1] || "").trim(),
      from: (f[2] || "").trim(),
      to: (f[3] || "").trim(),
      los,
      spd: isFinite(spd) ? spd : null,
      travelMin: isFinite(travelMin) ? travelMin : null,
      lengthKm: isFinite(lengthKm) ? lengthKm : null,
      geom: (f[8] || "").trim() || null,   // "lng,lat|lng,lat|…"
    };
  } catch (e) {
    return null;
  } finally {
    clearTimeout(timer);
  }
}
