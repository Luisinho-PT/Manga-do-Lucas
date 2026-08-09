'use client';

import { useEffect, useState } from 'react';

type Signal = {
  id: 'signal-01' | 'signal-02' | 'signal-03';
  emoji: string;
  progress: number;
  positionClassName: string;
};

const SIGNALS: Signal[] = [
  { id: 'signal-01', emoji: '🌒', progress: 10, positionClassName: 'top-[14%] left-[12%] sm:left-[18%]' },
  { id: 'signal-02', emoji: '🌀', progress: 40, positionClassName: 'top-[29%] right-[13%] sm:right-[20%]' },
  { id: 'signal-03', emoji: '🫧', progress: 30, positionClassName: 'bottom-[17%] left-[24%] sm:left-[31%]' },
];

export default function SecretProgressTeaser() {
  const [selectedSignals, setSelectedSignals] = useState<Signal['id'][]>([]);
  const complete = selectedSignals.length === SIGNALS.length;

  useEffect(() => {
    const alreadyAtMysteryAddress = window.location.pathname === '/' && window.location.search === '???';
    if (!alreadyAtMysteryAddress) window.history.replaceState(window.history.state, '', '/???');
  }, []);

  function selectSignal(id: Signal['id']) {
    setSelectedSignals((current) => current.includes(id) ? current : [...current, id]);
  }

  return (
    <main className="relative min-h-dvh overflow-hidden bg-black text-white" data-selected-count={selectedSignals.length}>
      <h1 className="sr-only">???</h1>

      <div className="pointer-events-none absolute inset-0 z-10" aria-label="Sinais desconhecidos">
        {SIGNALS.map((signal, index) => {
          const selected = selectedSignals.includes(signal.id);
          return (
            <button
              key={signal.id}
              type="button"
              aria-label={`Selecionar sinal ${signal.emoji}`}
              aria-pressed={selected}
              onClick={() => selectSignal(signal.id)}
              onPointerDown={() => selectSignal(signal.id)}
              className={`secret-teaser-signal pointer-events-auto absolute grid size-20 touch-manipulation cursor-pointer place-items-center border-0 bg-transparent text-3xl transition duration-500 sm:size-24 sm:text-4xl ${signal.positionClassName}`}
              data-selected={selected || undefined}
              style={{ animationDelay: `${index * -1.7}s` }}
            >
              <span aria-hidden="true">{signal.emoji}</span>
            </button>
          );
        })}
      </div>

      {selectedSignals.length > 0 && (
        <section className="pointer-events-none absolute inset-x-5 bottom-10 z-30 mx-auto w-auto max-w-sm sm:bottom-12" aria-label="Progresso dos sinais selecionados">
          <ul className="space-y-4">
            {SIGNALS.filter((signal) => selectedSignals.includes(signal.id)).map((signal) => (
              <li key={signal.id} className="secret-teaser-progress grid grid-cols-[2rem_1fr_auto] items-center gap-3">
                <span aria-hidden="true" className="text-base opacity-55">{signal.emoji}</span>
                <span
                  role="progressbar"
                  aria-label={`Progresso do sinal ${signal.emoji}`}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={signal.progress}
                  className="h-2 border border-white/20 bg-[#080808] p-px"
                >
                  <span className="secret-teaser-progress__fill block h-full bg-white/75" style={{ width: `${signal.progress}%` }} />
                </span>
                <span className="secret-pixel min-w-9 text-right text-xs text-white/45">{signal.progress}%</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {complete && (
        <p role="status" className="secret-pixel secret-coming-soon pointer-events-none absolute top-1/2 left-1/2 z-20 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap text-[clamp(2rem,9vw,5.5rem)] tracking-[0.14em] text-white">
          EM BREVE
        </p>
      )}
    </main>
  );
}
