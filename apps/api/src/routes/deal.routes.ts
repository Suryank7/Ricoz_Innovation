import { Router } from 'express';
import { DealController } from '../controllers/deal.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/rbac.middleware';
import { ROLES } from '../config/constants';

const router = Router();

router.use(authenticate);

router.get('/', DealController.listDeals);
router.get('/:id', DealController.getDealById);

router.patch(
  '/:id/stage',
  authorizeRoles(ROLES.PLATFORM_ADMIN, ROLES.BROKERAGE_ADMIN, ROLES.FRANCHISE_ADVISER),
  DealController.updateStage
);

router.post(
  '/:id/close',
  authorizeRoles(ROLES.PLATFORM_ADMIN, ROLES.BROKERAGE_ADMIN, ROLES.FRANCHISE_ADVISER),
  DealController.closeDeal
);

// Shared Documents
router.get('/:id/documents', DealController.getSharedDocuments);
router.post('/:id/documents', DealController.shareDocument);
router.post('/:id/documents/:docId/log-access', DealController.logDocumentAccess);

// Q&A
router.get('/:id/qna', DealController.getQnA);
router.post('/:id/qna', DealController.askQuestion);
router.post('/:id/qna/:qnaId/answer', DealController.answerQuestion);

export default router;
