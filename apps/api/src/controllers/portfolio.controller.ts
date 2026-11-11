import { Request, Response, NextFunction } from 'express';
import { PortfolioService } from '../services/portfolio.service';
import { AuditService } from '../services/audit.service';

export class PortfolioController {
  static async getSummary(req: Request, res: Response, next: NextFunction) {
    try {
      const summary = await PortfolioService.getSummaryMetrics();
      res.json({ success: true, data: summary });
    } catch (err) {
      next(err);
    }
  }

  static async getBlockers(req: Request, res: Response, next: NextFunction) {
    try {
      const blockers = await PortfolioService.getOperationalBlockers();
      res.json({ success: true, data: blockers });
    } catch (err) {
      next(err);
    }
  }

  static async getAuditTrail(req: Request, res: Response, next: NextFunction) {
    try {
      const { targetEntity, targetId, actorId, limit } = req.query;
      const logs = await AuditService.getLogs({
        targetEntity: targetEntity as string,
        targetId: targetId as string,
        actorId: actorId as string,
        limit: limit ? parseInt(limit as string, 10) : 100,
      });
      res.json({ success: true, count: logs.length, data: logs });
    } catch (err) {
      next(err);
    }
  }

  static async exportReport(req: Request, res: Response, next: NextFunction) {
    try {
      const summary = await PortfolioService.getSummaryMetrics();
      const blockers = await PortfolioService.getOperationalBlockers();
      res.json({
        success: true,
        generatedAt: new Date(),
        reportType: 'portfolio_executive_snapshot',
        summary,
        blockers,
      });
    } catch (err) {
      next(err);
    }
  }
}
