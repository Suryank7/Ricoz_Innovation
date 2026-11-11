import { Router } from 'express';
import { ReadinessController } from '../controllers/readiness.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorizeRoles, enforceBrandTenant } from '../middlewares/rbac.middleware';
import { ROLES } from '../config/constants';

const router = Router();

router.use(authenticate);

router.get('/brands/:brandId', enforceBrandTenant('brandId'), ReadinessController.getReadiness);

router.post(
  '/brands/:brandId/scorecard',
  authorizeRoles(ROLES.PLATFORM_ADMIN, ROLES.BROKERAGE_ADMIN, ROLES.FRANCHISE_ADVISER),
  enforceBrandTenant('brandId'),
  ReadinessController.updateScorecard
);

router.post(
  '/brands/:brandId/gates/:gateType/approve',
  authorizeRoles(
    ROLES.PLATFORM_ADMIN,
    ROLES.BROKERAGE_ADMIN,
    ROLES.FRANCHISE_ADVISER,
    ROLES.EXTERNAL_COUNSEL,
    ROLES.BRAND_OWNER
  ),
  enforceBrandTenant('brandId'),
  ReadinessController.approveGate
);

router.post(
  '/brands/:brandId/gates/:gateType/reject',
  authorizeRoles(
    ROLES.PLATFORM_ADMIN,
    ROLES.BROKERAGE_ADMIN,
    ROLES.FRANCHISE_ADVISER,
    ROLES.EXTERNAL_COUNSEL,
    ROLES.BRAND_OWNER
  ),
  enforceBrandTenant('brandId'),
  ReadinessController.rejectGate
);

router.post(
  '/brands/:brandId/request-outreach',
  authorizeRoles(ROLES.PLATFORM_ADMIN, ROLES.BROKERAGE_ADMIN, ROLES.FRANCHISE_ADVISER),
  enforceBrandTenant('brandId'),
  ReadinessController.requestOutreachApproval
);

export default router;
