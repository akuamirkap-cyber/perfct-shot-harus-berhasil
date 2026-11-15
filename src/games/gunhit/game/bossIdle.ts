/**
 * IDLE BOS — satu gerakan khas untuk tiap kepala.
 *
 * Sebelumnya semua bos berbagi satu idle yang sama: melayang `sin(t·0.53)` px ke
 * samping, `sin(t·1.15)` px ke bawah, goyang 0.085 rad, napas 1.4 %. Karena
 * identik, sebelas bos terasa seperti satu bos dengan kulit berbeda.
 *
 * Tiap kepala sekarang bergerak seperti dirinya sendiri — kapal yang oleng,
 * naga yang mengepak, robot yang berdenting servo, kelelawar yang bergetar.
 * Semua amplitudo dijaga kecil (≤ 0.05 R untuk geser, ≤ 7° untuk rotasi) karena
 * matriks ini juga dipakai hit-test: mesin memetakan titik tembakan melewati
 * decor yang sama, jadi animasi tidak pernah membuat hit jadi tidak adil —
 * hanya lebih hidup.
 */
import type { HeadKind } from '../../perfect-shot/play/HeadArt';

export const TAU = Math.PI * 2;

export interface BossIdlePose {
  /** Geser horizontal, px (sudah dikalikan R oleh pemanggil bila perlu). */
  dx: number;
  /** Geser vertikal, px. */
  dy: number;
  /** Rotasi, radian — origin-nya dagu (50% 85%), sama seperti matriks lama. */
  rot: number;
  sx: number;
  sy: number;
}

const DEG = Math.PI / 180;

/**
 * Gerakan idle satu kepala pada waktu `t` (detik sejak stage dimulai).
 * `rage` menambah napas berat dan getaran marah di atas gerakan khasnya.
 */
