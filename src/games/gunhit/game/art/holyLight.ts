/**
 * HOLY LIGHT GUN — the white light arrow.
 *
 * One shape drives the flying round, the laser flash, the stuck round and the
 * HUD ammo glyph, so what lands on the wheel is exactly what left the barrel.
 * Coordinates follow the game's projectile convention: tip at (0, 0), shaft
 * running down to (0, len). No orbs, halo rings or hard-edged rectangles.
 */
type C = CanvasRenderingContext2D;

const TAU = Math.PI * 2;
const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

/**
 * A feathered oval of light. The radial gradient fades to zero on every edge,
 * so stretching it vertically makes a soft light shaft instead of a cropped
 * `fillRect` with visible square corners.
 */
function softGlow(c: C, x: number, y: number, rx: number, ry: number, alpha: number, rgb = '255,255,255'): void {
  if (rx <= 0 || ry <= 0 || alpha <= 0) return;
  c.save();
  c.globalCompositeOperation = 'lighter';
  c.translate(x, y);
  c.scale(1, ry / rx);
  const g = c.createRadialGradient(0, 0, 0, 0, 0, rx);
  g.addColorStop(0, `rgba(${rgb},${alpha})`);
  g.addColorStop(0.32, `rgba(${rgb},${alpha * 0.6})`);
  g.addColorStop(0.7, `rgba(${rgb},${alpha * 0.18})`);
  g.addColorStop(1, `rgba(${rgb},0)`);
  c.fillStyle = g;
  c.beginPath();
  c.arc(0, 0, rx, 0, TAU);
  c.fill();
  c.restore();
}

/** A thin light line whose ends fade out instead of stopping at a hard edge. */
function softLine(c: C, x: number, y1: number, y2: number, width: number, alpha: number, rgb = '255,255,255'): void {
  const top = Math.min(y1, y2);
  const bottom = Math.max(y1, y2);
  const h = bottom - top;
  if (h < 2 || alpha <= 0) return;
  const inset = Math.min(h * 0.18, Math.max(1, width * 0.6));
  c.save();
  c.globalCompositeOperation = 'lighter';
  const g = c.createLinearGradient(0, top, 0, bottom);
  g.addColorStop(0, `rgba(${rgb},0)`);
  g.addColorStop(0.12, `rgba(${rgb},${alpha * 0.7})`);
  g.addColorStop(0.5, `rgba(${rgb},${alpha})`);
  g.addColorStop(0.88, `rgba(${rgb},${alpha * 0.7})`);
  g.addColorStop(1, `rgba(${rgb},0)`);
  c.strokeStyle = g;
  c.lineWidth = Math.max(0.5, width);
  c.lineCap = 'round';
  c.beginPath();
  c.moveTo(x, top + inset);
  c.lineTo(x, bottom - inset);
  c.stroke();
  c.restore();
}

/** A small four-pointed light glint — a faceted star, never a round dot. */
function drawGlint(c: C, x: number, y: number, r: number, alpha: number): void {
  if (r <= 0 || alpha <= 0) return;
  c.save();
  c.globalCompositeOperation = 'lighter';
  c.shadowColor = '#ffe8a8';
  c.shadowBlur = 7 * alpha;
  c.fillStyle = `rgba(255,255,255,${alpha})`;
  c.beginPath();
  c.moveTo(x, y - r);
  c.lineTo(x + r * 0.22, y - r * 0.22);
  c.lineTo(x + r, y);
  c.lineTo(x + r * 0.22, y + r * 0.22);
  c.lineTo(x, y + r);
  c.lineTo(x - r * 0.22, y + r * 0.22);
  c.lineTo(x - r, y);
  c.lineTo(x - r * 0.22, y - r * 0.22);
  c.closePath();
  c.fill();
  c.restore();
}

/**
 * An arrow made of white light: a sharp arrowhead, a laser-thin shaft and two
 * small light fletchings at the tail. `t` gives it a soft breathing shimmer.
 */
