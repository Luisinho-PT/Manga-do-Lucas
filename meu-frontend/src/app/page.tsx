'use client';

import type { FormEvent } from 'react';
import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import Image from 'next/image';
import Link from 'next/link';
import Reveal from '@/components/Reveal';
import ScrollBackground from '@/components/ScrollBackground';
import SiteNav from '@/components/SiteNav';
import { supabase } from '@/lib/supabase';
import {
  checkAdmin,
  deletarComentarioAPI,
  enviarComentario,
  fetchChangelog,
  fetchComentarios,
  fetchVersao,
  fixarComentarioAPI,
  syncDiscordAvatar,
  type ChangelogEntry,
  type Comment,
} from '@/lib/api';

function displayName(user: User) {
  const metadataName = user.user_metadata?.full_name;
  return typeof metadataName === 'string' && metadataName ? metadataName : user.email?.split('@')[0] || 'Usuário';
}

function Avatar({ src, name, className }: { src: string | null; name: string; className: string }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return <span className={`${className} grid place-items-center bg-gold font-black text-neutral-950`}>{name.charAt(0).toUpperCase()}</span>;
  }

  return <Image unoptimized src={src} alt={`Avatar de ${name}`} width={48} height={48} className={`${className} object-cover`} onError={() => setFailed(true)} />;
}

const universeCards = [
  {
    index: '01',
    eyebrow: 'Comece por aqui',
    title: 'Uma história feita à mão',
    description: 'Conheça a origem, as piadas internas e o caos que deram vida ao universo do Luquinhas.',
    href: '/historia',
    action: 'Descobrir a história',
  },
  {
    index: '02',
    eyebrow: 'Conheça o universo',
    title: 'Um elenco bem questionável',
    description: 'Navegue pelos arquivos e descubra quem participa de cada momento desta aventura.',
    href: '/personagens',
    action: 'Explorar os arquivos',
  },
  {
    index: '03',
    eyebrow: 'Conheça os bastidores',
    title: 'Um projeto entre amigos',
    description: 'Descubra por que este site existe e como a amizade transformou piadas internas em um universo inteiro.',
    href: '/sobre',
    action: 'Conhecer o projeto',
  },
] as const;

