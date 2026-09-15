/* ═══════════════════════════════════════════════════════════════
   /favorites/(내 CCTV) 전용 — regions/*.js 를 대신하는 자리.
   localStorage(rc-favorites) 스냅샷으로 DECKS[0] 을 합성해, player.js 가
   여느 목적지 페이지와 똑같이 재생·지도·별 토글을 붙이게 한다.
   player.js 보다 먼저 로드해야 DECKS 를 읽어간다.

   즐겨찾기는 원본 페이지(page)별로 묶어, 그룹 헤더를 그 페이지로 가는
   링크로 만든다({grp, grpHref} → player.js renderButtons 가 <a> 로 렌더).
   즐겨찾기가 하나도 없으면 #fav-mount 를 비워두고 #fav-empty 안내만 보여준다.
   ═══════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  var mount = document.getElementById("fav-mount");
  var empty = document.getElementById("fav-empty");
  if (!mount) return;

  var favs;
  try { favs = JSON.parse(localStorage.getItem("rc-favorites") || "[]"); }
  catch (e) { favs = []; }
  if (!Array.isArray(favs)) favs = [];

  if (!favs.length) {
    if (empty) empty.hidden = false;
    return;
  }

  /* 원본 페이지(page)별로 묶되, 즐겨찾기 목록(최근 등록 순) 안에서 그
     페이지가 처음 나오는 자리를 그룹 순서로 삼는다. */
  var order = [], groups = {};
  favs.forEach(function (f) {
    var key = f.page || "";
    if (!groups[key]) { groups[key] = []; order.push(key); }
    groups[key].push(f);
  });

  var deck = [];
  order.forEach(function (key) {
    var list = groups[key];
    deck.push({
      grp: (list[0].pageLabel || "다른 페이지") + " 원본 페이지 →",
      grpHref: key || undefined,
    });
    list.forEach(function (f) {
      deck.push({
        id: f.id, name: f.name, type: f.type,
        lat: f.lat, lng: f.lng, url: f.url,
        region: f.region, regionName: f.regionName,
        page: f.page, pageLabel: f.pageLabel,
      });
    });
  });

  window.DECKS = [deck];

  var pm = document.createElement("div");
  pm.className = "player-mount";
  pm.dataset.deck = "0";
  pm.dataset.label = "내 CCTV";
  mount.appendChild(pm);

  /* 재생 중 ☆ 로 해제하면(목록에 남은 버튼은 그대로 두고) 눈에 띄게
     흐리게 + 취소선 — 새로고침해야 목록에서 실제로 빠진다는 걸 알린다. */
  document.addEventListener("rc-fav-change", function (ev) {
    var detail = ev.detail || {};
    if (detail.added) return;
    var id = String(detail.key || "").split(":").pop();
    var btn = document.getElementById("cam-btn-d0-" + id);
    if (btn) btn.classList.add("is-removed");
  });
})();
