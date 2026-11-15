// @ts-nocheck
import { type Ctx, TAU, clamp, drawSprite, easeOutCubic, glowSprite, mulberry32, rand, starSprite } from './core';
import type { FX } from './particles';
import { drawTrefoil } from './shapes7';
import { drawHolyCrackGlow, drawHolyLightFall } from '@/games/gunhit/game/art/holyLight';

abstract class Timed implements FX {
  done = false;
  age = 0;
  constructor(public life: number) {}
  update(dt: number) {
    this.age += dt;
    if (this.age >= this.life) this.done = true;
  }
  abstract draw(ctx: Ctx): void;
}

/** heavenly column of light dropping onto a point */
export class HolyPillar extends Timed {
  constructor(public x: number, public y0: number, public y1: number, life = 0.7) {
    super(life);
  }
  draw(ctx: Ctx) {
    const t = this.age / this.life;
    const grow = Math.min(1, t * 6 + 0.14);
    const a = t < 0.25 ? 1 : 1 - (t - 0.25) / 0.75;
    const tipY = this.y0 + (this.y1 - this.y0) * grow;
    // The descending column of white light from the old hit, with the light
    // arrow as its head instead of the retired round orb.
    drawHolyLightFall(ctx, this.x, tipY, this.y0, a, t * 3);
  }
}

/** White light splinters thrown out at the exact frame the arrow sticks. */
export class HolySparkBurst extends Timed {
  parts: { a: number; len: number; width: number; delay: number }[] = [];
  constructor(public x: number, public y: number, life = 0.62, public n = 26) {
    super(life);
    for (let i = 0; i < n; i++) {
      this.parts.push({
        a: (i / n) * TAU + rand(-0.12, 0.12),
        len: rand(18, 62),
        width: rand(0.8, 2.1),
        delay: rand(0, 0.18),
      });
    }
  }
  draw(ctx: Ctx) {
    const t = this.age / this.life;
    const fade = 1 - t;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.translate(this.x, this.y);
    ctx.lineCap = 'round';
    ctx.shadowColor = '#ffe8a8';
    for (const p of this.parts) {
      const k = clamp((t - p.delay) / (1 - p.delay), 0, 1);
      const d = p.len * k;
      const a = fade * (1 - k * 0.35);
      if (a <= 0) continue;
      const dx = Math.cos(p.a) * d;
      const dy = Math.sin(p.a) * d + k * k * 14;
      ctx.shadowBlur = 8 * a;
      ctx.strokeStyle = `rgba(255,226,140,${a * 0.85})`;
      ctx.lineWidth = p.width * 2.2;
      ctx.beginPath(); ctx.moveTo(dx * 0.35, dy * 0.35); ctx.lineTo(dx, dy); ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = `rgba(255,255,255,${a})`;
      ctx.lineWidth = p.width * 0.7;
      ctx.stroke();
    }
    ctx.restore();
  }
}

/** Glowing cracks around the stuck arrow, pulsing for a beat after impact. */
export class HolyCrackPulse extends Timed {
  constructor(public x: number, public y: number, life = 1.15) {
    super(life);
  }
  draw(ctx: Ctx) {
    const t = this.age / this.life;
    ctx.save();
    ctx.translate(this.x, this.y);
    drawHolyCrackGlow(ctx, t * 20, (1 - t) * 0.9, 1.15);
    ctx.restore();
  }
}

/** flat golden ring(s) expanding outward */
export class HaloRing extends Timed {
  constructor(public x: number, public y: number, life = 0.5, public size = 1) {
    super(life);
  }
  draw(ctx: Ctx) {
    const t = this.age / this.life;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (let k = 0; k < 3; k++) {
      const tk = clamp(t * 1.3 - k * 0.12, 0, 1);
      if (tk <= 0 || tk >= 1) continue;
      const e = easeOutCubic(tk);
      const rx = (14 + 100 * e) * this.size;
      const a = 1 - tk;
      ctx.strokeStyle = `rgba(255,${220 + k * 10},${130 + k * 40},${0.9 * a})`;
      ctx.lineWidth = 5 - k * 1.2;
      ctx.beginPath();
      ctx.ellipse(this.x, this.y, rx, rx * 0.3, 0, 0, TAU);
      ctx.stroke();
      ctx.strokeStyle = `rgba(255,255,255,${0.7 * a})`;
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }
    drawSprite(ctx, glowSprite('255,225,140'), this.x, this.y, 120 * this.size * (1 - t * 0.5), 0.55 * (1 - t));
    ctx.restore();
  }
}

