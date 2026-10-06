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
    { id:1277,  name:"팔당대교남단(팔당대교방면)", type:"hls", lat:37.54770, lng:127.22091, url:"https://gitsview.gg.go.kr/1277/7TYtkgdtQJrqMHohNAXt/TFhr4JHI6h1Uz78Ty6OjogVS+6ZSQzajduIJFacEasa!hls" },
    { id:61065, name:"스타필드동측",          type:"vod", lat:37.54372, lng:127.22600, url:"https://gitsview.gg.go.kr/61065/GlPs2+VybjnubfVCDMAOvitaw3MoA8AXA3WZ6g/tVvTZBmKzO9pnDJ1V9wbR9AMo" },
    { id:61064, name:"덕풍6교 서측",          type:"vod", lat:37.54567, lng:127.21642, url:"https://gitsview.gg.go.kr/61064/Pr7VGuKQfzGlf0vKoRZolkjVfacnIP5jUxWRexsavev0A89LxIhnZb8Dz0EEG5Be" },
    { id:6751,  name:"신풍로삼거리",          type:"vod", lat:37.55070, lng:127.21433, url:"https://gitsview.gg.go.kr/6751/+JIzaXpoiIizOr6pzta4Z5zN9enMBtui2LY81B4oa+4xJaoqMYd/ytRi8vGFVxND" },
    { id:6752,  name:"창우지하차도사거리",    type:"vod", lat:37.53854, lng:127.22930, url:"https://gitsview.gg.go.kr/6752/y9bpayy7X6uqn4PZnc++PnaO0HvQgWoDa6oW1umxOl4eN8JgmU6i1xaqe/Qc8KsP" },
  ],

  /* ── 1 · 미사·조정경기장 가는 길 ── */
  [
    { id:6750,  name:"조정경기장사거리",   type:"vod", lat:37.56012, lng:127.20350, url:"https://gitsview.gg.go.kr/6750//3Ik45+QpoCFU16monN1MeNBtU/c7Ge+oTWS7PSrEiYM/DTjkgqoWsf+UmMGGzVR" },
    { id:6749,  name:"한강유역환경청사거리", type:"vod", lat:37.56895, lng:127.19700, url:"https://gitsview.gg.go.kr/6749/7gv1sFEIE14YFl6yhC+tUeOfmFu0vFdTLdsWjGEMhu18uyhtIC+C0p/CCIe9TzXv" },
    { id:60655, name:"황산사거리",         type:"vod", lat:37.54991, lng:127.18566, url:"https://gitsview.gg.go.kr/60655/zMrhYguquMVVOrMPen1dH7VcVDYOQMxO3pFe6Jc67m5V6gqVNAy/mdmCTtFBoT7c" },
    { id:1275,  name:"미사IC 남단(하남)",  type:"hls", lat:37.57486, lng:127.19475, url:"https://gitsview.gg.go.kr/1275/NpJJ7TbyNATWEEKgv2q0hU1gtC/N6iyTMME7XwBggFQjaeDZ7B8DdTekgFSAz8X1!hls" },
    { id:6748,  name:"미사교차로",         type:"vod", lat:37.57968, lng:127.19310, url:"https://gitsview.gg.go.kr/6748/jG0qy+/U3mAwN3ldEQgAN4O+skDHTm0EVvFSZXf/hA2IkDvynqP6D+WPG772Nzsi" },
    { id:2569,  name:"미사대교",           type:"hls", lat:37.58372, lng:127.19414, url:"https://gitsview.gg.go.kr/2569/lmjMXtpLPduqQ1xWmDxRvu/vY4AqfweKsoFIDoJWz8dsK6j/FmAvvzI8vdzk/SMb!hls" },
  ],

  /* ── 2 · 하남 진출입 ── (현재 페이지 미표시: index.html 의 '하남 진출입' 섹션 제거됨.
     데이터는 보존 — 다시 넣으려면 <div class="player-mount" data-deck="2"> 섹션 복원) */
  [
    { grp:"중부고속 남쪽 → 하남IC 진입 (~2km)" },
    { id:21,    name:"하남IC",            type:"hls", lat:37.52801, lng:127.21858, url:"https://gitsview.gg.go.kr/21/w7RTp3kGK1raguzMaFpDQh406U437bnVhxIBSGvugqCYm9n9GlyWUT2wtZirxHgM!hls" },
    { id:6755,  name:"천현사거리",         type:"vod", lat:37.53561, lng:127.21490, url:"https://gitsview.gg.go.kr/6755/AH6/mgKXaEOE7DC/R0hDtc0HhhRGYLahvsb34ZA6+cN0JG/2d4ddiSzgYE917AWC" },
    { id:6757,  name:"신장사거리",         type:"vod", lat:37.53786, lng:127.20460, url:"https://gitsview.gg.go.kr/6757/unZWtGDQ5fp9xO692tSfsSubYz4S9OqKVsi/V6glBpiF4UYbSy3QaLl8Telz6Z73" },
    { id:94794, name:"천현2",             type:"hls", lat:37.53169, lng:127.20598, url:"https://gitsview.gg.go.kr/94794/Jh+/MTatYqrC5nlcRKmpYQcfsHShYK1p/gX50nYxbgfaOdKElDWEBrZS19NUSXtC!hls" },
    { id:2708,  name:"천현삼거리",         type:"hls", lat:37.52521, lng:127.22042, url:"https://gitsview.gg.go.kr/2708/hgxwNXNzdwytHcBvfvomzTf+5Sl4Bzmb/j0KpfLOn6ZiuwBEUzU7PqvXSGfQ+V+z!hls" },

    { grp:"팔당대교 방면 (남양주·양평 → 강 건너)" },
    { id:4405,  name:"팔당대교IC",        type:"hls", lat:37.54822, lng:127.24015, url:"https://gitsview.gg.go.kr/4405/Jq9LYm2TF/GFIPrbDQHBxcEplC2ZnrOyY2olb0qE18I55V3lAnMBNLqyFBGGRcYh!hls" },
    { id:6765,  name:"팔당대교남단(하남측)", type:"vod", lat:37.54317, lng:127.23379, url:"https://gitsview.gg.go.kr/6765/AIqh/Qvx3UQLVeNgjIuoC3+8etZs3YXV9UNbKYXm+0vFNGoIrdtNNf88bGm8Oniw" },
    { id:71659, name:"남양주 하팔당삼거리", type:"hls", lat:37.55259, lng:127.23854, url:"https://gitsview.gg.go.kr/71659/NymrSSb4eNtUVEyKo77RfCbvL5DC4XyOiFLzQkJ63JF0Xo2SiSSOMPHystEdtxxq!hls" },
    { id:71308, name:"한강시민공원(팔당)",  type:"hls", lat:37.55946, lng:127.23579, url:"https://gitsview.gg.go.kr/71308/9Snt7W/UQjAKzxaOnurpAGZzrRhOWTX1o4PduKOgVj1xO/LQESIvmyPnHMXSwzyn!hls" },

    { grp:"고속도로 분기·요금소 (~3km)" },
    { id:8,     name:"하남JC",            type:"hls", lat:37.53250, lng:127.19361, url:"https://gitsview.gg.go.kr/8/WXtZxPwfkl1zJwxQyeEH5n6XFKyuDnoEbt7REsph+WeczDM2QgZ+SrRQB8n967Zj!hls" },
    { id:20,    name:"동서울영업소",       type:"hls", lat:37.51773, lng:127.22149, url:"https://gitsview.gg.go.kr/20/ecTbaHuH3p1ETjlwqzqWfRtjW6JSyYEPWkBKtb4Z7yy/B78+mkr/1VK9ZKF9KZ/e!hls" },
    { id:8602,  name:"초일",              type:"hls", lat:37.53503, lng:127.18773, url:"https://gitsview.gg.go.kr/8602/gASVQxm5mxtfw8Hq2Wa3XGZYMUxmrVqfG2FbQtKh3m1FBLoFOq1ISbaaZQ7AEv+y!hls" },
  ],

  /* ── 3 · 출퇴근 시간대 병목 구간 (목적지 방면별) ── */
  [
    { grp:"하남 → 강동·잠실 (올림픽대로, 선동IC→잠실종합운동장)" },
    { id:2570,  name:"미사IC",             type:"hls", lat:37.57976, lng:127.18431, url:"https://gitsview.gg.go.kr/2570/cs+GC/HKAu46TjwVSNiyTRzMqMpBh7vNqX9b/2Ms9WxshYo10xQtXkVliTnAiFsA!hls" },
    { id:2154,  name:"강일_서울양양",       type:"hls", lat:37.57669, lng:127.17154, url:"https://gitsview.gg.go.kr/2154/NZ4xkcmwr0LbwFqmfXOM/w4DGU7dgnVPjkx+hDShCP6laH1HIRKNiNB3ZZMgJTTM!hls" },
    { id:10,    name:"강일(가래여울IC 부근)", type:"hls", lat:37.57190, lng:127.16684, url:"https://gitsview.gg.go.kr/10/2u+rWOLnZPcDnHj+zB81LbNdoBIAo30FohOFda3q+QgRtx+BbG5A92t2I9Cm0kOg!hls" },
    { id:731,   name:"고덕근린공원 앞",      type:"hls", lat:37.56843, lng:127.15427, url:"https://gitsview.gg.go.kr/731/ALaHU6BpFNtdV9gfpRAT3qNqh3BNhIJmHaC/0aeZLsp954oKgU8QH29UNz85h4Co!hls" },
    { id:728,   name:"암사IC",             type:"hls", lat:37.55406, lng:127.12473, url:"https://gitsview.gg.go.kr/728/qNj63VxNAb0pYgVsE8khO6AIgBURGDh1sWUe8Qg2jH82f3f4P+Ov+lxx49zOXQbX!hls" },
    { id:6241,  name:"천호대교남단",         type:"hls", lat:37.54113, lng:127.11889, url:"https://gitsview.gg.go.kr/6241/wZNaLFtL/fGqAKWNVfFp9jFWDWgXAtXBNnEY5Z9dfFMBANxdmtaeiqKslP7gAhYh!hls" },
    { id:726,   name:"올림픽대교~천호대교", type:"hls", lat:37.53642, lng:127.11245, url:"https://gitsview.gg.go.kr/726/bO2cYfMs9a0reVMBL9Yl5XNASABXihSMIpyaaJzBn5TL2FZwIzzHYiW4Ba5VIVWt!hls" },
    { id:725,   name:"잠실철교~올림픽대교", type:"hls", lat:37.52657, lng:127.10553, url:"https://gitsview.gg.go.kr/725/a4ryF1dkcUY+6LJohKOhUx7q3f7lNEoN/42/9yY8LhJueoAUoyITq6jqpJ1yoFdx!hls" },
    { id:478,   name:"잠실대교~잠실철교", type:"hls", lat:37.52221, lng:127.09989, url:"https://gitsview.gg.go.kr/478/Ijuv04kNp4PW+U+ueNwHBxECKoprHXhmevH5KY9UEGutgahp8y5aFbpj+KiI7dht!hls" },

    { grp:"하남 → 판교·강남 (수도권제1순환 남행)" },
    { id:6056,  name:"상일IC",             type:"hls", lat:37.54897, lng:127.17920, url:"https://gitsview.gg.go.kr/6056/IvNSmaIk314NoLZy1EqzajNy5L6ZXn8Ev9hHHArZE7/UngZtUXgCSAooB9y7hX6X!hls" },
    { id:8602,  name:"초일",              type:"hls", lat:37.53503, lng:127.18773, url:"https://gitsview.gg.go.kr/8602/gASVQxm5mxtfw8Hq2Wa3XGZYMUxmrVqfG2FbQtKh3m1FBLoFOq1ISbaaZQ7AEv+y!hls" },
    { id:8,     name:"하남JC",            type:"hls", lat:37.53250, lng:127.19361, url:"https://gitsview.gg.go.kr/8/WXtZxPwfkl1zJwxQyeEH5n6XFKyuDnoEbt7REsph+WeczDM2QgZ+SrRQB8n967Zj!hls" },
    { id:7,     name:"광암터널3",          type:"hls", lat:37.51917, lng:127.18667, url:"https://gitsview.gg.go.kr/7/+H/lDaIR69Y988G1AauBHJ54te1Iu1EX/xCl9edNys1DMNf1sG5HgMZPr9s0lonT!hls" },
    { id:6,     name:"광암터널2",          type:"hls", lat:37.51526, lng:127.17067, url:"https://gitsview.gg.go.kr/6/6c0lK3hZKzyL+zCkh51IPm7fjdgNLgshHpZXF7pu7JiY7Lsoai8NZznBugfWpcm5!hls" },
    { id:5,     name:"서하남IC",           type:"hls", lat:37.51167, lng:127.14972, url:"https://gitsview.gg.go.kr/5/6u/drVvGl7RJf895yX58m2FRukHAq7RA0Gczl3yE0yaefHekPTC/+5egx3M3RLTE!hls" },
    { id:3956,  name:"서하남",            type:"hls", lat:37.50645, lng:127.14557, url:"https://gitsview.gg.go.kr/3956/WMSNdwrpggsy+Nmpk5Vxc4CZ1Cw3Yv3L5V1E/v/8Iw1vTPo35iS0SPxvQWC+5skv!hls" },
    { id:2359,  name:"위례",              type:"hls", lat:37.48177, lng:127.13536, url:"https://gitsview.gg.go.kr/2359/x63Dy0U7vFfUcfEYDWnpiF3AgRTRuCsYKjXs8xkmVYuQ8DywqXo8qK2mClpKIY/2!hls" },
    { id:4,     name:"송파IC",            type:"hls", lat:37.47500, lng:127.12944, url:"https://gitsview.gg.go.kr/4/v99uKfY/jNJUVX6tx7zVfrYa36CaUJ+4yg8zyA2w5J2syDj0O7V6gVFaM7rv2HaY!hls" },
    { id:3,     name:"성남요금소",          type:"hls", lat:37.43898, lng:127.12238, url:"https://gitsview.gg.go.kr/3/8TPhcaxUtzWXNuaqjnTAcgr/2yGeBBljN4nUJypyjmlDCC4a3y/j5TcbCPiXb5i8!hls" },
    { id:1,     name:"판교분기점",          type:"hls", lat:37.40665, lng:127.09706, url:"https://gitsview.gg.go.kr/1/Ku1bIRvz9bj2gKVLi6H/p4nDw+EXx1zJrUh3oVoNQQtLCW+cx3j96fAifbkto9/5!hls" },
    { id:96,    name:"판교JC",             type:"hls", lat:37.40528, lng:127.09500, url:"https://gitsview.gg.go.kr/96/O8HyvfvufkTYYeQT9j2PjzAB4gk/k6w3L2yUhD9DJKXJqre6c22B+E2ucwgFzAsH!hls" },

    { grp:"구리 → 하남 (구리암사대교·순환 남행, 아침 유입)" },
    { id:6734,  name:"토평IC",             type:"hls", lat:37.58115, lng:127.15960, url:"https://gitsview.gg.go.kr/6734/GuIVVFt2Tht1AV93lji77BHL0REeZIMT/Qv8JR0LPsdKp1FA+0JA0WI5SAXjzDOx!hls" },
    { id:95294, name:"강동나들목",          type:"hls", lat:37.56715, lng:127.15422, url:"https://gitsview.gg.go.kr/95294/iOUGjj4wsQezVFi/1NnTGGV/MwcpUpgyaBkRuYS7kbxJ5Jjtz+Bn1MBm78OjaWDj!hls" },
    { id:6055,  name:"강일IC",             type:"hls", lat:37.57384, lng:127.16519, url:"https://gitsview.gg.go.kr/6055/YDlpbv0EugJoO/ZM4yD9yDT0jsAkuP3g0bQPXw4xukcxuv7DVm7d/StcdDF//tdi!hls" },

    { grp:"남양주 덕소·도농 → 하남 (미사대교·중앙선 축, 아침 유입)" },
    { id:71658, name:"남양주 덕소IC",       type:"hls", lat:37.58671, lng:127.20581, url:"https://gitsview.gg.go.kr/71658/ipmqFp2N7obeqADQUsvMWpuaL+6Lgb/TNaZUumvpy7zjq5kB1BcAAQaT2rRJitpC!hls" },
    { id:2572,  name:"남양주TG",           type:"hls", lat:37.59792, lng:127.24243, url:"https://gitsview.gg.go.kr/2572/Emgh6zOjil5sykRK3FLEo4I19o+smTxGr4iFqrW4YbvgrhxaUYWymXwaSo4R5Qy1!hls" },
    { id:3176,  name:"미사대교종점",         type:"hls", lat:37.59021, lng:127.20398, url:"https://gitsview.gg.go.kr/3176/eU9OcwQ+rH1lMWx21kzD6V0ey9e6FQYj4mpQcdz+GRJq2r37/Wftvja7maKn7+f0!hls" },
  ],

  /* ── 4 · 진출입 핵심 나들목 병목 (선동교차로·황산사거리) ── */
  [
    { grp:"선동교차로 나들목" },
    { id:60657, name:"미사8단지 앞",        type:"vod", lat:37.57175, lng:127.18224, url:"https://gitsview.gg.go.kr/60657/mjGSNbnM1FkAJRofSTHGj+wEKg7jERuUxlPb4dRSsYujKUIHxXnwMp7qNGig3tZJ" },
    { id:60656, name:"미사푸르지오2차 앞(선동IC 진입)", type:"vod", lat:37.57602, lng:127.18090, url:"https://gitsview.gg.go.kr/60656/Q0QdQo91SJRBrCCUnJifakXMMpIWDg8C1Eni29pDuixXVT9QzfWfOMPhkNk3R9CF" },
    { id:6764,  name:"선동교차로",          type:"vod", lat:37.57858, lng:127.17960, url:"https://gitsview.gg.go.kr/6764/uyOA4Zdpu91sAGd1mXcHVcnSpViaNA6MoL08Arvtg6hUVpXSLUQpEbwqFQDEGhq4" },

    { grp:"황산사거리 나들목" },
    { id:60655, name:"황산사거리",          type:"vod", lat:37.54991, lng:127.18566, url:"https://gitsview.gg.go.kr/60655/zMrhYguquMVVOrMPen1dH7VcVDYOQMxO3pFe6Jc67m5V6gqVNAy/mdmCTtFBoT7c" },
    { id:60662, name:"진등교차로",          type:"vod", lat:37.55553, lng:127.19790, url:"https://gitsview.gg.go.kr/60662/TFI5/p6k885LGGyctIFqfr2aHjl2SGwJtbEG0TWCvNWZH31/Hz90+XJ1h+6ADHep" },
    { id:6769,  name:"덕풍파출소앞사거리",  type:"vod", lat:37.54649, lng:127.19830, url:"https://gitsview.gg.go.kr/6769/2ZO0/1go67tiKDZfF03p2U249PCxqZS9rDbo1YINprT1eq/WSIPV7rQpGTrJvTDz" },
    { id:6756,  name:"신장초교사거리",      type:"vod", lat:37.54170, lng:127.20700, url:"https://gitsview.gg.go.kr/6756/UMCTkkyE+GsOuT0kkuCaT5AV2R6x6puGPrfhxOKFmanEV/tgOgCrW9OMy171LuQQ" },
    { id:6056,  name:"상일IC",             type:"hls", lat:37.54897, lng:127.17920, url:"https://gitsview.gg.go.kr/6056/IvNSmaIk314NoLZy1EqzajNy5L6ZXn8Ev9hHHArZE7/UngZtUXgCSAooB9y7hX6X!hls" },
  ],

  /* ── 5 · 남양주 현대아울렛 (스페이스원·다산, 주말 쇼핑) ── */
  [
    { id:11,    name:"토평",              type:"hls", lat:37.58299, lng:127.15716, url:"https://gitsview.gg.go.kr/11/liA4A1n3JZXJ/M0hvAtdgqvuOwMlK4J4b5F45IjcZSJSpLBV8gOJJioIwYL9ysT/!hls" },
    { id:6734,  name:"토평IC",            type:"hls", lat:37.58115, lng:127.15960, url:"https://gitsview.gg.go.kr/6734/GuIVVFt2Tht1AV93lji77BHL0REeZIMT/Qv8JR0LPsdKp1FA+0JA0WI5SAXjzDOx!hls" },
    { id:2362,  name:"구리영업소",          type:"hls", lat:37.59061, lng:127.15669, url:"https://gitsview.gg.go.kr/2362/AdrfNyGwYb18iKVhSXYMahai0ZH5nrP8G6IikoHz2/tAN3TouAOVvp2+bJ4iVzXA!hls" },
    { id:12,    name:"남양주IC",           type:"hls", lat:37.60191, lng:127.15306, url:"https://gitsview.gg.go.kr/12/4GJR5oaWkftMgbs9vkaYGC779uYM89i04bpKbZ3u0C+pVWbfs7QGgj4Lsp4OL/q/!hls" },
    { id:9535,  name:"왕숙교입구",          type:"hls", lat:37.60362, lng:127.14653, url:"https://gitsview.gg.go.kr/9535/lWLe3l5rWWQAcvj2rMB53oyI8k9se5NRFiaSlGaSFAe0JY3PWP0GcSKwIyz1x3XY!hls" },
  ],

  /* ── 6 · 서울양양고속도로 (강일IC~미사대교~덕소IC, 주말 나들이) ── */
  [
    { id:6055,  name:"강일IC",             type:"hls", lat:37.57384, lng:127.16519, url:"https://gitsview.gg.go.kr/6055/YDlpbv0EugJoO/ZM4yD9yDT0jsAkuP3g0bQPXw4xukcxuv7DVm7d/StcdDF//tdi!hls" },
    { id:2154,  name:"강일_서울양양",       type:"hls", lat:37.57669, lng:127.17154, url:"https://gitsview.gg.go.kr/2154/NZ4xkcmwr0LbwFqmfXOM/w4DGU7dgnVPjkx+hDShCP6laH1HIRKNiNB3ZZMgJTTM!hls" },
    { id:2570,  name:"미사IC",             type:"hls", lat:37.57976, lng:127.18431, url:"https://gitsview.gg.go.kr/2570/cs+GC/HKAu46TjwVSNiyTRzMqMpBh7vNqX9b/2Ms9WxshYo10xQtXkVliTnAiFsA!hls" },
    { id:2569,  name:"미사대교",           type:"hls", lat:37.58372, lng:127.19414, url:"https://gitsview.gg.go.kr/2569/lmjMXtpLPduqQ1xWmDxRvu/vY4AqfweKsoFIDoJWz8dsK6j/FmAvvzI8vdzk/SMb!hls" },
    { id:3176,  name:"미사대교종점",         type:"hls", lat:37.59021, lng:127.20398, url:"https://gitsview.gg.go.kr/3176/eU9OcwQ+rH1lMWx21kzD6V0ey9e6FQYj4mpQcdz+GRJq2r37/Wftvja7maKn7+f0!hls" },
    { id:71658, name:"남양주 덕소IC",       type:"hls", lat:37.58671, lng:127.20581, url:"https://gitsview.gg.go.kr/71658/ipmqFp2N7obeqADQUsvMWpuaL+6Lgb/TNaZUumvpy7zjq5kB1BcAAQaT2rRJitpC!hls" },
  ],

  /* ── 7 · 팔당대교 남단~조안 (국도 45호선·북한강 방면, 주말 나들이) ── */
  [
    { id:6765,  name:"팔당대교남단",         type:"vod", lat:37.54317, lng:127.23379, url:"https://gitsview.gg.go.kr/6765/AIqh/Qvx3UQLVeNgjIuoC3+8etZs3YXV9UNbKYXm+0vFNGoIrdtNNf88bGm8Oniw" },
    { id:4405,  name:"팔당대교IC",          type:"hls", lat:37.54822, lng:127.24015, url:"https://gitsview.gg.go.kr/4405/Jq9LYm2TF/GFIPrbDQHBxcEplC2ZnrOyY2olb0qE18I55V3lAnMBNLqyFBGGRcYh!hls" },
    { id:1220,  name:"팔당댐삼거리",         type:"hls", lat:37.54028, lng:127.25524, url:"https://gitsview.gg.go.kr/1220/JwQG0FO+d6PMpMbwDXnMIdypAg0/Fx7Fgur3f4dtvDY0LgjBu48OzprNLZWQ8M2Z!hls" },
    { id:4411,  name:"남양주 팔당1터널",     type:"hls", lat:37.54041, lng:127.25700, url:"https://gitsview.gg.go.kr/4411/dfjFPaAaYf9OMj+vnSbEjZEHsc0YtNFf2AcnyVuh1sQRsvrLscUYg6YUJAVkzDk9!hls" },
    { id:5437,  name:"남양주 팔당4터널앞",   type:"hls", lat:37.53431, lng:127.26939, url:"https://gitsview.gg.go.kr/5437/ku8TSxJ4Dkx41rwckrCPXx9VwmimyVyOLl7jpMGBkRmcJqjEzmzhZOT3cVLMJ6sp!hls" },
    { id:79966, name:"남양주 봉안대교",       type:"hls", lat:37.53000, lng:127.28268, url:"https://gitsview.gg.go.kr/79966/NHPgUu5ch+8MSSlhV59r1dGFHIsa2khPKLLry4jRqfGUqtVGww+wLiEmTcBTmyg9!hls" },
    { id:4410,  name:"조안IC",             type:"hls", lat:37.53292, lng:127.30282, url:"https://gitsview.gg.go.kr/4410/6SiWIbc3ik5QzLksIuaBlhUpu6F24Khfat7WqPem5lxDoz16qVOAtD62k6R/hIQk!hls" },
  ],
];
