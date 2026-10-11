import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
const read=file=>JSON.parse(fs.readFileSync(path.join(root,file),'utf8'));
const stories=read('data/stories.json');
const scenes=read('data/sentence-scenes.json');
const duration=read('data/voice-durations.json');
let sentences=0,paragraphs=0;
for(const story of stories){
  const id=story.id,images=scenes.stories[id];
  assert(Array.isArray(images),'Missing image map '+id);
  for(const [p,text] of story.paragraphs.entries()){
    paragraphs++;
    const parts=text.trim().split(/(?<=[.!?…])\s+/u).map(x=>x.trim()).filter(Boolean);
    const items=images.filter(x=>x.paragraph===p);
    assert.equal(items.length,parts.length,id+' p'+p);
    let word=0;
    for(const [index,s] of parts.entries()){
      const scene=items[index];sentences++;
      assert.equal(scene.sentence,s,id+' original sentence');
      assert.equal(scene.firstWord,word,'word start mismatch');
      word+=(s.match(/[А-Яа-яЁё]+(?:-[А-Яа-яЁё]+)*/gu)||[]).length;
      assert.equal(scene.lastWordExclusive,word,'word boundary mismatch');
      const file=path.join(root,scene.file.replace(/^\.\//,''));
      assert(fs.existsSync(file)&&fs.statSync(file).size>4000,'Missing/black image '+file);
    }
    for(const profile of ['adult','female','child']){
      assert(duration[profile][id][p]>0.5,'Missing duration '+profile+' '+id+' '+p);
      const name=profile==='adult'? `assets/audio/${id}-${p}.mp3`:`assets/voices/${profile}/${id}-${p}.mp3`;
      const file=path.join(root,name);
      assert(fs.existsSync(file) && fs.statSync(file).size>3000,'Missing voice '+name);
    }
  }
}
assert.equal(stories.length,18);
assert.equal(paragraphs,109);
assert.equal(sentences,223);
console.log('PASS: 18 stories / 109 paragraphs / 223 images / 327 MP3 positions, per-word index mapping.');
