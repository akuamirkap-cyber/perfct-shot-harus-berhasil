import { useEffect, useMemo, useRef, useState } from 'react';
import { HeadArt, HEAD_KINDS, type HeadKind } from '../../perfect-shot/play/HeadArt';
import { bossDef } from '../game/bossCatalog';
import { bossKnifeCount } from '../game/levels';
import {
  BOSS_SPIN,
  bossSpinBaseDeg,
  styleCurve,
  stylePeakDeg,
  styleSpinRad,
  type BossSpinStyle,
} from '../game/bossSpin';
import { BOSS_IDLE_NAME, BOSS_IDLE_NAME_EN, bossIdlePose } from '../game/bossIdle';
import { drawBossAngryFace, drawBossLaughExtras } from '../game/bossFaceFx';
import { useLanguage } from '../../../i18n/useLanguage';

/**
 * KAMUS BOS — sebelas bos, animasinya, dan pola putarannya.
 *
 * Ini bukan galeri gambar diam. Kepala di tengah diputar oleh fungsi yang sama
 * persis yang diintegrasikan mesin (`styleSpinRad`), dan gerak melayangnya
 * diambil dari `bossIdlePose` yang sama — jadi apa yang dipelajari pemain di
 * sini benar-benar apa yang akan dia hadapi di stage 5, 10, … 55.
 *
 * Grafik di bawah panggung adalah kurva kecepatan yang sama, dan playhead-nya
 * berjalan pada jam yang sama dengan kepalanya: lihat grafik, lihat bosnya,
 * dan balik arah yang akan datang jadi terbaca sebelum terjadi.
 */

type Props = { onClose: () => void };
type Mood = 'idle' | 'laugh' | 'angry';
/** Stage setiap bos: index 0 = stage 5, index 10 = stage 55. */
const stageOf = (index: number) => (index + 1) * 5;

/** Satu kalimat karakter per bos, dua bahasa. */
const CHARACTER: Record<HeadKind, [id: string, en: string]> = {
  pirate: ['Bos pertama. Olengnya lebar tapi jujur — belajar membaca ayunan di sini.', 'The first boss. His roll is wide but honest — learn to read a swing here.'],
  jester: ['Berhenti untuk tertawa tepat sebelum membalik. Jeda itu jendelamu.', 'Freezes to giggle right before he flips. That pause is your window.'],
  dragon: ['Kepakan sayapnya menambah denyut di atas putaran. Tembak di antara kepakan.', 'His wingbeats ripple on top of the spin. Fire between the beats.'],
  skeleton: ['Patah-patah seperti engsel berkarat. Tiga sentakan maju, satu gesekan mundur.', 'Bony and ratcheted. Three jerks forward, one long creak back.'],
  tiki: ['Nyaris diam, lalu menyentak keras. Jangan menembak saat dia tenang.', 'Almost still, then he lurches. Do not shoot while he looks calm.'],
  viking: ['Melambat sebelum menebas balik arah. Perlambatan itu aba-abanya.', 'Slows down before the chop that reverses him. That slow-down is the tell.'],
  oni: ['Paling tidak sabaran. Membalik terus, dan NGAMUK membuatnya dua kali lebih sering.', 'The least patient. Constant flips, and RAGE doubles how often they come.'],
  robot: ['Tidak pernah berubah: metronom dengan sentakan servo. Hafalkan, jangan ditebak.', 'Never varies: a metronome with servo kicks. Memorise it, do not guess.'],
  alien: ['Melayang makin cepat lalu melompat warp. Ikuti jedanya, bukan putarannya.', 'Drifts faster and faster, then warp-jumps. Watch the pause, not the spin.'],
  vampire: ['Kabut pelan, lalu amukan kelelawar bolak-balik yang brutal.', 'Slow fog, then a brutal bat flurry whipping back and forth.'],
  sun: ['Raja terakhir. Berputar tanpa henti dengan dua balikan keras per siklus.', 'The final king. A relentless spin with two hard reversals per cycle.'],
};

