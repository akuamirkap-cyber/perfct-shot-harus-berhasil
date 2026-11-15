import { TONES, type GunTone, type ToneDef } from "./Revolver";

function Defs({ t, p }: { t: ToneDef; p: string }) {
  return (
    <defs>
      <linearGradient id={`${p}-steel`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={t.steel[0]} />
        <stop offset="0.35" stopColor={t.steel[1]} />
        <stop offset="0.6" stopColor={t.steel[2]} />
        <stop offset="1" stopColor={t.steel[3]} />
      </linearGradient>
      <linearGradient id={`${p}-dark`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={t.dark[0]} />
        <stop offset="1" stopColor={t.dark[1]} />
      </linearGradient>
      <linearGradient id={`${p}-wood`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor={t.wood[0]} />
        <stop offset="0.5" stopColor={t.wood[1]} />
        <stop offset="1" stopColor={t.wood[2]} />
      </linearGradient>
      <pattern id={`${p}-hatch`} width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <path d="M0 0v7M0 0h7" stroke={t.grip} strokeWidth="1" opacity="0.45" />
      </pattern>
    </defs>
  );
}

const SVG_PROPS = { viewBox: "0 0 250 180", className: "drop-shadow-[0_14px_14px_rgba(0,0,0,0.55)]", style: { overflow: "visible" as const } };

/** Semi-auto pistol – boxy slide, angled grip */
export function Pistol({ width = 200, tone = "jade" }: { width?: number; tone?: GunTone }) {
  const t = TONES[tone];
  const p = `ps-${tone}`;
  const u = (n: string) => `url(#${p}-${n})`;
  return (
    <svg width={width} height={width * 0.72} {...SVG_PROPS}>
      <Defs t={t} p={p} />
      <path d="M64 86 L104 86 L92 168 Q90 177 80 177 L54 177 Q44 177 46 167 Z" fill={u("wood")} stroke={t.grip} strokeWidth="2.5" />
      <path d="M68 96 L98 96 L88 164 L56 164 Z" fill={u("hatch")} />
      <circle cx="76" cy="132" r="4.5" fill={t.stud[0]} stroke={t.stud[1]} strokeWidth="1.5" />
      <path d="M104 90 Q104 122 128 122 Q144 122 144 100" fill="none" stroke={u("dark")} strokeWidth="7" strokeLinecap="round" />
      <path d="M122 92 Q118 104 124 112" fill="none" stroke={t.stroke} strokeWidth="5" strokeLinecap="round" />
      <path d="M58 72 H206 V86 H150 Q140 86 136 94 L132 98 H62 Q56 98 56 90 Z" fill={u("dark")} stroke={t.stroke} strokeWidth="2.5" strokeLinejoin="round" />
      <rect x="40" y="38" width="182" height="36" rx="7" fill={u("steel")} stroke={t.stroke} strokeWidth="2.5" />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <rect key={i} x={50 + i * 7} y="45" width="3" height="24" rx="1.5" fill={t.stroke} opacity="0.35" />
      ))}
      <rect x="98" y="46" width="44" height="14" rx="4" fill={u("dark")} stroke={t.stroke} strokeWidth="1.5" />
      <rect x="46" y="42" width="170" height="5" rx="2.5" fill="#fff" opacity="0.65" />
      {t.glow && <rect x="152" y="60" width="62" height="4" rx="2" fill={t.glow} style={{ filter: `drop-shadow(0 0 4px ${t.glow})` }} />}
      <rect x="220" y="46" width="14" height="22" rx="3" fill={u("dark")} stroke={t.stroke} strokeWidth="2" />
      <circle cx="235" cy="57" r="3.5" fill="#1e2428" />
      <rect x="206" y="31" width="9" height="8" rx="2" fill={t.accent} stroke={t.stroke} strokeWidth="1.5" />
      <rect x="44" y="31" width="12" height="8" rx="2" fill={t.accent} stroke={t.stroke} strokeWidth="1.5" />
    </svg>
  );
}

