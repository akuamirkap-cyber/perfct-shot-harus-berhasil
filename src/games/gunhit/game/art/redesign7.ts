/**
 * Redrawn default ("set7") art for six weapons whose old silhouettes were just a
 * straight stick with an ornament on top: UFO RAY, RAINBOW GUN, HOLY LIGHT GUN,
 * BEE RIFLE, OBLITERATOR 9000 and COIN GUN.
 *
 * Same conventions as every other gun in the game: seen from behind, muzzle tip at
 * (0, 0), the gun extends downward (+y), pistol grip angled to the lower right.
 * `fireT` is the seconds since the last shot (99 at rest), `time` the clock.
 */
import { drawGlow } from './glowSprite';
import type { WeaponAnim } from '../../vendor/game-4/src/game/weapons';

export type C = CanvasRenderingContext2D;
export type Stops = [number, string][];
const TAU = Math.PI * 2;

export const REDESIGNED_SEVEN = new Set(['ufo', 'rainbow', 'holy', 'beerifle', 'obliterator', 'coin']);

/* ------------------------------------------------------------------ helpers */
export function lg(c: C, x0: number, y0: number, x1: number, y1: number, stops: Stops) {
  const g = c.createLinearGradient(x0, y0, x1, y1);
  for (const [o, col] of stops) g.addColorStop(o, col);
  return g;
}
/** horizontal "cylinder" shading across [x0, x1] */
export const cyl = (c: C, x0: number, x1: number, stops: Stops) => lg(c, x0, 0, x1, 0, stops);

export function rr(c: C, x: number, y: number, w: number, h: number, r: number) {
  const k = Math.max(0, Math.min(r, w / 2, h / 2));
  c.beginPath();
  c.moveTo(x + k, y);
  c.arcTo(x + w, y, x + w, y + h, k);
  c.arcTo(x + w, y + h, x, y + h, k);
  c.arcTo(x, y + h, x, y, k);
  c.arcTo(x, y, x + w, y, k);
  c.closePath();
}
export function poly(c: C, pts: number[]) {
  c.beginPath();
  c.moveTo(pts[0], pts[1]);
  for (let i = 2; i < pts.length; i += 2) c.lineTo(pts[i], pts[i + 1]);
  c.closePath();
}
export function ink(c: C, col = 'rgba(14,18,26,0.85)', w = 1.4) {
  c.strokeStyle = col;
  c.lineWidth = w;
  c.stroke();
}
export function shine(c: C, x: number, y: number, w: number, h: number, a = 0.55) {
  rr(c, x, y, w, h, w / 2);
  c.fillStyle = `rgba(255,255,255,${a})`;
  c.fill();
}
export function star(c: C, x: number, y: number, r: number, points = 5, inner = 0.45, rot = -Math.PI / 2) {
  c.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const rad = i % 2 ? r * inner : r;
    const a = rot + (i * Math.PI) / points;
    c.lineTo(x + Math.cos(a) * rad, y + Math.sin(a) * rad);
  }
  c.closePath();
}
export function sparkle(c: C, x: number, y: number, r: number, col: string, alpha: number) {
  if (alpha <= 0.01) return;
  c.save();
  c.globalAlpha = alpha;
  c.fillStyle = col;
  star(c, x, y, r, 4, 0.22, 0);
  c.fill();
  c.restore();
  drawGlow(c, x, y, r * 2.6, col, alpha * 0.5);
}

export type SideGripOpts = {
  /** half-width of the receiver at the grip (the guard/trigger start at its right edge) */
  bw?: number;
  /** grip length along its axis */
  len?: number;
  guard?: string;
  panel?: [string, string];
  screw?: string;
  butt?: string;
  /** add a finger spur under the trigger guard (Noisy Cricket) */
  spur?: boolean;
};

/**
 * Pistol grip seen from the side, matching the game's own pistols: the gun points
 * up, the grip sticks out to the RIGHT of the receiver and rakes back (down), and the
 * trigger + guard sit between the receiver and the grip, just in front of it.
 * (x, yBack) = the back-strap corner where the grip meets the rear of the receiver.
 */
