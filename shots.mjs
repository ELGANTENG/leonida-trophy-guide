// Screenshot helper for the Leonida Trophy Guide (my own code, Node 22, standard library only).
// Drives the Playwright headless-shell Chrome over CDP: opens the guide served by serve.ts,
// marks a few story trophies earned for the cover shot (in the browser only — nothing is written
// to the entry), captures real renders, and saves them as PNGs in /tmp for conversion to JPEG.
// Usage: node shots.mjs  (serve.ts must already be running on http://localhost:8080)
import { writeFileSync } from 'node:fs';

const SHELL = process.env.CHROME_HEADLESS_SHELL;
const PORT = 9223;
const BASE = 'http://localhost:8080';
const SHOTS = [
  { file: '1-cover.jpg', path: '/?spoiler=off&open=3', earned: [2, 3, 4, 5, 6, 8, 9, 10, 11, 12, 13] },
  { file: '2-roadmap.jpg', path: '/?view=roadmap', earned: [] },
  { file: '3-tracker.jpg', path: '/?kind=missable', earned: [] },
  { file: '4-export.jpg', path: '/?view=sources', earned: [] },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function newTarget(url) {
  const res = await fetch(`http://127.0.0.1:${PORT}/json/new?${encodeURIComponent(url)}`, { method: 'PUT' });
  return res.json();
}

async function connect(wsUrl) {
  const ws = new WebSocket(wsUrl);
  await new Promise((resolve, reject) => {
    ws.onopen = resolve;
    ws.onerror = reject;
  });
  let id = 0;
  const pending = new Map();
  const errors = [];
  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) reject(new Error(msg.error.message));
      else resolve(msg.result);
    } else if (msg.method === 'Runtime.exceptionThrown') {
      errors.push('exception: ' + JSON.stringify(msg.params.exceptionDetails).slice(0, 400));
    } else if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error') {
      errors.push('console.error: ' + JSON.stringify(msg.params.args).slice(0, 400));
    } else if (msg.method === 'Log.entryAdded' && msg.params.entry.level === 'error') {
      errors.push('log error: ' + msg.params.entry.text.slice(0, 400));
    }
  };
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const mid = ++id;
    pending.set(mid, { resolve, reject });
    ws.send(JSON.stringify({ id: mid, method, params }));
  });
  return { ws, send, errors };
}

for (const shot of SHOTS) {
  const target = await newTarget('about:blank');
  const { ws, send, errors } = await connect(target.webSocketDebuggerUrl);
  await send('Runtime.enable');
  await send('Page.enable');
  await send('Log.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false });
  await send('Page.navigate', { url: BASE + shot.path });
  await sleep(2500);
  if (shot.earned.length) {
    await send('Runtime.evaluate', {
      expression: `localStorage.setItem('leonida-trophy-guide-v1', JSON.stringify(${JSON.stringify(shot.earned)})); location.reload();`,
    });
    await sleep(2500);
  }
  const shot1 = await send('Page.captureScreenshot', { format: 'png' });
  writeFileSync('/tmp/' + shot.file.replace('.jpg', '.png'), Buffer.from(shot1.data, 'base64'));
  const failed = await send('Runtime.evaluate', { expression: 'document.querySelectorAll(".trophy").length' });
  console.log(shot.file, 'trophy cards rendered:', failed.result.value, '| console/log errors:', errors.length ? errors : 'none');
  ws.close();
  await sleep(300);
}
console.log('done');
