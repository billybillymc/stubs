/* Fetch the poster art the walls will need and keep it in the folder.

   The page used to ask Wikipedia for every poster at run time, which
   meant the marquee depended on the network, on Wikipedia's search
   ranking that day, and on a localStorage cache nobody could see. This
   asks once, saves each picture to posters/, and writes posters.js —
   a manifest keyed the same way the page keys posters, so the rooms
   load art off the disk like everything else.

   What gets fetched is exactly what the marquee shows: for every ticket,
   the film on the stub plus the three season films films.js hangs next
   to it. Nothing else in the almanac is touched.

       node tools/fetch-posters.mjs                 # this folder
       node tools/fetch-posters.mjs --root ../mine  # another collection
       node tools/fetch-posters.mjs --all           # refetch what is on disk
       node tools/fetch-posters.mjs --retry         # ask again about the misses

   Needs Node 22+ for fetch and ESM imports. No other dependencies.
   A title Wikipedia has no picture for is written into the manifest as
   null, so the page draws its card instead of asking again; --retry
   clears those and asks once more. */
import {readFileSync, writeFileSync, existsSync, mkdirSync} from 'node:fs';
import path from 'node:path';
import {pathToFileURL,fileURLToPath} from 'node:url';

const argv=process.argv.slice(2);
const flag=n=>argv.includes(n);
const opt=n=>{ const i=argv.indexOf(n); return i>=0?argv[i+1]:null; };
const ROOT=path.resolve(opt('--root')||path.join(path.dirname(fileURLToPath(import.meta.url)),'..'));
const DIR=path.join(ROOT,'posters');
const OUT=path.join(ROOT,'posters.js');
const UA='ThePassage-poster-fetch/1.0 (https://github.com/billybillymc/stubs; a ticket-stub archive page)';

/* data.js and posters.js are browser globals, not modules: run them
   against a stand-in window and read the result back */
function loadGlobal(file,name){
  const p=path.join(ROOT,file);
  if(!existsSync(p)) return null;
  const window={}; const fn=new Function('window',readFileSync(p,'utf8'));
  fn(window); return window[name]||null;
}
const TICKETS=(loadGlobal('data.js','TICKETS')||[]).slice()
  .sort((a,b)=>String(a.date||'9999').localeCompare(String(b.date||'9999')));
if(!TICKETS.length){ console.log('no tickets in '+path.join(ROOT,'data.js')); process.exit(2); }
const {nearbyFilms}=await import(pathToFileURL(path.join(ROOT,'films.js')).href);
const {searchUrl,pickPoster}=await import(pathToFileURL(path.join(ROOT,'passage/wiki.js')).href);

/* the same bill the street builds, ticket by ticket — keep in step
   with billFor() in passage/posters.js */
const need=new Map();          /* title -> year of first appearance */
for(const cur of TICKETS){
  const mine=cur.title||cur.title_raw||'';
  const bill=mine?[{title:mine,year:(cur.date||'').slice(0,4)}]:[];
  for(const f of nearbyFilms(cur.date,4-bill.length,mine))
    bill.push({title:f.t,year:(f.d||'').slice(0,4)});
  for(const b of bill) if(b.title&&!need.has(b.title)) need.set(b.title,b.year);
}

const have=loadGlobal('posters.js','POSTERS')||{};
const slug=t=>t.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g,'')
  .replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,60)||'untitled';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));

mkdirSync(DIR,{recursive:true});
const manifest={};
let hit=0,miss=0,kept=0,failed=0;
for(const [title,year] of [...need.entries()].sort((a,b)=>a[0].localeCompare(b[0]))){
  const prev=have[title];
  if(!flag('--all')&&typeof prev==='string'&&existsSync(path.join(ROOT,prev))){
    manifest[title]=prev; kept++; continue;
  }
  if(!flag('--all')&&!flag('--retry')&&prev===null){
    manifest[title]=null; kept++; continue;
  }
  try{
    const r=await fetch(searchUrl(title,year),{headers:{'User-Agent':UA}});
    const j=await r.json();
    const pages=(j.query&&j.query.pages)?Object.values(j.query.pages):[];
    const pick=pickPoster(pages,title,year);
    if(!pick){ manifest[title]=null; miss++; console.log('  miss  '+title); await sleep(300); continue; }
    const img=await fetch(pick.url,{headers:{'User-Agent':UA}});
    if(!img.ok) throw new Error('image '+img.status);
    const type=(img.headers.get('content-type')||'').toLowerCase();
    const ext=type.includes('png')?'.png':type.includes('webp')?'.webp':'.jpg';
    /* two titles can slug alike — "Mission: Impossible - Rogue Nation"
       with a hyphen and with an en dash — and must not overwrite each
       other, even when they turn out to be the same picture */
    let file='posters/'+slug(title)+ext;
    for(let n=2;Object.values(manifest).includes(file);n++) file='posters/'+slug(title)+'-'+n+ext;
    writeFileSync(path.join(ROOT,file),Buffer.from(await img.arrayBuffer()));
    manifest[title]=file; hit++;
    console.log('  saved '+title+'  <-  '+pick.article);
  }catch(e){
    /* a network failure is not a miss: leave the title out so the page
       falls back to asking Wikipedia itself, and a re-run tries again */
    failed++; console.log('  FAIL  '+title+'  ('+e.message+')');
  }
  await sleep(300);
}

const head=`/* POSTER ART — one file per title, keyed exactly as the page keys
   posters (the film's title as it appears in data.js or films.js).
   Written by tools/fetch-posters.mjs; a null means Wikipedia had no
   picture and the page should draw its own card. A title missing from
   this list altogether falls back to asking Wikipedia at run time. */
window.POSTERS = `;
writeFileSync(OUT,head+JSON.stringify(manifest,null,1)+';\n');
console.log(`posters: ${hit} fetched, ${miss} not on Wikipedia, ${kept} already here, ${failed} failed`
  +`\n-> ${path.relative(process.cwd(),OUT)||'posters.js'} (${Object.keys(manifest).length} titles)`);
process.exitCode=failed?1:0;
