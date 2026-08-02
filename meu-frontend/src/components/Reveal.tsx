'use client';

import type { CSSProperties, ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  distance?: number;
};

export default function Reveal({ children, className = '', delay = 0, distance = 28 }: RevealProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const reducedMotion =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reducedMotion || !('IntersectionObserver' in window)) {
      const frame =
        typeof window.requestAnimationFrame === 'function'
          ? window.requestAnimationFrame(() => setVisible(true))
          : window.setTimeout(() => setVisible(true), 0);

      return () => {
        if (typeof window.cancelAnimationFrame === 'function') {
          window.cancelAnimationFrame(frame);
        } else {
          window.clearTimeout(frame);
        }
      };
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const hiddenStyle = { '--reveal-distance': `${distance}px` } as CSSProperties;

  return (
    <div
      ref={elementRef}
      data-reveal
      data-visible={visible}
      style={{ ...hiddenStyle, transitionDelay: `${Math.max(delay, 0)}ms` }}
      className={`transition-[opacity,transform,filter] duration-700 ease-out will-change-[opacity,transform] ${
        visible
          ? 'translate-y-0 opacity-100 blur-none'
          : 'translate-y-[var(--reveal-distance)] opacity-0 blur-[2px]'
      } ${className}`}
    >
      {children}
    </div>
  );
}
