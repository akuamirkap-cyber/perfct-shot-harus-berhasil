import { configureAnalytics, type TrackedEvent } from './analytics';
import { storage } from '../games/gunhit/game/safeStorage';

export type GdprConsentState = 'accepted' | 'declined';

export const GDPR_CONSENT_KEY = 'sga_gdpr_consent_v1';

interface VoodooAnalyticsPluginLike {
  initialize?(options?: {
    gaGameKey?: string;
    gaSecretKey?: string;
    adjustToken?: string;
    adjustSandbox?: boolean;
    fbAppId?: string;
    fbClientToken?: string;
  }): Promise<void> | void;
  onGameStarted?(options: { level: number }): Promise<void> | void;
  onGameFinished?(options: {
    isWinner: boolean;
    level: number;
    score: number;
  }): Promise<void> | void;
  onDesignEvent?(options: {
    eventId: string;
    value?: number;
  }): Promise<void> | void;
}

interface CapacitorLike {
  isNativePlatform?: () => boolean;
  Plugins?: {
    VoodooAnalytics?: VoodooAnalyticsPluginLike;
  };
}

function getCapacitor(): CapacitorLike | undefined {
  if (typeof window === 'undefined') return undefined;
  return (window as unknown as { Capacitor?: CapacitorLike }).Capacitor;
}

function isNativePlatform(): boolean {
  try {
    return Boolean(getCapacitor()?.isNativePlatform?.());
  } catch {
    return false;
  }
}

function getVoodooPlugin(): VoodooAnalyticsPluginLike | undefined {
  if (!isNativePlatform()) return undefined;
  return getCapacitor()?.Plugins?.VoodooAnalytics;
}

/** True when running inside Android Capacitor with the VoodooAnalytics native plugin registered. */
export function isVoodooNativeAvailable(): boolean {
  try {
    return Boolean(getVoodooPlugin());
  } catch {
    return false;
  }
}

/** Read saved GDPR consent decision (`null` if the user has not answered yet). */
export function getGdprConsent(): GdprConsentState | null {
  try {
    const raw = storage.getItem(GDPR_CONSENT_KEY);
    return raw === 'accepted' || raw === 'declined' ? raw : null;
  } catch {
    return null;
  }
}

/** True when GDPR consent gate is active (Android native build unless explicitly disabled via env). */
export function isGdprRequired(): boolean {
  if (!isNativePlatform()) return false;
  return import.meta.env.VITE_VOODOO_REQUIRE_GDPR !== 'false';
}

/** True when the app must show the GDPR consent dialog before initializing SDKs. */
export function requiresGdprPrompt(): boolean {
  return isGdprRequired() && getGdprConsent() === null;
}

/** True when analytics & ad SDKs are allowed to initialize. */
export function hasSdkConsent(): boolean {
  if (!isGdprRequired()) return true;
  return getGdprConsent() === 'accepted';
}

let initialized = false;
let activeUninstall: (() => void) | null = null;
const consentListeners = new Set<(state: GdprConsentState) => void>();

export function onGdprConsentChange(cb: (state: GdprConsentState) => void): () => void {
  consentListeners.add(cb);
  return () => {
    consentListeners.delete(cb);
  };
}

/**
 * Save user's GDPR decision.
 * - If `accepted = true`: immediately initializes Voodoo native SDKs and installs the event sink.
 * - If `accepted = false`: disables the sink and never initializes third-party tracking SDKs.
 */
export function submitGdprConsent(accepted: boolean): void {
  const next: GdprConsentState = accepted ? 'accepted' : 'declined';
  try {
    storage.setItem(GDPR_CONSENT_KEY, next);
  } catch {
    /* ignore storage errors */
  }
  if (accepted) {
    installVoodooAnalytics();
  } else {
    activeUninstall?.();
    activeUninstall = null;
  }
  consentListeners.forEach((cb) => {
    try {
      cb(next);
    } catch {
      /* ignore listener errors */
    }
  });
}

/**
 * Connect the game's analytics funnel (`stage_start`, `stage_clear`, `run_end`, `ad_rewarded`)
 * to the Android Capacitor `VoodooAnalytics` plugin (GameAnalytics + Adjust + Facebook SDK).
 *
 * Enforces GDPR consent strictly: SDKs will NOT be initialized until consent is granted.
 */
export function installVoodooAnalytics(): () => void {
  if (!hasSdkConsent()) {
    return () => {};
  }

  const plugin = getVoodooPlugin();
  if (!plugin) return () => {};

  if (!initialized) {
    initialized = true;
    try {
      const env = import.meta.env;
      void plugin.initialize?.({
        gaGameKey: (env.VITE_VOODOO_GA_GAME_KEY as string | undefined)?.trim() || undefined,
        gaSecretKey: (env.VITE_VOODOO_GA_SECRET_KEY as string | undefined)?.trim() || undefined,
        adjustToken: (env.VITE_VOODOO_ADJUST_TOKEN as string | undefined)?.trim() || undefined,
        adjustSandbox: env.VITE_VOODOO_ADJUST_SANDBOX === 'true',
        fbAppId: (env.VITE_VOODOO_FB_APP_ID as string | undefined)?.trim() || undefined,
        fbClientToken: (env.VITE_VOODOO_FB_CLIENT_TOKEN as string | undefined)?.trim() || undefined,
      });
    } catch {
      /* never break app boot */
    }
  }

  activeUninstall?.();
  activeUninstall = configureAnalytics({
    id: 'voodoo',
    track(event: TrackedEvent) {
      if (!hasSdkConsent()) return;
      const livePlugin = getVoodooPlugin();
      if (!livePlugin) return;
      try {
        if (event.name === 'stage_start') {
          const level = Math.max(1, Number(event.props.stage ?? 1));
          void livePlugin.onGameStarted?.({ level });
        } else if (event.name === 'stage_clear') {
          const level = Math.max(1, Number(event.props.stage ?? 1));
          const score = Math.max(0, Math.round(Number(event.props.score ?? 0)));
          void livePlugin.onGameFinished?.({ isWinner: true, level, score });
        } else if (event.name === 'run_end' && event.props.outcome === 'game_over') {
          const level = Math.max(1, Number(event.props.stage ?? 1));
          const score = Math.max(0, Math.round(Number(event.props.score ?? 0)));
          void livePlugin.onGameFinished?.({ isWinner: false, level, score });
        } else if (event.name === 'ad_rewarded') {
          const placement = String(event.props.placement ?? 'unknown').replace(/[^a-zA-Z0-9_-]/g, '_');
          const outcome = String(event.props.outcome ?? 'unknown').replace(/[^a-zA-Z0-9_-]/g, '_');
          void livePlugin.onDesignEvent?.({
            eventId: `Ad:Rewarded:${placement}:${outcome}`,
          });
        }
      } catch {
        /* analytics must never throw into gameplay */
      }
    },
  });

  return () => {
    activeUninstall?.();
    activeUninstall = null;
  };
}
