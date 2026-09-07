/* ACT III — home, the binder on the desk.
   Part of The Passage — see ui-passage-pull.html. */
import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {SFX} from '../../sfx.js';
import {createSteampunkDeskLampModel} from '../../lamp-steampunk.js';
import {N,TICKETS,TICKET_LAYER,lerp,rnd} from '../tickets.js';
import {killTweens,tween,wait} from '../tween.js';
import {carpetTex,cv,makeStub,plasterTex,timber,uniq,woodTex} from '../tex.js';
import {SKY,bldgTex,nowDate,skyPhase,skyTex} from '../hour.js';
import {contact,matte,metal,satin,scallop,thin} from '../mats.js';
import {getTex} from '../posters.js';
import {MAXA,envMap} from '../stage.js';
import {jitAt} from '../type.js';
import {app} from '../app.js';
import {CAPS,say} from '../ui.js';
import {GRAB} from '../main.js';

/* ================================================================
   ACT III — HOME
   A bedroom, later. The stub goes into the sleeve for good.
================================================================ */
export class Bedroom{
  constructor(when){
    this.name='HOME'; this.sub='THE BINDER ON THE DESK';
    this.run=0; this.busy=false;
    const sc=this.scene=new THREE.Scene();
    /* the hour decides the room, once, when it is built — and the hour
       is the ticket's: showtime, the picture, and the drive home */
    this.when=when||nowDate();
    this.phase=skyPhase(this.when);
    const P=SKY[this.phase];
    const HAZE=P.haze;
    sc.background=new THREE.Color(HAZE);
    sc.fog=new THREE.Fog(HAZE,9,30);
    sc.environment=envMap(P.env[0],P.env[1],P.env[2],[
      {x:60, y:44,r:46,c:P.win},                     /* the window */
      {x:186,y:70,r:34,c:'rgba(168,226,255,.62)'},   /* the lamp, cyan */
    ]);
    sc.environmentIntensity=.40;
    this.camera=new THREE.PerspectiveCamera(41,1,.05,80);
    this.camHome=new THREE.Vector3(-.3,3.95,5.9);
    this.camLook=new THREE.Vector3(-.3,.5,-.5);

    /* whatever is coming in the window at this hour, plus bounce off the rug */
    sc.add(new THREE.HemisphereLight(0x6a7a9c,0x3a2438,P.hemi));
    /* No bounce fill here: the steampunk lamp ships its own practical
       at the bulb, and the desk spot is built with it further down. */
    const moon=new THREE.DirectionalLight(P.room.c,P.room.i);
    moon.position.set(-3.5,4,2.5); moon.castShadow=true;
    moon.shadow.mapSize.set(1024,1024);
    moon.shadow.camera.left=-4;moon.shadow.camera.right=4;
    moon.shadow.camera.top=4;moon.shadow.camera.bottom=-4;
    moon.shadow.bias=-.0006; sc.add(moon);
    const deskKey=new THREE.DirectionalLight(0xffe0b4,.62);
    deskKey.position.set(2,5,3); sc.add(deskKey);

    /* THE DESK
       It runs off both sides of the frame now. At 6.9 wide its right
       edge sat inside the shot, and the lamp's braided cable — which
       the model trails out to the right — stopped dead in the air
       about two thirds of a unit past that edge: a wire to nowhere.
       A wire needs somewhere to go, so the top is wide enough to carry
       it clear of the frame at any sane aspect. The grain repeat grows
       with it so the wood does not stretch. The legs stay where they
       were: they are the only part of the underside ever in shot. */
    const DESKW=18, DESKD=3.8, DESKY=.095;
    const top=new THREE.Mesh(new RoundedBoxGeometry(DESKW,.19,DESKD,2,.035),
      new THREE.MeshStandardMaterial({map:uniq(woodTex(),2.5*DESKW/6.9,1.3),
        roughness:.52,metalness:0}));
    top.receiveShadow=true; sc.add(top);
    for(const sx of [-3.05,3.05]) for(const sz of [-1.55,1.55]){
      const leg=new THREE.Mesh(new RoundedBoxGeometry(.22,2.4,.22,2,.03),
        matte({map:uniq(woodTex('#553a20'),1,2)}));
      leg.position.set(sx,-1.30,sz); sc.add(leg);
    }
    const floor=new THREE.Mesh(new THREE.PlaneGeometry(24,24),matte({map:uniq(carpetTex(),5,5)}));
    floor.rotation.x=-Math.PI/2; floor.position.y=-2.5; floor.receiveShadow=true; sc.add(floor);

    /* ---- the wall, with an actual opening in it -------------------
       Built as four panels around the window rather than one slab with
       a picture stuck on it. The old version had no hole at all: the
       "view" was a painted plane hung in front of solid plaster, which
       is why it slid rather than parallaxed and never looked outside. */
    const OW=2.2,OH=2.5,OX=-2.5,OY=2.5,WZ=-2.6;   /* opening */
    const L=OX-OW/2, R=OX+OW/2, B=OY-OH/2, T=OY+OH/2;   /* opening edges */
    const panel=(x0,x1,y0,y1)=>{                        /* wall between bounds */
      const w=x1-x0,h=y1-y0;
      const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),
        matte({map:uniq(plasterTex('#5e5a6b'),w*.25,h*.25)}));
      m.position.set((x0+x1)/2,(y0+y1)/2,WZ); sc.add(m);
    };
    panel(-10, L,  -2.6, 9.4);                          /* left of it  */
    panel(  R, 10, -2.6, 9.4);                          /* right of it */
    panel(  L, R,     T, 9.4);                          /* over it     */
    panel(  L, R,  -2.6,   B);                          /* under it    */

    /* casing, a mullion, and a sill that catches the lamp */
    const cas=satin(0x2b2f3c,22);
    const bar=(w,h,d,x,y,z)=>{
      const m=new THREE.Mesh(new RoundedBoxGeometry(w,h,d,2,.02),cas);
      m.position.set(x,y,z); m.castShadow=true; sc.add(m); return m;
    };
    bar(.14,OH+.28,.20,OX-OW/2,OY,WZ+.08);
    bar(.14,OH+.28,.20,OX+OW/2,OY,WZ+.08);
    bar(OW+.28,.14,.20,OX,OY+OH/2,WZ+.08);
    bar(OW+.28,.16,.20,OX,OY-OH/2,WZ+.08);
    bar(OW,.07,.12,OX,OY,WZ+.06);                      /* mullion */
    bar(.07,OH,.12,OX,OY,WZ+.06);
    const sill=new THREE.Mesh(new RoundedBoxGeometry(OW+.46,.10,.34,2,.03),cas);
    sill.position.set(OX,OY-OH/2-.10,WZ+.15); sill.castShadow=true; sc.add(sill);

    /* the glass: nearly invisible, but it takes the environment, which
       is the only reason a pane ever reads as glass at all */
    const glass=new THREE.Mesh(new THREE.PlaneGeometry(OW,OH),
      new THREE.MeshPhysicalMaterial({color:0xdfeaff,roughness:.05,metalness:0,
        transparent:true,opacity:.10,envMapIntensity:1.8,
        clearcoat:1,clearcoatRoughness:.03}));
    glass.position.set(OX,OY,WZ+.05); glass.renderOrder=4; sc.add(glass);

    /* ---- and what is actually out there ---------------------------
       Real blocks at real distances, so the view has true perspective
       and shifts with the camera. The room's own fog stops at 30 units,
       which does the distance haze for free. The sky is left painted:
       it really is far away and flat, and fog:false keeps the gradient
       from being washed to a single tone. */
    const sky=new THREE.Mesh(new THREE.PlaneGeometry(120,70),
      new THREE.MeshBasicMaterial({map:skyTex(this.phase),fog:false}));
    sky.position.set(-9,6,-34); sc.add(sky);
    /* The room's fog runs 9 to 30 units because that is a bedroom. Left
       switched on it turned the entire skyline into one flat grey card,
       so everything outside opts out of it (fog:false) and fades toward
       the horizon colour by its own distance instead. That is what
       atmospheric perspective actually is, and doing it by hand means
       the near blocks stay legible while the far ones dissolve. */
    const street=new THREE.Mesh(new THREE.PlaneGeometry(90,60),
      new THREE.MeshStandardMaterial({color:new THREE.Color(P.hor).multiplyScalar(.5),
        roughness:1,metalness:0,fog:false}));
    street.rotation.x=-Math.PI/2; street.position.set(-9,-7,-16); sc.add(street);

    const bmap=bldgTex(this.phase), horC=new THREE.Color(P.hor), cityC=new THREE.Color(P.city);
    for(let i=0;i<26;i++){
      const bw=rnd(2.2,5.4),bd=rnd(2.2,5),bh=rnd(6,17);
      const at=new THREE.Vector3(-18+Math.random()*21,-7+bh/2,-9-Math.random()*16);
      const t=Math.min(1,Math.max(0,(at.distanceTo(this.camHome)-10)/26));
      /* the window grid has to be sized to the block, not stretched over
         it — one tile across a whole facade makes each lit window a
         storey tall, which is what it was doing */
      const b=new THREE.Mesh(new THREE.BoxGeometry(bw,bh,bd),
        new THREE.MeshStandardMaterial({
          color:cityC.clone().lerp(horC,.08+t*.66),roughness:.95,metalness:0,
          emissive:0xffffff,emissiveMap:uniq(bmap,bw/4.5,bh/4.5),
          emissiveIntensity:P.lit>.12?1.25*(1-t*.4):0,fog:false}));
      b.position.copy(at); sc.add(b);
    }
    scallop(sc,3.6,3,1.5,2.4,-2.45);

    /* the wall above the desk stays bare of posters — this room is where
       the collection lives, not another place to advertise the picture.
       It gets a clock instead, hung where the lamp's spill reaches so
       it is actually readable in a dark room. It keeps the machine's
       own time and it is the same clock that decides the window. */
    this.clockCv=cv(512,512);          /* 2x pixels for a face 2.5x larger */
    this.clockTex=new THREE.CanvasTexture(this.clockCv);
    this.clockTex.colorSpace=THREE.SRGBColorSpace; this.clockTex.anisotropy=MAXA;
    /* low and to the right on purpose: this camera only frames the wall
       up to about y=2.9, which is why the posters that used to hang at
       3.1 were never once visible either */
    const clockAt=new THREE.Vector3(1.95,1.62,-2.52);
    const dial=new THREE.Mesh(new THREE.CircleGeometry(.825,64),
      new THREE.MeshStandardMaterial({map:this.clockTex,roughness:.5,metalness:0}));
    dial.position.copy(clockAt); sc.add(dial);
    const rim=new THREE.Mesh(new THREE.TorusGeometry(.862,.095,14,64),
      timber('#59381f',6,1,.5));
    rim.position.copy(clockAt); rim.position.z-=.012; sc.add(rim);
    this.drawClock();


    /* ---------------------------------------------------------------
       THE DESK LAMP
       Not built here any more. This is the steampunk anglepoise from
       C:/side/objects, bundled out of its TypeScript source into
       lamp-steampunk.js with `three` left external so it resolves on
       this page's importmap. It arrives at its own scale and origin, so
       it is measured, scaled to the height the old lamp occupied, and
       stood on the desk rather than positioned by guessed numbers.
       It brings its own cyan practical at the bulb.
    --------------------------------------------------------------- */
    const aimAt=new THREE.Vector3(.30,.15,.12);      /* the page it lights */
    const deskLamp=createSteampunkDeskLampModel({
      castShadow:true,receiveShadow:true,
      textureSize:512,textureAnisotropy:MAXA,qualityPriority:'balanced'});
    /* Materials only: the lamp's own practical is the cyan in the
       cage, and the code below finds the bulb by looking for exactly
       that light in order to aim the whole lamp at the page. Drop it
       and the lamp goes out AND points at the wall. */
    thin(deskLamp,{lights:false});
    sc.add(deskLamp);
    /* measure it unrotated at the origin: scale to the height the old
       lamp occupied, then seat it on the desk's top face */
    deskLamp.updateMatrixWorld(true);
    const raw=new THREE.Box3().setFromObject(deskLamp);
    deskLamp.scale.setScalar(2.88/Math.max(.001,raw.max.y-raw.min.y));   /* +15% */
    deskLamp.updateMatrixWorld(true);
    const seated=new THREE.Box3().setFromObject(deskLamp);
    /* Seat it on its own foot, not on its bounding box. The model
       carries a braided cable that droops below the base, so sitting the
       box on the desk hoisted the whole lamp until the CABLE met the
       wood and left the base hanging in the air. */
    let footY=null;
    deskLamp.traverse(o=>{
      if(!o.isMesh||!/iron tiered base/i.test(o.name||'')) return;
      const fb=new THREE.Box3().setFromObject(o);
      footY=(footY===null)?fb.min.y:Math.min(footY,fb.min.y);
    });
    if(footY===null) footY=seated.min.y;          /* fall back to the box */
    /* forward off the back edge to the middle of the top: the desk runs
       z -1.9 to 1.9, so -0.95 had it sitting halfway to the wall */
    const stand=new THREE.Vector3(2.15,.095-footY,-.15);  /* Y-rotation invariant */

    /* Where the head points is a property of the model, not something to
       guess at — the first attempt had it lighting the wall. Find the
       bulb the model carries, take the direction from the lamp's own
       origin out to it, and turn the whole lamp until that direction
       lies along the line to the page. */
    let bulbLocal=null;
    deskLamp.traverse(o=>{ if(!bulbLocal&&o.isPointLight) bulbLocal=o.getWorldPosition(new THREE.Vector3()); });
    if(bulbLocal){
      deskLamp.rotation.y=Math.atan2(aimAt.x-stand.x,aimAt.z-stand.z)
                         -Math.atan2(bulbLocal.x,bulbLocal.z);
    }
    deskLamp.position.copy(stand);
    deskLamp.updateMatrixWorld(true);

    /* ---------------------------------------------------------------
       THE RUN OF THE CABLE
       The model's braid ends in mid-air. Rather than guess where, the
       end is measured: the ring of vertices with the greatest world x
       gives both the exact point the tube stops and the radius it
       stops at. The run continues from there in the model's own braid
       material, at that radius, settling onto the wood and leaving the
       frame. Nothing terminates on screen.
    --------------------------------------------------------------- */
    let cableMesh=null;
    deskLamp.traverse(o=>{ if(!cableMesh&&o.isMesh&&/cable/i.test(o.name||'')) cableMesh=o; });
    if(cableMesh){
      cableMesh.updateMatrixWorld(true);
      const cp=cableMesh.geometry.attributes.position, cv=new THREE.Vector3();
      const pts=[]; let maxx=-1e9;
      for(let i=0;i<cp.count;i++){
        cv.fromBufferAttribute(cp,i).applyMatrix4(cableMesh.matrixWorld);
        pts.push(cv.clone()); if(cv.x>maxx) maxx=cv.x;
      }
      const ring=pts.filter(q=>q.x>maxx-.06);
      if(ring.length>2){
        const end=ring.reduce((a,q)=>a.add(q),new THREE.Vector3())
                      .multiplyScalar(1/ring.length);
        const rad=ring.reduce((m,q)=>Math.max(m,q.distanceTo(end)),0)||.027;
        const lie=DESKY+rad;                    /* where it rests on the wood */
        const run=new THREE.CatmullRomCurve3([
          end.clone(),
          new THREE.Vector3(end.x+1.15, Math.max(lie,end.y-.004), end.z+.06),
          new THREE.Vector3(end.x+3.60, lie,                      end.z+.17),
          new THREE.Vector3(DESKW/2+.6, lie,                      end.z+.24),
        ]);
        const wire=new THREE.Mesh(new THREE.TubeGeometry(run,44,rad,10,false),
          cableMesh.material);
        wire.castShadow=true; wire.receiveShadow=true;
        sc.add(wire);
      }
    }

    /* The model was lit for a studio look-dev render at exposure 1.0.
       Dropped into a dark bedroom that also puts a spot on the page, its
       practical and its glow tube double up and blow the cage out to a
       white blob. Ease both back so the cage reads again — the cyan is
       the lamp's whole character, so it is dimmed, not removed. */
    deskLamp.traverse(o=>{
      if(o.isPointLight) o.intensity*=.42;
      const m=o.material;
      if(m&&m.emissiveIntensity) m.emissiveIntensity*=.55;
    });

    let bulbAt=null;
    deskLamp.traverse(o=>{ if(!bulbAt&&o.isPointLight) bulbAt=o.getWorldPosition(new THREE.Vector3()); });
    if(!bulbAt) bulbAt=new THREE.Vector3(1.15,1.45,-.30);

    /* tinted to the bulb it is supposedly coming from, not to the warm
       lamp that used to be here — this one glows cyan */
    /* The head rose with the lamp, but moving the lamp forward to the
       middle of the desk brought it back toward the page, so the throw
       barely changed. Scaling intensity by the height alone blew the
       page to white. */
    const spot=new THREE.SpotLight(0xbfe4ff,19,9.5,.88,.9,1.5);
    spot.position.copy(bulbAt);
    spot.target.position.copy(aimAt);
    spot.castShadow=true; spot.shadow.mapSize.set(1024,1024);
    spot.shadow.bias=-.0009; spot.shadow.camera.near=.2; spot.shadow.camera.far=9;
    sc.add(spot); sc.add(spot.target);
    /* No fake pool sprite here any more. It was buried inside the desk
       slab at y=.022 (the top face is at .08) so it never showed, and
       once raised it simply doubled the real spot and blew the page to
       white. A lamp that actually casts does not need a painted one. */

    /* the binder, open on the desk */
    this.PW=.62;this.PH=.92;this.GAP=.05;
    const pageW=3*this.PW+4*this.GAP, pageH=3*this.PH+4*this.GAP;
    this.hingeX=-pageW/2-.12;
    const binder=this.binder=new THREE.Group();
    binder.rotation.x=-1.16; binder.position.set(-.2,.62,.15);
    binder.scale.setScalar(.82); sc.add(binder);
    const leather=new THREE.MeshStandardMaterial({color:0x4b1a1f,roughness:.66,metalness:0});
    const cR=new THREE.Mesh(new RoundedBoxGeometry(pageW+.6,pageH+.4,.1,3,.045),leather);
    cR.position.z=-.09; cR.castShadow=true; binder.add(cR);
    const cL=cR.clone(); cL.position.set(2*this.hingeX-.18,0,-.09); binder.add(cL);
    const spine=new THREE.Mesh(new RoundedBoxGeometry(.5,pageH+.4,.08,3,.03),leather);
    spine.position.set(this.hingeX-.09,0,-.1); binder.add(spine);
    for(const ry of [-1,0,1]){
      const ring=new THREE.Mesh(new THREE.TorusGeometry(.085,.014,8,20),metal(0xcfc4ae,.22));
      ring.rotation.x=Math.PI/2; ring.position.set(this.hingeX,ry*pageH*.36,0); binder.add(ring);
    }
    contact(sc,3.4,-.35,.35,0,2.2);
    this.page=null;
  }
  slotPos(s){return{x:((s%3)-1)*(this.PW+this.GAP),y:(1-Math.floor(s/3))*(this.PH+this.GAP)};}
  /* the sheets already turned, piling up on the left board. Their edges
     are offset a hair so the stack reads as depth rather than one sheet */
  mkStack(n){
    const g=new THREE.Group(); this.binder.add(g);
    g.position.set(2*this.hingeX,0,-.006);
    const pageW=3*this.PW+4*this.GAP, pageH=3*this.PH+4*this.GAP;
    for(let i=0;i<Math.min(n,9);i++){
      const sh=new THREE.Mesh(new THREE.PlaneGeometry(pageW,pageH),
        matte({color:i%2?0xe4dac4:0xeae1cd,side:THREE.DoubleSide}));
      sh.position.set(jitAt(i,1)*.012-.004*i, jitAt(i,2)*.012, -.005*(i+1));
      sh.rotation.z=jitAt(i,3)*.006;
      g.add(sh);
    }
    return g;
  }
  mkPage(left){
    const g=new THREE.Group(); this.binder.add(g);
    if(left) g.position.x=2*this.hingeX;   /* mirrored across the rings */
    const pageW=3*this.PW+4*this.GAP, pageH=3*this.PH+4*this.GAP;
    const sheet=new THREE.Mesh(new THREE.PlaneGeometry(pageW,pageH),
      matte({color:0xe9e0cc,side:THREE.DoubleSide}));
    g.add(sheet);
    /* the glossy pockets only on the working leaf: a turned page has
       its sleeves facing the board, so from this side there is no film
       to catch the light — just paper */
    if(!left){
      const film=new THREE.MeshPhysicalMaterial({color:0xffffff,transparent:true,opacity:.12,
        roughness:.06,clearcoat:1,side:THREE.DoubleSide,depthWrite:false});
      for(let s=0;s<9;s++){
        const {x,y}=this.slotPos(s);
        const f=new THREE.Mesh(new THREE.PlaneGeometry(this.PW,this.PH),film);
        f.position.set(x,y,.02); f.renderOrder=3;
        /* the sleeve film rides the ticket layer so its sheen still lies
           over the unfiltered stubs */
        f.layers.set(TICKET_LAYER);
        g.add(f);
      }
    }
    return {group:g,slots:new Array(9).fill(null)};
  }
  /* ------------------------------------------------------------
     THE SPREAD. What the binder shows is a page number: that page's
     leaf on the right, the back of the page before it on the left,
     the older sheets piled beneath. enter() opens it to tonight;
     flip() walks it anywhere between the first page and tonight.
  ------------------------------------------------------------ */
  async showSpread(p){
    const run=this.run;
    this.view=p;
    if(this.page) this.page.group.removeFromParent();
    if(this.left) this.left.group.removeFromParent();
    if(this.stack) this.stack.removeFromParent();
    this.float=null; this._flym=null;
    this.page=this.mkPage(false);
    this.left=p>0?this.mkPage(true):null;
    this.stack=p>1?this.mkStack(p-1):null;
    /* a past page is full; tonight's holds only what has been tucked */
    const count=(p===this.curPage)?this.curFilled:Math.min(9,N-p*9);
    /* What faces you on the left leaf is the BACK of the page before:
       thin album paper, so its stubs read through it the way print
       does through a letter held to a lamp — mirrored, sunk to a dim
       stain, column left become column right. Every thumb the spread
       needs is fetched together, not in single file. */
    const jobs=[];
    if(this.left){
      for(let s=0;s<9;s++){
        const t=TICKETS[(p-1)*9+s]; if(!t) continue;
        jobs.push(getTex(t.file,'thumbs').then(tx=>{
          if(run!==this.run||!tx||this.view!==p) return;
          const {x,y}=this.slotPos(s);
          let H=this.PH*.93; const a=Math.max(.3,Math.min(1.4,(t.w||1000)/(t.h||1600)));
          if(H*a>this.PW*.93) H=this.PW*.93/a;
          const ghost=new THREE.Mesh(new THREE.PlaneGeometry(H*a,H),
            new THREE.MeshStandardMaterial({map:tx,transparent:true,opacity:.20,
              roughness:.94,metalness:0,depthWrite:false,side:THREE.DoubleSide}));
          ghost.scale.x=-1;
          ghost.position.set(-x,y,.006);
          ghost.renderOrder=2;
          this.left.group.add(ghost);
        }));
      }
    }
    for(let s=0;s<count;s++){
      const t=TICKETS[p*9+s]; if(!t) continue;
      jobs.push(getTex(t.file,'thumbs').then(tx=>{
        if(run!==this.run||!tx||this.view!==p) return;
        const {x,y}=this.slotPos(s);
        let H=this.PH*.93; const a=Math.max(.3,Math.min(1.4,(t.w||1000)/(t.h||1600)));
        if(H*a>this.PW*.93) H=this.PW*.93/a;
        const m=makeStub(tx,t.w,t.h,H,.005);
        m.position.set(x,y,.01); this.page.group.add(m);
        this.page.slots[s]={mesh:m};
      }));
    }
    await Promise.all(jobs);
    /* The pages either side, fetched but not waited for. A turn now
       holds the landed sheet until the new page's nine thumbs are in
       hand, which is right — an empty page popping full is worse — but
       only bearable if they are already there. Warming the neighbours
       costs nothing here and makes the next turn instant either way. */
    for(const q of [p-1,p+1]){
      if(q<0||q>this.curPage) continue;
      for(let s=0;s<9;s++){
        const t=TICKETS[q*9+s]; if(t) getTex(t.file,'thumbs');
      }
    }
    /* browsing back to tonight's page, the untucked stub returns too */
    if(run===this.run&&p===this.curPage&&this.needFloat!=null)
      this.stageFloat(this.needFloat,false);
  }
  /* tonight's stub is SHOWN before it is kept: it hangs at the mouth
     of its sleeve waiting for the hand. animate=true flies it in; the
     float handle only exists once it has settled. */
  async stageFloat(idx,animate){
    const run=this.run;
    this.needFloat=idx;
    if(this.float) return;
    killTweens('bedfly');
    if(this._flym){ this._flym.removeFromParent(); this._flym=null; }
    const tn=TICKETS[idx]; if(!tn||!this.page) return;
    const ftx=await getTex(tn.file,'thumbs');
    if(run!==this.run||!ftx||this.view!==this.curPage||this.float||!this.page) return;
    const sN=idx%9;
    let H=this.PH*.93; const a=Math.max(.3,Math.min(1.4,(tn.w||1000)/(tn.h||1600)));
    if(H*a>this.PW*.93) H=this.PW*.93/a;
    const m=makeStub(ftx,tn.w,tn.h,H,.005);
    this.page.group.add(m);
    const {x,y}=this.slotPos(sN);
    const fl={m,x,y,mouth:y+this.PH*.66,s:sN};
    if(animate){
      this._flym=m;
      m.position.set(x+1.1,y+1.2,.9); m.rotation.set(-.45,0,-.24);
      tween({dur:.55,ease:'out',tag:'bedfly',update:k=>{
        m.position.set(lerp(x+1.1,x,k),lerp(y+1.2,fl.mouth+.06,k),lerp(.9,.14,k));
        m.rotation.set(lerp(-.45,-.3,k),0,lerp(-.24,0,k));}})
        .then(ok=>{ if(ok&&run===this.run){ this.float=fl; this._flym=null; } });
    }else{
      m.position.set(x,fl.mouth+.06,.14); m.rotation.set(-.3,0,0);
      this.float=fl;
    }
  }
  async enter(idx){
    this.busy=true; const run=++this.run;
    this.curPage=Math.floor(idx/9); this.curFilled=idx%9;
    this.needFloat=null; this.up=null;
    await this.showSpread(this.curPage);
    if(run!==this.run) return;
    this.stageFloat(idx,true);
    /* whoever is in the doorway starts talking as the room comes up */
    say(CAPS.get(TICKETS[idx]));
    this.busy=false;
  }
  /* ---------------- browsing: flips, and a closer look ----------------
     Click routing for the binder: a stub under the pointer lifts to the
     eye; the left leaf flips a page back; the right leaf's paper flips
     forward when a newer page exists. Anything else falls through to
     the tuck gesture. */
  tap(e){
    if(app.busy) return false;
    if(this.up){ if(!this.busy) this.putBack(); return true; }
    if(this.busy) return false;
    const hit=this.pick(e);
    if(hit&&hit.type==='stub'){ this.inspect(hit.slot); return true; }
    if(hit&&hit.type==='back'){ this.flip(-1); return true; }
    /* browsing the past, a full page leaves no paper to click — so out
       there, any click that is not a stub or the left leaf walks the
       binder forward, back toward tonight */
    if(this.view<this.curPage){ this.flip(1); return true; }
    return false;
  }
  pick(e){
    const rc=this._rc||(this._rc=new THREE.Raycaster());
    rc.layers.enableAll();
    rc.setFromCamera(new THREE.Vector2((e.clientX/innerWidth)*2-1,
      -(e.clientY/innerHeight)*2+1),this.camera);
    /* the waiting stub belongs to the pull, not the browse */
    if(this.float&&rc.intersectObject(this.float.m,true).length) return null;
    if(this.page){
      const stubs=this.page.slots.filter(s=>s&&s.mesh).map(s=>s.mesh);
      const h=rc.intersectObjects(stubs,true);
      if(h.length){ const s=this.slotOf(h[0].object); if(s) return {type:'stub',slot:s}; }
    }
    if(this.left&&rc.intersectObject(this.left.group,true).length) return {type:'back'};
    return null;
  }
  slotOf(o){
    for(let i=0;i<this.page.slots.length;i++){
      const s=this.page.slots[i];
      if(!s||!s.mesh) continue;
      /* the slot's place on the page is what names the ticket:
         page p, slot i, is ticket p*9+i */
      for(let p=o;p;p=p.parent) if(p===s.mesh){ s.i=i; return s; }
    }
    return null;
  }
  inspect(s){
    this.busy=true;
    /* Whoever is off frame changes the subject: you are holding a
       different night up to the lamp, so the line about it is the one
       to hear. A stub nobody wrote a line for goes up in silence. */
    if(s.i!=null) say(CAPS.get(TICKETS[this.view*9+s.i]));
    const m=s.mesh;
    this.up={m,parent:this.page.group,pos:m.position.clone(),rot:m.rotation.clone()};
    this.scene.attach(m);
    SFX.slide(.2,.4);
    const fwd=this.camera.getWorldDirection(new THREE.Vector3());
    const aim=new THREE.Object3D();
    aim.position.copy(this.camera.position).add(fwd.multiplyScalar(1.25));
    aim.lookAt(this.camera.position);
    const p0=m.position.clone(), q0=m.quaternion.clone();
    tween({dur:.5,ease:'out',tag:'bed',update:k=>{
      m.position.lerpVectors(p0,aim.position,k);
      m.quaternion.slerpQuaternions(q0,aim.quaternion,k);
    }}).then(()=>{ if(this.up) this.busy=false; });
  }
  putBack(){
    const u=this.up; if(!u) return;
    /* back in its sleeve, and the room goes back to talking about the
       night you came home with */
    say(CAPS.get(TICKETS[app.idx]));
    this.up=null; this.busy=true;
    u.parent.attach(u.m);
    SFX.slide(.15,.3);
    const p0=u.m.position.clone(), q0=u.m.quaternion.clone();
    const qt=new THREE.Quaternion().setFromEuler(u.rot);
    tween({dur:.45,ease:'inOut',tag:'bed',update:k=>{
      u.m.position.lerpVectors(p0,u.pos,k);
      u.m.quaternion.slerpQuaternions(q0,qt,k);
    }}).then(()=>{ this.busy=false; });
  }
  async flip(d){
    const target=this.view+d;
    if(this.busy||target<0||target>this.curPage) return;
    this.busy=true; this.turning=true; const run=++this.run;
    SFX.slide(.3,.5);
    /* The leaf in the air is the REAL page: flipping back it is the
       older page (its stubs land face-up), flipping forward it is the
       page being put to bed (its stubs lift away). Both directions
       turn the same physical sheet — the one between the two spreads.
       Its stubs are plain FRONT-side planes on the base layer: the
       usual layer-1 stubs are drawn over everything in the raw pass,
       so past edge-on they would shine through the paper from behind.
       Front-side culling hides them exactly when the sheet should.
       The show-through rides at -z, hidden from the front by the
       sheet's own depth, and the 180° turn itself supplies the mirror. */
    const leafPage=Math.min(this.view,target);
    const pageW=3*this.PW+4*this.GAP, pageH=3*this.PH+4*this.GAP;
    const piv=new THREE.Group();
    piv.position.set(this.hingeX,0,.03); this.binder.add(piv);
    const leaf=new THREE.Group(); leaf.position.x=pageW/2+.12; piv.add(leaf);
    leaf.add(new THREE.Mesh(new THREE.PlaneGeometry(pageW,pageH),
      matte({color:0xe9e0cc,side:THREE.DoubleSide})));
    for(let s=0;s<Math.min(9,N-leafPage*9);s++){
      const t=TICKETS[leafPage*9+s]; if(!t) continue;
      getTex(t.file,'thumbs').then(tx=>{
        if(!tx||!piv.parent||run!==this.run) return;
        const {x,y}=this.slotPos(s);
        let H=this.PH*.93; const a=Math.max(.3,Math.min(1.4,(t.w||1000)/(t.h||1600)));
        if(H*a>this.PW*.93) H=this.PW*.93/a;
        const f=new THREE.Mesh(new THREE.PlaneGeometry(H*a,H),
          new THREE.MeshStandardMaterial({map:tx,roughness:.88,metalness:0}));
        f.position.set(x,y,.01); leaf.add(f);
        const g=new THREE.Mesh(new THREE.PlaneGeometry(H*a,H),
          new THREE.MeshStandardMaterial({map:tx,transparent:true,opacity:.20,
            roughness:.94,metalness:0,depthWrite:false,side:THREE.DoubleSide}));
        g.position.set(x,y,-.006); g.renderOrder=2; leaf.add(g);
      });
    }
    if(d>0){
      /* Forward, the spread has to change up front: the right leaf is
         being lifted away, so what is underneath must already be the
         new page. But that same call builds the new LEFT leaf — which
         is this very sheet, the one still in the air — and drops it
         flat on the left before it has got there. Turning off page one
         you watch a page appear out of nothing on the empty left board
         and then a second copy of it fly over and land. So it waits,
         out of sight, until the sheet has actually arrived. */
      this.showSpread(target);
      const landing=this.left;
      if(landing) landing.group.visible=false;
      await tween({dur:.55,ease:'inOut',tag:'bed',update:k=>{
        piv.rotation.y=-Math.PI*k;
        /* the same, mirrored: the sheet starts lying over the right
           page and lifts off it, so the new page underneath stays
           hidden until the sheet has left */
        if(this.page) this.page.group.visible=k>.5;
      }});
      if(landing) landing.group.visible=true;
      if(this.page) this.page.group.visible=true;
    }else{
      /* The sheet in the air IS the leaf lying on the left — one page
         drawn twice — so the static copy goes out of sight for the
         turn. Left where it was, you watch a page lift off and a
         phantom of itself stay behind. Where older sheets are stacked
         underneath it passes for the pile and nobody notices; turning
         back the first page there is nothing under it, and the trick
         is plain. */
      const under=this.left;
      if(under) under.group.visible=false;
      piv.rotation.y=-Math.PI;
      await tween({dur:.55,ease:'inOut',tag:'bed',update:k=>{
        piv.rotation.y=-Math.PI*(1-k);
        /* Past edge-on the sheet is lying over the right page, and the
           stubs down there are on TICKET_LAYER — drawn raw in a second
           pass after clearDepth(), on top of everything, depth ignored.
           No amount of paper in front of them will hide them, so the
           page goes out of sight for exactly as long as the sheet is
           over it. The leaf is cut to the same size and lands square
           on top, so there is nothing to see underneath anyway. */
        if(this.page) this.page.group.visible=k<.5;
      }});
      if(this.page) this.page.group.visible=true;
      /* The spread is swapped once the sheet has LANDED, underneath
         it, rather than halfway through the turn. Edge-on, a sheet
         covers nothing: swapping there drops the older page's stubs
         onto a right leaf that is still in full view, and you see the
         page you are turning TO before the page has finished turning.
         Landed, the leaf sits square over the right page and hides the
         change completely. */
      if(run===this.run) await this.showSpread(target);
      if(under&&under.group.parent) under.group.visible=true;
    }
    piv.removeFromParent();
    this.turning=false;
    if(run!==this.run) return;
    this.busy=false;
  }
  /* THE PULL, act three: the first third of the drag settles the stub
     into the mouth of the sleeve, the rest slides it home. */
  grab(){
    if(this.busy||!this.float) return false;
    this.k=0; this.slid=false; return true;
  }
  drag(k){
    const f=this.float; if(!f) return;
    this.k=k;
    const g1=Math.min(1,k/.3);               /* seated at the mouth */
    const g2=Math.max(0,(k-.3)/.7);          /* then down into the sleeve */
    if(!this.slid&&g2>0){ this.slid=true; SFX.slide(.3,.5); }
    f.m.position.x=f.x;
    f.m.position.y=g2>0?lerp(f.mouth,f.y,g2):lerp(f.mouth+.06,f.mouth,g1);
    f.m.position.z=lerp(.14,.008,g1)+.002*g2;
    f.m.rotation.x=g2>0?lerp(-.05,0,g2):lerp(-.3,-.05,g1);
  }
  async release(done){
    const f=this.float; if(!f) return;
    if(!done){
      const k0=this.k||0;
      this.busy=true;
      await tween({dur:.3,ease:'out',tag:'bed',update:q=>this.drag(k0*(1-q))});
      this.slid=false;
      this.busy=false;
      return;
    }
    this.busy=true; const run=++this.run;
    this.drag(1);
    SFX.seat();
    this.page.slots[f.s]={mesh:f.m};
    this.float=null; this.needFloat=null;
    await wait(.8,'bed');
    if(run!==this.run) return;
    this.busy=false;
  }
  async perform(){
    if(this.busy) return;
    /* the machine tidies first: a lifted stub goes straight back, the
       binder reopens to tonight, the waiting stub is re-staged */
    if(this.up){ const u=this.up; this.up=null;
      u.parent.attach(u.m); u.m.position.copy(u.pos); u.m.rotation.copy(u.rot);
      say(CAPS.get(TICKETS[app.idx])); }   /* and back to tonight's line */
    if(this.view!==this.curPage) await this.showSpread(this.curPage);
    if(!this.float) await this.stageFloat(this.needFloat==null?app.idx:this.needFloat,false);
    if(!this.grab()) return;
    this.busy=true; const run=++this.run;
    await tween({dur:.9,ease:'inOut',tag:'bed',update:k=>this.drag(k)});
    if(run!==this.run) return;
    this.busy=false;
    await this.release(true);
  }
  exit(){
    this.run=(this.run||0)+1; this.turning=false;
    killTweens('bed'); killTweens('bedfly');
    if(this.up){ this.up.m.removeFromParent(); this.up=null; }
    this.float=null; this.needFloat=null; this._flym=null;
    if(this.page){this.page.group.removeFromParent();this.page=null;}
    if(this.left){this.left.group.removeFromParent();this.left=null;}
    if(this.stack){this.stack.removeFromParent();this.stack=null;}
    this.busy=false;
  }
  drawClock(d){
    d=d||this.when||nowDate();
    const g=this.clockCv.getContext('2d'),S=256,c=S/2;
    g.setTransform(2,0,0,2,0,0);       /* logical 256, 2x pixels */
    g.clearRect(0,0,S,S);
    g.fillStyle='#efe7d4'; g.beginPath(); g.arc(c,c,c-3,0,7); g.fill();
    /* the dial is dished, so it darkens toward the rim */
    const vg=g.createRadialGradient(c,c*.86,10,c,c,c);
    vg.addColorStop(0,'rgba(255,255,255,.35)'); vg.addColorStop(1,'rgba(60,48,32,.28)');
    g.fillStyle=vg; g.beginPath(); g.arc(c,c,c-3,0,7); g.fill();
    for(let i=0;i<60;i++){
      const a=i/60*Math.PI*2-Math.PI/2, big=i%5===0;
      const r1=c-13, r2=c-(big?27:20);
      g.strokeStyle=big?'#231a10':'rgba(35,26,16,.5)'; g.lineWidth=big?3.6:1.3;
      g.beginPath();
      g.moveTo(c+Math.cos(a)*r1,c+Math.sin(a)*r1);
      g.lineTo(c+Math.cos(a)*r2,c+Math.sin(a)*r2); g.stroke();
    }
    const hand=(turns,len,w,col)=>{
      const a=turns*Math.PI*2-Math.PI/2;
      g.strokeStyle=col; g.lineWidth=w; g.lineCap='round';
      g.beginPath();
      g.moveTo(c-Math.cos(a)*14,c-Math.sin(a)*14);
      g.lineTo(c+Math.cos(a)*len,c+Math.sin(a)*len); g.stroke();
    };
    const mins=d.getMinutes()+d.getSeconds()/60;
    hand(((d.getHours()%12)+mins/60)/12, c*.48, 7.5,'#231a10');
    hand(mins/60,                        c*.70, 5,  '#231a10');
    hand(d.getSeconds()/60,              c*.76, 1.8,'#a3211f');
    g.beginPath(); g.arc(c,c,5,0,7); g.fillStyle='#231a10'; g.fill();
    this.clockTex.needsUpdate=true;
  }
  update(dt,t){
    this.camera.position.copy(this.camHome);
    this.camera.position.x+=app.px*.14; this.camera.position.y-=app.py*.08;
    /* one redraw a second — a canvas repaint every frame for a second
       hand that only moves 60 times a minute is pure waste */
    const ms=t*1000;
    /* the unkept stub treads air at the mouth of its sleeve */
    if(this.float&&!this.busy&&!GRAB.on)
      this.float.m.position.y=this.float.mouth+.06+Math.sin(t*2.1)*.012;
    /* A page turning is a sheet swung through the very air the unkept
       stub is hanging in, and the two intersect on the way past. The
       stub steps out of sight for the turn — including one staged
       mid-turn, which is why this is enforced per frame rather than
       once at the start. */
    for(const fm of [this.float&&this.float.m,this._flym])
      if(fm) fm.visible=!this.turning;
    /* the dial reads the ticket's hour — home after the show — and the
       second hand runs on from there in real time so it stays alive */
    if(this._t0==null) this._t0=t;
    if(ms-(this._tick||-1e9)>1000){
      this._tick=ms;
      this.drawClock(new Date(this.when.getTime()+(t-this._t0)*1000));
    }
    this.camera.lookAt(this.camLook);
  }
}
