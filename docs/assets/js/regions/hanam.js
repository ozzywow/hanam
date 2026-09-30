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
    { id:1277,  name:"팔당대교남단(팔당대교방면)", type:"hls", lat:37.54770, lng:127.22091, url:"https://gitsview.gg.go.kr/1277/V5gHLEX/GI4WZblROE6X+nmP627H2X6caR/texDOpa2nxcyRRsA2duLXo4biX2sU!hls" },
    { id:61065, name:"스타필드동측",          type:"vod", lat:37.54372, lng:127.22600, url:"https://gitsview.gg.go.kr/61065/GlPs2+VybjnubfVCDMAOvm0+9qJph8iM0ZfsdYudxjRSnt2ec/U1i4gjuxYcVTeI" },
    { id:61064, name:"덕풍6교 서측",          type:"vod", lat:37.54567, lng:127.21642, url:"https://gitsview.gg.go.kr/61064/Pr7VGuKQfzGlf0vKoRZoliR2k+GomuFYKeudC/9DZf8+HxcL8pAlY1I0lLovxI9U" },
    { id:6751,  name:"신풍로삼거리",          type:"vod", lat:37.55070, lng:127.21433, url:"https://gitsview.gg.go.kr/6751/+JIzaXpoiIizOr6pzta4Z5pGjNEXnr6S8Ef3ZpUGWDsxJaoqMYd/ytRi8vGFVxND" },
    { id:6752,  name:"창우지하차도사거리",    type:"vod", lat:37.53854, lng:127.22930, url:"https://gitsview.gg.go.kr/6752/y9bpayy7X6uqn4PZnc++Pq4x+QTKGz55e+SCTZuss4PfhT4GUP2mv2aKfmKCqHWs" },
  ],

  /* ── 1 · 미사·조정경기장 가는 길 ── */
  [
    { id:6750,  name:"조정경기장사거리",   type:"vod", lat:37.56012, lng:127.20350, url:"https://gitsview.gg.go.kr/6750//3Ik45+QpoCFU16monN1Mc1HF4efeBeTrc94A7nmxoDdlfkMS0TaZOpuZhPIHX3g" },
    { id:6749,  name:"한강유역환경청사거리", type:"vod", lat:37.56895, lng:127.19700, url:"https://gitsview.gg.go.kr/6749/7gv1sFEIE14YFl6yhC+tUR1kbjXpD6eFqirnkoQj38hin84lkiDJJw/qYyZBLGOD" },
    { id:60655, name:"황산사거리",         type:"vod", lat:37.54991, lng:127.18566, url:"https://gitsview.gg.go.kr/60655/zMrhYguquMVVOrMPen1dHwHaeoaT1X86Gqh2Np0Ua9sE/IsZpVgbNfCNpLv/8cSp" },
    { id:1275,  name:"미사IC 남단(하남)",  type:"hls", lat:37.57486, lng:127.19475, url:"https://gitsview.gg.go.kr/1275/Mv4MCyIdOJaqfiz9Ex/wuKS5uTdh7inrSUVLjnbzZfU1gClhsQZDuOmBpvaj8Nj+!hls" },
    { id:6748,  name:"미사교차로",         type:"vod", lat:37.57968, lng:127.19310, url:"https://gitsview.gg.go.kr/6748/jG0qy+/U3mAwN3ldEQgAN35zn/tk0q6vY373ZF4eTAWvV2uCpqid/dGpJJ2gDcvy" },
    { id:2569,  name:"미사대교",           type:"hls", lat:37.58372, lng:127.19414, url:"https://gitsview.gg.go.kr/2569/VYBGUIp7Vp4Qqj3BD2EKTC9KZ5lgcbt0TDZFBYOpCsjMie5XyhwoGeNB8+sCSs7e!hls" },
  ],

  /* ── 2 · 하남 진출입 ── (현재 페이지 미표시: index.html 의 '하남 진출입' 섹션 제거됨.
     데이터는 보존 — 다시 넣으려면 <div class="player-mount" data-deck="2"> 섹션 복원) */
  [
    { grp:"중부고속 남쪽 → 하남IC 진입 (~2km)" },
    { id:21,    name:"하남IC",            type:"hls", lat:37.52801, lng:127.21858, url:"https://gitsview.gg.go.kr/21/ofH6n2sGl0JaGQ0ECDWUYLbL/emqAL2JL02BR62DILVjlVoGWmC2yXtWJ/MUWl+Q!hls" },
    { id:6755,  name:"천현사거리",         type:"vod", lat:37.53561, lng:127.21490, url:"https://gitsview.gg.go.kr/6755/AH6/mgKXaEOE7DC/R0hDtXlSeU6b4MajqIjD2D1JNxR0JG/2d4ddiSzgYE917AWC" },
    { id:6757,  name:"신장사거리",         type:"vod", lat:37.53786, lng:127.20460, url:"https://gitsview.gg.go.kr/6757/unZWtGDQ5fp9xO692tSfsWyus6dpUGccdH0MChhEIUqZYTUnirj8TKMXKzSqHZFQ" },
    { id:94794, name:"천현2",             type:"hls", lat:37.53169, lng:127.20598, url:"https://gitsview.gg.go.kr/94794/eR24YkQTRQUhTZTX0rrsI0eXuEj9SgxbJq0F524YTQNLEBkoK/tNHdkCyo2XyxuK!hls" },
    { id:2708,  name:"천현삼거리",         type:"hls", lat:37.52521, lng:127.22042, url:"https://gitsview.gg.go.kr/2708/V+R9CsNltQQMEnAeVpag80SQ4RTvAB1NHyGgYvu2k6uB4+AI1aaC5Co8w3EaiOhv!hls" },

    { grp:"팔당대교 방면 (남양주·양평 → 강 건너)" },
    { id:4405,  name:"팔당대교IC",        type:"hls", lat:37.54822, lng:127.24015, url:"https://gitsview.gg.go.kr/4405/Lz2OsVhY2+MVcK++vRU9ToJ8RPsmwvo0a6eY9JFF6JmUchR9xLcup/EDQoJfQe/q!hls" },
    { id:6765,  name:"팔당대교남단(하남측)", type:"vod", lat:37.54317, lng:127.23379, url:"https://gitsview.gg.go.kr/6765/AIqh/Qvx3UQLVeNgjIuoC4fxj81meif3iR1rnu7j7aPFNGoIrdtNNf88bGm8Oniw" },
    { id:71659, name:"남양주 하팔당삼거리", type:"hls", lat:37.55259, lng:127.23854, url:"https://gitsview.gg.go.kr/71659/LutKLv04P8ynXIP74H7d8T9TXuA6nWvvB+T3ibLrxxa+LIhTD6IGI5OG7HuSZ6Td!hls" },
    { id:71308, name:"한강시민공원(팔당)",  type:"hls", lat:37.55946, lng:127.23579, url:"https://gitsview.gg.go.kr/71308/9Snt7W/UQjAKzxaOnurpALz7bkMBxYPIy5Sxcfu39tQj6txbV2XdT+o7TFzUk6Gr!hls" },

    { grp:"고속도로 분기·요금소 (~3km)" },
    { id:8,     name:"하남JC",            type:"hls", lat:37.53250, lng:127.19361, url:"https://gitsview.gg.go.kr/8/ZjYk0ZDjYRjIGfY7mcp5ZPtHCoXxIh0ofUkrRi7VCJ5qPmgUzRDw1pTAXfMKbVmM!hls" },
    { id:20,    name:"동서울영업소",       type:"hls", lat:37.51773, lng:127.22149, url:"https://gitsview.gg.go.kr/20/ARu0cnQ0Ndai95aJmc56nJDKFGuRfuButqnX6MavgX9wabelFWHkmS4GvzeiBDMt!hls" },
    { id:8602,  name:"초일",              type:"hls", lat:37.53503, lng:127.18773, url:"https://gitsview.gg.go.kr/8602/u9z3g6AxPf2eJRnhdZJRYmRN5+BL8aVZ99+K4vF14TxEDHKnRjdSj9HFoBcOYYga!hls" },
  ],

  /* ── 3 · 출퇴근 시간대 병목 구간 (목적지 방면별) ── */
  [
    { grp:"하남 → 강동·잠실 (올림픽대로, 선동IC→잠실종합운동장)" },
    { id:2570,  name:"미사IC",             type:"hls", lat:37.57976, lng:127.18431, url:"https://gitsview.gg.go.kr/2570/QdByp4rvutzGxTnreWsGRaH3L8ustFQOelKpRK60zkBU+ohHkJMH1KAQ0y9C5zea!hls" },
    { id:2154,  name:"강일_서울양양",       type:"hls", lat:37.57669, lng:127.17154, url:"https://gitsview.gg.go.kr/2154/CuGFous+MZ67uS2aTkSMRltiyfJ3m3bXoM2MAfCMAU6YcgxPEVueIBmHd3h/Kx8u!hls" },
    { id:10,    name:"강일(가래여울IC 부근)", type:"hls", lat:37.57190, lng:127.16684, url:"https://gitsview.gg.go.kr/10/eHdd2osxX0ywn5Rre9YlDliI1DYKI7/DOB4GClg9ZWR01M7IkOMyWE2VnhmBghaD!hls" },
    { id:731,   name:"고덕근린공원 앞",      type:"hls", lat:37.56843, lng:127.15427, url:"https://gitsview.gg.go.kr/731/j0AvJFP5hbJR88KVzOF4TF1BNvgSCDeMf/VWytQ7uraS8Z3vmpdrq1tL55uhDdAX!hls" },
    { id:728,   name:"암사IC",             type:"hls", lat:37.55406, lng:127.12473, url:"https://gitsview.gg.go.kr/728/mtTmJLEkZ7mM9TxRfQVgEZ7j0RUOrvtHlg810fC0tiJJbwOQaNPO/EUuif7jm7c5!hls" },
    { id:6241,  name:"천호대교남단",         type:"hls", lat:37.54113, lng:127.11889, url:"https://gitsview.gg.go.kr/6241/B+UjvA58I5b4lJRtkh6K1mOEM22/k6VcwIHxtWRpJnY1H0OPC+q/r6/fh/Ftbs4f!hls" },
    { id:726,   name:"올림픽대교~천호대교", type:"hls", lat:37.53642, lng:127.11245, url:"https://gitsview.gg.go.kr/726/aRHDZrllM5xT6ljkLa4x4+bciexGjXu9NNvytFSVouOm7r0bxY4krLFUI/QbIzuQ!hls" },
    { id:725,   name:"잠실철교~올림픽대교", type:"hls", lat:37.52657, lng:127.10553, url:"https://gitsview.gg.go.kr/725/XLWC2a8zrii21HCY0xqNp8r2OZmCYWX5uwILuMiK1pqA9iNxue3SA2KnB2OOXBKC!hls" },
    { id:478,   name:"잠실대교~잠실철교", type:"hls", lat:37.52221, lng:127.09989, url:"https://gitsview.gg.go.kr/478/CX1zG5K8OvP3jfO1rA+6UTBZZyP6ScKWjdDmxkwrPGejdeP91TUCVwOXzVaZruVM!hls" },

    { grp:"하남 → 판교·강남 (수도권제1순환 남행)" },
    { id:6056,  name:"상일IC",             type:"hls", lat:37.54897, lng:127.17920, url:"https://gitsview.gg.go.kr/6056/tVqd8XLFISVdrJ26KhnI+rUe1+VlgktNXjwRvIqSPTVr8n7qVmsKdUoMo1ijtNZV!hls" },
    { id:8602,  name:"초일",              type:"hls", lat:37.53503, lng:127.18773, url:"https://gitsview.gg.go.kr/8602/u9z3g6AxPf2eJRnhdZJRYmRN5+BL8aVZ99+K4vF14TxEDHKnRjdSj9HFoBcOYYga!hls" },
    { id:8,     name:"하남JC",            type:"hls", lat:37.53250, lng:127.19361, url:"https://gitsview.gg.go.kr/8/ZjYk0ZDjYRjIGfY7mcp5ZPtHCoXxIh0ofUkrRi7VCJ5qPmgUzRDw1pTAXfMKbVmM!hls" },
    { id:7,     name:"광암터널3",          type:"hls", lat:37.51917, lng:127.18667, url:"https://gitsview.gg.go.kr/7/OfMR8SOFrYGJOqiaSUKIArLEoA8BFuZMiieFSnyDADVJgd7yWtYcuX2hgqnVWCjR!hls" },
    { id:6,     name:"광암터널2",          type:"hls", lat:37.51526, lng:127.17067, url:"https://gitsview.gg.go.kr/6/0CryX9bC9btioH60H+ojdk4raMFAsSHdi6Mo3zkoFs/5oiYuTh3yCc28Altj9asX!hls" },
    { id:5,     name:"서하남IC",           type:"hls", lat:37.51167, lng:127.14972, url:"https://gitsview.gg.go.kr/5/rwTjgpbvvudQXgtEgltWWgGEehqEWZWEzcr4OxwDQkL0qE0LnD9yNvb9zBsfRn/J!hls" },
    { id:3956,  name:"서하남",            type:"hls", lat:37.50645, lng:127.14557, url:"https://gitsview.gg.go.kr/3956/3Ua/XozKNeCNfzOZu8xs8Nqpznk+KDDY0lMUARpev/J5cK32W0+J/LgMTU5WFj74!hls" },
    { id:2359,  name:"위례",              type:"hls", lat:37.48177, lng:127.13536, url:"https://gitsview.gg.go.kr/2359//zFuGK7QJgThMPjoIu7erdcba2+8AXO9KWzn+Kg75vpYZ64dx9UeZOP/W74f5E9s!hls" },
    { id:4,     name:"송파IC",            type:"hls", lat:37.47500, lng:127.12944, url:"https://gitsview.gg.go.kr/4/3oWrEeIYJr9+2V4l+FOClTUTjXhsoWQLXDEtVSyZ6BO9NjqAhhX6uOhg/lm/p9jq!hls" },
    { id:3,     name:"성남요금소",          type:"hls", lat:37.43898, lng:127.12238, url:"https://gitsview.gg.go.kr/3/l7Ej4cCXnuiZVL8cjfONz0u0/pKXkSqxcnwU/s3++vp/odxsHAESBH+k2KSYKYfm!hls" },
    { id:1,     name:"판교분기점",          type:"hls", lat:37.40665, lng:127.09706, url:"https://gitsview.gg.go.kr/1/Jp5SlbtDYv5yJFJ15IE72yrZM5e+RupqvEQNWVnHXrB9aFdyIms5Cx0ZXzU0KurM!hls" },
    { id:96,    name:"판교JC",             type:"hls", lat:37.40528, lng:127.09500, url:"https://gitsview.gg.go.kr/96/oj4Lpitcu528bKqg6UTXnbS6wujzA0q+uVppVHlSpe1f8PygO8UP+fyztq6+Z7HF!hls" },

    { grp:"구리 → 하남 (구리암사대교·순환 남행, 아침 유입)" },
    { id:6734,  name:"토평IC",             type:"hls", lat:37.58115, lng:127.15960, url:"https://gitsview.gg.go.kr/6734/G9A9kVoBqxw4WvCFGekbtpnyRmO18WU4XnFSt0g1Ko6IW10i2c2PNKCq7wmOU9cD!hls" },
    { id:95294, name:"강동나들목",          type:"hls", lat:37.56715, lng:127.15422, url:"https://gitsview.gg.go.kr/95294/z9RT9W7dA4Em5SbiLnBdUyfPsUiADyO47MZ/8aABGe7+P74YZTGpdgMMDGr+mQ3v!hls" },
    { id:6055,  name:"강일IC",             type:"hls", lat:37.57384, lng:127.16519, url:"https://gitsview.gg.go.kr/6055/EnOJ8xrXR2SEtOwtjKdjchLOw8BbpE2tkAOdD9MrBqeriJdalG2mw+Fbj7NBtuBv!hls" },

    { grp:"남양주 덕소·도농 → 하남 (미사대교·중앙선 축, 아침 유입)" },
    { id:71658, name:"남양주 덕소IC",       type:"hls", lat:37.58671, lng:127.20581, url:"https://gitsview.gg.go.kr/71658/sepJ3sl3c7JTqLhCE9a2LbD1lSPi68EZYiwPgYL2Xf+lb9fxxIyVDXSdYT4QaLHY!hls" },
    { id:2572,  name:"남양주TG",           type:"hls", lat:37.59792, lng:127.24243, url:"https://gitsview.gg.go.kr/2572/ywQ6ZTPBcGrsiI8Qzbg8hBV2KlOFfRPYhebCBIAZ0RIcNc6VQJkxmIDUVAjKwwh7!hls" },
    { id:3176,  name:"미사대교종점",         type:"hls", lat:37.59021, lng:127.20398, url:"https://gitsview.gg.go.kr/3176/wLhz5spoTGGHXcldWkwbrMconQn8AouYwRV+C3c4TbRnNeWbmqTgasZnN3A2ozBs!hls" },
  ],

  /* ── 4 · 진출입 핵심 나들목 병목 (선동교차로·황산사거리) ── */
  [
    { grp:"선동교차로 나들목" },
    { id:60657, name:"미사8단지 앞",        type:"vod", lat:37.57175, lng:127.18224, url:"https://gitsview.gg.go.kr/60657/mjGSNbnM1FkAJRofSTHGjx90mQN1k2u6/CWgeHWa08GdAtiWdKVzZGFRQvpWSkZW" },
    { id:60656, name:"미사푸르지오2차 앞(선동IC 진입)", type:"vod", lat:37.57602, lng:127.18090, url:"https://gitsview.gg.go.kr/60656/Q0QdQo91SJRBrCCUnJifaqygU91cKFGZ4+qKhULhgg/97rEBS/5w/3pyzMfNyDt5" },
    { id:6764,  name:"선동교차로",          type:"vod", lat:37.57858, lng:127.17960, url:"https://gitsview.gg.go.kr/6764/uyOA4Zdpu91sAGd1mXcHVY4d2dpeTC+cJE3jvJbP6Ps2LhCd5dzVPiM93oV/hxHP" },

    { grp:"황산사거리 나들목" },
    { id:60655, name:"황산사거리",          type:"vod", lat:37.54991, lng:127.18566, url:"https://gitsview.gg.go.kr/60655/zMrhYguquMVVOrMPen1dHwHaeoaT1X86Gqh2Np0Ua9sE/IsZpVgbNfCNpLv/8cSp" },
    { id:60662, name:"진등교차로",          type:"vod", lat:37.55553, lng:127.19790, url:"https://gitsview.gg.go.kr/60662/TFI5/p6k885LGGyctIFqfmOKTCjITXoKmeXZ4Fu/AwYnU+T//Ytcs5wBIn6FbL92" },
    { id:6769,  name:"덕풍파출소앞사거리",  type:"vod", lat:37.54649, lng:127.19830, url:"https://gitsview.gg.go.kr/6769/2ZO0/1go67tiKDZfF03p2QW2L579YRHFIuyrMrHX5zQu5xfmKqyVWphVmG6nNJCv" },
    { id:6756,  name:"신장초교사거리",      type:"vod", lat:37.54170, lng:127.20700, url:"https://gitsview.gg.go.kr/6756/UMCTkkyE+GsOuT0kkuCaTzdVecqHI9VriaxWY77wQZY/soNKEhxr01tNSI720zzO" },
    { id:6056,  name:"상일IC",             type:"hls", lat:37.54897, lng:127.17920, url:"https://gitsview.gg.go.kr/6056/tVqd8XLFISVdrJ26KhnI+rUe1+VlgktNXjwRvIqSPTVr8n7qVmsKdUoMo1ijtNZV!hls" },
  ],

  /* ── 5 · 남양주 현대아울렛 (스페이스원·다산, 주말 쇼핑) ── */
  [
    { id:11,    name:"토평",              type:"hls", lat:37.58299, lng:127.15716, url:"https://gitsview.gg.go.kr/11/8uyquU+Cs0mvkG9uIvIH8sLLv0vrViUS1eXVHwNOC/CBtuWTTzgvxotPfadb3/BR!hls" },
    { id:6734,  name:"토평IC",            type:"hls", lat:37.58115, lng:127.15960, url:"https://gitsview.gg.go.kr/6734/G9A9kVoBqxw4WvCFGekbtpnyRmO18WU4XnFSt0g1Ko6IW10i2c2PNKCq7wmOU9cD!hls" },
    { id:2362,  name:"구리영업소",          type:"hls", lat:37.59061, lng:127.15669, url:"https://gitsview.gg.go.kr/2362/fY4t/+NhZKiRn/JB9NXPbT1OCD6oqaqlstTZ2cFZ8iMewijood16WKALSuFtxVn/!hls" },
    { id:12,    name:"남양주IC",           type:"hls", lat:37.60191, lng:127.15306, url:"https://gitsview.gg.go.kr/12/8ZDZecBRAflp6fav+ry7oeM1+xkkdAtGx4xQKmY6kHswFS43nFPPrae3gL7jBhrb!hls" },
    { id:9535,  name:"왕숙교입구",          type:"hls", lat:37.60362, lng:127.14653, url:"https://gitsview.gg.go.kr/9535/Lbam2i3b90AF3bYIdYum9kZ45feSXis2CItdeuMm70QfNnNoULWW5NM97qLdLR4d!hls" },
  ],

  /* ── 6 · 서울양양고속도로 (강일IC~미사대교~덕소IC, 주말 나들이) ── */
  [
    { id:6055,  name:"강일IC",             type:"hls", lat:37.57384, lng:127.16519, url:"https://gitsview.gg.go.kr/6055/EnOJ8xrXR2SEtOwtjKdjchLOw8BbpE2tkAOdD9MrBqeriJdalG2mw+Fbj7NBtuBv!hls" },
    { id:2154,  name:"강일_서울양양",       type:"hls", lat:37.57669, lng:127.17154, url:"https://gitsview.gg.go.kr/2154/CuGFous+MZ67uS2aTkSMRltiyfJ3m3bXoM2MAfCMAU6YcgxPEVueIBmHd3h/Kx8u!hls" },
    { id:2570,  name:"미사IC",             type:"hls", lat:37.57976, lng:127.18431, url:"https://gitsview.gg.go.kr/2570/QdByp4rvutzGxTnreWsGRaH3L8ustFQOelKpRK60zkBU+ohHkJMH1KAQ0y9C5zea!hls" },
    { id:2569,  name:"미사대교",           type:"hls", lat:37.58372, lng:127.19414, url:"https://gitsview.gg.go.kr/2569/VYBGUIp7Vp4Qqj3BD2EKTC9KZ5lgcbt0TDZFBYOpCsjMie5XyhwoGeNB8+sCSs7e!hls" },
    { id:3176,  name:"미사대교종점",         type:"hls", lat:37.59021, lng:127.20398, url:"https://gitsview.gg.go.kr/3176/wLhz5spoTGGHXcldWkwbrMconQn8AouYwRV+C3c4TbRnNeWbmqTgasZnN3A2ozBs!hls" },
    { id:71658, name:"남양주 덕소IC",       type:"hls", lat:37.58671, lng:127.20581, url:"https://gitsview.gg.go.kr/71658/sepJ3sl3c7JTqLhCE9a2LbD1lSPi68EZYiwPgYL2Xf+lb9fxxIyVDXSdYT4QaLHY!hls" },
  ],

  /* ── 7 · 팔당대교 남단~조안 (국도 45호선·북한강 방면, 주말 나들이) ── */
  [
    { id:6765,  name:"팔당대교남단",         type:"vod", lat:37.54317, lng:127.23379, url:"https://gitsview.gg.go.kr/6765/AIqh/Qvx3UQLVeNgjIuoC4fxj81meif3iR1rnu7j7aPFNGoIrdtNNf88bGm8Oniw" },
    { id:4405,  name:"팔당대교IC",          type:"hls", lat:37.54822, lng:127.24015, url:"https://gitsview.gg.go.kr/4405/Lz2OsVhY2+MVcK++vRU9ToJ8RPsmwvo0a6eY9JFF6JmUchR9xLcup/EDQoJfQe/q!hls" },
    { id:1220,  name:"팔당댐삼거리",         type:"hls", lat:37.54028, lng:127.25524, url:"https://gitsview.gg.go.kr/1220/feo+wI9pNFOPukFluh4QdJMGPIbFYn4GNQ1lwGV4urVLJwVvzqTAYjeJ6/LjKafa!hls" },
    { id:4411,  name:"남양주 팔당1터널",     type:"hls", lat:37.54041, lng:127.25700, url:"https://gitsview.gg.go.kr/4411/SdEWXdiEbFxVeAAnDauSnlZS0Zm+/eE3uL1oxQWMvd6xBs7/ltWIk968G856x2Ci!hls" },
    { id:5437,  name:"남양주 팔당4터널앞",   type:"hls", lat:37.53431, lng:127.26939, url:"https://gitsview.gg.go.kr/5437/mb2a6hjRN9phZwZbYYLbp6bsothZ7phdj5YKAhX894nEI9uwoyN9QBVMzH53jU5P!hls" },
    { id:79966, name:"남양주 봉안대교",       type:"hls", lat:37.53000, lng:127.28268, url:"https://gitsview.gg.go.kr/79966/lJPYuKfONG5PBzsLD8toM0kVJnLVlSwhD/zoVD6TYuAHE8ekOBTmuItjHgiUFhxM!hls" },
    { id:4410,  name:"조안IC",             type:"hls", lat:37.53292, lng:127.30282, url:"https://gitsview.gg.go.kr/4410/nFBNP9cX46/grWDcR+GxK1CNsxVYm77nsT9dLtiLlaB1GT3zg+6EzuYSE56T97OF!hls" },
  ],
];
