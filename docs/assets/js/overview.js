/* ═══════════════════════════════════════════════════════════════
   개요 지도 — 페이지 상단에서 전체 병목 구간을 한눈에.

   pagenav 의 앵커 링크 중 해당 섹션에
   <div class="player-mount" data-deck="N"> 를 가진 것을 '경로'로 보고,
   cams.js 의 DECKS[N] 좌표를 순서대로 이어 선으로 그린다.
   grp 구분선에서 선을 끊는다 (한 경로가 여러 구간이면 선도 여러 개).

   - 색: pagenav 그룹 라벨(주중/주말) 기준.
   - 선(또는 알약) 클릭 → 해당 섹션으로 스크롤.
   - 호버: 항상 '한 경로만' 강조 + 나머지는 흐리게 + 라벨 1개.
     (중심부에서 선이 겹쳐도 중복 선택되지 않도록 활성 경로를 직접 관리)
   - Leaflet 또는 DECKS 미로딩 시 컨테이너를 숨기고 아무것도 안 함.
   ═══════════════════════════════════════════════════════════════ */
(function () {
  var el = document.getElementById("overview-map");
  if (!el) return;
  if (!window.L || typeof DECKS === "undefined") { el.hidden = true; return; }

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
        id: id, link: a, label: a.textContent.trim(),
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
        }).addTo(group));
        return;
      }
      r.lines.push(L.polyline(pts, {
        color: r.color, weight: 4, opacity: .8, lineCap: "round", lineJoin: "round",
      }).addTo(group));
      /* 좁은 투명 히트 영역 — 터치 여유 (너무 넓으면 중심부에서 서로 겹침) */
      L.polyline(pts, { color: r.color, weight: 10, opacity: 0 }).addTo(group);
      [pts[0], pts[pts.length - 1]].forEach(function (end) {
        r.dots.push(L.circleMarker(end, {
          radius: 4, weight: 0, color: r.color, fillColor: r.color, fillOpacity: .9,
        }).addTo(group));
      });
    });

    group.on("mouseover mousemove", function (e) { activate(r, e.latlng); });
    group.on("mouseout", scheduleClear);
    group.on("click", function () { go(r); });

    r.link.addEventListener("mouseenter", function () { activate(r, null); });
    r.link.addEventListener("mouseleave", scheduleClear);
    r.link.addEventListener("focus", function () { activate(r, null); });
    r.link.addEventListener("blur", scheduleClear);
  });

  /* ── 활성 경로 하나만 강조 ── */
  var active = null, clearT = null;

  function restyle() {
    routes.forEach(function (r) {
      var on = r === active, dim = active && !on;
      r.lines.forEach(function (pl) {
        pl.setStyle({ weight: on ? 6 : 4, opacity: dim ? .15 : (on ? 1 : .8) });
      });
      r.dots.forEach(function (d) {
        d.setStyle({ opacity: dim ? .15 : 1, fillOpacity: dim ? .15 : .9 });
      });
      r.link.classList.toggle("is-hot", on);
    });
    if (active && active.layer) active.layer.bringToFront();
  }

  function activate(r, latlng) {
    if (clearT) { clearTimeout(clearT); clearT = null; }
    if (r !== active) { active = r; restyle(); }
    if (latlng) label.setLatLng(latlng).setContent(r.label).addTo(map);
    else if (map.hasLayer(label)) map.removeLayer(label);
  }

  function scheduleClear() {
    if (clearT) clearTimeout(clearT);
    clearT = setTimeout(function () {
      active = null; restyle();
      if (map.hasLayer(label)) map.removeLayer(label);
    }, 80);
  }

  function go(r) {
    var sec = document.getElementById(r.id);
    if (!sec) return;
    sec.scrollIntoView({ behavior: "smooth", block: "start" });
    if (history.replaceState) history.replaceState(null, "", "#" + r.id);
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
    '<span class="omap-hint">구간을 누르면 해당 화면으로 이동</span>';
  el.insertAdjacentElement("afterend", legend);
})();
