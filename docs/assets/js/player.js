/* ═══════════════════════════════════════════════════════════════
   재생 엔진. 카메라 정의는 cams.js (전역 DECKS) 에 있습니다.

   - hls : gitsview 리졸버(url) 를 GET → 실제 m3u8 주소(text) → hls.js.
           wmsAuthSign 토큰 유효 약 120분 → 재생 오류 시 및
           HLS_REFRESH_MIN 마다 리졸버 재호출.
   - vod : url → 302 → 약 1분 간격 갱신되는 녹화 mp4.
           loop 재생 + VOD_RELOAD_SEC 마다 새 클립 교체.
   - its : 국가교통정보센터 ITS 카메라(전국 고속도로·국도). 재생 URL 에 apiKey 가
           포함돼 정적 URL 이 없음 → 항상 /api/its-resolve?x=&y= (Pages Function)
           로 좌표 최근접 카메라의 m3u8 을 받는다. 갱신 주기·재생은 hls 와 동일.
   - seoul : 서울시 TOPIS 도시고속도로 CCTV(routes/olympic-daero.js 등). url 이
             topiscctv1.eseoul.go.kr 직접 m3u8 — 토큰 없음·CORS 개방·채널 고정이라
             리졸버 없이 url 을 그대로 hls.js 에 물린다. 끊기면 30초 재시도 루프가 재접속.
   - gitsview.gg.go.kr 는 CORS * (HTTPS) → 프록시 불필요.
   - 리졸버 url 안의 GITS 팝업 토큰이 만료(401)되면 /api/resolve?id=&type=
     (Pages Function) 이 팝업을 서버측에서 다시 긁어 신선한 토큰을 준다.
     정상(토큰 유효) 시엔 호출하지 않는 폴백 경로.
   ═══════════════════════════════════════════════════════════════ */

const VOD_RELOAD_SEC  = 60;
const HLS_REFRESH_MIN  = 90;
const FETCH_TIMEOUT_MS = 7000;
const ITS_TIMEOUT_MS   = 16000;   // /api/its-resolve 는 ITS 재시도까지 포함해 더 길게

/* ── 내 CCTV(즐겨찾기) 저장소 ─────────────────────────────────
   플레이어 우상단 ☆ 로 지금 보는 카메라를 등록/해제. localStorage 에
   재생용 url 은 저장하지 않는다 — url 안 GITS 리졸버 토큰은 12h Action 이
   갱신하므로 몇 시간이면 만료. id·type(+its 는 좌표)만 있으면 /api/resolve ·
   /api/its-resolve 가 매번 신선한 스트림을 만들어 준다. 저장할 게 없으니
   만료될 것도 없음. 목록 페이지(/favorites/)는 이 스냅샷으로 합성 덱을 만든다.
   키 = "<region>:<id>". rc-fav-change 이벤트로 별·칩·목록이 서로 동기화. */
const FAV_KEY = "rc-favorites";
const FAV_MAX = 10;   // 상한. 홈 칩 "n/10" 표기는 window.rcFav.max 로 읽으므로 여기만 고치면 됨
window.rcFav = {
  max: FAV_MAX,
  list(){
    try { const a = JSON.parse(localStorage.getItem(FAV_KEY) || "[]"); return Array.isArray(a) ? a : []; }
    catch (e) { return []; }
  },
  has(key){ return this.list().some(f => f.region + ":" + f.id === key); },
  /* rec 를 등록/해제. 반환: "added" · "removed" · "full"(상한 초과라 등록 거부).
     상한에 걸리면 가장 오래된 게 유용한 카메라일 수 있으므로 조용히 밀어내지
     않고 거부한다 — 호출부가 안내 메시지를 띄운다. */
  toggle(rec){
    const all = this.list();
    const key = rec.region + ":" + rec.id;
    const i = all.findIndex(f => f.region + ":" + f.id === key);
    if (i < 0 && all.length >= FAV_MAX) return "full";
    if (i >= 0) all.splice(i, 1);
    else all.unshift(rec);
    try { localStorage.setItem(FAV_KEY, JSON.stringify(all)); } catch (e) {}
    try { document.dispatchEvent(new CustomEvent("rc-fav-change", { detail: { key, added: i < 0 } })); } catch (e) {}
    return i < 0 ? "added" : "removed";
  },
};

