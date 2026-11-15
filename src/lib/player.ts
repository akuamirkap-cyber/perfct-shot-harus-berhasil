/**
 * Sesi pemain ringan di perangkat (tanpa cookie): disimpan di localStorage,
 * semua akses dibungkus try/catch supaya mode incognito (localStorage diblok)
 * tetap bisa bermain — sesi hanya hidup selama tab terbuka.
 */

export interface PlayerSession {
  id: string;
  kind: 'email' | 'guest';
  email?: string;
}

const KEY = 'sga_player_v1';

export function loadPlayerSession(): PlayerSession | null {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<PlayerSession>;
    if (typeof parsed.id !== 'string' || (parsed.kind !== 'email' && parsed.kind !== 'guest')) return null;
    return { id: parsed.id, kind: parsed.kind, ...(typeof parsed.email === 'string' ? { email: parsed.email } : {}) };
  } catch {
    return null;
  }
}

export function savePlayerSession(session: PlayerSession): void {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(session));
  } catch {
    /* tanpa storage: sesi hidup sampai tab ditutup */
  }
}

export function clearPlayerSession(): void {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* abaikan */
  }
}