export function sideGrip(c: C, x: number, yBack: number, pal: [string, string, string, string], o: SideGripOpts = {}) {
  const bw = o.bw ?? 15;
  const L = o.len ?? 54;
  const W = 27; // grip width measured along the barrel
  const dx = 0.9, dy = 0.44; // rake direction (right and backward)
  const nx = -dy, ny = dx; // unit normal (points toward the back strap)
  const guard = o.guard ?? '#3a3e46';
  // anchor points: front-strap root A, back-strap root B (roots hide under the receiver)
  const ax = x + bw - 6, ay = yBack - W;
  const bx = x + bw - 6, by = yBack;
  const D = (px: number, py: number, k: number) => [px + dx * k, py + dy * k] as const;
  // ---- trigger guard + trigger (in front of the grip, right of the receiver)
  c.save();
  c.lineCap = 'round';
  c.lineJoin = 'round';
  const gx0 = x + bw - 2, gy0 = ay - 30;
  const [jx, jy] = D(ax, ay, 15);
  const guardPath = () => {
    c.beginPath();
    c.moveTo(gx0, gy0);
    c.bezierCurveTo(gx0 + 26, gy0 - 2, jx + 14, jy - 26, jx, jy);
  };
  guardPath();
  c.lineWidth = 6.4;
  c.strokeStyle = '#07080a';
  c.stroke();
  guardPath();
  c.lineWidth = 3.4;
  c.strokeStyle = guard;
  c.stroke();
  if (o.spur) {
    c.beginPath();
    c.moveTo(gx0 + 20, gy0 + 3);
    c.quadraticCurveTo(gx0 + 28, gy0 - 1, gx0 + 30, gy0 - 9);
    c.lineWidth = 5.6;
    c.strokeStyle = '#07080a';
    c.stroke();
    c.lineWidth = 2.8;
    c.strokeStyle = guard;
    c.stroke();
  }
  // trigger blade
  c.beginPath();
  c.moveTo(x + bw - 2, ay - 18);
  c.quadraticCurveTo(x + bw + 9, ay - 16, x + bw + 11, ay - 6);
  c.lineWidth = 4.6;
  c.strokeStyle = '#07080a';
  c.stroke();
  c.lineWidth = 2.4;
  c.strokeStyle = guard;
  c.stroke();
  c.restore();
  // ---- grip body: front strap with finger grooves, back strap with beavertail
  const [ex, ey] = D(ax, ay, L);
  const [fx, fy] = D(bx, by, L - 4);
  c.beginPath();
  c.moveTo(ax, ay);
  // finger grooves along the front strap
  for (let i = 1; i <= 3; i++) {
    const [p1x, p1y] = D(ax, ay, (L / 3.6) * (i - 0.5));
    const [p2x, p2y] = D(ax, ay, (L / 3.6) * i);
    c.quadraticCurveTo(p1x - nx * 3.2, p1y - ny * 3.2, p2x, p2y);
  }
  c.lineTo(ex, ey);
  // rounded butt
  c.quadraticCurveTo(ex + dx * 6 + nx * W * 0.5, ey + dy * 6 + ny * W * 0.5, fx + dx * 2, fy + dy * 2);
  // back strap, swelling slightly, back to the beavertail
  const [mx, my] = D(bx, by, L * 0.5);
  c.quadraticCurveTo(mx + nx * 3, my + ny * 3, bx + 4, by + 2);
  c.quadraticCurveTo(bx - 2, by + 6, bx - 6, by - 2);
  c.closePath();
  c.fillStyle = lg(c, ax, ay, fx, fy, [[0, pal[0]], [0.3, pal[1]], [0.65, pal[2]], [1, pal[3]]]);
  c.fill();
  ink(c, 'rgba(0,0,0,0.85)', 1.4);
  // grip panel (checkered) with screws
  if (o.panel) {
    const [p0x, p0y] = D(ax, ay, 8);
    const [p1x, p1y] = D(ax, ay, L - 8);
    const q0x = p0x + nx * 5, q0y = p0y + ny * 5;
    const q1x = p1x + nx * 5, q1y = p1y + ny * 5;
    const r0x = p0x + nx * (W - 6), r0y = p0y + ny * (W - 6);
    const r1x = p1x + nx * (W - 8), r1y = p1y + ny * (W - 8);
    poly(c, [q0x, q0y, q1x, q1y, r1x, r1y, r0x, r0y]);
    c.fillStyle = lg(c, q0x, q0y, r1x, r1y, [[0, o.panel[0]], [1, o.panel[1]]]);
    c.fill();
    ink(c, 'rgba(0,0,0,0.6)', 1);
    c.save();
    c.clip();
    c.strokeStyle = 'rgba(255,255,255,0.13)';
    c.lineWidth = 0.8;
    for (let i = -14; i < 22; i++) {
      c.beginPath();
      c.moveTo(ax - 30 + i * 5, ay - 30);
      c.lineTo(ax + 50 + i * 5, ay + 60);
      c.moveTo(ax + 50 + i * 5, ay - 30);
      c.lineTo(ax - 30 + i * 5, ay + 60);
      c.stroke();
    }
    c.restore();
    for (const k of [0.25, 0.78]) {
      const sx = p0x + (p1x - p0x) * k + nx * W * 0.45, sy = p0y + (p1y - p0y) * k + ny * W * 0.45;
      c.beginPath();
      c.arc(sx, sy, 2.1, 0, TAU);
      c.fillStyle = o.screw ?? '#c8d0d8';
      c.fill();
      ink(c, 'rgba(0,0,0,0.6)', 0.8);
    }
  }
  // butt plate
  c.beginPath();
  c.moveTo(ex + dx * 2, ey + dy * 2);
  c.quadraticCurveTo(ex + dx * 7 + nx * W * 0.5, ey + dy * 7 + ny * W * 0.5, fx + dx * 3, fy + dy * 3);
  c.lineWidth = 3.4;
  c.strokeStyle = o.butt ?? '#2a2e34';
  c.stroke();
  // back-strap highlight
  c.beginPath();
  c.moveTo(ax + dx * 6 + nx * 3, ay + dy * 6 + ny * 3);
  c.lineTo(ax + dx * (L - 8) + nx * 3, ay + dy * (L - 8) + ny * 3);
  c.strokeStyle = 'rgba(255,255,255,0.2)';
  c.lineWidth = 1.8;
  c.stroke();
}

/** Pistol grip (side view, right of the receiver). `y` = the rear end of the receiver. */
export function grip(c: C, y: number, body: Stops, edge: string, accent: string, len = 62, x = 0, bw = 16) {
  const pick = (k: number) => body[Math.min(body.length - 1, Math.max(0, Math.round(k * (body.length - 1))))][1];
  sideGrip(c, x, y + 4, [pick(0.5), pick(0.5), pick(0.25), pick(0)], { bw, len: len * 0.86, guard: accent, butt: accent });
  void edge;
}

export const fireState = (a: WeaponAnim) => {
  const ft = Number.isFinite(a.fireT) ? Math.max(0, a.fireT) : 99;
  const hot = ft < 0.4 ? 1 - ft / 0.4 : 0; // muzzle heat, 1 → 0
  const kick = ft < 0.22 ? Math.pow(1 - ft / 0.22, 2) : 0; // recoil, 1 → 0
  return { ft, hot, kick, hot2: hot * hot };
};

