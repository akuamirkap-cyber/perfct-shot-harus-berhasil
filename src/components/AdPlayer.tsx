import { useEffect, useState } from "react";
import { CloseIcon, Star } from "./Icons";
import { sfx } from "../audio/sfx";

const AD_SECONDS = 5;

type Props = {
  rewardLabel: string;
  onClose: (completed: boolean) => void;
};

const BALLS = [
  { c: "#ff4d6d", s: 64, x: 40, d: 0 },
  { c: "#ffd23a", s: 52, x: 120, d: 0.25 },
  { c: "#4dd8ff", s: 70, x: 190, d: 0.5 },
  { c: "#7cff6b", s: 48, x: 270, d: 0.75 },
  { c: "#c77dff", s: 60, x: 320, d: 1 },
];

/** Simulated rewarded video ad */
export default function AdPlayer({ rewardLabel, onClose }: Props) {
  const [left, setLeft] = useState(AD_SECONDS);
  const [leaving, setLeaving] = useState(false);
  const done = left <= 0;

  // intro + fake gameplay sounds
  useEffect(() => {
    sfx.adOpen();
    const ids = BALLS.map((b, i) => window.setTimeout(() => sfx.bounce(1 + i * 0.12), 450 + b.d * 1000 + 600));
    ids.push(window.setTimeout(sfx.combo, 1600 + 450));
    return () => ids.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    if (done) {
      sfx.adReward();
      return;
    }
    if (left < AD_SECONDS) sfx.adTick();
    const id = setTimeout(() => setLeft((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [left, done]);

  const close = () => {
    if (!done || leaving) return;
    setLeaving(true);
    sfx.whoosh(false, 0.25, 0.12);
    setTimeout(() => onClose(true), 280);
  };

  return (
    <div
      className="absolute inset-0 z-[85] flex flex-col overflow-hidden"
      style={{
        background: "linear-gradient(160deg,#ff7eb3 0%,#a855f7 45%,#4c1d95 100%)",
        animation: leaving ? "ad-out .28s ease-in both" : "ad-in .45s cubic-bezier(.2,.8,.3,1) both",
      }}
    >
      {/* progress */}
      <div className="h-1.5 w-full bg-black/25">
        <div
          className="h-full origin-left bg-[#ffd23a]"
          style={{ animation: `progress ${AD_SECONDS}s linear both` }}
        />
      </div>

      {/* header */}
      <div className="flex items-center justify-between px-4 pt-3">
        <div className="flex items-center gap-2">
          <span className="rounded bg-[#ffd23a] px-1.5 font-lilita text-[13px] text-[#5a3200]">AD</span>
          <span className="font-russo text-[11px] tracking-wider text-white/80">SPONSORED</span>
        </div>
        {done ? (
          <button
            onClick={close}
            className="anim-pop flex h-9 w-9 items-center justify-center rounded-full bg-black/45 ring-2 ring-white/60"
          >
            <CloseIcon />
          </button>
        ) : (
          <div className="flex h-9 min-w-9 items-center justify-center rounded-full bg-black/35 px-3 font-lilita text-[16px] text-white">
            {left}
          </div>
        )}
      </div>

      {/* reward status */}
      <div className="mt-3 flex justify-center">
        <div
          key={done ? "d" : "w"}
          className={`anim-pop rounded-full px-4 py-1.5 font-russo text-[12px] tracking-wide ${
            done ? "bg-[#2fd24f] text-white shadow-[0_3px_0_#0d7a24]" : "bg-black/35 text-white/90"
          }`}
        >
          {done ? `✓ REWARD UNLOCKED: ${rewardLabel}` : `REWARD IN ${left}s · ${rewardLabel}`}
        </div>
      </div>

      {/* fake game ad content */}
      <div className="relative mt-6 flex flex-1 flex-col items-center">
        <div className="anim-float text-center">
          <div
            className="font-lilita text-[58px] leading-none text-white"
            style={{ textShadow: "0 5px 0 #6b21a8, 0 10px 20px rgba(0,0,0,0.35)" }}
          >
            CANDY
          </div>
          <div
            className="-mt-1 font-lilita text-[70px] leading-none text-[#ffd23a]"
            style={{ textShadow: "0 6px 0 #b45309, 0 12px 22px rgba(0,0,0,0.35)" }}
          >
            MERGE!
          </div>
        </div>

        {/* play field */}
        <div className="relative mt-6 h-[300px] w-[380px] overflow-hidden rounded-3xl border-4 border-white/40 bg-white/15 shadow-[inset_0_0_40px_rgba(0,0,0,0.25)]">
          {BALLS.map((b, i) => (
            <div
              key={i}
              className="absolute bottom-3 rounded-full"
              style={{
                left: b.x - b.s / 2 + 10,
                width: b.s,
                height: b.s,
                background: `radial-gradient(circle at 35% 30%, #fff 0 8%, ${b.c} 30%, rgba(0,0,0,0.35) 120%)`,
                animation: `ball-drop 1.1s cubic-bezier(.4,0,.6,1) ${b.d}s both`,
                boxShadow: "0 6px 10px rgba(0,0,0,0.25)",
              }}
            />
          ))}
          <div
            className="absolute left-1/2 top-12 -translate-x-1/2 font-lilita text-[34px] text-white"
            style={{ textShadow: "0 3px 0 rgba(0,0,0,0.3)", animation: "pop .5s 1.6s both" }}
          >
            COMBO x5!
          </div>
          <div className="absolute right-12 top-28 text-[48px]" style={{ animation: "hand-tap 0.9s ease-in-out infinite" }}>
            👆
          </div>
        </div>

        <div className="mt-5 flex items-center gap-1">
          {[0, 1, 2, 3, 4].map((i) => (
            <Star key={i} size={18} />
          ))}
          <span className="ml-2 font-russo text-[13px] text-white/90">4.8 · 10M+ DOWNLOADS</span>
        </div>

        <button
          className="btn-glossy btn-green anim-glow-green mt-5 h-[58px] w-[300px] font-lilita text-[26px] text-white"
          style={{ textShadow: "0 2px 0 rgba(0,0,0,0.25)" }}
        >
          <span className="relative z-10">PLAY FREE</span>
        </button>
      </div>

      <div className="pb-4 text-center font-russo text-[10px] tracking-widest text-white/50">
        {done ? "TAP ✕ TO CLAIM YOUR REWARD" : "WATCH THE FULL AD TO GET YOUR REWARD"}
      </div>
    </div>
  );
}
