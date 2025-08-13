self.addEventListener('install', (e)=>{
  self.skipWaiting();
  e.waitUntil(caches.open('skol-v1').then(cache=>cache.addAll([
    './',
    './index.html',
    './styles.css',
    './script.js',
    './manifest.webmanifest',
    './data/apps.json'
  ])));
});
self.addEventListener('activate', (e)=>{ e.waitUntil(self.clients.claim()); });
self.addEventListener('fetch', (e)=>{
  e.respondWith(
    caches.match(e.request).then(res=> res || fetch(e.request))
  );
});
