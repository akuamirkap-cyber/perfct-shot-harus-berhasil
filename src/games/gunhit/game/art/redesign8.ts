/**
 * Entry point for the redrawn guns of redesign8a/b/c. Each weapon is redrawn on
 * exactly one skin (the one kept / used by default); every other skin keeps its art.
 */
import { drawRedesign8a } from './redesign8a';
import { drawRedesign8b } from './redesign8b';
import { drawRedesign8c } from './redesign8c';
import { drawRedesign9 } from './redesign9';
import type { GunMetrics } from './metrics';
import { ZIP_PACK2_IDS, ZIP_PACK3_IDS, ZIP_PACK4_IDS } from '../../zipWeapons/ids';

/** weapon id → the skin (variant) that carries the redrawn art */
export const REDESIGN8: Record<string, string> = {
  emerald: 'original', wand: 'original', ruby: 'original', crystal: 'original',
  unicorn: 'set7', angklung: 'set7', sakura: 'set7', cryo_blaster: 'set7', honey: 'set7',
  cricket: 'current', gauntlet_cannon: 'original', minigun: 'set7',
  orbital_beacon: 'set11', singularity: 'set11',
  heat_ray: 'zip',
  // reverted to their previous art on request: flamethrower, rubber chicken, sapphire (very first art), laser, rpg, phaser, dora (air cannon), gravity, nano_swarm
};

/** skins that remain selectable (everything else was removed on request) */
export const KEEP_SKINS: Record<string, readonly string[]> = {
  sapphire: ['original'], wand: ['original'], ruby: ['original'], proton_pack: ['set9'],
};
// animated-2d-svg-weapons.zip replaced these fourteen guns' drawing outright: the
// zip card is their only design (their shot, sound and stats are unchanged).
for (const id of ZIP_PACK2_IDS) KEEP_SKINS[id] = ['zip'];
// Armory Studio batch 1 also replaces the drawing outright.
for (const id of ZIP_PACK3_IDS) KEEP_SKINS[id] = ['zip'];
for (const id of ZIP_PACK4_IDS) KEEP_SKINS[id] = ['zip'];
// HYPERDRIVE CANNON stays on its first skin, as requested.
KEEP_SKINS.hyperdrive = ['original'];

/** measured ink bounds of the redrawn art (filled in from the preview harness) */
export const REDESIGN8_METRICS: Record<string, GunMetrics> = {
  emerald: { totalLen: 180, centerOffsetY: 86, centerOffsetX: 20, span: 185 },
  wand: { totalLen: 250, centerOffsetY: 123, centerOffsetX: 0, span: 216 },
  ruby: { totalLen: 179, centerOffsetY: 87, centerOffsetX: 21, span: 183 },
  crystal: { totalLen: 196, centerOffsetY: 96, centerOffsetX: 11, span: 209 },
  unicorn: { totalLen: 202, centerOffsetY: 97, centerOffsetX: 14, span: 210 },
  angklung: { totalLen: 235, centerOffsetY: 93, centerOffsetX: 9, span: 233 },
  sakura: { totalLen: 195, centerOffsetY: 96, centerOffsetX: 9, span: 209 },
  cryo_blaster: { totalLen: 178, centerOffsetY: 89, centerOffsetX: 9, span: 197 },
  honey: { totalLen: 172, centerOffsetY: 92, centerOffsetX: 8, span: 194 },
  cricket: { totalLen: 172, centerOffsetY: 72, centerOffsetX: 19, span: 174 },
  gauntlet_cannon: { totalLen: 193, centerOffsetY: 94, centerOffsetX: 16, span: 200 },
  minigun: { totalLen: 176, centerOffsetY: 94, centerOffsetX: 7, span: 201 },
  orbital_beacon: { totalLen: 190, centerOffsetY: 96, centerOffsetX: 0, span: 218 },
  singularity: { totalLen: 189, centerOffsetY: 100, centerOffsetX: 16, span: 197 },
  heat_ray: { totalLen: 268, centerOffsetY: 131, centerOffsetX: 0, span: 251 },
};

export const isRedesign8 = (id: string, variant: string) => REDESIGN8[id] === variant;

export function drawRedesign8(
  c: CanvasRenderingContext2D, id: string, variant: string, cx: number, y0: number, t: number, sinceShot: number,
): boolean {
  if (REDESIGN8[id] !== variant) return false;
  c.save();
  c.translate(cx, y0);
  const ok = drawRedesign9(c, id, sinceShot, t) || drawRedesign8a(c, id, sinceShot, t) || drawRedesign8b(c, id, sinceShot, t) || drawRedesign8c(c, id, sinceShot, t);
  c.restore();
  return ok;
}
