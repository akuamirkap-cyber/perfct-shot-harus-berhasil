import { useEffect, useRef, useState, type RefObject } from 'react';
import ZipWeaponArt from './ZipWeaponArt';
import { CX, GAMEPLAY_GUN_SCALE, GUN_Y, H, LAND_GUN_LIFT } from '../game/layout';
import type { SgaOrientation } from '../game/orientation';
import { sharkJawDegrees, zipFireClass, zipFireMs } from '../zipWeapons/motion';
import { zipGunVisualX } from '../zipWeapons/visualPose';
import { isZipPack3, isZipPack4 } from '../zipWeapons/ids';
import { getRenderBudgetMs } from '../utils/mobilePerf';

/**
 * Where the muzzle crystal sits inside the overlay's own coordinates.
 *
 * The overlay is anchored on the barrel tip (`ZipWeaponArt`'s `muzzle` anchor),
 * and the zip's diamond crystal is drawn at `(304,-7)` in the artwork's own
 * units. Scaled to `ZIP_GUN_INK_HEIGHT` and pulled back onto that anchor, its
 * centre lands on this point — the one spot the round may be drawn at.
 */
export const MUZZLE_GEM_BOX = 48;
const MUZZLE_GEM_CENTRE = { x: 0.25, y: 28.04 };

/**
 * The bright crystal round Diamond Gun holds on its muzzle (design #3, the
 * zip's "Skin 3"): it leaves with the shot and grows back, so the gun is never
 * seen firing "empty".
 *
 * It is drawn *on* the muzzle crystal, not beside it: the box is centred on
 * `MUZZLE_GEM_CENTRE`, so the round reads as the crystal's own bright core. It
 * used to sit at the overlay's origin (up and to the right of the muzzle),
 * which left a second, detached diamond floating next to the muzzle and the
 * muzzle crystal itself still dark navy — the two things the design card was
 * pulled up for.
 */
function MuzzleGem({ innerRef }: { innerRef: RefObject<HTMLDivElement | null> }) {
  const half = MUZZLE_GEM_BOX / 2;
  return (
    <div
      ref={innerRef}
      aria-hidden="true"
      className="pointer-events-none absolute"
      style={{
        left: MUZZLE_GEM_CENTRE.x - half,
        top: MUZZLE_GEM_CENTRE.y - half,
        width: MUZZLE_GEM_BOX,
        height: MUZZLE_GEM_BOX,
        transformOrigin: '50% 50%',
      }}
    >
      <svg
        viewBox={`${-half} ${-half} ${MUZZLE_GEM_BOX} ${MUZZLE_GEM_BOX}`}
        width={MUZZLE_GEM_BOX}
        height={MUZZLE_GEM_BOX}
        style={{ display: 'block', overflow: 'visible' }}
      >
        <defs>
          <radialGradient id="zip-gem-glow" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="0.55" stopColor="#bdeeff" stopOpacity="0.55" />
            <stop offset="1" stopColor="#5ec8ff" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="zip-gem-a" x1="-6" y1="-14" x2="7" y2="14" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="0.45" stopColor="#dcf8ff" />
            <stop offset="1" stopColor="#5cc8f5" />
          </linearGradient>
          <linearGradient id="zip-gem-b" x1="-9" y1="0" x2="9" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#a9e8ff" />
            <stop offset="0.5" stopColor="#eafcff" />
            <stop offset="1" stopColor="#3aa8ef" />
          </linearGradient>
        </defs>
        {/* The muzzle crystal's own silhouette, bright: the round *is* the gem the
            barrel sits in, so it reads as one crystal rather than two. */}
        <ellipse rx="20" ry="25" fill="url(#zip-gem-glow)" />
        <polygon points="-9.89,22.81 -15.59,0 0,-22.81 15.59,0 10.65,22.81" fill="url(#zip-gem-a)" stroke="#ffffff" strokeWidth="0.7" strokeLinejoin="round" />
        <polygon points="-9.89,22.81 -15.59,0 0,-22.81 0,22.81" fill="url(#zip-gem-b)" opacity="0.55" />
        <polygon points="-4.15,10.46 -6.55,0.88 0,-8.7 6.55,0.88 4.47,10.46" fill="#ffffff" opacity="0.9" />
      </svg>
    </div>
  );
}

