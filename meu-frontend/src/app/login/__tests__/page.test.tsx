import { render, screen } from '@testing-library/react';
import LoginPage from '../page';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace: jest.fn() }),
}));

jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithOAuth: jest.fn(),
      signInWithPassword: jest.fn(),
    },
  },
}));

describe('Login Page', () => {
  beforeEach(() => jest.clearAllMocks());

  it.each([
    ['Manga do Luquinhas'],
    ['Faça login para comentar'],
    ['Entrar com Google'],
    ['Entrar com Discord'],
    ['ou continue com email'],
    ['Acessar Conta'],
  ])('renderiza o texto "%s"', (text) => {
    render(<LoginPage />);
    expect(screen.getByText(text)).toBeInTheDocument();
  });

  it('renderiza os campos obrigatórios', () => {
    render(<LoginPage />);
    expect(screen.getByPlaceholderText('seu@email.com')).toBeRequired();
    expect(screen.getByPlaceholderText('******')).toBeRequired();
  });

  it('mantém os botões habilitados inicialmente', () => {
    render(<LoginPage />);
    expect(screen.getByText('Entrar com Google')).toBeEnabled();
    expect(screen.getByText('Entrar com Discord')).toBeEnabled();
    expect(screen.getByText('Acessar Conta')).toBeEnabled();
  });
});
