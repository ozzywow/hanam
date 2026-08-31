# hanam — 스타필드 하남 실시간 교통 CCTV

중부고속·수도권제1순환선·서울양양선(미사대교) 진입로의 실시간 교통 CCTV(HLS)를
재생하고, 혼잡 시간대·주차 팁·우회로를 안내하는 **정적 페이지**. GitHub Pages 배포.

공개 주소: https://ozzywow.github.io/hanam/

## 구조

- `index.html` — 실제 페이지 (플레이어 + 콘텐츠). `index-full.html` 과 동일본.
- `index-full.html` — 편집용 원본. 수정 후 `cp index-full.html index.html`.
- `.nojekyll`, `README.md`

## 동작 방식

1. 페이지 로드 → JS가 **국가교통정보센터(ITS) 오픈API** `cctvInfo` 호출
   (`type=ex,its`, `cctvType=4` = HTTPS HLS), 하남 주변 bounding box 조회.
2. 이름 필터(`NAME_ALLOW`)로 스타필드 진입로 카메라만 추림 → 버튼 생성.
3. `hls.js` 로 재생. 스트림 토큰은 **유효 120분** → `REFRESH_MIN`(기본 90분)마다,
   그리고 재생 오류(403 등) 시 목록을 다시 받아 자동 갱신.

CORS 확인 완료: ITS API 는 요청 Origin 을 반사(`Access-Control-Allow-Origin`),
스트림(`cctvsec.ktict.co.kr`)은 `*` + HTTPS → **프록시 불필요**.

## 설정 (index-full.html 상단 `<script>`)

| 상수 | 의미 |
|---|---|
| `API_KEY` | ITS 오픈API 인증키. **정적 페이지 소스에 노출됨** (아래 주의) |
| `BOX` | 조회 위경도 범위 |
| `ROAD_TYPES` | `["ex","its"]` 고속도로+국도 |
| `NAME_ALLOW` | 카메라명 포함 키워드 화이트리스트 |
| `NAME_PREF` | 버튼 상단 우선 정렬 키워드 |
| `REFRESH_MIN` | 목록 자동 갱신 주기(분) |

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
