# 두 사이트 전략 — hanamlife.com + roadcctv.com

> 작성 2026-09-10. hanamlife.com 애드센스 심사가 "가치가 별로 없는 콘텐츠"로 반려됨(2026-09-10).
> RoadCCTV(roadcctv.com, 경기도 교통 CCTV 17개 지역)는 별도 저장소에서 성숙 단계 + 애드센스 재심사 중(2026-09-07 제출).
> RoadCCTV 저장소 위치: `c:/Users/ozzywow/Documents/projects/RoadCCTV`.

---

## 1. 핵심 방침

**공유 엔진 · 분리된 제품 · canonical로 중복 정리.**

- 한 벌의 코드(재생·지도·피드·PWA 등 엔지니어링)를 두 사이트가 공유한다.
- **hanamlife.com** = 하남 로컬 포털. 교통은 일부. 동네 정보·지역 홍보·상권 광고까지 콘텐츠를 크게 불린다.
- **roadcctv.com** = 경기도 교통 CCTV 종합. 하남은 17개 지역 중 하나로 **얇게** 유지.
- 겹치는 하남 교통 페이지는 **roadcctv.com → hanamlife.com 교차 canonical**로 색인 경쟁을 없앤다.
- **순서가 절대적**: hanamlife.com을 먼저 재구축 → 색인 → (가능하면) 애드센스 승인. **그 다음에** roadcctv canonical을 건다. 대상이 미색인 상태에서 canonical을 걸면 무효다.

## 2. 포지셔닝

| | hanamlife.com | roadcctv.com |
|---|---|---|
| 정체성 | 하남 로컬 포털 (교통 + 동네정보 + 지역홍보 + 상권광고) | 경기도 교통 CCTV 종합 (17개 지역) |
| 하남 교통 본문 | 로컬 화자 시점으로 **다시 씀** + 소개/이용법/도로개요/혼잡캘린더/FAQ 프론트 복원 | 다른 16개 지역과 같은 톤, 얇게 |
| canonical | 자기 자신 | → hanamlife.com 대응 URL (Phase 4에서) |
| 브랜드 | 하남라이프 + 하남시 CI 참조 새 아이덴티티 | 로드CCTV + `#db6a00` 주황 |
| 수익 | AdSense + 상인 직접광고 | AdSense |

## 3. 아이덴티티 (2026-09-10 확정)

- **이름**: "하남라이프" — 한 단어, 국문, 도메인과 일치. 헤더에 로마자 부제 안 붙임.
- **참조**: 하남시청 도시 브랜드 — https://www.hanam.go.kr/www/contents.do?key=150 · 하남시청 홈페이지 CSS 실측.
  - 하남시청 사이트 주력 파랑 **`#437dea`**(azure, UI/링크), 심볼 나선형 청록 **`#00b6bd`**(teal-cyan), 딥네이비 `#111d68`.
  - 하남시 CI 색 정의: 적황색(역동), 녹색(안정·풍요), 나선형 청색(창조적 미래·무한한 가능성).

- **메인 색 = 하남 청색 계열** (사용자 결정 "나선형 청색이 메인"). 확정 토큰:
  | 토큰 | 라이트 `:root` | 다크 (`@media` + `[data-theme=dark]`) | 비고 |
  |---|---|---|---|
  | `--accent` | `#2f6fe0` | `#6fa0ff` | `#437dea`를 대비 위해 약간 딥하게. 버튼·링크·포커스링·카드호버 |
  | `--accentfg` | `#ffffff` | `#0a1020` | accent 채움 위 글자 |
  | `--live` | `#0a7d3c` 유지 | `#3fbf6f` 유지 | "원활/실시간" 의미색 — 초록 유지, 손대지 않음 |
  | `--warn` | `#946200` 유지 | `#e3a008` 유지 | 그대로 |
  - 청록 `#00b6bd`는 **장식용**(아이콘 그라디언트·히어로)으로만, 의미색으로 쓰지 않음.
  - RoadCCTV 주황 `#db6a00` 과 파랑이라 확실히 구분됨.

- **favicon / og = 새로 제작** (SVG). 디자인 브리프: 배경에 동네 지도가 펼쳐지고, 그 위에 **핀(풍선) 안에 돋보기**(탐방·탐색 상징). RoadCCTV 아이콘 스타일 참조하되 모티프는 하남라이프 고유. → 시안 작업(`design` 스킬)에서 구체화. 확정 전까지 임시로 기존 favicon 색만 청색으로 교체.
  - 산출물: `favicon.svg`(헤더 마크와 동일 도형), `og.png`(문구 갱신), `apple-touch-icon.png`, `icon-192/512/512-maskable.png`.

