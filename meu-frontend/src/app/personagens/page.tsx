'use client';

import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Reveal from '@/components/Reveal';
import ScrollBackground from '@/components/ScrollBackground';
import SiteNav from '@/components/SiteNav';
import { fetchPersonagens, type CharacterSummary } from '@/lib/api';

function formatName(nome: string) {
  return nome.replace(/\b\w/g, (char) => char.toUpperCase());
}

function normalizeSearch(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR').trim();
}

function CharacterSkeleton({ index }: { index: number }) {
  return (
    <div aria-hidden="true" className="relative aspect-[4/5] overflow-hidden border border-white/[0.07] bg-[#0d0c09]">
      <div className="animate-shimmer absolute inset-0 bg-[linear-gradient(105deg,rgba(255,255,255,0.025)_25%,rgba(255,193,7,0.1)_45%,rgba(255,255,255,0.025)_65%)] bg-[length:220%_100%]" />
      <span className="absolute top-4 left-4 font-mono text-[0.55rem] text-gold/25">{String(index + 1).padStart(3, '0')}</span>
      <div className="absolute inset-x-5 bottom-6 space-y-3"><div className="h-3 w-20 bg-white/[0.06]" /><div className="h-7 w-3/5 bg-white/[0.08]" /></div>
    </div>
  );
}

