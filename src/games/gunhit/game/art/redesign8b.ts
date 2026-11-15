/**
 * Redrawn tech guns: LASER BEAM, RPG-7, NOISY CRICKET, CRYO BLASTER,
 * GAUNTLET CANNON, AIR CANNON and PHASER TYPE-II.
 * Convention: muzzle at (0,0), the gun extends downward, grip to the lower right.
 */
import { drawGlow } from './glowSprite';
import { cyl, grip, ink, lg, poly, rr, shine, sparkle, star, type C, type Stops } from './redesign7';
import { fireOf, type Fire } from './redesign8a';

const TAU = Math.PI * 2;
const SILVER: Stops = [[0, '#4a525c'], [0.35, '#dfe6ee'], [0.55, '#ffffff'], [1, '#56606a']];
const GUN: Stops = [[0, '#14181c'], [0.4, '#4e5862'], [0.55, '#7a848e'], [1, '#101418']];
const GOLD: Stops = [[0, '#7a4e00'], [0.35, '#ffe48a'], [0.55, '#fff7d0'], [1, '#9a6400']];

/* --------------------------------------------------------------- LASER BEAM */
function laser(c: C, f: Fire, t: number) {
  const pulse = 0.5 + 0.5 * Math.sin(t * 5);
  const white: Stops = [[0, '#9aa4b0'], [0.4, '#ffffff'], [0.6, '#f2f5f8'], [1, '#8a94a0']];
  c.save();
  c.translate(0, f.kick * 6);
  grip(c, 160, [[0, '#2a0a10'], [0.5, '#6a1a26'], [1, '#22060c']], '#12030a', '#ff4a5e', 62);
  // body shell
  poly(c, [-14, 90, 14, 90, 24, 112, 24, 168, -24, 168, -24, 112]);
  c.fillStyle = cyl(c, -24, 24, white);
  c.fill();
  ink(c, '#2a323c', 1.5);
  // red side panels
  for (const s of [-1, 1]) {
    poly(c, [s * 16, 112, s * 24, 116, s * 24, 162, s * 16, 158]);
    c.fillStyle = cyl(c, s * 16, s * 24, [[0, '#7a0a18'], [1, '#e8283c']]);
    c.fill();
  }
  // energy cells
  for (let i = 0; i < 4; i++) {
    const y = 114 + i * 12;
    rr(c, -10, y, 20, 8, 2);
    c.fillStyle = '#1a0408';
    c.fill();
    const on = f.ft < 0.5 ? (i / 4 < f.ft / 0.5 ? 1 : 0.25) : 1;
    rr(c, -8, y + 2, 16, 4, 1.5);
    c.fillStyle = `rgba(255,${80 + 60 * on},${90 + 40 * on},${0.4 + 0.6 * on})`;
    c.fill();
  }
  drawGlow(c, 0, 138, 30, '#ff4a5e', 0.25 + 0.15 * pulse);
  // barrel + heat-sink rings
  rr(c, -8, 18, 16, 76, 5);
  c.fillStyle = cyl(c, -8, 8, SILVER);
  c.fill();
  ink(c);
  for (let i = 0; i < 5; i++) {
    const y = 30 + i * 12;
    const heat = Math.max(0, f.hot * 1.3 - i * 0.18);
    rr(c, -13, y, 26, 5, 2);
    c.fillStyle = heat > 0.05 ? `rgb(${120 + 135 * heat},${60 + 40 * heat},${60})` : '#2a3038';
    c.fill();
    ink(c, '#0c0f12', 0.9);
  }
  // lens emitter
  poly(c, [-10, 20, 10, 20, 7, 6, -7, 6]);
  c.fillStyle = cyl(c, -10, 10, GUN);
  c.fill();
  ink(c, '#000', 1.2);
  c.beginPath();
  c.ellipse(0, 6, 7, 3.2, 0, 0, TAU);
  c.fillStyle = lg(c, -7, 0, 7, 0, [[0, '#ff9aa6'], [0.5, '#ff2a40'], [1, '#8a0018']]);
  c.fill();
  drawGlow(c, 0, 4, 18 + f.hot * 50, '#ff3a50', 0.55 + 0.2 * pulse + f.hot * 0.45);
  c.restore();
}

