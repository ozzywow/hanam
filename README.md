# hanam — 하남시 실시간 교통 CCTV

경기도교통정보센터(GITS) CCTV를 임베드한 정적 사이트.

- 프로덕션: <https://hanam.pages.dev/> (Cloudflare Pages, build output `docs`)
- 스테이징: <https://ozzywow.github.io/hanam/> (GitHub Pages, main `/docs`)

`main` 에 push 하면 둘 다 자동 배포. 6시간마다 GitHub Action 이 `cams.js` 토큰을 갱신.

## 디렉토리

```
hanam/
├── docs/                       ← GitHub Pages 배포 루트 (Settings→Pages: main /docs)
│   ├── index.html              구역 3개 (스타필드 / 미사·조정경기장 / 하남 진출입)
│   ├── privacy.html            개인정보처리방침 (애드센스 필수)
│   ├── .nojekyll
│   └── assets/
│       ├── css/styles.css
│       └── js/
│           ├── cams.js         ★ 카메라 정의 — 여기만 고치면 구성이 바뀜
│           ├── player.js       재생 엔진 (hls / vod)
│           └── parking.js      스타필드 실시간 주차 혼잡도 패널 (/api/parking 호출)
├── functions/                  Cloudflare Pages Functions (프로덕션에서만 동작)
│   └── api/parking.js          스타필드 하남 주차 API 프록시 (세션 쿠키 대행 + CORS)
├── tools/                      배포 안 됨. 개발 스크립트 (Node 18+)
│   ├── list-cams.mjs           반경 내 CCTV 찾기
│   ├── scrape-tokens.mjs       재생 토큰 갱신
│   └── README.md
├── notes/
│   ├── sources.md              GITS/ITS/UTIC·스타필드 엔드포인트·CORS 조사 기록
│   └── roadmap.md              할 일
├── .github/workflows/
│   └── refresh-tokens.yml      6시간마다 cams.js 토큰 자동 갱신
├── .gitignore
└── README.md
```

## 동작 방식

CCTV는 두 종류 (`cams.js` 의 `type`):

- **`hls`** (KTICT 실시간): `url` = `gitsview.gg.go.kr/<id>/<token>!hls` 리졸버.
  GET 하면 실제 m3u8 주소를 돌려줌 → `hls.js` 재생. `wmsAuthSign` 유효 약 120분
  → 재생 오류 시 및 90분마다 리졸버 재호출.
- **`vod`** (경찰청UTIS·하남시): 실시간 아님. `url` → 302 → 약 1분 간격 갱신되는
  녹화 mp4. `loop` 재생 + 60초마다 새 클립 교체.

### 스타필드 실시간 주차 혼잡도

스타필드 하남 공식 페이지가 쓰는 내부 API(`/api/hanam/myCar/parkingCNT.do`)에서
RF·B1·B2·B3 층별 혼잡도(여유/혼잡/만차)를 가져와 스타필드 구역에 표시한다.
이 API 는 `/hanam/` 페이지를 먼저 GET 해서 받은 `JSESSIONID` 쿠키가 있어야
동작해 브라우저에서 직접 못 부른다 → **Cloudflare Pages Function**
(`functions/api/parking.js`)이 서버측에서 세션 발급 + API 호출을 대행하고
필요한 4개 층만 CORS 붙여 `/api/parking` 으로 돌려준다(엣지 캐시 90초).
`docs/assets/js/parking.js` 가 90초마다 호출해 패널을 갱신하고, 실패하면
(함수가 없는 GitHub Pages 스테이징 등) 패널을 조용히 숨긴다.
자세한 내용은 [notes/sources.md](notes/sources.md).

`gitsview.gg.go.kr` 는 CORS `*` + HTTPS → **프록시 불필요**.
`url` 의 토큰은 GITS 팝업에서 긁은 값 (`gits.gg.go.kr` 본체는 CORS 없어 클라이언트에서 못 부름).
팝업은 요청마다 새 토큰을 주지만 옛 토큰도 한동안 유효하며, GitHub Action 이 6시간마다 갱신함.
자세한 내용은 [notes/sources.md](notes/sources.md).

## 편집

| 하고 싶은 것 | 고칠 곳 |
|---|---|
| 카메라 추가·삭제·순서·그룹 | `docs/assets/js/cams.js` 의 `DECKS[0/1/2]` |
| 구역 제목·본문(혼잡표·팁·우회로) | `docs/index.html` 의 `<section class="route">` |
| 스타일 | `docs/assets/css/styles.css` |
| 재생 로직·갱신 주기 | `docs/assets/js/player.js` |
| 주차 혼잡도 패널·갱신 주기 | `docs/assets/js/parking.js` · `functions/api/parking.js` |

`DECKS` 인덱스와 `index.html` 의 `<div class="player-mount" data-deck="N">` 가 짝.

## 로컬 미리보기

```
cd docs
python -m http.server 8080   # http://localhost:8080
```
(`file://` 직접 열기는 스크립트 로드가 막혀 안 됨 — 반드시 서버로)

주차 혼잡도 패널(`/api/parking`)까지 확인하려면 Pages Functions 를 함께 띄운다:

```
npx wrangler pages dev docs --compatibility-date=2024-09-01   # http://localhost:8788
```

## 배포

```
git add -A && git commit -m "..." && git push
```

push 하면 Cloudflare Pages·GitHub Pages 둘 다 자동 반영. 별도 명령 없음.

설정(이미 완료):
- Cloudflare Pages: 프로젝트 `hanam`, repo 연결, build command 없음, build output `docs`, prod branch `main`
- GitHub Pages: Settings → Pages → `main` / `/docs`
- Actions: Settings → Actions → Workflow permissions → Read and write (봇 커밋용)

## 도구

```
node tools/list-cams.mjs 37.5452 127.2220 4   # 스타필드 반경 4km 카메라 목록
node tools/scrape-tokens.mjs                   # 토큰 변경분 확인
node tools/scrape-tokens.mjs --write           # cams.js 토큰 갱신
```
영상이 안 나오면 먼저 `scrape-tokens.mjs` 로 토큰 확인.

## 주의

- 정부 CCTV에 광고 게재 = 상업적 이용. ITS/GITS 이용약관에서 허용 여부 확인 필요.
- 애드센스 승인 전 콘텐츠(혼잡표·팁 등)를 실제 데이터로 채울 것 — [notes/roadmap.md](notes/roadmap.md).
