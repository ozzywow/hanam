/* ═══════════════════════════════════════════════════════════════
   지역 허브 페이지 상단 날씨 배지 — Open-Meteo 프록시 (Cloudflare Pages Function)

   Open-Meteo(open-meteo.com)는 API 키 없이 쓸 수 있는 비상업적 무료 예보 API.
   원본: GET https://api.open-meteo.com/v1/forecast
           ?latitude=<lat>&longitude=<lon>&current=temperature_2m,weather_code&timezone=Asia/Seoul

   라우트: GET /api/weather?lat=<lat>&lon=<lon>
   응답:   { ok, temp, code, updated }   (실패 시 { ok:false }). 엣지 캐시 15분 —
           날씨는 자주 안 바뀌고 지역 허브 페이지 방문마다 호출되니 캐시로 상한선 관리.
   ═══════════════════════════════════════════════════════════════ */

const BASE = "https://api.open-meteo.com/v1/forecast";
const CACHE_SEC = 900;
const FETCH_TIMEOUT_MS = 6000;

export async function onRequestGet({ request }) {
  const headers = {
    "content-type": "application/json; charset=utf-8",
    "access-control-allow-origin": "*",
    "cache-control": `public, max-age=${CACHE_SEC}`,
  };

  const u = new URL(request.url);
  const lat = parseFloat(u.searchParams.get("lat"));
  const lon = parseFloat(u.searchParams.get("lon"));
  if (!isFinite(lat) || !isFinite(lon)) {
    return new Response(JSON.stringify({ ok: false, error: "lat/lon required" }), { headers });
  }

  const cache = caches.default;
  const cacheKey = new Request(
    new URL(`/api/weather?lat=${lat.toFixed(3)}&lon=${lon.toFixed(3)}`, request.url).toString(),
  );
  const hit = await cache.match(cacheKey);
  if (hit) return hit;

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
  try {
    const r = await fetch(
      `${BASE}?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&timezone=Asia%2FSeoul`,
      { signal: ctrl.signal },
    );
    if (!r.ok) throw new Error("upstream " + r.status);
    const j = await r.json();
    const cur = j.current || {};
    const res = new Response(JSON.stringify({
      ok: true,
      temp: isFinite(cur.temperature_2m) ? Math.round(cur.temperature_2m) : null,
      code: isFinite(cur.weather_code) ? cur.weather_code : null,
      updated: cur.time || null,
    }), { headers });
    await cache.put(cacheKey, res.clone());
    return res;
  } catch (err) {
    return new Response(
      JSON.stringify({ ok: false, error: String((err && err.message) || err) }),
      { headers: { ...headers, "cache-control": "public, max-age=60" } },
    );
  } finally {
    clearTimeout(timer);
  }
}
