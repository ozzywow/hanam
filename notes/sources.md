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

## 채택 — 경기도교통정보센터 돌발정보 (사고·공사·통제)

GITS 지도 `webMap.do?opt=2`(돌발정보 레이어)가 쓰는 내부 엔드포인트.

| 용도 | 엔드포인트 |
|---|---|
| 돌발 전체 목록 | `GET https://gits.gg.go.kr/web/map/webLoadINCIData.do` (파라미터 없음, 경기 전역) |

### 응답 구조

`text/plain`, 레코드 `@` · 필드 `::` 구분 (CCTV 목록과 같은 포맷). 경기 전역 16~20건 안팎.
필드(0-base, 15개):

| # | 뜻 | 예 |
|---|---|---|
| 0 | id (날짜+seq) | `202609029952` |
| 1 / 2 | 경도 / 위도 | `126.88049389` / `37.36923564` |
| 3 | 시작일시 | `2026-09-02 14:41:00` |
| 4 | 종료일시 또는 `미정` | `미정` |
| 5 / 6 | 시작 / 종료 link ID | `1010001001` (`0000000000`=없음) |
| 7 | cctvId | `8463` (`000000`=없음) |
| 8 | cctv 재생 URL 또는 `null` | `https://cctvsec.ktict.co.kr:8091/8463/…` |
| 9 | 통제 차로 | `3차로` / `갓길` / `전차로` / `1/2차로` / `…정보없음차로` |
| 10 | 도로명 | `수도권 제1순환고속도로` / `성남시 성남이천로` |
| 11 | `(방향) A → B` | `(구리방향) 조남JC → 산본IC` |
| 12 | 전체 메시지 `[유형] …` | `[차량고장] … 3차로 통제, 고장` |
| 13 | 인근 CCTV 라벨 또는 `null` | `[일산]수암터널(일산외부2)` |
| 14 | 분류 | `사고` / `공사` / `통제` |

- 유형은 필드 12의 `[…]`(차량고장·교통사고·차량사고·공사·도로폐쇄…)가 14보다 세분화 → 그걸 우선.

### 확인된 사실

- **CORS**: `gits.gg.go.kr` 본체라 CORS 헤더 없음 → 클라이언트 직접 호출 불가.
  `functions/api/incidents.js` 가 서버측 대행 + 파싱 + 하남 좌표 bbox 필터 + 유형별
  노출시간 필터 후 `/api/incidents` 로 JSON 반환. 엣지 캐시 120초, 레이트리밋 대비 0.9초 1회 재시도.
- **자기 정리**: 해소되면 피드에서 사라짐(공사는 수개월 유지, 사고·고장은 짧게). 그래서
  시간 필터는 '멈춘 레코드' 방지용 sanity 상한만: **사고·고장 12h / 공사·통제 30일**
  (+ 종료일시가 미래면 시간 무관하게 유지).
- 호출 파라미터 없음(지도 bounds 무관, 경기 전역 반환).
- 클라이언트 `docs/assets/js/incidents.js`: DECKS 좌표 1.2km 이내로 라우트 섹션에 매칭 →
  pagenav 아래 전역 접이식 리스트(상한 20) + 섹션별 리스트(상한 8). 심각도(사고>통제>공사>고장) 정렬.

## 채택 — 스타필드 하남 실시간 주차 혼잡도

공식 페이지 `https://www.starfield.co.kr/hanam/about/parkingInfo.do` 가 쓰는 내부 API.

| 용도 | 엔드포인트 |
|---|---|
| 세션 발급(쿠키 소스) | `GET https://www.starfield.co.kr/hanam/about/parkingInfo.do` → `Set-Cookie: JSESSIONID=…` |
| 주차 혼잡도 | `GET https://www.starfield.co.kr/api/hanam/myCar/parkingCNT.do` (위 `JSESSIONID` 쿠키 필요) |

### 응답 구조

```jsonc
{ "message":"success", "code":"3001",
  "jsonApiBody": "{ \"hdr\":{…}, \"rlt\":{           // ← 문자열, 다시 JSON.parse
      \"top_cnt\":\"273\", \"top_deg\":\"02\",       // RF(옥상)
      \"b1f_cnt\":\"603\", \"b1f_deg\":\"02\",       // B1
      \"b2f_cnt\":\"953\", \"b2f_deg\":\"01\",       // B2
      \"b3f_cnt\":\"625\", \"b3f_deg\":\"01\",       // B3
      \"f1_*\" \"f2_*\" \"f3_*\" \"b4f_*\" \"b5f_*\" // 하남은 미사용(0/null)
  } }" }
```

- `*_deg`: `01`=여유(green) · `02`=혼잡(orange) · `03`=만차(red) · 그 외(`0`/null)=정보없음.
  공식 페이지도 이 4개 층·3단계만 표시한다.
- `*_cnt`: 정수(주차대수로 추정). 총 주차면수를 알 수 없어 비율 계산 불가 → **표시 안 함**.
- 값은 수십 초 단위로 갱신됨(실측 시 호출마다 cnt 변동).

### 확인된 사실

- **세션 바인딩**: `bcnCd`(하남=`01`)가 세션에 묶인다. `/hanam/…` 경로 페이지를
  한 번 GET 해야 발급됨. `main.do`(비-하남) 세션으로는 `{"message":"bcnCd is null"}`.
  쿼리스트링 `?bcnCd=01` 로는 안 되고 오직 쿠키 경유. `JSESSIONID` 하나만 있으면 충분
  (다른 `__smVisitorID` 쿠키 불필요).
- **CORS**: 응답에 `Access-Control-Allow-Origin: *` 는 붙지만 세션 쿠키를 브라우저가
  만들 방법이 없음 → **클라이언트 직접 호출 불가**. → Cloudflare Pages Function
  `functions/api/parking.js` 가 서버측에서 2단계(세션→API)를 대행하고 `/api/parking`
  으로 4개 층만 돌려줌. 엣지 캐시 90초. `docs/assets/js/parking.js` 가 90초마다 호출.
- GitHub Pages(스테이징)엔 Functions 가 없어 `/api/parking` 404 → 패널 자동 숨김.
- 상업적 이용(광고 게재) 관련 약관 확인은 GITS/ITS 와 동일하게 미결 상태.

## 미채택

### 하남시 교통정보센터 돌발상황 (hanam.go.kr/its) — GITS 로 교체됨

- `POST https://www.hanam.go.kr/its/getUnexpect.do` (JSON body `{sdtm,edtm,endYn}`, `YYYYMMDDHHmmss`).
  처음 채택했다가 **GITS `webLoadINCIData.do` 로 교체**(커밋 `e72ab0f`).
- 이유: GITS 와 내용 불일치·지연 / `기타돌발` 다수가 빈 메시지 / 해소된 건이 오래 남음 /
  간헐 500(레이트리밋). GITS 가 상위 출처이고 도로명·방향·구간·통제차로가 구조화돼 있음.
- CORS 프리플라이트(OPTIONS) 미지원 + `Content-Type: application/json` 강제(text/plain→415)
  → 브라우저 직접 호출 불가.
- 하남 ITS 의 다른 엔드포인트(미사용): `getVmsInfo.do`/`getVmsDisplay.do`(전광표지 21곳 +
  현재 표출 이미지 base64), `getCameraInfo.do`(자체 CCTV 38대 — 내부망 `rtsp://…172.16.x.x`
  라 사용 불가, 상당수는 이미 GITS 로 `cams.js` 에 있음), `getRoadTraffic.do`/`getLinkInfo.do`
  (소통 속도 — 파라미터 넣어도 오류, 지도는 Kakao 기본 교통 레이어로 대체).

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
