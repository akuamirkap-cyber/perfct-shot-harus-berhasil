/**
 * Round 9 redraws: NOISY CRICKET, FLAMETHROWER, RUBBER CHICKEN, MINIGUN, HONEY BLASTER,
 * RUBY REVOLVER, SAPPHIRE SHOTGUN, RAINBOW UNICORN, GAUNTLET CANNON, CRYO BLASTER,
 * MARTIAN HEAT-RAY (skin 3) and SINGULARITY CANNON.
 *
 * Muzzle at (0,0), the gun extends downward. Every pistol grip uses the game's own
 * ergonomic silhouette (same outline as gripSystem.drawModernGrip): beavertail, back
 * strap, finger grooves, trigger + guard at the front — recoloured per weapon.
 */
import { drawGlow } from './glowSprite';
import { cyl, ink, lg, poly, rr, shine, sideGrip, sparkle, star, type C, type Stops } from './redesign7';
import { fireOf, gem, type Fire } from './redesign8a';
import { drawRobotGlove } from '../../vendor/game-4/src/game/shapes7';

const TAU = Math.PI * 2;
const GOLD: Stops = [[0, '#7a4e00'], [0.35, '#ffe48a'], [0.55, '#fff7d0'], [1, '#9a6400']];
const CHROME: Stops = [[0, '#3a424c'], [0.22, '#c8d2dc'], [0.42, '#ffffff'], [0.6, '#a8b4c0'], [0.8, '#e8eef4'], [1, '#3a424c']];
const STEEL: Stops = [[0, '#16191d'], [0.4, '#4e5862'], [0.55, '#7a848e'], [1, '#121518']];
const easeOut = (k: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, k)), 3);
const backOut = (k: number) => {
  const x = Math.min(1, Math.max(0, k));
  return 1 + 2.2 * Math.pow(x - 1, 3) + 1.2 * Math.pow(x - 1, 2);
};
/** 1 = loaded, 0 = gone; launches at fire and reloads between r0..r1 seconds */
const reload = (ft: number, r0 = 0.24, r1 = 0.52) =>
  ft < 0.04 ? 1 - ft / 0.04 : ft < r0 ? 0 : ft < r1 ? backOut((ft - r0) / (r1 - r0)) : 1;

type GripPal = [string, string, string, string]; // edge, base, mid, dark
const G_BLACK: GripPal = ['#4a4e56', '#22252a', '#16181c', '#060708'];
const G_WOOD: GripPal = ['#c4824a', '#8a4f22', '#6a3814', '#341a06'];

/** Side-view pistol grip (see redesign7.sideGrip). (x, yTop) = old tang top; rear of receiver ≈ yTop + 4. */
function nGrip(c: C, x: number, yTop: number, pal: GripPal, o: { panel?: [string, string]; guard?: string; screw?: string; butt?: string; bw?: number; spur?: boolean } = {}) {
  sideGrip(c, x - 4, yTop + 4, pal, { bw: o.bw ?? 16, len: 52, panel: o.panel, guard: o.guard, screw: o.screw, butt: o.butt, spur: o.spur });
}

function flame(c: C, x: number, y: number, len: number, w: number, t: number, a = 1) {
  if (a <= 0.01 || len <= 1) return;
  c.save();
  c.globalAlpha = a;
  const layers: [number, string, string][] = [[1, 'rgba(255,90,20,0.9)', 'rgba(255,40,0,0)'], [0.7, 'rgba(255,170,40,0.95)', 'rgba(255,120,0,0)'], [0.42, 'rgba(255,245,200,1)', 'rgba(255,220,120,0)']];
  for (const [k, c0, c1] of layers) {
    const L = len * k * (0.9 + 0.1 * Math.sin(t * 43 + k * 9));
    const W = w * k;
    c.beginPath();
    c.moveTo(x - W, y);
    c.bezierCurveTo(x - W * 1.3, y - L * 0.35, x - W * 0.3 + Math.sin(t * 31) * W * 0.4, y - L * 0.75, x + Math.sin(t * 23 + k) * W * 0.35, y - L);
    c.bezierCurveTo(x + W * 0.3 + Math.sin(t * 29) * W * 0.4, y - L * 0.75, x + W * 1.3, y - L * 0.35, x + W, y);
    c.closePath();
    c.fillStyle = lg(c, 0, y, 0, y - L, [[0, c0], [1, c1]]);
    c.fill();
  }
  c.restore();
}

