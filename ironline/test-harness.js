/* Headless harness for IRONLINE.
   Stubs canvas/audio/DOM, boots the game, then plays real battles with a
   competent bot so we can measure balance rather than guess at it. */
const fs = require('fs'), path = require('path'), vm = require('vm');

const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const js = html.match(/<script>([\s\S]*?)<\/script>/)[1];

/* ── canvas 2d stub ── */
const noop = () => {};
const mkGrad = () => ({ addColorStop: noop });
const ctxStub = new Proxy({
  createLinearGradient: mkGrad, createRadialGradient: mkGrad,
  measureText: () => ({ width: 10 }),
  globalAlpha: 1, fillStyle: '', strokeStyle: '', lineWidth: 1,
  font: '', textAlign: 'left', shadowBlur: 0, shadowColor: '',
}, { get(t, k) { return (k in t) ? t[k] : noop; }, set(t, k, v) { t[k] = v; return true; } });

const listeners = { canvas: {}, window: {}, document: {} };
const bind = store => (type, fn) => { (store[type] = store[type] || []).push(fn); };

let tNow = 0;
const rafQueue = [];

class FakeNode {
  constructor() { const p = () => ({ value:0, setValueAtTime:noop, linearRampToValueAtTime:noop,
    exponentialRampToValueAtTime:noop, cancelScheduledValues:noop });
    this.frequency=p(); this.gain=p(); this.detune=p(); this.delayTime=p();
    this.Q=p(); this.type=''; }
  connect() { return this; } disconnect() {} start() {} stop() {}
}
class FakeAC {
  constructor(){ this.currentTime=0; this.sampleRate=48000; this.state='running';
    this.destination = new FakeNode(); }
  createGain(){return new FakeNode();} createOscillator(){return new FakeNode();}
  createBiquadFilter(){return new FakeNode();} createDelay(){return new FakeNode();}
  createBufferSource(){return new FakeNode();}
  createBuffer(c,n){ return { getChannelData: () => new Float32Array(n) }; }
  resume(){}
}

const store = {};
const win = {
  innerWidth: 412, innerHeight: 892, devicePixelRatio: 2.6,
  matchMedia: () => ({ matches:false, addEventListener: noop }),
  AudioContext: FakeAC,
  addEventListener: bind(listeners.window),
  performance: { now: () => tNow },
};
const doc = { getElementById: () => canvasStub, addEventListener: bind(listeners.document) };
const canvasStub = { width:0, height:0, getContext: () => ctxStub,
  addEventListener: bind(listeners.canvas), style:{} };

const sandbox = {
  window: win, document: doc, localStorage: {
    getItem: k => (k in store ? store[k] : null),
    setItem: (k,v) => { store[k] = String(v); },
  },
  performance: win.performance, console, Math, Date, JSON,
  parseInt, parseFloat, isNaN, Object, Array, String, Number, Float32Array, Proxy,
  requestAnimationFrame: fn => { rafQueue.push(fn); return rafQueue.length; },
  setTimeout, clearTimeout,
};
sandbox.globalThis = sandbox;
vm.createContext(sandbox);
vm.runInContext(js, sandbox, { filename: 'ironline.js' });

const Z = win.__IRONLINE__;
if (!Z) throw new Error('test hook __IRONLINE__ missing');

let frameFn = rafQueue.pop();
if (!frameFn) throw new Error('no animation frame requested');
function step(ms) { tNow += ms; frameFn(tNow); if (rafQueue.length) frameFn = rafQueue.pop(); }

const results = [];
function log(name, fn) {
  try { const r = fn(); results.push(`PASS  ${name}${r ? '  ' + r : ''}`); }
  catch (e) { results.push(`FAIL  ${name}\n      ${e.message}\n${(e.stack||'').split('\n').slice(1,4).join('\n')}`); }
}
const assert = (c, m) => { if (!c) throw new Error(m); };

