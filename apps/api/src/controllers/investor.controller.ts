import { Request, Response, NextFunction } from 'express';
import { InvestorService } from '../services/investor.service';

export class InvestorController {
  static async listInvestors(req: Request, res: Response, next: NextFunction) {
    try {
      const filter: any = {};
      if (req.query.status) filter.status = req.query.status;
      if (req.query.role) filter['capability.intendedRole'] = req.query.role;
      if (req.query.verificationStatus) filter['qualification.financialReviewStatus'] = req.query.verificationStatus;

      const investors = await InvestorService.listInvestors(filter);
      res.json({ success: true, count: investors.length, data: investors });
    } catch (err) {
      next(err);
    }
  }

  static async getInvestorById(req: Request, res: Response, next: NextFunction) {
    try {
      const investor = await InvestorService.getInvestorById(req.params.id);
      res.json({ success: true, data: investor });
    } catch (err) {
      next(err);
    }
  }

  static async createInvestor(req: Request, res: Response, next: NextFunction) {
    try {
      const investor = await InvestorService.createInvestor(req.body, req.user);
      res.status(201).json({ success: true, message: 'Investor profile created', data: investor });
    } catch (err) {
      next(err);
    }
  }

  static async updateInvestor(req: Request, res: Response, next: NextFunction) {
    try {
      const investor = await InvestorService.updateInvestor(req.params.id, req.body, req.user);
      res.json({ success: true, message: 'Investor profile updated', data: investor });
    } catch (err) {
      next(err);
    }
  }

  static async verifyQualification(req: Request, res: Response, next: NextFunction) {
    try {
      const investor = await InvestorService.verifyQualification(req.params.id, req.body, req.user);
      res.json({ success: true, message: 'Investor qualification review updated', data: investor });
    } catch (err) {
      next(err);
    }
  }

  static async logActivity(req: Request, res: Response, next: NextFunction) {
    try {
      const investor = await InvestorService.logActivity(req.params.id, req.body, req.user);
      res.status(201).json({ success: true, message: 'Activity logged', data: investor });
    } catch (err) {
      next(err);
    }
  }
}
