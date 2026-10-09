/* Barti Story Club — app navigation and new illustrated experience. Existing audio/word engine is retained in app.js. */
const xp=(id)=>document.getElementById(id);
const storyArtwork={repka:'./assets/visuals/covers/repka.webp',ryaba:'./assets/visuals/covers/ryaba.webp',kolobok:'./assets/visuals/covers/kolobok.webp'};
const descriptions={
  repka:'Dziadek sadzi rzepkę, która rośnie tak wielka, że do pomocy potrzeba całej rodziny. Odkryj, jak wielką moc ma współpraca.',
  ryaba:'Kurka Riaba znosi niezwykłe złote jajko. Krótka, ciepła opowieść, idealna na pierwsze rosyjskie słowa.',
  kolobok:'Mały, sprytny kołobok wyrusza w podróż leśną ścieżką. Po drodze spotyka wiele zwierząt.'
};
const xpState={page:'home',stories:[],selected:null,filter:'all',query:'',ready:false,pendingPlay:false,favorites:readFavorites()};
function createEl(tag,attrs={},children=[]){
 const node=document.createElement(tag);
 Object.entries(attrs).forEach(([key,value])=>{
  if(key==='class')node.className=value;
  else if(key==='text')node.textContent=value;
  else if(key==='src')node.src=value;
  else node.setAttribute(key,String(value));
 });
 for(const child of children) node.append(typeof child==='string'?document.createTextNode(child):child);
 return node;
}
function storyDuration(story){return Math.max(1,Math.round(((window.BartiBridge?.durations?.()[story.id]||[]).reduce((a,b)=>a+b,0))/60))+' min'}
function imageFor(story){return storyArtwork[story.id]||'./assets/barti.webp'}
function readFavorites(){try{const v=JSON.parse(localStorage.getItem('barti.favorites')||'[]');return Array.isArray(v)?v:[]}catch{return []}}
function toggleFavorite(id){const set=new Set(xpState.favorites);set.has(id)?set.delete(id):set.add(id);xpState.favorites=[...set];try{localStorage.setItem('barti.favorites',JSON.stringify(xpState.favorites))}catch{}renderCards();}
function buildCard(story,compact=false){
 const card=createEl('article',{class:compact?'home-story-card':'library-card'});
 card.dataset.storyId=story.id;
 const cover=createEl('img',{src:imageFor(story),alt:'Ilustracja bajki '+story.titlePl,loading:'eager',decoding:'async'});
 const art=createEl('div',{class:compact?'v2-home-cover':'library-card-cover'},[cover,createEl('span',{class:'library-card-level',text:story.level})]);
 const title=createEl('h3',{text:story.title});
 const desc=createEl('p',{text:descriptions[story.id]||story.titlePl});
 const info=createEl('div',{class:compact?'v2-home-story-body':'library-card-body'},[
   createEl('div',{},[title,compact?createEl('small',{text:story.titlePl}):desc]),
   createEl('div',{class:'v2-story-meta'},[createEl('span',{text:story.level}),createEl('span',{text:storyDuration(story)}),createEl('span',{text:story.tag})])
 ]);
 const choose=createEl('button',{type:'button',class:'v2-story-open','aria-label':'Wybierz bajkę '+story.title},[createEl('span',{text:compact?'Poznaj bajkę':'Czytaj i słuchaj'}),createEl('span',{text:'›'})]);
 choose.addEventListener('click',()=>openDetail(story.id));
 const fav=createEl('button',{type:'button',class:'v2-favorite','aria-label':(xpState.favorites.includes(story.id)?'Usuń z ulubionych: ':'Dodaj do ulubionych: ')+story.title,'aria-pressed':xpState.favorites.includes(story.id)?'true':'false',text:xpState.favorites.includes(story.id)?'♥':'♡'});
 fav.addEventListener('click',event=>{event.stopPropagation();toggleFavorite(story.id)});
 art.append(fav);
 info.append(choose);
 card.append(art,info);
 card.addEventListener('click',event=>{if(!event.target.closest('button'))openDetail(story.id)});
 return card;
}
function renderCards(){
 if(!xpState.ready)return;
 xp('homeStoryCards').replaceChildren(...xpState.stories.map(story=>buildCard(story,true)));
 const items=xpState.stories.filter(story=>{
  const query=xpState.query.trim().toLocaleLowerCase('pl');
  const match=!query||[story.title,story.titlePl,story.tag].some(x=>x.toLocaleLowerCase('pl').includes(query));
  return match&&(xpState.filter==='all'||(xpState.filter==='favorites'?xpState.favorites.includes(story.id):xpState.filter==='A2'?story.level.includes('A2'):story.level==='A1'));
 });
 xp('libraryGrid').replaceChildren(...items.map(story=>buildCard(story)));
 xp('libraryEmpty').hidden=items.length>0;
 xp('libraryCount').textContent=items.length===1?'1 opowieść':items.length+' opowieści';
}
function detailStory(){
 const story=xpState.stories.find(x=>x.id===xpState.selected);
 return story||xpState.stories[0];
}
function openDetail(id){
 const story=xpState.stories.find(x=>x.id===id); if(!story)return;
 xpState.selected=story.id;
 xp('detailCover').style.backgroundImage='url("'+imageFor(story)+'")';
 xp('detailTitle').textContent=story.title;
 xp('detailTitlePl').textContent=story.titlePl;
 xp('detailDesc').textContent=descriptions[story.id]||story.source;
 xp('detailLevel').textContent=story.level+' · '+story.tag.toUpperCase();
 xp('detailTime').textContent=storyDuration(story)+' słuchania';
 const count=(story.paragraphs.join(' ').match(/[А-Яа-яЁё]+(?:-[А-Яа-яЁё]+)*/g)||[]).length;
 xp('detailWords').textContent=count+' wyrazów';
 xp('storyDetail').hidden=false;
 xp('detailStart').focus();
 document.body.style.overflow='hidden';
}
function closeDetail(){
 xp('storyDetail').hidden=true;
 document.body.style.overflow='';
}
function navigate(page='home',storyId=null,replace=false){
 if(page==='read')page='reader';
 if(!['home','library','words','achievements','more','reader'].includes(page))page='home';
 const previous=xpState.page;
 if(page==='reader'&&!xpState.ready)return;
 if(page!=='reader'&&previous==='reader')window.BartiBridge?.pause?.();
 if(page==='reader'&&storyId) window.BartiBridge?.openStory(storyId);
 xpState.page=page;
 document.body.dataset.page=page;
 const back=xp('appBack');
 if(back){back.hidden=page==='home'||page==='reader';back.setAttribute('aria-label','Wróć do menu głównego');}
  if(page!=='reader') document.querySelector('meta[name="theme-color"]')?.setAttribute('content','#ffeff7');
 xp('experienceShell').hidden=page==='reader';
 xp('appShell').hidden=page!=='reader';
 for(const [key,id] of [['home','homeScreen'],['library','libraryScreen'],['words','wordsScreen'],['achievements','achievementsScreen'],['more','moreScreen']]){
  xp(id).hidden=key!==page;
 }
 for(const tab of document.querySelectorAll('[data-nav]')){
   if(tab.dataset.nav===page)tab.setAttribute('aria-current','page');
   else tab.removeAttribute('aria-current');
 }
 closeDetail();
 if(page==='words')renderWords();
 if(page==='home')renderHomeStats();
 if(page==='achievements')renderAchievements();
 if(page==='more')renderMore();
 if(page==='library')renderCards();
 window.scrollTo(0,0);
 if(page!=='reader')requestAnimationFrame(()=>{
   window.scrollTo({top:0,left:0,behavior:'instant'});
   document.scrollingElement.scrollTop=0;
 });
 const suffix=page==='reader'?'/read/'+encodeURIComponent(storyId||window.BartiBridge?.getCurrentId?.()||'repka'):'/'+page;
 const hash='#'+suffix;
 if(location.hash!==hash){(replace?history.replaceState:history.pushState).call(history,{page},'',hash);}
 if(page==='reader')xp('readerReturn')?.focus({preventScroll:true});
}
function renderWords(){
 const saved=window.BartiBridge?.getVocab?.()||{};
 const words=Object.entries(saved).sort((a,b)=>a[0].localeCompare(b[0],'ru'));
 xp('xpWordsCount').textContent=words.length;
 xp('homeWordsCount').textContent=words.length;
 xp('xpWordsEmpty').hidden=words.length>0;
 const list=words.map(([word,translation])=>{
   const remove=createEl('button',{type:'button',text:'Usuń'});
   remove.addEventListener('click',()=>{
     window.BartiBridge?.removeWord?.(word);
     renderWords();
   });
   return createEl('div',{class:'xp-word-row'},[createEl('div',{},[createEl('strong',{text:word}),createEl('small',{text:translation})]),remove]);
 });
 xp('xpWordsList').replaceChildren(...list);
}
function applyReaderArt(){const id=window.BartiBridge?.getCurrentId?.()||'repka';const image=storyArtwork[id]||storyArtwork.repka;const banner=xp('readerArtBanner');if(banner)banner.style.backgroundImage=`url('${image}')`; }
function activateReader(id){
 const story=xpState.stories.find(s=>s.id===id);if(!story)return;
 navigate('reader',story.id); applyReaderArt();
}
function restoreHash(){
 const match=location.hash.match(/^#\/(home|library|words|achievements|more|read)(?:\/([^/?]+))?/);
 if(match&&match[1]==='read'){activateReader(decodeURIComponent(match[2]||xpState.stories[0]?.id||'repka'));}
 else navigate(match?match[1]:'home',null,true);
}
function insertPuppet(){
 for(const location of ['.head-barti-mobile','.mascot-stage']){
   const parent=document.querySelector(location);
   if(!parent||parent.querySelector('.barti-mini-puppet'))continue;
   parent.classList.add('has-puppet');
   const puppet=createEl('div',{class:'barti-mini-puppet'});
   puppet.append(createEl('div',{class:'puppet-film'}),createEl('span',{class:'puppet-eye one'}),createEl('span',{class:'puppet-eye two'}),createEl('span',{class:'puppet-mouth'}));
   parent.append(puppet);
 }
}
/* Flow-interpolated animated WebP character loops. Crossfade state changes; fallback to static on reduced motion. */
const motionClips={idle:'rest',paused:'rest',talking:'reading',reading:'reading',explain:'explain',excited:'wave',finished:'celebrate'};
let v2PoseMode='idle';
const motionFiles=['rest','reading','wave','celebrate','explain'];
function ensureMotionLayers(){
 for(const film of document.querySelectorAll('.barti-puppet .puppet-film,.barti-mini-puppet .puppet-film')){
  if(film.querySelector('.motion-layer'))continue;
  film.classList.add('motion-host');
  for(let j=0;j<2;j++){
   const layer=document.createElement('span');
   layer.className='motion-layer';
   layer.setAttribute('aria-hidden','true');
   film.appendChild(layer);
  }
  film.dataset.activeLayer='0';
 }
}
function startV2PoseAnimation(){
 ensureMotionLayers();
 if(!window.matchMedia('(prefers-reduced-motion: reduce)').matches){
  // preload only the essential speech and idle loops; action gestures are fetched on first use
  for(const clip of ['rest','reading']){
   const picture=new Image();
   picture.src='./assets/character/motion/'+clip+'.webp';
  }
 }
 updateMotion('idle',true);
}
function updateMotion(mode,initial=false){
 ensureMotionLayers();
 const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 const clip=motionClips[mode]||'rest';
 const url=reduced?"url('./assets/character/idle.webp')":"url('./assets/character/motion/"+clip+".webp')";
 for(const film of document.querySelectorAll('.motion-host')){
  if(film.dataset.motionClip===clip&&!initial)continue;
  const layers=Array.from(film.querySelectorAll('.motion-layer'));
  const current=Number(film.dataset.activeLayer||'0');
  const next=initial?current:1-current;
  const previous=layers[current];
  const incoming=layers[next];
  incoming.style.backgroundImage=url;
  if(initial){
   incoming.style.opacity='1';
   layers[1-next].style.opacity='0';
  }else{
   // Unlike discrete 6-frame swapping, both continuous loops overlap during transitions.
   incoming.style.opacity='0';
   void incoming.offsetWidth;
   incoming.style.opacity='1';
   previous.style.opacity='0';
   // Release old animated WebP frames after the crossfade to limit phone GPU/memory use.
   setTimeout(()=>{
    if(film.dataset.activeLayer===String(next)&&previous.style.opacity==='0'){
     previous.style.backgroundImage='none';
    }
   },460);
  }
  film.dataset.activeLayer=String(next);
  film.dataset.motionClip=clip;
 }
}
function onMode(mode){
 v2PoseMode=mode;
 updateMotion(mode);
 xp('homeBarti').dataset.mode=mode;
 if(xp('libraryBarti'))xp('libraryBarti').dataset.mode=mode;
 document.querySelectorAll('.barti-mini-puppet').forEach(p=>p.dataset.mode=mode);
 const captions={idle:'Cześć! Gotowy na nową bajkową przygodę?',talking:'Słuchaj i odkrywaj rosyjskie słowa!',paused:'Poczekam na Ciebie!',finished:'Brawo! Kolejna bajka za Tobą!',excited:'Hurra! Wybierzmy coś nowego!',explain:'Zobacz, jak to działa!'};
 xp('heroSpeech').textContent=captions[mode]||captions.idle;
}
function studyDays(){try{return JSON.parse(localStorage.getItem('barti.studyDays')||'[]')}catch{return []}}
function completedStories(){try{return JSON.parse(localStorage.getItem('barti.completedStories')||'[]')}catch{return []}}
function streakCount(){
 const days=new Set(studyDays());let n=0;const cursor=new Date();cursor.setHours(0,0,0,0);
 const today=[cursor.getFullYear(),String(cursor.getMonth()+1).padStart(2,'0'),String(cursor.getDate()).padStart(2,'0')].join('-');
 if(!days.has(today))cursor.setDate(cursor.getDate()-1);
 for(let i=0;i<365;i++){const date=[cursor.getFullYear(),String(cursor.getMonth()+1).padStart(2,'0'),String(cursor.getDate()).padStart(2,'0')].join('-');if(!days.has(date))break;n++;cursor.setDate(cursor.getDate()-1)}
 return n;
}
function metrics(){const words=Object.keys(window.BartiBridge?.getVocab?.()||{}).length;const done=completedStories().length;return {words,done,level:1+Math.floor(words/10)+done,streak:streakCount()}}
function renderHomeStats(){const m=metrics();xp('homeLevel').textContent=m.level;xp('homeStreak').textContent=m.streak;xp('homeWordsCount').textContent=m.words;const story=xpState.stories.find(s=>s.id===localStorage.getItem('barti.lastStory'));xp('homeContinueLabel').textContent=story?.titlePl||'Ostatnia bajka'}
function renderAchievements(){
 const m=metrics();for(const [id,value] of [['statsLevel',m.level],['statsWords',m.words],['statsCompleted',m.done],['statsStreak',m.streak]])xp(id).textContent=value;
 for(const [id,ok] of [['badgeFirstWord',m.words>=1],['badgeFirstStory',m.done>=1],['badgeTenWords',m.words>=10]])xp(id).classList.toggle('earned',ok);
}
function renderMore(){xp('moreFontValue').textContent=getComputedStyle(document.documentElement).getPropertyValue('--reading-size').trim()||'23px'}
function bindExperience(){
 document.querySelectorAll('[data-go]').forEach(button=>button.addEventListener('click',()=>{
  button.blur();
  const root=button.dataset.go==='home';
  navigate(button.dataset.go,null,root&&xpState.page!=='home');
 }));
 document.querySelectorAll('[data-back]').forEach(button=>button.addEventListener('click',()=>navigate('home',null,true)));
 xp('heroContinue').addEventListener('click',()=>{activateReader(localStorage.getItem('barti.lastStory')||'repka');window.BartiBridge?.resumeLast?.()});
 xp('homeBarti').parentElement.addEventListener('click',()=>{onMode('excited');setTimeout(()=>onMode('idle'),1800);});
 xp('storySearch').addEventListener('input',event=>{xpState.query=event.target.value;renderCards();});

 xp('moreFontMinus').addEventListener('click',()=>{xp('fontSmaller').click();renderMore();});
 xp('moreFontPlus').addEventListener('click',()=>{xp('fontLarger').click();renderMore();});
 xp('moreTheme').addEventListener('click',()=>xp('themeToggle').click());
 xp('moreQuiz').addEventListener('click',()=>window.BartiBridge?.quiz?.());
 xp('moreInstall').addEventListener('click',()=>xp('installBtn')?.click());
 document.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',()=>{
  xpState.filter=button.dataset.filter;
  document.querySelectorAll('[data-filter]').forEach(e=>e.setAttribute('aria-pressed',String(e===button)));
  renderCards();
 }));
 xp('detailClose').addEventListener('click',closeDetail);
 xp('storyDetail').addEventListener('click',event=>{if(event.target===xp('storyDetail'))closeDetail();});
 xp('detailStart').addEventListener('click',()=>activateReader(xpState.selected));
 xp('wordsQuizBtn').addEventListener('click',()=>window.BartiBridge?.quiz?.());
 document.addEventListener('keydown',event=>{
  if(event.key==='Escape'&&!xp('storyDetail').hidden){event.stopPropagation();closeDetail();}
 });
 window.addEventListener('popstate',restoreHash);
 window.addEventListener('hashchange',restoreHash);
 xp('readerReturn').addEventListener('click',()=>navigate('library'));
}
let started=false;
function initExperience(){
 if(started||!window.BartiBridge?.ready)return;
 started=true;
 xpState.stories=window.BartiBridge.getStories();xpState.ready=true;
 renderCards();renderWords();insertPuppet();bindExperience();startV2PoseAnimation();applyReaderArt();
 restoreHash();
 window.BartiExperience={onMode,onVocab:()=>{renderWords();renderHomeStats();},onStory:()=>{renderCards();applyReaderArt();renderHomeStats();},onFinished:()=>{renderHomeStats();renderAchievements();}};
 onMode('idle');
}
document.addEventListener('barti:ready',initExperience);
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',initExperience);
else queueMicrotask(initExperience);
