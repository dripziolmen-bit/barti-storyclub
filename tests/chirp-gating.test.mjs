import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
const read=name=>JSON.parse(fs.readFileSync(path.join(root,name),'utf8'));
const stories=read('data/stories.json');
const status=read('data/chirp-voices.json');
const schema=['adult','female','child'];
assert.deepEqual(Object.keys(status.profiles).sort(),[...schema].sort());
assert.equal(status.provider,'Google Cloud Text-to-Speech Chirp 3 HD');
assert.equal(stories.length,18);
assert.equal(stories.reduce((n,s)=>n+s.paragraphs.length,0),109);
const chars=stories.reduce((n,s)=>n+s.paragraphs.reduce((p,x)=>p+x.length,0),0)*3;
assert.equal(chars,29292);
if(!status.ready){
 for(const role of schema)for(const story of stories){
  const some=path.join(root,'assets/voices/chirp3',role,story.id+'-0.mp3');
  assert(!fs.existsSync(some),'Google assets exist but readiness is false. Inspect promotion.');
 }
} else {
 for(const role of schema)for(const story of stories){
  const ds=status.durations?.[role]?.[story.id];
  assert.equal(ds?.length,story.paragraphs.length,'Missing Chirp durations');
  for(const [i,x] of ds.entries()){
    assert(x>0,'Invalid MP3 duration');
    assert(fs.existsSync(path.join(root,'assets/voices/chirp3',role,story.id+'-'+i+'.mp3')),'Missing Chirp asset');
  }
 }
}
const app=fs.readFileSync(path.join(root,'app.js'),'utf8');
assert(app.includes('s.chirpReady')&&app.includes('chirp3/'),'Chirp app integration missing');
const sw=fs.readFileSync(path.join(root,'sw.js'),'utf8');
assert(/barti-storyclub-v3[4-9]/.test(sw),'PWA cache must invalidate older versions');
assert(sw.includes("url.pathname.endsWith('/data/chirp-voices.json')"),'Chirp readiness must be network-first');
console.log('CHIRP_COMPAT_CHECK_PASS',JSON.stringify({ready:status.ready,stories:18,segments:327,characters:29292}));
