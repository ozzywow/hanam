/* ═══════════════════════════════════════════════════════════════
   CCTV 재생 토큰 리졸버 프록시 (Cloudflare Pages Function)

   regions/*.js 에 박힌 gitsview 리졸버 URL 안의 GITS 팝업 토큰이 만료되면
   (HTTP 401) 클라이언트가 스스로 복구할 수 없다 — 3h refresh Action 이
   돌기 전까지 재생 공백이 생긴다. 이 함수가 GITS 팝업
   (gits.gg.go.kr/web/popup/webCctvPopup.do) 을 서버측에서 다시 긁어
   신선한 토큰을 뽑아 준다. GITS 는 CORS 헤더가 없어 브라우저 직접 호출 불가.

   라우트: GET /api/resolve?id=<숫자>&type=<hls|vod>
   응답(항상 200):
     hls → { ok:true, kind:"hls", m3u8:"https://…playlist.m3u8?…",
             resolver:"https://gitsview.gg.go.kr/<id>/<tok>!hls" }
     vod → { ok:true, kind:"vod", url:"https://gitsview.gg.go.kr/<id>/<tok>" }
           (브라우저가 <video src> 로 쓰면 302 → mp4)
     실패 → { ok:false, error:"…" }
   엣지 캐시 45초 — 팝업은 매번 새 토큰이지만 옛 토큰도 한동안 유효 →
   같은 카메라로 몰리는 버스트로부터 GITS 를 보호.
   ═══════════════════════════════════════════════════════════════ */

const POPUP = id => `https://gits.gg.go.kr/web/popup/webCctvPopup.do?cctvId=${id}`;
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
          "(KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36";
const REFERER = "https://gits.gg.go.kr/web/map/webMap.do?opt=3";
const CACHE_SEC = 45;

export async function onRequestGet({ request }) {
  const url = new URL(request.url);
  const id = (url.searchParams.get("id") || "").trim();
  const type = (url.searchParams.get("type") || "hls").trim();

  const headers = {
    "content-type": "application/json; charset=utf-8",
    "access-control-allow-origin": "*",
    "cache-control": `public, max-age=${CACHE_SEC}`,
  };
  const fail = (msg, sec) => new Response(
    JSON.stringify({ ok: false, error: String((msg && msg.message) || msg) }),
    { headers: { ...headers, "cache-control": `public, max-age=${sec || 20}` } },
  );

  if (!/^[0-9]{1,7}$/.test(id)) return fail("bad id");
  if (type !== "hls" && type !== "vod") return fail("bad type");

  const cache = caches.default;
  const cacheKey = new Request(new URL(`/api/resolve?id=${id}&type=${type}`, request.url).toString());
  const hit = await cache.match(cacheKey);
  if (hit) return hit;

  try {
    const opts = { headers: { "user-agent": UA, "referer": REFERER, "accept-language": "ko-KR,ko;q=0.9" } };
    let pr = await fetch(POPUP(id), opts);
    if (!pr.ok) { await new Promise(r => setTimeout(r, 700)); pr = await fetch(POPUP(id), opts); }
    if (!pr.ok) throw new Error("popup http " + pr.status);
    const html = await pr.text();

    const hlsM = html.match(/(?:https?:)?\/\/gitsview\.gg\.go\.kr\/\d+\/[^"!]+!hls/);
    const vodM = html.match(/<video[^>]+src="(https:\/\/gitsview\.gg\.go\.kr\/\d+\/[^"]+)"/);

    let body;
    const asHls = async () => {
      const resolver = "https:" + hlsM[0].replace(/^https?:/, "");
      const rr = await fetch(resolver, { headers: { "user-agent": UA } });
      const m3u8 = (await rr.text()).trim();
      if (!/^https?:\/\/\S+m3u8/.test(m3u8)) throw new Error("resolver bad body");
      return { ok: true, kind: "hls", m3u8, resolver };
    };

    if (type === "vod" && vodM) body = { ok: true, kind: "vod", url: vodM[1] };
    else if (type === "hls" && hlsM) body = await asHls();
    else if (vodM) body = { ok: true, kind: "vod", url: vodM[1] };
    else if (hlsM) body = await asHls();
    else throw new Error("no token in popup");

    const res = new Response(JSON.stringify(body), { headers });
    await cache.put(cacheKey, res.clone());
    return res;
  } catch (err) {
    return fail(err, 20);
  }
}
