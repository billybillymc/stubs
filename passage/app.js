/* The one piece of state every room reads.
   Part of The Passage — see ui-passage-pull.html. */
import * as THREE from 'three';
import {N} from './tickets.js';

/* ================================================================
   THE FLOW
================================================================ */
export const $=s=>document.querySelector(s);
/* ?reset starts the collection over from ticket 1 — the param is
   dropped from the address at once so a reload does not reset again */
if(new URLSearchParams(location.search).has('reset')){
  localStorage.removeItem('passagepull.idx');
  history.replaceState(null,'',location.pathname);
}
export const app={
  idx:Math.min(N-1,Math.max(0,parseInt(localStorage.getItem('passagepull.idx')||'0',10)||0)),
  act:0, busy:false, px:0, py:0, clock:new THREE.Clock(), acts:[],
  /* no hud() here: the tally and the card belong to the room you are
     walking INTO. Repainting them the instant the stub goes in the
     binder put the next night's title on the wall of the last one —
     the card is refreshed by useAct, behind the fade. */
  setIdx(i){ this.idx=(i%N+N)%N; localStorage.setItem('passagepull.idx',String(this.idx)); }
};
