import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { ENV } from './config/env';
import { errorHandler } from './middlewares/error.middleware';
import v1Routes from './routes';

export function createApp(): Application {
  const app = express();

  // Security headers & CORS
  app.use(helmet({ crossOriginResourcePolicy: false }));
  app.use(
    cors({
      origin: [ENV.CLIENT_ORIGIN, 'http://localhost:3000', 'http://127.0.0.1:3000'],
      credentials: true,
    })
  );

  // Request parsing & Logging
  app.use(express.json({ limit: '15mb' }));
  app.use(express.urlencoded({ extended: true, limit: '15mb' }));
  if (ENV.NODE_ENV !== 'test') {
    app.use(morgan('dev'));
  }

  // Uploaded files static folder
  app.use('/uploads', express.static(ENV.UPLOAD_DIR));

  // Health probe
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({
      status: 'UP',
      timestamp: new Date(),
      service: 'Ricoz Franchise Expansion API',
      environment: ENV.NODE_ENV,
    });
  });

  // REST API v1
  app.use(ENV.API_PREFIX, v1Routes);

  // 404 handler
  app.use((req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      error: { message: `Route not found: ${req.method} ${req.originalUrl}` },
    });
  });

  // Centralized Error Handling
  app.use(errorHandler);

  return app;
}
