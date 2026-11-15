/**
 * Redrawn guns: GRAVITY GUN, ANGKLUNG, HONEY BLASTER, SAKURA BLOSSOM,
 * ORBITAL BEACON, SINGULARITY CANNON, NANO-SWARM and MARTIAN HEAT-RAY (skin 3).
 * Convention: muzzle at (0,0), the gun extends downward, grip to the lower right.
 */
import { drawGlow } from './glowSprite';
import { cyl, grip, ink, lg, poly, rr, shine, sparkle, star, type C, type Stops } from './redesign7';
import { fireOf, type Fire } from './redesign8a';

const TAU = Math.PI * 2;
const SILVER: Stops = [[0, '#4a525c'], [0.35, '#dfe6ee'], [0.55, '#ffffff'], [1, '#56606a']];
const GUN: Stops = [[0, '#14181c'], [0.4, '#4e5862'], [0.55, '#7a848e'], [1, '#101418']];
const GOLD: Stops = [[0, '#7a4e00'], [0.35, '#ffe48a'], [0.55, '#fff7d0'], [1, '#9a6400']];

/* -------------------------------------------------------------- GRAVITY GUN */
function gravity(c: C, f: Fire, t: number) {
  const orange: Stops = [[0, '#6a2a00'], [0.4, '#ff8a1a'], [0.55, '#ffb24a'], [1, '#5a2200']];
  const pulse = 0.5 + 0.5 * Math.sin(t * 3);
  const open = 0.25 + f.hot * 0.75;
  c.save();
  c.translate(0, f.kick * 7);
  grip(c, 166, GUN, '#050607', '#ff8a1a', 60);
  // body with hazard stripes
  rr(c, -24, 98, 48, 74, 12);
  c.fillStyle = cyl(c, -24, 24, orange);
  c.fill();
  ink(c, '#2a0e00', 1.6);
  c.save();
  rr(c, -24, 98, 48, 74, 12);
  c.clip();
  c.fillStyle = 'rgba(20,10,0,0.85)';
  for (let x = -60; x < 40; x += 14) {
    poly(c, [x, 172, x + 7, 172, x + 27, 150, x + 20, 150]);
    c.fill();
  }
  c.restore();
  // coil core
  for (let i = 0; i < 4; i++) {
    const y = 108 + i * 9;
    rr(c, -14, y, 28, 6, 3);
    c.fillStyle = cyl(c, -14, 14, [[0, '#4a2a08'], [0.5, '#e8a040'], [1, '#4a2a08']]);
    c.fill();
  }
  drawGlow(c, 0, 122, 30, '#8ad8ff', 0.25 + 0.15 * pulse);
  // neck
  rr(c, -12, 56, 24, 46, 6);
  c.fillStyle = cyl(c, -12, 12, GUN);
  c.fill();
  ink(c, '#000', 1.2);
  // three claws (open wider while firing)
  for (const s of [-1, 0, 1]) {
    c.save();
    c.translate(s * 8, 58);
    c.rotate(s * (0.3 + open * 0.35));
    poly(c, [-4, 0, 4, 0, 6, -30, 1, -46, -3, -30]);
    c.fillStyle = cyl(c, -4, 6, s === 0 ? GUN : orange);
    c.fill();
    ink(c, '#000', 1.2);
    c.restore();
  }
  // gravity orb with orbiting rings
  const r = 9 + pulse * 1.5 + f.hot * 4;
  drawGlow(c, 0, 26, 46 + f.hot * 60, '#7ad0ff', 0.5 + f.hot * 0.5);
  c.beginPath();
  c.arc(0, 26, r, 0, TAU);
  c.fillStyle = lg(c, 0, 26 - r, 0, 26 + r, [[0, '#ffffff'], [0.4, '#b8ecff'], [1, '#2a7ad8']]);
  c.fill();
  for (let i = 0; i < 2; i++) {
    c.beginPath();
    c.ellipse(0, 26, r + 8 + i * 5, 4 + i * 2, t * (1.5 + i) + i, 0, TAU);
    c.strokeStyle = `rgba(160,225,255,${0.6 - i * 0.2})`;
    c.lineWidth = 1.4;
    c.stroke();
  }
  c.restore();
}

