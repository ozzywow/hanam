# 로드맵 / 할 일

## 지금 상태 (2026-09)

- [x] GITS CCTV 연동 (hls 실시간 + vod 녹화), 프록시 없이 정적 페이지
- [x] 구역 3개: 스타필드 하남 / 미사·조정경기장 / 하남 진출입
- [x] 디렉토리 구조 정리 (`docs/` 배포, `tools/` 스크립트, `notes/` 기록)
- [x] 개인정보처리방침 + 이용약관 (`docs/privacy.html`, `docs/terms.html`)
- [x] 토큰 자동 갱신 GitHub Actions (6시간마다, 봇이 `cams.js` 커밋)
- [x] 배포: GitHub Pages(스테이징) + Cloudflare Pages(프로덕션)
- [x] 커스텀 도메인 `hanamlife.com` 연결, www→apex 301 (Cloudflare Page Rule)
- [x] `canonical` 프로덕션 주소로, `ads.txt`(pub-9635871358308305), `robots.txt`, `sitemap.xml`
- [x] 애드센스 신청 완료 → **심사 대기 중** (승인 메일 대기)
- [x] 애드센스 CMP(GDPR 동의 메시지) 설정
- [x] GA4 설치 (`G-Y46YYZLMCK`)
- [x] 검색엔진 등록: 구글 서치콘솔(도메인 속성/DNS TXT), 네이버 서치어드바이저
- [x] OG/Twitter 태그 + `assets/og.png`, favicon, JSON-LD(WebSite)
- [x] 콘텐츠 보강: 사이트 소개·이용 방법·CCTV 화면 읽는 법, 하남 도로 개요,
      구간별 대중교통·주차 요금·계절 행사, 종합 혼잡 캘린더, FAQ
      (업데이트 로그 섹션은 제거, 푸터 한 줄로 축약)
- [x] TMap·카카오맵 길찾기 딥링크 버튼 (좌표 OSM 기준)
- [x] 스타필드 실시간 주차 혼잡도 패널 (RF·B1·B2·B3, 여유/혼잡/만차) —
      Cloudflare Pages Function `functions/api/parking.js` 가 스타필드 내부 API
      세션 발급+호출 대행, `parking.js` 90초 갱신. 상세: [notes/sources.md](sources.md)
- [x] 병목 구간 재분류 (2026-09): 주중(나들목 병목·출퇴근 병목) + 주말(스타필드·미사·
      팔당대교~조안·현대아울렛·서울양양고속) = 라우트 섹션 7개, `DECKS` 0~7.
      단일 페이지 유지(URL 분리는 애드센스 승인 후 — restructure-plan)
- [x] 상단 개요 지도 `overview.js`: pagenav 경로를 Leaflet 선으로. 데스크톱=선 호버로
      한 경로 강조+라벨, 터치=선 조작 없이 스크롤 연동 미니맵(IntersectionObserver),
      목록 탭 시 지도에서 해당 경로 flash
- [x] 우하단 고정 '홈' 버튼(`.totop`, CSS만) — 스크롤 위치 무관 맨 위로
- [x] 실시간 사고·통제 피드: `functions/api/incidents.js` → `/api/incidents`
      (GITS `webLoadINCIData.do` 돌발정보 프록시). `incidents.js` 가 pagenav 아래
      전역 접이식 리스트 + 구간별 리스트(좌표 1.2km 매칭). 3분 갱신. 상세: sources.md

### 배포 구성

```
git push (main) ─┬─→ GitHub Pages     ozzywow.github.io/hanam   (스테이징)
                 └─→ Cloudflare Pages  hanamlife.com            (프로덕션, build output=docs)
6시간마다 refresh-tokens Action → cams.js 커밋 → 위 둘 자동 재배포
```

외부 서비스·계정·콘솔 URL·주요 ID 정리 → **[notes/services.md](services.md)**

## 애드센스 승인 후 (대기 중)

- [ ] `index.html` 등의 `<div class="ad">` placeholder → 실제 광고 유닛 코드
- [ ] 모바일 앵커(하단 고정) 광고 활성화 (자동 광고)
- [ ] 페이지 재구성 → **[notes/restructure-plan.md](restructure-plan.md)** 참고
      (허브 + `/cctv/*` 하위 페이지, 코스트코 하남·이케아 강동 추가)

## 심사 중에도 가능 (개정된 원칙 — restructure-spec §원칙)

심사 중 금지 = **다중 페이지 URL 분리(`/cctv/…`)·sitemap·canonical 변경**뿐.
같은 URL 안의 무위험 개선(콘텐츠·기능)은 `main` 머지·배포 OK.

- [x] 오타·문구 다듬기 (2026-09)
- [x] 상단 개요 지도 / 홈 버튼 / 사고·통제 피드 / 구간 재분류 (2026-09, 위 '지금 상태' 참고)
- [ ] `terms.html` 서치콘솔 URL 검사 → 색인 요청
- ~~창우동/팔당대교 남단 공영주차장 정보~~ — 안 넣기로 함

## 기능 확장 (선택)

- [ ] GITS 소통정보로 구역별 정체 색상 배지 (openapigits 키 활성화 시)
- [ ] 구역 추가: 코스트코 하남, 위례, 감일지구 등 (`tools/list-cams.mjs` 로 후보 조회)
- [ ] 즐겨찾기(로컬스토리지)로 기본 카메라 지정
- [ ] `sitemap.xml` 의 `lastmod` 배포 시 자동 갱신 (refresh-tokens Action 등)

## 운영

- [ ] 영상 안 나올 때: `node tools/scrape-tokens.mjs` 로 토큰 확인
- [ ] 월 1회 카메라 목록 점검 (GITS가 카메라 추가·삭제)
