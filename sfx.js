/* ================================================================
   SOUND — fully procedural WebAudio, no asset files.
   Shared by ui-rituals.html and ui-passage.html.
================================================================ */
const SFX=(()=>{
  let ac=null,master=null,humNodes=null;
  let muted=localStorage.getItem('rituals.mute')==='1';
  function ensure(){
    if(!ac){
      const AC=window.AudioContext||window.webkitAudioContext;
      if(!AC) return false;
      ac=new AC();
      master=ac.createGain();
      master.gain.value=muted?0:.55;
      master.connect(ac.destination);
    }
    if(ac.state==='suspended') ac.resume();
    return true;
  }
  function noiseBuf(dur,shape){
    const n=Math.max(1,Math.floor(ac.sampleRate*dur));
    const b=ac.createBuffer(1,n,ac.sampleRate);
    const d=b.getChannelData(0);
    for(let i=0;i<n;i++) d[i]=(Math.random()*2-1)*shape(i/n);
    return b;
  }
  function env(g,t0,a,peak,dur){
    g.gain.setValueAtTime(.0001,t0);
    g.gain.exponentialRampToValueAtTime(peak,t0+a);
    g.gain.exponentialRampToValueAtTime(.0001,t0+dur);
  }
  /* fibrous crackling paper tear */
  function tear(){
    if(!ensure())return;
    const t0=ac.currentTime;
    let spike=0;
    const buf=noiseBuf(.5,t=>{
      if(Math.random()<.005) spike=1;
      spike*=.998;
      return Math.pow(Math.sin(Math.PI*Math.min(1,t*1.12)),.6)*(.26+spike*1.4);
    });
    const src=ac.createBufferSource(); src.buffer=buf;
    const bp=ac.createBiquadFilter(); bp.type='bandpass'; bp.Q.value=.7;
    bp.frequency.setValueAtTime(2300,t0);
    bp.frequency.exponentialRampToValueAtTime(650,t0+.5);
    const g=ac.createGain(); g.gain.value=1.1;
    src.connect(bp); bp.connect(g); g.connect(master);
    src.start(t0);
  }
  /* soft paper-on-plastic slide */
  function slide(vol=.25,dur=.32){
    if(!ensure())return;
    const t0=ac.currentTime;
    const buf=noiseBuf(dur,t=>Math.pow(Math.sin(Math.PI*t),1.6));
    const src=ac.createBufferSource(); src.buffer=buf;
    const lp=ac.createBiquadFilter(); lp.type='lowpass'; lp.frequency.value=2400;
    const g=ac.createGain(); g.gain.value=vol;
    src.connect(lp); lp.connect(g); g.connect(master);
    src.start(t0);
  }
  /* ticket seating into a pocket — low thup + paper tick */
  function seat(){
    if(!ensure())return;
    const t0=ac.currentTime;
    const o=ac.createOscillator(); o.type='sine';
    o.frequency.setValueAtTime(175,t0);
    o.frequency.exponentialRampToValueAtTime(85,t0+.09);
    const g=ac.createGain(); env(g,t0,.004,.5,.12);
    o.connect(g); g.connect(master); o.start(t0); o.stop(t0+.13);
    const buf=noiseBuf(.05,t=>1-t);
    const src=ac.createBufferSource(); src.buffer=buf;
    const hp=ac.createBiquadFilter(); hp.type='highpass'; hp.frequency.value=1400;
    const g2=ac.createGain(); g2.gain.value=.12;
    src.connect(hp); hp.connect(g2); g2.connect(master); src.start(t0);
  }
  /* torn half landing on the table */
  function tap(pitch=1){
    if(!ensure())return;
    const t0=ac.currentTime;
    const o=ac.createOscillator(); o.type='sine';
    o.frequency.setValueAtTime(230*pitch,t0);
    o.frequency.exponentialRampToValueAtTime(110*pitch,t0+.06);
    const g=ac.createGain(); env(g,t0,.003,.22,.08);
    o.connect(g); g.connect(master); o.start(t0); o.stop(t0+.09);
  }
  /* binder page turn — swoosh rising into a flap */
  function flip(){
    if(!ensure())return;
    const t0=ac.currentTime;
    const buf=noiseBuf(.42,t=>Math.pow(Math.sin(Math.PI*t),2));
    const src=ac.createBufferSource(); src.buffer=buf;
    const bp=ac.createBiquadFilter(); bp.type='bandpass'; bp.Q.value=.6;
    bp.frequency.setValueAtTime(340,t0);
    bp.frequency.exponentialRampToValueAtTime(1700,t0+.38);
    const g=ac.createGain(); g.gain.value=.5;
    src.connect(bp); bp.connect(g); g.connect(master); src.start(t0);
    const o=ac.createOscillator(); o.type='triangle';
    o.frequency.setValueAtTime(115,t0+.4);
    o.frequency.exponentialRampToValueAtTime(58,t0+.52);
    const g2=ac.createGain(); env(g2,t0+.4,.006,.4,.15);
    o.connect(g2); g2.connect(master); o.start(t0+.4); o.stop(t0+.58);
  }
  /* hand entering / leaving frame */
  function whoosh(up=1,vol=.22){
    if(!ensure())return;
    const t0=ac.currentTime;
    const buf=noiseBuf(.34,t=>Math.pow(Math.sin(Math.PI*t),2.2));
    const src=ac.createBufferSource(); src.buffer=buf;
    const bp=ac.createBiquadFilter(); bp.type='bandpass'; bp.Q.value=.8;
    if(up>0){ bp.frequency.setValueAtTime(420,t0); bp.frequency.exponentialRampToValueAtTime(1300,t0+.3); }
    else    { bp.frequency.setValueAtTime(1300,t0); bp.frequency.exponentialRampToValueAtTime(380,t0+.3); }
    const g=ac.createGain(); g.gain.value=vol;
    src.connect(bp); bp.connect(g); g.connect(master); src.start(t0);
  }
  /* marquee letterboard clatter — split-flap ticks */
  function clatter(dur=.9){
    if(!ensure())return;
    const t0=ac.currentTime;
    const n=Math.floor(dur/.055);
    for(let i=0;i<n;i++){
      const t=t0+i*.055+Math.random()*.018;
      const o=ac.createOscillator(); o.type='square';
      o.frequency.value=1500+Math.random()*900;
      const g=ac.createGain(); env(g,t,.002,.035+Math.random()*.025,.03);
      o.connect(g); g.connect(master); o.start(t); o.stop(t+.04);
      const o2=ac.createOscillator(); o2.type='triangle';
      o2.frequency.value=300+Math.random()*150;
      const g2=ac.createGain(); env(g2,t,.001,.05,.05);
      o2.connect(g2); g2.connect(master); o2.start(t); o2.stop(t+.06);
    }
  }
  /* faint neon-and-bulbs hum for the marquee scene */
  function humStart(){
    if(!ensure()||humNodes)return;
    const o=ac.createOscillator(); o.type='sawtooth'; o.frequency.value=120;
    const lp=ac.createBiquadFilter(); lp.type='lowpass'; lp.frequency.value=380;
    const g=ac.createGain(); g.gain.value=.028;
    const lfo=ac.createOscillator(); lfo.frequency.value=8.2;
    const lfoG=ac.createGain(); lfoG.gain.value=.011;
    lfo.connect(lfoG); lfoG.connect(g.gain);
    o.connect(lp); lp.connect(g); g.connect(master);
    o.start(); lfo.start();
    humNodes={o,lfo,g};
  }
  function humStop(){
    if(!humNodes)return;
    const {o,lfo,g}=humNodes; humNodes=null;
    try{
      g.gain.setTargetAtTime(.0001,ac.currentTime,.12);
      o.stop(ac.currentTime+.5); lfo.stop(ac.currentTime+.5);
    }catch(e){}
  }
  function toggle(){
    muted=!muted;
    localStorage.setItem('rituals.mute',muted?'1':'0');
    if(master) master.gain.value=muted?0:.55;
    return muted;
  }
  return {ensure,tear,slide,seat,tap,flip,whoosh,clatter,humStart,humStop,toggle,get muted(){return muted;}};
})();
addEventListener('pointerdown',()=>SFX.ensure(),{capture:true});
addEventListener('keydown',()=>SFX.ensure(),{capture:true});

export {SFX};
