# 데이터 소스 조사 기록

기준점: 스타필드 하남 ≈ 위도 37.5452, 경도 127.2220

## 채택 — 경기도교통정보센터 (GITS)

시내 도로·교차로까지 커버. 별도 인증키 불필요 (사이트 내부 엔드포인트).

| 용도 | 엔드포인트 |
|---|---|
| 지도 CCTV 페이지 | `https://gits.gg.go.kr/web/trafficInfo/webMapInfo.do?opt=3` (내부 `/web/map/webMap.do?opt=3`) |
| 전체 CCTV 목록 | `GET /web/map/webLoadCCTVData.do` → `ID/NAME/LON/LAT/n1/n2/n3@...` (텍스트) |
| 이름 검색 | `GET /web/map/webLoadCctvSearchData.do?searchTxt=<UTF8>` |
| 카메라 팝업(토큰 소스) | `GET /web/popup/webCctvPopup.do?cctvId=<id>` (HTML) |
| 좌표속성 xlsx | `/excel/download/OpenDataCCTV?key=<사이트키>` |

### 재생 흐름

- **hls (KTICT, 실시간)**: 팝업 `<script>` 안 `//gitsview.gg.go.kr/<id>/<token>!hls`.
  이 URL을 GET → 본문에 실제 m3u8 주소(text) 반환 →
  `https://gitsview.gg.go.kr:8082/gits01/gits<id>D/playlist.m3u8?wmsAuthSign=...`
- **vod (경찰청UTIS·하남시)**: 팝업 `<video src="https://gitsview.gg.go.kr/<id>/<token>">`.
  이 URL → 302 → `cctvsec.ktict.co.kr:8082/koroad.../<file>.mp4?wmsAuthSign=...` (video/mp4).
  실시간 아님. 약 1분 간격 갱신되는 짧은 녹화 클립.

### 확인된 사실

- `<id>/<token>` 팝업 토큰: 팝업은 **요청마다 새 문자열**을 발급하지만, **이전 토큰도 한동안 계속 유효**함
  (몇 시간 뒤 옛 토큰으로도 m3u8 정상 반환 확인). 만료 시점 불명 → `.github/workflows/refresh-tokens.yml`
  이 6시간마다 `scrape-tokens.mjs --write` 로 `cams.js` 갱신.
- `wmsAuthSign` 토큰: `validminutes=120` → 재생 URL은 약 120분 유효, 만료 시 리졸버 재호출.
- **CORS**:
  - `gitsview.gg.go.kr` → `Access-Control-Allow-Origin: *` (+ `Access-Control-Allow-Headers: Range`). HTTPS. → 브라우저에서 직접 호출 OK, 프록시 불필요.
  - `gits.gg.go.kr` 본체(팝업·목록) → CORS 헤더 없음. → 클라이언트에서 직접 못 부름. 그래서 토큰을 미리 긁어 `cams.js` 에 하드코딩.
- 목록 필드 `n1`: 1=일반, 2·3=타 기관 연계. `n1=1` 중 하남시 로컬 카메라는 대부분 vod.

## 미채택

### 국가교통정보센터 ITS (openapi.its.go.kr)

- `GET https://openapi.its.go.kr:9443/cctvInfo?apiKey=<KEY>&type=ex|its&cctvType=4&getType=json&minX=&maxX=&minY=&maxY=`
- `cctvType=4` = HTTPS HLS. 응답 `cctvurl` → `cctvsec.ktict.co.kr` 302 → m3u8.
- CORS: 요청 Origin 반사(허용). 스트림 CORS `*`.
- **한계**: 고속도로·국도만. 스타필드 바로 앞 시내도로 없음 → 미사용.
- (Windows curl TLS 오류 시 `--ssl-no-revoke`, Node 는 `NODE_TLS_REJECT_UNAUTHORIZED=0`)

### UTIC 도시교통정보센터 (utic.go.kr)

- 개방데이터 CCTV: 키값 + **IP 인증**. 등록 IP에서만 호출 가능 → 정적 사이트 클라이언트에서 불가.
- `cctvOpenData.do` 는 안내 페이지(HTML)만 반환. 스트림은 내부 게이트웨이(JSP 팝업) 경유.

### 경기도 GITS 오픈API (openapigits.gg.go.kr)

- `getRoadInfoList` 등 → 소통상황 텍스트(원활/서행/정체). 영상 아님.
- 발급 키 `headerCd 7` (등록됐으나 일시 중지) 상태로 미활성 — 재확인 필요.
- 향후 "실시간 소통 현황판" 용도로 재검토 가치 있음.
