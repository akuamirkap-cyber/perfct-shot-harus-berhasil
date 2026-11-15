import { useEffect, useRef, useState } from "react";
import GiftBox, { GIFT_PHASES, type GiftPhase, type Tint } from "./GiftBox";
import Title3D from "./Title3D";
import { Coin, Diamond, Star } from "./Icons";
import { ALL_WEAPONS, POOL, WEAPONS, WeaponArt, type Rarity, type WeaponId } from "./Weapons";
import { sfx } from "../audio/sfx";

/* ---------------- rarity + outcomes ---------------- */
export type { Rarity };
type RarityInfo = { label: string; rank: number; color: string; ink: string; dark: string; tint: Tint; ray: string; confetti: string[] };

export const RARITY: Record<Rarity, RarityInfo> = {
  common: {
    label: "COMMON",
    rank: 0,
    color: "#4fe36e",
    ink: "#0b3d17",
    dark: "#11702a",
    tint: { core: "#eafff0", glow: "rgba(70,230,110,0.8)" },
    ray: "rgba(90,235,130,0.45)",
    confetti: ["#4fe36e", "#ffffff", "#ffd84a", "#a4ffb5"],
  },
  rare: {
    label: "RARE",
    rank: 1,
    color: "#b07cff",
    ink: "#ffffff",
    dark: "#44168a",
    tint: { core: "#f3e6ff", glow: "rgba(170,100,255,0.82)" },
    ray: "rgba(180,120,255,0.5)",
    confetti: ["#b07cff", "#ffffff", "#ffd84a", "#d8b4ff"],
  },
  epic: {
    label: "EPIC",
    rank: 2,
    color: "#ff5040",
    ink: "#ffffff",
    dark: "#8a1407",
    tint: { core: "#fff0ec", glow: "rgba(255,70,50,0.82)" },
    ray: "rgba(255,90,70,0.5)",
    confetti: ["#ff5040", "#ffffff", "#ffd84a", "#ffa898"],
  },
  legend: {
    label: "LEGEND",
    rank: 3,
    color: "#ffc531",
    ink: "#4a2a00",
    dark: "#9a5200",
    tint: { core: "#fff6c8", glow: "rgba(255,200,60,0.88)" },
    ray: "rgba(255,214,90,0.52)",
    confetti: ["#ffd84a", "#ffffff", "#ff6b95", "#ffc531", "#fff3b0"],
  },
};
const ORDER: Rarity[] = ["common", "rare", "epic", "legend"];

type Outcome =
  | { rarity: Rarity; kind: "weapon"; weapon: WeaponId; bonus: number }
  | { rarity: Rarity; kind: "coin" | "diamond"; amount: number; fallback?: boolean };

const RATES: [Rarity, number][] = [
  ["legend", 0.08],
  ["epic", 0.19],
  ["rare", 0.28],
  ["common", 0.45],
];
const CURRENCY: Record<Rarity, { kind: "coin" | "diamond"; amount: number; chance: number }> = {
  common: { kind: "coin", amount: 100, chance: 0.45 },
  rare: { kind: "coin", amount: 250, chance: 0 },
  epic: { kind: "diamond", amount: 20, chance: 0.4 },
  legend: { kind: "diamond", amount: 50, chance: 0 },
};
const BONUS: Record<Rarity, number> = { common: 30, rare: 80, epic: 150, legend: 230 };

/** weapons already owned are never rolled again */
function roll(owned: WeaponId[]): Outcome {
  let r = Math.random();
  let rarity: Rarity = "common";
  for (const [k, p] of RATES) {
    if (r < p) {
      rarity = k;
      break;
    }
    r -= p;
  }
  const pool = POOL[rarity].filter((w) => !owned.includes(w));
  const c = CURRENCY[rarity];
  if (!pool.length) return { rarity, kind: c.kind, amount: c.amount, fallback: true };
  if (Math.random() < c.chance) return { rarity, kind: c.kind, amount: c.amount };
  return { rarity, kind: "weapon", weapon: pool[Math.floor(Math.random() * pool.length)], bonus: BONUS[rarity] };
}

