import { Router } from 'express';
import { getAll, getById, create, update, deleteProduct, addMovement } from '../controllers/products.controller';
import { verifyToken } from '../middleware/auth';
import { canManage, canSupervise } from '../middleware/roles';

const router = Router();

router.get('/', verifyToken, getAll);
router.get('/:id', verifyToken, getById);
router.post('/', verifyToken, canSupervise, create);
router.put('/:id', verifyToken, canSupervise, update);
router.delete('/:id', verifyToken, canManage, deleteProduct);
router.post('/:id/movements', verifyToken, canSupervise, addMovement);

export default router;
