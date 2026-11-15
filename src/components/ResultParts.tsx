import { Suspense, lazy, useContext, useEffect, useRef, useState } from "react";
import { AdBadge, Coin, Diamond, HomeIcon, RetryIcon, TvIcon } from "./Icons";
import { sfx } from "../audio/sfx";
import { WeaponArt, type WeaponId } from "./Weapons";
import { AdsBlockedContext, RetryTag } from "./FancyButtons";

/**
 * Senjata Gun Hit yang sedang dipakai pemain — chunk-nya lazy supaya rantai art
 * Gun Hit tidak ikut paket shell (dipanaskan saat boot oleh GameClient).
 */
const EquippedGunArt = lazy(() => import("../games/gunhit/components/EquippedGunArt"));

/* ---------------- shared props ---------------- */
export type ResultsProps = {
  stage: number;
  score: number;
  prevBest: number;
  hits: number;
  totalTargets: number;
  reward: number;
  gems: number;
  adDiamonds: number;
  adDiamondsLeft: number;
  doubleUsed: boolean;
  onShake: (p: number) => void;
  onFly: (kind: "coin" | "diamond", el: HTMLElement | null, amount: number) => void;
  onBest: (best: number) => void;
  onDouble: () => void;
  onAdDiamonds: () => void;
  onRetry: () => void;
  onHome: () => void;
  gift: "new" | "opened";
  gun: WeaponId;
  /** Senjata Gun Hit yang sedang dipakai saat run ini berakhir (bila ada). */
  equippedGun?: string | null;
  onGift: () => void;
  /** V5: layout without the weapon showcase */
  hideGun?: boolean;
};

/**
 * Showcase senjata di layar hasil: senjata Gun Hit yang sedang dipakai selalu
 * menang bila diberikan; tanpa itu jatuh ke rak senjata Perfect Shot seperti
 * semula (shell ini juga dipakai menu PS standalone).
 */
export function ShowcaseGun({ equippedGun, psGun, scale, tilt }: { equippedGun?: string | null; psGun: WeaponId; scale: number; tilt: number }) {
  if (!equippedGun) return <WeaponArt id={psGun} scale={scale} tilt={tilt} />;
  return (
    <Suspense fallback={null}>
      <EquippedGunArt id={equippedGun} tilt={tilt} />
    </Suspense>
  );
}

/* ---------------- hooks ---------------- */
export function useTimeline<K extends string>(steps: Record<K, number>) {
  const order = Object.keys(steps) as K[];
  const [step, setStep] = useState(-1);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    timers.current = order.map((k, i) => window.setTimeout(() => setStep((c) => Math.max(c, i)), steps[k]));
    return () => timers.current.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const intro = step < order.length - 1;
  return {
    step,
    order,
    intro,
    at: (k: K) => step >= order.indexOf(k),
    skip: () => {
      if (!intro) return;
      timers.current.forEach(clearTimeout);
      setStep(order.length - 1);
    },
  };
}

export function useOnce() {
  const fired = useRef<Record<string, boolean>>({});
  return (key: string, cond: boolean, fn: () => void) => {
    if (cond && !fired.current[key]) {
      fired.current[key] = true;
      fn();
    }
  };
}

export function useCountUp(end: number, active: boolean, duration = 900, sound = true) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!active) return;
    let raf = 0;
    let last = -1;
    const s = performance.now();
    const tick = (t: number) => {
      const k = Math.min(1, (t - s) / duration);
      const val = Math.round(end * (1 - Math.pow(1 - k, 3)));
      if (sound && val !== last && val > 0) sfx.tick(k);
      last = val;
      setV(val);
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, end, duration]);
  return v;
}

