import { useEffect, useState, type CSSProperties } from 'react';
import {
  PRIVACY_APP_NAME,
  PRIVACY_CONTACT_EMAIL,
  PRIVACY_LAST_UPDATED,
  PRIVACY_POLICY_VERSION,
  PRIVACY_SECTIONS_EN,
  PRIVACY_SECTIONS_ID,
} from '../legal/privacyPolicy';
import { getLanguage } from '../i18n/language';
import { getGdprConsent, isGdprRequired, submitGdprConsent, type GdprConsentState } from '../telemetry/voodooSink';

type Props = {
  onClose: () => void;
};

/**
 * The privacy policy, readable inside the game.
 *
 * Play Console wants a policy URL, but a store link is useless to a player who
 * is already in the app (and to a reviewer checking a build without internet),
 * so the same text is shipped here. It comes from `src/legal/privacyPolicy.ts`
 * — the very module that generates docs/PRIVACY.md — so the two cannot drift.
 */
export default function PrivacyPage({ onClose }: Props) {
  const [lang, setLang] = useState<'id' | 'en'>(() => getLanguage());
  const [consent, setConsent] = useState<GdprConsentState | null>(() => getGdprConsent());
  const gdprActive = isGdprRequired();
  const sections = lang === 'id' ? PRIVACY_SECTIONS_ID : PRIVACY_SECTIONS_EN;

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="absolute inset-0 z-[80] flex flex-col bg-[#0b0e14]/97 text-slate-100 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={lang === 'id' ? 'Kebijakan Privasi' : 'Privacy Policy'}
      style={{ '--d': '0ms' } as CSSProperties}
    >
      <div className="flex shrink-0 items-center gap-3 border-b border-white/10 px-4 py-3">
        <div className="min-w-0 flex-1">
          <div className="text-[11px] font-black tracking-[0.22em] text-amber-300">{lang === 'id' ? 'KEBIJAKAN PRIVASI' : 'PRIVACY POLICY'}</div>
          <div className="truncate text-[10px] font-semibold text-white/50">
            {PRIVACY_APP_NAME} · v{PRIVACY_POLICY_VERSION} · {PRIVACY_LAST_UPDATED}
          </div>
        </div>
        <div className="flex shrink-0 gap-1 rounded-lg border border-white/15 bg-white/5 p-0.5">
          {(['id', 'en'] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setLang(value)}
              aria-pressed={lang === value}
              className={`rounded-md px-2 py-1 text-[11px] font-black tracking-wider transition ${
                lang === value ? 'bg-amber-400 text-[#1a1206]' : 'text-white/60'
              }`}
            >
              {value === 'id' ? 'ID' : 'EN'}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label={lang === 'id' ? 'Tutup kebijakan privasi' : 'Close privacy policy'}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border-2 border-white/20 bg-white/10 text-base text-white active:scale-95"
        >
          ✕
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4">
        <div className="mx-auto flex max-w-md flex-col gap-4">
          {sections.map((section) => (
            <section key={section.id} id={`privasi-${section.id}`}>
              <h3 className="text-[13px] font-black tracking-wide text-amber-200">{section.title}</h3>
              {section.paragraphs.map((paragraph, index) => (
                <p key={index} className="mt-1 text-[12px] leading-relaxed text-white/75">
                  {paragraph}
                </p>
              ))}
            </section>
          ))}

          {gdprActive && (
            <div className="rounded-xl border border-cyan-300/25 bg-cyan-950/30 p-3 text-center">
              <div className="text-[11px] font-black tracking-wide text-cyan-200">
                {lang === 'id' ? 'PERSETUJUAN ANALITIK & IKLAN (GDPR)' : 'ANALYTICS & ADS CONSENT (GDPR)'}
              </div>
              <div className="mt-1 text-[11px] text-white/75">
                {lang === 'id'
                  ? `Status saat ini: ${consent === 'accepted' ? 'DISETUJUI' : consent === 'declined' ? 'DITOLAK' : 'BELUM DIPILIH'}`
                  : `Current status: ${consent === 'accepted' ? 'ACCEPTED' : consent === 'declined' ? 'DECLINED' : 'NOT SET'}`}
              </div>
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    submitGdprConsent(true);
                    setConsent('accepted');
                  }}
                  className="flex-1 rounded-lg bg-emerald-600 py-1.5 text-[11px] font-black text-white"
                >
                  {lang === 'id' ? 'SETUJUI' : 'ACCEPT'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    submitGdprConsent(false);
                    setConsent('declined');
                  }}
                  className="flex-1 rounded-lg bg-white/10 py-1.5 text-[11px] font-bold text-white/80"
                >
                  {lang === 'id' ? 'TOLAK' : 'DECLINE'}
                </button>
              </div>
            </div>
          )}

          <a
            href={`mailto:${PRIVACY_CONTACT_EMAIL}?subject=${encodeURIComponent((lang === 'id' ? 'Privasi ' : 'Privacy ') + PRIVACY_APP_NAME)}`}
            className="mt-1 rounded-xl border border-amber-300/40 bg-amber-300/10 px-3 py-2 text-center text-[12px] font-bold text-amber-200"
          >
            ✉ {PRIVACY_CONTACT_EMAIL}
          </a>
        </div>
      </div>

      <div className="shrink-0 border-t border-white/10 px-4 py-3">
        <button
          type="button"
          onClick={onClose}
          className="w-full rounded-xl border-2 border-emerald-700 bg-gradient-to-b from-emerald-400 to-emerald-600 py-2.5 text-[14px] font-black text-white active:scale-[0.99]"
        >
          {lang === 'id' ? 'TUTUP' : 'CLOSE'}
        </button>
      </div>
    </div>
  );
}
