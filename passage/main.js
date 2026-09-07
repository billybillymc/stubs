/* The flow: what follows what, what the hand does, and the boot.
   Part of The Passage — see ui-passage-pull.html. */
import {SFX} from '../sfx.js';
import {N,TICKETS,TICKET_LAYER} from './tickets.js';
import {_tw,stepTweens} from './tween.js';
import {actDate,skyPhase} from './hour.js';
import {pool} from './mats.js';
import {getTex,loader,marqueeBill,posterTex} from './posters.js';
import {bloom,canvas,composer,lensPass,renderPass,renderer} from './stage.js';
import {Outside} from './acts/outside.js';
import {Corridor} from './acts/inside.js';
import {Bedroom} from './acts/home.js';
import {$,app} from './app.js';
import {HOWTO,hud,hushSay,say} from './ui.js';

export function useAct(i){
  app.act=i;
  renderer.shadowMap.needsUpdate=true;      /* a new room, cut once */
  const a=app.acts[i];
  renderPass.scene=a.scene; renderPass.camera=a.camera;
  resize();
  hud();
}
export async function fadeTo(fn){
  hushSay(); HOWTO.close();
  SFX.whoosh(-1,.14);
  $('#fader').classList.add('on');
  await new Promise(r=>setTimeout(r,480));
  await fn();
  $('#fader').classList.remove('on');
}
/* A room bakes its hour in when it is built — sky, environment, every
   light is scaled by it — so a ticket whose hour lands in a different
   phase of sky needs a different room. Those rooms are KEPT, one per
   phase per act: built once (at boot for tonight's, in the idle after
   boot for the rest), and after that a change of hour is a pointer
   swap during the fade instead of a rebuild behind it. Only the exact
   minute is carried across each time, for the clock. */
export const actPool={0:{},2:{}};
export function actFor(actIdx,when){
  const ph=skyPhase(when), pool=actPool[actIdx];
  if(!pool[ph]){
    const a=actIdx===0?new Outside(when):new Bedroom(when);
    /* same rite as at boot: the raw ticket pass goes dark otherwise */
    a.scene.traverse(o=>{ if(o.isLight) o.layers.enable(TICKET_LAYER); });
    pool[ph]=a;
  }
  const a=pool[ph];
  a.when=when; a._t0=null;
  a.camera.aspect=innerWidth/innerHeight; a.camera.updateProjectionMatrix();
  return a;
}
export function rephase(actIdx){
  const when=actDate(actIdx,TICKETS[app.idx]);
  if(when) app.acts[actIdx]=actFor(actIdx,when);
}
export async function go(actIdx){
  const cur=app.acts[app.act];
  await fadeTo(async()=>{
    cur.exit();
    rephase(actIdx);
    useAct(actIdx);
    await app.acts[actIdx].enter(app.idx);
  });
}
export async function advance(dir){
  if(app.busy) return;
  const a=app.acts[app.act];
  if(a.busy) return;
  app.busy=true;
  if(dir>0){
    if(a.perform) await a.perform(app.idx);
    if(app.act<2) await go(app.act+1);
    else { app.setIdx(app.idx+1); await go(0); }
  }else{
    if(app.act>0) await go(app.act-1);
    else { app.setIdx(app.idx-1); await go(2); }
  }
  app.busy=false;
}
export const muteBtn=$('#mute');
export const muteLabel=()=>{ muteBtn.textContent=SFX.muted?'♪ OFF':'♪ ON'; };
muteBtn.addEventListener('click',e=>{e.stopPropagation();SFX.toggle();muteLabel();});
muteLabel();
/* no arrow buttons any more — the tally sits alone; the keyboard still
   walks the nights (space/→ on, ← back) */
/* THE HAND. A click takes hold; pulling the mouse DOWN does the act —
   the tear, the pocketing, the tuck. Let go early and it springs back;
   pull it most of the way and the act completes itself and the night
   moves on. Space still does the whole gesture for you. */
