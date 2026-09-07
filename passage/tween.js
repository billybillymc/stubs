/* The clock the choreography runs on.
   Part of The Passage — see ui-passage-pull.html. */

/* ================================================================
   TWEENS
================================================================ */
export const EASE={linear:t=>t,in:t=>t*t*t,out:t=>1-Math.pow(1-t,3),
  inOut:t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2,
  settle:t=>t<.78?(t/.78)*(t/.78):1-.1*Math.sin(((t-.78)/.22)*Math.PI)*(1-(t-.78)/.22)};
export const _tw=new Set();
export function tween({dur=.5,delay=0,ease='inOut',tag='',update,done}){
  const fn=typeof ease==='function'?ease:(EASE[ease]||EASE.inOut);
  const o={t:-delay,dur,fn,update,done,tag,dead:false};
  o.promise=new Promise(r=>o._r=r); _tw.add(o); return o.promise;
}
export function stepTweens(dt){
  for(const o of [..._tw]){
    if(o.dead){_tw.delete(o);continue;}
    o.t+=dt; if(o.t<0) continue;
    const k=Math.min(1,o.t/Math.max(1e-5,o.dur));
    o.update&&o.update(o.fn(k),k);
    if(k>=1){_tw.delete(o); o.done&&o.done(); o._r(true);}
  }
}
export const killTweens=tag=>{for(const o of _tw) if(o.tag===tag){o.dead=true;o._r(false);}};
export const wait=(s,tag='')=>tween({dur:s,tag});
