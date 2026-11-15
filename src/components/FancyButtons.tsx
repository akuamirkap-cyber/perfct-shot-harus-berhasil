import { createContext, useContext } from "react";
import { Coin, Diamond, RetryIcon } from "./Icons";
import { MiniGift } from "./GiftBox";

const POP = "pop .45s cubic-bezier(.2,.9,.3,1.25)";

function PlayTri({ size = 9, color = "#5a3200" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 10 10">
      <path d="M2 1.2v7.6c0 .4.4.6.7.4l6-3.8a.5.5 0 0 0 0-.8l-6-3.8C2.4.6 2 .8 2 1.2z" fill={color} />
    </svg>
  );
}

export function AdTag({ className = "", wiggle = false }: { className?: string; wiggle?: boolean }) {
  return (
    <span className={`pointer-events-none absolute z-20 ${className}`} style={{ animation: wiggle ? "tag-wiggle 3.2s ease-in-out infinite 1.5s" : undefined, transform: "rotate(-6deg)" }}>
      <span className="ad-tag">
        <PlayTri /> AD
      </span>
    </span>
  );
}

/** retry price – provided by the game-over layer */
export const RetryCostContext = createContext<{ cost: number; diamonds: number } | null>(null);

/**
 * True bila portal melaporkan pemain memakai adblock (CrazyGames
 * `ad.hasAdblock()`): tombol iklan disembunyikan supaya tak ada tombol reward
 * yang tak berfungsi — pemain adblock tetap main penuh.
 */
export const AdsBlockedContext = createContext(false);

/** "◆ 5" diamond price tag; falls back to the AD tag when the player can't afford it */
export function RetryTag({ className = "" }: { className?: string }) {
  const c = useContext(RetryCostContext);
  if (!c || c.diamonds < c.cost) return <AdTag className={className} />;
  return (
    <span className={`pointer-events-none absolute z-20 ${className}`} style={{ transform: "rotate(-6deg)" }}>
      <span className="gem-tag">
        <Diamond size={13} /> {c.cost}
      </span>
    </span>
  );
}

/* ---------------- HOME (compact) + RETRY (hero) ---------------- */
export function ActionRow({ show, onHome, onRetry }: { show: boolean; onHome: () => void; onRetry: () => void }) {
  return (
    <div className="flex w-full items-stretch gap-3">
      <div className={show ? "" : "invisible"} style={{ animation: show ? `${POP} 0s both` : undefined }}>
        <button onClick={onHome} aria-label="Home" className="b3d b3d-red h-[64px] w-[76px]" style={{ ["--shine-delay" as string]: "2.4s" }}>
          <span className="b3d-move b3d-face flex-col justify-center gap-0.5 text-white">
            <svg className="relative z-10 drop-shadow-[0_2px_0_rgba(0,0,0,0.25)]" width="26" height="26" viewBox="0 0 24 24" fill="white">
              <path d="M12 3 2 11.5h3V21h5.5v-6h3v6H19v-9.5h3z" />
            </svg>
            <span className="lbl-3d relative z-10 font-lilita text-[14px] leading-none tracking-wide">HOME</span>
          </span>
        </button>
      </div>

      <div className={`relative flex-1 ${show ? "" : "invisible"}`} style={{ animation: show ? `${POP} .08s both` : undefined }}>
        <div className="pointer-events-none absolute -inset-x-1 -bottom-2 top-2 rounded-[26px] bg-[#3cf266] blur-xl" style={{ animation: "fx-glow-breathe 2.4s ease-in-out infinite" }} />
        <button onClick={onRetry} className="b3d b3d-green h-[64px] w-full">
          <span className="b3d-move b3d-face justify-center gap-3 text-white">
            <span className="lbl-3d relative z-10 font-lilita text-[32px] tracking-wide">RETRY</span>
            <span className="b3d-chip relative z-10 h-[40px] w-[40px]">
              <span className="flex" style={{ animation: "spin-pause 3.4s cubic-bezier(.6,0,.3,1) infinite 1.8s" }}>
                <RetryIcon />
              </span>
            </span>
          </span>
        </button>
        <RetryTag className="-right-2 -top-3" />
      </div>
    </div>
  );
}

/* ---------------- reward cards with pop-out medallion ---------------- */
type CardProps = {
  show: boolean;
  delay?: number;
  tone: "purple" | "blue";
  medal: React.ReactNode;
  sticker: string;
  stickerColor: string;
  title: string;
  sub?: string;
  disabled?: boolean;
  doneLabel?: string;
  onClick: () => void;
};

