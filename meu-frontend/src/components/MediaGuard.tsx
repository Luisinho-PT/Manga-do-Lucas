'use client';

import { useEffect, useRef, useState } from 'react';

export default function MediaGuard() {
  const [shielded, setShielded] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const clearTimer = () => {
      if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    };
    const showShield = (temporary = false) => {
      clearTimer();
      setShielded(true);
      if (temporary) timeoutRef.current = window.setTimeout(() => setShielded(false), 1400);
    };
    const hideShield = () => {
      clearTimer();
      setShielded(false);
    };
    const isProtectedElement = (target: EventTarget | null) =>
      target instanceof Element && Boolean(target.closest('img, video, [data-protected-media]'));
    const blockContextMenu = (event: MouseEvent) => {
      if (isProtectedElement(event.target)) event.preventDefault();
    };
    const blockDrag = (event: DragEvent) => {
      if (isProtectedElement(event.target)) event.preventDefault();
    };
    const blockCaptureShortcuts = (event: KeyboardEvent) => {
      const print = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'p';
      const browserCapture = event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 's';
      const systemCapture = event.key === 'PrintScreen' || (event.metaKey && event.shiftKey && ['3', '4', '5'].includes(event.key));
      if (print || browserCapture || systemCapture) {
        event.preventDefault();
        showShield(true);
      }
    };
    const handleVisibility = () => {
      if (document.hidden) showShield();
      else hideShield();
    };
    const handleBlur = () => showShield();
    const handleBeforePrint = () => showShield();

    document.addEventListener('contextmenu', blockContextMenu);
    document.addEventListener('dragstart', blockDrag);
    document.addEventListener('keydown', blockCaptureShortcuts, true);
    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', hideShield);
    window.addEventListener('beforeprint', handleBeforePrint);
    window.addEventListener('afterprint', hideShield);

    return () => {
      clearTimer();
      document.removeEventListener('contextmenu', blockContextMenu);
      document.removeEventListener('dragstart', blockDrag);
      document.removeEventListener('keydown', blockCaptureShortcuts, true);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', hideShield);
      window.removeEventListener('beforeprint', handleBeforePrint);
      window.removeEventListener('afterprint', hideShield);
    };
  }, []);

  return shielded ? (
    <div aria-hidden="true" className="fixed inset-0 z-[9999] grid place-items-center bg-[#070604] px-6 text-center">
      <div>
        <span className="text-5xl text-gold">✦</span>
        <p className="mt-5 font-heading text-xl font-black text-white">Conteúdo protegido</p>
        <p className="mt-2 text-sm text-neutral-500">Volte para a janela para continuar.</p>
      </div>
    </div>
  ) : null;
}
