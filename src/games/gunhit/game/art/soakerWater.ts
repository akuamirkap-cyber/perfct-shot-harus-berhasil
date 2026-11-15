import { TAU, drawSprite, glowSprite, lerp } from '../../vendor/game-4/src/game/core';

export const SOAKER_WATER_COLORS = ['#e1faff', '#7dd3fc', '#38bdf8'] as const;

/** The Soaker's rippling water jet, shared with the Shark projectile wake. */
export function drawSoakerWaterStream(c: CanvasRenderingContext2D, x: number, y0: number, y1: number, age: number): void {
  const len = y1 - y0;
  if (len < 2) return;
  const n = Math.max(4, Math.floor(len / 6));
  const point = (i: number, side: number) => {
    const s = i / n;
    const width = lerp(5.6, 2.3, s) * (1 + 0.18 * Math.sin(s * 18 - age * 50));
    return { x: x + Math.sin(s * 7 + age * 30) * 1.1 * s + side * width, y: y0 + s * len };
  };
  c.save();
  c.beginPath();
  const first = point(0, -1);
  c.moveTo(first.x, first.y);
  for (let i = 1; i <= n; i++) { const p = point(i, -1); c.lineTo(p.x, p.y); }
  for (let i = n; i >= 0; i--) { const p = point(i, 1); c.lineTo(p.x, p.y); }
  c.closePath();
  const water = c.createLinearGradient(x - 6, 0, x + 6, 0);
  water.addColorStop(0, 'rgba(60,150,255,0.55)');
  water.addColorStop(0.35, 'rgba(215,247,255,0.92)');
  water.addColorStop(0.6, 'rgba(120,200,255,0.75)');
  water.addColorStop(1, 'rgba(40,120,230,0.6)');
  c.fillStyle = water;
  c.fill();
  c.beginPath();
  c.strokeStyle = 'rgba(255,255,255,0.75)';
  c.lineWidth = 1;
  c.moveTo(x - 2, y0 + 4);
  c.lineTo(x - 1.2, y0 + len * 0.75);
  c.stroke();
  const head = c.createRadialGradient(x - 1.5, y0 + 1, 0.5, x, y0 + 3, 6.5);
  head.addColorStop(0, 'rgba(255,255,255,0.98)');
  head.addColorStop(0.45, 'rgba(160,220,255,0.85)');
  head.addColorStop(1, 'rgba(40,120,230,0.7)');
  c.fillStyle = head;
  c.beginPath(); c.arc(x, y0 + 3, 6.3, 0, TAU); c.fill();
  c.globalCompositeOperation = 'lighter';
  drawSprite(c, glowSprite('120,200,255'), x, y0 + 4, 34, 0.35);
  c.restore();
}