/* When something was last asked of the page. The idle work below waits
   for a gap in it: building a room is one long synchronous block, and
   dropping one on a hand mid-gesture is a freeze, not a hitch. */
let lastInput=0;
const touched=()=>{ lastInput=performance.now(); };
addEventListener('pointerdown',touched,true);
addEventListener('keydown',touched,true);

export const GRAB={on:false,y0:0,k:0};
canvas.style.cursor='grab';
canvas.addEventListener('pointerdown',e=>{
  if(e.button!==0||app.busy) return;
  const a=app.acts[app.act];
  /* the binder answers first: pages flip, stubs lift to the eye */
  if(a.tap&&a.tap(e)) return;
  if(!a.grab||a.busy||!a.grab()) return;
  GRAB.on=true; GRAB.y0=e.clientY; GRAB.k=0;
  $('#pullhint').classList.remove('on');
  canvas.style.cursor='grabbing';
  try{canvas.setPointerCapture(e.pointerId);}catch(_){}
});
addEventListener('pointermove',e=>{
  if(!GRAB.on) return;
  GRAB.k=Math.max(0,Math.min(1,(e.clientY-GRAB.y0)/(innerHeight*.42)));
  app.acts[app.act].drag(GRAB.k);
});
addEventListener('pointerup',async()=>{
  if(!GRAB.on) return;
  GRAB.on=false; canvas.style.cursor='grab';
  const a=app.acts[app.act];
  /* A long pull always finishes the act. Some acts also pass a point
     of no return well before the hand gets there — the tear does — and
     those say so themselves rather than being held to the same number. */
  if(GRAB.k>.6||(a.committed&&a.committed())){
    app.busy=true;
    await a.release(true);
    if(app.act<2) await go(app.act+1);
    else { app.setIdx(app.idx+1); await go(0); }
    app.busy=false;
  } else await a.release(false);
});

addEventListener('keydown',e=>{
  if(e.repeat) return;
  if(e.key==='Escape'){ HOWTO.close(); return; }
  if(e.key==='i'||e.key==='I'){ HOWTO.isOpen()?HOWTO.close():HOWTO.open(); return; }
  if(e.key===' '||e.key==='ArrowRight'){e.preventDefault();advance(1);}
  else if(e.key==='ArrowLeft') advance(-1);
});
addEventListener('pointermove',e=>{
  app.px=(e.clientX/innerWidth)*2-1; app.py=(e.clientY/innerHeight)*2-1;
});
export function resize(){
  const w=innerWidth,h=innerHeight;
  renderer.setSize(w,h);
  composer.setSize(w,h);
  bloom.setSize(w,h);
  for(const a of app.acts){ a.camera.aspect=w/h; a.camera.updateProjectionMatrix(); }
}
addEventListener('resize',resize);

/* Shadow maps are re-cut for every casting light on every single
   frame by default, and these rooms hardly move: the wood, the walls,
   the binder and the poster cases are exactly where they were last
   frame. So the maps are cut on demand instead — while a tween is
   running, while a hand is on a ticket, while a room is changing —
   and otherwise the last ones stand. */
renderer.shadowMap.autoUpdate=false;
renderer.shadowMap.needsUpdate=true;

renderer.setAnimationLoop(()=>{
  /* Two clocks, deliberately. Scene updates take a CLAMPED delta, so a
     stall cannot teleport anything. The choreography takes something
     much closer to real time, because a tween fed a clamped delta does
     not drop frames — it stretches. At 20fps every gesture in the
     piece silently ran at half speed, and a page turn that should take
     half a second took four; the slower the machine, the more it looked
     like treacle rather than like a dropped frame. The 250ms ceiling is
     only there to catch a backgrounded tab. */
  const raw=app.clock.getDelta();
  const dt=Math.min(.05,raw);
  stepTweens(Math.min(.25,raw));
  const a=app.acts[app.act];
  if(a){
    if(_tw.size||GRAB.on||app.busy||a.busy) renderer.shadowMap.needsUpdate=true;
    a.update(dt,app.clock.elapsedTime);
    lensPass.uniforms.uTime.value=app.clock.elapsedTime;
    composer.render();
    /* the stubs again, raw on top — no grain, no vignette, no failing
       lens. A Color background would force-clear the frame, so it is
       lifted for the pass; shadow maps already rendered this frame. */
    const bg=a.scene.background; a.scene.background=null;
    renderer.autoClear=false;
    renderer.clearDepth();
    a.camera.layers.set(TICKET_LAYER);
    renderer.render(a.scene,a.camera);
    a.camera.layers.set(0);
    renderer.autoClear=true;
    a.scene.background=bg;
  }
});

