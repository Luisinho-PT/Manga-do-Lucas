import type { AnchorHTMLAttributes, ImgHTMLAttributes, ReactNode } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { fetchPersonagens } from '@/lib/api';
import PersonagensPage from '../page';

jest.mock('next/link', () => function MockLink({ children, href, ...props }: AnchorHTMLAttributes<HTMLAnchorElement> & { children: ReactNode; href: string }) {
  return <a href={href} {...props}>{children}</a>;
});

jest.mock('next/image', () => function MockImage({ fill: _fill, priority: _priority, ...props }: ImgHTMLAttributes<HTMLImageElement> & { fill?: boolean; priority?: boolean }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img {...props} alt={props.alt || ''} />;
});

jest.mock('@/lib/api', () => ({ fetchPersonagens: jest.fn() }));

const mockedFetchPersonagens = jest.mocked(fetchPersonagens);
const mockPersonagens = [
  { nome: 'lucas', imagem: '/img/lucas/lucas.png' },
  { nome: 'agug', imagem: '/img/agug/agug.png' },
  { nome: 'berimbau', imagem: '/img/berimbau/berimbau.png' },
];

describe('PersonagensPage', () => {
  beforeEach(() => jest.clearAllMocks());

  it('exibe o estado de loading inicialmente', () => {
    mockedFetchPersonagens.mockReturnValue(new Promise(() => undefined));
    render(<PersonagensPage />);
    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });

  it('renderiza cards, imagens e links', async () => {
    mockedFetchPersonagens.mockResolvedValue(mockPersonagens);
    render(<PersonagensPage />);
    await waitFor(() => expect(screen.getByTestId('character-grid')).toBeInTheDocument());
    expect(screen.getByText('Lucas').closest('a')).toHaveAttribute('href', '/personagens/lucas');
    expect(screen.getByAltText('Lucas')).toHaveAttribute('src', '/img/lucas/lucas.png');
    expect(screen.getByText('Agug')).toBeInTheDocument();
    expect(screen.getByText('Berimbau')).toBeInTheDocument();
  });

  it('exibe o botão de retorno', async () => {
    mockedFetchPersonagens.mockResolvedValue([]);
    render(<PersonagensPage />);
    await waitFor(() => expect(screen.getByTestId('character-grid')).toBeInTheDocument());
    expect(screen.getByText('Voltar para a Página Inicial')).toHaveAttribute('href', '/');
  });

  it('trata erro da API', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    mockedFetchPersonagens.mockRejectedValue(new Error('Erro de rede'));
    render(<PersonagensPage />);
    await waitFor(() => expect(screen.getByTestId('error')).toHaveTextContent('Não foi possível carregar os personagens.'));
    consoleSpy.mockRestore();
  });
});
