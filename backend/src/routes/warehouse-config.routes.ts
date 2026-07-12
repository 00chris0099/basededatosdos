import { Router } from 'express';
import { get, update } from '../controllers/warehouse-config.controller';
import { verifyToken } from '../middleware/auth';
import { canManage } from '../middleware/roles';

const router = Router();

router.get('/', verifyToken, get);
router.put('/', verifyToken, canManage, update);

export default router;
