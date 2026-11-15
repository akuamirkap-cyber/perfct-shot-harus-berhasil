import { useEffect, useRef } from 'react';
import { pushBackHandler, runBackHandlers, type BackHandler } from './backStack';

interface CapacitorAppHandle {
  remove?: () => Promise<void> | void;
}

interface CapacitorAppPluginLike {
  addListener?(
    eventName: 'backButton',
    listenerFunc: (data: { canGoBack: boolean }) => void,
  ): Promise<CapacitorAppHandle> | CapacitorAppHandle;
  exitApp?(): Promise<void> | void;
}

interface CapacitorLike {
  isNativePlatform?: () => boolean;
  Plugins?: {
    App?: CapacitorAppPluginLike;
  };
}

function getCapacitor(): CapacitorLike | undefined {
  if (typeof window === 'undefined') return undefined;
  return (window as unknown as { Capacitor?: CapacitorLike }).Capacitor;
}

/** True when running inside the Capacitor native shell (Android/iOS). */
export function isNativeShell(): boolean {
  try {
    return Boolean(getCapacitor()?.isNativePlatform?.());
  } catch {
    return false;
  }
}

/**
 * Register a screen's back handler for as long as `active` is true.
 */
export function useAndroidBack(handler: BackHandler, active = true): void {
  const latest = useRef(handler);
  latest.current = handler;
  useEffect(() => {
    if (!active) return;
    return pushBackHandler(() => latest.current());
  }, [active]);
}

/**
 * Listen to the Android hardware/gesture back button in Capacitor native builds.
 */
export async function installAndroidBack(onUnhandled: () => void): Promise<() => void> {
  const appPlugin = getCapacitor()?.Plugins?.App;
  if (!isNativeShell() || !appPlugin?.addListener) {
    return () => {};
  }
  try {
    const handle = await appPlugin.addListener('backButton', () => {
      if (!runBackHandlers()) onUnhandled();
    });
    return () => {
      void handle?.remove?.();
    };
  } catch {
    return () => {};
  }
}

/** Exit the Android app when back is pressed on the root screen. */
export async function exitAndroidApp(): Promise<void> {
  try {
    await getCapacitor()?.Plugins?.App?.exitApp?.();
  } catch {
    /* ignore in non-native shells */
  }
}
