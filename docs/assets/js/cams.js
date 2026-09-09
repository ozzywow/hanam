/* ═══════════════════════════════════════════════════════════════
   CCTV 정의 — 이 파일만 고치면 구성이 바뀝니다.

   각 항목:
     { id, name, type, lat, lng, url }
     - type "hls" : 실시간(KTICT). url = gitsview 리졸버(끝에 !hls).
     - type "vod" : 녹화 클립(경찰청UTIS·하남시). url = gitsview 302 → mp4.
     - lat/lng    : 지도 마커 좌표. GITS webLoadCCTVData.do 에서 옴.
   { grp:"헤더" } 는 버튼 그룹 구분선.

   url 안의 토큰은 GITS 팝업에서 긁은 고정값입니다.
   토큰·좌표가 만료/변경되면  node tools/scrape-tokens.mjs --write  로 갱신.
   카메라를 새로 찾으려면  node tools/list-cams.mjs 37.5452 127.2220 4

   DECKS 인덱스( [0],[1],[2] )는 index.html 의
   <div class="player-mount" data-deck="N"> 과 짝을 이룹니다.
   ═══════════════════════════════════════════════════════════════ */

const DECKS = [

  /* ── 0 · 스타필드 하남 가는 길 ── */
  [
    { id:1277,  name:"팔당대교남단(팔당대교방면)", type:"hls", lat:37.54770, lng:127.22091, url:"https://gitsview.gg.go.kr/1277/7TYtkgdtQJrqMHohNAXt/X+a158cn7U0qOgCUda/Yy/03MwN78CTjJ6Md5TPNU5E!hls" },
    { id:61065, name:"스타필드동측",          type:"vod", lat:37.54372, lng:127.22600, url:"https://gitsview.gg.go.kr/61065/GlPs2+VybjnubfVCDMAOvjhWPIlStqmoPbf3+QsphdLnpkn4bpsf0X3rFfYEJCtQ" },
    { id:61064, name:"덕풍6교 서측",          type:"vod", lat:37.54567, lng:127.21642, url:"https://gitsview.gg.go.kr/61064/Pr7VGuKQfzGlf0vKoRZolmH+Co//FUOm4BVO6wKGLTvzB2YWEWqBzDlz3El3pv6K" },
    { id:6751,  name:"신풍로삼거리",          type:"vod", lat:37.55070, lng:127.21433, url:"https://gitsview.gg.go.kr/6751/+JIzaXpoiIizOr6pzta4Z6sI9BTIhXOHxDmxUGp1QagUHZjHv2Aw2Owbm2Wc8U4Z" },
    { id:6752,  name:"창우지하차도사거리",    type:"vod", lat:37.53854, lng:127.22930, url:"https://gitsview.gg.go.kr/6752/y9bpayy7X6uqn4PZnc++PgD4DM4mHEWF+Q8tgR1av07Frgp79mI8VpyDkeWorPk5" },
  ],

  /* ── 1 · 미사·조정경기장 가는 길 ── */
  [
    { id:6750,  name:"조정경기장사거리",   type:"vod", lat:37.56012, lng:127.20350, url:"https://gitsview.gg.go.kr/6750//3Ik45+QpoCFU16monN1MfxBT3dQPrGHxsvneUvzolM9U4NqohnPxvs/COGcPYpp" },
    { id:6749,  name:"한강유역환경청사거리", type:"vod", lat:37.56895, lng:127.19700, url:"https://gitsview.gg.go.kr/6749/7gv1sFEIE14YFl6yhC+tUegjBPvyzljvnVtIV+0g9F3wIm+KaG4IitKP0pbNucWI" },
    { id:60655, name:"황산사거리",         type:"vod", lat:37.54991, lng:127.18566, url:"https://gitsview.gg.go.kr/60655/zMrhYguquMVVOrMPen1dH60JqkGljuEAsqmOO1Y8goyl8O/xvpOtEpIGwuknJG4d" },
    { id:1275,  name:"미사IC 남단(하남)",  type:"hls", lat:37.57486, lng:127.19475, url:"https://gitsview.gg.go.kr/1275/NpJJ7TbyNATWEEKgv2q0hbRWPeFB22HwE1SIUvmQW6jPZek0i6qj8l3UPQcf1F7I!hls" },
    { id:6748,  name:"미사교차로",         type:"vod", lat:37.57968, lng:127.19310, url:"https://gitsview.gg.go.kr/6748/jG0qy+/U3mAwN3ldEQgAN4JNDz583n7yWTJxUocDZvjxswaet6EKHZ+Oyy/X4c1m" },
    { id:2569,  name:"미사대교",           type:"hls", lat:37.58372, lng:127.19414, url:"https://gitsview.gg.go.kr/2569/lmjMXtpLPduqQ1xWmDxRvip3+vrUvwIryEufijCHJbPmzewNqBPDyzFV9rtP/k8N!hls" },
  ],

  /* ── 2 · 하남 진출입 ── (현재 페이지 미표시: index.html 의 '하남 진출입' 섹션 제거됨.
     데이터는 보존 — 다시 넣으려면 <div class="player-mount" data-deck="2"> 섹션 복원) */
  [
    { grp:"중부고속 남쪽 → 하남IC 진입 (~2km)" },
    { id:21,    name:"하남IC",            type:"hls", lat:37.52801, lng:127.21858, url:"https://gitsview.gg.go.kr/21/w7RTp3kGK1raguzMaFpDQhloEO2Vt8Pd/WSfSFmXFAmU4ls93cYrFtZ7svpGwUy6!hls" },
    { id:6755,  name:"천현사거리",         type:"vod", lat:37.53561, lng:127.21490, url:"https://gitsview.gg.go.kr/6755/AH6/mgKXaEOE7DC/R0hDtexKE5QSNCbC4J42w/06EWOCf/PbY+Sc/itHJh2RTzyV" },
    { id:6757,  name:"신장사거리",         type:"vod", lat:37.53786, lng:127.20460, url:"https://gitsview.gg.go.kr/6757/unZWtGDQ5fp9xO692tSfseeEpUm5J3p09j8hzwnVJMBdSfT8xGrDFYGD1DMxtoVk" },
    { id:94794, name:"천현2",             type:"hls", lat:37.53169, lng:127.20598, url:"https://gitsview.gg.go.kr/94794/Jh+/MTatYqrC5nlcRKmpYRN2tpJnw2FtByV/7QiAKuyORgNNv8s07uH0CTOi7ikv!hls" },
    { id:2708,  name:"천현삼거리",         type:"hls", lat:37.52521, lng:127.22042, url:"https://gitsview.gg.go.kr/2708/hgxwNXNzdwytHcBvfvomzSKVTvwFAD1CEe4Mpv6/XRbUEdOhqkrN5HhVqAwEH8yM!hls" },

    { grp:"팔당대교 방면 (남양주·양평 → 강 건너)" },
    { id:4405,  name:"팔당대교IC",        type:"hls", lat:37.54822, lng:127.24015, url:"https://gitsview.gg.go.kr/4405/Jq9LYm2TF/GFIPrbDQHBxWezt0sg460V8b1NhaH4ShmxnHD3ZZFHCJ7R6+gcV4p4!hls" },
    { id:6765,  name:"팔당대교남단(하남측)", type:"vod", lat:37.54317, lng:127.23379, url:"https://gitsview.gg.go.kr/6765/AIqh/Qvx3UQLVeNgjIuoC3hFYvrPW3Ab1rS5AzK1W/YTEWRzdf4JJhoAE+mW7aDO" },
    { id:71659, name:"남양주 하팔당삼거리", type:"hls", lat:37.55259, lng:127.23854, url:"https://gitsview.gg.go.kr/71659/NymrSSb4eNtUVEyKo77RfJrLLrqc1+iPkl0UcwtSo3B91+vWQ4kYT5rVbog3C/qi!hls" },
    { id:71308, name:"한강시민공원(팔당)",  type:"hls", lat:37.55946, lng:127.23579, url:"https://gitsview.gg.go.kr/71308/9Snt7W/UQjAKzxaOnurpALz7bkMBxYPIy5Sxcfu39tTL3AWJ2n4GayEozZMG7vNk!hls" },

    { grp:"고속도로 분기·요금소 (~3km)" },
    { id:8,     name:"하남JC",            type:"hls", lat:37.53250, lng:127.19361, url:"https://gitsview.gg.go.kr/8/WXtZxPwfkl1zJwxQyeEH5vwQdcNLKg9YX5V2T/HiuSGKKTpibU9qLM1WE3BYGycK!hls" },
    { id:20,    name:"동서울영업소",       type:"hls", lat:37.51773, lng:127.22149, url:"https://gitsview.gg.go.kr/20/ecTbaHuH3p1ETjlwqzqWfeKRy08pgEWxbvN9+dL6gxXtTDd4lfcjw2QUgx5PZxt7!hls" },
    { id:8602,  name:"초일",              type:"hls", lat:37.53503, lng:127.18773, url:"https://gitsview.gg.go.kr/8602/gASVQxm5mxtfw8Hq2Wa3XM8aofj6L0lqlODKQ5lhyXbJ4OXf/QK6Nrrh9vaFPI1m!hls" },
  ],

  /* ── 3 · 출퇴근 시간대 병목 구간 (목적지 방면별) ── */
  [
    { grp:"하남 → 강동·잠실 (올림픽대로, 선동IC→잠실종합운동장)" },
    { id:2570,  name:"미사IC",             type:"hls", lat:37.57976, lng:127.18431, url:"https://gitsview.gg.go.kr/2570/cs+GC/HKAu46TjwVSNiyTYyy5356+mQXOa5z+UghZq48QmFMdw7Rqs/SOBPRmY49!hls" },
    { id:2154,  name:"강일_서울양양",       type:"hls", lat:37.57669, lng:127.17154, url:"https://gitsview.gg.go.kr/2154/NZ4xkcmwr0LbwFqmfXOM/+UIlzxLJcn7OL2BqHyNW+XdLHgUfIIGiDSzkpy2Gn/Z!hls" },
    { id:10,    name:"강일(가래여울IC 부근)", type:"hls", lat:37.57190, lng:127.16684, url:"https://gitsview.gg.go.kr/10/2u+rWOLnZPcDnHj+zB81LUgkktmulOGcVQEc99O5QQd8UE6aFhpRZnsA1v5OT0rm!hls" },
    { id:731,   name:"고덕근린공원 앞",      type:"hls", lat:37.56843, lng:127.15427, url:"https://gitsview.gg.go.kr/731/ALaHU6BpFNtdV9gfpRAT3jcf1jXqHZpXwTMnAE6e/PTkWe+s1aYdkhk6nYUTYztk!hls" },
    { id:728,   name:"암사IC",             type:"hls", lat:37.55406, lng:127.12473, url:"https://gitsview.gg.go.kr/728/qNj63VxNAb0pYgVsE8khOylMwmLe3WIEz0N8zKxSGNMd3XH4t8MF2Fh7pTsebLEV!hls" },
    { id:6241,  name:"천호대교남단",         type:"hls", lat:37.54113, lng:127.11889, url:"https://gitsview.gg.go.kr/6241/wZNaLFtL/fGqAKWNVfFp9mm+Nx9j6qBNaMfDWU5Lalxdko4F8/szudHRDM294Nuc!hls" },
    { id:726,   name:"올림픽대교~천호대교", type:"hls", lat:37.53642, lng:127.11245, url:"https://gitsview.gg.go.kr/726/bO2cYfMs9a0reVMBL9Yl5YzjlDBFx4HC5xobnHwkwjNYq/CsF3J+wylBTrwLZajp!hls" },
    { id:725,   name:"잠실철교~올림픽대교", type:"hls", lat:37.52657, lng:127.10553, url:"https://gitsview.gg.go.kr/725/a4ryF1dkcUY+6LJohKOhU+Z4YwtJKjUxnwC6rnc/Zq3nbCavFj9BcEP2e+hvWJZX!hls" },
    { id:478,   name:"잠실대교~잠실철교", type:"hls", lat:37.52221, lng:127.09989, url:"https://gitsview.gg.go.kr/478/Ijuv04kNp4PW+U+ueNwHB4uTiYppVwvUlsSlDoUnhfldmPa3umT/Vf89XEdD8/4X!hls" },

    { grp:"하남 → 판교·강남 (수도권제1순환 남행)" },
    { id:6056,  name:"상일IC",             type:"hls", lat:37.54897, lng:127.17920, url:"https://gitsview.gg.go.kr/6056/IvNSmaIk314NoLZy1EqzajRtnt3kD5c5wOba7FQmM84Uy68kmpC53Gp6ojgVnlb2!hls" },
    { id:8602,  name:"초일",              type:"hls", lat:37.53503, lng:127.18773, url:"https://gitsview.gg.go.kr/8602/gASVQxm5mxtfw8Hq2Wa3XM8aofj6L0lqlODKQ5lhyXbJ4OXf/QK6Nrrh9vaFPI1m!hls" },
    { id:8,     name:"하남JC",            type:"hls", lat:37.53250, lng:127.19361, url:"https://gitsview.gg.go.kr/8/WXtZxPwfkl1zJwxQyeEH5vwQdcNLKg9YX5V2T/HiuSGKKTpibU9qLM1WE3BYGycK!hls" },
    { id:7,     name:"광암터널3",          type:"hls", lat:37.51917, lng:127.18667, url:"https://gitsview.gg.go.kr/7/+H/lDaIR69Y988G1AauBHOUlKLj8JdSW2VWTb+aRtA6KouhGV4Y1LfxEXyCmATRX!hls" },
    { id:6,     name:"광암터널2",          type:"hls", lat:37.51526, lng:127.17067, url:"https://gitsview.gg.go.kr/6/6c0lK3hZKzyL+zCkh51IPnyWp57gmKG3q6bcog8Kfu3ZbThew+13Ngvc8AgKeOK4!hls" },
    { id:5,     name:"서하남IC",           type:"hls", lat:37.51167, lng:127.14972, url:"https://gitsview.gg.go.kr/5/6u/drVvGl7RJf895yX58mzg8NCAbvPlYAj+6HxprctPbDP8Xk/z5BynK8zbXQSiW!hls" },
    { id:3956,  name:"서하남",            type:"hls", lat:37.50645, lng:127.14557, url:"https://gitsview.gg.go.kr/3956/WMSNdwrpggsy+Nmpk5Vxc8yQGH3UTPSuHHDYvMAwsTUnDbqZI/2O4WyGRB9cN2gI!hls" },
    { id:2359,  name:"위례",              type:"hls", lat:37.48177, lng:127.13536, url:"https://gitsview.gg.go.kr/2359/x63Dy0U7vFfUcfEYDWnpiLFyDbij1/11U9B/uuP6dpDyBdAy8CGNaQXgqEyimDwN!hls" },
    { id:4,     name:"송파IC",            type:"hls", lat:37.47500, lng:127.12944, url:"https://gitsview.gg.go.kr/4/v99uKfY/jNJUVX6tx7zVfkNYn4jtNEB0vRt6YFwbjyE3LKEUpVhaSrztKIWIkPr4!hls" },
    { id:3,     name:"성남요금소",          type:"hls", lat:37.43898, lng:127.12238, url:"https://gitsview.gg.go.kr/3/8TPhcaxUtzWXNuaqjnTAclKNpMD03jbtcO1TG3QDEedqQ/TI4tvJW2MdMGF1uHBV!hls" },
    { id:1,     name:"판교분기점",          type:"hls", lat:37.40665, lng:127.09706, url:"https://gitsview.gg.go.kr/1/Ku1bIRvz9bj2gKVLi6H/pxjO2v+5RIAmXy+Z6xtHMog1qQNm9khmjimXf47kk4W0!hls" },
    { id:96,    name:"판교JC",             type:"hls", lat:37.40528, lng:127.09500, url:"https://gitsview.gg.go.kr/96/O8HyvfvufkTYYeQT9j2Pj7VObI8UZLlXqF8YkZ3AigaBplfa3IWzhAX6uJ2rfLxX!hls" },

    { grp:"구리 → 하남 (구리암사대교·순환 남행, 아침 유입)" },
    { id:6734,  name:"토평IC",             type:"hls", lat:37.58115, lng:127.15960, url:"https://gitsview.gg.go.kr/6734/GuIVVFt2Tht1AV93lji77DI7eN05qBpMEkxYXAbAoZx0p+l4A5lFBf9i1q9NBO4U!hls" },
    { id:95294, name:"강동나들목",          type:"hls", lat:37.56715, lng:127.15422, url:"https://gitsview.gg.go.kr/95294/iOUGjj4wsQezVFi/1NnTGIns6451Ej0yOotlNsZcuXzFK+xSJWNjGoQ3IQonCA0c!hls" },
    { id:6055,  name:"강일IC",             type:"hls", lat:37.57384, lng:127.16519, url:"https://gitsview.gg.go.kr/6055/YDlpbv0EugJoO/ZM4yD9yFLMY/uFiPe3q0kMVxK8nnLf3GxU1atoqYMEKkw1FrKy!hls" },

    { grp:"남양주 덕소·도농 → 하남 (미사대교·중앙선 축, 아침 유입)" },
    { id:71658, name:"남양주 덕소IC",       type:"hls", lat:37.58671, lng:127.20581, url:"https://gitsview.gg.go.kr/71658/ipmqFp2N7obeqADQUsvMWkwPUJhNsb/QD3v0Utlim2N9pINLMzbl0m/fjrkmgY39!hls" },
    { id:2572,  name:"남양주TG",           type:"hls", lat:37.59792, lng:127.24243, url:"https://gitsview.gg.go.kr/2572/Emgh6zOjil5sykRK3FLEo7vHMtQw7dmYyjPQa1N1rWUnOk/kW8179Xz5MHSOBzVD!hls" },
    { id:3176,  name:"미사대교종점",         type:"hls", lat:37.59021, lng:127.20398, url:"https://gitsview.gg.go.kr/3176/eU9OcwQ+rH1lMWx21kzD6Y1RBMSCcXd9266fp3BXy2v3E1/FeI4ieutxRhQgvLYY!hls" },
  ],

  /* ── 4 · 진출입 핵심 나들목 병목 (선동교차로·황산사거리) ── */
  [
    { grp:"선동교차로 나들목" },
    { id:60657, name:"미사8단지 앞",        type:"vod", lat:37.57175, lng:127.18224, url:"https://gitsview.gg.go.kr/60657/mjGSNbnM1FkAJRofSTHGj1wB1RZthnRqDpXWcP9RPnWjheacB+jcWA1CXsCwBLxJ" },
    { id:60656, name:"미사푸르지오2차 앞(선동IC 진입)", type:"vod", lat:37.57602, lng:127.18090, url:"https://gitsview.gg.go.kr/60656/Q0QdQo91SJRBrCCUnJifagXnbmEivhe9O0EKTeM59cOpi+nnSc8DKuAsHhrAhCBb" },
    { id:6764,  name:"선동교차로",          type:"vod", lat:37.57858, lng:127.17960, url:"https://gitsview.gg.go.kr/6764/uyOA4Zdpu91sAGd1mXcHVeZ6GHkFS+UynfNeIMhI7KNWjwyeJELFR4YEvMzpxBXW" },

    { grp:"황산사거리 나들목" },
    { id:60655, name:"황산사거리",          type:"vod", lat:37.54991, lng:127.18566, url:"https://gitsview.gg.go.kr/60655/zMrhYguquMVVOrMPen1dH60JqkGljuEAsqmOO1Y8goyBkNNNr4lhhH8DlvwvOJos" },
    { id:60662, name:"진등교차로",          type:"vod", lat:37.55553, lng:127.19790, url:"https://gitsview.gg.go.kr/60662/TFI5/p6k885LGGyctIFqfvKyV983XeemRsV0bqt/zchHAobMiVgVG4NbaablKkRz" },
    { id:6769,  name:"덕풍파출소앞사거리",  type:"vod", lat:37.54649, lng:127.19830, url:"https://gitsview.gg.go.kr/6769/2ZO0/1go67tiKDZfF03p2ezefm2LFbPBiG/yvEpXpnAIedo43o/ZS7NlJ+xjd+bV" },
    { id:6756,  name:"신장초교사거리",      type:"vod", lat:37.54170, lng:127.20700, url:"https://gitsview.gg.go.kr/6756/UMCTkkyE+GsOuT0kkuCaTynKMJIDEySEU3w9bxsctxSt+3Y8fvBVUnXwDUh53g0D" },
    { id:6056,  name:"상일IC",             type:"hls", lat:37.54897, lng:127.17920, url:"https://gitsview.gg.go.kr/6056/IvNSmaIk314NoLZy1EqzajRtnt3kD5c5wOba7FQmM84Uy68kmpC53Gp6ojgVnlb2!hls" },
  ],

  /* ── 5 · 남양주 현대아울렛 (스페이스원·다산, 주말 쇼핑) ── */
  [
    { id:2362,  name:"구리영업소",          type:"hls", lat:37.59061, lng:127.15669, url:"https://gitsview.gg.go.kr/2362/AdrfNyGwYb18iKVhSXYMavib5nsi4W9N1DSMIMVcd9PSAz7h+s/P9/mSaqoFO+7i!hls" },
    { id:12,    name:"남양주IC",           type:"hls", lat:37.60191, lng:127.15306, url:"https://gitsview.gg.go.kr/12/4GJR5oaWkftMgbs9vkaYGPTNTEdRK7M3XOln+BFQ730kI0bvzHEQDChdPB0URUzu!hls" },
    { id:9535,  name:"왕숙교입구",          type:"hls", lat:37.60362, lng:127.14653, url:"https://gitsview.gg.go.kr/9535/lWLe3l5rWWQAcvj2rMB53tjVT5gJYg8X5R6d038YYbSSoklJ9wO6JZZJ87lgBUxs!hls" },
  ],

  /* ── 6 · 서울양양고속도로 (강일IC~미사대교~덕소IC, 주말 나들이) ── */
  [
    { id:6055,  name:"강일IC",             type:"hls", lat:37.57384, lng:127.16519, url:"https://gitsview.gg.go.kr/6055/YDlpbv0EugJoO/ZM4yD9yFLMY/uFiPe3q0kMVxK8nnLf3GxU1atoqYMEKkw1FrKy!hls" },
    { id:2154,  name:"강일_서울양양",       type:"hls", lat:37.57669, lng:127.17154, url:"https://gitsview.gg.go.kr/2154/NZ4xkcmwr0LbwFqmfXOM/+UIlzxLJcn7OL2BqHyNW+XdLHgUfIIGiDSzkpy2Gn/Z!hls" },
    { id:2570,  name:"미사IC",             type:"hls", lat:37.57976, lng:127.18431, url:"https://gitsview.gg.go.kr/2570/cs+GC/HKAu46TjwVSNiyTYyy5356+mQXOa5z+UghZq48QmFMdw7Rqs/SOBPRmY49!hls" },
    { id:2569,  name:"미사대교",           type:"hls", lat:37.58372, lng:127.19414, url:"https://gitsview.gg.go.kr/2569/lmjMXtpLPduqQ1xWmDxRvip3+vrUvwIryEufijCHJbPmzewNqBPDyzFV9rtP/k8N!hls" },
    { id:3176,  name:"미사대교종점",         type:"hls", lat:37.59021, lng:127.20398, url:"https://gitsview.gg.go.kr/3176/eU9OcwQ+rH1lMWx21kzD6Y1RBMSCcXd9266fp3BXy2v3E1/FeI4ieutxRhQgvLYY!hls" },
    { id:71658, name:"남양주 덕소IC",       type:"hls", lat:37.58671, lng:127.20581, url:"https://gitsview.gg.go.kr/71658/ipmqFp2N7obeqADQUsvMWkwPUJhNsb/QD3v0Utlim2N9pINLMzbl0m/fjrkmgY39!hls" },
  ],

  /* ── 7 · 팔당대교 남단~조안 (국도 45호선·북한강 방면, 주말 나들이) ── */
  [
    { id:6765,  name:"팔당대교남단",         type:"vod", lat:37.54317, lng:127.23379, url:"https://gitsview.gg.go.kr/6765/AIqh/Qvx3UQLVeNgjIuoC3hFYvrPW3Ab1rS5AzK1W/YTEWRzdf4JJhoAE+mW7aDO" },
    { id:4405,  name:"팔당대교IC",          type:"hls", lat:37.54822, lng:127.24015, url:"https://gitsview.gg.go.kr/4405/Jq9LYm2TF/GFIPrbDQHBxWezt0sg460V8b1NhaH4ShmxnHD3ZZFHCJ7R6+gcV4p4!hls" },
    { id:1220,  name:"팔당댐삼거리",         type:"hls", lat:37.54028, lng:127.25524, url:"https://gitsview.gg.go.kr/1220/JwQG0FO+d6PMpMbwDXnMITCHwP4bn+oJEHG9gDM9FUMEeMozb43JbC+PsF0rGZ9h!hls" },
    { id:4411,  name:"남양주 팔당1터널",     type:"hls", lat:37.54041, lng:127.25700, url:"https://gitsview.gg.go.kr/4411/dfjFPaAaYf9OMj+vnSbEjdbR7GosE7oXL8aeFBdqqUHUpI8TdOvMe5RSc6cVBDg+!hls" },
    { id:5437,  name:"남양주 팔당4터널앞",   type:"hls", lat:37.53431, lng:127.26939, url:"https://gitsview.gg.go.kr/5437/ku8TSxJ4Dkx41rwckrCPX9juNra9qej6sGsn/jiaPERK3Fx4okcUTHiDaMil2iXc!hls" },
    { id:79966, name:"남양주 봉안대교",       type:"hls", lat:37.53000, lng:127.28268, url:"https://gitsview.gg.go.kr/79966/NHPgUu5ch+8MSSlhV59r1Rm0g7m1UpUxJuXPa+cHDFKT0+GDxuzd32wOtgyZMkqd!hls" },
    { id:4410,  name:"조안IC",             type:"hls", lat:37.53292, lng:127.30282, url:"https://gitsview.gg.go.kr/4410/6SiWIbc3ik5QzLksIuaBls1k9BG+Tm9exrDfGD9D8Rs40weu4rZ/UeWw4QQjDo6f!hls" },
  ],
];
