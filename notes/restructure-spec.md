# 재구성 상세 스펙 (착수 전 확정용)

> 상태: **검토 대기**. [restructure-plan.md](restructure-plan.md) 의 실행 스펙 버전.
> 원칙(개정 2026-09-02): **다중 페이지 URL 분리(`/cctv/...`)·사이트맵·canonical 변경은
> 애드센스 승인 후** 진행. 그 전이라도 **심사에 위험이 없는 개선**(같은 URL 안에서의
> 콘텐츠·기능 개선)은 `main` 머지·배포 가능. 대규모 재구성 작업은 `restructure` 브랜치에서,
> 미리보기는 로컬(`Ctrl+Alt+V` = `docs/` :8899).
> 작성: 2026-09-02. 콘텐츠는 현재 `docs/index.html` 에서 추출하는 것을 기본으로 함.

---

## 1. 최종 URL / 파일 구조

| URL | 파일 | 내용 |
|---|---|---|
| `hanamlife.com/` | `docs/index.html` (재작성) | 허브 — 소개·이용법·도로 개요·종합 혼잡 캘린더·공통 FAQ·제보 + 목적지 카드 |
| `hanamlife.com/cctv/` | `docs/cctv/index.html` (신규) | 교통 CCTV 랜딩 — 3줄 소개 + 목적지 카드 3개 + 미니 캘린더. 브레드크럼 중간 단계 |
| `hanamlife.com/cctv/starfield/` | `docs/cctv/starfield/index.html` (신규) | 스타필드 하남 (deck 0, 5대) + 실시간 주차 혼잡도 패널 |
| `hanamlife.com/cctv/misa/` | `docs/cctv/misa/index.html` (신규) | 미사·조정경기장 (deck 1, 5대) |
| `hanamlife.com/cctv/hanam/` | `docs/cctv/hanam/index.html` (신규) | 하남 진출입 고속도로·팔당대교 (deck 2, 13대) |
| `hanamlife.com/privacy.html` | 그대로 | — |
| `hanamlife.com/terms.html` | 그대로 | — |

- **만들지 않음**: `/cctv/costco/`, `/cctv/ikea-gangdong/`, `/cctv/all/` — 스텁 금지 원칙.
  카메라·콘텐츠 준비되면 별도 착수.
- Cloudflare Pages 는 `/cctv/starfield/` → `/cctv/starfield/index.html` 자동 매핑. 트레일링 슬래시 유지.

---

## 2. 콘텐츠 배치 — 현재 index.html 섹션 → 목적지

| 현재 섹션 (id) | 이동처 | 처리 |
|---|---|---|
| `#about` (사이트 소개·이용법·CCTV 읽는 법) | **허브** | 거의 그대로 유지 |
| `#roads` (하남 도로 개요) | **허브** | 그대로 유지 (`/roads/` 분리는 나중) |
| `#starfield` | `/cctv/starfield/` | route-head·deck 0·주차패널·혼잡표·대중교통·주차요금·주차팁 전부 이동 |
| `#misa` | `/cctv/misa/` | deck 1·혼잡표·대중교통·주차요금표·주차팁·계절행사 전부 이동 |
| `#hanam` | `/cctv/hanam/` | 도입문단·deck 2·혼잡표·경로선택팁·알아두면좋은점 전부 이동 |
| `#calendar` (종합 혼잡 캘린더) | **허브** + `/cctv/` 요약본 | 허브에 전체표, `/cctv/` 에 축약 3~4행 |
| `#faq` (9문항) | 분할 | 아래 3항 참고 |
| `#contact` (제보·건의·제휴) | **허브** | 유지. 전 페이지 푸터에 이메일·인스타 링크 |
| `<footer>` | 공통 | 모든 페이지 동일 (방침·약관·문의·업데이트 한 줄) |

### FAQ 분할

현재 9문항은 대부분 사이트 공통(실시간 여부·안 나옴·데이터 사용량·홈 화면 추가 등).

- **허브에 유지**(공통): 영상이 실시간인가 / 안 나옴 / 혼잡표 출처 / 모바일 / 홈 화면 추가 /
  데이터 사용량 / 원하는 CCTV 없음 / 몇 초 전 상황인가 / 위치 오류 제보 → 9문항 그대로.
- **각 CCTV 페이지에 신규 3~5문항**(그 장소 한정): 예)
  - starfield: "주차 무료인가요?", "가장 안 막히는 진입로는?", "지하철로 가는 게 나을 때는?",
    "세일·명절엔 얼마나 붐비나요?"
  - misa: "겹벚꽃은 언제인가요?", "주차 요금·감면은?", "조정경기장 행사일 통제가 있나요?"
  - hanam: "팔당대교 공사는 언제 끝나나요?", "서울 방면은 올림픽대로 vs 순환고속도로?",
    "사고·통제 정보는 어디서?"
  → 문항 일부는 현재 본문(주차요금·경로팁·알아두면좋은점)에서 문답형으로 재구성.