- **헤더 표시 = 인라인 SVG 마크 + "하남라이프" 실제 텍스트 락업** (RoadCCTV `.brand` 구조 재사용, 아이콘·이름·색만 교체). 근거는 §3.1.

- **적용 지점** (기계적 반영):
  - `docs/assets/css/styles.css` `:root` 3곳 — 위 표대로 `--accent`/`--accentfg`만 교체
  - 각 HTML `<head>` `<meta name="theme-color">` → `#2f6fe0`
  - favicon/og/아이콘류 (위)
  - `<meta name="apple-mobile-web-app-title">`, `og:site_name` → "하남라이프", `<title>` 접미어 "| 로드CCTV" → "| 하남라이프"

### 3.1 헤더 락업을 "SVG 마크 + 텍스트"로 하는 이유 (전략 판단)

1. **브랜드명이 크롤링됨** — 검색엔진·애드센스가 "하남라이프"를 DOM 텍스트로 읽는다. 순수 이미지 로고는 이름을 alt에 숨김. 두 사이트가 게시자 ID를 공유하는 상황에서 별개 브랜드 실체를 세우려면 실제 텍스트가 유리.
2. **RoadCCTV와 즉각 시각 구분** — RoadCCTV 헤더는 색 텍스트 워드마크 + 아이콘. 하남라이프도 색 텍스트만 쓰면 형제처럼 보임. 고유한 (지도+핀+돋보기) SVG 마크를 붙이면 첫눈에 닮음이 깨진다.
3. **자산 1개, 테마 적응, 어디서나 선명** — 인라인 SVG는 다크모드 토큰으로 리컬러, @2x 래스터 세트·다크 전용 로고 불필요.
4. **공유 엔진에서 최소 이탈** — `styles.css`에 `.brand`/`.brand-name`/브랜드 아이콘 규칙이 이미 있음. path·이름·색만 교체.
5. **favicon과 동일 도형** — 헤더 마크 = favicon = og 마크. 한 번 그려 브랜드 반복 노출.

## 4. 단계별 실행

### Phase 1 — hanamlife.com 재구축 (이식 + 브랜딩 복구)

작업 베이스: hanam 저장소에 **새 브랜치**를 파고 RoadCCTV `docs/hanam/*` + 공유 자산을 시드. 기존 `restructure` 브랜치는 폐기.

**포팅해 오는 것 (RoadCCTV → hanam)**

| RoadCCTV 경로 | 비고 |
|---|---|
| `docs/hanam/*` (8개 HTML) | 하남 허브 + 목적지 7 (ramp/starfield/misa/commute/paldang/seoul-yangyang/outlet) |
| `docs/assets/css/styles.css` | 색 토큰만 하남 아이덴티티로 교체 |
| `docs/assets/js/`: player.js, overview.js, incidents.js, parking.js, traffic.js, traffic-live.js, collapse.js, theme.js, remote.js, favorites.js, pwa-install.js | 클라이언트 로직. traffic-live 점은 RoadCCTV 현 상태대로 비활성 유지 |
| `docs/assets/js/regions/hanam*.js` (3개) | `hanam.js` / `hanam.baseline.js` / `hanam.traffic.js` |
| `functions/api/`: incidents.js, parking.js, traffic.js, resolve.js | resolve.js는 hanam `main`에 이미 있음 → 동기화 |
| `docs/manifest.webmanifest`, `docs/sw.js`, `docs/_headers` | PWA. `sw.js` CACHE 버전은 배포마다 올릴 것 |
| `docs/assets/img/`: parking-map.jpg, icon-192/512*.png, apple-touch-icon.png | 아이콘류는 아이덴티티 확정 후 재생성 |
| `docs/{ads.txt, robots.txt}` | `ads.txt`는 동일 `pub-9635871358308305` |

**포팅 안 하는 것 (roadcctv 전용)**

- `docs/assets/js/routes/*` (경부·중부·영동 등 노선 페이지), `region-status.js`(다중 지역 PTS 표), `notices.js`
- `functions/api/`: its-resolve.js, its-traffic.js, traffic-seoul.js (ITS 전국 / 서울 전용)
- `docs/expressway/`, 다른 16개 지역 폴더
- **제보 백엔드** (report.js + functions/api/report.js + functions/admin/ + device-id.js + migrations/) — D1 필요. Phase 1은 hanam 기존 방식(mailto / 인스타 DM)으로 두고 후속 검토. 페이지에서 report.js 참조 제거.
- `docs/help/` 스크린샷 가이드 — 선택. 필요하면 나중에.

**페이지별 재작업 (8개 HTML 전부)**

