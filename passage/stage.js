/* The renderer, the environment, and the lens that fails.
   Part of The Passage — see ui-passage-pull.html. */
import * as THREE from 'three';
import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/addons/postprocessing/RenderPass.js';
import {UnrealBloomPass} from 'three/addons/postprocessing/UnrealBloomPass.js';
import {ShaderPass} from 'three/addons/postprocessing/ShaderPass.js';
import {OutputPass} from 'three/addons/postprocessing/OutputPass.js';
import {SMAAPass} from 'three/addons/postprocessing/SMAAPass.js';
import {cv} from './tex.js';

/* ================================================================
   RENDERER + THE LENS THAT FAILS
================================================================ */
export const canvas=document.getElementById('stage');
export const renderer=new THREE.WebGLRenderer({canvas,antialias:false});
/* soft resolve — the free "this is video" softness. Nudged up from
   .78 now that SMAA cleans the edges; below this the stair-stepping
   was doing more damage than the softness was buying. */
renderer.setPixelRatio(Math.min(devicePixelRatio,1.4)*0.85);
renderer.setSize(innerWidth,innerHeight);
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=.94;
renderer.shadowMap.enabled=true;
renderer.shadowMap.type=THREE.PCFSoftShadowMap;
export const MAXA=Math.min(8,renderer.capabilities.getMaxAnisotropy());

export const pmrem=new THREE.PMREMGenerator(renderer);
pmrem.compileEquirectangularShader();
export function envMap(top,mid,bot,blobs){
  const c=cv(256,128),g=c.getContext('2d');
  const gr=g.createLinearGradient(0,0,0,128);
  gr.addColorStop(0,top); gr.addColorStop(.55,mid); gr.addColorStop(1,bot);
  g.fillStyle=gr; g.fillRect(0,0,256,128);
  (blobs||[]).forEach(b=>{
    const rg=g.createRadialGradient(b.x,b.y,0,b.x,b.y,b.r);
    rg.addColorStop(0,b.c); rg.addColorStop(1,'rgba(0,0,0,0)');
    g.fillStyle=rg; g.fillRect(b.x-b.r,b.y-b.r,b.r*2,b.r*2);
  });
  const t=new THREE.CanvasTexture(c);
  t.mapping=THREE.EquirectangularReflectionMapping;
  t.colorSpace=THREE.SRGBColorSpace;
  const env=pmrem.fromEquirectangular(t).texture;
  t.dispose();
  return env;
}

export const LensShader={
  uniforms:{tDiffuse:{value:null},uTime:{value:0},uAmt:{value:1}},
  vertexShader:`varying vec2 vUv; void main(){vUv=uv;
    gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
  fragmentShader:`
    uniform sampler2D tDiffuse; uniform float uTime, uAmt; varying vec2 vUv;
    float hash(vec2 p){ return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453); }
    void main(){
      vec2 c=vUv-0.5; float r2=dot(c,c);
      float k=0.055*uAmt, ca=0.010*uAmt;
      vec2 uvR=0.5+c*(1.0+(k+ca)*r2);
      vec2 uvG=0.5+c*(1.0+k*r2);
      vec2 uvB=0.5+c*(1.0+(k-ca)*r2);
      vec3 col=vec3(texture2D(tDiffuse,uvR).r,
                    texture2D(tDiffuse,uvG).g,
                    texture2D(tDiffuse,uvB).b);
      float grain=hash(vUv*vec2(1024.0,1024.0)+uTime);
      col+=(grain-0.5)*0.045*uAmt;
      col*=1.0-0.32*uAmt*smoothstep(0.32,0.85,length(c));
      col=mix(vec3(0.045*uAmt),vec3(1.0),col);   // lifted blacks
      gl_FragColor=vec4(col,1.0);
    }`
};

export const composer=new EffectComposer(renderer);
export const renderPass=new RenderPass(new THREE.Scene(),new THREE.PerspectiveCamera());
composer.addPass(renderPass);
/* Threshold was .8, which caught lit plaster and not just lamps — that
   is what greyed the marquee letters and hazed the corridor. At .95
   only things that are actually emitting bloom, so the strength can
   come up and the radius come in without the whole frame going soft. */
export const bloom=new UnrealBloomPass(new THREE.Vector2(innerWidth,innerHeight),.5,.5,.95);
composer.addPass(bloom);
export const lensPass=new ShaderPass(LensShader);
composer.addPass(lensPass);
/* SMAA last, after the grade — MSAA is unavailable through a composer,
   so without this every edge in the scene crawls */
export const smaa=new SMAAPass(innerWidth,innerHeight);
composer.addPass(smaa);
composer.addPass(new OutputPass());
