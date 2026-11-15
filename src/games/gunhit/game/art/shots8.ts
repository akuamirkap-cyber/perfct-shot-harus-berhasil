/**
 * Prettier in-flight shots for GHOST GUN, OBLITERATOR 9000, SAKURA BLOSSOM,
 * HONEY BLASTER, ANGKLUNG and GRAVITY GUN (their default "Slide 3" effect).
 * Shots fly up (-y); the trail is drawn below (+y). (x, y) = the shot's head.
 */
import { drawGlow } from './glowSprite';

type C = CanvasRenderingContext2D;
const TAU = Math.PI * 2;

function tail(c: C, x: number, y: number, len: number, w: number, rgb: string, wob = 0, t = 0) {
  c.save();
  c.globalCompositeOperation = 'lighter';
  const g = c.createLinearGradient(x, y, x, y + len);
  g.addColorStop(0, `rgba(${rgb},0.85)`);
  g.addColorStop(1, `rgba(${rgb},0)`);
  c.fillStyle = g;
  c.beginPath();
  c.moveTo(x - w, y);
  c.quadraticCurveTo(x - w * 0.6 + Math.sin(t * 9) * wob, y + len * 0.55, x + Math.sin(t * 7) * wob, y + len);
  c.quadraticCurveTo(x + w * 0.6 + Math.sin(t * 9 + 1) * wob, y + len * 0.55, x + w, y);
  c.closePath();
  c.fill();
  c.restore();
}
function twinkle(c: C, x: number, y: number, r: number, col: string, a: number) {
  if (a <= 0.01) return;
  c.save();
  c.globalAlpha = a;
  c.fillStyle = col;
  c.beginPath();
  for (let i = 0; i < 8; i++) {
    const rad = i % 2 ? r * 0.22 : r;
    const ang = (i * Math.PI) / 4;
    c.lineTo(x + Math.cos(ang) * rad, y + Math.sin(ang) * rad);
  }
  c.closePath();
  c.fill();
  c.restore();
}

/* ---------------------------------------------------------------- GHOST */
export function drawGhostShot8(c: C, x: number, y: number, t: number) {
  // three translucent spirit ribbons
  c.save();
  c.globalCompositeOperation = 'lighter';
  c.lineCap = 'round';
  for (let k = 0; k < 3; k++) {
    c.beginPath();
    for (let i = 0; i <= 16; i++) {
      const u = i / 16;
      const px = x + (k - 1) * 5 * (1 - u) + Math.sin(u * 7 - t * 14 + k * 2.1) * (3 + u * 10);
      const py = y + 14 + u * 70;
      if (i) c.lineTo(px, py); else c.moveTo(px, py);
    }
    c.strokeStyle = `rgba(${k === 1 ? '190,255,250' : '120,230,255'},${0.5 - k * 0.08})`;
    c.lineWidth = 5 - Math.abs(k - 1) * 2;
    c.stroke();
  }
  c.restore();
  drawGlow(c, x, y + 4, 54, '#8ff8ff', 0.55);
  // little ghost
  const bob = Math.sin(t * 10) * 1.5;
  c.save();
  c.translate(x, y + bob);
  c.rotate(Math.sin(t * 6) * 0.1);
  c.beginPath();
  c.moveTo(-11, 4);
  c.bezierCurveTo(-11, -16, 11, -16, 11, 4);
  c.lineTo(11, 14);
  for (let i = 0; i < 3; i++) {
    const x0 = 11 - i * 7.33, x1 = x0 - 7.33;
    c.quadraticCurveTo((x0 + x1) / 2, 19 + Math.sin(t * 14 + i) * 2.5, x1, 14);
  }
  c.closePath();
  const body = c.createRadialGradient(-3, -6, 1, 0, 2, 16);
  body.addColorStop(0, '#ffffff');
  body.addColorStop(0.6, '#e6fdff');
  body.addColorStop(1, '#8de8f0');
  c.fillStyle = body;
  c.fill();
  c.strokeStyle = 'rgba(80,210,230,0.8)';
  c.lineWidth = 1.2;
  c.stroke();
  for (const s of [-1, 1]) {
    c.beginPath();
    c.ellipse(s * 4, -2, 2, 3, 0, 0, TAU);
    c.fillStyle = '#103040';
    c.fill();
  }
  c.beginPath();
  c.ellipse(0, 5, 2.2, 2.8, 0, 0, TAU);
  c.fillStyle = '#103040';
  c.fill();
  c.restore();
  // orbiting spirit motes
  for (let i = 0; i < 4; i++) {
    const a = t * 6 + (i / 4) * TAU;
    const mx = x + Math.cos(a) * 17, my = y + 2 + Math.sin(a) * 7;
    drawGlow(c, mx, my, 9, '#c8ffff', 0.7);
    twinkle(c, mx, my, 3, '#ffffff', 0.9);
  }
}

