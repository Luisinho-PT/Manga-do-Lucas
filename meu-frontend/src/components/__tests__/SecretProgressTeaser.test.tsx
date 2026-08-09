import { fireEvent, render, screen } from '@testing-library/react';
import SecretProgressTeaser from '../SecretProgressTeaser';

describe('SecretProgressTeaser', () => {
  beforeEach(() => window.history.replaceState({}, '', '/'));

  it('revela cada barra e mostra EM BREVE somente após os três sinais', () => {
    render(<SecretProgressTeaser />);

    expect(window.location.pathname).toBe('/');
    expect(window.location.search).toBe('???');

    const moon = screen.getByRole('button', { name: 'Selecionar sinal 🌒' });
    const spiral = screen.getByRole('button', { name: 'Selecionar sinal 🌀' });
    const bubble = screen.getByRole('button', { name: 'Selecionar sinal 🫧' });

    expect(screen.queryByText('EM BREVE')).not.toBeInTheDocument();
    expect(screen.queryAllByRole('progressbar')).toHaveLength(0);

    fireEvent.pointerDown(moon);
    expect(screen.getByRole('progressbar', { name: 'Progresso do sinal 🌒' })).toHaveAttribute('aria-valuenow', '10');
    expect(screen.queryByText('EM BREVE')).not.toBeInTheDocument();

    fireEvent.click(spiral);
    expect(screen.getByRole('progressbar', { name: 'Progresso do sinal 🌀' })).toHaveAttribute('aria-valuenow', '40');

    fireEvent.click(bubble);
    expect(screen.getByRole('progressbar', { name: 'Progresso do sinal 🫧' })).toHaveAttribute('aria-valuenow', '30');
    expect(screen.getByRole('status')).toHaveTextContent('EM BREVE');
  });

  it('não remove um sinal quando ele é selecionado novamente', () => {
    render(<SecretProgressTeaser />);
    const moon = screen.getByRole('button', { name: 'Selecionar sinal 🌒' });

    fireEvent.click(moon);
    fireEvent.click(moon);

    expect(moon).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getAllByRole('progressbar')).toHaveLength(1);
  });
});
