import { useEffect, useRef, useState } from 'react';
import { t } from '../../../i18n/catalog';
import { useLanguage } from '../../../i18n/useLanguage';
import { HeadArt } from '../../perfect-shot/play/HeadArt';
import { BOSS_SPIN, bossSpinBaseDeg, styleSpinRad } from '../game/bossSpin';
import { bossIdlePose } from '../game/bossIdle';

/**
 * CARA MAIN — 4 langkah, satu langkah satu layar.
 *
 * Versi lama menumpuk keempat kartunya sekaligus dan menyorotinya bergiliran:
 * pemain harus membaca empat paragraf sementara satu demo kecil berputar di
 * atasnya. Versi ini sebaliknya. Satu langkah memenuhi layar, demonya besar dan
 * mengulang sendiri tanpa disentuh, dan kalimatnya dipotong sampai tidak bisa
 * dipotong lagi — satu baris perintah, satu baris akibat. Empat ketukan, selesai.
 *
 * Semua gerakan di dalam demo SVG memakai SMIL (`animateTransform`), bukan
 * transform CSS: origin CSS pada elemen SVG mengikuti viewBox, bukan pusat
 * kelompoknya, sehingga putaran dan scale gampang melenceng begitu kelompoknya
 * bersarang di dalam `translate()`. SMIL berputar tepat di origin lokalnya.
 *
 * Langkah 4 bukan ilustrasi: kepala bosnya diputar oleh `styleSpinRad` dan
 * digerakkan `bossIdlePose`, dua fungsi yang sama persis dengan yang dipakai
 * mesin — jadi yang dilihat pemain di popup adalah bos stage 5 yang sebenarnya.
 */

type Props = {
  onClose: () => void;
  /** Pemain baru mendapat lencana, bukan petunjuk Pengaturan. */
  firstRun?: boolean;
  /** Buka KAMUS BOS dari langkah tentang bos. */
  onOpenCodex?: () => void;
};

/** Kalimat per langkah, dua bahasa — satu baris perintah, satu baris akibat. */
const TEXT: { tag: [string, string]; line: [string, string]; note: [string, string]; accent: [string, string] }[] = [
  {
    tag: ['TUJUAN', 'GOAL'],
    line: ['Tanam SEMUA peluru ke roda.', 'Stick EVERY round into the wheel.'],
    note: ['Ammo habis tanpa tabrakan = STAGE CLEAR.', 'Ammo gone with no collision = STAGE CLEAR.'],
    accent: ['#fbbf24', '#f59e0b'],
  },
  {
    tag: ['AWAS', 'DANGER'],
    line: ['Jangan kena pisau atau pelurumu.', 'Never hit a knife or your own round.'],
    note: ['Kena satu saja = GAGAL, ulang dari awal.', 'Touch one = FAIL, restart the stage.'],
    accent: ['#f87171', '#dc2626'],
  },
  {
    tag: ['TEMBAK', 'SHOOT'],
    line: ['Ketuk layar. Peluru lurus ke atas.', 'Tap the screen. Shots fly straight up.'],
    note: ['Roda berputar — tunggu celahnya, lalu ketuk.', 'The wheel spins — wait for the gap, then tap.'],
    accent: ['#38bdf8', '#2563eb'],
  },
  {
    tag: ['BOS', 'BOSS'],
    line: ['Stage 5, 10, 15… ada BOS.', 'Stages 5, 10, 15… are BOSSES.'],
    note: ['Tiap bos punya putaran khas. Pelajari di Kamus Bos.', 'Every boss spins its own way. Study it in the Boss Codex.'],
    accent: ['#e879f9', '#a21caf'],
  },
];

/** Timeline langkah 1: lima peluru menancap berurutan dalam satu siklus. */
const CYCLE = 5;
const STICK_AT = [0.55, 1.3, 2.05, 2.8, 3.55];
const kt = (secs: number[]) => secs.map((s) => Math.min(1, Math.max(0, s / CYCLE)).toFixed(3)).join(';');

