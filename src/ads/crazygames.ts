/**
 * Provider iklan CrazyGames (SDK v3). Diportal ini ads hanya boleh lewat SDK
 * mereka — termasuk aturan QA: gameplayStop sebelum iklan, audio di-mute saat
 * adStarted, dan lanjut normal di adFinished *maupun* adError (adblock/unfill).
 */
import { loadScriptOnce, type AdOutcome, type AdsProvider, type AdSize, type PortalStore } from './poki';

interface CrazyAdCallbacks {
  adStarted?: () => void;
  adFinished?: () => void;
  adError?: (error: unknown) => void;
}

interface CrazyDataModule {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem?(key: string): void;
  clear?(): void;
}

interface CrazyLike {
  init(options?: { wrapper?: { engine?: string; sdkVersion?: string } }): Promise<void>;
  environment?: string;
  game?: {
    loadingStart?(): void;
    loadingStop?(): void;
    gameplayStart(): void;
    gameplayStop(): void;
    happytime?(): void;
    settings?: { muteAudio?: boolean };
    addSettingsChangeListener?(listener: (settings: { muteAudio?: boolean }) => void): void;
  };
  /** Modul user: systemInfo membawa locale/device sesuai dok portal. */
  user?: { systemInfo?: { locale?: string; device?: { type?: string } } };
  systemInfo?: { locale?: string };
  /** Data Module: save progres portal (sinkron setelah init). */
  data?: CrazyDataModule;
  ad: {
    requestAd(type: 'midgame' | 'rewarded', callbacks?: CrazyAdCallbacks): void;
    hasAdblock?(): Promise<boolean>;
  };
}

declare global {
  interface Window {
    CrazyGames?: { SDK?: CrazyLike };
  }
}

const CRAZY_SDK_URL = 'https://sdk.crazygames.com/crazygames-sdk-v3.js';

/** Muat script + init CrazyGames SDK. null bila gagal — game tetap jalan. */
/**
 * Adapter Data Module → PortalStore. Sinkron (cache SDK penuh di init), tiap
 * panggilan dijaga try/catch; kalau modul melempar, baca/tulis jatuh ke memori
 * murni — TIDAK ke localStorage (aturan portal: jangan campur keduanya).
 */
function buildDataAdapter(data: CrazyDataModule): PortalStore {
  const memory = new Map<string, string>();
  return {
    getItem(key) {
      try {
        const live = data.getItem(key);
        if (live !== null && live !== undefined) {
          memory.set(key, live);
          return live;
        }
      } catch { /* modul menolak: pakai memori */ }
      return memory.has(key) ? memory.get(key)! : null;
    },
    setItem(key, value) {
      memory.set(key, String(value));
      try { data.setItem(key, String(value)); } catch { /* tetap di memori */ }
    },
    removeItem(key) {
      memory.delete(key);
      try { data.removeItem?.(key); } catch { /* abaikan */ }
    },
  };
}

const muteListeners = new Set<(muted: boolean) => void>();
let mutedValue = false;

export async function loadCrazyGamesProvider(): Promise<AdsProvider | null> {
  const loaded = await loadScriptOnce(CRAZY_SDK_URL);
  const sdk = typeof window !== 'undefined' ? window.CrazyGames?.SDK : undefined;
  if (!loaded || !sdk) return null;
  try {
    // `wrapper` WAJIB — QA CrazyGames menolak init tanpa identitas engine.
    await sdk.init({ wrapper: { engine: 'html5', sdkVersion: '1.0.0' } });
  } catch {
    return null;
  }

  // Data Module hanya boleh disentuh setelah init() selesai — terpenuhi di sini.
  const dataStore: PortalStore | null = sdk.data ? buildDataAdapter(sdk.data) : null;

  // Pengaturan portal: baca muteAudio awal + langganan perubahannya.
  try {
    mutedValue = !!sdk.game?.settings?.muteAudio;
    sdk.game?.addSettingsChangeListener?.((settings) => {
      const next = !!settings?.muteAudio;
      if (next === mutedValue) return;
      mutedValue = next;
      muteListeners.forEach((listener) => listener(next));
    });
  } catch { /* pengaturan portal opsional */ }

  return {
    loadingStarted() { try { sdk.game?.loadingStart?.(); } catch { /* abaikan */ } },
    getDataStore: () => dataStore,
    readMuted: () => mutedValue,
    onMutedChange(listener) { muteListeners.add(listener); },
    // Locale pemain dari modul User (buat default bahasa bila belum pernah pilih).
    readLocale() {
      return sdk.user?.systemInfo?.locale ?? sdk.systemInfo?.locale ?? '';
    },
    // Jenis perangkat dari system-info portal — pengganti deteksi pointer/touch.
    readDeviceType() {
      return sdk.user?.systemInfo?.device?.type ?? '';
    },
    happytime() { try { sdk.game?.happytime?.(); } catch { /* abaikan */ } },
    loadingFinished() { try { sdk.game?.loadingStop?.(); } catch { /* abaikan */ } },
    gameplayStart() { try { sdk.game?.gameplayStart(); } catch { /* abaikan */ } },
    gameplayStop() { try { sdk.game?.gameplayStop(); } catch { /* abaikan */ } },
    rewardedBreak(_placement, _size, onAdStart) {
      // Rewarded v3: koin hadiah hanya cair di adFinished; adError (unfilled,
      // adblock, dismissed) = tanpa hadiah, namun permainan tetap lanjut normal.
      return new Promise<AdOutcome>((resolve) => {
        try {
          sdk.ad.requestAd('rewarded', {
            adStarted: () => onAdStart?.(),
            adFinished: () => resolve('shown'),
            adError: () => resolve('denied'),
          });
        } catch {
          resolve('denied');
        }
      });
    },
    commercialBreak(onStart) {
      return new Promise<void>((resolve) => {
        try {
          sdk.ad.requestAd('midgame', {
            adStarted: () => onStart?.(),
            adFinished: () => resolve(),
            adError: () => resolve(),
          });
        } catch {
          resolve();
        }
      });
    },
    hasAdblock: sdk.ad.hasAdblock ? () => sdk.ad.hasAdblock!().catch(() => false) : undefined,
  };
}