/* ================================================================ UFO RAY */
function ufoRay(c: C, a: WeaponAnim, time: number) {
  const { ft, hot, kick } = fireState(a);
  const pulse = 0.5 + 0.5 * Math.sin(time * 4);
  c.save();
  c.translate(0, kick * 7);

  // grip & lower body
  grip(c, 150, [[0, '#0f2a1a'], [0.5, '#2f7d4c'], [1, '#0c2214']], '#0b1810', '#8dffaa', 64);
  rr(c, -15, 104, 30, 56, 12);
  c.fillStyle = cyl(c, -15, 15, [[0, '#3b4350'], [0.35, '#dfe6ee'], [0.55, '#ffffff'], [1, '#4a5260']]);
  c.fill();
  ink(c);
  // retro fins
  for (const s of [-1, 1]) {
    poly(c, [s * 12, 118, s * 34, 136, s * 36, 166, s * 13, 150]);
    c.fillStyle = cyl(c, s * 12, s * 36, [[0, '#1f6b3a'], [1, '#3fd47a']]);
    c.fill();
    ink(c, '#0b2a16', 1.3);
    poly(c, [s * 15, 124, s * 30, 137, s * 31, 152, s * 15, 142]);
    c.fillStyle = 'rgba(255,255,255,0.18)';
    c.fill();
  }
  // energy window
  rr(c, -6, 116, 12, 34, 6);
  c.fillStyle = '#062012';
  c.fill();
  rr(c, -4, 118 + (1 - pulse) * 6, 8, 30 - (1 - pulse) * 6, 4);
  c.fillStyle = lg(c, 0, 118, 0, 150, [[0, '#d9ffe4'], [1, '#2bd36a']]);
  c.fill();
  drawGlow(c, 0, 132, 26, '#5dff98', 0.35 + hot * 0.4);

  // saucer underside + tractor glow
  c.beginPath();
  c.ellipse(0, 100, 30, 8, 0, 0, TAU);
  c.fillStyle = '#26303c';
  c.fill();
  drawGlow(c, 0, 102, 40, '#6bff9e', 0.25 + 0.15 * pulse + hot * 0.5);
  // saucer disc
  c.beginPath();
  c.ellipse(0, 92, 52, 13, 0, 0, TAU);
  c.fillStyle = lg(c, 0, 79, 0, 105, [[0, '#ffffff'], [0.45, '#b9c4d2'], [1, '#4b5768']]);
  c.fill();
  ink(c, '#1f2733', 1.5);
  c.beginPath();
  c.ellipse(0, 92, 52, 3.2, 0, 0, TAU);
  c.fillStyle = 'rgba(30,40,52,0.55)';
  c.fill();
  // chasing rim lights (spin faster while firing)
  const spin = time * (3 + hot * 14);
  for (let i = 0; i < 12; i++) {
    const ang = (i / 12) * TAU + spin;
    const front = Math.sin(ang);
    if (front < -0.05) continue;
    const x = Math.cos(ang) * 46;
    const y = 95 + front * 4;
    const on = (i + Math.floor(time * 8)) % 3 !== 0;
    c.beginPath();
    c.arc(x, y, 2.6, 0, TAU);
    c.fillStyle = on ? '#b6ffc8' : '#2e6a40';
    c.fill();
    if (on) drawGlow(c, x, y, 11, '#7dffa5', 0.7);
  }
  // glass dome with pilot
  c.beginPath();
  c.ellipse(0, 86, 24, 24, 0, Math.PI, TAU);
  c.closePath();
  c.fillStyle = 'rgba(150,255,200,0.28)';
  c.fill();
  const bob = Math.sin(time * 3) * 1.2 - hot * 3;
  c.beginPath();
  c.ellipse(0, 76 + bob, 9, 10, 0, 0, TAU);
  c.fillStyle = '#5ce07a';
  c.fill();
  ink(c, '#1f6b34', 0.9);
  for (const k of [-1, 1]) {
    c.beginPath();
    c.ellipse(k * 3.8, 75 + bob, 2.4, 3.8, k * 0.5, 0, TAU);
    c.fillStyle = '#0d2412';
    c.fill();
  }
  c.beginPath();
  c.ellipse(0, 86, 24, 24, 0, Math.PI, TAU);
  c.closePath();
  c.fillStyle = lg(c, 0, 62, 0, 86, [[0, 'rgba(230,255,240,0.5)'], [1, 'rgba(120,240,170,0.15)']]);
  c.fill();
  ink(c, 'rgba(40,140,80,0.9)', 1.3);
  shine(c, -15, 68, 5, 12, 0.55);

  // tapered emitter barrel with donut coils
  poly(c, [-6, 10, 6, 10, 10, 64, -10, 64]);
  c.fillStyle = cyl(c, -10, 10, [[0, '#40474f'], [0.4, '#eef3f8'], [0.6, '#ffffff'], [1, '#505862']]);
  c.fill();
  ink(c);
  const coils = [[54, 17], [38, 14], [23, 11]];
  coils.forEach(([y, r], i) => {
    // charge travels up the coils right after a shot
    const lit = ft < 0.3 ? Math.max(0, 1 - Math.abs(ft * 10 - i) / 1.2) : 0;
    c.beginPath();
    c.ellipse(0, y, r, 4.6, 0, 0, TAU);
    c.fillStyle = cyl(c, -r, r, [[0, '#3a424c'], [0.45, '#e9eef4'], [1, '#3a424c']]);
    c.fill();
    ink(c, '#1d242c', 1.2);
    c.beginPath();
    c.ellipse(0, y + 1.2, r - 3, 1.8, 0, 0, TAU);
    c.fillStyle = `rgba(110,255,160,${0.45 + 0.25 * pulse + lit * 0.5})`;
    c.fill();
    if (lit > 0.05) drawGlow(c, 0, y, r * 2.4, '#7dffa8', lit * 0.8);
  });
  // emitter prongs + lens
  for (const s of [-1, 1]) {
    c.beginPath();
    c.moveTo(s * 6, 14);
    c.quadraticCurveTo(s * 15, 6, s * 10, -4);
    c.lineWidth = 3.4;
    c.strokeStyle = '#2a323c';
    c.stroke();
    c.lineWidth = 1.6;
    c.strokeStyle = '#d6dde6';
    c.stroke();
  }
  c.beginPath();
  c.ellipse(0, 8, 8, 3.4, 0, 0, TAU);
  c.fillStyle = '#c8ffd9';
  c.fill();
  ink(c, '#1f6b3a', 1);
  drawGlow(c, 0, 6, 22 + hot * 40, '#7dffa5', 0.55 + 0.2 * pulse + hot * 0.45);
  if (hot > 0.02) {
    // tractor beam cone
    c.save();
    c.globalCompositeOperation = 'lighter';
    c.globalAlpha = hot * 0.55;
    poly(c, [-6, 6, 6, 6, 22, -60, -22, -60]);
    c.fillStyle = lg(c, 0, 6, 0, -60, [[0, 'rgba(150,255,190,0.9)'], [1, 'rgba(150,255,190,0)']]);
    c.fill();
    c.restore();
  }
  c.restore();
}

