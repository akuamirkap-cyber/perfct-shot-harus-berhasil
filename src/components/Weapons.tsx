import Revolver, { type GunTone } from "./Revolver";
import HolyGun from "./HolyGun";
import { Blaster, Cannon, Pistol } from "./Guns";

export type Rarity = "common" | "rare" | "epic" | "legend";
export type WeaponId = "revolver" | "bronze" | "jade" | "desert" | "frost" | "venom" | "void" | "ember" | "holy" | "royal";
export type Shape = "revolver" | "pistol" | "blaster" | "cannon" | "holy";

type Meta = {
  name: string;
  tag: string;
  tagBg: string;
  desc: React.ReactNode;
  rarity: Rarity | "starter";
  shape: Shape;
  tone?: GunTone;
  aura?: string;
};

const hl = (c: string, t: string) => <span style={{ color: c }}>{t}</span>;

export const WEAPONS: Record<WeaponId, Meta> = {
  revolver: { name: "CLASSIC REVOLVER", tag: "★ STANDARD", tagBg: "linear-gradient(180deg,#b8c3cc,#6b7a85)", desc: "The trusty sidearm for every sharpshooter.", rarity: "starter", shape: "revolver", tone: "silver" },

  bronze: { name: "IRON SIX", tag: "⚙ STEADY", tagBg: "linear-gradient(180deg,#e7b98a,#9a6232)", rarity: "common", shape: "revolver", tone: "bronze", desc: <>Reliable iron revolver. Smooth trigger pull, {hl("#ffd8a8", "+5% accuracy")} on every shot.</> },
  jade: { name: "JADE RANGER", tag: "🍃 LIGHTWEIGHT", tagBg: "linear-gradient(180deg,#6cf08a,#1aa83a)", rarity: "common", shape: "pistol", tone: "jade", desc: <>Featherweight jade pistol. Fire delay between shots is {hl("#a7f3c0", "10% faster")}.</> },
  desert: { name: "DESERT HAWK", tag: "☀ HEAVY ROUNDS", tagBg: "linear-gradient(180deg,#f0d9a8,#a8823e)", rarity: "common", shape: "cannon", tone: "desert", desc: <>Desert hand cannon. Heavy rounds that {hl("#f0d9a8", "never bounce")} off wooden targets.</> },

  frost: { name: "FROST BITE", tag: "❄ ICE ROUNDS", tagBg: "linear-gradient(180deg,#7fd8ff,#1677d4)", rarity: "rare", shape: "pistol", tone: "frost", aura: "rgba(120,210,255,0.6)", desc: <>Eternal ice pistol. Hits {hl("#bff3ff", "freeze the target for 1s")} to make follow-up shots easier.</> },
  venom: { name: "VENOM RAY", tag: "☠ VENOM", tagBg: "linear-gradient(180deg,#b6e65a,#4c7a0e)", rarity: "rare", shape: "blaster", tone: "venom", aura: "rgba(163,255,58,0.5)", desc: <>Toxic blaster. Struck targets {hl("#d4f77a", "spin 20% slower")} for 2 seconds.</> },

  void: { name: "VOID BLASTER", tag: "✦ SPACE ROUNDS", tagBg: "linear-gradient(180deg,#c48bff,#7432d6)", rarity: "epic", shape: "blaster", tone: "void", aura: "rgba(176,110,255,0.6)", desc: <>Cosmic energy blaster. Every 3rd hit, the next shot {hl("#8fe9ff", "pierces 2 targets")} at once.</> },
  ember: { name: "INFERNO", tag: "🔥 FIRE", tagBg: "linear-gradient(180deg,#ffb27a,#e8572a)", rarity: "epic", shape: "cannon", tone: "ember", aura: "rgba(255,140,40,0.55)", desc: <>Flame cannon. Every 5th hit, the next shot {hl("#ffd08a", "explodes against nearby targets")}.</> },

  holy: { name: "HOLY LIGHT GUN", tag: "☀ HOLY LIGHT", tagBg: "linear-gradient(180deg,#ffb347,#f07a12)", rarity: "legend", shape: "holy", aura: "rgba(255,214,90,0.6)", desc: <>Angel-winged weapon. Every hit {hl("#ffd84a", "purifies 1 rusty bullet")}, plus {hl("#8fe9ff", "1 holy shield")} per level.</> },
  royal: { name: "GOLDEN DRAGON", tag: "🐉 GOLDEN DRAGON", tagBg: "linear-gradient(180deg,#ff6b95,#c8123f)", rarity: "legend", shape: "revolver", tone: "royal", aura: "rgba(255,200,60,0.55)", desc: <>Golden dragon revolver. Coin rewards per stage {hl("#ffd84a", "+50%")}, plus {hl("#ff9ab8", "1 extra round")} per level.</> },
};

export const POOL: Record<Rarity, WeaponId[]> = {
  common: ["bronze", "jade", "desert"],
  rare: ["frost", "venom"],
  epic: ["void", "ember"],
  legend: ["holy", "royal"],
};

export const ALL_WEAPONS = Object.keys(WEAPONS) as WeaponId[];

/** Renders any weapon at a comparable visual size. scale=1 ≈ 160px wide. */
export function WeaponArt({ id, scale = 1, tilt = -14 }: { id: WeaponId; scale?: number; tilt?: number }) {
  const m = WEAPONS[id];
  if (m.shape === "holy") return <HolyGun width={118 * scale} />;
  const w = 162 * scale;
  const tone = m.tone ?? "silver";
  const art = m.shape === "pistol" ? <Pistol width={w} tone={tone} /> : m.shape === "blaster" ? <Blaster width={w} tone={tone} /> : m.shape === "cannon" ? <Cannon width={w} tone={tone} /> : <Revolver width={w} tone={tone} />;
  return <div style={{ transform: `rotate(${tilt}deg)` }}>{art}</div>;
}
