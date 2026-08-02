import { Router } from 'express';
import CharacterController from '../controllers/characterController';

const router = Router();

router.get('/', CharacterController.listarPersonagens);
router.get('/:nome', CharacterController.obterPersonagem);

export default router;