/* -------------------------------------------------------------------- RPG-7 */
function rpg(c: C, f: Fire, t: number) {
  const olive: Stops = [[0, '#1e2410'], [0.45, '#5a6a2c'], [0.6, '#76884a'], [1, '#182008']];
  const wood: Stops = [[0, '#3a1c08'], [0.5, '#a0602a'], [1, '#2e1404']];
  const loaded = f.ft > 0.55 ? 1 : f.ft < 0.08 ? 1 - f.ft / 0.08 : Math.max(0, (f.ft - 0.3) / 0.25);
  c.save();
  c.translate(0, f.kick * 10);
  // rear venturi flare
  poly(c, [-12, 236, 12, 236, 20, 270, -20, 270]);
  c.fillStyle = cyl(c, -20, 20, GUN);
  c.fill();
  ink(c, '#000', 1.3);
  c.beginPath();
  c.ellipse(0, 270, 20, 5, 0, 0, TAU);
  c.fillStyle = '#0a0c0e';
  c.fill();
  if (f.hot > 0.02) drawGlow(c, 0, 272, 40, '#ffb04a', f.hot * 0.8);
  // launch tube
  rr(c, -11, 58, 22, 182, 5);
  c.fillStyle = cyl(c, -11, 11, GUN);
  c.fill();
  ink(c, '#000', 1.3);
  // wooden heat shield
  rr(c, -14, 120, 28, 74, 6);
  c.fillStyle = cyl(c, -14, 14, wood);
  c.fill();
  ink(c, '#1a0a02', 1.2);
  c.strokeStyle = 'rgba(0,0,0,0.25)';
  c.lineWidth = 1;
  for (const y of [138, 156, 176]) {
    c.beginPath();
    c.moveTo(-14, y);
    c.lineTo(14, y);
    c.stroke();
  }
  // optic sight (side)
  rr(c, -26, 96, 11, 34, 4);
  c.fillStyle = cyl(c, -26, -15, GUN);
  c.fill();
  ink(c, '#000', 1.1);
  c.beginPath();
  c.ellipse(-20.5, 97, 4.5, 2.2, 0, 0, TAU);
  c.fillStyle = '#7ad8ff';
  c.fill();
  // trigger group
  grip(c, 196, wood, '#1a0a02', '#c8a060', 54, 2);
  rr(c, -13, 60, 26, 8, 3);
  c.fillStyle = cyl(c, -13, 13, olive);
  c.fill();
  ink(c, '#000', 1);
  // warhead (leaves on fire, reloads)
  if (loaded > 0.02) {
    c.save();
    c.translate(0, (1 - loaded) * 40);
    c.globalAlpha = Math.min(1, loaded * 1.5);
    for (const s of [-1, 1]) {
      poly(c, [s * 8, 56, s * 16, 70, s * 9, 70]);
      c.fillStyle = '#3a4418';
      c.fill();
      ink(c, '#000', 0.9);
    }
    poly(c, [-8, 60, 8, 60, 14, 34, 9, 8, 0, -4, -9, 8, -14, 34]);
    c.fillStyle = cyl(c, -14, 14, olive);
    c.fill();
    ink(c, '#0c1004', 1.4);
    rr(c, -13, 30, 26, 6, 2);
    c.fillStyle = '#c8a040';
    c.fill();
    c.beginPath();
    c.moveTo(-6, 12);
    c.lineTo(-10, 30);
    c.strokeStyle = 'rgba(255,255,255,0.3)';
    c.lineWidth = 3;
    c.stroke();
    c.restore();
  }
  if (f.hot > 0.02) drawGlow(c, 0, 50, 30 + f.hot * 40, '#ffd27a', f.hot * 0.7);
  c.restore();
  void t;
}

