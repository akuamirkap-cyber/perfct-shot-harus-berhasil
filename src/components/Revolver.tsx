export type GunTone = "silver" | "bronze" | "frost" | "void" | "jade" | "desert" | "venom" | "ember" | "royal";
export type RevolverTone = GunTone;
export type ToneDef = {
  steel: string[];
  dark: string[];
  wood: string[];
  stroke: string;
  grip: string;
  accent: string;
  stud: [string, string];
  glow?: string;
};

export const TONES: Record<GunTone, ToneDef> = {
  silver: { steel: ["#ffffff", "#d5dde3", "#97a5af", "#6b7a85"], dark: ["#c8d2d9", "#5d6b75"], wood: ["#b9773d", "#8a4f22", "#5c3213"], stroke: "#3b454c", grip: "#3d220c", accent: "#56636c", stud: ["#ffc531", "#8a5a00"] },
  bronze: { steel: ["#fff1dc", "#e7b98a", "#b07a45", "#7a4e26"], dark: ["#d9a774", "#6e4522"], wood: ["#8a5a3a", "#5e3a22", "#3a2212"], stroke: "#4a2e14", grip: "#2a170a", accent: "#7a4e26", stud: ["#e6edf2", "#5d6b75"] },
  frost: { steel: ["#ffffff", "#d6f3ff", "#7cc8f0", "#2f7fb8"], dark: ["#bfe6ff", "#1f5f8f"], wood: ["#e9f7ff", "#9fd6f2", "#4f9fcf"], stroke: "#123a5a", grip: "#0e2e48", accent: "#7fe0ff", stud: ["#ffffff", "#3a8fc4"], glow: "#bff3ff" },
  void: { steel: ["#f3e8ff", "#c4a1ff", "#8b5cf6", "#4c1d95"], dark: ["#a78bfa", "#3b0764"], wood: ["#3b1380", "#22094f", "#12042e"], stroke: "#1e0b3d", grip: "#0d0322", accent: "#22d3ee", stud: ["#5fe6ff", "#0e7490"], glow: "#22d3ee" },
  jade: { steel: ["#f0fff4", "#a7f3c0", "#34c76a", "#13703a"], dark: ["#8be3aa", "#0f5a2c"], wood: ["#e9d6a8", "#b89a5e", "#7a6232"], stroke: "#0b3d1f", grip: "#3a2a10", accent: "#2fae5a", stud: ["#ffc531", "#8a5a00"] },
  desert: { steel: ["#fff7e6", "#f0d9a8", "#c9a066", "#8a6a3a"], dark: ["#e0c38a", "#6e5228"], wood: ["#7a4a2a", "#55311a", "#341c0c"], stroke: "#4a3414", grip: "#24140a", accent: "#a8823e", stud: ["#e6edf2", "#5d6b75"] },
  venom: { steel: ["#f7ffe0", "#d4f77a", "#8bd12a", "#4c7a0e"], dark: ["#b6e65a", "#2f4f08"], wood: ["#4a2a6e", "#2f1748", "#1a0a2e"], stroke: "#1f3305", grip: "#120620", accent: "#c084fc", stud: ["#d8b4fe", "#6b21a8"], glow: "#a3ff3a" },
  ember: { steel: ["#fff0e0", "#ffb27a", "#e8572a", "#8a2410"], dark: ["#ff9a6a", "#5a1408"], wood: ["#3a1a12", "#24100a", "#140804"], stroke: "#3d0e05", grip: "#120402", accent: "#ffb020", stud: ["#ffd84a", "#9a5200"], glow: "#ffb020" },
  royal: { steel: ["#fffbe3", "#ffe07a", "#f0a818", "#9a5a00"], dark: ["#ffd35a", "#7a4200"], wood: ["#b0123a", "#7a0a26", "#4a0416"], stroke: "#5a3200", grip: "#3a0210", accent: "#ff3d72", stud: ["#ff6b95", "#a8123f"], glow: "#fff3b0" },
};