/* ----------------------------------------------------------------- ANGKLUNG */
function bambooTube(c: C, x: number, top: number, bottom: number, w: number, swing: number) {
  c.save();
  c.translate(x, bottom);
  c.rotate(swing);
  const h = bottom - top;
  // tube with a slanted cut on top
  poly(c, [-w / 2, 0, w / 2, 0, w / 2, -h + 6, -w / 2, -h - 6]);
  c.fillStyle = cyl(c, -w / 2, w / 2, [[0, '#6a4a10'], [0.35, '#e8c86a'], [0.55, '#fff0b0'], [1, '#7a5418']]);
  c.fill();
  ink(c, '#3a2804', 1.3);
  // nodes
  for (let y = -16; y > -h + 10; y -= 22) {
    rr(c, -w / 2 - 1, y, w + 2, 4, 2);
    c.fillStyle = '#8a6420';
    c.fill();
  }
  // cut face
  c.beginPath();
  c.ellipse(0, -h, w / 2, 3, -0.4, 0, TAU);
  c.fillStyle = '#4a3208';
  c.fill();
  c.restore();
}
function angklung(c: C, f: Fire, t: number) {
  const shake = f.ft < 0.4 ? Math.sin(f.ft * 70) * (1 - f.ft / 0.4) * 0.08 : Math.sin(t * 2) * 0.01;
  c.save();
  c.translate(0, f.kick * 5);
  grip(c, 186, [[0, '#4a2a08'], [0.5, '#a8762a'], [1, '#3a2004']], '#1a0e02', '#e8283c', 56);
  // bottom rail (slotted base)
  rr(c, -34, 168, 68, 20, 6);
  c.fillStyle = cyl(c, -34, 34, [[0, '#4a2a08'], [0.5, '#c8923a'], [1, '#3a2004']]);
  c.fill();
  ink(c, '#1a0e02', 1.4);
  // red-gold ornament band
  rr(c, -32, 172, 64, 6, 2);
  c.fillStyle = '#c81a22';
  c.fill();
  for (let x = -28; x <= 28; x += 8) {
    c.beginPath();
    c.moveTo(x, 172);
    c.lineTo(x + 4, 175);
    c.lineTo(x, 178);
    c.lineTo(x - 4, 175);
    c.closePath();
    c.fillStyle = '#ffd23a';
    c.fill();
  }
  // side posts
  for (const s of [-1, 1]) {
    rr(c, s * 34 - 4, 30, 8, 142, 3);
    c.fillStyle = cyl(c, s * 34 - 4, s * 34 + 4, [[0, '#6a4a10'], [0.5, '#e8c86a'], [1, '#6a4a10']]);
    c.fill();
    ink(c, '#3a2804', 1.1);
  }
  // three tuned tubes of different heights, sounding when fired
  bambooTube(c, -21, 66, 166, 16, shake);
  bambooTube(c, 21, 46, 166, 16, -shake);
  bambooTube(c, 0, 8, 166, 19, shake * 0.6);
  // rattan top bar
  rr(c, -38, 26, 76, 10, 4);
  c.fillStyle = cyl(c, -38, 38, [[0, '#4a2a08'], [0.5, '#c8923a'], [1, '#3a2004']]);
  c.fill();
  ink(c, '#1a0e02', 1.2);
  c.strokeStyle = 'rgba(40,20,0,0.5)';
  c.lineWidth = 1;
  for (let x = -34; x < 36; x += 5) {
    c.beginPath();
    c.moveTo(x, 26);
    c.lineTo(x + 3, 36);
    c.stroke();
  }
  // floating music notes
  for (let i = 0; i < 3; i++) {
    const ph = (t * 0.5 + i * 0.33) % 1;
    const x = -24 + i * 24 + Math.sin(t * 2 + i) * 6;
    const y = 6 - ph * 50;
    c.globalAlpha = (1 - ph) * (0.6 + f.hot * 0.4);
    c.fillStyle = ['#ffd23a', '#ff7aa0', '#7ad8ff'][i];
    c.beginPath();
    c.ellipse(x, y, 4, 3, -0.4, 0, TAU);
    c.fill();
    c.fillRect(x + 2.6, y - 13, 1.8, 13);
    c.fillRect(x + 2.6, y - 13, 6, 2.4);
    c.globalAlpha = 1;
  }
  if (f.hot > 0.02) drawGlow(c, 0, 8, 30 + f.hot * 30, '#ffe6a0', f.hot * 0.6);
  c.restore();
}

