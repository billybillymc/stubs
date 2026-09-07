/* Where the time goes. Boots, walks to the binder, and measures:
   frame rate, what the renderer is actually drawing, and how long a
   cold page turn takes versus a warm one.

   Frame rate here is SwiftShader, so the absolute number is
   meaningless — but it is the same software rasteriser before and
   after a change, and the passes worth optimising (bloom, SMAA,
   shadows) are fill-rate bound in both. Treat it as an A/B, never as
   "the page runs at N fps". */
import {spawn} from 'node:child_process';
import {existsSync, readdirSync} from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const URL_ = process.argv[2] || 'http://127.0.0.1:8713/ui-passage-pull.html';
const IDX = process.argv[3] || '9';
const PORT = 9800 + Math.floor(Math.random() * 150);
/* Any Chrome will do — the same hunt qa.mjs makes. Set CHROME=/path/to/chrome
   to be explicit; otherwise look where the usual suspects install themselves. */
function findChrome() {
  if (process.env.CHROME) return process.env.CHROME;
  const home = os.homedir();
  const guesses = [
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
    '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser',
    '/snap/bin/chromium',
  ];
  for (const base of [path.join(home, 'AppData/Local/ms-playwright'),
                      path.join(home, '.cache/ms-playwright'),
                      path.join(home, 'Library/Caches/ms-playwright')]) {
    try {
      for (const d of readdirSync(base)) {
        if (!/^chromium/.test(d)) continue;
        for (const tail of [
          'chrome-headless-shell-win64/chrome-headless-shell.exe',
          'chrome-win/chrome.exe',
          'chrome-headless-shell-mac/chrome-headless-shell',
          'chrome-mac/Chromium.app/Contents/MacOS/Chromium',
          'chrome-headless-shell-linux/chrome-headless-shell',
          'chrome-linux/chrome',
        ]) guesses.push(path.join(base, d, tail));
      }
    } catch {}
  }
  const hit = guesses.find(p => { try { return existsSync(p); } catch { return false; } });
  if (hit) return hit;
  console.log('No Chrome found. Set CHROME=/path/to/chrome and try again.');
  process.exit(2);
}
const EXE = findChrome();

const sleep = ms => new Promise(r => setTimeout(r, ms));
const chrome = spawn(EXE, ['--headless', '--disable-gpu', '--no-sandbox',
  '--enable-unsafe-swiftshader', '--mute-audio', '--window-size=1280,720',
  `--remote-debugging-port=${PORT}`, 'about:blank'], {stdio: 'ignore'});

let ws, id = 0; const pending = new Map(); const errors = [];
const send = (m, p = {}) => { const msg = {id: ++id, method: m, params: p};
  ws.send(JSON.stringify(msg));
  return new Promise((res, rej) => pending.set(msg.id, {res, rej})); };
const ev = async (e, awaitPromise = false) => {
  const r = await send('Runtime.evaluate', {expression: e, returnByValue: true, awaitPromise});
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text);
  return r.result?.value; };

const FPS = `new Promise(function(res){
  var n=0, t0=performance.now();
  (function tick(){ n++;
    if (performance.now()-t0 < 4000) requestAnimationFrame(tick);
    else res(Math.round(n/((performance.now()-t0)/1000)*10)/10);
  })();
})`;

const INFO = `(function(){
  var r=app.renderer, i=r.info;
  return {calls:i.render.calls, tris:i.render.triangles,
          geometries:i.memory.geometries, textures:i.memory.textures,
          programs:i.programs?i.programs.length:null,
          shadowAuto:r.shadowMap.autoUpdate,
          pixelRatio:r.getPixelRatio()};
})()`;

async function bootWait() {
  for (let i = 0; i < 300; i++) { await sleep(1000);
    try { if (await ev(`document.querySelector('#loader')?.classList.contains('off')`)) return true; } catch {} }
  return false;
}

try {
  let wsUrl;
  for (let i = 0; i < 60 && !wsUrl; i++) {
    try { const l = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
      wsUrl = l.find(t => t.type === 'page')?.webSocketDebuggerUrl; } catch {}
    if (!wsUrl) await sleep(250);
  }
  ws = new WebSocket(wsUrl);
  await new Promise(r => ws.addEventListener('open', r));
  ws.addEventListener('message', e => { const m = JSON.parse(e.data);
    if (m.id && pending.has(m.id)) { const {res, rej} = pending.get(m.id); pending.delete(m.id);
      return m.error ? rej(new Error(m.error.message)) : res(m.result); }
    if (m.method === 'Runtime.exceptionThrown')
      errors.push(m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text); });
  await send('Runtime.enable'); await send('Page.enable');

  const t0 = Date.now();
  await send('Page.navigate', {url: URL_});
  if (!await bootWait()) throw new Error('boot 1');
  await ev(`localStorage.setItem('passagepull.idx','${IDX}'); location.reload();`);
  await sleep(3000);
  if (!await bootWait()) throw new Error('boot 2');
  console.log('boot            :', ((Date.now() - t0) / 1000).toFixed(1) + 's (two boots)');

  console.log('act 0 fps       :', await ev(FPS, true));
  console.log('act 0 draw      :', JSON.stringify(await ev(INFO)));

  for (let hop = 0; hop < 4 && await ev('app.act') !== 2; hop++) {
    const from = await ev('app.act');
    for (const type of ['keyDown', 'keyUp'])
      await send('Input.dispatchKeyEvent', {type, key: ' ', code: 'Space',
        windowsVirtualKeyCode: 32, nativeVirtualKeyCode: 32});
    for (let j = 0; j < 60; j++) { await sleep(500);
      if (await ev(`app.act!==${from} && !app.busy && !app.acts[app.act].busy`)) break; }
  }
  await sleep(1500);
  console.log('binder fps      :', await ev(FPS, true));
  console.log('binder draw     :', JSON.stringify(await ev(INFO)));

  /* a cold page: its thumbs have never been asked for */
  const timeFlip = async d => {
    const t = Date.now();
    await ev(`app.acts[2].flip(${d})`);
    for (let i = 0; i < 60; i++) {
      await sleep(100);
      if (!await ev('app.acts[2].busy')) break;
    }
    return Date.now() - t;
  };
  console.log('flip back (cold):', await timeFlip(-1) + 'ms');
  console.log('flip fwd (warm) :', await timeFlip(1) + 'ms');
  console.log('flip back (warm):', await timeFlip(-1) + 'ms');
  console.log('after flips     :', JSON.stringify(await ev(INFO)));
  console.log('thumbs cached   :', await ev('app.__thumbs===undefined?"n/a":app.__thumbs'));
  if (errors.length) console.log('errors:', errors.slice(0, 3));
} catch (e) {
  console.log('PROBE FAILED:', e.message);
  process.exitCode = 2;
} finally { try { ws?.close(); } catch {} chrome.kill(); }