/* ------------------------------------------------------------ NOISY CRICKET */
function cricket(c: C, f: Fire, t: number) {
  const pulse = 0.5 + 0.5 * Math.sin(t * 6);
  c.save();
  c.translate(0, f.kick * 16);
  c.rotate(f.kick * 0.12);
  grip(c, 132, SILVER, '#2a323c', '#7ad8ff', 50);
  // bulbous chrome body
  c.beginPath();
  c.ellipse(0, 108, 26, 32, 0, 0, TAU);
  c.fillStyle = lg(c, -26, 80, 26, 140, [[0, '#ffffff'], [0.35, '#e4eaf0'], [0.7, '#8a96a2'], [1, '#4a5460']]);
  c.fill();
  ink(c, '#2a323c', 1.5);
  // panel seam + rivets
  c.beginPath();
  c.ellipse(0, 108, 18, 24, 0, 0, TAU);
  c.strokeStyle = 'rgba(40,50,60,0.45)';
  c.lineWidth = 1.2;
  c.stroke();
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * TAU;
    c.beginPath();
    c.arc(Math.cos(a) * 22, 108 + Math.sin(a) * 28, 1.6, 0, TAU);
    c.fillStyle = '#5a6672';
    c.fill();
  }
  // blue power orb in the middle
  c.beginPath();
  c.arc(0, 110, 10, 0, TAU);
  c.fillStyle = '#06203a';
  c.fill();
  c.beginPath();
  c.arc(0, 110, 7 + pulse * 1.5 + f.hot * 2, 0, TAU);
  c.fillStyle = lg(c, 0, 102, 0, 118, [[0, '#e8fbff'], [0.5, '#5ad2ff'], [1, '#0a72d0']]);
  c.fill();
  drawGlow(c, 0, 110, 30, '#5ad2ff', 0.45 + 0.2 * pulse + f.hot * 0.5);
  shine(c, -17, 88, 6, 18, 0.7);
  // short stubby barrel with a round emitter
  rr(c, -9, 34, 18, 48, 6);
  c.fillStyle = cyl(c, -9, 9, SILVER);
  c.fill();
  ink(c, '#2a323c');
  for (const y of [46, 62]) {
    rr(c, -11, y, 22, 5, 2);
    c.fillStyle = '#3a4652';
    c.fill();
  }
  c.beginPath();
  c.arc(0, 26, 14, 0, TAU);
  c.fillStyle = lg(c, -14, 12, 14, 40, [[0, '#ffffff'], [0.6, '#b8c4d0'], [1, '#5a6672']]);
  c.fill();
  ink(c, '#2a323c', 1.4);
  c.beginPath();
  c.arc(0, 24, 7, 0, TAU);
  c.fillStyle = lg(c, 0, 17, 0, 31, [[0, '#e8fbff'], [1, '#2a9cf0']]);
  c.fill();
  drawGlow(c, 0, 20, 22 + f.hot * 60, '#8ae4ff', 0.5 + f.hot * 0.5);
  // little antenna feelers (it is a cricket!)
  for (const s of [-1, 1]) {
    c.beginPath();
    c.moveTo(s * 10, 18);
    c.quadraticCurveTo(s * 22, -4 + Math.sin(t * 7 + s) * 3, s * 16, -14);
    c.lineWidth = 1.8;
    c.strokeStyle = '#8a96a2';
    c.stroke();
    c.beginPath();
    c.arc(s * 16, -14, 2.4, 0, TAU);
    c.fillStyle = '#7ad8ff';
    c.fill();
  }
  c.restore();
}

