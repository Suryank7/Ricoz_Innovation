import { Router } from 'express';
import { SOPController } from '../controllers/sop.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorizeRoles, enforceBrandTenant } from '../middlewares/rbac.middleware';
import { ROLES } from '../config/constants';

const router = Router();

router.use(authenticate);

router.get('/', SOPController.listSOPs);
router.get('/brands/:brandId', enforceBrandTenant('brandId'), SOPController.getBrandSOPs);
router.get('/brands/:brandId/export', enforceBrandTenant('brandId'), SOPController.exportOperatingManual);

router.post(
  '/',
  authorizeRoles(ROLES.PLATFORM_ADMIN, ROLES.BROKERAGE_ADMIN, ROLES.FRANCHISE_ADVISER, ROLES.SOP_SPECIALIST),
  SOPController.createSOP
);

router.get('/:id', SOPController.getSOPById);
router.put(
  '/:id',
  authorizeRoles(ROLES.PLATFORM_ADMIN, ROLES.BROKERAGE_ADMIN, ROLES.FRANCHISE_ADVISER, ROLES.SOP_SPECIALIST, ROLES.BRAND_OWNER),
  SOPController.updateSOP
);

router.post(
  '/:id/route-review',
  authorizeRoles(ROLES.PLATFORM_ADMIN, ROLES.BROKERAGE_ADMIN, ROLES.FRANCHISE_ADVISER, ROLES.SOP_SPECIALIST, ROLES.BRAND_OWNER),
  SOPController.routeForReview
);

router.post(
  '/:id/approve',
  authorizeRoles(ROLES.PLATFORM_ADMIN, ROLES.BROKERAGE_ADMIN, ROLES.FRANCHISE_ADVISER, ROLES.SOP_SPECIALIST),
  SOPController.approveSOP
);

export default router;
