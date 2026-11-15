import { useEffect, useRef } from "react";
import Title3D from "./Title3D";
import { Bullet } from "./Target";
import { Coin, Diamond } from "./Icons";
import { ActionRow, CompactActions, RewardPills } from "./FancyButtons";
import { WEAPONS } from "./Weapons";
import { ShowcaseGun } from "./ResultParts";
import { sfx } from "../audio/sfx";
import {
  NewBestRibbon,
  Trophy,
  fmt,
  useCountUp,
  useOnce,
  useStepSfx,
  useTimeline,
  type ResultsProps,
} from "./ResultParts";

const STEPS = {
  GAME: 0,
  OVER: 380,
  GUN: 820,
  BULLET: 1000,
  CARD: 1150,
  STATS: 1450,
  BEST: 2050,
  REWARD: 2250,
  COINS: 2550,
  BUTTONS: 2650,
  EXTRA: 2900,
};

const GUN_SCALE = 1.8;

export function FlagIcon({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#5df277">
      <path d="M5 2h2v20H5zM8 3h11l-2.5 4L19 11H8z" />
    </svg>
  );
}
export function TargetIcon({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#ff5a46" strokeWidth="2.6">
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="4.5" />
      <circle cx="12" cy="12" r="1" fill="#ff5a46" />
    </svg>
  );
}
export function CrosshairIcon({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#8fd3ff" strokeWidth="2.6" strokeLinecap="round">
      <circle cx="12" cy="12" r="7.5" />
      <path d="M12 1.5v5M12 17.5v5M1.5 12h5M17.5 12h5" />
    </svg>
  );
}

/** one cell of the stats strip – tinted icon badge + big value */
export function Cell({ icon, label, value, color, show, delay }: { icon: React.ReactNode; label: string; value: string; color: string; show: boolean; delay: number }) {
  return (
    <div
      className={`flex flex-1 items-center justify-center gap-2 ${show ? "" : "invisible"}`}
      style={{ animation: show ? `pop .42s cubic-bezier(.2,.9,.3,1.2) ${delay}s both` : undefined }}
    >
      <span
        className="flex h-[28px] w-[28px] shrink-0 items-center justify-center rounded-[9px]"
        style={{
          background: `linear-gradient(180deg, ${color}38, ${color}14)`,
          boxShadow: `inset 0 0 0 1.5px ${color}66, inset 0 2px 0 rgba(255,255,255,0.12), 0 0 12px ${color}22`,
        }}
      >
        {icon}
      </span>
      <span className="flex flex-col items-start leading-none">
        <span className="font-russo text-[9.5px] tracking-wider text-white/55">{label}</span>
        <span className="mt-[3px] font-russo text-[18px]" style={{ color, textShadow: "0 2px 0 rgba(0,0,0,0.5)" }}>
          {value}
        </span>
      </span>
    </div>
  );
}

/** the full stats strip (used by V2, V3, V5) */
export function StatsStrip({ stage, hits, shots, acc, show }: { stage: number; hits: number; shots: number; acc: number; show: boolean }) {
  const div = <span className="h-6 w-px bg-gradient-to-b from-transparent via-white/20 to-transparent" />;
  return (
    <div className="flex h-[46px] items-center rounded-[14px] border border-white/10 bg-black/30 px-1 shadow-[inset_0_2px_6px_rgba(0,0,0,0.3),inset_0_-1px_0_rgba(255,255,255,0.05)]">
      <Cell icon={<FlagIcon size={14} />} label="STAGE" value={String(stage)} color="#7dff9a" show={show} delay={0} />
      {div}
      <Cell icon={<TargetIcon size={14} />} label="HITS" value={`${hits}/${shots}`} color="#ff8a7a" show={show} delay={0.08} />
      {div}
      <Cell icon={<CrosshairIcon size={14} />} label="ACC" value={`${acc}%`} color="#8fd8ff" show={show} delay={0.16} />
    </div>
  );
}