/* ------------------------------------------------------------- CRYO BLASTER */
function cryo(c: C, f: Fire, t: number) {
  const pulse = 0.5 + 0.5 * Math.sin(t * 3);
  const frost: Stops = [[0, '#7aa8c4'], [0.4, '#f4fbff'], [0.6, '#e2f2fc'], [1, '#6c98b4']];
  c.save();
  c.translate(0, f.kick * 7);
  grip(c, 160, [[0, '#123048'], [0.5, '#3a7aa8'], [1, '#0c243a']], '#06121e', '#bff3ff', 62);
  // body
  rr(c, -20, 98, 40, 70, 13);
  c.fillStyle = cyl(c, -20, 20, frost);
  c.fill();
  ink(c, '#2a5a78', 1.5);
  // coolant tank (side, glass)
  rr(c, 18, 100, 18, 58, 8);
  c.fillStyle = 'rgba(180,230,255,0.25)';
  c.fill();
  c.save();
  rr(c, 18, 100, 18, 58, 8);
  c.clip();
  const lvl = 0.7 + 0.06 * Math.sin(t * 2) - f.hot * 0.15;
  c.fillStyle = lg(c, 0, 100, 0, 158, [[0, '#d8f6ff'], [1, '#2a9cf0']]);
  c.fillRect(18, 100 + 58 * (1 - lvl), 18, 58);
  for (let i = 0; i < 4; i++) {
    const ph = (t * 0.7 + i * 0.25) % 1;
    c.beginPath();
    c.arc(24 + (i % 2) * 6, 156 - ph * 40, 1.6, 0, TAU);
    c.fillStyle = 'rgba(255,255,255,0.8)';
    c.fill();
  }
  c.restore();
  rr(c, 18, 100, 18, 58, 8);
  ink(c, '#2a5a78', 1.3);
  // gauge
  c.beginPath();
  c.arc(-6, 134, 9, 0, TAU);
  c.fillStyle = '#f8fdff';
  c.fill();
  ink(c, '#2a5a78', 1.3);
  c.beginPath();
  c.moveTo(-6, 134);
  c.lineTo(-6 + Math.cos(-2.2 + lvl * 2.2) * 7, 134 + Math.sin(-2.2 + lvl * 2.2) * 7);
  c.strokeStyle = '#1a6ad0';
  c.lineWidth = 1.6;
  c.stroke();
  // barrel with frost rings
  rr(c, -10, 24, 20, 78, 6);
  c.fillStyle = cyl(c, -10, 10, frost);
  c.fill();
  ink(c, '#2a5a78');
  for (const y of [36, 58, 80]) {
    rr(c, -13, y, 26, 7, 3);
    c.fillStyle = cyl(c, -13, 13, [[0, '#1a5a90'], [0.5, '#5ad2ff'], [1, '#1a5a90']]);
    c.fill();
    ink(c, '#0c2a48', 0.9);
  }
  // icicle spikes along the body
  for (const s of [-1, 1]) {
    for (const [y, l] of [[108, 14], [124, 10]]) {
      poly(c, [s * 19, y, s * (19 + l), y + 4, s * 19, y + 8]);
      c.fillStyle = 'rgba(220,245,255,0.95)';
      c.fill();
      ink(c, '#5aa8d8', 0.8);
    }
  }
  // snowflake crystal emitter
  drawGlow(c, 0, 14, 30 + f.hot * 50, '#bff3ff', 0.5 + 0.2 * pulse + f.hot * 0.5);
  c.save();
  c.translate(0, 14);
  c.rotate(t * 0.6 + f.hot * 2);
  c.strokeStyle = '#ffffff';
  c.lineWidth = 2.6;
  c.lineCap = 'round';
  for (let i = 0; i < 6; i++) {
    c.rotate(TAU / 6);
    c.beginPath();
    c.moveTo(0, 0);
    c.lineTo(0, -13);
    c.moveTo(0, -8);
    c.lineTo(4, -11);
    c.moveTo(0, -8);
    c.lineTo(-4, -11);
    c.stroke();
  }
  c.restore();
  c.beginPath();
  c.arc(0, 14, 4, 0, TAU);
  c.fillStyle = '#e8fbff';
  c.fill();
  sparkle(c, 12, 4, 3.5, '#ffffff', 0.5 + 0.5 * Math.sin(t * 4));
  c.restore();
}