/* 카메라 재생 상태 신호.
   - favorites.js: {id, ok} 이벤트로 연속 실패를 세어 "점검·폐지?" 배지.
   - report.js(§3.7): window.rcCamError 로 "제보 누른 그 순간 무슨 오류였나"를 진단에 싣는다.
   camStatus(cam, ok, err?) — err = { stage, code, http?, detail? }(실패 시). rcCamError 는
   이벤트 dispatch 보다 먼저 세팅한다 — report.js 타임라인 리스너가 같은 이벤트에서 code 를 집어가도록.
   noteCamError 는 연속 실패 카운트는 안 건드리고 오류 스냅샷만 남긴다 — 재시도가 곧 이어지는
   재생 중 오류(hls fatal 등)용. 목적지 페이지엔 이벤트 리스너가 없어 무해. */
function scrubDetail(s){
  if (s == null) return null;
  // hls.js 에러엔 토큰이 든 m3u8/세그먼트 URL 이 들어온다 → 호스트만 남기고 120자 컷(서버가 한 번 더 마스킹).
  return String(s).replace(/https?:\/\/([^/\s?#]+)[^\s]*/g, "$1").slice(0, 120);
}
function noteCamError(cam, err){
  if (!cam || cam.id == null || !err) return;
  try {
    window.rcCamError = {
      id: cam.id,
      stage: err.stage || null,
      code: err.code || null,
      http: err.http != null ? err.http : null,
      detail: scrubDetail(err.detail),
      at: Date.now(),
    };
  } catch (e) {}
}
function camStatus(cam, ok, err){
  if (!cam || cam.id == null) return;
  try {
    if (!ok && err) noteCamError(cam, err);
    else if (ok && window.rcCamError && window.rcCamError.id === cam.id) window.rcCamError = null;
  } catch (e) {}
  try { document.dispatchEvent(new CustomEvent("rc-cam-status", { detail: { id: cam.id, ok: !!ok } })); } catch (e) {}
}

/* /api/resolve · /api/its-resolve 의 { ok:false, error:"…" } 자유문자열을 안정적인 코드로 정규화. */
function normResolveErr(pj){
  var e = (pj && pj.error != null ? String(pj.error) : "").toLowerCase(), m;
  if (!e) return "NO_RESPONSE";
  if (e.indexOf("no token in popup") >= 0) return "NO_TOKEN";
  if (e.indexOf("no camera near") >= 0) return "NO_CAMERA";
  if ((m = e.match(/popup http (\d+)/))) return "POPUP_HTTP_" + m[1];
  if ((m = e.match(/its http (\d+)/))) return "ITS_HTTP_" + m[1];
  if ((m = e.match(/m3u8 resolve failed\s*(\d*)/))) return m[1] ? "NO_STREAM_" + m[1] : "NO_STREAM";
  if (e.indexOf("resolver bad body") >= 0) return "BAD_BODY";
  if (/timeout|timed out|abort/.test(e)) return "TIMEOUT";
  if (e.indexOf("no its_api_key") >= 0) return "NO_API_KEY";
  if (/bad (id|type|x\/y)/.test(e)) return "BAD_REQUEST";
  return e.replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "").slice(0, 40).toUpperCase() || "UNKNOWN";
}

/* 일반 fetch 는 응답이 없으면 무한 대기 — 모바일 네트워크가 순간 불안정할 때
   요청이 매달린 채로 안 끝나면 catch 도 안 타서 재시도 타이머조차 못 걸린다
   (2026-09-05, "새로고침 전엔 안 풀리는 무한 로딩" 버그 원인). 서버 함수들의
   FETCH_TIMEOUT_MS=8000 관례에 맞춰 클라이언트 쪽에도 타임아웃을 건다. */
function fetchTimeout(url, opts, ms){
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms || FETCH_TIMEOUT_MS);
  return fetch(url, { ...opts, signal: ctrl.signal }).finally(() => clearTimeout(timer));
}

/* 모바일: 스크롤 중 지도가 손가락을 잡아채지 않도록 — 탭해야 이동·확대 활성화 */
function guardTouchPan(map){
  if (!(window.matchMedia && window.matchMedia("(pointer: coarse)").matches)) return;
  const shield = document.createElement("div");
  shield.className = "map-shield";
  shield.innerHTML = "<span>탭하면 지도 이동·확대</span>";
  map.getContainer().appendChild(shield);
  let idle = null;
  const arm = () => { clearTimeout(idle); idle = null; map.dragging.disable(); shield.hidden = false; };
  /* 지도 조작(드래그·줌)이 아니라 페이지 스크롤이 일어날 때 재무장 타이머를
     돈다 — 지도를 만지는 중에 다시 잠기면 오히려 방해된다. 스크롤이 15초간
     없으면(=페이지를 계속 들여다보고 있으면) 그때 잠근다(2026-09-05,
     4초→15초 + 트리거를 지도 조작→페이지 스크롤로 변경). */
  const scheduleRearm = () => { if (!shield.hidden) return; clearTimeout(idle); idle = setTimeout(arm, 15000); };
  const disarm = () => { map.dragging.enable(); shield.hidden = true; };
  arm();
  shield.addEventListener("click", disarm);
  window.addEventListener("scroll", scheduleRearm, { passive: true });
}

function makeSlot(videoEl, camsEl, camLabelEl, overlayEl, onSelect, btnPrefix, accordion){
  let hls = null, vodTimer = null, hlsTimer = null, current = null, hlsUrl = null;

  /* 아코디언 모드(노선 페이지) — .grp 를 접이식 구간 헤더로. 한 번에 한 구간만 펼침.
     body=null 이면 전부 접음. */
  function openSection(body){
    camsEl.querySelectorAll(".grp-body").forEach(b => { b.hidden = (b !== body); });
    camsEl.querySelectorAll(".grp-toggle").forEach(t =>
      t.setAttribute("aria-expanded", t.nextElementSibling === body ? "true" : "false"));
  }

  /* 상태 문구는 화면 정중앙(overlay)에만 띄운다 — 재생이 정상인 동안은 아무
     문구도 없음("실시간 재생 중" 등 성공 문구 폐지, 2026-09-05). 로딩·재접속·
     오류일 때만 잠깐 뜬다. 지금 보는 카메라가 뭔지는 항상 떠 있는 상단
     camLabel 이 담당 — 상태와 분리. */
  const setMessage = (m, e) => {
    overlayEl.textContent = m || "";
    overlayEl.hidden = !m;
    overlayEl.classList.toggle("err", !!e);
  };

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
    camsEl.querySelectorAll("button[data-id]").forEach(b =>
      b.setAttribute("aria-pressed", (current && +b.dataset.id === current.id) ? "true" : "false"));
  }

  function start(cam){
    current = cam;
    try { window.rcCamError = null; } catch (e) {}   // 새 재생 시도 — 옛 오류 스냅샷 폐기
    /* 지금 보는 카메라를 리모콘(remote.js)의 공유 버튼이 읽는다 — 공유 URL 에
       ?cam=<id> 로 실려 상대가 같은 화면부터 보게 된다. page 는 합성 덱
       (즐겨찾기 목록)이면 카메라의 원본 페이지, 아니면 현재 경로. */
    try { window.rcNowPlaying = { id: cam.id, name: cam.name, page: cam.page || location.pathname }; } catch (e) {}
    hlsUrl = cam.type === "hls" ? cam.url : null;
    teardown();
    markButtons();
    if (accordion){   // 접힌 구간의 카메라(지도 마커 클릭 등)를 고르면 그 구간을 펼친다
      const body = document.getElementById(btnPrefix + cam.id)?.closest(".grp-body");
      if (body && body.hidden) openSection(body);
    }
    if (typeof onSelect === "function") onSelect(cam);
    camLabelEl.textContent = "📹 " + cam.name;
    setMessage("불러오는 중…");
    if (cam.type === "vod") startVod(cam); else startHls(cam);
  }

  function startVod(cam){
    videoEl.loop = true;
    let src = cam.url, tried = false;
    const load = () => { videoEl.src = src; videoEl.load(); videoEl.play().catch(()=>{}); };
    videoEl.oncanplay = () => { setMessage(""); camStatus(cam, true); };
    videoEl.onerror = async () => {
      if (current !== cam) return;
      const mec = (videoEl.error && videoEl.error.code) || 0;
      if (!tried){
        tried = true;
        setMessage("재접속 중…");
        try {
          const pj = await (await fetchTimeout("/api/resolve?id=" + cam.id + "&type=vod", { cache: "no-store" })).json();
          if (pj && pj.ok && pj.url && current === cam){ src = pj.url; load(); return; }
        } catch (e) {}
      }
      camStatus(cam, false, { stage: "vod", code: "VOD_MEDIA_ERR_" + mec,
                              detail: videoEl.error && videoEl.error.message });
      setMessage("영상을 불러오지 못했습니다.", true);
    };
    load();
    vodTimer = setInterval(load, VOD_RELOAD_SEC * 1000);
  }

  async function startHls(cam){
    if (current !== cam) return;
    if (hlsTimer){ clearInterval(hlsTimer); hlsTimer = null; }
    let m3u8 = null, fastErr = null, apiErr = null;   // fastErr/apiErr — 둘 다 실패 시 §3.7 진단용

    /* 서울 TOPIS(routes/olympic-daero.js 등 type:"seoul") — url 이 토큰 없는 직접 m3u8.
       CORS 개방·채널 고정이라 리졸버 없이 그대로 재생. 스트림이 끊기면 아래 30초 재시도 루프가 다시 물린다. */
    if (cam.type === "seoul" && cam.url) m3u8 = cam.url;

    /* 1) 빠른 경로 — GITS: regions/*.js 에 박힌 gitsview 리졸버 (CORS OK).
       ITS 는 재생 URL 에 apiKey 가 들어가 정적 URL 이 없음 → 건너뛰고 서버 리졸버로. */
    if (m3u8 == null && cam.type !== "its" && (hlsUrl || cam.url)) try {   // url 없는 즐겨찾기 카메라는 바로 서버 리졸버로
      const r = await fetchTimeout(hlsUrl || cam.url, { cache: "no-store" });
      if (r.ok){
        const t = (await r.text()).trim();
        if (/^https?:\/\/\S+m3u8/.test(t)) m3u8 = t;
        else fastErr = { stage: "resolve-fast", code: "BAD_BODY", detail: t.slice(0, 80) };
      } else {
        fastErr = { stage: "resolve-fast", code: "HTTP_" + r.status, http: r.status };
      }
    } catch (e) {
      fastErr = { stage: "resolve-fast",
                  code: e && e.name === "AbortError" ? "TIMEOUT" : "FETCH_FAIL",
                  detail: e && e.message };
    }

    /* 2) 서버 리졸버 — GITS: 팝업 재파싱으로 신선한 토큰(빠른 경로 실패 시).
       ITS: apiKey 로 좌표 최근접 카메라의 m3u8 조회(항상 이 경로). */
    if (m3u8 == null && current === cam){
      if (cam.type !== "its") setMessage("재접속 중…");
      try {
        const isIts = cam.type === "its";
        const q = isIts
          ? "/api/its-resolve?x=" + cam.lng + "&y=" + cam.lat
          : "/api/resolve?id=" + cam.id + "&type=hls";
        const pj = await (await fetchTimeout(q, { cache: "no-store" }, isIts ? ITS_TIMEOUT_MS : 0)).json();
        if (pj && pj.ok && pj.m3u8){
          m3u8 = pj.m3u8;
          if (pj.resolver) hlsUrl = pj.resolver;   // GITS: 다음 갱신부터 신선한 리졸버
        } else {
          apiErr = { stage: "resolve-api", code: normResolveErr(pj), detail: pj && pj.error };
        }
      } catch (e) {
        apiErr = { stage: "resolve-api",
                   code: e && e.name === "AbortError" ? "TIMEOUT" : "FETCH_FAIL",
                   detail: e && e.message };
      }
    }

    if (current !== cam) return;

    if (m3u8 == null){
      camStatus(cam, false, apiErr || fastErr || { stage: "no-stream", code: "NO_STREAM_BOTH_PATHS" });
      setMessage("스트림을 불러오지 못했습니다. 잠시 후 자동 재시도합니다.", true);
      hlsTimer = setInterval(() => { if (current === cam) startHls(cam); }, 30 * 1000);
      return;
    }
    camStatus(cam, true);

    if (videoEl.canPlayType("application/vnd.apple.mpegurl")){
      videoEl.src = m3u8;
      videoEl.play().catch(()=>{});
      videoEl.oncanplay = () => { setMessage(""); };
      videoEl.onerror   = () => {
        noteCamError(cam, { stage: "playback-native",
                            code: "MEDIA_ERR_" + ((videoEl.error && videoEl.error.code) || 0),
                            detail: videoEl.error && videoEl.error.message });
        startHls(cam);
      };
    } else if (window.Hls && Hls.isSupported()){
      hls = new Hls({ liveDurationInfinity: true, lowLatencyMode: true, manifestLoadingMaxRetry: 2 });
      hls.loadSource(m3u8);
      hls.attachMedia(videoEl);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        videoEl.play().catch(()=>{});
        setMessage("");
      });
      hls.on(Hls.Events.ERROR, (_, data) => {
        if (!data.fatal) return;
        noteCamError(cam, {
          stage: "playback-hls",
          code: "hls:" + (data.details || data.type || "unknown"),
          http: (data.response && data.response.code) || null,
          detail: (data.response && data.response.text) || data.url || (data.error && data.error.message),
        });
        if (data.type === Hls.ErrorTypes.MEDIA_ERROR) hls.recoverMediaError();
        else startHls(cam);
      });
    } else {
      camStatus(cam, false, { stage: "unsupported",
                              code: window.Hls ? "HLS_UNSUPPORTED" : "HLS_JS_MISSING" });
      setMessage("이 브라우저는 HLS 재생을 지원하지 않습니다.", true);
      return;
    }
    hlsTimer = setInterval(() => { if (current === cam) startHls(cam); }, HLS_REFRESH_MIN * 60 * 1000);
  }

  function renderButtons(list){
    camsEl.innerHTML = "";
    camsEl.classList.toggle("cams-accordion", !!accordion);
    let body = null;   // 아코디언 모드에서 지금 채우는 .grp-body
    list.forEach(cam => {
      if (cam.grp){
        if (accordion){
          const h = document.createElement("button");
          h.type = "button";
          h.className = "grp grp-toggle";
          h.textContent = cam.grp;
          h.setAttribute("aria-expanded", "false");
          const sec = document.createElement("div");   // 이 구간의 body (iteration 별로 고유 — 클로저 캡처 주의)
          sec.className = "grp-body";
          sec.hidden = true;
          h.addEventListener("click", () => {
            const opening = sec.hidden;
            openSection(opening ? sec : null);
            if (opening) sec.querySelector("button[data-id]")?.click();   // 구간 펼치면 첫 지점 자동 재생
          });
          camsEl.append(h, sec);
          body = sec;
        } else {
          const g = document.createElement("span");
          g.className = "grp"; g.textContent = cam.grp;
          camsEl.appendChild(g);
        }
        return;
      }
      const b = document.createElement("button");
      b.type = "button";
      b.id = btnPrefix + cam.id;
      b.dataset.id = cam.id;
      b.textContent = cam.name;   // LIVE/녹화 배지 삭제(2026-09-05) — 이름만
      b.setAttribute("aria-pressed", "false");
      b.addEventListener("click", () => start(cam));
      (accordion && body ? body : camsEl).appendChild(b);
    });
    if (accordion){   // 첫 구간만 펼친 채로 시작
      const first = camsEl.querySelector(".grp-body");
      if (first) openSection(first);
    }
  }

  return { start, renderButtons };
}

