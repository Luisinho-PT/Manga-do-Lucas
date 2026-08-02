'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';

type ScrollBackgroundProps = {
  src?: string;
  alt?: string;
  priority?: boolean;
  imageClassName?: string;
  overlayClassName?: string;
  travel?: number;
};

export default function ScrollBackground({
  src = '/img/background.png',
  alt = '',
  priority = false,
  imageClassName = 'object-cover opacity-35',
  overlayClassName = 'bg-gradient-to-b from-canvas/35 via-canvas/75 to-canvas',
  travel = 110,
}: ScrollBackgroundProps) {
  const imageLayerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const layer = imageLayerRef.current;
    if (!layer) return;

    const reducedMotion =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const requestFrame =
      typeof window.requestAnimationFrame === 'function'
        ? window.requestAnimationFrame.bind(window)
        : (callback: FrameRequestCallback) => window.setTimeout(() => callback(Date.now()), 16);
    const cancelFrame =
      typeof window.cancelAnimationFrame === 'function'
        ? window.cancelAnimationFrame.bind(window)
        : window.clearTimeout.bind(window);
    let frame = 0;

    const update = () => {
      frame = 0;
      if (reducedMotion) {
        layer.style.transform = 'scale(1.12)';
        return;
      }

      const maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
      const progress = Math.min(Math.max(window.scrollY / maxScroll, 0), 1);
      const offset = (progress - 0.5) * travel;
      layer.style.transform = `translate3d(0, ${offset}px, 0) scale(1.12)`;
    };

    const scheduleUpdate = () => {
      if (!frame) frame = requestFrame(update);
    };

    update();
    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate);

    return () => {
      window.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', scheduleUpdate);
      if (frame) cancelFrame(frame);
    };
  }, [travel]);

  return (
    <div
      data-scroll-background
      aria-hidden={alt ? undefined : true}
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-canvas"
    >
      <div
        ref={imageLayerRef}
        className="absolute -inset-x-[8vw] -inset-y-[14vh] will-change-transform"
      >
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority || undefined}
          sizes="100vw"
          className={imageClassName}
        />
      </div>
      <div className={`absolute inset-0 ${overlayClassName}`} />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(255,193,7,0.12),transparent_30rem),radial-gradient(circle_at_82%_65%,rgba(139,92,246,0.08),transparent_32rem)]" />
    </div>
  );
}