/** Pisau rintangan: ujung tertanam, gagang berdiri keluar, berdenyut merah. */
function KnifeGlyph() {
  return (
    <g>
      <ellipse cx="0" cy="1" rx="6.5" ry="2.4" fill="rgba(0,0,0,.5)" />
      <path d="M0 17 L-4 -2 L-2.6 -24 L2.6 -24 L4 -2 Z" fill="#dfe5ee" stroke="#151a22" strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M0 17 L-1.2 -2 L-0.8 -23 L1.2 -23 Z" fill="#fff" opacity=".55" />
      <rect x="-6.6" y="-27" width="13.2" height="3.6" rx="1.6" fill="#8b93a1" stroke="#151a22" strokeWidth=".9" />
      <rect x="-4.6" y="-39" width="9.2" height="12.4" rx="2.4" fill="#7c3b16" stroke="#1d0d03" strokeWidth="1" />
      <rect x="-2.4" y="-37" width="1.9" height="8.6" rx=".9" fill="#c07a3c" opacity=".85" />
    </g>
  );
}

/** Pisau di lingkar roda r=52, pada sudut `deg` (0 = atas). */
function RimKnife({ deg, delay }: { deg: number; delay: number }) {
  return (
    <g transform={`rotate(${deg}) translate(0 -52)`}>
      <g transform="scale(0.62)">
        <g transform="translate(0 -10)">
          <circle r="21" fill="none" stroke="#ff4d4d" strokeWidth="2.4" opacity=".2">
            <animate attributeName="opacity" values=".15;.85;.15" dur="1.25s" begin={`${delay}ms`} repeatCount="indefinite" />
            <animateTransform attributeName="transform" type="scale" values=".82;1.16;.82" dur="1.25s" begin={`${delay}ms`} repeatCount="indefinite" />
          </circle>
        </g>
        <KnifeGlyph />
      </g>
    </g>
  );
}

/** Muka roda latihan: papan kayu dengan garis celah. */
function WheelFace({ r = 52 }: { r?: number }) {
  return (
    <g>
      <circle r={r} fill="url(#thp-wood)" stroke="#5b3a1c" strokeWidth="3" />
      <circle r={r - 9} fill="none" stroke="rgba(255,255,255,.18)" strokeWidth="1.6" strokeDasharray="4 8" />
      <circle r={r * 0.42} fill="none" stroke="rgba(255,255,255,.22)" strokeWidth="1.4" />
      {Array.from({ length: 8 }, (_, i) => (
        <line key={i} x1="0" y1="0" x2="0" y2={-r + 3} stroke="rgba(255,255,255,.12)" strokeWidth="1.2" transform={`rotate(${i * 45})`} />
      ))}
      <circle r="4.5" fill="#f8fafc" opacity=".85" />
    </g>
  );
}

/** Peluru latihan: noselnya menancap ke dalam, pantatnya di luar. */
function RoundGlyph({ fill = 'url(#thp-round)' }: { fill?: string }) {
  return (
    <g>
      <rect x="-4" y="-20" width="8" height="26" rx="3" fill={fill} stroke="#78350f" strokeWidth="1.2" />
      <path d="M-4 6 L0 14 L4 6 Z" fill="#fff7d6" />
    </g>
  );
}

