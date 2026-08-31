# hanam — 스타필드 하남 실시간 교통 CCTV

중부고속·수도권제1순환선·서울양양선(미사대교) 진입로의 실시간 교통 CCTV(HLS)를
재생하고, 혼잡 시간대·주차 팁·우회로를 안내하는 **정적 페이지**. GitHub Pages 배포.

공개 주소: https://ozzywow.github.io/hanam/

## 구조

- `index.html` — 실제 페이지 (플레이어 + 콘텐츠). `index-full.html` 과 동일본.
- `index-full.html` — 편집용 원본. 수정 후 `cp index-full.html index.html`.
- `.nojekyll`, `README.md`

## 동작 방식 — 경기도교통정보센터(GITS)

CCTV 소스를 GITS(`gits.gg.go.kr`)로 변경. 국도·지방도·시내 교차로까지 커버됨
(ITS 오픈API는 고속/국도만 제공, 스타필드 바로 앞 도로 없음).

카메라는 `index-full.html` 상단 `CAMS` 배열에 **직접 나열**. 두 종류:

- **`type:"hls"`** (KTICT 제공, 실시간): `url` 은 `gitsview.gg.go.kr/<id>/<토큰>!hls` 리졸버.
  GET 하면 실제 m3u8 주소(text)를 돌려줌 → `hls.js` 재생. wmsAuthSign 토큰 유효 120분
  → 재생 오류 시 및 `HLS_REFRESH_MIN`(90분)마다 리졸버 재호출.
- **`type:"vod"`** (경찰청UTIS·하남시 제공): 실시간 아님. `url` → 302 → 약 1분 간격 갱신되는
  녹화 mp4. `loop` 재생 + `VOD_RELOAD_SEC`(60초)마다 새 클립으로 교체.

`url` 안의 토큰은 GITS 팝업(`/web/popup/webCctvPopup.do?cctvId=<id>`)에서 미리 긁은 **고정값**.
GITS가 토큰을 바꾸면 재수집 필요(아래).

CORS 확인: `gitsview.gg.go.kr` 는 `Access-Control-Allow-Origin: *` + HTTPS → **프록시 불필요**.
(`gits.gg.go.kr` 본체는 CORS 없음 → 클라이언트에서 팝업 직접 호출 불가, 그래서 토큰을 하드코딩.)

### 카메라 추가·삭제

- 삭제: `CAMS` 에서 해당 줄 제거.
- 추가: `gits.gg.go.kr` CCTV 지도에서 대상 클릭 → 팝업 소스 보기 →
  `type:"hls"` 는 `<script>` 안 `//gitsview.gg.go.kr/<id>/<토큰>!hls`,
  `type:"vod"` 는 `<video src="https://gitsview.gg.go.kr/<id>/<토큰>">` 를 복사해서 한 줄 추가.
- `{ grp:"구간명" }` 은 버튼 그룹 헤더.

### 토큰이 만료/변경됐을 때

전 카메라 팝업을 다시 긁어 `CAMS` 의 `url` 을 갱신. (스크립트화 가능 — 필요 시 요청.)

## 로컬 미리보기

```
cd hanam
python -m http.server 8080   # http://localhost:8080
```

## 배포

```
git add -A
git commit -m "..."
git push
```
GitHub → Settings → Pages 가 `main` / `/(root)` 로 설정돼 있으면 push 시 자동 반영.

## 광고

- **네이버 블로그 불가** (커스텀 플레이어·애드센스 미지원).
- 애드센스 승인은 "실질적·독창적 콘텐츠"가 있어야 함 → CCTV만 있으면 거절.
  혼잡 패턴표/주차 팁/우회로 텍스트를 **실제 데이터**로 채울 것.
- 승인 후: `index.html` 상단 `<script>` 주석 해제 + `ca-pub-XXXX` 교체,
  `.ad` div 를 광고 유닛 코드로 교체 → `index-full.html` 에도 반영.

## 주의

- **API 키 노출**: 정적 사이트라 소스에 그대로 보임. ITS 키는 읽기전용·호출제한이라
  통상 문제 없으나, 숨기려면 Cloudflare Worker 프록시에 키를 두고 그쪽을 호출.
- **상업적 이용**: 광고 수익 목적이면 ITS 오픈API 이용약관에서 상업적 재배포·
  광고 게재 허용 여부를 확인. 애매하면 국가교통정보센터에 문의.
- 영상은 도로관리기관 사정·점검으로 수시 중단될 수 있음(안내 문구 이미 포함).
- 스트림 URL 은 절대 하드코딩하지 말 것(120분 후 만료).
