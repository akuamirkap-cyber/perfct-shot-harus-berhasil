export interface PerfEnv {
  devicePixelRatio?: number;
  innerWidth?: number;
  hardwareConcurrency?: number;
  deviceMemory?: number;
  coarsePointer?: boolean;
}

function readPerfEnv(override?: PerfEnv): Required<PerfEnv> {
  const win = typeof window !== 'undefined' ? window : undefined;
  const nav = typeof navigator !== 'undefined'
    ? (navigator as Navigator & { deviceMemory?: number })
    : undefined;
  let coarse = false;
  if (override?.coarsePointer !== undefined) {
    coarse = override.coarsePointer;
  } else if (win && typeof win.matchMedia === 'function') {
    try {
      coarse = win.matchMedia('(pointer: coarse)').matches;
    } catch {
      coarse = false;
    }
  } else if (nav && typeof nav.maxTouchPoints === 'number') {
    coarse = nav.maxTouchPoints > 0;
  }

  return {
    devicePixelRatio: override?.devicePixelRatio ?? win?.devicePixelRatio ?? 1,
    innerWidth: override?.innerWidth ?? win?.innerWidth ?? 420,
    hardwareConcurrency: override?.hardwareConcurrency ?? nav?.hardwareConcurrency ?? 6,
    deviceMemory: override?.deviceMemory ?? nav?.deviceMemory ?? 6,
    coarsePointer: coarse,
  };
}

/** Jenis perangkat dari system-info portal (CrazyGames User SDK). */
let portalDeviceType = '';

/** Dipanggil boot portal (bukan touch detection — aturan portal: pakai systemInfo). */
export function setPortalDeviceType(type: string): void {
  portalDeviceType = type.toLowerCase();
}

export function isMobilePerfProfile(override?: PerfEnv): boolean {
  // Portal: jawaban dari systemInfo menang atas heuristik pointer/touch.
  if (portalDeviceType) return portalDeviceType === 'mobile' || portalDeviceType === 'tablet';
  const env = readPerfEnv(override);
  return env.coarsePointer || env.innerWidth <= 560;
}

/**
 * Computes an optimal Canvas2D backing-store DPR that keeps vector art crisp
 * on 9:16 smartphones while cutting mobile GPU fragment fill-rate by ~44-55%.
 */
export function getOptimalCanvasDpr(maxDesktopDpr = 2, override?: PerfEnv): number {
  const env = readPerfEnv(override);
  const raw = Math.max(1, env.devicePixelRatio || 1);
  if (!isMobilePerfProfile(env)) {
    return Math.min(raw, maxDesktopDpr);
  }
  if (env.hardwareConcurrency <= 4 || env.deviceMemory <= 3) {
    return Math.min(raw, 1.35);
  }
  if (env.hardwareConcurrency <= 8 || env.deviceMemory < 8) {
    return Math.min(raw, 1.5);
  }
  return Math.min(raw, 1.65);
}

export type PerfTier = 'low' | 'mid' | 'high';

/** One cheap, stable quality decision for the whole session. */
export function getPerfTier(override?: PerfEnv): PerfTier {
  const env = readPerfEnv(override);
  const mobile = env.coarsePointer || env.innerWidth <= 560;
  const cores = env.hardwareConcurrency || 6;
  const memory = env.deviceMemory || 6;
  if (mobile && (cores <= 4 || memory <= 3)) return 'low';
  if (mobile && (cores <= 6 || memory <= 4)) return 'mid';
  return 'high';
}

/** Multiplier for purely cosmetic particle spawns. */
export function getFxScale(override?: PerfEnv): number {
  const tier = getPerfTier(override);
  return tier === 'low' ? 0.55 : tier === 'mid' ? 0.78 : 1;
}

/** 0 means native VSync; FrameCadence & AdaptiveCanvasDpr handle load without beat-frequency judder. */
export function getRenderBudgetMs(_override?: PerfEnv): number {
  return 0;
}

/** Lower mobile backing-store DPR ceiling to cut Android fragment fill-rate while keeping desktop sharp. */
export function getMaxCanvasDpr(override?: PerfEnv): number {
  const env = readPerfEnv(override);
  const tier = getPerfTier(env);
  const base = getOptimalCanvasDpr(2, env);
  if (!isMobilePerfProfile(env)) return base;
  return tier === 'low' ? 1 : tier === 'mid' ? Math.min(base, 1.1) : Math.min(base, 1.2);
}

const optimizedContexts = new WeakSet<object>();

/**
 * Eliminates expensive Skia/CoreGraphics software Gaussian blur passes triggered
 * by `ctx.shadowBlur > 0` across 100+ weapon & projectile draw paths on live
 * browser canvases while leaving headless unit-test mocks untouched by default.
 */
export function optimizeCanvas2DForMobile<T extends CanvasRenderingContext2D>(
  ctx: T | null | undefined,
  options?: { force?: boolean },
): T | null {
  if (!ctx) return null;
  if (optimizedContexts.has(ctx)) return ctx;

  const isRealBrowserCanvas =
    typeof HTMLCanvasElement !== 'undefined' &&
    Boolean((ctx as { canvas?: unknown }).canvas instanceof HTMLCanvasElement);

  if (!options?.force && !isRealBrowserCanvas) {
    return ctx;
  }

  try {
    ctx.shadowBlur = 0;
    Object.defineProperty(ctx, 'shadowBlur', {
      get: () => 0,
      set: () => {},
      configurable: true,
    });
    optimizedContexts.add(ctx);
  } catch {
    // Ignore frozen or non-configurable host contexts.
  }
  return ctx;
}

function isAndroidOrMobileWebView(): boolean {
  if (isMobilePerfProfile()) return true;
  const cap = (globalThis as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor;
  return Boolean(cap?.isNativePlatform?.());
}

export function getFast2DContext(
  canvas: HTMLCanvasElement,
  options?: { opaque?: boolean; desynchronized?: boolean },
): CanvasRenderingContext2D | null {
  const opaque = Boolean(options?.opaque);
  // Chromium Android WebView inside a CSS-transformed ScaledFrame with DOM
  // overlays stalls or triggers software readbacks when `desynchronized: true`.
  const allowDesync = Boolean(options?.desynchronized) && !isAndroidOrMobileWebView();
  let ctx: CanvasRenderingContext2D | null = null;
  try {
    ctx = canvas.getContext('2d', {
      alpha: !opaque,
      ...(allowDesync ? { desynchronized: true } : {}),
    }) as CanvasRenderingContext2D | null;
  } catch {
    ctx = null;
  }
  if (!ctx) {
    ctx = canvas.getContext('2d');
  }
  return optimizeCanvas2DForMobile(ctx);
}