/* ------------------------------------------------------------ OBLITERATOR */
export function drawObliteratorShot8(c: C, x: number, y: number, t: number) {
  tail(c, x, y + 6, 78, 11, '74,222,128', 2, t);
  tail(c, x, y + 6, 46, 5, '220,255,230', 1, t);
  drawGlow(c, x, y, 70, '#4ade80', 0.7);
  // spinning hazard ring
  c.save();
  c.translate(x, y);
  c.rotate(t * 5);
  c.strokeStyle = 'rgba(160,255,190,0.9)';
  c.lineWidth = 2.2;
  c.setLineDash([7, 5]);
  c.beginPath();
  c.arc(0, 0, 21, 0, TAU);
  c.stroke();
  c.setLineDash([]);
  c.rotate(-t * 9);
  c.strokeStyle = 'rgba(74,222,128,0.75)';
  c.lineWidth = 1.4;
  c.beginPath();
  c.ellipse(0, 0, 26, 9, 0, 0, TAU);
  c.stroke();
  c.restore();
  // crackling arcs
  c.save();
  c.globalCompositeOperation = 'lighter';
  c.strokeStyle = 'rgba(200,255,215,0.85)';
  c.lineWidth = 1.3;
  for (let k = 0; k < 3; k++) {
    const a0 = t * 11 + k * 2.1;
    c.beginPath();
    c.moveTo(x + Math.cos(a0) * 8, y + Math.sin(a0) * 8);
    for (let i = 1; i <= 3; i++) {
      const r = 8 + i * 5;
      const a = a0 + Math.sin(t * 40 + i * 3 + k) * 0.35;
      c.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r);
    }
    c.stroke();
  }
  c.restore();
  // plasma core
  const r = 12 + Math.sin(t * 24) * 0.8;
  const g = c.createRadialGradient(x - 3, y - 3, 1, x, y, r);
  g.addColorStop(0, '#ffffff');
  g.addColorStop(0.35, '#d6ffe2');
  g.addColorStop(0.75, '#4ade80');
  g.addColorStop(1, '#0f7a36');
  c.fillStyle = g;
  c.beginPath();
  c.arc(x, y, r, 0, TAU);
  c.fill();
  drawGlow(c, x, y, 26, '#eafff0', 0.8);
}

