/* ═══════════════════════════════════════════════════════════════
   지역 허브 페이지 상단 날씨 배지 — "맑음 ☀️ · 23°C" 형태.
   /api/weather (Open-Meteo 프록시, functions/api/weather.js) 를 호출.

   좌표는 지역별 대표 좌표(region-status.js 의 PTS 첫 점과 동일 지점) 재사용.
   새 지역 추가 시 이 표에도 slug·좌표 추가 필요 — 안 하면 배지가 그냥 안 뜬다(조용히 무시).
   ═══════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  var LATLON = {                              // slug: [lat, lon]
    "seoul-cityhall":   [37.56632, 126.97750],
    "dongdaemun":       [37.57017, 127.00852],
    "sinchon":          [37.55472, 126.93739],
    "yeouido":          [37.52842, 126.91630],
    "hongdae":          [37.55905, 126.92647],
    "gangnam":          [37.49789, 127.02807],
    "express-terminal": [37.50705, 127.00873],
    "seongsu":          [37.54070, 127.03600],
    "sadang":           [37.47699, 126.98127],
    "yangjae":          [37.48421, 127.03391],
    "jamsil":           [37.51349, 127.09963],
    "guro-gasan":       [37.47915, 126.88980],
    "pangyo":           [37.39635, 127.11261],
    "hanam":            [37.54770, 127.22091],
    "gimpo-airport":    [37.56147, 126.80693],
    "incheon-airport":  [37.47172, 126.48542],
  };

  /* WMO 날씨 코드(Open-Meteo) → 한글 표기·이모지 */
  var CODE = {
    0: ["맑음", "☀️"], 1: ["대체로 맑음", "🌤️"], 2: ["구름 조금", "⛅"], 3: ["흐림", "☁️"],
    45: ["안개", "🌫️"], 48: ["안개", "🌫️"],
    51: ["이슬비", "🌦️"], 53: ["이슬비", "🌦️"], 55: ["이슬비", "🌦️"],
    56: ["언 이슬비", "🌧️"], 57: ["언 이슬비", "🌧️"],
    61: ["비", "🌧️"], 63: ["비", "🌧️"], 65: ["강한 비", "🌧️"],
    66: ["언 비", "🌧️"], 67: ["언 비", "🌧️"],
    71: ["눈", "❄️"], 73: ["눈", "❄️"], 75: ["함박눈", "❄️"], 77: ["눈날림", "🌨️"],
    80: ["소나기", "🌦️"], 81: ["소나기", "🌦️"], 82: ["강한 소나기", "🌦️"],
    85: ["눈소나기", "🌨️"], 86: ["눈소나기", "🌨️"],
    95: ["뇌우", "⛈️"], 96: ["우박 뇌우", "⛈️"], 99: ["우박 뇌우", "⛈️"],
  };

  var slug = (location.pathname.match(/^\/([a-z0-9-]+)\//) || [])[1];
  var ll = slug && LATLON[slug];
  if (!ll) return;

  /* .wrap > h1 이 기본형이지만, theme.js 가 먼저 실행돼 h1 을 .h1-row 로
     이미 감쌌을 수도 있음(순서 무관하게 안전하도록 후손 선택자 사용) */
  var h1 = document.querySelector(".wrap h1");
  if (!h1) return;

  /* 타이틀 옆에 배지를 놓기 위해 h1 을 flex 행으로 감싼다(이미 있으면 재사용).
     실제 배지는 그 안의 .h1-extras 에 넣는다 — theme.js 의 테마 토글과
     같은 칸을 공유해, 부가 요소끼리 margin-left:auto 경쟁 없이 붙어
     보이게 한다(2026-09-05). */
  var row = h1.parentNode.classList && h1.parentNode.classList.contains("h1-row")
    ? h1.parentNode : null;
  if (!row) {
    row = document.createElement("div");
    row.className = "h1-row";
    h1.parentNode.insertBefore(row, h1);
    row.appendChild(h1);
  }
  var extras = row.querySelector(":scope > .h1-extras");
  if (!extras) {
    extras = document.createElement("span");
    extras.className = "h1-extras";
    row.appendChild(extras);
  }

  /* 도착 전에도 자리를 미리 차지해서(레이아웃 밀림 방지, 2026-09-05) 로딩
     문구로 시작 — hidden 으로 숨겼다가 나중에 나타나면 옆 배지가 밀리던
     문제(CLS)를 없앤다. 실패 시에만 다시 숨긴다. */
  var badge = document.createElement("span");
  badge.className = "weather is-loading";
  badge.textContent = "날씨 확인 중";
  extras.appendChild(badge);

  fetch("/api/weather?lat=" + ll[0] + "&lon=" + ll[1], { headers: { accept: "application/json" } })
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (j) {
      if (!j || !j.ok || j.temp == null) { badge.hidden = true; return; }
      var c = CODE[j.code] || [null, null];
      badge.classList.remove("is-loading");
      badge.innerHTML =
        (c[1] ? '<span aria-hidden="true">' + c[1] + "</span> " : "") +
        (c[0] ? c[0] + " · " : "") + j.temp + "°C";
    })
    .catch(function () { badge.hidden = true; });
})();
