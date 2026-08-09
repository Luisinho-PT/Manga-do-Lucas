'use client';

import type { ReactNode } from 'react';
import { useEffect, useRef } from 'react';

type HomeHeaderProps = {
  children: ReactNode;
};

export default function HomeHeader({ children }: HomeHeaderProps) {
  const headerRef = useRef<HTMLElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const sectionLabelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const header = headerRef.current;
    const progress = progressRef.current;
    if (!header || !progress) return;

    const requestFrame = typeof window.requestAnimationFrame === 'function'
      ? window.requestAnimationFrame.bind(window)
      : (callback: FrameRequestCallback) => window.setTimeout(() => callback(Date.now()), 16);
    const cancelFrame = typeof window.cancelAnimationFrame === 'function'
      ? window.cancelAnimationFrame.bind(window)
      : window.clearTimeout.bind(window);
    let frame = 0;

    const updateProgress = () => {
      frame = 0;
      const scrollable = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
      const progressValue = Math.min(Math.max(window.scrollY / scrollable, 0), 1);
      progress.style.transform = `scaleX(${progressValue})`;
      header.dataset.compact = String(window.scrollY > 72);
    };
    const scheduleUpdate = () => {
      if (!frame) frame = requestFrame(updateProgress);
    };

    updateProgress();
    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate);

    let observer: IntersectionObserver | undefined;
    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver((entries) => {
        const visibleSection = entries
          .filter((entry) => entry.isIntersecting)
          .sort((left, right) => right.intersectionRatio - left.intersectionRatio)[0];
        const label = visibleSection?.target.getAttribute('data-section-label');
        if (label && sectionLabelRef.current) sectionLabelRef.current.textContent = label;
      }, { rootMargin: '-18% 0px -62% 0px', threshold: [0, 0.15, 0.4] });

      document.querySelectorAll<HTMLElement>('[data-home-section]').forEach((section) => observer?.observe(section));
    }

    return () => {
      window.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', scheduleUpdate);
      if (frame) cancelFrame(frame);
      observer?.disconnect();
    };
  }, []);

  return (
    <header ref={headerRef} data-compact="false" className="home-header group/header sticky top-0 z-40 border-b border-white/[0.07] bg-[#070604]/95 px-4 py-3 shadow-[0_12px_40px_rgba(0,0,0,0.22)] backdrop-blur-md sm:px-6">
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gold/35 to-transparent" />
      {children}
      <div className="pointer-events-none absolute right-5 bottom-1.5 hidden items-center gap-2 font-mono text-[0.48rem] font-black tracking-[0.16em] text-neutral-600 uppercase xl:flex">
        <span className="size-1 rounded-full bg-gold shadow-[0_0_8px_rgba(255,193,7,0.8)]" />
        <span ref={sectionLabelRef}>Abertura</span>
      </div>
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-[2px] overflow-hidden">
        <div ref={progressRef} className="h-full origin-left scale-x-0 bg-gradient-to-r from-gold-dark via-gold to-gold-light shadow-[0_0_12px_rgba(255,193,7,0.65)]" />
      </div>
    </header>
  );
}
