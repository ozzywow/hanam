# hanam — 스타필드 하남 실시간 교통 CCTV

미사IC·올림픽대로·하남대로 진입로의 실시간 교통 CCTV(HLS)를 재생하고,
혼잡 시간대·주차 팁·우회로를 안내하는 정적 페이지. GitHub Pages로 배포.

공개 주소: `https://<GitHub아이디>.github.io/hanam/`

## 1. 스트림 주소 넣기

1. 국가교통정보 개방포털(`https://openapi.its.go.kr`)에서 무료 인증키 발급.
2. CCTV 목록 조회 (하남 스타필드 주변 좌표 박스):
   ```
   https://openapi.its.go.kr:9443/cctvInfo?apiKey=발급키&type=its&cctvType=1&getType=json&minX=127.19&maxX=127.25&minY=37.52&maxY=37.57
   ```
   `cctvType=1` → HLS(.m3u8) 실시간 스트리밍 주소(`cctvurl`) 반환.
3. `index.html` 의 `CAMS` 배열에 `{ name, url }` 로 추가.

### CORS 확인
브라우저 F12 → Network → `.m3u8` 요청의 Response Headers 에
`access-control-allow-origin` 이 있는지 확인.
없으면 hls.js가 차단됨 → Cloudflare Worker 프록시 필요.

## 2. 로컬 미리보기

```
cd hanam
python -m http.server 8080
# http://localhost:8080
```

## 3. GitHub Pages 배포

```
git init
git add .
git commit -m "init: 스타필드 하남 교통 CCTV 페이지"
git branch -M main
git remote add origin https://github.com/<아이디>/hanam.git
git push -u origin main
```

GitHub 저장소 → Settings → Pages → Source: `Deploy from a branch` → `main` / `/ (root)` 저장.
잠시 후 `https://<아이디>.github.io/hanam/` 에서 확인.

## 4. 광고

- **네이버 블로그 불가** (커스텀 플레이어·애드센스 미지원).
- 애드센스 승인 조건: 실질적·독창적 콘텐츠 필요 → CCTV만 있는 페이지는 거절됨.
  본문의 혼잡 패턴표/팁/우회로 텍스트를 실제 데이터로 채울 것.
- 승인 후 `index.html` 상단 `<script>` 주석 해제하고 `ca-pub-XXXX` 교체,
  `.ad` div 를 실제 광고 유닛 코드로 교체.

## 5. 주의

- 공개 교통정보라도 **광고 수익(상업적 이용)** 목적이면 개방포털 이용약관에서
  상업적 재배포 허용 여부를 반드시 확인. 애매하면 운영기관에 문의.
- 스트림 URL에 만료 토큰이 붙는 경우 주기적으로 갱신 로직이 필요할 수 있음.
