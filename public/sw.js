/*
 * Service Worker של טוקאייר.
 * מטרות: התקנה במסך הבית ועבודה סבירה בחיבור חלש.
 * פרטיות: דפי /staff ו /admin לא נשמרים ב cache, כדי שמידע פנימי לא יישאר במכשיר משותף.
 */
const VERSION = "tokayer-v1";
const STATIC_CACHE = `${VERSION}-static`;
const PAGES_CACHE = `${VERSION}-pages`;
const OFFLINE_URL = "/offline.html";
const PRECACHE = [OFFLINE_URL, "/logo.png", "/logo-mark.png", "/icons/icon-192.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(STATIC_CACHE).then((cache) => cache.addAll(PRECACHE)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

function isPrivate(url) {
  return /^\/(staff|admin|auth|login|api)(\/|$)/.test(url.pathname);
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // קבצים סטטיים של Next ותמונות: cache first
  if (url.pathname.startsWith("/_next/static/") || /\.(png|svg|jpg|jpeg|webp|woff2?)$/.test(url.pathname)) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            if (response.ok) {
              const copy = response.clone();
              caches.open(STATIC_CACHE).then((cache) => cache.put(request, copy));
            }
            return response;
          }),
      ),
    );
    return;
  }

  if (request.mode !== "navigate") return;

  // אזור הצוות: תמיד מהרשת. בלי חיבור מציגים דף "אין חיבור"
  if (isPrivate(url)) {
    event.respondWith(fetch(request).catch(() => caches.match(OFFLINE_URL)));
    return;
  }

  // דפים ציבוריים: רשת קודם, ובלי חיבור הגרסה השמורה
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(PAGES_CACHE).then((cache) => cache.put(request, copy));
        }
        return response;
      })
      .catch(() => caches.match(request).then((cached) => cached || caches.match(OFFLINE_URL))),
  );
});
