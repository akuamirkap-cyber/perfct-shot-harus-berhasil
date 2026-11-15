/**
 * IDENTITY DISC – smoother light trail and a clean "light-cycle" scar.
 *
 * The old trail stored one point per frame (~29 px apart at 1750 px/s) and drew
 * each gap as its own round-capped additive segment, so every joint stacked into a
 * bright bead. Here the trail is resampled to evenly spaced points every frame and
 * drawn as ONE tapered ribbon polygon, so it is seamless at any frame rate.
 */
import { drawGlow } from './glowSprite';

type C = CanvasRenderingContext2D;
type Pt = [number, number];
const TAU = Math.PI * 2;

/** keep the raw head path (sub-sampled so fast frames add intermediate points) */
export function pushDiscTrail(trail: Pt[], x: number, y: number, maxLen = 260) {
  const last = trail[trail.length - 1];
  if (last) {
    const dx = x - last[0], dy = y - last[1];
    const d = Math.hypot(dx, dy);
    const steps = Math.min(8, Math.floor(d / 6));
    for (let i = 1; i <= steps; i++) trail.push([last[0] + (dx * i) / (steps + 1), last[1] + (dy * i) / (steps + 1)]);
  }
  trail.push([x, y]);
  // trim by arc length (not by count) so the trail length is frame-rate independent
  let len = 0;
  for (let i = trail.length - 1; i > 0; i--) {
    len += Math.hypot(trail[i][0] - trail[i - 1][0], trail[i][1] - trail[i - 1][1]);
    if (len > maxLen) { trail.splice(0, i - 1); break; }
  }
}

/** evenly spaced points along the trail, head last */
function resample(trail: Pt[], step: number): Pt[] {
  if (trail.length < 2) return trail.slice();
  const out: Pt[] = [trail[trail.length - 1]];
  let carry = 0;
  for (let i = trail.length - 1; i > 0; i--) {
    const [x1, y1] = trail[i], [x0, y0] = trail[i - 1];
    const seg = Math.hypot(x1 - x0, y1 - y0);
    let s = step - carry;
    while (s <= seg) {
      const k = s / seg;
      out.push([x1 + (x0 - x1) * k, y1 + (y0 - y1) * k]);
      s += step;
    }
    carry = seg - (s - step);
  }
  out.push(trail[0]);
  return out.reverse();
}

/** one closed tapered ribbon (tail → head), smoothed with quadratic midpoints */
function ribbon(c: C, pts: Pt[], width: (u: number) => number) {
  const n = pts.length;
  const L: Pt[] = [], R: Pt[] = [];
  for (let i = 0; i < n; i++) {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)];
    let dx = b[0] - a[0], dy = b[1] - a[1];
    const d = Math.hypot(dx, dy) || 1;
    dx /= d; dy /= d;
    const w = width(i / (n - 1)) / 2;
    L.push([pts[i][0] - dy * w, pts[i][1] + dx * w]);
    R.push([pts[i][0] + dy * w, pts[i][1] - dx * w]);
  }
  c.beginPath();
  c.moveTo(L[0][0], L[0][1]);
  for (let i = 1; i < n - 1; i++) c.quadraticCurveTo(L[i][0], L[i][1], (L[i][0] + L[i + 1][0]) / 2, (L[i][1] + L[i + 1][1]) / 2);
  c.lineTo(L[n - 1][0], L[n - 1][1]);
  // rounded head cap
  const h = pts[n - 1], wHead = width(1) / 2;
  const ang = Math.atan2(L[n - 1][1] - h[1], L[n - 1][0] - h[0]);
  c.arc(h[0], h[1], wHead, ang, ang + Math.PI, true);
  for (let i = n - 2; i > 0; i--) c.quadraticCurveTo(R[i][0], R[i][1], (R[i][0] + R[i - 1][0]) / 2, (R[i][1] + R[i - 1][1]) / 2);
  c.lineTo(R[0][0], R[0][1]);
  c.closePath();
}

