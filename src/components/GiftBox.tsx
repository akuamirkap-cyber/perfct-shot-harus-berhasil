/* Layered 2D gift box – every part animates on its own */

export const GIFT_PHASES = ["intro", "ready", "pulling", "charging", "burst", "reveal", "info"] as const;
export type GiftPhase = (typeof GIFT_PHASES)[number];
const idx = (p: GiftPhase) => GIFT_PHASES.indexOf(p);

export type Tint = { core: string; glow: string };
const DEFAULT_TINT: Tint = { core: "#fff6c8", glow: "rgba(255,200,60,0.8)" };

export type BoxRarity = "common" | "rare" | "epic" | "legend";
type Pal = {
  body: [string, string, string];
  lid: [string, string, string];
  stroke: string;
  rib: [string, string, string, string]; // dark, mid, light, main
  ribStroke: string;
  stud: [string, string, string];
  line: string;
};
const GOLD_RIB = { rib: ["#9a6400", "#ffd76a", "#fff3c0", "#ffc531"] as [string, string, string, string], ribStroke: "#7a4e00", stud: ["#fff3b8", "#ffc531", "#a86c00"] as [string, string, string], line: "#f0cf75" };
export const BOX: Record<BoxRarity, Pal> = {
  common: { body: ["#72f08d", "#2fc152", "#169a38"], lid: ["#a4ffb5", "#45d966", "#22aa44"], stroke: "#0b4d1c", ...GOLD_RIB },
  rare: { body: ["#a46bff", "#7b3fe6", "#5a24c0"], lid: ["#c99bff", "#9354f2", "#6c2fd2"], stroke: "#2b0e66", ...GOLD_RIB },
  epic: { body: ["#ff7d6c", "#e8332a", "#b51b12"], lid: ["#ffa898", "#f24a3a", "#c8261a"], stroke: "#5a0a05", ...GOLD_RIB },
  legend: {
    body: ["#ffe68a", "#ffbf2e", "#e08a00"],
    lid: ["#fff3b0", "#ffd04a", "#f0a010"],
    stroke: "#7a4200",
    rib: ["#a8123f", "#ff6b95", "#ffd3e0", "#ff3d72"],
    ribStroke: "#6b0f2a",
    stud: ["#ffe0ea", "#ff6b95", "#a8123f"],
    line: "#fff6c8",
  },
};
const ribV = (p: Pal) => `linear-gradient(90deg,${p.rib[0]} 0%,${p.rib[1]} 28%,${p.rib[2]} 50%,${p.rib[3]} 72%,${p.rib[0]} 100%)`;
const ribH = (p: Pal) => `linear-gradient(180deg,${p.rib[0]} 0%,${p.rib[1]} 28%,${p.rib[2]} 50%,${p.rib[3]} 72%,${p.rib[0]} 100%)`;
const SHINE_V = "linear-gradient(180deg, transparent, rgba(255,255,255,0.95), transparent)";
const SHINE_H = "linear-gradient(90deg, transparent, rgba(255,255,255,0.95), transparent)";

