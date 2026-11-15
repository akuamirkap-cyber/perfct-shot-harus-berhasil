/**
 * Satu-satunya sumber teks kebijakan privasi.
 *
 * Teks ini dipakai dua tempat:
 *   1. halaman "KEBIJAKAN PRIVASI" di dalam game (src/components/PrivacyPage.tsx)
 *   2. halaman publik /privacy (dipakai untuk link di Play Console & portal)
 *
 * Jangan menulis klaim yang tidak benar. Isi di bawah ini menggambarkan aplikasi
 * apa adanya: login email OPSIONAL (bisa main sebagai guest), progres utama tetap
 * di perangkat, server menyimpan statistik ringan per akun, dan iklan hanya
 * berjalan lewat SDK portal resmi (Poki / CrazyGames) saat game dimainkan di sana.
 */
export const PRIVACY_APP_NAME = 'Perfect Shot · Gun Hit SGA';
export const PRIVACY_PACKAGE_NAME = 'com.amirkap.perfectshot';
export const PRIVACY_CONTACT_EMAIL = 'akuamirkap2@gmail.com';
export const PRIVACY_LAST_UPDATED = '14 November 2026';
export const PRIVACY_POLICY_VERSION = '2.0.0';

export type PolicySection = {
  /** Stable id, also used as an anchor in docs/PRIVACY.md. */
  id: string;
  title: string;
  paragraphs: string[];
};