/* ============================================================= RAINBOW GUN */
const RB = ['#ff4d6d', '#ff9f1c', '#ffe14d', '#46e07a', '#3fb8ff', '#6c63ff', '#c56cff'];
function rainbowGun(c: C, a: WeaponAnim, time: number) {
  const { hot, kick } = fireState(a);
  c.save();
  c.translate(0, kick * 6);

  grip(c, 150, [[0, '#7d5bd6'], [0.5, '#c4a8ff'], [1, '#6a48c4']], '#3a2575', '#ffd84a', 62);

  // fluffy cloud receiver
  const puffs = [[-24, 132, 15], [24, 132, 15], [-13, 120, 16], [13, 120, 16], [0, 140, 18], [-30, 146, 11], [30, 146, 11], [0, 116, 15]];
  c.fillStyle = '#9aa2d8';
  for (const [x, y, r] of puffs) {
    c.beginPath();
    c.arc(x, y + 3, r, 0, TAU);
    c.fill();
  }
  for (const [x, y, r] of puffs) {
    c.beginPath();
    c.arc(x, y, r, 0, TAU);
    c.fillStyle = lg(c, 0, y - r, 0, y + r, [[0, '#ffffff'], [0.6, '#f1f0ff'], [1, '#c9c8f2']]);
    c.fill();
  }
  // star badge
  c.save();
  c.translate(0, 132);
  c.rotate(Math.sin(time * 1.8) * 0.12 + hot * 0.6);
  star(c, 0, 0, 12, 5, 0.48);
  c.fillStyle = lg(c, 0, -12, 0, 12, [[0, '#fff6b0'], [0.5, '#ffd23a'], [1, '#f08a00']]);
  c.fill();
  ink(c, '#9a5200', 1.3);
  c.restore();
  drawGlow(c, 0, 132, 26, '#ffe27a', 0.25 + hot * 0.5);

  // pearl barrel with a rainbow swoosh wrapped around it
  poly(c, [-10, 22, 10, 22, 14, 114, -14, 114]);
  c.fillStyle = cyl(c, -14, 14, [[0, '#c9c6e8'], [0.4, '#ffffff'], [0.62, '#f6f4ff'], [1, '#aeaad6']]);
  c.fill();
  c.save();
  poly(c, [-10, 22, 10, 22, 14, 114, -14, 114]);
  c.clip();
  const flow = (time * 18 + hot * 40) % 46;
  for (let band = -2; band < 4; band++) {
    for (let i = 0; i < 7; i++) {
      const y = 30 + band * 46 + flow + i * 3.1;
      poly(c, [-16, y + 10, 16, y - 6, 16, y - 2.9, -16, y + 13.1]);
      c.fillStyle = RB[i];
      c.globalAlpha = 0.92;
      c.fill();
    }
  }
  c.globalAlpha = 1;
  c.fillStyle = 'rgba(255,255,255,0.35)';
  c.fillRect(-6, 22, 4, 92);
  c.restore();
  poly(c, [-10, 22, 10, 22, 14, 114, -14, 114]);
  ink(c, '#4a3f8c', 1.4);
  // gold collars
  for (const y of [24, 108]) {
    rr(c, -15, y - 4, 30, 8, 3);
    c.fillStyle = cyl(c, -15, 15, [[0, '#8a5a00'], [0.45, '#fff0a8'], [1, '#a86c00']]);
    c.fill();
    ink(c, '#6b4300', 1);
  }

  // refracted fan of colours above the prism
  c.save();
  c.globalCompositeOperation = 'lighter';
  const fan = 0.22 + 0.08 * Math.sin(time * 3) + hot * 0.7;
  RB.forEach((col, i) => {
    const ang = -Math.PI / 2 + (i - 3) * 0.13;
    const len = 46 + hot * 60;
    c.globalAlpha = fan;
    c.beginPath();
    c.moveTo(0, 2);
    c.lineTo(Math.cos(ang - 0.05) * len, 2 + Math.sin(ang - 0.05) * len);
    c.lineTo(Math.cos(ang + 0.05) * len, 2 + Math.sin(ang + 0.05) * len);
    c.closePath();
    c.fillStyle = col;
    c.fill();
  });
  c.restore();

  // crystal prism muzzle
  poly(c, [0, -8, 15, 22, -15, 22]);
  c.fillStyle = lg(c, -15, -8, 15, 22, [[0, 'rgba(255,255,255,0.95)'], [0.5, 'rgba(210,235,255,0.85)'], [1, 'rgba(190,170,255,0.9)']]);
  c.fill();
  ink(c, '#5a4fb0', 1.4);
  poly(c, [0, -8, 4, 22, -15, 22]);
  c.fillStyle = 'rgba(255,255,255,0.4)';
  c.fill();
  c.beginPath();
  c.moveTo(-8, 16);
  c.lineTo(8, 16);
  c.strokeStyle = 'rgba(140,120,230,0.5)';
  c.lineWidth = 1;
  c.stroke();
  drawGlow(c, 0, 8, 26 + hot * 34, '#ffe1fb', 0.45 + hot * 0.5);

  // twinkles
  for (let i = 0; i < 4; i++) {
    const ph = (time * 0.6 + i * 0.25) % 1;
    sparkle(c, Math.sin(i * 2.3 + time) * 34, 120 - ph * 120, 4 + 2 * (1 - ph), RB[(i * 2) % 7], (1 - ph) * 0.9);
  }
  c.restore();
}

