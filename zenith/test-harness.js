/* Headless harness: stubs canvas/audio/DOM, then plays ZENITH automatically
   to catch runtime errors, impossible states, and difficulty dead-ends. */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const js = html.match(/<script>([\s\S]*?)<\/script>/)[1];

/* ── canvas 2d stub ── */
const noop = () => {};
function makeGradient() { return { addColorStop: noop }; }
const ctxStub = new Proxy({
  createLinearGradient: makeGradient,
  createRadialGradient: makeGradient,
  measureText: () => ({ width: 10 }),
  globalAlpha: 1, fillStyle: '', strokeStyle: '', lineWidth: 1,
  font: '', textAlign: 'left', shadowBlur: 0, shadowColor: '',
}, {
  get(t, k) {
    if (k in t) return t[k];
    return noop;
  },
  set(t, k, v) { t[k] = v; return true; },
});

/* ── DOM stub ── */
const listeners = { canvas: {}, window: {}, document: {} };
function bind(store) {
  return (type, fn) => { (store[type] = store[type] || []).push(fn); };
}
const canvasStub = {
  width: 0, height: 0,
  getContext: () => ctxStub,
  addEventListener: bind(listeners.canvas),
  style: {},
};

/* ── audio stub (records calls so we can assert notes actually fire) ── */
let audioCalls = 0;
function param() { return { value: 0, setValueAtTime: noop, linearRampToValueAtTime: noop,
  exponentialRampToValueAtTime: noop, cancelScheduledValues: noop }; }
class FakeNode {
  constructor() { this.frequency = param(); this.gain = param(); this.detune = param();
    this.delayTime = param(); this.Q = param(); this.type = ''; }
  connect() { return this; } disconnect() {} start() { audioCalls++; } stop() {} 
}
class FakeAudioContext {
  constructor() { this.currentTime = 0; this.sampleRate = 48000; this.state = 'running';
    this.destination = new FakeNode(); }
  createGain() { return new FakeNode(); }
  createOscillator() { return new FakeNode(); }
  createBiquadFilter() { return new FakeNode(); }
  createDelay() { return new FakeNode(); }
  createBufferSource() { return new FakeNode(); }
  createBuffer(ch, n) { return { getChannelData: () => new Float32Array(n) }; }
  resume() {}
}

/* ── storage stub ── */
const store = {};
const localStorageStub = {
  getItem: k => (k in store ? store[k] : null),
  setItem: (k, v) => { store[k] = String(v); },
};

/* ── window stub ── */
const win = {
  innerWidth: 412,      // a real Android phone viewport
  innerHeight: 892,
  devicePixelRatio: 2.6,
  matchMedia: () => ({ matches: false, addEventListener: noop }),
  AudioContext: FakeAudioContext,
  requestAnimationFrame: noop,
  addEventListener: bind(listeners.window),
  performance: { now: () => tNow },
};
const doc = {
  getElementById: () => canvasStub,
  addEventListener: bind(listeners.document),
};

let tNow = 0;
const rafQueue = [];

const sandbox = {
  window: win, document: doc, localStorage: localStorageStub,
  performance: win.performance, console,
  requestAnimationFrame: fn => { rafQueue.push(fn); return rafQueue.length; },
  Math, Date, JSON, parseInt, parseFloat, isNaN, Float32Array, Proxy, Object, Array, String, Number,
  setTimeout, clearTimeout,
};
sandbox.globalThis = sandbox;
vm.createContext(sandbox);

/* ── run the game ── */
vm.runInContext(js, sandbox, { filename: 'zenith.js' });

const fire = listeners.canvas.pointerdown[0];
if (!fire) throw new Error('no pointerdown handler bound — input is dead');
const keydown = listeners.window.keydown[0];

/* ── drive frames ── */
let frameFn = rafQueue.pop();
if (!frameFn) throw new Error('game never requested an animation frame');

function step(dtMs) {
  tNow += dtMs;
  frameFn(tNow);
  // the loop re-registers itself; grab the newest
  if (rafQueue.length) frameFn = rafQueue.pop();
}