export const PRIVACY_SECTIONS_ID: PolicySection[] = [
  {
    id: 'ringkasan',
    title: 'Ringkasan',
    paragraphs: [
      `${PRIVACY_APP_NAME} adalah game arkade yang bisa dimainkan langsung sebagai guest tanpa akun apa pun. Login dengan alamat email bersifat OPSIONAL dan hanya dipakai untuk mengenali progresmu.`,
      'Sebagian besar data permainan (skor, koin, senjata, misi, pengaturan) tetap disimpan di perangkatmu. Server kami hanya menyimpan identitas akun dan statistik ringkas seperti dijelaskan di bawah.',
    ],
  },
  {
    id: 'data-di-perangkat',
    title: 'Data yang disimpan di perangkat',
    paragraphs: [
      'Aplikasi menyimpan data permainan berikut di penyimpanan lokal (localStorage / IndexedDB di dalam WebView):',
      '• skor tertinggi dan stage tertinggi;',
      '• jumlah koin dan diamond, senjata yang sudah dimiliki, serta senjata yang sedang dipakai;',
      '• progres misi, achievement, dan daily login;',
      '• pengaturan: volume, efek suara, kecepatan permainan, tema latar, orientasi, bahasa (Indonesia/Inggris);',
      '• papan skor lokal: sepuluh hasil permainan terbaikmu (skor, stage, koin, waktu) untuk layar PERINGKAT;',
      '• token sesi akun (kode acak tanpa kata sandi) yang menghubungkan game dengan akunmu bila kamu login.',
      'Data lokal ini tidak keluar dari perangkat kecuali statistik ringkas yang tercantum pada bagian berikutnya.',
    ],
  },
  {
    id: 'data-di-server',
    title: 'Data yang kami simpan di server',
    paragraphs: [
      'Bila kamu login dengan email, kami menyimpan: alamat email, waktu pendaftaran, dan waktu terakhir aktif. Pemain guest disimpan hanya sebagai token acak tanpa informasi pribadi.',
      'Selama bermain, game menyinkronkan statistik ringkas per akun: jumlah senjata yang sudah terbuka, skor terbaik, stage tertinggi, total durasi bermain, senjata yang paling lama dimainkan beserta durasinya, dan jumlah iklan yang selesai ditonton.',
      'Data server dipakai untuk mengenali akunmu dan statistik perkembangan — tidak dijual, tidak dibagikan, dan tidak dipakai untuk iklan.',
    ],
  },
  {
    id: 'iklan',
    title: 'Iklan & persetujuan GDPR',
    paragraphs: [
      'Saat dimainkan di Poki atau CrazyGames, game menampilkan iklan HANYA melalui SDK resmi masing-masing portal (Poki SDK / CrazyGames SDK).',
      'Pada versi aplikasi Android, iklan rewarded opsional dilayani melalui Google AdMob, dan game dapat meminta persetujuan privasi (GDPR) sebelum menginisialisasi SDK analitik atau iklan.',
      'Sementara iklan tampil, audio game dimatikan dan permainan dijeda. Iklan rewarded (mis. x2 REWARD atau KADO BOSS) selalu opsional.',
    ],
  },
  {
    id: 'tidak-dikumpulkan',
    title: 'Data yang tidak kami kumpulkan',
    paragraphs: [
      'Kami tidak meminta atau menyimpan: nama asli, nomor telepon, kontak, lokasi presisi (GPS), foto/galeri, mikrofon, kamera, maupun riwayat penelusuran.',
      'Pada versi Android setelah pengguna menyetujui persetujuan GDPR (bila aktif), aplikasi hanya mengirim event progres gameplay anonim dan atribusi pemasangan melalui GameAnalytics, Adjust, dan Facebook App Events.',
      'Aplikasi tidak memiliki fitur sosial: tidak ada chat, tidak ada daftar teman, dan tidak ada unggah konten pengguna.',
    ],
  },
  {
    id: 'izin',
    title: 'Izin aplikasi (Android)',
    paragraphs: [
      'Bungkus Android hanya meminta izin INTERNET — dipakai untuk login akun dan sinkron statistik. Seluruh isi game (gambar, suara, font) dibundel di dalam paket, jadi game tetap bisa dimainkan tanpa koneksi setelah dipasang.',
      'Aplikasi tidak meminta izin kamera, mikrofon, kontak, lokasi, penyimpanan, SMS, telepon, maupun akses ke akun lain.',
    ],
  },
  {
    id: 'anak',
    title: 'Anak-anak',
    paragraphs: [
      'Game ini ramah segala usia dan tidak mengandung chat, pembelian dalam aplikasi, atau tautan keluar. Fitur login email ditujukan untuk pemain berusia 13 tahun ke atas — pemain yang lebih muda silakan memilih mode guest, yang tidak mengirimkan data pribadi apa pun.',
    ],
  },
  {
    id: 'pihak-ketiga',
    title: 'Layanan pihak ketiga',
    paragraphs: [
      'Versi portal memuat SDK iklan resmi platform masing-masing (Poki SDK atau CrazyGames SDK) yang dimuat dari domain platform itu sendiri.',
      'Selain itu game memakai pustaka open source (React, Capacitor, dan pustaka kecil lainnya) yang berjalan di dalam paket aplikasi dan tidak mengirim data ke pihak ketiga.',
    ],
  },
  {
    id: 'keamanan',
    title: 'Penyimpanan & penghapusan data',
    paragraphs: [
      'Data permainan di perangkat berada di sandbox aplikasi sehingga aplikasi lain tidak bisa membacanya; data akun di server kami disimpan di database yang tidak dapat diakses publik.',
      'Menghapus seluruh data bisa dilakukan dari dalam game: buka SETTING → RESET PROGRES; data lokal di perangkat dan akun di server akan dihapus dan game kembali ke layar login.',
      'Penghapusan juga bisa diminta lewat halaman hapus akun (lihat bagian Kontak) dengan memasukkan alamat email yang dipakai login.',
    ],
  },
  {
    id: 'hak',
    title: 'Hak kamu',
    paragraphs: [
      'Kamu berhak meminta akses, koreksi, atau penghapusan data akunmu — termasuk permintaan lewat email ke alamat di bagian Kontak.',
      'Statistik anonim di dashboard developer kami hanya dipakai untuk memahami penggunaan game dan tidak dibagikan.',
    ],
  },
  {
    id: 'perubahan',
    title: 'Perubahan kebijakan',
    paragraphs: [
      `Versi kebijakan ini: ${PRIVACY_POLICY_VERSION} (diperbarui ${PRIVACY_LAST_UPDATED}). Bila ada fitur baru yang mengubah cara pengumpulan data, dokumen ini akan diperbarui lebih dulu sebelum versi barunya dirilis.`,
    ],
  },
  {
    id: 'kontak',
    title: 'Kontak',
    paragraphs: [
      `Email: ${PRIVACY_CONTACT_EMAIL}`,
      `Aplikasi: ${PRIVACY_APP_NAME} (${PRIVACY_PACKAGE_NAME})`,
      `Penghapusan akun: buka halaman /account/delete pada situs game, atau gunakan SETTING → RESET PROGRES di dalam game.`,
    ],
  },
];

