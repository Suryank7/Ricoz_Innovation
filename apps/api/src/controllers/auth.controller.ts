import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.register(req.body);
      res.status(201).json({
        success: true,
        message: 'Account registered successfully',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const result = await AuthService.login(email, password);

      res.cookie('token', result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  static async me(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Unauthenticated' });
      }
      const user = await AuthService.getProfile(req.user.userId);
      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (err) {
      next(err);
    }
  }

  static async logout(req: Request, res: Response) {
    res.clearCookie('token');
    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  }

  static async seed(req: Request, res: Response, next: NextFunction) {
    try {
      const { seedDatabase } = await import('../seed');
      await seedDatabase(false);
      res.status(200).json({
        success: true,
        message: 'Database seeded successfully with demo users, Chai & Chutney Express brand, SOPs, gates, and deal room.',
      });
    } catch (err) {
      next(err);
    }
  }
}
