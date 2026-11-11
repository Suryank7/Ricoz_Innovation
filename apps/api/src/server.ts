import { createApp } from './app';
import { connectDatabase } from './config/database';
import { ENV } from './config/env';
import { logger } from './utils/logger';

async function bootstrap() {
  try {
    await connectDatabase();
    const app = createApp();

    app.listen(ENV.PORT, () => {
      logger.info(`Ricoz Franchise Expansion API listening at http://localhost:${ENV.PORT}${ENV.API_PREFIX}`);
      logger.info(`Health check available at: http://localhost:${ENV.PORT}/api/health`);
    });
  } catch (err: any) {
    logger.error('Failed to start API server:', err);
    process.exit(1);
  }
}

bootstrap();
