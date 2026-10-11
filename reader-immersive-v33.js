/* Reader v33 interaction glue. Keep the original narration and dictionary engine intact. */
(()=>{
  'use strict';
  const $=id=>document.getElementById(id);
  const slots=[...document.querySelectorAll('.reader-scene-layer')];
  const frame=$('readerArtBanner');
  const dict=$('dictionaryCard');
  if(dict&&$('main'))$('main').appendChild(dict); // only the dictionary floats; entire mascot sidebar is hidden
  let currentSlot=0,version=0,storyId='';
  function changeScene(event){
    const {id,file,sentence}=event.detail||{};
    if(!file||slots.length!==2)return;
    const currentVersion=++version;
    const freshStory=id!==storyId;
    if(freshStory){
      storyId=id;currentSlot=0;
      for(const layer of slots){layer.classList.remove('is-active');layer.removeAttribute('src');}
      if(frame)frame.setAttribute('aria-label','Ilustracja: '+(sentence||'bajka'));
    }
    const nextSlot=freshStory?0:1-currentSlot;
    const next=slots[nextSlot];
    const preload=new Image();
    preload.onload=()=>{
      if(currentVersion!==version)return;
      next.src=file;
      next.alt='';
      next.style.animation='none';
      next.offsetWidth;
      next.style.animation='';
      next.classList.add('is-active');
      if(frame)frame.setAttribute('aria-label','Ilustracja: '+(sentence||'bajka'));
      for(let i=0;i<slots.length;i++)if(i!==nextSlot)slots[i].classList.remove('is-active');
      currentSlot=nextSlot;
    };
    preload.onerror=()=>{
      if(currentVersion!==version)return;
      // Existing cover remains available as CSS background until another sentence is shown.
    };
    preload.src=file;
  }
  document.addEventListener('barti:scene-change',changeScene);
  // Images animate without playing audio. During narration, sentence-aligned images win.
  // Stop the gallery for reduced-motion and background tabs; no GPU/3D generation is used.
  const narration=$('narration');
  const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
  const ROTATION_MS=7500;
  window.setInterval(()=>{
    if(document.body.dataset.page!=='reader'||document.hidden||reducedMotion.matches)return;
    if(!window.BartiBridge?.ready||!narration?.paused)return;
    const id=window.BartiBridge.getCurrentId?.();
    if(!id||id!==storyId)return;
    const files=window.BartiBridge.getSceneFiles?.(id)||[];
    if(files.length<2)return;
    const shown=slots[currentSlot]?.getAttribute('src');
    const index=files.indexOf(shown);
    const next=files[(index+1)%files.length];
    if(next)changeScene({detail:{id,file:next,sentence:'Kolejna ilustracja bajki'}});
  },ROTATION_MS);

  const voice=$('voiceSelect'),speed=$('speed'),voiceButton=$('voiceCycleBtn'),speedButton=$('speedCycleBtn');
  function sync(){
    if(!voice||!speed)return;
    if(voiceButton){
      const names={adult:'Głos dorosły',female:'Głos kobiecy',child:'Głos dziecięcy'};
      voiceButton.textContent='♙ '+(names[voice.value]||'Głos lektora');
      voiceButton.setAttribute('aria-label','Zmień lektora. Aktualny: '+(names[voice.value]||voice.value));
    }
    if(speedButton){
      speedButton.textContent='◴ '+speed.value.replace('.',',')+'×';
      speedButton.setAttribute('aria-label','Zmień prędkość. Aktualna: '+speed.value+' razy');
    }
  }
  voiceButton?.addEventListener('click',()=>{
    const options=[...voice.options].map(o=>o.value);
    voice.value=options[(options.indexOf(voice.value)+1)%options.length];
    voice.dispatchEvent(new Event('change',{bubbles:true}));
    sync();
  });
  speedButton?.addEventListener('click',()=>{
    const options=[...speed.options].map(o=>o.value);
    speed.value=options[(options.indexOf(speed.value)+1)%options.length];
    speed.dispatchEvent(new Event('change',{bubbles:true}));
    sync();
  });
  voice?.addEventListener('change',sync);
  speed?.addEventListener('change',sync);
  document.addEventListener('barti:ready',sync);
  sync();
})();
