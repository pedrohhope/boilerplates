import { Router } from 'express';
import { UserController } from './controllers/user.controller';
import { authMiddleware } from '../../shared/middleware/auth.middleware';
import { validate } from '../../shared/middleware/validate.middleware';
import { CreateUserDtoSchema } from './dtos/create-user.dto';
import { UpdateUserDtoSchema } from './dtos/update-user.dto';

const router = Router();
const userController = new UserController();

router.use(authMiddleware);

router.get('/', userController.findAll);
router.get('/:id', userController.findById);
router.post('/', validate(CreateUserDtoSchema), userController.create);
router.put('/:id', validate(UpdateUserDtoSchema), userController.update);
router.delete('/:id', userController.delete);

export default router;
