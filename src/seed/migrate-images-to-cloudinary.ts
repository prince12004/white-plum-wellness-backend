/**
 * One-time migration: finds every content document whose image field(s) still
 * point at a hotlinked Unsplash URL (images.unsplash.com / plus.unsplash.com —
 * the latter requires a paid licence and otherwise serves a watermarked preview,
 * which is why this matters beyond just "ownership") and re-uploads each one to
 * Cloudinary, then PATCHes the owning document to the new URL.
 *
 * Goes through the live API (not direct DB writes) so every PATCH re-runs the
 * same validation the admin panel itself uses. Identical source URLs (the seed
 * pool system reuses the same Unsplash photo across many entities) are only
 * uploaded once and reused everywhere they appear.
 *
 * Requires: the API running and reachable at API_BASE_URL, Cloudinary
 * credentials actually set in apps/api/.env, and SEED_ADMIN_EMAIL/PASSWORD.
 *
 * Run via: pnpm --filter api migrate-images
 */
import 'dotenv/config';

const API_BASE_URL = process.env.API_BASE_URL ?? 'http://localhost:4000/api';
const UNSPLASH_RE = /unsplash\.com/;

let accessToken = '';
const urlCache = new Map<string, string>();

async function login() {
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;
  if (!email || !password) throw new Error('SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD must be set');

  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error(`Login failed: ${res.status}`);
  const setCookie = res.headers.get('set-cookie') ?? '';
  const match = /access_token=([^;]+)/.exec(setCookie);
  if (!match) throw new Error('No access_token cookie returned from login');
  accessToken = match[1]!;
}

async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Cookie: `access_token=${accessToken}`,
      ...options.headers,
    },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`${options.method ?? 'GET'} ${path} failed: ${res.status} ${body}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

async function migrateUrl(sourceUrl: string, name: string, category: string): Promise<string> {
  if (!UNSPLASH_RE.test(sourceUrl)) return sourceUrl; // already migrated or not an Unsplash URL
  const cached = urlCache.get(sourceUrl);
  if (cached) return cached;

  const { url } = await api<{ url: string }>('/media/migrate-url', {
    method: 'POST',
    body: JSON.stringify({ url: sourceUrl, name, category }),
  });
  urlCache.set(sourceUrl, url);
  console.log(`  uploaded → ${name}`);
  return url;
}

interface Entity {
  id: string;
  name?: string;
  title?: string;
  [key: string]: unknown;
}

async function migrateSimpleField(
  listPath: string,
  patchPath: (id: string) => string,
  field: string,
  category: string,
) {
  console.log(`\n${category}: scanning ${listPath}...`);
  const { items } = await api<{ items: Entity[] }>(`${listPath}?pageSize=200`);
  let migrated = 0;
  for (const item of items) {
    const current = item[field] as string | undefined;
    if (!current || !UNSPLASH_RE.test(current)) continue;
    const label = item.name ?? item.title ?? item.id;
    const newUrl = await migrateUrl(current, String(label), category);
    await api(patchPath(item.id), { method: 'PATCH', body: JSON.stringify({ [field]: newUrl }) });
    migrated++;
  }
  console.log(`  ${migrated}/${items.length} migrated`);
}

async function migrateBeforeAfter() {
  console.log('\nbefore-after: scanning /before-after...');
  const { items } = await api<{ items: Entity[] }>('/before-after?pageSize=200');
  let migrated = 0;
  for (const item of items) {
    const patch: Record<string, string> = {};
    const before = item.beforeImage as string | undefined;
    const after = item.afterImage as string | undefined;
    if (before && UNSPLASH_RE.test(before)) {
      patch.beforeImage = await migrateUrl(before, `${item.title ?? item.id} (before)`, 'before-after');
    }
    if (after && UNSPLASH_RE.test(after)) {
      patch.afterImage = await migrateUrl(after, `${item.title ?? item.id} (after)`, 'before-after');
    }
    if (Object.keys(patch).length > 0) {
      await api(`/before-after/${item.id}`, { method: 'PATCH', body: JSON.stringify(patch) });
      migrated++;
    }
  }
  console.log(`  ${migrated}/${items.length} migrated`);
}

async function migrateHomepageHero() {
  console.log('\nhomepage-cms: scanning hero slides...');
  const content = await api<{ heroSlides: { eyebrow: string; title: string; description: string; image: string }[] }>(
    '/homepage-cms',
  );
  let migrated = 0;
  const newSlides = await Promise.all(
    content.heroSlides.map(async (slide) => {
      if (!UNSPLASH_RE.test(slide.image)) return slide;
      migrated++;
      return { ...slide, image: await migrateUrl(slide.image, slide.title, 'homepage-hero') };
    }),
  );
  if (migrated > 0) {
    await api('/homepage-cms', { method: 'PATCH', body: JSON.stringify({ heroSlides: newSlides }) });
  }
  console.log(`  ${migrated}/${content.heroSlides.length} migrated`);
}

async function main() {
  console.log(`Migrating Unsplash images to Cloudinary via ${API_BASE_URL}...`);
  await login();

  await migrateSimpleField('/services', (id) => `/services/${id}`, 'image', 'services');
  await migrateSimpleField('/doctors', (id) => `/doctors/${id}`, 'photo', 'doctors');
  await migrateSimpleField('/clinics', (id) => `/clinics/${id}`, 'image', 'clinics');
  await migrateSimpleField('/packages', (id) => `/packages/${id}`, 'image', 'packages');
  await migrateSimpleField('/offers', (id) => `/offers/${id}`, 'image', 'offers');
  await migrateSimpleField('/concerns', (id) => `/concerns/${id}`, 'image', 'concerns');
  await migrateSimpleField('/testimonials', (id) => `/testimonials/${id}`, 'photo', 'testimonials');
  await migrateSimpleField('/blogs', (id) => `/blogs/${id}`, 'image', 'blogs');
  await migrateSimpleField('/gallery', (id) => `/gallery/${id}`, 'image', 'gallery');
  await migrateBeforeAfter();
  await migrateHomepageHero();

  console.log(`\nDone. ${urlCache.size} unique images uploaded to Cloudinary.`);
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
