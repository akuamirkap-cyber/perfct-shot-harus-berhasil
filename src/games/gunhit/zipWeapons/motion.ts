/**
 * How each zip weapon moves when it fires (`svg-weapons-with-glow-animation.zip`).
 *
 * The zip's own page kicks the whole card with a translate (its `kick` per
 * weapon) and re-runs a one-shot CSS animation (`.dg-fire`, `.wb-fire`, …).
 * Our five guns stand upright, so the same numbers become "travel straight down
 * the barrel axis + tip back", and the class name is what the page re-applies to
 * the mounted SVG so the zip's own flashes, sheen, spins and chomps play.
 *
 * Kept markup-free so the engine can read the numbers without pulling the
 * 190 KB artwork chunk into itself.
 */
import { ZIP_PACK2_IDS, ZIP_PACK3_IDS, ZIP_PACK4_IDS, type ZipShotWeaponId, type ZipWeaponId } from './ids';

export interface ZipKick {
  /**
   * EXTRA pixels the gun travels back (down, away from the wheel) at full
   * recoil, on top of the shared 22 px jump every gun's pose already carries.
   */
  y: number;
  /** Radians the barrel tips back at full recoil. */
  rot: number;
  /** Scale pulse at full recoil — the punch that makes the shot read. */
  punch: number;
}

const ZIP_SHOT_KICK: Record<ZipShotWeaponId, ZipKick> = {
  // zip "Diamond Gun": kick { x: -11, y: 11 } of its 512 box, a heavy rifle.
  diamond: { y: 16, rot: 0, punch: 0 },
  // zip "Wars Blaster": kick { x: -12, y: 10 }.
  blaster: { y: 14, rot: 0, punch: 0 },
  // zip "Paintball Gun": the lightest of the five, kick { x: -9, y: 9 }.
  paintball: { y: 10, rot: 0, punch: 0 },
  // zip "Shark Launcher": kick { x: -14, y: 6 }, the hardest hit.
  shark: { y: 21, rot: 0, punch: 0 },
  // zip "Martian Heat-Ray": a pivot (`rot: -9`) rather than a slide.
  heat_ray: { y: 20, rot: 0, punch: 0 },
};

/**
 * animated-2d-svg-weapons.zip: each SVG already recoils inside its own art
 * (`.wx-recoil`), so the engine's extra kick is lighter than the first zip's.
 */
const PACK2_KICK: Record<string, ZipKick> = {
  crystal: { y: 8, rot: 0, punch: 0 },
  tesla_rifle: { y: 7, rot: 0, punch: 0 },
  shotgun: { y: 12, rot: 0, punch: 0 },
  emerald: { y: 7, rot: 0, punch: 0 },
  electro: { y: 0, rot: 0, punch: 0 },
  rpg: { y: 14, rot: 0, punch: 0 },
  bazooka: { y: 12, rot: 0, punch: 0 },
  meteor: { y: 12, rot: 0, punch: 0 },
  flamethrower: { y: 8, rot: 0, punch: 0 },
  sniper: { y: 10, rot: 0, punch: 0 },
  orbital_beacon: { y: 6, rot: 0, punch: 0 },
  phaser: { y: 8, rot: 0, punch: 0 },
  gauntlet_cannon: { y: 12, rot: 0, punch: 0 },
  // Noisy-Cricket style: pure straight knockback, no rotation / scale punch.
  holy: { y: 9, rot: 0, punch: 0 },
};

const PACK3_KICK: Record<string, ZipKick> = {
  coingun: { y: 0, rot: 0, punch: 0 },
  laser: { y: 0, rot: 0, punch: 0 },
  ion_smg: { y: 0, rot: 0, punch: 0 },
  banana: { y: 0, rot: 0, punch: 0 },
  storm: { y: 0, rot: 0, punch: 0 },
  card: { y: 0, rot: 0, punch: 0 },
};

const PACK4_KICK: Record<string, ZipKick> = Object.fromEntries(
  ZIP_PACK4_IDS.map((id) => [id, { y: 8, rot: 0, punch: 0 }]),
);
export const ZIP_KICK: Record<ZipWeaponId, ZipKick> = { ...ZIP_SHOT_KICK, ...PACK2_KICK, ...PACK3_KICK, ...PACK4_KICK } as Record<ZipWeaponId, ZipKick>;