function Bow({ loose, pal, k }: { loose: number; pal: Pal; k: string }) {
  const spring = "transform .45s cubic-bezier(.3,1.7,.5,1)";
  const g = `url(#gb-bow-${k})`;
  return (
    <svg width="140" height="68" viewBox="0 0 140 68" style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id={`gb-bow-${k}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={pal.rib[2]} />
          <stop offset="0.45" stopColor={pal.rib[3]} />
          <stop offset="1" stopColor={pal.rib[0]} />
        </linearGradient>
      </defs>
      <g style={{ transformOrigin: "70px 58px", transform: `scaleY(${1 + loose * 0.25})`, transition: spring }}>
        <path d="M62 56 L44 72 L57 72 L70 58 Z M78 56 L96 72 L83 72 L70 58 Z" fill={pal.rib[3]} stroke={pal.ribStroke} strokeWidth="2.5" strokeLinejoin="round" />
      </g>
      <g style={{ transformOrigin: "70px 54px", transform: `rotate(${loose >= 1 ? -26 : 0}deg) scale(${loose >= 1 ? 0.92 : 1})`, transition: spring }}>
        <path d="M70 52 C 52 28, 12 2, 6 24 C 0 44, 36 58, 70 55 Z" fill={g} stroke={pal.ribStroke} strokeWidth="3" strokeLinejoin="round" />
        <path d="M64 50 C 50 36, 26 22, 21 31 C 17 40, 40 50, 64 51 Z" fill={pal.rib[0]} opacity="0.45" />
        <path d="M17 20 C 26 11, 42 15, 54 28" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" fill="none" opacity="0.8" />
      </g>
      <g style={{ transformOrigin: "70px 54px", transform: `rotate(${loose >= 2 ? 26 : 0}deg) scale(${loose >= 2 ? 0.92 : 1})`, transition: spring }}>
        <path d="M70 52 C 88 28, 128 2, 134 24 C 140 44, 104 58, 70 55 Z" fill={g} stroke={pal.ribStroke} strokeWidth="3" strokeLinejoin="round" />
        <path d="M76 50 C 90 36, 114 22, 119 31 C 123 40, 100 50, 76 51 Z" fill={pal.rib[0]} opacity="0.45" />
        <path d="M123 20 C 114 11, 98 15, 86 28" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" fill="none" opacity="0.6" />
      </g>
      <rect x="57" y="40" width="26" height="22" rx="7" fill={g} stroke={pal.ribStroke} strokeWidth="3" />
      <rect x="62" y="44" width="9" height="4" rx="2" fill="#fff" opacity="0.8" />
    </svg>
  );
}

function Streamer({ pal, k }: { pal: Pal; k: string }) {
  return (
    <svg width="34" height="210" viewBox="0 0 34 210" style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id={`gb-str-${k}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={pal.rib[0]} />
          <stop offset="0.45" stopColor={pal.rib[2]} />
          <stop offset="1" stopColor={pal.rib[3]} />
        </linearGradient>
      </defs>
      <path
        d="M6 0 C 30 30, -6 60, 18 90 C 40 120, 2 150, 22 180 L 30 210 L 16 200 L 6 210 C -6 180, 30 150, 8 120 C -14 90, 22 60, -2 30 Z"
        fill={`url(#gb-str-${k})`}
        stroke={pal.ribStroke}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path d="M8 6 C 26 32, -2 60, 16 88" stroke="#fff" strokeWidth="2.5" fill="none" opacity="0.7" strokeLinecap="round" />
    </svg>
  );
}

function Lid({ pal, k }: { pal: Pal; k: string }) {
  return (
    <svg width="224" height="40" viewBox="0 0 224 40">
      <defs>
        <linearGradient id={`gb-lid-${k}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={pal.lid[0]} />
          <stop offset="0.5" stopColor={pal.lid[1]} />
          <stop offset="1" stopColor={pal.lid[2]} />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="220" height="36" rx="13" fill={`url(#gb-lid-${k})`} stroke={pal.stroke} strokeWidth="4" />
      <rect x="14" y="8" width="196" height="7" rx="3.5" fill="#fff" opacity="0.45" />
      <rect x="4" y="27" width="216" height="9" rx="4" fill="#000" opacity="0.14" />
    </svg>
  );
}

function Body({ pal, k }: { pal: Pal; k: string }) {
  return (
    <svg width="200" height="132" viewBox="0 0 200 132">
      <defs>
        <linearGradient id={`gb-body-${k}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={pal.body[0]} />
          <stop offset="0.55" stopColor={pal.body[1]} />
          <stop offset="1" stopColor={pal.body[2]} />
        </linearGradient>
        <radialGradient id={`gb-stud-${k}`} cx="35%" cy="30%" r="70%">
          <stop offset="0" stopColor={pal.stud[0]} />
          <stop offset="0.5" stopColor={pal.stud[1]} />
          <stop offset="1" stopColor={pal.stud[2]} />
        </radialGradient>
      </defs>
      <rect x="2" y="2" width="196" height="128" rx="18" fill={`url(#gb-body-${k})`} stroke={pal.stroke} strokeWidth="4" />
      <rect x="5" y="5" width="24" height="122" rx="14" fill="#000" opacity="0.12" />
      <rect x="171" y="5" width="24" height="122" rx="14" fill="#000" opacity="0.18" />
      <rect x="12" y="11" width="176" height="4" rx="2" fill={pal.line} opacity="0.75" />
      <rect x="12" y="117" width="176" height="4" rx="2" fill={pal.line} opacity="0.6" />
      {[
        [28, 36],
        [172, 36],
        [28, 98],
        [172, 98],
      ].map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="6.5" fill={`url(#gb-stud-${k})`} stroke={pal.ribStroke} strokeWidth="1.5" />
      ))}
      <circle cx="58" cy="62" r="3" fill="#fff" opacity="0.45" />
      <circle cx="150" cy="84" r="2" fill="#fff" opacity="0.4" />
      <path d="M14 24 Q 16 14 28 12" stroke="#fff" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.4" />
    </svg>
  );
}

function Gem() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24">
      <path d="M12 2 22 12 12 22 2 12z" fill="#5fe6ff" stroke="#fff" strokeWidth="1.8" />
      <path d="M12 2 17 12 12 22 7 12z" fill="#b6f6ff" opacity="0.8" />
    </svg>
  );
}

type Props = {
  phase: GiftPhase;
  tugs: number;
  tint?: Tint;
  /** 0 = calm, 1..3 = build-up intensity while charging */
  charge?: number;
  fizzle?: boolean;
  /** increment to make the lid hop (on each rarity upgrade) */
  hop?: number;
  box?: BoxRarity;
};

export default function GiftBox({ phase, tugs, tint = DEFAULT_TINT, charge = 0, fizzle = false, hop = 0, box = "rare" }: Props) {
  const pal = BOX[box];
  const k = box;
  const i = idx(phase);
  const at = (p: GiftPhase) => i >= idx(p);
  const idle = phase === "ready";
  const charging = phase === "charging";

  const glow = phase === "ready" ? tugs * 0.2 : phase === "pulling" ? 0.5 : charging ? (fizzle ? 0.35 : 0.55 + charge * 0.15) : 0;
  const rattle = !charging || fizzle ? undefined : charge >= 3 ? "gift-rattle-hard .07s linear infinite" : charge === 2 ? "gift-rattle-hard .1s linear infinite" : charge === 1 ? "gift-rattle .14s linear infinite" : undefined;
  const leak = charging ? (fizzle ? 0.15 : 0.25 + charge * 0.22) : phase === "burst" ? 1 : 0;

  return (
    <div className="relative h-[260px] w-[260px]">
      <div className="absolute left-1/2 top-[236px] h-7 w-[210px] -translate-x-1/2 rounded-[50%] bg-black/55 blur-md" style={{ animation: at("reveal") ? "fade-out .5s ease-in both" : undefined }} />

      {/* drop-in */}
      <div className="absolute inset-0" style={{ transformOrigin: "130px 242px", animation: phase === "intro" ? "gift-drop .85s cubic-bezier(.35,0,.4,1) both" : undefined }}>
        {/* idle bob + hint wiggle */}
        <div className="absolute inset-0" style={{ transformOrigin: "130px 242px", animation: idle ? "gift-idle 3s ease-in-out infinite" : undefined }}>
          <div className="absolute inset-0" style={{ transformOrigin: "130px 242px", animation: idle && tugs === 0 ? "gift-wiggle 3s ease-in-out infinite 1.2s" : undefined }}>
            {/* tug squash */}
            <div key={`tug${tugs}`} className="absolute inset-0" style={{ transformOrigin: "130px 242px", animation: idle && tugs > 0 ? "gift-tug .38s ease-out both" : undefined }}>
              {/* rattle */}
              <div className="absolute inset-0" style={{ transformOrigin: "130px 242px", animation: rattle }}>
                {/* light leaks from seam */}
                {leak > 0 && (
                  <div className="pointer-events-none absolute left-[130px] top-[118px]" style={{ opacity: leak, transition: "opacity .4s", animation: fizzle ? "fizzle-flicker .6s linear both" : undefined }}>
                    {[-34, -18, -6, 6, 18, 34].map((a, k) => (
                      <span
                        key={a}
                        className="absolute bottom-0 block origin-bottom rounded-full"
                        style={
                          {
                            "--a": `${a}deg`,
                            left: -(k % 2 ? 9 : 14),
                            width: k % 2 ? 18 : 28,
                            height: 230 + (k % 3) * 40,
                            background: `linear-gradient(0deg, ${tint.core}, ${tint.glow} 50%, transparent)`,
                            filter: "blur(2px)",
                            transition: "background .25s",
                            animation: `fx-beam-up .5s ease-out ${k * 0.05}s both, beam-flicker .3s ease-in-out ${0.5 + k * 0.05}s infinite`,
                          } as React.CSSProperties
                        }
                      />
                    ))}
                  </div>
                )}

                {/* body */}
                <div className="absolute left-[30px] top-[112px]" style={{ animation: at("reveal") ? "body-sink .6s ease-in both" : undefined }}>
                  <Body pal={pal} k={k} />
                  {at("burst") && (
                    <div
                      className="anim-fade absolute -top-6 left-1/2 h-16 w-[180px] -translate-x-1/2 rounded-[50%]"
                      style={{ background: `radial-gradient(ellipse, ${tint.core}, ${tint.glow} 50%, transparent 72%)` }}
                    />
                  )}
                </div>

                {/* seam glow */}
                <div
                  className="absolute left-[34px] top-[113px] h-[7px] w-[192px] rounded-full"
                  style={{
                    opacity: glow,
                    background: tint.core,
                    boxShadow: `0 0 18px 6px ${tint.glow}, 0 0 40px 14px ${tint.glow}`,
                    transition: "opacity .3s, background .25s, box-shadow .25s",
                    animation: fizzle ? "fizzle-flicker .6s linear both" : undefined,
                  }}
                />

                {/* horizontal ribbon halves */}
                <div
                  className="absolute left-[32px] top-[164px] h-[24px] w-[98px] origin-right overflow-hidden"
                  style={{ background: ribH(pal), borderTop: `2px solid ${pal.ribStroke}`, borderBottom: `2px solid ${pal.ribStroke}`, animation: at("pulling") ? "hrib-peel-l .75s cubic-bezier(.45,0,.8,.6) .14s both" : undefined }}
                >
                  {idle && tugs > 0 && <span key={`sl${tugs}`} className="absolute inset-y-0 left-0 w-10" style={{ background: SHINE_H, animation: "ribbon-shine-l .45s ease-out both" }} />}
                </div>
                <div
                  className="absolute left-[130px] top-[164px] h-[24px] w-[98px] origin-left overflow-hidden"
                  style={{ background: ribH(pal), borderTop: `2px solid ${pal.ribStroke}`, borderBottom: `2px solid ${pal.ribStroke}`, animation: at("pulling") ? "hrib-peel-r .75s cubic-bezier(.45,0,.8,.6) .14s both" : undefined }}
                >
                  {idle && tugs > 0 && <span key={`sr${tugs}`} className="absolute inset-y-0 left-0 w-10" style={{ background: SHINE_H, animation: "ribbon-shine-r .45s ease-out both" }} />}
                </div>

                {/* lid */}
                <div className="absolute left-[18px] top-[82px]" style={{ animation: at("burst") ? "lid-blast .8s cubic-bezier(.2,.6,.4,1) both" : undefined }}>
                  <div key={`hop${hop}`} style={{ animation: charging && hop > 0 ? "lid-hop .42s cubic-bezier(.3,1.4,.5,1) both" : undefined }}>
                    <Lid pal={pal} k={k} />
                  </div>
                </div>

                {/* vertical ribbon */}
                <div
                  className="absolute left-[117px] top-[84px] h-[158px] w-[26px] origin-top overflow-hidden rounded-[4px]"
                  style={{ background: ribV(pal), borderLeft: `2px solid ${pal.ribStroke}`, borderRight: `2px solid ${pal.ribStroke}`, animation: at("pulling") ? "vrib-zip .62s cubic-bezier(.55,0,.85,.45) .08s both" : undefined }}
                >
                  <div className="absolute left-[7px] top-1 h-[150px] w-[3px] rounded-full bg-white/70" />
                  {idle && tugs > 0 && <span key={`sv${tugs}`} className="absolute inset-x-0 top-0 h-12" style={{ background: SHINE_V, animation: "ribbon-shine-v .45s ease-out both" }} />}
                </div>

                {/* gem badge */}
                <div
                  className="absolute left-[107px] top-[158px] flex h-[36px] w-[46px] items-center justify-center rounded-xl"
                  style={{
                    background: "linear-gradient(180deg,#3a1780,#22094f)",
                    border: `3px solid ${pal.rib[1]}`,
                    boxShadow: `0 3px 0 ${pal.ribStroke}, inset 0 2px 4px rgba(0,0,0,0.5)`,
                    animation: at("pulling") ? "badge-pop .8s cubic-bezier(.3,.1,.6,1) both" : undefined,
                  }}
                >
                  <Gem />
                </div>

                {/* bow */}
                <div
                  key={`bow${tugs}`}
                  className="absolute left-[60px] top-[24px]"
                  style={{
                    transformOrigin: "70px 60px",
                    animation: at("pulling") ? "bow-untie .38s ease-in both" : idle && tugs > 0 ? "bow-tug .38s ease-out both" : undefined,
                  }}
                >
                  <Bow loose={tugs} pal={pal} k={k} />
                </div>

                {/* streamers born from the untied bow */}
                {phase === "pulling" && (
                  <>
                    <div className="absolute left-[113px] top-[66px] origin-top" style={{ animation: "streamer-l 1.1s cubic-bezier(.25,.6,.5,1) .12s both" }}>
                      <div style={{ animation: "flutter .16s ease-in-out infinite alternate" }}>
                        <Streamer pal={pal} k={k} />
                      </div>
                    </div>
                    <div className="absolute left-[113px] top-[66px] origin-top" style={{ animation: "streamer-r 1.1s cubic-bezier(.25,.6,.5,1) .12s both" }}>
                      <div style={{ animation: "flutter .16s ease-in-out infinite alternate-reverse" }}>
                        <Streamer pal={pal} k={k} />
                      </div>
                    </div>
                  </>
                )}

                {/* knot stars on each tug + untie */}
                {((idle && tugs > 0) || phase === "pulling") && (
                  <div key={`stars${tugs}${phase}`} className="pointer-events-none absolute left-[130px] top-[76px]">
                    {Array.from({ length: phase === "pulling" ? 12 : 6 }).map((_, k, arr) => {
                      const a = (k / arr.length) * Math.PI * 2;
                      const r = phase === "pulling" ? 110 : 60;
                      return (
                        <span
                          key={k}
                          className="absolute -left-2 -top-2 text-[16px] leading-none text-[#fff3b0]"
                          style={
                            {
                              textShadow: "0 0 8px #ffc531",
                              "--bx": `${Math.cos(a) * r}px`,
                              "--by": `${Math.sin(a) * r * 0.8}px`,
                              animation: `knot-star .6s ease-out ${(k % 3) * 0.04}s both`,
                            } as React.CSSProperties
                          }
                        >
                          ✦
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** small gift icon for buttons / medals */
export function MiniGift({ size = 30 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32">
      <rect x="5" y="13" width="22" height="16" rx="3" fill="#7b3fe6" stroke="#2b0e66" strokeWidth="2" />
      <rect x="3" y="9" width="26" height="6" rx="2.5" fill="#a46bff" stroke="#2b0e66" strokeWidth="2" />
      <rect x="14" y="9" width="4" height="20" fill="#ffc531" stroke="#7a4e00" strokeWidth="1" />
      <path d="M16 9 C 12 3, 6 4, 8 8 C 9 10, 13 10, 16 9 Z M16 9 C 20 3, 26 4, 24 8 C 23 10, 19 10, 16 9 Z" fill="#ffc531" stroke="#7a4e00" strokeWidth="1.4" />
      <rect x="6" y="10.5" width="9" height="2" rx="1" fill="#fff" opacity="0.5" />
    </svg>
  );
}