/* ------------------------------------------------------------ HONEY BLASTER */
function honeycomb(c: C, x0: number, y0: number, w: number, h: number, r: number) {
  c.strokeStyle = 'rgba(140,80,0,0.55)';
  c.lineWidth = 1;
  for (let row = 0; row * r * 1.5 < h + r; row++) {
    for (let col = 0; col * r * 1.73 < w + r; col++) {
      const cx = x0 + col * r * 1.73 + (row % 2 ? r * 0.87 : 0);
      const cy = y0 + row * r * 1.5;
      poly(c, Array.from({ length: 6 }, (_, i) => [cx + Math.cos((i / 6) * TAU + Math.PI / 6) * r, cy + Math.sin((i / 6) * TAU + Math.PI / 6) * r]).flat());
      c.stroke();
    }
  }
}
function honey(c: C, f: Fire, t: number) {
  const amber: Stops = [[0, '#8a4a00'], [0.4, '#ffb21f'], [0.6, '#ffd060'], [1, '#7a3e00']];
  c.save();
  c.translate(0, f.kick * 6);
  grip(c, 168, [[0, '#3a1e02'], [0.5, '#8a5418'], [1, '#2e1600']], '#140800', '#ffd23a', 60);
  // honey jar body (glass)
  rr(c, -26, 96, 52, 78, 18);
  c.fillStyle = 'rgba(255,240,200,0.25)';
  c.fill();
  c.save();
  rr(c, -26, 96, 52, 78, 18);
  c.clip();
  const lvl = 0.78 - f.hot * 0.12 + 0.03 * Math.sin(t * 2);
  const top = 96 + 78 * (1 - lvl);
  c.beginPath();
  c.moveTo(-27, 176);
  c.lineTo(-27, top);
  for (let x = -27; x <= 27; x += 6) c.lineTo(x, top + Math.sin(t * 3 + x * 0.3) * 1.4);
  c.lineTo(27, 176);
  c.closePath();
  c.fillStyle = lg(c, 0, top, 0, 176, [[0, '#ffd870'], [0.5, '#ffa21a'], [1, '#c86a00']]);
  c.fill();
  honeycomb(c, -26, top + 6, 52, 176 - top, 6);
  c.fillStyle = 'rgba(255,255,255,0.35)';
  c.fillRect(-18, 100, 5, 70);
  c.restore();
  rr(c, -26, 96, 52, 78, 18);
  ink(c, '#6a3a00', 1.6);
  // label with a bee
  rr(c, -15, 120, 30, 26, 5);
  c.fillStyle = '#fff6dc';
  c.fill();
  ink(c, '#8a5418', 1);
  c.beginPath();
  c.ellipse(0, 134, 7, 5, 0, 0, TAU);
  c.fillStyle = '#ffc82a';
  c.fill();
  c.fillStyle = '#2a1a00';
  c.fillRect(-2.5, 129, 2, 10);
  c.fillRect(1.5, 129, 2, 10);
  for (const s of [-1, 1]) {
    c.beginPath();
    c.ellipse(s * 4, 128, 4, 2.5, s * 0.6, 0, TAU);
    c.fillStyle = 'rgba(200,235,255,0.9)';
    c.fill();
  }
  // lid + neck
  rr(c, -24, 86, 48, 14, 5);
  c.fillStyle = cyl(c, -24, 24, [[0, '#6a1a0a'], [0.5, '#d84a2a'], [1, '#5a1206']]);
  c.fill();
  ink(c, '#2a0600', 1.3);
  // beehive nozzle barrel
  for (let i = 0; i < 5; i++) {
    const y = 26 + i * 12;
    const w = 12 + i * 2.5;
    rr(c, -w, y, w * 2, 13, 6);
    c.fillStyle = cyl(c, -w, w, amber);
    c.fill();
    ink(c, '#6a3a00', 1.2);
  }
  // honey dripping from the muzzle
  c.beginPath();
  c.ellipse(0, 22, 11, 5, 0, 0, TAU);
  c.fillStyle = '#5a2a00';
  c.fill();
  const drip = 6 + Math.sin(t * 2) * 3 + f.hot * 6;
  c.beginPath();
  c.moveTo(-4, 24);
  c.quadraticCurveTo(-4, 24 + drip, 0, 26 + drip);
  c.quadraticCurveTo(4, 24 + drip, 4, 24);
  c.fillStyle = '#ffb21f';
  c.fill();
  drawGlow(c, 0, 18, 22 + f.hot * 40, '#ffcf5a', 0.35 + f.hot * 0.5);
  // a little bee buzzing around
  const bx = Math.cos(t * 2.4) * 34, by = 60 + Math.sin(t * 4.8) * 16;
  c.beginPath();
  c.ellipse(bx, by, 5, 3.6, 0, 0, TAU);
  c.fillStyle = '#ffc82a';
  c.fill();
  c.fillStyle = '#2a1a00';
  c.fillRect(bx - 1.5, by - 3.5, 1.6, 7);
  c.beginPath();
  c.ellipse(bx - 1, by - 4, 3, 2, -0.5, 0, TAU);
  c.fillStyle = 'rgba(220,240,255,0.9)';
  c.fill();
  c.restore();
}