/* ============================================================ NOISY CRICKET */
function cricket(c: C, f: Fire, t: number) {
  const dark: Stops = [[0, '#2a323c'], [0.5, '#5a6672'], [1, '#2a323c']];
  c.save();
  c.translate(0, f.kick * 18);
  c.rotate(f.kick * 0.14);
  // checkered black grip with chrome frame, guard ring with a finger spur
  nGrip(c, 4, 132, ['#e8eef4', '#b8c4d0', '#8a96a2', '#4a5460'], { panel: ['#16181c', '#2c3036'], guard: '#dfe6ee', screw: '#e8eef4', butt: '#c8d2dc', bw: 13, spur: true });
  // chrome frame plate bridging the cylinder and the grip, with screws
  poly(c, [8, 92, 22, 100, 26, 128, 18, 138, 8, 140]);
  c.fillStyle = lg(c, 8, 92, 26, 140, CHROME);
  c.fill();
  ink(c, '#2a323c', 1.3);
  for (const [sx, sy] of [[16, 106], [18, 126]]) {
    c.beginPath();
    c.arc(sx, sy, 2.2, 0, TAU);
    c.fillStyle = lg(c, sx - 2, sy - 2, sx + 2, sy + 2, [[0, '#ffffff'], [1, '#5a6672']]);
    c.fill();
    ink(c, '#2a323c', 0.8);
  }
  // rear block: knurled knob and a cocking lever at the back
  rr(c, -13, 116, 26, 26, 6);
  c.fillStyle = cyl(c, -13, 13, CHROME);
  c.fill();
  ink(c, '#2a323c', 1.4);
  c.beginPath();
  c.arc(4, 130, 7, 0, TAU);
  c.fillStyle = lg(c, -3, 123, 11, 137, [[0, '#ffffff'], [0.5, '#c8d2dc'], [1, '#5a6672']]);
  c.fill();
  ink(c, '#2a323c', 1.2);
  c.beginPath();
  c.arc(4, 130, 2.6, 0, TAU);
  c.fillStyle = '#3a424c';
  c.fill();
  const cock = f.ft < 0.05 ? 0 : f.ft < 0.32 ? 1 - (f.ft - 0.05) / 0.27 : 0;
  c.save();
  c.translate(-4, 140);
  c.rotate(0.55 - cock * 0.5);
  rr(c, -2.5, 0, 5, 15, 2);
  c.fillStyle = cyl(c, -2.5, 2.5, CHROME);
  c.fill();
  ink(c, '#2a323c', 1);
  c.beginPath();
  c.ellipse(0, 16, 5.5, 3.4, 0, 0, TAU);
  c.fillStyle = lg(c, -5, 13, 5, 19, [[0, '#ffffff'], [1, '#7a8692']]);
  c.fill();
  ink(c, '#2a323c', 1);
  c.restore();
  // main cylinder
  rr(c, -13, 60, 26, 60, 7);
  c.fillStyle = cyl(c, -13, 13, CHROME);
  c.fill();
  ink(c, '#2a323c', 1.4);
  // the row of five blue cells along the top edge (left side here)
  rr(c, -13, 66, 12, 48, 4);
  c.fillStyle = cyl(c, -13, -1, dark);
  c.fill();
  ink(c, '#1a2230', 1);
  for (let i = 0; i < 5; i++) {
    const y = 68 + i * 9.2;
    const wave = f.ft < 0.6 ? Math.max(0, 1 - Math.abs(f.ft * 14 - (4 - i)) / 1.4) : 0;
    const lit = 0.6 + 0.25 * Math.sin(t * 4 + i) + wave * 0.6;
    rr(c, -11.5, y, 9, 7.6, 3);
    c.fillStyle = lg(c, -11.5, 0, -2.5, 0, [[0, '#0a3a98'], [0.5, `rgba(120,200,255,${Math.min(1, lit)})`], [1, '#0a2a78']]);
    c.fill();
    c.beginPath();
    c.ellipse(-9, y + 2.4, 1.6, 1, 0, 0, TAU);
    c.fillStyle = 'rgba(255,255,255,0.8)';
    c.fill();
    if (wave > 0.05) drawGlow(c, -7, y + 4, 14, '#7ad0ff', wave * 0.8);
  }
  drawGlow(c, -7, 90, 22, '#4ab0ff', 0.22 + f.hot * 0.4);
  shine(c, 3, 64, 3, 52, 0.65);
  for (const y of [60, 116]) {
    rr(c, -14.5, y - 2, 29, 6, 3);
    c.fillStyle = cyl(c, -14.5, 14.5, CHROME);
    c.fill();
    ink(c, '#2a323c', 1);
  }
  // bulbous vented nose
  c.beginPath();
  c.moveTo(-13, 60);
  c.bezierCurveTo(-18, 46, -12, 30, -4, 25);
  c.lineTo(4, 25);
  c.bezierCurveTo(12, 30, 18, 46, 13, 60);
  c.closePath();
  c.fillStyle = lg(c, -18, 25, 18, 60, CHROME);
  c.fill();
  ink(c, '#2a323c', 1.4);
  // oval vent slots
  for (const [vx, vy, rot] of [[-7, 44, 0.25], [0, 42, 0], [7, 44, -0.25]] as const) {
    c.beginPath();
    c.ellipse(vx, vy, 2.6, 7, rot, 0, TAU);
    c.fillStyle = '#1a2028';
    c.fill();
    c.beginPath();
    c.ellipse(vx + 0.6, vy + 1.5, 1.2, 4.5, rot, 0, TAU);
    c.fillStyle = f.hot > 0.05 ? `rgba(140,215,255,${f.hot})` : 'rgba(80,100,120,0.6)';
    c.fill();
  }
  c.beginPath();
  c.ellipse(-9, 36, 1.8, 5, 0.4, 0, TAU);
  c.fillStyle = 'rgba(255,255,255,0.85)';
  c.fill();
  // long tapered needle
  rr(c, -4, 21, 8, 6, 2.5);
  c.fillStyle = cyl(c, -4, 4, CHROME);
  c.fill();
  ink(c, '#2a323c', 1);
  poly(c, [-2.3, 22, 2.3, 22, 0.4, -14, -0.4, -14]);
  c.fillStyle = cyl(c, -2.3, 2.3, CHROME);
  c.fill();
  ink(c, '#2a323c', 0.8);
  drawGlow(c, 0, -14, 10 + f.hot * 60, '#9ae0ff', 0.2 + f.hot * 0.8);
  c.restore();
}

/* ================================================================== MINIGUN */
function minigun(c: C, f: Fire, t: number) {
  const orange = '#ff8a1a';
  const spinRate = 2 + 34 * Math.max(0, 1 - f.ft / 0.9);
  const spin = t * spinRate;
  c.save();
  c.translate(Math.sin(t * 90) * f.hot * 1.2, f.kick * 4);
  // ammo box + belt (left)
  rr(c, -46, 112, 26, 34, 6);
  c.fillStyle = cyl(c, -46, -20, [[0, '#1e2410'], [0.5, '#4a5a24'], [1, '#161c08']]);
  c.fill();
  ink(c, '#000', 1.3);
  rr(c, -46, 120, 26, 5, 1);
  c.fillStyle = orange;
  c.fill();
  for (let i = 0; i < 6; i++) {
    const k = i / 5;
    const x = -24 + k * 14;
    const y = 112 - Math.sin(k * Math.PI) * 10 + ((spin * 2) % 4);
    rr(c, x - 2.4, y - 5, 4.8, 9, 2);
    c.fillStyle = cyl(c, x - 2.4, x + 2.4, GOLD);
    c.fill();
  }
  nGrip(c, 6, 156, G_BLACK, { panel: ['#1a1c20', '#34383e'], guard: orange, butt: orange });
  // chunky body
  rr(c, -20, 100, 40, 62, 16);
  c.fillStyle = cyl(c, -20, 20, STEEL);
  c.fill();
  ink(c, '#000', 1.6);
  rr(c, -20, 128, 40, 6, 2);
  c.fillStyle = orange;
  c.fill();
  star(c, 0, 116, 6, 5, 0.48);
  c.fillStyle = orange;
  c.fill();
  c.beginPath();
  c.arc(-10, 150, 2.4, 0, TAU);
  c.arc(10, 150, 2.4, 0, TAU);
  c.fillStyle = '#3aff7a';
  c.fill();
  shine(c, -15, 106, 4, 48, 0.25);
  // spinning barrel cluster (6 barrels, back ones darker)
  const barrels = Array.from({ length: 6 }, (_, i) => {
    const a = spin + (i / 6) * TAU;
    return { x: Math.sin(a) * 9.5, d: Math.cos(a) };
  }).sort((p, q) => p.d - q.d);
  for (const b of barrels) {
    const k = 0.45 + 0.55 * (b.d + 1) / 2;
    rr(c, b.x - 3.4, 10, 6.8, 92, 3);
    c.fillStyle = cyl(c, b.x - 3.4, b.x + 3.4, [[0, '#0c0d0f'], [0.45, `rgb(${Math.round(70 + 90 * k)},${Math.round(78 + 92 * k)},${Math.round(88 + 96 * k)})`], [1, '#0a0b0c']]);
    c.fill();
    ink(c, '#000', 0.9);
  }
  for (const [y, h] of [[6, 10], [46, 8], [88, 10]]) {
    rr(c, -16, y, 32, h, 4);
    c.fillStyle = cyl(c, -16, 16, STEEL);
    c.fill();
    ink(c, '#000', 1.2);
  }
  rr(c, -16, 49, 32, 2.4, 1);
  c.fillStyle = orange;
  c.fill();
  if (f.hot > 0.02) {
    drawGlow(c, 0, 2, 22 + f.hot * 34, '#ffb04a', f.hot * 0.85);
    flame(c, Math.sin(spin) * 9, 6, 12 + 16 * f.hot, 4, t, f.hot);
  }
  c.restore();
}

