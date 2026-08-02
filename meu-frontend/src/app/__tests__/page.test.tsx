import type { AnchorHTMLAttributes, ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import Home from '../page';

jest.mock('next/link', () => function MockLink({ children, href, ...props }: AnchorHTMLAttributes<HTMLAnchorElement> & { children: ReactNode; href: string }) {
  return <a href={href} {...props}>{children}</a>;
});

jest.mock('next/image', () => function MockImage({ fill: _fill, priority: _priority, unoptimized: _unoptimized, ...props }: React.ImgHTMLAttributes<HTMLImageElement> & { fill?: boolean; priority?: boolean; unoptimized?: boolean }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img {...props} alt={props.alt || ''} />;
});

jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: jest.fn(() => new Promise(() => undefined)),
      getSession: jest.fn(() => new Promise(() => undefined)),
      signOut: jest.fn(),
    },
  },
}));

jest.mock('@/lib/api', () => ({
  fetchVersao: jest.fn(() => new Promise(() => undefined)),
  fetchChangelog: jest.fn(() => new Promise(() => undefined)),
  fetchComentarios: jest.fn(() => new Promise(() => undefined)),
  checkAdmin: jest.fn().mockResolvedValue({ isAdmin: false }),
  enviarComentario: jest.fn(),
  deletarComentarioAPI: jest.fn(),
  fixarComentarioAPI: jest.fn(),
  syncDiscordAvatar: jest.fn(),
}));

describe('Home Page', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renderiza o título principal', () => {
    render(<Home />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Bem-vindo ao Mangá do Luquinhas!');
  });

  it('renderiza a navegação principal', () => {
    render(<Home />);
    expect(screen.getByText('História').closest('a')).toHaveAttribute('href', '/historia');
    expect(screen.getByText('Personagens').closest('a')).toHaveAttribute('href', '/personagens');
    expect(screen.getByText('Sobre').closest('a')).toHaveAttribute('href', '/sobre');
  });

  it('renderiza changelog, mural, login e rodapé', () => {
    render(<Home />);
    expect(screen.getByText('Últimas Atualizações')).toBeInTheDocument();
    expect(screen.getByText('Mural de Recados')).toBeInTheDocument();
    expect(screen.getByText('Entrar / Cadastrar')).toBeInTheDocument();
    expect(screen.getByText(new RegExp(String(new Date().getFullYear())))).toBeInTheDocument();
  });
});
