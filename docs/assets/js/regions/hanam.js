/* ═══════════════════════════════════════════════════════════════
   하남 지역 CCTV 정의 — 이 파일만 고치면 하남 구성이 바뀝니다.
   (지역별로 assets/js/regions/<region>.js 파일 1개. 각 페이지는 자기 지역 파일만 로드)

   각 항목:
     { id, name, type, lat, lng, url }
     - type "hls" : 실시간(KTICT). url = gitsview 리졸버(끝에 !hls).
     - type "vod" : 녹화 클립(경찰청UTIS·시 자체). url = gitsview 302 → mp4.
     - lat/lng    : 지도 마커 좌표. GITS webLoadCCTVData.do 에서 옴.
   { grp:"헤더" } 는 버튼 그룹 구분선.

   url 안의 토큰은 GITS 팝업에서 긁은 고정값입니다.
   토큰·좌표가 만료/변경되면  node tools/scrape-tokens.mjs --write  로 갱신
   (regions/ 안의 모든 지역 파일을 순회함).
   카메라를 새로 찾으려면  node tools/list-cams.mjs 37.5452 127.2220 4

   DECKS 인덱스( [0],[1],[2] )는 목적지 페이지의
   <div class="player-mount" data-deck="N"> 과 짝을 이룹니다.
   ═══════════════════════════════════════════════════════════════ */

