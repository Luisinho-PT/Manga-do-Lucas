import {
  checkAdmin,
  deletarComentarioAPI,
  enviarComentario,
  fetchChangelog,
  fetchComentarios,
  fetchPersonagem,
  fetchPersonagens,
  fetchVersao,
  fixarComentarioAPI,
  syncDiscordAvatar,
} from '../api';

const mockFetch = jest.fn<ReturnType<typeof fetch>, Parameters<typeof fetch>>();

function response(data: unknown, options: { ok?: boolean; status?: number } = {}): Response {
  return {
    ok: options.ok ?? true,
    status: options.status ?? 200,
    json: jest.fn().mockResolvedValue(data),
  } as unknown as Response;
}

beforeEach(() => {
  mockFetch.mockReset();
  global.fetch = mockFetch;
});

describe('API', () => {
  it('busca a versão', async () => {
    mockFetch.mockResolvedValue(response({ numero: '2.0.0', atualizado_em: '2026-03-20' }));
    await expect(fetchVersao('token')).resolves.toEqual({ numero: '2.0.0', atualizado_em: '2026-03-20' });
    expect(mockFetch).toHaveBeenCalledWith('/api/system/version', expect.objectContaining({
      headers: expect.objectContaining({ Authorization: 'Bearer token' }),
    }));
  });

  it('informa falha ao buscar versão', async () => {
    mockFetch.mockResolvedValue(response(null, { ok: false, status: 500 }));
    await expect(fetchVersao('token')).rejects.toThrow('Erro ao buscar versão');
  });

  it('busca a lista de personagens', async () => {
    const characters = [{ nome: 'lucas', imagem: '/img/lucas/lucas.png' }];
    mockFetch.mockResolvedValue(response(characters));
    await expect(fetchPersonagens('token')).resolves.toEqual(characters);
    expect(mockFetch).toHaveBeenCalledWith('/api/characters', expect.objectContaining({
      headers: expect.objectContaining({ Authorization: 'Bearer token' }),
    }));
  });

  it('normaliza uma resposta inválida de personagens', async () => {
    mockFetch.mockResolvedValue(response({ error: true }));
    await expect(fetchPersonagens()).resolves.toEqual([]);
  });

  it('busca um personagem e trata 404', async () => {
    const character = { nome: 'lucas', imagem: '/img/lucas/lucas.png', media: [], balloons: [] };
    mockFetch.mockResolvedValueOnce(response(character));
    await expect(fetchPersonagem('lucas', 'token')).resolves.toEqual(character);
    expect(mockFetch).toHaveBeenLastCalledWith('/api/characters/lucas', expect.objectContaining({
      headers: expect.objectContaining({ Authorization: 'Bearer token' }),
    }));
    mockFetch.mockResolvedValueOnce(response(null, { ok: false, status: 404 }));
    await expect(fetchPersonagem('desconhecido')).resolves.toBeNull();
  });

  it('normaliza changelog e comentários', async () => {
    mockFetch.mockResolvedValueOnce(response([{ message: 'commit', date: '2026-01-01' }]));
    await expect(fetchChangelog('token')).resolves.toHaveLength(1);
    mockFetch.mockResolvedValueOnce(response(null));
    await expect(fetchComentarios('token')).resolves.toEqual([]);
  });

  it('envia um comentário autenticado', async () => {
    const created = { id: 1, nome: 'João', mensagem: 'Oi', criado_em: '2026-01-01', fixado: false, avatar_url: null };
    mockFetch.mockResolvedValue(response(created));
    await expect(enviarComentario({ mensagem: 'Oi' }, 'token')).resolves.toEqual(created);
    expect(mockFetch).toHaveBeenCalledWith('/api/system/comments', expect.objectContaining({
      method: 'POST',
      headers: expect.objectContaining({ Authorization: 'Bearer token' }),
      body: JSON.stringify({ mensagem: 'Oi' }),
    }));
  });

  it('sincroniza o avatar sem enviar identidade controlada pelo cliente', async () => {
    mockFetch.mockResolvedValue(response({ avatar_url: 'https://cdn.discordapp.com/avatar.png', atualizados: 2 }));
    await expect(syncDiscordAvatar('token')).resolves.toEqual({
      avatar_url: 'https://cdn.discordapp.com/avatar.png',
      atualizados: 2,
    });
    expect(mockFetch).toHaveBeenCalledWith('/api/system/profile/sync-avatar', expect.objectContaining({
      method: 'PATCH',
      headers: expect.objectContaining({ Authorization: 'Bearer token' }),
    }));
  });

  it('retorna falso quando a verificação de admin falha', async () => {
    mockFetch.mockResolvedValue(response(null, { ok: false, status: 401 }));
    await expect(checkAdmin('token')).resolves.toEqual({ isAdmin: false });
  });

  it('envia comandos administrativos', async () => {
    mockFetch.mockResolvedValueOnce(response({ sucesso: true }));
    await expect(deletarComentarioAPI(42, 'token')).resolves.toEqual({ sucesso: true });
    expect(mockFetch).toHaveBeenLastCalledWith('/api/system/comments/42', expect.objectContaining({ method: 'DELETE' }));

    mockFetch.mockResolvedValueOnce(response({ id: 7, fixado: true }));
    await fixarComentarioAPI(7, true, 'token');
    expect(mockFetch).toHaveBeenLastCalledWith('/api/system/comments/7/pin', expect.objectContaining({
      method: 'PATCH',
      body: JSON.stringify({ fixado: true }),
    }));
  });
});
