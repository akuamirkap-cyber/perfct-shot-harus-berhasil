/**
 * Outlined HUD text drawn once into a small sprite and blitted afterwards.
 *
 * strokeText + fillText re-rasterise the glyph outlines on every frame. The score
 * and coin counters only change a few times per second, so caching them removes
 * that work from almost every gameplay frame. The text is drawn inside the sprite
 * with the same align/baseline at an anchor that lands on the same device-pixel
 * phase as the live call, so the blit is pixel-identical to drawing it directly.
 */
type Entry = { cv: HTMLCanvasElement; ax: number; ay: number; w: number; h: number; used: number };
const cache = new Map<string, Entry>();
let tick = 0;
const MAX = 64;
let measure: CanvasRenderingContext2D | null = null;

export function drawOutlinedText(
  c: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  o: { font: string; fill: string; stroke: string; lineWidth: number; align: CanvasTextAlign; baseline?: CanvasTextBaseline },
) {
  const baseline = o.baseline ?? 'middle';
  const t = typeof document === 'undefined' ? null : c.getTransform();
  // Only an unrotated, uniformly scaled transform can be served from a sprite.
  if (!t || Math.abs(t.b) > 1e-6 || Math.abs(t.c) > 1e-6 || Math.abs(t.a - t.d) > 1e-6 || t.a <= 0) {
    c.font = o.font; c.textAlign = o.align; c.textBaseline = baseline;
    if (o.lineWidth > 0) { c.lineWidth = o.lineWidth; c.strokeStyle = o.stroke; c.strokeText(text, x, y); }
    c.fillStyle = o.fill; c.fillText(text, x, y);
    return;
  }
  const scale = t.a;
  // device-pixel position of the anchor, split into whole pixels + sub-pixel phase
  const devX = t.e + x * scale, devY = t.f + y * scale;
  const phX = Math.round((devX - Math.floor(devX)) * 4) / 4;
  const phY = Math.round((devY - Math.floor(devY)) * 4) / 4;
  const key = `${text}|${o.font}|${o.fill}|${o.stroke}|${o.lineWidth}|${o.align}|${baseline}|${scale.toFixed(3)}|${phX}|${phY}`;
  let e = cache.get(key);
  if (!e) {
    measure ??= document.createElement('canvas').getContext('2d');
    const m = measure!;
    m.font = o.font;
    m.textAlign = o.align;
    m.textBaseline = baseline;
    const mt = m.measureText(text);
    const pad = Math.ceil(o.lineWidth) + 3;
    const left = Math.ceil(mt.actualBoundingBoxLeft + pad);
    const up = Math.ceil(mt.actualBoundingBoxAscent + pad);
    const right = Math.ceil(mt.actualBoundingBoxRight + pad);
    const down = Math.ceil(mt.actualBoundingBoxDescent + pad);
    const wDev = Math.ceil((left + right) * scale) + 2;
    const hDev = Math.ceil((up + down) * scale) + 2;
    let cv: HTMLCanvasElement;
    if (cache.size >= MAX) {
      let oldK = '', oldU = Infinity;
      for (const [k, v] of cache) if (v.used < oldU) { oldU = v.used; oldK = k; }
      const evicted = cache.get(oldK);
      cache.delete(oldK);
      cv = evicted?.cv ?? document.createElement('canvas');
    } else {
      cv = document.createElement('canvas');
    }
    cv.width = wDev;
    cv.height = hDev;
    const g = cv.getContext('2d')!;
    // anchor on a whole device pixel + the same sub-pixel phase as the live draw
    const axDev = Math.ceil(left * scale) + phX;
    const ayDev = Math.ceil(up * scale) + phY;
    g.setTransform(scale, 0, 0, scale, axDev, ayDev);
    g.font = o.font;
    g.textAlign = o.align;
    g.textBaseline = baseline;
    if (o.lineWidth > 0) {
      g.lineWidth = o.lineWidth;
      g.strokeStyle = o.stroke;
      g.strokeText(text, 0, 0);
    }
    g.fillStyle = o.fill;
    g.fillText(text, 0, 0);
    e = { cv, ax: axDev, ay: ayDev, w: wDev, h: hDev, used: 0 };
    cache.set(key, e);
  }
  e.used = ++tick;
  // blit 1:1 in device pixels so no resampling happens
  c.save();
  c.setTransform(1, 0, 0, 1, 0, 0);
  c.drawImage(e.cv, Math.round(devX - phX - (e.ax - phX)), Math.round(devY - phY - (e.ay - phY)));
  c.restore();
}
