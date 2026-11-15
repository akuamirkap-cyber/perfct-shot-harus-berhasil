import { bossDef } from './bossCatalog';
import { BOSS_EYE_BOXES } from './bossExpressions';
import type { HeadKind } from '../../perfect-shot/play/HeadArt';

/**
 * EKSPRESI WAJAH BOS — digambar di atas kepala, bukan menggantikannya.
 *
 * Sebelumnya bos cuma punya satu tawa (mata ^ ^ dari raster "laugh") dan MARAH
 * tidak punya wajah sama sekali — badannya bergetar, tapi mukanya tetap senyum
 * menunggu pemain. NGAMUK cuma menggelapkan aura.
 *
 * Modul ini menambahkan lapisan prosedural di atas kepala yang sama untuk
 * kesebelas bos, tapi tiap kepala sekarang punya karakter sendiri:
 *
 *   • MARAH: alis menukik + mata menyala menyipit untuk semua, lalu per kepala:
 *     - pirate: mata satu menyala + bekas luka berkedut
 *     - jester: hidung badut membesar + pipi ungu
 *     - dragon: asap dari lubang hidung + tanduk magma
 *     - skeleton: rongga hijau neraka + rahang bergetar
 *     - tiki: retakan kayu menyala
 *     - viking: helm bergetar
 *     - oni: tanduk menyala
 *     - robot: visor sapuan merah + percikan listrik
 *     - alien: mata menghitam hipnotis
 *     - vampire: taring memanjang
 *     - sun: lidah api menjulur + korona
 *   • TAWA: mata ^ ^ + air mata + pipi merona + rahang, plus hiasan khas.
 *   • RAGE: uap + denyut yang menguat.
 *
 * Koordinat -100..100 dipetakan ke `radius`, sama persis dengan
 * `drawBossLaughEyes`.
 */

type EyeBox = readonly [x: number, y: number, width: number, height: number];
type Ctx = CanvasRenderingContext2D;

const clamp01 = (v: number) => (Number.isFinite(v) ? (v < 0 ? 0 : v > 1 ? 1 : v) : 0);
const sideOf = (box: EyeBox) => {
  const cx = box[0] + box[2] / 2;
  return cx < -6 ? -1 : cx > 6 ? 1 : 0;
};
const isSingle = (head: HeadKind) => BOSS_EYE_BOXES[head].length === 1;

function angryBrow(c: Ctx, box: EyeBox, accent: string, k: number, head: HeadKind) {
  const [x, y, w, h] = box;
  const side = sideOf(box);
  const thick = Math.max(3.2, h * 0.3) * k;
  const extra = (head === 'oni' || head === 'skeleton') ? 1.25 : 1;
  const outerX = side <= 0 ? x - w * 0.1 : x + w * 1.1;
  const innerX = side <= 0 ? x + w * 1.1 : x - w * 0.1;
  const outerY = y - h * 0.22;
  const innerY = y + h * (0.3 + (head === 'oni' ? 0.12 : 0));
  c.beginPath();
  c.moveTo(outerX, outerY - thick * extra);
  c.lineTo(innerX, innerY - thick * 0.82 * extra);
  c.lineTo(innerX, innerY + thick * 0.3 * extra);
  c.lineTo(outerX, outerY + thick * 0.42 * extra);
  c.closePath();
  const g = c.createLinearGradient(outerX, outerY, innerX, innerY);
  if (head === 'vampire') { g.addColorStop(0, '#4a1020'); g.addColorStop(1, '#1a0407'); }
  else if (head === 'dragon') { g.addColorStop(0, '#7c2d12'); g.addColorStop(1, '#1a0407'); }
  else if (head === 'robot') { g.addColorStop(0, '#334155'); g.addColorStop(1, '#0f172a'); }
  else { g.addColorStop(0, accent); g.addColorStop(1, '#1a0407'); }
  c.fillStyle = g; c.fill();
  c.strokeStyle = 'rgba(10,2,4,.75)'; c.lineWidth = Math.max(0.8, thick * 0.16); c.stroke();
}

