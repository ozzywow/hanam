/* ═══════════════════════════════════════════════════════════════
   실시간 사고·통제 — /api/incidents (경기도교통정보센터 돌발상황 프록시) 를 받아

   (a) 전역 접이식 리스트 — 그 페이지 DECKS 주변 관련 항목 전체 (허브는 pagenav 아래,
       하위 페이지는 [data-incidents-anchor] 아래). "없음" 문구의 지역명은
       <body data-region="…"> 에서 읽음(없으면 지역명 생략)
   (b) 각 라우트 섹션에 그 구간 좌표 1.2km 이내 항목만

   경로 매칭: 하위 페이지는 .player-mount[data-deck] 직접 스캔 → 상위 section[id],
   허브(종합현황판)는 .cards .card[data-decks] (섹션 박스 없이 전역 리스트만),
   구형 단일 페이지는 pagenav 앵커 → 섹션 → data-deck.
   노선(고속도로) 페이지는 .player-mount[data-cam-accordion] 하나만 있어 DECK 0 을
   {grp} 로 잘라 구간(①②③④)별로 분류한다 — 전역 리스트를 구간 소제목으로 묶고(클릭
   시 해당 아코디언 구간 펼침), 각 .grp-toggle 에 건수 배지, .grp-body 안에 구간 리스트.
   가장 가까운 구간 하나에만 배정(bucketBySeg). route-traffic.js 소통 점과는 별개.
   cams.js DECKS 좌표로 거리 계산. DECKS 미로딩·API 실패 시 조용히 숨김.
   ═══════════════════════════════════════════════════════════════ */
