/* ═══════════════════════════════════════════════════════════════
   페이지 통합 설명 펼치기(2026-09-05, 3차 개편 — FOUC 수정) — 소개·도로개요·
   혼잡캘린더·FAQ·대중교통 등 페이지에 흩어진 부가 설명 전부를 타이틀 옆
   버튼 하나(.detail-toggle)로 한 번에 접고 편다. 섹션별 개별 토글(구
   route-toggle/info-toggle/faq-*)은 폐지 — 운전자는 이미 아는 길이라
   평소엔 전부 접힘, 접힌 항목마다 따로 탭할 이유가 없다는 판단.

   대상: .lead(+뒤따르는 무명 <p> 도입부), 플레이어·지도·카메라 버튼이 없는
   .route 섹션 전체(제목 포함, 통째로). 제외 = [data-no-collapse].

   숨김/표시는 이 스크립트가 아니라 styles.css 의 순수 CSS 규칙(:has() 로
   대상을 가려낸다)이 담당한다 — 이 스크립트는 .wrap 에 클래스 하나
   (is-detail-open)만 토글한다. 예전엔 이 스크립트가 각 대상에 직접
   .detail-body 클래스를 붙였는데, 그 클래스가 붙기 전(스크립트가 본문
   맨 아래에서 실행되기 전) 찰나 동안 브라우저가 "전부 펼쳐진" 원본 HTML을
   그대로 페인트해버려 접힌 설명이 잠깐 나타났다 사라지는 것처럼 보였다
   (FOUC). CSS 가 처음부터 숨겨두면 이 스크립트가 몇 ms 늦게 실행돼도
   깜빡임이 없다.

   펼친 상태 기억 — 운전자는 대부분 자기 다니는 길을 이미 알고, 글은 어디까지나
   보조 수단이라 기본은 항상 전부 접힘을 유지한다. 대신 사용자가 그 페이지를
   한 번 펼쳐봤으면 localStorage 에 저장해 재방문 시 펼친 채로 보여준다(페이지
   단위 — 섹션마다 따로 기억하지 않는다).
   ═══════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  var STATE_KEY = "rc-page-open";

  var _state = (function () {
    try { return JSON.parse(localStorage.getItem(STATE_KEY) || "{}") || {}; }
    catch (e) { return {}; }
  })();
  function saveState() {
    try { localStorage.setItem(STATE_KEY, JSON.stringify(_state)); } catch (e) {}
  }
  function wantsOpen() { return !!_state[location.pathname]; }
  function remember(open) {
    if (open) _state[location.pathname] = 1; else delete _state[location.pathname];
    saveState();
  }

  /* ── 해시로 들어온 링크(다른 페이지의 "혼잡 캘린더 요약" 등)가 접힌 영역을
     가리키면, 그 페이지는 강제로 펼침 상태로 시작한다 — 안 그러면 브라우저가
     스크롤하려는 지점이 display:none 이라 조용히 실패한다. ── */
  var hashEl = null;
  if (location.hash && location.hash !== "#top") {
    try { hashEl = document.getElementById(decodeURIComponent(location.hash.slice(1))); }
    catch (e) {}
  }

  /* ── §1. 펼침 대상 파악 — 실제 숨김은 CSS(:has() 기반) 담당, 여기서는
     버튼을 어디 놓을지·해시가 그 안을 가리키는지만 확인한다. CSS 쪽
     선택자(styles.css 의 .wrap > .route:not(:has(...)) 규칙)와 아래
     player/map/cams 판정 기준이 반드시 같아야 한다. ── */
  function isCollapsibleRoute(sec) {
    return !sec.hasAttribute("data-no-collapse") &&
      !sec.querySelector(".player-mount, .player, .cams, .map, .omap");
  }
  var lead = document.querySelector(".wrap > .lead");
  var routeSections = [].filter.call(document.querySelectorAll(".wrap > .route"), isCollapsibleRoute);
  var firstBody = lead || routeSections[0];

  if (firstBody) {
    var wrap = document.querySelector(".wrap") || document.body;
    var targetRoute = hashEl && hashEl.closest(".route");
    var forceOpen = !!(
      (targetRoute && routeSections.indexOf(targetRoute) !== -1) ||
      (lead && hashEl && lead.contains(hashEl))
    );
    var open = wantsOpen() || forceOpen;

    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "detail-toggle";
    btn.textContent = "자세히 보기";
    btn.setAttribute("aria-expanded", "false");
    btn.setAttribute("aria-label", "자세히 보기");

    /* 타이틀 옆이 아니라, 설명영역 바로 위(상세 페이지면 CCTV 버튼 바로 밑)에
       둔다 — 버튼이 자기가 여닫는 내용 바로 앞에 있어야, 접힌 내용이 아래에서
       늘었다 줄었다 해도 버튼 자체의 화면 위치는 접힘/펼침 상태와 무관하게
       고정된다(펼친 뒤 버튼을 다시 찾아 스크롤해 올라와야 하는 문제 방지). */
    firstBody.before(btn);

    function apply(isOpen) {
      wrap.classList.toggle("is-detail-open", isOpen);
      btn.classList.toggle("is-open", isOpen);
      btn.setAttribute("aria-expanded", isOpen ? "true" : "false");
      btn.setAttribute("aria-label", isOpen ? "접기" : "자세히 보기");
      btn.textContent = isOpen ? "접기" : "자세히 보기";
    }
    apply(open);
    if (forceOpen) remember(true);

    btn.addEventListener("click", function () {
      var isOpen = !wrap.classList.contains("is-detail-open");
      apply(isOpen);
      remember(isOpen);
    });

    if (forceOpen && hashEl) hashEl.scrollIntoView();
  }

  /* ── §2. 지역 카드 이름 줄임 + 상태 점 ──────────────────
     지역 카드(.region-card)만 대상. 이름(+이모지)을 .rc-name 으로 감싸
     2열 칩에서 폭 넘치면 … 말줄임, 표시등(.card-sig)은 이름 앞에 붙인다.
     카드 펼치기(구 .card-more, 설명 .desc)는 폐지(2026-09-05) — 펼쳐야
     보이던 부가 설명 자체가 불필요하다는 판단으로 함께 제거. */
  document.querySelectorAll(".region-card").forEach(function (card) {
    var h = card.querySelector("h2, h3");
    if (!h || h.querySelector(".rc-name")) return;

    var name = document.createElement("span");
    name.className = "rc-name";
    while (h.firstChild) name.appendChild(h.firstChild);
    name.title = (name.textContent || "").trim();
    h.appendChild(name);

    var sig = document.createElement("span");
    sig.className = "card-sig";
    sig.setAttribute("aria-hidden", "true");
    h.insertBefore(sig, h.firstChild);
  });
})();
