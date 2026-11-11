import { Request, Response, NextFunction } from 'express';
import { LegalService } from '../services/legal.service';

export class LegalController {
  static async listMatters(req: Request, res: Response, next: NextFunction) {
    try {
      const filter: any = {};
      if (req.query.jurisdiction) filter.jurisdiction = req.query.jurisdiction;
      if (req.query.status) filter.status = req.query.status;
      if (req.query.brandId) filter.brandId = req.query.brandId;

      const matters = await LegalService.listMatters(filter, req.user);
      res.json({ success: true, count: matters.length, data: matters });
    } catch (err) {
      next(err);
    }
  }

  static async getMatterById(req: Request, res: Response, next: NextFunction) {
    try {
      const matter = await LegalService.getMatterById(req.params.id, req.user);
      res.json({ success: true, data: matter });
    } catch (err) {
      next(err);
    }
  }

  static async createMatter(req: Request, res: Response, next: NextFunction) {
    try {
      const matter = await LegalService.createMatter(req.body.brandId, req.body, req.user);
      res.status(201).json({ success: true, message: 'Legal matter initialized', data: matter });
    } catch (err) {
      next(err);
    }
  }

  static async updateChecklistItem(req: Request, res: Response, next: NextFunction) {
    try {
      const { isCompleted, notes } = req.body;
      const matter = await LegalService.updateChecklistItem(req.params.id, req.params.itemKey, isCompleted, notes, req.user);
      res.json({ success: true, message: 'Checklist item updated', data: matter });
    } catch (err) {
      next(err);
    }
  }

  static async uploadLegalDocument(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
      }
      const { title, version } = req.body;
      const matter = await LegalService.uploadLegalDocument(req.params.id, req.file, title, version, req.user);
      res.status(201).json({ success: true, message: 'Legal document uploaded for counsel review', data: matter });
    } catch (err) {
      next(err);
    }
  }

  static async recordCounselReview(req: Request, res: Response, next: NextFunction) {
    try {
      const matter = await LegalService.recordCounselReview(req.params.id, req.body, req.user);
      res.json({ success: true, message: 'Counsel review outcome recorded', data: matter });
    } catch (err) {
      next(err);
    }
  }

  static async getJurisdictionChecklist(req: Request, res: Response) {
    const list = LegalService.getJurisdictionChecklist(req.params.jurisdiction);
    res.json({ success: true, jurisdiction: req.params.jurisdiction, items: list });
  }
}
