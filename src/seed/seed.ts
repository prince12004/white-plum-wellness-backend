import 'dotenv/config';
import mongoose, { Types } from 'mongoose';
import { hashValue } from '../common/utils/hash.util';
import { PermissionSchema, Permission } from '../modules/roles/schemas/permission.schema';
import { RoleSchema, Role, SYSTEM_ROLE_KEYS } from '../modules/roles/schemas/role.schema';
import { UserSchema, User } from '../modules/users/schemas/user.schema';
import { SettingsSchema, Settings } from '../modules/settings/schemas/settings.schema';
import { PERMISSIONS_CATALOG, buildPermissionKey } from '../modules/roles/constants/permissions.catalog';

type RoleKey = (typeof SYSTEM_ROLE_KEYS)[number];

/** module-prefix patterns each system role is granted, matched against seeded permission keys. */
const ROLE_MODULE_GRANTS: Record<RoleKey, { modules: string[]; actions?: string[] } | 'ALL'> = {
  SUPER_ADMIN: 'ALL',
  ADMIN: 'ALL',
  CONTENT_MANAGER: {
    modules: ['services', 'concerns', 'packages', 'blogs', 'gallery', 'faqs', 'testimonials', 'before-after', 'doctors', 'clinics'],
  },
  MARKETING_MANAGER: {
    modules: ['offers', 'leads', 'campaigns', 'analytics'],
  },
  CLINIC_MANAGER: {
    modules: ['leads', 'doctors', 'appointments', 'customers'],
  },
  COUNSELLOR: {
    modules: ['leads'],
  },
  DOCTOR: {
    modules: ['appointments', 'leads'],
    actions: ['read'],
  },
};

async function main() {
  const mongodbUri = process.env.MONGODB_URI;
  if (!mongodbUri) throw new Error('MONGODB_URI is required to run the seed script');

  const adminEmail = process.env.SEED_ADMIN_EMAIL;
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;
  const adminName = process.env.SEED_ADMIN_NAME ?? 'Super Admin';
  if (!adminEmail || !adminPassword) {
    throw new Error('SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD must be set in the environment — refusing to seed with a guessable default.');
  }

  await mongoose.connect(mongodbUri);
  console.log('Connected to MongoDB.');

  const PermissionModel = mongoose.model(Permission.name, PermissionSchema);
  const RoleModel = mongoose.model(Role.name, RoleSchema);
  const UserModel = mongoose.model(User.name, UserSchema);
  const SettingsModel = mongoose.model(Settings.name, SettingsSchema);

  // 1. Upsert the full permission catalog.
  const permissionIdsByKey = new Map<string, Types.ObjectId>();

  for (const entry of PERMISSIONS_CATALOG) {
    for (const action of entry.actions) {
      const key = buildPermissionKey(entry.module, action);
      const existing = await PermissionModel.findOneAndUpdate(
        { key },
        { key, module: entry.module, action },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      );
      permissionIdsByKey.set(key, existing._id as Types.ObjectId);
    }
  }
  const allPermissionIds = Array.from(permissionIdsByKey.values());
  console.log(`Permission catalog upserted (${permissionIdsByKey.size} total).`);

  // 2. Upsert the 7 system roles.
  const roleIdsByKey = new Map<string, Types.ObjectId>();

  for (const roleKey of SYSTEM_ROLE_KEYS) {
    const grant = ROLE_MODULE_GRANTS[roleKey];
    let permissionIds: Types.ObjectId[];

    if (grant === 'ALL') {
      permissionIds = allPermissionIds;
    } else {
      permissionIds = [];
      for (const [key, id] of permissionIdsByKey.entries()) {
        const [module, action] = key.split(':');
        if (!grant.modules.includes(module as string)) continue;
        if (grant.actions && !grant.actions.includes(action as string)) continue;
        permissionIds.push(id);
      }
    }

    const role = await RoleModel.findOneAndUpdate(
      { key: roleKey },
      {
        key: roleKey,
        label: roleKey
          .toLowerCase()
          .split('_')
          .map((w) => w[0]?.toUpperCase() + w.slice(1))
          .join(' '),
        permissions: permissionIds,
        isSystem: true,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
    roleIdsByKey.set(roleKey, role._id as Types.ObjectId);
  }
  console.log('System roles upserted (SUPER_ADMIN, ADMIN, CONTENT_MANAGER, MARKETING_MANAGER, CLINIC_MANAGER, COUNSELLOR, DOCTOR).');

  // 3. Upsert the super-admin user.
  const superAdminRoleId = roleIdsByKey.get('SUPER_ADMIN') as Types.ObjectId;
  const existingAdmin = await UserModel.findOne({ email: adminEmail.toLowerCase() });
  if (existingAdmin) {
    console.log(`Super admin user already exists (${adminEmail}) — leaving as is.`);
  } else {
    const passwordHash = await hashValue(adminPassword);
    await UserModel.create({
      name: adminName,
      email: adminEmail.toLowerCase(),
      passwordHash,
      role: superAdminRoleId,
      status: 'ACTIVE',
    });
    console.log(`Super admin user created: ${adminEmail}`);
  }

  // 4. Default settings singleton.
  const existingSettings = await SettingsModel.findOne();
  if (!existingSettings) {
    await SettingsModel.create({
      businessName: 'Demo Aesthetic Clinic',
      contactEmail: adminEmail,
      whatsappNumbers: [{ clinicId: null, number: '910000000000', label: 'Main line (edit me in Admin → Settings)' }],
    });
    console.log('Default settings document created.');
  } else {
    console.log('Settings document already exists — leaving as is.');
  }

  console.log('\nSeed complete.');
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