export function drawHolyLightArrow(c: C, len: number, t = 0, intensity = 1): void {
  const L = Math.max(18, len);
  const head = Math.min(L * 0.34, 22);
  const shaft = Math.max(1.4, Math.min(3.2, L * 0.075));
  const wing = Math.max(4, Math.min(9, L * 0.24));
  const headW = Math.max(5, Math.min(11, L * 0.3));
  const pulse = (0.88 + 0.12 * Math.sin(t * 16)) * clamp01(intensity);
  const fade = clamp01(intensity);

  // Feathered outer aura.
  c.save();
  c.globalCompositeOperation = 'lighter';
  const aura = c.createLinearGradient(0, -head * 0.25, 0, L * 1.04);
  aura.addColorStop(0, `rgba(255,255,255,${0.68 * pulse})`);
  aura.addColorStop(0.45, `rgba(255,236,170,${0.4 * pulse})`);
  aura.addColorStop(1, 'rgba(255,226,140,0)');
  c.fillStyle = aura;
  c.shadowColor = '#ffe8a8';
  c.shadowBlur = 16 * pulse;
  c.lineJoin = 'round';
  c.beginPath();
  c.moveTo(0, -2);
  c.lineTo(wing, head);
  c.lineTo(shaft * 1.25, head * 0.82);
  c.lineTo(shaft * 1.25, L - 5);
  c.lineTo(wing * 0.68, L);
  c.lineTo(0, L - 6);
  c.lineTo(-wing * 0.68, L);
  c.lineTo(-shaft * 1.25, L - 5);
  c.lineTo(-shaft * 1.25, head * 0.82);
  c.lineTo(-wing, head);
  c.closePath();
  c.fill();
  c.restore();

  // Two swept light wings trailing from the arrowhead.
  c.save();
  c.globalCompositeOperation = 'lighter';
  c.shadowColor = '#fff2b0';
  c.shadowBlur = 10 * pulse;
  for (const side of [-1, 1]) {
    const wg = c.createLinearGradient(0, head, 0, L);
    wg.addColorStop(0, `rgba(255,226,140,${0.5 * pulse})`);
    wg.addColorStop(1, 'rgba(255,255,255,0)');
    c.fillStyle = wg;
    c.beginPath();
    c.moveTo(side * shaft * 0.8, head * 0.8);
    c.quadraticCurveTo(side * wing * 1.5, L * 0.5, side * wing * 0.8, L * 0.96);
    c.lineTo(side * shaft * 0.4, L * 0.78);
    c.closePath();
    c.fill();
  }
  c.restore();

  // Round-ended laser core.
  softLine(c, 0, head * 0.5, L * 0.92, shaft * 2.3, 0.24 * fade, '255,226,140');
  softLine(c, 0, head * 0.5, L * 0.92, shaft * 1.16, 0.95 * fade, '255,255,255');

  c.save();
  c.globalCompositeOperation = 'lighter';
  // Faceted crystal arrowhead.
  const hg = c.createLinearGradient(-headW, 0, headW, 0);
  hg.addColorStop(0, '#f2c94c');
  hg.addColorStop(0.5, '#ffffff');
  hg.addColorStop(1, '#ffe8a8');
  c.fillStyle = hg;
  c.shadowColor = '#ffe8a8';
  c.shadowBlur = 13 * pulse;
  c.beginPath();
  c.moveTo(0, -4);
  c.lineTo(headW, head * 0.92);
  c.lineTo(0, head * 0.6);
  c.lineTo(-headW, head * 0.92);
  c.closePath();
  c.fill();
  c.shadowBlur = 0;
  c.strokeStyle = `rgba(255,255,255,${0.9 * pulse})`;
  c.lineWidth = 1;
  c.lineCap = 'round';
  c.beginPath();
  c.moveTo(-headW * 0.55, head * 0.72);
  c.lineTo(0, head * 0.18);
  c.lineTo(headW * 0.55, head * 0.72);
  c.stroke();

  // Small light fletchings at the tail.
  for (const side of [-1, 1]) {
    c.fillStyle = `rgba(255,242,176,${0.55 * pulse})`;
    c.beginPath();
    c.moveTo(side * shaft * 0.5, L * 0.76);
    c.lineTo(side * wing * 1.15, L * 0.98);
    c.lineTo(side * shaft * 0.3, L * 0.92);
    c.closePath();
    c.fill();
  }
  c.restore();

  // Breathing star glints along the shaft.
  for (let i = 0; i < 3; i++) {
    const k = 0.32 + i * 0.22;
    const a = Math.max(0, (0.34 + 0.3 * Math.sin(t * 10 + i * 2)) * fade);
    drawGlint(c, (i % 2 ? 1 : -1) * shaft * 1.35, L * k,
      Math.max(1.6, L * 0.055) * (0.75 + 0.25 * Math.sin(t * 8 + i)), a);
  }
}

/**
 * A straight white light laser ending in the light arrow.
 *
 * `tipY` is the arrowhead (the wheel on a hit, the muzzle during a launch) and
 * `tailY` is where the beam comes from — either above or below, so the same
 * recipe works for the firing flash and the pillar landing on the target.
 */
export function drawHolyLightLance(
  c: C,
  x: number,
  tipY: number,
  tailY: number,
  alpha: number,
  t = 0,
): void {
  const a = clamp01(alpha);
  const height = Math.abs(tailY - tipY);
  if (a <= 0 || height < 1) return;
  const top = Math.min(tipY, tailY);
  const bottom = Math.max(tipY, tailY);
  const mid = (top + bottom) / 2;
  const pointsDown = tailY < tipY;

  // Only feathered ovals and a round-ended core: no straight side rails that
  // could read as the edges of a clipped rectangle.
  softGlow(c, x, mid, 7 * a + 1.5, height * 0.53, 0.12 * a, '255,226,140');
  softGlow(c, x, mid, 3 * a + 1, height * 0.53, 0.3 * a, '255,255,255');
  softLine(c, x, top, bottom, 6 * a + 2, 0.22 * a, '255,226,140');
  softLine(c, x, top, bottom, 2 * a + 0.8, 0.9 * a, '255,255,255');
  for (let i = 0; i < 3; i++) {
    const yy = top + height * (0.22 + i * 0.26);
    const ga = Math.max(0, (0.22 + 0.16 * Math.sin(t * 10 + i)) * a);
    drawGlint(c, x, yy, 2.2 + 0.8 * Math.sin(t * 7 + i) ** 2, ga);
  }

  c.save();
  c.translate(x, tipY);
  if (pointsDown) c.rotate(Math.PI);
  drawHolyLightArrow(c, Math.min(34, Math.max(20, height * 0.35)), t, a);
  c.restore();
}

