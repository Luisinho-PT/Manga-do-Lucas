import type { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import { redirect } from 'next/navigation';
import { canAccessSecret } from '@/lib/secretAccess';
import SecretLayout from '../layout';

jest.mock('@/lib/secretAccess', () => ({ canAccessSecret: jest.fn() }));
jest.mock('next/navigation', () => ({ redirect: jest.fn() }));

const mockedCanAccessSecret = jest.mocked(canAccessSecret);
const mockedRedirect = jest.mocked(redirect);

async function renderLayout(children: ReactNode) {
  const result = await SecretLayout({ children });
  render(result);
}

describe('SecretLayout', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renderiza a rota para o proprietário autenticado', async () => {
    mockedCanAccessSecret.mockResolvedValue(true);
    await renderLayout(<p>conteúdo protegido</p>);

    expect(screen.getByText('conteúdo protegido')).toBeInTheDocument();
    expect(mockedRedirect).not.toHaveBeenCalled();
  });

  it('redireciona visitantes sem permissão para a tela intermediária', async () => {
    mockedCanAccessSecret.mockResolvedValue(false);
    await renderLayout(<p>conteúdo protegido</p>);

    expect(mockedRedirect).toHaveBeenCalledWith('/soon');
  });
});
