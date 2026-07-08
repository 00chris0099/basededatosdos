import { Router } from 'express';
import { getAll, getById, create, update, deactivate } from '../controllers/users.controller';
import { verifyToken } from '../middleware/auth';
import { canManage } from '../middleware/roles';

const router = Router();

router.get('/', verifyToken, canManage, getAll);
router.get('/:id', verifyToken, canManage, getById);
router.post('/', verifyToken, canManage, create);
router.put('/:id', verifyToken, update);
router.delete('/:id', verifyToken, canManage, deactivate);

export default router;