/* ---------------------------------------------------------------- langkah 1 */
function GoalDemo() {
  return (
    <svg viewBox="0 0 320 190" className="h-full w-full" aria-hidden="true">
      <defs>
        <radialGradient id="thp-wood" cx=".38" cy=".3">
          <stop offset="0" stopColor="#fcd9a0" /><stop offset="1" stopColor="#c98a45" />
        </radialGradient>
        <linearGradient id="thp-round" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff7d6" /><stop offset=".45" stopColor="#fbbf24" /><stop offset="1" stopColor="#a16207" />
        </linearGradient>
      </defs>

      {/* ammo berkurang satu tiap peluru menancap */}
      <text x="18" y="26" fill="rgba(255,255,255,.55)" fontSize="10" fontWeight="800" letterSpacing="1.6">AMMO</text>
      {STICK_AT.map((at, i) => (
        <g key={i}>
          <animate attributeName="opacity" values="1;1;0;0" keyTimes={kt([0, at - 0.01, at + 0.1, CYCLE])} dur={`${CYCLE}s`} repeatCount="indefinite" />
          <rect x={18 + i * 17} y="33" width="12" height="20" rx="3" fill="url(#thp-round)" stroke="#78350f" strokeWidth="1" />
          <path d={`M${18 + i * 17} 39 l6 -6 l6 6 z`} fill="#fff7d6" opacity=".9" />
        </g>
      ))}

      <g transform="translate(160 96)">
        <circle r="66" fill="#fbbf24" opacity=".12">
          <animate attributeName="opacity" values=".1;.28;.1" dur="2.6s" repeatCount="indefinite" />
          <animateTransform attributeName="transform" type="scale" values=".96;1.06;.96" dur="2.6s" repeatCount="indefinite" />
        </circle>
        <g>
          <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="9s" repeatCount="indefinite" />
          <WheelFace />
          {STICK_AT.map((at, i) => (
            <g key={i} transform={`rotate(${-90 + i * 72})`}>
              <g>
                <animateTransform attributeName="transform" type="translate"
                  values="0 -46;0 -46;0 0;0 0" keyTimes={kt([0, at - 0.01, at + 0.18, CYCLE])}
                  dur={`${CYCLE}s`} repeatCount="indefinite" calcMode="spline"
                  keySplines="0 0 1 1;.2 .9 .25 1;0 0 1 1" />
                <animate attributeName="opacity" values="0;0;1;1" keyTimes={kt([0, at - 0.01, at + 0.12, CYCLE])}
                  dur={`${CYCLE}s`} repeatCount="indefinite" />
                <g transform="translate(0 -52)"><RoundGlyph /></g>
              </g>
            </g>
          ))}
        </g>
      </g>

      {/* STAGE CLEAR muncul begitu peluru kelima masuk */}
      <g transform="translate(160 89)">
        <g>
          <animateTransform attributeName="transform" type="scale" values=".6;.6;1.14;1;.92"
            keyTimes="0;.86;.9;.95;1" dur={`${CYCLE}s`} repeatCount="indefinite" />
          <animate attributeName="opacity" values="0;0;1;1;0" keyTimes="0;.86;.9;.97;1" dur={`${CYCLE}s`} repeatCount="indefinite" />
          <rect x="-74" y="-17" width="148" height="34" rx="9" fill="rgba(4,20,12,.92)" stroke="#4ade80" strokeWidth="2" />
          <text x="0" y="6" textAnchor="middle" fill="#bbf7d0" fontSize="16" fontWeight="900" letterSpacing="1.4">STAGE CLEAR!</text>
        </g>
      </g>
    </svg>
  );
}

