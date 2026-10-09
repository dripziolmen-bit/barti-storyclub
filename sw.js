const CACHE='barti-storyclub-v22';
const CORE=['./','./index.html','./styles.css','./experience.css','./fairytale.css','./v2.css','./v2.css?v=22','./menu-v20.css','./menu-v20.css?v=22','./menu-v22.css','./menu-v22.css?v=22','./assets/character/reader-book.svg','./app.js','./experience.js','./manifest.webmanifest','./assets/barti.webp','./assets/character/idle.webp','./assets/character/motion/explain.webp','./assets/character/motion/celebrate.webp','./assets/character/motion/wave.webp','./assets/character/motion/reading.webp','./assets/character/motion/rest.webp','./assets/character/blink.webp','./assets/character/talk.webp','./assets/character/explain.webp','./assets/character/wave.webp','./assets/character/celebrate.webp','./assets/art/cover-repka.webp','./assets/art/cover-ryaba.webp','./assets/art/cover-kolobok.webp','./assets/visuals/covers/repka.webp','./assets/visuals/covers/ryaba.webp','./assets/visuals/covers/kolobok.webp','./assets/icon-192.png','./assets/icon-512.png','./data/stories.json','./data/audio.json','./data/word-timing.json','./data/lexicon.json','./privacy.html'];
const STORY_COUNTS = {"repka": 7, "ryaba": 5, "kolobok": 7, "teremok": 6, "masha": 6, "lisa-zhuravl": 6, "zaika-lisa-petuh": 6, "volk-kozl": 6, "gusi-lebedi": 6, "snegurochka": 6, "morozko": 6, "shchuka": 6, "carevna": 6, "ivan-volk": 6, "havroshechka": 6, "lisa-rak": 6, "tri-medvedya": 6, "kot-petuh-lisa": 6};
const STORY_COVERS = Object.keys(STORY_COUNTS).map(id=>id==='repka'||id==='ryaba'||id==='kolobok'?'./assets/visuals/covers/'+id+'.webp':'./assets/visuals/covers/'+id+'.svg');
const AUDIO = Object.entries(STORY_COUNTS).flatMap(([id,count])=>Array.from({length:count},(_,i)=>'./assets/audio/'+id+'-'+i+'.mp3')).concat('./assets/audio/ambient.mp3');
const ILLUSTRATIONS = ['./assets/ui/library.svg','./assets/ui/words.svg','./assets/ui/achievements.svg','./assets/ui/more.svg'];

self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll([...CORE,...STORY_COVERS,...ILLUSTRATIONS,...AUDIO])).then(()=>self.skipWaiting()));});
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
