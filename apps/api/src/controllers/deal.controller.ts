import { Request, Response, NextFunction } from 'express';
import { DealService } from '../services/deal.service';

export class DealController {
  static async listDeals(req: Request, res: Response, next: NextFunction) {
    try {
      const filter: any = {};
      if (req.query.stage) filter.stage = req.query.stage;
      if (req.query.brandId) filter.brandId = req.query.brandId;

      const deals = await DealService.listDeals(filter, req.user);
      res.json({ success: true, count: deals.length, data: deals });
    } catch (err) {
      next(err);
    }
  }

  static async getDealById(req: Request, res: Response, next: NextFunction) {
    try {
      const deal = await DealService.getDealById(req.params.id, req.user);
      res.json({ success: true, data: deal });
    } catch (err) {
      next(err);
    }
  }

  static async updateStage(req: Request, res: Response, next: NextFunction) {
    try {
      const { stage, nextAction } = req.body;
      const deal = await DealService.updateStage(req.params.id, stage, nextAction, req.user);
      res.json({ success: true, message: 'Deal stage updated', data: deal });
    } catch (err) {
      next(err);
    }
  }

  static async closeDeal(req: Request, res: Response, next: NextFunction) {
    try {
      const { outcome, reason } = req.body;
      const deal = await DealService.closeDeal(req.params.id, outcome, reason, req.user);
      res.json({ success: true, message: `Deal marked as ${outcome}`, data: deal });
    } catch (err) {
      next(err);
    }
  }

  // Shared Documents in Deal Room
  static async getSharedDocuments(req: Request, res: Response, next: NextFunction) {
    try {
      const docs = await DealService.getSharedDocuments(req.params.id);
      res.json({ success: true, count: docs.length, data: docs });
    } catch (err) {
      next(err);
    }
  }

  static async shareDocument(req: Request, res: Response, next: NextFunction) {
    try {
      const doc = await DealService.shareDocument(req.params.id, req.body, req.user);
      res.status(201).json({ success: true, message: 'Document shared to deal room', data: doc });
    } catch (err) {
      next(err);
    }
  }

  static async logDocumentAccess(req: Request, res: Response, next: NextFunction) {
    try {
      const { action } = req.body;
      const doc = await DealService.logDocumentAccess(req.params.docId, action, req.user, req.ip);
      res.json({ success: true, message: 'Access logged', data: doc });
    } catch (err) {
      next(err);
    }
  }

  // Due Diligence Q&A
  static async getQnA(req: Request, res: Response, next: NextFunction) {
    try {
      const qnas = await DealService.getQnA(req.params.id);
      res.json({ success: true, count: qnas.length, data: qnas });
    } catch (err) {
      next(err);
    }
  }

  static async askQuestion(req: Request, res: Response, next: NextFunction) {
    try {
      const { question, category } = req.body;
      const qna = await DealService.askQuestion(req.params.id, question, category, req.user);
      res.status(201).json({ success: true, message: 'Question submitted', data: qna });
    } catch (err) {
      next(err);
    }
  }

  static async answerQuestion(req: Request, res: Response, next: NextFunction) {
    try {
      const { answer } = req.body;
      const qna = await DealService.answerQuestion(req.params.qnaId, answer, req.user);
      res.json({ success: true, message: 'Question answered', data: qna });
    } catch (err) {
      next(err);
    }
  }
}
