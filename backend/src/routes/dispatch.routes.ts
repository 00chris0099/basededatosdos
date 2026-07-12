import { Router } from 'express';
import { getAll, getById, getStats, create, updateStatus } from '../controllers/dispatch.controller';
import { verifyToken } from '../middleware/auth';
import { canSupervise } from '../middleware/roles';

const router = Router();

router.get('/', verifyToken, getAll);
router.get('/stats', verifyToken, getStats);
router.get('/:id', verifyToken, getById);
router.post('/', verifyToken, canSupervise, create);
router.put('/:id/status', verifyToken, canSupervise, updateStatus);

export default router;
