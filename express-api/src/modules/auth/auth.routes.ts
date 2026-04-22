import { Router } from 'express';
import { AuthController } from './controllers/auth.controller';
import { authMiddleware } from '../../shared/middleware/auth.middleware';
import { validate } from '../../shared/middleware/validate.middleware';
import { RegisterDtoSchema } from './dtos/register.dto';
import { LoginDtoSchema } from './dtos/login.dto';
import { RefreshTokenDtoSchema } from './dtos/refresh-token.dto';

const router = Router();
const authController = new AuthController();

router.post('/register', validate(RegisterDtoSchema), authController.register);
router.post('/login', validate(LoginDtoSchema), authController.login);
router.post('/refresh', validate(RefreshTokenDtoSchema), authController.refresh);
router.post('/logout', validate(RefreshTokenDtoSchema), authController.logout);
router.post('/logout-all', authMiddleware, authController.logoutAll);
router.get('/me', authMiddleware, authController.me);

export default router;