/* ----------------------------------------------------------------
   BOOT
   Everything the passage needs is fetched before the curtain lifts,
   so nothing pops in later: the three rooms and their models, every
   ticket thumbnail (the binder can jump to any of them), the full-res
   scans either side of where you are, and the poster art for tonight's
   bill. Work is yielded between batches or the bar would freeze at 0
   and jump to 100 — the browser cannot paint while we hold the thread.
---------------------------------------------------------------- */
export const boot=(()=>{
  let done=0,total=1;
  const bar=()=>document.querySelector('#bar i');
  return {
    plan(t){ total=Math.max(1,t); },
    say(msg){ const el=document.querySelector('#lmsg'); if(el&&msg) el.textContent=msg; },
    step(n=1){
      done+=n;
      const pct=Math.min(100,Math.round(done/total*100));
      const b=bar(); if(b) b.style.width=pct+'%';
      const p=document.querySelector('#lpct'); if(p) p.textContent=pct+'%';
    },
  };
})();
export const nextFrame=()=>new Promise(r=>requestAnimationFrame(()=>r()));

(async function start(){
  /* What must be ready before the curtain lifts, and what must not.
     Loading all 191 thumbs up front took 88 seconds to first paint —
     technically "everything loaded", practically a broken page. So the
     blocking set is only what act one and the first binder page can
     actually reach, and the rest of the shoebox streams in behind the
     curtain, where there is plenty of time: you have to walk through
     two rooms before the binder can show you page two. */
  const WARM=3, PAGE=9;
  /* weights, not step counts: opening the first act costs about as
     much as everything before it, and a bar that parks at 95% for the
     whole of it is a bar that looks broken */
  boot.plan(1 + 3 + PAGE + WARM + 4 + 6);

  /* the marquee and the house sign are baked into canvases once per
     ticket, so Oswald has to be here BEFORE the first bake — otherwise
     act one opens with the fallback face burned into the texture and
     nothing ever redraws it */
  boot.say('SETTING THE TYPE');
  await document.fonts.ready.catch(()=>{});
  await Promise.all([
    document.fonts.load('700 96px Oswald'),
    document.fonts.load('600 52px Oswald'),
    document.fonts.load('700 28px Caveat'),
  ]).catch(()=>{});
  boot.step();

  boot.say('CONVERTING 35MM INTO DLP');
  app.acts=[];
  const t0=TICKETS[app.idx];
  for(const make of [()=>actFor(0,actDate(0,t0)),()=>new Corridor(),
                     ()=>actFor(2,actDate(2,t0))]){
    await nextFrame();               /* let the bar paint between rooms */
    app.acts.push(make());
    boot.step();
  }
  /* lights must be visible to the ticket layer or the raw pass goes dark */
  for(const act of app.acts)
    act.scene.traverse(o=>{ if(o.isLight) o.layers.enable(TICKET_LAYER); });
  /* the one handle the outside world gets: the QA harness and the
     perf probes read state and renderer.info through it */
  app.renderer=renderer; app.composer=composer; app.pool=actPool;
  window.app=app;
  useAct(0);

  boot.say('PREPARING HIGH-QUALITY TICKET PAPER');
  const page0=Math.floor(app.idx/9)*9;
  await Promise.all(TICKETS.slice(page0,page0+PAGE).map(t=>getTex(t.file,'thumbs')));
  boot.step(PAGE); await nextFrame();

  boot.say('GIVING THE PAPER A LITTLE GLOSS');
  for(let d=0;d<WARM;d++){
    await getTex(TICKETS[(app.idx+d)%N].file);
    boot.step();
  }
  await nextFrame();

  /* Poster art comes from Wikipedia, so this is the one step whose
     cost is somebody else's server. Give it a beat to land — the cases
     look right at first paint when it does — but never let it hold the
     curtain: a cold fetch here was the difference between a 23s boot
     and an 88s one. If it misses, updatePosters still fills the cases,
     and the drawn one-sheet backs it up. */
  boot.say('HANGING UP THE ONE-SHEETS (POSTERS)');
  await Promise.race([
    Promise.all(marqueeBill(app.idx).map(f=>posterTex(f).catch(()=>null))),
    new Promise(r=>setTimeout(r,2500)),
  ]);
  boot.step(4);

  boot.say('OPENING THE DOORS');
  await app.acts[0].enter(app.idx);
  boot.step(6);
  $('#hud').classList.add('on');
  $('#loader').classList.add('off');

  /* the rest of the shoebox, quietly, now that something is on screen.
     Small batches with a breath between them so the prefetch never
     competes with the first animation for the main thread. */
  (async()=>{
    /* Nearest first. The binder opens on tonight's page and the pages
       within one turn of it are the ones you will ask for next, but
       this used to stream 0..N in collection order — so if tonight is
       ticket 150, the thumbs you are about to need queued up behind a
       hundred and fifty you are not. */
    const here=Math.floor(app.idx/9)*9;
    const order=TICKETS.map((_,j)=>j)
      .sort((x,y)=>Math.abs(x-here)-Math.abs(y-here));
    for(let i=0;i<order.length;i+=6){
      await new Promise(r=>setTimeout(r,140));
      await Promise.all(order.slice(i,i+6).map(j=>getTex(TICKETS[j].file,'thumbs')));
    }
    for(let d=WARM;d<WARM+10;d++){
      await new Promise(r=>setTimeout(r,220));
      /* a full-res scan is 600KB to decode and hand to the GPU */
      while(GRAB.on||app.busy) await new Promise(r=>setTimeout(r,300));
      await getTex(TICKETS[(app.idx+d)%N].file);
    }
    /* THE OTHER HOURS OF THE DAY.
       Every phase of sky the collection will ever ask of the street or
       the bedroom gets its room built here, in the idle after
       everything else has been fetched — a construction is a visible
       hitch mid-fade, a built room is free. At most four phases per
       act ever exist.

       But a construction is not cheap and it is not interruptible:
       measured on this machine, a bedroom takes about 0.8s of solid
       main thread, a corridor 1s, and the street — poster cases, doors,
       stanchions, glazing, marquee — several seconds. Dropped on a
       visitor mid-gesture that is not a hitch, it is a freeze: no
       frame, no pointer, nothing. It used to fire every 900ms
       regardless of what was going on, which is why the first stub you
       picked up sometimes locked the room.

       So each one waits for the house to be quiet: no tween running,
       no hand down, nothing busy, and a clear beat since the last
       click or keypress. */
    const quiet=()=>!app.busy&&!GRAB.on&&!_tw.size&&
      !(app.acts[app.act]&&app.acts[app.act].busy)&&
      performance.now()-lastInput>1500;
    const untilQuiet=async()=>{
      while(!quiet()) await new Promise(r=>setTimeout(r,400));
      await nextFrame();          /* and let the frame it interrupted land */
    };
    for(const ai of [0,2]){
      for(const t of TICKETS){
        const when=actDate(ai,t);
        if(actPool[ai][skyPhase(when)]) continue;
        await new Promise(r=>setTimeout(r,900));
        await untilQuiet();
        actFor(ai,when);
      }
    }
  })();
})();
