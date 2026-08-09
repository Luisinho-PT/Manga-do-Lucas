'use client';

import type { FormEvent } from 'react';
import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import Image from 'next/image';
import Link from 'next/link';
import HomeHeader from '@/components/HomeHeader';
import PointerTilt from '@/components/PointerTilt';
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

const AVATAR_SYNC_INTERVAL = 15 * 60_000;

function sortComments(comments: Comment[]) {
  return [...comments].sort((left, right) => {
    if (left.fixado !== right.fixado) return left.fixado ? -1 : 1;
    return new Date(right.criado_em).getTime() - new Date(left.criado_em).getTime();
  });
}

function commitCategory(message: string) {
  const normalized = message.toLocaleLowerCase('pt-BR');
  if (/corrig|ajust|fix|seguran/.test(normalized)) return 'Correção';
  if (/design|visual|home|layout|interface/.test(normalized)) return 'Design';
  if (/personagem|história|conteúdo|capítulo/.test(normalized)) return 'Conteúdo';
  return 'Sistema';
}

function EditorialSkeleton({ className = '' }: { className?: string }) {
  return <div aria-hidden="true" className={`animate-shimmer bg-[linear-gradient(100deg,rgba(255,255,255,0.035)_25%,rgba(255,193,7,0.11)_45%,rgba(255,255,255,0.035)_65%)] bg-[length:220%_100%] ${className}`} />;
}

type CommentCardProps = {
  comment: Comment;
  displayIndex: number;
  featured?: boolean;
  isAdmin: boolean;
  pendingCommentId: Comment['id'] | null;
  onPin: (commentId: Comment['id']) => void;
  onDelete: (commentId: Comment['id']) => void;
};

function CommentCard({ comment, displayIndex, featured = false, isAdmin, pendingCommentId, onPin, onDelete }: CommentCardProps) {
  return (
    <article className={`group relative flex h-full flex-col overflow-hidden border transition duration-300 hover:-translate-y-1 ${featured ? 'min-h-72 border-gold/55 bg-[linear-gradient(125deg,rgba(255,193,7,0.17),rgba(20,17,9,0.97)_45%,rgba(8,7,5,0.99))] p-7 shadow-[0_30px_90px_rgba(255,193,7,0.1)] sm:p-10' : 'min-h-64 border-white/10 bg-[#0e0d0a]/90 p-6 shadow-[0_18px_50px_rgba(0,0,0,0.24)] hover:border-gold/35 hover:bg-[#131109] sm:p-7'}`}>
      <span aria-hidden="true" className="absolute top-2 right-5 font-heading text-8xl leading-none text-gold/[0.055] transition group-hover:text-gold/[0.1]">“</span>
      {featured && (
        <>
          <div aria-hidden="true" className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-gold-light via-gold to-gold-dark" />
          <div className="mb-8 flex flex-wrap items-center justify-between gap-3 border-b border-gold/20 pb-4">
            <span className="inline-flex items-center gap-2 text-[0.58rem] font-black tracking-[0.2em] text-gold uppercase"><span className="size-1.5 rotate-45 bg-gold" /> Destaque da comunidade</span>
            <span className="font-mono text-[0.55rem] tracking-[0.18em] text-gold/45 uppercase">Escolha da edição</span>
          </div>
        </>
      )}

      <header className="relative flex items-center gap-4">
        <Avatar src={comment.avatar_url} name={comment.nome || 'Usuário'} className={`${featured ? 'size-16' : 'size-12'} shrink-0 rounded-full border-2 border-gold/65 shadow-[0_0_22px_rgba(255,193,7,0.12)]`} />
        <div className="min-w-0">
          <h3 className={`${featured ? 'text-lg sm:text-xl' : 'text-base'} truncate font-heading font-black text-white`}>{comment.nome}</h3>
          <time className="font-mono text-[0.6rem] tracking-wider text-neutral-500 uppercase">{new Date(comment.criado_em).toLocaleDateString('pt-BR')}</time>
        </div>
        <span className="ml-auto self-start font-mono text-[0.6rem] font-black text-gold/40">#{String(displayIndex).padStart(2, '0')}</span>
      </header>

      <blockquote className={`relative flex-1 whitespace-pre-wrap break-words ${featured ? 'mt-8 max-w-5xl font-heading text-xl leading-9 text-white sm:text-3xl sm:leading-[1.45]' : 'mt-6 text-base leading-7 text-neutral-200'}`}>
        {comment.mensagem}
      </blockquote>

      <footer className="relative mt-7 flex min-h-7 flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
        <span className="text-[0.55rem] font-black tracking-[0.16em] text-neutral-600 uppercase">Publicado no mural</span>
        {isAdmin && (
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => onPin(comment.id)} disabled={pendingCommentId !== null} className="cursor-pointer border border-gold/25 bg-transparent px-3 py-1.5 text-[0.6rem] font-bold text-gold-light transition hover:bg-gold/10 disabled:cursor-wait disabled:opacity-50">{pendingCommentId === comment.id ? 'Salvando…' : comment.fixado ? 'Desfixar' : 'Fixar'}</button>
            <button type="button" onClick={() => onDelete(comment.id)} disabled={pendingCommentId !== null} className="cursor-pointer border border-red-400/25 bg-transparent px-3 py-1.5 text-[0.6rem] font-bold text-red-300 transition hover:bg-red-500/10 disabled:cursor-wait disabled:opacity-50">Deletar</button>
          </div>
        )}
      </footer>
    </article>
  );
}

