import { WEAPONS, type WeaponId, type Rarity } from './game/weapons';
import { storage } from './game/safeStorage';

export interface DailyReward {
  day: number; // 1-7
  label: string;
  coins: number;
  diamonds: number;
  weaponRarity?: Rarity; // if set, gacha weapon of this rarity (or EPIC|LANGKA for day1)
  weaponCount?: number;
  bonusText?: string;
}

export const DAILY_REWARDS: DailyReward[] = [
  // Kotak warna: HIJAU=UMUM, UNGU=RARE/LANGKA, MERAH=EPIC, KUNING=LEGEND
  // Tidak tiap hari dapat senjata — biar ada kejutan, sesuai request
  { day: 1, label: 'HARI 1 · GACHA', coins: 300, diamonds: 30, weaponRarity: 'EPIC', weaponCount: 1, bonusText: 'GACHA EPIC/RARE' }, // ungu/merah random
  { day: 2, label: 'HARI 2', coins: 180, diamonds: 15 },
  { day: 3, label: 'HARI 3', coins: 250, diamonds: 20, weaponRarity: 'UMUM', weaponCount: 1, bonusText: 'HIJAU UMUM' }, // hijau
  { day: 4, label: 'HARI 4', coins: 320, diamonds: 24 },
  { day: 5, label: 'HARI 5 · EPIC', coins: 420, diamonds: 32, weaponRarity: 'EPIC', weaponCount: 1, bonusText: 'MERAH EPIC' }, // merah
  { day: 6, label: 'HARI 6', coins: 500, diamonds: 38 },
  { day: 7, label: 'HARI 7 · LEGEND', coins: 850, diamonds: 60, weaponRarity: 'LEGENDARIS', weaponCount: 1, bonusText: 'KUNING LEGEND' }, // kuning
];

export interface DailyState {
  streak: number; // current streak 0-7 (0 = not started, 7 = max, wraps to 1 after completion)
  lastClaimDate: string | null; // YYYY-MM-DD
  claimedDays: number[]; // days claimed in current cycle (1..7)
  totalClaims: number;
}

const STORAGE_KEY = 'gunhit_daily_state';

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function daysDiff(a: string, b: string): number {
  const da = new Date(a + 'T00:00:00');
  const db = new Date(b + 'T00:00:00');
  return Math.round((db.getTime() - da.getTime()) / 86400000);
}

export function loadDailyState(): DailyState {
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (raw) {
      const p = JSON.parse(raw);
      if (typeof p.streak === 'number' && typeof p.lastClaimDate === 'string' || p.lastClaimDate === null) {
        return { streak: Math.max(0, Math.min(7, p.streak||0)), lastClaimDate: p.lastClaimDate||null, claimedDays: Array.isArray(p.claimedDays)?p.claimedDays:[], totalClaims: p.totalClaims||0 };
      }
    }
  } catch {}
  return { streak: 0, lastClaimDate: null, claimedDays: [], totalClaims: 0 };
}

export function saveDailyState(s: DailyState) {
  try { storage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch {}
}

export function getNextReward(streak: number): DailyReward {
  // streak 0 => day1, streak 1 => day2 etc, after 7 wraps to 1
  const day = streak === 0 ? 1 : streak >= 7 ? 1 : streak + 1;
  return DAILY_REWARDS.find(r=>r.day===day) || DAILY_REWARDS[0];
}

export function canClaimToday(state: DailyState): boolean {
  const today = todayStr();
  if (!state.lastClaimDate) return true; // first time
  if (state.lastClaimDate === today) return false; // already claimed today
  const diff = daysDiff(state.lastClaimDate, today);
  // if missed >1 day, streak resets but still can claim
  return diff >= 1;
}

export function claimDailyReward(state: DailyState, ownedIds: string[]): { newState: DailyState; reward: DailyReward; weaponId?: WeaponId } {
  const today = todayStr();
  let newStreak = state.streak;
  if (!state.lastClaimDate) newStreak = 1;
  else {
    const diff = daysDiff(state.lastClaimDate, today);
    if (diff === 1) newStreak = Math.min(7, state.streak + 1);
    else if (diff > 1) newStreak = 1; // reset after miss
    else newStreak = state.streak; // same day (should not happen)
    if (newStreak > 7) newStreak = 1;
  }
  const reward = DAILY_REWARDS.find(r=>r.day===newStreak) || DAILY_REWARDS[0];
  let weaponId: WeaponId | undefined;
  if (reward.weaponRarity) {
    // Gacha: pick random from that rarity (or EPIC|LANGKA for day1 special)
    const poolRarity: Rarity[] = reward.day === 1 ? ['EPIC','LANGKA'] : [reward.weaponRarity!];
    const pool = WEAPONS.filter(w=> poolRarity.includes(w.rarity) && !ownedIds.includes(w.id));
    const source = pool.length ? pool : WEAPONS.filter(w=> poolRarity.includes(w.rarity));
    if (source.length) weaponId = source[Math.floor(Math.random()*source.length)].id as WeaponId;
  }
  const newState: DailyState = {
    streak: newStreak,
    lastClaimDate: today,
    claimedDays: [...new Set([...state.claimedDays, newStreak])],
    totalClaims: state.totalClaims + 1,
  };
  saveDailyState(newState);
  return { newState, reward, weaponId };
}

export function getStreakProgress(state: DailyState): { streak: number; canClaim: boolean; next: DailyReward } {
  return { streak: state.streak, canClaim: canClaimToday(state), next: getNextReward(state.streak) };
}
