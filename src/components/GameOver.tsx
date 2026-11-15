import { useEffect, useRef, useState } from "react";
import { Bullet, MissedTarget } from "./Target";
import ReviveModal from "./ReviveModal";
import ResultsV2 from "./ResultsV2";
import ResultsV5 from "./ResultsV5";
import Title3D from "./Title3D";
import { Heart } from "./Icons";
import { sfx } from "../audio/sfx";
import type { WeaponId } from "./Weapons";

export type RunData = {
  id: number;
  score: number;
  hits: number;
  reward: number;
  prevBest: number;
  canRevive: boolean;
  gems: number;
};

export type Version = "v1" | "v2" | "v3" | "v4" | "v5" | "v6";

type Props = {
  /** real game already showed the miss → go straight to the results */
  skipImpact?: boolean;
  version: Version;
  stage: number;
  run: RunData;
  totalTargets: number;
  diamonds: number;
  reviveCost: number;
  adDiamonds: number;
  adDiamondsLeft: number;
  paused: boolean;
  doubleUsed: boolean;
  onShake: (power: number) => void;
  onFly: (kind: "coin" | "diamond", el: HTMLElement | null, amount: number) => void;
  onBest: (best: number) => void;
  onReviveDiamond: () => boolean;
  onReviveAd: (done: () => void) => void;
  onAdDiamonds: () => void;
  onDouble: () => void;
  onRetry: () => void;
  onHome: () => void;
  onRevived: () => void;
  gift: "new" | "opened";
  gun: WeaponId;
  /** Senjata Gun Hit aktif (diteruskan ke kartu hasil). */
  equippedGun?: string | null;
  onGift: () => void;
};

type Phase = "impact" | "revive" | "results" | "revived";

// impact timings (ms)
const HIT = 300;
const STAMP = 430;
const STAMP_OUT = 1150;
const IMPACT_END = 1400;

// target geometry (stage coords)
const T_SIZE = 170;
const T_CX = 220;
const T_CY = 430;
const HOLE_X = T_CX - T_SIZE / 2 + T_SIZE * 0.83;
const HOLE_Y = T_CY - T_SIZE / 2 + T_SIZE * 0.23;
const BULLET_W = 222;

