import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import Background from "./Background";
import GameOver, { type RunData, type Version } from "./GameOver";
import AdPlayer from "./AdPlayer";
import RewardPopup, { type PopupItem } from "./RewardPopup";
import RewardPage, { type RewardResult } from "./RewardPage";
import { ALL_WEAPONS, type WeaponId } from "./Weapons";
import { Coin, Diamond } from "./Icons";
import { AdsBlockedContext, RetryCostContext } from "./FancyButtons";
import { sfx, unlockAudio } from "../audio/sfx";
import { adsHasAdblock, adsRewardedBreak } from "../ads";
import { setMuted } from "../games/gunhit/game/audio";
import { storage } from "../games/gunhit/game/safeStorage";

const W = 440;
const H = 860;
const IRIS_MS = 520;
const AD_DIAMONDS = 3;
const REVIVE_COST = 12;
const RETRY_COST = 5;
const VERSIONS: Version[] = ["v1", "v2", "v3", "v4", "v5", "v6"];

/** data handed over by the real game when the player misses */
export type LayerRun = {
  id: number;
  stage: number;
  score: number;
  hits: number;
  total: number;
  coinsCollected: number;
  prevBest: number;
  /** exact coin payout (e.g. coins collected but not banked yet); defaults to a hit/coin based formula */
  reward?: number;
  /** diamond payout; defaults to 1 + hits/2 */
  gems?: number;
  /** opened with the M shortcut: play the miss/impact intro, don't touch the real best score */
  demo?: boolean;
};

type Kind = "coin" | "diamond";
type Flyer = { id: number; kind: Kind; x: number; y: number; tx: number; ty: number; jx: number; jy: number; delay: number; value: number; seq: number };
type AdReq = { label: string; done: () => void };
type Popup = { items: PopupItem[]; title: string };
type Iris = { mode: "closing" | "opening"; after?: () => void } | null;

type Props = {
  run: LayerRun;
  coins: number;
  diamonds: number;
  sound: boolean;
  onAdd: (kind: Kind, amount: number) => void;
  onBest: (best: number) => void;
  onToggleSound: () => void;
  /** called while the screen is fully covered by the iris */
  onRetry: () => void;
  onHome: () => void;
  /** overlay finished its exit transition → unmount it */
  onGone: () => void;
  /** Senjata Gun Hit yang sedang dipakai saat run berakhir. */
  equippedWeapon?: string | null;
};

/* ---------- small persistence helpers ---------- */
function load<T>(key: string, fallback: T, ok: (v: unknown) => v is T): T {
  try {
    const v = JSON.parse(storage.getItem(key) || "null");
    return ok(v) ? v : fallback;
  } catch {
    return fallback;
  }
}
function store(key: string, v: unknown) {
  try {
    storage.setItem(key, JSON.stringify(v));
  } catch {
    /* private mode */
  }
}
const isVersion = (v: unknown): v is Version => VERSIONS.includes(v as Version);
const isWeapon = (v: unknown): v is WeaponId => ALL_WEAPONS.includes(v as WeaponId);
const isOwned = (v: unknown): v is WeaponId[] => Array.isArray(v) && v.every(isWeapon);

/* ---------- full-layer iris (covers letterbox too) ---------- */
function IrisFx({ mode, onDone }: { mode: "closing" | "opening"; onDone: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const done = useRef(onDone);
  done.current = onDone;
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const max = Math.hypot(r.width, r.height) / 2 + 24;
    const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    const t0 = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const k = Math.min(1, (now - t0) / IRIS_MS);
      const e = ease(k);
      el.style.setProperty("--r", `${mode === "closing" ? max * (1 - e) : max * e}px`);
      if (k < 1) raf = requestAnimationFrame(tick);
      else done.current();
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [mode]);
  return (
    <div
      ref={ref}
      className="pointer-events-auto absolute inset-0 z-[95]"
      style={{
        ["--r" as string]: mode === "closing" ? "200vmax" : "0px",
        background: "radial-gradient(circle at 50% 48%, transparent var(--r), #050c0f calc(var(--r) + 1.5px))",
      }}
    >
      {mode === "closing" && (
        <div className="absolute left-1/2 top-[48%] -translate-x-1/2 -translate-y-1/2" style={{ animation: `cross-in ${IRIS_MS}ms ease-out both` }}>
          <svg width="120" height="120" viewBox="0 0 120 120" fill="none" stroke="#ff4d3a" strokeWidth="4" strokeLinecap="round" opacity="0.9">
            <circle cx="60" cy="60" r="40" />
            <circle cx="60" cy="60" r="4" fill="#ff4d3a" />
            <path d="M60 8v24M60 88v24M8 60h24M88 60h24" />
          </svg>
        </div>
      )}
    </div>
  );
}

