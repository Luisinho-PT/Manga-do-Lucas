import { act, fireEvent, render, screen } from '@testing-library/react';
import LuisStarfield from '../LuisStarfield';

describe('LuisStarfield', () => {
  it('renderiza o campo decorativo com estrelas determinísticas', () => {
    render(<LuisStarfield />);
    const field = screen.getByTestId('luis-starfield');
    expect(field).toHaveAttribute('aria-hidden', 'true');
    expect(field.querySelectorAll('[data-star]')).toHaveLength(18);
  });

  it('mantém as constelações fora da árvore de acessibilidade', () => {
    render(<LuisStarfield />);
    expect(screen.getByTestId('luis-starfield').querySelector('svg')).toBeInTheDocument();
  });

  it('invoca estrelas no ponto clicado e remove a explosão depois da animação', () => {
    jest.useFakeTimers();
    render(<LuisStarfield />);

    fireEvent(document.body, new MouseEvent('pointerdown', {
      bubbles: true,
      clientX: 120,
      clientY: 180,
    }));
    expect(screen.getByTestId('luis-star-burst')).toHaveStyle({ left: '120px', top: '180px' });

    act(() => jest.advanceTimersByTime(1_700));
    expect(screen.queryByTestId('luis-star-burst')).not.toBeInTheDocument();
    jest.useRealTimers();
  });
});
