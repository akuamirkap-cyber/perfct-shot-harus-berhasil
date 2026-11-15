import { useEffect, useRef, useState } from "react";
import { sfx } from "../audio/sfx";
import { Coin, Diamond } from "./Icons";
import Title3D from "./Title3D";

export type PopupItem = { kind: "coin" | "diamond"; amount: number };

type Props = {
  items: PopupItem[];
  title: string;
  onClaim: (claims: { kind: "coin" | "diamond"; el: HTMLElement | null; amount: number }[]) => void;
  onClosed: () => void;
};

export default function RewardPopup({ items, title, onClaim, onClosed }: Props) {
  const refs = useRef<(HTMLDivElement | null)[]>([]);
  const [leaving, setLeaving] = useState(false);
  const multi = items.length > 1;
  const glow = items.some((i) => i.kind === "coin") ? "rgba(255,200,50,0.55)" : "rgba(70,170,255,0.55)";

  useEffect(() => {
    sfx.panelIn();
    const ids = [
      window.setTimeout(() => sfx.coinBag(), 300),
      window.setTimeout(() => (items.some((i) => i.kind === "diamond") ? sfx.diamond() : sfx.sparkle()), multi ? 520 : 380),
      window.setTimeout(() => sfx.pop(1.2), 600),
      window.setTimeout(() => sfx.pop(0.9), 760),
    ];
    return () => ids.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const claim = () => {
    if (leaving) return;
    onClaim(items.map((it, i) => ({ kind: it.kind, el: refs.current[i], amount: it.amount })));
    sfx.claim();
    setLeaving(true);
    setTimeout(onClosed, 300);
  };

  const size = multi ? 92 : 120;

  return (
    <div className={`absolute inset-0 z-[75] flex items-center justify-center bg-black/60 ${leaving ? "anim-fade [animation-direction:reverse]" : "anim-backdrop"}`}>
      <div className={`flex flex-col items-center ${leaving ? "anim-panel-out" : "anim-panel-in"}`}>
        <Title3D text={title} variant="gold" size={46} anim="slam" stagger={30} delay={150} />
        <div className="relative mt-4 flex h-[220px] w-[330px] items-center justify-center gap-6">
          <div className="anim-rays rays absolute left-1/2 top-1/2 h-[440px] w-[440px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-70" />
          <div className="absolute h-40 w-64 rounded-full blur-2xl" style={{ background: glow }} />
          {items.map((it, i) => (
            <div key={i} className="relative flex flex-col items-center">
              <div ref={(el) => void (refs.current[i] = el)} className="anim-pop relative" style={{ animationDelay: `${0.25 + i * 0.18}s` }}>
                <div className="anim-float" style={{ animationDelay: `${i * 0.4}s` }}>
                  {it.kind === "diamond" ? <Diamond size={size} /> : <Coin size={size} />}
                </div>
              </div>
              <div
                className="anim-pop mt-2 font-lilita leading-none"
                style={{
                  fontSize: multi ? 44 : 56,
                  animationDelay: `${0.45 + i * 0.18}s`,
                  color: it.kind === "diamond" ? "#8fd6ff" : "#ffc531",
                  textShadow: `0 4px 0 ${it.kind === "diamond" ? "#0c4c91" : "#7a4200"}, 0 8px 14px rgba(0,0,0,0.4)`,
                }}
              >
                +{it.amount}
              </div>
            </div>
          ))}
          {Array.from({ length: 12 }).map((_, i) => (
            <span
              key={i}
              className="absolute left-1/2 top-1/2 h-2.5 w-2.5 rotate-45 bg-[#ffe27a]"
              style={
                {
                  "--bx": `${Math.cos((i / 12) * Math.PI * 2) * 150}px`,
                  "--by": `${Math.sin((i / 12) * Math.PI * 2) * 120}px`,
                  animation: `sparkle-burst .8s ease-out ${0.35 + (i % 3) * 0.05}s both`,
                } as React.CSSProperties
              }
            />
          ))}
        </div>
        <button
          onClick={claim}
          className="b3d b3d-green mt-6 h-[64px] w-[230px]"
          style={{ animation: "pop .42s cubic-bezier(.2,.9,.3,1.2) .7s both" }}
        >
          <span className="b3d-move b3d-face justify-center text-white">
            <span className="lbl-3d relative z-10 font-lilita text-[28px]">CLAIM</span>
          </span>
        </button>
      </div>
    </div>
  );
}
