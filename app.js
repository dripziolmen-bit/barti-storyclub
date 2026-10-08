const $ = id => document.getElementById(id);
const el = {
  storyList: $('storyList'), reader: $('reader'), storyTitle: $('storyTitle'), storyTitlePl: $('storyTitlePl'),
  storyLevel: $('storyLevel'), storyTag: $('storyTag'), storyDuration: $('storyDuration'), storySource: $('storySource'),
  currentParagraph: $('currentParagraph'), playerStory: $('playerStory'), playerState: $('playerState'),
  statusText: $('statusText'), bartiMessage: $('bartiMessage'), mascotStage: $('mascotStage'),
  playBtn: $('playBtn'), playSymbol: $('playSymbol'), previousBtn: $('previousBtn'), nextBtn: $('nextBtn'),
  progress: $('progress'), timeCurrent: $('timeCurrent'), timeTotal: $('timeTotal'), speed: $('speed'), musicBtn: $('musicBtn'),
  narration: $('narration'), ambientTrack: $('ambientTrack'), wordPlaceholder: $('wordPlaceholder'), wordDetails: $('wordDetails'),
  wordRu: $('wordRu'), wordPl: $('wordPl'), wordLabel: $('wordLabel'), saveWord: $('saveWord'), savedCount: $('savedCount'),
  openVocab: $('openVocab'), vocabModal: $('vocabModal'), closeVocab: $('closeVocab'), vocabContent: $('vocabContent'),
  closeDict: $('closeDict'), openQuiz: $('openQuiz'), quizModal: $('quizModal'), closeQuiz: $('closeQuiz'), quizProgress: $('quizProgress'), quizWord: $('quizWord'), quizAnswers: $('quizAnswers'), quizFeedback: $('quizFeedback'), quizNext: $('quizNext'), toast: $('toast')
};
const s = {
  stories: [], durations: {}, wordTiming: {}, lexicon: {}, story: null, paragraph: 0, playing: false, currentWord: null,
  activeWord: null, wordButtons: [], weights: [], token: 0, music: false, vocab: readVocab(), raf: 0, quiz: [], quizIndex: 0, quizScore: 0,
};
const storyPath = (story, i) => `./assets/audio/${story.id}-${i}.mp3`;
const fmt = sec => `${Math.floor(Math.max(0, sec)/60)}:${String(Math.floor(Math.max(0,sec)%60)).padStart(2,'0')}`;
const clean = v => v.toLocaleLowerCase('ru-RU').replace(/[^а-яё-]/gi, '');
const durations = () => s.durations[s.story?.id] || [];
const total = () => durations().reduce((a,b) => a+b,0);
const playedBefore = index => durations().slice(0,index).reduce((a,b) => a+b,0);
const storyElapsed = () => playedBefore(s.paragraph) + (Number.isFinite(el.narration.currentTime) ? el.narration.currentTime : 0);
let toastTimer;
function notify(message) { el.toast.textContent = message; el.toast.classList.add('show'); clearTimeout(toastTimer); toastTimer=setTimeout(()=>el.toast.classList.remove('show'),2400); }
function readVocab() {try {const x=JSON.parse(localStorage.getItem('barti.vocab') || '{}'); return x && typeof x === 'object' && !Array.isArray(x) ? x : {};}catch{return {};}}
function saveVocab() { try { localStorage.setItem('barti.vocab',JSON.stringify(s.vocab)); }catch { notify('Nie udało się zapisać słówek w przeglądarce.'); } updateSavedCount(); }
function updateSavedCount() {el.savedCount.textContent=Object.keys(s.vocab).length;}

