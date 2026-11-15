import { rarityLabel, tr } from '../../../i18n/strings';
import { useLanguage } from '../../../i18n/useLanguage';
import { useEffect, useState, type CSSProperties } from 'react';
import { QUESTS, type Quest, type QuestState } from '../game/quests';
import { DAILY_REWARDS, canClaimToday, type DailyState } from '../dailyRewards';
import { sfx } from '../game/audio';
import { sfx4 } from '../game/sfx4';
import CoinSprite from '../../shared/CoinSprite';
import MilestoneGift, { type GiftTone } from './MilestoneGift';
import DiamondSprite from '../../shared/DiamondSprite';
import { Ico, IcoTile, type FlatName } from '../../perfect-shot/ui/FlatIcons';
import { ACH_IN, ACH_OUT } from '../../perfect-shot/ach/data';

interface QuestModalProps {
  state: QuestState;
  ownedCount: number;
  coins: number;
  diamonds: number;
  onClaim: (quest: Quest) => void;
  onClose: () => void;
  leaving?: boolean;
  dailyState?: DailyState;
  onClaimDaily?: () => void;
}

const v = (style: Record<string, string | number>) => style as CSSProperties;
const QUEST_ICON_STYLE: Record<string, { icon: FlatName; color: [string, string] }> = {
  'd-stage': { icon: 'target', color: ['#fda4af', '#e11d48'] },
  'd-boss': { icon: 'demon', color: ['#d8b4fe', '#7e22ce'] },
  'd-box': { icon: 'gift', color: ['#fde68a', '#f59e0b'] },
  'd-equip': { icon: 'gun', color: ['#bbf7d0', '#16a34a'] },
  'd-shots': { icon: 'bolt', color: ['#fed7aa', '#ea580c'] },
  'd-coins': { icon: 'coinbag', color: ['#fed7aa', '#ea580c'] },
  's-stage5': { icon: 'map', color: ['#bae6fd', '#0284c7'] },
  's-stage25': { icon: 'swords', color: ['#bae6fd', '#0284c7'] },
  's-stage50': { icon: 'trophy', color: ['#fde68a', '#f59e0b'] },
  's-stage100': { icon: 'crown', color: ['#fde68a', '#f59e0b'] },
  's-boss1': { icon: 'knight', color: ['#d8b4fe', '#7e22ce'] },
  's-boss5': { icon: 'demon', color: ['#d8b4fe', '#7e22ce'] },
  's-boss10': { icon: 'skull', color: ['#d8b4fe', '#7e22ce'] },
  's-boss20': { icon: 'skull', color: ['#d8b4fe', '#7e22ce'] },
  's-box5': { icon: 'gift', color: ['#fde68a', '#f59e0b'] },
  's-box20': { icon: 'gift', color: ['#fed7aa', '#ea580c'] },
  's-col3': { icon: 'cart', color: ['#bae6fd', '#0284c7'] },
  's-col10': { icon: 'cart', color: ['#bae6fd', '#0284c7'] },
  's-col25': { icon: 'trophy', color: ['#fbcfe8', '#db2777'] },
  's-coin2k': { icon: 'coinbag', color: ['#fed7aa', '#ea580c'] },
  's-coin10k': { icon: 'gem', color: ['#bae6fd', '#0284c7'] },
  's-shots200': { icon: 'bolt', color: ['#fde68a', '#f59e0b'] },
  's-playerlevel5': { icon: 'trophy', color: ['#fde68a', '#f59e0b'] },
};

