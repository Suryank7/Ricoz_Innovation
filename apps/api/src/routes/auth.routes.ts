import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.get('/me', authenticate, AuthController.me);
router.post('/logout', authenticate, AuthController.logout);

// Database seed trigger (accessible via GET or POST for easy cloud initialization)
router.get('/seed', AuthController.seed);
router.post('/seed', AuthController.seed);

export default router;
