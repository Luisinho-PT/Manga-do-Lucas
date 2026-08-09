'use client';

import type { FormEvent } from 'react';
import { useState } from 'react';
import type { Provider } from '@supabase/supabase-js';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Reveal from '@/components/Reveal';
import { supabase } from '@/lib/supabase';

const socialButton = 'flex min-h-12 w-full items-center justify-center gap-3 rounded-xl border border-white/10 px-4 font-bold transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60';

function requestedDestination() {
  const requested = new URLSearchParams(window.location.search).get('next') || '/';
  return requested.startsWith('/') && !requested.startsWith('//') ? requested : '/';
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSocialLogin(provider: Provider) {
    setLoading(true);
    setErro(null);

    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(requestedDestination())}` },
    });

    if (error) {
      setErro(`Erro ao conectar com ${provider}: ${error.message}`);
      setLoading(false);
    }
  }

  async function handleEmailLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setErro(null);

    const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
    if (error) {
      setErro('Email ou senha incorretos.');
      setLoading(false);
      return;
    }

    router.replace(requestedDestination());
  }

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-[#080704] px-5 py-12">
      <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(255,193,7,0.14),transparent_28rem),radial-gradient(circle_at_85%_80%,rgba(255,152,0,0.08),transparent_30rem),linear-gradient(rgba(255,193,7,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,193,7,0.025)_1px,transparent_1px)] bg-[size:auto,auto,48px_48px,48px_48px]" />
      <Reveal className="relative z-10 w-full max-w-md">
      <section className="panel rounded-3xl p-7 sm:p-10">
        <header className="text-center">
          <span className="text-xs font-black tracking-[0.2em] text-gold uppercase">Área da comunidade</span>
          <h1 className="text-gradient-gold mt-3 font-heading text-3xl font-black sm:text-4xl">Manga do Luquinhas</h1>
          <p className="mt-2 text-neutral-400">Faça login para comentar</p>
        </header>

        {erro && (
          <div role="alert" className="mt-6 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {erro}
          </div>
        )}

        <div className="mt-7 grid gap-3">
          <button type="button" className={`${socialButton} bg-white text-neutral-900 hover:bg-neutral-100`} onClick={() => handleSocialLogin('google')} disabled={loading}>
            <span aria-hidden="true" className="grid size-6 place-items-center rounded-full bg-white font-black text-blue-600">G</span>
            Entrar com Google
          </button>
          <button type="button" className={`${socialButton} bg-[#5865f2] text-white hover:bg-[#6874f5]`} onClick={() => handleSocialLogin('discord')} disabled={loading}>
            <span aria-hidden="true" className="font-black">◉</span>
            Entrar com Discord
          </button>
        </div>

        <div className="my-7 flex items-center gap-3 text-xs font-bold text-neutral-500 before:h-px before:flex-1 before:bg-white/10 after:h-px after:flex-1 after:bg-white/10">
          ou continue com email
        </div>

        <form className="grid gap-5" onSubmit={handleEmailLogin}>
          <label className="grid gap-2 text-sm font-bold text-neutral-300">
            Email
            <input
              type="email"
              className="min-h-12 rounded-xl border border-white/10 bg-neutral-950/70 px-4 text-white placeholder:text-neutral-600 focus:border-gold"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              autoComplete="email"
              placeholder="seu@email.com"
            />
          </label>
          <label className="grid gap-2 text-sm font-bold text-neutral-300">
            Senha
            <input
              type="password"
              className="min-h-12 rounded-xl border border-white/10 bg-neutral-950/70 px-4 text-white placeholder:text-neutral-600 focus:border-gold"
              value={senha}
              onChange={(event) => setSenha(event.target.value)}
              required
              autoComplete="current-password"
              placeholder="******"
            />
          </label>
          <button type="submit" className="min-h-12 rounded-xl bg-gold font-black text-neutral-950 transition hover:bg-gold-light disabled:cursor-not-allowed disabled:opacity-60" disabled={loading}>
            {loading ? 'Processando...' : 'Acessar Conta'}
          </button>
        </form>

        <Link href="/" className="mx-auto mt-7 table text-sm font-bold text-neutral-400 no-underline hover:text-gold-light">
          ← Voltar ao início
        </Link>
      </section>
      </Reveal>
    </main>
  );
}