/* ============================================================ HONEY BLASTER */
function honey(c: C, f: Fire, t: number) {
  const amber: Stops = [[0, '#8a4a00'], [0.4, '#ffb21f'], [0.6, '#ffd36a'], [1, '#7a3e00']];
  c.save();
  c.translate(0, f.kick * 6);
  nGrip(c, 4, 152, G_WOOD, { panel: ['#ffcf4a', '#e08a10'], guard: '#c8923a', screw: '#3a2004', butt: '#3a2004' });
  // honey tank (left, glass)
  rr(c, -42, 90, 22, 58, 10);
  c.fillStyle = 'rgba(255,240,200,0.28)';
  c.fill();
  c.save();
  rr(c, -42, 90, 22, 58, 10);
  c.clip();
  const lvl = 0.72 - f.hot * 0.12 + 0.03 * Math.sin(t * 2);
  const top = 90 + 58 * (1 - lvl);
  c.beginPath();
  c.moveTo(-44, 150);
  c.lineTo(-44, top);
  for (let x = -44; x <= -18; x += 4) c.lineTo(x, top + Math.sin(t * 3 + x * 0.4) * 1.2);
  c.lineTo(-18, 150);
  c.closePath();
  c.fillStyle = lg(c, 0, top, 0, 150, [[0, '#ffe08a'], [1, '#d07800']]);
  c.fill();
  for (let i = 0; i < 4; i++) {
    const ph = (t * 0.6 + i * 0.25) % 1;
    c.beginPath();
    c.arc(-36 + (i % 2) * 9, 146 - ph * (146 - top), 1.5, 0, TAU);
    c.fillStyle = 'rgba(255,255,255,0.7)';
    c.fill();
  }
  c.fillStyle = 'rgba(255,255,255,0.35)';
  c.fillRect(-38, 94, 3, 50);
  c.restore();
  rr(c, -42, 90, 22, 58, 10);
  ink(c, '#6a3a00', 1.4);
  for (const y of [86, 144]) {
    rr(c, -44, y, 26, 7, 3);
    c.fillStyle = cyl(c, -44, -18, GOLD);
    c.fill();
    ink(c, '#5a3a00', 1);
  }
  rr(c, -21, 124, 9, 6, 2);
  c.fillStyle = cyl(c, -21, -12, GOLD);
  c.fill();
  // body with bee stripes
  rr(c, -16, 96, 32, 60, 11);
  c.fillStyle = cyl(c, -16, 16, amber);
  c.fill();
  c.save();
  rr(c, -16, 96, 32, 60, 11);
  c.clip();
  c.fillStyle = cyl(c, -16, 16, [[0, '#0c0800'], [0.5, '#3a2a10'], [1, '#080500']]);
  for (const y of [108, 128, 148]) c.fillRect(-17, y, 34, 9);
  c.restore();
  rr(c, -16, 96, 32, 60, 11);
  ink(c, '#4a2800', 1.5);
  shine(c, -12, 100, 3, 50, 0.4);
  // neck
  rr(c, -9, 76, 18, 24, 5);
  c.fillStyle = cyl(c, -9, 9, GOLD);
  c.fill();
  ink(c, '#5a3a00', 1.2);
  // beehive (skep) muzzle: coiled rings growing wider toward the base
  for (let i = 5; i >= 0; i--) {
    const y = 8 + i * 12;
    const w = 7 + i * 3.4;
    rr(c, -w, y, w * 2, 14, 7);
    c.fillStyle = cyl(c, -w, w, amber);
    c.fill();
    ink(c, '#6a3a00', 1.2);
    c.beginPath();
    c.moveTo(-w + 3, y + 4);
    c.lineTo(w - 3, y + 4);
    c.strokeStyle = 'rgba(255,240,180,0.55)';
    c.lineWidth = 1.2;
    c.stroke();
  }
  // hive entrance + drip
  c.beginPath();
  c.ellipse(0, 9, 5.5, 3, 0, 0, TAU);
  c.fillStyle = '#2a1400';
  c.fill();
  const drip = 5 + Math.sin(t * 2) * 2.5 + f.hot * 5;
  c.beginPath();
  c.moveTo(4, 10);
  c.quadraticCurveTo(10, 12 + drip, 8, 15 + drip);
  c.quadraticCurveTo(5, 13 + drip, 6, 10);
  c.fillStyle = '#ffb21f';
  c.fill();
  drawGlow(c, 0, 6, 20 + f.hot * 40, '#ffcf5a', 0.3 + f.hot * 0.5);
  // bee
  const bx = Math.cos(t * 2.3) * 32, by = 44 + Math.sin(t * 4.6) * 14;
  c.beginPath();
  c.ellipse(bx, by, 5, 3.8, 0, 0, TAU);
  c.fillStyle = '#ffc82a';
  c.fill();
  ink(c, '#2a1a00', 0.8);
  c.fillStyle = '#2a1a00';
  c.fillRect(bx - 1.6, by - 3.6, 1.6, 7.2);
  c.fillRect(bx + 1.6, by - 3.2, 1.4, 6.4);
  c.beginPath();
  c.ellipse(bx - 1, by - 4.6, 3.4, 2.2, -0.5, 0, TAU);
  c.fillStyle = 'rgba(220,240,255,0.9)';
  c.fill();
  c.restore();
}

