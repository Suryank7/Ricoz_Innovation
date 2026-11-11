import { Request, Response, NextFunction } from 'express';
import { BrandService } from '../services/brand.service';

export class BrandController {
  static async listBrands(req: Request, res: Response, next: NextFunction) {
    try {
      const filter: any = {};
      if (req.query.status) filter.status = req.query.status;
      if (req.query.sector) filter.sector = req.query.sector;

      // If user is brand owner, force filter to their own brand
      if (req.user?.role === 'brand_owner' && req.user.brandId) {
        filter._id = req.user.brandId;
      }

      const brands = await BrandService.listBrands(filter);
      res.json({ success: true, count: brands.length, data: brands });
    } catch (err) {
      next(err);
    }
  }

  static async getBrandById(req: Request, res: Response, next: NextFunction) {
    try {
      const brand = await BrandService.getBrandById(req.params.id, req.user);
      res.json({ success: true, data: brand });
    } catch (err) {
      next(err);
    }
  }

  static async createBrand(req: Request, res: Response, next: NextFunction) {
    try {
      const brand = await BrandService.createBrand(req.body, req.user);
      res.status(201).json({ success: true, message: 'Brand engagement initialized', data: brand });
    } catch (err) {
      next(err);
    }
  }

  static async updateBrand(req: Request, res: Response, next: NextFunction) {
    try {
      const brand = await BrandService.updateBrand(req.params.id, req.body, req.user);
      res.json({ success: true, message: 'Brand engagement updated', data: brand });
    } catch (err) {
      next(err);
    }
  }

  // Locations / Outlets
  static async getLocations(req: Request, res: Response, next: NextFunction) {
    try {
      const locations = await BrandService.getLocations(req.params.id);
      res.json({ success: true, count: locations.length, data: locations });
    } catch (err) {
      next(err);
    }
  }

  static async addLocation(req: Request, res: Response, next: NextFunction) {
    try {
      const location = await BrandService.addLocation(req.params.id, req.body, req.user);
      res.status(201).json({ success: true, message: 'Location added', data: location });
    } catch (err) {
      next(err);
    }
  }

  // Evidence Register
  static async getEvidence(req: Request, res: Response, next: NextFunction) {
    try {
      const evidence = await BrandService.getEvidenceList(req.params.id);
      res.json({ success: true, count: evidence.length, data: evidence });
    } catch (err) {
      next(err);
    }
  }

  static async uploadEvidence(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
      }
      const evidence = await BrandService.addEvidence(req.params.id, req.file, req.body, req.user);
      res.status(201).json({ success: true, message: 'Evidence uploaded and claim registered', data: evidence });
    } catch (err) {
      next(err);
    }
  }

  static async verifyEvidence(req: Request, res: Response, next: NextFunction) {
    try {
      const { status, notes } = req.body;
      const evidence = await BrandService.verifyEvidence(req.params.id, req.params.evidenceId, status, notes, req.user);
      res.json({ success: true, message: 'Evidence status updated', data: evidence });
    } catch (err) {
      next(err);
    }
  }

  // Readiness Gaps
  static async getGaps(req: Request, res: Response, next: NextFunction) {
    try {
      const gaps = await BrandService.getGaps(req.params.id);
      res.json({ success: true, count: gaps.length, data: gaps });
    } catch (err) {
      next(err);
    }
  }

  static async addGap(req: Request, res: Response, next: NextFunction) {
    try {
      const gap = await BrandService.addGap(req.params.id, req.body, req.user);
      res.status(201).json({ success: true, message: 'Readiness gap logged', data: gap });
    } catch (err) {
      next(err);
    }
  }

  static async updateGap(req: Request, res: Response, next: NextFunction) {
    try {
      const gap = await BrandService.updateGap(req.params.id, req.params.gapId, req.body, req.user);
      res.json({ success: true, message: 'Readiness gap updated', data: gap });
    } catch (err) {
      next(err);
    }
  }
}
