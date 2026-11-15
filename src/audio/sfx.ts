import { storage } from '../games/gunhit/game/safeStorage';
/* Procedural game SFX – Web Audio API, no asset files needed */

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let noiseBuf: AudioBuffer | null = null;
let muted = false;               // pilihan pemain (tombol sound dalam game)
let portalMuted = false;         // mute dari pengaturan portal (CrazyGames) — MENANG
let VOLUME = 0.6;

const effectiveMuted = () => muted || portalMuted;

try {
  muted = storage.getItem("ps-muted") === "1";
} catch {
  /* ignore */
}

/** Dipanggil fasad ads saat setting mute portal berubah. Menang atas tombol game. */
export function setPortalMuted(m: boolean) {
  if (portalMuted === m) return;
  portalMuted = m;
  if (ctx && master) master.gain.setTargetAtTime(effectiveMuted() ? 0 : VOLUME, ctx.currentTime, 0.02);
}

export function unlockAudio() {
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = effectiveMuted() ? 0 : VOLUME;
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -12;
    comp.ratio.value = 5;
    master.connect(comp);
    comp.connect(ctx.destination);
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  if (ctx.state === "suspended") void ctx.resume();
}

export const isMuted = () => effectiveMuted();
/** 0..1 – follows the game's volume slider */
export function setVolume(v: number) {
  VOLUME = 0.92 * Math.max(0, Math.min(1, v));
  if (ctx && master) master.gain.setTargetAtTime(effectiveMuted() ? 0 : VOLUME, ctx.currentTime, 0.02);
}
export function setMuted(m: boolean) {
  muted = m;
  try {
    storage.setItem("ps-muted", m ? "1" : "0");
  } catch {
    /* ignore */
  }
  if (ctx && master) master.gain.setTargetAtTime(effectiveMuted() ? 0 : VOLUME, ctx.currentTime, 0.02);
}

const live = () => !!ctx && !!master && !muted;
const midi = (n: number) => 440 * Math.pow(2, (n - 69) / 12);

type ToneOpt = {
  f: number;
  to?: number;
  type?: OscillatorType;
  dur?: number;
  vol?: number;
  at?: number;
  attack?: number;
  vibrato?: number;
};
function tone(o: ToneOpt) {
  if (!live()) return;
  const c = ctx!;
  const t = c.currentTime + (o.at ?? 0);
  const dur = o.dur ?? 0.15;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = o.type ?? "sine";
  osc.frequency.setValueAtTime(o.f, t);
  if (o.to) osc.frequency.exponentialRampToValueAtTime(o.to, t + dur);
  if (o.vibrato) {
    const lfo = c.createOscillator();
    const lg = c.createGain();
    lfo.frequency.value = 6;
    lg.gain.value = o.vibrato;
    lfo.connect(lg).connect(osc.frequency);
    lfo.start(t);
    lfo.stop(t + dur + 0.05);
  }
  const vol = o.vol ?? 0.3;
  const a = o.attack ?? 0.005;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + a);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(g).connect(master!);
  osc.start(t);
  osc.stop(t + dur + 0.05);
}

type NoiseOpt = {
  dur: number;
  vol?: number;
  at?: number;
  filter?: BiquadFilterType;
  f?: number;
  to?: number;
  q?: number;
  attack?: number;
};
function noise(o: NoiseOpt) {
  if (!live() || !noiseBuf) return;
  const c = ctx!;
  const t = c.currentTime + (o.at ?? 0);
  const src = c.createBufferSource();
  src.buffer = noiseBuf;
  src.loop = true;
  const flt = c.createBiquadFilter();
  flt.type = o.filter ?? "lowpass";
  flt.frequency.setValueAtTime(o.f ?? 2000, t);
  if (o.to) flt.frequency.exponentialRampToValueAtTime(o.to, t + o.dur);
  flt.Q.value = o.q ?? 1;
  const g = c.createGain();
  const vol = o.vol ?? 0.3;
  const a = o.attack ?? 0.003;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + a);
  g.gain.exponentialRampToValueAtTime(0.0001, t + o.dur);
  src.connect(flt).connect(g).connect(master!);
  src.start(t, Math.random() * 0.5);
  src.stop(t + o.dur + 0.05);
}

let lastTick = 0;

