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

- **favicon / og = 새로 제작 완료** (2026-09-10, `aa963fa`). 두 방향 병행:
  - **방향 A** (맵타일 + 청색 핀 + 흰 돋보기, 청록 한강) = 헤더 락업(`docs/index.html` `h1.brand` 인라인 SVG) + `docs/assets/og.png`(1200×630, "하남라이프" + 태그라인 + 도메인)
  - **방향 D** (청색 타일 · 흰 핀 · 핀 구멍=렌즈 · 청록 점) = `docs/assets/favicon.svg` + `icon-192/512/512-maskable.png` + `apple-touch-icon.png` — 소형 가독성 담당
  - 생성: `sharp`(hanam node_modules) SVG→PNG. 빌드 스크립트는 세션 스크래치패드 `favicon/build-assets.mjs`
  - 시안 캔버스(4방향 + 소형 + 락업 + og): 아티팩트 "하남라이프 브랜드 마크"

- **헤더 표시 = 인라인 SVG 마크 + "하남라이프" 실제 텍스트 락업** (RoadCCTV `h1.brand` 구조 재사용). `docs/index.html` 홈에 적용. 목적지 7페이지는 브레드크럼 "홈" 링크만(후속 검토). 근거는 §3.1.

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

**Phase 1 진행 기록 (2026-09-10, 브랜치 `rebuild`, 커밋 `bd6741f`)**

완료:
- 8개 페이지 이식 + 경로/`/hanam/` 제거 + canonical·og·JSON-LD → hanamlife.com + 브레드크럼 '하남' 단계 제거 + **Beta 마크 제거** + `<div class="ad">` 텍스트 비움
- 허브에 '이 사이트 소개·이용 방법·CCTV 화면 읽는 법' 복원 (`restructure:docs/index.html` 에서)
- 아이덴티티: '하남라이프', `--accent #2f6fe0`/다크 `#6fa0ff`, `--tint` 쿨톤, theme-color, manifest, sw.js(`hanamlife-v1`)
- JS 이식: player/incidents/parking/collapse/theme/remote/weather/traffic-live + regions/hanam{,.baseline,.traffic}.js. `cams.js`·`overview.js` 삭제
- Functions: `traffic.js`·`weather.js` 추가 (incidents·parking·resolve 는 기존과 동일)
- `scrape-tokens.mjs`·`refresh-tokens.yml` 을 `regions/*.js` 대응으로 교체
- PWA(manifest·sw.js·_headers), sitemap 새 URL 10개, `package.json`(wrangler devDep + `npm run dev`)
- 로컬 검증: `wrangler pages dev` — 8개 라우트 200, `/api/{incidents,traffic,weather,parking}` 200, 에러 없음

미이식/보류 (의도):
- 제보 백엔드 — `report.js`·`device-id.js`·`functions/api/report.js`·D1·`/admin`. 문의는 메일·인스타 유지
- `overview.js` 상단 개요 지도 — RoadCCTV 하남이 이미 뺀 상태. 필요하면 Phase 1.5로 별도 복원
- `favorites.js`·`pwa-install.js` — RoadCCTV 하남 페이지도 미탑재. 후속

남은 다듬기 (merge 전/후):
- [ ] favicon/og SVG 시안 (지도 + 핀 안 돋보기) — `design` 스킬. 현재는 RoadCCTV 마크 그대로
- [ ] 브라우저 시각 확인 (라이트/다크, 모바일) — 정적/함수 검증만 끝난 상태
- [ ] 목적지 h1 이 RoadCCTV식 짧은 이름(`📍 …일대`) — 필요하면 SEO용으로 확장 검토 (title 은 이미 충분)
- [ ] `privacy.html`·`terms.html` 에 '하남라이프' 명칭 반영 (현재 '하남시 실시간 교통 CCTV')
- [ ] 내부 `rc-*` localStorage/CSS 클래스 키 — 그대로 둠 (내부 식별자). 정리는 선택
- [ ] `robots.txt` AI봇 차단은 미적용 (RoadCCTV 에는 있음) — 선택

### Phase 2 — 로컬 포털 콘텐츠 1차분 (반려를 실제로 뚫는 핵심) — 완료 (2026-09-10, `ffc532e`)

이식만으로는 "가치가 별로 없는 콘텐츠"를 못 뒤집는다. 교통이 아닌 **고유 원본 콘텐츠**.

- `/guide/` — 하남 생활 안내 허브
- `/guide/areas/` — 생활권 안내 (미사·풍산·덕풍·신장·창우·감일·위례)
- `/guide/subway/` — 5호선 하남선 (역별 역세권·버스 환승)
- `/guide/places/` — 나들이·대형시설 (스타필드·미사경정공원·검단산·유니온파크·이성산성)
- `/guide/seasons/` — 계절 안내 (겹벚꽃·억새·단풍·쇼핑 시즌)

각 페이지: 소개문단 + 구획별 상세 + 요약표 + FAQ + 형제 링크 + CCTV 페이지 상호 링크.
셸은 경량(player/leaflet 없이 theme.js+remote.js). 지하철·시설 사실은 하남시·국토부 자료와 대조,
가변 정보(개화·행사)는 공식 채널 안내로 처리. 홈에 "하남 생활 안내" 섹션 + sitemap +5 + sw.js v2.

후속 후보 (선택, 지금은 안 함): 지역 소식/홍보, 상권·전통시장 상세, 학군·이사 체크리스트.

### Phase 3 — 색인 + 재심사

- 서치콘솔 sitemap 재제출, 네이버 재제출
- 전 페이지 "색인 생성됨" 확인 (구글이 크롤 못 한 페이지는 평가 자체가 안 됨)
- 전부 색인된 뒤 애드센스 재심사 신청 (반려 후 실질 변경 없이 재신청하면 자동 재반려)