/** The arrow-shaped light slit left in the wheel / rock / chest surface. */
export function drawHolyLightSlit(c: C, s = 1): void {
  c.save();
  c.globalCompositeOperation = 'lighter';
  softGlow(c, 0, 3 * s, 7 * s, 18 * s, 0.3, '255,226,140');
  c.shadowColor = '#ffe8a8';
  c.shadowBlur = 8;
  const g = c.createLinearGradient(0, -8 * s, 0, 16 * s);
  g.addColorStop(0, 'rgba(255,255,255,0.95)');
  g.addColorStop(0.45, 'rgba(255,242,176,0.72)');
  g.addColorStop(1, 'rgba(255,226,140,0)');
  c.fillStyle = g;
  c.beginPath();
  c.moveTo(0, -8 * s);
  c.lineTo(4.5 * s, 4 * s);
  c.lineTo(1.5 * s, 4 * s);
  c.lineTo(1.5 * s, 16 * s);
  c.lineTo(-1.5 * s, 16 * s);
  c.lineTo(-1.5 * s, 4 * s);
  c.lineTo(-4.5 * s, 4 * s);
  c.closePath();
  c.fill();
  c.restore();
}

/**
 * The light that falls onto the impact point: a long, feathered white shaft
 * that fades in at the top and dissolves at the impact, with the arrow-tipped
 * lance inside it. No rectangular fill, so nothing looks cropped by the canvas.
 */
export function drawHolyLightFall(
  c: C,
  x: number,
  tipY: number,
  originY: number,
  alpha: number,
  t = 0,
): void {
  const a = clamp01(alpha);
  const top = Math.min(tipY, originY);
  const bottom = Math.max(tipY, originY);
  const height = bottom - top;
  if (a <= 0 || height < 1) return;
  const mid = (top + bottom) / 2;
  const breathe = 0.82 + 0.18 * Math.sin(t * 5);

  // Three overlapping feathered ovals: wide at the source, tapering to the
  // arrow's impact. Every edge fades to zero, so no square crop is possible.
  softGlow(c, x, top + height * 0.28, 62 * breathe, height * 0.45, 0.34 * a, '255,226,140');
  softGlow(c, x, mid, 40 * breathe, height * 0.5, 0.32 * a, '255,242,176');
  softGlow(c, x, top + height * 0.74, 20 * breathe, height * 0.34, 0.3 * a, '255,255,255');
  softLine(c, x, top, bottom, 9 * a + 2, 0.2 * a, '255,226,140');
  softLine(c, x, top, bottom, 4.5 * a + 1.2, 0.55 * a, '255,255,255');

  // The arrow of light is the head of the falling column.
  drawHolyLightLance(c, x, tipY, originY, a, t);

  // A small vertical flare at the impact, feathered rather than a square.
  softGlow(c, x, tipY, 11, 34, 0.42 * a, '255,255,255');
}

/** Glowing, slowly breathing cracks around a stuck light arrow. */
export function drawHolyCrackGlow(c: C, phase: number, alpha: number, scale = 1): void {
  const a = clamp01(alpha) * (0.55 + 0.45 * Math.sin(phase));
  if (a <= 0.01) return;
  c.save();
  c.globalCompositeOperation = 'lighter';
  c.lineCap = 'round';
  c.lineJoin = 'round';
  c.shadowColor = '#ffe8a8';
  c.shadowBlur = 11 * scale * (0.6 + 0.4 * Math.sin(phase * 1.3));
  const rays = 5;
  for (let i = 0; i < rays; i++) {
    const base = (i / rays) * TAU + Math.sin(phase * 0.17 + i) * 0.13;
    const len = (22 + (i % 3) * 10) * scale;
    c.beginPath();
    for (let k = 0; k <= 3; k++) {
      const d = (len * k) / 3;
      const jitter = Math.sin(phase * 0.7 + i * 3 + k * 1.7) * 3.2 * scale;
      const px = Math.cos(base) * d - Math.sin(base) * jitter;
      const py = Math.sin(base) * d + Math.cos(base) * jitter;
      if (k === 0) c.moveTo(px, py); else c.lineTo(px, py);
    }
    c.strokeStyle = `rgba(255,226,140,${a * 0.85})`;
    c.lineWidth = 2.3 * scale;
    c.stroke();
    c.strokeStyle = `rgba(255,255,255,${a})`;
    c.lineWidth = 0.85 * scale;
    c.stroke();
  }
  c.restore();
}