function RewardCard(p: CardProps) {
  return (
    <div className={`relative flex-1 ${p.show ? "" : "invisible"}`} style={{ animation: p.show ? `slide-up .5s cubic-bezier(.2,.8,.3,1.1) ${p.delay ?? 0}s both` : undefined }}>
      <button
        onClick={p.onClick}
        disabled={p.disabled}
        className={`b3d b3d-${p.tone} h-[58px] w-full`}
        style={{ ["--lip" as string]: "5px", ["--r" as string]: "17px", ["--shine-delay" as string]: p.tone === "purple" ? "2s" : "3.2s" }}
      >
        <span className="b3d-move b3d-face gap-2.5 pl-[7px] pr-2 text-white">
          {/* medal – sits inside the panel, vertically centred */}
          <span className="relative z-10 shrink-0" style={{ animation: p.show ? `pop .5s cubic-bezier(.2,.9,.3,1.4) ${(p.delay ?? 0) + 0.2}s both` : undefined }}>
            {p.medal}
            <span
              className="absolute -bottom-1 -right-1.5 rotate-[-8deg] rounded-md px-1 font-lilita text-[11px] leading-[14px] text-white"
              style={{ background: p.stickerColor, boxShadow: "0 2px 0 rgba(0,0,0,0.35)", border: "1.5px solid rgba(255,255,255,0.85)" }}
            >
              {p.sticker}
            </span>
          </span>
          {p.disabled && p.doneLabel ? (
            <span className="relative z-10 flex-1 whitespace-nowrap text-center font-lilita text-[22px] leading-none text-white/90 lbl-3d">{p.doneLabel}</span>
          ) : (
            <span className="relative z-10 flex flex-1 flex-col items-center whitespace-nowrap leading-none">
              <span className="lbl-3d font-lilita text-[22px] tracking-wide">{p.title}</span>
              {p.sub && <span className="mt-1 font-russo text-[10px] tracking-wide text-white/85">{p.sub}</span>}
            </span>
          )}
        </span>
      </button>
      {!p.disabled && <AdTag className="-right-2 -top-3" />}
    </div>
  );
}

export type GiftState = "new" | "opened";

/** Coin ⇄ Diamond magic morph medal */
export function MorphMedal({ size = 48 }: { size?: number }) {
  return (
    <span className="medal overflow-visible" style={{ width: size, height: size, perspective: 220, background: "#2a1b4a" }}>
      <span className="morph-fade-a absolute inset-0 rounded-full" style={{ background: "radial-gradient(circle at 35% 30%, #fff6c4, #ffc531 45%, #d98a00)" }} />
      <span className="morph-fade-b absolute inset-0 rounded-full" style={{ background: "radial-gradient(circle at 35% 30%, #e6f8ff, #6cc8ff 45%, #1b7fe0)" }} />
      <span className="morph-a absolute inset-0 flex items-center justify-center">
        <Coin size={30} />
      </span>
      <span className="morph-b absolute inset-0 flex items-center justify-center">
        <Diamond size={28} />
      </span>
      <span className="morph-poof pointer-events-none absolute -inset-3 z-10">
        <span className="absolute inset-[6px] rounded-full border-[3px] border-white/90 shadow-[0_0_12px_rgba(255,255,255,0.9)]" />
        {[0, 1, 2, 3, 4, 5].map((k) => {
          const a = (k / 6) * Math.PI * 2;
          return (
            <span
              key={k}
              className="absolute text-[12px] leading-none text-white"
              style={{ left: `calc(50% + ${Math.cos(a) * 33}px - 6px)`, top: `calc(50% + ${Math.sin(a) * 33}px - 6px)`, textShadow: "0 0 6px #fff" }}
            >
              ✦
            </span>
          );
        })}
      </span>
    </span>
  );
}

/** "+45 coin" ⇄ "+3 diamond" synced with MorphMedal */
export function MorphValue({ coins, gems, size = 18 }: { coins: number; gems: number; size?: number }) {
  return (
    <span className="grid font-lilita" style={{ fontSize: size }}>
      <span className="morph-fade-a flex items-center justify-end gap-1 text-[#ffd84a] [grid-area:1/1]" style={{ textShadow: "0 2px 0 #7a4200" }}>
        +{coins} <Coin size={size - 2} />
      </span>
      <span className="morph-fade-b flex items-center justify-end gap-1 text-[#bfeaff] [grid-area:1/1]" style={{ textShadow: "0 2px 0 #0c4c91" }}>
        +{gems} <Diamond size={size - 2} />
      </span>
    </span>
  );
}

export function RewardCards({
  show,
  doubleUsed,
  onDouble,
  gift,
  onGift,
}: {
  show: boolean;
  doubleUsed: boolean;
  onDouble: () => void;
  gift: GiftState;
  onGift: () => void;
}) {
  return (
    <div className="flex w-full gap-3">
      <RewardCard
        show={show}
        tone="purple"
        medal={<MorphMedal size={42} />}
        sticker="x2"
        stickerColor="linear-gradient(180deg,#ff6a4d,#d92a17)"
        title="x2 REWARD"
        disabled={doubleUsed}
        doneLabel="CLAIMED ✓"
        onClick={onDouble}
      />
      <RewardCard
        show={show}
        delay={0.08}
        tone="blue"
        medal={
          <span className="medal h-[42px] w-[42px]" style={{ background: "radial-gradient(circle at 35% 30%, #f0e2ff, #b07cff 45%, #6a2fd6)" }}>
            <MiniGift size={27} />
          </span>
        }
        sticker="R1"
        stickerColor="linear-gradient(180deg,#ffc531,#e08a00)"
        title="BOSS GIFT"
        disabled={gift !== "new"}
        doneLabel="OPENED ✓"
        onClick={onGift}
      />
    </div>
  );
}