/* ---------------------------------------------------------------- langkah 2 */
function DangerDemo({ id }: { id: boolean }) {
  return (
    <svg viewBox="0 0 320 190" className="h-full w-full" aria-hidden="true">
      <defs>
        <radialGradient id="thp-wood2" cx=".38" cy=".3">
          <stop offset="0" stopColor="#fcd9a0" /><stop offset="1" stopColor="#c98a45" />
        </radialGradient>
        <radialGradient id="thp-boom">
          <stop offset="0" stopColor="#fff1f2" /><stop offset=".4" stopColor="#f87171" /><stop offset="1" stopColor="rgba(220,38,38,0)" />
        </radialGradient>
      </defs>

      <g transform="translate(160 92)">
        <g>
          <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="11s" repeatCount="indefinite" />
          <circle r="52" fill="url(#thp-wood2)" stroke="#5b3a1c" strokeWidth="3" />
          <circle r="43" fill="none" stroke="rgba(255,255,255,.16)" strokeWidth="1.5" strokeDasharray="4 8" />
          <circle r="4.5" fill="#f8fafc" opacity=".8" />
          {/* pisau di deg 2 persis di jalur tembakan — inilah yang akan kena */}
          <RimKnife deg={2} delay={0} />
          <RimKnife deg={118} delay={320} />
          <RimKnife deg={236} delay={640} />
          {/* peluru pemain yang sudah menancap */}
          <g transform="rotate(-58) translate(0 -52)">
            <rect x="-3.6" y="-18" width="7.2" height="22" rx="2.6" fill="#e2e8f0" stroke="#334155" strokeWidth="1" />
          </g>
          {/* celah aman: ikut berputar, jadi selalu menunjuk celah yang benar */}
          <g transform="rotate(-91) translate(0 -70)">
            <g>
              <animateTransform attributeName="transform" type="scale" values=".6;.6;1;1;1.3" keyTimes="0;.2;.3;.42;.52" dur="3.4s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0;0;1;1;0;0" keyTimes="0;.2;.3;.42;.52;1" dur="3.4s" repeatCount="indefinite" />
              <circle r="10" fill="none" stroke="#4ade80" strokeWidth="2" strokeDasharray="3 4" />
              <path d="M-4 0 L-1 3.4 L4.6 -3.2" fill="none" stroke="#86efac" strokeWidth="2.2" strokeLinecap="round" />
            </g>
          </g>
        </g>
      </g>

      {/* tembakan yang salah: melesat naik lalu mencium pisau */}
      <g>
        <animateTransform attributeName="transform" type="translate"
          values="160 200;160 194;160 66;160 58;160 58" keyTimes="0;.12;.42;.46;1" dur="3.4s"
          repeatCount="indefinite" calcMode="spline" keySplines="0 0 1 1;.4 0 .6 1;.4 0 .6 1;0 0 1 1" />
        <animate attributeName="opacity" values="0;1;1;1;0;0" keyTimes="0;.1;.42;.46;.52;1" dur="3.4s" repeatCount="indefinite" />
        <rect x="-4" y="-14" width="8" height="26" rx="3" fill="#e2e8f0" stroke="#475569" strokeWidth="1.2" />
        <path d="M-4 -14 L0 -22 L4 -14 Z" fill="#fff" />
      </g>

      {/* ledakan di titik tabrak */}
      <g transform="translate(162 42)">
        <g>
          <animateTransform attributeName="transform" type="scale" values=".2;.2;1.25;1;1.35" keyTimes="0;.44;.5;.62;.74" dur="3.4s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0;0;1;.7;0;0" keyTimes="0;.44;.5;.62;.74;1" dur="3.4s" repeatCount="indefinite" />
          <circle r="30" fill="url(#thp-boom)" />
          <path d="M-12 -12 L12 12 M12 -12 L-12 12" stroke="#fff1f2" strokeWidth="5" strokeLinecap="round" />
        </g>
      </g>

      {/* GAGAL! bergetar */}
      <g>
        <animateTransform attributeName="transform" type="translate"
          values="0 0;0 0;-6 0;6 0;-4 0;3 0;0 0;0 0" keyTimes="0;.47;.52;.56;.6;.64;.7;1" dur="3.4s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0;0;1;1;0;0" keyTimes="0;.47;.52;.84;.92;1" dur="3.4s" repeatCount="indefinite" />
        <rect x="104" y="148" width="112" height="30" rx="9" fill="rgba(30,4,8,.92)" stroke="#f87171" strokeWidth="2" />
        <text x="160" y="168" textAnchor="middle" fill="#fecaca" fontSize="15" fontWeight="900" letterSpacing="1.6">{id ? 'GAGAL!' : 'FAIL!'}</text>
      </g>
    </svg>
  );
}