/** Stylised revolver with wooden grip (pure SVG) */
export default function Revolver({ width = 200, tone = "silver" }: { width?: number; tone?: RevolverTone }) {
  const t: ToneDef = TONES[tone];
  const id = (n: string) => `rv-${n}-${tone}`;
  return (
    <svg width={width} height={width * 0.72} viewBox="0 0 250 180" className="drop-shadow-[0_14px_14px_rgba(0,0,0,0.55)]" style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id={id("steel")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={t.steel[0]} />
          <stop offset="0.35" stopColor={t.steel[1]} />
          <stop offset="0.6" stopColor={t.steel[2]} />
          <stop offset="1" stopColor={t.steel[3]} />
        </linearGradient>
        <linearGradient id={id("dark")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={t.dark[0]} />
          <stop offset="1" stopColor={t.dark[1]} />
        </linearGradient>
        <linearGradient id={id("wood")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={t.wood[0]} />
          <stop offset="0.5" stopColor={t.wood[1]} />
          <stop offset="1" stopColor={t.wood[2]} />
        </linearGradient>
        <pattern id={id("hatch")} width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <path d="M0 0v7M0 0h7" stroke={t.grip} strokeWidth="1" opacity="0.45" />
        </pattern>
      </defs>

      {/* grip */}
      <path d="M58 92 C48 118 40 146 44 168 Q46 176 56 176 L82 176 Q90 175 89 166 C86 146 90 120 100 98 Z" fill={`url(#${id("wood")})`} stroke={t.grip} strokeWidth="2.5" />
      <path d="M62 102 C55 124 51 146 54 164 L80 164 C78 146 81 124 89 104 Z" fill={`url(#${id("hatch")})`} />
      <circle cx="70" cy="134" r="5" fill={t.stud[0]} stroke={t.stud[1]} strokeWidth="1.5" />
      <circle cx="68.5" cy="132.5" r="1.6" fill="#fff" opacity="0.8" />

      {/* trigger guard + trigger */}
      <path d="M100 96 Q100 124 124 124 Q140 124 140 104" fill="none" stroke={`url(#${id("dark")})`} strokeWidth="7" strokeLinecap="round" />
      <path d="M118 96 Q114 108 120 116" fill="none" stroke={t.stroke} strokeWidth="5" strokeLinecap="round" />

      {/* hammer */}
      <path d="M58 46 L38 26 Q34 22 40 19 L48 16 Q52 15 55 19 L72 40 Z" fill={`url(#${id("dark")})`} stroke={t.stroke} strokeWidth="2" />

      {/* frame */}
      <path d="M52 40 H150 V64 H146 V98 H58 Q50 98 52 88 Z" fill={`url(#${id("steel")})`} stroke={t.stroke} strokeWidth="2.5" strokeLinejoin="round" />

      {/* cylinder */}
      <rect x="84" y="44" width="58" height="50" rx="12" fill={`url(#${id("dark")})`} stroke={t.stroke} strokeWidth="2.5" />
      {[0, 1, 2].map((i) => (
        <rect key={i} x="90" y={52 + i * 13} width="46" height="6" rx="3" fill={t.glow ?? t.accent} opacity={t.glow ? 0.85 : 0.7} />
      ))}
      <rect x="88" y="47" width="50" height="5" rx="2.5" fill="#fff" opacity="0.55" />

      {/* barrel */}
      <rect x="146" y="42" width="96" height="22" rx="4" fill={`url(#${id("steel")})`} stroke={t.stroke} strokeWidth="2.5" />
      <rect x="146" y="64" width="72" height="12" rx="3" fill={`url(#${id("dark")})`} stroke={t.stroke} strokeWidth="2" />
      <rect x="150" y="45" width="88" height="5" rx="2.5" fill="#fff" opacity="0.7" />
      {t.glow && <rect x="152" y="55" width="84" height="3" rx="1.5" fill={t.glow} style={{ filter: `drop-shadow(0 0 4px ${t.glow})` }} />}
      <rect x="232" y="34" width="7" height="9" rx="1.5" fill={t.accent} stroke={t.stroke} strokeWidth="1.5" />
      <circle cx="240" cy="53" r="4" fill="#1e2428" />

      {/* screws / details */}
      <circle cx="68" cy="58" r="3" fill={t.accent} />
      <circle cx="68" cy="80" r="3" fill={t.accent} />
      <path d="M56 44 H82" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity="0.7" />
    </svg>
  );
}