const PIPS = [1, 2, 3, 4, 5];

/** Label arah putaran, ditulis langsung ke DOM oleh loop animasi. */
const DIR_LABEL: Record<-1 | 0 | 1, string> = { 1: '↻ MAJU', [-1]: '↺ MUNDUR', 0: '• HAMPIR DIAM' };
const DIR_LABEL_EN: Record<-1 | 0 | 1, string> = { 1: '↻ FWD', [-1]: '↺ REV', 0: '• NEAR STOP' };

/** Pisau rintangan yang menancap di kepala — bukan paku. */
function StuckKnives({ count, seed }: { count: number; seed: number }) {
  const knives = Array.from({ length: count }, (_, i) => {
    const deg = ((seed * 47 + i * (360 / Math.max(1, count))) % 360) - 90;
    return { deg, i };
  });
  return (
    <svg viewBox="-100 -100 200 200" className="absolute inset-0 h-full w-full overflow-visible" aria-hidden="true">
      {knives.map(({ deg, i }) => (
        <g key={i} transform={`rotate(${deg}) translate(0 -100)`}>
          {/* MODE BOS: gagangnya yang tertanam ke kepala, mata tajamnya menghadap KELUAR.
              Luka masuk di permukaan, gagang masuk ke dalam, ujung runcing mengancam keluar. */}
          <ellipse cx="0" cy="1" rx="10" ry="3.6" fill="rgba(0,0,0,.55)" />
          <rect x="-6.4" y="7" width="12.8" height="17" rx="3.4" fill="#7c3b16" stroke="#241004" strokeWidth="1.4" />
          <rect x="-3.4" y="10" width="2.6" height="12" rx="1.3" fill="#c07a3c" opacity=".85" />
          <rect x="-9" y="3" width="18" height="5" rx="2.2" fill="#8b93a1" stroke="#1b2029" strokeWidth="1.2" />
          <path d="M0 -42 L-5.4 -12 L-3.4 4 L3.4 4 L5.4 -12 Z" fill="#e8edf5" stroke="#1b2029" strokeWidth="1.6" strokeLinejoin="round" />
          <path d="M0 -42 L-1.6 -11 L-1 3 L1.6 3 Z" fill="#ffffff" opacity=".55" />
          <path d="M-1.2 -36 L-1.2 -8" stroke="rgba(255,255,255,.5)" strokeWidth="1" strokeLinecap="round" />
          <g transform="translate(0 -26)">
            <circle r="15" fill="none" stroke="#ff3b3b" strokeWidth="1.7" className="codex-knife-pulse" style={{ animationDelay: `${i * 180}ms` }} />
          </g>
        </g>
      ))}
    </svg>
  );
}

