/* ═══════════════════════════════════════════════════════════════
   고정 링크 실시간 소통 (PoC · 2026-09-07)

   window.TRAFFIC_PINS (regions/<지역>.traffic.js) 의 검증된 프로브 좌표만
   /api/traffic 에 물어본다. 응답 linkId 가 기대값과 다르면 그 표본은 버린다.
   좌표를 사람이 미리 확인해 고정했으므로 스냅거리·방위각·OSM 보정 없음.

   대상: .cards .card[data-decks]
     · hub.deck 카드   → 간선 묶음 혼잡도 (LOS 중앙값) + 색 점
     · routes[].deck   → "도로 (방면) · 등급 속도 · 약 N분 · HH:MM"
   15분 넘게 유효값 없으면 정적 문구로 롤백. 스크립트가 안 돌면 정적 문구 그대로.
   ═══════════════════════════════════════════════════════════════ */
(function () {
  var P = window.TRAFFIC_PINS;
  if (!P) return;
  var cardEls = document.querySelectorAll(".cards .card[data-decks]");
  if (!cardEls.length) return;

  var API = "/api/traffic";
  var REFRESH_MS = 150000;   // 2.5분
  var STALE_MS = 900000;     // 15분 넘게 유효값 없으면 롤백
  var LOS_LABEL = { 1: "원활", 2: "서행", 3: "정체", 4: "심한 정체" };
  /* 점 색은 styles.css 의 3단계 신호색과 맞춘다(메인 허브 칩과 동일 체계).
     원활·서행=green · 정체=yellow · 심한정체=red. 정밀 등급은 문구로 표시. */
  function flowClass(los) { return los >= 4 ? "red" : los >= 3 ? "yellow" : "green"; }

  /* 기준선(선택) — regions/<지역>.baseline.js 가 있으면 "지금 vs 평소" 를 덧붙인다.
     버킷 키 "<wd|we>-<0..95>"(KST). 없으면 조용히 생략(데이터 축적 전 정상). */
  var BASE = (window.TRAFFIC_BASELINE && window.TRAFFIC_BASELINE.slots) || null;
  function nowBucketKey() {
    var d = new Date();
    var dayType = (d.getDay() === 0 || d.getDay() === 6) ? "we" : "wd";
    return dayType + "-" + Math.floor((d.getHours() * 60 + d.getMinutes()) / 15);
  }
  /* cur = 통행시간(분) 또는 속도(km/h). isTime=true 면 분 비교(±3분), 아니면 속도비 비교. */
  function vsNormal(slot, cur, isTime) {
    if (!BASE || !BASE[slot] || !(cur > 0)) return "";
    var b = BASE[slot][nowBucketKey()];
    if (!b) return "";
    if (isTime) {
      if (!(b.tm > 0)) return "";
      var diff = Math.round(cur - b.tm);
      if (diff >= 3) return "평소보다 +" + diff + "분";
      if (diff <= -3) return "평소보다 " + diff + "분";   // diff 음수 → "−N분"
      return "평소 수준";
    }
    if (!(b.spd > 0)) return "";
    var ratio = cur / b.spd;
    if (ratio <= 0.8) return "평소보다 지체";
    if (ratio >= 1.2) return "평소보다 원활";
    return "평소 수준";
  }

  function findCard(deck) {
    for (var i = 0; i < cardEls.length; i++) {
      var d = (cardEls[i].dataset.decks || "").trim().split(/\s+/);
      if (d.indexOf(String(deck)) !== -1) return cardEls[i];
    }
    return null;
  }
  function hhmm(iso) {
    var d = new Date(iso);
    return isNaN(d) ? "" : ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2);
  }
  function median(a) {
    a = a.slice().sort(function (x, y) { return x - y; });
    var m = a.length >> 1;
    return a.length % 2 ? a[m] : Math.round((a[m - 1] + a[m]) / 2);
  }

  /* 핀 등록 — GITS 핀은 프로브 좌표를 pts 에, TOPIS 핀(src:"topis")은 axisCd 를 모은다.
     둘 다 런타임 조회는 linkId 로 대조한다. */
  var API_GITS = "/api/traffic";
  var API_SEOUL = "/api/traffic-seoul";
  var pts = [];
  var axisSet = {};
  function regPin(pin) {
    if (pin && pin.src === "topis") {
      if (pin.axisCd) axisSet[String(pin.axisCd)] = true;
      return { linkId: String(pin.linkId) };
    }
    pts.push(pin.probe[0].toFixed(5) + "," + pin.probe[1].toFixed(5));
    return { linkId: String(pin.linkId) };
  }

  var targets = [];
  if (P.hub && P.hub.links && P.hub.links.length) {
    var hc = findCard(P.hub.deck);
    if (hc) {
      var hh = hc.querySelector(".hint");
      targets.push({ kind: "hub", card: hc, hint: hh, staticText: hh ? hh.textContent : "",
        label: P.hub.label || "이 일대", pins: P.hub.links.map(regPin), lastGood: 0 });
    }
  }
  (P.routes || []).forEach(function (r) {
    var c = findCard(r.deck);
    if (!c) return;
    var h = c.querySelector(".hint");
    targets.push({ kind: "route", card: c, hint: h, staticText: h ? h.textContent : "",
      meta: r, slot: String(r.deck), pins: [regPin(r)], lastGood: 0 });
  });
  var axes = Object.keys(axisSet);
  if (!targets.length || (!pts.length && !axes.length)) return;

  /* TOPIS(서울시 공공데이터) 사용 시 출처표시 — 열린데이터광장 이용약관 제10조③.
     기존 CCTV 영상 출처 문단(footer 첫 <p>) 바로 뒤에 붙인다. */
  if (axes.length) {
    var srcP = document.querySelector("footer p");
    if (srcP && !document.querySelector(".topis-credit")) {
      var p = document.createElement("p");
      p.className = "topis-credit";
      p.textContent = "실시간 소통 정보 일부는 서울특별시 공공데이터(서울 TOPIS 실시간 도로소통정보)를 활용했습니다.";
      srcP.insertAdjacentElement("afterend", p);
    }
  }

  function revert(t) {
    delete t.card.dataset.flow;
    delete t.card.dataset.live;
    t.card.removeAttribute("title");
    if (t.hint) t.hint.textContent = t.staticText;
  }

  /* GITS·TOPIS 결과를 공통 shape 로. los = 소통등급(1~4), travelMin 없으면 null. */
  function normGits(r) {
    return r && { linkId: r.linkId, los: r.los, spd: r.spd, travelMin: r.travelMin, road: r.road, from: r.from, to: r.to };
  }
  function normTopis(r) {
    return r && { linkId: r.linkId, los: r.cls, spd: r.spd, travelMin: null, road: r.road || "", from: r.stNode, to: r.edNode };
  }

  function apply(byLink, updated) {
    var t = hhmm(updated), now = Date.now();
    targets.forEach(function (tg) {
      var got = [];
      tg.pins.forEach(function (p) {
        var r = byLink[p.linkId];               // linkId 불일치(스냅 오류·모델 변경)면 조회 안 됨 → 제외
        if (r && r.los >= 1 && r.los <= 4) got.push(r);
      });
      if (!got.length) {
        if (tg.lastGood && now - tg.lastGood > STALE_MS) revert(tg);
        return;
      }
      tg.lastGood = now;
      tg.card.dataset.live = "1";

      if (tg.kind === "hub") {
        var mid = median(got.map(function (r) { return r.los; }));
        tg.card.dataset.flow = flowClass(mid);
        var g = LOS_LABEL[mid] || "";
        if (tg.hint) tg.hint.textContent = "간선 대체로 " + g + (t ? " · " + t : "");
        tg.card.title = tg.label + " 간선 실시간 소통 대체로 " + g + (t ? " · " + t + " 기준" : "");
        return;
      }

      var one = got[0], m = tg.meta;
      tg.card.dataset.flow = flowClass(one.los);
      var grade = LOS_LABEL[one.los] || "";
      var spd = (one.spd != null && isFinite(one.spd)) ? Math.round(one.spd) + "km/h" : "";
      var tm = (one.travelMin != null && isFinite(one.travelMin)) ? "약 " + Math.round(one.travelMin) + "분" : "";
      var vs = vsNormal(tg.slot, one.travelMin != null ? one.travelMin : one.spd, one.travelMin != null);
      var seg = [
        (m.road || one.road) + " (" + m.bearingLabel + ")",
        grade + (spd ? " " + spd : ""),
        tm,
        vs,
      ].filter(Boolean).join(" · ");
      if (tg.hint) tg.hint.textContent = seg + (t ? " · " + t : "");
      var span = (one.from && one.to && one.from !== one.to) ? one.from + "→" + one.to + " " : "";
      tg.card.title = "실시간 소통 · " + (one.road || m.road) + " " + span + grade + (spd ? " " + spd : "") +
        (t ? " · " + t + " 기준" : "");
    });
  }

  function load() {
    var jobs = [];
    if (pts.length) jobs.push(
      fetch(API_GITS + "?pts=" + encodeURIComponent(pts.join(";")), { headers: { accept: "application/json" } })
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (j) { return (j && j.ok && Array.isArray(j.results)) ? { kind: "gits", results: j.results, updated: j.updated } : null; })
        .catch(function () { return null; }));
    if (axes.length) jobs.push(
      fetch(API_SEOUL + "?axis=" + encodeURIComponent(axes.join(",")), { headers: { accept: "application/json" } })
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (j) { return (j && j.ok && Array.isArray(j.results)) ? { kind: "topis", results: j.results, updated: j.updated } : null; })
        .catch(function () { return null; }));

    Promise.all(jobs).then(function (parts) {
      var byLink = {}, updated = null;
      parts.forEach(function (part) {
        if (!part) return;
        updated = updated || part.updated;
        part.results.forEach(function (r) {
          var n = part.kind === "gits" ? normGits(r) : normTopis(r);
          if (n && n.linkId) byLink[n.linkId] = n;
        });
      });
      if (Object.keys(byLink).length) apply(byLink, updated);
    });
  }
  load();
  setInterval(load, REFRESH_MS);
})();