---

## 3. "얇은 페이지" 방지 — 페이지별 콘텐츠 점검표

각 페이지 목표: 카메라 외 **원문 500~800자 이상** + 아래 요소.
`✅ 있음(추출)` / `➕ 신규 집필 필요` / `— 해당 없음`.

| 요소 | starfield | misa | hanam | /cctv/ |
|---|---|---|---|---|
| 소개 문단 (그 장소가 왜 막히나, 300~400자) | ➕ | ➕ | ✅ 도입문단 | ➕ (3줄) |
| 실시간 CCTV | ✅ 5대 | ✅ 5대 | ✅ 13대 | — (카드 링크) |
| 요일·시간대별 혼잡 패턴표 | ✅ 2행 | ✅ 2행 | ✅ 3행 | ➕ 요약 3~4행 |
| 주차 (요금·시간·진입로) | ✅ + 실시간 패널 + 안내도 | ✅ 요금표 상세 | — (고속도로, 휴게소 메모로 대체) | — |
| 대중교통 | ✅ | ✅ | ✅ 부분(알아두면) → 소절로 정리 | — |
| 계절·행사 | ➕ (세일·명절·우천 주말) | ✅ 겹벚꽃·억새·경정 | ✅ 연휴 방향 | — |
| 경로/진입 팁 | ✅ 주차팁 5 | ✅ 주차팁 4 | ✅ 경로선택팁 4 | — |
| 그 장소용 FAQ 3~5 | ➕ | ➕ | ➕ | — |
| 형제 페이지 링크 | ➕ | ➕ | ➕ | ✅ 카드 |
| 브레드크럼 | ➕ | ➕ | ➕ | ➕ |

**➕ 신규 집필 항목 요약** (추출 후 채울 것, `class="todo"` 로 표시하지 말고 실제 문장으로):
1. starfield / misa / cctv 소개 문단
2. starfield 계절·행사 문단
3. 세 페이지 각각 FAQ 3~5문항 (본문 재구성 + 일부 신규)
4. hanam 대중교통 소절 정리 (기존 문장 재배치)

---

## 4. 각 CCTV 페이지 공통 뼈대

```
<head>
  charset / viewport
  <title>            페이지 고유 (예: "스타필드 하남 실시간 CCTV·주차 혼잡도 | 하남라이프")
  <meta description>  페이지 고유
  <link rel=canonical href="https://hanamlife.com/cctv/starfield/">
  og:type/title/description/url/image  (url·title·description 페이지 고유, image 공용 og.png)
  twitter:card/title/description/image
  <link rel=icon ...>                     ← 공통
  JSON-LD: WebPage + BreadcrumbList (+ Place: starfield·misa)
  leaflet.css (jsdelivr, 무결성 해시)      ← 공통
  styles.css?v=YYYYMMDD                    ← 공통, 경로는 ../../assets/css/
  AdSense  ca-pub-9635871358308305          ← 공통
  GA4  G-Y46YYZLMCK                         ← 공통
</head>
<body><div class="wrap">
  <nav 브레드크럼>  홈 › 교통 CCTV › 스타필드 하남
  <h1>스타필드 하남 실시간 교통 CCTV</h1>
  <p class="lead"> …
  <소개 문단>
  <div class="ad">…</div>            (승인 후 교체, 지금은 placeholder 유지)
  <div class="player-mount" data-deck="0">
  [starfield 만] 주차 혼잡도 패널 #sf-parking
  <혼잡 패턴표>
  <div class="ad">…</div>
  <대중교통> <주차> <계절·행사> <팁>
  <nav 형제 페이지>  ← 미사·조정경기장 | 하남 진출입 →
  <FAQ (장소 한정)>
  <div class="ad">…</div>            (하단)
  <footer> ← 공통
</div>
  hls.js / leaflet.js / cams.js / player.js  ← 공통
  [starfield 만] parking.js
</body>
```

- 상대경로: 서브폴더가 2단계(`/cctv/starfield/`)이므로 자원은 `../../assets/...`.
  `/cctv/index.html` 은 1단계이므로 `../assets/...`. → **경로 실수 1순위 점검 대상.**
- 공통 `<head>`·`<footer>` 는 우선 **복붙**(4~5페이지, 계획서 허용 범위).
  세 번째 페이지 만들 때까지 반복 고통스러우면 그때 `assets/js/partials.js` 로 추출.

---

## 5. 허브(`index.html`) 재작성

- 남기는 섹션: `#about`, `#roads`, `#calendar`, `#faq`, `#contact`, `<footer>`.
- 제거: `#starfield` `#misa` `#hanam` 의 카메라·표 본문 (→ 서브페이지로 이동).
- 추가: **목적지 카드 3개** — 이름 + 한 줄 설명 + 혼잡 힌트 + `/cctv/…/` 링크.
- **기존 앵커 유입 처리**: 카드 컨테이너에 `id="starfield"` `id="misa"` `id="hanam"` 부여.
  → 옛 `hanamlife.com/#starfield` 링크가 죽지 않고 해당 카드로 스크롤됨.
  (별도 JS 해시 리다이렉트는 하지 않음.)
