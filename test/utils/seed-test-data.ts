import { INestApplication } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as argon2 from 'argon2';
import { Permission, PermissionDocument } from '../../src/modules/roles/schemas/permission.schema';
import { Role, RoleDocument } from '../../src/modules/roles/schemas/role.schema';
import { User, UserDocument } from '../../src/modules/users/schemas/user.schema';

const BASE_PERMISSIONS = [
  'users:read',
  'users:create',
  'users:update',
  'users:delete',
  'roles:read',
  'roles:create',
  'roles:update',
  'roles:delete',
  'settings:read',
  'settings:update',
  'audit-log:read',
  'leads:read',
];

export async function seedBaseRolesAndPermissions(app: INestApplication) {
  const permissionModel = app.get<Model<PermissionDocument>>(getModelToken(Permission.name));
  const roleModel = app.get<Model<RoleDocument>>(getModelToken(Role.name));

  const permissionIds = [];
  for (const key of BASE_PERMISSIONS) {
    const [module, action] = key.split(':');
    const doc = await permissionModel.create({ key, module, action });
    permissionIds.push(doc._id);
  }

  const superAdminRole = await roleModel.create({
    key: 'SUPER_ADMIN',
    label: 'Super Admin',
    permissions: permissionIds,
    isSystem: true,
  });

  const counsellorRole = await roleModel.create({
    key: 'COUNSELLOR',
    label: 'Counsellor',
    permissions: permissionIds.filter((_, i) => BASE_PERMISSIONS[i] === 'leads:read'),
    isSystem: true,
  });

  return { superAdminRole, counsellorRole, permissionIds };
}

export async function seedUser(
  app: INestApplication,
  opts: { name: string; email: string; password: string; roleId: unknown; status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' },
) {
  const userModel = app.get<Model<UserDocument>>(getModelToken(User.name));
  const passwordHash = await argon2.hash(opts.password, { type: argon2.argon2id });
  return userModel.create({
    name: opts.name,
    email: opts.email.toLowerCase(),
    passwordHash,
    role: opts.roleId,
    status: opts.status ?? 'ACTIVE',
  });
}
