import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { AppModule } from '../../src/app.module';

export async function createTestApp(): Promise<{ app: INestApplication; mongod: MongoMemoryServer }> {
  const mongod = await MongoMemoryServer.create();

  process.env.MONGODB_URI = mongod.getUri();
  process.env.ACCESS_TOKEN_SECRET = 'test-access-secret-please-ignore';
  process.env.ACCESS_TOKEN_TTL = '15m';
  process.env.REFRESH_TOKEN_SECRET = 'test-refresh-secret-please-ignore';
  process.env.REFRESH_TOKEN_TTL = '7d';
  process.env.WEB_ORIGIN = 'http://localhost:3000';
  process.env.ADMIN_ORIGIN = 'http://localhost:3001';
  process.env.COOKIE_DOMAIN = 'localhost';

  const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
  const app = moduleRef.createNestApplication();
  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
  app.setGlobalPrefix('api');
  await app.init();

  return { app, mongod };
}