export const PRIVACY_SECTIONS_EN: PolicySection[] = [
  {
    id: 'summary',
    title: 'Summary',
    paragraphs: [
      `${PRIVACY_APP_NAME} is an arcade game you can play right away as a guest — no account needed. Signing in with an email address is OPTIONAL and only used to recognise your progress.`,
      'Most game data (score, coins, weapons, quests, settings) stays on your device. Our server only stores the account identity and the compact stats described below.',
    ],
  },
  {
    id: 'on-device',
    title: 'Data stored on your device',
    paragraphs: [
      'The app keeps the following game data in local storage (localStorage / IndexedDB inside the WebView):',
      '• best score and highest stage;',
      '• coin and diamond balances, owned weapons, and the equipped weapon;',
      '• quest, achievement and daily-login progress;',
      '• settings: volume, sound effects, game speed, backdrop theme, orientation, language;',
      '• local leaderboard: your ten best runs (score, stage, coins, time) for the RANKS screen;',
      '• the account session token (a random code, no password) that links the game to your account when you sign in.',
    ],
  },
  {
    id: 'on-server',
    title: 'Data we store on our server',
    paragraphs: [
      'If you sign in with an email, we store: the email address, the sign-up time and the last-active time. Guest players are stored as a random token only, with no personal information.',
      'While you play, the game syncs compact per-account stats: number of weapons unlocked, best score, highest stage, total play time, the weapon played the longest (with its duration), and how many ads were finished watching.',
      'Server data is used to recognise your account and progress — never sold, never shared, never used for advertising.',
    ],
  },
  {
    id: 'ads',
    title: 'Ads & GDPR consent',
    paragraphs: [
      'When played on Poki or CrazyGames, the game shows ads ONLY through the official SDK of that portal (Poki SDK / CrazyGames SDK).',
      'On Android app builds, optional rewarded ads are served through Google AdMob, and where required the app asks for GDPR consent before initializing analytics or ad SDKs.',
      'While an ad shows, the game mutes its audio and pauses. Rewarded ads (e.g. x2 REWARD or BOSS GIFT) are always optional: you choose to watch them for an in-game bonus.',
    ],
  },
  {
    id: 'not-collected',
    title: 'Data we do not collect',
    paragraphs: [
      'We do not ask for or store: real names, phone numbers, contacts, precise GPS location, photos, microphone, camera, or browsing history.',
      'On Android builds, after explicit user consent where required, the app sends anonymous gameplay progression events and install attribution via GameAnalytics, Adjust, and Facebook App Events.',
      'There are no social features: no chat, no friends list, no user-generated uploads.',
    ],
  },
  {
    id: 'permissions',
    title: 'App permissions (Android)',
    paragraphs: [
      'The Android wrapper only asks for INTERNET — used for account sign-in and stats sync. All game content (art, audio, fonts) is bundled inside the package, so the game stays playable offline.',
      'The app never asks for camera, microphone, contacts, location, storage, SMS, phone, or other account access.',
    ],
  },
  {
    id: 'children',
    title: 'Children',
    paragraphs: [
      'The game is family-friendly and contains no chat, in-app purchases, or external links. The email sign-in is meant for players aged 13 and above — younger players should pick guest mode, which sends no personal data at all.',
    ],
  },
  {
    id: 'third-parties',
    title: 'Third-party services',
    paragraphs: [
      'Portal builds load the platform’s own official ad SDK (Poki SDK or CrazyGames SDK) from the platform’s own domain.',
      'Beyond that, the game uses open-source libraries (React, Capacitor and small utilities) that run inside the app package and send no data anywhere.',
    ],
  },
  {
    id: 'security-deletion',
    title: 'Storage & deletion',
    paragraphs: [
      'On-device game data lives in the app sandbox so other apps cannot read it; account data sits in a server database that is not publicly accessible.',
      'To delete everything: open SETTINGS → RESET PROGRESS in the game — local data and the server account are removed and the game returns to the sign-in screen.',
      'Deletion can also be requested through the account-deletion page (see Contact) by entering the email used for sign-in.',
    ],
  },
  {
    id: 'rights',
    title: 'Your rights',
    paragraphs: [
      'You may request access to, correction of, or deletion of your account data — including requests via the email address in Contact.',
      'The anonymous stats on our developer dashboard are used only to understand game usage and are never shared.',
    ],
  },
  {
    id: 'changes',
    title: 'Policy changes',
    paragraphs: [
      `This policy version: ${PRIVACY_POLICY_VERSION} (updated ${PRIVACY_LAST_UPDATED}). If a future feature changes how data is collected, this document is updated before that version ships.`,
    ],
  },
  {
    id: 'contact',
    title: 'Contact',
    paragraphs: [
      `Email: ${PRIVACY_CONTACT_EMAIL}`,
      `App: ${PRIVACY_APP_NAME} (${PRIVACY_PACKAGE_NAME})`,
      'Account deletion: open the /account/delete page on the game site, or use SETTINGS → RESET PROGRESS inside the game.',
    ],
  },
];
