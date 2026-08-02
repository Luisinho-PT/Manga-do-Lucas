'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Reveal from '@/components/Reveal';
import ScrollBackground from '@/components/ScrollBackground';
import SiteNav from '@/components/SiteNav';
import { fetchPersonagens, type CharacterSummary } from '@/lib/api';

function formatName(nome: string) {
  return nome.replace(/\b\w/g, (char) => char.toUpperCase());
}

export default function PersonagensPage() {
  const [personagens, setPersonagens] = useState<CharacterSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function carregarPersonagens() {
      try {
        const data = await fetchPersonagens();
        if (active) setPersonagens(data);
      } catch (error) {
        console.error('Erro ao carregar personagens:', error);
        if (active) setErro('Não foi possível carregar os personagens.');
      } finally {
        if (active) setLoading(false);
      }
    }

    void carregarPersonagens();
    return () => { active = false; };
  }, []);

  return (
    <main className="relative min-h-screen overflow-hidden px-5 py-8 sm:py-12">
      <ScrollBackground imageClassName="object-cover opacity-25" />
      <div className="relative z-10 mx-auto w-full max-w-7xl">
        <header className="mb-10 grid justify-items-center gap-5 text-center">
          <span className="text-xs font-black tracking-[0.2em] text-gold uppercase">Conheça o elenco</span>
          <h1 className="text-gradient-gold animate-shimmer bg-[length:200%_auto] font-heading text-5xl font-black sm:text-7xl">Personagens</h1>
          <SiteNav active="/personagens" />
        </header>

        {loading && (
          <div className="grid justify-items-center gap-4 py-24" data-testid="loading">
            <div className="size-12 animate-spin-slow rounded-full border-4 border-white/10 border-t-gold" />
            <p className="font-bold text-neutral-400">Carregando personagens...</p>
          </div>
        )}

        {erro && (
          <div className="mx-auto max-w-xl rounded-2xl border border-red-400/30 bg-red-500/10 p-8 text-center" data-testid="error">
            <p className="font-bold text-red-200">{erro}</p>
          </div>
        )}

        {!loading && !erro && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" data-testid="character-grid">
            {personagens.map((character, index) => (
              <Reveal key={character.nome} delay={(index % 4) * 80}>
              <Link
                href={`/personagens/${character.nome}`}
                className="group relative block aspect-square overflow-hidden rounded-3xl border border-white/10 bg-card shadow-2xl transition duration-500 hover:-translate-y-2 hover:scale-[1.02] hover:border-gold/50 hover:shadow-[0_0_35px_rgba(255,193,7,0.2)]"
              >
                <Image
                  src={character.imagem}
                  alt={formatName(character.nome)}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover transition duration-500 group-hover:scale-105 group-hover:brightness-75"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/70 to-transparent px-5 pt-16 pb-5">
                  <p className="font-heading text-xl font-black text-white">{formatName(character.nome)}</p>
                </div>
              </Link>
              </Reveal>
            ))}
          </div>
        )}

        <Link href="/" className="mx-auto mt-10 table rounded-full border-2 border-gold px-6 py-3 font-black text-gold no-underline transition hover:-translate-y-0.5 hover:bg-gold hover:text-neutral-950">
          Voltar para a Página Inicial
        </Link>
      </div>
    </main>
  );
}