export function drawDiscTrail(c: C, trail: Pt[], t: number, alpha = 1) {
  if (trail.length < 2) return;
  const pts = resample(trail, 7);
  if (pts.length < 3) return;
  const head = pts[pts.length - 1], tail = pts[0];
  const grad = (stops: [number, string][]) => {
    const g = c.createLinearGradient(tail[0], tail[1], head[0], head[1]);
    for (const [o, col] of stops) g.addColorStop(o, col);
    return g;
  };
  c.save();
  c.globalCompositeOperation = 'lighter';
  c.globalAlpha = alpha;
  // wide soft bloom
  ribbon(c, pts, (u) => 4 + 46 * Math.pow(u, 1.6));
  c.fillStyle = grad([[0, 'rgba(42,155,255,0)'], [0.55, 'rgba(42,155,255,0.10)'], [1, 'rgba(67,232,255,0.28)']]);
  c.fill();
  // main light band
  ribbon(c, pts, (u) => 2 + 24 * Math.pow(u, 1.25));
  c.fillStyle = grad([[0, 'rgba(67,232,255,0)'], [0.4, 'rgba(67,232,255,0.30)'], [1, 'rgba(120,240,255,0.70)']]);
  c.fill();
  // hot white core
  ribbon(c, pts, (u) => 0.6 + 5.5 * u);
  c.fillStyle = grad([[0, 'rgba(255,255,255,0)'], [0.5, 'rgba(230,255,255,0.55)'], [1, 'rgba(255,255,255,0.95)']]);
  c.fill();
  // a few shimmering energy motes riding the trail
  for (let k = 0; k < 4; k++) {
    const u = (k / 4 + t * 2.2) % 1;
    const p = pts[Math.min(pts.length - 1, Math.floor(u * (pts.length - 1)))];
    drawGlow(c, p[0], p[1], 6 + 8 * u, '#bff8ff', 0.35 * u);
  }
  c.restore();
}

/**
 * Clean scar left on the target: a crisp, slightly curved light-cycle cut with a
 * dark burned groove, a cyan edge glow that cools down, and a few short circuit
 * branches – instead of the old thick blurry stroke.
 * Drawn in the embed's local frame (origin on the rim, +x pointing outward).
 */
export function drawDiscScar(c: C, rot: number, size: number, cool: number, seed: number) {
  const L = 66 * size;
  const bend = 4 * size;
  const path = () => {
    c.beginPath();
    c.moveTo(0, 0);
    c.quadraticCurveTo(-L * 0.5, bend, -L, 0);
  };
  c.save();
  c.rotate(rot);
  c.lineCap = 'round';
  c.lineJoin = 'round';
  // charred groove (tapered by drawing three passes)
  path();
  c.strokeStyle = 'rgba(8,16,22,0.55)';
  c.lineWidth = 7 * size;
  c.stroke();
  path();
  c.strokeStyle = 'rgba(4,10,14,0.85)';
  c.lineWidth = 3.6 * size;
  c.stroke();
  // circuit branches (Tron style: right-angled), deterministic per scar
  let s = seed * 9301 + 49297;
  const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  const branches: [number, number, number, number, number, number][] = [];
  for (let i = 0; i < 3; i++) {
    const k = 0.25 + rnd() * 0.55;
    const bx = -L * k, by = bend * 2 * k * (1 - k) * 2;
    const dir = rnd() < 0.5 ? -1 : 1;
    const l1 = (6 + rnd() * 6) * size, l2 = (5 + rnd() * 6) * size;
    branches.push([bx, by, bx, by + dir * l1, bx - l2, by + dir * l1]);
  }
  c.strokeStyle = 'rgba(4,10,14,0.7)';
  c.lineWidth = 2 * size;
  for (const b of branches) { c.beginPath(); c.moveTo(b[0], b[1]); c.lineTo(b[2], b[3]); c.lineTo(b[4], b[5]); c.stroke(); }
  // glowing edge (cools from white-hot to a faint cyan line that stays)
  c.globalCompositeOperation = 'lighter';
  const hot = Math.max(0, Math.min(1, cool));
  path();
  c.strokeStyle = `rgba(67,232,255,${0.22 + 0.55 * hot})`;
  c.lineWidth = 2.6 * size;
  c.stroke();
  path();
  c.strokeStyle = `rgba(235,255,255,${0.12 + 0.85 * hot})`;
  c.lineWidth = 1 * size;
  c.stroke();
  c.strokeStyle = `rgba(67,232,255,${0.18 + 0.5 * hot})`;
  c.lineWidth = 1 * size;
  for (const b of branches) {
    c.beginPath(); c.moveTo(b[0], b[1]); c.lineTo(b[2], b[3]); c.lineTo(b[4], b[5]); c.stroke();
    c.beginPath(); c.arc(b[4], b[5], 1.4 * size, 0, TAU);
    c.fillStyle = `rgba(190,250,255,${0.25 + 0.6 * hot})`;
    c.fill();
  }
  if (hot > 0.02) {
    drawGlow(c, 0, 0, 16 * size, '#bff8ff', 0.7 * hot);
    drawGlow(c, -L * 0.5, bend * 0.5, 24 * size, '#43e8ff', 0.35 * hot);
  }
  c.restore();
}