1. 경로: 루트 절대경로 유지 가능(`/assets/...`, `/starfield/...`) — 단 URL에서 `/hanam/` 세그먼트 제거 (`/hanam/starfield/` → `/starfield/`).
2. `canonical` / `og:url` → `https://hanamlife.com/...`
3. `og:site_name` / `<title>` 접미어 / `apple-mobile-web-app-title` → 하남라이프
4. 브레드크럼 + JSON-LD BreadcrumbList: `홈 › 하남 › …` 의 "하남" 단계 제거 → `홈 › …`
5. 본문 "로드CCTV" 언급, 푸터 저작권 문구 → "하남라이프"
6. 색 토큰 / `theme-color` → 하남 아이덴티티
7. **Beta 마크 전부 제거** (`<span class="beta">Beta</span>`)
8. GA4: hanamlife.com 전용 속성 ID 유지 (RoadCCTV `G-1P8EMLF01M` 아님 — hanam은 별도 `G-Y46YYZLMCK`)
9. `google-adsense-account` meta는 유지 (`ca-pub-9635871358308305`)

**허브(`docs/index.html`)에 복원할 섹션** — RoadCCTV가 루트로 옮기며 떼어낸 것들. 하남라이프는 단독 사이트라 다시 필요:

- 이 사이트 소개 / 이용 방법 / CCTV 화면 읽는 법
- 하남 도로 개요
- 종합 혼잡 캘린더
- 자주 묻는 질문 (FAQ)
- 제보·문의

→ 반려 전 `main` 의 `docs/index.html` 섹션들을 가져와 새 카드 구조 위에 얹는다.

**마무리**: `wrangler`로 로컬 검증(Functions 포함) → `main` 머지 → 배포.

### Phase 2 — 로컬 포털 콘텐츠 1차분 (반려를 실제로 뚫는 핵심)

이식만으로는 "가치가 별로 없는 콘텐츠"를 못 뒤집는다. 교통이 아닌 **고유 원본 콘텐츠**가 있어야 한다.

- 하남 동네 정보 허브 (생활권별 개요: 미사·풍산·덕풍·신장·감일·위례 등)
- 지역 소식 / 홍보 페이지 (행사·축제·시정 소식 큐레이션)
- 상권 · 상가 안내 (스타필드 외 로컬 상권, 전통시장 등)
- 각 페이지 실제 문장 위주, 다른 사이트에 없는 로컬 지식

최소 3~5개 실질 페이지를 넣고 재심사로 간다.

### Phase 3 — 색인 + 재심사

- 서치콘솔 sitemap 재제출, 네이버 재제출
- 전 페이지 "색인 생성됨" 확인 (구글이 크롤 못 한 페이지는 평가 자체가 안 됨)
- 전부 색인된 뒤 애드센스 재심사 신청 (반려 후 실질 변경 없이 재신청하면 자동 재반려)

### Phase 4 — roadcctv.com 중복 정리 (hanamlife 승인·색인 후)

- roadcctv.com/hanam/* 의 `<link rel="canonical">` → hanamlife.com 대응 URL
- roadcctv.com 하남 본문은 얇게 유지 (다른 16개 지역 톤과 통일). 로컬 특화 문단은 hanamlife에만
- roadcctv.com 자기 심사 결과에 따라 대응

## 5. 가드레일

- hanamlife 승인·색인 **전에** roadcctv canonical 걸지 말 것 — 대상 미색인이면 무효.
- 두 사이트 하남 교통 페이지가 "크롬만 다른 복붙"이면 canonical이 있어도 scaled-content 의심이 남음 → 하남 교통 본문은 **문장을 다시 쓸 것**.
- 같은 게시자 ID·`ads.txt`라 애드센스가 두 도메인 관계를 본다 → 시각·구조·콘텐츠에서 "다른 제품"이 분명해야 함.
- `restructure` 브랜치는 폐기. 새 브랜치는 RoadCCTV `docs/hanam/*` 시드에서 출발.
- 상인 직접광고 + AdSense 병행은 정책상 문제 없음. 다만 상인 광고가 주 수익이면 AdSense 승인 우선순위는 낮아짐.

## 6. 진행 상태

- [x] 전략 수립 (2026-09-10)
- [x] 아이덴티티 확정 (2026-09-10) — 메인색 하남 청색 `--accent #2f6fe0`(다크 `#6fa0ff`), 헤더 SVG마크+텍스트 락업, 이름 "하남라이프"
- [ ] favicon/og SVG 시안 (지도 + 핀 안 돋보기) — `design` 스킬, Phase 1 중 또는 직후
- [ ] Phase 1 — 이식 + 브랜딩 복구
- [ ] Phase 2 — 로컬 포털 콘텐츠 1차분
- [ ] Phase 3 — 색인 + 재심사
- [ ] Phase 4 — roadcctv.com canonical 정리
