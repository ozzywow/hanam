/* ═══════════════════════════════════════════════════════════════
   CCTV 정의 — 이 파일만 고치면 구성이 바뀝니다.

   각 항목:
     { id, name, type, url }
     - type "hls" : 실시간(KTICT). url = gitsview 리졸버(끝에 !hls).
     - type "vod" : 녹화 클립(경찰청UTIS·하남시). url = gitsview 302 → mp4.
     { grp:"헤더" } 는 버튼 그룹 구분선.

   url 안의 토큰은 GITS 팝업에서 긁은 고정값입니다.
   토큰이 만료/변경되면  node tools/scrape-tokens.mjs --write  로 갱신.
   카메라를 새로 찾으려면  node tools/list-cams.mjs 37.5452 127.2220 4

   DECKS 인덱스( [0],[1],[2] )는 index.html 의
   <div class="player-mount" data-deck="N"> 과 짝을 이룹니다.
   ═══════════════════════════════════════════════════════════════ */

const DECKS = [

  /* ── 0 · 스타필드 하남 가는 길 ── */
  [
    { id:1277,  name:"팔당대교남단(강일방면)", type:"hls", url:"https://gitsview.gg.go.kr/1277/7TYtkgdtQJrqMHohNAXt/W8FVnYTCAhS7uvCkq9HGnk1xBIMVmd3OfGuuz5vvEeV!hls" },
    { id:61065, name:"스타필드동측",          type:"vod", url:"https://gitsview.gg.go.kr/61065/GlPs2+VybjnubfVCDMAOvus3yUXPxZmFGjVw+HWRmi0u5pj1fT87kZgZIeCgD0Kq" },
    { id:61064, name:"덕풍6교 서측",          type:"vod", url:"https://gitsview.gg.go.kr/61064/Pr7VGuKQfzGlf0vKoRZoljz3b/1k2JHVWLVxS/B2qjR/41HCxlxXIAwtnppGpL/m" },
    { id:6751,  name:"신풍로삼거리",          type:"vod", url:"https://gitsview.gg.go.kr/6751/+JIzaXpoiIizOr6pzta4Z1mhhiNWcMOkHXlnmqhG1De0Pn1KOvJR+373SYLywncM" },
    { id:6752,  name:"창우지하차도사거리",    type:"vod", url:"https://gitsview.gg.go.kr/6752/y9bpayy7X6uqn4PZnc++PhMVE/0xuL5nBMH1y2XzwbS6UumEh3/mLb0YCumqx1xK" },
  ],

  /* ── 1 · 미사·조정경기장 가는 길 ── */
  [
    { id:6750,  name:"조정경기장사거리",   type:"vod", url:"https://gitsview.gg.go.kr/6750//3Ik45+QpoCFU16monN1MX+GrTdDN2vlyAqLFDmr02rHkuPjNISlfZw3PBY/UQWC" },
    { id:60655, name:"황산사거리",         type:"vod", url:"https://gitsview.gg.go.kr/60655/zMrhYguquMVVOrMPen1dHwhKPLbSvDxzozZUDjupSHA/jBIhuQwTIA5OCDEcyxWs" },
    { id:1275,  name:"미사IC 남단(하남)",  type:"hls", url:"https://gitsview.gg.go.kr/1275/NpJJ7TbyNATWEEKgv2q0hb/EyV8D3IExwUsyHNQUmkIotJUditpZO9fPfHWDrBXn!hls" },
    { id:6748,  name:"미사교차로",         type:"vod", url:"https://gitsview.gg.go.kr/6748/jG0qy+/U3mAwN3ldEQgAN77bXw35WqLiUQhNt89thJ1QNG8sjFTieH5IamJWlUuL" },
    { id:2569,  name:"미사대교",           type:"hls", url:"https://gitsview.gg.go.kr/2569/lmjMXtpLPduqQ1xWmDxRvhBaRgquyHzK1ohzGiL2VFHyhmBby6WddRD1M9+rhz2a!hls" },
  ],

  /* ── 2 · 하남 진출입 ── */
  [
    { grp:"중부고속 남쪽 → 하남IC 진입 (~2km)" },
    { id:21,    name:"하남IC",            type:"hls", url:"https://gitsview.gg.go.kr/21/w7RTp3kGK1raguzMaFpDQgd4WoF7sa4VxPpAYaSqoeKR3MktjpLrF3yuBTYVEVfC!hls" },
    { id:6755,  name:"천현사거리",         type:"vod", url:"https://gitsview.gg.go.kr/6755/AH6/mgKXaEOE7DC/R0hDtT3GO/tf9O4y7BUKJHAddHG1IlkO9afBBdb1a5Hu9QxC" },
    { id:6757,  name:"신장사거리",         type:"vod", url:"https://gitsview.gg.go.kr/6757/unZWtGDQ5fp9xO692tSfsdbeSklYPKVQmnfHmJitbNI/Zjy7HhrIHisNdCdWy3FO" },
    { id:94794, name:"천현2",             type:"hls", url:"https://gitsview.gg.go.kr/94794/Jh+/MTatYqrC5nlcRKmpYWY87gat38F5oMC8Hh0LATD51bRVwjSkDxy0sDlLfoZN!hls" },
    { id:2708,  name:"천현삼거리",         type:"hls", url:"https://gitsview.gg.go.kr/2708/hgxwNXNzdwytHcBvfvomzTs0OjJVsPPp/9WSk3XZkSxGl6GLeLQQUKXJmaIoEUEa!hls" },

    { grp:"팔당대교 방면 (남양주·양평 → 강 건너)" },
    { id:4405,  name:"팔당대교IC",        type:"hls", url:"https://gitsview.gg.go.kr/4405/Jq9LYm2TF/GFIPrbDQHBxf8E7tJoGapr8XHAp95/YyPV9Cc03zXXR6+cp9eXk6DK!hls" },
    { id:6765,  name:"팔당대교남단(하남측)", type:"vod", url:"https://gitsview.gg.go.kr/6765/AIqh/Qvx3UQLVeNgjIuoC45kBtO4eOKvDdFO4rzNIxOXFu6eBN2scT9UI4zs23XX" },
    { id:71659, name:"남양주 하팔당삼거리", type:"hls", url:"https://gitsview.gg.go.kr/71659/NymrSSb4eNtUVEyKo77RfGI2xcSYtMJZZOShLtnfQcBL0Y7ytjPqxrPB6F4qs6XT!hls" },
    { id:71308, name:"한강시민공원(팔당)",  type:"hls", url:"https://gitsview.gg.go.kr/71308/9Snt7W/UQjAKzxaOnurpAAZZO2SF+YFpHe8LWGr9pH2tcd2tZdJsiTg+D8dQFdfa!hls" },

    { grp:"고속도로 분기·요금소 (~3km)" },
    { id:8,     name:"하남JC",            type:"hls", url:"https://gitsview.gg.go.kr/8/WXtZxPwfkl1zJwxQyeEH5gUVuSAPGQhWPN6/IG4W9YuWp1Tm3GTlsUm2so68MR3P!hls" },
    { id:20,    name:"동서울영업소",       type:"hls", url:"https://gitsview.gg.go.kr/20/ecTbaHuH3p1ETjlwqzqWfb5DV3ZMFU2fo5BgflIrFN11z8RaEJZR04YnU7ouHb9N!hls" },
    { id:8602,  name:"초일",              type:"hls", url:"https://gitsview.gg.go.kr/8602/gASVQxm5mxtfw8Hq2Wa3XBkDH2oMcNEAlUZ5dHVSx2nk10UA5zpcKrkz8O+7W0mO!hls" },
  ],
];
