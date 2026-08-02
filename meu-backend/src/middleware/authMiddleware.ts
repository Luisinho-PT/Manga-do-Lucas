import type { RequestHandler } from 'express';
import supabase from '../config/supabase';

const authMiddleware: RequestHandler = async (request, response, next) => {
  const authHeader = request.headers.authorization;
  const [scheme, token] = authHeader?.split(' ') ?? [];

  if (scheme !== 'Bearer' || !token) {
    response.status(401).json({ error: 'Token de autenticação não fornecido ou inválido.' });
    return;
  }

  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) {
    response.status(403).json({ error: 'Sessão inválida ou expirada.' });
    return;
  }

  const allowedEmails = (process.env.PRIVATE_ACCESS_EMAILS || '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
  if (allowedEmails.length > 0 && (!user.email || !allowedEmails.includes(user.email.toLowerCase()))) {
    response.status(403).json({ error: 'Este usuário não faz parte da lista privada do projeto.' });
    return;
  }

  request.user = user;
  next();
};

export default authMiddleware;
