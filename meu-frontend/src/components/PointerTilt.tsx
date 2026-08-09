'use client';

import type { PointerEvent, ReactNode } from 'react';
import { useRef } from 'react';

type PointerTiltProps = {
  children: ReactNode;
  className?: string;
};

export default function PointerTilt({ children, className = '' }: PointerTiltProps) {
  const elementRef = useRef<HTMLDivElement>(null);

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const element = elementRef.current;
    if (!element || event.pointerType !== 'mouse' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const bounds = element.getBoundingClientRect();
    const horizontal = (event.clientX - bounds.left) / bounds.width;
    const vertical = (event.clientY - bounds.top) / bounds.height;
    element.style.setProperty('--tilt-x', `${(0.5 - vertical) * 3.5}deg`);
    element.style.setProperty('--tilt-y', `${(horizontal - 0.5) * 4.5}deg`);
    element.style.setProperty('--shine-x', `${horizontal * 100}%`);
    element.style.setProperty('--shine-y', `${vertical * 100}%`);
  };

  const resetTilt = () => {
    const element = elementRef.current;
    if (!element) return;
    element.style.setProperty('--tilt-x', '0deg');
    element.style.setProperty('--tilt-y', '0deg');
  };

  return (
    <div ref={elementRef} onPointerMove={handlePointerMove} onPointerLeave={resetTilt} className={`editorial-tilt ${className}`}>
      {children}
      <div aria-hidden="true" className="editorial-tilt__shine" />
    </div>
  );
}