function CharacterCard({ character, index }: { character: CharacterSummary; index: number }) {
  const displayName = formatName(character.nome);

  return (
    <Reveal delay={(index % 4) * 65} className="h-full">
      <Link
        href={`/personagens/${character.nome}`}
        className="group relative block h-full min-h-[24rem] overflow-hidden border border-white/10 bg-[#0d0c09] text-white no-underline shadow-[0_24px_65px_rgba(0,0,0,0.32)] transition duration-500 hover:-translate-y-2 hover:border-gold/55 hover:shadow-[0_28px_80px_rgba(255,193,7,0.12)]"
      >
        <div aria-hidden="true" className="absolute inset-0 overflow-hidden opacity-35">
          <Image
            src={character.imagem}
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="scale-125 object-cover blur-2xl saturate-50 transition duration-700 group-hover:scale-[1.32]"
          />
        </div>
        <div className="absolute inset-x-4 top-12 bottom-28 overflow-hidden border border-white/[0.08] bg-[#d9cdb8]/5 shadow-[0_16px_45px_rgba(0,0,0,0.32)]">
          <Image
            src={character.imagem}
            alt={displayName}
            fill
            priority={index < 4}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-contain object-center saturate-[0.82] transition duration-700 group-hover:scale-[1.035] group-hover:saturate-100"
          />
        </div>
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-[#050403] via-[#050403]/12 to-black/10" />
        <div aria-hidden="true" className="absolute inset-3 border border-white/[0.08] transition duration-500 group-hover:inset-4 group-hover:border-gold/25" />
        <div aria-hidden="true" className="absolute top-0 left-0 h-1 w-0 bg-gold transition-[width] duration-500 group-hover:w-full" />

        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-5">
          <span className="border border-gold/25 bg-black/55 px-2.5 py-1 font-mono text-[0.55rem] font-black tracking-[0.15em] text-gold uppercase">Arq. {String(index + 1).padStart(3, '0')}</span>
          <span aria-hidden="true" className="grid size-8 place-items-center border border-white/15 bg-black/45 text-xs text-white transition group-hover:rotate-45 group-hover:border-gold group-hover:bg-gold group-hover:text-neutral-950">↗</span>
        </div>

        <div className="absolute inset-x-0 bottom-0 p-6 sm:p-7">
          <div className="mb-3 flex items-center gap-3 text-[0.52rem] font-black tracking-[0.2em] text-gold/70 uppercase"><span className="h-px w-8 bg-gold/55" /> Dossiê disponível</div>
          <h2 className="font-heading text-3xl leading-none font-black tracking-tight text-white transition group-hover:text-gold-light">{displayName}</h2>
          <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4 text-[0.58rem] font-bold tracking-[0.14em] text-neutral-500 uppercase">
            <span>Consultar perfil</span>
            <span className="font-mono text-gold/60">MDL-{String(index + 1).padStart(2, '0')}</span>
          </div>
        </div>
      </Link>
    </Reveal>
  );
}

export default function PersonagensPage() {
  const [personagens, setPersonagens] = useState<CharacterSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);

  useEffect(() => {
    let active = true;

    async function carregarPersonagens() {
      try {
        const data = await fetchPersonagens();
        if (active) setPersonagens(data);
      } catch (error) {
        console.warn('O catálogo de personagens está temporariamente indisponível.', error);
        if (active) setErro('Não foi possível carregar os personagens.');
      } finally {
        if (active) setLoading(false);
      }
    }

    void carregarPersonagens();
    return () => { active = false; };
  }, []);

  const personagensFiltrados = useMemo(() => {
    const normalizedQuery = normalizeSearch(deferredQuery);
    if (!normalizedQuery) return personagens;
    return personagens.filter((character) => normalizeSearch(character.nome).includes(normalizedQuery));
  }, [deferredQuery, personagens]);

  return (
    <main className="relative min-h-screen overflow-x-clip bg-[#070604] text-white">
      <ScrollBackground travel={135} imageClassName="object-cover opacity-[0.18] grayscale-[20%]" overlayClassName="bg-gradient-to-b from-[#070604]/55 via-[#070604]/91 to-[#070604]" />
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[1] bg-[linear-gradient(rgba(255,193,7,0.022)_1px,transparent_1px),linear-gradient(90deg,rgba(255,193,7,0.022)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:linear-gradient(to_bottom,black,transparent_72%)]" />

      <div className="relative z-10">
        <header className="border-b border-white/[0.08] px-5 pt-7 pb-14 sm:pt-10 lg:px-8 lg:pb-20">
          <div className="mx-auto max-w-7xl">
            <div className="flex justify-center lg:justify-end"><SiteNav active="/personagens" /></div>

            <div className="mt-14 grid items-end gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:gap-20">
              <Reveal distance={18}>
                <div className="relative">
                  <div className="mb-6 flex items-center gap-3 font-mono text-[0.58rem] font-black tracking-[0.22em] text-gold uppercase"><span className="size-2 rotate-45 border border-gold bg-gold/15" /> Arquivo central · Setor 03</div>
                  <h1 className="max-w-4xl font-heading text-6xl leading-[0.84] font-black tracking-[-0.055em] text-white sm:text-8xl lg:text-[7rem]">Arquivo de <span className="text-gradient-gold block pt-3">Personagens</span></h1>
                  <p className="mt-8 max-w-2xl text-base leading-8 text-neutral-300 sm:text-lg">Doze nomes, incontáveis decisões questionáveis. Consulte os registros de quem constrói — ou complica — cada parte deste universo.</p>
                </div>
              </Reveal>

              <Reveal delay={100} distance={14}>
                <aside className="relative border border-gold/25 bg-[#0c0a06]/92 p-7 shadow-[0_28px_80px_rgba(0,0,0,0.35)] sm:p-9">
                  <span aria-hidden="true" className="absolute top-0 right-0 border-b border-l border-gold/30 px-3 py-1.5 font-mono text-[0.5rem] text-gold/55">CATÁLOGO 2026</span>
                  <span className="text-[0.58rem] font-black tracking-[0.2em] text-neutral-600 uppercase">Situação do arquivo</span>
                  <div className="mt-6 grid grid-cols-2 gap-6">
                    <div><strong className="block font-heading text-4xl font-black text-gold">{loading ? '—' : String(personagens.length).padStart(2, '0')}</strong><span className="mt-1 block text-[0.56rem] font-black tracking-[0.16em] text-neutral-500 uppercase">Registros</span></div>
                    <div className="border-l border-white/10 pl-6"><strong className="block font-heading text-4xl font-black text-white">A–Z</strong><span className="mt-1 block text-[0.56rem] font-black tracking-[0.16em] text-neutral-500 uppercase">Organização</span></div>
                  </div>
                  <div className="mt-8 flex items-center gap-3 border-t border-white/10 pt-5 text-xs text-neutral-400"><span className="size-2 animate-pulse rounded-full bg-gold shadow-[0_0_10px_rgba(255,193,7,0.7)]" /> Arquivo aberto para consulta</div>
                </aside>
              </Reveal>
            </div>
          </div>
        </header>

        <div className="border-b border-neutral-950 bg-gold text-neutral-950">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-8 gap-y-2 px-5 py-3 text-[0.58rem] font-black tracking-[0.2em] uppercase sm:justify-between lg:px-8"><span>Identidade</span><span aria-hidden="true">◆</span><span>Histórias</span><span aria-hidden="true">◆</span><span>Memórias</span><span aria-hidden="true">◆</span><span>Caos documentado</span></div>
        </div>

        <section aria-labelledby="catalog-title" className="px-5 py-16 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-7xl">
            <div className="sticky top-3 z-30 mb-12 border border-white/10 bg-[#080705]/95 p-3 shadow-[0_20px_65px_rgba(0,0,0,0.4)] backdrop-blur-md sm:p-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <label className="group relative flex min-h-12 flex-1 items-center gap-3 border border-white/10 bg-black/25 px-4 transition focus-within:border-gold/55">
                  <span aria-hidden="true" className="text-gold/60">⌕</span>
                  <span className="sr-only">Buscar personagem</span>
                  <input value={query} onChange={(event) => setQuery(event.target.value)} type="search" placeholder="Buscar no arquivo..." className="min-w-0 flex-1 border-0 bg-transparent text-sm text-white outline-none placeholder:text-neutral-600" />
                  {query && <button type="button" onClick={() => setQuery('')} className="cursor-pointer border-0 bg-transparent px-2 text-xs font-black text-neutral-500 hover:text-gold" aria-label="Limpar busca">×</button>}
                </label>
                <div className="flex items-center justify-between gap-5 px-2 sm:justify-end">
                  <span className="font-mono text-[0.58rem] font-black tracking-[0.16em] text-neutral-600 uppercase">Resultado</span>
                  <strong className="min-w-9 text-right font-heading text-2xl font-black text-gold">{loading ? '—' : String(personagensFiltrados.length).padStart(2, '0')}</strong>
                </div>
              </div>
            </div>

            <div className="mb-8 flex items-end justify-between gap-6 border-b border-gold/20 pb-5">
              <div><span className="text-[0.58rem] font-black tracking-[0.2em] text-gold uppercase">Índice geral</span><h2 id="catalog-title" className="mt-2 font-heading text-3xl font-black text-white sm:text-4xl">Registros disponíveis</h2></div>
              <span className="hidden font-mono text-[0.55rem] tracking-[0.16em] text-neutral-600 uppercase sm:block">Selecione um arquivo para abrir</span>
            </div>

            {loading && (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" data-testid="loading" aria-label="Carregando personagens">
                {Array.from({ length: 8 }, (_, index) => <CharacterSkeleton key={index} index={index} />)}
              </div>
            )}

            {erro && (
              <div className="mx-auto grid min-h-64 max-w-2xl place-items-center border border-amber-300/25 bg-amber-300/[0.045] p-8 text-center" data-testid="error" role="status">
                <div><span className="text-4xl text-gold/50">◇</span><p className="mt-5 font-heading text-xl font-black text-amber-100">{erro}</p><p className="mt-2 text-sm text-neutral-500">O arquivo voltará a aparecer quando a conexão for restabelecida.</p></div>
              </div>
            )}

            {!loading && !erro && personagensFiltrados.length > 0 && (
              <div className="grid grid-cols-1 gap-6 [content-visibility:auto] [contain-intrinsic-size:auto_900px] sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" data-testid="character-grid">
                {personagensFiltrados.map((character, index) => <CharacterCard key={character.nome} character={character} index={index} />)}
              </div>
            )}

            {!loading && !erro && personagensFiltrados.length === 0 && (
              <div className="grid min-h-64 place-items-center border border-dashed border-white/12 bg-black/20 px-6 text-center" data-testid="empty-search">
                <div><span className="font-heading text-5xl text-gold/25">?</span><h2 className="mt-4 font-heading text-xl font-black text-white">Nenhum registro encontrado</h2><p className="mt-2 text-sm text-neutral-500">Tente outro nome ou limpe a busca para consultar o arquivo completo.</p><button type="button" onClick={() => setQuery('')} className="mt-6 cursor-pointer border border-gold/30 bg-transparent px-5 py-2.5 text-sm font-black text-gold-light transition hover:bg-gold hover:text-neutral-950">Limpar busca</button></div>
              </div>
            )}
          </div>
        </section>

        <footer className="border-t border-white/10 bg-[#050403] px-5 py-10 lg:px-8">
          <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
            <div><span className="text-[0.55rem] font-black tracking-[0.18em] text-gold/60 uppercase">Fim do índice</span><p className="mt-2 text-sm text-neutral-500">Os arquivos individuais possuem mídias, falas e detalhes próprios.</p></div>
            <Link href="/" className="group inline-flex items-center gap-3 border border-gold/35 px-5 py-3 text-sm font-black text-gold-light no-underline transition hover:bg-gold hover:text-neutral-950"><span className="transition group-hover:-translate-x-1">←</span> Voltar para a Página Inicial</Link>
          </div>
        </footer>
      </div>
    </main>
  );
}