/* =========================================================== HOLY LIGHT GUN */
function feather(c: C, ang: number, len: number, w: number, from: string, to: string) {
  c.save();
  c.rotate(ang);
  c.beginPath();
  c.ellipse(len / 2, 0, len / 2, w / 2, 0, 0, TAU);
  c.fillStyle = lg(c, 0, 0, len, 0, [[0, from], [1, to]]);
  c.fill();
  ink(c, 'rgba(160,125,60,0.6)', 1);
  c.beginPath();
  c.moveTo(4, 0);
  c.lineTo(len * 0.86, 0);
  c.strokeStyle = 'rgba(190,160,100,0.45)';
  c.lineWidth = 0.9;
  c.stroke();
  c.restore();
}
function wing(c: C, s: number, flap: number, time: number) {
  c.save();
  c.translate(s * 15, 126);
  c.scale(s, 1);
  c.rotate(-0.05 - flap * 0.32 + Math.sin(time * 2) * 0.03);
  // primaries (long, rounded), back to front
  for (let i = 0; i < 6; i++) feather(c, -1.18 + i * 0.16, 74 - i * 5, 13, '#e6dcc0', '#fffdf6');
  // secondaries
  c.save();
  c.translate(3, 4);
  for (let i = 0; i < 5; i++) feather(c, -1.05 + i * 0.19, 48 - i * 3, 14, '#efe7d2', '#ffffff');
  c.restore();
  // coverts – small scalloped row
  c.save();
  c.translate(5, 8);
  for (let i = 0; i < 4; i++) feather(c, -0.95 + i * 0.24, 27, 13, '#f6f0e2', '#ffffff');
  c.restore();
  // shoulder + gold root
  c.beginPath();
  c.ellipse(9, 2, 15, 10, -0.5, 0, TAU);
  c.fillStyle = lg(c, 0, -8, 0, 12, [[0, '#ffffff'], [1, '#e9dfc6']]);
  c.fill();
  ink(c, 'rgba(160,125,60,0.6)', 1);
  c.beginPath();
  c.ellipse(1, 2, 7, 5, -0.4, 0, TAU);
  c.fillStyle = lg(c, 0, -5, 0, 5, [[0, '#fff3b0'], [1, '#c48a10']]);
  c.fill();
  ink(c, '#7a5200', 1);
  c.restore();
}
function holyGun(c: C, a: WeaponAnim, time: number) {
  const { hot, kick, ft } = fireState(a);
  const flap = ft < 0.45 ? Math.sin((ft / 0.45) * Math.PI) : 0;
  const gold: Stops = [[0, '#7a4e00'], [0.35, '#ffe9a0'], [0.55, '#fff8d8'], [1, '#9a6400']];
  const ivory: Stops = [[0, '#cfc4a4'], [0.4, '#ffffff'], [0.65, '#fbf7ec'], [1, '#bdb08c']];
  c.save();
  c.translate(0, kick * 6);
  drawGlow(c, 0, 130, 90, '#fff2c4', 0.18 + hot * 0.3);

  wing(c, -1, flap, time);
  wing(c, 1, flap, time);

  grip(c, 162, [[0, '#cbbf9c'], [0.5, '#fffaf0'], [1, '#b8aa84']], '#6b4a10', '#e8b830', 60);

  // receiver
  rr(c, -19, 108, 38, 62, 14);
  c.fillStyle = cyl(c, -19, 19, ivory);
  c.fill();
  ink(c, '#7a5a1a', 1.5);
  // filigree trim
  c.save();
  rr(c, -19, 108, 38, 62, 14);
  c.clip();
  c.strokeStyle = 'rgba(200,150,40,0.75)';
  c.lineWidth = 1.4;
  for (const s of [-1, 1]) {
    c.beginPath();
    c.moveTo(s * 15, 114);
    c.bezierCurveTo(s * 4, 124, s * 18, 140, s * 6, 152);
    c.stroke();
  }
  c.restore();
  // glowing heart gem
  const beat = 1 + 0.06 * Math.sin(time * 5) + hot * 0.18;
  c.save();
  c.translate(0, 136);
  c.scale(beat, beat);
  c.beginPath();
  c.moveTo(0, 10);
  c.bezierCurveTo(-14, 0, -9, -12, 0, -5);
  c.bezierCurveTo(9, -12, 14, 0, 0, 10);
  c.fillStyle = lg(c, 0, -10, 0, 10, [[0, '#ffffff'], [0.45, '#bfe9ff'], [1, '#4aa8ff']]);
  c.fill();
  ink(c, '#c48a10', 1.6);
  c.restore();
  drawGlow(c, 0, 134, 30, '#bfe9ff', 0.5 + hot * 0.4);

  // fluted barrel
  rr(c, -9, 18, 18, 94, 6);
  c.fillStyle = cyl(c, -9, 9, ivory);
  c.fill();
  ink(c, '#7a5a1a', 1.3);
  c.strokeStyle = 'rgba(190,150,60,0.55)';
  c.lineWidth = 1;
  for (const x of [-3, 3]) {
    c.beginPath();
    c.moveTo(x, 26);
    c.lineTo(x, 104);
    c.stroke();
  }
  for (const y of [22, 60, 98]) {
    rr(c, -11, y, 22, 7, 3);
    c.fillStyle = cyl(c, -11, 11, gold);
    c.fill();
    ink(c, '#6b4300', 1);
  }
  // radiant cross emitter
  const glow = 0.6 + 0.2 * Math.sin(time * 3) + hot * 0.6;
  c.save();
  c.translate(0, 10);
  star(c, 0, 0, 13, 4, 0.32, -Math.PI / 2);
  c.fillStyle = lg(c, 0, -13, 0, 13, [[0, '#ffffff'], [1, '#ffd65a']]);
  c.fill();
  ink(c, '#a87400', 1.2);
  c.restore();
  drawGlow(c, 0, 8, 30 + hot * 50, '#fff6c8', glow);
  if (hot > 0.02) {
    c.save();
    c.globalCompositeOperation = 'lighter';
    c.globalAlpha = hot * 0.7;
    for (let i = 0; i < 8; i++) {
      const ang = (i / 8) * TAU + time;
      c.beginPath();
      c.moveTo(0, 8);
      c.lineTo(Math.cos(ang - 0.06) * 40, 8 + Math.sin(ang - 0.06) * 40);
      c.lineTo(Math.cos(ang + 0.06) * 40, 8 + Math.sin(ang + 0.06) * 40);
      c.closePath();
      c.fillStyle = '#fff4c8';
      c.fill();
    }
    c.restore();
  }
  // floating halo
  const hy = -16 + Math.sin(time * 2.2) * 2.5 - hot * 6;
  c.beginPath();
  c.ellipse(0, hy, 17, 5, 0, 0, TAU);
  c.lineWidth = 6;
  c.strokeStyle = 'rgba(255,240,170,0.35)';
  c.stroke();
  c.lineWidth = 3.4;
  c.strokeStyle = '#ffcf3a';
  c.stroke();
  c.lineWidth = 1.2;
  c.strokeStyle = '#fff8d8';
  c.stroke();
  drawGlow(c, 0, hy, 30, '#ffe680', 0.4 + hot * 0.4);
  c.restore();
}