/* shuffle candidates – one per distinct silhouette */
type Cand = { kind: "weapon"; weapon: WeaponId } | { kind: "coin" } | { kind: "diamond" };
const REPS: Cand[] = [
  { kind: "weapon", weapon: "bronze" },
  { kind: "weapon", weapon: "jade" },
  { kind: "weapon", weapon: "venom" },
  { kind: "weapon", weapon: "ember" },
  { kind: "weapon", weapon: "holy" },
  { kind: "coin" },
  { kind: "diamond" },
];
const ckey = (c: Cand) => (c.kind === "weapon" ? WEAPONS[c.weapon].shape : c.kind);
function shuffleSeq(final: Cand, n: number): Cand[] {
  const seq: Cand[] = [];
  let prev = "";
  for (let k = 0; k < n; k++) {
    let c: Cand;
    do c = REPS[Math.floor(Math.random() * REPS.length)];
    while (ckey(c) === prev || (k === n - 1 && ckey(c) === ckey(final)));
    seq.push(c);
    prev = ckey(c);
  }
  return [...seq, final];
}
const SHUFFLE_MS = [65, 65, 70, 75, 85, 95, 110, 130, 155, 185, 225, 275];

function Spiky({ color }: { color: string }) {
  const n = 22;
  const pts = Array.from({ length: n * 2 })
    .map((_, k) => {
      const a = (k / (n * 2)) * Math.PI * 2;
      const r = k % 2 ? 128 : 186;
      return `${190 + Math.cos(a) * r},${190 + Math.sin(a) * r}`;
    })
    .join(" ");
  return (
    <svg width="380" height="380" viewBox="0 0 380 380">
      <polygon points={pts} fill={color} opacity="0.32" />
      <polygon points={pts} fill="none" stroke="#fff" strokeOpacity="0.25" strokeWidth="3" transform="translate(190 190) scale(0.82) translate(-190 -190)" />
    </svg>
  );
}

export type RewardResult = { action: "equip" | "keep" | "claim"; weapon?: WeaponId };

type Props = {
  owned: WeaponId[];
  onDone: (r: RewardResult) => void;
  onFly: (kind: "coin" | "diamond", el: HTMLElement | null, amount: number) => void;
};

const TAPS = 3;
const GIFT_TOP = 300;
const ITEM_TOP = 168;

/* ---------------- small visuals ---------------- */
function Dust() {
  return (
    <>
      {Array.from({ length: 26 }).map((_, i) => (
        <span
          key={i}
          className="absolute rounded-full bg-white"
          style={{
            left: `${(i * 37 + 11) % 100}%`,
            top: `${(i * 53 + 5) % 96}%`,
            width: i % 5 === 0 ? 3 : 2,
            height: i % 5 === 0 ? 3 : 2,
            animation: `fx-twinkle ${2 + (i % 4) * 0.8}s ease-in-out ${(i % 6) * 0.35}s infinite`,
          }}
        />
      ))}
    </>
  );
}

function Confetti({ x, y, count = 30, colors }: { x: number; y: number; count?: number; colors: string[] }) {
  return (
    <div className="pointer-events-none absolute z-30" style={{ left: x, top: y }}>
      {Array.from({ length: count }).map((_, i) => {
        const a = (i / count) * Math.PI * 2 + (i % 3) * 0.2;
        const r = 140 + (i % 5) * 38;
        const star = i % 4 === 0;
        return (
          <span
            key={i}
            className="absolute block"
            style={
              {
                left: -5,
                top: -5,
                width: star ? 14 : i % 2 ? 10 : 7,
                height: star ? 14 : i % 2 ? 6 : 12,
                background: star ? "transparent" : colors[i % colors.length],
                borderRadius: i % 3 === 0 ? 999 : 2,
                color: colors[i % colors.length],
                fontSize: 16,
                lineHeight: "14px",
                "--bx": `${Math.cos(a) * r}px`,
                "--by": `${Math.sin(a) * r * 0.8 + 90}px`,
                "--rot": `${(i % 2 ? 1 : -1) * (240 + i * 20)}deg`,
                animation: `fx-confetti ${1.1 + (i % 4) * 0.2}s cubic-bezier(.15,.7,.4,1) ${(i % 5) * 0.03}s both`,
              } as React.CSSProperties
            }
          >
            {star ? "✦" : null}
          </span>
        );
      })}
    </div>
  );
}

function CoinPile() {
  return (
    <div className="relative h-[190px] w-[230px]">
      <div className="absolute left-[18px] top-[96px]"><Coin size={78} /></div>
      <div className="absolute left-[140px] top-[104px]"><Coin size={66} /></div>
      <div className="absolute left-[150px] top-[18px]"><Coin size={46} /></div>
      <div className="absolute left-[52px] top-[20px]"><Coin size={130} /></div>
    </div>
  );
}
function GemCluster() {
  return (
    <div className="relative h-[190px] w-[230px]">
      <div className="absolute left-[14px] top-[92px]"><Diamond size={74} /></div>
      <div className="absolute left-[146px] top-[100px]"><Diamond size={64} /></div>
      <div className="absolute left-[156px] top-[14px]"><Diamond size={44} /></div>
      <div className="absolute left-[50px] top-[16px]"><Diamond size={134} /></div>
    </div>
  );
}
function ItemArt({ c }: { c: Cand }) {
  if (c.kind === "weapon") return <WeaponArt id={c.weapon} scale={1.6} tilt={-20} />;
  return c.kind === "coin" ? <CoinPile /> : <GemCluster />;
}