/* ═══ BOT PLAYER ═════════════════════════════════════════════════════════
   A competent human: hold elixir, answer threats with the right card,
   push when the board is clear and elixir is banked. */
function botPlay(missionId, skill, opts) {
  const o = opts || {};
  Z.SAVE.autoDeck();                 // give the bot a legal deck each run
  Z.startBattle(missionId);
  const B = Z.G.battle;
  if (!B) throw new Error('battle did not start for mission ' + missionId);
  let playerKills = 0, playerDeaths = 0;
  const counted = new Set();

  let frames = 0, deployTimer = 0;
  const maxFrames = 60 * 240;                     // 4 minutes of sim, hard cap

  while (frames < maxFrames && Z.G.scene === 'battle') {
    step(1000/60); frames++;

    const b = Z.G.battle;
    if (!b || b.over) { if (b && b.over) step(1000/60); if (Z.G.scene !== 'battle') break; continue; }
    for (const u of b.units) if (u.dead && !counted.has(u.id)) {
      counted.add(u.id); if (u.isPlayer) playerDeaths++; else playerKills++;
    }

    deployTimer -= 1/60;
    if (deployTimer > 0) continue;
    deployTimer = 0.22 + (1 - skill) * 0.5;       // lower skill = slower reactions + worse choices

    const side = b.p;
    const foes = b.units.filter(u => !u.dead && !u.isPlayer);
    const mine = b.units.filter(u => !u.dead && u.isPlayer);
    const threat = foes.filter(u => u.x > 560);
    const tight = foes.some(u => u.x > 820);

    /* score every card in hand by how well it answers the current board */
    let best = null, bestS = -1e9;
    for (let i = 0; i < side.hand.length; i++) {
      const k = side.hand[i], d = Z.U[k];
      if (!d || d.cost > side.elixir) continue;
      let s = Math.random() * (1 - skill) * 3.0;
      const swarms = foes.filter(u => u.type === 'swarm').length;
      const tanks  = foes.filter(u => u.def.hp >= 600).length;
      const melee  = foes.filter(u => u.def.kind === 'melee').length;

      if (d.kind === 'splash')  s += swarms * 2.6 + melee * 0.7;
      if (d.kind === 'ranged' && d.dmg >= 80) s += tanks * 2.4;
      if (d.kind === 'melee' && d.hp >= 600)  s += (melee + swarms) * 0.9;
      if (d.kind === 'heal')    s += mine.length >= 3 ? 2.0 : -1.0;
      if (k === 'strike')       s += (swarms >= 2 || foes.length >= 3) ? 3.4 : -3.0;
      if (d.cost <= 2)          s += (threat.length || tight) ? 1.4 : 0.3;
      if (d.cost >= 5)          s += side.elixir >= 7 ? 1.8 : -2.0;
      s += d.hp / 400;                               // prefer durable bodies when unsure
      if (s > bestS) { bestS = s; best = { i, k, d }; }
    }
    if (!best) continue;

    /* Hold when nothing is happening — but a banked elixir bar is wasted
       pressure, so a competent player keeps the push going. */
    /* Hold when nothing is happening, but a banked bar is wasted pressure. */
    const ahead = side.elixir > b.e.elixir + 3;
    if (!threat.length && !tight && side.elixir < (ahead ? 5 : 7)) continue;
    if (!threat.length && mine.length >= 3 && side.elixir < (ahead ? 7 : 9)) continue;

    let tx;
    if (best.d.kind === 'spell') {
      if (!foes.length) continue;
      let bx = foes[0].x, n = 0;
      for (const f of foes) {                       // aim at the densest cluster
        const c = foes.filter(o => Math.abs(o.x - f.x) < best.d.splash).length;
        if (c > n) { n = c; bx = f.x; }
      }
      tx = Math.max(120, Math.min(1080, bx));
    } else if (tight) {
      tx = 300 + Math.random() * 120;                // defend close to our core
    } else if (threat.length) {
      tx = 430 + Math.random() * 150;
    } else {
      tx = 520 + Math.random() * 70;                 // push forward
    }
    const ok = (tx >= Z.WORLD.P_DEPLOY[0] && tx <= Z.WORLD.P_DEPLOY[1]) || best.d.kind === 'spell';
    if (!ok) tx = 500;

    Z.playerDeploy(best.i, tx, (Math.random() - 0.5) * 20);
  }

  const b = Z.G.battle;
  if (!b) return null;
  /* let the win/lose transition complete */
  for (let i = 0; i < 80 && Z.G.scene === 'battle'; i++) step(1000/60);
  const res = Z.G.result;
  return {
    won: res ? res.won : null,
    byCore: !!(b.e.baseHp <= 0),
    timeLeft: Math.max(0, b.time),
    remaining: b.p.baseHp / b.p.baseMax,
    frames, seconds: +(frames/60).toFixed(1),
    deployed: b.stats.units, dmg: Math.round(b.stats.dmg),
    deaths: playerKills, playerDeaths,
  };
}

