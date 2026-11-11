import { Router } from 'express';
import { LegalController } from '../controllers/legal.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/rbac.middleware';
import { upload } from '../middlewares/upload.middleware';
import { ROLES } from '../config/constants';

const router = Router();

router.use(authenticate);

router.get('/jurisdictions/:jurisdiction', LegalController.getJurisdictionChecklist);

router.get('/matters', LegalController.listMatters);
router.get('/matters/:id', LegalController.getMatterById);

router.post(
  '/matters',
  authorizeRoles(ROLES.PLATFORM_ADMIN, ROLES.BROKERAGE_ADMIN, ROLES.FRANCHISE_ADVISER),
  LegalController.createMatter
);

router.patch('/matters/:id/checklist/:itemKey', LegalController.updateChecklistItem);

router.post(
  '/matters/:id/documents',
  upload.single('file'),
  LegalController.uploadLegalDocument
);

router.post(
  '/matters/:id/counsel-review',
  authorizeRoles(ROLES.PLATFORM_ADMIN, ROLES.BROKERAGE_ADMIN, ROLES.EXTERNAL_COUNSEL),
  LegalController.recordCounselReview
);

export default router;