const DECKS = [

  /* ── 0 · 스타필드 하남 가는 길 ── */
  [
    { id:1277,  name:"팔당대교남단(팔당대교방면)", type:"hls", lat:37.54770, lng:127.22091, url:"https://gitsview.gg.go.kr/1277/7TYtkgdtQJrqMHohNAXt/Uo5FjetXgGNhJsgV7fjmOxwsFo4boRswDyxFoZYtqDr!hls" },
    { id:61065, name:"스타필드동측",          type:"vod", lat:37.54372, lng:127.22600, url:"https://gitsview.gg.go.kr/61065/GlPs2+VybjnubfVCDMAOvkBchcGwLFjyq71hfs+TtnDve11H0qoKNmJPE7D6wK/+" },
    { id:61064, name:"덕풍6교 서측",          type:"vod", lat:37.54567, lng:127.21642, url:"https://gitsview.gg.go.kr/61064/Pr7VGuKQfzGlf0vKoRZolpcdZQ3U3j4vrYrc6Dc8MRJC3qB+u1tKrOawil9k73sx" },
    { id:6751,  name:"신풍로삼거리",          type:"vod", lat:37.55070, lng:127.21433, url:"https://gitsview.gg.go.kr/6751/+JIzaXpoiIizOr6pzta4Z3C0RyGHtZcDGb+64X161GGhbrt0Tgd2vC+0AbL57ieF" },
    { id:6752,  name:"창우지하차도사거리",    type:"vod", lat:37.53854, lng:127.22930, url:"https://gitsview.gg.go.kr/6752/y9bpayy7X6uqn4PZnc++PmrUdd6gonMjb8EICcD0V9BAIURorUYZ9oc9mfCN4KnU" },
  ],

  /* ── 1 · 미사·조정경기장 가는 길 ── */
  [
    { id:6750,  name:"조정경기장사거리",   type:"vod", lat:37.56012, lng:127.20350, url:"https://gitsview.gg.go.kr/6750//3Ik45+QpoCFU16monN1MQRUAq4BdDXKhJ0TyLxOCtXjYYfsAGhWoJdOZdyH9y5p" },
    { id:6749,  name:"한강유역환경청사거리", type:"vod", lat:37.56895, lng:127.19700, url:"https://gitsview.gg.go.kr/6749/7gv1sFEIE14YFl6yhC+tUdSRhBIcbjRUu/Ws0aIhY0/ZZR+Acdnny1pZlda/ZOzw" },
    { id:60655, name:"황산사거리",         type:"vod", lat:37.54991, lng:127.18566, url:"https://gitsview.gg.go.kr/60655/zMrhYguquMVVOrMPen1dH9zUBrYKBP7Cn4+yjyCOGjklVzRXokbyK6OmgS25rxXG" },
    { id:1275,  name:"미사IC 남단(하남)",  type:"hls", lat:37.57486, lng:127.19475, url:"https://gitsview.gg.go.kr/1275/NpJJ7TbyNATWEEKgv2q0hbrMnbstPid3kUI4aMhlhlj5b8hqNAShTRPE/1RpcQZQ!hls" },
    { id:6748,  name:"미사교차로",         type:"vod", lat:37.57968, lng:127.19310, url:"https://gitsview.gg.go.kr/6748/jG0qy+/U3mAwN3ldEQgAN51nSB5aDmTHpq0e7eti0xgFq7Cq0ac+4rKCUI2W9qBw" },
    { id:2569,  name:"미사대교",           type:"hls", lat:37.58372, lng:127.19414, url:"https://gitsview.gg.go.kr/2569/lmjMXtpLPduqQ1xWmDxRvszlZYR/U/9T3wrNsz9F6rqkw318rIa6HPj+NU4eH5kS!hls" },
  ],

  /* ── 2 · 하남 진출입 ── (현재 페이지 미표시: index.html 의 '하남 진출입' 섹션 제거됨.
     데이터는 보존 — 다시 넣으려면 <div class="player-mount" data-deck="2"> 섹션 복원) */
  [
    { grp:"중부고속 남쪽 → 하남IC 진입 (~2km)" },
    { id:21,    name:"하남IC",            type:"hls", lat:37.52801, lng:127.21858, url:"https://gitsview.gg.go.kr/21/w7RTp3kGK1raguzMaFpDQhynw2RiY4iO1uh/T/3mO+J2nj8jtSMjEbp5ejOAEq+v!hls" },
    { id:6755,  name:"천현사거리",         type:"vod", lat:37.53561, lng:127.21490, url:"https://gitsview.gg.go.kr/6755/AH6/mgKXaEOE7DC/R0hDteNv9HWTv5nME3wNFXjBfJomVUFMOxbSjlWWqxnjLpMN" },
    { id:6757,  name:"신장사거리",         type:"vod", lat:37.53786, lng:127.20460, url:"https://gitsview.gg.go.kr/6757/unZWtGDQ5fp9xO692tSfsSe8H37xdxSTqKRNimhLZv8WgoqXXoig8PtBWGkgMfq1" },
    { id:94794, name:"천현2",             type:"hls", lat:37.53169, lng:127.20598, url:"https://gitsview.gg.go.kr/94794/Jh+/MTatYqrC5nlcRKmpYRN2tpJnw2FtByV/7QiAKuw2aO9heyOdZWW40y7ekM2y!hls" },
    { id:2708,  name:"천현삼거리",         type:"hls", lat:37.52521, lng:127.22042, url:"https://gitsview.gg.go.kr/2708/hgxwNXNzdwytHcBvfvomzRfgAo1n8aW4av69d1wGKVlGX4MH75LMO1RECjV81stK!hls" },

    { grp:"팔당대교 방면 (남양주·양평 → 강 건너)" },
    { id:4405,  name:"팔당대교IC",        type:"hls", lat:37.54822, lng:127.24015, url:"https://gitsview.gg.go.kr/4405/Jq9LYm2TF/GFIPrbDQHBxXxWvCbeGCgARYwGjVFAfBK85qsJdKifaZr4HPgNMLyQ!hls" },
    { id:6765,  name:"팔당대교남단(하남측)", type:"vod", lat:37.54317, lng:127.23379, url:"https://gitsview.gg.go.kr/6765/AIqh/Qvx3UQLVeNgjIuoC1jpDL69rdlzNdbGSRJTWWSsRnGOdAac9+pGud9LKpC5" },
    { id:71659, name:"남양주 하팔당삼거리", type:"hls", lat:37.55259, lng:127.23854, url:"https://gitsview.gg.go.kr/71659/NymrSSb4eNtUVEyKo77RfJrLLrqc1+iPkl0UcwtSo3DV9WutI1j6KOOUQ1v4QsG8!hls" },
    { id:71308, name:"한강시민공원(팔당)",  type:"hls", lat:37.55946, lng:127.23579, url:"https://gitsview.gg.go.kr/71308/9Snt7W/UQjAKzxaOnurpALz7bkMBxYPIy5Sxcfu39tTRs9WtpxWCZz1C/dDXTmNn!hls" },

    { grp:"고속도로 분기·요금소 (~3km)" },
    { id:8,     name:"하남JC",            type:"hls", lat:37.53250, lng:127.19361, url:"https://gitsview.gg.go.kr/8/WXtZxPwfkl1zJwxQyeEH5mwWlIYHricf9NaX5yReMq8352axVXaeYGScbodzaag8!hls" },
    { id:20,    name:"동서울영업소",       type:"hls", lat:37.51773, lng:127.22149, url:"https://gitsview.gg.go.kr/20/ecTbaHuH3p1ETjlwqzqWfcs4+2bPukOs8c4Wer8j31VlHC+QUvmbgot5Plxqa6Xa!hls" },
    { id:8602,  name:"초일",              type:"hls", lat:37.53503, lng:127.18773, url:"https://gitsview.gg.go.kr/8602/gASVQxm5mxtfw8Hq2Wa3XATRxT2e6DXUO3WImPZwtuQFdonjyXqfgmqiCZbhYsr9!hls" },
  ],

  /* ── 3 · 출퇴근 시간대 병목 구간 (목적지 방면별) ── */
  [
    { grp:"하남 → 강동·잠실 (올림픽대로, 선동IC→잠실종합운동장)" },
    { id:2570,  name:"미사IC",             type:"hls", lat:37.57976, lng:127.18431, url:"https://gitsview.gg.go.kr/2570/cs+GC/HKAu46TjwVSNiyTaOgllbFkcMf/aHtydF3mZ5Xa5ZyHFNnPSL+f35vdu7n!hls" },
    { id:2154,  name:"강일_서울양양",       type:"hls", lat:37.57669, lng:127.17154, url:"https://gitsview.gg.go.kr/2154/NZ4xkcmwr0LbwFqmfXOM//r1UpfzKwjzcvIvu0Ytk24teQQQpQPRdtCiqz7SMv6e!hls" },
    { id:10,    name:"강일(가래여울IC 부근)", type:"hls", lat:37.57190, lng:127.16684, url:"https://gitsview.gg.go.kr/10/2u+rWOLnZPcDnHj+zB81LWqFKtIdbAG0lzbk+ohewmQwso//gPi94dDctdtYM3yd!hls" },
    { id:731,   name:"고덕근린공원 앞",      type:"hls", lat:37.56843, lng:127.15427, url:"https://gitsview.gg.go.kr/731/ALaHU6BpFNtdV9gfpRAT3mRRVTce9+9bgIFWQA2mBToTY+ZbL+JnBtLXpykJm7iz!hls" },
    { id:728,   name:"암사IC",             type:"hls", lat:37.55406, lng:127.12473, url:"https://gitsview.gg.go.kr/728/qNj63VxNAb0pYgVsE8khO8Z50rT5M80iXW3kUfZG7AuTxBDO180bWlfSrxZmQx6K!hls" },
    { id:6241,  name:"천호대교남단",         type:"hls", lat:37.54113, lng:127.11889, url:"https://gitsview.gg.go.kr/6241/wZNaLFtL/fGqAKWNVfFp9vx8qw0X393/tTgi7SNBzm/Lqbalfb/0CIvUFsdFbJpg!hls" },
    { id:726,   name:"올림픽대교~천호대교", type:"hls", lat:37.53642, lng:127.11245, url:"https://gitsview.gg.go.kr/726/bO2cYfMs9a0reVMBL9Yl5W6qZYsvtBiPMpfTJ94b9hq0smH751rCOf+gzNp8Zss7!hls" },
    { id:725,   name:"잠실철교~올림픽대교", type:"hls", lat:37.52657, lng:127.10553, url:"https://gitsview.gg.go.kr/725/a4ryF1dkcUY+6LJohKOhU/dqM8yXInigtf/pk10zsCPMXUOUvzHDw7JQ2Q9p0CQJ!hls" },
    { id:478,   name:"잠실대교~잠실철교", type:"hls", lat:37.52221, lng:127.09989, url:"https://gitsview.gg.go.kr/478/Ijuv04kNp4PW+U+ueNwHB9R+PGYYvPeBRkYVXx9iq1NghdbBJmSqkGBu7MOeJ8+W!hls" },

    { grp:"하남 → 판교·강남 (수도권제1순환 남행)" },
    { id:6056,  name:"상일IC",             type:"hls", lat:37.54897, lng:127.17920, url:"https://gitsview.gg.go.kr/6056/IvNSmaIk314NoLZy1EqzajK563uEzm/nNErCclPaxsSliGcMZl6nCo16SdHjTJA8!hls" },
    { id:8602,  name:"초일",              type:"hls", lat:37.53503, lng:127.18773, url:"https://gitsview.gg.go.kr/8602/gASVQxm5mxtfw8Hq2Wa3XATRxT2e6DXUO3WImPZwtuQFdonjyXqfgmqiCZbhYsr9!hls" },
    { id:8,     name:"하남JC",            type:"hls", lat:37.53250, lng:127.19361, url:"https://gitsview.gg.go.kr/8/WXtZxPwfkl1zJwxQyeEH5mwWlIYHricf9NaX5yReMq8352axVXaeYGScbodzaag8!hls" },
    { id:7,     name:"광암터널3",          type:"hls", lat:37.51917, lng:127.18667, url:"https://gitsview.gg.go.kr/7/+H/lDaIR69Y988G1AauBHDp+iiV2wcvaJELk/fytA2siSjTzI6hI1108DMxZFTvr!hls" },
    { id:6,     name:"광암터널2",          type:"hls", lat:37.51526, lng:127.17067, url:"https://gitsview.gg.go.kr/6/6c0lK3hZKzyL+zCkh51IPqyVDhHfdevjihJ4lmusS4ryhkkogwJxlVzRVvSNS+21!hls" },
    { id:5,     name:"서하남IC",           type:"hls", lat:37.51167, lng:127.14972, url:"https://gitsview.gg.go.kr/5/6u/drVvGl7RJf895yX58m9kTybfpytTp4pMnLdW40ZeNNTIRXLv7qCflAMnaVIqy!hls" },
    { id:3956,  name:"서하남",            type:"hls", lat:37.50645, lng:127.14557, url:"https://gitsview.gg.go.kr/3956/WMSNdwrpggsy+Nmpk5Vxc3rx9fmEnvPpMg+JkKT3cSlV44flgAG+wk4SkO5smdvq!hls" },
    { id:2359,  name:"위례",              type:"hls", lat:37.48177, lng:127.13536, url:"https://gitsview.gg.go.kr/2359/x63Dy0U7vFfUcfEYDWnpiG/fboNLUaeqJ/uZgE/MIpQ//2kdMqkdXOE1wFc38uEc!hls" },
    { id:4,     name:"송파IC",            type:"hls", lat:37.47500, lng:127.12944, url:"https://gitsview.gg.go.kr/4/v99uKfY/jNJUVX6tx7zVfgsap5nz02EX6NGyfcmTy8RM284vB0CziPPJtbAjrvTA!hls" },
    { id:3,     name:"성남요금소",          type:"hls", lat:37.43898, lng:127.12238, url:"https://gitsview.gg.go.kr/3/8TPhcaxUtzWXNuaqjnTAck4Zu1Su8NojSGYwRHahV5weettgL2bL+IVXIM4eyg36!hls" },
    { id:1,     name:"판교분기점",          type:"hls", lat:37.40665, lng:127.09706, url:"https://gitsview.gg.go.kr/1/Ku1bIRvz9bj2gKVLi6H/pxRX81SybpXJ6ZvacgoVx1WYge+a7alqG92eKgFX1DuY!hls" },
    { id:96,    name:"판교JC",             type:"hls", lat:37.40528, lng:127.09500, url:"https://gitsview.gg.go.kr/96/O8HyvfvufkTYYeQT9j2Pj5wDHomk9Vo+zBOK/RZOJf7+OXjFRoOknf6jo3SsLqYW!hls" },

    { grp:"구리 → 하남 (구리암사대교·순환 남행, 아침 유입)" },
    { id:6734,  name:"토평IC",             type:"hls", lat:37.58115, lng:127.15960, url:"https://gitsview.gg.go.kr/6734/GuIVVFt2Tht1AV93lji77HULKxdFFFBgEVNfzV3FlzNHRsR5WCEoguQlE4PAWTdN!hls" },
    { id:95294, name:"강동나들목",          type:"hls", lat:37.56715, lng:127.15422, url:"https://gitsview.gg.go.kr/95294/iOUGjj4wsQezVFi/1NnTGIns6451Ej0yOotlNsZcuXyVg/52IoC6Rut6qUJruC8L!hls" },
    { id:6055,  name:"강일IC",             type:"hls", lat:37.57384, lng:127.16519, url:"https://gitsview.gg.go.kr/6055/YDlpbv0EugJoO/ZM4yD9yOsF8qKnItMx/dqG6TnpEPDUsFjBfqbQwfId+qYqOsKi!hls" },

    { grp:"남양주 덕소·도농 → 하남 (미사대교·중앙선 축, 아침 유입)" },
    { id:71658, name:"남양주 덕소IC",       type:"hls", lat:37.58671, lng:127.20581, url:"https://gitsview.gg.go.kr/71658/ipmqFp2N7obeqADQUsvMWkwPUJhNsb/QD3v0Utlim2PPYy18cMnj2lM8AuN0fFQc!hls" },
    { id:2572,  name:"남양주TG",           type:"hls", lat:37.59792, lng:127.24243, url:"https://gitsview.gg.go.kr/2572/Emgh6zOjil5sykRK3FLEo0OPGqtLF+Irkl9O+DdRNvYOfR9i1+JHQY6zYpg9rHBo!hls" },
    { id:3176,  name:"미사대교종점",         type:"hls", lat:37.59021, lng:127.20398, url:"https://gitsview.gg.go.kr/3176/eU9OcwQ+rH1lMWx21kzD6YFnql6VyHiJFmS5AhLwGiG3a7+m6ZYbJqamO1BBoLiI!hls" },
  ],

  /* ── 4 · 진출입 핵심 나들목 병목 (선동교차로·황산사거리) ── */
  [
    { grp:"선동교차로 나들목" },
    { id:60657, name:"미사8단지 앞",        type:"vod", lat:37.57175, lng:127.18224, url:"https://gitsview.gg.go.kr/60657/mjGSNbnM1FkAJRofSTHGj2guxwLLclW6dlEHeGVLrs8qiKj5vPUarjNnmrY1b8up" },
    { id:60656, name:"미사푸르지오2차 앞(선동IC 진입)", type:"vod", lat:37.57602, lng:127.18090, url:"https://gitsview.gg.go.kr/60656/Q0QdQo91SJRBrCCUnJifajCzS36l+kdHT8wDapjudeYTxcqVg97PPkegyfl8WZnR" },
    { id:6764,  name:"선동교차로",          type:"vod", lat:37.57858, lng:127.17960, url:"https://gitsview.gg.go.kr/6764/uyOA4Zdpu91sAGd1mXcHVad7CQEIVM81F6OklmNLDI3pRU+awRshrUnnmEH94jlJ" },

    { grp:"황산사거리 나들목" },
    { id:60655, name:"황산사거리",          type:"vod", lat:37.54991, lng:127.18566, url:"https://gitsview.gg.go.kr/60655/zMrhYguquMVVOrMPen1dH9zUBrYKBP7Cn4+yjyCOGjklVzRXokbyK6OmgS25rxXG" },
    { id:60662, name:"진등교차로",          type:"vod", lat:37.55553, lng:127.19790, url:"https://gitsview.gg.go.kr/60662/TFI5/p6k885LGGyctIFqfuEou4UfS+/6WjFGhLqE2dpAGvtqlNMvT9XBia2+Hwza" },
    { id:6769,  name:"덕풍파출소앞사거리",  type:"vod", lat:37.54649, lng:127.19830, url:"https://gitsview.gg.go.kr/6769/2ZO0/1go67tiKDZfF03p2f9iM1CnnFjDXqNO5wAHatg01RwYrcYpini1/mqORyC3" },
    { id:6756,  name:"신장초교사거리",      type:"vod", lat:37.54170, lng:127.20700, url:"https://gitsview.gg.go.kr/6756/UMCTkkyE+GsOuT0kkuCaT126PAdaDe7+zTTpX/zXAmXaW7W+JtQhgGZ0wFWnGHnb" },
    { id:6056,  name:"상일IC",             type:"hls", lat:37.54897, lng:127.17920, url:"https://gitsview.gg.go.kr/6056/IvNSmaIk314NoLZy1EqzajK563uEzm/nNErCclPaxsSliGcMZl6nCo16SdHjTJA8!hls" },
  ],

  /* ── 5 · 남양주 현대아울렛 (스페이스원·다산, 주말 쇼핑) ── */
  [
    { id:11,    name:"토평",              type:"hls", lat:37.58299, lng:127.15716, url:"https://gitsview.gg.go.kr/11/liA4A1n3JZXJ/M0hvAtdgvmMY53tObXeLjK0OaEOrIcuV7aCH7n8vP9dJcNi+QmS!hls" },
    { id:6734,  name:"토평IC",            type:"hls", lat:37.58115, lng:127.15960, url:"https://gitsview.gg.go.kr/6734/GuIVVFt2Tht1AV93lji77HULKxdFFFBgEVNfzV3FlzNHRsR5WCEoguQlE4PAWTdN!hls" },
    { id:2362,  name:"구리영업소",          type:"hls", lat:37.59061, lng:127.15669, url:"https://gitsview.gg.go.kr/2362/AdrfNyGwYb18iKVhSXYMapUKj/CCs6V19NqiktKNrZcHlDFFruouUNiROeExz4Pw!hls" },
    { id:12,    name:"남양주IC",           type:"hls", lat:37.60191, lng:127.15306, url:"https://gitsview.gg.go.kr/12/4GJR5oaWkftMgbs9vkaYGPq0DY2HAP3v5hq6euISgDcMeEHkROcaIWIc0kXlAbUn!hls" },
    { id:9535,  name:"왕숙교입구",          type:"hls", lat:37.60362, lng:127.14653, url:"https://gitsview.gg.go.kr/9535/lWLe3l5rWWQAcvj2rMB53jwlS6NFquo70A/84VLDNxDFbiTq8dz4Kr9jBovLVGdW!hls" },
  ],

  /* ── 6 · 서울양양고속도로 (강일IC~미사대교~덕소IC, 주말 나들이) ── */
  [
    { id:6055,  name:"강일IC",             type:"hls", lat:37.57384, lng:127.16519, url:"https://gitsview.gg.go.kr/6055/YDlpbv0EugJoO/ZM4yD9yOsF8qKnItMx/dqG6TnpEPDUsFjBfqbQwfId+qYqOsKi!hls" },
    { id:2154,  name:"강일_서울양양",       type:"hls", lat:37.57669, lng:127.17154, url:"https://gitsview.gg.go.kr/2154/NZ4xkcmwr0LbwFqmfXOM//r1UpfzKwjzcvIvu0Ytk24teQQQpQPRdtCiqz7SMv6e!hls" },
    { id:2570,  name:"미사IC",             type:"hls", lat:37.57976, lng:127.18431, url:"https://gitsview.gg.go.kr/2570/cs+GC/HKAu46TjwVSNiyTaOgllbFkcMf/aHtydF3mZ5Xa5ZyHFNnPSL+f35vdu7n!hls" },
    { id:2569,  name:"미사대교",           type:"hls", lat:37.58372, lng:127.19414, url:"https://gitsview.gg.go.kr/2569/lmjMXtpLPduqQ1xWmDxRvszlZYR/U/9T3wrNsz9F6rqkw318rIa6HPj+NU4eH5kS!hls" },
    { id:3176,  name:"미사대교종점",         type:"hls", lat:37.59021, lng:127.20398, url:"https://gitsview.gg.go.kr/3176/eU9OcwQ+rH1lMWx21kzD6YFnql6VyHiJFmS5AhLwGiG3a7+m6ZYbJqamO1BBoLiI!hls" },
    { id:71658, name:"남양주 덕소IC",       type:"hls", lat:37.58671, lng:127.20581, url:"https://gitsview.gg.go.kr/71658/ipmqFp2N7obeqADQUsvMWkwPUJhNsb/QD3v0Utlim2PPYy18cMnj2lM8AuN0fFQc!hls" },
  ],

  /* ── 7 · 팔당대교 남단~조안 (국도 45호선·북한강 방면, 주말 나들이) ── */
  [
    { id:6765,  name:"팔당대교남단",         type:"vod", lat:37.54317, lng:127.23379, url:"https://gitsview.gg.go.kr/6765/AIqh/Qvx3UQLVeNgjIuoC1jpDL69rdlzNdbGSRJTWWSsRnGOdAac9+pGud9LKpC5" },
    { id:4405,  name:"팔당대교IC",          type:"hls", lat:37.54822, lng:127.24015, url:"https://gitsview.gg.go.kr/4405/Jq9LYm2TF/GFIPrbDQHBxXxWvCbeGCgARYwGjVFAfBK85qsJdKifaZr4HPgNMLyQ!hls" },
    { id:1220,  name:"팔당댐삼거리",         type:"hls", lat:37.54028, lng:127.25524, url:"https://gitsview.gg.go.kr/1220/JwQG0FO+d6PMpMbwDXnMIclp1SQ9EslZZ9TKbp2zqEEm0C/da2xDvcfXWSw5syDM!hls" },
    { id:4411,  name:"남양주 팔당1터널",     type:"hls", lat:37.54041, lng:127.25700, url:"https://gitsview.gg.go.kr/4411/dfjFPaAaYf9OMj+vnSbEjU61P5o6ioRdHsKkbIxrVwIM5ito9twZ6jilSOd44UbN!hls" },
    { id:5437,  name:"남양주 팔당4터널앞",   type:"hls", lat:37.53431, lng:127.26939, url:"https://gitsview.gg.go.kr/5437/ku8TSxJ4Dkx41rwckrCPXxdYAA5/gKcYyTiWb1b9NIcKUVc7OeTN8Wotwei78iWR!hls" },
    { id:79966, name:"남양주 봉안대교",       type:"hls", lat:37.53000, lng:127.28268, url:"https://gitsview.gg.go.kr/79966/NHPgUu5ch+8MSSlhV59r1Rm0g7m1UpUxJuXPa+cHDFIstymFR2QHIfcFlx/ypSLQ!hls" },
    { id:4410,  name:"조안IC",             type:"hls", lat:37.53292, lng:127.30282, url:"https://gitsview.gg.go.kr/4410/6SiWIbc3ik5QzLksIuaBloHOwESoy7pQ+d5/gBD5OGuxBXvRo124RmPJRJnitWo4!hls" },
  ],
];
