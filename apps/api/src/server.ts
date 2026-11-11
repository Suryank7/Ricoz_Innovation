import { createApp } from './app';
import { connectDatabase } from './config/database';
import { ENV } from './config/env';
import { logger } from './utils/logger';
import { User } from './models/user.model';
import { seedDatabase } from './seed';

async function bootstrap() {
  try {
    await connectDatabase();

    // Check if database is empty and auto-seed initial fixtures
    try {
      const userCount = await User.countDocuments();
      if (userCount === 0) {
        logger.info('Empty database detected. Running automated initial seed...');
        await seedDatabase(false);
        logger.info('Database auto-seeding completed.');
      } else {
        logger.info(`Database contains ${userCount} existing users.`);
      }
    } catch (seedCheckErr: any) {
      logger.warn('Initial seed check skipped or failed:', seedCheckErr.message);
    }

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
