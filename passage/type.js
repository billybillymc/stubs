/* Hand-set letters and the LED board.
   Part of The Passage — see ui-passage-pull.html. */
import {N} from './tickets.js';
import {$} from './app.js';

/* ================================================================
   HAND-SET LETTERS
   Marquee and house-sign copy is not printed — it is slotted into
   channels by hand, one capital at a time, and it never sits quite
   straight or evenly spaced. A clean centred fillText is exactly the
   thing that reads as "computer", so every row here is set character
   by character with a small deterministic wobble (same title always
   sets the same way), a shadow in its channel, and tight tracking.
================================================================ */
/* ----------------------------------------------------------------
   LED FONT
   A five-by-seven lamp font, the classic matrix-display glyph set:
   each character is five columns, each column a bitmask of seven rows
   with bit 0 at the top. Sampling a normal typeface onto a dot grid
   (which is what this used to do) gives uneven strokes and half-lit
   lamps, because the outline never lines up with the lamps. A real
   sign has no outline to line up — it has lamps that are on or off,
   and every stroke is exactly one lamp wide. That is the look.
---------------------------------------------------------------- */
export const LED5x7={
 ' ':[0,0,0,0,0],           '!':[0,0,0x5F,0,0],       '"':[0,7,0,7,0],
 "'":[0,5,3,0,0],           '(':[0,0x1C,0x22,0x41,0], ')':[0,0x41,0x22,0x1C,0],
 '*':[0x14,8,0x3E,8,0x14],  '+':[8,8,0x3E,8,8],       ',':[0,0x50,0x30,0,0],
 '-':[8,8,8,8,8],           '.':[0,0x60,0x60,0,0],    '/':[0x20,0x10,8,4,2],
 '0':[0x3E,0x51,0x49,0x45,0x3E], '1':[0,0x42,0x7F,0x40,0],
 '2':[0x42,0x61,0x51,0x49,0x46], '3':[0x21,0x41,0x45,0x4B,0x31],
 '4':[0x18,0x14,0x12,0x7F,0x10], '5':[0x27,0x45,0x45,0x45,0x39],
 '6':[0x3C,0x4A,0x49,0x49,0x30], '7':[1,0x71,9,5,3],
 '8':[0x36,0x49,0x49,0x49,0x36], '9':[6,0x49,0x49,0x29,0x1E],
 ':':[0,0x36,0x36,0,0],     ';':[0,0x56,0x36,0,0],    '?':[2,1,0x51,9,6],
 '&':[0x36,0x49,0x55,0x22,0x50], '#':[0x14,0x7F,0x14,0x7F,0x14],
 'A':[0x7E,0x11,0x11,0x11,0x7E], 'B':[0x7F,0x49,0x49,0x49,0x36],
 'C':[0x3E,0x41,0x41,0x41,0x22], 'D':[0x7F,0x41,0x41,0x22,0x1C],
 'E':[0x7F,0x49,0x49,0x49,0x41], 'F':[0x7F,9,9,9,1],
 'G':[0x3E,0x41,0x49,0x49,0x7A], 'H':[0x7F,8,8,8,0x7F],
 'I':[0,0x41,0x7F,0x41,0],  'J':[0x20,0x40,0x41,0x3F,1],
 'K':[0x7F,8,0x14,0x22,0x41], 'L':[0x7F,0x40,0x40,0x40,0x40],
 'M':[0x7F,2,0x0C,2,0x7F],  'N':[0x7F,4,8,0x10,0x7F],
 'O':[0x3E,0x41,0x41,0x41,0x3E], 'P':[0x7F,9,9,9,6],
 'Q':[0x3E,0x41,0x51,0x21,0x5E], 'R':[0x7F,9,0x19,0x29,0x46],
 'S':[0x46,0x49,0x49,0x49,0x31], 'T':[1,1,0x7F,1,1],
 'U':[0x3F,0x40,0x40,0x40,0x3F], 'V':[0x1F,0x20,0x40,0x20,0x1F],
 'W':[0x3F,0x40,0x38,0x40,0x3F], 'X':[0x63,0x14,8,0x14,0x63],
 'Y':[7,8,0x70,8,7],        'Z':[0x61,0x51,0x49,0x45,0x43],
};
/* one row of lamps. Returns the width it drew, so callers can centre. */
export function ledRow(g,text,cx,top,pitch,on){
  const adv=pitch*6, W=Math.max(0,text.length*adv-pitch);
  let x=cx-W/2;
  for(const ch of text){
    const cols=LED5x7[ch]||LED5x7['?'];
    for(let c=0;c<5;c++){
      for(let r=0;r<7;r++){
        if(!(cols[c]&(1<<r))) continue;
        const px=x+c*pitch, py=top+r*pitch;
        g.globalAlpha=.28; g.beginPath(); g.arc(px,py,pitch*.92,0,7);
        g.fillStyle=on; g.fill();                 /* the halo each lamp throws */
        g.globalAlpha=1;  g.beginPath(); g.arc(px,py,pitch*.36,0,7); g.fill();
      }
    }
    x+=adv;
  }
  return W;
}
export function jitAt(i,k){
  const s=Math.sin((i+1)*12.9898+k*78.233)*43758.5453;
  return (s-Math.floor(s))-.5;
}
/* The theater field is whatever was typed on the stub: store numbers,
   chain codes, brackets on either side. A sign carries the name of the
   house, so: drop the "#4401", and when the part outside the brackets
   is just a number ("350210 (CENTER VALLEY PA)") the useful name is
   the part inside them — but not the other way round, since
   "REGAL NORTHAMPTON (0371)" is a name followed by a code. */