/* ---------------------------------------------------------------- SAKURA */
function petal(c: C, s: number) {
  c.beginPath();
  c.moveTo(0, 0);
  c.bezierCurveTo(-s * 0.6, -s * 0.3, -s * 0.5, -s, -s * 0.12, -s);
  c.lineTo(0, -s * 0.84);
  c.lineTo(s * 0.12, -s);
  c.bezierCurveTo(s * 0.5, -s, s * 0.6, -s * 0.3, 0, 0);
  c.closePath();
}
export function drawSakuraShot8(c: C, x: number, y: number, t: number) {
  tail(c, x, y + 4, 70, 8, '255,170,205', 3, t);
  // spiralling petals behind
  for (let i = 0; i < 10; i++) {
    const u = i / 10;
    const a = t * 8 + i * 1.1;
    const px = x + Math.cos(a) * (6 + u * 16);
    const py = y + 10 + u * 70;
    c.save();
    c.translate(px, py);
    c.rotate(a * 1.3);
    c.globalAlpha = 1 - u * 0.85;
    petal(c, 7 - u * 3);
    c.fillStyle = i % 3 === 0 ? '#ffffff' : '#ffb6cf';
    c.fill();
    c.restore();
  }
  drawGlow(c, x, y, 60, '#ffb6d0', 0.6);
  // blossom head
  c.save();
  c.translate(x, y);
  c.rotate(t * 4);
  for (let i = 0; i < 5; i++) {
    c.save();
    c.rotate((i / 5) * TAU);
    petal(c, 13);
    const g = c.createLinearGradient(0, 0, 0, -13);
    g.addColorStop(0, '#ff6f9f');
    g.addColorStop(0.55, '#ffc4da');
    g.addColorStop(1, '#fff3f8');
    c.fillStyle = g;
    c.fill();
    c.strokeStyle = 'rgba(200,60,110,0.5)';
    c.lineWidth = 0.8;
    c.stroke();
    c.restore();
  }
  c.beginPath();
  c.arc(0, 0, 3, 0, TAU);
  c.fillStyle = '#ffd23a';
  c.fill();
  c.restore();
  for (let i = 0; i < 3; i++) twinkle(c, x + Math.cos(t * 5 + i * 2) * 20, y + Math.sin(t * 5 + i * 2) * 12, 4, '#ffffff', 0.6 + 0.4 * Math.sin(t * 9 + i));
}

/* ----------------------------------------------------------------- HONEY */
function drop(c: C, x: number, y: number, r: number) {
  c.beginPath();
  c.moveTo(x, y - r * 1.5);
  c.bezierCurveTo(x + r * 0.9, y - r * 0.4, x + r, y + r * 0.9, x, y + r);
  c.bezierCurveTo(x - r, y + r * 0.9, x - r * 0.9, y - r * 0.4, x, y - r * 1.5);
  c.closePath();
  const g = c.createLinearGradient(x - r, y - r, x + r, y + r);
  g.addColorStop(0, '#fff2a8');
  g.addColorStop(0.45, '#ffb21f');
  g.addColorStop(1, '#c46a00');
  c.fillStyle = g;
  c.fill();
  c.strokeStyle = 'rgba(120,60,0,0.6)';
  c.lineWidth = 1;
  c.stroke();
  c.beginPath();
  c.ellipse(x - r * 0.35, y - r * 0.2, r * 0.18, r * 0.42, 0.3, 0, TAU);
  c.fillStyle = 'rgba(255,255,255,0.75)';
  c.fill();
}
export function drawHoneyShot8(c: C, x: number, y: number, t: number) {
  tail(c, x, y + 8, 60, 6, '255,190,60', 2, t);
  for (let i = 0; i < 4; i++) {
    const u = (i + 1) / 5;
    drop(c, x + Math.sin(t * 8 + i * 1.7) * 6, y + 14 + u * 56, 4.5 - u * 2.5);
  }
  drawGlow(c, x, y, 54, '#ffc23a', 0.5);
  drop(c, x, y + 2, 11 + Math.sin(t * 18) * 0.6);
  // tiny bee escort
  const bx = x + Math.cos(t * 9) * 18, by = y + Math.sin(t * 9) * 8;
  c.beginPath();
  c.ellipse(bx, by, 4, 3, 0, 0, TAU);
  c.fillStyle = '#ffc82a';
  c.fill();
  c.fillStyle = '#2a1a00';
  c.fillRect(bx - 1, by - 3, 1.4, 6);
  c.beginPath();
  c.ellipse(bx, by - 3.4, 2.6, 1.8, 0, 0, TAU);
  c.fillStyle = 'rgba(220,240,255,0.9)';
  c.fill();
}

