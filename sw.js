/* Barti Story Club offline v23 — fast reliable installation + explicit full-library download. */
const CACHE='barti-storyclub-v25';
const STORY_COUNTS={"repka":7,"ryaba":5,"kolobok":7,"teremok":6,"masha":6,"lisa-zhuravl":6,"zaika-lisa-petuh":6,"volk-kozl":6,"gusi-lebedi":6,"snegurochka":6,"morozko":6,"shchuka":6,"carevna":6,"ivan-volk":6,"havroshechka":6,"lisa-rak":6,"tri-medvedya":6,"kot-petuh-lisa":6};
const STORY_COVERS=Object.keys(STORY_COUNTS).map(id=>['repka','ryaba','kolobok'].includes(id)?'./assets/visuals/covers/'+id+'.webp':'./assets/visuals/covers/'+id+'.svg');
const AUDIO=Object.entries(STORY_COUNTS).flatMap(([id,n])=>Array.from({length:n},(_,i)=>'./assets/audio/'+id+'-'+i+'.mp3')).concat('./assets/audio/ambient.mp3');
const ESSENTIAL=['./','./index.html','./app.js','./experience.js','./data/stories.json','./data/audio.json','./data/lexicon.json'];
const SHELL=['./styles.css','./experience.css','./fairytale.css','./v2.css?v=24','./menu-v20.css?v=24','./menu-v22.css?v=24','./library-v24.css?v=24','./studio-v25.css?v=25','./assets/character/reading.webp','./assets/visuals/covers/kolobok.webp','./assets/visuals/covers/ryaba.webp','./data/word-timing.json','./manifest.webmanifest','./assets/character/idle.webp','./assets/character/reader-book.svg','./assets/visuals/covers/repka.webp','./assets/audio/repka-0.mp3','./assets/audio/teremok-0.mp3','./assets/ui/library.svg','./assets/ui/words.svg','./assets/ui/achievements.svg','./assets/ui/more.svg'];
const ANIMATION=['./assets/character/motion/rest.webp','./assets/character/motion/reading.webp','./assets/character/motion/explain.webp','./assets/character/motion/wave.webp','./assets/character/motion/celebrate.webp'];
self.addEventListener('install',event=>event.waitUntil((async()=>{
 const cache=await caches.open(CACHE);
 await cache.addAll(ESSENTIAL);
 await Promise.allSettled(SHELL.map(f=>cache.add(f)));
 await self.skipWaiting();
})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{
 await self.clients.claim();
 const keys=await caches.keys();
 await Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)));
})()));
self.addEventListener('fetch',event=>{
 const request=event.request,url=new URL(request.url);
 if(request.method!=='GET'||url.origin!==self.location.origin)return;
 if(request.mode==='navigate'){
  event.respondWith(fetch(request).then(response=>{
   if(response.ok){
    const copy=response.clone();
    event.waitUntil(caches.open(CACHE).then(c=>c.put(request,copy)).catch(()=>{}));
   }
   return response;
  }).catch(async()=>await caches.match(request)||await caches.match('./index.html')));
  return;
 }
 event.respondWith(caches.match(request).then(cached=>cached||fetch(request).then(response=>{
  if(response.ok){
   const copy=response.clone();
   event.waitUntil(caches.open(CACHE).then(c=>c.put(request,copy)).catch(()=>{}));
  }
  return response;
 })));
});
self.addEventListener('message',event=>{
 if(event.data?.type==='CACHE_ALL'){
  event.waitUntil((async()=>{
   const cache=await caches.open(CACHE);
   const files=[...new Set([...STORY_COVERS,...AUDIO,...ANIMATION])];
   let done=0,failed=0;
   async function one(file){
    try{
     if(!(await cache.match(file))){
      let ok=false;
      for(let attempt=0;attempt<3;attempt++){
       try{await cache.add(file);ok=true;break}catch{await new Promise(r=>setTimeout(r,450*(attempt+1)))}
      }
      if(!ok)failed++;
     }
    }catch{failed++}
    done++;
    if(done%4===0||done===files.length)event.source?.postMessage({type:'CACHE_PROGRESS',done,total:files.length,failed,complete:done===files.length});
   }
   for(let i=0;i<files.length;i+=4)await Promise.all(files.slice(i,i+4).map(one));
  })());
 }
});
