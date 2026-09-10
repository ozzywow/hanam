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
    { id:1277,  name:"팔당대교남단(팔당대교방면)", type:"hls", lat:37.54770, lng:127.22091, url:"https://gitsview.gg.go.kr/1277/7TYtkgdtQJrqMHohNAXt/Uo5FjetXgGNhJsgV7fjmOzuYf5QMyZXcixyizd+Iw95!hls" },
    { id:61065, name:"스타필드동측",          type:"vod", lat:37.54372, lng:127.22600, url:"https://gitsview.gg.go.kr/61065/GlPs2+VybjnubfVCDMAOvsd/ZA/GoGdEMGJ+N+r2yFR8QRolD09t886c8jZYZq71" },
    { id:61064, name:"덕풍6교 서측",          type:"vod", lat:37.54567, lng:127.21642, url:"https://gitsview.gg.go.kr/61064/Pr7VGuKQfzGlf0vKoRZolsXKv9i313BmHamauAclCpdx/4hExildjzYaScLgk5qq" },
    { id:6751,  name:"신풍로삼거리",          type:"vod", lat:37.55070, lng:127.21433, url:"https://gitsview.gg.go.kr/6751/+JIzaXpoiIizOr6pzta4Z8RKuaCrjSfZIuF8twjAT4UqcaRBdSsR/KwMdm88zKNy" },
    { id:6752,  name:"창우지하차도사거리",    type:"vod", lat:37.53854, lng:127.22930, url:"https://gitsview.gg.go.kr/6752/y9bpayy7X6uqn4PZnc++Pkkyr7biRQdBr7/bugiOCI59pm69Whwq9XMT42Ef8Ylo" },
  ],

  /* ── 1 · 미사·조정경기장 가는 길 ── */
  [
    { id:6750,  name:"조정경기장사거리",   type:"vod", lat:37.56012, lng:127.20350, url:"https://gitsview.gg.go.kr/6750//3Ik45+QpoCFU16monN1MawGrmayqV+okHU940sCrXCEnjgB71O0GF/N8wBj167I" },
    { id:6749,  name:"한강유역환경청사거리", type:"vod", lat:37.56895, lng:127.19700, url:"https://gitsview.gg.go.kr/6749/7gv1sFEIE14YFl6yhC+tUTpsOS+5h35AOxFfhVTXRaTNk8oy4mTqNZii3qvouDUl" },
    { id:60655, name:"황산사거리",         type:"vod", lat:37.54991, lng:127.18566, url:"https://gitsview.gg.go.kr/60655/zMrhYguquMVVOrMPen1dHwt5w/kbEYjH46SB/uk8eofzJf8DPeKg+vz3ozVLih6N" },
    { id:1275,  name:"미사IC 남단(하남)",  type:"hls", lat:37.57486, lng:127.19475, url:"https://gitsview.gg.go.kr/1275/NpJJ7TbyNATWEEKgv2q0hbrMnbstPid3kUI4aMhlhlgA6IZ+tLmb2C6LfMUpbjqs!hls" },
    { id:6748,  name:"미사교차로",         type:"vod", lat:37.57968, lng:127.19310, url:"https://gitsview.gg.go.kr/6748/jG0qy+/U3mAwN3ldEQgAN/EfsdOYafJcQEh5Vo8AMku/CNheQ23dl6D1wt2upxzE" },
    { id:2569,  name:"미사대교",           type:"hls", lat:37.58372, lng:127.19414, url:"https://gitsview.gg.go.kr/2569/lmjMXtpLPduqQ1xWmDxRvszlZYR/U/9T3wrNsz9F6rrfiWBeJaDFzo6VDwggxXD1!hls" },
  ],

  /* ── 2 · 하남 진출입 ── (현재 페이지 미표시: index.html 의 '하남 진출입' 섹션 제거됨.
     데이터는 보존 — 다시 넣으려면 <div class="player-mount" data-deck="2"> 섹션 복원) */
  [
    { grp:"중부고속 남쪽 → 하남IC 진입 (~2km)" },
    { id:21,    name:"하남IC",            type:"hls", lat:37.52801, lng:127.21858, url:"https://gitsview.gg.go.kr/21/w7RTp3kGK1raguzMaFpDQpj13HDlHBL4jFDW5pSIoPESFM+BZy/eAYva77HzQ+15!hls" },
    { id:6755,  name:"천현사거리",         type:"vod", lat:37.53561, lng:127.21490, url:"https://gitsview.gg.go.kr/6755/AH6/mgKXaEOE7DC/R0hDta3QOh7yJJK6vrCqkk/uvB6YroTwJCrv+RD77mamILS7" },
    { id:6757,  name:"신장사거리",         type:"vod", lat:37.53786, lng:127.20460, url:"https://gitsview.gg.go.kr/6757/unZWtGDQ5fp9xO692tSfsfcTKA0b7wvQ+mYTSVH9lZa3jRViSHIheDohXFyfiw0f" },
    { id:94794, name:"천현2",             type:"hls", lat:37.53169, lng:127.20598, url:"https://gitsview.gg.go.kr/94794/Jh+/MTatYqrC5nlcRKmpYRN2tpJnw2FtByV/7QiAKuwx5T+3phTlIMYUQPEAdI/B!hls" },
    { id:2708,  name:"천현삼거리",         type:"hls", lat:37.52521, lng:127.22042, url:"https://gitsview.gg.go.kr/2708/hgxwNXNzdwytHcBvfvomzRfgAo1n8aW4av69d1wGKVkCBo5F/TSIwX/JLxW7/Omx!hls" },

    { grp:"팔당대교 방면 (남양주·양평 → 강 건너)" },
    { id:4405,  name:"팔당대교IC",        type:"hls", lat:37.54822, lng:127.24015, url:"https://gitsview.gg.go.kr/4405/Jq9LYm2TF/GFIPrbDQHBxXxWvCbeGCgARYwGjVFAfBLi9qexHaaBgVHwe/hQh+7Y!hls" },
    { id:6765,  name:"팔당대교남단(하남측)", type:"vod", lat:37.54317, lng:127.23379, url:"https://gitsview.gg.go.kr/6765/AIqh/Qvx3UQLVeNgjIuoC7bkhaksZB7NOClzRSRQIUKmzI28pxlwYq/ADHw2flsD" },
    { id:71659, name:"남양주 하팔당삼거리", type:"hls", lat:37.55259, lng:127.23854, url:"https://gitsview.gg.go.kr/71659/NymrSSb4eNtUVEyKo77RfJrLLrqc1+iPkl0UcwtSo3Dg07QQleImuu529U4oWyqF!hls" },
    { id:71308, name:"한강시민공원(팔당)",  type:"hls", lat:37.55946, lng:127.23579, url:"https://gitsview.gg.go.kr/71308/9Snt7W/UQjAKzxaOnurpALz7bkMBxYPIy5Sxcfu39tQxGWSRJ7iO1njOyu2c681k!hls" },

    { grp:"고속도로 분기·요금소 (~3km)" },
    { id:8,     name:"하남JC",            type:"hls", lat:37.53250, lng:127.19361, url:"https://gitsview.gg.go.kr/8/WXtZxPwfkl1zJwxQyeEH5jf5j0pFRWTzh4+tu5bDteSer4FQgDqeeWMjuh8xdDbf!hls" },
    { id:20,    name:"동서울영업소",       type:"hls", lat:37.51773, lng:127.22149, url:"https://gitsview.gg.go.kr/20/ecTbaHuH3p1ETjlwqzqWfdvFNuOKThg/gW0EDe022swDrwdMQGOZYjrNku7HfHrX!hls" },
    { id:8602,  name:"초일",              type:"hls", lat:37.53503, lng:127.18773, url:"https://gitsview.gg.go.kr/8602/gASVQxm5mxtfw8Hq2Wa3XATRxT2e6DXUO3WImPZwtuSeCRdXLNFRs+tZCuEdfwjN!hls" },
  ],

  /* ── 3 · 출퇴근 시간대 병목 구간 (목적지 방면별) ── */
  [
    { grp:"하남 → 강동·잠실 (올림픽대로, 선동IC→잠실종합운동장)" },
    { id:2570,  name:"미사IC",             type:"hls", lat:37.57976, lng:127.18431, url:"https://gitsview.gg.go.kr/2570/cs+GC/HKAu46TjwVSNiyTaOgllbFkcMf/aHtydF3mZ5kVzK9Plg0+4uHWb2rWmK+!hls" },
    { id:2154,  name:"강일_서울양양",       type:"hls", lat:37.57669, lng:127.17154, url:"https://gitsview.gg.go.kr/2154/NZ4xkcmwr0LbwFqmfXOM//r1UpfzKwjzcvIvu0Ytk25BuXQMpIrJI9DACp4vYkuS!hls" },
    { id:10,    name:"강일(가래여울IC 부근)", type:"hls", lat:37.57190, lng:127.16684, url:"https://gitsview.gg.go.kr/10/2u+rWOLnZPcDnHj+zB81LX/qZ77lwRGsBrvGNbKUQH7CQfLBbZ0YIoGzCIqAJoG1!hls" },
    { id:731,   name:"고덕근린공원 앞",      type:"hls", lat:37.56843, lng:127.15427, url:"https://gitsview.gg.go.kr/731/ALaHU6BpFNtdV9gfpRAT3q3K5fA3rD0Bnyg+wrVdvZZf0vzuSHGAt7brHcHy0X3K!hls" },
    { id:728,   name:"암사IC",             type:"hls", lat:37.55406, lng:127.12473, url:"https://gitsview.gg.go.kr/728/qNj63VxNAb0pYgVsE8khOwyMOZJAEsJcOf3bfwyiNE7jKnsX654av1HBDtzdhYm7!hls" },
    { id:6241,  name:"천호대교남단",         type:"hls", lat:37.54113, lng:127.11889, url:"https://gitsview.gg.go.kr/6241/wZNaLFtL/fGqAKWNVfFp9vx8qw0X393/tTgi7SNBzm8M4B07pzV69oSEkodu4VKR!hls" },
    { id:726,   name:"올림픽대교~천호대교", type:"hls", lat:37.53642, lng:127.11245, url:"https://gitsview.gg.go.kr/726/bO2cYfMs9a0reVMBL9Yl5QdrLJWEUFu/+pg5n3bOndr+aP4vNkgxdijfW0at1uwQ!hls" },
    { id:725,   name:"잠실철교~올림픽대교", type:"hls", lat:37.52657, lng:127.10553, url:"https://gitsview.gg.go.kr/725/a4ryF1dkcUY+6LJohKOhU4nb5Aj9NnRfSQV4NZVYUGRW3xITw5cGeMkRYao6pnKA!hls" },
    { id:478,   name:"잠실대교~잠실철교", type:"hls", lat:37.52221, lng:127.09989, url:"https://gitsview.gg.go.kr/478/Ijuv04kNp4PW+U+ueNwHBz4TGcn19idwCSGrxOxR/9FSRaXpngO8O+ubIhe5egHV!hls" },

    { grp:"하남 → 판교·강남 (수도권제1순환 남행)" },
    { id:6056,  name:"상일IC",             type:"hls", lat:37.54897, lng:127.17920, url:"https://gitsview.gg.go.kr/6056/IvNSmaIk314NoLZy1EqzajK563uEzm/nNErCclPaxsTE1URcKKVEemkxaC78OXf7!hls" },
    { id:8602,  name:"초일",              type:"hls", lat:37.53503, lng:127.18773, url:"https://gitsview.gg.go.kr/8602/gASVQxm5mxtfw8Hq2Wa3XATRxT2e6DXUO3WImPZwtuSeCRdXLNFRs+tZCuEdfwjN!hls" },
    { id:8,     name:"하남JC",            type:"hls", lat:37.53250, lng:127.19361, url:"https://gitsview.gg.go.kr/8/WXtZxPwfkl1zJwxQyeEH5jf5j0pFRWTzh4+tu5bDteSer4FQgDqeeWMjuh8xdDbf!hls" },
    { id:7,     name:"광암터널3",          type:"hls", lat:37.51917, lng:127.18667, url:"https://gitsview.gg.go.kr/7/+H/lDaIR69Y988G1AauBHKZFvCc6TtlhpMQBeD+kdatj7Fi+FeXc/OwU/UK2uIZW!hls" },
    { id:6,     name:"광암터널2",          type:"hls", lat:37.51526, lng:127.17067, url:"https://gitsview.gg.go.kr/6/6c0lK3hZKzyL+zCkh51IPskz/KqAXUM39Dos5jPMdPkp6J7AkpzNGc3J22qD2aRa!hls" },
    { id:5,     name:"서하남IC",           type:"hls", lat:37.51167, lng:127.14972, url:"https://gitsview.gg.go.kr/5/6u/drVvGl7RJf895yX58m3MhR3PSsI60RvZY8Z/1X8E9PpRh++I2JzC0Eyfb6BE5!hls" },
    { id:3956,  name:"서하남",            type:"hls", lat:37.50645, lng:127.14557, url:"https://gitsview.gg.go.kr/3956/WMSNdwrpggsy+Nmpk5Vxc3rx9fmEnvPpMg+JkKT3cSmUs6csfH5YA2+DMyo1DA69!hls" },
    { id:2359,  name:"위례",              type:"hls", lat:37.48177, lng:127.13536, url:"https://gitsview.gg.go.kr/2359/x63Dy0U7vFfUcfEYDWnpiG/fboNLUaeqJ/uZgE/MIpQrTPoVhUZgf0j74TZze0ww!hls" },
    { id:4,     name:"송파IC",            type:"hls", lat:37.47500, lng:127.12944, url:"https://gitsview.gg.go.kr/4/v99uKfY/jNJUVX6tx7zVfoY71hzSO83Ejhydxr4xcfnF1xFmoNaeyNUFkbyv2YRz!hls" },
    { id:3,     name:"성남요금소",          type:"hls", lat:37.43898, lng:127.12238, url:"https://gitsview.gg.go.kr/3/8TPhcaxUtzWXNuaqjnTAcvm8VhyMXAsihEKa/MK6fq0c+yubtdjaIPajCwNUoXfh!hls" },
    { id:1,     name:"판교분기점",          type:"hls", lat:37.40665, lng:127.09706, url:"https://gitsview.gg.go.kr/1/Ku1bIRvz9bj2gKVLi6H/p6JMeiHt5PojSTnhtgRgUD7M69UJzsQ9+IgNialoI0Xi!hls" },
    { id:96,    name:"판교JC",             type:"hls", lat:37.40528, lng:127.09500, url:"https://gitsview.gg.go.kr/96/O8HyvfvufkTYYeQT9j2Pj8o/sDMEQ7s1/3qlPJLF0GOgIIJ7/Exg5JjKBobN+h0F!hls" },

    { grp:"구리 → 하남 (구리암사대교·순환 남행, 아침 유입)" },
    { id:6734,  name:"토평IC",             type:"hls", lat:37.58115, lng:127.15960, url:"https://gitsview.gg.go.kr/6734/GuIVVFt2Tht1AV93lji77HULKxdFFFBgEVNfzV3FlzN34iR6nppUu8wi57s47kvL!hls" },
    { id:95294, name:"강동나들목",          type:"hls", lat:37.56715, lng:127.15422, url:"https://gitsview.gg.go.kr/95294/iOUGjj4wsQezVFi/1NnTGIns6451Ej0yOotlNsZcuXyXRr260KwhVFCiimFsUjvv!hls" },
    { id:6055,  name:"강일IC",             type:"hls", lat:37.57384, lng:127.16519, url:"https://gitsview.gg.go.kr/6055/YDlpbv0EugJoO/ZM4yD9yOsF8qKnItMx/dqG6TnpEPA3R1Jin6Q8PRQs7vpiq8Im!hls" },

    { grp:"남양주 덕소·도농 → 하남 (미사대교·중앙선 축, 아침 유입)" },
    { id:71658, name:"남양주 덕소IC",       type:"hls", lat:37.58671, lng:127.20581, url:"https://gitsview.gg.go.kr/71658/ipmqFp2N7obeqADQUsvMWkwPUJhNsb/QD3v0Utlim2POu2fKwE+r3UuS9SBWICEA!hls" },
    { id:2572,  name:"남양주TG",           type:"hls", lat:37.59792, lng:127.24243, url:"https://gitsview.gg.go.kr/2572/Emgh6zOjil5sykRK3FLEo0OPGqtLF+Irkl9O+DdRNvbggbO9dMZ5eZOOjenlBIdD!hls" },
    { id:3176,  name:"미사대교종점",         type:"hls", lat:37.59021, lng:127.20398, url:"https://gitsview.gg.go.kr/3176/eU9OcwQ+rH1lMWx21kzD6YFnql6VyHiJFmS5AhLwGiGMjDY62OlO+VlrK+Lg6WV3!hls" },
  ],

  /* ── 4 · 진출입 핵심 나들목 병목 (선동교차로·황산사거리) ── */
  [
    { grp:"선동교차로 나들목" },
    { id:60657, name:"미사8단지 앞",        type:"vod", lat:37.57175, lng:127.18224, url:"https://gitsview.gg.go.kr/60657/mjGSNbnM1FkAJRofSTHGj7g0VLf+ZdRITvSnjScXrGNPo1V6frZvY1ywsV4j4we3" },
    { id:60656, name:"미사푸르지오2차 앞(선동IC 진입)", type:"vod", lat:37.57602, lng:127.18090, url:"https://gitsview.gg.go.kr/60656/Q0QdQo91SJRBrCCUnJifaqOHlQmaLLK4m54GUdDQgsFCynmJDXDBWOh1z+JmC48T" },
    { id:6764,  name:"선동교차로",          type:"vod", lat:37.57858, lng:127.17960, url:"https://gitsview.gg.go.kr/6764/uyOA4Zdpu91sAGd1mXcHVabty4CWKPRN1NDhp2J2nj0JiS20XdEhHH6wltu0ZX9S" },

    { grp:"황산사거리 나들목" },
    { id:60655, name:"황산사거리",          type:"vod", lat:37.54991, lng:127.18566, url:"https://gitsview.gg.go.kr/60655/zMrhYguquMVVOrMPen1dHwt5w/kbEYjH46SB/uk8eofzJf8DPeKg+vz3ozVLih6N" },
    { id:60662, name:"진등교차로",          type:"vod", lat:37.55553, lng:127.19790, url:"https://gitsview.gg.go.kr/60662/TFI5/p6k885LGGyctIFqfvTzNDoKAlzIqurkfF9xB3OjEPx1SsZt4UXuuwkDvCII" },
    { id:6769,  name:"덕풍파출소앞사거리",  type:"vod", lat:37.54649, lng:127.19830, url:"https://gitsview.gg.go.kr/6769/2ZO0/1go67tiKDZfF03p2cE7MUH59J2w43r8UfCLzY9yarLLi+9dXWcnTe0VgE15" },
    { id:6756,  name:"신장초교사거리",      type:"vod", lat:37.54170, lng:127.20700, url:"https://gitsview.gg.go.kr/6756/UMCTkkyE+GsOuT0kkuCaT9mNWCQ74gUl/CMu9q+KIlFBepsG5DEH0lNNyulgp8Pi" },
    { id:6056,  name:"상일IC",             type:"hls", lat:37.54897, lng:127.17920, url:"https://gitsview.gg.go.kr/6056/IvNSmaIk314NoLZy1EqzajK563uEzm/nNErCclPaxsTE1URcKKVEemkxaC78OXf7!hls" },
  ],

  /* ── 5 · 남양주 현대아울렛 (스페이스원·다산, 주말 쇼핑) ── */
  [
    { id:11,    name:"토평",              type:"hls", lat:37.58299, lng:127.15716, url:"https://gitsview.gg.go.kr/11/liA4A1n3JZXJ/M0hvAtdgolN6zhQkkIE3ERaCRbWYQ5F3NZYr9Fb/vHQZlUD4d64!hls" },
    { id:6734,  name:"토평IC",            type:"hls", lat:37.58115, lng:127.15960, url:"https://gitsview.gg.go.kr/6734/GuIVVFt2Tht1AV93lji77HULKxdFFFBgEVNfzV3FlzN34iR6nppUu8wi57s47kvL!hls" },
    { id:2362,  name:"구리영업소",          type:"hls", lat:37.59061, lng:127.15669, url:"https://gitsview.gg.go.kr/2362/AdrfNyGwYb18iKVhSXYMapUKj/CCs6V19NqiktKNrZcX8CpmjbjDOnwVmnF9AFXO!hls" },
    { id:12,    name:"남양주IC",           type:"hls", lat:37.60191, lng:127.15306, url:"https://gitsview.gg.go.kr/12/4GJR5oaWkftMgbs9vkaYGPJ0i78BVVppg0bNh9nkgTIEtiAhkybOZY2nJoH/vf1V!hls" },
    { id:9535,  name:"왕숙교입구",          type:"hls", lat:37.60362, lng:127.14653, url:"https://gitsview.gg.go.kr/9535/lWLe3l5rWWQAcvj2rMB53jwlS6NFquo70A/84VLDNxAkjApKJPR24rxFj3H/O6Vm!hls" },
  ],

  /* ── 6 · 서울양양고속도로 (강일IC~미사대교~덕소IC, 주말 나들이) ── */
  [
    { id:6055,  name:"강일IC",             type:"hls", lat:37.57384, lng:127.16519, url:"https://gitsview.gg.go.kr/6055/YDlpbv0EugJoO/ZM4yD9yOsF8qKnItMx/dqG6TnpEPA3R1Jin6Q8PRQs7vpiq8Im!hls" },
    { id:2154,  name:"강일_서울양양",       type:"hls", lat:37.57669, lng:127.17154, url:"https://gitsview.gg.go.kr/2154/NZ4xkcmwr0LbwFqmfXOM//r1UpfzKwjzcvIvu0Ytk25BuXQMpIrJI9DACp4vYkuS!hls" },
    { id:2570,  name:"미사IC",             type:"hls", lat:37.57976, lng:127.18431, url:"https://gitsview.gg.go.kr/2570/cs+GC/HKAu46TjwVSNiyTaOgllbFkcMf/aHtydF3mZ5kVzK9Plg0+4uHWb2rWmK+!hls" },
    { id:2569,  name:"미사대교",           type:"hls", lat:37.58372, lng:127.19414, url:"https://gitsview.gg.go.kr/2569/lmjMXtpLPduqQ1xWmDxRvszlZYR/U/9T3wrNsz9F6rrfiWBeJaDFzo6VDwggxXD1!hls" },
    { id:3176,  name:"미사대교종점",         type:"hls", lat:37.59021, lng:127.20398, url:"https://gitsview.gg.go.kr/3176/eU9OcwQ+rH1lMWx21kzD6YFnql6VyHiJFmS5AhLwGiGMjDY62OlO+VlrK+Lg6WV3!hls" },
    { id:71658, name:"남양주 덕소IC",       type:"hls", lat:37.58671, lng:127.20581, url:"https://gitsview.gg.go.kr/71658/ipmqFp2N7obeqADQUsvMWkwPUJhNsb/QD3v0Utlim2POu2fKwE+r3UuS9SBWICEA!hls" },
  ],

  /* ── 7 · 팔당대교 남단~조안 (국도 45호선·북한강 방면, 주말 나들이) ── */
  [
    { id:6765,  name:"팔당대교남단",         type:"vod", lat:37.54317, lng:127.23379, url:"https://gitsview.gg.go.kr/6765/AIqh/Qvx3UQLVeNgjIuoC7bkhaksZB7NOClzRSRQIUKmzI28pxlwYq/ADHw2flsD" },
    { id:4405,  name:"팔당대교IC",          type:"hls", lat:37.54822, lng:127.24015, url:"https://gitsview.gg.go.kr/4405/Jq9LYm2TF/GFIPrbDQHBxXxWvCbeGCgARYwGjVFAfBLi9qexHaaBgVHwe/hQh+7Y!hls" },
    { id:1220,  name:"팔당댐삼거리",         type:"hls", lat:37.54028, lng:127.25524, url:"https://gitsview.gg.go.kr/1220/JwQG0FO+d6PMpMbwDXnMIclp1SQ9EslZZ9TKbp2zqEF+i/W7zcEH9cGFMDw/NXTf!hls" },
    { id:4411,  name:"남양주 팔당1터널",     type:"hls", lat:37.54041, lng:127.25700, url:"https://gitsview.gg.go.kr/4411/dfjFPaAaYf9OMj+vnSbEjU61P5o6ioRdHsKkbIxrVwI/UIfJYVKF0+daiAZOuDHF!hls" },
    { id:5437,  name:"남양주 팔당4터널앞",   type:"hls", lat:37.53431, lng:127.26939, url:"https://gitsview.gg.go.kr/5437/ku8TSxJ4Dkx41rwckrCPXxdYAA5/gKcYyTiWb1b9NIePsuJX4SztOJjk3aYOvY82!hls" },
    { id:79966, name:"남양주 봉안대교",       type:"hls", lat:37.53000, lng:127.28268, url:"https://gitsview.gg.go.kr/79966/NHPgUu5ch+8MSSlhV59r1Rm0g7m1UpUxJuXPa+cHDFIITWoPPadIyO9oXX5NY0TT!hls" },
    { id:4410,  name:"조안IC",             type:"hls", lat:37.53292, lng:127.30282, url:"https://gitsview.gg.go.kr/4410/6SiWIbc3ik5QzLksIuaBloHOwESoy7pQ+d5/gBD5OGslRK9Ftgly1uo8olqfsdgj!hls" },
  ],
];
