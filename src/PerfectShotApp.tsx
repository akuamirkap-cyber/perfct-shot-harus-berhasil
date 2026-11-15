import { Component, Suspense, lazy, useEffect, useState, type ReactNode } from 'react';
import SansStudioLoading from './components/SansStudioLoading';
import ScaledFrame from './components/ScaledFrame';
import { displaySize } from './games/gunhit/game/layout';
import {
  getSavedSgaOrientation,
  subscribeSgaOrientation,
  type SgaOrientation,
} from './games/gunhit/game/orientation';
import { SlideActivityProvider } from './games/shared/SlideActivity';
import { useAndroidBack, installAndroidBack, exitAndroidApp } from './utils/androidBack';
import { sfx as studioSfx } from './games/perfect-shot/audio/sfx';
import { installErrorHooks, reportError } from './telemetry/errorHooks';
import { trackSessionStart } from './telemetry/gameAnalytics';
import { installVoodooAnalytics, requiresGdprPrompt } from './telemetry/voodooSink';
import GdprConsentModal from './components/GdprConsentModal';

// Gun page only: no SANS STUDIO intro, no other pages. The game is the single
// lazy chunk and mounts immediately.
const GunHitGame = lazy(() => import('./games/gunhit/App'));

function Boot({ message = 'LOADING GAME' }: { message?: string }) {
  return (
    <div
      className="flex h-full w-full flex-col items-center justify-center gap-3 bg-[#05060a] text-slate-200"
      role="status"
      aria-live="polite"
    >
      <span className="h-7 w-7 animate-spin rounded-full border-2 border-slate-700 border-t-sky-400" />
      <span className="text-xs font-semibold tracking-[0.16em]">{message}</span>
    </div>
  );
}

class GameLoadBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown, info: { componentStack?: string | null }) {
    reportError('react-boundary', error, {
      where: 'game-boundary',
      component: (info.componentStack ?? '').trim().split('\n')[0] ?? '',
    });
  }

  render() {
    if (this.state.failed) {
      return (
        <div
          className="flex h-full w-full flex-col items-center justify-center gap-3 bg-[#05060a] px-6 text-center text-slate-200"
          role="alert"
        >
          <span className="text-sm font-semibold">Failed to load the game.</span>
          <button
            className="rounded-md bg-sky-700 px-4 py-2 text-sm font-semibold text-white"
            onClick={() => window.location.reload()}
          >
            Try reloading
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const [pageVisible, setPageVisible] = useState(() => !document.hidden);
  // Intro SANS STUDIO: dimainkan sekali per buka app. pointerEvents di overlay
  // menelan semua tap — memperbaiki bug "dipencet malah animasinya ngulang"
  // dan tap tidak bisa menembus ke tombol PLAY di belakangnya.
  const [introPlayed, setIntroPlayed] = useState(false);
  const [gdprPending, setGdprPending] = useState(() => requiresGdprPrompt());
  const [orientation, setOrientation] = useState<SgaOrientation>(() => getSavedSgaOrientation());

  useEffect(() => subscribeSgaOrientation(setOrientation), []);

  useEffect(() => {
    const uninstallVoodoo = installVoodooAnalytics();
    trackSessionStart();
    installErrorHooks();
    return () => {
      uninstallVoodoo();
    };
  }, []);

  // Pause the simulation while the tab / app is in the background.
  useEffect(() => {
    const onVisibility = () => setPageVisible(!document.hidden);
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  useEffect(() => {
    let disposed = false;
    let remove: (() => void) | undefined;
    void installAndroidBack(() => {
      void exitAndroidApp();
    }).then((off) => {
      if (disposed) off();
      else remove = off;
    });
    return () => {
      disposed = true;
      remove?.();
    };
  }, []);

  useAndroidBack(() => false, true);

  const frame = displaySize(orientation);

  return (
    <div
      className="fixed inset-0 flex h-dvh w-full flex-col overflow-hidden bg-[#05060a] select-none touch-manipulation"
      onPointerDownCapture={(event) => {
        const target = event.target as Element | null;
        if (!target?.closest('button, [role="button"]')) return;
        studioSfx.init();
        if (studioSfx.getState().music) studioSfx.startMusic();
      }}
      style={{
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
        paddingLeft: 'env(safe-area-inset-left)',
        paddingRight: 'env(safe-area-inset-right)',
      }}
    >
      <main
        className="relative flex min-h-0 w-full flex-1 items-center justify-center"
        data-game-id="A"
        data-game-name="GUNHIT"
        aria-label="Gun Hit SGA"
      >
        <SlideActivityProvider active={pageVisible}>
          <GameLoadBoundary>
            <ScaledFrame baseWidth={frame.w} baseHeight={frame.h}>
              <div data-game-frame className="relative overflow-hidden" style={{ width: frame.w, height: frame.h }}>
                {/* Game baru di-mount SETELAH intro tuntas: animasi masuk menu
                    (huruf jatuh, tombol pop, shine judul) tidak lagi berjalan
                    tersembunyi di balik splash — transisi intro → menu terlihat.
                    Fade cepat memuluskan cut. */}
                {introPlayed ? (
                  <Suspense fallback={<Boot />}>
                    <div className="h-full w-full" style={{ animation: 'fx-fade-in 0.45s ease-out both' }}>
                      <GunHitGame introReady />
                    </div>
                  </Suspense>
                ) : (
                  <Boot />
                )}
              </div>
            </ScaledFrame>
          </GameLoadBoundary>
        </SlideActivityProvider>
      </main>

      {!introPlayed && (
        <div className="absolute inset-0 z-[90] bg-[#05060a]" role="presentation">
          <SansStudioLoading onComplete={() => setIntroPlayed(true)} />
        </div>
      )}

      {introPlayed && gdprPending && (
        <GdprConsentModal onResolved={() => setGdprPending(false)} />
      )}
    </div>
  );
}