/** The zip's own one-shot fire class, on the SVG root. */
const ZIP_SHOT_FIRE_CLASS: Record<ZipShotWeaponId, string> = {
  diamond: 'dg-fire',
  blaster: 'wb-fire',
  paintball: 'pb-fire',
  shark: 'sl-fire',
  heat_ray: 'mh-fire',
};

/** animated-2d-svg-weapons.zip fires by adding `wx-is-firing` to the SVG root. */
export const PACK2_FIRE_CLASS = 'wx-is-firing';

export const ZIP_FIRE_CLASS: Record<ZipWeaponId, string> = {
  ...ZIP_SHOT_FIRE_CLASS,
  ...Object.fromEntries(ZIP_PACK2_IDS.map((id) => [id, PACK2_FIRE_CLASS])),
  // Armory Studio weapons swap markup instead of toggling a fire class.
  ...Object.fromEntries(ZIP_PACK3_IDS.map((id) => [id, ''])),
  ...Object.fromEntries(ZIP_PACK4_IDS.map((id) => [id, ''])),
} as Record<ZipWeaponId, string>;

/** The zip's idle float class, so a re-fire restarts from the same pose. */
const ZIP_SHOT_IDLE_CLASS: Record<ZipShotWeaponId, string> = {
  diamond: 'dg-bob',
  blaster: 'wb-idle',
  paintball: 'pb-neon',
  shark: 'sl-jet',
  heat_ray: 'mh-seg',
};

export const ZIP_IDLE_CLASS: Record<ZipWeaponId, string> = {
  ...ZIP_SHOT_IDLE_CLASS,
  ...Object.fromEntries(ZIP_PACK2_IDS.map((id) => [id, 'wx-pulse'])),
  ...Object.fromEntries(ZIP_PACK3_IDS.map((id) => [id, ''])),
  ...Object.fromEntries(ZIP_PACK4_IDS.map((id) => [id, ''])),
} as Record<ZipWeaponId, string>;

/** Length of the zip's own fire animation, in ms (its longest keyframe). */
export const ZIP_FIRE_MS = 780;
/** animated-2d-svg-weapons.zip: smoke and shockwaves play for up to ~1.8 s. */
export const PACK2_FIRE_MS = 1800;
/** Armory Studio activation cycle. */
export const PACK3_FIRE_MS = 1350;
export const PACK4_FIRE_MS = 1500;
/** card.zip uses a 1.6 s activation cycle. */
export const CARD_FIRE_MS = 1600;

export function zipFireMs(id: string): number {
  return id === 'card' ? CARD_FIRE_MS
    : (ZIP_PACK4_IDS as readonly string[]).includes(id) ? PACK4_FIRE_MS
    : (ZIP_PACK3_IDS as readonly string[]).includes(id) ? PACK3_FIRE_MS
    : (ZIP_PACK2_IDS as readonly string[]).includes(id) ? PACK2_FIRE_MS : ZIP_FIRE_MS;
}

export const SHARK_JAW_CLOSED_DEGREES = 38;
export const SHARK_JAW_FIRE_MS = 350;

/** The jaw opens for a shot, then returns to its closed resting pose. */
export function sharkJawDegrees(elapsedMs: number): number {
  if (!Number.isFinite(elapsedMs) || elapsedMs < 0 || elapsedMs >= SHARK_JAW_FIRE_MS) return SHARK_JAW_CLOSED_DEGREES;
  const smooth = (n: number) => n * n * (3 - 2 * n);
  if (elapsedMs < 90) return SHARK_JAW_CLOSED_DEGREES * (1 - smooth(elapsedMs / 90));
  if (elapsedMs < 135) return 0;
  return SHARK_JAW_CLOSED_DEGREES * smooth((elapsedMs - 135) / (SHARK_JAW_FIRE_MS - 135));
}

export function zipKick(id: string): ZipKick {
  return (ZIP_KICK as Record<string, ZipKick>)[id] ?? { y: 30, rot: 0, punch: 0 };
}

export function zipFireClass(id: string): string | null {
  return (ZIP_FIRE_CLASS as Record<string, string>)[id] ?? null;
}