function angryEye(c: Ctx, box: EyeBox, k: number, time: number, seed: number, head: HeadKind) {
  const [x, y, w, h] = box;
  const cx = x + w / 2, cy = y + h * 0.55;
  const flick = 0.72 + 0.28 * Math.sin(time * 19 + seed * 2.4);
  const rx = w * 0.42 * k, ry = Math.max(1.1, h * 0.15 * k * flick);
  c.save(); c.globalCompositeOperation = 'lighter';
  const col = head === 'skeleton' ? '38,255,120' : head === 'robot' ? '220,38,38' : head === 'alien' ? '20,20,40' : '255,96,64';
  const halo = c.createRadialGradient(cx, cy, 0, cx, cy, rx * 2.1);
  halo.addColorStop(0, `rgba(${col},${(0.5 * k * flick).toFixed(3)})`);
  halo.addColorStop(0.45, `rgba(${col},${(0.2 * k * flick).toFixed(3)})`);
  halo.addColorStop(1, 'rgba(0,0,0,0)');
  c.fillStyle = halo; c.beginPath(); c.ellipse(cx, cy, rx * 2.1, ry * 3.2, 0, 0, Math.PI * 2); c.fill();
  if (head === 'alien') {
    c.fillStyle = `rgba(5,5,12,${(0.85 * k).toFixed(3)})`;
    c.beginPath(); c.ellipse(cx, cy, rx * 0.9, ry * 1.6, 0, 0, Math.PI * 2); c.fill();
  } else if (head === 'skeleton') {
    c.fillStyle = `rgba(20,255,90,${(0.7 * k).toFixed(3)})`;
    c.beginPath(); c.ellipse(cx, cy, rx * 0.7, ry * 1.2, 0, 0, Math.PI * 2); c.fill();
  } else {
    c.fillStyle = `rgba(255,232,214,${(0.92 * k * flick).toFixed(3)})`;
    c.beginPath(); c.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2); c.fill();
  }
  c.restore();
}

function templeVein(c: Ctx, box: EyeBox, k: number, time: number) {
  const side = sideOf(box);
  const x = box[0] + (side <= 0 ? box[2] * 0.16 : box[2] * 0.84);
  const y = box[1] - box[3] * 0.42;
  const r = Math.max(2.4, box[3] * 0.17) * k;
  const throb = 0.7 + 0.3 * Math.sin(time * 11);
  c.save(); c.globalAlpha = clamp01(k) * throb;
  c.strokeStyle = '#ff6b6b'; c.lineWidth = Math.max(1, r * 0.42); c.lineCap = 'round';
  c.beginPath();
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + 0.5;
    c.moveTo(x + Math.cos(a) * r * 0.32, y + Math.sin(a) * r * 0.32);
    c.quadraticCurveTo(x + Math.cos(a) * r * 0.9, y + Math.sin(a) * r * 0.6, x + Math.cos(a) * r * 1.25, y + Math.sin(a) * r * 1.15);
  }
  c.stroke(); c.restore();
}

function rageSteam(c: Ctx, radius: number, time: number, accent: string, head: HeadKind) {
  c.save(); c.globalCompositeOperation = 'lighter';
  const count = head === 'sun' ? 5 : head === 'dragon' ? 2 : 3;
  for (let i = 0; i < count; i++) {
    const p = ((time * 0.55 + i / count) % 1);
    const spread = head === 'sun' ? 0.45 : 0.4;
    const x = (i - (count - 1) / 2) * radius * spread + Math.sin(time * 2.2 + i) * radius * 0.06;
    const y = -radius * (head === 'sun' ? 0.82 : 0.92) - p * radius * 0.5;
    const r = radius * (0.05 + p * 0.11);
    c.globalAlpha = (1 - p) * 0.4;
    if (head === 'sun') c.fillStyle = `rgba(255,180,60,${(0.4 * (1 - p)).toFixed(3)})`;
    else if (head === 'dragon') c.fillStyle = i === 0 ? '#ff6b35' : '#ff4500';
    else c.fillStyle = i === 1 ? '#ff8f6b' : accent;
    c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill();
  }
  c.restore();
}