### Phase 4 — roadcctv.com 중복 정리 (hanamlife 승인·색인 후)

- roadcctv.com/hanam/* 의 `<link rel="canonical">` → hanamlife.com 대응 URL
- roadcctv.com 하남 본문은 얇게 유지 (다른 16개 지역 톤과 통일). 로컬 특화 문단은 hanamlife에만
- roadcctv.com 자기 심사 결과에 따라 대응

## 7. 색인 재요청 절차 (배포 후)

배포 URL 13개: `/` + CCTV 7 (`/starfield/` `/misa/` `/ramp/` `/commute/` `/paldang/` `/seoul-yangyang/` `/outlet/`) + 생활 안내 5 (`/guide/` `/guide/areas/` `/guide/subway/` `/guide/places/` `/guide/seasons/`). `sitemap.xml` 에 `/privacy.html` `/terms.html` 포함 15개, `lastmod 2026-09-10`.

### 구글 서치콘솔 (hanamlife.com 도메인 속성)
1. **Sitemaps** (좌측 "색인 생성 > Sitemaps") → "새 사이트맵 추가"에 `sitemap.xml` 입력 → 제출. 이미 있으면 그대로 두고 상태가 "성공"인지 확인 (구글이 주기적으로 재읽음).
2. **URL 검사** (상단 검색창) → 새 URL 하나씩 붙여넣기(전체 주소) → Enter → **색인 생성 요청**. 8개 다. 홈 `/` 은 기존 색인 갱신용으로 재요청.
   - 수동 색인 요청 하루 한도 ~10건. 8개면 하루에 됨.
3. 1~2주 뒤 **페이지**(색인 범위) 리포트에서 오류 확인. 옛 단일페이지 앵커(`/#starfield` 등)는 별도 URL이 아니라 정리할 것 없음.

### 네이버 서치어드바이저 (웹마스터도구)
1. 사이트 `https://hanamlife.com/` 선택 → **요청 > 사이트맵 제출** → `https://hanamlife.com/sitemap.xml` → 확인.
2. **요청 > 웹페이지 수집** → 새 URL 하나씩 입력해 수집 요청 (하루 한도 있음).
3. 네이버는 재수집이 느릴 수 있음 — 며칠 여유.

### 주의
- **색인 재요청 시점: Phase 2 완료 후 한 번에** (사용자 결정 2026-09-10). Phase 1 배포분만 지금 요청하면 로컬 콘텐츠 추가 후 다시 해야 하므로 미룸. 배포 자체는 됐으니 구글이 자연 크롤은 함.
- 애드센스 재심사는 **Phase 2 + 전 페이지 "색인 생성됨" 확인** 후에 넣는다. 지금 바로 넣지 말 것.
- roadcctv.com 에는 아직 하남 canonical 안 걸었음 (Phase 4, hanamlife 색인·승인 후).

## 5. 가드레일

- hanamlife 승인·색인 **전에** roadcctv canonical 걸지 말 것 — 대상 미색인이면 무효.
- 두 사이트 하남 교통 페이지가 "크롬만 다른 복붙"이면 canonical이 있어도 scaled-content 의심이 남음 → 하남 교통 본문은 **문장을 다시 쓸 것**.
- 같은 게시자 ID·`ads.txt`라 애드센스가 두 도메인 관계를 본다 → 시각·구조·콘텐츠에서 "다른 제품"이 분명해야 함.
- `restructure` 브랜치는 폐기. 새 브랜치는 RoadCCTV `docs/hanam/*` 시드에서 출발.
- 상인 직접광고 + AdSense 병행은 정책상 문제 없음. 다만 상인 광고가 주 수익이면 AdSense 승인 우선순위는 낮아짐.

## 6. 진행 상태

- [x] 전략 수립 (2026-09-10)
- [x] 아이덴티티 확정 (2026-09-10) — 메인색 하남 청색 `--accent #2f6fe0`(다크 `#6fa0ff`), 헤더 SVG마크+텍스트 락업, 이름 "하남라이프"
- [x] Phase 1 — 이식 + 브랜딩 복구 (2026-09-10, 브랜치 `rebuild`, `bd6741f`). 로컬 검증 통과. 상세는 §4 Phase 1 진행 기록
- [x] 브랜드 마크 확정 (2026-09-10, `aa963fa`) — 방향 A(맵타일+청색핀+돋보기) 기본 = 헤더 락업·og.png / 방향 D(미니멀 모노그램) = favicon.svg·PWA 아이콘·apple-touch. 시안 캔버스: 아티팩트 `하남라이프 브랜드 마크`
- [x] `rebuild` → `main` 머지·배포 (2026-09-10, 머지 커밋 `b1bbbc6`, push 완료). 병합 시 `cams.js`(main 토큰갱신) vs `regions/hanam.js`(rebuild) 리네임 충돌 → rebuild 채택 + `scrape-tokens.mjs --write` 로 토큰 재발급. Cloudflare Pages 자동 배포.
- [ ] 배포 반영 브라우저 확인 (하남라이프 h1 락업·청색·파비콘, /guide/ 5페이지)
- [x] Phase 2 — 로컬 포털 콘텐츠 `/guide/` 5페이지 (2026-09-10, `ffc532e`, 배포됨)
- [ ] **색인 재요청 (다음 작업)** — 서치콘솔 sitemap 재제출 + URL 13개 색인 요청 · 네이버 sitemap 재제출. 절차 §7
- [ ] 그 후 애드센스 재심사 신청
- [ ] Phase 2 — 로컬 포털 콘텐츠 1차분
- [ ] Phase 3 — 색인 + 재심사
- [ ] Phase 4 — roadcctv.com canonical 정리