/* ============================================================== BEE RIFLE */
function beeRifle(c: C, a: WeaponAnim, time: number) {
  const { hot, kick } = fireState(a);
  const black: Stops = [[0, '#0c0c0e'], [0.45, '#4a4a52'], [1, '#08080a']];
  const yellow: Stops = [[0, '#b87a00'], [0.45, '#ffe066'], [1, '#c48800']];
  c.save();
  c.translate(0, kick * 9);

  // translucent wings (buzz)
  const buzz = Math.sin(time * 70) * (0.05 + hot * 0.12);
  for (const s of [-1, 1]) {
    for (const [len, w, ang, al] of [[62, 20, -0.55, 0.55], [44, 15, -0.15, 0.45]] as const) {
      c.save();
      c.translate(s * 13, 150);
      c.rotate(s * (ang + buzz));
      c.beginPath();
      c.ellipse(s * len * 0.5, -6, len * 0.5, w * 0.5, 0, 0, TAU);
      c.fillStyle = `rgba(215,240,255,${al})`;
      c.fill();
      ink(c, 'rgba(70,90,110,0.7)', 1);
      c.strokeStyle = 'rgba(70,90,110,0.35)';
      c.lineWidth = 0.8;
      c.beginPath();
      c.moveTo(0, -4);
      c.lineTo(s * len * 0.9, -8);
      c.moveTo(s * len * 0.3, -6);
      c.lineTo(s * len * 0.55, 0);
      c.stroke();
      c.restore();
    }
  }

  grip(c, 196, black, '#000', '#ffd23a', 54, 2);

  // bee-abdomen body with stripes
  c.save();
  c.beginPath();
  c.ellipse(0, 172, 21, 46, 0, 0, TAU);
  c.clip();
  c.fillStyle = cyl(c, -21, 21, yellow);
  c.fillRect(-22, 124, 44, 96);
  c.fillStyle = cyl(c, -21, 21, black);
  for (const y of [138, 162, 186, 210]) c.fillRect(-22, y, 44, 11);
  c.fillStyle = 'rgba(255,255,255,0.28)';
  c.fillRect(-12, 126, 5, 90);
  c.restore();
  c.beginPath();
  c.ellipse(0, 172, 21, 46, 0, 0, TAU);
  ink(c, '#1a1200', 1.6);

  // honeycomb drum magazine (left)
  c.save();
  c.translate(-27, 176);
  poly(c, Array.from({ length: 6 }, (_, i) => [Math.cos((i / 6) * TAU) * 12, Math.sin((i / 6) * TAU) * 12]).flat());
  c.fillStyle = lg(c, 0, -12, 0, 12, [[0, '#ffe58a'], [1, '#d88a00']]);
  c.fill();
  ink(c, '#6b4300', 1.3);
  c.strokeStyle = 'rgba(120,70,0,0.6)';
  c.lineWidth = 0.9;
  for (const [hx, hy] of [[0, 0], [-6, -4], [6, -4], [-6, 4], [6, 4]]) {
    poly(c, Array.from({ length: 6 }, (_, i) => [hx + Math.cos((i / 6) * TAU) * 3, hy + Math.sin((i / 6) * TAU) * 3]).flat());
    c.stroke();
  }
  c.restore();

  // receiver top + scope rail
  rr(c, -9, 104, 18, 30, 4);
  c.fillStyle = cyl(c, -9, 9, black);
  c.fill();
  ink(c, '#000', 1.2);
  // scope (offset to the left, like a real side-mounted optic)
  rr(c, -24, 92, 12, 48, 6);
  c.fillStyle = cyl(c, -24, -12, black);
  c.fill();
  ink(c, '#000', 1.2);
  for (const y of [100, 130]) {
    rr(c, -26, y, 16, 6, 2);
    c.fillStyle = cyl(c, -26, -10, yellow);
    c.fill();
  }
  c.beginPath();
  c.ellipse(-18, 93, 6, 3, 0, 0, TAU);
  c.fillStyle = '#ffb21f';
  c.fill();
  drawGlow(c, -18, 93, 12, '#ffcf5a', 0.45);
  rr(c, -14, 112, 6, 6, 1);
  c.fillStyle = '#333';
  c.fill();

  // long barrel
  rr(c, -4.5, 16, 9, 92, 3);
  c.fillStyle = cyl(c, -4.5, 4.5, black);
  c.fill();
  ink(c, '#000', 1);
  rr(c, -6, 58, 12, 9, 2);
  c.fillStyle = cyl(c, -6, 6, yellow);
  c.fill();
  ink(c, '#6b4300', 0.9);
  // stinger muzzle brake
  poly(c, [-7, 20, 7, 20, 4, 4, 0, -6, -4, 4]);
  c.fillStyle = cyl(c, -7, 7, [[0, '#1a1a1e'], [0.5, '#6a6a74'], [1, '#121214']]);
  c.fill();
  ink(c, '#000', 1);
  for (const y of [9, 15]) {
    c.fillStyle = '#ffd23a';
    c.fillRect(-5, y, 10, 2);
  }
  drawGlow(c, 0, 0, 14 + hot * 34, '#ffd86a', 0.2 + hot * 0.7);
  c.restore();
}