/** Grafik kecepatan putaran satu siklus penuh, dalam deg/s. */
function SpinGraph({ style, stage, speedK, id }: { style: BossSpinStyle; stage: number; speedK: number; id: boolean }) {
  const curve = useMemo(() => styleCurve(style, stage, 180), [style, stage]);
  const peak = Math.max(60, ...curve.map((v) => Math.abs(v)));
  const W = 320, H = 96, MID = H / 2;
  const pts = curve.map((v, i) => `${((i / (curve.length - 1)) * W).toFixed(1)},${(MID - (v / peak) * (MID - 6)).toFixed(1)}`);
  const area = `M0,${MID} L${pts.join(' L')} L${W},${MID} Z`;
  void speedK;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-[96px] w-full" aria-hidden="true" preserveAspectRatio="none">
      <defs>
        <linearGradient id="codex-graph-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fbbf24" stopOpacity=".38" />
          <stop offset=".5" stopColor="#fbbf24" stopOpacity=".04" />
          <stop offset=".5" stopColor="#f87171" stopOpacity=".04" />
          <stop offset="1" stopColor="#f87171" stopOpacity=".38" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width={W} height={H} fill="rgba(4,6,12,.55)" />
      {[0.25, 0.5, 0.75].map((k) => (
        <line key={k} x1="0" y1={H * k} x2={W} y2={H * k} stroke="rgba(255,255,255,.06)" strokeWidth="1" />
      ))}
      <path d={area} fill="url(#codex-graph-fill)" />
      <line x1="0" y1={MID} x2={W} y2={MID} stroke="rgba(255,255,255,.34)" strokeWidth="1.2" strokeDasharray="5 5" />
      <polyline points={pts.join(' ')} fill="none" stroke="#fde68a" strokeWidth="2.1" strokeLinejoin="round" strokeLinecap="round" />
      <text x="6" y="13" fill="rgba(253,230,138,.8)" fontSize="9" fontWeight="800" fontFamily="inherit">{id ? '↻ MAJU' : '↻ FWD'}</text>
      <text x="6" y={H - 6} fill="rgba(248,113,113,.85)" fontSize="9" fontWeight="800" fontFamily="inherit">{id ? '↺ MUNDUR' : '↺ REV'}</text>
      <text x={W - 6} y="13" textAnchor="end" fill="rgba(255,255,255,.45)" fontSize="9" fontWeight="700" fontFamily="inherit">{Math.round(peak)}°/s</text>
      {/* playhead: jam yang sama dengan kepala di panggung */}
      <line ref={playheadRefFor(style.head)} x1="0" y1="0" x2="0" y2={H} stroke="#38bdf8" strokeWidth="2" opacity=".95" />
    </svg>
  );
}

/** Registry playhead supaya satu loop rAF bisa menggerakkannya tanpa re-render. */
const PLAYHEADS = new Map<HeadKind, SVGLineElement | null>();
const playheadRefFor = (head: HeadKind) => (el: SVGLineElement | null) => { PLAYHEADS.set(head, el); };