async function boot() {
  try {
    const fetchJSON = async path => {
      const r=await fetch(path,{cache:'no-cache'}); if(!r.ok) throw new Error(`HTTP ${r.status}: ${path}`); return await r.json();
    };
    [s.stories,s.durations,s.lexicon,s.wordTiming]=await Promise.all([fetchJSON('./data/stories.json'),fetchJSON('./data/audio.json'),fetchJSON('./data/lexicon.json'),fetchJSON('./data/word-timing.json')]);
    populateStories();
    const last=localStorage.getItem('barti.lastStory');
    selectStory(s.stories.find(v=>v.id===last)?.id || s.stories[0].id);
    bind();
    updateSavedCount();
    if('serviceWorker' in navigator && location.protocol !== 'file:') navigator.serviceWorker.register('./sw.js').catch(()=>{});
  } catch(error) {
    el.statusText.textContent='Błąd ładowania';
    el.reader.textContent='Nie udało się wczytać bajek. Uruchom aplikację przez lokalny serwer HTTP (instrukcja w README).';
    console.error(error);
  }
}
function populateStories() {
  el.storyList.replaceChildren();
  for(const [storyIndex,story] of s.stories.entries()) {
    const btn=document.createElement('button'); btn.type='button'; btn.className='story-tile'; btn.dataset.storyId=story.id;
    const emoji=document.createElement('span');emoji.className='story-emoji';emoji.textContent=String(storyIndex+1).padStart(2,'0');
    const label=document.createElement('span');const title=document.createElement('b');title.lang='ru';title.textContent=story.title;
    const small=document.createElement('small');small.textContent=`${story.level} · ${story.tag}`;
    label.append(title,small);btn.append(emoji,label);
    btn.addEventListener('click',()=>selectStory(story.id));el.storyList.append(btn);
  }
}
function selectStory(id) {
  const story=s.stories.find(item=>item.id===id); if(!story)return;
  s.token++; el.narration.pause();s.playing=false;
  s.story=story;s.paragraph=0;s.currentWord=null;s.activeWord=null;s.wordButtons=[];
  try{localStorage.setItem('barti.lastStory',story.id)}catch{}
  el.storyTitle.textContent=story.title;el.storyTitlePl.textContent=story.titlePl;
  el.storyLevel.textContent=`${story.level} · ${story.level==='A1'?'POCZĄTKUJĄCY':'POCZĄTKUJĄCY+'}`;
  el.storyTag.textContent=story.tag.toLocaleUpperCase('pl');el.storyDuration.textContent=`${Math.max(1,Math.round(total()/60))} min słuchania`;
  el.storySource.textContent='Opracowanie bajki ludowej';el.playerStory.textContent=story.title;
  document.querySelectorAll('.story-tile').forEach(btn=>{const active=btn.dataset.storyId===id;btn.classList.toggle('active',active);btn.setAttribute('aria-current',active?'true':'false');});
  renderText();loadParagraph(0,false,0);clearDict();setMode('idle');closeLibrary();
  el.reader.scrollTop=0;
}
function renderText() {
  el.reader.replaceChildren();s.wordButtons=[];
  s.story.paragraphs.forEach((p,i)=>{
    const paragraph=document.createElement('p');paragraph.dataset.p=i;
    const pieces=p.match(/[А-Яа-яЁё]+(?:-[А-Яа-яЁё]+)*|[^А-Яа-яЁё]+/g) || [];
    let localIndex=0;
    for(const part of pieces){
      if(/^[А-Яа-яЁё]/.test(part)){
        const normalized=clean(part);
        const btn=document.createElement('button');btn.type='button';btn.className='word';btn.textContent=part;btn.dataset.p=i;btn.dataset.w=localIndex;btn.title='Pokaż polskie tłumaczenie';btn.setAttribute('aria-label',`${part}: pokaż tłumaczenie`);
        btn.addEventListener('click',()=>chooseWord(part,normalized,btn));
        paragraph.append(btn);s.wordButtons.push(btn);localIndex++;
      }else{paragraph.append(document.createTextNode(part));}
    }
    el.reader.append(paragraph);
  });
}
function bind() {
  el.playBtn.addEventListener('click',togglePlayback);
  el.previousBtn.addEventListener('click',()=>jump(-1));
  el.nextBtn.addEventListener('click',()=>jump(1));
  el.speed.addEventListener('change',()=>{el.narration.playbackRate=Number(el.speed.value); notify(`Tempo: ${el.speed.value}×`);});
  el.progress.addEventListener('input',()=>seekStory(Number(el.progress.value)/1000*total()));
  el.narration.addEventListener('timeupdate',refresh);
  el.narration.addEventListener('play',()=>{s.playing=true;setMode('talking');});
  el.narration.addEventListener('pause',()=>{if(s.playing){s.playing=false;setMode('paused');}});
  el.narration.addEventListener('ended',()=>{if(s.paragraph+1<s.story.paragraphs.length){loadParagraph(s.paragraph+1,true,0);}else{finishStory();}});
  el.narration.addEventListener('error',()=>{if(el.narration.error){setMode('idle');notify('Błąd wczytywania nagrania.');}});
  el.musicBtn.addEventListener('click',toggleMusic);
  el.saveWord.addEventListener('click',toggleSavedWord);
  el.closeDict.addEventListener('click',clearDict);
  el.openVocab.addEventListener('click',openVocab);
  el.closeVocab.addEventListener('click',closeVocab);
  el.openQuiz.addEventListener('click',openQuiz);
  el.closeQuiz.addEventListener('click',closeQuiz);
  el.quizNext.addEventListener('click',nextQuiz);
  el.quizModal.addEventListener('click',e=>{if(e.target===el.quizModal)closeQuiz();});
  el.vocabModal.addEventListener('click',e=>{if(e.target===el.vocabModal)closeVocab();});
  document.addEventListener('keydown',e=>{
    if(e.key==='Escape'&&!el.vocabModal.hidden){closeVocab();return;}
    if(e.key==='Escape'&&!el.quizModal.hidden){closeQuiz();return;}
    if(e.code==='Space'&&!['INPUT','TEXTAREA','BUTTON','SELECT'].includes(document.activeElement?.tagName)&&el.vocabModal.hidden&&el.quizModal.hidden){e.preventDefault();togglePlayback();}
  });
  // A throttled animation loop offers smoother word highlighting than the HTMLAudioElement timeupdate alone.
  const frame=()=>{if(s.playing)refresh();s.raf=requestAnimationFrame(frame);};s.raf=requestAnimationFrame(frame);
}
function loadParagraph(index,auto=false,seek=0) {
  if(!s.story)return;
  index=Math.max(0,Math.min(index,s.story.paragraphs.length-1));
  s.paragraph=index;s.currentWord=null;s.token++;
  try{localStorage.setItem('barti.lastParagraph',String(index))}catch{}
  const token=s.token;
  el.narration.pause();el.narration.src=storyPath(s.story,index);el.narration.playbackRate=Number(el.speed.value);
  el.narration.load();
  const duration=durations()[index]||0;
  // Offsets are proportional to word length with punctuation pauses. They are estimated, not forced-aligned.
  const paragraph=s.story.paragraphs[index];const words=paragraph.match(/[А-Яа-яЁё]+(?:-[А-Яа-яЁё]+)*/g) || [];
  const weights=words.map(w=>Math.max(1.5,Math.pow(w.length,.68)));
  const weightedTotal=weights.reduce((a,b)=>a+b,0);
  let acc=0;s.weights=weights.map(v=>{const from=acc/weightedTotal;acc+=v;return from;});
  document.querySelectorAll('#reader p').forEach((p,i)=>p.classList.toggle('playing-paragraph',i===index));
  el.currentParagraph.textContent=`Akapit ${index+1} / ${s.story.paragraphs.length}`;
  el.previousBtn.disabled=index===0;el.nextBtn.disabled=index===s.story.paragraphs.length-1;
  refresh();
  if(!auto){s.playing=false;setMode('idle');}
  const afterMeta=()=>{if(token!==s.token)return; if(seek>0)el.narration.currentTime=Math.min(seek, Math.max(0,(el.narration.duration||duration)-.05));refresh(); if(auto)attemptPlay();};
  if(el.narration.readyState>=1)afterMeta();else el.narration.addEventListener('loadedmetadata',afterMeta,{once:true});
}
async function attemptPlay(){
  try {await el.narration.play();}
  catch(error){if(error.name!=='AbortError'){setMode('paused');notify('Dotknij ▶, aby zezwolić na odtwarzanie dźwięku.');}}
}
function togglePlayback(){
  if(!s.story)return;
  if(el.narration.paused){
    if(storyElapsed()>=total()-.1)loadParagraph(0,false,0);
    attemptPlay();
  }else el.narration.pause();
}
function jump(delta){
  if(!s.story)return;const wasPlaying=s.playing;
  const target=Math.max(0,Math.min(s.paragraph+delta,s.story.paragraphs.length-1));
  loadParagraph(target,wasPlaying,0);
}
function seekStory(sec){
  if(!s.story)return;
  const wasPlaying=s.playing;let t=Math.min(Math.max(0,sec),Math.max(0,total()-.05));
  const list=durations();let index=0;
  while(index<list.length-1&&t>=list[index]){t-=list[index];index++;}
  if(index!==s.paragraph)loadParagraph(index,wasPlaying,t);
  else{el.narration.currentTime=t;refresh();}
}
function finishStory(){s.playing=false;setMode('finished');el.narration.pause();el.progress.value=1000;el.timeCurrent.textContent=fmt(total());notify('Brawo! Bajka przeczytana.');}
function refresh(){
  if(!s.story)return;
  const length=total()||1;const pos=Math.min(storyElapsed(),length);
  el.progress.value=Math.round(pos/length*1000);
  document.querySelector('.app-top')?.style.setProperty('--story-progress',Math.min(100,Math.max(0,100*pos/length))+'%');
  el.timeCurrent.textContent=fmt(pos);el.timeTotal.textContent=fmt(length);
  highlightCurrentWord();
}
function highlightCurrentWord(){
  if(!s.story||!el.narration.duration)return;
  const time=Math.max(0,el.narration.currentTime);
  const actual=s.wordTiming[s.story.id]?.[s.paragraph];
  let index=0;
  if(Array.isArray(actual) && actual.length===s.weights.length){
    for(let i=0;i<actual.length;i++) if(time>=actual[i]) index=i;
  } else {
    const ratio=Math.max(0,Math.min(.9999,time/(durations()[s.paragraph]||1)));
    for(let i=0;i<s.weights.length;i++) if(ratio>=s.weights[i])index=i;
  }
  if(index===s.currentWord)return;
  s.currentWord=index;
  const previous=el.reader.querySelector('.word.current');previous?.classList.remove('current');
  const active=el.reader.querySelector(`.word[data-p="${s.paragraph}"][data-w="${index}"]`);
  if(active){
    active.classList.add('current');
    const rect=active.getBoundingClientRect();
    const limitTop=window.innerWidth<701?110:85;
    const limitBottom=window.innerHeight-(window.innerWidth<701?160:110);
    if(s.playing && (rect.top<limitTop || rect.bottom>limitBottom)) active.scrollIntoView({block:'center',behavior:'smooth'});
  }
}
function setMode(mode){
  el.mascotStage.dataset.mode=mode;
  const mobileMascot=document.querySelector('.head-barti-mobile');
  if(mobileMascot) mobileMascot.dataset.mode=mode;
  const labels={idle:['Cześć! Poczytamy?','Gotowy do czytania','Odtwarzacz gotowy'],talking:['Barti właśnie opowiada…','Barti czyta','Odtwarzanie bajki'],paused:['Czekam na Ciebie ♡','Pauza','Odtwarzanie wstrzymane'],finished:['Brawo! Jeszcze jedna?','Bajka skończona','Koniec nagrania']};
  const [message,status,player]=labels[mode]||labels.idle;
  el.bartiMessage.textContent=message;el.statusText.textContent=status;el.playerState.textContent=player;
  el.playBtn.classList.toggle('playing',mode==='talking');el.playSymbol.textContent=mode==='talking'?'Ⅱ':'▶';el.playBtn.setAttribute('aria-label',mode==='talking'?'Pauza':'Odtwórz');
}
function chooseWord(original,normalized,button){
  const translation=s.lexicon[normalized];
  s.activeWord={word:normalized,translation:translation||'Brak tłumaczenia w lokalnym słowniku.'};
  el.wordPlaceholder.hidden=true;el.wordDetails.hidden=false;
  el.wordRu.textContent=original;el.wordPl.textContent=s.activeWord.translation;
  el.wordLabel.textContent=translation?'ROSYJSKI · SŁOWNIK OFFLINE':'ROSYJSKI · BRAK W SŁOWNIKU';
  const prev=el.reader.querySelector('.word.selected');prev?.classList.remove('selected');button.classList.add('selected');
  updateSaveButton();
  $('dictionaryCard').classList.add('word-picked');
}
function clearDict(){s.activeWord=null;el.wordPlaceholder.hidden=false;el.wordDetails.hidden=true;$('dictionaryCard').classList.remove('word-picked');el.reader.querySelector('.word.selected')?.classList.remove('selected');}
function updateSaveButton(){if(!s.activeWord)return;el.saveWord.textContent=(s.vocab[s.activeWord.word]?'♥ W słowniczku':'♡ Zapisz słówko');}
function toggleSavedWord(){
  if(!s.activeWord)return;
  const {word,translation}=s.activeWord;
  if(s.vocab[word])delete s.vocab[word];else s.vocab[word]=translation;
  saveVocab();updateSaveButton();notify(s.vocab[word]?'Dodano do Twoich słówek':'Usunięto ze słówek');
}
function openVocab(){
  closeLibrary(); el.vocabModal.hidden=false;el.vocabContent.replaceChildren();const pairs=Object.entries(s.vocab);
  if(!pairs.length){const p=document.createElement('p');p.textContent='Nie ma tu jeszcze słówek. Kliknij wyraz w bajce i zapisz go serduszkiem.';el.vocabContent.append(p);return;}
  for(const [word,translation] of pairs.sort((a,b)=>a[0].localeCompare(b[0],'ru'))){
    const line=document.createElement('div');line.className='vocab-row';const left=document.createElement('div');const title=document.createElement('b');title.textContent=word;const sub=document.createElement('span');sub.textContent=translation;left.append(title,sub);
    const remove=document.createElement('button');remove.type='button';remove.textContent='Usuń';remove.addEventListener('click',()=>{delete s.vocab[word];saveVocab();openVocab();});line.append(left,remove);el.vocabContent.append(line);
  }
}
function closeVocab(){el.vocabModal.hidden=true;}
function openQuiz(){
  closeLibrary();
  const distinct=Object.entries(s.lexicon).filter(([word,value])=>word.length>=3&&value.length>=3&&!value.includes('/'));
  const pool=distinct.sort(()=>Math.random()-.5);
  s.quiz=pool.slice(0,4).map(([word,correct])=>{
    const wrong=pool.filter(([other,w])=>other!==word&&w!==correct).slice(4,7).map(([,w])=>w);
    return {word,correct,answers:[correct,...wrong].sort(()=>Math.random()-.5)};
  });
  s.quizIndex=0;s.quizScore=0;el.quizModal.hidden=false;showQuiz();
}
function closeQuiz(){el.quizModal.hidden=true;}
// Reader-first interaction design: all preferences are stored only in this browser.
const readSetting=(key,fallback)=>{try{return localStorage.getItem('barti.'+key)??fallback}catch{return fallback}};
const persistSetting=(key,value)=>{try{localStorage.setItem('barti.'+key,String(value))}catch{}};
const library=$('libraryNav'),libraryOverlay=$('libraryOverlay');
function openLibrary(){library.classList.add('mobile-open');libraryOverlay.hidden=false;$('openLibrary')?.setAttribute('aria-expanded','true');}
function closeLibrary(){library.classList.remove('mobile-open');libraryOverlay.hidden=true;$('openLibrary')?.setAttribute('aria-expanded','false');}
function closeSettings(){$('readingSettings').hidden=true;$('readerSettings').setAttribute('aria-expanded','false');}
function setReadingSize(size){
 const n=Math.max(18,Math.min(31,Number(size)||23));
 document.documentElement.style.setProperty('--reading-size',n+'px');
 $('fontValue').textContent=n+' px';
 persistSetting('fontSize',n);
}
function setDarkMode(on){
 document.body.dataset.theme=on?'dark':'light';
 $('themeToggle').setAttribute('aria-pressed',String(on));
 $('themeToggle').textContent=on?'☼ Jasne tło':'☾ Ciemne tło';
 persistSetting('darkMode',on);
 document.querySelector('meta[name="theme-color"]')?.setAttribute('content',on?'#171718':'#f4f2ed');
}
function setFocus(on){
 document.body.classList.toggle('focus-mode',on);
 $('focusBtn').setAttribute('aria-pressed',String(on));
 $('focusBtn').title=on?'Wyłącz tryb skupienia':'Włącz tryb skupienia';
 persistSetting('focusMode',on);
 if(on)closeLibrary();
}
$('openLibrary').addEventListener('click',openLibrary);
$('closeLibrary').addEventListener('click',closeLibrary);
libraryOverlay.addEventListener('click',closeLibrary);
$('readerSettings').addEventListener('click',()=>{
 const show=$('readingSettings').hidden;
 $('readingSettings').hidden=!show;
 $('readerSettings').setAttribute('aria-expanded',String(show));
});
$('fontSmaller').addEventListener('click',()=>setReadingSize(parseInt($('fontValue').textContent,10)-2));
$('fontLarger').addEventListener('click',()=>setReadingSize(parseInt($('fontValue').textContent,10)+2));
$('themeToggle').addEventListener('click',()=>setDarkMode(document.body.dataset.theme!=='dark'));
$('focusBtn').addEventListener('click',()=>setFocus(!document.body.classList.contains('focus-mode')));
document.addEventListener('pointerdown',event=>{
 if(!$('readingSettings').hidden&&!$('readingSettings').contains(event.target)&&!$('readerSettings').contains(event.target))closeSettings();
});
document.addEventListener('keydown',event=>{
 if(event.key==='Escape'){closeSettings();closeLibrary();if(s.activeWord)clearDict();}
});
setReadingSize(readSetting('fontSize','23'));
setDarkMode(readSetting('darkMode','false')==='true');
setFocus(readSetting('focusMode','false')==='true');

