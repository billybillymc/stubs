/* Canvas textures: every surface arrives pre-shadowed and pre-worn.
   Part of The Passage — see ui-passage-pull.html. */
import * as THREE from 'three';
import {TICKET_LAYER,rnd} from './tickets.js';
import {MAXA,canvas} from './stage.js';

/* ================================================================
   TEXTURES — every surface arrives pre-shadowed and pre-worn.
   Painted AO at the corners, low-alpha blotching, and per-instance
   UV offsets so nothing tiles the same way twice.
================================================================ */
export const cv=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c;};
export function tex(c,rx=1,ry=1){
  const t=new THREE.CanvasTexture(c);
  t.colorSpace=THREE.SRGBColorSpace;
  t.wrapS=t.wrapT=THREE.RepeatWrapping; t.repeat.set(rx,ry);
  return t;
}
/* painted ambient occlusion — darker where surfaces will meet */
/* Painted-in occlusion. Deliberately lighter than it used to be: with
   an environment map the shading itself now darkens these corners, and
   the old .42/.34 stacked on top of that went muddy. */
export function paintAO(g,w,h,top=.25,bot=.20,col='58,48,40'){
  const a=g.createLinearGradient(0,0,0,h*.22);
  a.addColorStop(0,`rgba(${col},${top})`); a.addColorStop(1,`rgba(${col},0)`);
  g.fillStyle=a; g.fillRect(0,0,w,h*.22);
  const b=g.createLinearGradient(0,h*.78,0,h);
  b.addColorStop(0,`rgba(${col},0)`); b.addColorStop(1,`rgba(${col},${bot})`);
  g.fillStyle=b; g.fillRect(0,h*.78,w,h*.22);
}
export function blotch(g,w,h,n,col='58,48,40',amax=.07){
  for(let i=0;i<n;i++){
    const x=Math.random()*w,y=Math.random()*h,r=rnd(w*.03,w*.18);
    const rg=g.createRadialGradient(x,y,0,x,y,r);
    rg.addColorStop(0,`rgba(${col},${Math.random()*amax})`);
    rg.addColorStop(1,`rgba(${col},0)`);
    g.fillStyle=rg; g.fillRect(x-r,y-r,r*2,r*2);
  }
}
export function stuccoTex(base='#8d7c66',ao=true){
  const c=cv(64,96),g=c.getContext('2d');
  g.fillStyle=base; g.fillRect(0,0,64,96);
  blotch(g,64,96,60);
  if(ao) paintAO(g,64,96);
  return tex(c);
}
export function carpetTex(){
  const c=cv(256,256),g=c.getContext('2d');
  g.fillStyle='#2a1430'; g.fillRect(0,0,256,256);
  const pal=['#a8324f','#c9506b','#6d2a7a','#8e3b93'];
  for(let i=0;i<46;i++){                       // wobbly closed cells, one net
    const x=Math.random()*256,y=Math.random()*256,r=rnd(14,40);
    g.beginPath();
    for(let a=0;a<=Math.PI*2+.1;a+=Math.PI/7){
      const rr=r*(0.72+Math.random()*0.5);
      const px=x+Math.cos(a)*rr, py=y+Math.sin(a)*rr;
      a?g.lineTo(px,py):g.moveTo(px,py);
    }
    g.closePath(); g.strokeStyle=pal[i%pal.length]; g.lineWidth=rnd(2,5);
    g.globalAlpha=rnd(.35,.8); g.stroke();
  }
  g.globalAlpha=1; blotch(g,256,256,40,'20,8,26',.12);
  return tex(c);
}

/* ----------------------------------------------------------------
   RELIEF
   A colour map alone leaves a surface perfectly flat under a moving
   light, which is most of why painted "wood" reads as printed paper.
   Sobel the luminance of a canvas we already drew and use it as a
   normal map: the grain then catches light at grazing angles the way
   grain does. Costs one pass over a small canvas, no new art.
---------------------------------------------------------------- */
export function normalFrom(src,strength=5){
  const w=src.width,h=src.height;
  const sd=src.getContext('2d').getImageData(0,0,w,h).data;
  const out=cv(w,h),og=out.getContext('2d'),im=og.createImageData(w,h);
  const L=(x,y)=>{x=(x+w)%w;y=(y+h)%h;const i=(y*w+x)*4;
    return (sd[i]*.299+sd[i+1]*.587+sd[i+2]*.114)/255;};
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){
    const dx=(L(x+1,y)-L(x-1,y))*strength, dy=(L(x,y+1)-L(x-1,y+1))*strength;
    let nx=-dx,ny=-dy,nz=1; const l=Math.hypot(nx,ny,nz);
    const i=(y*w+x)*4;
    im.data[i]=(nx/l*.5+.5)*255; im.data[i+1]=(ny/l*.5+.5)*255;
    im.data[i+2]=(nz/l*.5+.5)*255; im.data[i+3]=255;
  }
  og.putImageData(im,0,0); return out;
}
/* real timber: grain in the colour, the same grain in the relief, and
   roughness low enough that a varnished frame catches the marquee */