export const sfx = {
  /* ---------- UI ---------- */
  click() {
    tone({ f: 520, to: 820, type: "triangle", dur: 0.07, vol: 0.22 });
    noise({ dur: 0.03, vol: 0.06, filter: "highpass", f: 3500 });
  },
  toggle() {
    tone({ f: 880, type: "square", dur: 0.05, vol: 0.07 });
    tone({ f: 1320, type: "square", dur: 0.06, vol: 0.07, at: 0.05 });
  },
  error() {
    tone({ f: 190, type: "square", dur: 0.08, vol: 0.1 });
    tone({ f: 140, type: "square", dur: 0.14, vol: 0.1, at: 0.09 });
  },
  pop(p = 1) {
    tone({ f: 260 * p, to: 820 * p, dur: 0.12, vol: 0.22 });
  },
  softPop() {
    tone({ f: 520, to: 980, dur: 0.08, vol: 0.1 });
  },
  whoosh(up = true, dur = 0.32, vol = 0.16) {
    noise({ dur, vol, filter: "bandpass", f: up ? 350 : 2600, to: up ? 2600 : 350, q: 1.3, attack: dur * 0.45 });
  },
  panelIn() {
    sfx.whoosh(true, 0.28, 0.14);
    tone({ f: 330, to: 660, type: "triangle", dur: 0.14, vol: 0.12, at: 0.18 });
  },
  skip() {
    sfx.whoosh(true, 0.22, 0.14);
  },

  /* ---------- gameplay / impact ---------- */
  gunshot() {
    noise({ dur: 0.4, vol: 0.75, filter: "lowpass", f: 5000, to: 180 });
    noise({ dur: 0.05, vol: 0.4, filter: "highpass", f: 2200 });
    tone({ f: 170, to: 40, dur: 0.28, vol: 0.6 });
  },
  bulletWhiz() {
    tone({ f: 2600, to: 900, dur: 0.3, vol: 0.06 });
    noise({ dur: 0.25, vol: 0.12, filter: "bandpass", f: 1800, to: 5000, q: 3, attack: 0.08 });
  },
  woodHit() {
    tone({ f: 210, to: 85, type: "triangle", dur: 0.2, vol: 0.55 });
    noise({ dur: 0.12, vol: 0.35, filter: "bandpass", f: 1400, q: 2 });
    sfx.crack(0.04);
  },
  crack(at = 0) {
    for (let i = 0; i < 4; i++) noise({ dur: 0.025, vol: 0.16, filter: "highpass", f: 2500 + i * 700, at: at + i * 0.035 });
  },
  stamp() {
    tone({ f: 115, to: 45, dur: 0.32, vol: 0.55 });
    noise({ dur: 0.18, vol: 0.28, filter: "lowpass", f: 900 });
    tone({ f: 220, to: 160, type: "sawtooth", dur: 0.25, vol: 0.06, at: 0.02 });
  },
  letterDrop(i = 0) {
    tone({ f: 175 - i * 12, to: 60, type: "triangle", dur: 0.16, vol: 0.32 });
    noise({ dur: 0.06, vol: 0.1, filter: "lowpass", f: 700 });
  },
  letterSlam(i = 0) {
    tone({ f: 140 - i * 8, to: 50, dur: 0.2, vol: 0.38 });
    noise({ dur: 0.08, vol: 0.14, filter: "lowpass", f: 1100 });
  },
  boom() {
    tone({ f: 85, to: 30, dur: 0.85, vol: 0.7 });
    noise({ dur: 0.6, vol: 0.32, filter: "lowpass", f: 1400, to: 90 });
    sfx.crack(0.12);
  },
  gameOverJingle() {
    const notes = [67, 66, 65];
    notes.forEach((n, i) => tone({ f: midi(n), type: "triangle", dur: 0.24, vol: 0.14, at: i * 0.26 }));
    tone({ f: midi(64), to: midi(62), type: "triangle", dur: 0.9, vol: 0.15, at: 0.78, vibrato: 6 });
    tone({ f: midi(52), type: "sine", dur: 1.1, vol: 0.1, at: 0.78 });
  },
  reload() {
    noise({ dur: 0.03, vol: 0.25, filter: "highpass", f: 2500 });
    tone({ f: 1400, to: 900, type: "square", dur: 0.04, vol: 0.06 });
    noise({ dur: 0.04, vol: 0.2, filter: "bandpass", f: 1800, q: 4, at: 0.09 });
  },
  gunSpin() {
    sfx.whoosh(true, 0.4, 0.14);
    sfx.reload();
  },

  /* ---------- score / progress ---------- */
  tick(progress = 0) {
    const now = performance.now();
    if (now - lastTick < 42) return;
    lastTick = now;
    tone({ f: 900 + progress * 800, type: "square", dur: 0.025, vol: 0.045 });
  },
  seg(i: number) {
    const scale = [72, 74, 76, 79, 81, 84, 86, 88, 91, 93, 96];
    tone({ f: midi(scale[Math.min(i, scale.length - 1)]), type: "square", dur: 0.07, vol: 0.07 });
  },
  segMiss() {
    tone({ f: 170, to: 105, type: "sawtooth", dur: 0.22, vol: 0.11 });
  },
  newBest() {
    [72, 76, 79, 84].forEach((n, i) => tone({ f: midi(n), type: "square", dur: 0.12, vol: 0.07, at: i * 0.09 }));
    [84, 88, 91].forEach((n) => tone({ f: midi(n), type: "triangle", dur: 0.6, vol: 0.1, at: 0.38 }));
    sfx.sparkle(0.4);
  },

  /* ---------- currency ---------- */
  coin(p = 1) {
    tone({ f: midi(83) * p, type: "square", dur: 0.06, vol: 0.06 });
    tone({ f: midi(88) * p, type: "square", dur: 0.2, vol: 0.06, at: 0.06 });
  },
  coinBag() {
    for (let i = 0; i < 5; i++) sfx.coinAt(i * 0.06, 1 + i * 0.05);
  },
  coinAt(at: number, p = 1) {
    tone({ f: midi(83) * p, type: "square", dur: 0.05, vol: 0.05, at });
    tone({ f: midi(88) * p, type: "square", dur: 0.14, vol: 0.05, at: at + 0.05 });
  },
  diamond(p = 1) {
    [88, 92, 95, 100].forEach((n, i) => tone({ f: midi(n) * p, dur: 0.22, vol: 0.09, at: i * 0.045 }));
  },
  sparkle(at = 0) {
    for (let i = 0; i < 6; i++) tone({ f: 2000 + Math.random() * 2500, dur: 0.12, vol: 0.035, at: at + i * 0.05 });
  },
  spend() {
    tone({ f: midi(88), to: midi(76), type: "triangle", dur: 0.25, vol: 0.12 });
  },
  claim() {
    sfx.coinBag();
    sfx.sparkle(0.05);
  },

  /* ---------- revive / timer ---------- */
  heartbeat(urgent = false) {
    tone({ f: urgent ? 100 : 72, to: 40, dur: 0.12, vol: 0.5 });
    tone({ f: urgent ? 90 : 64, to: 38, dur: 0.12, vol: 0.32, at: 0.16 });
    if (urgent) tone({ f: 1046, type: "square", dur: 0.04, vol: 0.04 });
  },
  revive() {
    sfx.whoosh(true, 0.5, 0.18);
    [60, 64, 67, 72, 76, 79, 84].forEach((n, i) => tone({ f: midi(n), type: "triangle", dur: 0.18, vol: 0.12, at: i * 0.06 }));
    tone({ f: midi(84), type: "sine", dur: 0.7, vol: 0.1, at: 0.42 });
    sfx.sparkle(0.45);
  },

  /* ---------- transitions ---------- */
  irisClose() {
    sfx.whoosh(false, 0.45, 0.17);
    tone({ f: 420, to: 90, type: "triangle", dur: 0.45, vol: 0.1 });
  },
  irisOpen() {
    sfx.whoosh(true, 0.45, 0.14);
  },
  readyBeep() {
    tone({ f: 660, type: "square", dur: 0.12, vol: 0.08 });
  },
  go() {
    tone({ f: 990, type: "square", dur: 0.12, vol: 0.08 });
    tone({ f: 1320, type: "square", dur: 0.35, vol: 0.09, at: 0.1 });
    sfx.whoosh(true, 0.3, 0.12);
  },

  /* ---------- ads ---------- */
  adOpen() {
    tone({ f: midi(76), type: "triangle", dur: 0.12, vol: 0.12 });
    tone({ f: midi(81), type: "triangle", dur: 0.2, vol: 0.12, at: 0.1 });
    sfx.whoosh(true, 0.35, 0.12);
  },
  adTick() {
    tone({ f: 1200, type: "sine", dur: 0.03, vol: 0.05 });
  },
  adReward() {
    [79, 84, 88].forEach((n, i) => tone({ f: midi(n), type: "triangle", dur: 0.22, vol: 0.12, at: i * 0.09 }));
    sfx.sparkle(0.25);
  },
  bounce(p = 1) {
    tone({ f: 260 * p, to: 640 * p, dur: 0.1, vol: 0.13 });
  },
  combo() {
    [72, 76, 79, 84, 88].forEach((n, i) => tone({ f: midi(n), type: "square", dur: 0.08, vol: 0.06, at: i * 0.05 }));
  },

  /* ---------- R1 gift opening ---------- */
  giftDrop() {
    sfx.whoosh(false, 0.4, 0.12);
    tone({ f: 130, to: 45, dur: 0.32, vol: 0.55, at: 0.45 });
    noise({ dur: 0.14, vol: 0.22, filter: "lowpass", f: 800, at: 0.45 });
    tone({ f: 110, to: 50, dur: 0.18, vol: 0.25, at: 0.66 });
    [88, 91, 95].forEach((n, i) => tone({ f: midi(n), dur: 0.2, vol: 0.05, at: 0.55 + i * 0.06 }));
  },
  tug(i = 0) {
    tone({ f: 260 + i * 110, to: 720 + i * 220, type: "sawtooth", dur: 0.18, vol: 0.06 });
    noise({ dur: 0.16, vol: 0.14, filter: "bandpass", f: 900 + i * 300, to: 2600 + i * 600, q: 2.5 });
    tone({ f: 170, to: 80, type: "triangle", dur: 0.16, vol: 0.32, at: 0.08 });
    [0, 1, 2].forEach((k) => noise({ dur: 0.02, vol: 0.08, filter: "highpass", f: 3000, at: 0.1 + k * 0.03 }));
  },
  unlock() {
    tone({ f: 1800, type: "square", dur: 0.03, vol: 0.08 });
    noise({ dur: 0.04, vol: 0.2, filter: "highpass", f: 3000 });
    tone({ f: 2500, type: "square", dur: 0.04, vol: 0.08, at: 0.07 });
    noise({ dur: 0.05, vol: 0.18, filter: "bandpass", f: 2200, q: 4, at: 0.07 });
    sfx.whoosh(false, 0.4, 0.1);
    tone({ f: 3200, dur: 0.25, vol: 0.04, at: 0.6 });
    [79, 84, 88].forEach((n, i) => tone({ f: midi(n), type: "triangle", dur: 0.18, vol: 0.1, at: 0.35 + i * 0.07 }));
  },
  ribbonPull() {
    noise({ dur: 0.38, vol: 0.32, filter: "bandpass", f: 500, to: 5200, q: 2, attack: 0.05 });
    tone({ f: 180, to: 1300, type: "sawtooth", dur: 0.32, vol: 0.05 });
    sfx.whoosh(true, 0.35, 0.14);
    [0, 1, 2, 3].forEach((k) => tone({ f: midi(84 + k * 3), dur: 0.12, vol: 0.04, at: 0.2 + k * 0.05 }));
  },
  riser(dur = 0.8) {
    tone({ f: 110, to: 880, type: "sawtooth", dur, vol: 0.05, attack: dur * 0.9 });
    tone({ f: 220, to: 1760, dur, vol: 0.07, attack: dur * 0.9 });
    noise({ dur, vol: 0.12, filter: "highpass", f: 1500, to: 9000, attack: dur * 0.85 });
    for (let k = 0; k < 8; k++) tone({ f: 1800 + k * 300, dur: 0.1, vol: 0.03, at: k * (dur / 8) });
  },
  lidPop() {
    tone({ f: 200, to: 700, dur: 0.12, vol: 0.4 });
    noise({ dur: 0.55, vol: 0.5, filter: "lowpass", f: 5000, to: 220 });
    tone({ f: 75, to: 30, dur: 0.7, vol: 0.65 });
    sfx.sparkle(0.05);
    sfx.sparkle(0.3);
    [72, 79, 84].forEach((n) => tone({ f: midi(n), type: "triangle", dur: 0.9, vol: 0.06, at: 0.1, attack: 0.2 }));
  },
  legendReveal() {
    tone({ f: 95, to: 35, dur: 0.9, vol: 0.6 });
    noise({ dur: 0.4, vol: 0.25, filter: "lowpass", f: 2500, to: 200 });
    [72, 76, 79, 84].forEach((n) => tone({ f: midi(n), type: "triangle", dur: 1.6, vol: 0.09, at: 0.05, vibrato: 3 }));
    [84, 88, 91, 96, 100].forEach((n, i) => tone({ f: midi(n), type: "square", dur: 0.12, vol: 0.05, at: 0.12 + i * 0.07 }));
    sfx.sparkle(0.25);
    sfx.sparkle(0.6);
  },
  starPop(i = 0) {
    tone({ f: midi(84 + i * 4), type: "square", dur: 0.09, vol: 0.07 });
    tone({ f: midi(96 + i * 4), dur: 0.35, vol: 0.06, at: 0.04 });
    noise({ dur: 0.05, vol: 0.06, filter: "highpass", f: 5000 });
  },
  equip() {
    sfx.reload();
    [67, 71, 74, 79].forEach((n, i) => tone({ f: midi(n), type: "triangle", dur: 0.35, vol: 0.1, at: 0.12 + i * 0.05 }));
  },
  skipSad() {
    tone({ f: midi(67), type: "triangle", dur: 0.2, vol: 0.1 });
    tone({ f: midi(63), type: "triangle", dur: 0.45, vol: 0.1, at: 0.18, vibrato: 5 });
  },

  /* ---------- R1 v2: rarity ladder ---------- */
  upgrade(rank = 1) {
    const roots = [60, 64, 67, 72];
    const r = roots[Math.min(rank, 3)];
    tone({ f: 110, to: 40, dur: 0.5, vol: 0.55 });
    noise({ dur: 0.3, vol: 0.25, filter: "lowpass", f: 3000, to: 300 });
    [0, 4, 7, 12].forEach((iv, i) => tone({ f: midi(r + 12 + iv), type: "square", dur: 0.1, vol: 0.06, at: i * 0.05 }));
    [0, 4, 7].forEach((iv) => tone({ f: midi(r + iv), type: "triangle", dur: 0.7 + rank * 0.2, vol: 0.08, at: 0.2, vibrato: 3 }));
    sfx.sparkle(0.15);
    if (rank >= 3) sfx.sparkle(0.4);
  },
  buildUp(dur: number, k: number) {
    sfx.riser(dur);
    if (k >= 3) {
      const beats = Math.floor(dur / 0.38);
      for (let i = 0; i < beats; i++) setTimeout(() => sfx.heartbeat(true), i * 380);
    }
  },
  fizzle() {
    tone({ f: 420, to: 70, type: "sawtooth", dur: 0.55, vol: 0.08 });
    tone({ f: 300, to: 60, type: "triangle", dur: 0.5, vol: 0.12 });
    noise({ dur: 0.45, vol: 0.16, filter: "lowpass", f: 1200, to: 150 });
  },
  untie() {
    sfx.ribbonPull();
    for (let i = 0; i < 7; i++) noise({ dur: 0.04, vol: 0.09, filter: "bandpass", f: 900 + (i % 3) * 400, q: 3, at: 0.15 + i * 0.07 });
    sfx.sparkle(0.05);
  },
  ribbonTwang(i = 0) {
    tone({ f: midi(55 + i * 5), type: "triangle", dur: 0.28, vol: 0.14, vibrato: 12 });
    tone({ f: midi(67 + i * 5), dur: 0.2, vol: 0.06, at: 0.02 });
  },

  /* ---------- silhouette shuffle ---------- */
  shuffleBlip(p = 0) {
    tone({ f: 520 + p * 760, type: "square", dur: 0.05, vol: 0.07 });
    tone({ f: 1040 + p * 1520, dur: 0.04, vol: 0.03, at: 0.01 });
    noise({ dur: 0.025, vol: 0.06, filter: "highpass", f: 4000 });
  },
  mystery() {
    [64, 67, 70, 73].forEach((n, i) => tone({ f: midi(n), type: "triangle", dur: 0.22, vol: 0.08, at: i * 0.09 }));
    tone({ f: midi(76), type: "sine", dur: 0.6, vol: 0.06, at: 0.36, vibrato: 8 });
  },
  shuffleLand() {
    tone({ f: 160, to: 60, dur: 0.3, vol: 0.5 });
    noise({ dur: 0.15, vol: 0.2, filter: "lowpass", f: 1500 });
    tone({ f: midi(84), type: "square", dur: 0.08, vol: 0.07 });
    tone({ f: midi(91), type: "square", dur: 0.16, vol: 0.07, at: 0.07 });
  },

  /** juicy jelly "boing" for gift colour swaps (rank 0..3 → higher pitch) */
  squish(rank = 0) {
    const base = 180 + rank * 70;
    tone({ f: base, to: base * 2.6, type: "sine", dur: 0.13, vol: 0.22 });
    tone({ f: base * 2.6, to: base * 1.7, type: "triangle", dur: 0.12, vol: 0.09, at: 0.08 });
    noise({ dur: 0.05, vol: 0.07, filter: "bandpass", f: 1400 + rank * 300, q: 3 });
    tone({ f: midi(84 + rank * 3), type: "square", dur: 0.05, vol: 0.035, at: 0.03 });
  },
};