/** tapered diagonal slash streak */
export class SaberSlash extends Timed {
  constructor(public x: number, public y: number, public ang: number, public len = 130, life = 0.3) {
    super(life);
  }
  draw(ctx: Ctx) {
    const t = this.age / this.life;
    const sweep = easeOutCubic(Math.min(1, t * 3.2));
    const a = t < 0.3 ? 1 : 1 - (t - 0.3) / 0.7;
    const c = Math.cos(this.ang);
    const s = Math.sin(this.ang);
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const draw = (wmax: number, col: string) => {
      ctx.beginPath();
      const N = 18;
      for (let i = 0; i <= N; i++) {
        const u = -1 + (2 * i) / N;
        const along = u * this.len * 0.5 * sweep;
        const w = wmax * (1 - Math.pow(Math.abs(u), 1.5));
        const px = this.x + c * along - s * w * 0.5;
        const py = this.y + s * along + c * w * 0.5;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      for (let i = N; i >= 0; i--) {
        const u = -1 + (2 * i) / N;
        const along = u * this.len * 0.5 * sweep;
        const w = wmax * (1 - Math.pow(Math.abs(u), 1.5));
        ctx.lineTo(this.x + c * along + s * w * 0.5, this.y + s * along - c * w * 0.5);
      }
      ctx.closePath();
      ctx.fillStyle = col;
      ctx.fill();
    };
    draw(26, `rgba(60,190,255,${0.28 * a})`);
    draw(12, `rgba(130,235,255,${0.75 * a})`);
    draw(4.6, `rgba(255,255,255,${a})`);
    drawSprite(ctx, glowSprite('110,220,255'), this.x, this.y, 110 * a + 20, 0.7 * a);
    ctx.restore();
  }
}

/** hyperspace streaks radiating from a point */
export class WarpLines extends Timed {
  ls: { a: number; r0: number; r1: number; w: number; c: string }[] = [];
  constructor(public x: number, public y: number, life = 0.35, public size = 1) {
    super(life);
    const cols = ['255,255,255', '170,205,255', '120,170,255', '220,235,255'];
    for (let i = 0; i < 34; i++) this.ls.push({ a: (i / 34) * TAU + rand(-0.06, 0.06), r0: rand(4, 26), r1: rand(90, 220), w: rand(1, 3.2), c: cols[i % cols.length] });
  }
  draw(ctx: Ctx) {
    const t = this.age / this.life;
    const e = easeOutCubic(Math.min(1, t * 2.2));
    const a = 1 - Math.pow(t, 1.4);
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineCap = 'round';
    drawSprite(ctx, glowSprite('120,170,255'), this.x, this.y, 240 * this.size * a + 40, 0.6 * a);
    drawSprite(ctx, glowSprite('255,255,255'), this.x, this.y, 90 * this.size * a + 10, 0.9 * a);
    for (const l of this.ls) {
      const c = Math.cos(l.a);
      const s = Math.sin(l.a);
      const r1 = l.r1 * e * this.size;
      const r0 = l.r0 + r1 * 0.45 * t;
      const g = ctx.createLinearGradient(this.x + c * r0, this.y + s * r0, this.x + c * r1, this.y + s * r1);
      g.addColorStop(0, `rgba(${l.c},${0.95 * a})`);
      g.addColorStop(1, `rgba(${l.c},0)`);
      ctx.strokeStyle = g;
      ctx.lineWidth = l.w;
      ctx.beginPath();
      ctx.moveTo(this.x + c * r0, this.y + s * r0);
      ctx.lineTo(this.x + c * r1, this.y + s * r1);
      ctx.stroke();
    }
    ctx.restore();
  }
}

/** jittering coloured glitch rectangles + scan lines */
export class GlitchBurst extends Timed {
  constructor(public x: number, public y: number, life = 0.5, public size = 1) {
    super(life);
  }
  draw(ctx: Ctx) {
    const t = this.age / this.life;
    const a = 1 - t;
    const rnd = mulberry32(Math.floor(this.age * 28) * 77 + 5);
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    drawSprite(ctx, glowSprite('170,80,255'), this.x, this.y, 200 * this.size * a + 30, 0.5 * a);
    const cols = ['190,90,255', '90,230,255', '255,90,220', '255,255,255'];
    for (let i = 0; i < 18; i++) {
      const w = (6 + rnd() * 40) * this.size;
      const h = (2 + rnd() * 7) * this.size;
      const px = this.x + (rnd() - 0.5) * 150 * this.size;
      const py = this.y + (rnd() - 0.5) * 110 * this.size;
      ctx.fillStyle = `rgba(${cols[Math.floor(rnd() * 4)]},${(0.35 + rnd() * 0.5) * a})`;
      ctx.fillRect(px, py, w, h);
    }
    ctx.strokeStyle = `rgba(210,150,255,${0.5 * a})`;
    ctx.lineWidth = 1;
    for (let i = 0; i < 6; i++) {
      const yy = this.y + (rnd() - 0.5) * 120 * this.size;
      ctx.beginPath();
      ctx.moveTo(this.x - 80 * this.size, yy);
      ctx.lineTo(this.x + 80 * this.size, yy);
      ctx.stroke();
    }
    ctx.restore();
  }
}

/** pulsing green rings with radiation trefoil at the centre */
export class RadiationPulse extends Timed {
  constructor(public x: number, public y: number, life = 0.75, public size = 1) {
    super(life);
  }
  draw(ctx: Ctx) {
    const t = this.age / this.life;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    drawSprite(ctx, glowSprite('100,255,80'), this.x, this.y, 240 * this.size * (1 - t * 0.4), 0.6 * (1 - t));
    for (let k = 0; k < 3; k++) {
      const tk = clamp(t * 1.4 - k * 0.18, 0, 1);
      if (tk <= 0 || tk >= 1) continue;
      const e = easeOutCubic(tk);
      ctx.strokeStyle = `rgba(150,255,100,${0.9 * (1 - tk)})`;
      ctx.lineWidth = 6 - k * 1.5;
      ctx.beginPath();
      ctx.arc(this.x, this.y, (12 + 120 * e) * this.size, 0, TAU);
      ctx.stroke();
      ctx.strokeStyle = `rgba(230,255,200,${0.8 * (1 - tk)})`;
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }
    ctx.restore();
    const ta = t < 0.15 ? t / 0.15 : Math.max(0, 1 - (t - 0.15) / 0.6);
    if (ta > 0.01) {
      ctx.save();
      ctx.translate(this.x, this.y - 10 - t * 40);
      ctx.rotate(t * 3);
      ctx.globalAlpha = ta * 0.9;
      drawTrefoil(ctx, 26 * this.size * (0.7 + 0.5 * t), '#d8ff7a', '#0c2a08');
      ctx.restore();
    }
  }
}
