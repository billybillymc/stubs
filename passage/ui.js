/* The paper on the glass: the card, the captions, the voice, the "i".
   Part of The Passage — see ui-passage-pull.html. */
import {SFX} from '../sfx.js';
import {TICKETS,fmtDate} from './tickets.js';
import {$,app} from './app.js';
import {GRAB} from './main.js';

export function hud(){
  const t=TICKETS[app.idx]; if(!t) return;
  $('#card h2').textContent=t.title||t.title_raw||'—';
  $('#r1').innerHTML=`<b>${fmtDate(t.date)}</b>${t.showtime?' — '+t.showtime.toLowerCase():''}`;
  /* written the way a hand writes, not the way a database prints */
  $('#r2').textContent=[(t.theater||''),t.seat?'seat '+t.seat:'',t.price||'']
    .filter(Boolean).join(' · ');
}
/* ================================================================
   THE CAPTIONS
   A line per ticket, in your words — the thing the night was actually
   about, which no receipt ever prints. Two places they can live:
   captions.js (a file you keep) and this browser. Both are written at
   the caption desk — captions.html, its own page — and the browser's
   copy wins, so an edit there is never undone by a stale file.
   This page only ever READS them.
   The key is the ticket's own id, not its place in the running order,
   so re-scanning the shoebox cannot shuffle your lines onto the wrong
   nights.
================================================================ */
export const CAPS=(()=>{
  const base=(window.CAPTIONS&&typeof window.CAPTIONS==='object')?window.CAPTIONS:{};
  let mine={};
  try{ mine=JSON.parse(localStorage.getItem('passagepull.captions')||'{}')||{}; }
  catch(_){ mine={}; }
  const map=Object.assign({},base,mine);
  const idOf=t=>String((t&&(t.id!=null?t.id:t.file))||'');
  return {get:t=>String(map[idOf(t)]||'').trim()};
})();

/* THE VOICE. Not an event — a condition. The line goes up when you
   walk into the room the stub is filed in and stays up for as long as
   you are in there, because somebody in the doorway is saying it while
   you put the night away, not announcing it once you are done. The
   fade out of the room takes it down (see fadeTo). */
export function say(text){
  const el=$('#say');
  text=String(text||'').trim();
  if(!el) return;
  if(!text){ el.classList.remove('on'); return; }
  HOWTO.close();
  $('#saytx').textContent=text;
  /* a short line gets a big hand in a narrow balloon, a long one a
     smaller hand in a wider one — either way it stays a balloon, two
     to four short lines, instead of stretching into a signboard */
  const b=el.querySelector('.bub'), n=text.length;
  b.style.setProperty('--saysz',n<46?'30px':n<110?'26px':'22px');
  b.style.setProperty('--saywd',n<46?'212px':n<110?'300px':'330px');
  el.classList.add('on');
  SFX.tap(1.7);
}
export function hushSay(){ const el=$('#say'); if(el) el.classList.remove('on'); }

/* THE "i". The instructions used to run along the bottom of every
   room whether you wanted them or not; now they wait in the corner
   and come out when asked. Anything that moves the night on — a room
   change, a caption, Escape, a click anywhere else — puts them away. */
export const HOWTO=(()=>{
  const el=$('#howto'), btn=$('#infobtn'), sh=$('#shield');
  const isOpen=()=>el.classList.contains('on');
  function open(){
    el.classList.add('on'); sh.classList.add('on'); btn.classList.add('on');
    btn.setAttribute('aria-expanded','true'); SFX.tap(1.9);
  }
  function close(){
    el.classList.remove('on'); sh.classList.remove('on'); btn.classList.remove('on');
    btn.setAttribute('aria-expanded','false');
  }
  btn.addEventListener('click',e=>{ e.stopPropagation(); isOpen()?close():open(); });
  /* the shield eats the dismissing click whole */
  sh.addEventListener('pointerdown',e=>{ e.stopPropagation(); e.preventDefault(); close(); });
  return {open,close,isOpen};
})();

/* THE COACH. On the very first ticket, each room says what the hand is
   for — click, then pull DOWN — and shows which way down is. It appears
   whenever something is there to take and the hand is empty, gets out
   of the way the moment the hand closes, and retires for good once the
   visitor is past their first stub. */
export const HINTLBL=['TEAR IT — CLICK, PULL DOWN',
               'TAKE IT — CLICK, PULL DOWN',
               'TUCK IT IN — CLICK, PULL DOWN'];
export function hintTick(){
  const el=$('#pullhint'); if(!el) return;
  if(app.idx!==0||!app.acts.length){ el.classList.remove('on'); return; }
  const a=app.acts[app.act];
  const able=!app.busy&&a&&!a.busy&&!GRAB.on&&
    (app.act===0?!!a.held:app.act===1?!!(a.stub&&a.rest):!!a.float);
  el.querySelector('.lbl').textContent=HINTLBL[app.act]||'';
  el.classList.toggle('on',!!able);
}
setInterval(hintTick,180);