/* ============================================================ RUBY REVOLVER */
const RUBY: [string, string, string] = ['#5a0010', '#ff2a46', '#ffd0d6'];
function ruby(c: C, f: Fire, t: number) {
  const red: Stops = [[0, '#3a0006'], [0.4, '#b0101e'], [0.55, '#e83848'], [1, '#2a0004']];
  c.save();
  c.translate(0, f.kick * 9);
  c.rotate(f.kick * 0.06);
  nGrip(c, 6, 150, ['#c4605a', '#8a1a1a', '#6a1010', '#300406'], { panel: ['#5a0c10', '#9a2028'], guard: '#ffd86a', screw: '#ffd86a', butt: '#ffd86a' });
  gem(c, 23, 132, 4.5, 5.5, RUBY, 6);
  // hammer spur
  const cock = f.ft < 0.04 ? 0 : f.ft < 0.32 ? 1 - (f.ft - 0.04) / 0.28 : 0;
  c.save();
  c.translate(10, 146);
  c.rotate(0.35 + cock * 0.45);
  poly(c, [-3, 0, 4, 0, 6, 14, 12, 18, 2, 18]);
  c.fillStyle = cyl(c, -3, 12, GOLD);
  c.fill();
  ink(c, '#5a3a00', 1.1);
  c.restore();
  // frame
  rr(c, -12, 92, 24, 62, 7);
  c.fillStyle = cyl(c, -12, 12, GOLD);
  c.fill();
  ink(c, '#5a3a00', 1.4);
  c.strokeStyle = 'rgba(120,70,0,0.6)';
  c.lineWidth = 1;
  for (const s of [-1, 1]) {
    c.beginPath();
    c.moveTo(s * 9, 144);
    c.bezierCurveTo(s * 2, 138, s * 10, 130, s * 3, 124);
    c.stroke();
  }
  // fluted cylinder (rotates one chamber per shot)
  const turn = f.ft < 0.2 ? easeOut(f.ft / 0.2) : 1;
  rr(c, -18, 96, 36, 34, 9);
  c.fillStyle = cyl(c, -18, 18, red);
  c.fill();
  ink(c, '#1a0002', 1.6);
  c.save();
  rr(c, -18, 96, 36, 34, 9);
  c.clip();
  for (let i = -1; i < 4; i++) {
    const x = -12 + i * 12 + (1 - turn) * 12;
    rr(c, x - 3, 99, 6, 28, 3);
    c.fillStyle = 'rgba(20,0,4,0.55)';
    c.fill();
    gem(c, x, 113, 2.8, 4.2, RUBY, 6);
  }
  c.restore();
  c.strokeStyle = 'rgba(255,214,90,0.9)';
  c.lineWidth = 1.6;
  rr(c, -16, 98, 32, 30, 8);
  c.stroke();
  // ejector housing (under the barrel = front side) + barrel
  rr(c, -12, 44, 6, 52, 3);
  c.fillStyle = cyl(c, -12, -6, GOLD);
  c.fill();
  ink(c, '#5a3a00', 1);
  rr(c, -6.5, 6, 13, 92, 4);
  c.fillStyle = cyl(c, -6.5, 6.5, red);
  c.fill();
  ink(c, '#1a0002', 1.3);
  rr(c, -2.2, 8, 4.4, 88, 2);
  c.fillStyle = cyl(c, -2.2, 2.2, GOLD);
  c.fill();
  rr(c, -8, 6, 16, 7, 3);
  c.fillStyle = cyl(c, -8, 8, GOLD);
  c.fill();
  ink(c, '#5a3a00', 1);
  c.beginPath();
  c.ellipse(0, 7, 4, 2, 0, 0, TAU);
  c.fillStyle = '#120002';
  c.fill();
  gem(c, 0, 1, 3.2, 4, RUBY, 6);
  sparkle(c, -4, 40, 3.5, '#ffd0d6', 0.45 + 0.4 * Math.sin(t * 3));
  if (f.hot > 0.02) drawGlow(c, 0, 0, 18 + f.hot * 34, '#ff6a7a', f.hot * 0.85);
  c.restore();
}

/* ========================================================== RAINBOW UNICORN */
const RB = ['#ff5d7a', '#ffa23a', '#ffe35a', '#5fe08a', '#4cc0ff', '#8c7bff', '#d07bff'];
function unicorn(c: C, f: Fire, t: number) {
  const pearl: Stops = [[0, '#d8cdec'], [0.4, '#ffffff'], [0.7, '#f4efff'], [1, '#c8bce0']];
  c.save();
  c.translate(0, f.kick * 6);
  nGrip(c, 6, 172, ['#ffd0ea', '#ff9ccf', '#f07ab8', '#b04a86'], { panel: ['#ffffff', '#ffe0f2'], guard: '#ffd23a', screw: '#ffd23a', butt: '#ffd23a' });
  // flowing rainbow mane down the back (right) side
  for (let i = RB.length - 1; i >= 0; i--) {
    const sway = Math.sin(t * 2.4 + i * 0.45) * 4;
    c.beginPath();
    c.moveTo(14 - i * 1.2, 38 + i * 3);
    c.bezierCurveTo(36 + i * 1.5 + sway, 70, 22 + sway, 120, 34 + i * 1.5 + sway, 160);
    c.lineWidth = 7;
    c.lineCap = 'round';
    c.strokeStyle = RB[i];
    c.stroke();
  }
  // neck / body
  c.beginPath();
  c.moveTo(-14, 84);
  c.bezierCurveTo(-18, 120, -14, 150, -12, 176);
  c.lineTo(18, 176);
  c.bezierCurveTo(20, 140, 20, 100, 18, 72);
  c.closePath();
  c.fillStyle = cyl(c, -18, 20, pearl);
  c.fill();
  ink(c, '#9a86c4', 1.4);
  rr(c, -15, 164, 34, 9, 4);
  c.fillStyle = cyl(c, -15, 19, GOLD);
  c.fill();
  ink(c, '#7a4e00', 1);
  star(c, 2, 130, 9, 5, 0.47);
  c.fillStyle = lg(c, 0, 121, 0, 139, [[0, '#fff3a0'], [1, '#ffb21f']]);
  c.fill();
  ink(c, '#a86a00', 1);
  // head in profile: muzzle to the left, horn on top
  const head = () => {
    c.beginPath();
    c.moveTo(-2, 32);
    c.bezierCurveTo(16, 30, 26, 46, 22, 64);
    c.bezierCurveTo(19, 78, 8, 86, -6, 88);
    c.bezierCurveTo(-18, 90, -30, 86, -33, 76);
    c.bezierCurveTo(-35, 68, -30, 62, -24, 58);
    c.bezierCurveTo(-18, 46, -14, 34, -2, 32);
    c.closePath();
  };
  head();
  c.fillStyle = lg(c, -34, 32, 24, 90, [[0, '#ffffff'], [0.6, '#f8f4ff'], [1, '#ddd2f0']]);
  c.fill();
  ink(c, '#9a86c4', 1.5);
  // muzzle shading, nostril, smile
  c.beginPath();
  c.ellipse(-24, 76, 10, 8, -0.35, 0, TAU);
  c.fillStyle = 'rgba(255,190,220,0.45)';
  c.fill();
  c.beginPath();
  c.ellipse(-28, 74, 2, 1.4, -0.4, 0, TAU);
  c.fillStyle = '#b07aa0';
  c.fill();
  c.beginPath();
  c.moveTo(-26, 82);
  c.quadraticCurveTo(-20, 86, -14, 82);
  c.strokeStyle = '#b07aa0';
  c.lineWidth = 1.4;
  c.lineCap = 'round';
  c.stroke();
  // big sparkly eye
  const blink = (t % 3.6) > 3.45 ? 0.15 : 1;
  c.save();
  c.translate(2, 56);
  c.scale(1, blink);
  c.beginPath();
  c.ellipse(0, 0, 7.5, 9.5, 0.1, 0, TAU);
  c.fillStyle = '#ffffff';
  c.fill();
  ink(c, '#3a2060', 1.2);
  c.beginPath();
  c.ellipse(-0.6, 1, 5.6, 7.6, 0.1, 0, TAU);
  c.fillStyle = lg(c, 0, -7, 0, 9, [[0, '#5a2a9a'], [0.6, '#8a4ad8'], [1, '#c890ff']]);
  c.fill();
  c.beginPath();
  c.ellipse(-0.6, 1.5, 3, 4, 0.1, 0, TAU);
  c.fillStyle = '#1a0a30';
  c.fill();
  c.beginPath();
  c.arc(-2.6, -2.4, 2.2, 0, TAU);
  c.arc(1.8, 4, 1.1, 0, TAU);
  c.fillStyle = '#ffffff';
  c.fill();
  c.restore();
  c.strokeStyle = '#3a2060';
  c.lineWidth = 1.5;
  c.lineCap = 'round';
  for (const [a, l] of [[-0.6, 5], [-0.2, 6], [0.2, 5]] as const) {
    c.beginPath();
    c.moveTo(2 + Math.cos(a - Math.PI / 2) * 9 + 4, 56 + Math.sin(a - Math.PI / 2) * 10);
    c.lineTo(2 + Math.cos(a - Math.PI / 2) * (9 + l) + 6, 56 + Math.sin(a - Math.PI / 2) * (10 + l));
    c.stroke();
  }
  c.beginPath();
  c.ellipse(-6, 70, 5, 3, 0, 0, TAU);
  c.fillStyle = 'rgba(255,130,180,0.5)';
  c.fill();
  // ear (behind the horn)
  poly(c, [10, 38, 22, 18, 20, 44]);
  c.fillStyle = '#ffffff';
  c.fill();
  ink(c, '#9a86c4', 1.2);
  poly(c, [12, 38, 20, 24, 19, 41]);
  c.fillStyle = '#ffc0dc';
  c.fill();
  // rainbow forelock curls
  for (let i = 0; i < 4; i++) {
    c.beginPath();
    c.moveTo(-4 + i * 4, 32);
    c.quadraticCurveTo(-16 + i * 2, 38 + i, -12 + i * 3, 48 + i * 2);
    c.lineWidth = 4.6;
    c.lineCap = 'round';
    c.strokeStyle = RB[i * 2];
    c.stroke();
  }
  // golden spiral horn = barrel
  poly(c, [0, -2, 7, 36, -7, 36]);
  c.fillStyle = cyl(c, -7, 7, GOLD);
  c.fill();
  ink(c, '#7a4e00', 1.3);
  c.save();
  poly(c, [0, -2, 7, 36, -7, 36]);
  c.clip();
  c.strokeStyle = 'rgba(122,78,0,0.65)';
  c.lineWidth = 1.5;
  for (let y = 6; y < 38; y += 6) {
    c.beginPath();
    c.moveTo(-8, y + 4);
    c.lineTo(8, y - 1);
    c.stroke();
  }
  c.restore();
  drawGlow(c, 0, 2, 24 + f.hot * 50, '#ffe6fb', 0.5 + f.hot * 0.5);
  for (let i = 0; i < 5; i++) {
    const ph = (t * 0.7 + i * 0.2) % 1;
    sparkle(c, Math.sin(i * 2.1 + t * 1.3) * 32, 40 - ph * 60, 3.4 + 2 * (1 - ph), RB[(i * 3) % 7], (1 - ph) * 0.9);
  }
  c.restore();
}

