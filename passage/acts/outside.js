/* ACT I — outside, under the marquee.
   Part of The Passage — see ui-passage-pull.html. */
import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {SFX} from '../../sfx.js';
import {createStanchionRopeBarrierModel} from '../../stanchion.js';
import {createGlazedEntranceSystemModel} from '../../glass-entrance.js';
import {TICKETS,lerp,rnd} from '../tickets.js';
import {killTweens,tween,wait} from '../tween.js';
import {concreteTex,cv,fitH,makeStub,plasterTex,timber,uniq} from '../tex.js';
import {nowDate,skyPhase} from '../hour.js';
import {contact,matte,metal,pool,satin,scallop,unlit,thin} from '../mats.js';
import {drawnTex,getTex,lightPoster,marqueeBill,posterCase,posterTex} from '../posters.js';
import {MAXA,envMap} from '../stage.js';
import {fitRows,houseName,setRow} from '../type.js';
import {app} from '../app.js';

/* ================================================================
   ACT I — OUTSIDE, UNDER THE MARQUEE
   The ticket is torn at the door, on the sidewalk, at night.
   Nobody holds it. It tears itself.
================================================================ */
export class Outside{
  constructor(when){
    this.name='OUTSIDE'; this.sub='THE DOOR OF THE HOUSE';
    this.run=0; this.busy=false;
    const sc=this.scene=new THREE.Scene();
    /* The hour — the ticket's hour, a quarter of an hour before the
       show. NIGHT is how dark it is out: 1 after dark, 0 at midday.
       Everything the facade does with light is scaled by it, because a
       house does not run its neon at two in the afternoon — the bulbs
       and the sign are lit only when there is something to light. */
    this.when=when||nowDate();
    this.phase=skyPhase(this.when);
    const NIGHT={night:1,dusk:.72,dawn:.42,day:0}[this.phase];
    this.night=NIGHT;
    const mixc=(a,b,k)=>new THREE.Color(a).lerp(new THREE.Color(b),k);
    const HAZE=mixc(0x93a6bd,0x1d1518,NIGHT);
    sc.background=HAZE.clone();
    sc.fog=new THREE.Fog(HAZE.clone(),14,54);
    sc.environment=NIGHT>.5
      ? envMap('#2a2733','#3a2a24','#120e0f',[
          {x:128,y:26,r:74,c:'rgba(255,214,150,.95)'},   /* the marquee */
          {x:36, y:52,r:40,c:'rgba(216,57,44,.40)'},     /* red neon */
        ])
      : envMap('#8fb0d8','#b9c3c9','#4a453f',[
          {x:150,y:22,r:56,c:'rgba(255,250,235,.85)'},   /* the sun */
        ]);
    sc.environmentIntensity=.45+(1-NIGHT)*.5;
    this.camera=new THREE.PerspectiveCamera(44,1,.1,120);
    this.camHome=new THREE.Vector3(0,1.95,6.6);
    this.camLook=new THREE.Vector3(0,2.9,-.5);

    /* four temperatures: cool night sky, warm bounce off the sidewalk,
       the marquee's warm spill, and red neon */
    sc.add(new THREE.HemisphereLight(NIGHT>.5?0x46536e:0xa8c4e6,
      NIGHT>.5?0x2a1e1a:0x6a6157, .5+(1-NIGHT)*1.35));
    /* the house's own light, only after dark */
/* By day these are switched off — 44*0 and 26*0 — but a light with
       no output still costs a full light slot in every shader in the
       scene. On a matinee they simply are not built. */
    if(NIGHT>0){
      const marquee=new THREE.PointLight(0xffd9a0,44*NIGHT,22,1.9);
      marquee.position.set(0,4.6,1.4); sc.add(marquee);
      const neon=new THREE.PointLight(0xd8392c,26*NIGHT,16,2);
      neon.position.set(-3.4,3.6,.8); sc.add(neon);
    }
    /* the marquee is behind the stub, so on its own it backlights the
       ticket into a silhouette. This sits between camera and ticket and
       does nothing else — short range, so it never washes the facade. */
    const readLamp=new THREE.PointLight(0xffe9c6,20,4.6,1.7);
    readLamp.position.set(.55,2.45,3.35); sc.add(readLamp);
    /* the sun takes over as the house lights go out */
    const key=new THREE.DirectionalLight(NIGHT>.5?0xffe3bd:0xfff3dc,.75+(1-NIGHT)*1.5);
    key.position.set(2.5,6,4.5); key.castShadow=true;
    key.shadow.mapSize.set(1024,1024);
    key.shadow.camera.left=-5;key.shadow.camera.right=5;
    key.shadow.camera.top=5;key.shadow.camera.bottom=-5;
    key.shadow.bias=-.0006; sc.add(key);

    const walk=new THREE.Mesh(new THREE.PlaneGeometry(46,30),
      matte({map:uniq(concreteTex(),9,6)}));
    walk.rotation.x=-Math.PI/2; walk.receiveShadow=true; sc.add(walk);

    /* facade */
    const face=new THREE.Mesh(new RoundedBoxGeometry(19,9.5,1.4,2,.07),
      matte({map:uniq(plasterTex('#6b4d44'),4,2)}));
    face.position.set(0,4.6,-2.2); face.receiveShadow=true; sc.add(face);
    contact(sc,19,0,-1.45,0,1.5);

    /* Doors — the glazed entrance system from C:/side/objects. Four
       leaves in a bronze frame, so it replaces both slabs and the amber
       panes that stood in for glass.

       Measured and seated by "Perimeter frame + mullion" rather than by
       the bounding box: both models before this one carried something
       below the frame (the lamp a cable, the fire doors display feet),
       which left them floating and made them size short. Same treatment
       here, and for the same reason. */
    /* Physical materials it never uses the physical half of */
    const glazed=createGlazedEntranceSystemModel({
      castShadow:true,receiveShadow:true,
      textureSize:512,textureAnisotropy:MAXA,qualityPriority:'balanced'});
    thin(glazed);
    sc.add(glazed);
    const gFrame=()=>{
      let b=null;
      glazed.traverse(o=>{
        if(!o.isMesh||!/perimeter frame/i.test(o.name||'')) return;
        const q=new THREE.Box3().setFromObject(o); b=b?b.union(q):q;
      });
      return b||new THREE.Box3().setFromObject(glazed);
    };
    glazed.updateMatrixWorld(true);
    let gb=gFrame();
    glazed.scale.setScalar(3.05/Math.max(.001,gb.max.y-gb.min.y));  /* transom sits at 3.09 */
    glazed.updateMatrixWorld(true);
    gb=gFrame();
    glazed.position.set(-(gb.max.x+gb.min.x)/2,-gb.min.y,-1.50);
    glazed.updateMatrixWorld(true);

    /* the lobby beyond. Real glass shows whatever is behind it, and
       behind it is nothing — so the warm interior the old amber panes
       faked has to actually be there for the doors to read as a way in
       rather than four mirrors. */
    /* sized to sit INSIDE the frame (which spans x +/-1.72, y 0..3.05):
       at 4.4 wide it stuck out past the jambs and, being in front of the
       facade, glowed round the outside of the doorway */
    /* The leaf glass is real: transmission 0.9 at roughness 0.03. At that
       finish it mirrors whatever it faces, and what it faces is a dark
       street — so a dim interior loses to the reflection and the doors
       read as four black panels. The lobby has to be genuinely bright to
       come through, and a light inside it throws warmth back onto the
       frame and the pavement the way a lit foyer does. */
    const lobby=new THREE.Mesh(new THREE.PlaneGeometry(3.18,2.78),unlit(0xffcf94));
    lobby.position.set(0,1.5,-1.86); sc.add(lobby);
    const foyer=new THREE.PointLight(0xffc98a,26*(.35+.65*NIGHT),7,1.7);
    foyer.position.set(0,1.7,-1.72); sc.add(foyer);
    const transom=new THREE.Mesh(new RoundedBoxGeometry(3.9,.42,.3,2,.06),timber('#7a5a2e',4,1,.46));
    transom.position.set(0,3.3,-1.4); sc.add(transom);

    /* the marquee overhead */
    const mq=new THREE.Group(); mq.position.set(0,4.35,-.5); sc.add(mq);
    const box=new THREE.Mesh(new RoundedBoxGeometry(11,2.1,2.4,2,.09),satin(0x7b2027,22));
    box.castShadow=true; mq.add(box);
    const soffit=new THREE.Mesh(new THREE.PlaneGeometry(11,2.4),unlit(0x38221f));
    soffit.rotation.x=Math.PI/2; soffit.position.y=-1.06; mq.add(soffit);
    /* drawn at 2x and downsampled: the board fills most of the frame
       when you stand under it, and 1024 wide read as mush */
    this.boardCv=cv(2048,512);
    this.boardTex=new THREE.CanvasTexture(this.boardCv);
    this.boardTex.colorSpace=THREE.SRGBColorSpace;
    this.boardTex.anisotropy=MAXA;
    const bd=new THREE.Mesh(new THREE.PlaneGeometry(10.2,1.65),
      new THREE.MeshBasicMaterial({map:this.boardTex}));
    bd.position.set(0,.1,1.22); mq.add(bd);
    /* The chase bulbs. These were flat-shaded Basic spheres, and a Basic
       sphere renders as a uniform disc — no core, no falloff, no glass,
       which is why they read as painted dots however round the geometry
       got. A real bulb is three things at this distance:
         - a glass ENVELOPE that shades: Standard material, so a dead
           bulb catches the marquee's light as a glint on grey glass
           instead of going matte. Lit, the chase drives its emissive
           past white and the tone mapper clips it, as before.
         - a CORE-AND-HALO sprite: the light peaks at the filament and
           dies toward the silhouette, so the brightness has to fall off
           INSIDE the bulb, not stop at its edge. Additive radial
           gradient, floated toward the camera so the envelope cannot
           occlude its own glow.
         - a SOCKET, because a bulb that touches nothing reads as a
           decal. A stub of old brass between glass and fascia.
       Geometry and socket are shared; materials are per-bulb because
       the chase writes into each one every frame. */
    this.bulbs=[];
    const bulbGeo=new THREE.SphereGeometry(.075,20,14);
    const sockGeo=new THREE.CylinderGeometry(.05,.056,.06,12);
    const sockMat=metal(0x6b5a3a,.55);
    const haloTex=(()=>{
      const c=cv(64,64),g=c.getContext('2d');
      const rg=g.createRadialGradient(32,32,2,32,32,30);
      rg.addColorStop(0,'rgba(255,246,225,1)');
      rg.addColorStop(.25,'rgba(255,220,160,.55)');
      rg.addColorStop(.6,'rgba(255,190,120,.16)');
      rg.addColorStop(1,'rgba(255,180,110,0)');
      g.fillStyle=rg; g.fillRect(0,0,64,64);
      const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace;
      return t;
    })();
/* THE BULBS, AND THEIR THREE STATES.
       The chase only ever puts a bulb in one of three conditions — out
       (a matinee), lit, or the ember between beats — so there are three
       glass materials and three halos, shared by all twenty-two bulbs,
       and the chase swaps which one each bulb points at. It used to
       build a material per bulb and mutate all forty-four of them every
       frame, which is forty-four uniform uploads a frame to say one of
       three things. Object and material count is the measured cost in
       this room; nothing here is a pixel. */
    const bulbMat=on=>new THREE.MeshStandardMaterial(
      {color:0x8a837b,roughness:.12,metalness:0,
       emissive:new THREE.Color(...on)});
    this.bulbMats={off:bulbMat([0,0,0]),lit:bulbMat([2.2,1.9,1.4]),
                   ember:bulbMat([.34,.18,.07])};
    const haloMat=o=>new THREE.SpriteMaterial({map:haloTex,transparent:true,
      opacity:o,blending:THREE.AdditiveBlending,depthWrite:false});
    this.haloMats={off:haloMat(0),lit:haloMat(.85),ember:haloMat(.10)};
    for(let i=0;i<22;i++){
      const x=-5.2+i*.5;
      const glass=new THREE.Mesh(bulbGeo,this.bulbMats.off);
      glass.position.set(x,-1.02,1.24); mq.add(glass);
      const sock=new THREE.Mesh(sockGeo,sockMat);
      sock.rotation.x=Math.PI/2; sock.position.set(x,-1.02,1.185); mq.add(sock);
      const halo=new THREE.Sprite(this.haloMats.off);
      halo.scale.setScalar(.34); halo.position.set(x,-1.02,1.34);
      halo.renderOrder=4; mq.add(halo);
      this.bulbs.push({glass,halo});
      if(i%3===0&&NIGHT>.35) pool(sc,3.4,x,rnd(.4,1.4));
    }
    /* the marquee throws light down the facade and onto the walk */
    if(NIGHT>.35){ scallop(sc,7,4.2,0,2.2,-1.3); pool(sc,9,0,1.6); }

    /* poster cases, one in seven crooked — filled per ticket with the
       one-sheets of tonight's picture and its season (updatePosters) */
    this.cases=[];
    [-4.4,-3.0,3.0,4.4].forEach((x,i)=>{
      const c=posterCase(1.78);
      c.group.position.set(x,2.05,-1.36);
      if(Math.random()<0.28) c.group.rotation.z=(Math.random()-.5)*.05;
      sc.add(c.group);
      this.cases.push(c.art);
    });
    this.posterRun=0;

    /* The stanchion line from C:/side/objects — the model is the whole
       assembly, both posts and the rope slung between them. Two of them,
       flanking the doors rather than barring them: a rope across the
       entrance says the house is shut, which is the opposite of what
       this scene is about. Built once and cloned, like the poster cases.

       Measured rather than placed by hand: turned so its long axis lies
       across the front of the house, scaled by post height (about a
       metre — matching the old rope's 4.9-unit span once gave a barrier
       the size of the building), then sat on the pavement by its own
       underside. The offset comes from the model's own span, so the gap
       at the doors stays clear whatever size the assembly turns out. */
    const barProto=(()=>{
      const g=createStanchionRopeBarrierModel({
        castShadow:true,receiveShadow:true,
        textureSize:512,textureAnisotropy:MAXA,qualityPriority:'balanced'});
      thin(g);
      g.updateMatrixWorld(true);
      let bb=new THREE.Box3().setFromObject(g);
      if((bb.max.z-bb.min.z)>(bb.max.x-bb.min.x)) g.rotation.y=Math.PI/2;
      g.updateMatrixWorld(true);
      bb=new THREE.Box3().setFromObject(g);
      /* height first — a post is a post, whatever the run is */
      g.scale.setScalar(1.42/Math.max(.001,bb.max.y-bb.min.y));
      g.updateMatrixWorld(true);
      g.userData.bb=new THREE.Box3().setFromObject(g);
      return g;                       /* built, sized, not yet placed */
    })();
    /* One each side of the doors, running across the front. Two things
       fix where they go, and both are the camera's doing: it looks UP at
       the marquee, so anything at pavement level rides the bottom edge —
       set back toward the facade they sit higher in frame and stay in
       it. And the further back they go the wider the frame gets, which
       is what makes room for a 2.5-unit assembly on each side of a
       doorway that reaches x±1.85. Running them lengthwise instead put
       them edge-on and mostly under the HUD. */
    /* the two numbers that decide the queue line: where it begins
       relative to the doors (which end at x±1.85), and how long the run
       is. It now stops just past the near poster case rather than
       running out past the far one. */
    const BAR_IN=1.95, BAR_SPAN=2.00,
          BAR_NUDGE=-0.34,          /* how far in from BAR_IN it actually sits */
          BAR_SINK=-0.30;           /* dropped into the walk, so no base shows */
    /* One centre, used twice with opposite sign. Adding the nudge to both
       placements slid the pair sideways instead of mirroring it, which
       left the right-hand run at 2.61 and the left at -3.29 — the left
       standing two thirds of a unit further from the doors than its
       twin. Deriving one number and negating it makes that impossible. */
    const BAR_CX=BAR_IN+BAR_SPAN/2+BAR_NUDGE;
    const stanchionAt=(cx,useProto,mirror)=>{
      const bb=barProto.userData.bb;
      const inner=useProto?barProto:barProto.clone(true);
      /* centre it on its own middle so the wrapper turns about the
         middle of the run, and sit it on the pavement */
      inner.position.set(-(bb.max.x+bb.min.x)/2,-bb.min.y,-(bb.max.z+bb.min.z)/2);
      const g=new THREE.Group();
      g.add(inner);
      g.name='stanchion';
      /* Then the run is stretched along x only. Scaling the whole model
         up to a 3.3-unit span would drag the posts to 2.2 units with it
         — taller than a person against 3.1-unit doors. The wrapper has
         no rotation, so its x is world x; a post's circular section goes
         slightly oval, which is invisible from a camera looking nearly
         straight down the facade, and the rope braid stretches with it. */
      /* The model is not axis-aligned: its two posts sit at different
         depths (z 0.51 and 1.49), so the run is a diagonal. Copied
         rather than reflected, that diagonal points the same way on both
         sides of the doors — and since the near post is magnified, the
         right-hand run read 471px wide against the left's 268px. Same
         geometry, same scale, opposite foreshortening. A negative x
         scale reflects it properly; three flips the winding itself when
         the world matrix determinant goes negative, so the faces stay
         right way out. A half-turn about Y will NOT do: that maps z to
         -z as well and pushes the assembly to a different depth. */
      const k=BAR_SPAN/Math.max(.001,bb.max.x-bb.min.x);
      g.scale.set(mirror?-k:k,1,1);
      /* Out toward the viewer, off the wall. Pushed back against the
         facade they read as skirting board; out here they sit in the
         scene. It also shrinks the slice of world the info card covers
         (things closer subtend more pixels per unit), so more of the
         left-hand run clears it — the trade is that the bases go under
         the bottom edge of frame. */
      /* Sunk rather than merely cropped: relying on the bottom of the
         frame to hide the base only works at one window height, and a
         taller window would put the bases back on screen. */
      /* No half-turn to "mirror" the left one. That rotated its centring
         offset along with it and left the two assemblies at z 1.13 and
         0.87 — a quarter unit apart in depth, so the far one rendered
         visibly smaller. They are plain translated copies of one model:
         same size, same depth, same everything, mirrored only in where
         they stand. */
      g.position.set(cx,BAR_SINK,1.00);
      sc.add(g); g.updateMatrixWorld(true);
      /* The model's own origin is not its centre, and recentring it by a
         fixed offset applies the SAME shift to both sides — which slides
         the pair sideways instead of mirroring it, leaving one run
         further from the doors than the other. So measure where this one
         actually landed and slide it until its centre is exactly cx.
         Self-correcting, so no offset in the model can break symmetry. */
      const got=new THREE.Box3().setFromObject(g);
      g.position.x+=cx-(got.max.x+got.min.x)/2;
      g.updateMatrixWorld(true);
      /* the bases land where the model puts them, so take the contact
         shadows off the posts instead of guessing at positions */
      g.traverse(o=>{
        if(o.isMesh&&/(near|far) post base/i.test(o.name||'')){
          const at=o.getWorldPosition(new THREE.Vector3());
          contact(sc,.62,at.x,at.z,0,.6);
        }
      });
    };
    stanchionAt( BAR_CX,true,false);   /* the one you liked */
    stanchionAt(-BAR_CX,false,true);   /* and its reflection */

    this.held=null; this.kept=null; this.pile=[];
  }
  drawFascia(t){
    const g=this.boardCv.getContext('2d'),W=1024,H=256;
    g.setTransform(2,0,0,2,0,0);            /* logical coords, 2x pixels */
    /* Not a letterboard any more. This is the house's own sign, and the
       whole point is that it reads as permanent: enamel panel, channel
       letters lit from inside the tube, no slot rails and no hand-set
       wobble. A sign that stays up for thirty years is machine-made and
       sits dead straight — which is exactly what separates it from the
       marquee that now lives inside, where the title changes weekly. */
    const gl=g.createLinearGradient(0,0,0,H);
    gl.addColorStop(0,'#2b1518'); gl.addColorStop(.48,'#3d1b1e');
    gl.addColorStop(1,'#1e0d0f');
    g.fillStyle=gl; g.fillRect(0,0,W,H);
    g.fillStyle='rgba(255,196,150,.03)';    /* brushed enamel */
    for(let y=0;y<H;y+=3) g.fillRect(0,y,W,1);
    g.strokeStyle='rgba(238,186,118,.32)'; g.lineWidth=2;
    g.strokeRect(15,15,W-30,H-30);

    const name=houseName(t)||'THE PICTURE HOUSE';
    /* the board is 10.2 units wide, the camera frames about 8 of them,
       and wide tracking eats the rest — fit to what is actually seen */
    const fit=fitRows(g,name,W-268,78,22,8);
    const one=fit.lines.length===1;
    const rows=one?[152]:[114,198];
    fit.lines.forEach((ln,i)=>{
      const o={cx:W/2,cy:rows[i],size:Math.min(fit.size,one?78:58),
        /* this.night, not NIGHT: drawFascia is a method and the constant
           lives in the constructor — the bare name would throw here */
        color:this.night>.35?'#ffe9c6':'#e8d6b4',track:8,
        glow:13*this.night,wob:0};
      setRow(g,ln,o); setRow(g,ln,o);       /* twice, to hold through bloom */
    });
    this.boardTex.needsUpdate=true;
  }
  updatePosters(idx){
    const run=++this.posterRun;
    const bill=marqueeBill(idx);
    /* tonight's picture hangs by the doors; the season fills the rest */
    const order=[1,0,2,3];
    order.forEach((caseIdx,bi)=>{
      const t=bill[bi];
      if(!t||!t.title) return;
      (async()=>{
        let tx=await posterTex(t);
        if(!tx) tx=drawnTex(t);
        if(run!==this.posterRun||!tx) return;
        /* the case holds the picture at its own size now, so there is
           nothing here to rescale */
        const art=this.cases[caseIdx];
        if(art) lightPoster(art.material,tx);
      })();
    });
  }
  async build(idx){
    const t=TICKETS[idx];
    const map=await getTex(t.file);
    if(!map) return;
    this.drawFascia(t);
    const H=fitH(t.w,t.h,1.06,.88);
    const a=makeStub(map,t.w,t.h,H), b=makeStub(map,t.w,t.h,H);
    const W=a.userData.W;
    const g=new THREE.Group(); g.position.set(0,1.72,1.7); this.scene.add(g);
    const gx=W-.06, gy=H/2-.05;
    const pl=new THREE.Group(), pr=new THREE.Group();
    pl.position.set(-gx,gy,0); a.position.set(gx-W/2,-gy,0);
    pr.position.set( gx,gy,0); b.position.set(-gx+W/2,-gy,0);
    pl.add(a); pr.add(b); g.add(pl,pr);
    this.held={g,pl,pr,a,b,gx,gy,W,H};
  }
  async enter(idx){
    this.busy=true; const run=++this.run;
    this.updatePosters(idx);
    await this.build(idx);
    if(run!==this.run) return;
    if(this.held){
      const y=this.held.g.position.y;
      this.held.g.position.y=y-2.2;
      SFX.slide(.2,.4);
      await tween({dur:.7,ease:'out',tag:'out',update:k=>{
        if(this.held) this.held.g.position.y=lerp(y-2.2,y,k);}});
    }
    this.busy=false;
  }
  /* ------------------------------------------------------------
     THE PULL. grab() takes hold of the ticket, drag(k) scrubs the
     grip-then-tear by how far the hand has come down, release(done)
     finishes the tear or lets the halves close up again. perform()
     is the same pull done by the machine, for the keyboard.
  ------------------------------------------------------------ */
  grab(){
    if(this.busy||!this.held) return false;
    this.k=0; this.torn=false; return true;
  }
  /* Past this, the hand can do what it likes: the paper has gone. The
     pull no longer has to be finished for the night to count. */
  committed(){ return !!this.torn; }
  drag(k){
    const h=this.held; if(!h) return;
    this.k=k;
    const g1=Math.min(1,k/.18);              /* the grip tightens */
    const g2=Math.max(0,(k-.18)/.82);        /* then the tear runs */
    if(!this.torn&&g2>0){ this.torn=true; SFX.tear(); }
    h.pl.rotation.z=.03*g1;
    h.pl.position.x=-h.gx-.03*g2;
    h.pr.rotation.z=-.03*g1+.4*g2;
    h.pr.rotation.y=-.5*g2;
    h.pr.position.set(h.gx+.5*g2,lerp(h.gy,.1,g2)-.9*g2*g2,.3*g2);
  }
  async release(done){
    const h=this.held; if(!h) return;
    if(!done){
      const k0=this.k||0;
      this.busy=true;
      await tween({dur:.3,ease:'out',tag:'out',update:q=>this.drag(k0*(1-q))});
      this.torn=false;                       /* closed up: never happened */
      this.busy=false;
      return;
    }
    this.busy=true; const run=++this.run;
    /* Let go the moment it goes and the tear runs itself out — the
       hand is off the ticket but the paper is still parting. Without
       this the halves freeze wherever the fingers left them. */
    const k0=this.k||0;
    if(k0<.98){
      await tween({dur:.3,ease:'out',tag:'out',update:q=>this.drag(lerp(k0,1,q))});
      if(run!==this.run) return;
    }
    this.held=null;
    /* the half that is kept stays up; the other falls to the sidewalk */
    this.scene.attach(h.b);
    const p0=h.b.position.clone(), r0=h.b.rotation.clone();
    const px=rnd(.7,1.5), pz=rnd(1.6,2.6);
    const fall=tween({dur:.8,ease:'settle',tag:'out',update:k=>{
      h.b.position.set(lerp(p0.x,px,k),lerp(p0.y,.012,k),lerp(p0.z,pz,k));
      h.b.rotation.set(lerp(r0.x,-Math.PI/2,k),0,r0.z+(Math.random()*.02));}})
      .then(ok=>{ if(ok) SFX.tap(.85+Math.random()*.35); });
    const x0=h.pl.position.x;
    const present=tween({dur:.6,delay:.12,ease:'out',tag:'out',update:k=>{
      h.pl.position.x=lerp(x0,-h.W/2+.06,k);
      h.pl.position.z=lerp(0,.2,k);
      h.pl.rotation.y=.2*k;}});
    await Promise.all([fall,present]);
    if(run!==this.run) return;
    this.pile.push(h.b);
    this.kept={g:h.g,half:h.a};
    await wait(.45,'out');
    this.busy=false;
  }
  async perform(){
    if(!this.grab()) return;
    this.busy=true; const run=++this.run;
    await tween({dur:.6,ease:'inOut',tag:'out',update:k=>this.drag(k)});
    if(run!==this.run) return;
    this.busy=false;
    await this.release(true);
  }
  exit(){
    this.run=(this.run||0)+1; killTweens('out');
    for(const o of [this.held&&this.held.g,this.kept&&this.kept.g].filter(Boolean))
      o.removeFromParent();
    for(const p of this.pile) p.removeFromParent();
    this.pile=[]; this.held=null; this.kept=null;
    this.busy=false;
  }
  update(dt,t){
    /* The chase rewrites these colours every frame, so setting them once
       when the scene was built did nothing — that is why the bulbs stayed
       lit at midday however the constructor dressed them. By day there is
       no chase at all, just cold glass. */
    const lit=this.night>.35;
    const beat=Math.floor(t*6);
    /* nothing to say to the bulbs unless the beat has actually moved */
    if(lit!==this._lit||beat!==this._beat){
      this._lit=lit; this._beat=beat;
      for(let i=0;i<this.bulbs.length;i++){
        const {glass,halo}=this.bulbs[i];
        /* between beats the filament is an ember, not a dead bulb — an
           incandescent chase never cuts to black */
        const state=!lit?'off':((i+beat)%3===0?'lit':'ember');
        glass.material=this.bulbMats[state];
        halo.material=this.haloMats[state];
      }
    }
    this.camera.position.copy(this.camHome);
    this.camera.position.x+=app.px*.16; this.camera.position.y-=app.py*.09;
    this.camera.lookAt(this.camLook);
  }
}
