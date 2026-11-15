/**
 * Redrawn gem & fantasy guns: EMERALD LASER, SAPPHIRE SHOTGUN, MAGIC WAND,
 * RUBY REVOLVER, CRYSTAL CANNON and RAINBOW UNICORN.
 * Convention: muzzle at (0,0), the gun extends downward, grip to the lower right.
 */
import { drawGlow } from './glowSprite';
import { cyl, grip, ink, lg, poly, rr, shine, sparkle, star, type C, type Stops } from './redesign7';

const TAU = Math.PI * 2;
const GOLD: Stops = [[0, '#7a4e00'], [0.35, '#ffe48a'], [0.55, '#fff7d0'], [1, '#9a6400']];
const SILVER: Stops = [[0, '#4a525c'], [0.35, '#dfe6ee'], [0.55, '#ffffff'], [1, '#56606a']];

export type Fire = { ft: number; hot: number; kick: number };
export const fireOf = (sinceShot: number): Fire => {
  const ft = Number.isFinite(sinceShot) ? Math.max(0, sinceShot) : 99;
  return { ft, hot: ft < 0.4 ? 1 - ft / 0.4 : 0, kick: ft < 0.22 ? Math.pow(1 - ft / 0.22, 2) : 0 };
};

/** cut gemstone: table + facets, coloured by `col` (dark, mid, light) */
export function gem(c: C, x: number, y: number, rx: number, ry: number, col: [string, string, string], sides = 8) {
  const pts: number[] = [];
  for (let i = 0; i < sides; i++) {
    const a = (i / sides) * TAU - Math.PI / 2 + Math.PI / sides;
    pts.push(x + Math.cos(a) * rx, y + Math.sin(a) * ry);
  }
  poly(c, pts);
  c.fillStyle = lg(c, x - rx, y - ry, x + rx, y + ry, [[0, col[2]], [0.45, col[1]], [1, col[0]]]);
  c.fill();
  ink(c, 'rgba(10,20,30,0.75)', 1.2);
  // facets
  c.strokeStyle = 'rgba(255,255,255,0.35)';
  c.lineWidth = 0.9;
  for (let i = 0; i < sides; i++) {
    c.beginPath();
    c.moveTo(pts[i * 2], pts[i * 2 + 1]);
    c.lineTo(x + (pts[i * 2] - x) * 0.45, y + (pts[i * 2 + 1] - y) * 0.45);
    c.stroke();
  }
  const inner: number[] = [];
  for (let i = 0; i < sides; i++) inner.push(x + (pts[i * 2] - x) * 0.45, y + (pts[i * 2 + 1] - y) * 0.45);
  poly(c, inner);
  c.fillStyle = 'rgba(255,255,255,0.18)';
  c.fill();
  c.stroke();
  c.beginPath();
  c.ellipse(x - rx * 0.35, y - ry * 0.4, rx * 0.22, ry * 0.12, -0.6, 0, TAU);
  c.fillStyle = 'rgba(255,255,255,0.85)';
  c.fill();
}

/* ------------------------------------------------------------ EMERALD LASER */
function emerald(c: C, f: Fire, t: number) {
  const pulse = 0.5 + 0.5 * Math.sin(t * 4);
  c.save();
  c.translate(0, f.kick * 6);
  grip(c, 150, [[0, '#0f2a1c'], [0.5, '#2c6b48'], [1, '#0b2014']], '#06140c', '#ffd23a', 62);
  // receiver
  rr(c, -20, 96, 40, 64, 13);
  c.fillStyle = cyl(c, -20, 20, SILVER);
  c.fill();
  ink(c);
  for (const y of [100, 152]) {
    rr(c, -21, y, 42, 6, 3);
    c.fillStyle = cyl(c, -21, 21, GOLD);
    c.fill();
  }
  gem(c, 0, 128, 15, 19, ['#04502a', '#16c46a', '#b8ffd6'], 8);
  drawGlow(c, 0, 128, 34, '#40ff9a', 0.35 + 0.2 * pulse + f.hot * 0.4);
  // barrel with energy channel
  rr(c, -9, 26, 18, 74, 6);
  c.fillStyle = cyl(c, -9, 9, SILVER);
  c.fill();
  ink(c);
  rr(c, -3, 32, 6, 62, 3);
  c.fillStyle = '#062a16';
  c.fill();
  const fill = 0.35 + 0.65 * (f.ft < 0.5 ? f.ft / 0.5 : 1);
  rr(c, -2, 32 + 62 * (1 - fill), 4, 62 * fill, 2);
  c.fillStyle = lg(c, 0, 32, 0, 94, [[0, '#d4ffe6'], [1, '#18c46a']]);
  c.fill();
  for (const y of [40, 60, 80]) {
    rr(c, -11, y, 22, 5, 2);
    c.fillStyle = cyl(c, -11, 11, GOLD);
    c.fill();
  }
  // gold prongs holding the emitter emerald
  for (const s of [-1, 1]) {
    c.beginPath();
    c.moveTo(s * 8, 30);
    c.bezierCurveTo(s * 20, 22, s * 16, 6, s * 6, -2);
    c.lineWidth = 5;
    c.strokeStyle = '#6b4300';
    c.stroke();
    c.lineWidth = 3;
    c.strokeStyle = '#ffd86a';
    c.stroke();
  }
  gem(c, 0, 14, 9, 13, ['#05602f', '#2ee08a', '#d8ffe8'], 6);
  drawGlow(c, 0, 12, 26 + f.hot * 46, '#5dffad', 0.5 + 0.2 * pulse + f.hot * 0.5);
  c.restore();
}