/* ========================================================== GAUNTLET CANNON */
function gauntlet(c: C, f: Fire, t: number) {
  const red: Stops = [[0, '#4a0006'], [0.4, '#c81a22'], [0.55, '#ff4a4a'], [1, '#3a0004']];
  const load = reload(f.ft, 0.32, 0.62);
  const pulse = 0.5 + 0.5 * Math.sin(t * 4);
  c.save();
  c.translate(0, f.kick * 9);
  nGrip(c, 6, 164, ['#c4605a', '#a8141c', '#7a0a12', '#300004'], { panel: ['#ffd86a', '#c8923a'], guard: '#ffd86a', screw: '#5a3a00', butt: '#ffd86a' });
  // launcher tube
  rr(c, -17, 74, 34, 94, 11);
  c.fillStyle = cyl(c, -17, 17, red);
  c.fill();
  ink(c, '#1a0002', 1.6);
  for (const y of [96, 128, 156]) {
    rr(c, -18, y, 36, 8, 3);
    c.fillStyle = cyl(c, -18, 18, GOLD);
    c.fill();
    ink(c, '#5a3a00', 1);
  }
  for (const y of [108, 140]) {
    rr(c, -7, y, 14, 12, 3);
    c.fillStyle = '#081a28';
    c.fill();
    rr(c, -5, y + 2, 10, 8, 2);
    c.fillStyle = `rgba(140,225,255,${0.55 + 0.35 * pulse})`;
    c.fill();
  }
  shine(c, -13, 78, 3, 84, 0.35);
  // the rocket fist (same glove as the "Slide 3" shot) – launches and reloads
  if (load > 0.01) {
    c.save();
    c.beginPath();
    c.rect(-60, -40, 120, 108);
    c.clip();
    c.translate(0, 27 + (1 - load) * 50);
    c.globalAlpha = Math.min(1, load * 1.5);
    drawRobotGlove(c, 0.84, t, 0.55 + f.hot * 0.4);
    c.restore();
  }
  // launch collar (the glove's cuff seats in it)
  rr(c, -21, 62, 42, 15, 6);
  c.fillStyle = cyl(c, -21, 21, [[0, '#2a2e34'], [0.4, '#c8d0d8'], [0.55, '#ffffff'], [1, '#2a2e34']]);
  c.fill();
  ink(c, '#0c0e10', 1.4);
  rr(c, -17, 66, 34, 4, 2);
  c.fillStyle = `rgba(255,170,80,${0.5 + 0.4 * pulse + f.hot * 0.4})`;
  c.fill();
  drawGlow(c, 0, 66, 24 + f.hot * 40, '#ffa04a', 0.25 + f.hot * 0.6);
  if (f.hot > 0.02 && load < 0.5) flame(c, 0, 62, 22 * f.hot + 10, 9, t, f.hot);
  c.restore();
}