/* ------------------------------------------------------- ANGKLUNG (note) */
export function drawNoteShot8(c: C, x: number, y: number, t: number) {
  // sound ripples
  c.save();
  c.lineCap = 'round';
  for (let k = 0; k < 3; k++) {
    const ph = (t * 2.6 + k / 3) % 1;
    c.strokeStyle = `rgba(255,220,120,${0.75 * (1 - ph)})`;
    c.lineWidth = 2.6 - k * 0.5;
    c.beginPath();
    c.arc(x, y + 8 + ph * 34, 12 + ph * 18, Math.PI * 0.15, Math.PI * 0.85);
    c.stroke();
  }
  c.restore();
  // trailing small notes
  for (let i = 0; i < 3; i++) {
    const u = (i + 1) / 4;
    const nx = x + Math.sin(t * 6 + i * 2) * 12, ny = y + 16 + u * 54;
    c.globalAlpha = 1 - u;
    c.fillStyle = ['#ff8ab0', '#8ad8ff', '#a8f08a'][i];
    c.beginPath();
    c.ellipse(nx, ny, 3.4, 2.6, -0.4, 0, TAU);
    c.fill();
    c.fillRect(nx + 2.2, ny - 10, 1.6, 10);
    c.globalAlpha = 1;
  }
  drawGlow(c, x, y + 4, 60, '#ffd65a', 0.6);
  // main golden double note
  c.save();
  c.translate(x, y + 4);
  c.rotate(Math.sin(t * 8) * 0.15);
  const g = c.createLinearGradient(-10, -16, 10, 12);
  g.addColorStop(0, '#fff4c0');
  g.addColorStop(0.5, '#ffc83a');
  g.addColorStop(1, '#c47a00');
  c.fillStyle = g;
  c.strokeStyle = '#7a4a00';
  c.lineWidth = 1.2;
  for (const nx of [-6, 7]) {
    c.beginPath();
    c.ellipse(nx, 8, 5.5, 4.2, -0.45, 0, TAU);
    c.fill();
    c.stroke();
    c.fillRect(nx + 3.4, -12, 2.4, 20);
  }
  c.beginPath();
  c.moveTo(-2.6, -14);
  c.lineTo(10.8, -18);
  c.lineTo(10.8, -12);
  c.lineTo(-2.6, -8);
  c.closePath();
  c.fill();
  c.stroke();
  c.restore();
  twinkle(c, x + 13, y - 10, 4, '#ffffff', 0.5 + 0.5 * Math.sin(t * 10));
}

/* --------------------------------------------------------------- GRAVITY */
export function drawGravityShot8(c: C, x: number, y: number, r: number, t: number) {
  const R = Math.max(10, r);
  drawGlow(c, x, y, R * 4.2, '#6a8cff', 0.5);
  // particles spiralling in
  for (let i = 0; i < 14; i++) {
    const ph = (t * 0.9 + i / 14) % 1;
    const a = i * 2.4 + ph * 5;
    const d = R * (3.2 - ph * 2.2);
    c.globalAlpha = Math.sin(ph * Math.PI);
    c.fillStyle = i % 2 ? '#bcd0ff' : '#e2c8ff';
    c.beginPath();
    c.arc(x + Math.cos(a) * d, y + Math.sin(a) * d * 0.75, 1.8, 0, TAU);
    c.fill();
  }
  c.globalAlpha = 1;
  // lensing rings
  for (let k = 0; k < 3; k++) {
    c.beginPath();
    c.ellipse(x, y, R * (1.5 + k * 0.45), R * (0.55 + k * 0.16), t * (1.2 + k * 0.6) + k, 0, TAU);
    c.strokeStyle = `rgba(${170 + k * 30},${190 + k * 15},255,${0.75 - k * 0.2})`;
    c.lineWidth = 2 - k * 0.4;
    c.stroke();
  }
  // core
  const g = c.createRadialGradient(x - R * 0.3, y - R * 0.3, 1, x, y, R);
  g.addColorStop(0, '#ffffff');
  g.addColorStop(0.35, '#c8d8ff');
  g.addColorStop(0.8, '#5a6aff');
  g.addColorStop(1, '#2a1a8a');
  c.fillStyle = g;
  c.beginPath();
  c.arc(x, y, R, 0, TAU);
  c.fill();
  c.beginPath();
  c.arc(x, y, R * 0.42, 0, TAU);
  c.fillStyle = 'rgba(20,10,60,0.7)';
  c.fill();
  drawGlow(c, x, y, R * 1.6, '#e8eeff', 0.5);
}

