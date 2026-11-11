import { Request, Response, NextFunction } from 'express';
import { SOPService } from '../services/sop.service';

export class SOPController {
  static async listSOPs(req: Request, res: Response, next: NextFunction) {
    try {
      const filter: any = {};
      if (req.query.category) filter.category = req.query.category;
      if (req.query.status) filter.status = req.query.status;
      if (req.query.brandId) filter.brandId = req.query.brandId;

      const sops = await SOPService.listSOPs(filter);
      res.json({ success: true, count: sops.length, data: sops });
    } catch (err) {
      next(err);
    }
  }

  static async getBrandSOPs(req: Request, res: Response, next: NextFunction) {
    try {
      const sops = await SOPService.getBrandSOPs(req.params.brandId);
      res.json({ success: true, count: sops.length, data: sops });
    } catch (err) {
      next(err);
    }
  }

  static async getSOPById(req: Request, res: Response, next: NextFunction) {
    try {
      const sop = await SOPService.getSOPById(req.params.id);
      res.json({ success: true, data: sop });
    } catch (err) {
      next(err);
    }
  }

  static async createSOP(req: Request, res: Response, next: NextFunction) {
    try {
      const sop = await SOPService.createSOP(req.body, req.user);
      res.status(201).json({ success: true, message: 'SOP draft created', data: sop });
    } catch (err) {
      next(err);
    }
  }

  static async updateSOP(req: Request, res: Response, next: NextFunction) {
    try {
      const sop = await SOPService.updateSOP(req.params.id, req.body, req.user);
      res.json({ success: true, message: 'SOP updated to new version', data: sop });
    } catch (err) {
      next(err);
    }
  }

  static async routeForReview(req: Request, res: Response, next: NextFunction) {
    try {
      const sop = await SOPService.routeForReview(req.params.id, req.user);
      res.json({ success: true, message: 'SOP routed for review', data: sop });
    } catch (err) {
      next(err);
    }
  }

  static async approveSOP(req: Request, res: Response, next: NextFunction) {
    try {
      const sop = await SOPService.approveSOP(req.params.id, req.body, req.user);
      res.json({ success: true, message: 'SOP approved and version locked', data: sop });
    } catch (err) {
      next(err);
    }
  }

  static async exportOperatingManual(req: Request, res: Response, next: NextFunction) {
    try {
      const pack = await SOPService.exportOperatingManual(req.params.brandId);
      res.json({ success: true, data: pack });
    } catch (err) {
      next(err);
    }
  }
}