/* ═══ TESTS ═════════════════════════════════════════════════════════════ */
log('boots into the menu without throwing', () => {
  for (let i=0;i<20;i++) step(1000/60);
  assert(Z.G.scene === 'menu', 'expected menu, got ' + Z.G.scene);
  return '(scene=menu)';
});

log('every scene renders without throwing', () => {
  for (const s of ['menu','map','arsenal','codex']) { Z.G.scene = s; for (let i=0;i<12;i++) step(1000/60); }
  return '(menu/map/arsenal/codex)';
});

log('unit table is internally consistent', () => {
  for (const k of Z.ALL_UNITS) {
    const d = Z.U[k];
    assert(typeof d.cost === 'number' && d.cost >= 1, k + ' bad cost');
    assert(d.kind, k + ' missing kind');
    if (d.kind !== 'spell') {
      assert(d.hp > 0, k + ' has no hp');
      assert(d.speed > 0, k + ' has no speed');
      assert(d.range > 0, k + ' has no range');
      assert(Z.U[k].shape, k + ' has no silhouette');
    }
    assert((d.dmg || 0) >= 0, k + ' negative dmg');
  }
  assert(Z.ALL_UNITS.length >= 10, 'expected 10+ units, got ' + Z.ALL_UNITS.length);
  return `(${Z.ALL_UNITS.length} units)`;
});

log('every campaign mission is well-formed', () => {
  assert(Z.CAMPAIGN.length === 12, 'expected 12 missions, got ' + Z.CAMPAIGN.length);
  for (const m of Z.CAMPAIGN) {
    assert(m.deck.length >= 2, m.name + ' deck too small');
    for (const k of m.deck) assert(Z.U[k], m.name + ' references unknown unit ' + k);
    assert(m.baseHp > 0 && m.reward > 0 && m.ai.react > 0, m.name + ' bad numbers');
    if (m.unlock) assert(Z.U[m.unlock], m.name + ' unlocks unknown unit ' + m.unlock);
  }
  return '(12 missions, all decks valid)';
});

log('auto-deck always produces a legal 8-card deck', () => {
  for (let n = 1; n <= Z.ALL_UNITS.length; n++) {
    Z.SAVE.owned = Z.ALL_UNITS.slice(0, n);
    Z.SAVE.autoDeck();
    assert(Z.SAVE.deck.length === Z.CFG.DECK_SIZE, `owned=${n} -> deck ${Z.SAVE.deck.length}`);
    for (const k of Z.SAVE.deck) assert(Z.U[k], 'deck has unknown card ' + k);
  }
  return '(1..10 owned units all legal)';
});

