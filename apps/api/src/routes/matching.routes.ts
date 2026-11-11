import { Router } from 'express';
import { MatchingController } from '../controllers/matching.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorizeRoles, enforceBrandTenant } from '../middlewares/rbac.middleware';
import { ROLES } from '../config/constants';

const router = Router();

router.use(authenticate);

router.post(
  '/evaluate/:brandId',
  authorizeRoles(ROLES.PLATFORM_ADMIN, ROLES.BROKERAGE_ADMIN, ROLES.FRANCHISE_ADVISER),
  enforceBrandTenant('brandId'),
  MatchingController.evaluateMatches
);

router.get('/brands/:brandId', enforceBrandTenant('brandId'), MatchingController.getBrandMatches);

router.post(
  '/:matchId/adviser-propose',
  authorizeRoles(ROLES.PLATFORM_ADMIN, ROLES.BROKERAGE_ADMIN, ROLES.FRANCHISE_ADVISER),
  MatchingController.adviserPropose
);

router.post('/consent/:consentId/respond', MatchingController.respondConsent);

export default router;