/* ============================================================== CRYO BLASTER */
function iceShard(c: C, x: number, y: number, w: number, h: number, ang: number) {
  c.save();
  c.translate(x, y);
  c.rotate(ang);
  poly(c, [0, -h, w / 2, -h * 0.68, w / 2, 0, -w / 2, 0, -w / 2, -h * 0.68]);
  c.fillStyle = lg(c, -w / 2, 0, w / 2, 0, [[0, '#7ac8f0'], [0.45, '#e8faff'], [0.6, '#ffffff'], [1, '#5aa8e0']]);
  c.fill();
  ink(c, 'rgba(30,90,140,0.8)', 1);
  poly(c, [0, -h, w * 0.12, -h * 0.68, w * 0.12, 0, -w * 0.14, 0, -w * 0.14, -h * 0.68]);
  c.fillStyle = 'rgba(255,255,255,0.5)';
  c.fill();
  c.restore();
}
function cryo(c: C, f: Fire, t: number) {
  const white: Stops = [[0, '#9ab8cc'], [0.4, '#ffffff'], [0.6, '#eef7fc'], [1, '#86a6bc']];
  const blue: Stops = [[0, '#0a3a78'], [0.5, '#2a8ae8'], [1, '#08306a']];
  const pulse = 0.5 + 0.5 * Math.sin(t * 3);
  c.save();
  c.translate(0, f.kick * 7);
  nGrip(c, 4, 152, ['#ffffff', '#dce8f2', '#b4c8d8', '#6a8aa4'], { panel: ['#2a8ae8', '#0a4ab0'], guard: '#5ac0ff', screw: '#ffffff', butt: '#2a8ae8' });
  // coolant canister (left)
  rr(c, -40, 98, 20, 50, 9);
  c.fillStyle = 'rgba(200,240,255,0.3)';
  c.fill();
  c.save();
  rr(c, -40, 98, 20, 50, 9);
  c.clip();
  c.fillStyle = lg(c, 0, 106, 0, 148, [[0, '#bff3ff'], [1, '#1a7ad8']]);
  c.fillRect(-40, 108 + f.hot * 8, 20, 40);
  for (let i = 0; i < 4; i++) {
    const ph = (t * 0.8 + i * 0.25) % 1;
    c.beginPath();
    c.arc(-34 + (i % 2) * 8, 146 - ph * 36, 1.5, 0, TAU);
    c.fillStyle = 'rgba(255,255,255,0.85)';
    c.fill();
  }
  c.restore();
  rr(c, -40, 98, 20, 50, 9);
  ink(c, '#2a5a78', 1.3);
  for (const y of [94, 144]) {
    rr(c, -42, y, 24, 6, 3);
    c.fillStyle = cyl(c, -42, -18, blue);
    c.fill();
  }
  rr(c, -21, 120, 7, 6, 2);
  c.fillStyle = cyl(c, -21, -14, blue);
  c.fill();
  // body
  rr(c, -15, 96, 30, 60, 11);
  c.fillStyle = cyl(c, -15, 15, white);
  c.fill();
  ink(c, '#2a5a78', 1.5);
  rr(c, -15, 112, 30, 22, 4);
  c.fillStyle = cyl(c, -15, 15, blue);
  c.fill();
  // snowflake emblem
  c.save();
  c.translate(0, 123);
  c.strokeStyle = '#ffffff';
  c.lineWidth = 1.6;
  c.lineCap = 'round';
  for (let i = 0; i < 3; i++) {
    c.rotate(Math.PI / 3);
    c.beginPath();
    c.moveTo(0, -7);
    c.lineTo(0, 7);
    c.stroke();
  }
  c.restore();
  shine(c, -11, 100, 3, 50, 0.5);
  // barrel: clear ice tube with a glowing core and a coolant coil
  rr(c, -8, 30, 16, 70, 6);
  c.fillStyle = cyl(c, -8, 8, [[0, '#4a9ad0'], [0.45, '#d8f6ff'], [0.6, '#ffffff'], [1, '#3a86c0']]);
  c.fill();
  ink(c, '#2a5a78', 1.2);
  rr(c, -1.6, 34, 3.2, 62, 1.6);
  c.fillStyle = `rgba(90,200,255,${0.6 + 0.3 * pulse + f.hot * 0.3})`;
  c.fill();
  c.beginPath();
  for (let y = 32; y <= 98; y += 2) {
    const x = Math.sin((y + t * 30) * 0.35) * 9;
    if (y === 32) c.moveTo(x, y); else c.lineTo(x, y);
  }
  c.strokeStyle = 'rgba(30,110,200,0.75)';
  c.lineWidth = 2;
  c.stroke();
  for (const y of [30, 96]) {
    rr(c, -11, y - 2, 22, 7, 3);
    c.fillStyle = cyl(c, -11, 11, blue);
    c.fill();
    ink(c, '#04203a', 1);
  }
  // ice-crystal crown emitter
  drawGlow(c, 0, 14, 30 + f.hot * 50, '#bff3ff', 0.5 + 0.2 * pulse + f.hot * 0.5);
  iceShard(c, -10, 30, 7, 18, -0.5);
  iceShard(c, 10, 30, 7, 18, 0.5);
  iceShard(c, -5, 30, 8, 24, -0.2);
  iceShard(c, 5, 30, 8, 24, 0.2);
  iceShard(c, 0, 30, 10, 30, 0);
  c.beginPath();
  c.ellipse(0, 30, 13, 3.6, 0, 0, TAU);
  c.strokeStyle = 'rgba(200,245,255,0.9)';
  c.lineWidth = 1.6;
  c.stroke();
  // frosty vapour
  for (let i = 0; i < 4; i++) {
    const ph = (t * 0.5 + i * 0.25) % 1;
    c.beginPath();
    c.arc(Math.sin(i * 2.2 + t) * 14, 26 - ph * 36, 3 + ph * 5, 0, TAU);
    c.fillStyle = `rgba(225,248,255,${(1 - ph) * 0.35})`;
    c.fill();
  }
  if (f.hot > 0.02) for (let i = 0; i < 5; i++) sparkle(c, Math.cos(i * 1.3) * (10 + 26 * (1 - f.hot)), -6 - 20 * (1 - f.hot) + i * 2, 3.5, '#ffffff', f.hot);
  c.restore();
}