function pirateRageDeco(c: Ctx, k: number, time: number) {
  const pulse = 0.5 + 0.5 * Math.sin(time * 8);
  c.save(); c.globalAlpha = k * (0.3 + 0.4 * pulse);
  c.strokeStyle = '#ff3344'; c.lineWidth = 1.8; c.lineCap = 'round';
  c.beginPath(); c.moveTo(-28, 12); c.quadraticCurveTo(-18, 8, -8, 12); c.moveTo(-26, 16); c.quadraticCurveTo(-18, 13, -10, 16); c.stroke(); c.restore();
}
function jesterAngryDeco(c: Ctx, k: number, time: number) {
  const jig = Math.sin(time * 18) * 1.5 * k;
  c.save(); c.globalAlpha = k * 0.7;
  c.fillStyle = '#ef4444'; c.beginPath(); c.arc(jig, 28, 5 + k * 3, 0, Math.PI * 2); c.fill();
  c.strokeStyle = 'rgba(255,255,255,.6)'; c.lineWidth = 1; c.stroke(); c.restore();
}
function dragonAngryDeco(c: Ctx, k: number, time: number) {
  c.save(); c.globalCompositeOperation = 'lighter'; c.globalAlpha = k * 0.5;
  for (let i = 0; i < 2; i++) {
    const p = ((time * 0.7 + i * 0.5) % 1);
    const x = (i ? 14 : -14) + Math.sin(time * 3 + i) * 2, y = 18 - p * 18;
    const r = 2 + p * 6;
    c.globalAlpha = k * (1 - p) * 0.5;
    c.fillStyle = '#ff6b35'; c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill();
  }
  c.restore();
}
function tikiAngryDeco(c: Ctx, k: number, time: number) {
  c.save(); c.globalAlpha = k * (0.5 + 0.5 * Math.sin(time * 6));
  c.strokeStyle = '#f59e0b'; c.lineWidth = 1.4; c.lineCap = 'round';
  c.beginPath(); c.moveTo(-35, -4); c.lineTo(-30, 6); c.lineTo(-34, 16); c.stroke();
  c.beginPath(); c.moveTo(35, -4); c.lineTo(30, 6); c.lineTo(34, 16); c.stroke();
  c.restore();
}
function vikingAngryDeco(c: Ctx, k: number) {
  const shake = Math.sin(Date.now() * 0.022) * 1.2 * k;
  c.save(); c.globalAlpha = k * 0.35;
  c.strokeStyle = '#94a3b8'; c.lineWidth = 1.2;
  c.beginPath(); c.moveTo(-38 + shake, -18); c.lineTo(-34 + shake, -28); c.stroke();
  c.beginPath(); c.moveTo(38 + shake, -18); c.lineTo(34 + shake, -28); c.stroke();
  c.restore();
}
function oniAngryDeco(c: Ctx, k: number) {
  c.save(); c.globalCompositeOperation = 'lighter'; c.globalAlpha = k * 0.6;
  for (const x of [-32, 32]) {
    const g = c.createRadialGradient(x, -42, 0, x, -42, 10);
    g.addColorStop(0, 'rgba(255,60,20,.9)'); g.addColorStop(1, 'rgba(255,60,20,0)');
    c.fillStyle = g; c.beginPath(); c.arc(x, -42, 10, 0, Math.PI * 2); c.fill();
  }
  c.restore();
}
function robotAngryDeco(c: Ctx, k: number, time: number) {
  c.save(); c.globalAlpha = k;
  c.strokeStyle = '#38bdf8'; c.lineWidth = 1.3; c.lineCap = 'round';
  for (let i = 0; i < 3; i++) {
    const x = (i - 1) * 46, y = -24;
    c.beginPath(); c.moveTo(x, y);
    c.lineTo(x + Math.sin(time * 14 + i) * 4, y - 6);
    c.lineTo(x + Math.cos(time * 10 + i) * 3, y - 12);
    c.stroke();
  }
  c.restore();
}
function alienAngryDeco(c: Ctx, k: number) {
  c.save(); c.globalAlpha = k * 0.25;
  c.strokeStyle = '#000'; c.lineWidth = 1;
  c.beginPath(); c.arc(0, 0, 18, 0, Math.PI * 2); c.stroke(); c.restore();
}
function vampireAngryDeco(c: Ctx, k: number) {
  c.save(); c.globalAlpha = k;
  c.fillStyle = '#fef2f2'; c.strokeStyle = 'rgba(0,0,0,.4)'; c.lineWidth = 0.8;
  for (const x of [-10, 10]) {
    c.beginPath(); c.moveTo(x - 3, 38); c.lineTo(x + 3, 38); c.lineTo(x, 48); c.closePath(); c.fill(); c.stroke();
  }
  c.restore();
}
function sunAngryDeco(c: Ctx, k: number, time: number) {
  c.save(); c.globalCompositeOperation = 'lighter'; c.globalAlpha = k * 0.7;
  const wag = Math.sin(time * 7) * 4;
  c.fillStyle = '#f59e0b'; c.beginPath();
  c.moveTo(wag - 4, 52); c.quadraticCurveTo(wag + 6, 62, wag, 72);
  c.quadraticCurveTo(wag - 6, 62, wag - 4, 52); c.closePath(); c.fill();
  c.fillStyle = '#fef3c7'; c.beginPath();
  c.moveTo(wag - 2, 54); c.quadraticCurveTo(wag + 3, 61, wag, 68); c.quadraticCurveTo(wag - 3, 61, wag - 2, 54); c.closePath(); c.fill();
  c.restore();
}

