# tools/

배포되지 않는 개발 스크립트. Node 18+ (fetch 내장) 필요.

## list-cams.mjs — 반경 내 CCTV 찾기

```
node tools/list-cams.mjs <lat> <lon> [반경km=5]
node tools/list-cams.mjs 37.5452 127.2220 4
```

GITS 전체 목록에서 기준점 반경 안의 카메라를 거리순으로 출력.
새 구역을 추가하거나 카메라를 교체할 때 후보 id 확인용.

## scrape-tokens.mjs — 재생 토큰 갱신

```
node tools/scrape-tokens.mjs           # 변경분 확인만
node tools/scrape-tokens.mjs --write   # docs/assets/js/cams.js 의 url 교체
```

`cams.js` 의 각 카메라에 대해 GITS 팝업에서 최신 재생 URL을 긁어 비교.
영상이 갑자기 재생 안 될 때(토큰 변경 의심) 실행.

## 참고

TLS: 정부 사이트 인증서 체인이 Windows Node 에서 검증 실패하는 경우가 있어
두 스크립트 모두 `NODE_TLS_REJECT_UNAUTHORIZED=0` 을 설정합니다. GITS 공개
데이터 조회에만 쓰이며 자격증명은 다루지 않습니다.

엔드포인트·CORS 조사 결과는 `../notes/sources.md` 참고.