let deferredInstallPrompt = null;
window.addEventListener('beforeinstallprompt',event=>{
  event.preventDefault();
  deferredInstallPrompt=event;
});
document.getElementById('installBtn')?.addEventListener('click',async()=>{
  closeLibrary();
  if(deferredInstallPrompt){
    await deferredInstallPrompt.prompt();
    deferredInstallPrompt=null;
  }else{
    notify('iPhone: Safari → Udostępnij → Do ekranu początkowego. Android: menu przeglądarki → Zainstaluj.');
  }
});


function showQuiz(){
  const question=s.quiz[s.quizIndex];
  el.quizProgress.textContent=`Pytanie ${s.quizIndex+1} / ${s.quiz.length}`;
  el.quizWord.textContent=question.word;
  el.quizFeedback.textContent='Jak przetłumaczysz to słowo?';
  el.quizNext.hidden=true;el.quizNext.textContent=s.quizIndex===s.quiz.length-1?'Zobacz wynik':'Następne pytanie →';
  el.quizAnswers.replaceChildren();
  for(const answer of question.answers){
    const btn=document.createElement('button');btn.type='button';btn.className='quiz-choice';btn.textContent=answer;
    btn.addEventListener('click',()=>{
      const good=answer===question.correct;if(good)s.quizScore++;
      for(const choice of el.quizAnswers.children){choice.disabled=true;choice.classList.toggle('correct',choice.textContent===question.correct);if(choice===btn&&!good)choice.classList.add('wrong');}
      el.quizFeedback.textContent=good?'Świetnie! Zgadza się.':'Poprawna odpowiedź: '+question.correct;
      el.quizNext.hidden=false;
    },{once:true});el.quizAnswers.append(btn);
  }
}
function nextQuiz(){
  if(s.quizIndex>=s.quiz.length){openQuiz();return;}
  if(++s.quizIndex>=s.quiz.length){
    el.quizProgress.textContent='Quiz ukończony';el.quizWord.textContent=`${s.quizScore} / ${s.quiz.length}`;
    el.quizFeedback.textContent='Możesz spróbować jeszcze raz albo wrócić do bajki.';
    el.quizAnswers.replaceChildren();el.quizNext.textContent='Jeszcze raz';el.quizNext.hidden=false;
    return;
  }
  showQuiz();
}
async function toggleMusic(){
  try{
    if(!s.music){el.ambientTrack.volume=.16;await el.ambientTrack.play();s.music=true;}
    else{el.ambientTrack.pause();s.music=false;}
    el.musicBtn.classList.toggle('active',s.music);el.musicBtn.setAttribute('aria-pressed',String(s.music));
    notify(s.music?'Delikatna muzyka włączona':'Muzyka wyłączona');
  }catch{notify('Przeglądarka zablokowała muzykę. Spróbuj ponownie.');}
}
boot();
