import Link from 'next/link';

const links = [
  { href: '/', label: 'Início', index: '01' },
  { href: '/historia', label: 'História', index: '02' },
  { href: '/personagens', label: 'Personagens', index: '03' },
  { href: '/sobre', label: 'Sobre', index: '04' },
] as const;

type SiteNavProps = {
  active?: (typeof links)[number]['href'];
};

export default function SiteNav({ active }: SiteNavProps) {
  return (
    <nav className="relative max-w-full rounded-full border border-white/10 bg-[#0b0a08]/95 p-1 shadow-[0_16px_45px_rgba(0,0,0,0.35)] backdrop-blur-sm" aria-label="Navegação principal">
      <div aria-hidden="true" className="absolute inset-x-8 -top-px h-px bg-gradient-to-r from-transparent via-gold/70 to-transparent" />
      <div className="scrollbar-hidden flex max-w-full items-center gap-1 overflow-x-auto">
        {links.map((link) => {
          const isActive = active === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive ? 'page' : undefined}
              className={`group relative isolate flex min-h-10 shrink-0 items-center gap-2 overflow-hidden rounded-full px-3.5 text-xs font-black no-underline transition-all duration-300 sm:px-4 sm:text-sm ${
                isActive
                  ? 'bg-gold text-neutral-950 shadow-[0_0_28px_rgba(255,193,7,0.24)]'
                  : 'text-neutral-400 hover:-translate-y-0.5 hover:bg-white/[0.055] hover:text-gold-light'
              }`}
            >
              <span aria-hidden="true" className={`font-mono text-[0.5rem] tracking-wider transition ${isActive ? 'text-neutral-950/55' : 'text-gold/35 group-hover:text-gold/70'}`}>{link.index}</span>
              <span className="relative">{link.label}</span>
              <span aria-hidden="true" className={`size-1 rounded-full transition-all duration-300 ${isActive ? 'bg-neutral-950' : 'bg-gold opacity-0 group-hover:opacity-100 group-hover:shadow-[0_0_10px_var(--color-gold)]'}`} />
              {!isActive && <span aria-hidden="true" className="absolute inset-x-4 bottom-0 h-px origin-left scale-x-0 bg-gold transition-transform duration-300 group-hover:scale-x-100" />}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
