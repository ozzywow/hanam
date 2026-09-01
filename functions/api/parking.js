/* ═══════════════════════════════════════════════════════════════
   스타필드 하남 실시간 주차 혼잡도 프록시 (Cloudflare Pages Function)

   원본: https://www.starfield.co.kr/api/hanam/myCar/parkingCNT.do
   - 이 API 는 /hanam/ 경로 페이지를 먼저 GET 해서 받은 JSESSIONID
     쿠키가 있어야 동작한다(없으면 {"message":"bcnCd is null"}).
     그래서 브라우저(hanamlife.com)에서 직접 못 부른다.
   - 이 함수가 서버측에서 2단계(세션 발급 → API 호출)를 대신하고,
     필요한 4개 층(RF·B1·B2·B3)의 혼잡도만 추려 CORS 붙여 돌려준다.
   - 엣지 캐시 90초 → 원본을 자주 때리지 않는다.

   라우트: GET /api/parking     (functions/api/parking.js)
   응답:  { ok, updated, source, floors:[{id,label,sub,deg,status,cnt}] }
          deg: "01" 여유 / "02" 혼잡 / "03" 만차 / null 정보없음
   ═══════════════════════════════════════════════════════════════ */

const SESSION_URL = "https://www.starfield.co.kr/hanam/about/parkingInfo.do";
const API_URL     = "https://www.starfield.co.kr/api/hanam/myCar/parkingCNT.do";
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
          "(KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36";
const CACHE_SEC = 90;

const DEG_TEXT = { "01": "여유", "02": "혼잡", "03": "만차" };
const FLOORS = [
  { id: "rf", label: "RF", sub: "옥상", key: "top" },
  { id: "b1", label: "B1", sub: "",     key: "b1f" },
  { id: "b2", label: "B2", sub: "",     key: "b2f" },
  { id: "b3", label: "B3", sub: "",     key: "b3f" },
];

export async function onRequestGet({ request }) {
  const headers = {
    "content-type": "application/json; charset=utf-8",
    "access-control-allow-origin": "*",
    "cache-control": `public, max-age=${CACHE_SEC}`,
  };

  const cache = caches.default;
  const cacheKey = new Request(new URL("/api/parking", request.url).toString());
  const hit = await cache.match(cacheKey);
  if (hit) return hit;

  try {
    const rlt = await fetchParking();
    const floors = FLOORS.map(f => {
      const raw = rlt[f.key + "_deg"];
      const deg = DEG_TEXT[raw] ? raw : null;
      return {
        id: f.id, label: f.label, sub: f.sub,
        deg, status: deg ? DEG_TEXT[deg] : null,
        cnt: Number(rlt[f.key + "_cnt"]) || 0,
      };
    });
    const res = new Response(JSON.stringify({
      ok: true,
      updated: new Date().toISOString(),
      source: "starfield.co.kr/hanam/about/parkingInfo.do",
      floors,
    }), { headers });
    await cache.put(cacheKey, res.clone());
    return res;
  } catch (err) {
    // 실패해도 200 + ok:false → 클라이언트가 패널을 조용히 숨기고 재시도
    return new Response(
      JSON.stringify({ ok: false, error: String((err && err.message) || err) }),
      { headers: { ...headers, "cache-control": "public, max-age=30" } },
    );
  }
}

async function fetchParking() {
  const s = await fetch(SESSION_URL, {
    headers: { "user-agent": UA, "accept": "text/html", "accept-language": "ko-KR,ko;q=0.9" },
  });
  const jsid = pickJsession(s.headers);
  if (!jsid) throw new Error("no session cookie");

  const a = await fetch(API_URL, {
    headers: {
      "user-agent": UA,
      "accept": "application/json",
      "referer": SESSION_URL,
      "x-requested-with": "XMLHttpRequest",
      "cookie": jsid,
    },
  });
  if (!a.ok) throw new Error("api http " + a.status);

  const outer = await a.json();
  if (!outer || !outer.jsonApiBody) throw new Error((outer && outer.message) || "no jsonApiBody");
  const inner = JSON.parse(outer.jsonApiBody);
  if (!inner || !inner.rlt) throw new Error("no rlt");
  return inner.rlt;
}

function pickJsession(h) {
  const list = typeof h.getSetCookie === "function"
    ? h.getSetCookie()
    : [h.get("set-cookie") || ""];
  for (const c of list) {
    const m = /JSESSIONID=[^;]+/.exec(c || "");
    if (m) return m[0];
  }
  return null;
}
