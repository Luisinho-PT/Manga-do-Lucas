import type { RequestHandler } from 'express';
import DiscordService from '../services/discordService';
import GithubService from '../services/githubService';
import SystemService from '../services/systemService';
import { getAdminIds, getDiscordId, getDisplayName, getProviderAvatar } from '../utils/auth';

type CommentBody = {
  mensagem?: unknown;
};

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Erro interno inesperado.';
}

const listarComentarios: RequestHandler = async (_request, response) => {
  try {
    response.json(await SystemService.getComments());
  } catch (error) {
    console.error('Erro ao listar comentários:', errorMessage(error));
    response.status(500).json({ error: 'Não foi possível carregar os comentários.' });
  }
};

const criarComentario: RequestHandler<Record<string, never>, unknown, CommentBody> = async (request, response) => {
  const mensagem = typeof request.body.mensagem === 'string' ? request.body.mensagem.trim() : '';

  if (!request.user) {
    response.status(401).json({ error: 'Usuário não autenticado.' });
    return;
  }
  if (!mensagem || mensagem.length > 280) {
    response.status(400).json({ error: 'A mensagem deve ter entre 1 e 280 caracteres.' });
    return;
  }

  try {
    const discordId = getDiscordId(request.user);
    let avatar = getProviderAvatar(request.user);
    if (discordId) {
      try {
        avatar = (await DiscordService.getAvatar(discordId)).avatar_url;
      } catch (error) {
        console.warn('Avatar ao publicar indisponível; usando avatar do provedor:', errorMessage(error));
      }
    }
    const created = await SystemService.createComment({
      nome: getDisplayName(request.user),
      mensagem,
      fixado: false,
      avatar_url: avatar,
      user_id: request.user.id,
    });
    response.status(201).json(created);
  } catch (error) {
    console.error('Erro ao criar comentário:', errorMessage(error));
    response.status(500).json({ error: 'Não foi possível publicar o comentário.' });
  }
};

const obterVersao: RequestHandler = async (_request, response) => {
  try {
    const storedVersion = await SystemService.getLastVersion();
    response.json({ ...(storedVersion ?? {}), numero: '0.5 (Beta)' });
  } catch (error) {
    console.error('Não foi possível consultar a data da versão:', errorMessage(error));
    response.json({ numero: '0.5 (Beta)' });
  }
};

const listarChangelog: RequestHandler = async (_request, response) => {
  response.json(await GithubService.getCommitsDireto());
};

const sincronizarAvatar: RequestHandler = async (request, response) => {
  if (!request.user) {
    response.status(401).json({ error: 'Usuário não autenticado.' });
    return;
  }

  try {
    const discordId = getDiscordId(request.user);
    const avatarUrl = discordId
      ? (await DiscordService.getAvatar(discordId)).avatar_url
      : getProviderAvatar(request.user);
    if (!avatarUrl) {
      response.status(404).json({ error: 'Esta conta não possui um avatar sincronizável.' });
      return;
    }
    const result = await SystemService.updateAvatarByUserId(request.user.id, avatarUrl);
    response.json({ avatar_url: avatarUrl, ...result });
  } catch (error) {
    console.error('Erro ao sincronizar avatar:', errorMessage(error));
    response.status(502).json({ error: 'Não foi possível sincronizar o avatar agora.' });
  }
};

const verificarAdmin: RequestHandler = (request, response) => {
  const discordId = request.user ? getDiscordId(request.user) : null;
  response.json({ isAdmin: Boolean(discordId && getAdminIds().includes(discordId)) });
};

const deletarComentario: RequestHandler<{ id: string }> = async (request, response) => {
  try {
    response.json(await SystemService.deleteComment(request.params.id));
  } catch (error) {
    console.error('Erro ao deletar comentário:', errorMessage(error));
    response.status(500).json({ error: 'Não foi possível deletar o comentário.' });
  }
};

const fixarComentario: RequestHandler<{ id: string }> = async (request, response) => {
  try {
    response.json(await SystemService.togglePin(request.params.id));
  } catch (error) {
    console.error('Erro ao fixar comentário:', errorMessage(error));
    response.status(500).json({ error: 'Não foi possível alterar o destaque do comentário.' });
  }
};

export default {
  listarComentarios,
  criarComentario,
  obterVersao,
  listarChangelog,
  sincronizarAvatar,
  verificarAdmin,
  deletarComentario,
  fixarComentario,
};