/* --------------------------------------------------------- SAPPHIRE SHOTGUN */
function sapphire(c: C, f: Fire, t: number) {
  const pump = f.ft < 0.12 ? f.ft / 0.12 : f.ft < 0.3 ? 1 - (f.ft - 0.12) / 0.18 : 0;
  const blue: Stops = [[0, '#0a1e4a'], [0.45, '#2e6fd8'], [0.6, '#5d9bff'], [1, '#081a40']];
  c.save();
  c.translate(0, f.kick * 9);
  // stock (bottom)
  poly(c, [-12, 214, 12, 214, 16, 256, 2, 262, -16, 256]);
  c.fillStyle = cyl(c, -16, 16, [[0, '#3a1e0a'], [0.5, '#8a4f22'], [1, '#2e1606']]);
  c.fill();
  ink(c, '#1a0c02');
  grip(c, 186, [[0, '#3a1e0a'], [0.5, '#8a4f22'], [1, '#2e1606']], '#1a0c02', '#ffd23a', 50, 2);
  // receiver with sapphire
  rr(c, -19, 128, 38, 64, 11);
  c.fillStyle = cyl(c, -19, 19, blue);
  c.fill();
  ink(c, '#04102a', 1.5);
  c.save();
  rr(c, -19, 128, 38, 64, 11);
  c.clip();
  c.strokeStyle = 'rgba(255,214,90,0.85)';
  c.lineWidth = 1.4;
  for (const s of [-1, 1]) {
    c.beginPath();
    c.moveTo(s * 15, 134);
    c.bezierCurveTo(s * 4, 146, s * 16, 166, s * 5, 184);
    c.stroke();
  }
  c.restore();
  gem(c, 0, 160, 11, 14, ['#03144a', '#2a6cff', '#cfe1ff'], 8);
  drawGlow(c, 0, 160, 26, '#6aa8ff', 0.35 + f.hot * 0.4);
  // pump fore-end (slides back after each shot)
  const py = 86 + pump * 12;
  rr(c, -17, py, 34, 30, 7);
  c.fillStyle = cyl(c, -17, 17, [[0, '#3a1e0a'], [0.5, '#a0602a'], [1, '#2e1606']]);
  c.fill();
  ink(c, '#1a0c02');
  c.strokeStyle = 'rgba(0,0,0,0.35)';
  c.lineWidth = 1;
  for (let y = py + 5; y < py + 28; y += 5) {
    c.beginPath();
    c.moveTo(-14, y);
    c.lineTo(14, y);
    c.stroke();
  }
  // twin barrels (side by side, seen from behind)
  for (const s of [-1, 1]) {
    rr(c, s * 8 - 6, 8, 12, 124, 5);
    c.fillStyle = cyl(c, s * 8 - 6, s * 8 + 6, SILVER);
    c.fill();
    ink(c);
    c.beginPath();
    c.ellipse(s * 8, 9, 5, 2.6, 0, 0, TAU);
    c.fillStyle = '#10141a';
    c.fill();
  }
  rr(c, -15, 8, 30, 8, 3);
  c.fillStyle = cyl(c, -15, 15, GOLD);
  c.fill();
  ink(c, '#6b4300', 1);
  for (const s of [-1, 1]) {
    c.beginPath();
    c.ellipse(s * 8, 8, 4.5, 2.4, 0, 0, TAU);
    c.fillStyle = '#0a0d12';
    c.fill();
  }
  rr(c, -15, 60, 30, 6, 2);
  c.fillStyle = cyl(c, -15, 15, GOLD);
  c.fill();
  sparkle(c, 0, 2, 5, '#bcd6ff', 0.4 + 0.3 * Math.sin(t * 3));
  if (f.hot > 0.02) for (const s of [-1, 1]) drawGlow(c, s * 8, 2, 20 + f.hot * 30, '#9cc4ff', f.hot * 0.8);
  c.restore();
}