/* ---------------------------------------------------------------- langkah 3 */
function ShootDemo({ id }: { id: boolean }) {
  return (
    <svg viewBox="0 0 320 190" className="h-full w-full" aria-hidden="true">
      <defs>
        <radialGradient id="thp-wood3" cx=".38" cy=".3">
          <stop offset="0" stopColor="#fcd9a0" /><stop offset="1" stopColor="#c98a45" />
        </radialGradient>
        <linearGradient id="thp-gun" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e2e8f0" /><stop offset="1" stopColor="#64748b" />
        </linearGradient>
      </defs>

      <g transform="translate(160 62)">
        <circle r="58" fill="#38bdf8" opacity=".1">
          <animate attributeName="opacity" values=".06;.2;.06" dur="2.6s" repeatCount="indefinite" />
        </circle>
        {/* panah arah putaran */}
        <g opacity=".45">
          <animate attributeName="opacity" values=".35;1;.35" dur="2.6s" repeatCount="indefinite" />
          <path d="M-46 -34 A58 58 0 0 1 46 -34" fill="none" stroke="#7dd3fc" strokeWidth="2.4" strokeLinecap="round" strokeDasharray="7 7" />
          <path d="M46 -34 l-9 -3 l3 10 z" fill="#7dd3fc" />
        </g>
        <g>
          <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="4.6s" repeatCount="indefinite" />
          <circle r="40" fill="url(#thp-wood3)" stroke="#5b3a1c" strokeWidth="3" />
          <circle r="31" fill="none" stroke="rgba(255,255,255,.18)" strokeWidth="1.5" strokeDasharray="4 8" />
          <circle r="4" fill="#f8fafc" opacity=".85" />
          <g transform="rotate(-90) translate(0 -40)">
            <rect x="-3.6" y="-16" width="7.2" height="20" rx="2.6" fill="#e2e8f0" stroke="#334155" strokeWidth="1" />
          </g>
        </g>
      </g>

      {/* garis bidik putus-putus yang mengalir ke atas */}
      <line x1="160" y1="112" x2="160" y2="152" stroke="#7dd3fc" strokeWidth="2" strokeDasharray="5 6" opacity=".8">
        <animate attributeName="stroke-dashoffset" values="0;-22" dur=".8s" repeatCount="indefinite" />
      </line>

      {/* peluru: dari moncong sampai bibir roda */}
      <g>
        <animateTransform attributeName="transform" type="translate"
          values="160 168;160 162;160 124;160 120;160 120" keyTimes="0;.12;.44;.5;1" dur="2.1s"
          repeatCount="indefinite" calcMode="spline" keySplines="0 0 1 1;.3 0 .6 1;.3 0 .6 1;0 0 1 1" />
        <animate attributeName="opacity" values="0;1;1;1;0;0" keyTimes="0;.1;.44;.5;.58;1" dur="2.1s" repeatCount="indefinite" />
        <rect x="-4" y="-13" width="8" height="24" rx="3" fill="#fff" stroke="#94a3b8" strokeWidth="1.1" />
        <path d="M-4 -13 L0 -21 L4 -13 Z" fill="#fde68a" />
      </g>

      {/* pistol + gelombang ketukan */}
      <g transform="translate(160 166)">
        <g>
          <animateTransform attributeName="transform" type="translate" values="0 0;0 5;0 0;0 0" keyTimes="0;.14;.26;1" dur="2.1s" repeatCount="indefinite" />
          <path d="M-22 10 L-9 10 L-9 -3 L9 -3 L9 3 L25 3 L25 10 Z" fill="url(#thp-gun)" stroke="#0f172a" strokeWidth="1.6" />
          <rect x="-3.4" y="-9" width="6.8" height="8" rx="1.6" fill="#38bdf8" />
        </g>
        <g transform="translate(0 6)">
          <circle r="10" fill="none" stroke="#7dd3fc" strokeWidth="2.6">
            <animate attributeName="opacity" values="0;1;0;0" keyTimes="0;.12;.34;1" dur="2.1s" repeatCount="indefinite" />
            <animateTransform attributeName="transform" type="scale" values=".4;.8;1.9;1.9" keyTimes="0;.12;.34;1" dur="2.1s" repeatCount="indefinite" />
          </circle>
          <circle r="10" fill="none" stroke="#bae6fd" strokeWidth="1.8">
            <animate attributeName="opacity" values="0;0;.9;0;0" keyTimes="0;.08;.2;.42;1" dur="2.1s" repeatCount="indefinite" />
            <animateTransform attributeName="transform" type="scale" values=".4;.4;.9;2.1;2.1" keyTimes="0;.08;.2;.42;1" dur="2.1s" repeatCount="indefinite" />
          </circle>
        </g>
      </g>
      <text x="196" y="176" fill="rgba(186,230,253,.9)" fontSize="11" fontWeight="900" letterSpacing="1">{id ? 'KETUK' : 'TAP'}</text>
    </svg>
  );
}