function SpeakerIcon({ muted }: { muted: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill="currentColor" />
      {muted ? (
        <path d="M16 9.5l5 5M21 9.5l-5 5" />
      ) : (
        <>
          <path d="M15.5 9a4 4 0 0 1 0 6" />
          <path d="M18.5 6.5a7.5 7.5 0 0 1 0 11" />
        </>
      )}
    </svg>
  );
}

/**
 * Game-over experience layered on top of the real Perfect Shot game:
 * results (V1–V6), x2 reward ad, boss gift (R1) with weapon collection, coin/diamond fly-in.
 */
export default function GameOverLayer(p: Props) {
  const boxRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const shakeRef = useRef<HTMLDivElement>(null);
  const coinRef = useRef<HTMLDivElement>(null);
  const diaRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const scaleRef = useRef(1);

  // Produk mengunci layout hasil di V5 (tanpa showcase senjata besar).
            const [version, setVersion] = useState<Version>("v5");
  const [owned, setOwned] = useState<WeaponId[]>(() => load("ps-owned", ["revolver"], isOwned));
  const [gun, setGun] = useState<WeaponId>(() => load("ps-gun", "revolver", isWeapon));
  const [gift, setGift] = useState<"new" | "opened">("new");
  const [doubleUsed, setDoubleUsed] = useState(false);
  const [adDiamondsLeft, setAdDiamondsLeft] = useState(3);
  const [replay, setReplay] = useState(0);
  const [showReward, setShowReward] = useState(false);
  const [flyers, setFlyers] = useState<Flyer[]>([]);
  const flyId = useRef(0);
  const [ad, setAd] = useState<AdReq | null>(null);
  /** sedang menunggu/menonton rewarded video portal asli (overlay milik portal). */
  const [adBusy, setAdBusy] = useState(false);
  /** Portal melaporkan pemain pakai adblock → tombol iklan disembunyikan. */
  const [adsBlocked, setAdsBlocked] = useState(false);
  useEffect(() => {
    let alive = true;
    void adsHasAdblock().then((blocked) => { if (alive) setAdsBlocked(blocked); });
    return () => { alive = false; };
  }, []);
  const [popup, setPopup] = useState<Popup | null>(null);
  const [iris, setIris] = useState<Iris>(null);
  const [exiting, setExiting] = useState(false);
  const [coinBump, setCoinBump] = useState(0);
  const [diaBump, setDiaBump] = useState(0);
  const [diaDelta, setDiaDelta] = useState<{ id: number; v: number } | null>(null);

  useEffect(() => store("ps-go-version", version), [version]);
  useEffect(() => store("ps-owned", owned), [owned]);
  useEffect(() => store("ps-gun", gun), [gun]);

  // fit the 440×860 stage into whatever space the game shell gives us
  useLayoutEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const fit = () => {
      // Layout size (unaffected by ancestor CSS transforms). The game already
      // scales its whole frame with a transform; measuring the *visual* rect here
      // applied that scale a second time and pushed the screen past the edges.
      const r = { width: el.clientWidth, height: el.clientHeight };
      if (!r.width || !r.height) return;
      const s = Math.min(r.width / W, r.height / H);
      scaleRef.current = s;
      setScale(s);
    };
    fit();
    const ro = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(fit);
    ro?.observe(el);
    window.addEventListener("resize", fit);
    return () => {
      ro?.disconnect();
      window.removeEventListener("resize", fit);
    };
  }, []);

  /* ---------- game run → result data ---------- */
  const run: RunData = {
    id: p.run.id,
    score: p.run.score,
    hits: p.run.hits,
    reward: p.run.reward ?? 10 + p.run.hits * 5 + p.run.coinsCollected * 10,
    gems: p.run.gems ?? 1 + Math.floor(p.run.hits / 2),
    prevBest: p.run.prevBest,
    canRevive: false,
  };

  /* ---------- fx helpers ---------- */
  const shake = useCallback((power: number) => {
    const el = shakeRef.current;
    if (!el) return;
    const k = (n: number) => `translate(${(Math.random() - 0.5) * power * n}px, ${(Math.random() - 0.5) * power * n}px) rotate(${(Math.random() - 0.5) * n * 1.4}deg)`;
    el.animate([{ transform: "none" }, { transform: k(1) }, { transform: k(0.75) }, { transform: k(0.5) }, { transform: k(0.3) }, { transform: k(0.12) }, { transform: "none" }], {
      duration: 460,
      easing: "ease-out",
    });
  }, []);

  const onAddRef = useRef(p.onAdd);
  onAddRef.current = p.onAdd;
  const addCurrency = useCallback((kind: Kind, v: number) => {
    if (v <= 0) return;
    onAddRef.current(kind, v);
    if (kind === "coin") setCoinBump((b) => b + 1);
    else setDiaBump((b) => b + 1);
  }, []);

  const fly = useCallback(
    (kind: Kind, el: HTMLElement | null, amount: number) => {
      const stage = stageRef.current?.getBoundingClientRect();
      const src = el?.getBoundingClientRect();
      const dst = (kind === "coin" ? coinRef : diaRef).current?.getBoundingClientRect();
      if (!stage || !src || !dst || amount <= 0) {
        addCurrency(kind, amount);
        return;
      }
      // on-screen px per stage px (includes the game frame's own scale)
      const s = stage.width / W || scaleRef.current;
      const x = (src.left + src.width / 2 - stage.left) / s;
      const y = (src.top + src.height / 2 - stage.top) / s;
      const tx = (dst.left + dst.width / 2 - stage.left) / s - x;
      const ty = (dst.top + dst.height / 2 - stage.top) / s - y;
      const count = Math.min(kind === "coin" ? 10 : 6, amount);
      const base = Math.floor(amount / count);
      const rest = amount - base * count;
      const list: Flyer[] = Array.from({ length: count }).map((_, i) => {
        const a = (i / count) * Math.PI * 2;
        return {
          id: ++flyId.current,
          kind,
          x,
          y,
          tx,
          ty,
          jx: Math.cos(a) * (36 + (i % 3) * 10),
          jy: Math.sin(a) * (30 + (i % 2) * 10) - 10,
          delay: i * 65,
          seq: i,
          value: base + (i === count - 1 ? rest : 0),
        };
      });
      setFlyers((f) => [...f, ...list]);
    },
    [addCurrency],
  );

  // the results screen pays the run reward once – replays (version switch) only animate
  const paid = useRef({ coin: false, diamond: false });
  const payRun = useCallback(
    (kind: Kind, el: HTMLElement | null, amount: number) => {
      if (paid.current[kind]) return;
      paid.current[kind] = true;
      fly(kind, el, amount);
    },
    [fly],
  );

  /* ---------- transitions ---------- */
  const go = (fn: () => void) => {
    if (iris) return;
    setIris({ mode: "closing", after: fn });
    sfx.irisClose();
  };
  const onIrisDone = () => {
    if (!iris) return;
    if (iris.mode === "closing") {
      iris.after?.();
      setTimeout(() => {
        setIris({ mode: "opening" });
        sfx.irisOpen();
      }, 120);
    } else {
      setIris(null);
      if (exiting) p.onGone();
    }
  };
  const exitTo = (action: () => void) =>
    go(() => {
      action();
      setExiting(true);
    });

  const watchAd = (label: string, done: () => void) => {
    if (adBusy) return;
    const size = label === "x2 REWARD" || label === "BOSS GIFT" ? "large" : "medium";
    setAdBusy(true);
    void adsRewardedBreak(label, size, { onAdStart: () => setMuted(true) }).then((outcome) => {
      setMuted(false);
      setAdBusy(false);
      if (outcome === "shown") { done(); return; }            // iklan tuntas → hadiah
      if (outcome === "unavailable") setAd({ label: `${label} · DEV`, done }); // sandbox/dev: simulasi internal
      // 'denied': pemain menutup iklan sebelum selesai → tanpa hadiah, tanpa fallback.
    });
  };

  /** RETRY = pay 5 diamonds; if the player can't afford it, a short ad does the job */
  const retry = () => {
    if (iris || exiting) return;
    if (p.diamonds >= RETRY_COST) {
      p.onAdd("diamond", -RETRY_COST);
      setDiaBump((b) => b + 1);
      setDiaDelta({ id: Date.now(), v: -RETRY_COST });
      sfx.spend();
      setTimeout(() => exitTo(p.onRetry), 380);
    } else watchAd("RETRY STAGE", () => exitTo(p.onRetry));
  };

  /* ---------- render ---------- */
  return (
    <div
      ref={boxRef}
      data-gameover-layer
      className="absolute inset-0 z-[40] overflow-hidden"
      style={{ background: exiting ? "transparent" : "#060e11", animation: "fx-fade-in .35s ease both" }}
      onPointerDownCapture={(e) => {
        unlockAudio();
        const b = (e.target as HTMLElement).closest("button");
        if (!b || b.dataset.sfx === "none") return;
        if (b.disabled) sfx.error();
        else sfx.click();
      }}
    >
      {/* forest backdrop fills the whole frame (the 440x860 content stage is
          letterboxed inside it on taller/wider screens) */}
      {!exiting && <Background danger />}
      {!exiting && (
        <RetryCostContext.Provider value={{ cost: RETRY_COST, diamonds: p.diamonds }}>
        <AdsBlockedContext.Provider value={adsBlocked}>
        <div
          ref={stageRef}
          className="absolute left-1/2 top-1/2 overflow-hidden"
          style={{ width: W, height: H, marginLeft: -W / 2, marginTop: -H / 2, transform: `scale(${scale})` }}
        >
          <div ref={shakeRef} className="absolute inset-0">
            <GameOver
              key={`${run.id}-${replay}`}
              skipImpact={!p.run.demo}
              version={version}
              stage={p.run.stage}
              run={run}
              totalTargets={p.run.total}
              diamonds={p.diamonds}
              reviveCost={REVIVE_COST}
              adDiamonds={AD_DIAMONDS}
              adDiamondsLeft={adDiamondsLeft}
              paused={!!ad || adBusy || !!popup || flyers.length > 0 || showReward}
              doubleUsed={doubleUsed}
              onShake={shake}
              onFly={payRun}
              onBest={(b) => { if (!p.run.demo) p.onBest(b); }}
              onReviveDiamond={() => false}
              onReviveAd={(done) => watchAd("FREE REVIVE", done)}
              onAdDiamonds={() => {
                if (adDiamondsLeft <= 0) return;
                watchAd(`+${AD_DIAMONDS} DIAMONDS`, () => {
                  setAdDiamondsLeft((n) => n - 1);
                  setPopup({ items: [{ kind: "diamond", amount: AD_DIAMONDS }], title: "FREE DIAMONDS!" });
                });
              }}
              onDouble={() =>
                watchAd("x2 REWARD", () => {
                  setDoubleUsed(true);
                  setPopup({
                    items: [
                      { kind: "coin", amount: run.reward },
                      { kind: "diamond", amount: run.gems },
                    ],
                    title: "x2 REWARD!",
                  });
                })
              }
              onRetry={retry}
              onHome={() => exitTo(p.onHome)}
              gift={gift}
              gun={gun}
              equippedGun={p.equippedWeapon}
              onGift={() => watchAd("BOSS GIFT", () => go(() => setShowReward(true)))}
              onRevived={() => exitTo(p.onRetry)}
            />
          </div>

          {/* ---------- R1 boss gift ---------- */}
          {showReward && (
            <RewardPage
              owned={owned}
              onFly={fly}
              onDone={(r: RewardResult) =>
                go(() => {
                  setShowReward(false);
                  setGift("opened");
                  const w = r.weapon;
                  if (w) setOwned((o) => (o.includes(w) ? o : [...o, w]));
                  if (r.action === "equip" && w) setGun(w);
                })
              }
            />
          )}

          {/* ---------- version switch + sound + collection reset ---------- */}
          <div className={`hud-pill absolute bottom-2.5 left-1/2 z-[78] flex -translate-x-1/2 items-center gap-1 rounded-full p-1 ${showReward ? "hidden" : ""}`}>
            {/* Pilihan varian hasil (v1–v6) disembunyikan: layout dikunci V5. */}
            <button
              data-sfx="none"
              aria-label={p.sound ? "Mute" : "Unmute"}
              onClick={() => {
                unlockAudio();
                p.onToggleSound();
                if (!p.sound) setTimeout(sfx.toggle, 30);
              }}
              className="flex h-[30px] w-[30px] items-center justify-center rounded-full text-white/80 transition hover:bg-white/10 active:scale-90"
            >
              <SpeakerIcon muted={!p.sound} />
            </button>
            <button
              data-sfx="none"
              title={`Reset weapon collection (${owned.length}/${ALL_WEAPONS.length})`}
              aria-label="Reset weapon collection"
              onClick={() => {
                sfx.toggle();
                setOwned(["revolver"]);
                setGun("revolver");
                setGift("new");
                setReplay((r) => r + 1);
              }}
              className="flex h-[30px] items-center gap-1 rounded-full px-1.5 font-lilita text-[12px] text-white/70 transition hover:bg-white/10 active:scale-90"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 12a8 8 0 1 0 2.4-5.7" />
                <path d="M4 3.5v5h5" />
              </svg>
              {owned.length}/{ALL_WEAPONS.length}
            </button>
          </div>

          {/* ---------- top bar (real game wallet) ---------- */}
          <div className="hud-pill absolute right-4 top-4 z-[78] flex items-center gap-3 rounded-full py-1.5 pl-4 pr-3">
            <div ref={coinRef} className="flex items-center gap-1.5">
              <span key={coinBump} className={`font-lilita text-[24px] text-[#ffc531] ${coinBump ? "anim-bump" : ""}`} style={{ textShadow: "0 2px 0 #7a4200" }}>
                {p.coins}
              </span>
              <Coin size={24} />
            </div>
            <div className="h-6 w-px bg-white/20" />
            <div ref={diaRef} className="relative flex items-center gap-1.5">
              <Diamond size={26} />
              <span key={diaBump} className={`font-lilita text-[22px] text-white ${diaBump ? "anim-bump" : ""}`} style={{ textShadow: "0 2px 0 rgba(0,0,0,0.4)" }}>
                {p.diamonds}
              </span>
              {diaDelta && (
                <span
                  key={diaDelta.id}
                  className="absolute -bottom-6 right-0 font-lilita text-[18px] text-[#ff6a5a]"
                  style={{ animation: "float-out 1s ease-out both", textShadow: "0 2px 0 rgba(0,0,0,0.5)" }}
                  onAnimationEnd={() => setDiaDelta(null)}
                >
                  {diaDelta.v}
                </span>
              )}
            </div>
          </div>

          {/* ---------- popup / ad ---------- */}
          {popup && (
            <RewardPopup
              key={popup.title + popup.items.map((i) => i.amount).join("-")}
              items={popup.items}
              title={popup.title}
              onClaim={(claims) => claims.forEach((c, i) => setTimeout(() => fly(c.kind, c.el, c.amount), i * 280))}
              onClosed={() => setPopup(null)}
            />
          )}
          {ad && (
            <AdPlayer
              rewardLabel={ad.label}
              onClose={(ok) => {
                const done = ad.done;
                setAd(null);
                if (ok) setTimeout(done, 120);
              }}
            />
          )}

          {/* ---------- flying currency ---------- */}
          {flyers.map((c) => (
            <div
              key={c.id}
              className="pointer-events-none absolute z-[90]"
              style={
                {
                  left: c.x - 13,
                  top: c.y - 13,
                  "--tx": `${c.tx}px`,
                  "--ty": `${c.ty}px`,
                  "--jx": `${c.jx}px`,
                  "--jy": `${c.jy}px`,
                  animation: `fly .9s cubic-bezier(.55,0,.6,1) ${c.delay}ms both`,
                } as React.CSSProperties
              }
              onAnimationEnd={() => {
                addCurrency(c.kind, c.value);
                if (c.kind === "coin") sfx.coin(1 + c.seq * 0.04);
                else sfx.diamond(1 + c.seq * 0.03);
                setFlyers((arr) => arr.filter((x) => x.id !== c.id));
              }}
            >
              {c.kind === "coin" ? <Coin size={26} /> : <Diamond size={26} />}
            </div>
          ))}
        </div>
        </AdsBlockedContext.Provider>
        </RetryCostContext.Provider>
      )}

      {iris && <IrisFx key={iris.mode} mode={iris.mode} onDone={onIrisDone} />}
    </div>
  );
}