/* ===================== Slide-5 shots: SINGULARITY / NANO-SWARM / ORBITAL BEACON */

/** mini black hole: dark core, hot accretion disc, lensing halo, purple wake */
export function drawSingularityShot8(c: C, x: number, y: number, t: number) {
  c.save();
  c.globalCompositeOperation = 'lighter';
  const wake = c.createLinearGradient(x, y, x, y + 170);
  wake.addColorStop(0, 'rgba(178,76,255,0.55)');
  wake.addColorStop(0.5, 'rgba(255,140,70,0.18)');
  wake.addColorStop(1, 'rgba(178,76,255,0)');
  c.fillStyle = wake;
  c.beginPath();
  c.moveTo(x - 18, y);
  c.quadraticCurveTo(x - 6, y + 90, x, y + 170);
  c.quadraticCurveTo(x + 6, y + 90, x + 18, y);
  c.closePath();
  c.fill();
  c.restore();
  drawGlow(c, x, y, 80, '#9a3cff', 0.55);
  // matter spiralling in
  for (let i = 0; i < 16; i++) {
    const ph = (t * 1.4 + i / 16) % 1;
    const a = i * 2.39 - ph * 7;
    const d = 46 * (1 - ph) + 14;
    c.globalAlpha = Math.sin(ph * Math.PI) * 0.9;
    c.fillStyle = i % 3 ? '#ffb36a' : '#e8c8ff';
    c.beginPath();
    c.arc(x + Math.cos(a) * d, y + Math.sin(a) * d * 0.45, 1.8, 0, TAU);
    c.fill();
  }
  c.globalAlpha = 1;
  // back half of the disc
  const disc = (front: boolean) => {
    for (let k = 0; k < 3; k++) {
      c.beginPath();
      c.ellipse(x, y, 34 - k * 7, 10 - k * 2.2, -0.18, front ? 0 : Math.PI, front ? Math.PI : TAU);
      c.strokeStyle = ['rgba(255,150,70,0.9)', 'rgba(255,210,140,0.9)', 'rgba(255,245,230,0.95)'][k];
      c.lineWidth = 4 - k;
      c.setLineDash([9 - k * 2, 4]);
      c.lineDashOffset = -t * (80 + k * 40);
      c.stroke();
    }
    c.setLineDash([]);
  };
  // two luminous spiral arms wound around the hole
  c.save();
  c.globalCompositeOperation = 'lighter';
  c.lineCap = 'round';
  for (let arm = 0; arm < 2; arm++) {
    for (let seg = 0; seg < 26; seg++) {
      const u = seg / 26;
      const a0 = -t * 5 + arm * Math.PI + u * 5.2;
      const r0 = 16 + u * 40;
      const a1 = a0 + 0.2, r1 = r0 + 1.6;
      c.strokeStyle = `rgba(${200 + 55 * (1 - u)},${120 + 80 * (1 - u)},255,${(1 - u) * 0.75})`;
      c.lineWidth = 3.2 * (1 - u) + 0.6;
      c.beginPath();
      c.moveTo(x + Math.cos(a0) * r0, y + Math.sin(a0) * r0 * 0.55);
      c.lineTo(x + Math.cos(a1) * r1, y + Math.sin(a1) * r1 * 0.55);
      c.stroke();
    }
  }
  c.restore();
  // gravitational-lensing ripple
  const rip = (t * 1.6) % 1;
  c.beginPath();
  c.ellipse(x, y, 20 + rip * 40, (20 + rip * 40) * 0.6, 0, 0, TAU);
  c.strokeStyle = `rgba(230,200,255,${(1 - rip) * 0.45})`;
  c.lineWidth = 1.6;
  c.stroke();
  disc(false);
  // photon ring + event horizon
  c.beginPath();
  c.arc(x, y, 15.5, 0, TAU);
  c.strokeStyle = 'rgba(255,235,255,0.95)';
  c.lineWidth = 2.4;
  c.stroke();
  drawGlow(c, x, y, 26, '#f0d8ff', 0.6);
  c.beginPath();
  c.arc(x, y, 13 + Math.sin(t * 24) * 0.8, 0, TAU);
  c.fillStyle = '#000';
  c.fill();
  disc(true);
}

