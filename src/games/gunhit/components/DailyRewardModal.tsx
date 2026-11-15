import { useEffect, useState, useRef } from 'react';
import { rarityLabel, tr } from '../../../i18n/strings';
import { useLanguage } from '../../../i18n/useLanguage';
import { DAILY_REWARDS, loadDailyState, claimDailyReward, canClaimToday, getNextReward, type DailyState } from '../dailyRewards';
import { getWeapon, type WeaponId } from '../game/weapons';
import CoinSprite from '../../shared/CoinSprite';
import DiamondSprite from '../../shared/DiamondSprite';
import { drawGunCentered } from '../game/art/drawCentered';
import { getGunMetrics } from '../game/art/metrics';
import { getFast2DContext, getOptimalCanvasDpr } from '../utils/mobilePerf';

type Props = {
  onClose: () => void;
  onClaim: (reward: { coins:number; diamonds:number; weaponId?:string }) => void;
  ownedIds: string[];
};

function GachaGun({ id, size=88 }: { id:string; size?:number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(()=>{
    const cv=ref.current; if(!cv) return;
    const dpr=getOptimalCanvasDpr(2);
    cv.width=Math.round(size*dpr); cv.height=Math.round(size*dpr);
    const ctx=getFast2DContext(cv); if(!ctx) return;
    ctx.setTransform(dpr,0,0,dpr,0,0);
    ctx.translate(size/2,size/2);
    ctx.rotate(Math.PI/4);
    const m=getGunMetrics(id as WeaponId);
    const scale=(size*0.92)/Math.max(m.span,130);
    ctx.scale(scale,scale);
    drawGunCentered(ctx, id as WeaponId, 0, 0, true, undefined, true);
  },[id,size]);
  return <canvas ref={ref} style={{width:size,height:size}} className="block"/>
}

export default function DailyRewardModal({ onClose, onClaim, ownedIds }: Props) {
  const [language] = useLanguage();
  const [state, setState] = useState<DailyState>(()=>loadDailyState());
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<{ coins:number; diamonds:number; weaponId?:string; day:number } | null>(null);
  const [showGacha, setShowGacha] = useState(false);
  const canClaim = canClaimToday(state);
  const next = getNextReward(state.streak);

  const handleClaim = () => {
    if (!canClaim || spinning) return;
    setSpinning(true);
    // Simulate gacha spin 1.2s
    setTimeout(()=>{
      const { newState, reward, weaponId } = claimDailyReward(state, ownedIds);
      setState(newState);
      setResult({ coins: reward.coins, diamonds: reward.diamonds, weaponId, day: reward.day });
      setSpinning(false);
      if (weaponId) setShowGacha(true);
      // notify parent to actually give rewards (coins/diamonds/weapon)
      onClaim({ coins: reward.coins, diamonds: reward.diamonds, weaponId });
    }, rewardHasGacha(next) ? 1400 : 400);
  };

  function rewardHasGacha(r: typeof next){ return !!r.weaponRarity; }

  return (
    <div className="absolute inset-0 z-[75] flex items-center justify-center bg-[#05070d]/88 p-3 backdrop-blur-md">
      <div className="relative w-full max-w-[380px] max-h-[96%] overflow-hidden rounded-[22px] border border-amber-300/30 bg-gradient-to-b from-[#1a1408] via-[#0f1320] to-[#080a12] shadow-[0_20px_60px_rgba(0,0,0,.75)] flex flex-col">
        <div className="absolute -top-16 left-1/2 h-32 w-64 -translate-x-1/2 rounded-full bg-amber-400/25 blur-3xl pointer-events-none"/>
        
        <header className="relative z-10 flex items-center justify-between px-4 py-3 border-b border-white/10 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-amber-300 px-2 py-0.5 text-[9px] font-black tracking-[0.16em] text-[#2a1d00]">DAILY</span>
              <span className="text-[10px] font-bold tracking-[0.12em] text-white/50">{tr(language, 'HADIAH HARIAN')}</span>
            </div>
            <h2 className="mt-0.5 text-[17px] font-black tracking-wide text-white">{tr(language, 'DAILY REWARD — 7 HARI')}</h2>
            <p className="text-[10px] font-semibold text-amber-200/70">{tr(language, 'Login tiap hari, streak tidak putus = makin kaya')}</p>
          </div>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-xl border border-white/15 bg-white/10 text-white font-black">✕</button>
        </header>

        <div className="relative z-10 flex-1 overflow-y-auto p-3 space-y-3">
          {/* 7-day grid */}
          <div className="grid grid-cols-4 gap-2">
            {DAILY_REWARDS.map(r=>{
              const isClaimed = state.claimedDays.includes(r.day);
              const isNext = r.day === next.day && canClaim;
              void r.day; // isFuture reserved for future glow logic
              return (
                <div key={r.day} className={`relative rounded-xl border p-2 text-center ${isNext ? 'border-amber-300 bg-amber-400/15 shadow-[0_0_16px_rgba(251,191,36,.4)] scale-[1.02]' : isClaimed ? 'border-emerald-300/30 bg-emerald-500/10 opacity-60' : 'border-white/10 bg-white/[0.03]'} ${r.day===1||r.day===7 ? 'col-span-2' : ''}`}>
                  {isNext && <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 rounded-full bg-amber-300 px-1.5 py-0.5 text-[7px] font-black tracking-widest text-[#2a1d00] whitespace-nowrap">{tr(language, 'HARI INI')}</span>}
                  {isClaimed && <span className="absolute -top-1 right-1 h-4 w-4 grid place-items-center rounded-full bg-emerald-400 text-[10px]">✓</span>}
                  <div className="text-[9px] font-black tracking-widest text-white/50">{tr(language, 'HARI')} {r.day}</div>
                  <div className="mt-1 flex justify-center">
                    {r.weaponRarity ? <span className="text-[20px] leading-none">{r.day===1?'🎰': r.weaponRarity==='LEGENDARIS'?'👑': r.weaponRarity==='EPIC'?'💜':'🃏'}</span> : <span className="text-[18px]">🎁</span>}
                  </div>
                  <div className="mt-1 text-[10px] font-black leading-tight text-white">{r.weaponRarity ? `+${rarityLabel(r.weaponRarity, language)}` : ''}</div>
                  <div className="mt-0.5 flex items-center justify-center gap-1 text-[9px] font-bold text-amber-200"><CoinSprite size={10}/>{r.coins} <span className="mx-0.5 text-white/20">·</span> <DiamondSprite size={10}/>{r.diamonds}</div>
                  {r.day===1 && <div className="mt-1 rounded bg-fuchsia-500/20 px-1 py-0.5 text-[7px] font-black tracking-widest text-fuchsia-200">GACHA EPIC/RARE</div>}
                  {r.day===7 && <div className="mt-1 rounded bg-amber-400/20 px-1 py-0.5 text-[7px] font-black tracking-widest text-amber-200">LEGEND JACKPOT</div>}
                </div>
              )
            })}
          </div>

          {/* Streak info */}
          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2">
            <div className="flex-1">
              <div className="text-[10px] font-black tracking-widest text-white/50">{tr(language, 'STREAK KAMU')}</div>
              <div className="text-[13px] font-black text-white">{state.streak===0 ? tr(language, 'BELUM MULAI') : `${tr(language, 'HARI')} ${state.streak}`} <span className="font-normal text-white/50">· {tr(language, 'Total klaim')} {state.totalClaims}×</span></div>
            </div>
            <div className="text-right">
              <div className="text-[9px] font-bold text-white/40">{tr(language, 'HARI INI')}</div>
              <div className={`text-[12px] font-black ${canClaim ? 'text-emerald-300' : 'text-white/30'}`}>{canClaim ? tr(language, 'BISA KLAIM!') : tr(language, 'SUDAH KLAIM')}</div>
            </div>
          </div>

          {/* Preview next reward */}
          <div className="rounded-xl border border-amber-300/20 bg-gradient-to-r from-amber-500/10 to-orange-500/10 p-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[10px] font-black tracking-widest text-amber-200/80">{tr(language, 'HADIAH HARI INI · ')}{tr(language, next.label)}</div>
                <div className="mt-1 flex items-center gap-2 text-[11px] font-black text-white">
                  <span className="flex items-center gap-1 rounded-full bg-black/30 px-2 py-1 border border-white/10"><CoinSprite size={13}/>{next.coins} {language === 'en' ? 'coins' : 'coin'}</span>
                  <span className="flex items-center gap-1 rounded-full bg-black/30 px-2 py-1 border border-white/10"><DiamondSprite size={13}/>{next.diamonds} {language === 'en' ? 'diamonds' : 'diamond'}</span>
                </div>
                {next.weaponRarity && <div className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-fuchsia-500/20 border border-fuchsia-300/30 px-2 py-1 text-[10px] font-black text-fuchsia-100">🎰 GACHA: 1× {rarityLabel(next.weaponRarity, language)} RANDOM</div>}
              </div>
              <div className="text-[32px] animate-bounce">{next.day===7?'👑': next.weaponRarity?'🎰':'🎁'}</div>
            </div>
          </div>

          {/* Result after claim */}
          {result && (
            <div className="rounded-xl border-2 border-emerald-300/50 bg-emerald-500/15 p-3 text-center animate-[pop_0.4s_ease]">
              <div className="text-[11px] font-black tracking-widest text-emerald-200">{tr(language, 'BERHASIL DIKLAIM — HARI ')}{result.day}</div>
              <div className="mt-1 flex items-center justify-center gap-3 text-[13px] font-black text-white">
                <span className="flex items-center gap-1"><CoinSprite size={16}/>+{result.coins}</span>
                <span className="flex items-center gap-1"><DiamondSprite size={16}/>+{result.diamonds}</span>
              </div>
              {result.weaponId && (
                <div className="mt-2 rounded-xl border border-fuchsia-300/30 bg-fuchsia-500/10 p-2 flex items-center gap-2">
                  <GachaGun id={result.weaponId as any} size={48}/>
                  <div className="text-left flex-1">
                    <div className="text-[10px] font-black tracking-widest text-fuchsia-200">{tr(language, 'GACHA DAPAT!')}</div>
                    <div className="text-[13px] font-black text-white">{tr(language, getWeapon(result.weaponId).name)}</div>
                    <div className="text-[10px] font-bold text-white/60">{rarityLabel(getWeapon(result.weaponId).rarity, language)} · {tr(language, getWeapon(result.weaponId).perk)}</div>
                  </div>
                  <span className="text-[18px]">✨</span>
                </div>
              )}
            </div>
          )}

          <div className="rounded-xl bg-black/20 border border-white/5 p-2.5 text-[10px] leading-snug text-white/60">
            <span className="font-black text-white/80">{tr(language, 'Tips betah 3 hari:')}</span> {tr(language, 'Login tiap hari streak naik, hari 1 langsung dapat gacha Epic/Rare — cocok buat pemula langsung jago. Jangan putus streak, hari 7 dapat Legend jackpot!')}
          </div>
        </div>

        <footer className="p-3 border-t border-white/10 bg-black/20 shrink-0">
          <button
            onClick={handleClaim}
            disabled={!canClaim || spinning}
            className={`w-full rounded-xl py-3 text-[14px] font-black tracking-wide transition ${canClaim ? 'bg-gradient-to-b from-amber-300 to-orange-500 text-[#3a1d00] shadow-[0_4px_0_#7c2d12] active:translate-y-0.5 active:shadow-none' : 'bg-white/10 text-white/30 cursor-not-allowed'} ${spinning ? 'animate-pulse' : ''}`}
          >
            {spinning ? tr(language, 'GACHA SPIN...') : canClaim ? `${tr(language, 'KLAIM HARI ')}${next.day} — ${next.coins} + ${next.diamonds} ${next.weaponRarity ? '+ GACHA' : ''}` : tr(language, 'SUDAH KLAIM HARI INI — KEMBALI BESOK')}
          </button>
          <div className="mt-1.5 text-center text-[9px] font-bold tracking-widest text-white/30">{tr(language, 'RESET JAM 00:00 · STREAK HILANG JIKA SKIP 2 HARI')}</div>
        </footer>
      </div>

      {/* Gacha overlay - full screen spin */}
      {showGacha && result?.weaponId && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#05070d]/92 p-4">
          <div className="text-[12px] font-black tracking-[0.2em] text-fuchsia-200 animate-pulse">🎰 GACHA RESULT 🎰</div>
          <div className="mt-4 rounded-2xl border-2 border-fuchsia-300/50 bg-gradient-to-b from-fuchsia-600/30 to-purple-900/50 p-4 shadow-[0_0_40px_rgba(232,121,249,.5)]">
            <GachaGun id={result.weaponId as any} size={120}/>
          </div>
          <h3 className="mt-4 text-[20px] font-black text-white text-center">{tr(language, getWeapon(result.weaponId as any).name).toUpperCase()}</h3>
          <p className="text-[11px] font-bold text-white/60">{rarityLabel(getWeapon(result.weaponId as any).rarity, language)} · {tr(language, getWeapon(result.weaponId as any).desc)}</p>
          <button onClick={()=>setShowGacha(false)} className="mt-5 rounded-xl bg-white px-6 py-2.5 text-[13px] font-black text-[#0d1020]">{tr(language, 'LANJUTKAN 🚀')}</button>
        </div>
      )}

      <style>{`@keyframes pop{0%{transform:scale(0.9);opacity:0}100%{transform:scale(1);opacity:1}}`}</style>
    </div>
  )
}
