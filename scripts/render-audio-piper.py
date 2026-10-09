#!/usr/bin/env python3
"""One-pass Russian Piper voice synthesis with 15 new folklore story recordings.
Piper local voice model distributed by rhasspy; audiobook text is own retelling.
"""
import json,wave,subprocess,tempfile,re,os,time,sys
from pathlib import Path
from piper import PiperVoice
BASE=Path('/home/ubuntu/bartek-workspace/projects/BARTI_CZYTA')
ENGINE=Path('/home/ubuntu/bartek-workspace/tools/piper-denis')
FF='/home/ubuntu/bartek-workspace/bin/bartek-ffmpeg'
extra=json.loads((BASE/'data/extra-stories.json').read_text())
voice=PiperVoice.load(str(ENGINE/'ru_RU-denis-medium.onnx'))
results={}
started=time.time()
for st,story in enumerate(extra):
    sid=story['id']
    results[sid]=[]
    for pi,p in enumerate(story['paragraphs']):
        target=BASE/'assets/audio'/f'{sid}-{pi}.mp3'
        if target.exists() and target.stat().st_size>1500:
            from mutagen.mp3 import MP3
            results[sid].append(round(MP3(target).info.length,3))
            continue
        with tempfile.NamedTemporaryFile(suffix='.wav',delete=False) as t:
            temp=Path(t.name)
        try:
            with wave.open(str(temp),'wb') as wav:
                voice.synthesize_wav(p,wav)
            subprocess.run([FF,'-hide_banner','-loglevel','error','-y','-i',str(temp),'-ac','1','-codec:a','libmp3lame','-b:a','80k',str(target)],check=True,timeout=45)
            with wave.open(str(temp),'rb') as wav:
                seconds=wav.getnframes()/wav.getframerate()
            if target.stat().st_size<5000:raise RuntimeError('audio unexpectedly short '+str(target))
            results[sid].append(round(seconds,3))
        finally:
            temp.unlink(missing_ok=True)
        print('AUDIO',st+1,'/',len(extra),sid,pi+1,'/',len(story['paragraphs']),'duration',round(seconds,2),'bytes',target.stat().st_size,flush=True)
    (BASE/'data/audio-new.json').write_text(json.dumps(results,ensure_ascii=False,indent=2))
print('PIPER_GENERATION_FINISHED',len(results),'stories',sum(map(len,results.values())),'MP3_segments',round(time.time()-started,1),'seconds',flush=True)
