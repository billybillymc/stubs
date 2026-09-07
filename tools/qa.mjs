/* The Passage — headless smoke test over raw CDP.
   chrome-headless-shell + Node's built-in WebSocket, no deps.
   Boots the page for real (software GL is slow, so we WAIT rather than
   budget virtual time), then walks a whole night and reports state.
   Usage: node qa.mjs [url] [--shots <dir>] */
import {spawn} from 'node:child_process';
import {writeFileSync, mkdirSync, existsSync, readdirSync} from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const URL_ = process.argv[2] || 'http://127.0.0.1:8713/ui-passage-pull.html';
const shotDir = process.argv.includes('--shots')
  ? process.argv[process.argv.indexOf('--shots') + 1] : null;
const PORT = 9333 + (Math.floor(Math.random() * 300));

/* Any Chrome will do. Set CHROME=/path/to/chrome to be explicit;
   otherwise look where the usual suspects install themselves. */
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
  /* Playwright's browsers, if they happen to be installed */
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
const chrome = spawn(EXE, [
  '--headless', '--disable-gpu', '--no-sandbox', '--enable-unsafe-swiftshader',
  '--mute-audio', '--window-size=1280,720',
  `--remote-debugging-port=${PORT}`, 'about:blank',
], {stdio: 'ignore'});

let ws, id = 0;
const pending = new Map();
const errors = [], logs = [];

function send(method, params = {}, sessionId) {
  const msg = {id: ++id, method, params};
  if (sessionId) msg.sessionId = sessionId;
  ws.send(JSON.stringify(msg));
  return new Promise((res, rej) => pending.set(msg.id, {res, rej}));
}

async function targetWs() {
  for (let i = 0; i < 60; i++) {
    try {
      const r = await fetch(`http://127.0.0.1:${PORT}/json/list`);
      const list = await r.json();
      const page = list.find(t => t.type === 'page');
      if (page) return page.webSocketDebuggerUrl;
    } catch {}
    await sleep(250);
  }
  throw new Error('devtools never came up');
}

async function evaluate(expression, awaitPromise = false) {
  const r = await send('Runtime.evaluate',
    {expression, returnByValue: true, awaitPromise});
  if (r.exceptionDetails) throw new Error('eval threw: ' +
    (r.exceptionDetails.exception?.description || r.exceptionDetails.text));
  return r.result?.value;
}

async function shot(name) {
  if (!shotDir) return;
  const r = await send('Page.captureScreenshot', {format: 'png'});
  writeFileSync(path.join(shotDir, name + '.png'), Buffer.from(r.data, 'base64'));
}

/* space, through the real key path */
async function press(key, code, vk) {
  for (const type of ['keyDown', 'keyUp']) {
    await send('Input.dispatchKeyEvent',
      {type, key, code, windowsVirtualKeyCode: vk, nativeVirtualKeyCode: vk});
  }
}

const t0 = Date.now();
const secs = () => ((Date.now() - t0) / 1000).toFixed(1) + 's';

try {
  if (shotDir) mkdirSync(shotDir, {recursive: true});
  ws = new WebSocket(await targetWs());
  await new Promise(r => ws.addEventListener('open', r));
  ws.addEventListener('message', ev => {
    const m = JSON.parse(ev.data);
    if (m.id && pending.has(m.id)) {
      const {res, rej} = pending.get(m.id); pending.delete(m.id);
      return m.error ? rej(new Error(m.error.message)) : res(m.result);
    }
    if (m.method === 'Runtime.exceptionThrown') {
      const e = m.params.exceptionDetails;
      errors.push(e.exception?.description || e.text);
    }
    if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') {
      errors.push(m.params.args.map(a => a.value ?? a.description).join(' '));
    }
    if (m.method === 'Log.entryAdded' && m.params.entry.level === 'error') {
      const t = m.params.entry.text;
      if (!/GroupMarkerNotSet|GL Driver Message|SwiftShader|software WebGL/i.test(t))
        logs.push(t);
    }
  });

  await send('Runtime.enable');
  await send('Page.enable');
  await send('Log.enable');
  await send('Page.navigate', {url: URL_});

  /* boot: wait for the curtain, however long software GL takes */
  let booted = false;
  for (let i = 0; i < 400; i++) {
    await sleep(1000);
    try {
      booted = await evaluate(
        `!!document.querySelector('#loader') &&
         document.querySelector('#loader').classList.contains('off')`);
    } catch {}
    if (booted) break;
    if (errors.length) break;
  }
  console.log(`boot: ${booted ? 'OPEN' : 'NEVER FINISHED'} after ${secs()}`);

  const state = () => evaluate(`(function(){
    var a = window.app;
    if (!a) return {noapp:true};
    return {act:a.act, idx:a.idx, busy:a.busy, acts:a.acts.length,
            names:a.acts.map(function(x){return x&&x.name}),
            card:(document.querySelector('#card h2')||{}).textContent,
            saying:!!document.querySelector('#say.on'),
            howto:!!document.querySelector('#howto.on')};
  })()`);

  console.log('after boot :', JSON.stringify(await state()));
  await shot('01-outside');

  /* walk a whole night: tear -> inside -> home -> next ticket */
  const seen = [];
  for (let step = 0; step < 3; step++) {
    await press(' ', 'Space', 32);
    for (let i = 0; i < 40; i++) {                 /* wait out the act */
      await sleep(500);
      const s = await state();
      if (!s.busy && s.act !== seen.at(-1)?.act) { seen.push(s); break; }
    }
    const s = seen.at(-1) || await state();
    console.log(`step ${step + 1}   :`, JSON.stringify(s));
    await shot(`0${step + 2}-step${step + 1}`);
  }

  console.log('errors     :', errors.length ? errors.slice(0, 4) : 'none');
  console.log('log errors :', logs.length ? logs.slice(0, 4) : 'none');
  console.log('total      :', secs());
  process.exitCode = (booted && !errors.length) ? 0 : 1;
} catch (e) {
  console.log('HARNESS FAILED:', e.message);
  console.log('errors     :', errors.slice(0, 4));
  process.exitCode = 2;
} finally {
  try { ws?.close(); } catch {}
  chrome.kill();
}
