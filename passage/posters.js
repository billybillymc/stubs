/* The bill, the poster art, and the texture cache behind them.
   Part of The Passage — see ui-passage-pull.html. */
import * as THREE from 'three';
import {nearbyFilms,posterCanvas} from '../films.js';
import {createLEDPosterDisplayCaseModel} from '../poster-case.js';
import {TICKETS} from './tickets.js';
import {pool,thin} from './mats.js';
import {MAXA} from './stage.js';
import {searchUrl,pickPoster} from './wiki.js';

export let CASE_PROTO=null;
export function posterCase(targetH){
  if(!CASE_PROTO){
    CASE_PROTO=createLEDPosterDisplayCaseModel({
      castShadow:true,receiveShadow:true,
      textureSize:512,textureAnisotropy:MAXA,qualityPriority:'balanced'});
    /* four LED ring practicals per case, sealed inside it */
    thin(CASE_PROTO,{merge:true});
    CASE_PROTO.updateMatrixWorld(true);
    const bb=new THREE.Box3().setFromObject(CASE_PROTO);
    CASE_PROTO.userData.h=Math.max(.001,bb.max.y-bb.min.y);
  }
  const g=CASE_PROTO.clone(true);
  g.scale.setScalar(targetH/CASE_PROTO.userData.h);
  let art=null;
  g.traverse(o=>{ if(!art&&o.isMesh&&/poster artwork/i.test(o.name||'')) art=o; });
  if(art){
    art.material=art.material.clone();
    /* the model ships carrying its own reference poster; blank it so a
       case reads as an empty case until this page puts a picture in */
    art.material.map=null; art.material.emissiveMap=null;
    art.material.emissiveIntensity=0;
    if(art.material.color) art.material.color.set(0x14110f);
    art.material.needsUpdate=true;
  }
  return {group:g,art};
}
/* the case is already backlit, so the picture only needs its map and a
   little emissive to sit in the light the case is throwing */
export function lightPoster(mat,tx){
  if(!mat) return;
  mat.map=tx; mat.emissiveMap=tx;
  if(mat.emissive) mat.emissive.set(0xffffff);
  mat.emissiveIntensity=.85;
  if(mat.color) mat.color.set(0xffffff);
  mat.needsUpdate=true;
}

/* ================================================================
   TEXTURE POOL
================================================================ */
export const loader=new THREE.TextureLoader();
/* ----------------------------------------------------------------
   TEXTURE CACHE
   Two pools, because the two kinds of image behave nothing alike.

   Thumbs are ~27KB, there are 191 of them, and the binder wants any of
   them at any moment — so they are loaded once at boot and kept for
   good. Full-res stubs are ~600KB each and only one or two are ever on
   screen, so those stay on a small LRU.
---------------------------------------------------------------- */
export const POOLS={images:new Map(),thumbs:new Map()};
export const POOL_CAP={images:16,thumbs:Infinity};
export function getTex(file,dir='images'){
  const pool=POOLS[dir]||(POOLS[dir]=new Map());
  const k=dir+'/'+file;
  let e=pool.get(k);
  if(e){ pool.delete(k); pool.set(k,e); return e.p; }   /* touch: real LRU */
  e={p:new Promise(res=>loader.load(k,t=>{t.colorSpace=THREE.SRGBColorSpace;
    t.anisotropy=MAXA; res(t);},undefined,()=>res(null)))};
  pool.set(k,e);
  const cap=POOL_CAP[dir]==null?16:POOL_CAP[dir];
  while(pool.size>cap){
    const oldK=pool.keys().next().value, old=pool.get(oldK);
    pool.delete(oldK);
    /* safe to free: the stub on screen is always the most recent
       request, so the least recent is never the one being displayed */
    old.p.then(t=>{ if(t) t.dispose(); }).catch(()=>{});
  }
  return e.p;
}

/* ================================================================
   THE BILL — what else was playing that season.
   The stub in your hand is one picture on the wall; the rest are
   other films that were out around the same date, drawn from
   films.js rather than from the shoebox.
================================================================ */
export function billFor(idx,n){
  const cur=TICKETS[idx];
  const mine=cur.title||cur.title_raw||'';
  /* a stub too faded to read gives up its slot — the wall fills with
     the season rather than hanging one blank case */
  const out=mine?[{title:mine,date:cur.date,year:(cur.date||'').slice(0,4)}]:[];
  for(const f of nearbyFilms(cur.date,Math.max(0,n-out.length),mine))
    out.push({title:f.t,date:f.d,year:(f.d||'').slice(0,4)});
  return out;
}
export function marqueeBill(idx){ return billFor(idx,4); }

/* the drawn stand-in, when Wikipedia has no art for a title */
export const DRAWN=new Map();
export function drawnTex(t){
  const k=(t.title||'')+'|'+(t.date||'');
  let tx=DRAWN.get(k);
  if(!tx){
    tx=new THREE.CanvasTexture(posterCanvas(t.title||'',t.date||''));
    tx.colorSpace=THREE.SRGBColorSpace; tx.anisotropy=MAXA;
    DRAWN.set(k,tx);
  }
  return tx;
}

export const posterPool=new Map();
/* one sweep, on the way in, of the URLs the old rule chose */
try{
  const stale=[];
  for(let i=0;i<localStorage.length;i++){
    const k=localStorage.key(i);
    if(k&&k.startsWith('passage.poster.')&&!k.startsWith('passage.poster.2.')) stale.push(k);
  }
  for(const k of stale) localStorage.removeItem(k);
}catch(e){}

export function posterTex(t){
  const key=t.title||t.title_raw||'';
  if(!key) return Promise.resolve(null);
  if(posterPool.has(key)) return posterPool.get(key);
  const p=(async()=>{
    /* Art on disk wins. posters.js is written by tools/fetch-posters.mjs
       and keyed by this same title: a path means load it, an explicit
       null means Wikipedia was asked and had nothing, so draw the card
       and do not ask again. */
    const local=(window.POSTERS||{})[key];
    if(local===null) return null;
    if(typeof local==='string'&&local){
      const tx=await new Promise(res=>loader.load(local,t=>{
        t.colorSpace=THREE.SRGBColorSpace; t.anisotropy=MAXA; res(t);
      },undefined,()=>res(null)));
      if(tx) return tx;
      /* the manifest points at a file that is not there: fall through */
    }
    const lsKey='passage.poster.2.'+key;
    let url=null;
    try{ url=localStorage.getItem(lsKey); }catch(e){}
    if(url===null){
      try{
        /* which article is "the film" is decided in wiki.js, so the
           page and the fetch tool can never disagree about it */
        const r=await fetch(searchUrl(key,t.year));
        const j=await r.json();
        const pages=(j.query&&j.query.pages)?Object.values(j.query.pages):[];
        const pick=pickPoster(pages,key,t.year);
        url=(pick&&pick.url)||'';
      }catch(e){ url=''; }
      try{ localStorage.setItem(lsKey,url); }catch(e){}
    }
    if(!url) return null;
    return await new Promise(res=>loader.load(url,tx=>{
      tx.colorSpace=THREE.SRGBColorSpace; tx.anisotropy=MAXA; res(tx);
    },undefined,()=>res(null)));
  })();
  posterPool.set(key,p);
  return p;
}