/* ----------------------------------------------------------- SAKURA BLOSSOM */
function blossom(c: C, x: number, y: number, r: number, rot: number, open = 1) {
  c.save();
  c.translate(x, y);
  c.rotate(rot);
  for (let i = 0; i < 5; i++) {
    c.save();
    c.rotate((i / 5) * TAU);
    c.beginPath();
    c.moveTo(0, 0);
    c.bezierCurveTo(-r * 0.55 * open, -r * 0.3, -r * 0.45, -r * 0.95, -r * 0.12, -r);
    c.lineTo(0, -r * 0.82);
    c.lineTo(r * 0.12, -r);
    c.bezierCurveTo(r * 0.45, -r * 0.95, r * 0.55 * open, -r * 0.3, 0, 0);
    c.fillStyle = lg(c, 0, 0, 0, -r, [[0, '#ff7aa8'], [0.5, '#ffc0d8'], [1, '#fff0f6']]);
    c.fill();
    c.strokeStyle = 'rgba(200,60,110,0.55)';
    c.lineWidth = 0.8;
    c.stroke();
    c.restore();
  }
  c.beginPath();
  c.arc(0, 0, r * 0.2, 0, TAU);
  c.fillStyle = '#ffd23a';
  c.fill();
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * TAU + 0.6;
    c.beginPath();
    c.arc(Math.cos(a) * r * 0.32, Math.sin(a) * r * 0.32, 0.9, 0, TAU);
    c.fillStyle = '#c8282e';
    c.fill();
  }
  c.restore();
}
function sakura(c: C, f: Fire, t: number) {
  const lacquer: Stops = [[0, '#3a0006'], [0.4, '#b8121e'], [0.55, '#e8283c'], [1, '#2e0004']];
  const black: Stops = [[0, '#060606'], [0.5, '#3a3a40'], [1, '#040404']];
  c.save();
  c.translate(0, f.kick * 6);
  grip(c, 168, black, '#000', '#ffd23a', 60);
  // body
  rr(c, -18, 100, 36, 72, 12);
  c.fillStyle = cyl(c, -18, 18, black);
  c.fill();
  ink(c, '#000', 1.5);
  // gold wave crest on the body
  c.save();
  rr(c, -18, 100, 36, 72, 12);
  c.clip();
  c.strokeStyle = 'rgba(255,214,90,0.8)';
  c.lineWidth = 1.4;
  for (let i = 0; i < 4; i++) {
    c.beginPath();
    c.arc(0, 176 - i * 3, 10 + i * 6, Math.PI, TAU);
    c.stroke();
  }
  c.restore();
  // lacquered barrel with gold bands
  rr(c, -10, 20, 20, 84, 6);
  c.fillStyle = cyl(c, -10, 10, lacquer);
  c.fill();
  ink(c, '#1a0002', 1.3);
  for (const y of [22, 56, 96]) {
    rr(c, -12, y, 24, 6, 2);
    c.fillStyle = cyl(c, -12, 12, GOLD);
    c.fill();
    ink(c, '#5a3a00', 0.9);
  }
  // a cherry branch wrapping the gun
  c.beginPath();
  c.moveTo(18, 160);
  c.bezierCurveTo(32, 130, -26, 110, -14, 78);
  c.bezierCurveTo(-6, 56, 22, 50, 14, 24);
  c.lineWidth = 3.5;
  c.lineCap = 'round';
  c.strokeStyle = '#4a2a1a';
  c.stroke();
  c.beginPath();
  c.moveTo(-14, 78);
  c.quadraticCurveTo(-30, 70, -34, 58);
  c.lineWidth = 2.2;
  c.stroke();
  const sway = Math.sin(t * 1.6) * 0.15;
  blossom(c, 20, 144, 9, 0.4 + sway);
  blossom(c, -18, 92, 10, 1.1 - sway);
  blossom(c, -34, 58, 8, 0.2 + sway);
  blossom(c, 16, 40, 9, 0.8 - sway);
  // buds
  for (const [x, y] of [[6, 120], [-8, 66], [22, 64]]) {
    c.beginPath();
    c.ellipse(x, y, 3, 4, 0.4, 0, TAU);
    c.fillStyle = '#ff7aa8';
    c.fill();
  }
  // blossom muzzle: a large flower blooming at the muzzle
  drawGlow(c, 0, 12, 30 + f.hot * 40, '#ffc0d8', 0.45 + f.hot * 0.5);
  blossom(c, 0, 12, 14 + f.hot * 3, t * 0.4 + f.hot * 1.5, 1 + f.hot * 0.3);
  // falling petals
  for (let i = 0; i < 5; i++) {
    const ph = (t * 0.35 + i * 0.2) % 1;
    const x = Math.sin(i * 2.7 + t) * 34;
    const y = -10 + ph * 200;
    c.save();
    c.translate(x, y);
    c.rotate(t * 2 + i);
    c.globalAlpha = Math.sin(ph * Math.PI) * 0.85;
    c.beginPath();
    c.ellipse(0, 0, 4, 2.4, 0, 0, TAU);
    c.fillStyle = '#ffb8d0';
    c.fill();
    c.restore();
  }
  c.restore();
}

