/**
 * PUTARAN BOS — satu tanda tangan putaran untuk tiap kepala.
 *
 * Dulu semua bos berbagi satu pola 6 detik yang sama (`bossSpinSpeed` di
 * `Game.ts`): maju, nyaris berhenti, mundur, berhenti, goyang. Piranha di stage
 * 5 berputar persis seperti Matahari di stage 55, jadi tidak ada yang perlu
 * dipelajari pemain — dan Kamus Bos tidak punya apa pun untuk dijelaskan.
 *
 * Sekarang tiap bos punya ritmenya sendiri, ditulis sebagai keyframe [posisi
 * dalam siklus, pengali kecepatan] yang diinterpolasi kosinus. Interpolasi
 * kosinus penting: kecepatan melambat tepat di sekitar tiap key, jadi setiap
 * balik arah selalu "diberi tahu" dulu ke pemain sebelum terjadi — putaran
 * boleh jauh lebih ganas, tapi tetap terbaca dan adil.
 *
 * Fungsi yang sama yang menjalankan mesin (`bossSpinSpeed`) juga yang menggambar
 * grafik di Kamus Bos, jadi yang dilihat pemain di kamus persis yang akan
 * dia rasakan di arena.
 */
import { HEAD_KINDS, type HeadKind } from '../../perfect-shot/play/HeadArt';
import { bossHeadFor } from './bossIdentity';

export const TAU = Math.PI * 2;

/** One keyframe of a spin loop: `at` is 0..1 through the cycle, `k` multiplies the base speed. */
type Key = readonly [at: number, k: number];

/**
 * Continuous extras layered on top of the keyframe loop — flapping, servos,
 * bat flurries. Everything here is a pure function of time, so the codex graph
 * and the engine can never drift apart.
 */
type Overlay = (t: number, k: number, rage: boolean) => number;

export interface BossSpinStyle {
  head: HeadKind;
  /** Nama jurus putarannya, huruf besar — judul kartu di Kamus Bos. */
  name: string;
  nameEn: string;
  /** Satu kalimat: apa yang harus diwaspadai pemain. */
  how: string;
  howEn: string;
  /** 1..5 — jumlah pip difficulty di Kamus Bos. */
  difficulty: number;
  /** Panjang satu siklus penuh, detik. Grafik kamus memplot persis sepanjang ini. */
  cycle: number;
  keys: readonly Key[];
  overlay?: Overlay;
}

/** NaN diperlakukan 0 supaya roda tidak pernah mendapat kecepatan tak hingga. */
const clamp01 = (v: number) => (Number.isFinite(v) ? (v < 0 ? 0 : v > 1 ? 1 : v) : 0);
/** Cosine ease — slow at both ends, so a reversal is always telegraphed. */
const ease = (v: number) => 0.5 - 0.5 * Math.cos(Math.PI * clamp01(v));
const mix = (a: number, b: number, k: number) => a + (b - a) * k;
/** Smooth ±1 sign switch; `sharp` controls how quickly it snaps. */
const flip = (v: number, sharp = 5) => Math.tanh(sharp * v);

/**
 * Walk the keyframe ring at `p` (0..1 through the loop). Keys are kept sorted
 * and the ring wraps, so a cycle never has a seam at t = 0.
 */
function sampleKeys(keys: readonly Key[], p: number): number {
  const n = keys.length;
  if (n === 0) return 1;
  if (n === 1) return keys[0][1];
  // Every table below starts at 0 and ends at 1 with the same value, so the
  // loop is a plain sorted scan and the cycle has no seam at t = 0.
  const x = clamp01(((p % 1) + 1) % 1);
  let i = 1;
  while (i < n - 1 && keys[i][0] <= x) i++;
  const [a0, k0] = keys[i - 1];
  const [a1, k1] = keys[i];
  const span = a1 - a0;
  return span <= 0 ? k1 : mix(k0, k1, ease((x - a0) / span));
}

/**
 * The eleven signatures, in Game B's rotation order (stage 5 = pirate … stage
 * 55 = sun). Difficulty is what the Kamus Bos prints; the numbers below are why.
 */
