import { Router } from 'express';
import { PortfolioController } from '../controllers/portfolio.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/rbac.middleware';
import { ROLES } from '../config/constants';

const router = Router();

router.use(authenticate);

router.get('/summary', PortfolioController.getSummary);
router.get('/blockers', PortfolioController.getBlockers);
router.get('/export', PortfolioController.exportReport);

router.get(
  '/audit-trail',
  authorizeRoles(ROLES.PLATFORM_ADMIN, ROLES.BROKERAGE_ADMIN),
  PortfolioController.getAuditTrail
);

export default router;
