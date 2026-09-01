/* ═══════════════════════════════════════════════════════════════
   스타필드 하남 실시간 주차 혼잡도.

   /api/parking (Cloudflare Pages Function) 이 스타필드 내부 API 를
   서버측에서 대신 호출해 4개 층(RF·B1·B2·B3) 상태만 돌려준다.
   REFRESH_SEC 마다 갱신. 실패하면(예: 함수 없는 환경) 패널을 숨긴다.
   ═══════════════════════════════════════════════════════════════ */
(function () {
  const box = document.getElementById("sf-parking");
  if (!box) return;

  const listEl = box.querySelector("[data-floors]");
  const updEl  = box.querySelector("[data-upd]");
  const REFRESH_SEC = 90;

  const hhmm = iso => {
    const d = new Date(iso);
    return isNaN(d) ? "" : d.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });
  };

  function render(floors) {
    listEl.innerHTML = floors.map(f => {
      const deg = f.deg ? ' data-deg="' + f.deg + '"' : "";
      const sub = f.sub ? '<small>' + f.sub + '</small>' : "";
      const st  = '<span class="st">' + (f.status || "—") + '</span>';
      return '<li' + deg + '><span class="lv"></span>' + f.label + sub + st + '</li>';
    }).join("");
  }

  async function load() {
    let data;
    try {
      const r = await fetch("/api/parking", { cache: "no-store" });
      data = await r.json();
      if (!data || !data.ok || !Array.isArray(data.floors) || !data.floors.length) throw 0;
    } catch (e) {
      box.hidden = true;
      return;
    }
    render(data.floors);
    updEl.textContent = data.updated ? "업데이트 " + hhmm(data.updated) : "";
    box.hidden = false;
  }

  load();
  setInterval(load, REFRESH_SEC * 1000);
})();
