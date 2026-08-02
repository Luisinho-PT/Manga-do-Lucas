import { Router } from 'express';
import SystemController from '../controllers/systemController';
import adminMiddleware from '../middleware/adminMiddleware';
import authMiddleware from '../middleware/authMiddleware';
import { createUserRateLimit } from '../middleware/userRateLimitMiddleware';

const router = Router();
const commentRateLimit = createUserRateLimit({
  max: 5,
  windowMs: 10 * 60_000,
  message: 'Limite de comentários atingido. Aguarde alguns minutos.',
});
const avatarRateLimit = createUserRateLimit({
  max: 12,
  windowMs: 60 * 60_000,
  message: 'O avatar já foi verificado recentemente. Tente novamente mais tarde.',
});

router.get('/comments', SystemController.listarComentarios);
router.get('/version', SystemController.obterVersao);
router.get('/changelog', SystemController.listarChangelog);

router.post('/comments', authMiddleware, commentRateLimit, SystemController.criarComentario);
router.patch('/profile/sync-avatar', authMiddleware, avatarRateLimit, SystemController.sincronizarAvatar);
router.get('/check-admin', authMiddleware, SystemController.verificarAdmin);

router.delete('/comments/:id', authMiddleware, adminMiddleware, SystemController.deletarComentario);
router.patch('/comments/:id/pin', authMiddleware, adminMiddleware, SystemController.fixarComentario);

export default router;
