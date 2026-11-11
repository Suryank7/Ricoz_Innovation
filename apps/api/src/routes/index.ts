import { Router } from 'express';
import authRoutes from './auth.routes';
import brandRoutes from './brand.routes';
import readinessRoutes from './readiness.routes';
import sopRoutes from './sop.routes';
import legalRoutes from './legal.routes';
import expansionRoutes from './expansion.routes';
import investorRoutes from './investor.routes';
import matchingRoutes from './matching.routes';
import dealRoutes from './deal.routes';
import portfolioRoutes from './portfolio.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/brands', brandRoutes);
router.use('/readiness', readinessRoutes);
router.use('/sops', sopRoutes);
router.use('/legal', legalRoutes);
router.use('/expansion', expansionRoutes);
router.use('/investors', investorRoutes);
router.use('/matching', matchingRoutes);
router.use('/deals', dealRoutes);
router.use('/portfolio', portfolioRoutes);

export default router;
