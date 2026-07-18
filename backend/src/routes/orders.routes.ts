import { Router } from 'express';
import { getAll, getById, addItem, getByEstado } from '../controllers/orders.controller';
import { verifyToken } from '../middleware/auth';

const router = Router();
router.get('/', verifyToken, getAll);
router.get('/status', verifyToken, getByEstado);
router.get('/:id', verifyToken, getById);
router.post('/:id/items', verifyToken, addItem);

export default router;
