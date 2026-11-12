const V='kk-__VERSION__';
const SHELL=['./','index.html','manifest.webmanifest','icons/icon-192.png','icons/icon-512.png','icons/favicon.svg'];
const AUDIO_FILES=__AUDIO_FILES__;
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(SHELL).then(()=>c.addAll(AUDIO_FILES).catch(()=>{}))).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET')return;
  const u=new URL(r.url);
  if(r.mode==='navigate'){e.respondWith(fetch(r).then(res=>{const cp=res.clone();caches.open(V).then(c=>c.put('index.html',cp));return res}).catch(()=>caches.match('index.html')));return}
  if(/\/pdf\//.test(u.pathname)||u.pathname.startsWith('/api/'))return;
  if(u.origin===location.origin||/fonts\.(googleapis|gstatic)\.com$/.test(u.hostname)){
    e.respondWith(caches.match(r).then(hit=>{const net=fetch(r).then(res=>{if(res.ok||res.type==='opaque'){const cp=res.clone();caches.open(V).then(c=>c.put(r,cp))}return res}).catch(()=>hit);return hit||net}));
  }
});
// 웹 푸시 알림
self.addEventListener('push',e=>{let d={};try{d=e.data?e.data.json():{}}catch(_){d={title:'ぐるぐる',body:e.data&&e.data.text()}}
  e.waitUntil(self.registration.showNotification(d.title||'ぐるぐる',{body:d.body||'',tag:d.tag||undefined,renotify:!!d.tag,icon:'icons/icon-192.png',badge:'icons/icon-192.png',data:{url:d.url||'/'}}))});
self.addEventListener('notificationclick',e=>{e.notification.close();const url=new URL(e.notification.data&&e.notification.data.url||'/',self.location.origin).href;
  e.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(cs=>{for(const c of cs){if(c.url.startsWith(self.location.origin)){c.focus();return c.navigate(url)}}return self.clients.openWindow(url)}))});