/* ---------------------------------------------------------- GAUNTLET CANNON */
function gauntlet(c: C, f: Fire, t: number) {
  const red: Stops = [[0, '#4a0006'], [0.4, '#c81a22'], [0.55, '#ff4a4a'], [1, '#3a0004']];
  const pulse = 0.5 + 0.5 * Math.sin(t * 4);
  c.save();
  c.translate(0, f.kick * 8);
  // forearm segments
  rr(c, -20, 140, 40, 100, 14);
  c.fillStyle = cyl(c, -20, 20, red);
  c.fill();
  ink(c, '#1a0002', 1.6);
  for (const y of [156, 186, 216]) {
    rr(c, -21, y, 42, 9, 3);
    c.fillStyle = cyl(c, -21, 21, GOLD);
    c.fill();
    ink(c, '#5a3a00', 1);
  }
  // forearm repulsor slits
  for (const y of [168, 198]) {
    rr(c, -8, y, 16, 6, 2);
    c.fillStyle = '#082030';
    c.fill();
    rr(c, -6, y + 1.5, 12, 3, 1);
    c.fillStyle = `rgba(150,230,255,${0.6 + 0.3 * pulse})`;
    c.fill();
  }
  // wrist ring
  rr(c, -24, 124, 48, 18, 7);
  c.fillStyle = cyl(c, -24, 24, GOLD);
  c.fill();
  ink(c, '#5a3a00', 1.4);
  // back of the hand
  c.beginPath();
  c.moveTo(-26, 126);
  c.bezierCurveTo(-30, 96, -26, 70, -18, 58);
  c.lineTo(18, 58);
  c.bezierCurveTo(26, 70, 30, 96, 26, 126);
  c.closePath();
  c.fillStyle = cyl(c, -28, 28, red);
  c.fill();
  ink(c, '#1a0002', 1.6);
  // gold knuckle plates
  for (let i = 0; i < 4; i++) {
    const x = -18 + i * 12;
    rr(c, x - 5, 50, 11, 16, 4);
    c.fillStyle = cyl(c, x - 5, x + 6, GOLD);
    c.fill();
    ink(c, '#5a3a00', 1);
  }
  // thumb plate
  poly(c, [-26, 108, -36, 92, -32, 78, -24, 86]);
  c.fillStyle = cyl(c, -36, -24, red);
  c.fill();
  ink(c, '#1a0002', 1.3);
  // palm repulsor (the shot leaves from here, at the top)
  rr(c, -16, 20, 32, 34, 12);
  c.fillStyle = cyl(c, -16, 16, GOLD);
  c.fill();
  ink(c, '#5a3a00', 1.4);
  c.beginPath();
  c.arc(0, 28, 15, 0, TAU);
  c.fillStyle = '#1a0a04';
  c.fill();
  ink(c, '#5a3a00', 1.4);
  const r = 10 + pulse * 1.2 + f.hot * 3;
  drawGlow(c, 0, 26, 40 + f.hot * 70, '#9ae8ff', 0.55 + 0.2 * pulse + f.hot * 0.45);
  c.beginPath();
  c.arc(0, 28, r, 0, TAU);
  c.fillStyle = lg(c, 0, 28 - r, 0, 28 + r, [[0, '#ffffff'], [0.5, '#9ae8ff'], [1, '#2a8ad8']]);
  c.fill();
  c.strokeStyle = 'rgba(255,255,255,0.75)';
  c.lineWidth = 1.2;
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * TAU + t * 0.8;
    c.beginPath();
    c.moveTo(Math.cos(a) * 4, 28 + Math.sin(a) * 4);
    c.lineTo(Math.cos(a) * (r - 1), 28 + Math.sin(a) * (r - 1));
    c.stroke();
  }
  if (f.hot > 0.02) {
    c.strokeStyle = `rgba(200,245,255,${f.hot})`;
    c.lineWidth = 3;
    c.beginPath();
    c.arc(0, 26, 18 + (1 - f.hot) * 26, 0, TAU);
    c.stroke();
  }
  c.restore();
}