export default function GameOver(p: Props) {
  const [phase, setPhase] = useState<Phase>(p.skipImpact ? "results" : "impact");
  const [impactStep, setImpactStep] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const busy = useRef(false);

  useEffect(() => {
    if (p.skipImpact) return;
    sfx.gunshot();
    sfx.bulletWhiz();
    const t = [
      setTimeout(() => {
        setImpactStep(1);
        p.onShake(12);
        sfx.woodHit();
      }, HIT),
      setTimeout(() => {
        setImpactStep(2);
        sfx.stamp();
      }, STAMP),
      setTimeout(() => sfx.whoosh(true, 0.25, 0.1), STAMP_OUT),
      setTimeout(() => setImpactStep(3), STAMP_OUT),
      setTimeout(() => setPhase("results"), IMPACT_END),
    ];
    return () => t.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const leaveRevive = (next: Phase) => {
    if (busy.current) return;
    busy.current = true;
    setLeaving(true);
    sfx.whoosh(false, 0.28, 0.12);
    setTimeout(() => {
      setLeaving(false);
      setPhase(next);
      if (next === "revived") {
        p.onShake(6);
        sfx.revive();
        setTimeout(p.onRevived, 1500);
      }
    }, 300);
  };

  const inResults = phase === "results";
  const v2 = p.version !== "v1";
  // V1: target shrinks into the header slot. V2: target flies away, revolver takes over.
  const dy = inResults ? (v2 ? -150 : -120) : 0;
  const scale = inResults ? (v2 ? 0.3 : 0.68) : phase === "revived" ? 0.85 : 1;
  const targetOpacity = inResults && v2 ? 0 : 1;
  const raysOpacity = inResults ? (v2 ? 0 : 0.35) : phase === "revived" ? 0.7 : 0;

  // Varian hasil dikunci V5: hanya V2 (dipakai V5) yang dibundel.
  const ResultsComp = p.version === "v5" ? ResultsV5 : ResultsV5;

  return (
    <div className="absolute inset-0 z-10">
      {/* impact flashes */}
      {impactStep >= 1 && phase === "impact" && (
        <>
          <div className="anim-flash pointer-events-none absolute inset-0 z-40 bg-red-600/55" />
          <div
            className="anim-flash pointer-events-none absolute z-40 h-40 w-40 rounded-full bg-white/80 blur-2xl"
            style={{ left: HOLE_X - 80, top: HOLE_Y - 80 }}
          />
        </>
      )}

      {/* rays behind target */}
      <div
        className="rays anim-rays pointer-events-none absolute h-[320px] w-[320px] rounded-full transition-opacity duration-700"
        style={{ left: T_CX - 160, top: T_CY - 160 + dy, opacity: raysOpacity, transition: "top .8s cubic-bezier(.5,0,.2,1.15), opacity .7s" }}
      />

      {/* shared target */}
      <div
        className="pointer-events-none absolute"
        style={{
          left: T_CX - T_SIZE / 2,
          top: T_CY - T_SIZE / 2,
          transform: `translateY(${dy}px) scale(${scale})`,
          opacity: targetOpacity,
          transition: v2 && inResults ? "transform .6s cubic-bezier(.6,0,.8,.4), opacity .5s ease-in" : "transform .8s cubic-bezier(.5,0,.2,1.15), filter .4s",
          filter: phase === "revive" ? "blur(2px) brightness(.6)" : "none",
        }}
      >
        <div className="absolute -bottom-3 left-1/2 h-6 w-32 -translate-x-1/2 rounded-[50%] bg-black/45 blur-md" />
        <div className="anim-wobble">
          <MissedTarget size={T_SIZE} hole holeDelay={HIT} />
        </div>
      </div>

      {/* bullet */}
      {phase === "impact" && (
        <div className="anim-bullet pointer-events-none absolute z-30" style={{ left: HOLE_X - BULLET_W, top: HOLE_Y - 9 }}>
          <Bullet />
        </div>
      )}

      {/* MISSED stamp */}
      {phase === "impact" && impactStep >= 2 && (
        <div className="pointer-events-none absolute inset-x-0 top-[190px] z-30 flex justify-center">
          <div
            className={`rounded-2xl border-[6px] border-[#ff3b2a] bg-[#ff3b2a]/10 px-6 py-1 font-russo text-[58px] text-[#ff3b2a] ${impactStep >= 3 ? "anim-stamp-out" : "anim-stamp"}`}
            style={{ textShadow: "0 0 18px rgba(255,59,42,0.6)", boxShadow: "0 0 30px rgba(255,59,42,0.35), inset 0 0 18px rgba(255,59,42,0.3)" }}
          >
            MISSED!
          </div>
        </div>
      )}

      {phase === "revive" && (
        <ReviveModal
          score={p.run.score}
          diamonds={p.diamonds}
          cost={p.reviveCost}
          adDiamonds={p.adDiamonds}
          adDiamondsLeft={p.adDiamondsLeft}
          paused={p.paused}
          leaving={leaving}
          onDiamond={() => {
            if (p.onReviveDiamond()) leaveRevive("revived");
          }}
          onAd={() => p.onReviveAd(() => leaveRevive("revived"))}
          onAdDiamonds={p.onAdDiamonds}
          onSkip={() => leaveRevive("results")}
        />
      )}

      {phase === "results" && (
        <ResultsComp
          stage={p.stage}
          score={p.run.score}
          prevBest={p.run.prevBest}
          hits={p.run.hits}
          totalTargets={p.totalTargets}
          reward={p.run.reward}
          gems={p.run.gems}
          adDiamonds={p.adDiamonds}
          adDiamondsLeft={p.adDiamondsLeft}
          doubleUsed={p.doubleUsed}
          onShake={p.onShake}
          onFly={p.onFly}
          onBest={p.onBest}
          onDouble={p.onDouble}
          onAdDiamonds={p.onAdDiamonds}
          onRetry={p.onRetry}
          onHome={p.onHome}
          gift={p.gift}
          gun={p.gun}
          equippedGun={p.equippedGun}
          onGift={p.onGift}
        />
      )}

      {phase === "revived" && (
        <div className="absolute inset-0 z-20 flex flex-col items-center pt-[190px]">
          <div className="anim-fade absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(60,230,110,0.25),transparent_60%)]" />
          <Title3D text="REVIVED!" variant="green" size={64} anim="slam" stagger={45} />
          <div className="anim-fade-up mt-3 font-russo text-[15px] tracking-widest text-white txt-outline" style={{ animationDelay: "0.4s" }}>
            +1 BULLET · SCORE KEPT
          </div>
          {Array.from({ length: 8 }).map((_, i) => (
            <span
              key={i}
              className="absolute"
              style={
                {
                  left: T_CX - 11,
                  top: T_CY - 11,
                  "--bx": `${Math.cos((i / 8) * Math.PI * 2) * 150}px`,
                  "--by": `${Math.sin((i / 8) * Math.PI * 2) * 150}px`,
                  animation: `sparkle-burst 1s cubic-bezier(.2,.7,.4,1) ${0.2 + (i % 2) * 0.1}s both`,
                } as React.CSSProperties
              }
            >
              <Heart size={22} />
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
