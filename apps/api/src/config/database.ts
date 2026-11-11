import mongoose from 'mongoose';
import { ENV } from './env';

export async function connectDatabase(): Promise<typeof mongoose> {
  mongoose.set('strictQuery', true);

  try {
    console.log(`Connecting to MongoDB at: ${ENV.MONGODB_URI}...`);
    const conn = await mongoose.connect(ENV.MONGODB_URI, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log('MongoDB successfully connected.');
    return conn;
  } catch (err: any) {
    console.warn(`Could not connect to external MongoDB: ${err.message}.`);

    if (ENV.NODE_ENV === 'development') {
      console.log('Spinning up in-memory MongoDB server for seamless zero-config local development...');
      try {
        const { MongoMemoryServer } = await import('mongodb-memory-server');
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
