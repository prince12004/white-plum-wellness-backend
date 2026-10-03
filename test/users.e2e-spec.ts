import { INestApplication } from '@nestjs/common';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import { createTestApp } from './utils/test-app';
import { seedBaseRolesAndPermissions, seedUser } from './utils/seed-test-data';

describe('Users (e2e)', () => {
  let app: INestApplication;
  let mongod: MongoMemoryServer;
  let adminCookies: string[];
  let counsellorCookies: string[];
  let counsellorRoleId: string;
  const adminPassword = 'SuperSecret123!';
  const counsellorPassword = 'CounsellorPass123!';

  beforeAll(async () => {
    const setup = await createTestApp();
    app = setup.app;
    mongod = setup.mongod;

    const { superAdminRole, counsellorRole } = await seedBaseRolesAndPermissions(app);
    counsellorRoleId = String(counsellorRole._id);

    await seedUser(app, {
      name: 'Test Admin',
      email: 'admin@example.com',
      password: adminPassword,
      roleId: superAdminRole._id,
    });
    await seedUser(app, {
      name: 'Test Counsellor',
      email: 'counsellor@example.com',
      password: counsellorPassword,
      roleId: counsellorRole._id,
    });

    const adminLogin = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'admin@example.com', password: adminPassword });
    adminCookies = adminLogin.headers['set-cookie'] as unknown as string[];

    const counsellorLogin = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'counsellor@example.com', password: counsellorPassword });
    counsellorCookies = counsellorLogin.headers['set-cookie'] as unknown as string[];
  });

  afterAll(async () => {
    await app.close();
    await mongod.stop();
  });

  it('lets a Super Admin create a new user', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/users')
      .set('Cookie', adminCookies)
      .send({
        name: 'Content Person',
        email: 'content@example.com',
        password: 'ContentPass123!',
        roleId: counsellorRoleId,
      });
    expect(res.status).toBe(201);
    expect(res.body.email).toBe('content@example.com');
  });

  it('rejects duplicate email with 409', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/users')
      .set('Cookie', adminCookies)
      .send({
        name: 'Duplicate',
        email: 'content@example.com',
        password: 'AnotherPass123!',
        roleId: counsellorRoleId,
      });
    expect(res.status).toBe(409);
  });

  it('blocks a role lacking users:create from creating a user (403)', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/users')
      .set('Cookie', counsellorCookies)
      .send({
        name: 'Should Fail',
        email: 'shouldfail@example.com',
        password: 'ShouldFailPass123!',
        roleId: counsellorRoleId,
      });
    expect(res.status).toBe(403);
  });

  it('lists users for a permitted role', async () => {
    const res = await request(app.getHttpServer()).get('/api/users').set('Cookie', adminCookies);
    expect(res.status).toBe(200);
    expect(res.body.items.length).toBeGreaterThan(0);
  });
});
