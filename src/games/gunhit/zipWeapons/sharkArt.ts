import { markup as originalShark } from './sharkLauncher';
import { SHARK_JAW_CLOSED_DEGREES } from './motion';

// The source faces left; mirror it before turning it upright so the grip stays
// on the same side as the other guns. These bounds are in the SVG's viewBox.
export const SHARK_INK = { x0: 77, y0: -9, x1: 384, y1: 547, muzzleX: 232, muzzleY: -7 };

const mouthLight = '<radialGradient id="sl-mouth" cx="0.3" cy="0.62" r="0.75">'
  + '<stop offset="0" stop-color="#ffffff" stop-opacity="0.95"/>'
  + '<stop offset="0.3" stop-color="#d5faff" stop-opacity="0.85"/>'
  + '<stop offset="0.65" stop-color="#69d8ff" stop-opacity="0.5"/>'
  + '<stop offset="1" stop-color="#48bfff" stop-opacity="0"/></radialGradient>';

export const sharkGunMarkup = originalShark
  .replace('translate(250 226) rotate(-39) scale(0.94)', 'translate(250 226) rotate(-45) scale(0.94) scale(-1 1)')
  .replace(/<radialGradient id="sl-mouth"[^>]*>[\s\S]*?<\/radialGradient>/, mouthLight)
  .replace('fill="#3a0505"', 'fill="#0b466b"')
  .replace('fill="#ffd36b"', 'fill="#c4f8ff"')
  .replaceAll('stroke="#a30d16"', 'stroke="#2c83ad"')
  .replace('stroke="#ff6b6b"', 'stroke="#c3f7ff"')
  .replace('<g clip-path="url(#sl-mouthclip)"><g transform="translate(-122 50)"><g>',
    '<g clip-path="url(#sl-mouthclip)"><g transform="translate(-122 50)"><g class="shark-mouth-light">')
  .replace('<g transform="translate(-122 50)"><g><path d="M -8.8',
    `<g transform="translate(-122 50)"><g class="shark-jaw" transform="rotate(${SHARK_JAW_CLOSED_DEGREES})"><path d="M -8.8`)
  .replace('</style>', '.shark-mouth-light{opacity:0}.sl-fire .shark-mouth-light{animation:shark-mouth-light 350ms ease-out both}'
    + '@keyframes shark-mouth-light{0%,100%{opacity:0}25%,55%{opacity:.9}}</style>');

// A projectile is the same shark, without its grip and trigger. Rasterizing the
// SVG once keeps the large sprite inexpensive even when several hits are stuck.
export const sharkProjectileMarkup = sharkGunMarkup
  .replace(/<g transform="translate\(84 50\) rotate\(16\)">[\s\S]*?<\/g>/, '')
  .replace(`class="shark-jaw" transform="rotate(${SHARK_JAW_CLOSED_DEGREES})"`, 'class="shark-jaw" transform="rotate(10)"')
  .replace('style="display:block;width:100%;height:100%;overflow:visible" viewBox="-256 -256 1024 1024"',
    'width="307" height="556" viewBox="77 -9 307 556"')
  .replace('</style>', '*{animation:none!important}.shark-mouth-light{opacity:.55!important}</style>');

let projectileImage: HTMLImageElement | null = null;
let projectileRaster: HTMLCanvasElement | null = null;

export function preloadSharkProjectile(): HTMLImageElement | null {
  if (projectileImage || typeof Image === 'undefined') return projectileImage;
  const image = new Image();
  image.decoding = 'async';
  image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(sharkProjectileMarkup)}`;
  projectileImage = image;
  return image;
}

/** Cache the static SVG as a compact bitmap for rotated boss-hit projectiles. */
export function sharkProjectileSprite(): CanvasImageSource | null {
  const image = preloadSharkProjectile();
  if (!image?.complete || image.naturalWidth <= 0) return null;
  if (projectileRaster || typeof document === 'undefined') return projectileRaster ?? image;
  const canvas = document.createElement('canvas');
  canvas.width = 154;
  canvas.height = 278;
  const context = canvas.getContext('2d');
  if (!context) return image;
  context.imageSmoothingQuality = 'high';
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  projectileRaster = canvas;
  return canvas;
}