/* ----------------------------------------------------------- ORBITAL BEACON */
function orbital(c: C, f: Fire, t: number) {
  const white: Stops = [[0, '#8a96a4'], [0.4, '#ffffff'], [0.6, '#eef3f8'], [1, '#7a8696']];
  const pulse = 0.5 + 0.5 * Math.sin(t * 4);
  c.save();
  c.translate(0, f.kick * 6);
  grip(c, 166, GUN, '#050607', '#ff8a3a', 60);
  // body
  rr(c, -18, 96, 36, 76, 12);
  c.fillStyle = cyl(c, -18, 18, white);
  c.fill();
  ink(c, '#2a323c', 1.5);
  rr(c, -12, 106, 24, 18, 4);
  c.fillStyle = '#081420';
  c.fill();
  // target readout: orbit ring + satellite dot
  c.beginPath();
  c.ellipse(0, 115, 9, 5, 0, 0, TAU);
  c.strokeStyle = '#5ad2ff';
  c.lineWidth = 1;
  c.stroke();
  c.beginPath();
  c.arc(Math.cos(t * 2) * 9, 115 + Math.sin(t * 2) * 5, 1.8, 0, TAU);
  c.fillStyle = '#ffb04a';
  c.fill();
  // solar panel wings
  for (const s of [-1, 1]) {
    c.save();
    c.translate(s * 18, 140);
    c.rotate(s * (0.08 + Math.sin(t * 1.5) * 0.03));
    rr(c, s > 0 ? 4 : -40, -16, 36, 32, 3);
    c.fillStyle = lg(c, 0, -16, 0, 16, [[0, '#1a3a8a'], [0.5, '#2a6ad8'], [1, '#12286a']]);
    c.fill();
    ink(c, '#0a1430', 1.2);
    c.strokeStyle = 'rgba(160,210,255,0.55)';
    c.lineWidth = 0.8;
    for (let i = 1; i < 4; i++) {
      const x = (s > 0 ? 4 : -40) + i * 9;
      c.beginPath();
      c.moveTo(x, -16);
      c.lineTo(x, 16);
      c.stroke();
    }
    c.beginPath();
    c.moveTo(s > 0 ? 4 : -40, 0);
    c.lineTo(s > 0 ? 40 : -4, 0);
    c.stroke();
    rr(c, s > 0 ? 0 : -4, -3, 4, 6, 1);
    c.fillStyle = '#9aa4b0';
    c.fill();
    c.restore();
  }
  // mast
  rr(c, -7, 46, 14, 54, 4);
  c.fillStyle = cyl(c, -7, 7, SILVER);
  c.fill();
  ink(c);
  for (const y of [58, 80]) {
    rr(c, -9, y, 18, 5, 2);
    c.fillStyle = '#ff8a3a';
    c.fill();
  }
  // dish antenna (muzzle)
  c.save();
  c.translate(0, 34);
  c.beginPath();
  c.ellipse(0, 0, 30, 11, 0, Math.PI, TAU);
  c.lineTo(30, 0);
  c.ellipse(0, 0, 30, 4, 0, 0, Math.PI);
  c.closePath();
  c.fillStyle = cyl(c, -30, 30, white);
  c.fill();
  ink(c, '#2a323c', 1.4);
  c.beginPath();
  c.ellipse(0, 0, 30, 4, 0, 0, TAU);
  c.fillStyle = '#c8d2dc';
  c.fill();
  ink(c, '#2a323c', 1);
  for (const s of [-1, 1]) {
    c.beginPath();
    c.moveTo(s * 22, -2);
    c.lineTo(0, -24);
    c.strokeStyle = '#6a7684';
    c.lineWidth = 1.6;
    c.stroke();
  }
  c.restore();
  // beacon light
  drawGlow(c, 0, 8, 30 + f.hot * 60, '#ff9a4a', 0.5 + 0.3 * pulse + f.hot * 0.4);
  c.beginPath();
  c.arc(0, 9, 5, 0, TAU);
  c.fillStyle = lg(c, 0, 4, 0, 14, [[0, '#fff1d0'], [1, '#ff6a1a']]);
  c.fill();
  if (f.hot > 0.02) {
    c.strokeStyle = `rgba(255,190,120,${f.hot})`;
    c.lineWidth = 2;
    for (let i = 0; i < 2; i++) {
      c.beginPath();
      c.arc(0, 9, 10 + (1 - f.hot) * 30 + i * 10, Math.PI * 1.1, Math.PI * 1.9);
      c.stroke();
    }
  }
  c.restore();
}

