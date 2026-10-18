import 'dotenv/config';
import mongoose, { Types } from 'mongoose';
import { hashValue } from '../common/utils/hash.util';
import { PermissionSchema, Permission } from '../modules/roles/schemas/permission.schema';
import { RoleSchema, Role, SYSTEM_ROLE_KEYS } from '../modules/roles/schemas/role.schema';
import { UserSchema, User } from '../modules/users/schemas/user.schema';
import { SettingsSchema, Settings } from '../modules/settings/schemas/settings.schema';
import { CategorySchema, Category } from '../modules/categories/schemas/category.schema';
import { PERMISSIONS_CATALOG, buildPermissionKey } from '../modules/roles/constants/permissions.catalog';

type RoleKey = (typeof SYSTEM_ROLE_KEYS)[number];

/** One-time migration of the previously-hardcoded treatment categories (from
 * apps/web/src/data/categories.ts) into the database, so the homepage/services
 * category grid doesn't go blank the first time this becomes admin-managed.
 * Only runs if the categories collection is still empty — never overwrites
 * admin edits made after the first deploy. */
const DEFAULT_CATEGORIES = [
  {
    slug: 'skin',
    name: 'Skin',
    shortDescription: 'Acne, pigmentation, brightening & rejuvenation',
    description:
      'Comprehensive skin care built around your skin type and concern — from stubborn acne and pigmentation to overall brightening and rejuvenation, using clinically proven protocols.',
    icon: 'Sparkles',
    image: 'https://images.unsplash.com/photo-1519415387722-a1c3bbef716c?w=800&h=600&fit=crop&auto=format&q=80',
    order: 0,
  },
  {
    slug: 'hair',
    name: 'Hair',
    shortDescription: 'Hair fall, thinning, restoration & scalp health',
    description:
      'Evidence-based hair treatments spanning medical therapy, PRP, and restoration procedures, designed to address hair fall at the root cause rather than mask the symptom.',
    icon: 'Wind',
    image: 'https://images.unsplash.com/photo-1695527081848-1e46c06e6458?w=800&h=600&fit=crop&auto=format&q=80',
    order: 1,
  },
  {
    slug: 'laser',
    name: 'Laser',
    shortDescription: 'Hair removal, pigmentation & skin resurfacing',
    description:
      'Advanced laser platforms for permanent hair reduction, pigmentation correction, and skin resurfacing — calibrated to Indian skin tones for safe, consistent results.',
    icon: 'Zap',
    image: 'https://plus.unsplash.com/premium_photo-1661386084694-0523d8d1fc9e?w=800&h=600&fit=crop&auto=format&q=80',
    order: 2,
  },
  {
    slug: 'anti-ageing',
    name: 'Anti-Ageing',
    shortDescription: 'Botox, fillers, threads & skin tightening',
    description:
      'Subtle, natural-looking anti-ageing solutions — from injectables to non-surgical skin tightening — that soften fine lines without changing who you are.',
    icon: 'Clock',
    image: 'https://images.unsplash.com/photo-1581182815808-b6eb627a8798?w=800&h=600&fit=crop&auto=format&q=80',
    order: 3,
  },
  {
    slug: 'facial-aesthetics',
    name: 'Facial Aesthetics',
    shortDescription: 'Contouring, harmonisation & jawline definition',
    description:
      'Precision facial contouring and harmonisation procedures that enhance your natural features with a balanced, proportionate approach.',
    icon: 'Smile',
    image: 'https://images.unsplash.com/photo-1761718209852-54ca4210183e?w=800&h=600&fit=crop&auto=format&q=80',
    order: 4,
  },
  {
    slug: 'body',
    name: 'Body',
    shortDescription: 'Contouring, fat reduction & skin tightening',
    description:
      'Non-invasive body contouring and tightening treatments to help you achieve a more sculpted silhouette without surgery or downtime.',
    icon: 'Activity',
    image: 'https://images.unsplash.com/photo-1639162906614-0603b0ae95fd?w=800&h=600&fit=crop&auto=format&q=80',
    order: 5,
  },
  {
    slug: 'bridal',
    name: 'Bridal',
    shortDescription: 'Curated pre-bridal glow programs',
    description:
      'Timed pre-bridal programs combining skin, hair, and body treatments so you arrive at every function looking and feeling your absolute best.',
    icon: 'Heart',
    image: 'https://plus.unsplash.com/premium_photo-1667509318729-1768e9128ced?w=800&h=600&fit=crop&auto=format&q=80',
    order: 6,
  },
  {
    slug: 'aesthetic-procedures',
    name: 'Aesthetic Procedures',
    shortDescription: 'Advanced surgical & minimally-invasive care',
    description:
      'Consultant-led aesthetic procedures for patients seeking more advanced correction, always beginning with an honest, realistic assessment.',
    icon: 'Stethoscope',
    image: 'https://images.unsplash.com/photo-1713085085470-fba013d67e65?w=800&h=600&fit=crop&auto=format&q=80',
    order: 7,
  },
  {
    slug: 'weight-management',
    name: 'Weight Management',
    shortDescription: 'Medically supervised weight & wellness programs',
    description:
      'Structured, medically supervised weight management programs that combine nutrition guidance with body composition tracking.',
    icon: 'TrendingDown',
    image: 'https://images.unsplash.com/photo-1630595271375-5073a6c0638b?w=800&h=600&fit=crop&auto=format&q=80',
    order: 8,
  },
  {
    slug: 'skincare',
    name: 'Skincare',
    shortDescription: 'Doctor-recommended everyday skincare',
    description:
      'Dermatologist-formulated everyday skincare recommendations that support and extend the results of your in-clinic treatments.',
    icon: 'Droplet',
    image: 'https://plus.unsplash.com/premium_photo-1682096423780-41ca1b04af68?w=800&h=600&fit=crop&auto=format&q=80',
    order: 9,
  },
];

/** module-prefix patterns each system role is granted, matched against seeded permission keys. */
const ROLE_MODULE_GRANTS: Record<RoleKey, { modules: string[]; actions?: string[] } | 'ALL'> = {
  SUPER_ADMIN: 'ALL',
  ADMIN: 'ALL',
  CONTENT_MANAGER: {
    modules: ['services', 'concerns', 'categories', 'packages', 'blogs', 'gallery', 'faqs', 'testimonials', 'before-after', 'doctors', 'clinics'],
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
  const CategoryModel = mongoose.model(Category.name, CategorySchema);

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

  // 5. Migrate the default treatment categories (only if none exist yet).
  const existingCategoryCount = await CategoryModel.countDocuments();
  if (existingCategoryCount === 0) {
    await CategoryModel.insertMany(DEFAULT_CATEGORIES);
    console.log(`Default categories seeded (${DEFAULT_CATEGORIES.length}).`);
  } else {
    console.log(`Categories already exist (${existingCategoryCount}) — leaving as is.`);
  }

  console.log('\nSeed complete.');
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
