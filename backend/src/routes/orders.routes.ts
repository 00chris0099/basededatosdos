import { Router } from 'express';
import { getAll, getById } from '../controllers/orders.controller';
import { verifyToken } from '../middleware/auth';

const router = Router();
router.get('/', verifyToken, getAll);
router.get('/:id', verifyToken, getById);

export default router;
