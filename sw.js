var CACHE = 'cave-v2';
var ASSETS = ['./', './index.html', './manifest.webmanifest', './icon.svg'];
self.addEventListener('install', function (e) { e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(ASSETS); }).then(function () { return self.skipWaiting(); })); });
self.addEventListener('activate', function (e) { e.waitUntil(caches.keys().then(function (ks) { return Promise.all(ks.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); })); }).then(function () { return self.clients.claim(); })); });
self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  var url = new URL(e.request.url);
  if (url.hostname === 'login.microsoftonline.com' || url.hostname === 'graph.microsoft.com' || url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') return;
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then(function (r) { return r || fetch(e.request).then(function (resp) { var cl = resp.clone(); caches.open(CACHE).then(function (c) { c.put(e.request, cl); }); return resp; }).catch(function () { return caches.match('./index.html'); }); }));
});