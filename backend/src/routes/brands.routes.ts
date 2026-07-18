import { Router } from 'express';
import { getAllBrands, getBrandsByCategory, createBrand, deleteBrand } from '../controllers/brands.controller';
import { verifyToken } from '../middleware/auth';
import { canManage, canSupervise } from '../middleware/roles';

const router = Router();

router.get('/',             verifyToken,          getAllBrands);
router.get('/:categoryId',  verifyToken,          getBrandsByCategory);
router.post('/',            verifyToken, canSupervise, createBrand);
router.delete('/:id',       verifyToken, canManage,    deleteBrand);

export default router;
