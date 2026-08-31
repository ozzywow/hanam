/* 경기도교통정보센터(GITS) 전체 CCTV 목록을 받아
   기준점 반경 안의 카메라를 거리순으로 출력.

   사용:  node tools/list-cams.mjs <lat> <lon> [반경km=5]
   예:    node tools/list-cams.mjs 37.5452 127.2220 4      (스타필드 하남 기준)

   출력 컬럼:  거리 | id | [n1/n2] | 이름
   - n1: 1=일반 CCTV, 2·3=타 기관 연계 (재생 방식이 다를 수 있음)
   - 터널 내부 카메라([...터널... 숫자])는 회색 표시

   토큰(재생 URL)은 여기서 안 나옵니다. 원하는 id 를 골라
   tools/scrape-tokens.mjs 로 토큰을 긁어 docs/assets/js/cams.js 에 넣으세요.
*/

// 정부 사이트 인증서 체인이 Windows Node 에서 종종 검증 실패 → 완화
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const [latS, lonS, radS] = process.argv.slice(2);
if (!latS || !lonS){
  console.error("사용: node tools/list-cams.mjs <lat> <lon> [반경km=5]");
  process.exit(1);
}
const CENTER = { y: +latS, x: +lonS };
const RADIUS = +(radS || 5);

const R = 6371, rad = d => d * Math.PI / 180;
const dist = (a, b) => {
  const dLat = rad(b.y - a.y), dLon = rad(b.x - a.x);
  const s = Math.sin(dLat/2)**2 + Math.cos(rad(a.y))*Math.cos(rad(b.y))*Math.sin(dLon/2)**2;
  return 2 * R * Math.asin(Math.sqrt(s));
};

const URL = "https://gits.gg.go.kr/web/map/webLoadCCTVData.do";
const res = await fetch(URL, { headers: { "User-Agent": "Mozilla/5.0", "Referer": "https://gits.gg.go.kr/web/map/webMap.do?opt=3" } });
const raw = (await res.text()).trim();

const rows = raw.split("@").map(r => {
  const p = r.split("/");
  return { id: p[0], name: p[1], x: +p[2], y: +p[3], n1: p[4], n2: p[5] };
}).filter(r => r.name && isFinite(r.x) && isFinite(r.y))
  .map(r => ({ ...r, km: dist(CENTER, r) }))
  .filter(r => r.km <= RADIUS)
  .sort((a, b) => a.km - b.km);

const tunnel = n => /터널.*\d/.test(n);
const GREY = "\x1b[90m", RESET = "\x1b[0m";

console.log(`기준 (${CENTER.y}, ${CENTER.x}) · 반경 ${RADIUS}km · ${rows.length}개\n`);
for (const r of rows){
  const line = `${r.km.toFixed(2).padStart(6)}km  id=${String(r.id).padStart(6)}  [${r.n1}/${r.n2}]  ${r.name}`;
  console.log(tunnel(r.name) ? GREY + line + RESET : line);
}
