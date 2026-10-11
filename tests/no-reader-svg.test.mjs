import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const files=['index.html','v2.css','menu-v22.css','mascot-clean-v30.css','barti-wan.css','sw.js','experience.js','barti-wan-player.js'];
for(const name of files){
 const s=readFileSync(resolve(root,name),'utf8');
 assert(!s.includes('reader-book.svg'),name+': legacy book SVG reference is forbidden');
}
assert(!existsSync(resolve(root,'assets/character/reader-book.svg')),'Legacy SVG must be deleted');
const html=readFileSync(resolve(root,'index.html'),'utf8');
assert(html.includes('mascot-clean-v30.css?v=30'),'Missing v30 style');
assert(html.includes('v2.css?v=30')&&html.includes('menu-v22.css?v=30'),'Old style cache URL');
assert(!html.includes('src="./assets/barti.webp"'),'Reader may not fall back to tablet artwork');
const css=readFileSync(resolve(root,'mascot-clean-v30.css'),'utf8');
assert(css.includes('posters/17_reuse_reader_idle.jpg'),'Missing real-book fallback');
assert(existsSync(resolve(root,'assets/character/video/posters/17_reuse_reader_idle.jpg')),'Missing fallback poster');
const sw=readFileSync(resolve(root,'sw.js'),'utf8');
assert(/barti-storyclub-v3[0-9]/g.test(sw),'Service-worker cache version below 30');
assert(sw.includes('mascot-clean-v30.css?v=30'),'v30 style must be cached for offline use');
console.log('PASS: no SVG book overlay, no tablet reader fallback, fresh CSS and PWA cache');
