#!/usr/bin/env python3
"""Enable Google Chirp voice files in the offline GitHub Pages app, ONLY if all
327 Google MP3s exist and have expected text/voice metadata. No API calls.
Run after successful google-chirp3-generate.py --all, then test and commit.
"""
import hashlib,json,shutil,subprocess,sys
from pathlib import Path
from mutagen.mp3 import MP3
ROOT=Path('/mnt/data/marka-lab/barti-story-club/voices/chirp3-hd-v1')
APP=Path('/home/ubuntu/bartek-workspace/projects/BARTI_GOOGLE_CHIRP')
VOICES={'adult':'ru-RU-Chirp3-HD-Charon','female':'ru-RU-Chirp3-HD-Kore',
        'child':'ru-RU-Chirp3-HD-Leda'}
def main():
    mount=subprocess.check_output(['findmnt','-T','/mnt/data','-no','SOURCE'],text=True).strip()
    if mount!='/dev/sdb':raise RuntimeError('Second disk not mounted!')
    stories=json.loads((APP/'data/stories.json').read_text())
    staged=[];dur={v:{} for v in VOICES}
    for profile,voice in VOICES.items():
        for story in stories:
            times=[]
            for idx,text in enumerate(story['paragraphs']):
                file=ROOT/profile/story['id']/f'{idx:02d}.mp3'
                job=ROOT/'_jobs'/profile/story['id']/f'{idx:02d}.json'
                if not file.is_file() or not job.is_file():raise RuntimeError('Chirp not complete: '+str(file))
                status=json.loads(job.read_text())
                if status.get('status')!='DONE' or status.get('voice')!=voice or status.get('textSha256')!=hashlib.sha256(text.encode()).hexdigest():
                    raise RuntimeError('Chirp narration validation failed: '+str(job))
                if file.stat().st_size<2500:raise RuntimeError('Invalid Chirp MP3 '+str(file))
                duration=MP3(file).info.length
                if duration<=0.3 or duration>180:raise RuntimeError('Invalid audio duration '+str(file))
                times.append(round(duration,4))
                target=APP/'assets/voices/chirp3'/profile/f"{story['id']}-{idx}.mp3"
                staged.append((file,target))
            dur[profile][story['id']]=times
    assert len(staged)==327
    for source,target in staged:
        target.parent.mkdir(parents=True,exist_ok=True)
        target.write_bytes(source.read_bytes())
        if hashlib.sha256(target.read_bytes()).digest()!=hashlib.sha256(source.read_bytes()).digest():
            raise RuntimeError('Copy verification failure for '+str(target))
    ready={'schema':1,'ready':True,'provider':'Google Cloud Text-to-Speech Chirp 3 HD',
        'locale':'ru-RU','voices':VOICES,
        'descriptions':{'adult':'Charon — male adult','female':'Kore — female',
                        'child':'Leda — gentler female; NOT a native child voice'},
        'totalSegments':327,'durations':dur}
    manifest=APP/'data/chirp-voices.json'
    tmp=manifest.with_suffix('.json.tmp');tmp.write_text(json.dumps(ready,ensure_ascii=False,separators=(',',':'))+'\n')
    tmp.replace(manifest)
    (ROOT/'published-manifest.json').write_text(json.dumps(ready,ensure_ascii=False,indent=2)+'\n')
    print('CHIRP_PROMOTION_VALID',len(staged),'MP3 ready to QA and deploy; originals retained on /dev/sdb')
if __name__=='__main__':
 try:main()
 except Exception as e: print('PROMOTION_BLOCKED',str(e)[:180],file=sys.stderr);sys.exit(1)
