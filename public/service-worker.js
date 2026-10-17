/* ============================================================
   APNA ELECTRIC ONE — Service Worker (PWA)
   Path: public/service-worker.js
   ============================================================ */

const CACHE = 'aeo-v2';

const SHELL = [
    './',
    './index.html',
    './shop.html',
    './driver.html',
    './admin.html',
    './settings.html',
    './manifest.json',
    './assets/app.css',
    './assets/data.js',
    './assets/firebase.js',
    './assets/auth.js',
    './assets/payment.js',
    './assets/customer.js',
    './assets/shop.js',
    './assets/driver.js',
    './assets/admin.js',
    './icon-192.png',
    './icon-512.png',
    './favicon.png'
];

self.addEventListener('install', function (e) {
    e.waitUntil(
        caches.open(CACHE).then(function (c) {
            return Promise.all(SHELL.map(function (u) {
                return c.add(u).catch(function () { /* ignore missing */ });
            }));
        }).then(function () { return self.skipWaiting(); })
    );
});

self.addEventListener('activate', function (e) {
    e.waitUntil(
        caches.keys().then(function (keys) {
            return Promise.all(keys.map(function (k) {
                if (k !== CACHE) return caches.delete(k);
            }));
        }).then(function () { return self.clients.claim(); })
    );
});

self.addEventListener('fetch', function (e) {
    const req = e.request;
    if (req.method !== 'GET') return;

    const url = new URL(req.url);

    // Never cache Firebase / Firestore / Google APIs / CDN
    if (url.origin !== self.location.origin) return;
    if (url.pathname.indexOf('/__/') === 0) return;

    // Navigations: network-first (fresh), fallback to cache
    if (req.mode === 'navigate') {
        e.respondWith(
            fetch(req).then(function (res) {
                const copy = res.clone();
                caches.open(CACHE).then(function (c) { c.put(req, copy); });
                return res;
            }).catch(function () {
                return caches.match(req).then(function (r) { return r || caches.match('./index.html'); });
            })
        );
        return;
    }

    // Static assets: network-first (fresh code), cache fallback for offline
    e.respondWith(
        fetch(req).then(function (res) {
            if (res && res.status === 200 && res.type === 'basic') {
                const copy = res.clone();
                caches.open(CACHE).then(function (c) { c.put(req, copy); });
            }
            return res;
        }).catch(function () {
            return caches.match(req).then(function (r) {
                return r || new Response('Offline', { status: 503, statusText: 'Offline' });
            });
        })
    );
});
