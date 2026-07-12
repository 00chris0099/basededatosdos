import { Router } from 'express';
import { getAll, create } from '../controllers/incidents.controller';
import { verifyToken } from '../middleware/auth';

const router = Router();

router.get('/', verifyToken, getAll);
router.post('/', verifyToken, create);

export default router;