/* ------------------------------------------------------- SINGULARITY CANNON */
function singularity(c: C, f: Fire, t: number) {
  const dark: Stops = [[0, '#0a0614'], [0.45, '#3a2a5a'], [0.6, '#5a4686'], [1, '#08040e']];
  c.save();
  c.translate(0, f.kick * 9);
  grip(c, 172, dark, '#000', '#c48bff', 60);
  // body
  rr(c, -24, 100, 48, 78, 14);
  c.fillStyle = cyl(c, -24, 24, dark);
  c.fill();
  ink(c, '#000', 1.6);
  // containment window with swirling void
  c.beginPath();
  c.ellipse(0, 138, 14, 24, 0, 0, TAU);
  c.fillStyle = '#05020a';
  c.fill();
  c.save();
  c.beginPath();
  c.ellipse(0, 138, 13, 23, 0, 0, TAU);
  c.clip();
  for (let i = 0; i < 4; i++) {
    c.beginPath();
    c.ellipse(0, 138, 4 + i * 3.5, 8 + i * 5, t * (1 + i * 0.4), 0, Math.PI * 1.4);
    c.strokeStyle = `rgba(${180 + i * 15},${110 + i * 20},255,${0.7 - i * 0.12})`;
    c.lineWidth = 1.5;
    c.stroke();
  }
  c.restore();
  c.beginPath();
  c.ellipse(0, 138, 14, 24, 0, 0, TAU);
  ink(c, '#c48bff', 1.3);
  // containment rings on the barrel
  rr(c, -12, 46, 24, 58, 6);
  c.fillStyle = cyl(c, -12, 12, dark);
  c.fill();
  ink(c, '#000', 1.2);
  for (let i = 0; i < 3; i++) {
    const y = 56 + i * 16;
    const glow = 0.5 + 0.5 * Math.sin(t * 4 - i);
    rr(c, -18, y, 36, 8, 4);
    c.fillStyle = cyl(c, -18, 18, SILVER);
    c.fill();
    ink(c, '#000', 1);
    rr(c, -14, y + 3, 28, 2, 1);
    c.fillStyle = `rgba(200,140,255,${0.4 + 0.5 * glow + f.hot * 0.3})`;
    c.fill();
  }
  // accretion disc at the muzzle with the black core
  c.save();
  c.translate(0, 26);
  const spin = t * 2 + f.hot * 6;
  drawGlow(c, 0, 0, 50 + f.hot * 60, '#a35cff', 0.45 + f.hot * 0.5);
  for (let i = 0; i < 3; i++) {
    c.beginPath();
    c.ellipse(0, 0, 30 - i * 6, 9 - i * 2, 0, 0, TAU);
    c.strokeStyle = ['rgba(255,170,90,0.85)', 'rgba(230,120,255,0.85)', 'rgba(255,230,255,0.9)'][i];
    c.lineWidth = 3 - i * 0.6;
    c.setLineDash([10 - i * 2, 6]);
    c.lineDashOffset = -spin * (12 + i * 6);
    c.stroke();
  }
  c.setLineDash([]);
  const core = 9 - f.hot * 2;
  c.beginPath();
  c.arc(0, 0, core + 2.5, 0, TAU);
  c.fillStyle = 'rgba(255,220,255,0.9)';
  c.fill();
  c.beginPath();
  c.arc(0, 0, core, 0, TAU);
  c.fillStyle = '#000';
  c.fill();
  c.restore();
  // claws holding the disc
  for (const s of [-1, 1]) {
    c.beginPath();
    c.moveTo(s * 10, 50);
    c.quadraticCurveTo(s * 32, 42, s * 30, 28);
    c.lineWidth = 5;
    c.strokeStyle = '#08040e';
    c.stroke();
    c.lineWidth = 2.6;
    c.strokeStyle = '#7a6aa6';
    c.stroke();
  }
  c.restore();
}