const ANGRY_EXTRAS: Partial<Record<HeadKind, (c: Ctx, k: number, t: number) => void>> = {
  pirate: pirateRageDeco, jester: jesterAngryDeco, dragon: dragonAngryDeco,
  tiki: tikiAngryDeco, viking: vikingAngryDeco,
  oni: oniAngryDeco, robot: robotAngryDeco, alien: alienAngryDeco,
  vampire: vampireAngryDeco, sun: sunAngryDeco,
};

export function drawBossAngryFace(
  ctx: Ctx, head: HeadKind, radius: number, intensity: number, time: number, rage = false,
): void {
  const k = clamp01(intensity);
  if (k <= 0.01 || radius <= 0) return;
  const boxes = BOSS_EYE_BOXES[head];
  const accent = bossDef(head).accent;
  const s = radius / 100;
  ctx.save(); ctx.scale(s, s); ctx.globalAlpha *= k;
  boxes.forEach((box, i) => {
    angryBrow(ctx, box, accent, k, head);
    angryEye(ctx, box, k, time, i, head);
    if (rage || head === 'oni' || head === 'viking' || head === 'dragon' || head === 'skeleton' || (isSingle(head) && i === 0)) {
      templeVein(ctx, box, k, time);
    }
  });
  if (isSingle(head) && boxes[0][2] > radius / s * 0.6) {
    const [x, y, w, h] = boxes[0];
    const sweep = ((time * 0.9) % 1) * w;
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
    const g = ctx.createLinearGradient(x + sweep - w * 0.2, 0, x + sweep + w * 0.2, 0);
    g.addColorStop(0, 'rgba(255,60,60,0)'); g.addColorStop(0.5, `rgba(255,80,80,${(0.5 * k).toFixed(3)})`); g.addColorStop(1, 'rgba(255,60,60,0)');
    ctx.fillStyle = g; ctx.fillRect(x, y, w, h); ctx.restore();
  }
  const extra = ANGRY_EXTRAS[head];
  if (extra) extra(ctx, k, time);
  ctx.restore();
  if (rage) rageSteam(ctx, radius, time, accent, head);
}

