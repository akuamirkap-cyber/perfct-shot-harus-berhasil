export function Bullet({ className = "", trail = true }: { className?: string; trail?: boolean }) {
  return (
    <div className={`flex items-center ${className}`}>
      {trail && (
        <div
          className="h-[3px] w-40 rounded-full"
          style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.9))" }}
        />
      )}
      <div
        className="h-[18px] w-[40px] rounded-l-[3px]"
        style={{
          background: "linear-gradient(180deg,#fff0b0 0%,#e9b543 35%,#b37a12 70%,#e0a838 100%)",
          boxShadow: "inset -3px 0 0 rgba(0,0,0,0.2)",
        }}
      />
      <div
        className="h-[16px] w-[22px] rounded-r-full"
        style={{ background: "linear-gradient(180deg,#ffc8a0 0%,#e2763d 40%,#a3401a 100%)" }}
      />
    </div>
  );
}

type TargetProps = {
  size?: number;
  /** show the bullet hole on the wooden rim */
  hole?: boolean;
  /** animate the hole appearing (ms delay) */
  holeDelay?: number;
  smoke?: boolean;
};

/** Wooden target board. Hole on the rim = MISS */
export function MissedTarget({ size = 170, hole = true, holeDelay = 0, smoke = true }: TargetProps) {
  const d = holeDelay / 1000;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg viewBox="0 0 200 200" width={size} height={size} className="drop-shadow-[0_14px_14px_rgba(0,0,0,0.55)]">
        <defs>
          <radialGradient id="rim" cx="40%" cy="35%" r="70%">
            <stop offset="0%" stopColor="#c4884e" />
            <stop offset="100%" stopColor="#6b3d18" />
          </radialGradient>
          <radialGradient id="shade" cx="35%" cy="30%" r="80%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.35)" />
            <stop offset="60%" stopColor="rgba(255,255,255,0)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0.25)" />
          </radialGradient>
        </defs>
        <circle cx="100" cy="100" r="96" fill="url(#rim)" stroke="#4a280d" strokeWidth="3" />
        {[0, 1, 2, 3].map((i) => (
          <circle key={i} cx="100" cy="100" r={88 - i * 1.5} fill="none" stroke="#5a3312" strokeOpacity="0.3" strokeWidth="0.8" />
        ))}
        <circle cx="100" cy="100" r="80" fill="#f4f1ea" />
        <circle cx="100" cy="100" r="66" fill="#e8332a" />
        <circle cx="100" cy="100" r="52" fill="#f4f1ea" />
        <circle cx="100" cy="100" r="38" fill="#e8332a" />
        <circle cx="100" cy="100" r="24" fill="#f4f1ea" />
        <circle cx="100" cy="100" r="11" fill="#e8332a" />
        <circle cx="100" cy="100" r="96" fill="url(#shade)" />

        {hole && (
          <g transform="translate(166 46)">
            <g stroke="#2a1405" strokeWidth="2" strokeLinecap="round" fill="none">
              <path className="crack-path" d="M0 0 L-14 -6 L-24 -4" style={{ animationDelay: `${d + 0.05}s` }} />
              <path className="crack-path" d="M0 0 L-8 12 L-18 18 L-22 28" style={{ animationDelay: `${d + 0.1}s` }} />
              <path className="crack-path" d="M0 0 L12 8 L16 20" style={{ animationDelay: `${d + 0.12}s` }} />
              <path className="crack-path" d="M0 0 L4 -14 L12 -20" style={{ animationDelay: `${d + 0.15}s` }} />
            </g>
            <g className="anim-hole" style={{ animationDelay: `${d}s` }}>
              <circle r="9" fill="#2a1405" />
              <circle r="6" fill="#0b0502" />
              <circle r="2.4" cx="-2" cy="-2" fill="#d79a3a" opacity="0.6" />
            </g>
          </g>
        )}
      </svg>

      {/* wood splinters */}
      {hole &&
        holeDelay > 0 &&
        Array.from({ length: 9 }).map((_, i) => {
          const a = -Math.PI / 2 + (i / 8) * Math.PI * 1.1 - 0.3;
          return (
            <span
              key={i}
              className="absolute h-[5px] w-[9px] rounded-sm"
              style={
                {
                  left: size * 0.83 - 4,
                  top: size * 0.23 - 2,
                  background: i % 2 ? "#c4884e" : "#7a4a20",
                  "--bx": `${Math.cos(a) * (40 + (i % 3) * 18)}px`,
                  "--by": `${Math.sin(a) * (40 + (i % 3) * 14)}px`,
                  transform: `rotate(${i * 40}deg)`,
                  animation: `sparkle-burst 0.6s cubic-bezier(.2,.7,.4,1) ${d}s both`,
                } as React.CSSProperties
              }
            />
          );
        })}

      {hole &&
        smoke &&
        [0, 1, 2].map((i) => (
          <span
            key={i}
            className="absolute h-5 w-5 rounded-full bg-white/70 blur-[5px]"
            style={
              {
                left: size * 0.8,
                top: size * 0.2,
                "--sx": `${8 + i * 10}px`,
                animation: `smoke 2.4s ease-out ${d + 0.2 + i * 0.7}s infinite`,
              } as React.CSSProperties
            }
          />
        ))}
    </div>
  );
}
