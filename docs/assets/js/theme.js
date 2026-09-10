/* ═══════════════════════════════════════════════════════════════
   수동 다크/라이트 테마 토글 — 타이틀 옆(.h1-row > .h1-extras) 스위치.
   클릭할 때마다 반대 테마로 전환.

   아이콘(☀️/🌙) 버튼이었던 1차 구현을 스위치 + 텍스트로 교체(2026-09-05)
   — 라이트 모드에서 버튼이 잘 안 보이고, 해 이모지가 날씨 배지의 맑음
   아이콘과 똑같아 헷갈린다는 피드백. 라벨은 "다크 모드" 고정 텍스트,
   스위치의 on/off 로 지금 상태를 보여준다(이 컨트롤이 뭘 하는지와
   지금 상태를 텍스트+시각 상태 둘 다로 정확히 전달).

   실제 테마 적용(<html data-theme="dark|light">)은 FOUC(엉뚱한 테마로
   잠깐 그려짐) 방지를 위해 각 페이지 <head> 맨 앞의 인라인 스크립트가
   이 파일보다 먼저(본문 파싱 전) 처리한다 — 이 파일은 그 결과를 읽어
   스위치 상태만 맞추고, 클릭 시 localStorage(rc-theme)에 저장 + 갱신한다.
   ═══════════════════════════════════════════════════════════════ */

/* PWA service worker 등록 — theme.js 는 101개 페이지 전부에서 로드되므로
   여기 한 곳이면 사이트 전역(scope:/)에 적용된다. 등록은 load 이후로 미뤄
   첫 페인트·영상 로딩과 대역폭을 다투지 않게 한다. */
if ("serviceWorker" in navigator) {
  window.addEventListener("load", function () {
    navigator.serviceWorker.register("/sw.js").catch(function () {});
  });
}

(function () {
  "use strict";
  var KEY = "rc-theme";

  function isDark() {
    var explicit = document.documentElement.getAttribute("data-theme");
    if (explicit === "dark") return true;
    if (explicit === "light") return false;
    return !!(window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches);
  }

  var h1 = document.querySelector(".wrap h1");
  if (!h1) return;

  /* 타이틀 옆에 스위치를 놓기 위해 h1 을 flex 행으로 감싼다(이미 있으면
     재사용). 실제 스위치는 그 안의 .h1-extras 에 넣는다 — weather.js 의
     날씨 배지와 같은 칸을 공유해, 부가 요소끼리 margin-left:auto 경쟁
     없이 붙어 보이게 한다. */
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

  var btn = document.createElement("button");
  btn.type = "button";
  btn.className = "theme-toggle";
  btn.setAttribute("role", "switch");
  btn.innerHTML =
    '<span class="theme-toggle-label">다크 모드</span>' +
    '<span class="theme-toggle-track" aria-hidden="true"><span class="theme-toggle-knob"></span></span>';
  extras.appendChild(btn);

  function sync() {
    btn.setAttribute("aria-checked", isDark() ? "true" : "false");
  }
  sync();

  btn.addEventListener("click", function () {
    var next = isDark() ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try { localStorage.setItem(KEY, next); } catch (e) {}
    sync();
  });
})();
