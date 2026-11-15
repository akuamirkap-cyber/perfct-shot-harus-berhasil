/**
 * Measured poses of the 14 weapons in `animated-2d-svg-weapons.zip`.
 *
 * All values are in the original SVG's own viewBox units. `span` is
 * max(length, thickness); the game scales it to 103,0 px in the Arsenal card
 * (112 x 0,92) and to 98% of the showcase height. The holy gun's wings are
 * wider than its barrel, so `span` comes from `thickness` there.
 */
export interface NewWeaponPose {
  id: string;
  name: string;
  viewBox: readonly [number, number, number, number];
  /** The artwork's own tilt, in degrees. */
  angle: number;
  /** Length along the barrel and width across it. */
  length: number;
  thickness: number;
  /** max(length, thickness) — what the game equalises. */
  span: number;
  /** Extra rotation needed to stand at 45° in the showcase. */
  rotate45: number;
}

export const NEW_WEAPON_POSE: Record<string, NewWeaponPose> = {
  crystal: {
    id: 'crystal', name: 'Void Crystal Reaver', viewBox: [10, 20, 530, 280],
    angle: -6, length: 466.3, thickness: 212.5, span: 466.3, rotate45: -39,
  },
  tesla_rifle: {
    id: 'tesla_rifle', name: 'Tesla Storm Scepter', viewBox: [0, 0, 420, 320],
    angle: -32, length: 403.9, thickness: 80.8, span: 403.9, rotate45: -13,
  },
  shotgun: {
    id: 'shotgun', name: 'Inferno Pump-Action', viewBox: [0, 0, 460, 320],
    angle: -28, length: 434.3, thickness: 102.4, span: 434.3, rotate45: -17,
  },
  emerald: {
    id: 'emerald', name: 'Emerald Ray Relic', viewBox: [0, 0, 440, 300],
    angle: -12, length: 326.9, thickness: 166.5, span: 326.9, rotate45: -33,
  },
  electro: {
    id: 'electro', name: 'Cyber Pulse Disruptor', viewBox: [20, 40, 450, 250],
    angle: -8, length: 404.6, thickness: 199.2, span: 404.6, rotate45: -37,
  },
  rpg: {
    id: 'rpg', name: 'Elemental RPG: Volt', viewBox: [0, 0, 500, 340],
    angle: -38, length: 435.6, thickness: 123.6, span: 435.6, rotate45: -7,
  },
  bazooka: {
    id: 'bazooka', name: 'Military RPG: Star', viewBox: [0, 0, 500, 340],
    angle: -38, length: 442.2, thickness: 119.8, span: 442.2, rotate45: -7,
  },
  meteor: {
    id: 'meteor', name: 'Magma Rune Cannon', viewBox: [0, 0, 440, 320],
    angle: -35, length: 361.8, thickness: 83.0, span: 361.8, rotate45: -10,
  },
  flamethrower: {
    id: 'flamethrower', name: 'Dragonbreath Igniter', viewBox: [-10, -10, 480, 320],
    angle: -12, length: 343.0, thickness: 186.5, span: 343.0, rotate45: -33,
  },
  sniper: {
    id: 'sniper', name: 'Neon Viper Circuit', viewBox: [0, 0, 480, 300],
    angle: -18, length: 451.5, thickness: 141.3, span: 451.5, rotate45: -27,
  },
  orbital_beacon: {
    id: 'orbital_beacon', name: 'Orbital Beacon', viewBox: [10, -10, 450, 360],
    angle: -38, length: 373.1, thickness: 333.5, span: 373.1, rotate45: -7,
  },
  phaser: {
    id: 'phaser', name: 'Phaser Type-II', viewBox: [20, -30, 470, 390],
    angle: -20, length: 365.9, thickness: 228.2, span: 365.9, rotate45: -25,
  },
  gauntlet_cannon: {
    id: 'gauntlet_cannon', name: 'Gauntlet Cannon', viewBox: [10, 30, 460, 290],
    angle: -14, length: 390.0, thickness: 230.1, span: 390.0, rotate45: -31,
  },
  holy: {
    id: 'holy', name: 'Holy Light Gun', viewBox: [-60, -150, 560, 525],
    angle: -16, length: 394.1, thickness: 449.0, span: 449.0, rotate45: -29,
  },
};
