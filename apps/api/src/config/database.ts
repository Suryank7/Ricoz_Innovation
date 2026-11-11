import mongoose from 'mongoose';
import { ENV } from './env';

export async function connectDatabase(): Promise<typeof mongoose> {
  mongoose.set('strictQuery', true);

  try {
    console.log(`Connecting to MongoDB at: ${ENV.MONGODB_URI}...`);
    const conn = await mongoose.connect(ENV.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    } as any);
    console.log('MongoDB successfully connected.');
    return conn;
  } catch (err: any) {
    console.warn(`Could not connect to external MongoDB: ${err.message}.`);

    if (ENV.NODE_ENV === 'development') {
      console.log('Spinning up in-memory MongoDB server for development...');
      try {
        // Dynamic import to avoid missing declarations in production builds
        const memPackage = 'mongodb-memory-server';
        const { MongoMemoryServer } = (await import(memPackage)) as any;
        const mongod = await MongoMemoryServer.create();
        const uri = mongod.getUri();
        console.log(`In-memory MongoDB started at: ${uri}`);
        const conn = await mongoose.connect(uri);
        console.log('MongoDB connected via in-memory server.');
        return conn;
      } catch (memErr: any) {
        console.error('Failed to initialize in-memory MongoDB:', memErr.message);
        throw memErr;
      }
    } else {
      throw err;
    }
  }
}
