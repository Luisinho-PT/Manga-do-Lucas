import type { RequestHandler } from 'express';
import { getAdminIds, getDiscordId } from '../utils/auth';

const adminMiddleware: RequestHandler = (request, response, next) => {
  if (!request.user) {
    response.status(401).json({ error: 'Usuário não autenticado.' });
    return;
  }

  const discordId = getDiscordId(request.user);
  if (!discordId || !getAdminIds().includes(discordId)) {
    response.status(403).json({ error: 'Acesso negado. Permissão de administrador necessária.' });
    return;
  }

  request.isAdmin = true;
  next();
};

export default adminMiddleware;