/* --------------------------------------------------------------- MAGIC WAND */
function wand(c: C, f: Fire, t: number) {
  c.save();
  c.translate(0, f.kick * 5);
  const wood: Stops = [[0, '#2a0e3a'], [0.45, '#7a3ab8'], [0.6, '#a868e8'], [1, '#220a32']];
  // handle
  rr(c, -11, 170, 22, 66, 10);
  c.fillStyle = cyl(c, -11, 11, [[0, '#24102e'], [0.5, '#5a2a78'], [1, '#1c0a24']]);
  c.fill();
  ink(c, '#100616');
  c.strokeStyle = 'rgba(255,214,90,0.8)';
  c.lineWidth = 2;
  for (let y = 178; y < 230; y += 9) {
    c.beginPath();
    c.moveTo(-11, y);
    c.lineTo(11, y + 5);
    c.stroke();
  }
  gem(c, 0, 240, 9, 9, ['#4a0a5a', '#c04aff', '#f4d8ff'], 8);
  rr(c, -14, 162, 28, 10, 4);
  c.fillStyle = cyl(c, -14, 14, GOLD);
  c.fill();
  ink(c, '#6b4300', 1);
  // tapered shaft with a spiral ribbon
  poly(c, [-4, 40, 4, 40, 9, 164, -9, 164]);
  c.fillStyle = cyl(c, -9, 9, wood);
  c.fill();
  ink(c, '#140620');
  c.save();
  poly(c, [-4, 40, 4, 40, 9, 164, -9, 164]);
  c.clip();
  for (let i = -2; i < 10; i++) {
    const y = 40 + i * 16 + ((t * 20) % 16);
    poly(c, [-10, y + 8, 10, y, 10, y + 4, -10, y + 12]);
    c.fillStyle = 'rgba(255,214,120,0.85)';
    c.fill();
  }
  c.restore();
  rr(c, -7, 38, 14, 6, 2);
  c.fillStyle = cyl(c, -7, 7, GOLD);
  c.fill();
  // crescent cradle + star crystal
  c.beginPath();
  c.arc(0, 24, 17, Math.PI * 0.15, Math.PI * 0.85, false);
  c.lineWidth = 4;
  c.strokeStyle = '#7a4e00';
  c.stroke();
  c.lineWidth = 2.4;
  c.strokeStyle = '#ffe07a';
  c.stroke();
  const spin = Math.sin(t * 1.6) * 0.15 + f.hot * 1.2;
  drawGlow(c, 0, 16, 40 + f.hot * 50, '#ffd8ff', 0.45 + f.hot * 0.5);
  c.save();
  c.translate(0, 16);
  c.rotate(spin);
  star(c, 0, 0, 17, 5, 0.47);
  c.fillStyle = lg(c, 0, -17, 0, 17, [[0, '#ffffff'], [0.4, '#ffe8ff'], [1, '#e070ff']]);
  c.fill();
  ink(c, '#8a2ab0', 1.5);
  star(c, 0, 0, 8, 5, 0.47);
  c.fillStyle = 'rgba(255,255,255,0.75)';
  c.fill();
  c.restore();
  // orbiting sparkles
  for (let i = 0; i < 4; i++) {
    const a = t * 2.2 + (i / 4) * TAU;
    sparkle(c, Math.cos(a) * 26, 16 + Math.sin(a) * 9, 3.5, ['#ffe27a', '#ff9cf0', '#9cf0ff', '#ffffff'][i], 0.8);
  }
  c.restore();
}

