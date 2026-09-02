/* ═══════════════════════════════════════════════════════════════
   재생 엔진. 카메라 정의는 cams.js (전역 DECKS) 에 있습니다.

   - hls : gitsview 리졸버(url) 를 GET → 실제 m3u8 주소(text) → hls.js.
           wmsAuthSign 토큰 유효 약 120분 → 재생 오류 시 및
           HLS_REFRESH_MIN 마다 리졸버 재호출.
   - vod : url → 302 → 약 1분 간격 갱신되는 녹화 mp4.
           loop 재생 + VOD_RELOAD_SEC 마다 새 클립 교체.
   - gitsview.gg.go.kr 는 CORS * (HTTPS) → 프록시 불필요.
   ═══════════════════════════════════════════════════════════════ */

const VOD_RELOAD_SEC  = 60;
const HLS_REFRESH_MIN  = 90;

function makeSlot(videoEl, camsEl, statusEl, overlayEl, onSelect, btnPrefix){
  let hls = null, vodTimer = null, hlsTimer = null, current = null;

  const setStatus = (m, e) => { statusEl.textContent = m || ""; statusEl.classList.toggle("err", !!e); };
  const showOverlay = m => { overlayEl.textContent = m || ""; overlayEl.hidden = !m; };

  function teardown(){
    if (hls){ hls.destroy(); hls = null; }
    if (vodTimer){ clearInterval(vodTimer); vodTimer = null; }
    if (hlsTimer){ clearInterval(hlsTimer); hlsTimer = null; }
    videoEl.loop = false;
    videoEl.oncanplay = videoEl.onerror = null;
    videoEl.removeAttribute("src");
    try { videoEl.load(); } catch (e) {}
  }

  function markButtons(){
    [...camsEl.children].forEach(b => b.dataset && b.dataset.id &&
      b.setAttribute("aria-pressed", (current && +b.dataset.id === current.id) ? "true" : "false"));
  }

  function start(cam){
    current = cam;
    teardown();
    markButtons();
    if (typeof onSelect === "function") onSelect(cam);
    setStatus(cam.name + " 불러오는 중…");
    showOverlay(cam.name);
    if (cam.type === "vod") startVod(cam); else startHls(cam);
  }

  function startVod(cam){
    videoEl.loop = true;
    const load = () => { videoEl.src = cam.url; videoEl.load(); videoEl.play().catch(()=>{}); };
    videoEl.oncanplay = () => { setStatus(cam.name + " · 녹화영상(약 1분 간격 갱신)"); showOverlay(""); };
    videoEl.onerror   = () => setStatus(cam.name + " 영상을 불러오지 못했습니다.", true);
    load();
    vodTimer = setInterval(load, VOD_RELOAD_SEC * 1000);
  }

  async function startHls(cam){
    let m3u8;
    try {
      const r = await fetch(cam.url, { cache: "no-store" });
      m3u8 = (await r.text()).trim();
      if (!/^https?:\/\/.*m3u8/.test(m3u8)) throw new Error(m3u8.slice(0, 60));
    } catch (e) {
      setStatus(cam.name + " 스트림 주소 실패 (" + e.message + ")", true);
      return;
    }
    if (current !== cam) return;

    if (videoEl.canPlayType("application/vnd.apple.mpegurl")){
      videoEl.src = m3u8;
      videoEl.play().catch(()=>{});
      videoEl.oncanplay = () => { setStatus(cam.name + " 실시간 재생 중"); showOverlay(""); };
      videoEl.onerror   = () => startHls(cam);
    } else if (window.Hls && Hls.isSupported()){
      hls = new Hls({ liveDurationInfinity: true, lowLatencyMode: true, manifestLoadingMaxRetry: 2 });
      hls.loadSource(m3u8);
      hls.attachMedia(videoEl);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        videoEl.play().catch(()=>{});
        setStatus(cam.name + " 실시간 재생 중"); showOverlay("");
      });
      hls.on(Hls.Events.ERROR, (_, data) => {
        if (!data.fatal) return;
        if (data.type === Hls.ErrorTypes.MEDIA_ERROR) hls.recoverMediaError();
        else startHls(cam);
      });
    } else {
      setStatus("이 브라우저는 HLS 재생을 지원하지 않습니다.", true);
      return;
    }
    hlsTimer = setInterval(() => { if (current === cam) startHls(cam); }, HLS_REFRESH_MIN * 60 * 1000);
  }

  function renderButtons(list){
    camsEl.innerHTML = "";
    list.forEach(cam => {
      if (cam.grp){
        const g = document.createElement("span");
        g.className = "grp"; g.textContent = cam.grp;
        camsEl.appendChild(g);
        return;
      }
      const b = document.createElement("button");
      b.type = "button";
      b.id = btnPrefix + cam.id;
      b.dataset.id = cam.id;
      b.innerHTML = cam.name + '<span class="k ' + (cam.type === "vod" ? "rec" : "live") + '">' + (cam.type === "vod" ? "녹화" : "LIVE") + '</span>';
      b.setAttribute("aria-pressed", "false");
      b.addEventListener("click", () => start(cam));
      camsEl.appendChild(b);
    });
  }

  return { start, renderButtons };
}