(function () {
  var API = "/api/incidents";
  var NEAR_KM = 1.2;
  var REFRESH_MS = 180000;
  var GLOBAL_MAX = 20;
  var SECTION_MAX = 8;

  if (typeof DECKS === "undefined") return;
  var pagenav = document.querySelector(".pagenav");

  function decksToPts(cams) {
    return cams
      .filter(function (c) { return c.id && isFinite(c.lat) && isFinite(c.lng); })
      .map(function (c) { return [c.lat, c.lng]; });
  }

  /* 경로 목록 — 허브는 pagenav 앵커, 하위 페이지는 .player-mount 직접 스캔 */
  var routes = [];
  if (pagenav) {
    pagenav.querySelectorAll('a[href^="#"]').forEach(function (a) {
      var id = a.getAttribute("href").slice(1);
      var sec = document.getElementById(id);
      var mount = sec && sec.querySelector(".player-mount[data-deck]");
      var cams = mount && DECKS[+mount.dataset.deck];
      if (!cams) return;
      var pts = decksToPts(cams);
      if (!pts.length) return;
      routes.push({ id: id, label: a.textContent.trim(), section: sec, pts: pts, box: null, list: null });
    });
  }
  /* ── 노선(고속도로) 페이지 ── 단일 아코디언 마운트의 {grp} 구간별로 분류.
     player.js 가 DECK 0 을 .grp-toggle + .grp-body 로 렌더한다(route-traffic.js 와
     같은 전제). 구간(①②③④)마다 zone 하나를 만들고, 위 전역 리스트를 구간별로
     묶어 보여주며, 각 .grp-toggle(= 구간 카드)에 건수 배지를 단다. */
  var accMount = document.querySelector(".player-mount[data-cam-accordion]");
  var accDeck = accMount && DECKS[+accMount.dataset.deck || 0];
  var isAcc = !!accMount && Array.isArray(accDeck);
  if (isAcc && !routes.length) {
    var gi = -1;
    accDeck.forEach(function (item) {
      if (item && item.grp) {
        gi++;
        var shortLbl = String(item.grp).split(/\s+·\s+/)[0].trim() || ("구간 " + (gi + 1));
        routes.push({
          acc: true, gi: gi, id: "seg" + gi, label: shortLbl, full: item.grp,
          section: null, card: null, pts: [], box: null, list: null, toggle: null, body: null,
        });
        return;
      }
      var r = routes[routes.length - 1];
      if (r && r.acc && item && isFinite(item.lat) && isFinite(item.lng)) r.pts.push([item.lat, item.lng]);
    });
  }
  if (!routes.length) {
    document.querySelectorAll(".player-mount[data-deck]").forEach(function (mount) {
      var cams = DECKS[+mount.dataset.deck];
      if (!cams) return;
      var sec = mount.closest("section[id]") || mount.parentElement;
      var pts = decksToPts(cams);
      if (!pts.length) return;
      var h = sec.querySelector("h2, h1");
      var label = mount.dataset.label || (h && h.textContent.trim()) || "이 구간";
      routes.push({ id: sec.id || "", label: label, section: sec, pts: pts, box: null, list: null });
    });
  }
  if (!routes.length) {
    /* 허브(종합현황판) — 목적지 카드의 data-decks 로 관련 범위만 잡는다.
       카드에 data-status(clear/work/alert)를 찍는다. (2026-09-06부터 목적지 카드
       상태 점은 CSS에서 제거됨 — 이 속성은 현재 화면엔 안 보이고 아래 돌발 리스트만 노출.) */
    document.querySelectorAll(".cards .card[data-decks]").forEach(function (card) {
      var pts = [];
      card.dataset.decks.trim().split(/\s+/).forEach(function (n) {
        var cams = DECKS[+n];
        if (cams) pts = pts.concat(decksToPts(cams));
      });
      if (!pts.length) return;
      var h = card.querySelector("h2, h3");
      routes.push({ id: "", label: h ? h.textContent.trim() : "구간", section: null, card: card, pts: pts, box: null, list: null });
    });
  }
  if (!routes.length) return;

  var gAnchor = document.querySelector("[data-incidents-anchor]") || pagenav;
  if (!gAnchor) return;

  /* ── 전역 블록 ── 이슈가 있을 때만 보여준다(2026-09-05) — "지금 OO 주변
     사고·통제 없음" 같은 알림거리 없는 상태 문구는 정보 가치가 없어 아예
     숨긴다. 그래서 기본은 hidden, render() 가 관련 항목이 있을 때만 채워서
     드러낸다(CLS 완화용 로딩 placeholder는 여기선 안 쓴다 — 애초에 대부분
     안 뜨는 게 맞는 요소라, 뜰 때 한 번 밀리는 것이 매번 자리만 차지하는
     것보다 낫다). */
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
  gAnchor.insertAdjacentElement("afterend", g);

  var gBtn = g.querySelector(".incidents-toggle");
  var gPanel = g.querySelector(".incidents-panel");
  var gList = g.querySelector(".incidents-list");
  var gCount = g.querySelector(".incidents-count");
  var gSrc = g.querySelector(".incidents-src");

  gBtn.addEventListener("click", function () {
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

  /* ── 노선 아코디언(isAcc) 전용 ── */
  function segDom() {
    if (!isAcc || !accMount) return;
    var tg = accMount.querySelectorAll(".cams-accordion .grp-toggle");
    var bd = accMount.querySelectorAll(".cams-accordion .grp-body");
    routes.forEach(function (r) {
      if (!r.acc) return;
      if (!r.toggle && tg[r.gi]) r.toggle = tg[r.gi];
      if (!r.body && bd[r.gi]) r.body = bd[r.gi];
    });
  }
  function openSeg(r) {
    segDom();
    var t = r.toggle;
    if (!t) return;
    if (t.getAttribute("aria-expanded") !== "true") t.click();
    try { t.scrollIntoView({ behavior: "smooth", block: "center" }); }
    catch (e) { t.scrollIntoView(); }
  }
  function segInBox(r) {
    if (r.box) return r.box;
    segDom();
    if (!r.body) return null;
    var d = document.createElement("div");
    d.className = "incidents incidents-inseg";
    d.hidden = true;
    d.innerHTML =
      '<strong class="incidents-section-h">이 구간 사고·통제</strong>' +
      '<ul class="incidents-list"></ul>';
    r.body.insertBefore(d, r.body.firstChild);
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
  function routeMinKm(r, lat, lng) {
    var m = Infinity;
    for (var i = 0; i < r.pts.length; i++) {
      var d = haversineKm(lat, lng, r.pts[i][0], r.pts[i][1]);
      if (d < m) m = d;
    }
    return m;
  }
  /* 돌발 항목을 가장 가까운 구간 하나에 배정 (경계 항목 중복 방지) */
  function bucketBySeg(items) {
    var segs = routes.filter(function (r) { return r.acc; });
    var buckets = segs.map(function () { return []; });
    items.forEach(function (it) {
      var best = -1, bestKm = NEAR_KM;
      segs.forEach(function (r, i) {
        var d = routeMinKm(r, it.lat, it.lng);
        if (d <= bestKm) { bestKm = d; best = i; }
      });
      if (best >= 0) buckets[best].push(it);
    });
    return { segs: segs, buckets: buckets };
  }

  var TYPE_CLASS = {
    "교통사고": "acc", "차량사고": "acc", "사고": "acc",
    "공사": "work", "통제": "work", "도로폐쇄": "work",
    "차량고장": "brk", "기타돌발": "etc",
  };
  var TYPE_SEV = {
    "교통사고": 0, "차량사고": 0, "사고": 0,
    "통제": 1, "도로폐쇄": 1, "공사": 2, "차량고장": 3,
  };
  function sevSort(a, b) {
    var s = (TYPE_SEV[a.type] == null ? 3 : TYPE_SEV[a.type]) -
            (TYPE_SEV[b.type] == null ? 3 : TYPE_SEV[b.type]);
    return s || (b.at || "").localeCompare(a.at || "");
  }
  /* 카드 상태 점 색: 사고·통제 → alert(빨강), 공사·고장 → work(노랑), 없음 → clear(초록) */
  function statusOf(list) {
    if (!list.length) return "clear";
    var worst = 9;
    list.forEach(function (it) {
      var s = TYPE_SEV[it.type]; s = (s == null ? 3 : s);
      if (s < worst) worst = s;
    });
    return worst <= 1 ? "alert" : "work";
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
  /* 전역 리스트를 구간별로 묶어 채운다. 각 구간 소제목은 클릭 시 해당
     아코디언 구간을 펼치고 그리로 스크롤한다(= 구간 카드와 연동). */
  function fillGrouped(ul, bb) {
    ul.innerHTML = "";
    var shown = 0, total = 0;
    bb.buckets.forEach(function (mine, i) {
      total += mine.length;
      if (!mine.length || shown >= GLOBAL_MAX) return;
      var r = bb.segs[i];
      var h = document.createElement("li");
      h.className = "incidents-seg-h";
      h.setAttribute("role", "button");
      h.tabIndex = 0;
      h.innerHTML =
        '<span class="incidents-seg-name">' + esc(r.label) + "</span>" +
        '<span class="incidents-seg-n">' + mine.length + "</span>";
      var go = function () { openSeg(r); };
      h.addEventListener("click", go);
      h.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(); }
      });
      ul.appendChild(h);
      mine.slice().sort(sevSort).forEach(function (it) {
        if (shown++ >= GLOBAL_MAX) return;
        ul.appendChild(li(it, false));
      });
    });
    if (total > shown) {
      var more = document.createElement("li");
      more.className = "incidents-more";
      more.textContent = "…외 " + (total - shown) + "건";
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
    var seg = (a && b && a !== b) ? (a + " → " + b) : (b || a);
    var loc = [it.road, it.dir ? "(" + it.dir + ")" : "", seg]
      .filter(Boolean).join(" ");
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

  /* ── 렌더 ── 이슈(관련 항목)가 있을 때만 전역 배너를 드러낸다 —
     "사고·통제 없음" 안내는 아예 표시하지 않는다(2026-09-05). */
  function render(items, updated, source) {
    var relevant = items.filter(function (it) {
      return routes.some(function (r) { return nearRoute(r, it.lat, it.lng); });
    });

    var bb = isAcc ? bucketBySeg(relevant) : null;

    var clear = relevant.length === 0;
    g.hidden = clear;
    if (!clear) {
      gCount.textContent = String(relevant.length);
      if (bb) fillGrouped(gList, bb);
      else fill(gList, relevant, GLOBAL_MAX, true);
      gSrc.textContent = "출처: " + (source || "경기도교통정보센터") + " · " +
        hhmm(updated ? new Date(updated) : new Date()) + " 기준";
    } else {
      gPanel.hidden = true;
      gBtn.setAttribute("aria-expanded", "false");
      g.classList.remove("is-open");
    }

    routes.forEach(function (r) {
      if (r.acc) {                            /* 노선 구간 카드 — 배지 + 구간 내 리스트 */
        segDom();
        var mineSeg = (bb && bb.buckets[r.gi]) || [];
        if (r.toggle) {
          var badge = r.toggle.querySelector(".grp-inc");
          if (mineSeg.length) {
            if (!badge) {
              badge = document.createElement("span");
              badge.className = "grp-inc";
              var sig = r.toggle.querySelector(".grp-sig");   // 소통 점보다 앞에
              if (sig) r.toggle.insertBefore(badge, sig);
              else r.toggle.appendChild(badge);
            }
            badge.textContent = mineSeg.length;
            badge.title = mineSeg.length + "건 사고·통제";
            badge.hidden = false;
          } else if (badge) {
            badge.hidden = true;
          }
        }
        var box = mineSeg.length ? segInBox(r) : r.box;
        if (box) {
          box.hidden = !mineSeg.length;
          if (mineSeg.length) fill(r.list, mineSeg, SECTION_MAX);
        }
        return;
      }
      var mine = items.filter(function (it) { return nearRoute(r, it.lat, it.lng); });
      if (r.card) {                           /* 허브 카드 — 상태 점 색만 갱신 */
        r.card.dataset.status = statusOf(mine);
        return;
      }
      if (!r.section) return;
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
        render(j.items, j.updated, j.source);
      })
      .catch(function () { g.hidden = true; });
  }

  load();
  setInterval(load, REFRESH_MS);
})();
