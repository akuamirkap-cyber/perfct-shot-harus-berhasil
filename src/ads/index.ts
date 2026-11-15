/**
 * Fasad monetisasi lintas portal.
 *
 * Portal web melarang SDK iklan milik portal lain, jadi provider dipilih dari
 * hostname (atau override ?ads=poki / ?ads=crazygames untuk QA).
 * Keputusan produk: TANPA interstitial/midgame — hanya iklan rewarded.
 *
 *   Capacitor native → Google AdMob (@capacitor-community/admob)
 *   *.poki.com       → Poki SDK v2
 *   *.crazygames.com → CrazyGames SDK v3 (dengan opsi wrapper yang diwajibkan QA)
 *   lainnya          → standalone: tanpa iklan jaringan; pemanggil memutuskan
 *                      fallback dev-nya (simulasi AdPlayer di game over).
 *
 * Semua fungsi tidak pernah throw dan tidak pernah menghentikan permainan.
 */
import type { AdSize, AdsProvider, PortalStore } from './poki';
import { createMemoryStore } from '../games/gunhit/game/safeStorage';
import { trackAdRewarded } from '../telemetry/gameAnalytics';

export type AdOutcome = 'shown' | 'denied' | 'unavailable';
export type AdsPlatform = 'poki' | 'crazygames' | 'native' | 'standalone';

export interface AdsPlatformProbe {
  hostname?: string;
  search?: string;
  isNative?: boolean;
}

/**
 * Deteksi platform. `probe` opsional = seam unit test (sehingga tes tidak
 * perlu memalsukan window); tanpa probe ia membaca window seperti biasa.
 */
