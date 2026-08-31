/* docs/assets/js/cams.js 에 있는 모든 카메라의 재생 토큰을
   GITS 팝업에서 다시 긁어 비교/갱신.

   사용:
     node tools/scrape-tokens.mjs           # 확인만 (변경분 표시)
     node tools/scrape-tokens.mjs --write   # cams.js 의 url 을 최신 토큰으로 교체

   원리:
     GITS 팝업  https://gits.gg.go.kr/web/popup/webCctvPopup.do?cctvId=<id>
       - hls: <script> 안  //gitsview.gg.go.kr/<id>/<token>!hls
       - vod: <video src="https://gitsview.gg.go.kr/<id>/<token>">
     이 URL 안의 <token> 은 보통 고정이지만 GITS 개편 시 바뀔 수 있음.
*/

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));
const CAMS_PATH = resolve(HERE, "../docs/assets/js/cams.js");
const WRITE = process.argv.includes("--write");
const POPUP = id => `https://gits.gg.go.kr/web/popup/webCctvPopup.do?cctvId=${id}`;
const HEADERS = { "User-Agent": "Mozilla/5.0", "Referer": "https://gits.gg.go.kr/web/map/webMap.do?opt=3" };

let src = readFileSync(CAMS_PATH, "utf8");

// { id:NNN, ... type:"hls"|"vod", url:"..." } 를 순서대로 추출
const camRe = /\{\s*id:\s*(\d+)[^}]*?type:\s*"(hls|vod)"[^}]*?url:\s*"([^"]+)"\s*\}/g;
const cams = [...src.matchAll(camRe)].map(m => ({ id: m[1], type: m[2], url: m[3] }));
if (!cams.length){ console.error("cams.js 에서 카메라를 찾지 못했습니다."); process.exit(1); }

console.log(`${cams.length}개 카메라 확인 중…\n`);

let changed = 0, failed = 0;
for (const cam of cams){
  let html;
  try {
    const r = await fetch(POPUP(cam.id), { headers: HEADERS });
    html = await r.text();
  } catch (e) {
    console.log(`  ✗ ${cam.id}  요청 실패 (${e.message})`); failed++; continue;
  }

  let fresh;
  if (cam.type === "hls"){
    const m = html.match(/(?:https?:)?\/\/gitsview\.gg\.go\.kr\/\d+\/[^"!]+!hls/);
    if (m) fresh = "https:" + m[0].replace(/^https?:/, "");
  } else {
    const m = html.match(/<video[^>]+src="(https:\/\/gitsview\.gg\.go\.kr\/\d+\/[^"]+)"/);
    if (m) fresh = m[1];
  }

  if (!fresh){
    console.log(`  ✗ ${cam.id}  토큰 패턴 없음 (팝업 구조 변경 가능성)`); failed++; continue;
  }
  if (fresh === cam.url){
    console.log(`  · ${cam.id}  동일`);
  } else {
    console.log(`  ~ ${cam.id}  변경\n      old ${cam.url}\n      new ${fresh}`);
    if (WRITE) src = src.split(cam.url).join(fresh);
    changed++;
  }
}

console.log(`\n변경 ${changed} · 실패 ${failed} · 동일 ${cams.length - changed - failed}`);
if (changed && WRITE){ writeFileSync(CAMS_PATH, src); console.log(`→ ${CAMS_PATH} 갱신 완료`); }
else if (changed){ console.log("→ 반영하려면 --write 로 다시 실행"); }
