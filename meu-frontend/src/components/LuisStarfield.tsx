'use client';

import type { CSSProperties } from 'react';
import { useEffect, useRef, useState } from 'react';

type StarTone = 'gold' | 'ivory' | 'violet';

type StarDefinition = {
  x: string;
  y: string;
  size: number;
  duration: number;
  delay: number;
  driftX: string;
  driftY: string;
  tone: StarTone;
};

type StarStyle = CSSProperties & {
  '--star-x': string;
  '--star-y': string;
  '--star-size': string;
  '--star-duration': string;
  '--star-delay': string;
  '--star-drift-x': string;
  '--star-drift-y': string;
};

type BurstParticle = {
  id: number;
  x: string;
  y: string;
  size: string;
  delay: string;
  duration: string;
  rotation: string;
  tone: StarTone;
};

type StarBurst = {
  id: number;
  x: number;
  y: number;
  particles: BurstParticle[];
};

type BurstParticleStyle = CSSProperties & {
  '--burst-x': string;
  '--burst-y': string;
  '--burst-size': string;
  '--burst-delay': string;
  '--burst-duration': string;
  '--burst-rotation': string;
};

const motions = ['voyage', 'orbit', 'rise', 'comet'] as const;
const depths = ['near', 'far', 'middle', 'far', 'near', 'middle'] as const;

const stars: StarDefinition[] = [
  { x: '7%', y: '13%', size: 30, duration: 18, delay: -7, driftX: '11vw', driftY: '9vh', tone: 'gold' },
  { x: '19%', y: '28%', size: 13, duration: 14, delay: -11, driftX: '-7vw', driftY: '14vh', tone: 'ivory' },
  { x: '35%', y: '9%', size: 18, duration: 21, delay: -5, driftX: '8vw', driftY: '12vh', tone: 'violet' },
  { x: '54%', y: '18%', size: 10, duration: 16, delay: -13, driftX: '-12vw', driftY: '7vh', tone: 'gold' },
  { x: '72%', y: '8%', size: 25, duration: 24, delay: -19, driftX: '9vw', driftY: '15vh', tone: 'ivory' },
  { x: '90%', y: '24%', size: 15, duration: 17, delay: -3, driftX: '-10vw', driftY: '12vh', tone: 'violet' },
  { x: '10%', y: '54%', size: 12, duration: 20, delay: -16, driftX: '13vw', driftY: '-10vh', tone: 'ivory' },
  { x: '27%', y: '68%', size: 24, duration: 26, delay: -9, driftX: '-8vw', driftY: '-14vh', tone: 'gold' },
  { x: '43%', y: '47%', size: 9, duration: 13, delay: -6, driftX: '7vw', driftY: '11vh', tone: 'ivory' },
  { x: '61%', y: '61%', size: 20, duration: 22, delay: -18, driftX: '12vw', driftY: '-9vh', tone: 'violet' },
  { x: '78%', y: '48%', size: 11, duration: 15, delay: -2, driftX: '-9vw', driftY: '13vh', tone: 'gold' },
  { x: '94%', y: '66%', size: 28, duration: 25, delay: -14, driftX: '-13vw', driftY: '-11vh', tone: 'ivory' },
  { x: '5%', y: '88%', size: 17, duration: 19, delay: -12, driftX: '10vw', driftY: '-8vh', tone: 'violet' },
  { x: '22%', y: '91%', size: 8, duration: 12, delay: -4, driftX: '7vw', driftY: '-13vh', tone: 'gold' },
  { x: '48%', y: '83%', size: 32, duration: 28, delay: -22, driftX: '-11vw', driftY: '-12vh', tone: 'ivory' },
  { x: '66%', y: '92%', size: 14, duration: 17, delay: -8, driftX: '8vw', driftY: '-16vh', tone: 'gold' },
  { x: '83%', y: '84%', size: 21, duration: 23, delay: -17, driftX: '-12vw', driftY: '-9vh', tone: 'violet' },
  { x: '97%', y: '94%', size: 9, duration: 14, delay: -10, driftX: '-15vw', driftY: '-15vh', tone: 'ivory' },
];