export default function Home() {
  const [changelog, setChangelog] = useState<ChangelogEntry[]>([]);
  const [versaoInfo, setVersaoInfo] = useState('Carregando...');
  const [comentarios, setComentarios] = useState<Comment[]>([]);
  const [loadingContent, setLoadingContent] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [novoComentario, setNovoComentario] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [avatarAtual, setAvatarAtual] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let active = true;
    let avatarTimer: ReturnType<typeof setInterval> | undefined;

    async function carregarDados() {
      try {
        const [versao, logs, comments] = await Promise.all([
          fetchVersao(),
          fetchChangelog(),
          fetchComentarios(),
        ]);
        if (!active) return;
        const deploy = versao.atualizado_em
          ? new Date(versao.atualizado_em).toLocaleDateString('pt-BR')
          : 'data indisponível';
        setVersaoInfo(`${versao.numero} – Deploy: ${deploy}`);
        setChangelog(logs);
        setComentarios(comments);
      } catch (error) {
        console.error('Erro de conexão com o backend:', error);
        if (active) setVersaoInfo('Indisponível');
      } finally {
        if (active) setLoadingContent(false);
      }
    }

    async function carregarUsuario() {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!active || !currentUser) return;
      const { data: { session } } = await supabase.auth.getSession();
      if (!session || !active) return;

      setUser(currentUser);
      let resolvedAvatar = typeof currentUser.user_metadata?.avatar_url === 'string'
        ? currentUser.user_metadata.avatar_url
        : null;
      const syncedAvatar = await syncDiscordAvatar(session.access_token);
      if (syncedAvatar?.avatar_url) resolvedAvatar = syncedAvatar.avatar_url;

      if (!active) return;
      setAvatarAtual(resolvedAvatar);
      if (syncedAvatar?.atualizados) {
        void fetchComentarios().then((comments) => {
          if (active) setComentarios(comments);
        });
      }

      const admin = await checkAdmin(session.access_token);
      if (active) setIsAdmin(admin.isAdmin);

      avatarTimer = setInterval(() => {
        void supabase.auth.getSession().then(async ({ data: { session: latestSession } }) => {
          if (!active || !latestSession) return;
          const result = await syncDiscordAvatar(latestSession.access_token);
          if (!active || !result?.avatar_url) return;
          setAvatarAtual(result.avatar_url);
          if (result.atualizados) setComentarios(await fetchComentarios());
        });
      }, 15 * 60_000);
    }

    void carregarDados();
    void carregarUsuario();
    return () => {
      active = false;
      if (avatarTimer) clearInterval(avatarTimer);
    };
  }, []);

  async function refreshComments() {
    setComentarios(await fetchComentarios());
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.reload();
  }

  async function handleEnviarComentario(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!novoComentario.trim() || !user) return;
    setEnviando(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Sessão expirada.');

      await enviarComentario({
        mensagem: novoComentario.trim(),
      }, session.access_token);

      setNovoComentario('');
      await refreshComments();
    } catch (error) {
      console.error(error);
      window.alert('Erro ao enviar comentário. Faça login novamente e tente de novo.');
    } finally {
      setEnviando(false);
    }
  }

  async function handleDeletar(commentId: Comment['id']) {
    if (!window.confirm('Tem certeza que deseja deletar este comentário?')) return;
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    await deletarComentarioAPI(commentId, session.access_token);
    await refreshComments();
  }

  async function handleFixar(commentId: Comment['id']) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    await fixarComentarioAPI(commentId, session.access_token);
    await refreshComments();
  }

  return (
    <div className="relative min-h-screen overflow-x-clip bg-[#070604] text-white">
      <ScrollBackground
        priority
        travel={150}
        imageClassName="object-cover opacity-20 grayscale-[35%] sepia-[25%]"
        overlayClassName="bg-gradient-to-b from-[#070604]/45 via-[#070604]/88 to-[#070604]"
      />
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[1] bg-[linear-gradient(rgba(255,193,7,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,193,7,0.025)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:linear-gradient(to_bottom,black,transparent_75%)]" />

      <header className="sticky top-0 z-40 border-b border-white/[0.07] bg-[#070604]/82 px-4 py-3 shadow-[0_12px_40px_rgba(0,0,0,0.22)] backdrop-blur-2xl sm:px-6">
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gold/35 to-transparent" />
        <div className="mx-auto grid max-w-7xl grid-cols-[1fr_auto] items-center gap-x-3 gap-y-3 lg:grid-cols-[1fr_auto_1fr]">
          <Link href="/" className="group flex w-fit items-center gap-3 text-white no-underline">
            <span className="relative grid size-11 rotate-3 place-items-center overflow-hidden border border-gold/50 bg-[#d8d1c5] shadow-[0_0_28px_rgba(255,193,7,0.16)] transition duration-300 group-hover:rotate-0 group-hover:scale-105 group-hover:border-gold-light">
              <Image unoptimized src="/favicon.ico?v=2" alt="" width={44} height={44} className="size-full object-cover transition duration-500 group-hover:scale-110" />
              <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-tr from-gold/15 to-transparent opacity-0 transition group-hover:opacity-100" />
            </span>
            <span className="hidden sm:block">
              <span className="flex items-center gap-2">
                <strong className="block font-heading text-xs tracking-[0.16em] uppercase transition group-hover:text-gold-light sm:text-sm">Mangá do Luquinhas</strong>
                <small className="rounded-full border border-gold/20 bg-gold/5 px-1.5 py-0.5 font-mono text-[0.45rem] font-black tracking-wider text-gold/70 uppercase">v0.5 β</small>
              </span>
              <small className="mt-0.5 block text-[0.58rem] font-bold tracking-[0.2em] text-neutral-500 uppercase">Edição digital</small>
            </span>
          </Link>

          <div className="order-3 col-span-2 flex min-w-0 justify-center lg:order-none lg:col-span-1">
            <SiteNav active="/" />
          </div>

          <div className="flex justify-end lg:min-w-48">
            {user ? (
              <div className="group flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.035] p-1.5 pr-2 shadow-lg transition hover:border-gold/30 hover:bg-gold/[0.055]">
                <Avatar src={avatarAtual} name={displayName(user)} className="size-9 shrink-0 rounded-full border-2 border-gold/80 transition group-hover:border-gold-light sm:size-10" />
                <div className="hidden leading-tight sm:block">
                  <div className="flex items-center gap-2">
                    <span className="max-w-32 truncate text-xs font-black">{displayName(user)}</span>
                    {isAdmin && <span className="rounded-full bg-gold px-1.5 py-0.5 text-[0.5rem] font-black text-neutral-950">ADMIN</span>}
                  </div>
                  <span className="text-[0.55rem] font-bold tracking-wider text-neutral-500 uppercase">Conta conectada</span>
                </div>
                <button type="button" onClick={handleLogout} title="Sair da conta" aria-label="Sair da conta" className="grid size-8 cursor-pointer place-items-center rounded-full border-0 bg-black/30 text-sm text-neutral-500 transition hover:bg-gold hover:text-neutral-950">↗</button>
              </div>
            ) : (
              <Link href="/login" className="group relative isolate inline-flex min-h-11 items-center gap-3 overflow-hidden rounded-full border border-gold/35 bg-gold/5 px-3.5 text-xs font-black text-gold-light no-underline shadow-lg transition duration-300 hover:-translate-y-0.5 hover:border-gold hover:text-neutral-950 hover:shadow-[0_10px_30px_rgba(255,193,7,0.16)] sm:px-5 sm:text-sm">
                <span aria-hidden="true" className="absolute inset-0 -z-10 origin-left scale-x-0 bg-gold transition-transform duration-300 group-hover:scale-x-100" />
                <span className="hidden sm:inline">Entrar / Cadastrar</span>
                <span className="sm:hidden">Entrar</span>
                <span aria-hidden="true" className="grid size-6 place-items-center rounded-full border border-current/25 text-xs transition group-hover:translate-x-0.5">→</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="relative z-10">
        <section className="mx-auto grid min-h-[calc(100svh-11rem)] w-full max-w-7xl items-center gap-12 px-5 py-16 lg:grid-cols-[1.02fr_0.98fr] lg:px-8 lg:py-20">
          <Reveal distance={20}>
            <div>
              <div className="mb-7 flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3 py-1.5 text-[0.65rem] font-black tracking-[0.18em] text-gold-light uppercase">
                  <span className="size-1.5 animate-pulse rounded-full bg-gold" />
                  Projeto em evolução
                </span>
                <span className="font-mono text-[0.65rem] tracking-widest text-neutral-500 uppercase">Feito à mão · Publicado na web</span>
              </div>

              <h1 className="max-w-4xl font-heading text-5xl leading-[0.9] font-black tracking-[-0.055em] text-white sm:text-7xl lg:text-[5.4rem]">
                <span>Bem-vindo ao </span>
                <span className="text-gradient-gold block pt-2">Mangá do Luquinhas!</span>
              </h1>
              <p className="mt-7 max-w-xl text-base leading-8 text-neutral-300 sm:text-lg">
                Uma história nascida de amizade, rabiscos e piadas internas — agora reunida em uma experiência digital feita para guardar cada pedaço desse universo.
              </p>

              <div className="mt-9 flex flex-wrap gap-3">
                <Link href="/historia" className="group inline-flex items-center gap-3 rounded-full bg-gold px-6 py-3.5 font-black text-neutral-950 no-underline shadow-[0_12px_40px_rgba(255,193,7,0.2)] transition hover:-translate-y-1 hover:bg-gold-light">
                  Começar a explorar <span aria-hidden="true" className="transition group-hover:translate-x-1">→</span>
                </Link>
                <a href="#atualizacoes" className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-6 py-3.5 font-black text-white no-underline backdrop-blur-md transition hover:-translate-y-1 hover:border-gold/40 hover:text-gold-light">
                  Ver o que mudou
                </a>
              </div>

              <dl className="mt-12 grid max-w-xl grid-cols-3 border-y border-white/10 py-5">
                <div>
                  <dt className="text-[0.6rem] font-black tracking-[0.18em] text-neutral-500 uppercase">Formato</dt>
                  <dd className="mt-1 text-sm font-black text-neutral-200">100% autoral</dd>
                </div>
                <div className="border-x border-white/10 px-5">
                  <dt className="text-[0.6rem] font-black tracking-[0.18em] text-neutral-500 uppercase">Estética</dt>
                  <dd className="mt-1 text-sm font-black text-neutral-200">Papel & tinta</dd>
                </div>
                <div className="pl-5">
                  <dt className="text-[0.6rem] font-black tracking-[0.18em] text-neutral-500 uppercase">Status</dt>
                  <dd className="mt-1 text-sm font-black text-gold-light">Em produção</dd>
                </div>
              </dl>
            </div>
          </Reveal>

          <Reveal delay={120} distance={16}>
            <div className="relative mx-auto w-full max-w-[34rem] lg:ml-auto">
              <div aria-hidden="true" className="absolute -inset-5 rotate-3 border border-gold/15 bg-gold/5" />
              <div className="relative -rotate-1 overflow-hidden border border-gold/35 bg-[#d9c7aa] p-2 shadow-[0_35px_90px_rgba(0,0,0,0.65),0_0_70px_rgba(255,193,7,0.08)] sm:p-3">
                <div className="relative aspect-[4/5] overflow-hidden border-2 border-neutral-900/80">
                  <Image src="/img/background.png" alt="Página original do Mangá do Luquinhas" fill priority sizes="(max-width: 1024px) 90vw, 42vw" className="object-cover object-top sepia-[8%] transition duration-700 hover:scale-[1.025]" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-white/5" />
                  <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 border-t-2 border-neutral-950/80 bg-[#e5d4b8]/95 px-4 py-3 text-neutral-950 backdrop-blur-sm">
                    <div>
                      <span className="block text-[0.55rem] font-black tracking-[0.18em] uppercase">Página de abertura</span>
                      <strong className="font-heading text-sm sm:text-base">Topo da Axaluz</strong>
                    </div>
                    <span className="font-mono text-xs font-black">Nº 001</span>
                  </div>
                </div>
              </div>
              <div className="absolute -right-2 -bottom-5 rotate-2 border border-gold/40 bg-neutral-950 px-4 py-2 font-mono text-[0.65rem] font-bold tracking-wider text-gold-light uppercase shadow-2xl sm:-right-8">Arquivo original ✦</div>
            </div>
          </Reveal>
        </section>

        <div className="border-y border-gold/15 bg-gold text-neutral-950">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-8 gap-y-2 px-5 py-3 text-[0.65rem] font-black tracking-[0.2em] uppercase sm:justify-between">
            <span>Um universo entre amigos</span><span aria-hidden="true">◆</span>
            <span>Desenhado no papel</span><span aria-hidden="true">◆</span>
            <span>Preservado na internet</span>
          </div>
        </div>

        <section className="mx-auto w-full max-w-7xl px-5 py-24 lg:px-8 lg:py-32">
          <Reveal>
            <div className="grid gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:gap-20">
              <header>
                <span className="text-xs font-black tracking-[0.2em] text-gold uppercase">Dentro da obra</span>
                <h2 className="mt-4 font-heading text-4xl leading-tight font-black tracking-tight text-white sm:text-5xl">Uma porta de entrada para todo o projeto.</h2>
                <p className="mt-5 max-w-md leading-7 text-neutral-400">Escolha um caminho e acompanhe a construção deste universo do primeiro rabisco até a próxima atualização.</p>
              </header>

              <div className="border-t border-white/10">
                {universeCards.map((card, index) => (
                  <Reveal key={card.href} delay={index * 70}>
                    <Link href={card.href} className="group grid gap-4 border-b border-white/10 py-7 text-white no-underline transition hover:border-gold/40 sm:grid-cols-[3rem_1fr_auto] sm:items-center sm:gap-6">
                      <span className="font-mono text-xs font-black text-gold/50 transition group-hover:text-gold">{card.index}</span>
                      <div>
                        <span className="text-[0.6rem] font-black tracking-[0.18em] text-neutral-500 uppercase">{card.eyebrow}</span>
                        <h3 className="mt-1 font-heading text-xl font-black transition group-hover:text-gold-light sm:text-2xl">{card.title}</h3>
                        <p className="mt-2 max-w-xl text-sm leading-6 text-neutral-400">{card.description}</p>
                      </div>
                      <span className="inline-flex items-center gap-2 text-xs font-black text-gold opacity-80 transition group-hover:translate-x-1 group-hover:opacity-100">{card.action} <span aria-hidden="true">→</span></span>
                    </Link>
                  </Reveal>
                ))}
              </div>
            </div>
          </Reveal>
        </section>

        <section id="atualizacoes" className="scroll-mt-8 border-y border-white/10 bg-black/25 px-5 py-24 backdrop-blur-sm lg:px-8 lg:py-32">
          <div className="mx-auto grid w-full max-w-7xl gap-12 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20">
            <Reveal>
              <header className="lg:sticky lg:top-8 lg:self-start">
                <div className="mb-6 flex size-14 rotate-3 items-center justify-center border border-gold/40 bg-gold/10 font-heading text-2xl font-black text-gold">↗</div>
                <span className="text-xs font-black tracking-[0.2em] text-gold uppercase">Diário de produção</span>
                <h2 className="mt-4 font-heading text-4xl leading-tight font-black text-white sm:text-5xl">Últimas Atualizações</h2>
                <p className="mt-5 max-w-sm leading-7 text-neutral-400">Mudanças, correções e novas ideias registradas conforme o projeto ganha forma.</p>
                <div className="mt-8 inline-flex flex-col border-l-2 border-gold pl-4">
                  <span className="text-[0.6rem] font-black tracking-[0.18em] text-neutral-500 uppercase">Versão atual</span>
                  <span className="mt-1 font-mono text-xs font-bold text-gold-light">{versaoInfo}</span>
                </div>
              </header>
            </Reveal>

            <div className="relative border-l border-gold/20 pl-6 sm:pl-10">
              <span aria-hidden="true" className="absolute -left-1.5 top-0 size-3 rounded-full border-2 border-neutral-950 bg-gold shadow-[0_0_18px_rgba(255,193,7,0.6)]" />
              {changelog.length > 0 ? (
                <div className="grid gap-5">
                  {changelog.map((commit, index) => (
                    <Reveal key={commit.commit_hash || `${commit.message}-${index}`} delay={Math.min(index, 4) * 80}>
                      <a href={commit.url || undefined} target={commit.url ? '_blank' : undefined} rel={commit.url ? 'noopener noreferrer' : undefined} className="group relative block overflow-hidden border border-white/10 bg-[#0e0d0a]/85 p-5 text-white no-underline transition duration-300 hover:-translate-y-1 hover:border-gold/35 hover:bg-[#151108] sm:p-7">
                        <span aria-hidden="true" className="absolute inset-y-0 left-0 w-0.5 bg-gold opacity-0 transition group-hover:opacity-100" />
                        <div className="flex items-start gap-4">
                          <span className="font-mono text-[0.65rem] font-black text-gold/60">{String(index + 1).padStart(2, '0')}</span>
                          <div className="min-w-0 flex-1">
                            <p className="font-heading text-base leading-7 font-bold text-neutral-200 transition group-hover:text-white sm:text-lg">{commit.message}</p>
                            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-[0.65rem] font-bold tracking-wider text-neutral-500 uppercase">
                              <span className="text-gold-dark">Luisinho-PT</span>
                              <time>{new Date(commit.date).toLocaleDateString('pt-BR')}</time>
                            </div>
                          </div>
                        </div>
                      </a>
                    </Reveal>
                  ))}
                </div>
              ) : (
                <div className="border border-dashed border-white/15 bg-black/25 px-6 py-16 text-center text-neutral-500">{loadingContent ? 'Carregando atualizações...' : 'Nenhuma atualização disponível.'}</div>
              )}
            </div>
          </div>
        </section>

        <section id="mural" className="scroll-mt-8 px-5 py-24 lg:px-8 lg:py-32">
          <div className="mx-auto w-full max-w-7xl">
            <Reveal>
              <header className="relative grid gap-8 border-y border-gold/20 py-9 lg:grid-cols-[1fr_auto] lg:items-end">
                <div aria-hidden="true" className="absolute -top-12 right-0 font-heading text-[7rem] leading-none font-black text-gold/[0.035] sm:text-[10rem]">05</div>
                <div className="relative">
                  <span className="text-xs font-black tracking-[0.22em] text-gold uppercase">Livro de visitas · Comunidade</span>
                  <h2 className="mt-3 max-w-3xl font-heading text-4xl leading-none font-black tracking-tight text-white sm:text-6xl">Mural de Recados</h2>
                  <p className="mt-5 max-w-2xl text-sm leading-7 text-neutral-400 sm:text-base">Mensagens, ideias e registros de quem está acompanhando essa história enquanto ela acontece.</p>
                </div>
                <div className="relative flex gap-8 lg:text-right">
                  <div>
                    <strong className="block font-heading text-3xl font-black text-gold">{String(comentarios.length).padStart(2, '0')}</strong>
                    <span className="text-[0.6rem] font-black tracking-[0.18em] text-neutral-500 uppercase">Recados publicados</span>
                  </div>
                  <div className="border-l border-white/10 pl-8">
                    <strong className="block font-heading text-3xl font-black text-white">Ao vivo</strong>
                    <span className="text-[0.6rem] font-black tracking-[0.18em] text-neutral-500 uppercase">Mural aberto</span>
                  </div>
                </div>
              </header>
            </Reveal>

            <Reveal>
              <div className="relative mt-10 overflow-hidden border border-gold/25 bg-[#0d0b07]/90 p-5 shadow-[0_30px_90px_rgba(0,0,0,0.38)] backdrop-blur-xl sm:p-8">
                <div aria-hidden="true" className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-gold-light via-gold to-gold-dark" />
                <div aria-hidden="true" className="absolute -top-24 right-0 size-72 rounded-full bg-gold/[0.07] blur-3xl" />
                {user ? (
                  <form onSubmit={handleEnviarComentario} className="relative grid gap-6 lg:grid-cols-[auto_1fr]">
                    <div className="flex items-center gap-3 lg:w-52 lg:flex-col lg:items-start lg:border-r lg:border-white/10 lg:pr-6">
                      <Avatar src={avatarAtual} name={displayName(user)} className="size-12 shrink-0 rounded-full border-2 border-gold shadow-[0_0_24px_rgba(255,193,7,0.14)] lg:size-14" />
                      <div>
                        <span className="text-[0.55rem] font-black tracking-[0.16em] text-gold/70 uppercase">Publicando como</span>
                        <strong className="mt-1 block max-w-40 truncate font-heading text-sm text-white">{displayName(user)}</strong>
                      </div>
                    </div>
                    <div>
                      <label htmlFor="commentInput" className="font-heading text-lg font-black text-white">O que você quer deixar registrado?</label>
                      <textarea
                        id="commentInput"
                        placeholder="Escreva seu recado para a comunidade..."
                        value={novoComentario}
                        onChange={(event) => setNovoComentario(event.target.value)}
                        className="mt-3 min-h-28 w-full resize-y border-0 border-b border-white/15 bg-transparent px-0 py-3 text-base leading-7 text-white outline-none placeholder:text-neutral-600 focus:border-gold"
                        maxLength={280}
                        required
                      />
                      <div className="mt-4 flex items-center justify-between gap-4">
                        <small className="font-mono text-[0.65rem] text-neutral-600">{novoComentario.length} / 280 caracteres</small>
                        <button type="submit" disabled={enviando} className="group inline-flex cursor-pointer items-center gap-3 bg-gold px-5 py-2.5 text-sm font-black text-neutral-950 transition hover:bg-gold-light disabled:cursor-not-allowed disabled:opacity-50">
                          {enviando ? 'Enviando...' : 'Publicar recado'}
                          {!enviando && <span aria-hidden="true" className="transition group-hover:translate-x-1">→</span>}
                        </button>
                      </div>
                    </div>
                  </form>
                ) : (
                  <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-5">
                      <div className="grid size-14 shrink-0 rotate-3 place-items-center border border-gold/35 bg-gold/10 text-2xl text-gold">✦</div>
                      <div>
                        <span className="text-[0.6rem] font-black tracking-[0.18em] text-gold/70 uppercase">Sua voz também faz parte</span>
                        <h3 className="mt-1 font-heading text-xl font-black text-white sm:text-2xl">Entre para assinar o mural</h3>
                        <p className="mt-2 text-sm text-neutral-400">Faça login e deixe uma mensagem para todo mundo que acompanha o projeto.</p>
                      </div>
                    </div>
                    <Link href="/login" className="inline-flex shrink-0 items-center justify-center gap-3 bg-gold px-6 py-3 text-sm font-black text-neutral-950 no-underline transition hover:-translate-y-0.5 hover:bg-gold-light">Fazer login <span aria-hidden="true">→</span></Link>
                  </div>
                )}
              </div>
            </Reveal>

            <div className="mt-14 flex items-center gap-5">
              <span className="font-mono text-[0.65rem] font-black tracking-[0.2em] text-gold uppercase">Mensagens recentes</span>
              <div className="h-px flex-1 bg-gradient-to-r from-gold/30 to-transparent" />
              <span className="font-mono text-[0.6rem] text-neutral-600">Mais novas primeiro</span>
            </div>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              {comentarios.length > 0 ? comentarios.map((comment, index) => (
                <Reveal key={comment.id} delay={Math.min(index, 5) * 65} className={comment.fixado ? 'md:col-span-2' : 'h-full'}>
                  <article className={`group relative flex h-full min-h-64 flex-col overflow-hidden border p-6 transition duration-300 hover:-translate-y-1 sm:p-7 ${comment.fixado ? 'border-gold/55 bg-[linear-gradient(125deg,rgba(255,193,7,0.16),rgba(20,17,9,0.96)_48%,rgba(10,9,7,0.98))] shadow-[0_24px_70px_rgba(255,193,7,0.09)] md:min-h-72 md:p-9' : 'border-white/10 bg-[#0e0d0a]/85 shadow-[0_18px_50px_rgba(0,0,0,0.24)] hover:border-gold/35 hover:bg-[#131109]'}`}>
                    <span aria-hidden="true" className="absolute top-3 right-5 font-heading text-7xl leading-none text-gold/[0.055] transition group-hover:text-gold/[0.1]">“</span>
                    {comment.fixado && <><div className="absolute inset-y-0 left-0 w-1 bg-gold" /><span className="absolute top-0 right-0 bg-gold px-4 py-1.5 text-[0.55rem] font-black tracking-[0.16em] text-neutral-950 uppercase">Recado fixado</span></>}

                    <header className="relative flex items-center gap-4">
                      <Avatar src={comment.avatar_url} name={comment.nome || 'Usuário'} className={`${comment.fixado ? 'size-14' : 'size-12'} shrink-0 rounded-full border-2 border-gold/65 shadow-[0_0_22px_rgba(255,193,7,0.12)]`} />
                      <div className="min-w-0">
                        <h3 className="truncate font-heading text-base font-black text-white">{comment.nome}</h3>
                        <time className="font-mono text-[0.6rem] tracking-wider text-neutral-500 uppercase">{new Date(comment.criado_em).toLocaleDateString('pt-BR')}</time>
                      </div>
                      <span className="ml-auto self-start font-mono text-[0.6rem] font-black text-gold/40">#{String(index + 1).padStart(2, '0')}</span>
                    </header>

                    <blockquote className={`relative flex-1 whitespace-pre-wrap break-words ${comment.fixado ? 'mt-8 max-w-4xl font-heading text-xl leading-9 text-white sm:text-2xl' : 'mt-6 text-base leading-7 text-neutral-200'}`}>
                      {comment.mensagem}
                    </blockquote>

                    <footer className="relative mt-7 flex min-h-7 flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
                      <span className="text-[0.55rem] font-black tracking-[0.16em] text-neutral-600 uppercase">Publicado no mural</span>
                      {isAdmin && (
                        <div className="flex items-center gap-2">
                          <button type="button" onClick={() => handleFixar(comment.id)} className="cursor-pointer border border-gold/25 bg-transparent px-3 py-1.5 text-[0.6rem] font-bold text-gold-light transition hover:bg-gold/10">{comment.fixado ? 'Desfixar' : 'Fixar'}</button>
                          <button type="button" onClick={() => handleDeletar(comment.id)} className="cursor-pointer border border-red-400/25 bg-transparent px-3 py-1.5 text-[0.6rem] font-bold text-red-300 transition hover:bg-red-500/10">Deletar</button>
                        </div>
                      )}
                    </footer>
                  </article>
                </Reveal>
              )) : (
                <div className="md:col-span-2 grid min-h-64 place-items-center border border-dashed border-white/10 bg-black/20 px-6 text-center">
                  <div><span className="text-3xl text-gold/40">✦</span><p className="mt-4 text-sm italic text-neutral-600">{loadingContent ? 'Carregando recados...' : 'Nenhum comentário ainda. Seja o primeiro!'}</p></div>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-white/10 px-5 py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 text-center sm:flex-row sm:text-left">
          <div><strong className="font-heading text-sm tracking-wider text-white uppercase">Mangá do Luquinhas</strong><p className="mt-1 text-xs text-neutral-600">© {new Date().getFullYear()} Todos os direitos reservados.</p></div>
          <div className="flex items-center gap-5 text-xs font-bold text-neutral-500"><Link href="/sobre" className="hover:text-gold-light">O projeto</Link><a href="#atualizacoes" className="hover:text-gold-light">Atualizações</a><a href="#mural" className="hover:text-gold-light">Comunidade</a></div>
        </div>
      </footer>
    </div>
  );
}
