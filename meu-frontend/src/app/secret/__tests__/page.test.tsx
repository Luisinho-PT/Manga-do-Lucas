import { fireEvent, render, screen, within } from '@testing-library/react';
import SecretPage from '../page';

describe('SecretPage', () => {
  it('renderiza a arena secreta e o grupo completo', () => {
    render(<SecretPage />);

    expect(screen.getByRole('heading', { level: 1, name: 'Prévia da batalha secreta' })).toBeInTheDocument();
    expect(screen.getByTestId('secret-battle-interface')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'LUIS' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'MACHIEL' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'NESS' })).toBeInTheDocument();
  });

  it('exibe HP e os cinco comandos de cada personagem', () => {
    render(<SecretPage />);

    expect(screen.getByLabelText('HP 90 de 90')).toBeInTheDocument();
    expect(screen.getByLabelText('HP 110 de 110')).toBeInTheDocument();
    expect(screen.getByLabelText('HP 80 de 80')).toBeInTheDocument();

    for (const name of ['LUIS', 'MACHIEL', 'NESS']) {
      const commands = screen.getByRole('list', { name: `Comandos de ${name}` });
      expect(within(commands).getAllByRole('listitem')).toHaveLength(5);
      expect(within(commands).getByLabelText('Lutar')).toBeInTheDocument();
      expect(within(commands).getByLabelText('Agir')).toBeInTheDocument();
      expect(within(commands).getByLabelText('Item')).toBeInTheDocument();
      expect(within(commands).getByLabelText('Poupar')).toBeInTheDocument();
      expect(within(commands).getByLabelText('Defender')).toBeInTheDocument();
    }
  });

  it('mantém uma saída acessível para a página inicial', () => {
    render(<SecretPage />);
    expect(screen.getByRole('link', { name: 'Sair da batalha e voltar ao início' })).toHaveAttribute('href', '/');
  });

  it('avança os comandos de Luis para Machiel, Ness e o próximo turno', () => {
    render(<SecretPage />);

    const luisCommands = screen.getByRole('list', { name: 'Comandos de LUIS' });
    const machielCommands = screen.getByRole('list', { name: 'Comandos de MACHIEL' });
    const nessCommands = screen.getByRole('list', { name: 'Comandos de NESS' });
    const luisAct = within(luisCommands).getByRole('button', { name: 'Agir' });
    const machielItem = within(machielCommands).getByRole('button', { name: 'Item' });
    const nessDefend = within(nessCommands).getByRole('button', { name: 'Defender' });

    expect(luisAct).toBeEnabled();
    expect(machielItem).toBeDisabled();
    expect(nessDefend).toBeDisabled();

    fireEvent.click(luisAct);
    expect(luisAct).toBeDisabled();
    expect(luisAct).toHaveAttribute('aria-pressed', 'true');
    expect(machielItem).toBeEnabled();

    fireEvent.click(machielItem);
    expect(machielItem).toBeDisabled();
    expect(machielItem).toHaveAttribute('aria-pressed', 'true');
    expect(nessDefend).toBeEnabled();

    fireEvent.click(nessDefend);
    expect(nessDefend).toBeDisabled();
    expect(nessDefend).toHaveAttribute('aria-pressed', 'true');
    expect(luisAct).toBeEnabled();
  });
});