export function detectAdsPlatform(probe?: AdsPlatformProbe): AdsPlatform {
  const isNative = probe?.isNative ?? (() => {
    if (typeof window === 'undefined') return false;
    try {
      const cap = (window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor;
      return !!cap?.isNativePlatform?.();
    } catch { return false; }
  })();
  if (isNative) return 'native';
  const search = probe?.search ?? (typeof window === 'undefined' ? '' : window.location.search);
  const forced = new URLSearchParams(search).get('ads');
  if (forced === 'poki' || forced === 'crazygames') return forced;
  const host = (probe?.hostname ?? (typeof window === 'undefined' ? '' : window.location.hostname)).toLowerCase();
  if (host === 'poki.com' || host.endsWith('.poki.com')) return 'poki';
  if (host === 'crazygames.com' || host.endsWith('.crazygames.com')) return 'crazygames';
  return 'standalone';
}

let providerPromise: Promise<AdsProvider | null> | null = null;

/** Iklan yang benar-benar tampil, menunggu untuk disinkronkan ke server. */
let pendingAdsWatched = 0;

export function peekAdsWatchedPending(): number {
  return pendingAdsWatched;
}

/** Dipanggil klien setelah server mengakui sinkronnya. */
export function commitAdsWatched(count: number): void {
  pendingAdsWatched = Math.max(0, pendingAdsWatched - count);
}

function getProvider(): Promise<AdsProvider | null> {
  if (providerPromise) return providerPromise;
  const platform = detectAdsPlatform();
  if (platform === 'standalone') {
    providerPromise = Promise.resolve(null);
  } else if (platform === 'native') {
    providerPromise = import('./admob').then((m) => m.loadAdMobProvider());
  } else if (platform === 'poki') {
    providerPromise = import('./poki').then((m) => m.loadPokiProvider());
  } else {
    providerPromise = import('./crazygames').then((m) => m.loadCrazyGamesProvider());
  }
  // Kegagalan load/init tidak di-cache: script portal bisa saja telat tiba.
  providerPromise = providerPromise.then((p) => {
    if (!p) providerPromise = null;
    return p;
  });
  return providerPromise;
}

/**
 * Panggil sedini mungkin (boot halaman). Mengembalikan promise yang selesai
 * setelah provider termuat *dan* (portal) SDK.init() resolve — urutan wajib
 * sebelum save progres dibaca. Portal yang SDK-nya gagal mendapat toko memori,
 * sehingga localStorage tidak pernah tercampur di sana.
 */
export function initAds(): Promise<void> {
  return getProvider().then((p) => {
    const platform = detectAdsPlatform();
    if (platform === 'crazygames') {
      portalStore = p?.getDataStore?.() ?? createMemoryStore();
      if (p) {
        try { if (p.readMuted?.()) emitPortalMuted(true); } catch { /* abaikan */ }
        try { p.onMutedChange?.(emitPortalMuted); } catch { /* abaikan */ }
        try { portalLocale = p.readLocale?.() ?? ''; } catch { /* abaikan */ }
        try { portalDeviceType = p.readDeviceType?.() ?? ''; } catch { /* abaikan */ }
      } else if (typeof window !== 'undefined' && /[?&]muteAudio=true/.test(window.location.search)) {
        emitPortalMuted(true);
      }
    }
    p?.loadingStarted();
  });
}

let loadingFinished = false;

/* ------------------------- mute portal (CrazyGames settings) ------------------------ */
let portalMuted = false;
try {
  // Tes lokal tanpa SDK: ?muteAudio=true memaksa mute (aturan: menang atas tombol game).
  if (typeof window !== 'undefined' && /[?&]muteAudio=true/.test(window.location.search)) portalMuted = true;
} catch { /* abaikan */ }
const portalMuteListeners = new Set<(muted: boolean) => void>();

function emitPortalMuted(next: boolean): void {
  if (portalMuted === next) return;
  portalMuted = next;
  portalMuteListeners.forEach((listener) => listener(next));
}

/** Status mute portal sekarang (termasuk override tes lokal ?muteAudio=true). */
export function isPortalMuted(): boolean {
  return portalMuted;
}

/** Langganan perubahan mute portal; cb dipanggil seketika dengan nilai kini. */
export function onPortalMuted(cb: (muted: boolean) => void): () => void {
  portalMuteListeners.add(cb);
  cb(portalMuted);
  return () => { portalMuteListeners.delete(cb); };
}

/* ------------------------- locale portal (system info) ------------------------ */
let portalLocale = '';
let portalDeviceType = '';
export function getPortalLocale(): string { return portalLocale; }
/** Jenis perangkat dari system-info portal (kosong = portal tak menjawab). */
export function getPortalDeviceType(): string { return portalDeviceType; }

/* ------------------------- save progres portal (SDK.data) ------------------------ */
let portalStore: PortalStore | null = null;
/** Backend penyimpanan ala localStorage dari portal (null = bukan platform portal). */
export function getPortalDataStore(): PortalStore | null {
  return portalStore;
}


/** Konversi loading→main (Poki) / loadingStop (CrazyGames). Tembak sekali. */
export function adsLoadingFinished(): void {
  if (loadingFinished) return;
  void getProvider().then((p) => {
    if (!p || loadingFinished) return;
    loadingFinished = true;
    p.loadingFinished();
  });
}

let playing = false;

/** Gameplay aktif (mulai/lanjut run). */
export function adsGameplayStart(): void {
  if (playing) return;
  playing = true;
  void getProvider().then((p) => p?.gameplayStart());
}

/** Gameplay berhenti (game over, menu, pause) — WAJIB sebelum setiap iklan. */
export function adsGameplayStop(): void {
  if (!playing) return;
  playing = false;
  void getProvider().then((p) => p?.gameplayStop());
}

/**
 * Rewarded video lintas portal.
 *  - 'shown'       → iklan tuntas → hadiah cair;
 *  - 'denied'      → ditutup/di-skip/unfilled → TANPA hadiah (jangan fallback);
 *  - 'unavailable' → tidak ada portal ads (dev/standalone) → caller boleh pakai
 *                    simulasi internal.
 */
export async function adsRewardedBreak(
  placement: string,
  size: AdSize,
  hooks?: { onAdStart?: () => void },
): Promise<AdOutcome> {
  const platform = detectAdsPlatform();
  const provider = await getProvider();
  // 'unavailable' (simulasi dev) HANYA untuk build standalone: di domain portal
  // QA melihat AdPlayer tiruan sebagai ad code pihak ketiga — dilarang.
  if (!provider) return platform === 'standalone' ? 'unavailable' : 'denied';
  const resumeAfter = playing;
  let adShown = false;
  adsGameplayStop();
  try {
    const outcome = await provider.rewardedBreak(placement, size, () => {
      adShown = true;
      hooks?.onAdStart?.();
    });
    if (outcome === 'shown' && adShown) pendingAdsWatched += 1;
    trackAdRewarded({ placement, outcome });
    return outcome;
  } catch {
    trackAdRewarded({ placement, outcome: 'denied' });
    return 'denied';
  } finally {
    if (resumeAfter) adsGameplayStart();
  }
}

/** Panggil di momen seru: stage clear, bos tumbang, rekor baru. */
let lastHappy = 0;
export function adsHappytime(): void {
  const now = Date.now();
  if (now - lastHappy < 3000) return; // jangan spam event portal
  lastHappy = now;
  void getProvider().then((p) => p?.happytime?.());
}

/** Portal reward buttons harus disembunyikan bila pemain memakai adblock. */
export async function adsHasAdblock(): Promise<boolean> {
  const provider = await getProvider();
  if (!provider?.hasAdblock) return false;
  return provider.hasAdblock();
}