/* ---------------------------------------------------------------- langkah 4 */
/** Bos stage 5 yang sebenarnya: diputar fungsi putaran mesin, bukan CSS. */
function BossDemo({ id }: { id: boolean }) {
  const spinRef = useRef<HTMLDivElement | null>(null);
  const poseRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    let rot = 0;
    let time = 0;
    const style = BOSS_SPIN.pirate;
    const step = (now: number) => {
      raf = requestAnimationFrame(step);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      time += dt;
      // 0.65x kecepatan stage 5 supaya terbaca di dalam popup, tapi polanya asli.
      rot += styleSpinRad(style, time, bossSpinBaseDeg(5)) * dt * 0.65;
      const pose = bossIdlePose('pirate', time, 62, false);
      if (spinRef.current) spinRef.current.style.transform = `rotate(${(rot * 180 / Math.PI).toFixed(2)}deg)`;
      if (poseRef.current) {
        poseRef.current.style.transform =
          `translate3d(${pose.dx.toFixed(2)}px, ${pose.dy.toFixed(2)}px, 0) rotate(${(pose.rot * 180 / Math.PI).toFixed(2)}deg) scale(${pose.sx.toFixed(4)}, ${pose.sy.toFixed(4)})`;
      }
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="relative h-full w-full overflow-hidden"
      style={{ background: 'radial-gradient(120% 90% at 50% 8%, rgba(58,155,224,.32) 0%, rgba(6,10,20,.96) 62%)' }}>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative h-[128px] w-[128px]">
          <div className="pointer-events-none absolute inset-[-8%] rounded-full border border-dashed border-sky-300/40 thp-halo" />
          <div ref={spinRef} className="absolute inset-0 will-change-transform">
            <div ref={poseRef} className="absolute inset-0 will-change-transform" style={{ transformOrigin: '50% 85%' }}>
              <HeadArt kind="pirate" className="h-full w-full drop-shadow-[0_8px_18px_rgba(0,0,0,.65)]" />
            </div>
            <svg viewBox="-100 -100 200 200" className="absolute inset-0 h-full w-full overflow-visible" aria-hidden="true">
              {[0, 118, 236].map((deg, i) => (
                <g key={deg} transform={`rotate(${deg}) translate(0 -96)`}>
                  <ellipse cx="0" cy="1" rx="8.5" ry="3.2" fill="rgba(0,0,0,.5)" />
                  <rect x="-6" y="7" width="12" height="14" rx="2.4" fill="#7c3b16" stroke="#1d0d03" strokeWidth="1.2" />
                  <rect x="-8.4" y="3" width="16.8" height="4.2" rx="1.8" fill="#8b93a1" stroke="#151a22" strokeWidth="1" />
                  <path d="M0 -38 L-5 -10 L-3.2 4 L3.2 4 L5 -10 Z" fill="#dfe5ee" stroke="#151a22" strokeWidth="1.5" strokeLinejoin="round" />
                  <path d="M0 -38 L-1.5 -10 L-1 3 L1.5 3 Z" fill="#fff" opacity=".55" />
                  <g transform="translate(0 -22)">
                    <circle r="14" fill="none" stroke="#ff4d4d" strokeWidth="1.6" opacity=".2">
                      <animate attributeName="opacity" values=".18;.85;.18" dur="1.35s" begin={`${i * 240}ms`} repeatCount="indefinite" />
                      <animateTransform attributeName="transform" type="scale" values=".82;1.16;.82" dur="1.35s" begin={`${i * 240}ms`} repeatCount="indefinite" />
                    </circle>
                  </g>
                </g>
              ))}
            </svg>
          </div>
        </div>
      </div>

      {/* bilah HP yang terkuras tiap kali peluru masuk */}
      <div className="absolute inset-x-4 top-2">
        <div className="mb-1 flex items-center justify-between text-[9px] font-black tracking-[0.18em] text-white/60">
          <span>PIRATE CAPTAIN</span><span className="thp-hpnum">HP</span>
        </div>
        <div className="h-3 overflow-hidden rounded-full border border-white/20 bg-black/60">
          <div className="thp-hpbar h-full rounded-full" style={{ background: 'linear-gradient(90deg,#f87171,#ef4444 60%,#b91c1c)' }} />
        </div>
      </div>

      {/* peluru yang menghantam bos */}
      <div className="thp-bossshot absolute bottom-1 left-1/2 h-8 w-2 rounded-full bg-white shadow-[0_0_12px_rgba(255,255,255,.9)]" />
      <span className="thp-bossbadge absolute bottom-3 right-3 rounded-lg border border-fuchsia-300/50 bg-fuchsia-500/20 px-2 py-1 text-[10px] font-black tracking-wider text-fuchsia-100">
        {id ? 'TIAP 5 STAGE' : 'EVERY 5 STAGES'}
      </span>
    </div>
  );
}

const DEMOS = [GoalDemo, DangerDemo, ShootDemo, BossDemo];

