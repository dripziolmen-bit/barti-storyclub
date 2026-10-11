#!/usr/bin/env python3
"""Pre-render Google Chirp 3 HD narration for BARTI STORY CLUB.
Google Cloud credentials must be configured by the account owner through ADC.
Default mode is offline dry-run; no charge until --sample or --all.
Outputs are immutable MP3 masters on second disk, not checked into git.
When requests could have succeeded before a network failure, do not retry
automatically (avoid inadvertent extra costs). --retry-uncertain is manual only.
"""
import argparse, hashlib, json, os, subprocess, sys, time
from datetime import datetime, timezone
from pathlib import Path

PROJECT=Path('/home/ubuntu/bartek-workspace/projects/BARTI_GOOGLE_CHIRP')
ROOT=Path('/mnt/data/marka-lab/barti-story-club/voices/chirp3-hd-v1')
STORIES=PROJECT/'data/stories.json'
PROFILE_TO_VOICE={
    'adult': 'ru-RU-Chirp3-HD-Charon',
    'female': 'ru-RU-Chirp3-HD-Kore',
    'child': 'ru-RU-Chirp3-HD-Leda',  # gentle female, NOT actual child voice
}
VOICE_DESC={
    'adult':'Dorosły — Charon (rosyjski, głos męski)',
    'female':'Kobieta — Kore (rosyjski, głos kobiecy)',
    'child':'Łagodny — Leda (rosyjski, głos kobiecy; nie dziecięcy)',
}
MAX_PRICE_USD=1.00 # theoretical charge even if free allowance exhausted
PRICE_PER_CHAR=0.00003

def ensure_disk():
    v=subprocess.check_output(['findmnt','-T','/mnt/data','-no','SOURCE'],text=True).strip()
    if v!='/dev/sdb':
        raise RuntimeError('Second disk /dev/sdb not mounted at /mnt/data; refusing any output')

