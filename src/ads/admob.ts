import type { AdsProvider } from './poki';
import { hasSdkConsent } from '../telemetry/voodooSink';

interface CapacitorPluginHandle {
  remove?: () => Promise<void> | void;
}

interface AdMobRewardItem {
  type: string;
  amount: number;
}

interface AdMobPluginLike {
  initialize(options?: {
    testingDevices?: string[];
    initializeForTesting?: boolean;
  }): Promise<void>;
  prepareRewardVideoAd(options: {
    adId: string;
    isTesting?: boolean;
  }): Promise<unknown>;
  showRewardVideoAd(): Promise<AdMobRewardItem>;
  addListener?(
    eventName: string,
    listenerFunc: (info?: unknown) => void,
  ): Promise<CapacitorPluginHandle> | CapacitorPluginHandle;
}

interface CapacitorLike {
  isNativePlatform?: () => boolean;
  Plugins?: {
    AdMob?: AdMobPluginLike;
  };
}

// Official Google AdMob Android Rewarded test ad unit ID (used when no custom ID is provided).
const GOOGLE_TEST_REWARDED_ID = 'ca-app-pub-3940256099942544/5224354917';

function getCapacitor(): CapacitorLike | undefined {
  if (typeof window === 'undefined') return undefined;
  return (window as unknown as { Capacitor?: CapacitorLike }).Capacitor;
}

/** True when running inside the Capacitor Android/iOS native shell. */
export function isNativeShell(): boolean {
  try {
    return Boolean(getCapacitor()?.isNativePlatform?.());
  } catch {
    return false;
  }
}

let initialized = false;

export async function loadAdMobProvider(): Promise<AdsProvider | null> {
  if (!isNativeShell()) return null;
  if (!hasSdkConsent()) return null;
  const admob = getCapacitor()?.Plugins?.AdMob;
  if (!admob) return null;

  const envId = (import.meta.env.VITE_ADMOB_REWARDED_ID as string | undefined)?.trim();
  const adId = envId || GOOGLE_TEST_REWARDED_ID;
  const isTesting =
    import.meta.env.VITE_ADMOB_TEST_MODE === 'true' || !envId;

  if (!initialized) {
    try {
      await admob.initialize({
        initializeForTesting: isTesting,
      });
      initialized = true;
    } catch {
      return null;
    }
  }

  return {
    loadingStarted() {
      /* Native shell handles splash screen independently */
    },
    loadingFinished() {
      /* No-op in native shell */
    },
    gameplayStart() {
      /* No-op in native shell */
    },
    gameplayStop() {
      /* No-op in native shell */
    },
    async rewardedBreak(_placement, _size, onAdStart) {
      const handles: CapacitorPluginHandle[] = [];
      let rewarded = false;
      let started = false;

      const fireStart = () => {
        if (started) return;
        started = true;
        onAdStart?.();
      };

      const addEvent = async (eventName: string, cb: () => void) => {
        if (!admob.addListener) return;
        try {
          const handle = await admob.addListener(eventName, cb);
          if (handle) handles.push(handle);
        } catch {
          /* ignore listener registration failure */
        }
      };

      let resolveDismiss!: () => void;
      const dismissedPromise = new Promise<void>((resolve) => {
        resolveDismiss = resolve;
      });

      try {
        await addEvent('onRewardedVideoAdShowed', fireStart);
        await addEvent('onRewardedVideoAdReward', () => {
          rewarded = true;
        });
        await addEvent('onRewardedVideoAdDismissed', () => {
          resolveDismiss();
        });
        await addEvent('onRewardedVideoAdFailedToLoad', () => {
          resolveDismiss();
        });
        await addEvent('onRewardedVideoAdFailedToShow', () => {
          resolveDismiss();
        });

        await admob.prepareRewardVideoAd({ adId, isTesting });
        fireStart();
        const result = await admob.showRewardVideoAd();
        if (result && typeof result.amount === 'number' && result.amount > 0) {
          rewarded = true;
        }
        // Wait briefly for onRewardedVideoAdDismissed in case showRewardVideoAd resolves on reward first.
        await Promise.race([
          dismissedPromise,
          new Promise<void>((r) => window.setTimeout(r, 800)),
        ]);
        return rewarded ? 'shown' : 'denied';
      } catch {
        return rewarded ? 'shown' : 'denied';
      } finally {
        await Promise.allSettled(handles.map((h) => Promise.resolve(h.remove?.())));
      }
    },
    async commercialBreak() {
      /* Product rule: rewarded ads only, no forced interstitials */
    },
  };
}
