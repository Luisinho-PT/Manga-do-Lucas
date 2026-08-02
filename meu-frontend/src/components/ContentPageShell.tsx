import type { ReactNode } from 'react';
import Reveal from './Reveal';
import ScrollBackground from './ScrollBackground';
import SiteNav from './SiteNav';

type Route = '/' | '/historia' | '/personagens' | '/sobre';

type ContentPageShellProps = {
  eyebrow: string;
  title: string;
  lead: string;
  active: Route;
  children: ReactNode;
};

export default function ContentPageShell({
  eyebrow,
  title,
  lead,
  active,
  children,
}: ContentPageShellProps) {
  return (
    <main className="relative min-h-screen overflow-hidden px-5 py-8 sm:py-12">
      <ScrollBackground />
      <div className="relative z-10 mx-auto w-full max-w-4xl">
        <header className="mb-12 grid justify-items-center gap-5 text-center">
          <span className="text-xs font-black tracking-[0.2em] text-gold uppercase">{eyebrow}</span>
          <h1 className="text-gradient-gold font-heading text-5xl leading-none font-black sm:text-7xl">
            {title}
          </h1>
          <p className="max-w-2xl text-base text-neutral-400 sm:text-xl">{lead}</p>
          <SiteNav active={active} />
        </header>
        <Reveal>{children}</Reveal>
      </div>
    </main>
  );
}
