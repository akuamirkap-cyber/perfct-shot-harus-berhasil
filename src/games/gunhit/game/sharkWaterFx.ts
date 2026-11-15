import type { FxSink, PKind, Particle } from './fx';
import { drawSoakerWaterStream, SOAKER_WATER_COLORS } from './art/soakerWater';

const TAU = Math.PI * 2;
const random = (min: number, max: number) => min + Math.random() * (max - min);
const WATER_COLORS = SOAKER_WATER_COLORS;

/** Imported shark projectiles have their own base speed, so boost that too. */
export function sharkLayerSpeed(id: string, speed: number): number {
  return id === 'shark' ? speed * 2 : speed;
}

function addParticle(
  sink: FxSink, x: number, y: number, vx: number, vy: number,
  life: number, size: number, color: string, kind: PKind, extra: Partial<Particle> = {},
) {
  sink.push({ x, y, vx, vy, life, max: life, size, color, kind, rot: 0, vr: 0, g: 0, ...extra });
}

/** Pressurized water at the unchanged muzzle, oriented with the firing lane. */
export function spawnSharkWaterLaunch(sink: FxSink, x: number, y: number, tilt = 0): void {
  const direction = -Math.PI / 2 + tilt;
  sink.light(x, y, 115, '150,230,255', 0.2);
  addParticle(sink, x, y, 0, 0, 0.3, 27, '#7dd3fc', 'waterSplash', { extra: direction, unclipped: true });
  addParticle(sink, x, y, 0, 0, 0.24, 46, '158,231,255', 'shock', { unclipped: true });
  for (let i = 0; i < 12; i++) {
    const a = direction + random(-1.05, 1.05);
    const speed = random(130, 360);
    addParticle(sink, x, y, Math.cos(a) * speed, Math.sin(a) * speed,
      random(0.25, 0.48), random(2, 4.5), WATER_COLORS[i % WATER_COLORS.length], 'waterDrop', { g: 720, drag: 1, unclipped: true });
  }
  for (let i = 0; i < 4; i++) {
    const a = direction + random(-1.2, 1.2);
    const speed = random(45, 130);
    addParticle(sink, x, y, Math.cos(a) * speed, Math.sin(a) * speed,
      random(0.32, 0.56), random(2, 4), '190,245,255', 'bubble', { drag: 1.1, unclipped: true });
  }
}

/** The wake is emitted along the actual velocity, including landscape aiming. */
export function spawnSharkWaterTrail(sink: FxSink, x: number, y: number, vx: number, vy: number): void {
  const speed = Math.hypot(vx, vy) || 1;
  const bx = -vx / speed, by = -vy / speed;
  const side = random(-11, 11);
  const back = random(38, 70);
  const px = x + bx * back - by * side;
  const py = y + by * back + bx * side;
  addParticle(sink, px, py, bx * random(70, 160) - by * random(-55, 55),
    by * random(70, 160) + bx * random(-55, 55), random(0.22, 0.42),
    random(2, 4), WATER_COLORS[Math.floor(Math.random() * WATER_COLORS.length)], 'waterDrop', { g: 520, drag: 0.8, unclipped: true });
  addParticle(sink, px, py, bx * 45, by * 45, random(0.32, 0.5), random(1.7, 3.5),
    '190,245,255', 'bubble', { drag: 0.8, unclipped: true });
}

/** A broad splash and fast droplets make the shark's impact feel forceful. */
export function spawnSharkWaterImpact(sink: FxSink, x: number, y: number, nx: number, ny: number, intensity = 1): void {
  const direction = Math.atan2(ny, nx);
  const amount = Math.max(0.25, Math.min(1, intensity));
  sink.light(x, y, 165, '132,225,255', 0.24);
  addParticle(sink, x, y, 0, 0, 0.48, 52, '#7dd3fc', 'waterSplash', { extra: direction });
  addParticle(sink, x, y, 0, 0, 0.3, 76, '165,235,255', 'shock');
  addParticle(sink, x, y, 0, 0, 0.38, 48, '220,252,255', 'ringE');
  for (let i = 0; i < Math.round(22 * amount); i++) {
    const a = direction + random(-1.45, 1.45);
    const speed = random(110, 520);
    addParticle(sink, x, y, Math.cos(a) * speed, Math.sin(a) * speed,
      random(0.3, 0.68), random(2, 5.5), WATER_COLORS[i % WATER_COLORS.length],
      'waterDrop', { g: 950, drag: 0.8 });
  }
  for (let i = 0; i < Math.round(5 * amount); i++) {
    const a = random(0, TAU);
    const speed = random(25, 100);
    addParticle(sink, x, y, Math.cos(a) * speed, Math.sin(a) * speed,
      random(0.35, 0.65), random(2, 4.5), '200,248,255', 'bubble', { drag: 1 });
  }
}

/** A short, curved water wake behind the shark rather than a laser streak. */
export function drawSharkWaterWake(c: CanvasRenderingContext2D, time: number): void {
  drawSoakerWaterStream(c, 0, 72, 190, time);
}