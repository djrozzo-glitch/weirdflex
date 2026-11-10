// BREACH.exe 4.2 — versioned offline shell, network-first navigation.
const CACHE='breach-exe-5.0.0';
const SHELL=['./','./index.html','./manifest.webmanifest','./favicon.png','./icon-192.png','./icon-512.png'];
const GAME_ASSETS=[
'assets/keyart.png',
'assets/branding/logo.png','assets/branding/access_granted.png','assets/branding/trace_detected.png',
'assets/screens/missions.png','assets/screens/victory.png','assets/screens/failure.png',
'assets/tiles/straight.png','assets/tiles/corner.png','assets/tiles/tee.png','assets/tiles/cross.png','assets/tiles/endcap.png','assets/tiles/source.png','assets/tiles/target.png','assets/tiles/firewall.png',
'assets/objects/router.png','assets/objects/vault.png','assets/objects/ice.png','assets/objects/relay.png','assets/objects/server_rack.png','assets/objects/server_core.png','assets/objects/shield.png','assets/objects/boss_gate.png','assets/objects/drone.png','assets/objects/trace.png'
].map(x=>'./'+x);
const PRELOAD=[...SHELL,...GAME_ASSETS];
self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(PRELOAD)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.filter(k=>k.startsWith('breach-exe-')&&k!==CACHE).map(k=>caches.delete(k)));
    await self.clients.claim();
  })());
});
self.addEventListener('fetch',event=>{
  const req=event.request;
  if(req.method!=='GET'||new URL(req.url).origin!==self.location.origin)return;
  if(req.mode==='navigate'){
    event.respondWith((async()=>{
      try{
        const controller=new AbortController();
        const timeout=setTimeout(()=>controller.abort(),3500);
        try{
          const res=await fetch(req,{signal:controller.signal});
          if(res.ok){const cache=await caches.open(CACHE);await cache.put('./index.html',res.clone());}
          return res;
        }finally{clearTimeout(timeout)}
      }catch{return await caches.match('./index.html')||Response.error()}
    })());
    return;
  }
  event.respondWith((async()=>{
    const cached=await caches.match(req);if(cached)return cached;
    const res=await fetch(req);
    if(res.ok){const cache=await caches.open(CACHE);event.waitUntil(cache.put(req,res.clone()));}
    return res;
  })());
});