/* ------------------------------------------------------------------ NANO-SWARM */
function nano(c: C, f: Fire, t: number) {
  const dark: Stops = [[0, '#0a1410'], [0.45, '#2a4a3a'], [0.6, '#3e6a52'], [1, '#08100c']];
  c.save();
  c.translate(0, f.kick * 6);
  grip(c, 170, dark, '#020604', '#7dff9a', 60);
  // hexagonal hive body
  poly(c, [-26, 112, 0, 96, 26, 112, 26, 156, 0, 172, -26, 156]);
  c.fillStyle = cyl(c, -26, 26, dark);
  c.fill();
  ink(c, '#000', 1.6);
  // glowing cells
  const cells = [[0, 116], [-11, 122], [11, 122], [-11, 136], [11, 136], [0, 130], [0, 144], [-11, 150], [11, 150]];
  cells.forEach(([x, y], i) => {
    const on = 0.5 + 0.5 * Math.sin(t * 4 + i * 1.3);
    poly(c, Array.from({ length: 6 }, (_, k) => [x + Math.cos((k / 6) * TAU) * 5.5, y + Math.sin((k / 6) * TAU) * 5.5]).flat());
    c.fillStyle = `rgba(${60 + 80 * on},${200 + 55 * on},${110 + 60 * on},${0.55 + 0.45 * on})`;
    c.fill();
    c.strokeStyle = '#06100a';
    c.lineWidth = 1;
    c.stroke();
  });
  drawGlow(c, 0, 134, 40, '#5dff8a', 0.3 + f.hot * 0.4);
  // neck
  rr(c, -10, 60, 20, 40, 5);
  c.fillStyle = cyl(c, -10, 10, SILVER);
  c.fill();
  ink(c);
  for (const y of [68, 84]) {
    rr(c, -12, y, 24, 5, 2);
    c.fillStyle = '#7dff9a';
    c.fill();
  }
  // emitter cone
  poly(c, [-10, 62, 10, 62, 18, 20, -18, 20]);
  c.fillStyle = cyl(c, -18, 18, dark);
  c.fill();
  ink(c, '#000', 1.3);
  c.beginPath();
  c.ellipse(0, 20, 18, 5, 0, 0, TAU);
  c.fillStyle = '#041008';
  c.fill();
  ink(c, '#7dff9a', 1.2);
  drawGlow(c, 0, 18, 30 + f.hot * 40, '#7dff9a', 0.4 + f.hot * 0.5);
  // the swarm: tiny bots orbiting the muzzle (spread out when firing)
  const spread = 1 + f.hot * 1.4;
  for (let i = 0; i < 14; i++) {
    const a = t * (1.6 + (i % 3) * 0.4) + i * 2.4;
    const rad = (14 + (i % 4) * 6) * spread;
    const x = Math.cos(a) * rad;
    const y = 10 + Math.sin(a) * rad * 0.45 - f.hot * 10;
    c.save();
    c.translate(x, y);
    c.rotate(a);
    poly(c, [-2.6, -1.6, 2.6, -1.6, 3.4, 0, 2.6, 1.6, -2.6, 1.6]);
    c.fillStyle = '#c8ffd8';
    c.fill();
    c.restore();
    drawGlow(c, x, y, 6, '#7dff9a', 0.55);
  }
  c.restore();
}