/** a nano drone: tiny glowing hex bot with a fading light trail */
export function drawNanoDrone8(c: C, p: { x: number; y: number; vx: number; vy: number; age: number; data?: { trail?: number[]; ph?: number } }) {
  const tr = p.data?.trail ?? [];
  if (tr.length >= 4) {
    c.save();
    c.globalCompositeOperation = 'lighter';
    c.lineCap = 'round';
    for (let i = 2; i < tr.length; i += 2) {
      const u = i / tr.length;
      c.strokeStyle = `rgba(170,255,120,${u * 0.7})`;
      c.lineWidth = 0.6 + u * 2.4;
      c.beginPath();
      c.moveTo(tr[i - 2], tr[i - 1]);
      c.lineTo(tr[i], tr[i + 1]);
      c.stroke();
    }
    c.restore();
  }
  const ang = Math.atan2(p.vy, p.vx) + Math.PI / 2;
  drawGlow(c, p.x, p.y, 14, '#c6ff3a', 0.75);
  c.save();
  c.translate(p.x, p.y);
  c.rotate(ang);
  c.beginPath();
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * TAU + Math.PI / 6;
    c.lineTo(Math.cos(a) * 4.6, Math.sin(a) * 4.6);
  }
  c.closePath();
  c.fillStyle = '#1a3a12';
  c.fill();
  c.strokeStyle = '#d8ff7a';
  c.lineWidth = 1.2;
  c.stroke();
  const blink = 0.5 + 0.5 * Math.sin(p.age * 30 + (p.data?.ph ?? 0));
  c.beginPath();
  c.arc(0, 0, 2 + blink * 0.6, 0, TAU);
  c.fillStyle = '#f2ffcc';
  c.fill();
  for (const s of [-1, 1]) {
    c.beginPath();
    c.moveTo(s * 4, 1);
    c.lineTo(s * 7.5, 3.5 + Math.sin(p.age * 60) * 1.2);
    c.strokeStyle = 'rgba(210,255,140,0.8)';
    c.lineWidth = 1;
    c.stroke();
  }
  c.restore();
}

/** orbital beacon marker round: red tracer dart with a pulsing targeting ring */
export function drawBeaconBolt8(c: C, x: number, y: number, t: number) {
  tail(c, x, y + 4, 90, 5, '255,80,60', 1, t);
  tail(c, x, y + 4, 50, 2, '255,230,220', 0, t);
  drawGlow(c, x, y, 40, '#ff4a3a', 0.65);
  c.save();
  c.translate(x, y);
  const r = 10 + Math.sin(t * 30) * 1.5;
  c.strokeStyle = 'rgba(255,120,100,0.9)';
  c.lineWidth = 1.4;
  c.beginPath();
  c.arc(0, 0, r, 0, TAU);
  c.stroke();
  for (let i = 0; i < 4; i++) {
    const a = (i * Math.PI) / 2 + t * 6;
    c.beginPath();
    c.moveTo(Math.cos(a) * (r - 3), Math.sin(a) * (r - 3));
    c.lineTo(Math.cos(a) * (r + 5), Math.sin(a) * (r + 5));
    c.stroke();
  }
  c.beginPath();
  c.moveTo(0, -9);
  c.lineTo(4, 3);
  c.lineTo(0, 1);
  c.lineTo(-4, 3);
  c.closePath();
  c.fillStyle = '#ffffff';
  c.fill();
  c.restore();
  drawGlow(c, x, y, 12, '#ffffff', 0.9);
}