/* --------------------------------------------------------------- AIR CANNON */
function airCannon(c: C, f: Fire, t: number) {
  const body: Stops = [[0, '#5a7a96'], [0.35, '#d8e8f6'], [0.55, '#ffffff'], [1, '#6a8aa6']];
  const blue: Stops = [[0, '#0a3a78'], [0.5, '#2a8ae8'], [1, '#08306a']];
  const puff = f.ft < 0.3 ? 1 - f.ft / 0.3 : 0;
  c.save();
  c.translate(0, f.kick * 8);
  // arm strap / handle block at the bottom
  grip(c, 196, blue, '#04203a', '#ffd23a', 52);
  // main cylinder
  rr(c, -28, 30, 56, 172, 22);
  c.fillStyle = cyl(c, -28, 28, body);
  c.fill();
  ink(c, '#2a4a66', 1.6);
  // blue bands
  for (const y of [70, 150]) {
    rr(c, -29, y, 58, 12, 4);
    c.fillStyle = cyl(c, -29, 29, blue);
    c.fill();
    ink(c, '#04203a', 1);
  }
  // vents
  for (let i = 0; i < 4; i++) {
    rr(c, -14 + i * 8, 96, 4, 40, 2);
    c.fillStyle = '#3a5a76';
    c.fill();
  }
  // pressure gauge
  c.beginPath();
  c.arc(14, 174, 9, 0, TAU);
  c.fillStyle = '#ffffff';
  c.fill();
  ink(c, '#2a4a66', 1.2);
  c.beginPath();
  c.moveTo(14, 174);
  const p = 1 - puff * 0.8;
  c.lineTo(14 + Math.cos(-2.4 + p * 2.6) * 7, 174 + Math.sin(-2.4 + p * 2.6) * 7);
  c.strokeStyle = '#e8283c';
  c.lineWidth = 1.6;
  c.stroke();
  // flared mouth (seen from behind: a wide lip ring at the top)
  poly(c, [-28, 44, 28, 44, 34, 12, -34, 12]);
  c.fillStyle = cyl(c, -34, 34, body);
  c.fill();
  ink(c, '#2a4a66', 1.5);
  c.beginPath();
  c.ellipse(0, 12, 34, 9, 0, 0, TAU);
  c.fillStyle = cyl(c, -34, 34, blue);
  c.fill();
  ink(c, '#04203a', 1.4);
  c.beginPath();
  c.ellipse(0, 12, 26, 6, 0, 0, TAU);
  c.fillStyle = '#0a1a2a';
  c.fill();
  // air swirl inside the mouth
  c.save();
  c.beginPath();
  c.ellipse(0, 12, 26, 6, 0, 0, TAU);
  c.clip();
  c.strokeStyle = `rgba(200,240,255,${0.35 + puff * 0.5})`;
  c.lineWidth = 1.6;
  for (let i = 0; i < 3; i++) {
    c.beginPath();
    c.ellipse(0, 12, 8 + i * 6, 2 + i * 1.3, t * 2 + i, 0, Math.PI * 1.3);
    c.stroke();
  }
  c.restore();
  if (puff > 0.02) {
    for (let i = 0; i < 3; i++) {
      c.beginPath();
      c.ellipse(0, 8 - (1 - puff) * 30 - i * 10, 20 + (1 - puff) * 20 + i * 6, 5 + i * 2, 0, 0, TAU);
      c.strokeStyle = `rgba(220,245,255,${puff * (0.8 - i * 0.2)})`;
      c.lineWidth = 3 - i * 0.7;
      c.stroke();
    }
  }
  shine(c, -20, 40, 6, 150, 0.4);
  c.restore();
}

