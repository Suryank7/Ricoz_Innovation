import { Request, Response, NextFunction } from 'express';
import { ExpansionService } from '../services/expansion.service';

export class ExpansionController {
  static async getProposition(req: Request, res: Response, next: NextFunction) {
    try {
      const prop = await ExpansionService.getProposition(req.params.brandId);
      res.json({ success: true, data: prop });
    } catch (err) {
      next(err);
    }
  }

  static async updateProposition(req: Request, res: Response, next: NextFunction) {
    try {
      const prop = await ExpansionService.updateProposition(req.params.brandId, req.body, req.user);
      res.json({ success: true, message: 'Expansion proposition updated', data: prop });
    } catch (err) {
      next(err);
    }
  }

  static async addAssumption(req: Request, res: Response, next: NextFunction) {
    try {
      const prop = await ExpansionService.addAssumption(req.params.brandId, req.body, req.user);
      res.status(201).json({ success: true, message: 'Financial assumption added', data: prop });
    } catch (err) {
      next(err);
    }
  }

  static async brandApproveTeaser(req: Request, res: Response, next: NextFunction) {
    try {
      const prop = await ExpansionService.brandApproveTeaser(req.params.brandId, req.user);
      res.json({
        success: true,
        message: 'Brand owner signoff recorded. Investor-facing teaser profile approved.',
        data: prop,
      });
    } catch (err) {
      next(err);
    }
  }
}