/* ================= compact set (V2, V5, V6) ================= */

/** compact reward pill */
function Pill({
  show,
  delay = 0,
  tone,
  medal,
  label,
  disabled,
  done,
  onClick,
}: {
  show: boolean;
  delay?: number;
  tone: "purple" | "blue";
  medal: React.ReactNode;
  label: string;
  disabled: boolean;
  done: string;
  onClick: () => void;
}) {
  return (
    <div className={`relative flex-1 ${show ? "" : "invisible"}`} style={{ animation: show ? `slide-up .45s cubic-bezier(.2,.8,.3,1.1) ${delay}s both` : undefined }}>
      <button
        onClick={onClick}
        disabled={disabled}
        className={`b3d b3d-${tone} h-[48px] w-full`}
        style={{ ["--lip" as string]: "4px", ["--r" as string]: "15px", ["--shine-delay" as string]: tone === "purple" ? "2s" : "3.2s" }}
      >
        <span className="b3d-move b3d-face gap-2 pl-[6px] pr-2 text-white">
          <span className="relative z-10 shrink-0">{medal}</span>
          <span className={`lbl-3d relative z-10 flex-1 whitespace-nowrap text-center font-lilita leading-none ${disabled ? "text-[16px] text-white/85" : "text-[17px]"}`}>
            {disabled ? done : label}
          </span>
        </span>
      </button>
      {!disabled && <AdTag className="-right-2 -top-3" />}
    </div>
  );
}


/** square HOME + wide RETRY (compact height) */
export function CompactActions({ show, onHome, onRetry }: { show: boolean; onHome: () => void; onRetry: () => void }) {
  return (
    <div className="flex w-full gap-3">
      <div className={show ? "" : "invisible"} style={{ animation: show ? `${POP} 0s both` : undefined }}>
        <button onClick={onHome} aria-label="Home" className="b3d b3d-red h-[58px] w-[64px]" style={{ ["--r" as string]: "18px" }}>
          <span className="b3d-move b3d-face justify-center">
            <svg className="relative z-10 drop-shadow-[0_2px_0_rgba(0,0,0,0.25)]" width="28" height="28" viewBox="0 0 24 24" fill="white">
              <path d="M12 3 2 11.5h3V21h5.5v-6h3v6H19v-9.5h3z" />
            </svg>
          </span>
        </button>
      </div>
      <div className={`relative flex-1 ${show ? "" : "invisible"}`} style={{ animation: show ? `${POP} .08s both` : undefined }}>
        <div className="pointer-events-none absolute -inset-x-1 -bottom-2 top-2 rounded-[24px] bg-[#3cf266] blur-xl" style={{ animation: "fx-glow-breathe 2.4s ease-in-out infinite" }} />
        <button onClick={onRetry} className="b3d b3d-green h-[58px] w-full" style={{ ["--r" as string]: "18px" }}>
          <span className="b3d-move b3d-face justify-center gap-2.5 text-white">
            <span className="lbl-3d relative z-10 font-lilita text-[30px] tracking-wide">RETRY</span>
            <span className="b3d-chip relative z-10 h-[36px] w-[36px]">
              <span className="flex scale-90" style={{ animation: "spin-pause 3.4s cubic-bezier(.6,0,.3,1) infinite 1.8s" }}>
                <RetryIcon />
              </span>
            </span>
          </span>
        </button>
        <RetryTag className="-right-2 -top-3" />
      </div>
    </div>
  );
}

/** x2 REWARD + KADO BOSS pills – narrower than the HOME+RETRY row */
export function RewardPills({
  show,
  doubleUsed,
  onDouble,
  gift,
  onGift,
  width = "84%",
}: {
  show: boolean;
  doubleUsed: boolean;
  onDouble: () => void;
  gift: GiftState;
  onGift: () => void;
  width?: string;
}) {
  const adsBlocked = useContext(AdsBlockedContext);
  return (
    <div className="flex gap-2.5" style={{ width }}>
      {!adsBlocked && <Pill show={show} tone="purple" medal={<MorphMedal size={34} />} label="x2 REWARD" disabled={doubleUsed} done="CLAIMED ✓" onClick={onDouble} />}
      {!adsBlocked && <Pill
        show={show}
        delay={0.08}
        tone="blue"
        medal={
          <span className="medal h-[34px] w-[34px]" style={{ background: "radial-gradient(circle at 35% 30%, #f0e2ff, #b07cff 45%, #6a2fd6)", borderWidth: 2 }}>
            <MiniGift size={22} />
          </span>
        }
        label="BOSS GIFT"
        disabled={gift !== "new"}
        done="OPENED ✓"
        onClick={onGift}
      />}
    </div>
  );
}