export function timber(base='#6b4526',rx=1,ry=1,rough=.54){
  const c=cv(128,128),g=c.getContext('2d');
  g.fillStyle=base; g.fillRect(0,0,128,128);
  for(let i=0;i<34;i++){
    g.strokeStyle=`rgba(40,24,12,${rnd(.05,.2)})`; g.lineWidth=rnd(.6,2.4);
    const y=Math.random()*128; g.beginPath(); g.moveTo(0,y);
    for(let x=0;x<=128;x+=16) g.lineTo(x,y+Math.sin(x*.08+i)*rnd(1,4));
    g.stroke();
  }
  blotch(g,128,128,26,'30,18,8',.1);
  const map=tex(c,rx,ry);
  const nrm=new THREE.CanvasTexture(normalFrom(c,4));
  nrm.wrapS=nrm.wrapT=THREE.RepeatWrapping; nrm.repeat.set(rx,ry);
  map.anisotropy=nrm.anisotropy=MAXA;
  return new THREE.MeshStandardMaterial(
    {map,normalMap:nrm,normalScale:new THREE.Vector2(.8,.8),
     roughness:rough,metalness:0});
}
export function woodTex(base='#6b4526'){
  const c=cv(128,128),g=c.getContext('2d');
  g.fillStyle=base; g.fillRect(0,0,128,128);
  for(let i=0;i<34;i++){                        // grain
    g.strokeStyle=`rgba(40,24,12,${rnd(.05,.2)})`; g.lineWidth=rnd(.6,2.4);
    const y=Math.random()*128; g.beginPath(); g.moveTo(0,y);
    for(let x=0;x<=128;x+=16) g.lineTo(x,y+Math.sin(x*.08+i)*rnd(1,4));
    g.stroke();
  }
  blotch(g,128,128,26,'30,18,8',.1);
  return tex(c);
}
export function concreteTex(){
  const c=cv(128,128),g=c.getContext('2d');
  g.fillStyle='#4a463f'; g.fillRect(0,0,128,128);
  blotch(g,128,128,54,'20,18,16',.13);
  for(let i=0;i<5;i++){                          // slab joints
    g.strokeStyle='rgba(20,18,16,.5)'; g.lineWidth=1.4;
    const y=i*26+8; g.beginPath(); g.moveTo(0,y); g.lineTo(128,y); g.stroke();
  }
  return tex(c);
}
export function plasterTex(base='#b6a68e'){
  const c=cv(96,96),g=c.getContext('2d');
  g.fillStyle=base; g.fillRect(0,0,96,96);
  blotch(g,96,96,50,'70,58,44',.06);
  paintAO(g,96,96,.34,.28,'70,58,44');
  return tex(c);
}
/* per-instance copy so no two surfaces tile alike */
export function uniq(t,rx,ry){
  const c=t.clone(); c.needsUpdate=true;
  c.wrapS=c.wrapT=THREE.RepeatWrapping;
  if(rx) c.repeat.set(rx,ry);
  c.offset.set(Math.random(),Math.random());
  return c;
}

/* ================================================================
   THE STUB
================================================================ */
export function fitH(tw,th,maxH,maxW){
  const a=Math.max(.3,Math.min(1.4,(tw||1000)/(th||1600)));
  return (maxH*a>maxW)?maxW/a:maxH;
}
export let BACKTEX=null;
export function backTex(){
  if(!BACKTEX){
    const c=cv(256,416),g=c.getContext('2d');
    g.fillStyle='#e6dabd'; g.fillRect(0,0,256,416);
    blotch(g,256,416,22,'120,96,60',.09);
    g.strokeStyle='rgba(90,70,40,.32)'; g.lineWidth=2; g.strokeRect(10,10,236,396);
    g.save(); g.translate(128,208); g.rotate(-Math.PI/2);
    g.fillStyle='rgba(90,70,40,.34)'; g.font='700 34px "Space Mono",monospace';
    g.textAlign='center'; g.fillText('ADMIT ONE',0,-24);
    g.restore();
    BACKTEX=new THREE.CanvasTexture(c); BACKTEX.colorSpace=THREE.SRGBColorSpace;
  }
  return BACKTEX;
}
export function makeStub(map,tw,th,H,bow=.02){
  const W=H*Math.max(.3,Math.min(1.4,(tw||1000)/(th||1600)));
  const geo=new THREE.PlaneGeometry(W,H,10,14);
  const p=geo.attributes.position;
  for(let i=0;i<p.count;i++) p.setZ(i,bow*Math.cos((p.getX(i)/W)*Math.PI));
  geo.computeVertexNormals();
  const front=new THREE.Mesh(geo,new THREE.MeshStandardMaterial(
    {map,roughness:.88,metalness:0}));
  const back=new THREE.Mesh(geo,new THREE.MeshStandardMaterial(
    {map:backTex(),side:THREE.BackSide,roughness:.9,metalness:0}));
  back.position.z=-.002;
  front.layers.set(TICKET_LAYER); back.layers.set(TICKET_LAYER);
  const g=new THREE.Group(); g.add(front,back);
  g.userData={W,H,front};
  return g;
}