/* ----------------------------------------------- MARTIAN HEAT-RAY (skin 3) */
function heatRay(c: C, f: Fire, t: number) {
  const pulse = 0.5 + 0.5 * Math.sin(t * 4);
  const chrome: Stops = [[0, '#3a424c'], [0.3, '#c8d2dc'], [0.5, '#ffffff'], [0.7, '#9aa6b2'], [1, '#2e3640']];
  c.save();
  c.translate(0, f.kick * 6);
  // flexible hose tail (smooth tube, no beads)
  const sway = Math.sin(t * 1.8) * 8;
  const hose = () => {
    c.beginPath();
    c.moveTo(0, 82);
    c.bezierCurveTo(14, 120, -26 + sway, 150, -8 + sway, 186);
    c.bezierCurveTo(6 + sway * 0.5, 214, 26, 224, 18, 252);
  };
  c.lineCap = 'round';
  hose();
  c.lineWidth = 15;
  c.strokeStyle = '#1e2630';
  c.stroke();
  hose();
  c.lineWidth = 11;
  c.strokeStyle = '#6a7684';
  c.stroke();
  hose();
  c.lineWidth = 5;
  c.strokeStyle = '#b8c4d0';
  c.stroke();
  // fine ribbing along the hose
  hose();
  c.lineWidth = 11;
  c.setLineDash([1.4, 3.6]);
  c.strokeStyle = 'rgba(20,28,36,0.45)';
  c.stroke();
  c.setLineDash([]);
  // green energy pulse travelling up the hose
  hose();
  c.lineWidth = 2.4;
  c.setLineDash([10, 34]);
  c.lineDashOffset = t * 60 + f.hot * 80;
  c.strokeStyle = `rgba(120,255,150,${0.75 + f.hot * 0.25})`;
  c.stroke();
  c.setLineDash([]);
  rr(c, 10, 248, 16, 12, 4);
  c.fillStyle = cyl(c, 10, 26, chrome);
  c.fill();
  ink(c, '#1e2630', 1.2);
  // neck collar
  rr(c, -9, 70, 18, 16, 5);
  c.fillStyle = cyl(c, -9, 9, chrome);
  c.fill();
  ink(c, '#1e2630', 1.2);
  // side fins + pointed nose cone (the slide 2 silhouette, refined)
  for (const sd of [-1, 1]) {
    poly(c, [sd * 16, 50, sd * 34, 64, sd * 32, 76, sd * 12, 70]);
    c.fillStyle = cyl(c, sd * 12, sd * 34, chrome);
    c.fill();
    ink(c, '#1e2630', 1.3);
    c.beginPath();
    c.arc(sd * 30, 70, 2.4, 0, TAU);
    c.fillStyle = '#5dff7a';
    c.fill();
  }
  c.beginPath();
  c.moveTo(0, -8);
  c.bezierCurveTo(9, 2, 22, 24, 23, 46);
  c.bezierCurveTo(24, 62, 14, 74, 0, 76);
  c.bezierCurveTo(-14, 74, -24, 62, -23, 46);
  c.bezierCurveTo(-22, 24, -9, 2, 0, -8);
  c.closePath();
  c.fillStyle = cyl(c, -24, 24, chrome);
  c.fill();
  ink(c, '#1e2630', 1.6);
  // panel lines + rivet band
  c.strokeStyle = 'rgba(30,40,50,0.45)';
  c.lineWidth = 1.1;
  for (const sd of [-1, 1]) {
    c.beginPath();
    c.moveTo(sd * 3, 0);
    c.quadraticCurveTo(sd * 15, 30, sd * 12, 72);
    c.stroke();
  }
  rr(c, -23, 56, 46, 6, 3);
  c.fillStyle = cyl(c, -23, 23, [[0, '#2a323c'], [0.5, '#8a96a2'], [1, '#2a323c']]);
  c.fill();
  for (let i = -2; i <= 2; i++) {
    c.beginPath();
    c.arc(i * 8, 59, 1.2, 0, TAU);
    c.fillStyle = '#d8e0e8';
    c.fill();
  }
  shine(c, -15, 18, 4, 30, 0.55);
  // green heat-ray lens
  c.beginPath();
  c.arc(0, 32, 11, 0, TAU);
  c.fillStyle = '#062a10';
  c.fill();
  ink(c, '#1e2630', 1.4);
  const r = 7 + pulse + f.hot * 2;
  c.beginPath();
  c.arc(0, 32, r, 0, TAU);
  c.fillStyle = lg(c, 0, 32 - r, 0, 32 + r, [[0, '#eaffef'], [0.5, '#5dff7a'], [1, '#0a9a2a']]);
  c.fill();
  drawGlow(c, 0, 30, 36 + f.hot * 60, '#5dff7a', 0.5 + 0.2 * pulse + f.hot * 0.5);
  // crackling arcs while firing
  if (f.hot > 0.05) {
    c.strokeStyle = `rgba(180,255,190,${f.hot})`;
    c.lineWidth = 1.6;
    for (const s of [-1, 1]) {
      c.beginPath();
      c.moveTo(s * 8, 28);
      for (let i = 1; i <= 4; i++) c.lineTo(s * (8 + i * 6) + Math.sin(t * 40 + i) * 3, 28 - i * 7 + Math.cos(t * 37 + i) * 3);
      c.stroke();
    }
  }
  c.restore();
}

export function drawRedesign8c(c: C, id: string, sinceShot: number, t: number): boolean {
  const f = fireOf(sinceShot);
  switch (id) {
    case 'gravity': gravity(c, f, t); return true;
    case 'angklung': angklung(c, f, t); return true;
    case 'honey': honey(c, f, t); return true;
    case 'sakura': sakura(c, f, t); return true;
    case 'orbital_beacon': orbital(c, f, t); return true;
    case 'singularity': singularity(c, f, t); return true;
    case 'nano_swarm': nano(c, f, t); return true;
    case 'heat_ray': heatRay(c, f, t); return true;
    default: return false;
  }
}
export { sparkle, star };
