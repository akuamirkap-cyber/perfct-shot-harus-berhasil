import { drawGlow } from './glowSprite';

/** Hand centers in the gun's local coordinates at the instant a throw starts. */
export const GHOST_HAND_X = 47;
export const GHOST_HAND_Y = 82;
export type GhostHand = -1 | 1;

/** An expressive ghost, with no barrel, nozzle or muzzle on either skin. */
export function drawGhostSpiritGun(
  c: CanvasRenderingContext2D, cx: number, y0: number, time: number,
  sinceShot: number, side: GhostHand, alternateSkin: boolean,
) {
  const bob = Math.sin(time * 2.2) * 2;
  // Throw/push curve: the firing palm snaps up toward the target the instant the
  // shot leaves it (peak at 0.05 s), holds, then eases back. The old curve peaked
  // at 0.2 s, so the arm looked like it waved *after* the shot.
  const ft = Number.isFinite(sinceShot) ? sinceShot : 9;
  const easeOut = (k: number) => 1 - Math.pow(1 - k, 3);
  const easeInOut = (k: number) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
  const thrust = ft < 0 || ft >= 0.42 ? 0
    : ft < 0.05 ? easeOut(ft / 0.05) * 1.06
    : ft < 0.11 ? 1.06 - (ft - 0.05) * 1
    : Math.max(0, 1 - easeInOut((ft - 0.11) / 0.31));
  const swing = thrust;
  const bodyY = y0 + bob - thrust * 2;
  const skin = alternateSkin ? '#b9faf5' : '#c9e9ff';
  const wisp = alternateSkin ? '#8effed' : '#9fd8ff';
  c.save();
  drawGlow(c, cx, bodyY + 90, 125, alternateSkin ? '#8effed' : '#94caff', 0.23 + thrust * 0.12);

  for (const hand of [-1, 1] as const) {
    const firing = hand === side;
    const k = firing ? thrust : 0;
    const brace = firing ? 0 : thrust; // the other arm pulls in a little for balance
    // rest palm = the projectile spawn point (GHOST_HAND_X / GHOST_HAND_Y)
    const restX = cx + hand * GHOST_HAND_X;
    const restY = bodyY + GHOST_HAND_Y + Math.sin(time * 2.8 + hand) * 1.2;
    const hx = restX + hand * (-14 * k - 6 * brace);
    const hy = restY - 66 * k + 6 * brace;
    const sx = cx + hand * 28, sy = bodyY + 84;
    // elbow bows outward while the arm is extended
    const ex = (sx + hx) / 2 + hand * (14 + 10 * k);
    const ey = (sy + hy) / 2 + 8 - 6 * k;
    c.lineCap = 'round';
    c.strokeStyle = skin; c.lineWidth = 15;
    c.beginPath(); c.moveTo(sx, sy); c.quadraticCurveTo(ex, ey, hx, hy); c.stroke();
    c.strokeStyle = 'rgba(255,255,255,0.86)'; c.lineWidth = 8;
    c.beginPath(); c.moveTo(sx + hand, sy - 2); c.quadraticCurveTo(ex - hand * 2, ey - 2, hx, hy); c.stroke();

    // mitten hand: palm, thumb, fingers open while pushing
    const tilt = hand * (0.3 - 0.75 * k);
    c.save();
    c.translate(hx, hy);
    c.rotate(tilt);
    c.fillStyle = '#f5ffff';
    c.strokeStyle = alternateSkin ? 'rgba(92,233,222,0.8)' : 'rgba(115,191,240,0.8)';
    c.lineWidth = 1.4;
    c.beginPath(); c.ellipse(0, 0, 9.5, 10.5, 0, 0, Math.PI * 2); c.fill(); c.stroke();
    c.beginPath(); c.ellipse(-hand * 8, 3, 4, 5.5, -hand * 0.6, 0, Math.PI * 2); c.fill(); c.stroke();
    if (k > 0.15) {
      for (const fx of [-5, 0, 5]) {
        c.beginPath(); c.ellipse(fx, -9 - k * 2, 3, 5 + k * 1.5, 0, 0, Math.PI * 2); c.fill(); c.stroke();
      }
    }
    c.restore();

    // spirit wisp held in each palm; the firing palm's wisp is thrown and regrows
    const regrow = firing && ft >= 0 && ft < 0.45 ? Math.max(0, (ft - 0.15) / 0.3) : 1;
    if (regrow > 0.02) {
      const wy = hy - 12 - Math.sin(time * 5 + hand) * 1.5;
      drawGlow(c, hx, wy, 18 * regrow, wisp, 0.55 * regrow);
      c.fillStyle = `rgba(240,255,255,${0.9 * regrow})`;
      c.beginPath(); c.arc(hx, wy, 3.6 * regrow, 0, Math.PI * 2); c.fill();
    }
    // push shockwave right at the release point
    if (firing && ft >= 0 && ft < 0.16) {
      const p = ft / 0.16;
      c.strokeStyle = `rgba(230,255,255,${0.75 * (1 - p)})`;
      c.lineWidth = 3 * (1 - p) + 0.5;
      c.beginPath(); c.ellipse(restX, restY - 8 - p * 18, 8 + p * 22, 4 + p * 9, 0, 0, Math.PI * 2); c.stroke();
      drawGlow(c, hx, hy - 6, 34, '#efffff', 0.55 * (1 - p));
    }
  }

  // Soft spectral sheet and three independently moving points, rather than a
  // pistol handle: its full silhouette stays visible at the bottom of the game.
  c.beginPath();
  c.moveTo(cx - 35, bodyY + 71);
  c.bezierCurveTo(cx - 35, bodyY + 6, cx + 35, bodyY + 6, cx + 35, bodyY + 71);
  c.lineTo(cx + 35, bodyY + 132);
  for (let i = 0; i < 4; i++) {
    const x0 = cx + 35 - i * 17.5, x1 = x0 - 17.5;
    const wave = Math.sin(time * 3.5 + i * 1.6) * 3;
    c.quadraticCurveTo((x0 + x1) / 2, bodyY + 147 + (i % 2 ? -5 : 8) + wave, x1, bodyY + 132);
  }
  c.closePath();
  const body = c.createRadialGradient(cx - 14, bodyY + 36, 3, cx, bodyY + 85, 83);
  body.addColorStop(0, '#ffffff'); body.addColorStop(0.52, alternateSkin ? '#e8fffb' : '#eef7ff');
  body.addColorStop(1, alternateSkin ? '#8ee3dc' : '#9ec8ec');
  c.fillStyle = body; c.fill();
  c.strokeStyle = alternateSkin ? 'rgba(92,233,222,0.85)' : 'rgba(115,191,240,0.8)';
  c.lineWidth = 1.8; c.stroke();
  if (alternateSkin) {
    // The second skin remains its own cooler, ornamented spirit silhouette.
    c.strokeStyle = 'rgba(117,255,244,0.58)'; c.lineWidth = 1.5;
    c.beginPath(); c.ellipse(cx, bodyY + 25, 22, 4, -0.08, 0, Math.PI * 2); c.stroke();
    for (const hand of [-1, 1] as const) {
      c.fillStyle = 'rgba(178,255,248,0.8)'; c.beginPath();
      c.arc(cx + hand * 27, bodyY + 110, 2.5, 0, Math.PI * 2); c.fill();
    }
  }

  // Curious face, with a little shine in each eye.
  for (const hand of [-1, 1] as const) {
    const squint = 1 - 0.42 * Math.min(1, swing * 1.4);
    c.fillStyle = '#102c3b'; c.beginPath(); c.ellipse(cx + hand * 12, bodyY + 61 + (1 - squint) * 2, 5.5, 8.5 * squint, hand * 0.07, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#fff'; c.beginPath(); c.arc(cx + hand * 12 - 1.5, bodyY + 57 + (1 - squint) * 4, 1.7, 0, Math.PI * 2); c.fill();
    if (swing > 0.2) {
      // determined brows
      c.strokeStyle = `rgba(16,44,59,${Math.min(1, swing)})`; c.lineWidth = 2.4; c.lineCap = 'round';
      c.beginPath(); c.moveTo(cx + hand * 6, bodyY + 49); c.lineTo(cx + hand * 18, bodyY + 46); c.stroke();
    }
  }
  c.fillStyle = '#193346'; c.beginPath();
  c.ellipse(cx, bodyY + 82, 4.7, 6 + swing * 2, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = 'rgba(255,175,205,0.24)';
  for (const hand of [-1, 1] as const) { c.beginPath(); c.ellipse(cx + hand * 21, bodyY + 78, 5, 3, 0, 0, Math.PI * 2); c.fill(); }
  c.restore();
}