/* ======================================================= OBLITERATOR 9000 */
function obliterator(c: C, a: WeaponAnim, time: number) {
  const { hot, kick, ft } = fireState(a);
  const gun: Stops = [[0, '#14181c'], [0.35, '#59636d'], [0.55, '#8a949e'], [1, '#101418']];
  const pulse = 0.5 + 0.5 * Math.sin(time * 5);
  c.save();
  c.translate(0, kick * 10);

  // grip
  grip(c, 200, gun, '#050607', '#4ade80', 62, 4);

  // armoured lower body with hazard band
  rr(c, -24, 168, 48, 44, 9);
  c.fillStyle = cyl(c, -24, 24, gun);
  c.fill();
  ink(c, '#000', 1.5);
  c.save();
  rr(c, -24, 196, 48, 10, 2);
  c.clip();
  c.fillStyle = '#ffd23a';
  c.fillRect(-24, 196, 48, 10);
  c.fillStyle = '#111';
  for (let x = -40; x < 30; x += 10) poly(c, [x, 206, x + 5, 206, x + 15, 196, x + 10, 196]), c.fill();
  c.restore();
  // 9000 readout
  rr(c, -16, 174, 32, 16, 3);
  c.fillStyle = '#031a0a';
  c.fill();
  ink(c, '#4ade80', 1);
  c.fillStyle = ft < 0.25 && Math.floor(ft * 30) % 2 ? '#ffffff' : '#62ff96';
  c.font = 'bold 12px monospace';
  c.textAlign = 'center';
  c.textBaseline = 'middle';
  c.fillText('9000', 0, 183);
  drawGlow(c, 0, 182, 22, '#4ade80', 0.25);

  // plasma tank
  rr(c, -15, 106, 30, 64, 8);
  c.fillStyle = 'rgba(8,30,16,0.9)';
  c.fill();
  const level = 0.78 + 0.06 * Math.sin(time * 2) - hot * 0.25;
  c.save();
  rr(c, -13, 108, 26, 60, 7);
  c.clip();
  const top = 108 + 60 * (1 - level);
  c.beginPath();
  c.moveTo(-14, 170);
  c.lineTo(-14, top);
  for (let x = -14; x <= 14; x += 4) c.lineTo(x, top + Math.sin(time * 6 + x * 0.4) * 1.6);
  c.lineTo(14, 170);
  c.closePath();
  c.fillStyle = lg(c, 0, top, 0, 170, [[0, '#b4ffcc'], [0.3, '#46e57a'], [1, '#0f8a3a']]);
  c.fill();
  for (let i = 0; i < 6; i++) {
    const ph = (time * (0.6 + i * 0.13) + i * 0.37) % 1;
    c.beginPath();
    c.arc(-8 + ((i * 37) % 17), 168 - ph * (168 - top), 1.6 + (i % 3) * 0.6, 0, TAU);
    c.fillStyle = 'rgba(230,255,235,0.8)';
    c.fill();
  }
  c.fillStyle = 'rgba(255,255,255,0.3)';
  c.fillRect(-10, 108, 4, 60);
  c.restore();
  drawGlow(c, 0, 140, 40, '#4ade80', 0.3 + 0.15 * pulse + hot * 0.5);
  for (const y of [102, 166]) {
    rr(c, -19, y, 38, 9, 3);
    c.fillStyle = cyl(c, -19, 19, gun);
    c.fill();
    ink(c, '#000', 1.2);
  }
  // coolant pipes: run straight up beside the tank, bend neatly into the barrel
  for (const s of [-1, 1]) {
    const pipe = () => {
      c.beginPath();
      c.moveTo(s * 15, 160);
      c.lineTo(s * 23, 160);
      c.arcTo(s * 27, 160, s * 27, 154, 5);
      c.lineTo(s * 27, 112);
      c.arcTo(s * 27, 104, s * 19, 104, 7);
      c.lineTo(s * 16, 104);
    };
    c.lineCap = 'round';
    c.lineJoin = 'round';
    pipe(); c.lineWidth = 7; c.strokeStyle = '#06200f'; c.stroke();
    pipe(); c.lineWidth = 4.4; c.strokeStyle = '#1b5e34'; c.stroke();
    pipe(); c.lineWidth = 1.8; c.strokeStyle = `rgba(150,255,185,${0.55 + 0.35 * pulse})`; c.stroke();
    for (const y of [124, 146]) {
      rr(c, s * 27 - 4.5, y - 3, 9, 6, 2);
      c.fillStyle = cyl(c, s * 27 - 4.5, s * 27 + 4.5, gun);
      c.fill();
      ink(c, '#000', 0.9);
    }
  }
  // heavy barrel with cooling fins
  rr(c, -15, 26, 30, 78, 6);
  c.fillStyle = cyl(c, -15, 15, gun);
  c.fill();
  ink(c, '#000', 1.4);
  for (let i = 0; i < 4; i++) {
    const y = 36 + i * 16;
    const heat = Math.min(1, hot * 1.4 - i * 0.12);
    c.fillStyle = `rgba(74,222,128,${0.35 + 0.25 * pulse + Math.max(0, heat) * 0.6})`;
    c.fillRect(-22, y + 8, 44, 3);
    rr(c, -25, y, 50, 8, 3);
    c.fillStyle = cyl(c, -25, 25, gun);
    c.fill();
    ink(c, '#000', 1.1);
  }
  // emitter claws + plasma orb
  for (const s of [-1, 1]) {
    c.beginPath();
    c.moveTo(s * 13, 30);
    c.bezierCurveTo(s * 26, 22, s * 22, 4, s * 9, -2);
    c.lineTo(s * 7, 4);
    c.bezierCurveTo(s * 15, 10, s * 15, 20, s * 7, 28);
    c.closePath();
    c.fillStyle = cyl(c, s * 6, s * 24, gun);
    c.fill();
    ink(c, '#000', 1.2);
  }
  rr(c, -11, 20, 22, 10, 4);
  c.fillStyle = '#0a0d10';
  c.fill();
  const orbR = 8 + pulse * 1.5 + hot * 6;
  drawGlow(c, 0, 10, 40 + hot * 70, '#4ade80', 0.55 + hot * 0.45);
  c.beginPath();
  c.arc(0, 10, orbR, 0, TAU);
  c.fillStyle = lg(c, 0, 10 - orbR, 0, 10 + orbR, [[0, '#f0fff4'], [0.5, '#7dffa8'], [1, '#18b84e']]);
  c.fill();
  drawGlow(c, 0, 10, orbR * 1.6, '#e8ffef', 0.6);
  c.restore();
}

