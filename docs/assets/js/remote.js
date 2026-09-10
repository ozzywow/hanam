/* ═══════════════════════════════════════════════════════════════
   떠 있는 리모콘(.rc-remote) — 페이지 어디서든 한 번의 탭으로 홈 복귀 +
   내 CCTV·공유. 구 HUD(뎁스 브레드크럼, 2026-09-05 폐지)와 다른 물건:
   조상 경로가 아니라 "전역 액션"만 담는다. 상단 홈 링크가 작아 운전 중
   복귀가 불편하다는 문제 대응.

   버튼(우하단, 위 → 아래. 접기/펼치기 없이 항상 노출):
     🏠 홈     — 큰 원형 잉크 버튼(주 버튼). 단일 탭으로 "/".
     ★ 내 CCTV — 등록한 카메라가 있을 때만.
     🔗 공유   — 현재 페이지(+지금 보는 CCTV) 링크를 navigator.share/클립보드로.
   모든 버튼 잉크(--fg) 채움 + 페이지색 링으로 배경(영상 포함)과 분리.

   "상위 페이지로"(경로 한 단계 위)는 리모콘에서 빼고, 각 페이지 제목(h1)
   앞의 동그란 ‹ 버튼(.rc-back)으로 옮겼다(2026-09-10). 카카오톡 채널 화면
   처럼 제목 왼쪽에서 뒤로 가는 흔한 패턴. 홈("/")엔 상위가 없어 안 붙는다.
   URL 경로 기준(브라우저 이력 아님): 목적지 /지역/슬러그/ → 지역허브 /지역/ → 홈.

   페이지별 노출:
     "/"           → 홈 버튼 숨김(자기 자신). ★·공유.
     "/favorites/" → ★ 숨김(자기 자신). 홈·공유.
     그 외          → 홈 + ★(있으면) + 공유.

   공유 링크 복원: 공유 URL 에 ?cam=<id> 를 붙인다. player.js 가 로드 시
   그 파라미터로 해당 카메라부터 재생한다. 재생 토큰은 URL 에 없고 id 만
   있으므로 링크가 만료되지 않는다(즐겨찾기와 같은 원리). 지금 보는
   카메라는 player.js 가 window.rcNowPlaying = {id,name,page} 로 알려준다.

   스크롤을 내리는 동안에는 아래로 숨겨 푸터·본문 끝을 가리지 않는다
   (구 HUD 폐지 사유). 멈추거나 올리면 다시 나타난다.
   ═══════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  if (document.querySelector(".rc-remote")) return;

  var path = location.pathname.replace(/\/index\.html$/, "/");
  var isHome = path === "/";
  var isFavPage = path === "/favorites/";
  var isInstallPage = path === "/help/install/";          // 홈 화면 추가 안내 — 홈 버튼만(공유 버튼 혼동 방지)

  /* 즐겨찾기 개수 — player.js(window.rcFav) 없는 페이지(지역 인덱스·약관 등)도
     있으므로 localStorage 를 직접 읽는다. 리모콘은 개수만 필요(토글 안 함). */
  function favCount() {
    try {
      var a = JSON.parse(localStorage.getItem("rc-favorites") || "[]");
      return Array.isArray(a) ? a.length : 0;
    } catch (e) { return 0; }
  }

  var SVG = {
    home: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 11l9-8 9 8M6 10v10h4v-6h4v6h4V10"/></svg>',
    share: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12M8 7l4-4 4 4M5 12v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6"/></svg>',
    back: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 18l-6-6 6-6"/></svg>'
  };

  /* 경로상 한 단계 위 URL. 목적지(/a/b/) → 지역허브(/a/) → 홈(/). 파일(/x.html)이면
     그 디렉터리. 최상위("/")면 상위 없음(null) → 버튼 자체를 안 만든다.
     브라우저 방문 이력(history.back)이 아니라 순수 URL 경로 기준이다. */
  function parentUp(p) {
    if (!p || p === "/") return null;
    var s = p.replace(/\/+$/, "");
    var i = s.lastIndexOf("/");
    return i > 0 ? s.slice(0, i + 1) : "/";
  }

  function ga(name, params) {
    try { if (window.gtag) window.gtag("event", name, params || {}); } catch (e) {}
  }

  var wrap = document.createElement("div");
  wrap.className = "rc-remote";
  wrap.setAttribute("aria-label", "빠른 이동");

  /* 위 → 아래 순서: 홈(주 버튼) · 내 CCTV · 공유. 홈페이지엔 홈이 없어 균일. */
  var items = [];

  if (!isHome) {
    var homeBtn = document.createElement("a");
    homeBtn.className = "rc-remote-btn rc-remote-home rc-remote-primary";
    homeBtn.href = "/";
    homeBtn.innerHTML = SVG.home;
    homeBtn.setAttribute("aria-label", "홈으로");
    homeBtn.title = "홈";
    homeBtn.addEventListener("click", function () { ga("remote_home"); });
    items.push(homeBtn);
  }

  if (!isFavPage && !isInstallPage && favCount() > 0) {
    var favBtn = document.createElement("a");
    favBtn.className = "rc-remote-btn rc-remote-fav";
    favBtn.href = "/favorites/";
    favBtn.innerHTML = '<span aria-hidden="true">★</span>';
    favBtn.setAttribute("aria-label", "내 CCTV 보기");
    favBtn.title = "내 CCTV";
    favBtn.addEventListener("click", function () { ga("remote_fav"); });
    items.push(favBtn);
  }

  if (!isInstallPage) {
    var shareBtn = document.createElement("button");
    shareBtn.type = "button";
    shareBtn.className = "rc-remote-btn rc-remote-share";
    shareBtn.innerHTML = SVG.share;
    shareBtn.setAttribute("aria-label", "이 페이지 공유하기");
    shareBtn.title = "공유하기";
    shareBtn.addEventListener("click", doShare);
    items.push(shareBtn);
  }

  items.forEach(function (el) { wrap.appendChild(el); });
  document.body.appendChild(wrap);

  /* ── 페이지 제목(h1) 앞 뒤로가기 버튼(.rc-back) ──────────────────
     구 리모콘 "↑ 상위" 를 대신한다. 경로 한 단계 위로. 홈("/")엔 상위가
     없어 안 붙는다. h1 이 .h1-row 같은 flex 줄 안에 있으면 그 줄의 첫
     항목으로 끼우고, 그냥 .wrap 직속이면 .rc-titlebar 로 감싼다. */
  (function backButton() {
    if (isHome) return;
    var upHref = parentUp(path);
    if (!upHref) return;
    var h1 = document.querySelector(".wrap h1");
    if (!h1 || h1.classList.contains("brand")) return;

    var back = document.createElement("a");
    back.className = "rc-back";
    back.href = upHref;
    back.innerHTML = SVG.back;
    back.setAttribute("aria-label", "상위 페이지로");
    back.title = "상위 페이지";
    back.addEventListener("click", function () { ga("remote_up", { to: upHref }); });

    /* theme.js·weather.js 가 먼저 실행돼 h1 을 .h1-row(flex) 로 감싼 상태가
       보통이다 — 그 줄의 첫 항목으로 끼우면 [‹][제목][날씨·테마] 가 된다.
       아직 안 감싼 경우만 .rc-titlebar 로 감싼다. */
    var parent = h1.parentElement;
    if (parent && parent.classList.contains("h1-row")) {
      parent.insertBefore(back, h1);
    } else {
      var bar = document.createElement("div");
      bar.className = "rc-titlebar";
      parent.insertBefore(bar, h1);
      bar.appendChild(back);
      bar.appendChild(h1);
    }
  })();

  /* ── 스크롤을 내리는 동안 숨김 ── */
  var lastY = window.pageYOffset, idle = null;
  window.addEventListener("scroll", function () {
    var y = window.pageYOffset;
    if (y > 160 && y > lastY + 4) wrap.classList.add("is-hidden");
    else if (y < lastY - 4) wrap.classList.remove("is-hidden");
    lastY = y;
    clearTimeout(idle);
    idle = setTimeout(function () { wrap.classList.remove("is-hidden"); }, 800);
  }, { passive: true });

  /* ── 공유 ── */
  function shareUrl() {
    var np = window.rcNowPlaying;
    var base = (np && np.page) || path;
    return location.origin + base + (np && np.id ? "?cam=" + np.id : "");
  }
  function doShare() {
    var url = shareUrl();
    var title = document.title || "로드CCTV";
    ga("remote_share", { has_cam: /\?cam=/.test(url) });
    if (navigator.share) { navigator.share({ title: title, url: url }).catch(function () {}); return; }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(
        function () { toast("링크가 복사되었습니다"); },
        function () { window.prompt("이 주소를 복사하세요", url); }
      );
      return;
    }
    window.prompt("이 주소를 복사하세요", url);
  }

  var toastEl = null, toastTimer = null;
  function toast(msg) {
    if (!toastEl) {
      toastEl = document.createElement("div");
      toastEl.className = "rc-remote-toast";
      wrap.appendChild(toastEl);
    }
    toastEl.textContent = msg;
    toastEl.classList.add("is-on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("is-on"); }, 2600);
  }
})();
