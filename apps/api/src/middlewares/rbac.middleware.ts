import { Request, Response, NextFunction } from 'express';
import { UserRole, ROLES } from '../config/constants';
import { AppError } from './error.middleware';

export function authorizeRoles(...allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('Unauthorized: Please log in.', 401));
    }

    if (req.user.role === ROLES.PLATFORM_ADMIN || req.user.role === ROLES.BROKERAGE_ADMIN) {
      return next(); // Administrators have broad oversight
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new AppError('Forbidden: You do not have permission for this resource.', 403));
    }

    next();
  };
}

export function enforceBrandTenant(brandIdParam = 'brandId') {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('Unauthorized', 401));
    }

    // Brokerage staff and admins can access assigned/all brands
    if (
      req.user.role === ROLES.PLATFORM_ADMIN ||
      req.user.role === ROLES.BROKERAGE_ADMIN ||
      req.user.role === ROLES.FRANCHISE_ADVISER ||
      req.user.role === ROLES.SOP_SPECIALIST
    ) {
      return next();
    }

    const targetBrandId = req.params[brandIdParam] || req.body[brandIdParam];

    if (req.user.role === ROLES.BRAND_OWNER) {
      if (!req.user.brandId || req.user.brandId !== targetBrandId) {
        return next(new AppError('Forbidden: Access limited to your own registered brand.', 403));
      }
    }

    next();
  };
}