/* ------------------------------------------------------------ RUBY REVOLVER */
function ruby(c: C, f: Fire, t: number) {
  const red: Stops = [[0, '#4a0008'], [0.45, '#c8102e'], [0.6, '#ff4a5e'], [1, '#3a0006']];
  const hammer = f.ft < 0.05 ? 1 - f.ft / 0.05 : f.ft < 0.3 ? 0 : 0;
  c.save();
  c.translate(0, f.kick * 8);
  grip(c, 168, [[0, '#2e0006'], [0.5, '#8a0c1e'], [1, '#22000a']], '#140003', '#ffd23a', 64, 2);
  // gold inlay ruby on grip
  gem(c, 6, 196, 5, 6, ['#5a0010', '#ff2a46', '#ffd0d6'], 6);
  // frame
  rr(c, -16, 110, 32, 62, 9);
  c.fillStyle = cyl(c, -16, 16, GOLD);
  c.fill();
  ink(c, '#5a3a00', 1.5);
  // hammer
  poly(c, [-5, 166, 5, 166, 6, 180 + hammer * 6, -6, 180 + hammer * 6]);
  c.fillStyle = cyl(c, -6, 6, GOLD);
  c.fill();
  ink(c, '#5a3a00', 1);
  // cylinder with ruby chambers (turns one step per shot)
  rr(c, -24, 116, 48, 48, 14);
  c.fillStyle = cyl(c, -24, 24, red);
  c.fill();
  ink(c, '#2a0006', 1.6);
  const turn = f.ft < 0.2 ? f.ft / 0.2 : 1;
  for (let i = 0; i < 3; i++) {
    const x = (-14 + i * 14) + (1 - turn) * 6;
    if (x < -20 || x > 20) continue;
    gem(c, x, 140, 5, 9, ['#5a0010', '#ff2a46', '#ffd0d6'], 6);
  }
  c.strokeStyle = 'rgba(255,214,90,0.9)';
  c.lineWidth = 1.6;
  rr(c, -22, 118, 44, 44, 12);
  c.stroke();
  // barrel with gold rib
  rr(c, -9, 6, 18, 112, 5);
  c.fillStyle = cyl(c, -9, 9, red);
  c.fill();
  ink(c, '#2a0006');
  rr(c, -3, 8, 6, 108, 2);
  c.fillStyle = cyl(c, -3, 3, GOLD);
  c.fill();
  for (const y of [6, 56, 100]) {
    rr(c, -11, y, 22, 7, 3);
    c.fillStyle = cyl(c, -11, 11, GOLD);
    c.fill();
    ink(c, '#5a3a00', 1);
  }
  c.beginPath();
  c.ellipse(0, 7, 5, 2.4, 0, 0, TAU);
  c.fillStyle = '#140004';
  c.fill();
  // front sight gem
  gem(c, 0, -2, 4, 5, ['#5a0010', '#ff2a46', '#ffd0d6'], 6);
  sparkle(c, -6, 30, 4, '#ffd0d6', 0.5 + 0.4 * Math.sin(t * 3));
  if (f.hot > 0.02) drawGlow(c, 0, 2, 22 + f.hot * 36, '#ff6a7a', f.hot * 0.8);
  c.restore();
}

