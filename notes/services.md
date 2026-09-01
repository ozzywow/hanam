# 외부 서비스·계정 정리

hanamlife.com 운영에 쓰는 모든 외부 사이트와 콘솔. 로그인 계정·주요 ID·다시 갈 일 포함.

## 계정 (로그인 주체)

| 서비스군 | 계정 |
|---|---|
| Google (AdSense·Search Console·Analytics) | ozzywow2@gmail.com |
| Cloudflare (도메인·DNS·호스팅) | ozzywow2@gmail.com |
| GitHub (소스·스테이징) | ozzywow |
| 네이버 서치어드바이저 | 네이버 계정 |
| 인스타그램 (사이트 연락처) | @hanamlife |

---

## 1. 도메인 · DNS · 호스팅 — Cloudflare

**대시보드**: https://dash.cloudflare.com

| 항목 | 위치 | 메모 |
|---|---|---|
| 도메인 등록 | Domains → Registrations | `hanamlife.com` (Cloudflare Registrar, 원가). 자동 갱신 |
| DNS 레코드 | hanamlife.com → DNS → Records | CNAME `@`·`www` → `hanam.pages.dev` (Proxied) / TXT: Google 소유확인 / TXT: `ads.txt` 아님 |
| 프로덕션 호스팅 | Workers & Pages → **hanam** | build output `docs/`. main push 시 자동 배포 |
| 커스텀 도메인 | 위 프로젝트 → Custom domains | `hanamlife.com`, `www.hanamlife.com` (Active/SSL) |
| Pages 기본 주소 | — | `hanam.pages.dev` (지울 수 없는 별칭) |
| www→apex 리다이렉트 | hanamlife.com → Rules → Page Rules | `www.hanamlife.com/*` → `https://hanamlife.com/$1` (301) |

---

## 2. 소스 · 스테이징 · 자동화 — GitHub

| 항목 | URL | 메모 |
|---|---|---|
| 저장소 | https://github.com/ozzywow/hanam | main 브랜치가 배포 소스 |
| 스테이징 (GitHub Pages) | https://ozzywow.github.io/hanam/ | Settings → Pages, main `/docs`. 프로덕션과 동일 내용 미러 |
| 자동화 (Actions) | 저장소 → Actions | `.github/workflows/refresh-tokens.yml` — 6시간마다 `cams.js` CCTV 토큰 갱신 커밋 |

---

## 3. 검색엔진 등록

### Google Search Console
- **URL**: https://search.google.com/search-console
- 속성: `hanamlife.com` (**도메인 속성**, Cloudflare DNS TXT `google-site-verification=…` 로 인증 — 값은 Cloudflare DNS 레코드에서 확인)
- Sitemaps: `sitemap.xml` 제출 (상태 성공)
- 새 페이지 추가 시: URL 검사 → 색인 생성 요청

### 네이버 서치어드바이저
- **URL**: https://searchadvisor.naver.com
- 사이트: `https://hanamlife.com`
- 소유확인: HTML 태그 `<meta name="naver-site-verification" content="e7e362264b345b22bf90095376b23a4e67fadbf5">` (index.html `<head>`)
- 사이트맵 제출 + 웹페이지 수집 요청 완료
- robots.txt 검증: 통과

---

## 4. 광고 · 분석

### Google AdSense
- **URL**: https://adsense.google.com
- 게시자 ID: `ca-pub-9635871358308305` (ads.txt 에는 `pub-9635871358308305`)
- `docs/ads.txt`: `google.com, pub-9635871358308305, DIRECT, f08c47fec0942fa0`
- 상태: **심사 대기 중** (승인 메일 대기)
- GDPR 동의 메시지(CMP): 개인정보 보호 및 메시지 → 3-선택형(동의/거부/옵션) 설정됨
- 승인 후: `<div class="ad">` placeholder → 광고 유닛, 모바일 앵커 광고 활성화

### Google Analytics 4
- **URL**: https://analytics.google.com
- 측정 ID: `G-Y46YYZLMCK`
- 스니펫: index.html·privacy.html·terms.html `<head>` (gtag.js)
- 보고서: 실시간 / 획득(유입 경로) / 참여도 → 페이지

---

## 5. CCTV 데이터 출처 (상세는 [sources.md](sources.md))

| 기관 | URL | 용도 |
|---|---|---|
| 경기도교통정보센터 (GITS) | https://gits.gg.go.kr | CCTV 목록·팝업 토큰 원본 (CORS 없음, 클라이언트 직접 호출 불가) |
| GITS 뷰어 | https://gitsview.gg.go.kr | m3u8 리졸버 (CORS `*`, 프록시 불필요) |
| 국가교통정보센터 (ITS) | https://www.its.go.kr | 참고 |
| 도시교통정보센터 (UTIC) | https://www.utic.go.kr | 참고 |

---

## 6. 개발 중 참고·검증 도구

| 도구 | URL | 용도 |
|---|---|---|
| OpenStreetMap Nominatim | https://nominatim.openstreetmap.org | 길찾기 버튼 좌표 조회 (스타필드 37.5454,127.2241 / 미사경정공원 37.5601,127.2076) |
| TMap 앱 스킴 | `tmap://route?goalname=&goalx=&goaly=` | 길찾기 딥링크 |
| 카카오맵 링크 | https://map.kakao.com/link/to/{name},{lat},{lng} | 길찾기 딥링크 |
| OpenGraph 미리보기 | https://www.opengraph.xyz | 공유 카드 확인 |
| DNS 전파 확인 | https://dnschecker.org | 도메인 전파 |
| Google Public DNS (DoH) | https://dns.google/resolve?name=&type=A | A/NS 레코드 즉시 조회 |
| GA 차단 부가기능 | https://tools.google.com/dlpage/gaoptout | privacy.html 옵트아웃 안내 링크 |
| 스타필드 하남 주차 안내 | https://www.starfield.co.kr/hanam/about/parkingInfo.do | 주차 요금(무료) 근거 |
| 미사경정공원 주차 안내 | https://www.ksponco.or.kr/boatracepark/menu.es?mid=b40106000000 | 주차 요금표 근거 |

---

## 7. 주요 식별자 한눈에

```
도메인               hanamlife.com               (Cloudflare Registrar)
프로덕션             hanamlife.com               (Cloudflare Pages, project=hanam)
스테이징             ozzywow.github.io/hanam     (GitHub Pages)
Pages 별칭           hanam.pages.dev
저장소               github.com/ozzywow/hanam    (main → 자동 배포)

AdSense 게시자       ca-pub-9635871358308305
GA4 측정 ID          G-Y46YYZLMCK
네이버 소유확인       e7e362264b345b22bf90095376b23a4e67fadbf5
구글 소유확인         Cloudflare DNS 의 TXT google-site-verification=… 레코드

연락처               instagram.com/hanamlife / ozzywow2@gmail.com
```