export function houseName(t){
  let n=(t.theater||'').toUpperCase().replace(/#\s*\d+/g,' ').trim();
  const m=n.match(/^([^(]*)\(([^)]*)\)\s*$/);
  if(m){
    const out=m[1].trim(), inn=m[2].trim();
    n=(out.replace(/[^A-Z]/g,'').length>2)?out:inn;
  }
  return n.replace(/\s+/g,' ').trim();
}
export function letterFont(size){ return `700 ${size}px Oswald,"Arial Narrow",sans-serif`; }
export function rowWidth(g,text,size,track){
  g.font=letterFont(size);
  return [...text].reduce((a,c)=>a+g.measureText(c).width+track,0)-track;
}
export function setRow(g,text,o){
  if(!text) return;
  const track=o.track==null?3:o.track, wob=o.wob==null?1:o.wob;
  g.font=letterFont(o.size);
  g.textAlign='center'; g.textBaseline='alphabetic';
  const chars=[...text];
  const w=chars.map(c=>g.measureText(c).width+track);
  let x=o.cx-(w.reduce((a,b)=>a+b,0)-track)/2;
  chars.forEach((c,i)=>{
    if(c.trim()){
      g.save();
      g.translate(x+w[i]/2-track/2+jitAt(i,1)*2.2*wob, o.cy+jitAt(i,2)*3*wob);
      g.rotate(jitAt(i,3)*.03*wob);
      if(o.shadow){ g.fillStyle=o.shadow; g.fillText(c,1.6,2.6); }
      g.fillStyle=o.color;
      if(o.glow){ g.shadowColor=o.color; g.shadowBlur=o.glow; g.fillText(c,0,0); }
      g.fillText(c,0,0);
      g.restore();
    }
    x+=w[i];
  });
}
/* a title takes one row if it can, two if it must, broken at the
   space that leaves both rows nearest the same length */
export function fitRows(g,title,maxW,startSize,minSize,track){
  let size=startSize, lines=[title];
  const fits=()=>{
    if(rowWidth(g,title,size,track)<=maxW){ lines=[title]; return true; }
    const words=title.split(' ');
    if(words.length<2) return false;
    let best=null,bd=1e9;
    for(let i=1;i<words.length;i++){
      const a=words.slice(0,i).join(' '), b=words.slice(i).join(' ');
      const d=Math.abs(rowWidth(g,a,size,track)-rowWidth(g,b,size,track));
      if(d<bd){ bd=d; best=[a,b]; }
    }
    if(!best) return false;
    lines=best;
    return rowWidth(g,best[0],size,track)<=maxW && rowWidth(g,best[1],size,track)<=maxW;
  };
  while(size>minSize&&!fits()) size-=3;
  return {size,lines};
}