log('a battle runs to completion and ends', () => {
  Z.SAVE.owned = Z.ALL_UNITS.slice();
  Z.SAVE.levels = {};
  const r = botPlay(0, 0.7);
  assert(r, 'no result produced');
  assert(r.won !== null, 'battle never resolved');
  assert(r.seconds > 2, 'battle resolved in ' + r.seconds + 's — too fast');
  return `(mission 1, ${r.seconds}s, won=${r.won}, player core ${(r.remaining*100).toFixed(0)}%)`;
});

log('the AI actually deploys units (not a passive dummy)', () => {
  Z.startBattle(0);
  const b = Z.G.battle;
  let seen = 0;
  for (let i=0;i<60*90 && Z.G.scene==='battle';i++) {
    step(1000/60);
    const bb = Z.G.battle; if (!bb) break;
    seen = Math.max(seen, bb.units.filter(u=>!u.isPlayer).length + bb.e.units.length);
    if (bb.stats && bb.stats.units > 0 && seen > 6) break;
  }
  assert(seen >= 6, 'AI only ever fielded ' + seen + ' units in 90s of sim');
  return `(peak ${seen} AI units on field)`;
});

log('combat resolves — units actually die in a contested battle', () => {
  Z.SAVE.owned = Z.ALL_UNITS.slice(); Z.SAVE.levels = {};
  let kills = 0, losses = 0, runs = 0;
  for (const m of [2, 3, 5]) {                     // swarm, siege, field hospital
    const r = botPlay(m, 0.7);
    if (!r) continue;
    runs++; kills += r.deaths; losses += r.playerDeaths;
  }
  assert(runs === 3, 'only ' + runs + ' battles completed');
  assert(kills > 25, `only ${kills} enemy units died across 3 battles — combat is not resolving`);
  assert(losses > 10, `only ${losses} player units died across 3 battles — combat is one-sided`);
  return `(${kills} enemy kills vs ${losses} player losses across 3 battles)`;
});

log('no NaN leaks into unit or base state', () => {
  const b = Z.G.battle;
  if (b) {
    for (const u of b.units) {
      for (const f of ['x','y','hp','maxHp','cd']) {
        assert(Number.isFinite(u[f]), `unit ${u.type}.${f} = ${u[f]}`);
      }
    }
    for (const s of [b.p, b.e]) {
      assert(Number.isFinite(s.baseHp), 'baseHp = ' + s.baseHp);
      assert(Number.isFinite(s.elixir), 'elixir = ' + s.elixir);
    }
  }
  const raw = JSON.parse(store['ironline.v1']);
  for (const k of ['gold','cleared','wins','losses','totalUnits','totalDamage']) {
    assert(Number.isFinite(raw[k]), `save.${k} = ${raw[k]}`);
  }
  return '';
});

log('survives extreme viewports and huge frame stalls', () => {
  for (const [w,h] of [[320,480],[412,892],[1080,2400],[1440,900],[640,360]]) {
    win.innerWidth = w; win.innerHeight = h;
    (listeners.window.resize||[]).forEach(f => f());
    Z.G.scene = 'battle';
    for (let i=0;i<40;i++) step(1000/60);
    for (let i=0;i<5;i++) step(5000);
  }
  return '(320x480 .. 1440x900)';
});

