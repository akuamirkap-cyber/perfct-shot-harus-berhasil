import { useLayoutEffect, useRef } from "react";
import { TargetArt } from "../../perfect-shot/play/TargetArt";
import type { TargetKind } from "../../perfect-shot/play/levels";
import type { HeadKind } from "../../perfect-shot/play/HeadArt";
import type { FlatName } from "../../perfect-shot/ui/FlatIcons";

type Props = {
  kind: TargetKind;
  icon?: FlatName;
  head?: HeadKind;
  /**
   * Receives the rasterised wheel exactly as Game B draws it, plus the SVG
   * markup it came from — the engine traces that markup into real paths so the
   * collision shape survives even where a canvas refuses to hand back pixels.
   */
  onReady: (kind: TargetKind, image: HTMLImageElement, markup: string, laughImage: HTMLImageElement | null) => void;
};

/**
 * Renders Game B's own `TargetArt` offscreen and hands the rasterised SVG to
 * Game A, so every wheel Game A shows is literally the artwork Game B uses —
 * no hand-drawn copies that can drift.
 */
export function WheelArtBridge({ kind, icon, head, onReady }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const readyRef = useRef(onReady);
  readyRef.current = onReady;

  useLayoutEffect(() => {
    const host = hostRef.current;
    const svg = host?.querySelector("svg");
    if (!svg) return;
    const clone = svg.cloneNode(true) as SVGSVGElement;
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    clone.setAttribute("width", "200");
    clone.setAttribute("height", "200");
    const markup = new XMLSerializer().serializeToString(clone);
    const image = new Image();
    let laughImage: HTMLImageElement | null = null;
    let pendingLaughImage: HTMLImageElement | null = null;
    let normalReady = false;
    let laughReady = true;
    let alive = true;
    const finish = () => {
      if (alive && normalReady && laughReady) readyRef.current(kind, image, markup, laughImage);
    };
    if (kind === 'boss' && head) {
      const laughing = clone.cloneNode(true) as SVGSVGElement;
      const openEyes = laughing.querySelectorAll('[data-boss-eyes="open"]');
      const closedEyes = laughing.querySelectorAll('[data-boss-eyes="laugh"]');
      if (openEyes.length && closedEyes.length) {
        openEyes.forEach((eye) => eye.setAttribute('display', 'none'));
        closedEyes.forEach((eye) => eye.removeAttribute('display'));
        laughReady = false;
        const alternate = new Image();
        pendingLaughImage = alternate;
        alternate.dataset.bossExpression = 'laugh';
        alternate.onload = () => { laughImage = alternate; laughReady = true; finish(); };
        alternate.onerror = () => { laughReady = true; finish(); };
        alternate.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(new XMLSerializer().serializeToString(laughing))}`;
      }
    }
    image.onload = () => { normalReady = true; finish(); };
    image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(markup)}`;
    return () => {
      alive = false;
      image.onload = null;
      if (pendingLaughImage) {
        pendingLaughImage.onload = null;
        pendingLaughImage.onerror = null;
      }
    };
  }, [kind, icon, head]);

  return (
    <div
      ref={hostRef}
      aria-hidden
      data-wheel-art-bridge={kind}
      className="pointer-events-none absolute h-0 w-0 overflow-hidden opacity-0"
    >
      <TargetArt kind={kind} icon={icon} head={head} />
    </div>
  );
}
