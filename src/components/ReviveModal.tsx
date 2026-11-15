import { useEffect, useRef, useState } from "react";
import { AdBadge, Diamond, Heart, TvIcon } from "./Icons";
import Title3D from "./Title3D";
import { sfx } from "../audio/sfx";

const DURATION = 7000;
const R = 50;
const C = 2 * Math.PI * R;

type Props = {
  score: number;
  diamonds: number;
  cost: number;
  adDiamonds: number;
  adDiamondsLeft: number;
  paused: boolean;
  leaving: boolean;
  onDiamond: () => void;
  onAd: () => void;
  onAdDiamonds: () => void;
  onSkip: () => void;
};

export default function ReviveModal(p: Props) {
  const [remain, setRemain] = useState(DURATION);
  const [showSkip, setShowSkip] = useState(false);
  const last = useRef<number | null>(null);
  const skipped = useRef(false);

  // countdown that pauses while an ad / popup is open
  useEffect(() => {
    if (p.paused || p.leaving) {
      last.current = null;
      return;
    }
    let raf = 0;
    const tick = (t: number) => {
      if (last.current != null) {
        const dt = t - last.current;
        setRemain((r) => Math.max(0, r - dt));
      }
      last.current = t;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [p.paused, p.leaving]);

  useEffect(() => {
    if (remain <= 0 && !skipped.current) {
      skipped.current = true;
      p.onSkip();
    }
  }, [remain, p]);

  useEffect(() => {
    const id = setTimeout(() => setShowSkip(true), 1600);
    return () => clearTimeout(id);
  }, []);

  const sec = Math.ceil(remain / 1000);
  const [wiggle, setWiggle] = useState(0);

  useEffect(() => {
    sfx.panelIn();
  }, []);

  // heartbeat on every countdown second
  const lastSec = useRef(sec);
  useEffect(() => {
    if (sec !== lastSec.current && sec > 0 && !p.paused && !p.leaving) sfx.heartbeat(sec <= 3);
    lastSec.current = sec;
  }, [sec, p.paused, p.leaving]);
  const frac = remain / DURATION;
  const ringColor = frac > 0.5 ? "#5df277" : frac > 0.25 ? "#ffc531" : "#ff4d3a";
  const canPay = p.diamonds >= p.cost;
  const lacking = p.cost - p.diamonds;

  return (
    <div className={`absolute inset-0 z-20 flex items-center justify-center bg-[#030a0c]/60 px-6 ${p.leaving ? "anim-fade [animation-direction:reverse]" : "anim-backdrop"}`}>
      <div className={`panel relative w-full rounded-[28px] px-5 pb-5 pt-9 ${p.leaving ? "anim-panel-out" : "anim-panel-in"}`}>
        {/* ribbon */}
        <div className="absolute -top-5 left-1/2 -translate-x-1/2">
          <div
            className="anim-pop whitespace-nowrap rounded-xl px-6 py-2 font-lilita text-[20px] tracking-wide text-white"
            style={{
              animationDelay: "0.25s",
              background: "linear-gradient(180deg,#ff6a4d,#d92a17)",
              boxShadow: "0 5px 0 #8f1608, 0 10px 18px rgba(0,0,0,0.4)",
              textShadow: "0 2px 0 rgba(0,0,0,0.3)",
            }}
          >
            SECOND CHANCE!
          </div>
        </div>

        <Title3D text="CONTINUE?" variant="green" size={46} anim="slam" stagger={35} delay={300} sound />

        {/* countdown ring */}
        <div className="mt-4 flex flex-col items-center">
          <div className="anim-pop relative h-[124px] w-[124px]" style={{ animationDelay: "0.5s" }}>
            <svg viewBox="0 0 124 124" className="h-full w-full -rotate-90">
              <circle cx="62" cy="62" r={R} fill="rgba(0,0,0,0.3)" stroke="rgba(255,255,255,0.1)" strokeWidth="10" />
              <circle
                cx="62"
                cy="62"
                r={R}
                fill="none"
                stroke={ringColor}
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={C}
                strokeDashoffset={C * (1 - frac)}
                style={{ transition: "stroke .3s", filter: `drop-shadow(0 0 6px ${ringColor})` }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="anim-heart">
                <Heart size={22} />
              </div>
              <span
                key={sec}
                className="anim-pop font-lilita text-[44px] leading-none text-white"
                style={{ textShadow: "0 3px 0 rgba(0,0,0,0.4)" }}
              >
                {sec}
              </span>
            </div>
            {p.paused && (
              <div className="anim-fade absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-2 py-0.5 font-russo text-[9px] text-white/80">
                PAUSED
              </div>
            )}
          </div>
          <div className="anim-fade-up mt-3 font-russo text-[12px] tracking-wider text-white/70" style={{ animationDelay: "0.6s" }}>
            KEEP YOUR SCORE · <span className="text-[#ffc531]">{p.score.toLocaleString("en-US")}</span>
          </div>
        </div>

        {/* options */}
        <div className="mt-4 flex flex-col gap-3.5">
          {/* watch ad revive */}
          <button
            onClick={p.onAd}
            className="btn-glossy btn-green flex h-[62px] items-center gap-3 px-4 text-white"
            style={{ animation: "slide-up .55s cubic-bezier(.2,.8,.3,1.1) .65s both, glow-green 1.3s ease-out 1.3s infinite" }}
          >
            <span className="relative z-10 flex h-10 w-10 items-center justify-center rounded-xl bg-black/20">
              <TvIcon size={26} />
            </span>
            <span className="relative z-10 flex flex-1 flex-col items-start leading-none">
              <span className="font-lilita text-[24px]" style={{ textShadow: "0 2px 0 rgba(0,0,0,0.25)" }}>
                FREE REVIVE
              </span>
              <span className="mt-1 font-russo text-[10px] tracking-wider text-white/85">WATCH A SHORT VIDEO</span>
            </span>
            <AdBadge className="relative z-10" />
          </button>

          {/* diamond revive */}
          <button
            key={wiggle}
            data-sfx="none"
            onClick={() => {
              if (canPay) {
                sfx.click();
                sfx.spend();
                p.onDiamond();
              } else {
                sfx.error();
                setWiggle((w) => w + 1);
              }
            }}
            className={`btn-glossy flex h-[58px] items-center gap-3 px-4 text-white ${canPay ? "btn-blue" : "btn-off"}`}
            style={{
              animation: wiggle ? "deny .4s ease-in-out both" : "slide-up .55s cubic-bezier(.2,.8,.3,1.1) .75s both",
            }}
          >
            <span className="relative z-10 flex h-10 w-10 items-center justify-center rounded-xl bg-black/20">
              <Diamond size={26} />
            </span>
            <span className="relative z-10 flex flex-1 flex-col items-start leading-none">
              <span className="font-lilita text-[22px]" style={{ textShadow: "0 2px 0 rgba(0,0,0,0.25)" }}>
                REVIVE
              </span>
              <span className={`mt-1 font-russo text-[10px] tracking-wider ${canPay ? "text-white/85" : "text-[#ff8a7a]"}`}>
                {canPay ? "USE DIAMONDS" : `NEED ${lacking} MORE DIAMOND${lacking > 1 ? "S" : ""}`}
              </span>
            </span>
            <span className="relative z-10 flex items-center gap-1 rounded-lg bg-black/25 px-2 py-1 font-lilita text-[20px]">
              <Diamond size={18} /> {p.cost}
            </span>
          </button>

          {/* get diamonds via ad */}
          <button
            onClick={p.onAdDiamonds}
            disabled={p.adDiamondsLeft <= 0}
            className={`btn-glossy flex h-[46px] items-center justify-center gap-2 px-4 font-lilita text-[18px] ${
              p.adDiamondsLeft > 0 ? "btn-gold text-[#5a3200]" : "btn-off text-white/50"
            }`}
            style={{
              animation: `slide-up .55s cubic-bezier(.2,.8,.3,1.1) .85s both${
                p.adDiamondsLeft > 0 && !canPay ? ", glow-gold 1.5s ease-out 1.5s infinite" : ""
              }`,
            }}
          >
            <span className="relative z-10 flex items-center gap-2">
              <TvIcon size={20} color={p.adDiamondsLeft > 0 ? "#5a3200" : "#ffffff80"} />
              {p.adDiamondsLeft > 0 ? (
                <>
                  WATCH AD · +{p.adDiamonds} <Diamond size={18} />
                  <span className="rounded bg-black/15 px-1.5 font-russo text-[10px]">{p.adDiamondsLeft} LEFT</span>
                </>
              ) : (
                "NO MORE ADS TODAY"
              )}
            </span>
          </button>
        </div>

        <div className="mt-4 flex h-6 justify-center">
          {showSkip && (
            <button
              onClick={() => {
                if (skipped.current) return;
                skipped.current = true;
                p.onSkip();
              }}
              className="anim-fade-up font-russo text-[13px] tracking-widest text-white/50 underline-offset-4 hover:text-white/80 hover:underline"
            >
              NO THANKS
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
