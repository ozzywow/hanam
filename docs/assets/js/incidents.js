/* ═══════════════════════════════════════════════════════════════
   실시간 사고·통제 — /api/incidents (경기도교통정보센터 돌발상황 프록시) 를 받아

   (a) pagenav 아래 전역 접이식 리스트 — 하남 주변 관련 항목 전체
   (b) 각 라우트 섹션에 그 구간 좌표 2km 이내 항목만

   경로 매칭은 overview.js 와 같은 규칙(pagenav 앵커 → 섹션 → data-deck →
   cams.js DECKS 좌표)으로 구한다. DECKS 미로딩·API 실패 시 조용히 숨김.
   ═══════════════════════════════════════════════════════════════ */
(function () {
  var API = "/api/incidents";
  var NEAR_KM = 1.2;
  var REFRESH_MS = 180000;
  var GLOBAL_MAX = 20;
  var SECTION_MAX = 8;

  if (typeof DECKS === "undefined") return;
  var pagenav = document.querySelector(".pagenav");
  if (!pagenav) return;

  /* pagenav → 경로 목록 */
  var routes = [];
  pagenav.querySelectorAll('a[href^="#"]').forEach(function (a) {
    var id = a.getAttribute("href").slice(1);
    var sec = document.getElementById(id);
    var mount = sec && sec.querySelector(".player-mount[data-deck]");
    var cams = mount && DECKS[+mount.dataset.deck];
    if (!cams) return;
    var pts = cams
      .filter(function (c) { return c.id && isFinite(c.lat) && isFinite(c.lng); })
      .map(function (c) { return [c.lat, c.lng]; });
    if (!pts.length) return;
    routes.push({ id: id, label: a.textContent.trim(), section: sec, pts: pts, box: null, list: null });
  });
  if (!routes.length) return;

  /* ── 전역 블록 ── */
  var g = document.createElement("section");
  g.className = "incidents incidents-global";
  g.hidden = true;
  g.innerHTML =
    '<button type="button" class="incidents-toggle" aria-expanded="false">' +
      '<span class="incidents-dot"></span>' +
      '<span class="incidents-title">실시간 사고·통제</span>' +
      '<span class="incidents-count"></span>' +
      '<span class="incidents-chev" aria-hidden="true"></span>' +
    '</button>' +
    '<div class="incidents-panel" hidden>' +
      '<ul class="incidents-list"></ul>' +
      '<p class="incidents-src"></p>' +
    '</div>';
  pagenav.insertAdjacentElement("afterend", g);

  var gBtn = g.querySelector(".incidents-toggle");
  var gPanel = g.querySelector(".incidents-panel");
  var gList = g.querySelector(".incidents-list");
  var gCount = g.querySelector(".incidents-count");
  var gTitle = g.querySelector(".incidents-title");
  var gSrc = g.querySelector(".incidents-src");

  gBtn.addEventListener("click", function () {
    if (gBtn.disabled) return;
    var open = gPanel.hidden;
    gPanel.hidden = !open;
    gBtn.setAttribute("aria-expanded", open ? "true" : "false");
    g.classList.toggle("is-open", open);
  });

  function sectionBox(r) {
    if (r.box) return r.box;
    var d = document.createElement("div");
    d.className = "incidents incidents-section";
    d.hidden = true;
    d.innerHTML =
      '<strong class="incidents-section-h">이 구간 사고·통제</strong>' +
      '<ul class="incidents-list"></ul>';
    var anchor = r.section.querySelector(".player-mount") || r.section.firstElementChild;
    anchor.insertAdjacentElement("afterend", d);
    r.box = d;
    r.list = d.querySelector(".incidents-list");
    return d;
  }

  /* ── 유틸 ── */
  function haversineKm(aLat, aLng, bLat, bLng) {
    var R = 6371, toR = Math.PI / 180;
    var dLat = (bLat - aLat) * toR, dLng = (bLng - aLng) * toR;
    var la1 = aLat * toR, la2 = bLat * toR;
    var s = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    return 2 * R * Math.asin(Math.sqrt(s));
  }
  function nearRoute(r, lat, lng) {
    for (var i = 0; i < r.pts.length; i++) {
      if (haversineKm(lat, lng, r.pts[i][0], r.pts[i][1]) <= NEAR_KM) return true;
    }
    return false;
  }

  var TYPE_CLASS = {
    "교통사고": "acc", "차량사고": "acc",
    "공사": "work", "차량고장": "brk", "기타돌발": "etc",
  };
  var TYPE_SEV = { "교통사고": 0, "차량사고": 0, "공사": 1, "차량고장": 2 };
  function sevSort(a, b) {
    var s = (TYPE_SEV[a.type] == null ? 3 : TYPE_SEV[a.type]) -
            (TYPE_SEV[b.type] == null ? 3 : TYPE_SEV[b.type]);
    return s || (b.at || "").localeCompare(a.at || "");
  }
  function fill(ul, items, max, showWhere) {
    ul.innerHTML = "";
    var sorted = items.slice().sort(sevSort);
    sorted.slice(0, max).forEach(function (it) { ul.appendChild(li(it, showWhere)); });
    if (sorted.length > max) {
      var more = document.createElement("li");
      more.className = "incidents-more";
      more.textContent = "…외 " + (sorted.length - max) + "건";
      ul.appendChild(more);
    }
  }
  function relTime(iso) {
    if (!iso) return "";
    var s = (Date.now() - new Date(iso).getTime()) / 1000;
    if (s < 60) return "방금";
    if (s < 3600) return Math.floor(s / 60) + "분 전";
    if (s < 86400) return Math.floor(s / 3600) + "시간 전";
    return Math.floor(s / 86400) + "일 전";
  }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }
  function matchedLabels(it) {
    return routes
      .filter(function (r) { return nearRoute(r, it.lat, it.lng); })
      .map(function (r) { return r.label; })
      .join(", ");
  }
  function li(it, showWhere) {
    var el = document.createElement("li");
    var cls = TYPE_CLASS[it.type] || "etc";

    var a = (it.from && it.from !== "-") ? it.from : "";
    var b = it.place || "";
    var loc = (a && b && a !== b) ? (a + " → " + b) : (b || a);
    if (showWhere) {
      var w = matchedLabels(it);
      if (w) loc = loc ? (loc + " · " + w) : w;
    }

    el.innerHTML =
      '<span class="incidents-tag ' + cls + '">' + esc(it.type) + "</span>" +
      '<span class="incidents-body">' +
        (it.msg ? '<span class="incidents-msg">' + esc(it.msg) + "</span>" : "") +
        (loc ? '<span class="incidents-loc">' + esc(loc) + "</span>" : "") +
      "</span>" +
      '<span class="incidents-time">' + esc(relTime(it.at)) + "</span>";
    return el;
  }
  function hhmm(d) {
    return ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2);
  }

  /* ── 렌더 ── */
  function render(items, updated) {
    var relevant = items.filter(function (it) {
      return routes.some(function (r) { return nearRoute(r, it.lat, it.lng); });
    });

    g.hidden = false;
    var clear = relevant.length === 0;
    g.classList.toggle("is-clear", clear);
    gBtn.disabled = clear;
    gCount.textContent = clear ? "" : String(relevant.length);
    gTitle.textContent = clear ? "지금 하남 주변 사고·통제 없음" : "실시간 사고·통제";

    fill(gList, relevant, GLOBAL_MAX, true);
    gSrc.textContent = "출처: 하남시 교통정보센터 · " +
      hhmm(updated ? new Date(updated) : new Date()) + " 기준";
    if (clear) {
      gPanel.hidden = true;
      gBtn.setAttribute("aria-expanded", "false");
      g.classList.remove("is-open");
    }

    routes.forEach(function (r) {
      var mine = items.filter(function (it) { return nearRoute(r, it.lat, it.lng); });
      if (!mine.length) { if (r.box) r.box.hidden = true; return; }
      sectionBox(r).hidden = false;
      fill(r.list, mine, SECTION_MAX);
    });
  }

  function load() {
    fetch(API, { headers: { "accept": "application/json" } })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) {
        if (!j || !j.ok || !Array.isArray(j.items)) { g.hidden = true; return; }
        render(j.items, j.updated);
      })
      .catch(function () { g.hidden = true; });
  }

  load();
  setInterval(load, REFRESH_MS);
})();