function useResetTimer() {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);
  const end = new Date(now);
  end.setHours(24, 0, 0, 0);
  const left = Math.max(0, Math.floor((end.getTime() - now) / 1000));
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(Math.floor(left / 3600))}:${pad(Math.floor((left % 3600) / 60))}:${pad(left % 60)}`;
}

export default function QuestModal({ state, ownedCount, coins, diamonds, onClaim, onClose, leaving = false, dailyState, onClaimDaily }: QuestModalProps) {
  const [category, setCategory] = useState<'daily' | 'skill'>('daily');
  const [language] = useLanguage();
  const [info, setInfo] = useState(false);
  const timer = useResetTimer();
  const dailyCanClaim = dailyState ? canClaimToday(dailyState) : false;
  const claimed = state.claimed.length;
  const list = QUESTS.filter(q => q.category === category);
  /**
   * Page entrance / exit choreography mirrors the reference Achievement screen:
   * each block slides, pops or slams in on its own beat, and plays the matching
   * OUT animation before the transition overlay covers the page.
   */
  const animStyle = (
    inName: string,
    t: { d: number; dur: number },
    outName: string,
    tOut: { d: number; dur: number },
  ) => v({
    animationName: leaving ? outName : inName,
    // the elements keep their `in-*` class, so mirror the reference's faster
    // exit easing explicitly when the leaving flag flips.
    animationTimingFunction: leaving ? 'cubic-bezier(0.55, -0.35, 0.75, 0.4)' : 'cubic-bezier(0.22, 1.2, 0.36, 1)',
    '--d': `${leaving ? tOut.d : t.d}ms`,
    '--dur': `${leaving ? tOut.dur : t.dur}ms`,
  });
  const readyAll = QUESTS.filter(q => !state.claimed.includes(q.id) && Math.min(q.progress(state, ownedCount), q.target) >= q.target);

  const handleClaim = (q: Quest) => {
    sfx.coin();
    sfx4.match();
    onClaim(q);
  };
  const claimAll = () => {
    if (!readyAll.length) return;
    sfx4.match();
    readyAll.forEach(handleClaim);
  };

  return (
    <div data-wallet-scope="quest" className={`a absolute inset-0 z-40 flex flex-col overflow-hidden bg-[#07132f] px-3 pt-5 pb-2.5 text-white ${leaving ? 'out-bg pointer-events-none' : 'in-bg'}`} style={v({ '--d': '0ms', '--dur': leaving ? '560ms' : '800ms' })}>
      {/* Match Perfect Shot's blue radial rays instead of the former flat SGA sheet. */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(59,130,246,.58) 0%, rgba(23,45,122,.68) 45%, rgba(5,10,35,.9) 100%)' }} />
        <div className="absolute left-1/2 top-[70px] h-[560px] w-[560px] -translate-x-1/2 -translate-y-1/2 opacity-45">
          <div className="spin-slow h-full w-full rounded-full" style={{ background: 'repeating-conic-gradient(from 0deg, rgba(255,255,255,.22) 0deg 8deg, transparent 8deg 22deg)', WebkitMask: 'radial-gradient(circle, #000 0%, transparent 65%)', mask: 'radial-gradient(circle, #000 0%, transparent 65%)' }} />
        </div>
      </div>
      {/* Currency and completion HUD: grouped at the upper right, like the reference. */}
      <div className="a in-down relative z-20 flex shrink-0 items-center gap-2" style={animStyle('inDown', ACH_IN.top(1), 'outUp', ACH_OUT.top(1))}>
        <div className="flex-1" />
        {/* Same wallet as the main menu: 25/24 px coin and diamond art with
            text-xl / text-lg counters, so the achievement page does not show a
            smaller currency than the menu it was opened from. */}
        <div className="font-title flex h-11 items-center gap-1.5 rounded-full border-2 border-[#0b1f5c] bg-[#0b1f5c]/75 pl-2 pr-1 text-white shadow-inner">
          <span data-wallet="coin" className="flex items-center gap-1.5">
            <CoinSprite size={25} />
            <span className="min-w-[34px] text-xl tabular-nums leading-none">{coins}</span>
          </span>
          <span data-wallet="diamond" className="flex items-center gap-1">
            <DiamondSprite size={24} className="-mx-0.5" />
            <span className="min-w-[24px] text-lg tabular-nums leading-none">{diamonds}</span>
          </span>
          <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-b from-[#4ade80] to-[#16a34a] text-xl leading-none shadow-[0_2px_0_#14532d]">+</span>
        </div>
        <div className="font-title flex h-11 flex-col items-center justify-center rounded-xl border-2 border-[#0b1f5c] bg-gradient-to-b from-[#1e3a8a] to-[#0f1f4f] px-2.5 shadow-[0_3px_0_#060f2e]">
          <span className="text-lg leading-none text-[#ffd23f]">{claimed}<span className="text-xs text-white/65">/{QUESTS.length}</span></span>
          <span className="text-[10px] tracking-widest text-white/80">{tr(language, 'SELESAI')}</span>
        </div>
      </div>

      {/* Ribbon title and info/close buttons. */}
      <div className="relative z-10 mt-1.5 flex shrink-0 flex-col items-center">
        <div className="a relative h-[42px] w-[90%]" style={animStyle('acBannerIn', ACH_IN.banner, 'acBannerOut', ACH_OUT.banner)}>
          <span className="absolute -left-3 top-3 h-10 w-12 bg-gradient-to-b from-[#c2410c] to-[#7c2d12]" style={{ clipPath: 'polygon(0 0,100% 0,100% 100%,0 100%,28% 50%)' }} />
          <span className="absolute -right-3 top-3 h-10 w-12 bg-gradient-to-b from-[#c2410c] to-[#7c2d12]" style={{ clipPath: 'polygon(0 0,100% 0,72% 50%,100% 100%,0 100%)' }} />
          <div className="absolute inset-x-2 top-0 bottom-1.5 overflow-hidden rounded-2xl border-[3px] border-[#7c2d12] bg-gradient-to-b from-[#ffd25a] via-[#ffa62b] to-[#f97316] shadow-[0_5px_0_#7c2d12,0_10px_20px_rgba(0,0,0,.35)]">
            <div className="absolute inset-x-2 top-1 h-[40%] rounded-xl bg-white/30" />
            <div className="font-title relative flex h-full items-center justify-center gap-2 text-[24px] tracking-wide text-white" style={{ textShadow: '0 2px 0 #7c2d12, -1px 0 #7c2d12, 1px 0 #7c2d12' }}>
              <Ico name="trophy" className="h-6 w-6 drop-shadow-[0_3px_0_rgba(124,45,18,.6)]" color="#ffffff" /> ACHIEVEMENT
            </div>
          </div>
          <button data-gloss="off" onClick={() => setInfo(true)} aria-label={tr(language, 'Info achievement')} className="press font-title absolute -left-1 top-[5px] z-10 grid h-9 w-9 place-items-center rounded-full border-[3px] border-[#0b1f5c] bg-gradient-to-b from-[#7dd3fc] to-[#2563eb] text-lg text-white shadow-[0_3px_0_#0b1f5c]">i</button>
          <button data-gloss="off" onClick={onClose} aria-label={tr(language, 'Tutup achievement')} className="press absolute -right-1 top-1 z-10 grid h-10 w-10 place-items-center rounded-full border-[3px] border-[#7f1d1d] bg-gradient-to-b from-[#ff7a7a] to-[#dc2626] text-2xl font-black text-white shadow-[0_4px_0_#7f1d1d]">×</button>
        </div>
        <div className="a in-pop mt-1 flex h-[22px] shrink-0 items-center rounded-full border-2 border-[#3b0764] bg-gradient-to-b from-[#a855f7] to-[#6b21a8] px-3 text-[11px] leading-none text-white shadow-[0_2px_0_#3b0764]" style={animStyle('inPop', ACH_IN.timer, 'outUp', ACH_OUT.top(2))}>
          <Ico name="timer" className="h-3.5 w-3.5" color="#ffffff" /> {tr(language, 'RESET DALAM ')}{timer}
        </div>
      </div>

      {/* Main blue-grid achievement board. */}
      <section className="a ac-panel-in relative z-10 mt-3 flex min-h-0 flex-1 flex-col overflow-hidden rounded-[22px] border-[3px] border-[#0b1f5c] p-2 shadow-[0_8px_0_#0b1f5c,0_16px_30px_rgba(0,0,0,.45),inset_0_2px_0_rgba(255,255,255,.35)]" style={{ ...animStyle('acPanelIn', ACH_IN.panel, 'acPanelOut', ACH_OUT.panel), backgroundColor: '#2f6fe0', backgroundImage: 'linear-gradient(rgba(255,255,255,.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.08) 1px, transparent 1px)', backgroundSize: '22px 22px' }}>
        {/* DAILY LOGIN — jalur streak 7 hari bergaya jalur milestone, menggantikan
            BONUS MILESTONE: simpul hari bernomor di atas rel emas dengan kado
            rarity berbaris, tepat di atas tab & list misi DAILY / SKILL yang
            tetap tampil sebagai daftar di bawahnya. */}
        {dailyState && (
          <div className="relative shrink-0 rounded-2xl border-2 border-[#0b1f5c]/50 bg-[#1a46a8]/60 px-2.5 pt-5 pb-1 shadow-[inset_0_3px_8px_rgba(0,0,0,.25)]">
            {/* Pil judul + pengingat reset — kepala jalur yang sama seperti milestone dulu. */}
            <div className="font-title absolute -top-3.5 left-1/2 flex -translate-x-1/2 items-center whitespace-nowrap rounded-full border-2 border-[#7c2d12] bg-gradient-to-b from-[#ffd23f] to-[#f59e0b] px-3 py-1 text-[11px] leading-none text-[#5a2a00] shadow-[0_2px_0_#7c2d12]"><Ico name="calendar" className="-mt-0.5 mr-1 inline h-3.5 w-3.5" color="#5a2a00" />DAILY LOGIN · {dailyState.streak}/7</div>
            <span className="font-title absolute -top-3 right-2 flex items-center gap-1 rounded-full border-2 border-[#0b1f5c] bg-[#1e3a8a] px-1.5 py-[3px] text-[8px] leading-none text-white/85 shadow-[0_2px_0_#0b1f5c]"><Ico name="timer" className="h-2.5 w-2.5" color="rgba(255,255,255,.85)" />{timer}</span>
            <div className="relative mx-5 h-[96px]">
              {/* Rel streak: isi emas maju mengikuti jumlah hari yang sudah diklaim. */}
              <div className="absolute inset-x-1 top-[54px] h-3 rounded-full border-2 border-[#0b1f5c] bg-[#13306f] shadow-inner">
                <div className="h-full rounded-full bg-gradient-to-b from-[#ffe066] to-[#f59e0b] shadow-[0_0_10px_rgba(255,210,63,.7)] transition-[width] duration-700" style={{ width: `${Math.min(100, (Math.min(dailyState.streak, 7) / 7) * 100)}%` }} />
              </div>
              {DAILY_REWARDS.map((r) => {
                const isClaimed = dailyState.claimedDays.includes(r.day) || (dailyState.lastClaimDate && dailyCanClaim === false && r.day <= dailyState.streak);
                const nextDay = dailyState.streak === 0 ? 1 : dailyState.streak >= 7 ? 1 : dailyState.streak + 1;
                const canClaim = r.day === nextDay && dailyCanClaim;
                // Bahasa warna kado: hijau=UMUM, ungu=LANGKA, merah=EPIC, kuning=LEGEND; hari tanpa senjata tampil koin.
                const tone: GiftTone | null = !r.weaponRarity ? null : r.weaponRarity === 'UMUM' ? 'green' : r.weaponRarity === 'LANGKA' ? 'purple' : r.weaponRarity === 'EPIC' ? 'red' : 'gold';
                const chip = tone === 'green' ? [rarityLabel('UMUM', language), 'bg-[#22c55e] text-white'] : tone === 'purple' ? [rarityLabel('LANGKA', language), 'bg-[#a855f7] text-white'] : tone === 'red' ? ['EPIC', 'bg-[#dc2626] text-white'] : tone === 'gold' ? ['LEGEND', 'bg-[#fbbf24] text-[#482900]'] : [tr(language, 'KOIN'), 'bg-[#38bdf8]/85 text-[#082f49]'];
                return (
                  <button data-gloss="off" data-daily-day={r.day} key={r.day} disabled={!canClaim} onClick={canClaim ? onClaimDaily : undefined} aria-label={isClaimed ? `${tr(language, 'Hari')} ${r.day} ${tr(language, 'sudah diklaim')}` : canClaim ? `${tr(language, 'Klaim hadiah hari ke-')}${r.day}` : `${tr(language, 'Hari')} ${r.day} ${tr(language, 'terkunci')}`} className={`absolute top-0 z-10 flex w-[46px] -translate-x-1/2 flex-col items-center ${canClaim ? 'press' : 'cursor-default'}`} style={{ left: `${(r.day / 7) * 100}%` }}>
                    {/* Kado rarity / koin hari ini. */}
                    <span className="relative block h-[34px] w-[34px]" style={{ filter: canClaim ? 'drop-shadow(0 0 7px rgba(255,210,63,.72))' : undefined, opacity: isClaimed && !tone ? 0.5 : 1 }}>
                      {tone ? <MilestoneGift tone={tone} open={!!isClaimed} className="w-full drop-shadow-[0_4px_3px_rgba(0,0,0,.38)]" /> : <span className="grid h-full w-full place-items-center"><CoinSprite size={22} /></span>}
                      {canClaim && <span className="font-title absolute -top-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#ef4444] px-1.5 py-[2px] text-[8px] leading-none text-white ring-2 ring-white">{tr(language, 'KLAIM')}</span>}
                    </span>
                    {/* Chip rarity tepat di bawah kadonya. */}
                    <span className={`font-title mt-[2px] whitespace-nowrap rounded-md px-1.5 py-[2px] text-[7px] leading-none shadow ${chip[1]} ${isClaimed ? 'opacity-60' : ''}`}>{chip[0]}</span>
                    {/* Simpul hari bernomor di atas rel; terklaim berubah centang emas. */}
                    <span className={`mt-[3px] grid h-[20px] w-[20px] place-items-center rounded-full border-2 text-[10px] font-black shadow-[0_2px_0_#0b1f5c] ${isClaimed || canClaim ? 'border-[#7c2d12] bg-gradient-to-b from-[#fff3a0] to-[#f59e0b] text-[#7c2d12]' : 'border-[#0b1f5c] bg-gradient-to-b from-[#3d5fa8] to-[#24427f] text-white'} ${canClaim ? 'animate-pulse' : ''}`}>{isClaimed ? '✓' : r.day}</span>
                    {/* Besaran hadiah melekat di bawah simpulnya. */}
                    <span className={`mt-[2px] flex items-center gap-0.5 text-[8px] font-bold leading-tight ${isClaimed ? 'text-white/40' : 'text-amber-200'}`}><CoinSprite size={8} />+{r.coins}</span>
                    <span className={`flex items-center gap-0.5 text-[8px] font-bold leading-tight ${isClaimed ? 'text-white/40' : 'text-sky-200'}`}><DiamondSprite size={8} />+{r.diamonds}</span>
                  </button>
                );
              })}
            </div>
            <p className="font-ui flex items-center justify-center gap-1 pb-0.5 text-center text-[8px] leading-none text-white/70"><Ico name="gift" className="h-3 w-3" color="rgba(255,255,255,.7)" /> {tr(language, 'Login tiap hari untuk semua kado di jalur · Terbesar di hari ke-7')}</p>
          </div>
        )}

        {/* DAILY / SKILL tabs */}
        <div className="mt-2 grid shrink-0 grid-cols-2 gap-2">
          {(['daily', 'skill'] as const).map((cat, i) => {
            const active = category === cat;
            const readyCount = QUESTS.filter(q => q.category === cat && !state.claimed.includes(q.id) && Math.min(q.progress(state, ownedCount), q.target) >= q.target).length;
            return <button data-gloss="off" key={cat} onClick={() => setCategory(cat)} style={animStyle('inPop', { d: ACH_IN.tabs.d + i * 90, dur: 520 }, 'outDown', { d: 0, dur: 280 })} className={`a press font-title relative flex h-[44px] items-center justify-center gap-2 rounded-2xl border-2 text-[18px] transition-all duration-200 ${active ? 'border-[#7c2d12] bg-gradient-to-b from-[#ffe27a] to-[#f59e0b] text-[#5a2a00] shadow-[0_4px_0_#9a3412]' : 'border-[#0b1f5c] bg-gradient-to-b from-[#3d5fa8] to-[#24427f] text-white/80 shadow-[0_4px_0_#0b1f5c]'}`}>
              <Ico name={cat === 'daily' ? 'calendar' : 'swords'} className="h-4 w-4" color={active ? '#5a2a00' : 'rgba(255,255,255,.8)'} /> {cat.toUpperCase()}
              {readyCount > 0 && <span className="absolute -right-1 -top-2 grid h-5 min-w-5 place-items-center rounded-full bg-[#ef4444] px-1 text-[11px] text-white ring-2 ring-white">{readyCount}</span>}
            </button>;
          })}
        </div>

        {/* mission rows: ready / active / claimed states stay backed by SGA quest progress */}
        <div className="no-scrollbar smooth-scroll mt-2 min-h-0 flex-1 space-y-2 overflow-y-auto overflow-x-hidden px-0.5 pb-1">
          {list.map((q, rowIndex) => {
            const rowStyle = animStyle('inLeft', ACH_IN.row(rowIndex), 'outDown', ACH_OUT.row(rowIndex));
            const progress = Math.min(q.progress(state, ownedCount), q.target);
            const done = progress >= q.target;
            const taken = state.claimed.includes(q.id);
            const percent = Math.round(progress / q.target * 100);
            const iconStyle = QUEST_ICON_STYLE[q.id] ?? { icon: 'target' as FlatName, color: ['#bae6fd', '#0284c7'] as [string, string] };
            const icon = <span className="relative m-2 grid w-[46px] shrink-0 place-items-center rounded-xl"><IcoTile name={iconStyle.icon} bg={iconStyle.color} size={46} radius={12} /></span>;
            const reward = (tone: 'green' | 'blue') => <span className={`relative flex w-[92px] shrink-0 flex-col items-center justify-center gap-0.5 border-l-2 ${tone === 'green' ? 'border-[#0e5a26]/40 bg-[#e8fde4]' : 'border-[#1e3a8a]/30 bg-[#c4d9ff]'}`}>
              <span className="font-title flex items-center gap-1 text-[17px] leading-none text-[#1e3a8a]"><CoinSprite size={18} />+{q.rewardCoins}</span>
              {q.rewardWeapon && <span className="font-title flex items-center gap-0.5 text-[10px] leading-none text-[#7e22ce]"><Ico name="gun" className="h-3 w-3" color="#7e22ce" /> {tr(language, 'SENJATA')}</span>}
            </span>;
            if (taken) return (
              <div key={q.id} style={rowStyle} className="a relative flex h-[62px] w-full items-stretch overflow-hidden rounded-2xl border-2 border-[#0f2a6b] bg-[#1d3d8f]/75 text-left">
                {icon}
                <span className="flex min-w-0 flex-1 flex-col justify-center"><span className="font-title truncate text-[14px] text-white/60 line-through decoration-2">{tr(language, q.title).toUpperCase()}</span><span className="text-[11px] text-white/50">{tr(language, q.desc)}</span></span>
                <span className="font-title flex w-[92px] shrink-0 flex-col items-center justify-center gap-0.5 border-l-2 border-[#0f2a6b] bg-[#163275] text-[10px] text-[#86efac]"><span className="grid h-7 w-7 place-items-center rounded-full bg-gradient-to-b from-[#4ade80] to-[#16a34a] text-base text-white shadow-[0_2px_0_#14532d]">✓</span>{tr(language, 'SELESAI')}</span>
              </div>
            );
            if (done) return (
              <button data-gloss="off" key={q.id} onClick={() => handleClaim(q)} style={rowStyle} className="a press shine relative flex h-[70px] w-full items-stretch overflow-hidden rounded-2xl border-2 border-[#0e5a26] bg-gradient-to-b from-[#7cf06f] via-[#3fcf4a] to-[#1f9b37] text-left shadow-[0_4px_0_#0e5a26]">
                <span className="pointer-events-none absolute inset-x-2 top-1 h-[38%] rounded-xl bg-white/25" />
                {icon}
                <span className="relative flex min-w-0 flex-1 flex-col justify-center"><span className="font-title text-[23px] leading-none text-white" style={{ textShadow: '0 2px 0 #0e5a26, -1px 0 0 #0e5a26, 1px 0 0 #0e5a26' }}>CLAIM</span><span className="font-title truncate text-[12.5px] text-[#0b3d18]">{tr(language, q.title).toUpperCase()}</span></span>
                {reward('green')}
              </button>
            );
            return (
              <div key={q.id} style={rowStyle} className="a relative flex h-[74px] w-full items-stretch overflow-hidden rounded-2xl border-2 border-[#1e3a8a] bg-gradient-to-b from-[#f1f6ff] to-[#d3e3ff] text-left shadow-[0_4px_0_#1e3a8a]">
                {icon}
                <span className="relative flex min-w-0 flex-1 flex-col justify-center pr-2"><span className="flex items-center gap-1.5"><span className="font-title truncate text-[14px] leading-tight text-[#1e3a8a]">{tr(language, q.title).toUpperCase()}</span><span className="font-title shrink-0 rounded-md bg-[#f59e0b] px-1.5 py-[1px] text-[10px] leading-none text-white shadow-[0_1px_0_#9a3412]">GO ›</span></span><span className="font-ui truncate text-[12px] leading-tight text-[#2c4a85]">{tr(language, q.desc)}</span><span className="relative mt-1.5 h-[18px] w-full overflow-hidden rounded-full border-2 border-[#1e3a8a] bg-[#3b4f86]"><span className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-b from-[#ffe066] to-[#f59e0b]" style={{ width: `${percent}%` }} /><span className="font-title absolute inset-0 grid place-items-center text-[11px] leading-none text-white" style={{ textShadow: '0 1.5px 0 #1e3a8a' }}>{progress}/{q.target}</span></span></span>
                {reward('blue')}
              </div>
            );
          })}
        </div>

        {/* One-tap claim-all remains based solely on ready SGA quests. */}
        <div className="a mt-1.5 shrink-0" style={animStyle('inPop', ACH_IN.claimAll, 'outDown', { d: 0, dur: 300 })}>
          {readyAll.length > 0 ? <button data-gloss="off" onClick={claimAll} className="press shine font-title relative flex h-[48px] w-full items-center justify-center gap-2 rounded-2xl border-2 border-[#0e5a26] bg-gradient-to-b from-[#7cf06f] via-[#3fcf4a] to-[#1f9b37] text-[20px] text-white shadow-[0_5px_0_#0e5a26]">
            <span className="pointer-events-none absolute inset-x-3 top-1 h-[35%] rounded-xl bg-white/25" /><Ico name="gift" className="relative h-6 w-6" color="#ffffff" /> <span className="relative" style={{ textShadow: '0 2px 0 #0e5a26' }}>{tr(language, 'KLAIM SEMUA (')}{readyAll.length})</span>
          </button> : <div className="font-title flex h-[48px] w-full items-center justify-center gap-2 rounded-2xl border-2 border-[#0b1f5c] bg-[#1e3a8a]/80 text-[12px] text-white/75">⏱ {tr(language, 'Misi baru dalam ')}{timer}</div>}
        </div>
      </section>

      {info && <div className="absolute inset-0 z-50 grid place-items-center bg-black/60 p-6" onClick={() => setInfo(false)}>
        <div className="w-full rounded-2xl border-2 border-[#0b1f5c] bg-gradient-to-b from-[#3d5fa8] to-[#17316c] p-4 text-center shadow-xl" onClick={e => e.stopPropagation()}>
          <p className="font-title text-xl">ACHIEVEMENT SGA</p>
          <p className="mt-2 text-sm text-white/85">{tr(language, 'Selesaikan misi DAILY dan SKILL untuk mendapatkan koin. Setiap milestone membuka hadiah senjata; progres tetap tersimpan di akun SGA.')}</p>
          <button data-gloss="off" onClick={() => setInfo(false)} className="press mt-4 rounded-xl border-2 border-[#7c2d12] bg-gradient-to-b from-[#ffd25a] to-[#f97316] px-6 py-2 font-title text-[#5a2a00]">{tr(language, 'MENGERTI')}</button>
        </div>
      </div>}
    </div>
  );
}