export function drawBossLaughExtras(
  ctx: Ctx, head: HeadKind, radius: number, intensity: number, time: number,
): void {
  const k = clamp01(intensity);
  if (k <= 0.01 || radius <= 0) return;
  const boxes = BOSS_EYE_BOXES[head];
  const s = radius / 100;
  ctx.save(); ctx.scale(s, s); ctx.globalAlpha *= k;

  boxes.forEach((box, i) => {
    const [x, y, w, h] = box;
    const side = sideOf(box);
    const chX = x + (side <= 0 ? w * 0.24 : w * 0.76);
    const chY = y + h * 1.12;
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha *= 0.42;
    const col = head === 'jester' ? '255,100,180' : head === 'vampire' ? '200,100,140' : '255,120,140';
    const blush = ctx.createRadialGradient(chX, chY, 0, chX, chY, w * 0.5);
    blush.addColorStop(0, `rgba(${col},.85)`); blush.addColorStop(1, `rgba(${col},0)`);
    ctx.fillStyle = blush; ctx.beginPath(); ctx.ellipse(chX, chY, w * 0.5, h * 0.3, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();

    const tearP = (time * 1.5 + i * 0.37) % 1;
    const tx = x + (side <= 0 ? -w * 0.06 : w * 1.06);
    const ty = y + h * 0.72 + tearP * h * 1.5;
    const tr = Math.max(1.4, h * 0.11) * (0.6 + tearP * 0.7);
    ctx.save(); ctx.globalAlpha *= (1 - tearP) * 0.95;
    const tg = ctx.createLinearGradient(tx, ty - tr, tx, ty + tr * 1.6);
    tg.addColorStop(0, 'rgba(226,246,255,.98)'); tg.addColorStop(1, 'rgba(120,200,255,.75)');
    ctx.fillStyle = tg; ctx.beginPath();
    ctx.moveTo(tx, ty - tr * 1.7); ctx.quadraticCurveTo(tx + tr, ty, tx, ty + tr * 1.25); ctx.quadraticCurveTo(tx - tr, ty, tx, ty - tr * 1.7);
    ctx.fill(); ctx.restore();
  });

  if (head === 'jester') {
    const jig = Math.sin(time * 12) * 1.8 * k;
    ctx.save(); ctx.globalAlpha = k * 0.8;
    ctx.fillStyle = '#f43f5e'; ctx.beginPath(); ctx.arc(jig, 32, 6, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.7)'; ctx.lineWidth = 1.2; ctx.stroke(); ctx.restore();
  } else if (head === 'dragon') {
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = k * 0.4;
    for (let i = 0; i < 2; i++) {
      const p = ((time * 1.2 + i * 0.5) % 1);
      const x = (i ? 12 : -12) + Math.sin(time * 4 + i) * 1.5, y = 16 - p * 12;
      ctx.fillStyle = 'rgba(255,200,120,.9)'; ctx.beginPath(); ctx.arc(x, y, 2 + p * 3, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  }

  const shake = Math.sin(time * 26) * 0.6;
  ctx.save(); ctx.globalAlpha *= 0.5; ctx.strokeStyle = 'rgba(255,255,255,.75)'; ctx.lineWidth = 1.6; ctx.lineCap = 'round';
  for (let i = -1; i <= 1; i++) {
    const yy = 62 + Math.abs(i) * 7 + shake, xx = i * 30;
    ctx.beginPath(); ctx.moveTo(xx - 6, yy); ctx.lineTo(xx + 6, yy - 3); ctx.stroke();
  }
  ctx.restore();
  ctx.restore();
}
