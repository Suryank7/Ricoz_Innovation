import { Router } from 'express';
import { InvestorController } from '../controllers/investor.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/rbac.middleware';
import { ROLES } from '../config/constants';

const router = Router();

router.use(authenticate);

router.get('/', InvestorController.listInvestors);
router.get('/:id', InvestorController.getInvestorById);

router.post(
  '/',
  authorizeRoles(ROLES.PLATFORM_ADMIN, ROLES.BROKERAGE_ADMIN, ROLES.FRANCHISE_ADVISER),
  InvestorController.createInvestor
);

router.put('/:id', InvestorController.updateInvestor);

router.post(
  '/:id/qualification',
  authorizeRoles(ROLES.PLATFORM_ADMIN, ROLES.BROKERAGE_ADMIN, ROLES.FRANCHISE_ADVISER),
  InvestorController.verifyQualification
);

router.post('/:id/activities', InvestorController.logActivity);

export default router;
