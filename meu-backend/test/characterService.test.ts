import assert from 'node:assert/strict';
import test from 'node:test';
import CharacterService from '../src/services/characterService';

test('lista os 12 personagens migrados em ordem alfabética', () => {
  const characters = CharacterService.getCharacters();
  assert.equal(characters.length, 12);
  assert.equal(characters[0]?.nome, 'agug');
  assert.equal(characters.at(-1)?.nome, 'ness');
});

test('retorna mídias e falas sem diferenciar maiúsculas', () => {
  const luis = CharacterService.getCharacter('LUIS');
  assert.ok(luis);
  assert.equal(luis.nome, 'luis');
  assert.equal(luis.media.length, 4);
  assert.equal(luis.balloons.length, 5);
});

test('retorna null quando o personagem não existe', () => {
  assert.equal(CharacterService.getCharacter('desconhecido'), null);
});
