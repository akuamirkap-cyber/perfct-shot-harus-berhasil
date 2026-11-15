/**
 * Provider iklan Poki (SDK v2). HANYA dimuat saat game berjalan di domain Poki —
 * portal lain (CrazyGames) melarang SDK kompetitor, jadi script ini tidak pernah
 * disentuh di sana.
 */

export type AdSize = 'small' | 'medium' | 'large';
export type AdOutcome = 'shown' | 'denied';

interface PokiLike {
  init(): Promise<void>;
  gameLoadingFinished(): void;
  gameplayStart(): void;
  gameplayStop(): void;
  commercialBreak(onStart?: () => void): Promise<void>;
  rewardedBreak(onStart?: () => void): Promise<boolean>;
  rewardedBreak(options: { size?: AdSize; onStart?: () => void }): Promise<boolean>;
  setDebug?(debug: boolean): void;
  measure?(category: string, what: string, action: string): void;
}

declare global {
  interface Window {
    PokiSDK?: PokiLike;
  }
}

const POKI_SDK_URL = 'https://game-cdn.poki.com/scripts/v2/poki-sdk.js';

export function loadScriptOnce(src: string, timeoutMs = 15000): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof document === 'undefined') { resolve(false); return; }
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${src}"]`);
    if (existing?.dataset.loaded === '1') { resolve(true); return; }
    const el = existing ?? document.createElement('script');
    let settled = false;
    const settle = (ok: boolean) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      if (ok) el.dataset.loaded = '1';
      resolve(ok);
    };
    const timer = window.setTimeout(() => settle(false), timeoutMs);
    el.addEventListener('load', () => settle(true), { once: true });
    el.addEventListener('error', () => settle(false), { once: true });
    if (!existing) {
      el.src = src;
      el.async = true;
      document.head.appendChild(el);
    }
  });
}

/** Toko sinkron ala localStorage (dipenuhi CrazyGames Data Module). */
export interface PortalStore {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export interface AdsProvider {
  loadingStarted(): void;
  /** Momen seru (stage clear / bos tumbang) — dipakai CrazyGames untuk promosi. */
  happytime?(): void;
  loadingFinished(): void;
  gameplayStart(): void;
  gameplayStop(): void;
  rewardedBreak(placement: string, size: AdSize, onAdStart?: () => void): Promise<AdOutcome>;
  commercialBreak(onStart?: () => void): Promise<void>;
  /** Sembunyikan tombol rewarded bila true (adblock). */
  hasAdblock?(): Promise<boolean>;
  /** Backend save progres portal (SDK.data). Dipanggil setelah init selesai. */
  getDataStore?(): PortalStore | null;
  /** Status mute dari pengaturan portal, dibaca sesudah init. */
  readMuted?(): boolean;
  /** Langganan perubahan mute portal (SDK.game.addSettingsChangeListener). */
  onMutedChange?(listener: (muted: boolean) => void): void;
  /** Locale dari system-info portal, dibaca sesudah init (untuk default bahasa). */
  readLocale?(): string;
  /** Jenis perangkat menurut system-info portal (desktop/mobile/tablet). */
  readDeviceType?(): string;
}

/** Muat script + init Poki SDK. null bila gagal — game tidak pernah ikut gagal. */
export async function loadPokiProvider(): Promise<AdsProvider | null> {
  const loaded = await loadScriptOnce(POKI_SDK_URL);
  const s = typeof window !== 'undefined' ? window.PokiSDK : undefined;
  if (!loaded || !s) return null;
  try {
    if (s.setDebug && /[?&]pokiDebug=1/.test(window.location.search)) s.setDebug(true);
    await s.init();
  } catch {
    return null;
  }

  return {
    loadingStarted() { /* Poki tidak punya event loadingStart terpisah */ },
    loadingFinished() { try { s.gameLoadingFinished(); } catch { /* abaikan */ } },
    gameplayStart() { try { s.gameplayStart(); } catch { /* abaikan */ } },
    gameplayStop() { try { s.gameplayStop(); } catch { /* abaikan */ } },
    async rewardedBreak(placement, size, onAdStart) {
      try { s.measure?.('rewarded', placement, 'interact'); } catch { /* abaikan */ }
      try {
        const ok = await s.rewardedBreak({ size, onStart: () => onAdStart?.() });
        try { s.measure?.('rewarded', placement, ok ? 'success' : 'cancel'); } catch { /* abaikan */ }
        return ok ? 'shown' : 'denied';
      } catch {
        return 'denied';
      }
    },
    async commercialBreak(onStart) {
      try { await s.commercialBreak(() => onStart?.()); } catch { /* tanpa iklan pun lanjut */ }
    },
  };
}