/* ═══ BALANCE — the important part ═══════════════════════════════════════ */
let BAL = null;
log('campaign is beatable but not trivial (bot win-rate sweep)', () => {
  Z.SAVE.owned = Z.ALL_UNITS.slice();
  Z.SAVE.levels = {};
  BAL = [];
  const lines = [];
  for (let m = 0; m < Z.CAMPAIGN.length; m++) {
    let wins = 0;
    const N = 5;
    const times = [], runs = [];
    for (let i = 0; i < N; i++) {
      Z.SAVE.levels = {};                       // fresh run, no upgrades
      runs.push(botPlay(m, 0.62));
      if (runs[runs.length-1] && runs[runs.length-1].won) wins++;
      if (runs[runs.length-1]) times.push(runs[runs.length-1].seconds);
    }
    const avg = times.reduce((a,b)=>a+b,0)/times.length;
    const cores = runs.filter(r => r && r.byCore).length;
    const ended = runs.filter(r => r && r.timeLeft > 0.5).length;
    BAL.push({ m, wins, N, avg, cores, ended });
    lines.push(`M${String(m+1).padStart(2)} ${wins}/${N} won · ${cores} core kills · ${ended} fast ends · avg ${avg.toFixed(0)}s  ${Z.CAMPAIGN[m].name}`);
  }
  const totalWins = BAL.reduce((a,b)=>a+b.wins,0), totalRuns = BAL.reduce((a,b)=>a+b.N,0);
  const winRate = totalWins/totalRuns;
  assert(winRate > 0.20, `bot only won ${(winRate*100).toFixed(0)}% — the game may be unwinnable`);
  assert(winRate < 0.95, `bot won ${(winRate*100).toFixed(0)}% — there is no difficulty curve`);
  return '\n      ' + lines.join('\n      ');
});

log('difficulty rises across the campaign', () => {
  if (!BAL || !BAL.length) throw new Error('balance sweep produced no data');
  if (!BAL.some(r => r.wins > 0)) throw new Error('no mission was ever won — nothing to compare');
  const first = BAL.slice(0,4).reduce((a,b)=>a+b.wins,0) / 20;
  const last  = BAL.slice(8).reduce((a,b)=>a+b.wins,0) / 20;
  assert(first >= last, `early missions (${(first*100).toFixed(0)}%) easier than late (${(last*100).toFixed(0)}%) — curve is inverted`);
  return `(first third ${(first*100).toFixed(0)}% vs final third ${(last*100).toFixed(0)}% bot win rate)`;
});

log('most matches end decisively rather than on the timer', () => {
  if (!BAL || !BAL.length) throw new Error('balance sweep produced no data');
  const total = BAL.reduce((a,b)=>a+b.N,0);
  const decisive = BAL.reduce((a,b)=>a+b.ended,0);
  const playerCores = BAL.reduce((a,b)=>a+b.cores,0);
  const rate = decisive/total;
  assert(rate > 0.55,
    `only ${(rate*100).toFixed(0)}% of matches ended before the timer — the rest are chip-damage stalemates`);
  assert(playerCores/total > 0.12,
    `the player only broke a core in ${(playerCores/total*100).toFixed(0)}% of matches — offence is too weak`);
  return `(${(rate*100).toFixed(0)}% decisive; player broke the core in ${(playerCores/total*100).toFixed(0)}%)`;
});

log('no mission resolves instantly or runs forever', () => {
  if (!BAL || !BAL.length) throw new Error('balance sweep produced no data');
  if (!BAL.some(r => r.avg > 0)) throw new Error('no battles actually ran');
  for (const r of BAL) {
    assert(r.avg > 8,  `M${r.m+1} averages ${r.avg.toFixed(1)}s — over before it starts`);
    assert(r.avg < 185, `M${r.m+1} averages ${r.avg.toFixed(1)}s — hitting the timer, likely a stalemate`);
  }
  return '(all missions 8-185s)';
});

log('every unlock is reachable through the campaign', () => {
  const unlocks = Z.CAMPAIGN.filter(m => m.unlock).map(m => m.unlock);
  const starters = ['runner','rifle','shield','swarm','gren'];
  const reachable = new Set([...starters, ...unlocks]);
  for (const k of Z.ALL_UNITS) {
    assert(reachable.has(k), `${k} is in the unit table but can never be unlocked`);
  }
  return `(${unlocks.length} unlocks + ${starters.length} starters covers all ${Z.ALL_UNITS.length})`;
});

