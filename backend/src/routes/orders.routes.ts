import { Router } from 'express';
import { getAll, getById, addItem, getByEstado, advanceOrder, updateStatus, createOrder } from '../controllers/orders.controller';
import { verifyToken } from '../middleware/auth';
import { canSupervise } from '../middleware/roles';

const router = Router();
router.get('/', verifyToken, getAll);
router.get('/status', verifyToken, getByEstado);
router.get('/:id', verifyToken, getById);
router.post('/', verifyToken, canSupervise, createOrder);
router.post('/:id/items', verifyToken, canSupervise, addItem);
router.post('/:id/advance', verifyToken, canSupervise, advanceOrder);
router.put('/:id/status', verifyToken, canSupervise, updateStatus);

export default router;