def writejson(path,data):
    path.parent.mkdir(parents=True,exist_ok=True)
    temp=path.with_name(path.name+'.tmp')
    temp.write_text(json.dumps(data,indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
    temp.replace(path)

def text_hash(text):return hashlib.sha256(text.encode('utf-8')).hexdigest()

def planned_jobs(data):
    return [(profile,story['id'],idx,text)
       for profile in PROFILE_TO_VOICE
       for story in data for idx,text in enumerate(story['paragraphs'])]

def require_sdk():
    try:from google.cloud import texttospeech
    except ImportError:
        raise RuntimeError('Run with .venv/bin/python after installing google-cloud-texttospeech')
    try:
        client=texttospeech.TextToSpeechClient()
        return client,texttospeech
    except Exception as exc:
        raise RuntimeError('Google Cloud ADC not configured. Supply service account / ADC on VPS; see docs/GOOGLE_CHIRP3.md. Underlying error: '+str(exc)[:160])

def check_available(client):
    voices=client.list_voices(language_code='ru-RU').voices
    available={v.name for v in voices}
    missing=[v for v in PROFILE_TO_VOICE.values() if v not in available]
    if missing:raise RuntimeError('Requested voices absent for project/region: '+', '.join(missing))
    print('GOOGLE_VOICES_VERIFIED',','.join(PROFILE_TO_VOICE.values()),flush=True)

def main():
    ap=argparse.ArgumentParser()
    mode=ap.add_mutually_exclusive_group()
    mode.add_argument('--dry-run',action='store_true',help='No network and no billing (default)')
    mode.add_argument('--check-auth',action='store_true',help='Only check Google ADC/voice list, no synthesis')
    mode.add_argument('--sample',action='store_true',help='Generate one preview MP3 for each of three roles')
    mode.add_argument('--all',action='store_true',help='Generate all 327 MP3 clips, preserve retries safely')
    ap.add_argument('--retry-uncertain',action='store_true',help='Allow reattempt of previously uncertain paid requests')
    args=ap.parse_args()
    ensure_disk()
    source=json.loads(STORIES.read_text(encoding='utf-8'))
    jobs=planned_jobs(source)
    assert len(source)==18 and sum(len(s['paragraphs']) for s in source)==109 and len(jobs)==327
    chars=sum(len(text) for _,_,_,text in jobs)
    if chars*PRICE_PER_CHAR > MAX_PRICE_USD:
        raise RuntimeError('Potential charges exceed configured spending cap')
    print('CHIRP_PLAN',len(jobs),'requests',chars,'characters',round(chars*PRICE_PER_CHAR,4),'USD worst-case outside free tier',flush=True)
    if not (args.all or args.sample or args.check_auth):return

    client,tts=require_sdk()
    check_available(client)
    if args.check_auth:return
    ROOT.mkdir(parents=True,exist_ok=True)
    sample_map=[job for job in jobs if job[1]=='repka' and job[2]==0]
    chosen=sample_map if args.sample else jobs
    created=0;skipped=0;uncertain=0
    for profile,sid,pi,text in chosen:
        dst=ROOT/profile/sid/f'{pi:02d}.mp3'
        journal=ROOT/'_jobs'/profile/sid/f'{pi:02d}.json'
        h=text_hash(text)
        if journal.exists():
            prev=json.loads(journal.read_text())
            if prev.get('textSha256')!=h or prev.get('voice')!=PROFILE_TO_VOICE[profile]:
                raise RuntimeError('Text or voice changed for '+str(journal)+'; manual migration required')
            if prev.get('status')=='DONE' and dst.is_file() and dst.stat().st_size>2000:
                skipped+=1;continue
            if prev.get('status') in ('SENT_UNCERTAIN','PREPARING') and not args.retry_uncertain:
                uncertain+=1;print('UNCERTAIN_SKIP',profile,sid,pi,'manual --retry-uncertain required',flush=True);continue
            if prev.get('status')=='DONE' and (not dst.exists() or dst.stat().st_size<2000):
                raise RuntimeError('Master MP3 missing but marked done: '+str(dst))
        dst.parent.mkdir(parents=True,exist_ok=True)
        writejson(journal,{'status':'PREPARING','voice':PROFILE_TO_VOICE[profile],'textSha256':h,
                          'characters':len(text),'started':datetime.now(timezone.utc).isoformat()})
        # From this point on, reattempts might be billable. Record state before API call.
        writejson(journal,{'status':'SENT_UNCERTAIN','voice':PROFILE_TO_VOICE[profile],'textSha256':h,
                          'characters':len(text),'started':datetime.now(timezone.utc).isoformat()})
        try:
            response=client.synthesize_speech(
                request=tts.SynthesizeSpeechRequest(
                    input=tts.SynthesisInput(text=text),
                    voice=tts.VoiceSelectionParams(name=PROFILE_TO_VOICE[profile],language_code='ru-RU'),
                    audio_config=tts.AudioConfig(audio_encoding=tts.AudioEncoding.MP3)))
            if len(response.audio_content)<2000: raise ValueError('Missing or tiny audio response')
            tmp=dst.with_suffix('.mp3.tmp')
            tmp.write_bytes(response.audio_content);tmp.replace(dst)
            writejson(journal,{'status':'DONE','voice':PROFILE_TO_VOICE[profile],
                         'textSha256':h,'characters':len(text),'bytes':dst.stat().st_size,
                         'completed':datetime.now(timezone.utc).isoformat()})
            created+=1
            if created%10==0 or args.sample:print('SYNTHESIZED',created,'/',len(chosen),profile,sid,pi,flush=True)
        except Exception as exc:
            print('ERROR_STOP',profile,sid,pi,str(exc)[:190],file=sys.stderr,flush=True)
            print('Request status uncertain. No automated retry; inspect billing before --retry-uncertain.',file=sys.stderr)
            return 3
    print('SYNTHESIS_DONE',created,'skipped',skipped,'uncertain',uncertain,'target',len(chosen),flush=True)
    return 0 if not uncertain else 2

if __name__=='__main__':
    try:sys.exit(main() or 0)
    except Exception as exc:
        print('CHIRP_BLOCKED',str(exc)[:250],file=sys.stderr)
        sys.exit(1)
