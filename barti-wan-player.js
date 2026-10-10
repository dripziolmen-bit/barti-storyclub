/* BARTI STORY CLUB — opt-in browser player for pre-rendered Wan 2.2 video assets.
 * The original animated WebP remains the fallback when playback is disabled/unavailable.
 * Only currently visible assets receive an MP4 src; action clips play once and return
 * to the underlying idle/narration state. No API calls, no 3D generation in the browser.
 */
(() => {
  'use strict';
  const ROOT = './assets/character/video/';
  const CLIPS = Object.freeze({
    homeIdle:'01_home_idle', wave:'02_home_wave', libraryInvite:'03_library_invite',
    narrate:'04_reader_narrate', pageFlip:'05_reader_pageflip_fast',
    pause:'06_reader_pause', bookClose:'07_reader_book_close',
    thinking:'08_reader_thinking', readerGreet:'09_reader_greet',
    explain:'10_word_explain', wordSaved:'11_word_saved',
    quizCorrect:'12_quiz_correct', quizIncorrect:'13_quiz_incorrect',
    achievement:'14_achievement', listening:'15_settings_listen',
    bookOpen:'16_reader_book_open', readerIdle:'17_reuse_reader_idle',
    pageFlipAlternative:'18_reuse_pageflip', surprised:'19_reuse_surprised'
  });
  const MODE={idle:'readerIdle',reading:'readerIdle',talking:'narrate',paused:'readerIdle',finished:'readerIdle',explain:'explain',excited:'wave'};
  const ROUTE_DEFAULT={home:'homeIdle',library:'homeIdle',words:'homeIdle',achievements:'homeIdle',more:'homeIdle',reader:'readerIdle'};
  const pageAnchors={
    library:'.library-headline',
    words:'#wordsScreen .words-banner',
    achievements:'#achievementsScreen .v2-profile-wrap',
    more:'#moreScreen .v2-profile-wrap'
  };
  const stickerRoute={library:'libraryInvite',words:'homeIdle',achievements:'achievement',more:'listening'};
  const persistent=new Set(['homeIdle','readerIdle','narrate']);
  const matchReduced=window.matchMedia('(prefers-reduced-motion: reduce)');
  const state={initialized:false,page:'home',readerMode:'idle',effect:null,effectTimer:null,players:[],modalPlayer:null,suspended:false};

  const canPlay=()=>!matchReduced.matches && document.createElement('video').canPlayType('video/mp4')!=='';
  const filename=name=>CLIPS[name]?ROOT+CLIPS[name]+'.mp4':null;
  const poster=name=>CLIPS[name]?ROOT+'posters/'+CLIPS[name]+'.jpg':null;
  const routeDefault=()=>state.page==='reader'?MODE[state.readerMode]||'readerIdle':ROUTE_DEFAULT[state.page]||'homeIdle';
  const eligible=host=>{
    if(!host.isConnected || document.hidden)return false;
    const element=host.closest('#homeScreen,#libraryScreen,#wordsScreen,#achievementsScreen,#moreScreen,#appShell,.quiz-modal');
    if(element?.hidden || element?.closest('[hidden]'))return false;
    const rect=host.getBoundingClientRect();
    return rect.width>5 && rect.height>5;
  };
  function createPlayer(host,kind){
    const video=document.createElement('video');
    video.className='barti-wan-video';
    video.muted=true;video.defaultMuted=true;video.autoplay=true;video.playsInline=true;
    video.setAttribute('playsinline','');video.setAttribute('muted','');
    video.preload='none';video.controls=false;
    video.setAttribute('aria-hidden','true');
    const p={host,kind,video,name:null,oneShot:false,generation:0};
    video.addEventListener('ended',()=>{
      if(!p.oneShot||state.suspended)return;
      p.oneShot=false;
      if(kind==='modal'){setClip(p,'homeIdle',true);return;}
      if(state.effect){state.effect=null;}
      render();
    });
    video.addEventListener('error',()=>{
      // Network failure or unsupported format: reveal the existing WebP/image.
      video.pause();video.removeAttribute('src');video.load();p.name=null;
      host.classList.remove('wan-enabled');
      host.dataset.wanError='true';
    });
    host.appendChild(video);state.players.push(p);
    return p;
  }
  function setClip(p,name,loop){
    if(!name||!CLIPS[name])return;
    if(!eligible(p.host)){p.video.pause();return;}
    if(p.host.dataset.wanError==='true')return;
    const v=p.video;
    const once=!loop;
    if(p.name===name && p.oneShot===once && !v.paused)return;
    p.name=name;p.oneShot=once;
    v.loop=loop;v.poster=poster(name);
    if(v.getAttribute('src')!==filename(name)){
      v.setAttribute('src',filename(name));
      v.load();
    }else if(once){try{v.currentTime=0;}catch{}}
    p.host.classList.add('wan-enabled');
    const result=v.play();
    if(result && typeof result.catch==='function')result.catch(()=>{
      // Autoplay restrictions: show the static video poster instead.
      v.pause();if(p.name!==name)return;
      v.removeAttribute('src');v.load();p.host.classList.remove('wan-enabled');
      p.host.dataset.wanError='true';
    });
  }
  function pauseHidden(){
    for(const p of state.players)if(!eligible(p.host))p.video.pause();
  }
  function render(){
    if(!state.initialized||state.suspended)return;
    pauseHidden();
    for(const p of state.players){
      if(!eligible(p.host))continue;
      if(p.kind==='modal'){
        if(p.host.closest('#quizModal')?.hidden)continue;
        if(!p.name)setClip(p,'homeIdle',true);
        continue;
      }
      if(p.kind!==state.page)continue;
      const active=state.effect?.name||routeDefault();
      const oneShot=!!state.effect || !persistent.has(active);
      setClip(p,active,!oneShot);
    }
  }
  function init(){
    if(state.initialized||!canPlay())return false;
    state.initialized=true;
    for(const host of document.querySelectorAll('#homeBarti .puppet-film')){
      createPlayer(host,'home');
    }
    for(const host of document.querySelectorAll('.mascot-stage .barti-mini-puppet .puppet-film,.head-barti-mobile .barti-mini-puppet .puppet-film')){
      createPlayer(host,'reader');
    }
    for(const [page,selector] of Object.entries(pageAnchors)){
      const anchor=document.querySelector(selector);
      if(!anchor)continue;
      const sticker=document.createElement('div');
      sticker.className='barti-wan-sticker barti-wan-sticker-'+page;
      sticker.setAttribute('aria-hidden','true');
      anchor.appendChild(sticker);
      createPlayer(sticker,page);
    }
    const modal=document.querySelector('#quizModal .quiz-modal');
    if(modal){
      const sticker=document.createElement('div');
      sticker.className='barti-wan-quiz-sticker';
      sticker.setAttribute('aria-hidden','true');
      modal.appendChild(sticker);
      state.modalPlayer=createPlayer(sticker,'modal');
    }
    document.addEventListener('visibilitychange',()=>{
      if(document.hidden)state.players.forEach(p=>p.video.pause());
      else render();
    });
    window.addEventListener('resize',()=>{
      // Pause video on hidden mobile/desktop duplicate surfaces.
      requestAnimationFrame(render);
    },{passive:true});
    if(typeof matchReduced.addEventListener==='function')matchReduced.addEventListener('change',()=>{
      if(matchReduced.matches){
        state.suspended=true;
        state.players.forEach(p=>{p.video.pause();p.host.classList.remove('wan-enabled');});
      }else{
        state.suspended=false;render();
      }
    });
    render();
    return true;
  }
  function onPage(page,previous){
    state.page=page;
    state.effect=null;
    if(page==='reader'&&previous!=='reader')state.readerMode='idle';
    requestAnimationFrame(()=>{
      if(!state.initialized)init();
      if(page==='reader'&&previous!=='reader')react('bookOpen','reader');
      else if(page==='library'&&previous!==page)react('libraryInvite','library');
      else if(page==='achievements'&&previous!==page&&document.querySelector('#achievementsScreen .v2-badge.earned'))react('achievement','achievements');
      else if(page==='more'&&previous!==page)react('listening','more');
      else render();
    });
  }
  function onMode(mode){
    state.readerMode=mode;
    if(state.page!=='reader')return;
    // Loading a new paragraph also emits idle/pause events: never interrupt a
    // one-shot page turn/open-book/word gesture before it has finished.
    if(state.effect && (mode==='idle'||mode==='paused'))return;
    if(mode==='paused')react('pause','reader');
    else if(mode==='finished')react('bookClose','reader');
    else {state.effect=null;render();}
  }
  function react(name,scope){
    if(!CLIPS[name])return false;
    if(!state.initialized&&!init())return false;
    if(name==='quizCorrect'||name==='quizIncorrect'){
      const p=state.modalPlayer;
      if(p && !document.getElementById('quizModal')?.hidden)setClip(p,name,false);
      return !!p;
    }
    if(scope && scope!==state.page)return false;
    state.effect={name};
    render();
    return true;
  }
  function quizOpen(){
    if(!state.initialized)init();
    if(state.modalPlayer)requestAnimationFrame(()=>setClip(state.modalPlayer,'homeIdle',true));
  }
  function quizClose(){
    const p=state.modalPlayer;if(!p)return;
    p.video.pause();p.name=null;p.oneShot=false;
  }
  window.BartiWan=Object.freeze({init,onPage,onMode,react,quizOpen,quizClose,canPlay,clips:CLIPS});
})();
