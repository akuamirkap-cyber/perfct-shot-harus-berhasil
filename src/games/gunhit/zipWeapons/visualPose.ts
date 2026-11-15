import { H, W } from '../game/layout';
import type { SgaOrientation } from '../game/orientation';

// The previous 5% left offset is moved 3.5% back toward the right.
const SHARK_SHIFT = 0.015;
const NO_OFFSET = { x: 0, y: 0 } as const;
const PORTRAIT_OFFSET = { x: -W * SHARK_SHIFT, y: 0 } as const;
const LANDSCAPE_OFFSET = { x: 0, y: H * SHARK_SHIFT } as const;

/** A screen-space artwork offset only; the engine's muzzle and aim stay put. */
export function zipGunVisualX(id: string, muzzleX: number, orientation: SgaOrientation): number {
  return id === 'shark' ? muzzleX - (orientation === 'landscape' ? H : W) * SHARK_SHIFT : muzzleX;
}

/** Equivalent offset in the canvas's portrait-world coordinates. */
export function sharkGunWorldOffset(id: string, orientation: SgaOrientation): Readonly<{ x: number; y: number }> {
  if (id !== 'shark') return NO_OFFSET;
  return orientation === 'landscape' ? LANDSCAPE_OFFSET : PORTRAIT_OFFSET;
}