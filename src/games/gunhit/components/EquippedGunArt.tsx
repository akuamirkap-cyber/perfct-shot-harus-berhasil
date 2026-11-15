import { useEffect, useRef } from 'react';
import { drawGunCentered } from '../game/art/drawCentered';
import { getGunMetrics } from '../game/art/metrics';
import { getGunVariant } from '../game/art/gunVariants';
import { hasZipArt } from '../zipWeapons/ids';
import ZipWeaponArt from './ZipWeaponArt';
import { RARITY_COLOR, getWeapon, type WeaponId } from '../game/weapons';
import { getFast2DContext, getOptimalCanvasDpr } from '../utils/mobilePerf';

/**
 * Senjata Gun Hit yang sedang dipakai, digambar untuk layar shell (mis. GAME
 * OVER). Validasi id di penjaga: id yang bukan senjata Gun Hit ditolak di luar,
 * tapi di sini juga ada try/catch — canvas gagal tampil lebih baik kosong
 * daripada merusak seluruh layar hasil.
 */
function CanvasGun({ id, width, height, tilt }: { id: WeaponId; width: number; height: number; tilt: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    try {
      const dpr = getOptimalCanvasDpr(2);
      cv.width = Math.round(width * dpr);
      cv.height = Math.round(height * dpr);
      const ctx = getFast2DContext(cv);
      if (!ctx) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.translate(width / 2, height / 2);
      ctx.rotate((tilt * Math.PI) / 180);
      const m = getGunMetrics(id, getGunVariant(id));
      const scale = (Math.min(width, height) * 0.9) / Math.max(m.span, 130);
      ctx.scale(scale, scale);
      drawGunCentered(ctx, id, 0, 0, true, getGunVariant(id), true);
    } catch {
      /* id/art tak dikenal: biarkan kosong */
    }
  }, [id, width, height, tilt]);
  return <canvas ref={ref} style={{ width, height }} className="block" />;
}

export default function EquippedGunArt({
  id,
  width = 228,
  height = 132,
  tilt = -8,
}: {
  id: string;
  width?: number;
  height?: number;
  tilt?: number;
}) {
  let aura = 'rgba(255,255,255,.28)';
  try {
    aura = `${RARITY_COLOR[getWeapon(id as WeaponId).rarity]}66`;
  } catch {
    /* fallback aura netral */
  }
  const zip = (() => {
    try {
      return getGunVariant(id as WeaponId) === 'zip' && hasZipArt(id as never);
    } catch {
      return false;
    }
  })();
  return (
    <div style={{ filter: `drop-shadow(0 0 18px ${aura})` }} className="grid place-items-center">
      {zip ? <ZipWeaponArt id={id as never} height={height * 0.92} anchor="center" animated={false} /> : <CanvasGun id={id as WeaponId} width={width} height={height} tilt={tilt} />}
    </div>
  );
}
