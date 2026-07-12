import { Router } from 'express';
import { getAll, getById, getByPickingId, create, confirm, updateStatus } from '../controllers/packing.controller';
import { verifyToken } from '../middleware/auth';
import { canSupervise } from '../middleware/roles';

const router = Router();

router.get('/', verifyToken, getAll);
router.get('/:id', verifyToken, getById);
router.get('/picking/:pickingId', verifyToken, getByPickingId);
router.post('/', verifyToken, canSupervise, create);
router.post('/:id/confirm', verifyToken, canSupervise, confirm);
router.put('/:id/status', verifyToken, canSupervise, updateStatus);

export default router;