/* ----------------------------------------------------------- CRYSTAL CANNON */
const AME: [string, string, string] = ['#3a0a6a', '#a35cff', '#f0dcff'];
function shard(c: C, x: number, y: number, w: number, h: number, ang: number, col = AME) {
  c.save();
  c.translate(x, y);
  c.rotate(ang);
  poly(c, [0, -h, w * 0.5, -h * 0.72, w * 0.5, 0, -w * 0.5, 0, -w * 0.5, -h * 0.72]);
  c.fillStyle = lg(c, -w / 2, 0, w / 2, 0, [[0, col[0]], [0.45, col[1]], [0.6, col[2]], [1, col[0]]]);
  c.fill();
  ink(c, 'rgba(30,6,60,0.8)', 1.1);
  poly(c, [0, -h, w * 0.1, -h * 0.7, w * 0.1, 0, -w * 0.15, 0, -w * 0.15, -h * 0.7]);
  c.fillStyle = 'rgba(255,255,255,0.3)';
  c.fill();
  c.restore();
}
function crystal(c: C, f: Fire, t: number) {
  const pulse = 0.5 + 0.5 * Math.sin(t * 3.2);
  const metal: Stops = [[0, '#20142e'], [0.4, '#6c5a86'], [0.55, '#9a8ab4'], [1, '#1a1026']];
  c.save();
  c.translate(0, f.kick * 9);
  grip(c, 168, metal, '#0c0614', '#c48bff', 62);
  // body
  rr(c, -24, 100, 48, 74, 14);
  c.fillStyle = cyl(c, -24, 24, metal);
  c.fill();
  ink(c, '#0c0614', 1.6);
  // side shards growing out of the body
  shard(c, -22, 150, 11, 30, -0.6);
  shard(c, -20, 128, 9, 22, -0.9);
  shard(c, 22, 150, 11, 30, 0.6);
  shard(c, 20, 128, 9, 22, 0.9);
  // core window
  c.beginPath();
  c.ellipse(0, 138, 13, 22, 0, 0, TAU);
  c.fillStyle = '#12062a';
  c.fill();
  c.beginPath();
  c.ellipse(0, 138, 10 + pulse * 1.5, 19 + pulse * 2, 0, 0, TAU);
  c.fillStyle = lg(c, 0, 118, 0, 158, [[0, '#ffffff'], [0.4, '#d8b0ff'], [1, '#7a2ae0']]);
  c.fill();
  drawGlow(c, 0, 138, 40, '#c48bff', 0.4 + 0.2 * pulse + f.hot * 0.4);
  // barrel housing
  rr(c, -14, 40, 28, 64, 8);
  c.fillStyle = cyl(c, -14, 14, metal);
  c.fill();
  ink(c, '#0c0614');
  for (const y of [48, 70, 92]) {
    rr(c, -16, y, 32, 6, 2);
    c.fillStyle = cyl(c, -16, 16, SILVER);
    c.fill();
    ink(c, '#0c0614', 0.9);
  }
  // silver claws gripping the main crystal
  for (const s of [-1, 1]) {
    c.beginPath();
    c.moveTo(s * 12, 46);
    c.bezierCurveTo(s * 30, 36, s * 28, 12, s * 12, 2);
    c.lineTo(s * 9, 8);
    c.bezierCurveTo(s * 20, 18, s * 20, 32, s * 8, 42);
    c.closePath();
    c.fillStyle = cyl(c, s * 8, s * 28, SILVER);
    c.fill();
    ink(c, '#1a1026', 1.2);
  }
  drawGlow(c, 0, 18, 46 + f.hot * 50, '#d8b0ff', 0.45 + f.hot * 0.5);
  shard(c, -9, 44, 10, 26, -0.25);
  shard(c, 9, 44, 10, 26, 0.25);
  shard(c, 0, 46, 15, 48, 0);
  sparkle(c, 6, 4, 5, '#ffffff', 0.5 + 0.5 * Math.sin(t * 4));
  c.restore();
}

