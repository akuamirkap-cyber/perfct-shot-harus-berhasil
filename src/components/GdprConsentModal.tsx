import { useState } from 'react';
import { getLanguage } from '../i18n/language';
import { submitGdprConsent } from '../telemetry/voodooSink';
import { initAds } from '../ads';
import PrivacyPage from './PrivacyPage';

interface Props {
  onResolved: (accepted: boolean) => void;
}

/**
 * EU/Global GDPR consent modal shown on native Android builds before
 * initializing GameAnalytics, Adjust, Facebook SDK, or AdMob.
 */
export default function GdprConsentModal({ onResolved }: Props) {
  const [showPrivacy, setShowPrivacy] = useState(false);
  const lang = getLanguage();
  const isId = lang === 'id';

  const handleChoice = (accepted: boolean) => {
    submitGdprConsent(accepted);
    if (accepted) {
      void initAds();
    }
    onResolved(accepted);
  };

  if (showPrivacy) {
    return <PrivacyPage onClose={() => setShowPrivacy(false)} />;
  }

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 px-5 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={isId ? 'Persetujuan Privasi' : 'Privacy Consent'}
    >
      <div className="panel w-full max-w-sm rounded-3xl border border-cyan-200/20 p-5 text-slate-100 shadow-2xl">
        <div className="text-center">
          <div className="text-[11px] font-black tracking-[0.22em] text-amber-300">
            {isId ? 'PRIVASI & PERSETUJUAN' : 'YOUR PRIVACY'}
          </div>
          <h2 className="mt-1 text-xl font-black tracking-wide text-white">
            Perfect Shot · Gun Hit
          </h2>
        </div>

        <p className="mt-3 text-center text-[12px] leading-relaxed text-slate-200/85">
          {isId
            ? 'Untuk meningkatkan gameplay dan menampilkan hadiah iklan video, aplikasi memakai GameAnalytics, Adjust, Facebook App Events, serta Google AdMob. Pilih apakah Anda menyetujui pemrosesan data analitik & iklan anonim ini.'
            : 'To improve gameplay balance and support optional rewarded video ads, this app uses GameAnalytics, Adjust, Facebook App Events, and Google AdMob. Please choose whether you consent to anonymous analytics & ad measurement.'}
        </p>

        <p className="mt-2 text-center text-[11px] leading-snug text-slate-400">
          {isId
            ? 'Jika memilih Tidak, SDK analitik & iklan tidak akan diinisialisasi dan Anda tetap bisa bermain secara lokal.'
            : 'If you decline, third-party analytics and ad SDKs will not be initialized and you can still play locally.'}
        </p>

        <button
          type="button"
          onClick={() => setShowPrivacy(true)}
          className="mt-3 w-full text-center text-[11px] font-bold tracking-wide text-sky-300 underline underline-offset-2"
        >
          {isId ? 'Baca Kebijakan Privasi' : 'Read Privacy Policy'}
        </button>

        <div className="mt-4 flex flex-col gap-2.5">
          <button
            type="button"
            onClick={() => handleChoice(true)}
            className="w-full rounded-2xl border-2 border-[#0e5a26] bg-gradient-to-b from-[#5df277] via-[#2fd24f] to-[#1aa83a] py-3 text-[15px] font-black tracking-wider text-white shadow-[0_5px_0_#0b6e22] active:translate-y-0.5"
          >
            {isId ? 'YA, SAYA SETUJU' : 'YES, ACCEPT'}
          </button>
          <button
            type="button"
            onClick={() => handleChoice(false)}
            className="w-full rounded-2xl border border-white/15 bg-white/10 py-2.5 text-[13px] font-bold tracking-wider text-slate-200 active:scale-[0.99]"
          >
            {isId ? 'TIDAK, TOLAK' : 'NO, DECLINE'}
          </button>
        </div>
      </div>
    </div>
  );
}
