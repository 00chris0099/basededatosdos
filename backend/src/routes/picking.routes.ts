import { Router } from 'express';
import { getAll, getById, getByOrderId, create, updateStatus, getPendingOrders } from '../controllers/picking.controller';
import { verifyToken } from '../middleware/auth';
import { canSupervise } from '../middleware/roles';

const router = Router();

router.get('/', verifyToken, getAll);
router.get('/pending-orders', verifyToken, getPendingOrders);
router.get('/:id', verifyToken, getById);
router.get('/order/:orderId', verifyToken, getByOrderId);
router.post('/', verifyToken, canSupervise, create);
router.put('/:id/status', verifyToken, canSupervise, updateStatus);

export default router;
