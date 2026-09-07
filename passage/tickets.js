/* The collection itself, in the order the nights happened.
   Part of The Passage — see ui-passage-pull.html. */


/* ================================================================
   DATA
================================================================ */
/* Corrections typed at the caption desk (captions.html) are held in
   this browser until they are exported back into data.js, and are laid
   over the collection here so a fix shows in the rooms straight away
   rather than only after the file has been replaced. data.js stays the
   transcription of record either way. */
const FIXES=(()=>{
  try{ return JSON.parse(localStorage.getItem('passagepull.edits')||'{}')||{}; }
  catch(_){ return {}; }
})();
export const TICKETS=(window.TICKETS||[]).slice()
  .map(t=>{
    const e=FIXES[String(t.id!=null?t.id:t.file)];
    if(!e) return t;
    const o=Object.assign({},t);
    for(const k of ['aud','showtime','price'])
      if(e[k]!=null) o[k]=e[k]===''?null:e[k];
    return o;
  })
  .sort((a,b)=>String(a.date||'9999').localeCompare(String(b.date||'9999')));
export const N=TICKETS.length;
export const MONTHS=['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
export const DAYS=['SUN','MON','TUE','WED','THU','FRI','SAT'];
export const lerp=(a,b,t)=>a+(b-a)*t;
export const rnd=(a,b)=>a+Math.random()*(b-a);
export function fmtDate(d){
  if(!d) return '';
  const t=new Date(d+'T12:00:00');
  if(isNaN(t)) return d;
  return `${DAYS[t.getDay()]} ${MONTHS[t.getMonth()]} ${t.getDate()} ${t.getFullYear()}`;
}

/* the scans live on their own layer so the lens leaves them alone */
export const TICKET_LAYER=1;