/** plays a sound for each newly reached timeline step; a single whoosh when skipped */
export function useStepSfx<K extends string>(step: number, order: K[], play: (k: K) => void, onSkip?: () => void) {
  const prev = useRef(-1);
  useEffect(() => {
    const from = prev.current;
    prev.current = step;
    if (step <= from) return;
    if (step - from > 1 && from >= 0) {
      sfx.skip();
      onSkip?.();
      return;
    }
    for (let i = from + 1; i <= step; i++) play(order[i]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);
}

/* ---------------- pieces ---------------- */
export const fmt = (n: number) => n.toLocaleString("en-US");

export function Trophy({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#ffc531">
      <path d="M7 3h10v2h4v3a4 4 0 0 1-4.3 4A5 5 0 0 1 13 15v3h3v3H8v-3h3v-3a5 5 0 0 1-3.7-3A4 4 0 0 1 3 8V5h4zm-2 4v1a2 2 0 0 0 2 2V7zm14 0h-2v3a2 2 0 0 0 2-2z" />
    </svg>
  );
}

export function NewBestRibbon({ className = "" }: { className?: string }) {
  return (
    <div className={`pointer-events-none absolute z-10 ${className}`}>
      <div
        className="anim-ribbon relative whitespace-nowrap rounded-xl px-3.5 py-1 font-lilita text-[19px] text-white"
        style={{
          background: "linear-gradient(180deg,#ff6a4d,#d92a17)",
          boxShadow: "0 4px 0 #8f1608, 0 8px 16px rgba(0,0,0,0.4)",
          textShadow: "0 2px 0 rgba(0,0,0,0.3)",
        }}
      >
        NEW BEST!
      </div>
      {Array.from({ length: 10 }).map((_, i) => (
        <span
          key={i}
          className="absolute left-1/2 top-1/2 h-2 w-2 rotate-45 bg-[#ffd84a]"
          style={
            {
              "--bx": `${Math.cos((i / 10) * Math.PI * 2) * 64}px`,
              "--by": `${Math.sin((i / 10) * Math.PI * 2) * 46}px`,
              animation: `sparkle-burst .7s ease-out ${0.1 + (i % 3) * 0.05}s both`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}

const POP = "pop .42s cubic-bezier(.2,.9,.3,1.2)";

export function HomeButton({ show, onClick, delay = 0 }: { show: boolean; onClick: () => void; delay?: number }) {
  return (
    <button
      onClick={onClick}
      className={`btn-glossy btn-red flex h-[62px] flex-1 items-center justify-center font-lilita text-[25px] text-white ${show ? "" : "invisible"}`}
      style={{ textShadow: "0 2px 0 rgba(0,0,0,0.3)", animation: show ? `${POP} ${delay}s both` : undefined }}
    >
      <span className="relative z-10 flex items-center gap-2">
        <HomeIcon /> HOME
      </span>
    </button>
  );
}

/** Retry needs an ad → AD badge sits on the corner, outside the clipped button */
export function RetryButton({ show, onClick, delay = 0.08, grow = 1.3 }: { show: boolean; onClick: () => void; delay?: number; grow?: number }) {
  return (
    <div className={`relative ${show ? "" : "invisible"}`} style={{ flex: grow, animation: show ? `${POP} ${delay}s both` : undefined }}>
      <button
        onClick={onClick}
        className="btn-glossy btn-green flex h-[62px] w-full items-center justify-center font-lilita text-[27px] text-white"
        style={{ textShadow: "0 2px 0 rgba(0,0,0,0.25)", animation: show ? `glow-green 1.4s ease-out ${delay + 0.7}s infinite` : undefined }}
      >
        <span className="relative z-10 flex items-center gap-2">
          RETRY <RetryIcon />
        </span>
      </button>
      <RetryTag className="-right-2 -top-3" />
    </div>
  );
}

export function FreeDiamondsBar({ show, left, amount, onClick }: { show: boolean; left: number; amount: number; onClick: () => void }) {
  const on = left > 0;
  const adsBlocked = useContext(AdsBlockedContext);
  if (adsBlocked) return null;
  return (
    <button
      onClick={onClick}
      disabled={!on}
      className={`relative flex h-[50px] w-full items-center gap-3 overflow-hidden rounded-2xl border px-3.5 transition active:scale-[0.98] ${
        show ? "anim-fade-up" : "invisible"
      } ${on ? "border-[#56c8ff]/40 bg-[#0f3a4f]/70" : "border-white/10 bg-black/25 opacity-60"}`}
    >
      {on && (
        <span
          className="pointer-events-none absolute inset-0"
          style={{
            background: "linear-gradient(100deg, transparent 30%, rgba(143,214,255,0.22) 50%, transparent 70%)",
            backgroundSize: "200% 100%",
            animation: "shimmer-border 2.6s linear infinite",
          }}
        />
      )}
      <span className="anim-float relative">
        <Diamond size={28} />
      </span>
      <span className="relative flex flex-1 flex-col items-start leading-none">
        <span className="font-lilita text-[18px] text-white">FREE DIAMONDS</span>
        <span className="mt-1 font-russo text-[9px] tracking-wider text-[#8fd3ff]">
          {on ? `${left} ADS LEFT TODAY` : "COME BACK TOMORROW"}
        </span>
      </span>
      <span className="relative font-lilita text-[20px] text-[#8fd6ff]" style={{ textShadow: "0 2px 0 #0c4c91" }}>
        +{amount}
      </span>
      <AdBadge className="relative" />
    </button>
  );
}

export function TapToSkip({ show, bottom = 78 }: { show: boolean; bottom?: number }) {
  if (!show) return null;
  return (
    <div
      className="anim-fade pointer-events-none absolute left-0 right-0 text-center font-russo text-[10px] tracking-[0.3em] text-white/35"
      style={{ bottom, animationDelay: "0.8s" }}
    >
      TAP TO SKIP
    </div>
  );
}

/** SCORE (gold) on the left + BEST box on the right – shared by V1 & V2 */
export function ScoreRow({ score, best, bestPop, size = 44 }: { score: number; best: number; bestPop: boolean; size?: number }) {
  return (
    <div className="flex items-end justify-between">
      <div>
        <div className="font-russo text-[11px] tracking-widest text-white/55">SCORE</div>
        <div className="txt-gold font-russo leading-none" style={{ fontSize: size }}>
          {fmt(score)}
        </div>
      </div>
      <div className="mb-1 flex flex-col items-end rounded-xl border border-white/10 bg-black/25 px-3 py-1.5">
        <div className="flex items-center gap-1 font-russo text-[10px] tracking-widest text-white/55">
          <Trophy size={12} /> BEST
        </div>
        <div key={best} className={`font-russo text-[21px] leading-none text-white ${bestPop ? "anim-pop" : ""}`}>
          {fmt(best)}
        </div>
      </div>
    </div>
  );
}

/** Reward + "x2 COINS (watch ad)" merged into one bar – shared by V1 & V2 */
export function RewardBar({
  show,
  reward,
  gems,
  doubleUsed,
  onDouble,
  coinRef,
}: {
  show: boolean;
  reward: number;
  gems: number;
  doubleUsed: boolean;
  onDouble: () => void;
  coinRef: React.RefObject<HTMLDivElement | null>;
}) {
  const adsBlocked = useContext(AdsBlockedContext);
  return (
    <div
      className={`flex h-[62px] w-full items-center rounded-2xl border border-[#ffc531]/25 bg-black/30 pl-3 pr-2 ${show ? "anim-pop" : "invisible"}`}
    >
      <div ref={coinRef} className="flex flex-1 items-center gap-2.5">
        <Coin size={32} />
        <div className="leading-none">
          <div className="font-russo text-[10px] tracking-widest text-white/55">REWARD</div>
          <div className="mt-1 flex items-baseline gap-2 font-lilita">
            <span className="text-[26px] text-[#ffc531]" style={{ textShadow: "0 2px 0 #7a4200" }}>
              +{reward}
            </span>
            <span className="flex items-center gap-0.5 text-[18px] text-[#bfeaff]" style={{ textShadow: "0 2px 0 #0c4c91" }}>
              +{gems} <Diamond size={14} />
            </span>
          </div>
        </div>
      </div>
      {adsBlocked ? null : (
      <button
        onClick={onDouble}
        disabled={doubleUsed}
        className={`btn-glossy flex h-[46px] items-center gap-2 rounded-[14px] px-3.5 text-white ${doubleUsed ? "btn-off" : "btn-purple"}`}
      >
        <span className="relative z-10 flex items-center gap-2">
          {doubleUsed ? (
            <span className="font-lilita text-[18px] text-white/60">CLAIMED ✓</span>
          ) : (
            <>
              <TvIcon size={20} />
              <span className="flex flex-col items-start leading-none">
                <span className="font-lilita text-[20px]" style={{ textShadow: "0 2px 0 rgba(0,0,0,0.25)" }}>
                  x2 REWARD
                </span>
                <span className="mt-0.5 font-russo text-[8px] tracking-wider text-white/80">WATCH AD</span>
              </span>
            </>
          )}
        </span>
      </button>
      )}
    </div>
  );
}