/* ================================================================ COIN GUN */
function coinShape(c: C, x: number, y: number, rx: number, ry: number) {
  c.beginPath();
  c.ellipse(x, y + 2, rx, ry, 0, 0, TAU);
  c.fillStyle = '#9a5a00';
  c.fill();
  c.beginPath();
  c.ellipse(x, y, rx, ry, 0, 0, TAU);
  c.fillStyle = lg(c, x - rx, 0, x + rx, 0, [[0, '#c27a00'], [0.4, '#fff1a0'], [1, '#d99400']]);
  c.fill();
  ink(c, '#7a4600', 0.9);
}
function coinGun(c: C, a: WeaponAnim, time: number) {
  const { hot, kick, ft } = fireState(a);
  const gold: Stops = [[0, '#8a5800'], [0.35, '#ffe68a'], [0.55, '#fff6c8'], [1, '#a86800']];
  const plum: Stops = [[0, '#3a0c28'], [0.5, '#8c2a62'], [1, '#2e0820']];
  c.save();
  c.translate(0, kick * 7);

  grip(c, 158, plum, '#1a0410', '#ffd23a', 60);

  // coin dispenser tube (right side) – coins shift up after each shot
  const shift = ft < 0.3 ? (1 - ft / 0.3) * 7 : 0;
  rr(c, 18, 70, 20, 82, 9);
  c.fillStyle = 'rgba(200,230,255,0.18)';
  c.fill();
  c.save();
  rr(c, 18, 70, 20, 82, 9);
  c.clip();
  for (let i = 0; i < 12; i++) coinShape(c, 28, 146 - i * 7 + shift, 8, 3);
  c.fillStyle = 'rgba(255,255,255,0.3)';
  c.fillRect(21, 72, 3, 78);
  c.restore();
  rr(c, 18, 70, 20, 82, 9);
  ink(c, '#5a3a00', 1.3);
  for (const y of [70, 146]) {
    rr(c, 16, y - 2, 24, 8, 3);
    c.fillStyle = cyl(c, 16, 40, gold);
    c.fill();
    ink(c, '#6b4300', 1);
  }

  // body
  rr(c, -22, 92, 44, 70, 12);
  c.fillStyle = cyl(c, -22, 22, plum);
  c.fill();
  ink(c, '#1a0410', 1.5);
  c.save();
  rr(c, -22, 92, 44, 70, 12);
  c.clip();
  c.strokeStyle = 'rgba(255,210,90,0.8)';
  c.lineWidth = 2;
  rr(c, -17, 97, 34, 60, 9);
  c.stroke();
  c.restore();
  // big spinning coin emblem
  const spin = Math.cos(time * 2.6 + hot * 8);
  const w = 15 * Math.max(0.12, Math.abs(spin));
  c.beginPath();
  c.ellipse(0, 128, w + 1.5, 16.5, 0, 0, TAU);
  c.fillStyle = '#8a5000';
  c.fill();
  c.beginPath();
  c.ellipse(0, 128, w, 15, 0, 0, TAU);
  c.fillStyle = lg(c, -w, 0, w, 0, [[0, '#c27a00'], [0.45, '#fff3b0'], [1, '#d99400']]);
  c.fill();
  ink(c, '#7a4600', 1.2);
  if (Math.abs(spin) > 0.35) {
    c.save();
    c.translate(0, 128);
    c.scale(Math.abs(spin), 1);
    c.fillStyle = '#9a5a00';
    c.font = 'bold 18px sans-serif';
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.fillText('$', 0, 1);
    c.restore();
  }
  drawGlow(c, 0, 128, 30, '#ffe27a', 0.3 + hot * 0.5);

  // gold barrel with engraving
  rr(c, -12, 14, 24, 82, 6);
  c.fillStyle = cyl(c, -12, 12, gold);
  c.fill();
  ink(c, '#6b4300', 1.4);
  c.strokeStyle = 'rgba(140,90,0,0.55)';
  c.lineWidth = 1;
  for (let y = 30; y < 90; y += 12) {
    c.beginPath();
    c.moveTo(-8, y);
    c.quadraticCurveTo(0, y - 5, 8, y);
    c.stroke();
  }
  for (const y of [40, 76]) {
    c.beginPath();
    c.moveTo(0, y - 5);
    c.lineTo(5, y);
    c.lineTo(0, y + 5);
    c.lineTo(-5, y);
    c.closePath();
    c.fillStyle = '#e8364a';
    c.fill();
    ink(c, '#7a1020', 0.9);
  }
  // flared coin-slot muzzle
  poly(c, [-12, 18, 12, 18, 17, 4, -17, 4]);
  c.fillStyle = cyl(c, -17, 17, gold);
  c.fill();
  ink(c, '#6b4300', 1.3);
  c.beginPath();
  c.ellipse(0, 4, 17, 5, 0, 0, TAU);
  c.fillStyle = '#2a1600';
  c.fill();
  ink(c, '#6b4300', 1.2);
  // the next coin peeks out of the slot; it launches on fire and reloads
  const reload = ft < 0.12 ? -1 : ft < 0.35 ? (ft - 0.12) / 0.23 : 1;
  if (reload > 0) {
    c.save();
    c.beginPath();
    c.rect(-20, -20, 40, 25);
    c.clip();
    const cy = 4 + (1 - reload) * 8 - 6;
    coinShape(c, 0, cy, 10, 10);
    c.fillStyle = '#9a5a00';
    c.font = 'bold 11px sans-serif';
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.fillText('$', 0, cy + 1);
    c.restore();
  }
  drawGlow(c, 0, 2, 20 + hot * 40, '#ffe27a', 0.35 + hot * 0.6);
  if (ft < 0.25) {
    for (let i = 0; i < 5; i++) {
      const ang = -Math.PI / 2 + (i - 2) * 0.5;
      const r = 10 + (ft / 0.25) * 30;
      sparkle(c, Math.cos(ang) * r, Math.sin(ang) * r, 4, '#fff1a0', 1 - ft / 0.25);
    }
  }
  c.restore();
}

/** Draws one of the redesigned weapons (slide-7 ids). Returns false for any other id. */
export function drawRedesignedSeven(c: C, id: string, a: WeaponAnim, time: number): boolean {
  switch (id) {
    case 'ufo': ufoRay(c, a, time); return true;
    case 'rainbow': rainbowGun(c, a, time); return true;
    case 'holy': holyGun(c, a, time); return true;
    case 'beerifle': beeRifle(c, a, time); return true;
    case 'obliterator': obliterator(c, a, time); return true;
    case 'coin': coinGun(c, a, time); return true;
    default: return false;
  }
}