/** Ink height of a zip weapon in play, before the rig's 1.12x pose. */
export const ZIP_GUN_INK_HEIGHT = 250;
// The shark's long tail otherwise hangs beyond the 185-unit gameplay rig.
const SHARK_GUN_INK_HEIGHT = 185;

type Frame = { x: number; y: number; rot: number; scale: number; hidden: boolean };

/** Where the gun stands when the engine has not reported a pose yet. */
const STAND: Frame = { x: CX, y: GUN_Y, rot: 0, scale: GAMEPLAY_GUN_SCALE, hidden: false };
const LANDSCAPE_STAND: Frame = { x: H - (GUN_Y - LAND_GUN_LIFT), y: CX, rot: Math.PI / 2, scale: GAMEPLAY_GUN_SCALE, hidden: false };

/**
 * The player's weapon during a run, when the equipped gun wears its zip card.
 *
 * The engine reports where the gun stands (`getZipGunFrame`) and stops drawing
 * that gun into its canvas; this layer puts the zip's own animated SVG on that
 * anchor. The transform is written straight to the DOM inside one rAF loop, so
 * the 60 fps pose never re-renders React.
 *
 * On every shot the zip's own one-shot animation is restarted (`.dg-fire`,
 * `.wb-fire`, …: muzzle flashes, sheen, spin, chomp) — that is the animation the
 * zip's page plays when you click its card, and without it a shot only slid the
 * gun back with no flash at all.
 */
