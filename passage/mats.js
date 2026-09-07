/* Material discipline, and light with a shape to it.
   Part of The Passage — see ui-passage-pull.html. */
import * as THREE from 'three';
import {cv} from './tex.js';

/* ================================================================
   MATERIAL DISCIPLINE
   Painted trim gets a satin sheen; plaster, carpet and fabric stay
   dead matte; light sources are unlit so the tone mapper clips them.
================================================================ */
/* ----------------------------------------------------------------
   SURFACES
   Everything here used to be Lambert and Phong, which is the reason
   the rooms read flat: Lambert has no specular at all, and Phong's is
   not energy-conserving. Neither one brightens at a grazing angle,
   and that Fresnel roll-off is most of what tells your eye a wall is
   painted plaster and not paper. Standard gives us that plus image
   based lighting off scene.environment; `metal` needs the environment
   to exist at all, or it renders black.
---------------------------------------------------------------- */
const DOWNGRADED=new Map();
export function thin(root,{lights=true,materials=true,merge=false}={}){
  const doomed=[]; let swapped=0;
  root.traverse(o=>{
    if(lights&&o.isPointLight){
      /* dead, or unable to reach past its own fixture */
      if(o.intensity<=.5||(o.distance>0&&o.distance<=1.5)) doomed.push(o);
    }
    if(materials&&o.isMesh&&o.material){
      const list=Array.isArray(o.material)?o.material:[o.material];
      const out=list.map(m=>{
        if(!m||m.type!=='MeshPhysicalMaterial') return m;
        if(m.clearcoat>0||m.transmission>0||m.iridescence>0||m.sheen>0) return m;
        let s=DOWNGRADED.get(m.uuid);
        if(!s){
          /* copy() on a Standard material takes exactly the standard
             half of a Physical one — maps, roughness, metalness,
             emissive, envMapIntensity, side, the lot */
          s=new THREE.MeshStandardMaterial(); s.copy(m);
          DOWNGRADED.set(m.uuid,s);
        }
        swapped++; return s;
      });
      o.material=Array.isArray(o.material)?out:out[0];
    }
  });
  if(merge&&doomed.length>1){
    const keep=doomed.shift();
    keep.intensity=doomed.reduce((s,l)=>s+l.intensity,keep.intensity);
  }
  for(const l of doomed) l.removeFromParent();
  return {lights:doomed.length,materials:swapped};
}

export const matte=(o)=>new THREE.MeshStandardMaterial(
  Object.assign({roughness:.94,metalness:0},o));
/* shininess 14..34 mapped onto roughness, smoother as it climbs */
export const satin=(color,sh=20)=>new THREE.MeshStandardMaterial(
  {color,roughness:THREE.MathUtils.clamp(.78-sh*.013,.30,.72),metalness:0});
export const metal=(color,rough=.34)=>new THREE.MeshStandardMaterial(
  {color,roughness:rough,metalness:1});
export const unlit=(color)=>new THREE.MeshBasicMaterial({color});

/* ================================================================
   LIGHT WITH SHAPE — scallops down walls, pools on floors,
   contact shadows where things meet the ground.
================================================================ */
export let SCALLOP=null,POOL=null,STRIP=null;
export function scallopMat(){
  if(!SCALLOP){
    const c=cv(64,128),g=c.getContext('2d');
    const rg=g.createRadialGradient(32,10,2,32,10,74);
    rg.addColorStop(0,'rgba(255,220,170,.85)');
    rg.addColorStop(.5,'rgba(255,200,140,.22)');
    rg.addColorStop(1,'rgba(255,190,130,0)');
    g.fillStyle=rg; g.fillRect(0,0,64,128);
    SCALLOP=new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(c),transparent:true,
      opacity:.17,blending:THREE.AdditiveBlending,depthWrite:false});
  }
  return SCALLOP;
}
export function poolMat(){
  if(!POOL){
    const c=cv(128,128),g=c.getContext('2d');
    const rg=g.createRadialGradient(64,64,4,64,64,62);
    rg.addColorStop(0,'rgba(255,214,160,.75)');
    rg.addColorStop(1,'rgba(255,200,140,0)');
    g.fillStyle=rg; g.fillRect(0,0,128,128);
    POOL=new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(c),transparent:true,
      opacity:.34,blending:THREE.AdditiveBlending,depthWrite:false});
  }
  return POOL;
}
export function stripMat(){
  if(!STRIP){
    const c=cv(8,64),g=c.getContext('2d');
    const lg=g.createLinearGradient(0,0,0,64);
    lg.addColorStop(0,'rgba(0,0,0,.42)'); lg.addColorStop(1,'rgba(0,0,0,0)');
    g.fillStyle=lg; g.fillRect(0,0,8,64);
    STRIP=new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(c),transparent:true,
      opacity:.85,depthWrite:false});
  }
  return STRIP;
}
/* a contact shadow lying on the floor along a wall */
export function contact(parent,len,x,z,rotY=0,depth=1.1){
  const m=new THREE.Mesh(new THREE.PlaneGeometry(len,depth),stripMat());
  m.rotation.x=-Math.PI/2; m.rotation.z=rotY;
  m.position.set(x,.016,z); m.renderOrder=2; parent.add(m);
  return m;
}
export function scallop(parent,w,h,x,y,z,rotY=0){
  const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),scallopMat());
  m.position.set(x,y,z); m.rotation.y=rotY; m.renderOrder=3; parent.add(m);
  return m;
}
export function pool(parent,r,x,z){
  const m=new THREE.Mesh(new THREE.PlaneGeometry(r,r*.72),poolMat());
  m.rotation.x=-Math.PI/2; m.position.set(x,.022,z); m.renderOrder=3; parent.add(m);
  return m;
}