export default function BossCodex({ onClose }: Props) {
  const [language] = useLanguage();
  const id = language === 'id';
  const [index, setIndex] = useState(0);
  const [mood, setMood] = useState<Mood>('idle');
  const [rage, setRage] = useState(false);
  const [slow, setSlow] = useState(1); // 1 | 0.5 | 0.25 — slow motion untuk belajar
  const [auto, setAuto] = useState(false);
  // Bacaan kecepatan & arah diperbarui langsung ke DOM dari loop rAF, jadi
  // kepala SVG yang besar tidak pernah dirender ulang 9x per detik.
  const readoutRef = useRef<HTMLSpanElement | null>(null);
  const dirRef = useRef<HTMLSpanElement | null>(null);
  const haloRef = useRef<HTMLDivElement | null>(null);
  const lastDir = useRef(0);

  const head = HEAD_KINDS[index];
  const stage = stageOf(index);
  const style = BOSS_SPIN[head];
  const boss = bossDef(head);
  const knives = bossKnifeCount(stage);

  const spinRef = useRef<HTMLDivElement | null>(null);
  // Lapisan wajah (alis marah, mata menyala, air mata tawa) digambar di canvas
  // dengan fungsi yang SAMA dengan mesinnya, lalu di-rotate bersama kepalanya.
  const faceRef = useRef<HTMLCanvasElement | null>(null);
  const poseRef = useRef<HTMLDivElement | null>(null);
  const clock = useRef({ rot: 0, t: 0, moodT: 0 });

  // Auto-tour: pindah bos sendiri supaya kamusnya "hidup" saat dibiarkan.
  useEffect(() => {
    if (!auto) return;
    const timer = window.setInterval(() => {
      setIndex((v) => (v + 1) % HEAD_KINDS.length);
      clock.current.rot = 0;
    }, 4200);
    return () => window.clearInterval(timer);
  }, [auto]);

  // Satu loop rAF untuk kepala + grafik: tidak ada setState per frame.
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    let readoutT = 0;
    const step = (now: number) => {
      raf = requestAnimationFrame(step);
      const dtRaw = Math.min(0.05, (now - last) / 1000);
      last = now;
      const dt = dtRaw * slow;
      const c = clock.current;
      c.t += dt;
      c.moodT += dtRaw;

      const spinRad = styleSpinRad(style, c.t, bossSpinBaseDeg(stage), rage);
      c.rot += spinRad * dt * (rage ? 1.42 : 1);

      // Pose idle khas kepala, dalam satuan viewBox 200px (R = 100).
      const pose = bossIdlePose(head, c.t, 100, rage);
      let sx = pose.sx, sy = pose.sy, rot = pose.rot, dx = pose.dx, dy = pose.dy;

      if (mood === 'laugh') {
        // HA·HA·HA: squash & stretch berulang, dagu tetap di tempat.
        const u = (c.moodT % 1.1) / 1.1;
        const beat = Math.sin(u * Math.PI * 3) * Math.exp(-u * 1.6);
        sx *= 1 + 0.07 * beat;
        sy *= 1 - 0.09 * beat;
        rot += beat * 3.4 * (Math.PI / 180);
        dy += -beat * 5;
      } else if (mood === 'angry') {
        // MARAH: gemetar maju-mundur + condong menyerang.
        const k = Math.min(1, 0.45 + 0.55 * Math.abs(Math.sin(c.moodT * 2.2)));
        dx += Math.sin(c.moodT * 46) * 3.4 * k;
        sx *= 1 + 0.05 * k;
        sy *= 1 + 0.05 * k;
        dy += 2.2 * k;
      }

      if (spinRef.current) {
        spinRef.current.style.transform = `rotate(${(c.rot * 180 / Math.PI).toFixed(2)}deg)`;
      }
      if (poseRef.current) {
        poseRef.current.style.transform =
          `translate3d(${dx.toFixed(2)}px, ${dy.toFixed(2)}px, 0) rotate(${(rot * 180 / Math.PI).toFixed(2)}deg) scale(${sx.toFixed(4)}, ${sy.toFixed(4)})`;
      }
      // Wajah: logika mood-nya menyalin mesin, jadi yang tampil di kamus
      // persis yang muncul di arena.
      const face = faceRef.current;
      if (face) {
        const fx = face.getContext('2d');
        if (fx) {
          const S = face.width;
          fx.setTransform(1, 0, 0, 1, 0, 0);
          fx.clearRect(0, 0, S, S);
          let k = 0, laugh = false;
          if (mood === 'laugh') { laugh = true; k = Math.min(1, c.moodT / 0.15); }
          else if (mood === 'angry') { k = Math.min(1, c.moodT / 0.11); }
          else if (rage) { k = 0.6 + 0.2 * Math.sin(c.t * 7); }
          if (k > 0.01) {
            fx.translate(S / 2, S / 2);
            if (laugh) drawBossLaughExtras(fx, head, S * 0.49, k, c.t);
            else drawBossAngryFace(fx, head, S * 0.49, k, c.t, rage || mood === 'angry');
          }
        }
      }

      const ph = PLAYHEADS.get(head);
      if (ph) {
        const p = style.cycle > 0 ? (((c.t % style.cycle) + style.cycle) % style.cycle) / style.cycle : 0;
        ph.setAttribute('transform', `translate(${(p * 320).toFixed(1)} 0)`);
      }
      if (now - readoutT > 90) {
        readoutT = now;
        const deg = Math.round(spinRad * 180 / Math.PI * (rage ? 1.42 : 1));
        if (readoutRef.current) readoutRef.current.textContent = `${deg > 0 ? '+' : ''}${deg}\u00b0/s`;
        const dir = deg > 4 ? 1 : deg < -4 ? -1 : 0;
        if (dirRef.current && dir !== lastDir.current) {
          const labels = id ? DIR_LABEL : DIR_LABEL_EN;
          dirRef.current.textContent = dir > 0 ? labels[1] : dir < 0 ? labels[-1] : labels[0];
        }
        if (dir !== lastDir.current) {
          lastDir.current = dir;
          if (haloRef.current) haloRef.current.style.animationDirection = dir < 0 ? 'reverse' : 'normal';
        }
      }
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [style, stage, head, rage, mood, slow, id]);


  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); onClose(); }
      if (e.key === 'ArrowRight') setIndex((v) => Math.min(HEAD_KINDS.length - 1, v + 1));
      if (e.key === 'ArrowLeft') setIndex((v) => Math.max(0, v - 1));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const accent = boss.accent;

  return (
    <div
      className="absolute inset-0 z-[85] flex flex-col overflow-hidden bg-[#05070d]/94 text-slate-100 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-label={id ? 'Kamus Bos' : 'Boss Codex'}
    >
      <style>{CODEX_CSS}</style>

      {/* header */}
      <header className="codex-in relative z-20 flex shrink-0 items-center gap-3 border-b border-white/10 px-3 py-2.5"
        style={{ background: 'linear-gradient(180deg, rgba(16,20,38,.96), rgba(8,10,20,.9))' }}>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="rounded-full px-2 py-0.5 text-[9px] font-black tracking-[0.18em] text-[#150d02]"
              style={{ background: accent }}>{id ? '11 BOS' : '11 BOSSES'}</span>
            <span className="text-[10px] font-bold tracking-[0.14em] text-white/45">
              {id ? 'ANIMASI · PUTARAN · RINTANGAN' : 'ANIMATION · SPIN · HAZARDS'}
            </span>
          </div>
          <h2 className="font-title mt-0.5 truncate text-[19px] leading-tight tracking-wide text-white">
            {id ? 'KAMUS BOS' : 'BOSS CODEX'}
          </h2>
        </div>
        <button type="button" onClick={onClose}
          className="press grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-white/15 bg-white/10 text-sm font-black text-white hover:bg-white/20"
          aria-label={id ? 'Tutup' : 'Close'}>✕</button>
      </header>

      <div className="relative z-10 min-h-0 flex-1 overflow-y-auto overscroll-contain">
        {/* strip pemilihan bos */}
        <div className="codex-in flex gap-2 overflow-x-auto px-3 py-2.5" style={{ animationDelay: '60ms' }}>
          {HEAD_KINDS.map((h, i) => (
            <button key={h} type="button" onClick={() => { setIndex(i); clock.current.rot = 0; }}
              className={`press group relative shrink-0 rounded-xl border p-1 transition ${i === index ? 'border-transparent' : 'border-white/12 bg-white/[.04] hover:bg-white/10'}`}
              style={i === index ? { background: `linear-gradient(160deg, ${bossDef(h).accent}44, rgba(255,255,255,.06))`, boxShadow: `0 0 0 2px ${bossDef(h).accent}, 0 6px 18px ${bossDef(h).glow}` } : undefined}
              aria-pressed={i === index}
              aria-label={`${bossDef(h).title} · stage ${stageOf(i)}`}>
              <span className="block h-11 w-11"><HeadArt kind={h} className="h-full w-full" /></span>
              <span className="mt-0.5 block text-center text-[8.5px] font-black tracking-wider text-white/70">
                {stageOf(i)}
              </span>
            </button>
          ))}
        </div>

        {/* panggung animasi */}
        <section className="codex-in relative mx-3 overflow-hidden rounded-2xl border border-white/12"
          style={{ animationDelay: '120ms', background: `radial-gradient(120% 100% at 50% 0%, ${accent}33 0%, rgba(6,8,16,.96) 58%, rgba(3,4,9,1) 100%)` }}>
          <div className={`codex-arena relative mx-auto aspect-square w-full max-w-[290px] ${mood === 'laugh' ? 'codex-face-laugh' : ''}`}>
            {/* halo arah putaran */}
            <div ref={haloRef} className="pointer-events-none absolute inset-[6%] rounded-full border border-dashed"
              style={{ borderColor: `${accent}66`, animation: `codex-halo ${Math.max(3, 26 - style.difficulty * 4)}s linear infinite` }} />
            <div className="pointer-events-none absolute inset-0 rounded-full"
              style={{ background: `radial-gradient(circle at 50% 50%, ${accent}2e 0%, transparent 62%)`, animation: 'codex-breathe 3.4s ease-in-out infinite' }} />

            {/* kepala: luar = putaran mesin, dalam = pose idle + mood */}
            <div ref={spinRef} className="absolute inset-[12%] will-change-transform">
              <div ref={poseRef} className="absolute inset-0 will-change-transform" style={{ transformOrigin: '50% 85%' }}>
                <HeadArt kind={head} className="h-full w-full drop-shadow-[0_10px_24px_rgba(0,0,0,.6)]" />
                {/* lapisan ekspresi, ikut berputar & melayang bersama kepala */}
                <canvas ref={faceRef} width={360} height={360} className="pointer-events-none absolute inset-0 h-full w-full" />
              </div>
              {/* pisau rintangan ikut berputar bersama kepala */}
              <div className="absolute inset-0"><StuckKnives count={knives} seed={index + 1} /></div>
            </div>

            {/* vignette NGAMUK */}
            {rage && <div className="codex-rage pointer-events-none absolute inset-0 rounded-2xl" />}
            {/* badge kecepatan langsung */}
            <div className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full border border-white/15 bg-black/65 px-3 py-1 text-center backdrop-blur-sm">
              <span ref={readoutRef} className="font-title text-[13px] font-black tabular-nums" style={{ color: accent }}>0°/s</span>
              <span ref={dirRef} className="ml-2 text-[9px] font-black tracking-widest text-white/60">{(id ? DIR_LABEL : DIR_LABEL_EN)[0]}</span>
            </div>
          </div>

          {/* kontrol mood + slow motion */}
          <div className="flex flex-wrap items-center gap-1.5 border-t border-white/10 bg-black/40 px-2.5 py-2">
            {([['idle', id ? 'DIAM' : 'IDLE'], ['laugh', 'HA·HA·HA'], ['angry', id ? 'MARAH' : 'ANGRY']] as [Mood, string][]).map(([m, label]) => (
              <button key={m} type="button" onClick={() => { setMood(m); clock.current.moodT = 0; }}
                className={`press rounded-lg border px-2.5 py-1 text-[10px] font-black tracking-wider transition ${mood === m && !rage ? 'border-amber-300/70 bg-amber-400/20 text-amber-100' : 'border-white/15 bg-white/5 text-white/60 hover:bg-white/10'}`}>
                {label}
              </button>
            ))}
            <button type="button" onClick={() => { setRage((v) => !v); setMood('angry'); clock.current.moodT = 0; }}
              className={`press rounded-lg border px-2.5 py-1 text-[10px] font-black tracking-wider transition ${rage ? 'border-red-400 bg-red-500/30 text-red-100 shadow-[0_0_16px_rgba(239,68,68,.5)]' : 'border-white/15 bg-white/5 text-white/60 hover:bg-white/10'}`}>
              {id ? 'NGAMUK!' : 'RAGE!'}
            </button>
            <span className="mx-1 h-5 w-px bg-white/10" />
            {[1, 0.5, 0.25].map((k) => (
              <button key={k} type="button" onClick={() => setSlow(k)}
                className={`press rounded-lg border px-2 py-1 text-[10px] font-black tabular-nums transition ${slow === k ? 'border-sky-300/70 bg-sky-400/20 text-sky-100' : 'border-white/15 bg-white/5 text-white/50 hover:bg-white/10'}`}>
                {k === 1 ? '1×' : k === 0.5 ? '½×' : '¼×'}
              </button>
            ))}
            <button type="button" onClick={() => setAuto((v) => !v)}
              className={`press ml-auto rounded-lg border px-2.5 py-1 text-[10px] font-black tracking-wider transition ${auto ? 'border-emerald-300/70 bg-emerald-400/20 text-emerald-100' : 'border-white/15 bg-white/5 text-white/55 hover:bg-white/10'}`}>
              {auto ? (id ? '⏸ TUR' : '⏸ TOUR') : (id ? '▶ TUR SEMUA' : '▶ TOUR ALL')}
            </button>
          </div>
        </section>

        {/* grafik pola putaran */}
        <section className="codex-in mx-3 mt-3 overflow-hidden rounded-2xl border border-white/12 bg-black/40" style={{ animationDelay: '180ms' }}>
          <div className="flex items-baseline justify-between gap-2 px-3 pb-1 pt-2.5">
            <h3 className="font-title text-[12px] tracking-[0.14em]" style={{ color: accent }}>{id ? style.name : style.nameEn}</h3>
            <span className="text-[9px] font-bold tracking-wider text-white/40">
              {id ? `1 SIKLUS = ${style.cycle}s` : `1 CYCLE = ${style.cycle}s`}
            </span>
          </div>
          <SpinGraph style={style} stage={stage} speedK={slow} id={id} />
          <p className="px-3 py-2 text-[11px] font-semibold leading-snug text-white/80">
            {id ? style.how : style.howEn}
          </p>
        </section>

        {/* kartu data */}
        <section className="codex-in mx-3 mt-3 rounded-2xl border border-white/12 bg-gradient-to-b from-white/[.07] to-white/[.02] p-3" style={{ animationDelay: '240ms' }}>
          <div className="flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-[9px] font-black tracking-[0.2em] text-white/40">
                {id ? `BOS STAGE ${stage}` : `STAGE ${stage} BOSS`}
              </p>
              <h3 className="font-title truncate text-[18px] leading-tight text-white">{boss.name}</h3>
              <p className="mt-1 text-[11px] font-semibold leading-snug text-white/70">
                {id ? CHARACTER[head][0] : CHARACTER[head][1]}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-[9px] font-black tracking-[0.16em] text-white/40">{id ? 'KESULITAN' : 'DIFFICULTY'}</p>
              <div className="mt-1 flex justify-end gap-1">
                {PIPS.map((p) => (
                  <span key={p} className="h-3.5 w-2 rounded-[2px] transition"
                    style={{ background: p <= style.difficulty ? accent : 'rgba(255,255,255,.13)', boxShadow: p <= style.difficulty ? `0 0 8px ${boss.glow}` : undefined }} />
                ))}
              </div>
            </div>
          </div>

          <dl className="mt-3 grid grid-cols-2 gap-1.5">
            <Row k={id ? 'Kecepatan puncak' : 'Peak speed'} v={`${stylePeakDeg(style, stage)}°/s`} />
            <Row k={id ? 'Gerak idle' : 'Idle motion'} v={id ? BOSS_IDLE_NAME[head] : BOSS_IDLE_NAME_EN[head]} />
            <Row k={id ? 'Serangan' : 'Attack'} v={`${boss.projectileEmoji} ${id ? boss.projectileName : boss.projectileNameEn}`} />
            <Row k={id ? 'Tembak tiap' : 'Fires every'} v={`${boss.fireInterval.toFixed(2)}s`} />
            <Row k={id ? 'Pisau rintangan' : 'Hazard knives'} v={`${knives} ${id ? 'bilah' : 'blades'}`} />
            <Row k={id ? 'Kecepatan proyektil' : 'Shot pace'} v={`×${boss.shotPace.toFixed(2)}`} />
          </dl>

          <div className="mt-2.5 flex items-start gap-2 rounded-xl border border-red-400/25 bg-red-500/10 p-2">
            <span className="text-base leading-none">🔪</span>
            <p className="text-[10.5px] font-semibold leading-snug text-red-100/85">
              {id
                ? 'Rintangan di roda adalah PISAU yang menancap dan berdenyut merah — bukan paku. Kena pisau atau pelurumu sendiri = GAGAL.'
                : 'The hazards on the wheel are KNIVES stabbed in and pulsing red — not spikes. Hit a knife or your own round = FAIL.'}
            </p>
          </div>

          <p className="mt-2 text-[10px] font-medium italic leading-snug text-white/40">{boss.desc}</p>
        </section>

        {/* navigasi bawah */}
        <div className="mx-3 mb-4 mt-3 flex gap-2">
          <button type="button" disabled={index === 0} onClick={() => { setIndex(index - 1); clock.current.rot = 0; }}
            className="press flex-1 rounded-xl border border-white/15 bg-white/5 py-2.5 text-[11px] font-black tracking-wider text-white/75 disabled:opacity-30 hover:bg-white/10">
            ← {id ? 'SEBELUMNYA' : 'PREV'}
          </button>
          <button type="button" disabled={index === HEAD_KINDS.length - 1} onClick={() => { setIndex(index + 1); clock.current.rot = 0; }}
            className="press flex-1 rounded-xl border-2 py-2.5 text-[11px] font-black tracking-wider text-white"
            style={{ borderColor: accent, background: `linear-gradient(180deg, ${accent}55, ${accent}22)`, opacity: index === HEAD_KINDS.length - 1 ? 0.35 : 1 }}>
            {id ? 'BERIKUTNYA' : 'NEXT'} →
          </button>
        </div>
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-lg border border-white/8 bg-black/30 px-2 py-1.5">
      <dt className="text-[8.5px] font-black tracking-[0.14em] text-white/40">{k.toUpperCase()}</dt>
      <dd className="font-title mt-0.5 truncate text-[11.5px] text-white/90">{v}</dd>
    </div>
  );
}

