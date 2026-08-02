'use client';

import type { SyntheticEvent } from 'react';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Reveal from '@/components/Reveal';
import LuisStarfield from '@/components/LuisStarfield';
import { fetchPersonagem, type Character, type SpeechBalloon } from '@/lib/api';

const lucasButtons = [
  { id: 'azul', label: '🔵', top: '15%', left: '12%' },
  { id: 'verde', label: '🟢', top: '55%', left: '48%' },
  { id: 'vermelho', label: '🔴', top: '22%', left: '82%' },
] as const;

function formatName(name = '') {
  return name.replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function PersonagemPage() {
  const { nome } = useParams<{ nome: string }>();
  const [personagem, setPersonagem] = useState<Character | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mediaIndex, setMediaIndex] = useState(0);
  const [clickedButtons, setClickedButtons] = useState<string[]>([]);
  const [showLucasPopup, setShowLucasPopup] = useState(false);
  const [balloon, setBalloon] = useState<SpeechBalloon | null>(null);
  const nessTriggeredRef = useRef(false);
  const balloonCooldownRef = useRef(0);

  useEffect(() => {
    let active = true;

    async function loadCharacter() {
      try {
        setLoading(true);
        const data = await fetchPersonagem(nome);
        if (!active) return;
        if (!data) {
          setError('Personagem não encontrado.');
          return;
        }
        setPersonagem(data);
      } catch (loadError) {
        console.error(loadError);
        if (active) setError('Não foi possível carregar este personagem.');
      } finally {
        if (active) setLoading(false);
      }
    }

    if (nome) void loadCharacter();
    return () => { active = false; };
  }, [nome]);

  useEffect(() => {
    nessTriggeredRef.current = false;
    balloonCooldownRef.current = 0;
    setBalloon(null);
  }, [mediaIndex]);

  const media = personagem?.media ?? [];
  const currentMedia = media[mediaIndex];

  function changeMedia(direction: number) {
    setMediaIndex((current) => (current + direction + media.length) % media.length);
  }

  function handleLucasButton(id: string) {
    const next = [...clickedButtons, id];
    setClickedButtons(next);
    if (next.length === lucasButtons.length) {
      setShowLucasPopup(true);
      window.setTimeout(() => {
        setShowLucasPopup(false);
        setClickedButtons([]);
      }, 3000);
    }
  }

  function handleTimeUpdate(event: SyntheticEvent<HTMLVideoElement>) {
    if (!personagem) return;
    const time = event.currentTarget.currentTime;

    if (personagem.nome === 'ness' && mediaIndex === 2 && time >= 21 && !nessTriggeredRef.current) {
      nessTriggeredRef.current = true;
      void new Audio('/audio/ness/ness_audio.wav').play().catch(() => undefined);
    }

    if (personagem.nome === 'luis' && mediaIndex === 3 && time >= 132 && !balloon && Date.now() > balloonCooldownRef.current) {
      const options = personagem.balloons;
      if (options.length) setBalloon(options[Math.floor(Math.random() * options.length)]);
    }
  }

  function popBalloon() {
    if (balloon?.sound) void new Audio(balloon.sound).play().catch(() => undefined);
    balloonCooldownRef.current = Date.now() + 8000;
    setBalloon(null);
  }

  if (loading) {
    return (
      <main className="grid min-h-screen place-content-center justify-items-center gap-4 bg-canvas px-5 text-center">
        <div className="size-12 animate-spin-slow rounded-full border-4 border-white/10 border-t-gold" />
        <p className="text-neutral-300">Carregando personagem...</p>
      </main>
    );
  }

  if (error || !personagem) {
    return (
      <main className="grid min-h-screen place-content-center justify-items-center gap-4 bg-canvas px-5 text-center">
        <h1 className="text-4xl font-black text-gold">Ops!</h1>
        <p className="text-neutral-300">{error || 'Personagem não encontrado.'}</p>
        <Link href="/personagens" className="rounded-full border border-gold px-5 py-3 font-bold text-gold-light no-underline">Voltar aos personagens</Link>
      </main>
    );
  }

  const isLuis = personagem.nome === 'luis';

  return (
    <main className={`relative min-h-screen overflow-hidden px-5 py-8 sm:py-12 ${isLuis ? 'bg-[radial-gradient(circle_at_center,#17142a_0%,#08080d_70%)]' : 'bg-[radial-gradient(circle_at_20%_20%,rgba(255,193,7,0.1),transparent_30rem)] bg-canvas'}`}>
      {isLuis && (
        <LuisStarfield />
      )}

      <div className="relative z-10 mx-auto w-full max-w-5xl">
        <Link href="/personagens" className="mb-8 inline-flex font-bold text-neutral-400 no-underline hover:text-gold">← Todos os personagens</Link>
        <header className="mb-10 text-center">
          <span className="text-xs font-black tracking-[0.2em] text-neutral-500 uppercase">Arquivo de personagem</span>
          <h1 className="mt-2 font-heading text-5xl leading-none font-black text-gold [text-shadow:0_0_24px_rgba(255,193,7,0.34)] sm:text-8xl">
            {formatName(personagem.nome)}
          </h1>
          {isLuis && <p className="mt-4 text-xs font-bold tracking-[0.18em] text-[#d5c9ff]/70 uppercase">Clique no céu para invocar uma constelação</p>}
        </header>

        {currentMedia ? (
          <Reveal>
          <section aria-label={`Mídias de ${formatName(personagem.nome)}`}>
            <figure className="overflow-hidden rounded-3xl border border-gold/20 bg-neutral-950 shadow-[0_20px_50px_rgba(0,0,0,0.5),0_0_45px_rgba(255,193,7,0.1)]">
              <div className="relative aspect-video overflow-hidden bg-black">
                {currentMedia.type === 'image' ? (
                  <Image src={currentMedia.src} alt={currentMedia.caption || formatName(personagem.nome)} fill unoptimized sizes="(max-width: 1024px) 100vw, 980px" className="object-contain" />
                ) : (
                  <video
                    key={currentMedia.src}
                    className="size-full object-contain"
                    src={currentMedia.src}
                    controls
                    autoPlay
                    loop
                    playsInline
                    preload="metadata"
                    onTimeUpdate={handleTimeUpdate}
                  />
                )}

                {balloon && (
                  <button type="button" className="animate-pop-in absolute top-5 right-5 max-w-[75%] cursor-pointer rounded-2xl border-3 border-gold bg-white px-5 py-4 font-heading font-bold text-neutral-950 shadow-2xl" onClick={popBalloon}>
                    {balloon.text}
                  </button>
                )}

                {media.length > 1 && (
                  <div className="pointer-events-none absolute inset-x-2 top-1/2 flex -translate-y-1/2 justify-between sm:inset-x-4">
                    <button type="button" onClick={() => changeMedia(-1)} aria-label="Mídia anterior" className="pointer-events-auto grid size-11 cursor-pointer place-items-center rounded-full border border-white/20 bg-black/70 text-3xl text-white transition hover:scale-110 hover:bg-gold hover:text-neutral-950">‹</button>
                    <button type="button" onClick={() => changeMedia(1)} aria-label="Próxima mídia" className="pointer-events-auto grid size-11 cursor-pointer place-items-center rounded-full border border-white/20 bg-black/70 text-3xl text-white transition hover:scale-110 hover:bg-gold hover:text-neutral-950">›</button>
                  </div>
                )}
              </div>
              <figcaption className="flex min-h-16 items-start justify-between gap-4 px-5 py-4 font-bold text-gold-light sm:items-center">
                <span>{currentMedia.caption}</span>
                <small className="shrink-0 text-neutral-500">{mediaIndex + 1} / {media.length}</small>
              </figcaption>
            </figure>
          </section>
          </Reveal>
        ) : (
          <Reveal>
          <section className="panel grid items-center gap-7 rounded-3xl p-7 sm:grid-cols-[minmax(180px,300px)_1fr] sm:p-12">
            <div className="relative mx-auto aspect-square w-full max-w-72 overflow-hidden rounded-2xl">
              <Image src={personagem.imagem} alt={formatName(personagem.nome)} fill sizes="288px" className="object-cover" />
            </div>
            <div>
              <span className="inline-flex rounded-full bg-gold/10 px-3 py-1 text-xs font-black tracking-widest text-gold-light uppercase">Em breve</span>
              <h2 className="mt-3 font-heading text-2xl font-black text-gold-light sm:text-3xl">Conteúdo em preparação</h2>
              <p className="mt-2 text-neutral-400">As mídias deste personagem ainda serão adicionadas.</p>
            </div>
          </section>
          </Reveal>
        )}

        {personagem.nome === 'lucas' && media.length > 0 && (
          <Reveal>
          <section className="panel mt-8 grid items-center gap-7 rounded-3xl p-7 md:grid-cols-[0.7fr_1fr]">
            <div>
              <span className="inline-flex rounded-full bg-gold/10 px-3 py-1 text-xs font-black tracking-widest text-gold-light uppercase">Interação secreta</span>
              <h2 className="mt-3 font-heading text-2xl font-black text-gold-light">Encontre os três pontos</h2>
              <p className="mt-2 text-neutral-400">Clique em todos os botões coloridos para liberar a surpresa.</p>
            </div>
            <div className="relative min-h-48 overflow-hidden rounded-2xl border border-dashed border-gold/35 bg-black/30">
              {lucasButtons.map((button) => !clickedButtons.includes(button.id) && (
                <button
                  key={button.id}
                  type="button"
                  className="absolute grid size-9 cursor-pointer place-items-center rounded-full bg-transparent text-xl transition hover:scale-135"
                  style={{ top: button.top, left: button.left }}
                  onClick={() => handleLucasButton(button.id)}
                  aria-label={`Ponto ${button.id}`}
                >
                  {button.label}
                </button>
              ))}
            </div>
          </section>
          </Reveal>
        )}
      </div>

      {showLucasPopup && (
        <div className="animate-pop-in fixed inset-0 z-50 grid place-items-center bg-black/90 p-6" role="dialog" aria-label="Surpresa do Lucas">
          <Image src="/img/lucas/lucas_careca.png" alt="Lucas careca" width={620} height={620} className="max-h-[90vh] w-auto rounded-3xl object-contain shadow-[0_0_80px_rgba(255,193,7,0.32)]" />
        </div>
      )}
    </main>
  );
}
