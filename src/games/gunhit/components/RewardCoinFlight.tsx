import { useEffect, useRef, useState } from 'react';
import CoinSprite from '../../shared/CoinSprite';
import DiamondSprite from '../../shared/DiamondSprite';
import { sfx } from '../game/audio';

export interface RewardFlightRequest {
  /** Kenaikan id = sunday baru; efek diputar ulang per id. */
  id: number;
  coins: number;
  diamonds: number;
  /** Hari daily-login yang barusan diklaim — titik lepas koin melayang. */
  day?: number;
  /** Permukaan yang sedang terlihat: quest = dompet modal achievement, menu = dompet HUD menu. */
  scope: 'quest' | 'menu';
}

interface SpriteSpec {
  key: string;
  kind: 'coin' | 'diamond';
  x: number;
  y: number;
  tx: number;
  ty: number;
  delay: number;
}

const DURATION = 780;

/**
 * Koin/diamond hadiah melayang ke dompet UI — pola yang sama dengan halaman
 * game over: sprite lepas dari posisi hadiah, melengkung ke counter dompet di
 * pojok atas, dan counter-nya berdenyut tiap ada yang mendarat.
 */
export default function RewardCoinFlight({ flight, onDone }: { flight: RewardFlightRequest; onDone: () => void }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const spritesRef = useRef<Map<string, HTMLSpanElement>>(new Map());
  const [sprites, setSprites] = useState<SpriteSpec[]>([]);

  // Ukur posisi lepas & sasaran dalam koordinat frame (420×760, tanpa skala).
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const frame = document.querySelector<HTMLElement>('[data-game-frame]') ?? root;
    const rect = frame.getBoundingClientRect();
    const scale = rect.width / Math.max(1, frame.offsetWidth || rect.width);
    const toLocal = (clientX: number, clientY: number) => ({
      x: (clientX - rect.left) / scale,
      y: (clientY - rect.top) / scale,
    });

    const center = { x: (frame.offsetWidth || 420) / 2, y: Math.round(((frame.offsetHeight || 760) * 2) / 3) };
    let start = center;
    if (flight.day) {
      const node = frame.querySelector(`[data-wallet-scope="${flight.scope}"] [data-daily-day="${flight.day}"]`);
      if (node) {
        const r = node.getBoundingClientRect();
        start = toLocal(r.left + r.width / 2, r.top + r.height / 2);
      }
    }

    const specs: SpriteSpec[] = [];
    const push = (kind: 'coin' | 'diamond', amount: number, count: number) => {
      if (!amount || count < 1) return;
      const targetEl = frame.querySelector(`[data-wallet-scope="${flight.scope}"] [data-wallet="${kind}"]`)
        ?? frame.querySelector(`[data-wallet="${kind}"]`); // fallback bila scope sudah tak ada
      const target = targetEl
        ? (() => { const r = targetEl.getBoundingClientRect(); return toLocal(r.left + r.width / 2, r.top + r.height / 2); })()
        : { x: (frame.offsetWidth || 420) - 46, y: 34 };
      for (let i = 0; i < count; i += 1) {
        specs.push({
          key: `${flight.id}-${kind}-${i}`,
          kind,
          x: start.x + (i - (count - 1) / 2) * 16,
          y: start.y + (i % 2 ? -8 : 8),
          tx: target.x,
          ty: target.y,
          delay: i * 95 + (kind === 'diamond' ? 220 : 0),
        });
      }
    };

    push('coin', flight.coins, Math.max(3, Math.min(8, Math.round(flight.coins / 60))));
    push('diamond', flight.diamonds, Math.max(2, Math.min(5, Math.round(flight.diamonds / 15))));
    if (!specs.length) { onDone(); return; }
    setSprites(specs);
  }, [flight.id]);

  // Putar animasi WAAPI begitu sprite termount; pendaratan = denyut + sfx.
  useEffect(() => {
    if (!sprites.length) return undefined;
    const animations: Animation[] = [];
    let landed = 0;
    const finish = () => {
      landed += 1;
      if (landed >= sprites.length) onDone();
    };
    sprites.forEach((spec, seq) => {
      const el = spritesRef.current.get(spec.key);
      if (!el) { finish(); return; }
      const frame = document.querySelector<HTMLElement>('[data-game-frame]');
      const targetEl = frame?.querySelector(`[data-wallet-scope="${flight.scope}"] [data-wallet="${spec.kind}"]`)
        ?? frame?.querySelector(`[data-wallet="${spec.kind}"]`);
      const midX = spec.x + (spec.tx - spec.x) * 0.5;
      const midY = Math.min(spec.y, spec.ty) - 64;
      const anim = el.animate(
        [
          { transform: `translate(${spec.x - 13}px, ${spec.y - 13}px) scale(1.1) rotate(0deg)`, opacity: 1 },
          { transform: `translate(${midX - 13}px, ${midY - 13}px) scale(1.15) rotate(170deg)`, opacity: 1, offset: 0.45 },
          { transform: `translate(${spec.tx - 13}px, ${spec.ty - 13}px) scale(0.32) rotate(480deg)`, opacity: 0.85 },
        ],
        { duration: DURATION, delay: spec.delay, easing: 'cubic-bezier(.45,.05,.55,1)', fill: 'forwards' },
      );
      anim.onfinish = () => {
        el.style.opacity = '0';
        if (spec.kind === 'coin') sfx.coin();
        // Denyut counter seperti di halaman game over.
        targetEl?.animate(
          [{ transform: 'scale(1)' }, { transform: 'scale(1.28)' }, { transform: 'scale(1)' }],
          { duration: 210, easing: 'ease-out' },
        );
        finish();
      };
      animations.push(anim);
      void seq;
    });
    const guard = window.setTimeout(onDone, DURATION + Math.max(...sprites.map((s) => s.delay)) + 400);
    return () => {
      window.clearTimeout(guard);
      animations.forEach((a) => a.cancel());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sprites]);

  return (
    <div ref={rootRef} className="pointer-events-none absolute inset-0 z-[80] overflow-visible" aria-hidden="true">
      {sprites.map((spec) => (
        <span
          key={spec.key}
          ref={(el) => {
            if (el) spritesRef.current.set(spec.key, el);
            else spritesRef.current.delete(spec.key);
          }}
          className="absolute left-0 top-0 opacity-0"
          style={{ transform: `translate(${spec.x - 13}px, ${spec.y - 13}px)` }}
        >
          {spec.kind === 'coin' ? <CoinSprite size={26} /> : <DiamondSprite size={24} />}
        </span>
      ))}
    </div>
  );
}