/* ----------------------------------------------------------- PHASER TYPE-II */
function phaser(c: C, f: Fire, t: number) {
  const grey: Stops = [[0, '#2a2e34'], [0.45, '#7a8088'], [0.6, '#9aa0a8'], [1, '#22262c']];
  const dark: Stops = [[0, '#101214'], [0.5, '#34383e'], [1, '#0c0e10']];
  c.save();
  c.translate(0, f.kick * 6);
  // pistol grip (classic TOS phaser handle, angled)
  poly(c, [-12, 146, 12, 146, 30, 226, 14, 236, -4, 228]);
  c.fillStyle = lg(c, -12, 0, 30, 0, dark);
  c.fill();
  ink(c, '#000', 1.4);
  c.strokeStyle = 'rgba(255,255,255,0.08)';
  c.lineWidth = 1;
  for (let i = 0; i < 6; i++) {
    c.beginPath();
    c.moveTo(-2 + i * 3, 156 + i * 12);
    c.lineTo(16 + i * 2, 156 + i * 12);
    c.stroke();
  }
  // main body
  poly(c, [-14, 70, 14, 70, 18, 150, -18, 150]);
  c.fillStyle = cyl(c, -18, 18, grey);
  c.fill();
  ink(c, '#000', 1.5);
  // type-I hand phaser clipped on top (the classic two-part look)
  rr(c, -11, 100, 22, 40, 6);
  c.fillStyle = cyl(c, -11, 11, dark);
  c.fill();
  ink(c, '#000', 1.2);
  // setting strip
  for (let i = 0; i < 6; i++) {
    const on = i <= 3 + Math.floor(1.5 + 1.5 * Math.sin(t * 2));
    c.beginPath();
    c.arc(0, 106 + i * 5.5, 1.8, 0, TAU);
    c.fillStyle = on ? (i > 3 ? '#ff6a3a' : '#7aff9a') : '#2a3a2e';
    c.fill();
  }
  // dial
  c.beginPath();
  c.arc(0, 82, 7, 0, TAU);
  c.fillStyle = cyl(c, -7, 7, [[0, '#6a5420'], [0.5, '#e8d090'], [1, '#5a4410']]);
  c.fill();
  ink(c, '#2a1e00', 1);
  // emitter head
  poly(c, [-10, 72, 10, 72, 7, 18, -7, 18]);
  c.fillStyle = cyl(c, -10, 10, grey);
  c.fill();
  ink(c, '#000', 1.3);
  rr(c, -6, 6, 12, 14, 3);
  c.fillStyle = cyl(c, -6, 6, dark);
  c.fill();
  ink(c, '#000', 1);
  c.beginPath();
  c.arc(0, 6, 4, 0, TAU);
  c.fillStyle = lg(c, 0, 2, 0, 10, [[0, '#fff1d0'], [1, '#ff7a2a']]);
  c.fill();
  drawGlow(c, 0, 4, 16 + f.hot * 50, '#ff9a4a', 0.45 + f.hot * 0.55);
  shine(c, -12, 76, 3, 66, 0.25);
  c.restore();
}

export function drawRedesign8b(c: C, id: string, sinceShot: number, t: number): boolean {
  const f = fireOf(sinceShot);
  switch (id) {
    case 'laser': laser(c, f, t); return true;
    case 'rpg': rpg(c, f, t); return true;
    case 'cricket': cricket(c, f, t); return true;
    case 'cryo_blaster': cryo(c, f, t); return true;
    case 'gauntlet_cannon': gauntlet(c, f, t); return true;
    case 'dora': airCannon(c, f, t); return true;
    case 'phaser': phaser(c, f, t); return true;
    default: return false;
  }
}
export { star };
