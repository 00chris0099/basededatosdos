import { Router } from 'express';
import { getStock, getStockByProduct, getHistory, getLowStock } from '../controllers/inventory.controller';
import { verifyToken } from '../middleware/auth';

const router = Router();

router.get('/stock', verifyToken, getStock);
router.get('/stock/:sku', verifyToken, getStockByProduct);
router.get('/history', verifyToken, getHistory);
router.get('/low-stock', verifyToken, getLowStock);

export default router;
