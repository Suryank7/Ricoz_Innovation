import { Request, Response, NextFunction } from 'express';
import { ReadinessService } from '../services/readiness.service';

export class ReadinessController {
  static async getReadiness(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await ReadinessService.getBrandReadiness(req.params.brandId);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  static async updateScorecard(req: Request, res: Response, next: NextFunction) {
    try {
      const summary = await ReadinessService.updateScorecard(req.params.brandId, req.body, req.user);
      res.json({ success: true, message: 'Readiness scorecard updated', data: summary });
    } catch (err) {
      next(err);
    }
  }

  static async approveGate(req: Request, res: Response, next: NextFunction) {
    try {
      const { comments } = req.body;
      const gate = await ReadinessService.approveGate(req.params.brandId, req.params.gateType, comments, req.user);
      res.json({ success: true, message: 'Gate approved successfully', data: gate });
    } catch (err) {
      next(err);
    }
  }

  static async rejectGate(req: Request, res: Response, next: NextFunction) {
    try {
      const { blockingReasons, comments } = req.body;
      const gate = await ReadinessService.rejectGate(req.params.brandId, req.params.gateType, blockingReasons, comments, req.user);
      res.json({ success: true, message: 'Gate rejected with action items', data: gate });
    } catch (err) {
      next(err);
    }
  }

  static async requestOutreachApproval(req: Request, res: Response, next: NextFunction) {
    try {
      const brand = await ReadinessService.requestOutreachApproval(req.params.brandId, req.user);
      res.json({
        success: true,
        message: 'Brand approved for investor outreach! All readiness and legal gates verified.',
        data: brand,
      });
    } catch (err) {
      next(err);
    }
  }
}
