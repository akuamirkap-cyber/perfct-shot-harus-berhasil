/**
 * Katalog teks dua bahasa.
 *
 * Bagian 7 mengisi teks untuk layar baru (CARA MAIN, reset progres, pemilih
 * bahasa). Bagian 8 (i18n) melanjutkan pengisian untuk menu, HUD, quest, dan
 * layar bos memakai modul yang sama — kuncinya ditambah di sini, bukan
 * disebar ke tiap komponen.
 *
 * Aturan: setiap kunci WAJIB ada di kedua bahasa; tes menolaknya kalau tidak.
 */
import type { Language } from './language';

export const catalog = {
  id: {
    'common.close': 'TUTUP',
    'common.cancel': 'BATAL',

    'settings.language': 'BAHASA',
    'settings.help': '❓ CARA MAIN',
    'settings.codex': '📖 KAMUS BOS',
    'settings.reset': '🗑 RESET PROGRES',

    'help.title': 'CARA MAIN',
    'help.firstRun': 'Cukup 4 langkah — langsung paham',
    'help.subtitle': 'TUJUAN · ARAH · TEMBAK · MENANG',
    'help.start': 'MENGERTI, MULAI!',
    'help.stepTitles': ['TUJUAN', 'ARAH', 'TEMBAK', 'MENANG'],
    'help.steps': [
      'Tanam semua peluru ke roda. Jangan sampai peluru baru menabrak peluru yang sudah nancep.',
      'Roda berputar di atas, senjatamu di bawah. Semua tembakan melesat lurus ke atas.',
      'Ketuk layar untuk menembak. Senjata charge/scope: tahan dulu, lalu lepas.',
      'Ammo habis tanpa tabrakan = stage clear. Koin & diamond masuk otomatis; tiap 5 stage ada BOSS.',
    ],
    'help.tip': 'Back di HP = jeda. Buka lagi dari Pengaturan kapan saja.',
    'help.codex': '📖 LIHAT KAMUS BOS',
    'help.next': 'LANJUT →',
    'help.stepOf': 'LANGKAH',

    'reset.title': 'HAPUS SEMUA PROGRES?',
    'reset.body':
      'Skor terbaik, stage tertinggi, koin, diamond, senjata yang dimiliki, level pemain, dan progres misi akan dihapus. Pengaturan (volume, bahasa, tema) tetap disimpan.',
    'reset.confirm': 'YA, HAPUS',
    'reset.done': 'Progres dihapus. Aplikasi dimulai ulang…',
  },
  en: {
    'common.close': 'CLOSE',
    'common.cancel': 'CANCEL',

    'settings.language': 'LANGUAGE',
    'settings.help': '❓ HOW TO PLAY',
    'settings.codex': '📖 BOSS CODEX',
    'settings.reset': '🗑 RESET PROGRESS',

    'help.title': 'HOW TO PLAY',
    'help.firstRun': 'Just 4 steps — get it instantly',
    'help.subtitle': 'GOAL · AIM · SHOOT · WIN',
    'help.start': 'GOT IT, LET’S GO!',
    'help.stepTitles': ['GOAL', 'AIM', 'SHOOT', 'WIN'],
    'help.steps': [
      'Stick every round into the wheel. Never let a new shot hit one already stuck.',
      'The wheel spins above, your gun sits below. Every shot flies straight up.',
      'Tap to fire. Charge/scope guns: hold, then release.',
      'Out of ammo with no collision = stage clear. Coins & diamonds bank automatically; every 5th stage is a BOSS.',
    ],
    'help.tip': 'Back on phone = pause. Reopen this anytime from Settings.',
    'help.codex': '📖 OPEN BOSS CODEX',
    'help.next': 'NEXT →',
    'help.stepOf': 'STEP',

    'reset.title': 'DELETE ALL PROGRESS?',
    'reset.body':
      'Best score, highest stage, coins, diamonds, owned weapons, player level and quest progress will be deleted. Settings (volume, language, theme) stay.',
    'reset.confirm': 'YES, DELETE',
    'reset.done': 'Progress deleted. Restarting the app…',
  },
} as const satisfies Record<Language, Record<string, unknown>>;

export type StringKey = keyof (typeof catalog)['id'];

/** Terjemahan untuk satu kunci; jatuh ke bahasa Indonesia kalau kosong. */
export function t(language: Language, key: StringKey): string {
  const value = catalog[language][key] ?? catalog.id[key];
  return Array.isArray(value) ? value.join('\n') : String(value);
}

/** Versi daftar (untuk layar yang butuh array, seperti langkah CARA MAIN). */
export function tList(language: Language, key: StringKey): string[] {
  const value = catalog[language][key] ?? catalog.id[key];
  return Array.isArray(value) ? [...value] : [String(value)];
}
