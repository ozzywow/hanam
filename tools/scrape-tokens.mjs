/* docs/assets/js/cams.js 에 있는 모든 카메라의 재생 토큰과 좌표를
   GITS 에서 다시 긁어 비교/갱신.

   사용:
     node tools/scrape-tokens.mjs           # 확인만 (변경분 표시)
     node tools/scrape-tokens.mjs --write   # cams.js 의 url·lat·lng 를 최신값으로 교체

   원리:
     토큰 — GITS 팝업  https://gits.gg.go.kr/web/popup/webCctvPopup.do?cctvId=<id>
       - hls: <script> 안  //gitsview.gg.go.kr/<id>/<token>!hls
       - vod: <video src="https://gitsview.gg.go.kr/<id>/<token>">
     이 URL 안의 <token> 은 보통 고정이지만 GITS 개편 시 바뀔 수 있음.
     좌표 — webLoadCCTVData.do 전체 목록의  id/name/경도/위도  레코드.
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

// { id:NNN, ... type:"hls"|"vod", ... url:"..." } 블록을 통째로 추출
const camRe = /\{\s*id:\s*(\d+)[^}]*?type:\s*"(hls|vod)"[^}]*?url:\s*"([^"]+)"\s*\}/g;
const cams = [...src.matchAll(camRe)].map(m => ({ id: m[1], type: m[2], url: m[3], block: m[0] }));
if (!cams.length){ console.error("cams.js 에서 카메라를 찾지 못했습니다."); process.exit(1); }

// 좌표 전체 목록 (id → { lat, lng }). 실패해도 토큰 갱신은 계속.
const coords = new Map();
try {
  const r = await fetch("https://gits.gg.go.kr/web/map/webLoadCCTVData.do", { headers: HEADERS });
  for (const row of (await r.text()).trim().split("@")){
    const p = row.split("/");
    if (p[0] && isFinite(+p[2]) && isFinite(+p[3])) coords.set(p[0], { lat: +p[3], lng: +p[2] });
  }
  console.log(`좌표 목록 ${coords.size}개 로드`);
} catch (e) {
  console.log(`  ! 좌표 목록 요청 실패 (${e.message}) — 토큰만 확인`);
}

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

  // 블록에 토큰·좌표 변경을 모두 반영한 뒤 한 번만 치환
  let newBlock = cam.block;
  if (fresh !== cam.url) newBlock = newBlock.split(cam.url).join(fresh);

  const co = coords.get(cam.id);
  if (co){
    newBlock = newBlock
      .replace(/lat:\s*-?[\d.]+/, "lat:" + co.lat.toFixed(5))
      .replace(/lng:\s*-?[\d.]+/, "lng:" + co.lng.toFixed(5));
  }

  if (newBlock === cam.block){
    console.log(`  · ${cam.id}  동일`);
  } else {
    if (fresh !== cam.url) console.log(`  ~ ${cam.id}  토큰\n      old ${cam.url}\n      new ${fresh}`);
    if (co && new RegExp(`lat:\\s*${co.lat.toFixed(5)}\\b`).test(cam.block) === false)
      console.log(`  ~ ${cam.id}  좌표 → ${co.lat.toFixed(5)}, ${co.lng.toFixed(5)}`);
    if (WRITE) src = src.split(cam.block).join(newBlock);
    changed++;
  }
}

console.log(`\n변경 ${changed} · 실패 ${failed} · 동일 ${cams.length - changed - failed}`);
if (changed && WRITE){ writeFileSync(CAMS_PATH, src); console.log(`→ ${CAMS_PATH} 갱신 완료`); }
else if (changed){ console.log("→ 반영하려면 --write 로 다시 실행"); }
