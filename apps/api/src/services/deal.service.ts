import { Deal, IDeal, SharedDocument, DealQnA } from '../models/deal.model';
import { Brand } from '../models/brand.model';
import { Investor } from '../models/investor.model';
import { AuditService } from './audit.service';
import { AppError } from '../middlewares/error.middleware';

export class DealService {
  static async listDeals(filter: any = {}, actor: any) {
    const query: any = { ...filter };
    if (actor.role === 'brand_owner' && actor.brandId) {
      query.brandId = actor.brandId;
    } else if (actor.role === 'investor' && actor.investorId) {
      query.investorId = actor.investorId;
    }

    return Deal.find(query)
      .populate('brandId', 'name sector legalEntity confidentialitySettings')
      .populate('investorId', 'name companyName preferences capability')
      .populate('assignedAdviserId', 'name email')
      .sort({ updatedAt: -1 });
  }

  static async getDealById(id: string, actor: any) {
    const deal = await Deal.findById(id)
      .populate('brandId')
      .populate('investorId')
      .populate('assignedAdviserId', 'name email')
      .populate('participants.userId', 'name email role');
    if (!deal) throw new AppError('Deal room not found', 404);

    // Verify tenant access:
    if (actor.role === 'brand_owner' && String(deal.brandId._id) !== actor.brandId) {
      throw new AppError('Forbidden: Access limited to your own brand deals.', 403);
    }
    if (actor.role === 'investor' && String(deal.investorId._id) !== actor.investorId) {
      throw new AppError('Forbidden: Access limited to your invited deal rooms.', 403);
    }

    return deal;
  }

  static async updateStage(id: string, stage: any, nextAction: any, actor: any) {
    const deal = await Deal.findById(id);
    if (!deal) throw new AppError('Deal room not found', 404);

    const prevStage = deal.stage;
    deal.stage = stage;
    if (nextAction) {
      deal.nextAction = nextAction;
    }
    await deal.save();

    await AuditService.log({
      actorId: actor.userId,
      actorRole: actor.role,
      actorEmail: actor.email,
      action: 'DEAL_STAGE_ADVANCED',
      targetEntity: 'deal',
      targetId: deal._id as any,
      previousState: { stage: prevStage },
      newState: { stage, nextAction },
    });

    return deal;
  }

  static async closeDeal(id: string, outcome: 'closed_won' | 'closed_lost' | 'paused', reason: string, actor: any) {
    const deal = await Deal.findById(id);
    if (!deal) throw new AppError('Deal room not found', 404);

    deal.stage = outcome;
    deal.outcomeReason = reason;
    deal.closedAt = new Date();
    await deal.save();

    await AuditService.log({
      actorId: actor.userId,
      actorRole: actor.role,
      actorEmail: actor.email,
      action: `DEAL_${outcome.toUpperCase()}`,
      targetEntity: 'deal',
      targetId: deal._id as any,
      newState: { outcome, reason, closedAt: deal.closedAt },
    });

    return deal;
  }

  // Shared Documents in Deal Room
  static async getSharedDocuments(dealId: string) {
    return SharedDocument.find({ dealId })
      .populate('sharedBy', 'name email')
      .sort({ createdAt: -1 });
  }

  static async shareDocument(
    dealId: string,
    data: { title: string; documentType: any; version?: string; fileUrl: string; accessRule?: any },
    actor: any
  ) {
    const doc = new SharedDocument({
      dealId,
      title: data.title,
      documentType: data.documentType,
      version: data.version || '1.0',
      fileUrl: data.fileUrl,
      accessRule: data.accessRule || 'mutual_parties_only',
      sharedBy: actor.userId,
      accessLogs: [],
    });
    await doc.save();

    await AuditService.log({
      actorId: actor.userId,
      actorRole: actor.role,
      actorEmail: actor.email,
      action: 'DEAL_DOCUMENT_SHARED',
      targetEntity: 'shared_document',
      targetId: doc._id as any,
      newState: doc.toObject(),
    });

    return doc;
  }

  static async logDocumentAccess(docId: string, action: 'view' | 'download', actor: any, ipAddress?: string) {
    const doc = await SharedDocument.findById(docId);
    if (!doc) throw new AppError('Document not found', 404);

    doc.accessLogs.push({
      userId: actor.userId,
      action,
      timestamp: new Date(),
      ipAddress,
    });
    await doc.save();

    await AuditService.log({
      actorId: actor.userId,
      actorRole: actor.role,
      actorEmail: actor.email,
      action: `DOC_${action.toUpperCase()}`,
      targetEntity: 'shared_document',
      targetId: doc._id as any,
      newState: { action, timestamp: new Date() },
    });

    return doc;
  }

  // Deal Room Due Diligence Q&A
  static async getQnA(dealId: string) {
    return DealQnA.find({ dealId })
      .populate('askedBy', 'name email role')
      .populate('answeredBy', 'name email role')
      .sort({ createdAt: 1 });
  }

  static async askQuestion(dealId: string, question: string, category: any, actor: any) {
    const qna = new DealQnA({
      dealId,
      question,
      category: category || 'operational',
      askedBy: actor.userId,
      status: 'open',
    });
    await qna.save();
    return qna;
  }

  static async answerQuestion(qnaId: string, answer: string, actor: any) {
    const qna = await DealQnA.findById(qnaId);
    if (!qna) throw new AppError('Question not found', 404);

    qna.answer = answer;
    qna.answeredBy = actor.userId;
    qna.answeredAt = new Date();
    qna.status = 'answered';
    await qna.save();
    return qna;
  }
}
