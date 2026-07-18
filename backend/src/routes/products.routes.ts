import { Router } from 'express';
import { getAll, getBySku, create, update, deleteProduct, addMovement, getCategories, getLocations } from '../controllers/products.controller';
import { verifyToken } from '../middleware/auth';
import { canManage, canSupervise } from '../middleware/roles';

const router = Router();

router.get('/', verifyToken, getAll);
router.get('/categories', verifyToken, getCategories);
router.get('/locations', verifyToken, getLocations);
router.get('/sku/:sku', verifyToken, getBySku);
router.get('/:id', verifyToken, getBySku);
router.post('/', verifyToken, canSupervise, create);
router.put('/:id', verifyToken, canSupervise, update);
router.delete('/:id', verifyToken, canManage, deleteProduct);
router.post('/movements', verifyToken, canSupervise, addMovement);

export default router;