export const BOSS_SPIN: Record<HeadKind, BossSpinStyle> = {
  pirate: {
    head: 'pirate',
    name: 'AYUNAN BADAI',
    nameEn: 'STORM SWING',
    how: 'Bos kapal oleng kiri-kanan seperti dihantam ombak. Tembak di ujung ayunan, saat putarannya paling pelan.',
    howEn: 'The ship rolls left and right like it is taking waves. Fire at the end of a swing, where the spin is slowest.',
    difficulty: 2,
    cycle: 6.4,
    keys: [
      [0, 0.05], [0.16, 1.45], [0.34, 1.7], [0.5, 0.05],
      [0.66, -1.55], [0.84, -1.75], [1, 0.05],
    ],
  },
  jester: {
    head: 'jester',
    name: 'TAWA GILA',
    nameEn: 'MANIC GIGGLE',
    how: 'Dia berputar, berhenti untuk tertawa, lalu melesat ke arah yang salah. Jeda tawanya adalah satu-satunya jendela tembakmu.',
    howEn: 'He spins, freezes to giggle, then darts the wrong way. The giggle pause is your only shooting window.',
    difficulty: 4,
    cycle: 3.6,
    keys: [
      [0, 1.8], [0.18, 1.9], [0.24, 0], [0.32, 0],
      [0.38, -2.0], [0.56, -2.1], [0.62, 0], [0.7, 0],
      [0.76, 1.3], [0.88, -1.6], [1, 1.8],
    ],
  },
  dragon: {
    head: 'dragon',
    name: 'KEPAKAN NAGA',
    nameEn: 'DRAGON WINGBEAT',
    how: 'Dua kepakan cepat mendorongnya maju, lalu dia menukik mundur. Hitung kepakannya: tembak di jeda antar kepak.',
    howEn: 'Two fast beats push him forward, then he dives backwards. Count the beats and fire in the gap between them.',
    difficulty: 4,
    cycle: 4.2,
    keys: [
      [0, 0.6], [0.1, 1.9], [0.2, 0.7], [0.3, 2.0],
      [0.42, 0.8], [0.56, -0.4], [0.7, -2.2], [0.86, -1.5], [1, 0.6],
    ],
    // The wings keep breathing over the whole loop.
    overlay: (t, k) => k + 0.22 * Math.sin(t * TAU / 0.7),
  },
  skeleton: {
    head: 'skeleton',
    name: 'DERIT KUBUR',
    nameEn: 'GRAVE RATCHET',
    how: 'Tiga sentakan patah-patah maju, lalu satu gesekan panjang mundur. Sentakan ketiganya selalu diikuti gesekan — jangan tertipu.',
    howEn: 'Three bony jerks forward, then one long creak backwards. The third jerk always leads into the creak — do not be fooled.',
    difficulty: 3,
    cycle: 5,
    keys: [
      [0, 0], [0.05, 1.9], [0.12, 0.1], [0.19, 1.9], [0.26, 0.1],
      [0.33, 2.0], [0.44, 0.15], [0.56, -1.15], [0.86, -1.0], [1, 0],
    ],
    // Old bones rattle: a tiny high-frequency shiver on every frame.
    overlay: (t, k) => k + 0.07 * Math.sin(t * TAU * 7.3),
  },
  tiki: {
    head: 'tiki',
    name: 'KUTUKAN TOTEM',
    nameEn: 'TOTEM CURSE',
    how: 'Totem batu nyaris diam, lalu menyentak keras dua kali. Diamnya jebakan — siapkan peluru sebelum sentakan datang.',
    howEn: 'The stone totem sits nearly still, then lurches hard twice. The stillness is a trap — be ready before the lurch.',
    difficulty: 3,
    cycle: 7,
    keys: [
      [0, 0.06], [0.38, 0.08], [0.44, 2.0], [0.52, 1.8], [0.58, 0.05],
      [0.72, 0.06], [0.78, -2.2], [0.86, -1.9], [0.93, 0.05], [1, 0.06],
    ],
  },
  viking: {
    head: 'viking',
    name: 'KAPAK BADAI',
    nameEn: 'STORM AXE',
    how: 'Berputar stabil, mengangkat kapak (melambat), lalu menebas balik arah. Perlambatannya adalah aba-aba — tembak di situ.',
    howEn: 'A steady spin, an axe wind-up (it slows), then a chop that reverses it. The slow-down is the tell — shoot there.',
    difficulty: 4,
    cycle: 4.8,
    keys: [
      [0, 1.05], [0.5, 1.1], [0.62, 0.14], [0.7, -1.8],
      [0.8, -1.4], [0.9, 0.55], [1, 1.05],
    ],
  },
  oni: {
    head: 'oni',
    name: 'AMARAH ONI',
    nameEn: 'ONI WRATH',
    how: 'Cepat, lalu membalik tanpa ampun, berulang-ulang. Saat dia NGAMUK polanya membalik dua kali lebih sering.',
    howEn: 'Fast, then it flips without mercy, over and over. Once he goes RAGE the pattern flips twice as often.',
    difficulty: 5,
    cycle: 3.2,
    keys: [
      [0, 1.3], [0.25, 1.45], [0.45, -1.4], [0.7, -1.5], [0.88, 1.15], [1, 1.3],
    ],
    // Rage tightens the flip period: the same loop, cut in half.
    overlay: (t, k, rage) => k * (rage ? flip(Math.sin(t * TAU / 0.8), 6) : 1),
  },
  robot: {
    head: 'robot',
    name: 'MESIN PRESISI',
    nameEn: 'PRECISION MACHINE',
    how: 'Maju-mundur persis seperti metronom, dengan sentakan servo di tiap ujung. Polanya tidak pernah berubah — hafalkan hitungannya.',
    howEn: 'Forward and back exactly like a metronome, with a servo kick at each end. The pattern never changes — memorise the count.',
    difficulty: 4,
    cycle: 4,
    keys: [
      [0, 1.05], [0.06, 1.3], [0.14, 1.05], [0.42, 1.05], [0.46, 0.18],
      [0.5, -1.05], [0.56, -1.3], [0.64, -1.05], [0.92, -1.05], [0.96, -0.18], [1, 1.05],
    ],
    // Servo whine: a quantised step so the spin feels mechanical, not organic.
    overlay: (t, k) => k * (0.86 + 0.14 * Math.round(Math.abs(Math.sin(t * TAU / 0.5)) * 6) / 6),
  },
  alien: {
    head: 'alien',
    name: 'HIPNOTIS',
    nameEn: 'HYPNOTIC DRIFT',
    how: 'Melayang halus dan makin cepat, lalu melompat warp sesaat. Jangan ikuti putarannya dengan mata — ikuti jeda warp-nya.',
    howEn: 'A smooth drift that keeps accelerating, then a brief warp jump. Do not track the spin — track the warp pause.',
    difficulty: 4,
    cycle: 8,
    keys: [
      [0, 0.7], [0.2, 1.5], [0.36, -0.9], [0.52, 1.7], [0.66, -1.4],
      [0.78, 0.2], [0.84, 2.0], [0.9, 0.4], [1, 0.7],
    ],
    overlay: (t, k) => k + 0.18 * Math.sin(t * TAU / 1.9),
  },
  vampire: {
    head: 'vampire',
    name: 'BULAN MERAH',
    nameEn: 'RED MOON',
    how: 'Melayang pelan seperti kabut, lalu sekelompok kelelawar membuatnya mengamuk bolak-balik sangat cepat.',
    howEn: 'He drifts slowly like fog, then a bat flurry whips him back and forth at brutal speed.',
    difficulty: 5,
    cycle: 5.6,
    keys: [
      [0, 0.3], [0.3, 0.35], [0.38, 1.2], [0.5, -1.4], [0.62, 1.5],
      [0.74, -1.5], [0.86, 0.9], [0.94, 0.3], [1, 0.3],
    ],
    // The flurry itself: rapid sign flips, smoothed so the engine never teleports.
    overlay: (t, k) => {
      const p = ((t % 5.6) + 5.6) % 5.6 / 5.6;
      const flurry = p > 0.36 && p < 0.88 ? flip(Math.sin(t * TAU / 0.34), 7) : 1;
      return k * flurry;
    },
  },
  sun: {
    head: 'sun',
    name: 'FLARE MATAHARI',
    nameEn: 'SOLAR FLARE',
    how: 'Raja terakhir: berputar terus sambil memuntahkan flare, dengan dua balikan keras per siklus. Puncaknya paling cepat di game.',
    howEn: 'The final king: a continuous spin that spits flares, with two hard reversals per cycle. The fastest peak in the game.',
    difficulty: 5,
    cycle: 6,
    keys: [
      [0, 1.2], [0.24, 1.4], [0.34, 0.25], [0.42, -1.85], [0.52, -1.35],
      [0.6, 1.05], [0.74, 1.35], [0.8, 0.25], [0.88, -1.6], [0.96, 0.85], [1, 1.2],
    ],
    overlay: (t, k, rage) => k * (1 + 0.16 * Math.sin(t * TAU / 1.5)) * (rage ? 1.1 : 1),
  },
};

