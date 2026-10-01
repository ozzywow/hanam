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
    { id:1277,  name:"팔당대교남단(팔당대교방면)", type:"hls", lat:37.54770, lng:127.22091, url:"https://gitsview.gg.go.kr/1277/7TYtkgdtQJrqMHohNAXt/TFhr4JHI6h1Uz78Ty6OjoinT/LK1N8JS6TYXlWiau2X!hls" },
    { id:61065, name:"스타필드동측",          type:"vod", lat:37.54372, lng:127.22600, url:"https://gitsview.gg.go.kr/61065/GlPs2+VybjnubfVCDMAOvvvw2ssjtEb4io7yIioSJoLbrHnRFtlNYiZZ2O6P2N7p" },
    { id:61064, name:"덕풍6교 서측",          type:"vod", lat:37.54567, lng:127.21642, url:"https://gitsview.gg.go.kr/61064/Pr7VGuKQfzGlf0vKoRZolk2ies06D4WHd7BNVQ/6edlEFrK31A3+e28xjILELFZb" },
    { id:6751,  name:"신풍로삼거리",          type:"vod", lat:37.55070, lng:127.21433, url:"https://gitsview.gg.go.kr/6751/+JIzaXpoiIizOr6pzta4Z6qWZ33MqOppcrel/Py7VPCBDeWgfOgot251DEbb76dq" },
    { id:6752,  name:"창우지하차도사거리",    type:"vod", lat:37.53854, lng:127.22930, url:"https://gitsview.gg.go.kr/6752/y9bpayy7X6uqn4PZnc++Pv04lQaDJJN+8nhR54Gypo3eeDkRQJfsJ7qqKhTg5CUL" },
  ],

  /* ── 1 · 미사·조정경기장 가는 길 ── */
  [
    { id:6750,  name:"조정경기장사거리",   type:"vod", lat:37.56012, lng:127.20350, url:"https://gitsview.gg.go.kr/6750//3Ik45+QpoCFU16monN1MeyFiCBxDexwlQir+HpKpFmbUxGZRarVmnRDSsgbdMxa" },
    { id:6749,  name:"한강유역환경청사거리", type:"vod", lat:37.56895, lng:127.19700, url:"https://gitsview.gg.go.kr/6749/7gv1sFEIE14YFl6yhC+tUU8WX6r93qTJx2sjjyBKmbx5YKPxR/pr+FzVNG0Fyp/t" },
    { id:60655, name:"황산사거리",         type:"vod", lat:37.54991, lng:127.18566, url:"https://gitsview.gg.go.kr/60655/zMrhYguquMVVOrMPen1dH/DdITr6jGaljCobNugvGhrxDcgLNenEJ1mivCuT3vbR" },
    { id:1275,  name:"미사IC 남단(하남)",  type:"hls", lat:37.57486, lng:127.19475, url:"https://gitsview.gg.go.kr/1275/NpJJ7TbyNATWEEKgv2q0hU1gtC/N6iyTMME7XwBggFRfhnN5cDDTG60FwMdAynR3!hls" },
    { id:6748,  name:"미사교차로",         type:"vod", lat:37.57968, lng:127.19310, url:"https://gitsview.gg.go.kr/6748/jG0qy+/U3mAwN3ldEQgAN87SN8F2uCdDEZaj5GLlMDCrlPbBJS8VJ1vrbVaiotuF" },
    { id:2569,  name:"미사대교",           type:"hls", lat:37.58372, lng:127.19414, url:"https://gitsview.gg.go.kr/2569/lmjMXtpLPduqQ1xWmDxRvu/vY4AqfweKsoFIDoJWz8f+CNAxpmCgEzM995DZRtRF!hls" },
  ],

  /* ── 2 · 하남 진출입 ── (현재 페이지 미표시: index.html 의 '하남 진출입' 섹션 제거됨.
     데이터는 보존 — 다시 넣으려면 <div class="player-mount" data-deck="2"> 섹션 복원) */
  [
    { grp:"중부고속 남쪽 → 하남IC 진입 (~2km)" },
    { id:21,    name:"하남IC",            type:"hls", lat:37.52801, lng:127.21858, url:"https://gitsview.gg.go.kr/21/w7RTp3kGK1raguzMaFpDQvf5ViPQoqTRT/LgfU468fEPAbjeT9pv7fDLNDvDfEdb!hls" },
    { id:6755,  name:"천현사거리",         type:"vod", lat:37.53561, lng:127.21490, url:"https://gitsview.gg.go.kr/6755/AH6/mgKXaEOE7DC/R0hDtc9Hr0rBjSuHzS+hBZJBJxT/hvPXyO7VTaMGkH1CXpo+" },
    { id:6757,  name:"신장사거리",         type:"vod", lat:37.53786, lng:127.20460, url:"https://gitsview.gg.go.kr/6757/unZWtGDQ5fp9xO692tSfsV+91d7gBzNR5jzVsB+WjAMDV4aW8QuFg2jwf9sFFpKS" },
    { id:94794, name:"천현2",             type:"hls", lat:37.53169, lng:127.20598, url:"https://gitsview.gg.go.kr/94794/Jh+/MTatYqrC5nlcRKmpYQcfsHShYK1p/gX50nYxbgejh5CUOlRdzkrTICbUwYC7!hls" },
    { id:2708,  name:"천현삼거리",         type:"hls", lat:37.52521, lng:127.22042, url:"https://gitsview.gg.go.kr/2708/hgxwNXNzdwytHcBvfvomzTf+5Sl4Bzmb/j0KpfLOn6apolR9CqwBZNXr6/V41djq!hls" },

    { grp:"팔당대교 방면 (남양주·양평 → 강 건너)" },
    { id:4405,  name:"팔당대교IC",        type:"hls", lat:37.54822, lng:127.24015, url:"https://gitsview.gg.go.kr/4405/Jq9LYm2TF/GFIPrbDQHBxcEplC2ZnrOyY2olb0qE18K4Pm4Z4RhH8kvdlMka5XNY!hls" },
    { id:6765,  name:"팔당대교남단(하남측)", type:"vod", lat:37.54317, lng:127.23379, url:"https://gitsview.gg.go.kr/6765/AIqh/Qvx3UQLVeNgjIuoC+cVkiSiYhTL480X/rN4F1pgnpctqxtqAYbmHxiUNTAl" },
    { id:71659, name:"남양주 하팔당삼거리", type:"hls", lat:37.55259, lng:127.23854, url:"https://gitsview.gg.go.kr/71659/NymrSSb4eNtUVEyKo77RfCbvL5DC4XyOiFLzQkJ63JE1km4F+9I4f1mqnWxcD3Cg!hls" },
    { id:71308, name:"한강시민공원(팔당)",  type:"hls", lat:37.55946, lng:127.23579, url:"https://gitsview.gg.go.kr/71308/9Snt7W/UQjAKzxaOnurpAGZzrRhOWTX1o4PduKOgVj3sP2M0cIhksH63R7JdTfll!hls" },

    { grp:"고속도로 분기·요금소 (~3km)" },
    { id:8,     name:"하남JC",            type:"hls", lat:37.53250, lng:127.19361, url:"https://gitsview.gg.go.kr/8/WXtZxPwfkl1zJwxQyeEH5gkIA8sYjvNFlgwywRdeHYa5EB0Fu4HyA2BjjtUhwJGZ!hls" },
    { id:20,    name:"동서울영업소",       type:"hls", lat:37.51773, lng:127.22149, url:"https://gitsview.gg.go.kr/20/ecTbaHuH3p1ETjlwqzqWfe6ChczS3kbk/vkqH7oJB965zBvSNCnK2zSyGx5Ix/2c!hls" },
    { id:8602,  name:"초일",              type:"hls", lat:37.53503, lng:127.18773, url:"https://gitsview.gg.go.kr/8602/gASVQxm5mxtfw8Hq2Wa3XGZYMUxmrVqfG2FbQtKh3m2/36qUcULDjuC9uwBgPL9D!hls" },
  ],

  /* ── 3 · 출퇴근 시간대 병목 구간 (목적지 방면별) ── */
  [
    { grp:"하남 → 강동·잠실 (올림픽대로, 선동IC→잠실종합운동장)" },
    { id:2570,  name:"미사IC",             type:"hls", lat:37.57976, lng:127.18431, url:"https://gitsview.gg.go.kr/2570/cs+GC/HKAu46TjwVSNiyTRzMqMpBh7vNqX9b/2Ms9WzdLfUqHq6NEwXSkqLDCBAv!hls" },
    { id:2154,  name:"강일_서울양양",       type:"hls", lat:37.57669, lng:127.17154, url:"https://gitsview.gg.go.kr/2154/NZ4xkcmwr0LbwFqmfXOM/w4DGU7dgnVPjkx+hDShCP4+o4dbz2MPK19U/mfVlv0G!hls" },
    { id:10,    name:"강일(가래여울IC 부근)", type:"hls", lat:37.57190, lng:127.16684, url:"https://gitsview.gg.go.kr/10/2u+rWOLnZPcDnHj+zB81LbVk/PY7888oHvYpnkxON4Xc0ZTCtupk/vJ2l09jW3s4!hls" },
    { id:731,   name:"고덕근린공원 앞",      type:"hls", lat:37.56843, lng:127.15427, url:"https://gitsview.gg.go.kr/731/ALaHU6BpFNtdV9gfpRAT3u4IhT+KIYnRfc9WSiFLlFxf0vzuSHGAt7brHcHy0X3K!hls" },
    { id:728,   name:"암사IC",             type:"hls", lat:37.55406, lng:127.12473, url:"https://gitsview.gg.go.kr/728/qNj63VxNAb0pYgVsE8khO8JOMF/TvRR6/i5LqmtIgZHHliQtsJcXS+gTDJ1LL0DP!hls" },
    { id:6241,  name:"천호대교남단",         type:"hls", lat:37.54113, lng:127.11889, url:"https://gitsview.gg.go.kr/6241/wZNaLFtL/fGqAKWNVfFp9jFWDWgXAtXBNnEY5Z9dfFNCX+epjruf2wDhOisSuRKZ!hls" },
    { id:726,   name:"올림픽대교~천호대교", type:"hls", lat:37.53642, lng:127.11245, url:"https://gitsview.gg.go.kr/726/bO2cYfMs9a0reVMBL9Yl5V6fgMmHEdsE75DM1Jork3b+aP4vNkgxdijfW0at1uwQ!hls" },
    { id:725,   name:"잠실철교~올림픽대교", type:"hls", lat:37.52657, lng:127.10553, url:"https://gitsview.gg.go.kr/725/a4ryF1dkcUY+6LJohKOhU5kAeiOPo2yb+OcpgnAehC6UvoMeYtjAkYKSO8ZDkKc2!hls" },
    { id:478,   name:"잠실대교~잠실철교", type:"hls", lat:37.52221, lng:127.09989, url:"https://gitsview.gg.go.kr/478/Ijuv04kNp4PW+U+ueNwHB4pX5WQC1L+VUod9qPDvsUoPjmIC1VxWv0JFmlfigs4z!hls" },

    { grp:"하남 → 판교·강남 (수도권제1순환 남행)" },
    { id:6056,  name:"상일IC",             type:"hls", lat:37.54897, lng:127.17920, url:"https://gitsview.gg.go.kr/6056/IvNSmaIk314NoLZy1EqzajNy5L6ZXn8Ev9hHHArZE7/2aPOb40NaUjvEijP2iqqF!hls" },
    { id:8602,  name:"초일",              type:"hls", lat:37.53503, lng:127.18773, url:"https://gitsview.gg.go.kr/8602/gASVQxm5mxtfw8Hq2Wa3XGZYMUxmrVqfG2FbQtKh3m2/36qUcULDjuC9uwBgPL9D!hls" },
    { id:8,     name:"하남JC",            type:"hls", lat:37.53250, lng:127.19361, url:"https://gitsview.gg.go.kr/8/WXtZxPwfkl1zJwxQyeEH5gkIA8sYjvNFlgwywRdeHYa5EB0Fu4HyA2BjjtUhwJGZ!hls" },
    { id:7,     name:"광암터널3",          type:"hls", lat:37.51917, lng:127.18667, url:"https://gitsview.gg.go.kr/7/+H/lDaIR69Y988G1AauBHEwjqiSGV+Pxz3otSh+p9UZsF3/reemTomfPEMy1+BPj!hls" },
    { id:6,     name:"광암터널2",          type:"hls", lat:37.51526, lng:127.17067, url:"https://gitsview.gg.go.kr/6/6c0lK3hZKzyL+zCkh51IPhrVlHMDq0RfmTiZD2y7RxWA5g5h0AsBXdaFIK96qkTy!hls" },
    { id:5,     name:"서하남IC",           type:"hls", lat:37.51167, lng:127.14972, url:"https://gitsview.gg.go.kr/5/6u/drVvGl7RJf895yX58m5XqVMO2vrxJ3JxsYsyii6K9xfnfwHAmQCOruMD7/lOk!hls" },
    { id:3956,  name:"서하남",            type:"hls", lat:37.50645, lng:127.14557, url:"https://gitsview.gg.go.kr/3956/WMSNdwrpggsy+Nmpk5Vxc4CZ1Cw3Yv3L5V1E/v/8Iw0c0Rp3vBmIiNbETSOIGAha!hls" },
    { id:2359,  name:"위례",              type:"hls", lat:37.48177, lng:127.13536, url:"https://gitsview.gg.go.kr/2359/x63Dy0U7vFfUcfEYDWnpiF3AgRTRuCsYKjXs8xkmVYsRCiv+J3Azp8Tn5wExJNBh!hls" },
    { id:4,     name:"송파IC",            type:"hls", lat:37.47500, lng:127.12944, url:"https://gitsview.gg.go.kr/4/v99uKfY/jNJUVX6tx7zVfrFX6Z1chbgljAmoZ8EGdZRNH2Tx2d+JGK9pvDM/chHR!hls" },
    { id:3,     name:"성남요금소",          type:"hls", lat:37.43898, lng:127.12238, url:"https://gitsview.gg.go.kr/3/8TPhcaxUtzWXNuaqjnTAcm8rc4AwcNUDS/oXZlTv9vcKV/TqSukPCSkciJKLxigk!hls" },
    { id:1,     name:"판교분기점",          type:"hls", lat:37.40665, lng:127.09706, url:"https://gitsview.gg.go.kr/1/Ku1bIRvz9bj2gKVLi6H/p+izNTSscUVuggUFXpK7RlAaY1e8+koaHpnDGsclKQse!hls" },
    { id:96,    name:"판교JC",             type:"hls", lat:37.40528, lng:127.09500, url:"https://gitsview.gg.go.kr/96/O8HyvfvufkTYYeQT9j2Pj+xSCaD7zyYRZZth6uxAiedcW3Ugn3ML7/gCpCiIt+1i!hls" },

    { grp:"구리 → 하남 (구리암사대교·순환 남행, 아침 유입)" },
    { id:6734,  name:"토평IC",             type:"hls", lat:37.58115, lng:127.15960, url:"https://gitsview.gg.go.kr/6734/GuIVVFt2Tht1AV93lji77BHL0REeZIMT/Qv8JR0LPsfzZ5O9Fc/kYkJ53YIc90JJ!hls" },
    { id:95294, name:"강동나들목",          type:"hls", lat:37.56715, lng:127.15422, url:"https://gitsview.gg.go.kr/95294/iOUGjj4wsQezVFi/1NnTGGV/MwcpUpgyaBkRuYS7kbwwVpv3GzVPxFSR1KsvQ9TQ!hls" },
    { id:6055,  name:"강일IC",             type:"hls", lat:37.57384, lng:127.16519, url:"https://gitsview.gg.go.kr/6055/YDlpbv0EugJoO/ZM4yD9yDT0jsAkuP3g0bQPXw4xukcnTENDIuyTqQqNvq+8thqz!hls" },

    { grp:"남양주 덕소·도농 → 하남 (미사대교·중앙선 축, 아침 유입)" },
    { id:71658, name:"남양주 덕소IC",       type:"hls", lat:37.58671, lng:127.20581, url:"https://gitsview.gg.go.kr/71658/ipmqFp2N7obeqADQUsvMWpuaL+6Lgb/TNaZUumvpy7zGcRw4NdVfKFTZZDtJceJv!hls" },
    { id:2572,  name:"남양주TG",           type:"hls", lat:37.59792, lng:127.24243, url:"https://gitsview.gg.go.kr/2572/Emgh6zOjil5sykRK3FLEo4I19o+smTxGr4iFqrW4YbtOcpCflR1j6gpRxW/mmAND!hls" },
    { id:3176,  name:"미사대교종점",         type:"hls", lat:37.59021, lng:127.20398, url:"https://gitsview.gg.go.kr/3176/eU9OcwQ+rH1lMWx21kzD6V0ey9e6FQYj4mpQcdz+GRL0ap1TeSsg+FqjvuEKdqO9!hls" },
  ],

  /* ── 4 · 진출입 핵심 나들목 병목 (선동교차로·황산사거리) ── */
  [
    { grp:"선동교차로 나들목" },
    { id:60657, name:"미사8단지 앞",        type:"vod", lat:37.57175, lng:127.18224, url:"https://gitsview.gg.go.kr/60657/mjGSNbnM1FkAJRofSTHGj91SWvzd4knm6X4k6yuCicyccRr2gYyHwe3tRNvyuHiv" },
    { id:60656, name:"미사푸르지오2차 앞(선동IC 진입)", type:"vod", lat:37.57602, lng:127.18090, url:"https://gitsview.gg.go.kr/60656/Q0QdQo91SJRBrCCUnJifahHpiqnxetHyWFiANHf6y0EgVhqAiIuxuIw6skTv5mDG" },
    { id:6764,  name:"선동교차로",          type:"vod", lat:37.57858, lng:127.17960, url:"https://gitsview.gg.go.kr/6764/uyOA4Zdpu91sAGd1mXcHVTobb3ynR8JqqxdAnIMdrhFWjwyeJELFR4YEvMzpxBXW" },

    { grp:"황산사거리 나들목" },
    { id:60655, name:"황산사거리",          type:"vod", lat:37.54991, lng:127.18566, url:"https://gitsview.gg.go.kr/60655/zMrhYguquMVVOrMPen1dH/DdITr6jGaljCobNugvGhrxDcgLNenEJ1mivCuT3vbR" },
    { id:60662, name:"진등교차로",          type:"vod", lat:37.55553, lng:127.19790, url:"https://gitsview.gg.go.kr/60662/TFI5/p6k885LGGyctIFqfldUffm8Ibidm7ZaMZke7Btm8QspDj2lP9CmprYj9zBR" },
    { id:6769,  name:"덕풍파출소앞사거리",  type:"vod", lat:37.54649, lng:127.19830, url:"https://gitsview.gg.go.kr/6769/2ZO0/1go67tiKDZfF03p2S6/NrEoj/PZf+6nAFCoAg8pmTzwMM8DXw3vadOBPXYi" },
    { id:6756,  name:"신장초교사거리",      type:"vod", lat:37.54170, lng:127.20700, url:"https://gitsview.gg.go.kr/6756/UMCTkkyE+GsOuT0kkuCaTzfkqoN/iC4eyE5uaNTM8hg1xw0HXzLVUKzg+Wj/BLb+" },
    { id:6056,  name:"상일IC",             type:"hls", lat:37.54897, lng:127.17920, url:"https://gitsview.gg.go.kr/6056/IvNSmaIk314NoLZy1EqzajNy5L6ZXn8Ev9hHHArZE7/2aPOb40NaUjvEijP2iqqF!hls" },
  ],

  /* ── 5 · 남양주 현대아울렛 (스페이스원·다산, 주말 쇼핑) ── */
  [
    { id:11,    name:"토평",              type:"hls", lat:37.58299, lng:127.15716, url:"https://gitsview.gg.go.kr/11/liA4A1n3JZXJ/M0hvAtdgmTctygCnvE9srrzK3IS9bI3NPG7Cc7Sa9SuOM/SqNO0!hls" },
    { id:6734,  name:"토평IC",            type:"hls", lat:37.58115, lng:127.15960, url:"https://gitsview.gg.go.kr/6734/GuIVVFt2Tht1AV93lji77BHL0REeZIMT/Qv8JR0LPsfzZ5O9Fc/kYkJ53YIc90JJ!hls" },
    { id:2362,  name:"구리영업소",          type:"hls", lat:37.59061, lng:127.15669, url:"https://gitsview.gg.go.kr/2362/AdrfNyGwYb18iKVhSXYMahai0ZH5nrP8G6IikoHz2/ux4MxvaQcnxkEasX+S8AxP!hls" },
    { id:12,    name:"남양주IC",           type:"hls", lat:37.60191, lng:127.15306, url:"https://gitsview.gg.go.kr/12/4GJR5oaWkftMgbs9vkaYGHTgy3RQ7QsvoSFYNCBn06fm102W6TKRMB1eu3dQNm/6!hls" },
    { id:9535,  name:"왕숙교입구",          type:"hls", lat:37.60362, lng:127.14653, url:"https://gitsview.gg.go.kr/9535/lWLe3l5rWWQAcvj2rMB53oyI8k9se5NRFiaSlGaSFAe1fpmCmegpd9JblyTvTbbR!hls" },
  ],

  /* ── 6 · 서울양양고속도로 (강일IC~미사대교~덕소IC, 주말 나들이) ── */
  [
    { id:6055,  name:"강일IC",             type:"hls", lat:37.57384, lng:127.16519, url:"https://gitsview.gg.go.kr/6055/YDlpbv0EugJoO/ZM4yD9yDT0jsAkuP3g0bQPXw4xukcnTENDIuyTqQqNvq+8thqz!hls" },
    { id:2154,  name:"강일_서울양양",       type:"hls", lat:37.57669, lng:127.17154, url:"https://gitsview.gg.go.kr/2154/NZ4xkcmwr0LbwFqmfXOM/w4DGU7dgnVPjkx+hDShCP4+o4dbz2MPK19U/mfVlv0G!hls" },
    { id:2570,  name:"미사IC",             type:"hls", lat:37.57976, lng:127.18431, url:"https://gitsview.gg.go.kr/2570/cs+GC/HKAu46TjwVSNiyTRzMqMpBh7vNqX9b/2Ms9WzdLfUqHq6NEwXSkqLDCBAv!hls" },
    { id:2569,  name:"미사대교",           type:"hls", lat:37.58372, lng:127.19414, url:"https://gitsview.gg.go.kr/2569/lmjMXtpLPduqQ1xWmDxRvu/vY4AqfweKsoFIDoJWz8f+CNAxpmCgEzM995DZRtRF!hls" },
    { id:3176,  name:"미사대교종점",         type:"hls", lat:37.59021, lng:127.20398, url:"https://gitsview.gg.go.kr/3176/eU9OcwQ+rH1lMWx21kzD6V0ey9e6FQYj4mpQcdz+GRL0ap1TeSsg+FqjvuEKdqO9!hls" },
    { id:71658, name:"남양주 덕소IC",       type:"hls", lat:37.58671, lng:127.20581, url:"https://gitsview.gg.go.kr/71658/ipmqFp2N7obeqADQUsvMWpuaL+6Lgb/TNaZUumvpy7zGcRw4NdVfKFTZZDtJceJv!hls" },
  ],

  /* ── 7 · 팔당대교 남단~조안 (국도 45호선·북한강 방면, 주말 나들이) ── */
  [
    { id:6765,  name:"팔당대교남단",         type:"vod", lat:37.54317, lng:127.23379, url:"https://gitsview.gg.go.kr/6765/AIqh/Qvx3UQLVeNgjIuoC+cVkiSiYhTL480X/rN4F1pgnpctqxtqAYbmHxiUNTAl" },
    { id:4405,  name:"팔당대교IC",          type:"hls", lat:37.54822, lng:127.24015, url:"https://gitsview.gg.go.kr/4405/Jq9LYm2TF/GFIPrbDQHBxcEplC2ZnrOyY2olb0qE18K4Pm4Z4RhH8kvdlMka5XNY!hls" },
    { id:1220,  name:"팔당댐삼거리",         type:"hls", lat:37.54028, lng:127.25524, url:"https://gitsview.gg.go.kr/1220/JwQG0FO+d6PMpMbwDXnMIdypAg0/Fx7Fgur3f4dtvDZGRK9eNamrOTaNDBHy5zBg!hls" },
    { id:4411,  name:"남양주 팔당1터널",     type:"hls", lat:37.54041, lng:127.25700, url:"https://gitsview.gg.go.kr/4411/dfjFPaAaYf9OMj+vnSbEjZEHsc0YtNFf2AcnyVuh1sR7Shhkdyst8OADcKEV8R17!hls" },
    { id:5437,  name:"남양주 팔당4터널앞",   type:"hls", lat:37.53431, lng:127.26939, url:"https://gitsview.gg.go.kr/5437/ku8TSxJ4Dkx41rwckrCPXx9VwmimyVyOLl7jpMGBkRkCSlCoFPalIaGRby8Uljej!hls" },
    { id:79966, name:"남양주 봉안대교",       type:"hls", lat:37.53000, lng:127.28268, url:"https://gitsview.gg.go.kr/79966/NHPgUu5ch+8MSSlhV59r1dGFHIsa2khPKLLry4jRqfGDYdKu+tL18blqvYnvUT/A!hls" },
    { id:4410,  name:"조안IC",             type:"hls", lat:37.53292, lng:127.30282, url:"https://gitsview.gg.go.kr/4410/6SiWIbc3ik5QzLksIuaBlhUpu6F24Khfat7WqPem5lxfcIEdTDQzmQw8rKJv7J8i!hls" },
  ],
];
