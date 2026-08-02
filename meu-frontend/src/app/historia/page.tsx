import type { Metadata } from 'next';
import Link from 'next/link';
import ContentPageShell from '@/components/ContentPageShell';

export const metadata: Metadata = { title: 'História | Mangá do Luquinhas' };

export default function HistoriaPage() {
  return (
    <ContentPageShell
      eyebrow="Mangá do Luquinhas"
      title="História"
      lead="A origem da aventura mais improvável do multiverso."
      active="/historia"
    >
      <section className="panel animate-fade-up rounded-3xl p-7 text-center sm:p-12">
        <span className="inline-flex rounded-full border border-gold/35 bg-gold/10 px-3 py-1 text-xs font-black tracking-widest text-gold-light uppercase">
          Em construção
        </span>
        <h2 className="mt-5 font-heading text-2xl font-black text-gold-light sm:text-3xl">
          A história ainda está sendo escrita
        </h2>
        <p className="mt-4 text-neutral-300">Alguma hora eu faço isso aqui... mó preguiça KKKKKKK.</p>
        <p className="mt-2 text-neutral-400">Enquanto isso, conheça o elenco e as mídias já publicadas de cada personagem.</p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link className="rounded-full bg-gold px-5 py-3 font-black text-neutral-950 transition hover:-translate-y-0.5 hover:shadow-[0_0_24px_rgba(255,193,7,0.3)]" href="/personagens">
            Conhecer personagens
          </Link>
          <Link className="rounded-full border border-gold px-5 py-3 font-black text-gold-light transition hover:-translate-y-0.5 hover:bg-gold/10" href="/sobre">
            Conhecer o projeto
          </Link>
        </div>
      </section>
    </ContentPageShell>
  );
}