export function bossIdlePose(head: HeadKind, t: number, R: number, rage = false): BossIdlePose {
  let dx = 0, dy = 0, rot = 0, sx = 1, sy = 1;

  switch (head) {
    case 'pirate': {
      // Geladak kapal: oleng lambat ke kiri-kanan sambil terangkat ombak.
      const swell = Math.sin(t * TAU / 3.4);
      const roll = Math.sin(t * TAU / 4.6 + 0.6);
      rot = roll * 5.4 * DEG;
      dx = swell * R * 0.028;
      dy = -Math.abs(swell) * R * 0.03;
      sy = 1 + swell * 0.012;
      break;
    }
    case 'jester': {
      // Badut yang tidak bisa diam: dua goyangan cepat lalu satu lompatan konyol.
      const hop = Math.abs(Math.sin(t * TAU / 1.15));
      const jig = Math.sin(t * TAU / 0.58);
      dy = -hop * R * 0.045;
      dx = jig * R * 0.03;
      rot = jig * 4.2 * DEG;
      const squash = hop > 0.94 ? 0.05 : 0;
      sx = 1 + squash; sy = 1 - squash;
      break;
    }
    case 'dragon': {
      // Melayang dengan kepakan: dua denyut pendek, lalu jeda meluncur.
      const beat = Math.sin(t * TAU / 0.86);
      const wings = Math.pow(Math.abs(beat), 0.6) * Math.sign(beat);
      dy = -wings * R * 0.042 - R * 0.012;
      dx = Math.sin(t * TAU / 5.1) * R * 0.02;
      rot = wings * 2.1 * DEG;
      // Paru-paru api: dadanya mengembang sebelum setiap embusan.
      const breath = 1 + 0.026 * Math.sin(t * TAU / 1.7);
      sx = breath; sy = 2 - breath;
      break;
    }
    case 'skeleton': {
      // Tengkorak berderit: tenggelam pelan, lalu gemeretak kecil berfrekuensi tinggi.
      const rattle = Math.sin(t * TAU * 5.7) * Math.exp(-Math.pow(((t % 4.3) - 1.1) * 2.1, 2));
      dx = rattle * R * 0.022;
      dy = Math.sin(t * TAU / 6.2) * R * 0.018;
      rot = (Math.sin(t * TAU / 5.4) * 2.4 + rattle * 3.2) * DEG;
      sx = 1 + rattle * 0.01;
      break;
    }
    case 'tiki': {
      // Totem batu: hampir tidak bergerak, tapi "bernapas" berat dan menghentak sesekali.
      const thud = Math.exp(-Math.pow(((t % 6.5) - 3.2) * 5.5, 2));
      dy = -thud * R * 0.036 + Math.sin(t * TAU / 5.8) * R * 0.008;
      const breath = 1 + 0.016 * Math.sin(t * TAU / 3.1);
      sx = breath + thud * 0.035;
      sy = 2 - breath - thud * 0.05;
      rot = thud * 1.6 * DEG * (Math.floor(t / 6.5) % 2 ? -1 : 1);
      break;
    }
    case 'viking': {
      // Mendayung: ayunan berat berirama, helmnya mengangguk di tiap tarikan.
      const row = Math.sin(t * TAU / 2.6);
      rot = row * 6.2 * DEG;
      dx = row * R * 0.034;
      dy = -Math.abs(row) * R * 0.02;
      const nod = Math.max(0, Math.sin(t * TAU / 2.6 - 0.9));
      sy = 1 + nod * 0.02;
      break;
    }
    case 'oni': {
      // Amarah tertahan: condong maju-mundur seperti menahan diri, lalu berdenyut.
      const lean = Math.sin(t * TAU / 2.2);
      const pulse = Math.pow(Math.abs(Math.sin(t * TAU / 1.3)), 3);
      rot = lean * 4.6 * DEG;
      dy = -pulse * R * 0.024 + lean * R * 0.012;
      dx = -lean * R * 0.02;
      sx = 1 + pulse * 0.03;
      sy = 1 - pulse * 0.02;
      break;
    }
    case 'robot': {
      // Servo: gerakannya terkuantisasi, seperti motor stepper, bukan organik.
      const step = (v: number, q: number) => Math.round(v / q) * q;
      const scan = step(Math.sin(t * TAU / 3.2), 0.25);
      const servo = step(Math.sin(t * TAU / 1.6), 0.34);
      dx = scan * R * 0.03;
      dy = servo * R * 0.016;
      rot = step(Math.sin(t * TAU / 4.4), 0.3) * 3.4 * DEG;
      // Ventilasi: satu hentakan pendek tiap 2.4 detik.
      const vent = Math.exp(-Math.pow(((t % 2.4) - 0.2) * 12, 2));
      sy = 1 - vent * 0.035;
      sx = 1 + vent * 0.02;
      break;
    }
    case 'alien': {
      // Tanpa gravitasi: lintasan Lissajous halus, kepalanya miring hipnotis.
      dx = Math.sin(t * TAU / 5.3) * R * 0.036;
      dy = Math.sin(t * TAU / 3.1 + 1.2) * R * 0.03;
      rot = Math.sin(t * TAU / 7.4) * 6.4 * DEG;
      const warp = Math.exp(-Math.pow(((t % 5.1) - 4.4) * 4.5, 2));
      sx = 1 + warp * 0.05;
      sy = 1 - warp * 0.045;
      break;
    }
    case 'vampire': {
      // Kelelawar: getaran kecil cepat di atas lambaian jubah yang lebar.
      const flutter = Math.sin(t * TAU * 3.1) * 0.5 + Math.sin(t * TAU * 4.7) * 0.5;
      dy = -Math.abs(flutter) * R * 0.026 - R * 0.008;
      const cape = Math.sin(t * TAU / 4.1);
      rot = cape * 5.2 * DEG;
      dx = cape * R * 0.022;
      sx = 1 + cape * 0.014;
      break;
    }
    case 'sun':
    default: {
      // Raja matahari: membesar-mengecil seperti bernyala, dengan korona berputar.
      const blaze = 0.5 + 0.5 * Math.sin(t * TAU / 1.9);
      const flare = Math.pow(blaze, 2);
      sx = 1 + 0.02 + flare * 0.035;
      sy = sx;
      rot = Math.sin(t * TAU / 6.8) * 3.6 * DEG + Math.sin(t * TAU / 11.3 + 0.8) * 1.9 * DEG;
      dy = -flare * R * 0.02;
      dx = Math.sin(t * TAU / 4.4) * R * 0.016;
      break;
    }
  }

  if (rage) {
    // NGAMUK: napas memburu + getaran marah di atas gerakan khasnya.
    const pant = 0.5 + 0.5 * Math.sin(t * TAU * 1.6);
    const tremor = Math.sin(t * TAU * 11) * 0.5 + Math.sin(t * TAU * 17.3) * 0.5;
    sx *= 1 + 0.045 * pant;
    sy *= 1 + 0.03 * pant;
    dx += tremor * R * 0.012;
    dy += -pant * R * 0.014;
    rot += tremor * 1.5 * DEG;
  }

  return { dx, dy, rot, sx, sy };
}

/** Nama gerakan khasnya, untuk kartu Kamus Bos. */
export const BOSS_IDLE_NAME: Record<HeadKind, string> = {
  pirate: 'OLENG KAPAL',
  jester: 'LOMPAT BADUT',
  dragon: 'KEPAKAN SAYAP',
  skeleton: 'GEMERETAK TULANG',
  tiki: 'HENTAKAN TOTEM',
  viking: 'DAYUNG BADAI',
  oni: 'AMARAH TERTAHAN',
  robot: 'SERVO MESIN',
  alien: 'MELAYANG ZERO-G',
  vampire: 'KEPAKAN KELAWAR',
  sun: 'NYALA KORONA',
};

export const BOSS_IDLE_NAME_EN: Record<HeadKind, string> = {
  pirate: 'SHIP ROLL',
  jester: 'JESTER HOP',
  dragon: 'WINGBEAT',
  skeleton: 'BONE RATTLE',
  tiki: 'TOTEM THUD',
  viking: 'STORM ROW',
  oni: 'HELD WRATH',
  robot: 'MACHINE SERVO',
  alien: 'ZERO-G DRIFT',
  vampire: 'BAT FLUTTER',
  sun: 'CORONA BLAZE',
};
