import { Router } from 'express';
import { getKpis } from '../controllers/reports.controller';
import { verifyToken } from '../middleware/auth';

const router = Router();
router.get('/kpis', verifyToken, getKpis);

export default router;