/* ── scenarios ── */
function playRun({ strategy, maxTaps = 4000, label }) {
  // reset to title
  fire({ preventDefault: noop });            // title -> startRun
  let taps = 0, frames = 0;
  const seen = new Set();
  while (taps < maxTaps && frames < 200000) {
    step(16.67);
    frames++;
    if (frames % 3 !== 0) continue;          // tap roughly every 3 frames
    fire({ preventDefault: noop });
    taps++;
    // detect game over by probing for the retry gate: keep going until we
    // observe the tower collapse then restart
    if (frames > 20 && frames % 400 === 0) seen.add(frames);
  }
  return { taps, frames };
}

const results = [];
function log(name, fn) {
  try {
    const r = fn();
    results.push(`PASS  ${name}${r ? '  ' + r : ''}`);
  } catch (e) {
    results.push(`FAIL  ${name}\n      ${e.message}\n${(e.stack || '').split('\n').slice(1, 4).join('\n')}`);
  }
}

/* 1. boots, title renders, input starts a run */
log('boots and starts a run', () => {
  for (let i = 0; i < 10; i++) step(16.67);
  fire({ preventDefault: noop });
  for (let i = 0; i < 10; i++) step(16.67);
  return '(title -> play)';
});

/* 2. blind tapping across many runs: no exceptions, ever */
log('1500 random taps across multiple runs — no exceptions', () => {
  let taps = 0;
  for (let r = 0; r < 12 && taps < 1500; r++) {
    for (let i = 0; i < 30; i++) step(16.67);   // let title/over screens settle
    fire({ preventDefault: noop });
    for (let i = 0; i < 200 && taps < 1500; i++) {
      step(16.67);
      if (i % 4 === 0) { fire({ preventDefault: noop }); taps++; }
    }
  }
  return `(${taps} taps survived)`;
});

/* 3. long session — catches slow state leaks / NaN drift */
log('long session (12,000 frames, ~3.5 min)', () => {
  for (let i = 0; i < 12000; i++) {
    step(16.67);
    if (i % 5 === 0) fire({ preventDefault: noop });
    if (i % 3000 === 0) fire({ preventDefault: noop });
  }
  return '';
});

/* 4. keyboard also drives input */
log('keyboard input works', () => {
  keydown({ code: 'Space', preventDefault: noop });
  for (let i = 0; i < 30; i++) step(16.67);
  keydown({ code: 'Enter', preventDefault: noop });
  for (let i = 0; i < 30; i++) step(16.67);
  return '';
});

/* 5. audio actually produced sound */
log('audio engine produced voices', () => {
  if (audioCalls === 0) throw new Error('AudioContext created 0 nodes — sound is silent');
  return `(${audioCalls} audio nodes started)`;
});

/* 6. persistence wrote something */
log('persistence wrote save data', () => {
  const raw = localStorageStub.getItem('zenith.v1');
  if (!raw) throw new Error('nothing saved');
  const s = JSON.parse(raw);
  return `(best=${s.best} stacks=${s.stacks} runs=${s.runs} streak=${s.streak})`;
});

/* 7. no NaN leaked into the save */
log('save data contains no NaN', () => {
  const s = JSON.parse(localStorageStub.getItem('zenith.v1'));
  for (const k of ['best', 'bestCombo', 'stacks', 'runs', 'streak']) {
    if (!Number.isFinite(s[k])) throw new Error(`${k} = ${s[k]}`);
  }
  return '';
});

/* 8. extreme viewports do not throw */
log('renders at extreme viewports', () => {
  for (const [w, h] of [[240, 320], [320, 480], [1080, 2400], [2560, 1440], [412, 200]]) {
    win.innerWidth = w; win.innerHeight = h;
    listeners.window.resize.forEach(f => f());
    for (let i = 0; i < 40; i++) step(16.67);
  }
  return '(240x320 .. 2560x1440)';
});

/* 9. huge frame gaps (device stall) do not break physics */
log('survives 5-second frame stalls', () => {
  for (let i = 0; i < 30; i++) { step(5000); fire({ preventDefault: noop }); }
  return '';
});


/* ═══ SKILL SIMULATION ═══════════════════════════════════════════════════
   Random tapping only proves it doesn't crash. These drive the game the way
   a human would — with per-stack timing error — to prove there is a real
   difficulty curve and that no skill tier produces a dead end. */
const Z = () => win.__ZENITH__;

