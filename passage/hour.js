/* What time it is, and what the sky does about it.
   Part of The Passage — see ui-passage-pull.html. */
import {rnd} from './tickets.js';
import {cv,tex} from './tex.js';

/* ----------------------------------------------------------------
   THE HOUR
   Everything the bedroom shows through its window — and the light that
   comes back in off it — is picked from the clock on the wall, which is
   the machine's own clock. One table drives the glass, the moonlight
   and the room's little sky, so they can never disagree with each other.
   Resolved once when the room is built; the wall clock ticks live.
---------------------------------------------------------------- */
export const SKY={
  night:{haze:0x1b1b26,top:'#0a1022',hor:'#1b2842',city:'#05080f',lit:.9,stars:190,
    orb:{x:.70,y:.30,r:15,c:'#eef2ff',glow:'rgba(190,212,255,.30)'},
    env:['#2b3450','#20202c','#0e0d12'],win:'rgba(159,180,221,.75)',
    room:{c:0x9fb4dd,i:.5},hemi:.72},
  dawn:{haze:0x2a2233,top:'#26325c',hor:'#e29468',city:'#171622',lit:.4,stars:34,
    orb:{x:.30,y:.66,r:19,c:'#ffdcae',glow:'rgba(255,188,128,.38)'},
    env:['#4a4260','#4b3a3e','#181420'],win:'rgba(240,180,140,.7)',
    room:{c:0xe0b48c,i:.66},hemi:.8},
  day:{haze:0x3b3f4a,top:'#6e9bd4',hor:'#cfe1ef',city:'#59626f',lit:.06,stars:0,
    orb:null,env:['#8aa6c8','#6a7285','#2a2c33'],win:'rgba(214,232,255,.9)',
    room:{c:0xdce8ff,i:1.18},hemi:1.15},
  dusk:{haze:0x241d2b,top:'#28305c',hor:'#d4713e',city:'#141320',lit:.6,stars:24,
    orb:{x:.24,y:.62,r:18,c:'#ffd0a0',glow:'rgba(255,150,90,.38)'},
    env:['#453a5c','#48333a','#14111c'],win:'rgba(232,150,100,.72)',
    room:{c:0xc79ad0,i:.6},hemi:.8},
};
/* ?hour=22 forces the hour for both the room and the clock, so the
   night dressing can be checked without waiting for night */
export function hourOverride(d){
  const q=new URLSearchParams(location.search).get('hour');
  if(q!==null&&q!=='') d.setHours(Math.max(0,Math.min(23,parseInt(q,10)||0)));
  return d;
}
export function nowDate(){ return hourOverride(new Date()); }

/* ----------------------------------------------------------------
   THE HOUR OFF THE STUB
   The scenes used to run on the machine's clock, which put every
   ticket at whatever hour you happened to open the page. The evening
   belongs to the ticket: the street is the walk up to the door
   (showtime minus the quarter hour you got there early), and the
   bedroom is after the drive home (showtime plus the picture's
   runtime plus half an hour). Runtimes come baked from Wikipedia in
   runtimes.js; a title that is not there gets a plain two hours.
---------------------------------------------------------------- */
export function showMinutes(t){
  const m=(t.showtime||'').trim().toLowerCase().match(/(\d{1,2})[:.](\d{2})\s*([ap])?/);
  if(!m) return 19*60+30;              /* no time on the stub: call it 7:30 */
  const hh=parseInt(m[1],10), mm=parseInt(m[2],10);
  let mer=m[3]||null;
  if(!mer){
    /* the stub does not say. Houses run morning shows from 10:30 to
       11:45; everything from 1 to 10 is an afternoon or an evening. */
    mer=((hh===10&&mm>=30)||(hh===11&&mm<=45))?'a':'p';
  }
  let h=hh%12; if(mer==='p') h+=12;
  return h*60+mm;
}
export function runtimeOf(t){
  const R=window.RUNTIMES||{};
  const name=t.title||t.title_raw||'';
  return R[name+'|'+(t.year||'')]||R[name]||120;
}
/* the wall-clock moment for a ticket, offset in minutes from showtime;
   ?hour= still wins so the dressing can be checked at any hour */
export function ticketDate(t,offMin){
  const d=new Date((t.date||'2026-01-01')+'T00:00:00');
  d.setMinutes(showMinutes(t)+offMin);
  return hourOverride(d);
}
/* which acts carry a clock of their own, and what it reads there */
export function actDate(actIdx,t){
  if(!t) return null;
  return actIdx===0 ? ticketDate(t,-15)
       : actIdx===2 ? ticketDate(t,runtimeOf(t)+30)
       : null;
}
export function skyPhase(d){
  const h=d.getHours()+d.getMinutes()/60;
  if(h<5)    return 'night';
  if(h<7.2)  return 'dawn';
  if(h<17.4) return 'day';
  if(h<20)   return 'dusk';
  return 'night';
}
/* Only the sky is painted now — it is genuinely far away and flat, so
   a texture is the honest representation. The rooftops that used to be
   drawn here are real geometry behind the window instead; painted ones
   slid like a poster whenever the camera moved, which is precisely
   what made the old view read as fake. */
export function skyTex(phase){
  const P=SKY[phase],W=256,H=160,c=cv(W,H),g=c.getContext('2d');
  const sky=g.createLinearGradient(0,0,0,H);
  sky.addColorStop(0,P.top); sky.addColorStop(.72,P.hor); sky.addColorStop(1,P.hor);
  g.fillStyle=sky; g.fillRect(0,0,W,H);
  for(let i=0;i<P.stars;i++){
    const y=Math.random()*H*.62;
    g.fillStyle=`rgba(255,255,255,${(1-y/(H*.62))*Math.random()*.85+.1})`;
    g.fillRect(Math.random()*W,y,1,1);
  }
  if(P.orb){
    const ox=W*P.orb.x,oy=H*P.orb.y*.72,r=P.orb.r*.9;
    const gl=g.createRadialGradient(ox,oy,1,ox,oy,r*5);
    gl.addColorStop(0,P.orb.glow); gl.addColorStop(1,'rgba(0,0,0,0)');
    g.fillStyle=gl; g.fillRect(ox-r*5,oy-r*5,r*10,r*10);
    g.beginPath(); g.arc(ox,oy,r,0,7); g.fillStyle=P.orb.c; g.fill();
  }
  return tex(c);
}
/* lit windows for the blocks outside; dark at midday */
export function bldgTex(phase){
  const P=SKY[phase],W=64,H=64,c=cv(W,H),g=c.getContext('2d');
  g.fillStyle='#000'; g.fillRect(0,0,W,H);
  for(let y=5;y<H-5;y+=9) for(let x=5;x<W-5;x+=9)
    if(Math.random()<P.lit*.5){
      g.fillStyle=`rgba(255,206,146,${rnd(.45,1)})`;
      g.fillRect(x,y,4,5);
    }
  return tex(c);
}