/* ---------------------------------------------------------- RAINBOW UNICORN */
const RB = ['#ff5d7a', '#ffa23a', '#ffe35a', '#5fe08a', '#4cc0ff', '#8c7bff', '#d07bff'];
function unicorn(c: C, f: Fire, t: number) {
  c.save();
  c.translate(0, f.kick * 6);
  grip(c, 186, [[0, '#d97bb6'], [0.5, '#ffd0ea'], [1, '#c060a0']], '#7a2a5a', '#ffd23a', 58);
  // flowing rainbow mane, behind the head
  for (let i = RB.length - 1; i >= 0; i--) {
    const sway = Math.sin(t * 2.4 + i * 0.5) * 4;
    c.beginPath();
    c.moveTo(-14 + i * 1.5, 74);
    c.bezierCurveTo(-40 - i * 2 + sway, 100, -26 - i * 3 + sway, 150, -38 - i * 2 + sway, 196 + i * 2);
    c.lineWidth = 9;
    c.lineCap = 'round';
    c.strokeStyle = RB[i];
    c.stroke();
  }
  for (let i = 0; i < 4; i++) {
    const sway = Math.sin(t * 2.4 + i) * 3;
    c.beginPath();
    c.moveTo(12, 78 + i * 6);
    c.bezierCurveTo(30 + sway, 96 + i * 8, 24 + sway, 128 + i * 8, 32 + sway, 150 + i * 10);
    c.lineWidth = 7;
    c.lineCap = 'round';
    c.strokeStyle = RB[(i * 2 + 1) % 7];
    c.stroke();
  }
  // neck / body
  c.beginPath();
  c.moveTo(-18, 110);
  c.bezierCurveTo(-24, 150, -18, 180, -12, 196);
  c.lineTo(16, 196);
  c.bezierCurveTo(22, 170, 22, 140, 18, 110);
  c.closePath();
  c.fillStyle = lg(c, -22, 0, 22, 0, [[0, '#e6dcf4'], [0.4, '#ffffff'], [1, '#d8cdec']]);
  c.fill();
  ink(c, '#9a86c4', 1.3);
  star(c, 0, 160, 9, 5, 0.47);
  c.fillStyle = lg(c, 0, 151, 0, 169, [[0, '#fff3a0'], [1, '#ffb21f']]);
  c.fill();
  ink(c, '#a86a00', 1);
  // head (seen from behind, slightly turned)
  c.beginPath();
  c.ellipse(0, 92, 22, 28, 0, 0, TAU);
  c.fillStyle = lg(c, -22, 70, 22, 120, [[0, '#ffffff'], [0.6, '#f6f1ff'], [1, '#d8cdec']]);
  c.fill();
  ink(c, '#9a86c4', 1.4);
  // ears
  for (const s of [-1, 1]) {
    poly(c, [s * 8, 70, s * 20, 52, s * 20, 74]);
    c.fillStyle = '#ffffff';
    c.fill();
    ink(c, '#9a86c4', 1.2);
    poly(c, [s * 11, 70, s * 18, 58, s * 18, 72]);
    c.fillStyle = '#ffc0dc';
    c.fill();
  }
  // eye + lashes + blush
  c.beginPath();
  c.ellipse(-9, 92, 4, 6, 0, 0, TAU);
  c.fillStyle = '#2a1640';
  c.fill();
  c.beginPath();
  c.arc(-10.2, 89.5, 1.6, 0, TAU);
  c.fillStyle = '#fff';
  c.fill();
  c.strokeStyle = '#2a1640';
  c.lineWidth = 1.2;
  for (const a of [-2.6, -2.2, -1.8]) {
    c.beginPath();
    c.moveTo(-9 + Math.cos(a) * 5, 92 + Math.sin(a) * 7);
    c.lineTo(-9 + Math.cos(a) * 8, 92 + Math.sin(a) * 10);
    c.stroke();
  }
  c.beginPath();
  c.ellipse(-12, 102, 5, 3, 0, 0, TAU);
  c.fillStyle = 'rgba(255,140,190,0.45)';
  c.fill();
  // forelock
  for (let i = 0; i < 3; i++) {
    c.beginPath();
    c.moveTo(-2 + i * 4, 66);
    c.quadraticCurveTo(10 + i * 3, 74, 6 + i * 4, 86);
    c.lineWidth = 5;
    c.lineCap = 'round';
    c.strokeStyle = RB[i * 2];
    c.stroke();
  }
  // golden spiral horn = barrel (muzzle at its tip)
  poly(c, [0, -2, 8, 66, -8, 66]);
  c.fillStyle = cyl(c, -8, 8, GOLD);
  c.fill();
  ink(c, '#7a4e00', 1.3);
  c.save();
  poly(c, [0, -2, 8, 66, -8, 66]);
  c.clip();
  c.strokeStyle = 'rgba(122,78,0,0.65)';
  c.lineWidth = 1.6;
  for (let y = 8; y < 66; y += 8) {
    c.beginPath();
    c.moveTo(-9, y + 5);
    c.lineTo(9, y - 2);
    c.stroke();
  }
  c.restore();
  drawGlow(c, 0, 2, 26 + f.hot * 50, '#ffe6fb', 0.5 + f.hot * 0.5);
  for (let i = 0; i < 5; i++) {
    const ph = (t * 0.7 + i * 0.2) % 1;
    sparkle(c, Math.sin(i * 2.1 + t * 1.3) * 30, 70 - ph * 90, 3.5 + 2 * (1 - ph), RB[(i * 3) % 7], (1 - ph) * 0.9);
  }
  c.restore();
}

export function drawRedesign8a(c: C, id: string, sinceShot: number, t: number): boolean {
  const f = fireOf(sinceShot);
  switch (id) {
    case 'emerald': emerald(c, f, t); return true;
    case 'sapphire': sapphire(c, f, t); return true;
    case 'wand': wand(c, f, t); return true;
    case 'ruby': ruby(c, f, t); return true;
    case 'crystal': crystal(c, f, t); return true;
    case 'unicorn': unicorn(c, f, t); return true;
    default: return false;
  }
}
export { shine };
