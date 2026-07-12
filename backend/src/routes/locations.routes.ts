import { Router } from 'express';
import { getAll, create } from '../controllers/locations.controller';
import { verifyToken } from '../middleware/auth';
import { canManage } from '../middleware/roles';

const router = Router();
router.get('/', verifyToken, getAll);
router.post('/', verifyToken, canManage, create);

export default router;
