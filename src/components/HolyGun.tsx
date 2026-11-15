/** "Holy Light Gun" – golden angel-winged gun with halo (pure SVG) */
export default function HolyGun({ width = 200 }: { width?: number }) {
  const feather = (len: number) => `M0 0 C -9 -10 -11 ${-len * 0.62} 0 ${-len} C 11 ${-len * 0.62} 9 -10 0 0 Z`;
  const left = [-18, -36, -54, -72, -90, -106];
  const right = left.map((a) => -a);

  return (
    <svg width={width} height={width * (240 / 220)} viewBox="0 0 220 240" style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id="hg-gold" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#8a5a00" />
          <stop offset="0.28" stopColor="#ffd86a" />
          <stop offset="0.5" stopColor="#fff6c8" />
          <stop offset="0.72" stopColor="#ffc531" />
          <stop offset="1" stopColor="#a86c00" />
        </linearGradient>
        <linearGradient id="hg-band" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#7a4a00" />
          <stop offset="0.5" stopColor="#e0a52a" />
          <stop offset="1" stopColor="#7a4a00" />
        </linearGradient>
        <linearGradient id="hg-feather" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#e9dfc2" />
          <stop offset="0.5" stopColor="#ffffff" />
          <stop offset="1" stopColor="#fffdf4" />
        </linearGradient>
        <radialGradient id="hg-gem" cx="40%" cy="35%" r="70%">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.4" stopColor="#ffd6ec" />
          <stop offset="1" stopColor="#ff6fb1" />
        </radialGradient>
        <radialGradient id="hg-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="rgba(255,240,180,0.9)" />
          <stop offset="1" stopColor="rgba(255,240,180,0)" />
        </radialGradient>
      </defs>

      <g transform="rotate(22 110 130)">
        {/* wings */}
        <g transform="translate(104 98)">
          {left.map((a, i) => (
            <path key={`l${i}`} d={feather(78 - i * 6)} transform={`rotate(${a})`} fill="url(#hg-feather)" stroke="#c9b27a" strokeWidth="1.6" />
          ))}
        </g>
        <g transform="translate(116 98)">
          {right.map((a, i) => (
            <path key={`r${i}`} d={feather(78 - i * 6)} transform={`rotate(${a})`} fill="url(#hg-feather)" stroke="#c9b27a" strokeWidth="1.6" />
          ))}
        </g>

        {/* halo */}
        <ellipse cx="110" cy="12" rx="30" ry="8" fill="none" stroke="#fff3b0" strokeWidth="9" opacity="0.35" />
        <ellipse cx="110" cy="12" rx="28" ry="7" fill="none" stroke="#ffc531" strokeWidth="4" />
        <ellipse cx="110" cy="11" rx="28" ry="7" fill="none" stroke="#fff6c8" strokeWidth="1.5" />

        {/* barrel */}
        <rect x="96" y="40" width="28" height="170" rx="12" fill="url(#hg-gold)" stroke="#6b4300" strokeWidth="2.5" />
        <rect x="92" y="30" width="36" height="18" rx="6" fill="url(#hg-gold)" stroke="#6b4300" strokeWidth="2.5" />
        <ellipse cx="110" cy="32" rx="8" ry="3" fill="#4a2e00" />
        {[72, 112, 162, 194].map((y) => (
          <rect key={y} x="93" y={y} width="34" height="9" rx="4" fill="url(#hg-band)" stroke="#6b4300" strokeWidth="1.5" />
        ))}
        <rect x="94" y="204" width="32" height="14" rx="6" fill="url(#hg-gold)" stroke="#6b4300" strokeWidth="2.5" />
        <rect x="103" y="48" width="5" height="150" rx="2.5" fill="#fff" opacity="0.6" />

        {/* gem */}
        <circle cx="110" cy="138" r="22" fill="url(#hg-glow)" />
        <ellipse cx="110" cy="138" rx="8.5" ry="13" fill="url(#hg-gem)" stroke="#fff" strokeWidth="2" />
        <ellipse cx="107.5" cy="133" rx="2.4" ry="4" fill="#fff" opacity="0.9" />
      </g>
    </svg>
  );
}
