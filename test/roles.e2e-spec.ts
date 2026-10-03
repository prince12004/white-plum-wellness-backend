import { INestApplication } from '@nestjs/common';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import { createTestApp } from './utils/test-app';
import { seedBaseRolesAndPermissions, seedUser } from './utils/seed-test-data';

describe('Roles (e2e)', () => {
  let app: INestApplication;
  let mongod: MongoMemoryServer;
  let adminCookies: string[];
  let permissionIds: string[];
  let systemRoleId: string;
  const adminPassword = 'SuperSecret123!';

  beforeAll(async () => {
    const setup = await createTestApp();
    app = setup.app;
    mongod = setup.mongod;

    const { superAdminRole, counsellorRole, permissionIds: ids } = await seedBaseRolesAndPermissions(app);
    permissionIds = ids.map(String);
    systemRoleId = String(counsellorRole._id);

    await seedUser(app, {
      name: 'Test Admin',
      email: 'admin@example.com',
      password: adminPassword,
      roleId: superAdminRole._id,
    });

    const adminLogin = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'admin@example.com', password: adminPassword });
    adminCookies = adminLogin.headers['set-cookie'] as unknown as string[];
  });

  afterAll(async () => {
    await app.close();
    await mongod.stop();
  });

  it('creates a custom role with a chosen permission set', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/roles')
      .set('Cookie', adminCookies)
      .send({ key: 'front_desk', label: 'Front Desk', permissionIds: permissionIds.slice(0, 2) });
    expect(res.status).toBe(201);
    expect(res.body.key).toBe('FRONT_DESK');
    expect(res.body.isSystem).toBe(false);
  });

  it('lists all roles including the seeded system roles', async () => {
    const res = await request(app.getHttpServer()).get('/api/roles').set('Cookie', adminCookies);
    expect(res.status).toBe(200);
    expect(res.body.some((r: { key: string }) => r.key === 'SUPER_ADMIN')).toBe(true);
  });

  it('exposes the full permission catalog for the matrix UI', async () => {
    const res = await request(app.getHttpServer()).get('/api/permissions').set('Cookie', adminCookies);
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('blocks deleting a system role', async () => {
    const res = await request(app.getHttpServer()).delete(`/api/roles/${systemRoleId}`).set('Cookie', adminCookies);
    expect(res.status).toBe(400);
  });
});