function gauss() {                    // Box-Muller
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

/* sigmaMs = the human's TIMING error in milliseconds, redrawn every stack.
   This is the realistic model: spatial error = timing error x block speed,
   so a fixed-ms human gets steadily worse as the tower accelerates. That IS
   the difficulty ramp, and tuning against a fixed-SPATIAL bot would lie. */
function humanRun(sigmaMs, maxFrames) {
  const sigmaSec = sigmaMs / 1000;
  const z = Z();
  z.G.phase = 'over'; z.G.deadFor = 1;
  fire({ preventDefault: noop });            // restart
  let aimErr = 0, lastLevel = -1, frames = 0;
  const cap = maxFrames || 40000;
  while (frames < cap) {
    step(16.67); frames++;
    const g = z.G;
    if (g.phase === 'over') break;
    if (g.phase !== 'play' || !g.block) continue;
    if (g.level !== lastLevel) {
      lastLevel = g.level;
      aimErr = gauss() * sigmaSec * g.speed;   // ms error -> world units at this speed
    }
    const top = g.stack[g.stack.length - 1];
    const wantX = top.x + (top.w - g.block.w) / 2 + aimErr;
    const closing = g.speed * (16.67 / 1000);
    if (Math.abs(g.block.x - wantX) <= closing * 0.5) fire({ preventDefault: noop });
  }
  return { score: z.G.score, frames, combo: z.G.bestComboRun,
           secs: +(frames * 16.67 / 1000).toFixed(1) };
}

let CURVE = null;
log('difficulty curve maps skill to score', () => {
  const tiers = [
    ['expert  ',  25], ['good    ',  45], ['average ',  70],
    ['casual  ', 110], ['beginner', 180],
  ];
  CURVE = {};
  const lines = [];
  for (const [name, sigma] of tiers) {
    const runs = [];
    for (let i = 0; i < 7; i++) runs.push(humanRun(sigma, 40000));
    const scores = runs.map(r => r.score).sort((a, b) => a - b);
    const med = scores[3];
    const maxSecs = Math.max(...runs.map(r => r.secs));
    CURVE[name.trim()] = { med, scores, maxSecs };
    const blocks = runs.map(r => r.score);
    lines.push(`${name} (${sigma}ms)  median ${String(med).padStart(4)}  runs ${scores.join('/')}  longest ${maxSecs}s`);
  }
  return '\n      ' + lines.join('\n      ');
});

log('no skill tier hits a dead end (all can score)', () => {
  if (!CURVE) throw new Error('curve not computed');
  const broken = Object.entries(CURVE).filter(([, v]) => v.med < 3);
  if (broken.length) throw new Error(`${broken.map(b => b[0]).join(',')} cannot score — unwinnable`);
  return '';
});

log('the game is losable — even expert play ends', () => {
  if (!CURVE) throw new Error('curve not computed');
  if (CURVE.expert.med > 260) throw new Error(`expert median ${CURVE.expert.med} — no ceiling, run never ends`);
  return `(expert median ${CURVE.expert.med}, longest run ${CURVE.expert.maxSecs}s)`;
});

log('beginner runs are short enough to stay in the retry loop', () => {
  if (!CURVE) throw new Error('curve not computed');
  if (CURVE.beginner.med > 30) throw new Error(`beginner median ${CURVE.beginner.med} — first runs too long, weak hook`);
  return `(beginner median ${CURVE.beginner.med})`;
});

log('combo + regrow economy fires', () => {
  const r = humanRun(0.04, 20000);
  if (r.combo < 5) throw new Error(`peak combo only ${r.combo}`);
  return `(peak combo ${r.combo}, score ${r.score})`;
});

log('biome transitions fire and persist to save', () => {
  const seen = Object.keys(Z().SAVE.seen);
  if (seen.length < 2) throw new Error(`only ${seen.length} biome(s): ${seen.join(',')}`);
  return `(unlocked: ${seen.join(', ')})`;
});

log('block width stays within [MIN_W, BASE_W]', () => {
  const z = Z();
  for (const s of z.G.stack) {
    if (s.w < z.CFG.MIN_W - 0.001 || s.w > z.CFG.BASE_W + 0.001)
      throw new Error(`width ${s.w} outside [${z.CFG.MIN_W}, ${z.CFG.BASE_W}]`);
  }
  return '';
});

console.log('\n' + results.join('\n\n'));
const failed = results.filter(r => r.startsWith('FAIL')).length;
console.log(`\n${results.length - failed}/${results.length} passed`);
process.exit(failed ? 1 : 0);