/* 덱의 카메라 좌표로 Leaflet 지도를 만든다. 지도는 기본 접힘(숨김) 상태로,
   toggle 로 처음 펼칠 때 reveal() 이 크기 계산 + 초기 뷰(전체 fit 에서 MAP_ZOOM_BOOST
   만큼 줌 보정)를 잡는다.
   반환: { ok, focus(cam), reveal() }. Leaflet 미로딩·좌표 없음이면 ok:false. */
const MAP_ZOOM_BOOST = 1;   // 원래 3단계 줌인 → 사용자 요청으로 2단계 줌아웃(2026-09-05)

/* 지도 펼침 상태는 페이지별이 아니라 사이트 전체에서 하나로 기억한다 —
   어느 페이지에서든 지도를 펼쳐본 사용자는 다음부터 다른 페이지에서도
   기본 펼침으로 본다(2026-09-05). */
const MAP_OPEN_KEY = "rc-map-open";
function wantsMapOpen() {
  try { return localStorage.getItem(MAP_OPEN_KEY) === "1"; } catch (e) { return false; }
}
function rememberMapOpen(open) {
  try { localStorage.setItem(MAP_OPEN_KEY, open ? "1" : "0"); } catch (e) {}
}

function makeMap(mapEl, cams, btnPrefix){
  const geo = cams.filter(c => c.id && isFinite(c.lat) && isFinite(c.lng));
  if (!window.L || !geo.length){ mapEl.hidden = true; return { ok:false, focus:()=>{}, reveal:()=>{} }; }

  const BLUE = "#1b64da", RED = "#d93025";
  const pts = geo.map(c => [c.lat, c.lng]);
  const map = L.map(mapEl, { scrollWheelZoom: false, attributionControl: true });
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(map);
  guardTouchPan(map);

  const markers = new Map();
  geo.forEach(c => {
    const m = L.circleMarker([c.lat, c.lng], {
      radius: 6, weight: 2, color: BLUE, fillColor: BLUE, fillOpacity: .5,
    }).addTo(map).bindTooltip(c.name, { direction: "top" });
    m.on("click", () => document.getElementById(btnPrefix + c.id)?.click());
    markers.set(c.id, m);
  });

  let lastCam = null, fitted = false;

  function paintMarkers(cam){
    if (!cam) return;
    markers.forEach((m, id) => {
      const on = id === cam.id;
      m.setStyle({
        radius: on ? 9 : 6, fillOpacity: on ? 1 : .5,
        color: on ? RED : BLUE, fillColor: on ? RED : BLUE,
      });
      if (on) m.bringToFront();
    });
  }

  function focus(cam){
    lastCam = cam || lastCam;
    if (!cam || !isFinite(cam.lat)) return;
    /* 지도가 접혀 있으면(mapEl.hidden → display:none) SVG 렌더러가 아직 마커 path 를
       만들지 않아 setStyle/bringToFront 가 undefined.parentNode 로 터진다.
       그 예외가 slot.start() 를 중단시켜 CCTV 가 안 뜨던 버그 — 접힌 동안엔
       lastCam 만 기록하고, 지도를 처음 펼칠 때 reveal() 에서 다시 칠한다. */
    if (mapEl.hidden) return;
    paintMarkers(cam);
    map.panTo([cam.lat, cam.lng]);
  }

  function reveal(){
    map.invalidateSize();
    if (!fitted){
      map.fitBounds(pts, { padding: [24, 24], maxZoom: 15 });
      map.setZoom(Math.min(map.getZoom() + MAP_ZOOM_BOOST, 18), { animate: false });
      fitted = true;
    }
    if (lastCam && isFinite(lastCam.lat)){
      paintMarkers(lastCam);
      map.panTo([lastCam.lat, lastCam.lng], { animate: false });
    }
  }

  return { ok: true, focus, reveal };
}

