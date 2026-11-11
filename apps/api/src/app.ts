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

  const corsOptions: cors.CorsOptions = {
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);

      // Allow any vercel deployment, localhost, or configured CLIENT_ORIGIN
      const normalizedOrigin = origin.replace(/\/$/, '');
      const configuredOrigin = (ENV.CLIENT_ORIGIN || '').replace(/\/$/, '');

      if (
        normalizedOrigin.endsWith('.vercel.app') ||
        normalizedOrigin.includes('localhost') ||
        normalizedOrigin.includes('127.0.0.1') ||
        (configuredOrigin && normalizedOrigin === configuredOrigin) ||
        true // Allow dynamically reflecting the origin for cross-domain API calls
      ) {
        return callback(null, true);
      }

      callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    optionsSuccessStatus: 204,
  };

  app.use(cors(corsOptions));
  app.options('*', cors(corsOptions));

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

  // Centralized Error Middleware
  app.use(errorHandler);

  return app;
}