/** Sci-fi ray blaster – round body, fins, glowing emitter */
export function Blaster({ width = 200, tone = "venom" }: { width?: number; tone?: GunTone }) {
  const t = TONES[tone];
  const p = `bl-${tone}`;
  const u = (n: string) => `url(#${p}-${n})`;
  const core = t.glow ?? t.accent;
  return (
    <svg width={width} height={width * 0.72} {...SVG_PROPS}>
      <Defs t={t} p={p} />
      <path d="M74 92 L108 92 L98 168 Q96 177 86 177 L62 177 Q52 177 54 167 Z" fill={u("wood")} stroke={t.grip} strokeWidth="2.5" />
      <path d="M78 102 L102 102 L92 164 L62 164 Z" fill={u("hatch")} />
      <path d="M108 96 Q108 124 130 124 Q146 124 146 104" fill="none" stroke={u("dark")} strokeWidth="7" strokeLinecap="round" />
      <path d="M126 98 Q122 108 128 116" fill="none" stroke={t.stroke} strokeWidth="5" strokeLinecap="round" />
      {/* fins */}
      <path d="M84 36 L72 8 Q71 4 76 4 L96 4 L112 36 Z" fill={u("dark")} stroke={t.stroke} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M120 36 L114 16 Q113 12 118 12 L130 12 L140 36 Z" fill={u("dark")} stroke={t.stroke} strokeWidth="2.5" strokeLinejoin="round" />
      {/* body */}
      <path d="M48 64 Q48 34 82 34 H150 Q180 34 180 64 Q180 94 150 94 H82 Q48 94 48 64 Z" fill={u("steel")} stroke={t.stroke} strokeWidth="2.5" />
      <rect x="66" y="36" width="8" height="56" fill={t.dark[1]} opacity="0.45" />
      <rect x="156" y="36" width="8" height="56" fill={t.dark[1]} opacity="0.45" />
      <path d="M62 46 Q72 39 92 39 H150" stroke="#fff" strokeWidth="4" strokeLinecap="round" fill="none" opacity="0.6" />
      <circle cx="116" cy="64" r="17" fill={u("dark")} stroke={t.stroke} strokeWidth="2.5" />
      <circle cx="116" cy="64" r="11" fill={core} style={{ filter: `drop-shadow(0 0 6px ${core})` }} />
      <circle cx="112" cy="60" r="3.5" fill="#fff" opacity="0.9" />
      <circle cx="48" cy="64" r="10" fill={u("dark")} stroke={t.stroke} strokeWidth="2.5" />
      {/* barrel + emitter */}
      <rect x="178" y="53" width="34" height="22" rx="4" fill={u("dark")} stroke={t.stroke} strokeWidth="2.5" />
      <rect x="186" y="53" width="4" height="22" fill={t.accent} opacity="0.8" />
      <rect x="198" y="53" width="4" height="22" fill={t.accent} opacity="0.8" />
      <circle cx="222" cy="64" r="17" fill={u("steel")} stroke={t.stroke} strokeWidth="2.5" />
      <circle cx="222" cy="64" r="10" fill={core} style={{ filter: `drop-shadow(0 0 8px ${core})` }} />
      <circle cx="222" cy="64" r="4" fill="#fff" />
    </svg>
  );
}

/** Heavy hand cannon – fat banded barrel with flared muzzle */
export function Cannon({ width = 200, tone = "ember" }: { width?: number; tone?: GunTone }) {
  const t = TONES[tone];
  const p = `cn-${tone}`;
  const u = (n: string) => `url(#${p}-${n})`;
  return (
    <svg width={width} height={width * 0.72} {...SVG_PROPS}>
      <Defs t={t} p={p} />
      <path d="M58 96 C48 120 42 148 46 170 Q48 177 58 177 L84 177 Q93 176 92 166 C89 146 93 122 103 100 Z" fill={u("wood")} stroke={t.grip} strokeWidth="2.5" />
      <path d="M63 106 C56 126 52 148 55 165 L82 165 C80 146 83 124 91 108 Z" fill={u("hatch")} />
      <circle cx="70" cy="136" r="5" fill={t.stud[0]} stroke={t.stud[1]} strokeWidth="1.5" />
      <path d="M102 98 Q102 126 126 126 Q142 126 142 106" fill="none" stroke={u("dark")} strokeWidth="7" strokeLinecap="round" />
      <path d="M120 98 Q116 110 122 118" fill="none" stroke={t.stroke} strokeWidth="5" strokeLinecap="round" />
      <path d="M56 50 L38 30 Q34 26 40 23 L48 20 Q52 19 55 23 L70 44 Z" fill={u("dark")} stroke={t.stroke} strokeWidth="2" />
      <path d="M50 44 H122 V102 H60 Q50 102 52 92 Z" fill={u("steel")} stroke={t.stroke} strokeWidth="2.5" strokeLinejoin="round" />
      {/* spikes */}
      <path d="M148 36 L157 20 L166 36 Z M186 36 L195 20 L204 36 Z" fill={t.accent} stroke={t.stroke} strokeWidth="2" strokeLinejoin="round" />
      {/* barrel */}
      <rect x="112" y="34" width="104" height="48" rx="12" fill={u("steel")} stroke={t.stroke} strokeWidth="2.5" />
      <rect x="128" y="31" width="11" height="54" rx="3" fill={u("dark")} stroke={t.stroke} strokeWidth="2" />
      <rect x="174" y="31" width="11" height="54" rx="3" fill={u("dark")} stroke={t.stroke} strokeWidth="2" />
      <rect x="116" y="38" width="96" height="6" rx="3" fill="#fff" opacity="0.6" />
      {t.glow && <rect x="142" y="64" width="30" height="5" rx="2.5" fill={t.glow} style={{ filter: `drop-shadow(0 0 5px ${t.glow})` }} />}
      {/* flared muzzle */}
      <path d="M210 30 L238 20 Q244 20 244 26 L244 90 Q244 96 238 96 L210 86 Z" fill={u("dark")} stroke={t.stroke} strokeWidth="2.5" strokeLinejoin="round" />
      <ellipse cx="240" cy="58" rx="4" ry="26" fill="#1e2428" />
      <circle cx="66" cy="60" r="3" fill={t.accent} />
      <circle cx="66" cy="84" r="3" fill={t.accent} />
    </svg>
  );
}
