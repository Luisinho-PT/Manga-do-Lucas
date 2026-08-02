import type { RequestHandler } from 'express';
import CharacterService from '../services/characterService';

const listarPersonagens: RequestHandler = (_request, response) => {
  response.json(CharacterService.getCharacters());
};

const obterPersonagem: RequestHandler<{ nome: string }> = (request, response) => {
  const character = CharacterService.getCharacter(request.params.nome);
  if (!character) {
    response.status(404).json({ error: 'Personagem não encontrado' });
    return;
  }
  response.json(character);
};

const CharacterController = { listarPersonagens, obterPersonagem };

export default CharacterController;