/* ── 미니 플레이어 도킹 ────────────────────────────────────────
   카메라 버튼이 많은 페이지에선 아래쪽 버튼을 누르려고 스크롤하면 영상이
   화면 위로 사라져, 버튼을 눌러도 어떤 화면이 떴는지 안 보인다. 영상
   원위치(.player-anchor)가 뷰포트를 벗어나면 .player 를 좌하단 작은 창으로
   position:fixed 시킨다 — 같은 <video> 라 HLS 재생은 안 끊긴다. 앵커는
   16:9 자리를 그대로 지켜 아래 콘텐츠가 안 튄다. 미니 창을 탭하면(별 제외)
   영상 원위치로 스크롤. 리모콘(우하단)과 안 겹치게 좌하단 고정. */
function setupDock(mount, player){
  if (!("IntersectionObserver" in window)) return;
  const anchor = document.createElement("div");
  anchor.className = "player-anchor";
  mount.insertBefore(anchor, player);
  anchor.appendChild(player);

  let docked = false;
  const setDocked = (on) => {
    if (on === docked) return;
    docked = on;
    player.classList.toggle("is-docked", on);
    mount.classList.toggle("has-docked-player", on);
  };

  /* 원위치가 화면 위로 대부분(60%+) 빠져나갔을 때만 도킹. 아래로 스크롤해
     아직 영상에 닿지 않은 상태(top>0)에선 도킹하지 않는다. */
  new IntersectionObserver((entries) => {
    const e = entries[entries.length - 1];
    setDocked(e.boundingClientRect.top < 0 && e.intersectionRatio < 0.4);
  }, { threshold: [0, 0.4, 1] }).observe(anchor);

  player.addEventListener("click", (ev) => {
    if (!docked || ev.target.closest(".fav-star")) return;
    anchor.scrollIntoView({ behavior: "smooth", block: "center" });
  });
}

