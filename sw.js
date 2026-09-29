var CACHE = 'cave-v2-4-3';
var ASSETS = ['./', './index.html', './manifest.webmanifest', './icon.svg', './icon-180.png', './icon-192.png', './icon-512.png'];
// Installation tolérante : un fichier manquant ne bloque plus la mise à jour de l'appli
self.addEventListener('install', function (e) { e.waitUntil(caches.open(CACHE).then(function (c) { return Promise.all(ASSETS.map(function (a) { return c.add(new Request(a, { cache: 'reload' })).catch(function () {}); })); }).then(function () { return self.skipWaiting(); })); });
self.addEventListener('activate', function (e) { e.waitUntil(caches.keys().then(function (ks) { return Promise.all(ks.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); })); }).then(function () { return self.clients.claim(); })); });
self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  var url = new URL(e.request.url);
  if (url.hostname === 'login.microsoftonline.com' || url.hostname === 'graph.microsoft.com' || url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') return;
  // Pages : réseau d'abord (les mises à jour arrivent tout de suite), cache si hors ligne
  if (e.request.mode === 'navigate') {
    e.respondWith(fetch(e.request).then(function (resp) { if (resp && resp.ok) { var cl = resp.clone(); caches.open(CACHE).then(function (c) { c.put('./index.html', cl); }); } return resp; })
      .catch(function () { return caches.match('./index.html'); }));
    return;
  }
  var cached = caches.match(e.request, { ignoreSearch: true });
  var live = fetch(e.request).then(function (resp) { if (resp && resp.ok) { var cl = resp.clone(); caches.open(CACHE).then(function (c) { c.put(e.request, cl); }); } return resp; }).catch(function () { return cached.then(function (c) { return c || caches.match('./index.html'); }); });
  e.respondWith(cached.then(function (c) { return c || live; }).then(function (r) { return r || live; }).catch(function () { return live; }));
});