/* ═══════════════════════════════════════════════════════════════
   하남라이프 service worker — PWA 오프라인 껍데기 + 빠른 재실행.

   전략
   - 정적 자원(css·js·아이콘, 같은 오리진)      → 캐시 우선, 없으면 네트워크에 받아 캐시
   - 문서(navigate: 페이지 이동/새로고침)       → 네트워크 우선, 실패 시 캐시, 그래도 없으면 홈
   - 실시간(/api/*, .m3u8, .ts, 타 오리진)      → 개입 안 함(항상 네트워크)
       └ CCTV 영상·소통·돌발·AdSense·GA 는 절대 캐시하지 않는다

   배포 때마다 CACHE 의 버전 문자열을 올린다 → activate 에서 옛 캐시 전부 삭제.
   (styles.css?v=… 처럼 자원 URL 에 붙는 ?v= 와 별개. 이건 SW 캐시 통째 무효화용)
   ═══════════════════════════════════════════════════════════════ */
const CACHE = "hanamlife-v1";

/* 최초 설치 때 미리 담아둘 최소 껍데기. 전부 쿼리 없는 안정 URL 이라야
   addAll 이 실패하지 않는다(하나라도 404 면 설치 전체가 실패). */
const SHELL = [
  "/",
  "/manifest.webmanifest",
  "/assets/favicon.svg",
  "/assets/img/icon-192.png",
  "/assets/img/apple-touch-icon.png",
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

/* 페이지가 새 SW 를 즉시 쓰고 싶을 때 postMessage({type:'SKIP_WAITING'}) */
self.addEventListener("message", (e) => {
  if (e.data && e.data.type === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  const sameOrigin = url.origin === self.location.origin;

  // 실시간·외부 리소스는 SW 가 손대지 않는다
  // /data/* = 공지 등 자주 바뀌는 JSON → 항상 네트워크(HTTP max-age 로만 캐시)
  if (
    !sameOrigin ||
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/data/") ||
    url.pathname.endsWith(".m3u8") ||
    url.pathname.endsWith(".ts")
  ) {
    return;
  }

  // 문서 이동 → 네트워크 우선(최신 우선), 끊기면 캐시, 최후엔 홈
  if (req.mode === "navigate") {
    e.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req).then((r) => r || caches.match("/")))
    );
    return;
  }

  // 그 외 같은 오리진 자원(css·js·이미지·폰트) → 캐시 우선
  e.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((res) => {
        // 정상 응답만 캐시(오파크·에러 제외)
        if (res && res.status === 200 && res.type === "basic") {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
        }
        return res;
      });
    })
  );
});