/* ================================================= MARTIAN HEAT-RAY (skin 3) */
function heatRay(c: C, f: Fire, t: number) {
  const pulse = 0.5 + 0.5 * Math.sin(t * 4);
  const DARK = '#141a22';
  c.save();
  c.translate(0, f.kick * 6);

  /* ---------- flexible hose: a travelling wave, like a swimming snake ----------
     The top is clamped to the neck (no sway there), the swing grows toward the
     tail, and a shot sends an extra ripple down the hose. */
  const N = 44;
  const top = 86, len = 168;
  const pts: [number, number][] = [];
  for (let i = 0; i <= N; i++) {
    const u = i / N;
    const amp = 24 * Math.pow(u, 0.8) + f.kick * 10 * Math.sin(u * Math.PI);
    const x = amp * Math.sin(u * 2.5 * Math.PI - t * 2.6) + 6 * u * Math.sin(t * 0.9);
    const y = top + u * len - Math.abs(Math.sin(u * 2.5 * Math.PI - t * 2.6)) * 4 * u;
    pts.push([x, y]);
  }
  const width = (u: number) => 13 - u * 4;
  const seg = (lw: (u: number) => number, col: string, dx = 0) => {
    c.strokeStyle = col;
    for (let i = 0; i < N; i++) {
      c.lineWidth = lw(i / N);
      c.beginPath();
      c.moveTo(pts[i][0] + dx, pts[i][1]);
      c.lineTo(pts[i + 1][0] + dx, pts[i + 1][1]);
      c.stroke();
    }
  };
  c.lineCap = 'round';
  seg((u) => width(u) + 3, DARK);
  seg(width, '#5a6674');
  seg((u) => width(u) * 0.55, '#8e9aa8', -1);
  seg((u) => width(u) * 0.2, 'rgba(230,238,246,0.85)', -2.2);
  // corrugation ribs, perpendicular to the hose
  for (let i = 1; i < N; i += 1) {
    const [x0, y0] = pts[i - 1], [x1, y1] = pts[i + 1];
    const dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy) || 1;
    const nx = -dy / L, ny = dx / L, hw = width(i / N) / 2;
    c.beginPath();
    c.moveTo(pts[i][0] - nx * hw, pts[i][1] - ny * hw);
    c.lineTo(pts[i][0] + nx * hw, pts[i][1] + ny * hw);
    c.lineWidth = 1;
    c.strokeStyle = 'rgba(16,22,30,0.5)';
    c.stroke();
  }
  // green energy pulses flowing up toward the head (faster while firing)
  for (let k = 0; k < 3; k++) {
    const ph = 1 - ((t * (0.55 + f.hot * 1.2) + k / 3) % 1);
    const idx = Math.min(N, Math.floor(ph * N));
    const [px, py] = pts[idx];
    drawGlow(c, px, py, 16, '#5dff7a', 0.65);
    c.beginPath();
    c.arc(px, py, 2.6, 0, TAU);
    c.fillStyle = '#d8ffe0';
    c.fill();
  }
  // tail plug, aligned with the hose end
  {
    const [x0, y0] = pts[N - 2], [x1, y1] = pts[N];
    const ang = Math.atan2(y1 - y0, x1 - x0) - Math.PI / 2;
    c.save();
    c.translate(x1, y1);
    c.rotate(ang);
    rr(c, -7, -2, 14, 12, 3);
    c.fillStyle = cyl(c, -7, 7, CHROME);
    c.fill();
    ink(c, DARK, 1.2);
    rr(c, -4, 9, 8, 5, 2);
    c.fillStyle = '#2a323c';
    c.fill();
    c.beginPath();
    c.arc(0, 4, 1.8, 0, TAU);
    c.fillStyle = '#5dff7a';
    c.fill();
    c.restore();
  }

  /* ---------- neck: flexible bellows + chrome ferrule (hides the hose top) ---------- */
  for (let i = 0; i < 3; i++) {
    const y = 72 + i * 5;
    rr(c, -9 + i * 0.6, y, 18 - i * 1.2, 5, 2.5);
    c.fillStyle = cyl(c, -9, 9, [[0, '#2a323c'], [0.45, '#b8c4d0'], [1, '#2a323c']]);
    c.fill();
    ink(c, DARK, 0.9);
  }
  rr(c, -10, 86, 20, 7, 3);
  c.fillStyle = cyl(c, -10, 10, CHROME);
  c.fill();
  ink(c, DARK, 1.2);
  c.beginPath();
  c.arc(0, 89.5, 1.6, 0, TAU);
  c.fillStyle = `rgba(110,255,150,${0.6 + 0.4 * pulse})`;
  c.fill();

  /* ---------- arrowhead hood (the signature silhouette) ---------- */
  const hood = () => {
    c.beginPath();
    c.moveTo(0, 10);
    c.bezierCurveTo(9, 14, 20, 34, 25, 54);
    c.lineTo(32, 68); // swept-back barb
    c.quadraticCurveTo(22, 66, 15, 64);
    c.quadraticCurveTo(11, 70, 9, 76);
    c.lineTo(-9, 76);
    c.quadraticCurveTo(-11, 70, -15, 64);
    c.quadraticCurveTo(-22, 66, -32, 68);
    c.lineTo(-25, 54);
    c.bezierCurveTo(-20, 34, -9, 14, 0, 10);
    c.closePath();
  };
  hood();
  c.fillStyle = cyl(c, -32, 32, CHROME);
  c.fill();
  ink(c, DARK, 1.6);
  // shading: darker underside of the barbs, bright ridge in the middle
  c.save();
  hood();
  c.clip();
  c.fillStyle = 'rgba(20,28,38,0.35)';
  poly(c, [-34, 60, 34, 60, 34, 80, -34, 80]);
  c.fill();
  c.beginPath();
  c.moveTo(0, 12);
  c.lineTo(0, 76);
  c.strokeStyle = 'rgba(255,255,255,0.75)';
  c.lineWidth = 2.2;
  c.stroke();
  c.strokeStyle = 'rgba(30,40,50,0.4)';
  c.lineWidth = 1;
  for (const sd of [-1, 1]) {
    c.beginPath();
    c.moveTo(sd * 4, 16);
    c.quadraticCurveTo(sd * 15, 40, sd * 24, 62);
    c.stroke();
  }
  c.restore();
  // dark visor with a glowing green slit
  c.beginPath();
  c.moveTo(0, 38);
  c.bezierCurveTo(8, 42, 11, 52, 0, 62);
  c.bezierCurveTo(-11, 52, -8, 42, 0, 38);
  c.closePath();
  c.fillStyle = lg(c, 0, 38, 0, 62, [[0, '#0a1610'], [1, '#14281c']]);
  c.fill();
  ink(c, DARK, 1.1);
  const scan = Math.sin(t * 2.2) * 3.5;
  rr(c, -5 + scan * 0.3, 48 + scan, 10, 2.6, 1.3);
  c.fillStyle = `rgba(110,255,150,${0.7 + 0.3 * pulse + f.hot * 0.3})`;
  c.fill();
  drawGlow(c, scan * 0.3, 49 + scan, 12, '#5dff7a', 0.45 + f.hot * 0.4);
  // barb tip lights
  for (const sd of [-1, 1]) {
    c.beginPath();
    c.arc(sd * 27, 63, 1.8, 0, TAU);
    c.fillStyle = `rgba(110,255,150,${0.5 + 0.5 * Math.sin(t * 5 + sd * 1.6)})`;
    c.fill();
  }
  shine(c, -14, 26, 3, 26, 0.5);

  /* ---------- emitter collar + green orb ---------- */
  rr(c, -6.5, 8, 13, 7, 3);
  c.fillStyle = cyl(c, -6.5, 6.5, [[0, '#2a323c'], [0.5, '#c8d2dc'], [1, '#2a323c']]);
  c.fill();
  ink(c, DARK, 1);
  const r = 6.2 + pulse * 0.8 + f.hot * 2.2;
  drawGlow(c, 0, 4, 30 + f.hot * 60, '#5dff7a', 0.55 + 0.2 * pulse + f.hot * 0.45);
  c.beginPath();
  c.arc(0, 4, r, 0, TAU);
  c.fillStyle = lg(c, 0, 4 - r, 0, 4 + r, [[0, '#f2fff4'], [0.45, '#7dff96'], [1, '#0a9a2a']]);
  c.fill();
  c.beginPath();
  c.arc(-2, 2, r * 0.3, 0, TAU);
  c.fillStyle = 'rgba(255,255,255,0.9)';
  c.fill();
  if (f.hot > 0.05) {
    c.strokeStyle = `rgba(180,255,190,${f.hot})`;
    c.lineWidth = 1.5;
    for (const sd of [-1, 1]) {
      c.beginPath();
      c.moveTo(sd * 5, 6);
      for (let i = 1; i <= 4; i++) c.lineTo(sd * (5 + i * 5) + Math.sin(t * 40 + i) * 3, 4 - i * 6 + Math.cos(t * 37 + i) * 3);
      c.stroke();
    }
  }
  c.restore();
}