/** Every spin signature, in stage order — the row list of the Kamus Bos. */
export const BOSS_SPIN_LIST: BossSpinStyle[] = HEAD_KINDS.map((head) => BOSS_SPIN[head]);

/**
 * Base speed in deg/s for a stage. Noticeably hotter than the old shared
 * `72 + 4·level`, because every signature above now spends part of its cycle
 * near zero — the average speed stays playable while the peaks get scary.
 */
export const bossSpinBaseDeg = (level: number) => 108 + Math.min(140, Math.max(0, level) * 3.9);

/** The signature a stage's boss spins with. Non-boss stages fall back to the pirate. */
export function bossSpinStyleFor(level: number): BossSpinStyle {
  return BOSS_SPIN[bossHeadFor(level) ?? 'pirate'];
}

export const bossSpinStyleForHead = (head: HeadKind): BossSpinStyle => BOSS_SPIN[head];

/**
 * Raw rad/s at time `t` for one signature. Split out so the Kamus Bos can plot
 * exactly what the engine integrates.
 */
export function styleSpinRad(style: BossSpinStyle, t: number, baseDeg: number, rage = false): number {
  const p = style.cycle > 0 ? (((t % style.cycle) + style.cycle) % style.cycle) / style.cycle : 0;
  let k = sampleKeys(style.keys, p);
  if (style.overlay) k = style.overlay(Math.max(0, t), k, rage);
  return (baseDeg * Math.PI / 180) * k;
}

