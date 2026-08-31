# hanam — 하남시 실시간 교통 CCTV

경기도교통정보센터(GITS) CCTV를 임베드한 정적 사이트. GitHub Pages 배포.
공개 주소: <https://ozzywow.github.io/hanam/>

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
│           └── player.js       재생 엔진 (hls / vod)
├── tools/                      배포 안 됨. 개발 스크립트 (Node 18+)
│   ├── list-cams.mjs           반경 내 CCTV 찾기
│   ├── scrape-tokens.mjs       재생 토큰 갱신
│   └── README.md
├── notes/
│   ├── sources.md              GITS/ITS/UTIC 엔드포인트·CORS 조사 기록
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

`DECKS` 인덱스와 `index.html` 의 `<div class="player-mount" data-deck="N">` 가 짝.

## 로컬 미리보기

```
cd docs
python -m http.server 8080   # http://localhost:8080
```
(`file://` 직접 열기는 스크립트 로드가 막혀 안 됨 — 반드시 서버로)

## 배포

```
git add -A && git commit -m "..." && git push
```

**최초 1회**: GitHub → Settings → Pages → Source `Deploy from a branch`
→ Branch `main` / **`/docs`** → Save. (기존 `/(root)` 에서 변경)

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