/* ======================================================= SINGULARITY CANNON */
function singularity(c: C, f: Fire, t: number) {
  const dark: Stops = [[0, '#0a0614'], [0.42, '#34265a'], [0.58, '#54428a'], [1, '#07040c']];
  const spin = t * 2.2 + f.hot * 7;
  c.save();
  c.translate(0, f.kick * 9);
  nGrip(c, 6, 168, ['#6a5a96', '#2e2250', '#1e1636', '#08040e'], { panel: ['#3a1a6a', '#6a3ab8'], guard: '#ffd86a', screw: '#ffd86a', butt: '#ffd86a' });
  // body with gold trim
  rr(c, -22, 104, 44, 68, 15);
  c.fillStyle = cyl(c, -22, 22, dark);
  c.fill();
  ink(c, '#000', 1.6);
  c.strokeStyle = 'rgba(255,214,90,0.8)';
  c.lineWidth = 1.4;
  rr(c, -18, 108, 36, 60, 12);
  c.stroke();
  // gyroscope core
  const cy = 136;
  drawGlow(c, 0, cy, 34, '#a35cff', 0.45 + f.hot * 0.4);
  c.beginPath();
  c.arc(0, cy, 11, 0, TAU);
  c.fillStyle = lg(c, 0, cy - 11, 0, cy + 11, [[0, '#ffffff'], [0.35, '#e0b8ff'], [1, '#6a1ad0']]);
  c.fill();
  for (let i = 0; i < 2; i++) {
    c.save();
    c.translate(0, cy);
    c.rotate(i ? spin * 0.7 : -spin);
    c.beginPath();
    c.ellipse(0, 0, 16, 5.5, 0, 0, TAU);
    c.strokeStyle = i ? '#ffd86a' : 'rgba(230,190,255,0.95)';
    c.lineWidth = 2;
    c.stroke();
    c.restore();
  }
  // containment barrel
  rr(c, -10, 52, 20, 56, 6);
  c.fillStyle = cyl(c, -10, 10, dark);
  c.fill();
  ink(c, '#000', 1.2);
  for (let i = 0; i < 3; i++) {
    const y = 58 + i * 16;
    const g = 0.5 + 0.5 * Math.sin(t * 5 - i * 1.2);
    rr(c, -15, y, 30, 8, 4);
    c.fillStyle = cyl(c, -15, 15, GOLD);
    c.fill();
    ink(c, '#5a3a00', 1);
    rr(c, -11, y + 3, 22, 2.4, 1);
    c.fillStyle = `rgba(210,150,255,${0.45 + 0.5 * g + f.hot * 0.3})`;
    c.fill();
  }
  // twin crescent prongs cradling the singularity
  for (const s of [-1, 1]) {
    c.beginPath();
    c.moveTo(s * 9, 56);
    c.bezierCurveTo(s * 32, 50, s * 34, 18, s * 16, 6);
    c.lineTo(s * 14, 12);
    c.bezierCurveTo(s * 26, 22, s * 24, 46, s * 7, 50);
    c.closePath();
    c.fillStyle = cyl(c, s * 7, s * 34, dark);
    c.fill();
    ink(c, '#000', 1.2);
    c.beginPath();
    c.moveTo(s * 11, 52);
    c.bezierCurveTo(s * 28, 46, s * 30, 20, s * 16, 9);
    c.strokeStyle = 'rgba(255,214,90,0.85)';
    c.lineWidth = 1.2;
    c.stroke();
    c.beginPath();
    c.arc(s * 16, 8, 2.4, 0, TAU);
    c.fillStyle = '#e8c8ff';
    c.fill();
  }
  // the singularity: lensing halo, accretion disc, photon ring, event horizon
  const by = 26;
  drawGlow(c, 0, by, 46 + f.hot * 60, '#9a3cff', 0.5 + f.hot * 0.5);
  const disc = (front: boolean) => {
    for (let k = 0; k < 3; k++) {
      c.beginPath();
      c.ellipse(0, by, 22 - k * 4.5, 6.5 - k * 1.4, -0.15, front ? 0 : Math.PI, front ? Math.PI : TAU);
      c.strokeStyle = ['rgba(255,140,60,0.95)', 'rgba(255,205,140,0.95)', 'rgba(255,245,235,1)'][k];
      c.lineWidth = 3 - k * 0.6;
      c.setLineDash([7 - k * 1.5, 3]);
      c.lineDashOffset = -spin * (14 + k * 6);
      c.stroke();
    }
    c.setLineDash([]);
  };
  disc(false);
  c.beginPath();
  c.arc(0, by, 9, 0, TAU);
  c.strokeStyle = 'rgba(255,235,255,0.95)';
  c.lineWidth = 2;
  c.stroke();
  c.beginPath();
  c.arc(0, by, 7.2 - f.hot * 1.5, 0, TAU);
  c.fillStyle = '#000';
  c.fill();
  disc(true);
  for (let i = 0; i < 3; i++) {
    const a = spin * 1.4 + (i / 3) * TAU;
    sparkle(c, Math.cos(a) * 26, by + Math.sin(a) * 8, 2.6, '#f0d8ff', 0.7);
  }
  c.restore();
}

export function drawRedesign9(c: C, id: string, sinceShot: number, t: number): boolean {
  const f = fireOf(sinceShot);
  switch (id) {
    case 'cricket': cricket(c, f, t); return true;
    case 'minigun': minigun(c, f, t); return true;
    case 'honey': honey(c, f, t); return true;
    case 'ruby': ruby(c, f, t); return true;
    case 'unicorn': unicorn(c, f, t); return true;
    case 'gauntlet_cannon': gauntlet(c, f, t); return true;
    case 'cryo_blaster': cryo(c, f, t); return true;
    case 'heat_ray': heatRay(c, f, t); return true;
    case 'singularity': singularity(c, f, t); return true;
    default: return false;
  }
}