/**
 * How fast this stage's boss is turning right now, in rad/s. This is the single
 * source of truth: the engine integrates it, the Kamus Bos graphs it.
 */
export function bossSpinSpeed(level: number, levelTime: number, rage = false): number {
  return styleSpinRad(bossSpinStyleFor(level), Math.max(0, levelTime), bossSpinBaseDeg(level), rage);
}

/**
 * Peak |deg/s| one signature reaches on a stage — the number behind the codex's
 * speed bar. Sampled, not derived, so any future keyframe edit stays honest.
 */
export function stylePeakDeg(style: BossSpinStyle, level: number): number {
  const base = bossSpinBaseDeg(level);
  const steps = 240;
  let peak = 0;
  for (let i = 0; i < steps; i++) {
    const v = Math.abs(styleSpinRad(style, (i / steps) * style.cycle, base)) * 180 / Math.PI;
    if (v > peak) peak = v;
  }
  return Math.round(peak);
}

/** A sampled speed curve (deg/s) over one cycle, for the codex's sparkline. */
export function styleCurve(style: BossSpinStyle, level: number, samples = 160): number[] {
  const base = bossSpinBaseDeg(level);
  const out: number[] = [];
  for (let i = 0; i <= samples; i++) {
    out.push(styleSpinRad(style, (i / samples) * style.cycle, base) * 180 / Math.PI);
  }
  return out;
}