log('the counter matrix holds (each unit has a real answer)', () => {
  const U = Z.U;
  // swarm must be soft to splash
  assert(U.swarm.hp * U.swarm.count < 300, 'swarm is too tanky to be countered by splash');
  assert(U.gren.splash > 30, 'grenadier splash too small to clear a swarm');
  // artillery must have a minimum range so a rush can punish it
  assert(U.mortar.minR > 60, 'mortar has no minimum range — nothing can punish it');
  // the tank must out-tank everything per elixir
  const hpe = k => U[k].hp / U[k].cost;
  assert(hpe('shield') > hpe('rifle'),  'bulwark is not tankier per elixir than a rifleman');
  assert(hpe('mech')   > hpe('sniper'),  'juggernaut is not tankier per elixir than a marksman');
  // marksman must out-range every non-artillery unit
  const nonArtillery = Object.entries(U).filter(([k,d]) => k !== 'mortar' && k !== 'sniper' && d.kind !== 'spell');
  for (const [k,d] of nonArtillery) {
    assert(U.sniper.range > d.range, `marksman (${U.sniper.range}) does not out-range ${k} (${d.range})`);
  }
  // artillery must out-range everything, and be punishable by a rush
  for (const [k,d] of Object.entries(U)) {
    if (d.kind === 'spell') continue;
    assert(U.mortar.range >= d.range, `mortar (${U.mortar.range}) does not out-range ${k} (${d.range})`);
  }
  return '(swarm<splash, mortar has minR + tops all range, tanks out-tank, marksman tops non-artillery)';
});

log('deck building enforces its own rules', () => {
  Z.SAVE.owned = Z.ALL_UNITS.slice();
  Z.SAVE.autoDeck();
  const start = Z.SAVE.deck.length;
  assert(start === Z.CFG.DECK_SIZE, 'autoDeck gave ' + start);
  const extra = Z.ALL_UNITS.find(k => !Z.SAVE.deck.includes(k));
  const before = Z.SAVE.deck.slice();
  Z.toggleDeck(extra || Z.SAVE.deck[0]);
  assert(extra ? Z.SAVE.deck.length === start : Z.SAVE.deck.length === start,
         'toggle broke deck size');
  // cannot exceed 8
  if (extra) {
    let guard = 0;
    while (Z.SAVE.deck.length < Z.CFG.DECK_SIZE && guard++ < 20) {
      const k = Z.ALL_UNITS.find(x => !Z.SAVE.deck.includes(x));
      if (!k) break; Z.toggleDeck(k);
    }
    Z.toggleDeck(extra);
    assert(Z.SAVE.deck.length <= Z.CFG.DECK_SIZE, 'deck exceeded max size');
  }
  // cannot drop below the hand size
  Z.SAVE.deck = Z.ALL_UNITS.slice(0, Z.CFG.HAND_SIZE);
  Z.toggleDeck(Z.SAVE.deck[0]);
  assert(Z.SAVE.deck.length >= Z.CFG.HAND_SIZE, 'deck dropped below hand size');
  return `(max ${Z.CFG.DECK_SIZE}, min ${Z.CFG.HAND_SIZE} enforced)`;
});

log('a player-built deck is respected instead of auto-overwritten', () => {
  Z.SAVE.owned = Z.ALL_UNITS.slice();
  const custom = ['runner','runner','rifle','shield','gren','sniper','mortar','strike']
    .filter((k,i,a) => a.indexOf(k) === i);
  const full = ['runner','rifle','shield','gren','medic','mech','sniper','mortar'];
  Z.SAVE.deck = full.slice();
  Z.startBattle(0);
  assert(Z.G.battle, 'battle failed to start');
  const used = Z.G.battle.p.deck.join(',');
  assert(used.split(',').length === Z.CFG.DECK_SIZE, 'deck was altered: ' + used);
  assert(full.every(k => Z.G.battle.p.deck.includes(k)), 'custom deck not used: ' + used);
  Z.G.scene = 'menu';
  return `(${used})`;
});

console.log('\n' + results.join('\n\n'));
const failed = results.filter(r => r.startsWith('FAIL')).length;
console.log(`\n${results.length - failed}/${results.length} passed\n`);
process.exit(failed ? 1 : 0);
