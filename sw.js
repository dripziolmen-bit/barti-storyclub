const CACHE='barti-storyclub-v10';
const CORE=['./','./index.html','./styles.css','./experience.css','./fairytale.css','./app.js','./experience.js','./manifest.webmanifest','./assets/barti.webp','./assets/art/cover-repka.webp','./assets/art/cover-ryaba.webp','./assets/art/cover-kolobok.webp','./assets/art/barti-motion.webp','./assets/visuals/sprites/idle.webp','./assets/visuals/sprites/blink.webp','./assets/visuals/sprites/wave.webp','./assets/visuals/sprites/talk.webp','./assets/visuals/sprites/explain.webp','./assets/visuals/sprites/celebrate.webp','./assets/visuals/covers/repka.webp','./assets/visuals/covers/ryaba.webp','./assets/visuals/covers/kolobok.webp','./assets/icon-192.png','./assets/icon-512.png','./data/stories.json','./data/audio.json','./data/word-timing.json','./data/lexicon.json','./privacy.html'];
const AUDIO=['repka','ryaba','kolobok'].flatMap(sid=>Array.from({length:sid==='ryaba'?5:7},(_,i)=>'./assets/audio/'+sid+'-'+i+'.mp3')).concat('./assets/audio/ambient.mp3');
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll([...CORE,...AUDIO])).then(()=>self.skipWaiting()));});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',event=>{
 if(event.request.method!=='GET'||new URL(event.request.url).origin!==self.location.origin)return;
 if(event.request.mode==='navigate'){
  event.respondWith(fetch(event.request).then(response=>{
    if(response.ok){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy));}
    return response;
  }).catch(()=>caches.match(event.request).then(hit=>hit||caches.match('./index.html'))));
  return;
 }
 event.respondWith(caches.match(event.request).then(hit=>hit||fetch(event.request).then(response=>{
   if(response.ok){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy));}
   return response;
 })));
});
