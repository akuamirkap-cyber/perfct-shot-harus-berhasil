/**
 * The weapons whose artwork comes from the SVG weapon zips / Armory Studio / Arsenal Ajaib.
 *
 * Kept in its own module (no markup) so the engine can ask "does this weapon
 * have the new art?" without pulling the artwork's chunk into the bundle.
 */

/** `svg-weapons-with-glow-animation.zip` — these also fire the zip's own crystal round. */
export const ZIP_WEAPON_IDS = ['diamond', 'blaster', 'paintball', 'shark', 'heat_ray'] as const;

/**
 * `animated-2d-svg-weapons.zip` — the 14 updated guns, matched to the names in
 * the supplied catalogue (section 4 / 5):
 *
 *   Void Crystal Reaver     → crystal            (CRYSTAL CANNON)
 *   Tesla Storm Scepter     → tesla_rifle        (TESLA RIFLE ARC)
 *   Inferno Pump-Action     → shotgun            (SHOTGUN)
 *   Emerald Ray Relic       → emerald            (EMERALD LASER)
 *   Cyber Pulse Disruptor   → electro            (ELECTRO GUN)
 *   Elemental RPG: Volt     → rpg                (RPG-7)
 *   Military RPG: Star      → bazooka            (BAZOOKA)
 *   Magma Rune Cannon       → meteor             (METEOR LAUNCHER)
 *   Dragonbreath Igniter    → flamethrower       (FLAMETHROWER)
 *   Neon Viper Circuit      → sniper             (SNIPER AWP)
 *   Orbital Beacon          → orbital_beacon     (ORBITAL BEACON)
 *   Phaser Type-II          → phaser             (PHASER TYPE-II)
 *   Gauntlet Cannon         → gauntlet_cannon    (GAUNTLET CANNON)
 *   Holy Light Gun          → holy               (HOLY LIGHT GUN)
 *
 * They replace the gun's drawing only; each keeps its own shot, sound and stats.
 */
export const ZIP_PACK2_IDS = [
  'crystal', 'tesla_rifle', 'shotgun', 'emerald', 'electro', 'rpg', 'bazooka',
  'meteor', 'flamethrower', 'sniper', 'orbital_beacon', 'phaser', 'gauntlet_cannon', 'holy',
] as const;

/**
 * Armory Studio batch 1 + Card Gun from screen 2, matched by name to
 * Perfect Shot weapons:
 *
 *   GOLDEN TYCOON     → coingun   (COIN GUN / motif koin emas)
 *   LASER BUSTER      → laser     (LASER BEAM)
 *   CYBER PULSE SMG   → ion_smg   (ION PULSE SMG)
 *   BANANA BLASTER    → banana    (BANANA GUN)
 *   STORM CALLER      → storm     (STORM CALLER)
 *
 *   CARD GUN          → card      (CARD GUN, from screen 2 / card.zip)
 *
 * These carry both an idle SVG and an activated firing SVG.
 */
export const ZIP_PACK3_IDS = ['coingun', 'laser', 'ion_smg', 'banana', 'storm', 'card'] as const;

/** Arsenal Ajaib (screen 3 / senjata.zip) designs, matched to Perfect Shot guns.
 *
 *   Verdant Sprout     → seed           (SEED GUN)
 *   Keris Mentari      → keris          (KERIS SAKTI)
 *   Ruby Royale        → ruby           (RUBY REVOLVER)
 *   Frostbite Crystal  → cryo_blaster   (CRYO BLASTER)
 *   Super Soaker       → soaker         (SUPER SOAKER)
 *   Firework Launcher  → firework       (FIREWORK LAUNCHER)
 *   Plasma Volt        → plasma         (PLASMA GUN)
 *   Minigun            → minigun        (MINIGUN)
 */
export const ZIP_PACK4_IDS = [
  'seed', 'keris', 'ruby', 'cryo_blaster', 'soaker', 'firework', 'plasma', 'minigun',
] as const;

export type ZipShotWeaponId = (typeof ZIP_WEAPON_IDS)[number];
export type ZipPack2Id = (typeof ZIP_PACK2_IDS)[number];
export type ZipPack3Id = (typeof ZIP_PACK3_IDS)[number];
export type ZipPack4Id = (typeof ZIP_PACK4_IDS)[number];
export type ZipWeaponId = ZipShotWeaponId | ZipPack2Id | ZipPack3Id | ZipPack4Id;

const ZIP_SET: ReadonlySet<string> = new Set<string>(ZIP_WEAPON_IDS);
const PACK2_SET: ReadonlySet<string> = new Set<string>(ZIP_PACK2_IDS);
const PACK3_SET: ReadonlySet<string> = new Set<string>(ZIP_PACK3_IDS);
const PACK4_SET: ReadonlySet<string> = new Set<string>(ZIP_PACK4_IDS);

export function isZipPack2(id: string | null | undefined): id is ZipPack2Id {
  return typeof id === 'string' && PACK2_SET.has(id);
}
export function isZipPack3(id: string | null | undefined): id is ZipPack3Id {
  return typeof id === 'string' && PACK3_SET.has(id);
}
export function isZipPack4(id: string | null | undefined): id is ZipPack4Id {
  return typeof id === 'string' && PACK4_SET.has(id);
}

/** True when a zip's artwork replaces this weapon's canvas drawing. */
export function hasZipArt(id: string | null | undefined): boolean {
  // MARTIAN HEAT-RAY's skin 3 is now drawn on the canvas (game/art/redesign8c.ts:
  // smooth hose tail + refined slide-2 head) instead of the zip's animated SVG.
  return typeof id === 'string' && id !== 'heat_ray'
    && (ZIP_SET.has(id) || PACK2_SET.has(id) || PACK3_SET.has(id) || PACK4_SET.has(id));
}