/**
 * CSS hanya untuk elemen HTML (cangkang, kartu, div bos). Semua gerakan di
 * dalam SVG di atas sudah dipegang SMIL, jadi tidak ada perang origin di sini.
 */
const CSS = `
.thp-shell { animation: thp-pop .5s cubic-bezier(.2,.9,.25,1) both; }
@keyframes thp-pop { from { opacity: 0; transform: translateY(26px) scale(.94); } to { opacity: 1; transform: none; } }
.thp-step { animation: thp-step-in .42s cubic-bezier(.2,.9,.25,1) both; }
@keyframes thp-step-in { from { opacity: 0; transform: translateX(26px) scale(.99); } to { opacity: 1; transform: none; } }
.thp-halo { animation: thp-rot 12s linear infinite; }
@keyframes thp-rot { to { transform: rotate(360deg); } }
.thp-hpbar { animation: thp-hpbar 4.2s cubic-bezier(.3,.8,.4,1) infinite; }
@keyframes thp-hpbar {
  0% { width: 100%; } 12% { width: 86%; } 26% { width: 70%; } 40% { width: 55%; }
  54% { width: 40%; } 68% { width: 24%; } 82% { width: 9%; } 90% { width: 0%; } 100% { width: 100%; }
}
.thp-hpnum { animation: thp-hpnum 4.2s steps(1) infinite; }
@keyframes thp-hpnum { 0%, 53% { color: rgba(255,255,255,.6); } 54%, 90% { color: #fca5a5; } }
.thp-bossshot { animation: thp-bossshot 4.2s cubic-bezier(.3,0,.6,1) infinite; }
@keyframes thp-bossshot {
  0% { transform: translate(-50%, 0); opacity: 0; }
  4% { opacity: 1; }
  10% { transform: translate(-50%, -108px) scaleY(1.5); opacity: 0; }
  24% { opacity: 0; transform: translate(-50%, 0); }
  28% { transform: translate(-50%, 0); opacity: 1; }
  36% { transform: translate(-50%, -108px) scaleY(1.5); opacity: 0; }
  52% { transform: translate(-50%, 0); opacity: 1; }
  60% { transform: translate(-50%, -108px) scaleY(1.5); opacity: 0; }
  100% { transform: translate(-50%, 0); opacity: 0; }
}
.thp-bossbadge { animation: thp-badge 4.2s ease-in-out infinite; }
@keyframes thp-badge { 0%,100% { opacity: .65; transform: translateY(0); } 50% { opacity: 1; transform: translateY(-2px); } }
@media (prefers-reduced-motion: reduce) {
  .thp-shell, .thp-step, .thp-halo, .thp-hpbar, .thp-bossshot, .thp-bossbadge { animation-duration: .01ms !important; animation-iteration-count: 1 !important; }
}
`;

