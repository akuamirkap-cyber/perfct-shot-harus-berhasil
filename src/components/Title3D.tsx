import { useEffect } from "react";
import { sfx } from "../audio/sfx";

type Props = {
  text: string;
  variant: "red" | "gold" | "green" | "white";
  size: number;
  anim?: "drop" | "slam";
  delay?: number;
  stagger?: number;
  className?: string;
  /** play an impact sound when each letter lands */
  sound?: boolean;
  /** continuous ripple wave after entrance; value = start time (ms) */
  wave?: number;
};

/** 3D gradient title animated letter by letter (+ optional wave) */
export default function Title3D({ text, variant, size, anim = "drop", delay = 0, stagger = 70, className = "", sound = false, wave }: Props) {
  const dur = anim === "drop" ? 620 : 520;
  const ease = anim === "drop" ? "cubic-bezier(.3,.8,.4,1)" : "cubic-bezier(.2,.9,.3,1.1)";
  const land = anim === "drop" ? 0.5 : 0.45;

  useEffect(() => {
    if (!sound) return;
    const letters = text.replace(/ /g, "").length;
    const ids = Array.from({ length: letters }).map((_, i) =>
      window.setTimeout(() => (anim === "drop" ? sfx.letterDrop(i) : sfx.letterSlam(i)), delay + i * stagger + dur * land),
    );
    return () => ids.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={`flex justify-center ${className}`} aria-label={text}>
      {text.split("").map((ch, i) => (
        <span
          key={i}
          className="inline-block"
          style={wave !== undefined ? { animation: `letter-wave 2.2s ease-in-out ${wave + i * 65}ms infinite`, transformOrigin: "50% 100%" } : undefined}
        >
          <span
            className={`txt-${variant} inline-block font-russo`}
            style={{ fontSize: size, animation: `letter-${anim} ${dur}ms ${ease} ${delay + i * stagger}ms both` }}
          >
            {ch === " " ? "\u00A0" : ch}
          </span>
        </span>
      ))}
    </div>
  );
}
