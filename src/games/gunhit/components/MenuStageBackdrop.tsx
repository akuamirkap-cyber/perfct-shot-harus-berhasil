import { useEffect, useRef } from 'react';
import { displaySize, W, H, worldTransform } from '../game/layout';
import { paintStageForest, paintStageGrass, paintStageVignette } from '../game/stageBackdrop';
import { getMaxCanvasDpr, isMobilePerfProfile } from '../utils/mobilePerf';

/**
 * The menu's room is the gameplay room.
 *
 * The cover used to paint its own blue night sky while a run opened on Gun Hit's
 * teal forest, so pressing PLAY felt like walking into a different game. This
 * canvas paints `paintStageForest()` — the exact function the game uses for its
 * stage backdrop — plus the same bottom grass and vignette.
 *
 * It is drawn in *world* coordinates with the same `worldTransform()` the engine
 * uses, so landscape shows the forest lying on its side (trunks top and bottom,
 * grass on the left) exactly the way a stage does.
 */
export default function MenuStageBackdrop({
  orientation = 'portrait',
  animated = true,
}: {
  orientation?: 'portrait' | 'landscape';
  animated?: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const paintRef = useRef<(time: number) => void>(() => {});

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fit the stage world into the frame the menu actually occupies, using the
    // engine's own mapping (portrait = identity, landscape = 90° rotation).
    const { w: displayW, h: displayH } = displaySize(orientation);
    const resize = () => {
      const cssW = canvas.clientWidth || displayW;
      const cssH = canvas.clientHeight || displayH;
      const dpr = getMaxCanvasDpr();
      const k = Math.min(cssW / displayW, cssH / displayH) * dpr;
      const next = Math.round(cssW * dpr);
      const nextH = Math.round(cssH * dpr);
      if (canvas.width !== next || canvas.height !== nextH) {
        canvas.width = next;
        canvas.height = nextH;
      }
      // The forest and vignette never move: paint them once into a cached layer,
      // so each frame only blits that layer and repaints the wind-swept grass
      // (it used to re-run ~220 forest fills on every frame).
      let still: HTMLCanvasElement | null = null;
      try {
        still = document.createElement('canvas');
        still.width = canvas.width;
        still.height = canvas.height;
        const sc = still.getContext('2d');
        if (sc) {
          sc.setTransform(...worldTransform(orientation, k));
          paintStageForest(sc, 'orange');
          paintStageVignette(sc);
        } else still = null;
      } catch {
        still = null;
      }
      let fullPainted = false;
      paintRef.current = (time: number) => {
        ctx.save();
        if (still && fullPainted) {
          // Only the grass moves: restrict every later frame to its band at the
          // bottom of the world (clearRect and drawImage both honour the clip).
          ctx.setTransform(...worldTransform(orientation, k));
          ctx.beginPath();
          ctx.rect(-4, H - 70, W + 8, 74);
          ctx.clip();
        }
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (still) ctx.drawImage(still, 0, 0);
        ctx.setTransform(...worldTransform(orientation, k));
        if (!still) {
          paintStageForest(ctx, 'orange');
          paintStageVignette(ctx);
        }
        // The same wind-swept grass band the stage draws under the gun.
        paintStageGrass(ctx, time);
        ctx.restore();
        fullPainted = true;
      };
      paintRef.current(0);
    };
    resize();
    const observer = typeof ResizeObserver === 'function' ? new ResizeObserver(() => resize()) : null;
    observer?.observe(canvas);
    if (!animated) return () => observer?.disconnect();

    let raf = 0;
    const started = typeof performance === 'undefined' ? 0 : performance.now();
    let last = 0;
    const stepMs = isMobilePerfProfile() ? 50 : 33;
    const loop = () => {
      // The grass is the only moving part; 20-30 fps is plenty and keeps the menu
      // from repainting a full-screen canvas on every display frame.
      const now = performance.now();
      if (now - last >= stepMs) {
        last = now;
        paintRef.current((now - started) / 1000);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      observer?.disconnect();
    };
  }, [animated, orientation]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      data-menu-stage-backdrop={orientation}
      data-stage-world={`${W}x${H}`}
      className="pointer-events-none absolute inset-0 h-full w-full"
      style={{ width: '100%', height: '100%' }}
    />
  );
}
