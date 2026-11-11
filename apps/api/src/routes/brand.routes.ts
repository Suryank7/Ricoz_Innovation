import { Router } from 'express';
import { BrandController } from '../controllers/brand.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorizeRoles, enforceBrandTenant } from '../middlewares/rbac.middleware';
import { upload } from '../middlewares/upload.middleware';
import { ROLES } from '../config/constants';

const router = Router();

router.use(authenticate);

// Brand engagement CRUD
router.get('/', BrandController.listBrands);
router.post(
  '/',
  authorizeRoles(ROLES.PLATFORM_ADMIN, ROLES.BROKERAGE_ADMIN, ROLES.FRANCHISE_ADVISER),
  BrandController.createBrand
);
router.get('/:id', enforceBrandTenant('id'), BrandController.getBrandById);
router.put('/:id', enforceBrandTenant('id'), BrandController.updateBrand);

// Locations
router.get('/:id/locations', enforceBrandTenant('id'), BrandController.getLocations);
router.post('/:id/locations', enforceBrandTenant('id'), BrandController.addLocation);

// Evidence Register
router.get('/:id/evidence', enforceBrandTenant('id'), BrandController.getEvidence);
router.post(
  '/:id/evidence',
  enforceBrandTenant('id'),
  upload.single('file'),
  BrandController.uploadEvidence
);
router.patch(
  '/:id/evidence/:evidenceId/verify',
  authorizeRoles(ROLES.PLATFORM_ADMIN, ROLES.BROKERAGE_ADMIN, ROLES.FRANCHISE_ADVISER),
  BrandController.verifyEvidence
);

// Readiness Gaps
router.get('/:id/gaps', enforceBrandTenant('id'), BrandController.getGaps);
router.post(
  '/:id/gaps',
  authorizeRoles(ROLES.PLATFORM_ADMIN, ROLES.BROKERAGE_ADMIN, ROLES.FRANCHISE_ADVISER, ROLES.SOP_SPECIALIST),
  BrandController.addGap
);
router.patch('/:id/gaps/:gapId', enforceBrandTenant('id'), BrandController.updateGap);

export default router;
