/**
 * The five weapons from `svg-weapons-with-glow-animation.zip`, keyed by the
 * game's weapon id whose name matches the zip's:
 *
 *   Diamond Gun      → diamond
 *   Wars Blaster     → blaster
 *   Paintball Gun    → paintball
 *   Shark Launcher   → shark
 *   Martian Heatray  → heat_ray
 *
 * Each entry is the zip's own SVG — including its `<style>` block, so every
 * glow, twinkle, shimmer and fire animation runs in the page exactly as the zip
 * plays it — rotated upright, plus the ink bounds the screens place it by.
 */
export { ZIP_WEAPON_IDS, ZIP_PACK2_IDS, ZIP_PACK3_IDS, ZIP_PACK4_IDS, hasZipArt, isZipPack2, isZipPack3, isZipPack4, type ZipWeaponId } from './ids';

import { box as diamondBox, ink as diamondInk, markup as diamondGun } from './diamondGun';
import { box as blasterBox, ink as blasterInk, markup as warsBlaster } from './warsBlaster';
import { box as paintballBox, ink as paintballInk, markup as paintballGun } from './paintballGun';
import { box as sharkBox } from './sharkLauncher';
import { SHARK_INK, sharkGunMarkup } from './sharkArt';
import { box as rayBox, ink as rayInk, markup as martianHeatray } from './martianHeatray';
import type { ZipShotWeaponId, ZipWeaponId } from './ids';
import { ZIP_PACK2_IDS, ZIP_PACK3_IDS, ZIP_PACK4_IDS } from './ids';
import { PACK2, box as pack2Box, pad as pack2Pad } from './pack2Art';
import { NEW_WEAPON_POSE } from '../newWeapons/pose';
import { PACK3, box as pack3Box, pad as pack3Pad } from './pack3Art';
import { PACK3_CARD } from './pack3CardArt';
import { PACK4 } from './pack4Art';
export { preloadSharkProjectile } from './sharkArt';

export interface ZipInk {
  x0: number; y0: number; x1: number; y1: number;
  /** Barrel tip, in the same units: the point every screen anchors to. */
  muzzleX: number; muzzleY: number;
}

export interface ZipArt {
  /** The zip's SVG, upright, with its animations intact. */
  markup: string;
  /** Side of the square viewBox the markup draws in (user units). */
  box: number;
  /** Where the viewBox starts (`-pad`), so user units map to box pixels. */
  pad: number;
  ink: ZipInk;
  /** New SVG weapons: the measured max(length, thickness) in viewBox units. */
  span?: number;
  /** Armory Studio weapons swap to this activated SVG while firing. */
  fireMarkup?: string;
}

const ZIP_SHOT_ART: Record<ZipShotWeaponId, ZipArt> = {
  diamond: { markup: diamondGun, box: diamondBox, pad: 256, ink: diamondInk },
  blaster: { markup: warsBlaster, box: blasterBox, pad: 256, ink: blasterInk },
  paintball: { markup: paintballGun, box: paintballBox, pad: 256, ink: paintballInk },
  shark: {
    markup: sharkGunMarkup,
    box: sharkBox,
    pad: 256,
    ink: SHARK_INK,
  },
  heat_ray: { markup: martianHeatray, box: rayBox, pad: 256, ink: rayInk },
};

// animated-2d-svg-weapons.zip: updated art for fourteen existing guns.
const PACK2_ART = Object.fromEntries(
  ZIP_PACK2_IDS.map((id) => [id, {
    markup: PACK2[id].markup, box: pack2Box, pad: pack2Pad, ink: PACK2[id].ink,
    span: NEW_WEAPON_POSE[id]?.span,
  }]),
) as Record<string, ZipArt>;

// Armory Studio batch 1 + Card Gun: idle + activated firing SVG.
const PACK3_ALL: Record<string, { markup: string; fireMarkup?: string; ink: ZipInk; span?: number }> = { ...PACK3, card: PACK3_CARD };
const PACK3_ART = Object.fromEntries(
  ZIP_PACK3_IDS.map((id) => [id, {
    markup: PACK3_ALL[id].markup, fireMarkup: PACK3_ALL[id].fireMarkup,
    box: pack3Box, pad: pack3Pad, ink: PACK3_ALL[id].ink, span: PACK3_ALL[id].span,
  }]),
) as Record<string, ZipArt>;

// Arsenal Ajaib: eight more idle + activated firing SVGs.
const PACK4_ART = Object.fromEntries(
  ZIP_PACK4_IDS.map((id) => [id, {
    markup: PACK4[id].markup, fireMarkup: PACK4[id].fireMarkup,
    box: 1024, pad: 256, ink: PACK4[id].ink, span: PACK4[id].span,
  }]),
) as Record<string, ZipArt>;

export const ZIP_ART: Record<ZipWeaponId, ZipArt> = { ...ZIP_SHOT_ART, ...PACK2_ART, ...PACK3_ART, ...PACK4_ART } as Record<ZipWeaponId, ZipArt>;

export function zipArt(id: string | null | undefined): ZipArt | null {
  if (typeof id !== 'string') return null;
  return (ZIP_ART as Record<string, ZipArt>)[id] ?? null;
}

/** Ink height in user units: what the five original zip SVGs scale against. */
export function inkHeight(art: ZipArt): number {
  return Math.max(1, art.ink.y1 - art.ink.y0);
}

/** The measured SPAN of the new SVG weapons (or ink height for the old zip). */
export function artSpan(art: ZipArt): number {
  return art.span && art.span > 0 ? art.span : inkHeight(art);
}

/**
 * Placement for a weapon drawn at `height` CSS px.
 *
 * `scale` makes the artwork's measured SPAN exactly `height` px; `left`/`top` are the
 * offsets of the drawing box inside its container, so either the barrel tip or
 * the ink's centre lands on the container's anchor. The same numbers drive the
 * DOM overlay and the offline preview render, so what is checked is what ships.
 */
export function placeZipArt(
  art: ZipArt,
  height: number,
  anchor: 'muzzle' | 'center' = 'muzzle',
): { size: number; scale: number; left: number; top: number } {
  const scale = height / artSpan(art);
  const size = art.box * scale;
  const toBox = (u: number) => (u + art.pad) * scale;
  if (anchor === 'muzzle') {
    return { size, scale, left: -toBox(art.ink.muzzleX), top: -toBox(art.ink.muzzleY) };
  }
  const cx = toBox((art.ink.x0 + art.ink.x1) / 2);
  const cy = toBox((art.ink.y0 + art.ink.y1) / 2);
  return { size, scale, left: -cx, top: -cy };
}
