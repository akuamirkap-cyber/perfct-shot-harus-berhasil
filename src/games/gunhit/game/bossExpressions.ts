import type { HeadKind } from '../../perfect-shot/play/HeadArt';

type EyeBox = readonly [x: number, y: number, width: number, height: number];

// SVG coordinates are -100..100. Only the eye areas are replaced so damage,
// outlines, and the boss's collision silhouette remain untouched.
export const BOSS_EYE_BOXES: Record<HeadKind, readonly EyeBox[]> = {
  pirate: [[7, -8, 23, 21]],
  jester: [[-27, -15, 18, 20], [9, -15, 18, 20]],
  dragon: [[-41, -16, 30, 25], [11, -16, 30, 25]],
  skeleton: [[-50, -37, 43, 45], [7, -37, 43, 45]],
  tiki: [[-37, -27, 30, 31], [7, -27, 30, 31]],
  viking: [[-27, -13, 20, 20], [7, -13, 20, 20]],
  oni: [[-43, -25, 35, 28], [8, -25, 35, 28]],
  robot: [[-44, -38, 88, 36]],
  alien: [[-56, -33, 52, 51], [4, -33, 52, 51]],
  vampire: [[-27, -8, 20, 19], [7, -8, 20, 19]],
  sun: [[-40, -22, 33, 29], [7, -22, 33, 29]],
};

export function bossLaughEyeOpacity(age: number, remaining: number): number {
  if (!Number.isFinite(age) || !Number.isFinite(remaining) || age < 0 || remaining <= 0) return 0;
  return Math.min(1, age / 0.12, remaining / 0.16);
}

export function drawBossLaughEyes(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  head: HeadKind,
  radius: number,
  opacity: number,
): void {
  if (opacity <= 0 || radius <= 0) return;
  const sx = (image.naturalWidth || image.width) / 200;
  const sy = (image.naturalHeight || image.height) / 200;
  if (sx <= 0 || sy <= 0) return;
  const scale = radius / 100;
  ctx.save();
  ctx.globalAlpha *= Math.min(1, opacity);
  for (const [x, y, width, height] of BOSS_EYE_BOXES[head]) {
    ctx.drawImage(image, (x + 100) * sx, (y + 100) * sy, width * sx, height * sy,
      x * scale, y * scale, width * scale, height * scale);
  }
  ctx.restore();
}