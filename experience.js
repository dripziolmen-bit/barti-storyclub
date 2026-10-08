/* Barti Story Club — app navigation and new illustrated experience. Existing audio/word engine is retained in app.js. */
const xp=(id)=>document.getElementById(id);
const storyArtwork={repka:'./assets/visuals/covers/repka.webp',ryaba:'./assets/visuals/covers/ryaba.webp',kolobok:'./assets/visuals/covers/kolobok.webp'};
const descriptions={
  repka:'Dziadek sadzi rzepkę, która rośnie tak wielka, że do pomocy potrzeba całej rodziny. Odkryj, jak wielką moc ma współpraca.',
  ryaba:'Kurka Riaba znosi niezwykłe złote jajko. Krótka, ciepła opowieść, idealna na pierwsze rosyjskie słowa.',
  kolobok:'Mały, sprytny kołobok wyrusza w podróż leśną ścieżką. Po drodze spotyka wiele zwierząt.'
};
const xpState={page:'home',stories:[],selected:null,filter:'all',query:'',ready:false,pendingPlay:false};
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
function buildCard(story,compact=false){
 const button=createEl('button',{type:'button',class:compact?'home-story-card':'library-card'});
 const cover=createEl('img',{src:imageFor(story),alt:'Ilustracja do bajki '+story.titlePl,loading:compact?'lazy':'eager',decoding:'async'});
 if(compact){
   const body=createEl('div',{class:'home-story-info'});
   const meta=createEl('span',{},[createEl('strong',{text:story.title}),createEl('small',{text:story.titlePl+' · '+story.level})]);
   body.append(meta,createEl('span',{class:'home-story-arrow','aria-hidden':'true',text:'↗'}));
   button.append(cover,body);
 }else{
   const art=createEl('div',{class:'library-card-cover'},[cover,createEl('span',{class:'library-card-level',text:story.level})]);
   const text=createEl('div',{},[createEl('h3',{text:story.title}),createEl('p',{text:descriptions[story.id]||story.titlePl}),createEl('div',{class:'library-card-tags'},[createEl('span',{text:storyDuration(story)}),createEl('span',{text:'·'}),createEl('span',{text:story.tag})])]);
   button.append(art,createEl('div',{class:'library-card-body'},[text,createEl('span',{class:'library-card-action','aria-hidden':'true',text:'→'})]));
 }
 button.addEventListener('click',()=>openDetail(story.id));
 return button;
}
function renderCards(){
 if(!xpState.ready)return;
 xp('homeStoryCards').replaceChildren(...xpState.stories.map(story=>buildCard(story,true)));
 const items=xpState.stories.filter(story=>{
  const query=xpState.query.trim().toLocaleLowerCase('pl');
  const match=!query||[story.title,story.titlePl,story.tag].some(x=>x.toLocaleLowerCase('pl').includes(query));
  return match&&(xpState.filter==='all'||(xpState.filter==='A2'?story.level.includes('A2'):story.level==='A1'));
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
 if(!['home','library','words','reader'].includes(page))page='home';
 const previous=xpState.page;
 if(page==='reader'&&!xpState.ready)return;
 if(page!=='reader'&&previous==='reader')window.BartiBridge?.pause?.();
 if(page==='reader'&&storyId) window.BartiBridge?.openStory(storyId);
 xpState.page=page;
 document.body.dataset.page=page;
  if(page!=='reader') document.querySelector('meta[name="theme-color"]')?.setAttribute('content','#ffeff7');
 xp('experienceShell').hidden=page==='reader';
 xp('appShell').hidden=page!=='reader';
 for(const [key,id] of [['home','homeScreen'],['library','libraryScreen'],['words','wordsScreen']]){
  xp(id).hidden=key!==page;
 }
 for(const tab of document.querySelectorAll('[data-nav]')){
   if(tab.dataset.nav===page)tab.setAttribute('aria-current','page');
   else tab.removeAttribute('aria-current');
 }
 closeDetail();
 if(page==='words')renderWords();
 if(page==='library')renderCards();
 window.scrollTo(0,0);
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
function applyReaderArt(){const id=window.BartiBridge?.getCurrentId?.()||'repka';const image=storyArtwork[id]||storyArtwork.repka;const banner=xp('readerArtBanner');if(banner)banner.style.backgroundImage=`linear-gradient(0deg,rgba(35,18,30,.34),transparent 68%),url('${image}')`; }
function activateReader(id){
 const story=xpState.stories.find(s=>s.id===id);if(!story)return;
 navigate('reader',story.id); applyReaderArt();
}
function restoreHash(){
 const match=location.hash.match(/^#\/(home|library|words|read)(?:\/([^/?]+))?/);
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
function onMode(mode){
 xp('homeBarti').dataset.mode=mode;
 document.querySelectorAll('.barti-mini-puppet').forEach(p=>p.dataset.mode=mode);
 const captions={idle:'Mam dla Ciebie nową przygodę!',talking:'Słuchaj uważnie. Czytamy razem!',paused:'Czekam, aż wrócisz.',finished:'Brawo! Jeszcze jedna bajka?'};
 xp('heroSpeech').textContent=captions[mode]||captions.idle;
}
function bindExperience(){
 document.querySelectorAll('[data-go]').forEach(button=>button.addEventListener('click',()=>navigate(button.dataset.go)));
 xp('heroContinue').addEventListener('click',()=>activateReader(localStorage.getItem('barti.lastStory')||'repka'));
 xp('homeBarti').parentElement.addEventListener('click',()=>{onMode('excited');setTimeout(()=>onMode('idle'),1800);});
 xp('storySearch').addEventListener('input',event=>{xpState.query=event.target.value;renderCards();});
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
 renderCards();renderWords();insertPuppet();bindExperience(); applyReaderArt();
 restoreHash();
 window.BartiExperience={onMode,onVocab:renderWords,onStory:()=>{renderCards();applyReaderArt();}};
 onMode('idle');
}
document.addEventListener('barti:ready',initExperience);
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',initExperience);
else queueMicrotask(initExperience);