function starStyle(star: StarDefinition): StarStyle {
  return {
    '--star-x': star.x,
    '--star-y': star.y,
    '--star-size': `${star.size}px`,
    '--star-duration': `${star.duration}s`,
    '--star-delay': `${star.delay}s`,
    '--star-drift-x': star.driftX,
    '--star-drift-y': star.driftY,
  };
}

function createBurst(id: number, x: number, y: number, compact: boolean): StarBurst {
  const amount = compact ? 5 : 7;
  const tones: StarTone[] = ['gold', 'ivory', 'violet'];
  const particles = Array.from({ length: amount }, (_, index): BurstParticle => {
    const angle = ((Math.PI * 2) / amount) * index + (id % 7) * 0.13;
    const distance = 58 + ((id * 17 + index * 29) % 64);
    return {
      id: index,
      x: `${Math.cos(angle) * distance}px`,
      y: `${Math.sin(angle) * distance}px`,
      size: `${8 + ((id + index * 5) % 13)}px`,
      delay: `${index * 28}ms`,
      duration: `${900 + ((id + index * 71) % 380)}ms`,
      rotation: `${120 + ((id + index * 47) % 220)}deg`,
      tone: tones[(id + index) % tones.length] ?? 'gold',
    };
  });
  return { id, x, y, particles };
}

function burstParticleStyle(particle: BurstParticle): BurstParticleStyle {
  return {
    '--burst-x': particle.x,
    '--burst-y': particle.y,
    '--burst-size': particle.size,
    '--burst-delay': particle.delay,
    '--burst-duration': particle.duration,
    '--burst-rotation': particle.rotation,
  };
}

export default function LuisStarfield() {
  const [bursts, setBursts] = useState<StarBurst[]>([]);
  const burstId = useRef(0);
  const cleanupTimers = useRef(new Set<number>());

  useEffect(() => {
    const timers = cleanupTimers.current;

    function summonStars(event: PointerEvent) {
      if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
      const target = event.target instanceof Element ? event.target : null;
      if (target?.closest('a, button, input, textarea, select, video, [role="button"]')) return;

      const id = ++burstId.current;
      const burst = createBurst(id, event.clientX, event.clientY, window.innerWidth < 640);
      setBursts((current) => [...current.slice(-3), burst]);

      const timer = window.setTimeout(() => {
        setBursts((current) => current.filter((item) => item.id !== id));
        timers.delete(timer);
      }, 1_700);
      timers.add(timer);
    }

    document.addEventListener('pointerdown', summonStars, { passive: true });
    return () => {
      document.removeEventListener('pointerdown', summonStars);
      for (const timer of timers) window.clearTimeout(timer);
      timers.clear();
    };
  }, []);

  return (
    <div className="luis-starfield" aria-hidden="true" data-testid="luis-starfield">
      <div className="luis-starfield__dust" />
      <svg className="luis-starfield__constellations" viewBox="0 0 100 100" preserveAspectRatio="none">
        <path d="M7 13 L19 28 L35 9 L54 18" />
        <path d="M61 61 L78 48 L90 24 L72 8" />
        <path d="M27 68 L48 83 L66 92 L83 84 L94 66" />
      </svg>
      {stars.map((star, index) => (
        <span
          key={`${star.x}-${star.y}`}
          className={`luis-starfield__mote luis-starfield__mote--${star.tone} luis-starfield__mote--${motions[index % motions.length]} luis-starfield__mote--${depths[index % depths.length]}`}
          style={starStyle(star)}
          data-star={index + 1}
        >
          <span className="luis-starfield__star">
            <span className="luis-starfield__rays" />
          </span>
        </span>
      ))}
      {bursts.map((burst) => (
        <span
          key={burst.id}
          className="luis-starfield__burst"
          style={{ left: burst.x, top: burst.y }}
          data-testid="luis-star-burst"
        >
          <span className="luis-starfield__burst-flash" />
          {burst.particles.map((particle) => (
            <span
              key={particle.id}
              className={`luis-starfield__burst-particle luis-starfield__mote--${particle.tone}`}
              style={burstParticleStyle(particle)}
            >
              <span className="luis-starfield__star"><span className="luis-starfield__rays" /></span>
            </span>
          ))}
        </span>
      ))}
    </div>
  );
}
