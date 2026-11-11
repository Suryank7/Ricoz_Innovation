import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { AppError } from './error.middleware';

export const validateRequest = (schema: ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      // Optionally assign sanitized data back
      req.body = (parsed as any).body || req.body;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const message = error.errors
          .map((err) => `${err.path.join('.')}: ${err.message}`)
          .join(', ');
        return next(new AppError(`Validation failed: ${message}`, 400));
      }
      next(error);
    }
  };
};
