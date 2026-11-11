import { Router } from 'express';
import { ExpansionController } from '../controllers/expansion.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { enforceBrandTenant } from '../middlewares/rbac.middleware';

const router = Router();

router.use(authenticate);

router.get('/brands/:brandId', enforceBrandTenant('brandId'), ExpansionController.getProposition);
router.post('/brands/:brandId', enforceBrandTenant('brandId'), ExpansionController.updateProposition);
router.post('/brands/:brandId/assumptions', enforceBrandTenant('brandId'), ExpansionController.addAssumption);
router.post('/brands/:brandId/brand-approve', enforceBrandTenant('brandId'), ExpansionController.brandApproveTeaser);

export default router;