/** shared timeline / sound / counters for the showcase layouts (V2–V4) */
export function useShowcase(p: ResultsProps) {
  const { at, intro, skip, step, order } = useTimeline(STEPS);
  const once = useOnce();
  const rewardRef = useRef<HTMLDivElement>(null);
  const gemRef = useRef<HTMLSpanElement>(null);
  const isNewBest = p.score > p.prevBest;

  const shots = p.hits + 1;
  const accuracy = Math.round((p.hits / shots) * 100);

  useEffect(() => {
    once("shake", at("OVER"), () => setTimeout(() => p.onShake(12), 230));
    once("best", at("BEST") && isNewBest, () => p.onBest(p.score));
    once("coins", at("COINS"), () => {
      setTimeout(() => p.onFly("coin", rewardRef.current, p.reward), 120);
      setTimeout(() => p.onFly("diamond", gemRef.current, p.gems), 420);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  useStepSfx(
    step,
    order,
    (k) => {
      switch (k) {
        case "OVER":
          setTimeout(sfx.boom, 230);
          break;
        case "GUN":
          if (!p.hideGun) sfx.gunSpin();
          setTimeout(sfx.gameOverJingle, 350);
          break;
        case "BULLET":
          sfx.bulletWhiz();
          break;
        case "CARD":
          sfx.whoosh(true, 0.3, 0.14);
          break;
        case "STATS":
          [0, 80, 160].forEach((d, i) => setTimeout(() => sfx.pop(0.9 + i * 0.15), d));
          break;
        case "BEST":
          if (isNewBest) sfx.newBest();
          break;
        case "REWARD":
          sfx.pop(1.1);
          break;
        case "BUTTONS":
          sfx.pop(0.9);
          setTimeout(() => sfx.pop(1.2), 90);
          break;
        case "EXTRA":
          sfx.softPop();
          setTimeout(() => sfx.softPop(), 80);
          break;
      }
    },
    () => {
      if (isNewBest) sfx.newBest();
    },
  );

  const score = useCountUp(p.score, at("CARD"), 950);
  const acc = useCountUp(accuracy, at("STATS"), 700, false);
  const reward = useCountUp(p.reward, at("REWARD"), 500);
  const best = at("BEST") && isNewBest ? p.score : p.prevBest;

  return { at, step, intro, skip, rewardRef, gemRef, isNewBest, shots, score, acc, reward, best };
}

/** V2 – "Showcase" layout */
export default function ResultsV2(p: ResultsProps) {
  const { at, intro, skip, rewardRef, gemRef, isNewBest, shots, score, acc, reward, best } = useShowcase(p);
  const ng = !!p.hideGun;

  return (
    <div className={`relative flex h-full flex-col items-center ${ng ? "px-6 pt-[78px]" : "px-[34px] pt-[60px]"}`} onPointerDown={intro ? skip : undefined}>
      {/* ---------- TITLE (kept above the big gun) ---------- */}
      <div className="relative z-20 w-full" style={{ animation: at("GUN") ? "title-bob 3.2s ease-in-out infinite" : undefined }}>
        <Title3D text="GAME" variant="red" size={ng ? 86 : 70} anim="drop" stagger={70} sound />
        <div className="-mt-2">
          {at("OVER") ? <Title3D text="OVER" variant="gold" size={ng ? 96 : 78} anim="slam" stagger={55} /> : <div style={{ height: ng ? 92 : 74 }} />}
        </div>
        {at("BULLET") && (
          <div className="pointer-events-none absolute left-0 top-[64px]" style={{ animation: "bullet-across .7s cubic-bezier(.3,.1,.4,1) both" }}>
            <Bullet className="scale-75" />
          </div>
        )}
      </div>

      {ng && (
        <div className={`mt-3 flex items-center gap-2 font-russo text-[14px] tracking-wider text-white txt-outline ${at("GUN") ? "anim-fade-up" : "invisible"}`}>
          STAGE {p.stage}
          <span className="inline-block h-2.5 w-2.5 rotate-45 bg-[#ffb81c]" />
          TARGET MISSED
        </div>
      )}

      {/* ---------- GUN (1.8×) ---------- */}
      {!ng && (
      <div className="relative z-10 -mt-2 flex h-[188px] w-full items-center justify-center">
        {at("GUN") && (
          <>
            <div className="rays anim-rays anim-fade absolute h-[400px] w-[400px] rounded-full opacity-55" />
            <div className="absolute bottom-0 h-7 w-56 rounded-[50%] bg-black/45 blur-md" />
            <div style={{ animation: "gun-in .75s cubic-bezier(.2,.8,.3,1.1) both", marginTop: 6 }}>
              <div className="anim-float">
                <div style={{ filter: WEAPONS[p.gun].aura ? `drop-shadow(0 0 18px ${WEAPONS[p.gun].aura})` : undefined }}>
                  <ShowcaseGun psGun={p.gun} equippedGun={p.equippedGun} scale={GUN_SCALE} tilt={-8} />
                </div>
              </div>
            </div>
            {[
              { x: 22, y: 30, d: 0.3 },
              { x: 360, y: 70, d: 0.8 },
              { x: 330, y: 8, d: 1.3 },
            ].map((s, i) => (
              <span key={i} className="absolute text-white" style={{ left: s.x, top: s.y, fontSize: 15, animation: `fx-twinkle 2s ease-in-out ${s.d}s infinite` }}>
                ✦
              </span>
            ))}
          </>
        )}
      </div>
      )}

      {/* ---------- SCORE CARD ---------- */}
      <div className={`panel relative w-full rounded-[24px] px-4 ${ng ? "mt-9 pb-5 pt-5" : "pb-3.5 pt-3"} ${at("CARD") ? "anim-slide-up" : "invisible"}`}>
        {ng && <div className="rays anim-rays pointer-events-none absolute left-1/2 top-[-40px] h-[220px] w-[220px] -translate-x-1/2 rounded-full opacity-40" />}
        <div className={`relative text-center font-russo tracking-[0.35em] text-white/55 ${ng ? "text-[13px]" : "text-[11px]"}`}>SCORE</div>
        <div className="relative grid grid-cols-[1fr_auto_1fr] items-center">
          <span />
          <div className={`txt-gold relative font-russo leading-none ${ng ? "mt-1 text-[66px]" : "text-[48px]"}`}>{fmt(score)}</div>
          {/* collected coins + diamonds – appear next to the score once it has finished counting */}
          <div className="flex min-w-0 flex-col items-start gap-1 pl-2.5">
            {at("REWARD") && (
              <>
                <div
                  ref={rewardRef}
                  className="flex items-center gap-1 whitespace-nowrap rounded-full border border-[#ffc531]/35 bg-black/35 py-[2px] pl-[3px] pr-2"
                  style={{ animation: "reward-side .5s cubic-bezier(.2,.9,.3,1.2) both" }}
                >
                  <Coin size={20} />
                  <span className="font-lilita text-[17px] leading-none text-[#ffc531]" style={{ textShadow: "0 2px 0 #7a4200" }}>
                    +{reward}
                  </span>
                </div>
                <span
                  ref={gemRef}
                  className="flex items-center gap-1 whitespace-nowrap rounded-full border border-[#8fd6ff]/35 bg-black/35 py-[2px] pl-[3px] pr-2"
                  style={{ animation: "reward-side .5s cubic-bezier(.2,.9,.3,1.2) .12s both" }}
                >
                  <Diamond size={18} />
                  <span className="font-lilita text-[16px] leading-none text-[#bfeaff]" style={{ textShadow: "0 2px 0 #0c4c91" }}>
                    +{p.gems}
                  </span>
                </span>
              </>
            )}
          </div>
        </div>

        <div className="mt-2 flex justify-center">
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-black/25 px-3 py-[3px]">
            <span className="flex items-center gap-1 font-russo text-[10.5px] tracking-widest text-white/55">
              <Trophy size={12} /> BEST
            </span>
            <span key={best} className={`inline-block font-russo text-[17px] leading-tight text-white ${at("BEST") && isNewBest ? "anim-pop" : ""}`}>
              {fmt(best)}
            </span>
          </div>
        </div>

        <div className="mt-3">
          <StatsStrip stage={p.stage} hits={p.hits} shots={shots} acc={acc} show={at("STATS")} />
        </div>

        {at("BEST") && isNewBest && <NewBestRibbon className="-right-4 -top-4" />}

      </div>

      {/* ---------- BUTTONS ---------- */}
      <div className="mx-auto mt-7" style={{ width: ng ? "100%" : 308 }}>
        {ng ? <CompactActions show={at("BUTTONS")} onHome={p.onHome} onRetry={p.onRetry} /> : <ActionRow show={at("BUTTONS")} onHome={p.onHome} onRetry={p.onRetry} />}
      </div>
      <div className={`flex w-full justify-center ${ng ? "mt-[18px]" : "mt-[22px]"}`}>
        <RewardPills show={at("EXTRA")} doubleUsed={p.doubleUsed} onDouble={p.onDouble} gift={p.gift} onGift={p.onGift} width={ng ? "84%" : "284px"} />
      </div>
    </div>
  );
}
