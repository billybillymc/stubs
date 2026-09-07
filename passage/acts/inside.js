/* ACT II — the door of the auditorium.
   Part of The Passage — see ui-passage-pull.html. */
import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {SFX} from '../../sfx.js';
import {createDoubleFireDoorSetModel} from '../../door-set.js';
import {TICKETS,lerp} from '../tickets.js';
import {killTweens,tween,wait} from '../tween.js';
import {carpetTex,cv,fitH,makeStub,plasterTex,stuccoTex,uniq} from '../tex.js';
import {contact,matte,pool,satin,scallop,unlit,thin} from '../mats.js';
import {getTex} from '../posters.js';
import {MAXA,envMap} from '../stage.js';
import {ledRow} from '../type.js';
import {$,app} from '../app.js';

/* ================================================================
   ACT II — THE DOOR OF THE AUDITORIUM
   Inside the multiplex now: carpet, can lights, and the little lit
   sign over the doorway of the screen this ticket belongs to.
================================================================ */
export class Corridor{
  constructor(){
    this.name='INSIDE'; this.sub='THE DOOR OF THE SCREEN';
    this.run=0; this.busy=false;
    const sc=this.scene=new THREE.Scene();
    const HAZE=0x8d8072;                      /* fades to light, never black */
    sc.background=new THREE.Color(HAZE);
    sc.fog=new THREE.Fog(HAZE,16,74);
    /* corridor: hot ceiling coves, magenta bounce back up off carpet */
    sc.environment=envMap('#cbbda2','#8d8072','#3a1f38',[
      {x:128,y:18,r:96,c:'rgba(255,236,205,.75)'},   /* the lit ceiling */
      {x:128,y:60,r:46,c:'rgba(69,232,242,.30)'},    /* aqua off the doors */
    ]);
    sc.environmentIntensity=.38;
    this.camera=new THREE.PerspectiveCamera(46,1,.1,140);
    this.camHome=new THREE.Vector3(0,1.62,5.4);
    this.camLook=new THREE.Vector3(0,1.62,-3);

    /* cool sky, magenta bounce up off the carpet */
    sc.add(new THREE.HemisphereLight(0xc8ccd4,0x4a2648,1.0));

    const L=44,W=7.4,H=4.2;      /* was 3.5 — the entrance needed headroom */
    const carpet=new THREE.Mesh(new THREE.PlaneGeometry(W,L),
      matte({map:uniq(carpetTex(),3,16)}));
    carpet.rotation.x=-Math.PI/2; carpet.position.z=-L/2+8; sc.add(carpet);
    /* the lane everyone walked */
    const wearC=cv(64,64),wg=wearC.getContext('2d');
    const wgr=wg.createLinearGradient(0,0,64,0);
    wgr.addColorStop(0,'rgba(0,0,0,0)');wgr.addColorStop(.5,'rgba(0,0,0,.4)');
    wgr.addColorStop(1,'rgba(0,0,0,0)');
    wg.fillStyle=wgr; wg.fillRect(0,0,64,64);
    const wear=new THREE.Mesh(new THREE.PlaneGeometry(3.1,L),
      new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(wearC),transparent:true,
        opacity:.5,depthWrite:false}));
    wear.rotation.x=-Math.PI/2; wear.position.set(0,.014,-L/2+8); sc.add(wear);

    const ceil=new THREE.Mesh(new THREE.PlaneGeometry(W,L),matte({map:uniq(plasterTex('#7d7364'),3,14)}));
    ceil.rotation.x=Math.PI/2; ceil.position.set(0,H,-L/2+8); sc.add(ceil);

    for(const sx of [-1,1]){
      const wall=new THREE.Mesh(new THREE.PlaneGeometry(L,H),
        matte({map:uniq(stuccoTex('#94826a'),12,1)}));
      wall.rotation.y=-sx*Math.PI/2; wall.position.set(sx*W/2,H/2,-L/2+8); sc.add(wall);
      contact(sc,L,sx*(W/2-.55),-L/2+8,Math.PI/2,1.1);
      /* maroon header band + cornice, both bevelled so the edge catches light */
      const band=new THREE.Mesh(new RoundedBoxGeometry(L,.85,.28,2,.07),satin(0x8a3038,22));
      band.rotation.y=Math.PI/2; band.position.set(sx*(W/2-.15),3.26,-L/2+8); sc.add(band);
      const step=new THREE.Mesh(new RoundedBoxGeometry(L,.4,.5,2,.06),satin(0x2e6b68,18));
      step.rotation.y=Math.PI/2; step.position.set(sx*(W/2-.22),3.84,-L/2+8); sc.add(step);
      /* cans: white unlit discs that clip, with a scallop and every other a pool */
      for(let i=0;i<9;i++){
        const z=6-i*4.4;
        const can=new THREE.Mesh(new THREE.CircleGeometry(.16,10),unlit(0xfff4e2));
        can.rotation.x=Math.PI/2; can.position.set(sx*(W/2-.7),H-.02,z); sc.add(can);
        const pl=new THREE.PointLight(0xffe2b8,16,11,1.85);
        pl.position.set(sx*(W/2-.8),H-.4,z); sc.add(pl);
        scallop(sc,2.4,3.2,sx*(W/2-.06),H-1.5,z,-sx*Math.PI/2);
        if(i%2===0) pool(sc,3.6,sx*(W/2-1.5),z);
      }
    }
    /* the auditorium itself: doors, a lit header sign, aqua spill */
    const end=new THREE.Group(); end.position.set(0,0,-8.5); sc.add(end);
    const wall=new THREE.Mesh(new THREE.PlaneGeometry(W,H),
      matte({map:uniq(stuccoTex('#8a7864'),3,1)}));
    wall.position.set(0,H/2,0); end.add(wall);
    /* The way into the auditorium: the fire door set from
       C:/side/objects, bundled like the lamp and the cases. It is the
       whole assembly — both leaves, frame, vision panels, push bars and
       closers — so it replaces the two slabs and the brass rods that
       stood in for them. Measured and seated rather than positioned by
       hand: scaled to fit under the marquee, sat on the carpet by its
       own underside, centred by its own bounding box in case the
       model's origin is not its centre. */
    /* stripped of the practicals and Physical materials it shipped with */
    const doorProto=createDoubleFireDoorSetModel({
      castShadow:true,receiveShadow:true,
      textureSize:512,textureAnisotropy:MAXA,qualityPriority:'balanced'});
    thin(doorProto);
    end.add(doorProto);
    doorProto.updateMatrixWorld(true);
    /* Measure the FRAME, not the whole model. The set is authored
       standing on little display feet, so its bounding box starts 0.39
       below the frame — sizing by the box made the actual door a third
       shorter than asked, and seating by the box left the frame hovering
       off the carpet with the feet taking the weight. Both go away if we
       treat the perimeter frame as the door. */
    const frameBox=()=>{
      let b=null;
      doorProto.traverse(o=>{
        if(!o.isMesh||!/perimeter frame/i.test(o.name||'')) return;
        const fb=new THREE.Box3().setFromObject(o);
        b=b?b.union(fb):fb;
      });
      return b||new THREE.Box3().setFromObject(doorProto);
    };
    let fb=frameBox();
    doorProto.scale.setScalar(2.55/Math.max(.001,fb.max.y-fb.min.y));
    doorProto.updateMatrixWorld(true);
    fb=frameBox();
    const dW=fb.max.x-fb.min.x, dCx=(fb.max.x+fb.min.x)/2, dFloor=-fb.min.y;
    /* Two sets, not one. The model is a double door 0.67 as wide as it
       is tall — correct for the object, but one pair is a fire exit, not
       how four hundred people get into a screening. Hanging two pairs
       side by side gives the four-leaf entrance a house this size would
       actually have, and does it without stretching the model out of its
       own proportions. */
    [-dW/2,dW/2].forEach((x,i)=>{
      const g=i?doorProto.clone(true):doorProto;
      g.position.set(x-dCx,dFloor,.10);
      if(i) end.add(g);
      g.updateMatrixWorld(true);
    });
    contact(sc,4.6,0,-8.2,0,.95);   /* the four leaves span about 4.2 */
    /* the little sign that says which picture is behind this door */
    /* An LED board over the door — not the hand-set letterboard that was
       here. A house changes what is showing every week and a matrix sign
       is how that is done now; the canvas below draws it as red lamps on
       a grid, unlit ones included, because that dark grid between the
       lit dots is the whole reason an LED sign looks like an LED sign.
       3.6 x 0.62 plane, so the canvas is 5.8:1 to match. */
    this.signCv=cv(1160,200);
    this.signTex=new THREE.CanvasTexture(this.signCv);
    this.signTex.colorSpace=THREE.SRGBColorSpace;
    this.signTex.anisotropy=MAXA;
    const signBox=new THREE.Mesh(new RoundedBoxGeometry(3.86,.86,.22,2,.05),satin(0x15171a,20));
    signBox.position.set(0,3.06,.16); end.add(signBox);
    const sign=new THREE.Mesh(new THREE.PlaneGeometry(3.6,.62),
      new THREE.MeshBasicMaterial({map:this.signTex}));
    sign.position.set(0,3.06,.28); end.add(sign);
    /* the lamps are self-lit (Basic material), but a sign that bright
       also stains what is around it — a faint red kiss on the housing
       and the transom, kept well under the aqua so the room stays aqua */
    const signGlow=new THREE.PointLight(0xff2a14,4,4,2.0);
    signGlow.position.set(0,3.06,.6); end.add(signGlow);

    /* the auditorium number above it, and deliberately NOT an LED: the
       screen number never changes, so it is a fixed illuminated plaque */
    this.audCv=cv(320,320);
    this.audTex=new THREE.CanvasTexture(this.audCv);
    this.audTex.colorSpace=THREE.SRGBColorSpace;
    this.audTex.anisotropy=MAXA;
    const audBox=this.audBox=new THREE.Mesh(
      new RoundedBoxGeometry(.92,.92,.18,2,.05),satin(0x2a2320,18));
    audBox.position.set(0,3.86,.14); end.add(audBox);
    const audSign=this.audSign=new THREE.Mesh(new THREE.PlaneGeometry(.74,.74),
      new THREE.MeshBasicMaterial({map:this.audTex}));
    audSign.position.set(0,3.86,.24); end.add(audSign);

    const spill=new THREE.PointLight(0x45e8f2,14,7,1.9);
    /* up out of the doorway: the door head is at 2.55 now, and at 2.7
       this was burning a cyan hotspot across the transom */
    spill.position.set(0,3.05,.9); end.add(spill);
    scallop(sc,4.2,2.6,0,2.0,-8.2);

    this.stub=null;
  }
  drawSign(t){
    const W=580,H=100,g=this.signCv.getContext('2d');
    g.setTransform(2,0,0,2,0,0);
    g.fillStyle='#0a0b0e'; g.fillRect(0,0,W,H);

    const RED='#ff2d1a';   /* the stock one-colour matrix: red, always red */
    const info=(t.showtime||'').toUpperCase()
      .replace(/\s*[AP]\.?M\.?\s*$/,'').replace(/^0/,'').trim();
    const title=(t.title||t.title_raw||'').toUpperCase()
      .replace(/[^A-Z0-9 :\-'&.,!?()\/]/g,'');

    /* The lamps are a fixed grid, so the type has to be fitted in
       CHARACTERS, not in pixels: pick the pitch, then see how many
       glyphs fit the width. Two rows if the title will not go in one. */
    const timeW=info.length*6, gap=4;
    const fitAt=p=>Math.floor((W-24-(timeW+gap)*p)/(6*p));
    let pitch=3.4, lines=[title];
    const wrap=(txt,cap)=>{
      const words=txt.split(' '), out=[]; let cur='';
      for(const w of words){
        const test=cur?cur+' '+w:w;
        if(test.length>cap&&cur){ out.push(cur); cur=w; } else cur=test;
      }
      if(cur) out.push(cur);
      return out;
    };
    while(pitch>1.7){
      const cap=fitAt(pitch);
      if(cap>3){
        const l=wrap(title,cap);
        if(l.length<=2&&l.every(x=>x.length<=cap)){ lines=l; break; }
      }
      pitch-=.15;
    }
    const one=lines.length===1;
    const rowH=pitch*7, tops=one?[H/2-rowH/2]:[H/2-rowH-3,H/2+3];
    const tCx=(W-(timeW+gap)*pitch)/2+4;

    /* the dark lamps FIRST, under the copy. They used to be drawn last
       with destination-over, and since the panel behind them is opaque
       black that composite put every one of them behind it — the grid
       never showed and the sign read as plain glowing type. The grid
       covers the WHOLE panel, not just the rows in use — on the real
       thing every lamp is there whether tonight's title needs it or
       not, and that field of dead maroon dots is most of the look.
       Walked out from the top text row so grid and glyphs stay on the
       same lattice. */
    let yTop=tops[0]; while(yTop-pitch>5) yTop-=pitch;
    for(let y=yTop;y<H-5;y+=pitch){
      for(let x=10;x<W-8;x+=pitch){
        g.beginPath(); g.arc(x,y,pitch*.3,0,7);
        g.fillStyle='rgba(150,66,54,.30)'; g.fill();
      }
    }
    lines.forEach((ln,i)=>ledRow(g,ln,tCx,tops[i],pitch,RED));
    ledRow(g,info,W-14-timeW*pitch/2,H/2-rowH/2,pitch,RED);
    this.signTex.needsUpdate=true;

    /* THE SCREEN NUMBER: painted and lit, never a matrix — and only
       when the stub actually names a house. "Aud 3" and "Screen 2" do.
       "Seat J12" does not: those digits are where you sat, and putting
       them over the door hangs somebody's seat number on the
       auditorium. Twelve stubs in this collection name no house at all
       and one names a seat; for all thirteen the plaque comes off the
       wall, because a lit plaque reading "—" is a prop announcing that
       the archive has a hole in it. */
    const house=/^(aud|screen)/i.test(t.aud||'')
      ? String((t.aud.match(/\d+/)||[''])[0]||'') : '';
    if(this.audBox) this.audBox.visible=!!house;
    if(this.audSign) this.audSign.visible=!!house;
    if(!house) return;
    const S=160,a=this.audCv.getContext('2d');
    a.setTransform(2,0,0,2,0,0);
    const bg=a.createLinearGradient(0,0,0,S);
    bg.addColorStop(0,'#1a1512'); bg.addColorStop(1,'#0f0c0a');
    a.fillStyle=bg; a.fillRect(0,0,S,S);
    a.strokeStyle='rgba(226,196,140,.35)'; a.lineWidth=2;
    a.strokeRect(7,7,S-14,S-14);
    a.textAlign='center'; a.textBaseline='middle';
    a.fillStyle='rgba(226,196,140,.62)';
    a.font='600 15px "Space Mono",monospace';
    a.fillText('AUDITORIUM',S/2,S*.24);
    a.fillStyle='#ffe9c0'; a.shadowColor='#ffca7a'; a.shadowBlur=14;
    a.font='700 74px Oswald,"Arial Narrow",sans-serif';
    a.fillText(house,S/2,S*.60);
    a.shadowBlur=0;
    this.audTex.needsUpdate=true;
  }
  async enter(idx){
    this.busy=true; const run=++this.run;
    const t=TICKETS[idx];
    this.drawSign(t);
    const map=await getTex(t.file);
    if(run!==this.run||!map) return;
    if(this.stub) this.stub.removeFromParent();
    const H=fitH(t.w,t.h,.50,.42);
    const s=makeStub(map,t.w,t.h,H);
    this.stub=s; this.scene.add(s);
    s.position.set(1.30,1.52,1.95);
    s.rotation.set(-.04,0,.02);
    this.rest=s.position.clone();
    /* raise it into the light of the sign */
    const y0=s.position.y-.55, y1=s.position.y;
    s.position.y=y0;
    SFX.humStart(); SFX.whoosh(1,.16);
    await tween({dur:.8,ease:'out',tag:'cor',update:q=>{ s.position.y=lerp(y0,y1,q); }});
    this.busy=false;
  }
  /* THE PULL, act two: the stub lifts off the sign with the first
     inch of the drag, then rides the hand straight down into the
     pocket — toward the camera on the way, which is what makes it
     read as pocketed rather than dropped. */
  grab(){
    if(this.busy||!this.stub||!this.rest) return false;
    this.k=0; this.pulled=false; return true;
  }
  drag(k){
    const s=this.stub; if(!s||!this.rest) return;
    this.k=k;
    const g1=Math.min(1,k/.15);              /* off the sign */
    const g2=Math.max(0,(k-.15)/.85);        /* then down, into the pocket */
    if(!this.pulled&&g2>0){ this.pulled=true; SFX.slide(.26,.42); }
    s.position.x=this.rest.x-.05*g1+.12*g2;
    s.position.y=this.rest.y+.13*g1-2.5*g2;
    s.position.z=this.rest.z-.06*g1+.62*g2;
    s.rotation.x=-.04-.10*g1-.85*g2;
    s.rotation.z=.02*g1+.20*g2;
  }
  async release(done){
    const s=this.stub; if(!s) return;
    if(!done){
      const k0=this.k||0;
      this.busy=true;
      await tween({dur:.28,ease:'out',tag:'cor',update:q=>this.drag(k0*(1-q))});
      this.pulled=false;
      this.busy=false;
      return;
    }
    this.busy=true; const run=++this.run;
    this.drag(1);
    await wait(.34,'cor');
    if(run!==this.run) return;
    this.busy=false;
  }
  async perform(){
    if(!this.grab()) return;
    this.busy=true; const run=++this.run;
    SFX.whoosh(1,.15);
    await tween({dur:.8,ease:'inOut',tag:'cor',update:k=>this.drag(k)});
    if(run!==this.run) return;
    this.busy=false;
    await this.release(true);
  }
  exit(){
    this.run=(this.run||0)+1; killTweens('cor'); SFX.humStop();
    if(this.stub){this.stub.removeFromParent();this.stub=null;}
    this.busy=false;
  }
  update(dt,t){
    this.camera.position.copy(this.camHome);
    this.camera.position.x+=app.px*.2; this.camera.position.y-=app.py*.1;
    this.camera.lookAt(this.camLook);
  }
}
