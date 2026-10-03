import { INestApplication } from '@nestjs/common';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import { createTestApp } from './utils/test-app';
import { seedBaseRolesAndPermissions, seedUser } from './utils/seed-test-data';

describe('Auth (e2e)', () => {
  let app: INestApplication;
  let mongod: MongoMemoryServer;
  const password = 'SuperSecret123!';

  beforeAll(async () => {
    const setup = await createTestApp();
    app = setup.app;
    mongod = setup.mongod;

    const { superAdminRole } = await seedBaseRolesAndPermissions(app);
    await seedUser(app, {
      name: 'Test Admin',
      email: 'admin@example.com',
      password,
      roleId: superAdminRole._id,
    });
  });

  afterAll(async () => {
    await app.close();
    await mongod.stop();
  });

  it('rejects login with the wrong password', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'admin@example.com', password: 'wrong-password' });
    expect(res.status).toBe(401);
  });

  it('rejects /auth/me without a session cookie', async () => {
    const res = await request(app.getHttpServer()).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  it('logs in, sets cookies, and allows /auth/me', async () => {
    const loginRes = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'admin@example.com', password });
    expect(loginRes.status).toBe(200);
    expect(loginRes.headers['set-cookie']).toBeDefined();

    const cookies = loginRes.headers['set-cookie'];
    const meRes = await request(app.getHttpServer()).get('/api/auth/me').set('Cookie', cookies);
    expect(meRes.status).toBe(200);
    expect(meRes.body.email).toBe('admin@example.com');
  });

  it('rotates tokens on refresh', async () => {
    const loginRes = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'admin@example.com', password });
    const cookies = loginRes.headers['set-cookie'];

    const refreshRes = await request(app.getHttpServer()).post('/api/auth/refresh').set('Cookie', cookies);
    expect(refreshRes.status).toBe(200);
    expect(refreshRes.headers['set-cookie']).toBeDefined();
  });

  it('invalidates the refresh token on logout, so refresh with the old cookie then 401s', async () => {
    // Note: the short-lived access token JWT remains cryptographically valid until its own
    // expiry (stateless by design — see AuthService), so logout is verified via /auth/refresh
    // (which checks the stored refreshTokenHash, nulled on logout) rather than /auth/me.
    const loginRes = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'admin@example.com', password });
    const cookies = loginRes.headers['set-cookie'];

    const logoutRes = await request(app.getHttpServer()).post('/api/auth/logout').set('Cookie', cookies);
    expect(logoutRes.status).toBe(200);

    const refreshRes = await request(app.getHttpServer()).post('/api/auth/refresh').set('Cookie', cookies);
    expect(refreshRes.status).toBe(401);
  });
});