export default function ZipWeaponOverlay({
  id,
  orientation,
  read,
  readShotAt,
}: {
  id: string;
  orientation: SgaOrientation;
  read: () => Frame | null;
  /** `performance.now()` of the last shot: the muzzle round leaves on that beat. */
  readShotAt?: () => number;
}) {
  const poseRef = useRef<HTMLDivElement>(null);
  const artRef = useRef<HTMLDivElement>(null);
  const gemRef = useRef<HTMLDivElement>(null);
  const [debug, setDebug] = useState('');
  const [firing, setFiring] = useState(false);
  useEffect(() => { setFiring(false); }, [id]);

  useEffect(() => {
    let raf = 0;
    const showDebug = typeof location !== 'undefined' && /[?&]zipdebug=1/.test(location.search);
    let ticks = 0;
    let firedAt = 0;
    let fireTimer = 0;
    let swapTimer = 0;
    let swapRaf = 0;
    const budgetMs = getRenderBudgetMs();
    let lastPoseAt = -Infinity;
    const hasFireSwap = isZipPack3(id) || isZipPack4(id);
    const fireClass = zipFireClass(id);
    const fireMs = zipFireMs(id);
    const svgOf = () => artRef.current?.querySelector('svg') ?? null;
    let lastSvg: SVGSVGElement | null = null;
    let sharkJaw: SVGGElement | null = null;
    let lastJawTransform = '';
    let lastPoseTransform = '';
    let lastPoseOpacity = '';
    const tick = () => {
      const now = performance.now();
      const poseOk = !budgetMs || now - lastPoseAt >= budgetMs - 1;
      if (poseOk) lastPoseAt = now;
      const el = poseOk ? poseRef.current : null;
      const frame = read();
      // A pose the engine has not reported yet is not a reason to hide the
      // weapon: it stands on the layout's own anchor until the engine speaks.
      const pose = frame ?? (orientation === 'landscape' ? LANDSCAPE_STAND : STAND);
      const visible = !pose.hidden;
      if (el) {
        const visualX = zipGunVisualX(id, pose.x, orientation);
        const nextTransform = `translate3d(${visualX.toFixed(2)}px, ${pose.y.toFixed(2)}px, 0) rotate(${pose.rot.toFixed(4)}rad) scale(${pose.scale.toFixed(4)})`;
        if (nextTransform !== lastPoseTransform) {
          el.style.transform = nextTransform;
          lastPoseTransform = nextTransform;
        }
        // Written on initial frame and whenever visibility flips: the element ships
        // hidden, so the first frame that finds the gun switches it on.
        const nextOpacity = visible ? '1' : '0';
        if (nextOpacity !== lastPoseOpacity) {
          el.style.opacity = nextOpacity;
          lastPoseOpacity = nextOpacity;
        }
        // Diamond Gun keeps its round on the muzzle: for a beat after the shot
        // the gem is gone (it is the round that just left) and then it grows back.
        if (gemRef.current) {
          const since = performance.now() - (readShotAt?.() ?? 0);
          const back = since < 90 ? 0 : since < 320 ? (since - 90) / 230 : 1;
          gemRef.current.style.opacity = String(back.toFixed(3));
          gemRef.current.style.transform = `scale(${(0.55 + 0.45 * back).toFixed(3)})`;
        }
      }
      // The zip's own fire animation, restarted on the shot's own beat: the
      // SVG carries the keyframes, this only re-applies the class.
      const shotAt = readShotAt?.() ?? 0;
      const isNewShot = shotAt > 0 && shotAt > firedAt + 1;
      if (isNewShot) firedAt = shotAt;
      const svg = artRef.current ? svgOf() : null;
      if (svg !== lastSvg) {
        lastSvg = svg;
        sharkJaw = id === 'shark' ? svg?.querySelector<SVGGElement>('.shark-jaw') ?? null : null;
        lastJawTransform = '';
      }
      if (sharkJaw) {
        const elapsed = shotAt > 0 ? performance.now() - shotAt : Infinity;
        const transform = `rotate(${sharkJawDegrees(elapsed).toFixed(2)})`;
        if (transform !== lastJawTransform) {
          sharkJaw.setAttribute('transform', transform);
          lastJawTransform = transform;
        }
      }
      // Armory Studio guns have a separate activated SVG: swap idle -> fire
      // on the shot, then back to idle after the activation cycle.
      if (hasFireSwap && isNewShot && performance.now() - shotAt < fireMs) {
        setFiring(false);
        window.clearTimeout(swapTimer);
        window.cancelAnimationFrame(swapRaf);
        swapRaf = window.requestAnimationFrame(() => setFiring(true));
        swapTimer = window.setTimeout(() => setFiring(false), fireMs);
      }
      if (svg && fireClass && isNewShot) {
        if (performance.now() - shotAt < fireMs) {
          svg.classList.remove(fireClass);
          // Restart the one-shot SVG flash on each accepted trigger.
          void svg.getBoundingClientRect();
          svg.classList.add(fireClass);
          window.clearTimeout(fireTimer);
          fireTimer = window.setTimeout(() => svg.classList.remove(fireClass), fireMs);
        }
      }
      if (showDebug && ticks++ % 30 === 0) {
        const mounted = svgOf();
        const img = el?.querySelector('img');
        setDebug(
          `frame=${frame ? 'ok' : 'null'} pose=${pose.x.toFixed(0)},${pose.y.toFixed(0)} ` +
          `op=${el?.style.opacity} svg=${mounted ? `${Math.round(mounted.getBoundingClientRect().width)}w` : 'none'} ` +
          `fire=${mounted?.classList.contains(fireClass ?? '-') ? 'on' : 'off'} ` +
          `img=${img && img.complete ? `${img.naturalWidth}w` : 'loading'}`,
        );
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.cancelAnimationFrame(swapRaf);
      window.clearTimeout(fireTimer);
      window.clearTimeout(swapTimer);
    };
  }, [read, readShotAt, id, orientation]);

  return (
    <>
      <div
        ref={poseRef}
        data-zip-gun-overlay={id}
        className="pointer-events-none absolute left-0 top-0 z-[6]"
        style={{ transformOrigin: '0 0', willChange: 'transform', opacity: 0 }}
      >
        <div ref={artRef} className="pointer-events-none absolute left-0 top-0">
          <ZipWeaponArt id={id} height={id === 'shark' ? SHARK_GUN_INK_HEIGHT : ZIP_GUN_INK_HEIGHT} anchor="muzzle" firing={firing} />
        </div>
        {id === 'diamond' && <MuzzleGem innerRef={gemRef} />}
      </div>
      {debug && (
        <div className="pointer-events-none absolute bottom-1 left-1 z-[7] rounded bg-black/70 px-1.5 py-1 text-[10px] font-mono text-lime-300">
          {debug}
        </div>
      )}
    </>
  );
}