function mountPlayer(el, cams){
  const player = document.createElement("div");
  player.className = "player";
  const video = document.createElement("video");
  /* controls=false — 네이티브 컨트롤을 켜면 iOS 사파리가 자동재생·스트림
     교체(카메라 전환, HLS/VOD 주기 갱신)마다 화면 중앙에 큰 재생/일시정지
     아이콘을 몇 초간 띄워 화면을 가린다. 실시간 CCTV라 되감기·일시정지가
     의미 없으므로 컨트롤 자체를 끈다. */
  video.controls = false; video.autoplay = true; video.muted = true;
  video.setAttribute("playsinline", "");
  video.setAttribute("disablePictureInPicture", "");
  video.setAttribute("controlsList", "nodownload noremoteplayback");
  const camLabel = document.createElement("div");
  camLabel.className = "cam-label";   // 지금 보는 카메라 이름 — 화면 상단 중앙, 항상 표시
  const ov = document.createElement("div");
  ov.className = "overlay"; ov.textContent = "불러오는 중…";
  ov.setAttribute("role", "status"); ov.setAttribute("aria-live", "polite");

  /* 우상단 ☆ — 지금 보는 카메라를 내 CCTV(localStorage)에 등록/해제.
     지역·페이지 정보는 런타임 컨텍스트에서 뽑되, 합성 덱(즐겨찾기 목록
     페이지)의 카메라는 객체에 원본 region/page 를 달고 오므로 그쪽을 우선. */
  const ctxRegion = (location.pathname.split("/").filter(Boolean)[0] || "").toLowerCase();
  const ctxRegionName = (document.body && document.body.dataset.region) || "";
  const ctxPageLabel = el.dataset.label ||
    (document.querySelector(".wrap h1") && document.querySelector(".wrap h1").textContent.trim()) || "";
  const favBtn = document.createElement("button");
  favBtn.type = "button";
  favBtn.className = "fav-star";
  favBtn.setAttribute("aria-pressed", "false");
  favBtn.textContent = "☆";
  let favCam = null;
  const favKey = (cam) => (cam.region || ctxRegion) + ":" + cam.id;
  function favSync(cam){
    favCam = cam;
    const on = cam && cam.id != null && window.rcFav.has(favKey(cam));
    favBtn.textContent = on ? "★" : "☆";
    favBtn.setAttribute("aria-pressed", on ? "true" : "false");
    favBtn.setAttribute("aria-label", on ? "내 CCTV에서 빼기" : "이 카메라를 내 CCTV에 등록");
    favBtn.title = favBtn.getAttribute("aria-label");
  }
  /* 상한 초과 등 짧은 안내 — 플레이어 하단 중앙에 3초 */
  const favToast = document.createElement("div");
  favToast.className = "fav-toast";
  favToast.hidden = true;
  let favToastTimer = null;
  function showFavToast(msg){
    favToast.textContent = msg;
    favToast.hidden = false;
    clearTimeout(favToastTimer);
    favToastTimer = setTimeout(() => { favToast.hidden = true; }, 3200);
  }
  favBtn.addEventListener("click", () => {
    if (!favCam || favCam.id == null) return;
    const res = window.rcFav.toggle({
      region: favCam.region || ctxRegion,
      regionName: favCam.regionName || ctxRegionName,
      id: favCam.id, name: favCam.name, type: favCam.type,
      lat: favCam.lat, lng: favCam.lng,
      url: favCam.type === "seoul" ? favCam.url : undefined,   // TOPIS 직접 m3u8 만 저장(GITS 토큰 URL 은 저장 안 함)
      page: favCam.page || location.pathname,
      pageLabel: favCam.pageLabel || ctxPageLabel,
      added: Date.now(),
    });
    if (res === "full"){
      showFavToast("내 CCTV는 최대 " + window.rcFav.max + "개예요. 목록에서 하나 뺀 뒤 추가하세요.");
      return;
    }
    favSync(favCam);
  });
  document.addEventListener("rc-fav-change", () => { if (favCam) favSync(favCam); });

  player.append(video, camLabel, ov, favBtn, favToast);   // 상태 문구(로딩·재접속·오류만) — 화면 정중앙

  const accordion = el.hasAttribute("data-cam-accordion");
  const camsEl = document.createElement("div"); camsEl.className = "cams";
  const mapEl = document.createElement("div"); mapEl.className = "map";
  const btnPrefix = "cam-btn-d" + (el.dataset.deck || "0") + "-";
  const mapApi = makeMap(mapEl, cams, btnPrefix);

  if (mapApi.ok){
    /* 지도는 기본 접힘. 배치: CCTV → 지도(펼침 시 바로 밑) → 지도 토글 → 카메라 버튼.
       펼침 상태는 페이지별이 아니라 전역(MAP_OPEN_KEY) 기억 — wantsMapOpen() 참고. */
    mapEl.hidden = true;
    const mapToggle = document.createElement("button");
    mapToggle.type = "button";
    mapToggle.className = "map-toggle";
    mapToggle.setAttribute("aria-expanded", "false");
    mapToggle.innerHTML = '<span class="map-toggle-label">지도 보기</span>' +
                          '<span class="sec-chev" aria-hidden="true"></span>';

    function setMapOpen(open){
      mapEl.hidden = !open;
      el.classList.toggle("is-map-open", open);
      mapToggle.setAttribute("aria-expanded", open ? "true" : "false");
      mapToggle.querySelector(".map-toggle-label").textContent = open ? "지도 접기" : "지도 보기";
      if (open) requestAnimationFrame(() => mapApi.reveal());
    }
    mapToggle.addEventListener("click", () => {
      const open = mapEl.hidden;
      setMapOpen(open);
      rememberMapOpen(open);
    });
    if (wantsMapOpen()) setMapOpen(true);
    el.append(player, mapEl, mapToggle, camsEl);
  } else {
    el.append(player, camsEl);
  }

  /* 미니 플레이어 도킹 — 페이지에 플레이어가 하나뿐일 때만(여러 개면 고정
     미니창이 겹친다). 즐겨찾기 합성 덱 등 다중 마운트에선 건너뛴다. */
  if (document.querySelectorAll(".player-mount").length === 1) setupDock(el, player);

  const onSelect = (cam) => { mapApi.focus(cam); favSync(cam); };
  const slot = makeSlot(video, camsEl, camLabel, ov, onSelect, btnPrefix, accordion);
  slot.renderButtons(cams);

  /* 공유 링크로 들어온 경우 — ?cam=<id> 가 이 덱에 있으면 그 카메라부터 재생하고
     플레이어를 화면 가운데로 스크롤한다(remote.js 의 공유 버튼이 붙여 보낸 값).
     페이지당 플레이어는 하나라 deck 구분은 불필요. */
  let firstCam = cams.find(c => c.id);
  try {
    const wantId = parseInt(new URLSearchParams(location.search).get("cam"), 10);
    if (wantId){
      const wantCam = cams.find(c => c.id === wantId);
      if (wantCam){
        firstCam = wantCam;
        requestAnimationFrame(() => el.scrollIntoView({ block: "center" }));
        if (window.gtag) window.gtag("event", "shared_cam_open", { cam_id: wantId });
      }
    }
  } catch (e) {}
  slot.start(firstCam);
}

/* 페이지가 여러 개의 플레이어를 담으면 스타트를 300ms 간격으로 흘려보낸다
   (서버 리졸버가 동시에 몰리지 않도록). 대부분은 1개라 지연 없음. */
const mounts = [...document.querySelectorAll(".player-mount")];
mounts.forEach((el, i) => {
  const cams = (typeof DECKS !== "undefined") && DECKS[+el.dataset.deck];
  if (!cams) return;
  if (mounts.length > 1 && i > 0) setTimeout(() => mountPlayer(el, cams), i * 300);
  else mountPlayer(el, cams);
});
