const trees = [
  { left: -4, w: 46, op: 0.55, blur: 1 },
  { left: 12, w: 16, op: 0.25, blur: 3 },
  { left: 30, w: 10, op: 0.18, blur: 4 },
  { left: 47, w: 22, op: 0.22, blur: 3 },
  { left: 68, w: 12, op: 0.2, blur: 4 },
  { left: 80, w: 26, op: 0.3, blur: 2 },
  { left: 94, w: 44, op: 0.5, blur: 1 },
];

const branches = [
  { top: 13, left: 4, w: 120, rot: -28 },
  { top: 48, left: 0, w: 150, rot: -22 },
  { top: 51, left: 72, w: 130, rot: 30 },
  { top: 34, left: 83, w: 90, rot: -35 },
  { top: 9, left: 62, w: 110, rot: 24 },
];

function grassPath() {
  let d = "M0 60 ";
  const n = 70;
  for (let i = 0; i <= n; i++) {
    const x = (i / n) * 470;
    const h = 18 + ((i * 37) % 29) + (i % 3 === 0 ? 14 : 0);
    d += `L${x - 3} 60 L${x + ((i % 2) * 4 - 2)} ${60 - h} L${x + 3} 60 `;
  }
  return d + "L470 60 Z";
}
const GRASS = grassPath();

export default function Background({ danger }: { danger: boolean }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* base gradient */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 55% at 50% 45%, #2f5a5f 0%, #1f3f45 45%, #12272d 80%, #0b1a1f 100%)",
        }}
      />
      {/* warm light top-left */}
      <div
        className="absolute -left-20 -top-24 h-72 w-72 rounded-full opacity-50 blur-3xl"
        style={{ background: "radial-gradient(circle, #c8b46a 0%, transparent 70%)" }}
      />
      {/* trees */}
      {trees.map((t, i) => (
        <div
          key={i}
          className="absolute top-0 bottom-0"
          style={{
            left: `${t.left}%`,
            width: t.w,
            opacity: t.op,
            filter: `blur(${t.blur}px)`,
            background: "linear-gradient(90deg, #07141a, #0d2026 60%, #07141a)",
          }}
        />
      ))}
      {/* branches */}
      {branches.map((b, i) => (
        <div
          key={i}
          className="absolute h-[7px] rounded-full bg-[#081419] opacity-60"
          style={{
            top: `${b.top}%`,
            left: `${b.left}%`,
            width: b.w,
            transform: `rotate(${b.rot}deg)`,
            transformOrigin: "left center",
          }}
        />
      ))}
      {/* fog */}
      <div
        className="anim-fog absolute inset-x-[-20%] top-[30%] h-64 opacity-25 blur-2xl"
        style={{ background: "radial-gradient(ellipse at center, #8fb9bb 0%, transparent 65%)" }}
      />
      {/* dust */}
      {Array.from({ length: 22 }).map((_, i) => (
        <span
          key={i}
          className="absolute rounded-full bg-white"
          style={{
            left: `${(i * 47) % 100}%`,
            top: `${(i * 31 + 7) % 92}%`,
            width: i % 4 === 0 ? 4 : 2,
            height: i % 4 === 0 ? 4 : 2,
            animation: `fx-twinkle ${2 + (i % 5) * 0.7}s ease-in-out ${(i % 7) * 0.4}s infinite`,
          }}
        />
      ))}
      {/* danger vignette */}
      <div
        className={`absolute inset-0 transition-opacity duration-700 ${danger ? "anim-vignette" : "opacity-0"}`}
        style={{
          background:
            "radial-gradient(ellipse 75% 65% at 50% 45%, transparent 55%, rgba(170,20,10,0.55) 100%)",
        }}
      />
      {/* grass */}
      <svg className="absolute bottom-0 left-0 h-16 w-full" viewBox="0 0 470 60" preserveAspectRatio="none">
        <path d={GRASS} fill="#050c0f" />
      </svg>
    </div>
  );
}