/**
 * Animasi kamus ditaruh di sini, bukan di stylesheet global: hanya halaman ini
 * yang memakainya, dan CSS-nya ikut terbuang begitu kamusnya tidak dipasang.
 */
const CODEX_CSS = `
@keyframes codex-in { from { opacity: 0; transform: translateY(14px) scale(.985); } to { opacity: 1; transform: none; } }
.codex-in { animation: codex-in .46s cubic-bezier(.2,.9,.25,1) both; }
@keyframes codex-halo { to { transform: rotate(360deg); } }
@keyframes codex-breathe { 0%,100% { opacity: .55; transform: scale(1); } 50% { opacity: 1; transform: scale(1.05); } }
@keyframes codex-knife-pulse { 0%,100% { opacity: .15; transform: scale(.86); } 50% { opacity: .8; transform: scale(1.12); } }
.codex-knife-pulse { transform-box: fill-box; transform-origin: center; animation: codex-knife-pulse 1.5s ease-in-out infinite; }
/* Mata ^ ^ tertawa sudah digambar HeadArt di dalam SVG-nya sendiri, hanya
   disembunyikan (display="none"). Mesin mencomotnya dari raster "laugh";
   kamus cukup menyalakannya lewat CSS — ekspresinya asli per kepala. */
.codex-face-laugh [data-boss-eyes="open"] { display: none; }
.codex-face-laugh [data-boss-eyes="laugh"] { display: inline; }
@keyframes codex-rage-pulse { 0%,100% { box-shadow: inset 0 0 40px rgba(239,68,68,.28), inset 0 0 90px rgba(239,68,68,.12); } 50% { box-shadow: inset 0 0 62px rgba(239,68,68,.55), inset 0 0 130px rgba(239,68,68,.22); } }
.codex-rage { animation: codex-rage-pulse .62s ease-in-out infinite; background: radial-gradient(circle at 50% 55%, rgba(239,68,68,.14) 0%, transparent 60%); }
`;