export default function HowToPlayPage({ onClose, firstRun = false, onOpenCodex }: Props) {
  const [language] = useLanguage();
  const id = language === 'id';
  const [step, setStep] = useState(0);
  const last = step === TEXT.length - 1;
  const copy = TEXT[step];
  const Demo = DEMOS[step];

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); onClose(); return; }
      if (event.key === 'ArrowRight' || event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        setStep((v) => (v < TEXT.length - 1 ? v + 1 : v));
      }
      if (event.key === 'ArrowLeft') setStep((v) => Math.max(0, v - 1));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="absolute inset-0 z-[80] flex items-center justify-center bg-[#04060c]/88 p-3 text-slate-100 backdrop-blur-md"
      role="dialog" aria-modal="true" aria-label={t(language, 'help.title')}>
      <style>{CSS}</style>

      <div className="thp-shell relative flex max-h-[96%] w-full max-w-[392px] flex-col overflow-hidden rounded-[26px] border border-white/14 bg-gradient-to-b from-[#151a2e] via-[#0f1323] to-[#080a13] shadow-[0_28px_80px_rgba(0,0,0,.8),0_0_0_1px_rgba(255,255,255,.05)]">
        <div className="pointer-events-none absolute -top-24 left-1/2 h-44 w-72 -translate-x-1/2 rounded-full blur-3xl transition-colors duration-500"
          style={{ background: `${copy.accent[0]}33` }} />

        {/* header ramping: nomor langkah + titik progres, tanpa paragraf */}
        <header className="relative z-10 flex shrink-0 items-center gap-2.5 px-3.5 pb-2 pt-3">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl text-[13px] font-black text-[#120c02] shadow-[0_3px_10px_rgba(0,0,0,.5)]"
            style={{ background: `linear-gradient(160deg, ${copy.accent[0]}, ${copy.accent[1]})` }}>
            {step + 1}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[9px] font-black tracking-[0.2em]" style={{ color: copy.accent[0] }}>
              {t(language, 'help.stepOf')} {step + 1}/4 · {id ? copy.tag[0] : copy.tag[1]}
            </p>
            <div className="mt-1 flex gap-1">
              {TEXT.map((_, i) => (
                <button key={i} type="button" onClick={() => setStep(i)} aria-label={`${i + 1}`}
                  className="h-1.5 flex-1 rounded-full transition-all duration-300"
                  style={{
                    background: i === step ? copy.accent[0] : i < step ? `${copy.accent[0]}55` : 'rgba(255,255,255,.14)',
                    boxShadow: i === step ? `0 0 10px ${copy.accent[0]}aa` : undefined,
                  }} />
              ))}
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label={t(language, 'common.close')}
            className="press grid h-8 w-8 shrink-0 place-items-center rounded-xl border border-white/15 bg-white/10 text-xs font-black text-white hover:bg-white/20">✕</button>
        </header>

        {/* panggung demo langkah ini — di-remount supaya animasinya mulai ulang */}
        <div key={step} className="thp-step relative z-10 mx-3 overflow-hidden rounded-2xl border border-white/12 bg-black/45" style={{ height: 178 }}>
          <Demo id={id} />
          {firstRun && step === 0 && (
            <span className="absolute left-2 top-2 rounded-full bg-emerald-400 px-2 py-0.5 text-[8.5px] font-black tracking-[0.16em] text-[#052e16] shadow-[0_0_14px_rgba(52,211,153,.6)]">
              {id ? 'PEMAIN BARU' : 'NEW PLAYER'}
            </span>
          )}
        </div>

        {/* satu baris perintah + satu baris akibat */}
        <div key={`txt-${step}`} className="thp-step relative z-10 px-4 pb-1 pt-3 text-center">
          <h2 className="font-title text-[21px] font-black leading-[1.15] tracking-wide text-white">
            {id ? copy.line[0] : copy.line[1]}
          </h2>
          <p className="mx-auto mt-1.5 max-w-[300px] text-[11.5px] font-semibold leading-snug" style={{ color: `${copy.accent[0]}dd` }}>
            {id ? copy.note[0] : copy.note[1]}
          </p>
        </div>

        <footer className="relative z-10 mt-auto shrink-0 px-3 pb-3 pt-2.5">
          {step === 3 && onOpenCodex && (
            <button type="button" onClick={onOpenCodex}
              className="press mb-2 flex h-9 w-full items-center justify-center gap-1.5 rounded-xl border border-fuchsia-300/40 bg-fuchsia-500/12 font-title text-[11px] tracking-wide text-fuchsia-100 hover:bg-fuchsia-500/22">
              {t(language, 'help.codex')}
            </button>
          )}
          <div className="flex gap-2">
            {step > 0 && (
              <button type="button" onClick={() => setStep(step - 1)}
                className="press h-11 w-14 shrink-0 rounded-2xl border border-white/15 bg-white/[.06] font-title text-[13px] text-white/75 hover:bg-white/[.12]">←</button>
            )}
            <button type="button" onClick={() => (last ? onClose() : setStep(step + 1))} autoFocus
              className="press h-11 flex-1 rounded-2xl border-2 font-title text-[13.5px] tracking-wide text-white transition active:scale-[.98]"
              style={{
                borderColor: last ? '#6ee7b7' : copy.accent[0],
                background: last ? 'linear-gradient(180deg,#34d399,#059669)' : `linear-gradient(180deg, ${copy.accent[0]}, ${copy.accent[1]})`,
                boxShadow: last ? '0 8px 24px rgba(16,185,129,.35)' : `0 8px 22px ${copy.accent[1]}55`,
                textShadow: '0 1px 2px rgba(0,0,0,.45)',
              }}>
              {last ? `▶ ${t(language, 'help.start')}` : t(language, 'help.next')}
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