/* 덱의 카메라 좌표로 Leaflet 지도를 만들고,
   start(cam) 때 호출할 focus(cam) 함수를 돌려준다. Leaflet 미로딩 시 no-op. */
function makeMap(mapEl, cams, btnPrefix){
  const geo = cams.filter(c => c.id && isFinite(c.lat) && isFinite(c.lng));
  if (!window.L || !geo.length){ mapEl.hidden = true; return () => {}; }

  const BLUE = "#1b64da", RED = "#d93025";
  const map = L.map(mapEl, { scrollWheelZoom: false, attributionControl: true });
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(map);

  const markers = new Map();
  geo.forEach(c => {
    const m = L.circleMarker([c.lat, c.lng], {
      radius: 6, weight: 2, color: BLUE, fillColor: BLUE, fillOpacity: .5,
    }).addTo(map).bindTooltip(c.name, { direction: "top" });
    m.on("click", () => document.getElementById(btnPrefix + c.id)?.click());
    markers.set(c.id, m);
  });
  map.fitBounds(geo.map(c => [c.lat, c.lng]), { padding: [24, 24], maxZoom: 15 });
  setTimeout(() => map.invalidateSize(), 0);

  return cam => {
    if (!cam || !isFinite(cam.lat)) return;
    markers.forEach((m, id) => {
      const on = id === cam.id;
      m.setStyle({
        radius: on ? 9 : 6, fillOpacity: on ? 1 : .5,
        color: on ? RED : BLUE, fillColor: on ? RED : BLUE,
      });
      if (on) m.bringToFront();
    });
    map.panTo([cam.lat, cam.lng]);
  };
}

function mountPlayer(el, cams){
  const player = document.createElement("div");
  player.className = "player";
  const video = document.createElement("video");
  video.controls = true; video.autoplay = true; video.muted = true;
  video.setAttribute("playsinline", "");
  const ov = document.createElement("div");
  ov.className = "overlay"; ov.textContent = "불러오는 중…";
  player.append(video, ov);

  const camsEl = document.createElement("div"); camsEl.className = "cams";
  const st = document.createElement("div"); st.className = "status";
  const mapEl = document.createElement("div"); mapEl.className = "map";
  el.append(player, camsEl, st, mapEl);

  const btnPrefix = "cam-btn-d" + (el.dataset.deck || "0") + "-";
  const focus = makeMap(mapEl, cams, btnPrefix);
  const slot = makeSlot(video, camsEl, st, ov, focus, btnPrefix);
  slot.renderButtons(cams);
  slot.start(cams.find(c => c.id));
}

document.querySelectorAll(".player-mount").forEach(el => {
  const cams = (typeof DECKS !== "undefined") && DECKS[+el.dataset.deck];
  if (cams) mountPlayer(el, cams);
});