- `pagenav` 는 허브 내부 섹션용으로 축소, CCTV 링크는 카드로 대체.
- 허브가 얇아지지 않는지 확인: about + roads + calendar + faq 만으로 충분히 두꺼움 → OK.

---

## 6. 사이트 공통 갱신

- **sitemap.xml** — `/`, `/cctv/`, `/cctv/starfield/`, `/cctv/misa/`, `/cctv/hanam/`,
  `/privacy.html`, `/terms.html`. 새 페이지 `changefreq=weekly priority=0.8`,
  `/` 는 `1.0`. 전 항목 `lastmod` 배포일로.
- **robots.txt** — 변경 없음 (`Allow: /`).
- **내부 링크** — 허브 카드 → 서브, 서브 브레드크럼·형제링크 → 상호, 서브 → 허브 방침/약관.
- **JSON-LD** — 허브는 현재 `WebSite` 유지, 서브는 `WebPage`+`BreadcrumbList`.
- **og.png** — 공용 1장 계속 사용 (페이지별 이미지는 선택, 나중).

---

## 7. 스크립트 영향 점검 (배포 전 로컬 확인)

- **player.js** — `.player-mount` 를 순회하는 구조인지 확인. 서브페이지엔 mount 1개뿐이라
  나머지 deck 은 로드/마운트하지 않아야 함. `cams.js` 의 `DECKS` 전역은 그대로 두고
  페이지가 자기 인덱스만 사용 (전 페이지가 13대치 정의를 다 읽는 부담은 무시 가능).
- **parking.js** — `#sf-parking` 없는 페이지에서 no-op 인지 확인. 아니면 starfield 에만 로드.
- **cams.js 토큰 6시간 자동 갱신** (GitHub Action) — 파일 1개 그대로라 영향 없음.
- **/api/parking** (Pages Function) — 경로 `/api/parking` 절대경로라 서브폴더 영향 없음.
- **leaflet 지도** — 서브페이지에서 컨테이너 id 충돌 없는지 (deck 별 지도 id).

---

## 8. 실행 순서 (전부 로컬, push 없음)

1. `restructure` 브랜치 — **완료** (미커밋 meta 수정분 포함).
2. 공통 `<head>`/`<footer>` 스니펫 확정 → **`/cctv/starfield/index.html` 1개 완성**
   (소개·FAQ 신규 집필 포함) → 템플릿 락.
3. 같은 틀로 `/cctv/misa/`, `/cctv/hanam/` 생성.
4. `/cctv/index.html` (랜딩) 생성.
5. `index.html` 허브로 재작성 (카드 + 앵커 id).
6. `sitemap.xml`·브레드크럼 JSON-LD·내부 링크·형제 링크 반영.
7. `Ctrl+Alt+V` 로컬 미리보기 — 전 링크 클릭, 상대경로, player mount, 주차 패널,
   지도, 모바일 폭 점검. `Ctrl+Alt+K` 로 종료.
8. **애드센스 승인 메일 대기** — 여기서 멈춤.
9. 승인 후: `restructure` → `main` 머지 → push 1회 (Cloudflare + GitHub Pages 동시 배포).
10. 구글 서치콘솔·네이버: 새 URL `URL 검사 → 색인 요청`, sitemap 재제출.
11. (별도 커밋) `<div class="ad">` placeholder → 실제 광고 유닛. 페이지당 2~3 + 모바일 앵커.
    자동 광고 앵커 활성화.

---

## 9. 리스크 체크리스트 (배포 직전 재확인)

- [ ] 심사 기간 중에는 이 재구성(다중 페이지 URL 분리·sitemap·canonical 변경)을 배포하지 않음
      (같은 URL 안의 무위험 개선 배포는 별개로 허용 — 개정된 원칙 참고)
- [ ] "준비 중"·빈 페이지 없음 (costco/ikea 미생성)
- [ ] 각 CCTV 페이지 원문 500자+ , 카메라만 있는 얇은 페이지 없음
- [ ] 목적지를 더 잘게 쪼개지 않음 (starfield 1페이지 유지)
- [ ] 모든 새 URL 이 sitemap 에 있고 robots 가 막지 않음
- [ ] 각 페이지 canonical 이 자기 URL 을 가리킴 (복붙 후 canonical 수정 누락 주의)
- [ ] 상대경로(`../../assets`) 로 CSS·JS·이미지 정상 로드
- [ ] 옛 `/#starfield` 등 앵커가 허브 카드로 살아있음
- [ ] privacy/terms 링크가 전 페이지 푸터에 존재