export default function Home() {
  const [changelog, setChangelog] = useState<ChangelogEntry[]>([]);
  const [versaoInfo, setVersaoInfo] = useState('Carregando...');
  const [comentarios, setComentarios] = useState<Comment[]>([]);
  const [loadingContent, setLoadingContent] = useState(true);
  const [commentsError, setCommentsError] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [novoComentario, setNovoComentario] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [avatarAtual, setAvatarAtual] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [pendingCommentId, setPendingCommentId] = useState<Comment['id'] | null>(null);
  const [logoutInProgress, setLogoutInProgress] = useState(false);

  useEffect(() => {
    let active = true;
    let avatarTimeout: ReturnType<typeof setTimeout> | undefined;
    let avatarTimer: ReturnType<typeof setInterval> | undefined;

    async function carregarDados() {
      const [versionResult, changelogResult, commentsResult] = await Promise.allSettled([
        fetchVersao(),
        fetchChangelog(),
        fetchComentarios(),
      ]);
      if (!active) return;

      if (versionResult.status === 'fulfilled') {
        const versao = versionResult.value;
        const deploy = versao.atualizado_em
          ? new Date(versao.atualizado_em).toLocaleDateString('pt-BR')
          : 'data indisponível';
        setVersaoInfo(`${versao.numero} – Deploy: ${deploy}`);
      } else {
        console.warn('A versão está temporariamente indisponível.', versionResult.reason);
        setVersaoInfo('Indisponível');
      }

      if (changelogResult.status === 'fulfilled') setChangelog(changelogResult.value);
      else console.warn('As atualizações estão temporariamente indisponíveis.', changelogResult.reason);

      if (commentsResult.status === 'fulfilled') {
        setComentarios(commentsResult.value);
        setCommentsError(false);
      } else {
        console.warn('Os comentários estão temporariamente indisponíveis.', commentsResult.reason);
        setCommentsError(true);
      }

      setLoadingContent(false);
    }

    async function carregarUsuario() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session || !active) return;

      const currentUser = session.user;
      setUser(currentUser);
      const resolvedAvatar = typeof currentUser.user_metadata?.avatar_url === 'string'
        ? currentUser.user_metadata.avatar_url
        : null;
      setAvatarAtual(resolvedAvatar);

      void checkAdmin(session.access_token).then((admin) => {
        if (active) setIsAdmin(admin.isAdmin);
      });

      const syncStorageKey = `manga:avatar-sync:${currentUser.id}`;
      const lastSync = Number(window.localStorage.getItem(syncStorageKey) || 0);
      const firstSyncDelay = Math.max(AVATAR_SYNC_INTERVAL - (Date.now() - lastSync), 0);

      const syncAvatar = async () => {
        const { data: { session: latestSession } } = await supabase.auth.getSession();
        if (!active || !latestSession) return;
        const result = await syncDiscordAvatar(latestSession.access_token);
        if (!active || !result?.avatar_url) return;
        window.localStorage.setItem(syncStorageKey, String(Date.now()));
        setAvatarAtual(result.avatar_url);
        if (result.atualizados) {
          void fetchComentarios().then((comments) => {
            if (active) {
              setComentarios(comments);
              setCommentsError(false);
            }
          }).catch(() => {
            if (active) setCommentsError(true);
          });
        }
      };

      avatarTimeout = setTimeout(() => {
        void syncAvatar();
        avatarTimer = setInterval(() => void syncAvatar(), AVATAR_SYNC_INTERVAL);
      }, firstSyncDelay);
    }

    void carregarDados();
    void carregarUsuario();
    return () => {
      active = false;
      if (avatarTimeout) clearTimeout(avatarTimeout);
      if (avatarTimer) clearInterval(avatarTimer);
    };
  }, []);

  async function handleLogout() {
    if (logoutInProgress) return;
    const previousUser = user;
    const previousAvatar = avatarAtual;
    setLogoutInProgress(true);
    setUser(null);
    setAvatarAtual(null);
    setIsAdmin(false);

    const { error } = await supabase.auth.signOut();
    if (error) {
      setUser(previousUser);
      setAvatarAtual(previousAvatar);
      window.alert('Não foi possível sair da conta. Tente novamente.');
    }
    setLogoutInProgress(false);
  }

  async function handleEnviarComentario(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!novoComentario.trim() || !user) return;
    setEnviando(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Sessão expirada.');

      const created = await enviarComentario({
        mensagem: novoComentario.trim(),
      }, session.access_token);

      setNovoComentario('');
      setComentarios((current) => sortComments([created, ...current]));
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
    const previousComments = comentarios;
    setPendingCommentId(commentId);
    setComentarios((current) => current.filter((comment) => comment.id !== commentId));

    try {
      await deletarComentarioAPI(commentId, session.access_token);
    } catch (error) {
      console.error(error);
      setComentarios(previousComments);
      window.alert('Não foi possível deletar o comentário. Tente novamente.');
    } finally {
      setPendingCommentId(null);
    }
  }

  async function handleFixar(commentId: Comment['id']) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const target = comentarios.find((comment) => comment.id === commentId);
    if (!target) return;

    const previousComments = comentarios;
    const nextPinnedState = !target.fixado;
    setPendingCommentId(commentId);
    setComentarios((current) => sortComments(current.map((comment) => ({
      ...comment,
      fixado: comment.id === commentId ? nextPinnedState : nextPinnedState ? false : comment.fixado,
    }))));

    try {
      const updated = await fixarComentarioAPI(commentId, nextPinnedState, session.access_token);
      setComentarios((current) => sortComments(current.map((comment) => (
        comment.id === commentId ? { ...comment, ...updated } : comment
      ))));
    } catch (error) {
      console.error(error);
      setComentarios(previousComments);
      window.alert('Não foi possível alterar o destaque. Tente novamente.');
    } finally {
      setPendingCommentId(null);
    }
  }

  const pinnedComment = comentarios.find((comment) => comment.fixado);
  const regularComments = comentarios.filter((comment) => !comment.fixado);

  return (
    <div className="relative min-h-screen overflow-x-clip bg-[#070604] text-white">
      <ScrollBackground
        priority
        travel={150}
        imageClassName="object-cover opacity-20"
        overlayClassName="bg-gradient-to-b from-[#070604]/45 via-[#070604]/88 to-[#070604]"
      />
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[1] bg-[linear-gradient(rgba(255,193,7,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,193,7,0.025)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:linear-gradient(to_bottom,black,transparent_75%)]" />

      <HomeHeader>
        <div className="mx-auto grid max-w-7xl grid-cols-[1fr_auto] items-center gap-x-3 gap-y-3 lg:grid-cols-[1fr_auto_1fr]">
          <Link href="/" className="group flex w-fit items-center gap-3 text-white no-underline">
            <span className="home-header__logo relative grid size-11 rotate-3 place-items-center overflow-hidden border border-gold/50 bg-[#d8d1c5] shadow-[0_0_28px_rgba(255,193,7,0.16)] transition duration-300 group-hover:rotate-0 group-hover:scale-105 group-hover:border-gold-light">
              <Image unoptimized src="/favicon.ico?v=2" alt="" width={44} height={44} className="size-full object-cover transition duration-500 group-hover:scale-110" />
              <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-tr from-gold/15 to-transparent opacity-0 transition group-hover:opacity-100" />
            </span>
            <span className="hidden sm:block">
              <span className="flex items-center gap-2">
                <strong className="block font-heading text-xs tracking-[0.16em] uppercase transition group-hover:text-gold-light sm:text-sm">Mangá do Luquinhas</strong>
                <small className="rounded-full border border-gold/20 bg-gold/5 px-1.5 py-0.5 font-mono text-[0.45rem] font-black tracking-wider text-gold/70 uppercase">v0.5 β</small>
              </span>
              <small className="home-header__edition mt-0.5 block text-[0.58rem] font-bold tracking-[0.2em] text-neutral-500 uppercase">Edição digital</small>
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
                <button type="button" onClick={handleLogout} disabled={logoutInProgress} title="Sair da conta" aria-label="Sair da conta" className="grid size-8 cursor-pointer place-items-center rounded-full border-0 bg-black/30 text-sm text-neutral-500 transition hover:bg-gold hover:text-neutral-950 disabled:cursor-wait disabled:opacity-50">{logoutInProgress ? '…' : '↗'}</button>
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
      </HomeHeader>

      <main className="relative z-10">
        <div aria-hidden="true" className="pointer-events-none absolute top-20 bottom-0 left-[max(0.9rem,calc((100vw-80rem)/2))] hidden w-px bg-gradient-to-b from-gold/0 via-gold/25 to-gold/0 md:block">
          <span className="sticky top-28 block size-2 -translate-x-[3.5px] rotate-45 border border-gold/70 bg-[#070604] shadow-[0_0_14px_rgba(255,193,7,0.5)]" />
        </div>

        <section id="inicio" data-home-section data-section-label="Abertura" className="relative mx-auto grid min-h-[calc(100svh-11rem)] w-full max-w-7xl items-center gap-12 px-5 py-16 lg:grid-cols-[1.02fr_0.98fr] lg:px-8 lg:py-20">
          <div aria-hidden="true" className="absolute top-10 -left-1 hidden items-center gap-3 font-mono text-[0.55rem] font-black tracking-[0.22em] text-gold/35 uppercase xl:flex [writing-mode:vertical-rl]">Edição 0.5 <span className="h-12 w-px bg-gold/25" /></div>
          <Reveal distance={20}>
            <div>
              <div className="mb-7 flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3 py-1.5 text-[0.65rem] font-black tracking-[0.18em] text-gold-light uppercase">
                  <span className="size-1.5 animate-pulse rounded-full bg-gold" />
                  Projeto em evolução
                </span>
                <span className="font-mono text-[0.65rem] tracking-widest text-neutral-500 uppercase">Feito à mão · Publicado na web</span>
              </div>

              <div className="mb-3 flex items-center gap-3 font-mono text-[0.58rem] font-black tracking-[0.2em] text-neutral-600 uppercase"><span className="h-px w-10 bg-gold/45" /> Arquivo digital nº 001</div>
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
                <a href="#atualizacoes" className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-6 py-3.5 font-black text-white no-underline transition hover:-translate-y-1 hover:border-gold/40 hover:text-gold-light">
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
            <PointerTilt className="relative mx-auto w-full max-w-[34rem] lg:ml-auto">
              <div aria-hidden="true" className="absolute -inset-5 rotate-3 border border-gold/15 bg-gold/5" />
              <div aria-hidden="true" className="absolute -top-8 -left-8 z-10 hidden size-14 border-t border-l border-gold/45 sm:block"><span className="absolute -top-1 -left-1 size-2 rounded-full border border-gold bg-[#070604]" /></div>
              <div aria-hidden="true" className="absolute -right-8 -bottom-8 z-10 hidden size-14 border-r border-b border-gold/45 sm:block"><span className="absolute -right-1 -bottom-1 size-2 rounded-full border border-gold bg-[#070604]" /></div>
              <div className="relative -rotate-1 overflow-hidden border border-gold/35 bg-[#d9c7aa] p-2 shadow-[0_35px_90px_rgba(0,0,0,0.65),0_0_70px_rgba(255,193,7,0.08)] sm:p-3">
                <div className="relative aspect-[4/5] overflow-hidden border-2 border-neutral-900/80">
                  <Image src="/img/background.png" alt="Página original do Mangá do Luquinhas" fill priority sizes="(max-width: 1024px) 90vw, 42vw" className="object-cover object-top sepia-[8%] transition duration-700 hover:scale-[1.025]" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-white/5" />
                  <div className="absolute top-4 left-4 border border-neutral-950/70 bg-[#e5d4b8]/95 px-3 py-2 font-mono text-[0.55rem] font-black tracking-[0.16em] text-neutral-950 uppercase shadow-lg">Original · 2020</div>
                  <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 border-t-2 border-neutral-950/80 bg-[#e5d4b8] px-4 py-3 text-neutral-950">
                    <div>
                      <span className="block text-[0.55rem] font-black tracking-[0.18em] uppercase">Página de abertura</span>
                      <strong className="font-heading text-sm sm:text-base">Topo da Axaluz</strong>
                    </div>
                    <span className="font-mono text-xs font-black">Nº 001</span>
                  </div>
                </div>
              </div>
              <div className="absolute -right-2 -bottom-5 rotate-2 border border-gold/40 bg-neutral-950 px-4 py-2 font-mono text-[0.65rem] font-bold tracking-wider text-gold-light uppercase shadow-2xl sm:-right-8">Arquivo original ✦</div>
            </PointerTilt>
          </Reveal>
        </section>

        <div className="border-y border-gold/15 bg-gold text-neutral-950">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-8 gap-y-2 px-5 py-3 text-[0.65rem] font-black tracking-[0.2em] uppercase sm:justify-between">
            <span>Um universo entre amigos</span><span aria-hidden="true">◆</span>
            <span>Desenhado no papel</span><span aria-hidden="true">◆</span>
            <span>Preservado na internet</span>
          </div>
        </div>

        <section id="universo" data-home-section data-section-label="Universo" className="relative mx-auto w-full max-w-7xl px-5 py-24 [content-visibility:auto] [contain-intrinsic-size:auto_900px] lg:px-8 lg:py-32">
          <div aria-hidden="true" className="absolute top-12 right-5 font-heading text-[7rem] leading-none font-black text-gold/[0.025] sm:text-[11rem] lg:right-8">02</div>
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

        <section id="atualizacoes" data-home-section data-section-label="Atualizações" className="relative scroll-mt-24 border-y border-white/10 bg-[#080706]/90 px-5 py-24 lg:px-8 lg:py-32">
          <div aria-hidden="true" className="absolute -top-4 right-5 font-heading text-[8rem] leading-none font-black text-gold/[0.035] sm:text-[12rem] lg:right-10">03</div>
          <div className="mx-auto grid w-full max-w-7xl gap-12 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20">
            <div className="lg:sticky lg:top-24 lg:self-start">
              <Reveal>
              <header className="relative">
                <div className="mb-6 flex size-14 rotate-3 items-center justify-center border border-gold/40 bg-gold/10 font-heading text-2xl font-black text-gold">↗</div>
                <span className="text-xs font-black tracking-[0.2em] text-gold uppercase">Diário de produção</span>
                <h2 className="mt-4 font-heading text-4xl leading-tight font-black text-white sm:text-5xl">Últimas Atualizações</h2>
                <p className="mt-5 max-w-sm leading-7 text-neutral-400">Mudanças, correções e novas ideias registradas conforme o projeto ganha forma.</p>
                <div className="mt-8 inline-flex flex-col border-l-2 border-gold pl-4">
                  <span className="text-[0.6rem] font-black tracking-[0.18em] text-neutral-500 uppercase">Versão atual</span>
                  {versaoInfo === 'Carregando...' ? <EditorialSkeleton className="mt-2 h-3 w-44 rounded-full" /> : <span className="mt-1 font-mono text-xs font-bold text-gold-light">{versaoInfo}</span>}
                </div>
              </header>
              </Reveal>
            </div>

            <div className="relative border-l border-gold/25 pl-6 sm:pl-10">
              <span aria-hidden="true" className="absolute -left-1.5 top-0 size-3 rounded-full border-2 border-neutral-950 bg-gold shadow-[0_0_18px_rgba(255,193,7,0.6)]" />
              {changelog.length > 0 ? (
                <div className="grid gap-7">
                  {changelog.map((commit, index) => (
                    <Reveal key={commit.commit_hash || `${commit.message}-${index}`} delay={Math.min(index, 4) * 80}>
                      <a href={commit.url || undefined} target={commit.url ? '_blank' : undefined} rel={commit.url ? 'noopener noreferrer' : undefined} className="group relative block overflow-hidden border border-white/10 bg-[#0e0d0a]/90 p-5 text-white no-underline shadow-[0_18px_55px_rgba(0,0,0,0.2)] transition duration-300 hover:-translate-y-1 hover:border-gold/35 hover:bg-[#151108] sm:p-7">
                        <span aria-hidden="true" className="absolute top-8 -left-[2.9rem] hidden h-px w-11 bg-gold/40 sm:block" />
                        <span aria-hidden="true" className="absolute top-[1.75rem] -left-[2.75rem] hidden size-2 rotate-45 border border-gold bg-[#080706] transition group-hover:bg-gold sm:block" />
                        <span aria-hidden="true" className="absolute inset-y-0 left-0 w-0.5 bg-gold opacity-0 transition group-hover:opacity-100" />
                        <div className="flex items-start gap-4">
                          <span className="font-mono text-[0.65rem] font-black text-gold/60">{String(index + 1).padStart(2, '0')}</span>
                          <div className="min-w-0 flex-1">
                            <div className="mb-4 flex flex-wrap items-center gap-2">
                              <span className="border border-gold/25 bg-gold/[0.07] px-2 py-1 text-[0.52rem] font-black tracking-[0.16em] text-gold uppercase">{commitCategory(commit.message)}</span>
                              {index === 0 && <span className="bg-gold px-2 py-1 text-[0.52rem] font-black tracking-[0.14em] text-neutral-950 uppercase">Mais recente</span>}
                            </div>
                            <p className="font-heading text-base leading-7 font-bold text-neutral-200 transition group-hover:text-white sm:text-lg">{commit.message}</p>
                            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-[0.65rem] font-bold tracking-wider text-neutral-500 uppercase">
                              <span className="flex items-center gap-3"><span className="text-gold-dark">Luisinho-PT</span><span className="font-mono text-neutral-700">{(commit.commit_hash || 'registro').slice(0, 7)}</span></span>
                              <time>{new Date(commit.date).toLocaleDateString('pt-BR')}</time>
                            </div>
                          </div>
                        </div>
                      </a>
                    </Reveal>
                  ))}
                </div>
              ) : loadingContent ? (
                <div className="grid gap-7" aria-label="Carregando atualizações">
                  {[0, 1, 2].map((item) => <EditorialSkeleton key={item} className="h-40 border border-white/[0.06]" />)}
                </div>
              ) : (
                <div className="border border-dashed border-white/15 bg-black/25 px-6 py-16 text-center text-neutral-500">Nenhuma atualização disponível.</div>
              )}
            </div>
          </div>
        </section>

        <section id="mural" data-home-section data-section-label="Comunidade" className="relative scroll-mt-24 px-5 py-24 [content-visibility:auto] [contain-intrinsic-size:auto_1000px] lg:px-8 lg:py-32">
          <div className="mx-auto w-full max-w-7xl">
            <Reveal>
              <header className="relative grid gap-8 border-y border-gold/20 py-9 lg:grid-cols-[1fr_auto] lg:items-end">
                <div aria-hidden="true" className="absolute -top-12 right-0 font-heading text-[7rem] leading-none font-black text-gold/[0.035] sm:text-[10rem]">04</div>
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
                    <strong className={`block font-heading text-3xl font-black ${commentsError ? 'text-amber-300' : 'text-white'}`}>{commentsError ? 'Pausado' : 'Ao vivo'}</strong>
                    <span className="text-[0.6rem] font-black tracking-[0.18em] text-neutral-500 uppercase">{commentsError ? 'Conexão indisponível' : 'Mural aberto'}</span>
                  </div>
                </div>
              </header>
            </Reveal>

            {commentsError && (
              <div role="status" className="mt-8 flex items-start gap-4 border border-amber-300/25 bg-amber-300/[0.06] px-5 py-4 text-sm text-amber-100">
                <span aria-hidden="true" className="mt-0.5 text-gold">◇</span>
                <div><strong className="font-heading">Mural temporariamente indisponível</strong><p className="mt-1 text-xs leading-5 text-neutral-400">Não foi possível consultar os recados agora. O restante da edição continua disponível normalmente.</p></div>
              </div>
            )}

            <Reveal>
              <div className="relative mt-10 overflow-hidden border border-gold/25 bg-[#0d0b07]/95 p-5 shadow-[0_30px_90px_rgba(0,0,0,0.38)] sm:p-8">
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
                        <button type="submit" disabled={enviando || commentsError} className="group inline-flex cursor-pointer items-center gap-3 bg-gold px-5 py-2.5 text-sm font-black text-neutral-950 transition hover:bg-gold-light disabled:cursor-not-allowed disabled:opacity-50">
                          {commentsError ? 'Mural indisponível' : enviando ? 'Enviando...' : 'Publicar recado'}
                          {!enviando && !commentsError && <span aria-hidden="true" className="transition group-hover:translate-x-1">→</span>}
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

            {pinnedComment && (
              <Reveal className="mt-12" distance={18}>
                <section aria-labelledby="featured-comment-title">
                  <div className="mb-5 flex items-center gap-4">
                    <span className="font-mono text-[0.62rem] font-black tracking-[0.2em] text-gold uppercase">Em destaque</span>
                    <div className="h-px flex-1 bg-gradient-to-r from-gold/35 to-transparent" />
                    <span id="featured-comment-title" className="text-[0.58rem] font-bold tracking-[0.14em] text-neutral-600 uppercase">Recado fixado pela equipe</span>
                  </div>
                  <CommentCard comment={pinnedComment} displayIndex={1} featured isAdmin={isAdmin} pendingCommentId={pendingCommentId} onPin={handleFixar} onDelete={handleDeletar} />
                </section>
              </Reveal>
            )}

            <div className="mt-14 flex items-center gap-5">
              <span className="font-mono text-[0.65rem] font-black tracking-[0.2em] text-gold uppercase">Mensagens recentes</span>
              <div className="h-px flex-1 bg-gradient-to-r from-gold/30 to-transparent" />
              <span className="font-mono text-[0.6rem] text-neutral-600">Mais novas primeiro</span>
            </div>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              {regularComments.length > 0 ? regularComments.map((comment, index) => (
                <Reveal key={comment.id} delay={Math.min(index, 5) * 65} className="h-full">
                  <CommentCard comment={comment} displayIndex={index + (pinnedComment ? 2 : 1)} isAdmin={isAdmin} pendingCommentId={pendingCommentId} onPin={handleFixar} onDelete={handleDeletar} />
                </Reveal>
              )) : commentsError ? (
                <div className="md:col-span-2 grid min-h-48 place-items-center border border-dashed border-amber-300/20 bg-amber-300/[0.025] px-6 text-center">
                  <div><span className="text-3xl text-gold/35">◇</span><p className="mt-3 text-sm text-neutral-500">Os recados reaparecerão quando a conexão com o backend for restabelecida.</p></div>
                </div>
              ) : loadingContent ? (
                <>
                  <EditorialSkeleton className="h-64 border border-white/[0.06]" />
                  <EditorialSkeleton className="h-64 border border-white/[0.06]" />
                </>
              ) : comentarios.length === 0 ? (
                <div className="md:col-span-2 grid min-h-64 place-items-center border border-dashed border-white/10 bg-black/20 px-6 text-center">
                  <div><span className="text-3xl text-gold/40">✦</span><p className="mt-4 text-sm italic text-neutral-600">Nenhum comentário ainda. Seja o primeiro!</p></div>
                </div>
              ) : <p className="md:col-span-2 py-8 text-center text-sm italic text-neutral-600">O recado em destaque é o único registro desta edição por enquanto.</p>}
            </div>
          </div>
        </section>
      </main>

      <footer id="contracapa" data-home-section data-section-label="Contracapa" className="relative z-10 overflow-hidden border-t border-gold/25 bg-[#050403]">
        <div className="h-2 bg-[repeating-linear-gradient(90deg,var(--color-gold)_0,var(--color-gold)_28px,var(--color-gold-dark)_28px,var(--color-gold-dark)_32px,#090705_32px,#090705_38px)]" />
        <div aria-hidden="true" className="absolute top-14 right-5 font-heading text-[8rem] leading-none font-black text-gold/[0.035] sm:text-[13rem] lg:right-12">05</div>
        <div className="relative mx-auto grid max-w-7xl gap-12 px-5 py-16 md:grid-cols-[1.25fr_0.75fr_0.75fr] lg:px-8 lg:py-20">
          <div className="max-w-xl">
            <div className="flex items-center gap-4">
              <span className="grid size-14 rotate-3 place-items-center overflow-hidden border border-gold/45 bg-[#d8d1c5]"><Image unoptimized src="/favicon.ico?v=2" alt="" width={56} height={56} className="size-full object-cover" /></span>
              <div>
                <span className="text-[0.58rem] font-black tracking-[0.2em] text-gold uppercase">Contracapa · Edição digital</span>
                <strong className="mt-1 block font-heading text-xl tracking-wide text-white uppercase">Mangá do Luquinhas</strong>
              </div>
            </div>
            <p className="mt-7 max-w-md text-sm leading-7 text-neutral-400">Um arquivo vivo de histórias, desenhos e memórias construído entre amigos — preservado com o mesmo cuidado de uma edição impressa.</p>
            <div className="mt-8 inline-flex items-center gap-3 border border-gold/20 bg-gold/[0.05] px-4 py-2 font-mono text-[0.6rem] font-bold tracking-wider text-gold-light uppercase">
              <span className="size-1.5 animate-pulse rounded-full bg-gold" /> Projeto em produção
            </div>
          </div>

          <div>
            <span className="text-[0.58rem] font-black tracking-[0.2em] text-neutral-600 uppercase">Índice da edição</span>
            <nav aria-label="Atalhos da contracapa" className="mt-5 grid gap-3 text-sm font-bold">
              <a href="#inicio" className="group flex items-center justify-between border-b border-white/10 pb-3 text-neutral-400 no-underline transition hover:border-gold/30 hover:text-gold-light"><span>01 · Abertura</span><span className="transition group-hover:translate-x-1">→</span></a>
              <a href="#universo" className="group flex items-center justify-between border-b border-white/10 pb-3 text-neutral-400 no-underline transition hover:border-gold/30 hover:text-gold-light"><span>02 · Universo</span><span className="transition group-hover:translate-x-1">→</span></a>
              <a href="#atualizacoes" className="group flex items-center justify-between border-b border-white/10 pb-3 text-neutral-400 no-underline transition hover:border-gold/30 hover:text-gold-light"><span>03 · Atualizações</span><span className="transition group-hover:translate-x-1">→</span></a>
              <a href="#mural" className="group flex items-center justify-between border-b border-white/10 pb-3 text-neutral-400 no-underline transition hover:border-gold/30 hover:text-gold-light"><span>04 · Comunidade</span><span className="transition group-hover:translate-x-1">→</span></a>
            </nav>
          </div>

          <div>
            <span className="text-[0.58rem] font-black tracking-[0.2em] text-neutral-600 uppercase">Ficha técnica</span>
            <dl className="mt-5 grid gap-5 text-xs">
              <div><dt className="font-black tracking-wider text-neutral-600 uppercase">Versão publicada</dt><dd className="mt-1 font-mono text-gold-light">{versaoInfo}</dd></div>
              <div><dt className="font-black tracking-wider text-neutral-600 uppercase">Formato</dt><dd className="mt-1 text-neutral-300">React · TypeScript · Tailwind CSS 4</dd></div>
              <div><dt className="font-black tracking-wider text-neutral-600 uppercase">Arquivo</dt><dd className="mt-1 text-neutral-300">Feito à mão, preservado na web</dd></div>
              <Link href="/sobre" className="mt-1 inline-flex w-fit items-center gap-2 border border-gold/30 px-4 py-2 font-black text-gold-light no-underline transition hover:bg-gold hover:text-neutral-950">Conhecer o projeto <span>→</span></Link>
            </dl>
          </div>
        </div>
        <div className="border-t border-white/[0.07] px-5 py-5">
          <div className="mx-auto flex max-w-7xl flex-col justify-between gap-2 text-[0.58rem] font-bold tracking-[0.13em] text-neutral-700 uppercase sm:flex-row">
            <span>© {new Date().getFullYear()} Mangá do Luquinhas</span>
            <span>Todos os direitos reservados · Edição nº 005</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
