# 로드맵 / 할 일

## 지금 상태

- [x] GITS CCTV 연동 (hls 실시간 + vod 녹화), 프록시 없이 정적 페이지
- [x] 구역 3개: 스타필드 하남 / 미사·조정경기장 / 하남 진출입
- [x] 디렉토리 구조 정리 (`docs/` 배포, `tools/` 스크립트, `notes/` 기록)
- [x] 개인정보처리방침 초안 (`docs/privacy.html`)
- [x] 토큰 자동 갱신 GitHub Actions (6시간마다, 봇이 `cams.js` 커밋)
- [x] 배포: GitHub Pages(스테이징) + Cloudflare Pages(프로덕션) 둘 다 push 자동 반영

### 배포 구성

```
git push  ─┬─→ GitHub Pages       ozzywow.github.io/hanam   (스테이징)
           └─→ Cloudflare Pages   hanam.pages.dev           (프로덕션, build output=docs)
6시간마다 refresh-tokens Action → cams.js 커밋 → 위 둘 자동 재배포
```

## 콘텐츠 (애드센스 승인 전 필수)

- [ ] 각 구역 "요일·시간대별 혼잡 패턴" 실제 데이터로 교체
      (네이버·카카오맵 붐비는 시간 / 직접 관측)
- [ ] "주차장 진입 팁" — 스타필드 하남 공식 주차 안내, 미사경정공원 주차 기준
- [ ] "우회로 안내" — 실제 대안 경로
- [ ] "대중교통" — 카카오맵 실측 도보 시간, 버스 노선
- [ ] `privacy.html` 시행일·이메일 채우기
- [ ] footer 연락처 채우기
- [ ] 소개(about) 페이지 or 섹션

## 애드센스

- [ ] 커스텀 도메인 구입 + Cloudflare Pages 에 연결 (Custom domains 탭)
- [ ] `docs/index.html` 의 `<link rel="canonical">` 를 프로덕션 주소로 변경
- [ ] `docs/ads.txt` 추가 (커스텀 도메인이면 루트로 서빙됨)
- [ ] 애드센스 신청 → 승인 후 `index.html` 스크립트 주석 해제 + `.ad` 를 광고 유닛으로 교체
- [ ] 대안 검토: Blogger/Tistory (애드센스 승인 수월)

## 기능 확장 (선택)

- [ ] GITS 소통정보로 구역별 정체 색상 배지 (openapigits 키 활성화 시)
- [ ] 구역 추가: 하남 스포츠센터, 위례, 감일지구 등 (`tools/list-cams.mjs` 로 후보 조회)
- [ ] 즐겨찾기(로컬스토리지)로 기본 카메라 지정
- [ ] Cloudflare 빌드 아끼려면 Build watch paths 를 `docs/**` 로 좁히기 (지금은 `*`, 한도엔 여유)
- [ ] 블로그로 이전 시: `cams.js` 를 GitHub 에서 `<script src>` 로 불러오도록 분리

## 운영

- [ ] 영상 안 나올 때: `node tools/scrape-tokens.mjs` 로 토큰 확인
- [ ] 월 1회 카메라 목록 점검 (GITS가 카메라 추가·삭제)