/* ---------------- page ---------------- */
const CYCLE_MS = [70, 70, 70, 75, 80, 90, 100, 115, 135, 160, 195, 245, 310];

export default function RewardPage({ owned, onDone, onFly }: Props) {
  const [o] = useState<Outcome>(() => roll(owned));
  const finalCand: Cand = o.kind === "weapon" ? { kind: "weapon", weapon: o.weapon } : { kind: o.kind };
  const [seq] = useState<Cand[]>(() => shuffleSeq(finalCand, SHUFFLE_MS.length - 1));
  const [cand, setCand] = useState<Cand>(() => REPS.filter((c) => ckey(c) !== ckey(finalCand))[Math.floor(Math.random() * 5)]);
  const [swap, setSwap] = useState(0);
  const [itemLanded, setItemLanded] = useState(false);
  const R = RARITY[o.rarity];

  const [phase, setPhase] = useState<GiftPhase>("intro");
  const [shown, setShown] = useState<Rarity>(ORDER[Math.floor(Math.random() * 4)]);
  const [landed, setLanded] = useState(false);
  const [tugs, setTugs] = useState(0);
  const [charge, setCharge] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const timers = useRef<number[]>([]);
  const rootRef = useRef<HTMLDivElement>(null);
  const payRef = useRef<HTMLDivElement>(null);
  const lastTap = useRef(0);
  const paid = useRef(false);

  const S = RARITY[shown];
  const boxRef = useRef<HTMLDivElement>(null);
  const firstShown = useRef(true);

  // juicy squeeze + colour pop every time the box rarity changes
  const [pops, setPops] = useState<{ id: number; color: string; big: boolean }[]>([]);
  const popId = useRef(0);
  useEffect(() => {
    if (firstShown.current) {
      firstShown.current = false;
      return;
    }
    const final = landed;
    if (!final) {
      // random pick: just a quick fade-in of the new box colour
      boxRef.current?.animate(
        [
          { opacity: 0.15, filter: "brightness(1.9) blur(1.5px)" },
          { opacity: 1, filter: "brightness(1) blur(0)" },
        ],
        { duration: 110, easing: "ease-out" },
      );
      sfx.shuffleBlip(ORDER.indexOf(shown) / 4);
      return;
    }
    // final pick → juicy jelly squeeze + colour burst
    boxRef.current?.animate(
      [
        { transform: "scale(1.45, 0.5) translateY(0)", filter: "brightness(2.6) saturate(1.4)" },
        { transform: "scale(0.62, 1.42) translateY(-26px) rotate(-3deg)", filter: "brightness(1.9) saturate(1.3)", offset: 0.16 },
        { transform: "scale(1.32, 0.72) rotate(2deg)", filter: "brightness(1.4)", offset: 0.32 },
        { transform: "scale(0.84, 1.18) translateY(-8px) rotate(-1deg)", filter: "brightness(1.2)", offset: 0.48 },
        { transform: "scale(1.12, 0.9)", offset: 0.63 },
        { transform: "scale(0.95, 1.06) translateY(-2px)", offset: 0.77 },
        { transform: "scale(1.03, 0.98)", offset: 0.9 },
        { transform: "none", filter: "brightness(1) saturate(1)" },
      ],
      { duration: 820, easing: "cubic-bezier(.25,1,.5,1)" },
    );
    const id = ++popId.current;
    setPops((ps) => [...ps.slice(-3), { id, color: RARITY[shown].color, big: true }]);
    window.setTimeout(() => setPops((ps) => ps.filter((x) => x.id !== id)), 1000);
    sfx.squish(ORDER.indexOf(shown));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shown, landed]);
  const i = GIFT_PHASES.indexOf(phase);
  const at = (p: GiftPhase) => i >= GIFT_PHASES.indexOf(p);
  const later = (ms: number, fn: () => void) => timers.current.push(window.setTimeout(fn, ms));

  const shake = (power: number) => {
    const el = rootRef.current;
    if (!el) return;
    const k = (n: number) => `translate(${(Math.random() - 0.5) * power * n}px, ${(Math.random() - 0.5) * power * n}px)`;
    el.animate([{ transform: "none" }, { transform: k(1) }, { transform: k(0.7) }, { transform: k(0.4) }, { transform: k(0.15) }, { transform: "none" }], { duration: 420, easing: "ease-out" });
  };

  /* ---------- arrival: box colour spins like a slot, settles on rarity ---------- */
  useEffect(() => {
    sfx.giftDrop();
    later(450, () => shake(8));
    let t = 0;
    let idx = ORDER.indexOf(shown);
    CYCLE_MS.forEach((d, k) => {
      t += d;
      const last = k === CYCLE_MS.length - 1;
      later(t, () => {
        if (last) {
          // final pick lands in the same render → triggers the squeeze
          setLanded(true);
          setShown(o.rarity);
        } else {
          let n = idx;
          while (n === idx || (k === CYCLE_MS.length - 2 && ORDER[n] === o.rarity)) n = Math.floor(Math.random() * 4);
          idx = n;
          setShown(ORDER[n]);
        }
      });
    });
    later(t, () => {
      setLanded(true);
      setPhase("ready");
      if (R.rank > 0) sfx.upgrade(R.rank);
      else sfx.pop(1.1);
      shake(4 + R.rank * 3);
    });
    return () => timers.current.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---------- tap: tug the ribbon ---------- */
  const tap = () => {
    if (phase !== "ready") return;
    const now = performance.now();
    if (now - lastTap.current < 280) return;
    lastTap.current = now;
    const n = tugs + 1;
    setTugs(n);
    sfx.tug(n - 1);
    sfx.ribbonTwang(n - 1);
    shake(3 + n * 2);
    if (n >= TAPS) later(300, open);
  };

  /* ---------- one continuous flow: untie → charge → burst → reveal ---------- */
  const open = () => {
    setPhase("pulling");
    sfx.untie();
    shake(7);
    later(750, () => {
      setPhase("charging");
      setCharge(1);
      sfx.riser(1.1);
    });
    later(1100, () => setCharge(2));
    later(1450, () => setCharge(3));
    later(1850, () => {
      setPhase("burst");
      setCharge(0);
      sfx.lidPop();
      shake(16);
      later(450, sfx.mystery);
    });
    // "who's that weapon?" – silhouettes shuffle and slow down
    let t = 1850 + 1000;
    SHUFFLE_MS.forEach((d, k) => {
      t += d;
      const last = k === SHUFFLE_MS.length - 1;
      later(t, () => {
        setCand(seq[k]);
        setSwap(k + 1);
        if (last) {
          setItemLanded(true);
          sfx.shuffleLand();
          shake(8);
        } else sfx.shuffleBlip(k / SHUFFLE_MS.length);
      });
    });
    const reveal = t + 480;
    later(reveal, () => {
      setPhase("reveal");
      if (o.rarity === "legend") sfx.legendReveal();
      else if (o.rarity === "epic") sfx.newBest();
      else sfx.adReward();
      shake(o.rarity === "legend" ? 12 : 7);
    });
    later(reveal + 350, () => {
      setPhase("info");
      Array.from({ length: R.rank + 1 }).forEach((_, k) => later(450 + k * 130, () => sfx.starPop(k)));
      later(950, () => sfx.softPop());
      later(1250, () => sfx.pop(1.1));
    });
  };

  const pay = () => {
    if (paid.current) return;
    paid.current = true;
    if (o.kind === "weapon") onFly("coin", payRef.current, o.bonus);
    else onFly(o.kind, payRef.current, o.amount);
  };

  const finish = (action: RewardResult["action"]) => {
    if (leaving) return;
    setLeaving(true);
    pay();
    if (action === "equip") sfx.equip();
    later(action === "claim" ? 900 : 500, () => onDone({ action, weapon: o.kind === "weapon" ? o.weapon : undefined }));
  };

  // sunburst centre: gift centre → item centre (moves down a bit in info)
  const GIFT_CY = GIFT_TOP + 165;
  const ITEM_CY = ITEM_TOP + 95;
  const cy = phase === "info" ? ITEM_CY + 56 : at("burst") ? ITEM_CY : GIFT_CY;
  const lightOn = at("burst") ? 1 : phase === "charging" ? 0.3 + charge * 0.18 : phase === "pulling" ? 0.25 : landed ? 0.18 : 0;
  const silhouette = `brightness(0) drop-shadow(0 0 14px ${R.tint.glow})`;
  const W = o.kind === "weapon" ? WEAPONS[o.weapon] : null;

  return (
    <div
      ref={rootRef}
      className="absolute inset-0 z-[60] overflow-hidden"
      onPointerDown={phase === "ready" ? tap : undefined}
      style={{ background: "radial-gradient(ellipse 90% 60% at 50% 42%, #173037 0%, #0c1b20 55%, #050c10 100%)", animation: "fx-fade-in .35s ease both" }}
    >
      <Dust />

      {/* rarity light + rays (colour = box rarity) */}
      <div className="pointer-events-none absolute inset-0" style={{ opacity: lightOn, background: `radial-gradient(circle at 220px ${cy}px, ${S.tint.glow} 0%, transparent 320px)`, transition: "opacity .6s, background .15s" }} />
      <div
        className="anim-rays pointer-events-none absolute h-[640px] w-[640px] rounded-full"
        style={{
          left: 220 - 320,
          top: cy - 320,
          opacity: lightOn,
          transition: "opacity .6s, top .8s cubic-bezier(.5,0,.2,1.1)",
          background: `repeating-conic-gradient(from 0deg, ${S.ray} 0deg 6deg, transparent 6deg 18deg)`,
          WebkitMaskImage: "radial-gradient(circle, black 10%, transparent 62%)",
          maskImage: "radial-gradient(circle, black 10%, transparent 62%)",
        }}
      />
      {landed && phase === "ready" && tugs === 0 && <div className="anim-flash pointer-events-none absolute inset-0 z-30" style={{ background: R.tint.core, opacity: 0.45 }} />}

      {/* top pill */}
      <div className="absolute inset-x-0 top-[70px] flex justify-center">
        <div className="anim-pop rounded-full bg-gradient-to-b from-[#ffe27a] to-[#ffb81c] px-4 py-1.5 font-russo text-[12px] tracking-[0.14em] text-[#4a2a00] shadow-[0_3px_0_#9a5200,0_6px_14px_rgba(0,0,0,0.35)]">
          ★ BONUS REWARD STAGE ★
        </div>
      </div>

      {/* ---------- HEADER (wave title + rarity badge) ---------- */}
      <div
        className="absolute inset-x-0 top-[112px] flex flex-col items-center px-6 transition-all duration-500"
        style={{ opacity: at("pulling") ? 0 : 1, transform: at("pulling") ? "translateY(-24px)" : "none" }}
      >
        <Title3D text="PIRATE CAPTAIN" variant="gold" size={36} anim="drop" stagger={30} delay={100} wave={1500} />
        <Title3D text="DEFEATED!" variant="gold" size={50} anim="slam" stagger={45} delay={550} wave={2050} className="-mt-0.5" />
        <div className="mt-4 flex h-[40px] items-center">
          {landed ? (
            <div
              className="flex items-center gap-2 rounded-full border-2 bg-black/45 py-1 pl-2 pr-4"
              style={{ borderColor: R.color, boxShadow: `0 0 22px ${R.tint.glow}`, animation: "label-pop .5s cubic-bezier(.2,.9,.3,1.3) both" }}
            >
              <span className="text-[20px]">🎁</span>
              <span className="font-russo text-[12px] tracking-[0.18em] text-white/80">GIFT</span>
              <span className="font-lilita text-[24px] leading-none tracking-wide" style={{ color: R.color, textShadow: `0 2px 0 ${R.dark}` }}>
                {o.rarity === "legend" ? "★ " : ""}
                {R.label}
              </span>
            </div>
          ) : (
            <div className="font-body text-[17px] text-white/75">
              Spinning gift
              <span style={{ animation: "dots-blink 1s infinite" }}>.</span>
              <span style={{ animation: "dots-blink 1s .2s infinite" }}>.</span>
              <span style={{ animation: "dots-blink 1s .4s infinite" }}>.</span>
            </div>
          )}
        </div>
      </div>

      {/* soft glow behind gift */}
      {!at("burst") && (
        <div
          className="pointer-events-none absolute h-[320px] w-[320px] rounded-full"
          style={{ left: 60, top: GIFT_CY - 160, background: `radial-gradient(circle, ${S.tint.glow}, transparent 65%)`, opacity: 0.55, animation: "fx-glow-pulse 2.4s ease-in-out infinite", transition: "background .15s" }}
        />
      )}

      {/* ---------- GIFT ---------- */}
      <div ref={boxRef} className="absolute" style={{ left: 90, top: GIFT_TOP, transformOrigin: "130px 242px" }}>
        <GiftBox phase={phase} tugs={tugs} tint={R.tint} charge={charge} box={shown} />
      </div>

      {/* colour-pop particles from each squeeze */}
      {pops.map((pp) => (
        <div key={pp.id} className="pointer-events-none absolute z-20" style={{ left: 220, top: GIFT_TOP + 160 }}>
          <span
            className="absolute rounded-full"
            style={{
              left: pp.big ? -110 : -80,
              top: pp.big ? -110 : -80,
              width: pp.big ? 220 : 160,
              height: pp.big ? 220 : 160,
              border: `${pp.big ? 8 : 5}px solid ${pp.color}`,
              boxShadow: `0 0 24px ${pp.color}`,
              animation: `shock ${pp.big ? 0.8 : 0.5}s ease-out both`,
            }}
          />
          {Array.from({ length: pp.big ? 16 : 8 }).map((_, k, arr) => {
            const a = (k / arr.length) * Math.PI * 2 + (pp.id % 2) * 0.3;
            const r = pp.big ? 190 : 125;
            return (
              <span
                key={k}
                className="absolute font-lilita leading-none"
                style={
                  {
                    left: -9,
                    top: -9,
                    fontSize: pp.big ? (k % 2 ? 26 : 18) : k % 2 ? 18 : 12,
                    color: k % 3 === 0 ? "#ffffff" : pp.color,
                    textShadow: `0 0 10px ${pp.color}`,
                    "--bx": `${Math.cos(a) * r}px`,
                    "--by": `${Math.sin(a) * r * 0.75}px`,
                    animation: `knot-star ${pp.big ? 0.9 : 0.5}s cubic-bezier(.15,.8,.4,1) both`,
                  } as React.CSSProperties
                }
              >
                {k % 2 ? "✦" : "●"}
              </span>
            );
          })}
        </div>
      ))}

      {phase === "ready" && (
        <div className="pointer-events-none absolute text-[50px]" style={{ left: 252, top: GIFT_TOP + 36, animation: "hand-pull 1s ease-in-out infinite" }}>
          👆
        </div>
      )}

      {/* ---------- ITEM ---------- */}
      {at("burst") && (
        <div
          className="pointer-events-none absolute inset-x-0 z-20 flex justify-center"
          style={{ top: ITEM_TOP, transform: phase === "info" ? "translateY(56px) scale(0.88)" : "none", transition: "transform .8s cubic-bezier(.5,0,.2,1.1)" }}
        >
          <div className="relative" style={{ animation: "fx-weapon-rise 1s cubic-bezier(.2,.8,.3,1) both" }}>
            {phase === "burst" && (
              <div className="anim-rays pointer-events-none absolute left-1/2 top-1/2 -ml-[190px] -mt-[190px]" style={{ animationDuration: "14s" }}>
                <Spiky color={R.color} />
              </div>
            )}
            <div style={{ animation: "weapon-hover 3s ease-in-out infinite 1s" }}>
              <div
                key={`sw${swap}`}
                className="flex min-h-[190px] items-center justify-center"
                style={{ animation: swap === 0 ? undefined : itemLanded ? "sil-land .45s cubic-bezier(.2,.9,.3,1.2) both" : "sil-squeeze .15s cubic-bezier(.3,1.4,.5,1) both" }}
              >
                <div style={{ filter: phase === "burst" ? silhouette : `drop-shadow(0 0 22px ${R.tint.glow})`, transition: "filter .35s ease-out" }}>
                  <ItemArt c={phase === "burst" ? cand : finalCand} />
                </div>
              </div>
            </div>
            {phase === "burst" && !itemLanded && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <span style={{ animation: "pop .45s cubic-bezier(.2,.9,.3,1.3) .35s both" }}>
                  <span
                    key={`q${swap}`}
                    className="block font-lilita text-[96px] leading-none text-white"
                    style={{
                      textShadow: `0 0 20px ${R.tint.glow}, 0 0 40px ${R.tint.glow}, 0 5px 0 rgba(0,0,0,0.55)`,
                      animation: swap === 0 ? "q-pulse 1s ease-in-out .8s infinite" : "q-squeeze .16s ease-out both",
                    }}
                  >
                    ?
                  </span>
                </span>
              </div>
            )}
            {phase === "burst" && itemLanded && (
              <span
                className="absolute -right-3 -top-5 font-lilita text-[64px] leading-none"
                style={{ color: R.color, textShadow: `0 4px 0 ${R.dark}, 0 0 22px ${R.tint.glow}`, animation: "mark-pop .4s cubic-bezier(.2,.9,.3,1.3) both" }}
              >
                !
              </span>
            )}
          </div>
        </div>
      )}

      {phase === "burst" && (
        <div className="pointer-events-none absolute inset-x-0 top-[136px] z-20" style={{ animation: "fx-fade-up .4s ease .5s both" }}>
          <Title3D text="WHAT'S INSIDE?" variant="white" size={42} anim="slam" stagger={35} delay={500} wave={1300} />
        </div>
      )}
      {phase === "burst" && itemLanded && (
        <div className="pointer-events-none absolute z-30 h-[140px] w-[140px] rounded-full border-[6px]" style={{ left: 150, top: ITEM_TOP + 26, borderColor: R.color, animation: "shock .7s ease-out both" }} />
      )}
      {phase === "burst" && (
        <>
          <div className="anim-flash pointer-events-none absolute inset-0 z-30" style={{ background: R.tint.core, opacity: 0.6 }} />
          <div className="pointer-events-none absolute z-30 h-[120px] w-[120px] rounded-full border-[6px]" style={{ left: 160, top: GIFT_TOP + 56, borderColor: R.color, animation: "shock .8s ease-out both" }} />
          <Confetti x={220} y={GIFT_TOP + 116} colors={R.confetti} />
        </>
      )}
      {phase === "reveal" && (
        <>
          <div className="pointer-events-none absolute inset-0 z-30 bg-white" style={{ animation: "fx-flash .7s ease-out both" }} />
          <div className="pointer-events-none absolute z-30 h-[160px] w-[160px] rounded-full border-[8px]" style={{ left: 140, top: ITEM_TOP + 40, borderColor: R.tint.core, animation: "shock .9s ease-out both" }} />
          <Confetti x={220} y={ITEM_TOP + 120} count={o.rarity === "legend" ? 30 : 20} colors={R.confetti} />
        </>
      )}

      {/* ---------- TAP PROMPT ---------- */}
      {phase === "ready" && (
        <div className="anim-fade-up pointer-events-none absolute inset-x-0 top-[612px] flex flex-col items-center">
          <div className="flex gap-3">
            {Array.from({ length: TAPS }).map((_, k) => (
              <span
                key={k + (k < tugs ? "f" : "e")}
                className="block h-[20px] w-[20px] rounded-full border-[3px]"
                style={
                  k < tugs
                    ? { borderColor: R.color, background: `radial-gradient(circle at 35% 30%, #fff, ${R.color} 60%)`, boxShadow: `0 0 12px ${R.tint.glow}`, animation: "dot-fill .35s ease-out both" }
                    : { borderColor: R.color }
                }
              />
            ))}
          </div>
          <div className="mt-4 font-lilita text-[34px] tracking-wide text-white" style={{ textShadow: "0 3px 0 rgba(0,0,0,0.5), 0 0 18px rgba(0,0,0,0.4)", animation: "tap-pulse 1.1s ease-in-out infinite" }}>
            TAP TO OPEN!
          </div>
          <div className="mt-1.5 font-body text-[15px] text-white/60">{tugs === 0 ? "Pull the ribbon 3x" : `Pull ${TAPS - tugs}x more!`}</div>
        </div>
      )}

      {/* ---------- INFO ---------- */}
      {phase === "info" && (
        <>
          <div className="absolute inset-x-0 top-[108px] flex flex-col items-center">
            <div
              className="anim-pop flex items-center gap-1.5 rounded-full border-2 bg-black/45 px-4 py-1 font-lilita text-[17px] tracking-[0.12em]"
              style={{ borderColor: R.color, color: R.color, boxShadow: `0 0 18px ${R.tint.glow}` }}
            >
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: R.color, boxShadow: `0 0 8px ${R.color}` }} /> {R.label}
            </div>
            <Title3D
              text={o.kind === "weapon" ? "NEW WEAPON!" : o.kind === "coin" ? "BONUS COINS!" : "DIAMOND!"}
              variant={o.kind === "weapon" ? "green" : o.kind === "coin" ? "gold" : "white"}
              size={46}
              anim="slam"
              stagger={38}
              delay={150}
              className="mt-2"
              sound
            />
            <div className="mt-2 flex gap-1.5">
              {[0, 1, 2, 3].map((k) => {
                const on = k <= R.rank;
                return (
                  <span
                    key={k}
                    style={{
                      animation: `star-in .5s cubic-bezier(.2,.9,.3,1.3) ${0.45 + k * 0.13}s both`,
                      filter: on ? "drop-shadow(0 3px 0 #9a5200) drop-shadow(0 0 8px rgba(255,210,60,0.7))" : "drop-shadow(0 2px 0 rgba(0,0,0,0.4))",
                    }}
                  >
                    <Star size={30} fill={on ? "#ffd23a" : "#2c454b"} />
                  </span>
                );
              })}
            </div>
          </div>

          <div className="absolute inset-x-0 top-[470px] flex flex-col items-center px-7">
            {W ? (
              <>
                <div className="anim-fade-up flex flex-wrap justify-center gap-2" style={{ animationDelay: "0.9s" }}>
                  <span className="relative flex items-center gap-1.5 rounded-full border bg-black/60 px-3.5 py-1.5 font-lilita text-[18px]" style={{ borderColor: `${R.color}88`, color: R.color }}>
                    <span className="text-[14px]">✦</span> {W.name}
                    <span
                      className="absolute -right-5 -top-4 rounded-md bg-gradient-to-b from-[#ff6a4d] to-[#d92a17] px-1.5 py-0.5 font-lilita text-[13px] text-white shadow-[0_2px_0_#8f1608]"
                      style={{ animation: "new-stamp .45s cubic-bezier(.2,.9,.3,1.3) 1.3s both", border: "1.5px solid #fff" }}
                    >
                      NEW!
                    </span>
                  </span>
                  <span className="flex items-center gap-1 rounded-full px-3.5 py-1.5 font-lilita text-[16px] text-white shadow-[0_2px_0_rgba(0,0,0,0.35)]" style={{ background: W.tagBg }}>
                    {W.tag}
                  </span>
                </div>
                <p className="anim-fade-up mt-3.5 text-center font-body text-[16px] leading-[1.45] text-white/85" style={{ animationDelay: "1.05s" }}>
                  {W.desc}
                </p>
                <div ref={payRef} className="anim-pop mt-4 flex items-center gap-2 rounded-full border border-[#ffc531]/40 bg-black/40 py-1.5 pl-2 pr-4" style={{ animationDelay: "1.2s" }}>
                  <Coin size={28} />
                  <span className="font-lilita text-[24px] text-[#ffc531]" style={{ textShadow: "0 2px 0 #7a4200" }}>
                    +{o.kind === "weapon" ? o.bonus : 0} COINS
                  </span>
                </div>
                <div className="anim-fade-up mt-2.5 font-russo text-[11px] tracking-[0.2em] text-white/55" style={{ animationDelay: "1.35s" }}>
                  WEAPON COLLECTION <span className="text-white">{Math.min(ALL_WEAPONS.length, owned.length + 1)}</span>/{ALL_WEAPONS.length}
                </div>
              </>
            ) : (
              <>
                <div ref={payRef} className="anim-pop flex items-center gap-3" style={{ animationDelay: "0.9s" }}>
                  {o.kind === "coin" ? <Coin size={54} /> : <Diamond size={54} />}
                  <span
                    className="font-lilita text-[64px] leading-none"
                    style={{ color: o.kind === "coin" ? "#ffc531" : "#bfeaff", textShadow: `0 5px 0 ${o.kind === "coin" ? "#7a4200" : "#0c4c91"}, 0 10px 18px rgba(0,0,0,0.45)` }}
                  >
                    +{o.kind !== "weapon" ? o.amount : 0}
                  </span>
                </div>
                <p className="anim-fade-up mt-3 text-center font-body text-[16px] text-white/80" style={{ animationDelay: "1.1s" }}>
                  {o.kind !== "weapon" && o.fallback
                    ? `All ${R.label} weapons already unlocked!`
                    : o.kind === "coin"
                      ? "Coins added straight to your wallet!"
                      : "Rare diamonds for revives & upgrades!"}
                </p>
              </>
            )}
          </div>

          <div className="absolute inset-x-6 top-[680px] flex flex-col items-center">
            <div className="relative w-full" style={{ animation: "pop .45s cubic-bezier(.2,.9,.3,1.25) 1.35s both" }}>
              <div className="pointer-events-none absolute -inset-x-1 -bottom-2 top-2 rounded-[26px] bg-[#3cf266] blur-xl" style={{ animation: "fx-glow-breathe 2.2s ease-in-out infinite" }} />
              <button data-sfx="none" onClick={() => finish(W ? "equip" : "claim")} className="b3d b3d-green h-[70px] w-full">
                <span className="b3d-move b3d-face justify-center gap-3 text-white">
                  <span className="lbl-3d relative z-10 font-lilita text-[30px] tracking-wide">{W ? "EQUIP & CONTINUE" : "CLAIM REWARD"}</span>
                  <svg className="relative z-10" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 12h15M13 6l6 6-6 6" />
                  </svg>
                </span>
              </button>
            </div>
            {W && (
              <button
                onClick={() => finish("keep")}
                className="anim-fade-up mt-4 px-4 py-2 font-body text-[16px] text-white/55 underline decoration-white/30 underline-offset-4 hover:text-white/80"
                style={{ animationDelay: "1.6s" }}
              >
                Continue without changing weapon
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
