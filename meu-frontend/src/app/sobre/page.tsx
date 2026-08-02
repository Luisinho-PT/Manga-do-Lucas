import type { Metadata } from 'next';
import Link from 'next/link';
import ContentPageShell from '@/components/ContentPageShell';

export const metadata: Metadata = { title: 'Sobre | Mangá do Luquinhas' };

const secondaryButton = 'rounded-full border border-gold px-5 py-3 font-black text-gold-light no-underline transition hover:-translate-y-0.5 hover:bg-gold/10';

export default function SobrePage() {
  return (
    <ContentPageShell
      eyebrow="O projeto"
      title="Sobre o site"
      lead="Uma homenagem criada com amizade, memes e muita história."
      active="/sobre"
    >
      <section className="panel animate-fade-up rounded-3xl p-7 sm:p-12">
        <h2 className="font-heading text-2xl font-black text-gold-light sm:text-3xl">Sobre o projeto</h2>
        <p className="mt-4 leading-8 text-neutral-300">
          Este site está sendo feito em homenagem ao meu grandiosíssimo amigo Lucas. Sem ele, este projeto não existiria — todos os créditos vão para ele por ter criado essa história maravilhosa.
        </p>
        <p className="mt-3 leading-8 text-neutral-300">O site foi criado pelo Luis e seu código-fonte está disponível publicamente no GitHub.</p>
        <div className="mt-7 flex flex-wrap gap-3">
          <a className="rounded-full bg-gold px-5 py-3 font-black text-neutral-950 no-underline transition hover:-translate-y-0.5" href="https://github.com/Luisinho-PT/Manga-do-Lucas" target="_blank" rel="noopener noreferrer">
            Acessar GitHub
          </a>
          <Link className={secondaryButton} href="/#mural">Ir para o mural</Link>
        </div>

        <h3 className="mt-10 font-heading text-xl font-black text-gold">Contato</h3>
        <ul className="mt-4 flex list-none flex-wrap gap-3 p-0">
          <li><a className={secondaryButton} href="mailto:luismiguelsousa48@gmail.com">Enviar e-mail</a></li>
          <li><span className={secondaryButton}>Discord: luismig_uel</span></li>
        </ul>
      </section>
      <Link className="mx-auto mt-8 table font-bold text-gold-light no-underline hover:text-white" href="/">
        ← Voltar para a página inicial
      </Link>
    </ContentPageShell>
  );
}
