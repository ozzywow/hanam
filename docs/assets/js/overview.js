/* ═══════════════════════════════════════════════════════════════
   개요 지도 — 페이지 상단에서 전체 병목 구간을 한눈에.

   pagenav 의 앵커 링크 중 해당 섹션에 <div class="player-mount" data-deck="N">
   를 가진 것을 '경로'로 보고, cams.js 의 DECKS[N] 좌표를 이어 선으로 그린다.
   grp 구분선에서 선을 끊는다 (한 경로가 여러 구간이면 선도 여러 개).

   - 색: pagenav 그룹 라벨(주중/주말) 기준.
   - 데스크톱: 선에 마우스를 올리면 그 경로만 강조 + 라벨. 선 클릭 → 섹션 이동.
   - 터치: 선은 조작 대상이 아님(보기·이동만). 이동은 아래 pagenav 목록으로.
   - 공통: 목록 항목을 누르면 지도에서 해당 경로가 잠깐 강조되고,
     페이지를 스크롤하면 현재 보고 있는 섹션의 경로가 지도에 표시된다(미니맵).
   - Leaflet / DECKS 미로딩 시 컨테이너를 숨기고 아무것도 안 함.
   ═══════════════════════════════════════════════════════════════ */
(function () {
  var el = document.getElementById("overview-map");
  if (!el) return;
  if (!window.L || typeof DECKS === "undefined") { el.hidden = true; return; }

  var COARSE = !!(window.matchMedia && window.matchMedia("(pointer: coarse)").matches);
  var COLORS = { "주중": "#d93025", "주말": "#1b64da" };
  var FALLBACK = "#1b64da";

  /* pagenav → 경로 목록 (섹션에 data-deck 있는 링크만) */
  var routes = [];
  document.querySelectorAll(".pagenav-grp").forEach(function (grpEl) {
    var labelEl = grpEl.querySelector(".pagenav-label");
    var gLabel = (labelEl ? labelEl.textContent : "").trim();
    grpEl.querySelectorAll('a[href^="#"]').forEach(function (a) {
      var id = a.getAttribute("href").slice(1);
      var sec = document.getElementById(id);
      var mount = sec && sec.querySelector(".player-mount[data-deck]");
      if (!mount) return;
      var cams = DECKS[+mount.dataset.deck];
      if (!cams) return;
      routes.push({
        id: id, link: a, section: sec, label: a.textContent.trim(),
        color: COLORS[gLabel] || FALLBACK, cams: cams, lines: [], dots: [],
      });
    });
  });
  if (!routes.length) { el.hidden = true; return; }

  el.hidden = false;
  var map = L.map(el, { scrollWheelZoom: false, attributionControl: true });
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(map);

  var allPts = [];
  var label = L.tooltip({ direction: "top", offset: [0, -4], opacity: 1, className: "omap-tip" });

  routes.forEach(function (r) {
    /* grp 로 구간 분할 */
    var segs = [[]];
    r.cams.forEach(function (c) {
      if (c.grp) { if (segs[segs.length - 1].length) segs.push([]); return; }
      if (c.id && isFinite(c.lat) && isFinite(c.lng)) segs[segs.length - 1].push([c.lat, c.lng]);
    });
    segs = segs.filter(function (s) { return s.length; });
    if (!segs.length) return;

    var group = L.featureGroup().addTo(map);
    r.layer = group;

    segs.forEach(function (pts) {
      pts.forEach(function (p) { allPts.push(p); });
      if (pts.length === 1) {
        r.dots.push(L.circleMarker(pts[0], {
          radius: 6, weight: 2, color: r.color, fillColor: r.color, fillOpacity: .55,
          interactive: false,
        }).addTo(group));
        return;
      }
      r.lines.push(L.polyline(pts, {
        color: r.color, weight: 4, opacity: .8, lineCap: "round", lineJoin: "round",
        interactive: !COARSE,
      }).addTo(group));
      /* 좁은 투명 히트 영역 — 마우스 여유 (터치에선 불필요, 지도 팬 방해 금지) */
      if (!COARSE) L.polyline(pts, { color: r.color, weight: 12, opacity: 0 }).addTo(group);
      [pts[0], pts[pts.length - 1]].forEach(function (end) {
        r.dots.push(L.circleMarker(end, {
          radius: 4, weight: 0, color: r.color, fillColor: r.color, fillOpacity: .9,
          interactive: false,
        }).addTo(group));
      });
    });

    if (!COARSE) {
      group.on("mouseover mousemove", function (e) { hover(r, e.latlng); });
      group.on("mouseout", hoverClear);
      group.on("click", function () { go(r); });
      r.link.addEventListener("mouseenter", function () { hover(r, null); });
      r.link.addEventListener("mouseleave", hoverClear);
      r.link.addEventListener("focus", function () { hover(r, null); });
      r.link.addEventListener("blur", hoverClear);
    }
    /* 목록 항목 탭 → 지도에서 잠깐 강조 (데스크톱·터치 공통) */
    r.link.addEventListener("click", function () { flash(r); });
  });

  /* ── 강조 우선순위: hover(데스크톱) > flash(목록 탭) > spy(스크롤) ── */
  var hovered = null, hoverT = null;
  var flashRoute = null, flashUntil = 0;
  var spy = null;

  function currentRoute() {
    if (hovered) return hovered;
    if (flashRoute && Date.now() < flashUntil) return flashRoute;
    return spy;
  }

  function render() {
    var a = currentRoute();
    var pillLit = a && (a === hovered || (a === flashRoute && Date.now() < flashUntil));
    routes.forEach(function (r) {
      var on = r === a, dim = a && !on;
      r.lines.forEach(function (pl) {
        pl.setStyle({ weight: on ? 6 : 4, opacity: dim ? .15 : (on ? 1 : .8) });
      });
      r.dots.forEach(function (d) {
        d.setStyle({ opacity: dim ? .15 : 1, fillOpacity: dim ? .15 : .9 });
      });
      r.link.classList.toggle("is-hot", on && !!pillLit);
    });
    if (a && a.layer) a.layer.bringToFront();
  }

  function hover(r, latlng) {
    if (hoverT) { clearTimeout(hoverT); hoverT = null; }
    hovered = r; render();
    if (latlng) label.setLatLng(latlng).setContent(r.label).addTo(map);
    else if (map.hasLayer(label)) map.removeLayer(label);
  }
  function hoverClear() {
    if (hoverT) clearTimeout(hoverT);
    hoverT = setTimeout(function () {
      hovered = null; render();
      if (map.hasLayer(label)) map.removeLayer(label);
    }, 80);
  }
  function flash(r) {
    flashRoute = r; flashUntil = Date.now() + 1300;
    render();
    setTimeout(render, 1350);
  }

  function go(r) {
    if (!r.section) return;
    r.section.scrollIntoView({ behavior: "smooth", block: "start" });
    if (history.replaceState) history.replaceState(null, "", "#" + r.id);
  }

  /* ── 스크롤 연동 미니맵: 화면 중앙 밴드에 걸친 섹션의 경로를 표시 ── */
  if ("IntersectionObserver" in window) {
    var inBand = new Set();
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) inBand.add(en.target); else inBand.delete(en.target);
      });
      var next = null;
      for (var i = 0; i < routes.length; i++) {
        if (routes[i].section && inBand.has(routes[i].section)) { next = routes[i]; break; }
      }
      if (next !== spy) { spy = next; render(); }
    }, { rootMargin: "-45% 0px -45% 0px", threshold: 0 });
    routes.forEach(function (r) { if (r.section) io.observe(r.section); });
  }

  if (allPts.length) map.fitBounds(allPts, { padding: [26, 26] });
  setTimeout(function () { map.invalidateSize(); }, 0);
  window.addEventListener("resize", function () { map.invalidateSize(); });

  /* 범례 */
  var legend = document.createElement("div");
  legend.className = "omap-legend";
  legend.innerHTML =
    '<span><i style="background:#d93025"></i>주중 병목</span>' +
    '<span><i style="background:#1b64da"></i>주말 나들이</span>' +
    '<span class="omap-hint">' +
    (COARSE ? "스크롤하면 현재 구간이 지도에 표시됩니다"
            : "선에 마우스를 올리거나 아래 목록에서 선택") +
    "</span>";
  el.insertAdjacentElement("afterend", legend);
})();
