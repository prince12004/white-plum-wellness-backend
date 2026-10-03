/**
 * One-time migration: pushes the Phase 2A demo content that has lived in
 * apps/web/src/data/*.ts static arrays into the real database THROUGH the live
 * API (not direct DB writes) — this guarantees the exact same validation/shape
 * the admin panel itself uses, with zero guessing about collection names.
 *
 * Requires the API to already be running (pnpm dev/start) and reachable at
 * API_BASE_URL (defaults to http://localhost:4000/api).
 *
 * Idempotent: POSTs that 409 (slug/duplicate already exists) are treated as
 * "already migrated" and skipped, not failures. Safe to re-run.
 *
 * Run via: pnpm migrate-mock-data
 */
import 'dotenv/config';

import { services } from '../../../web/src/data/services';
import { doctors } from '../../../web/src/data/doctors';
import { clinics } from '../../../web/src/data/clinics';
import { packages } from '../../../web/src/data/packages';
import { offers } from '../../../web/src/data/offers';
import { concerns } from '../../../web/src/data/concerns';
import { testimonials } from '../../../web/src/data/testimonials';
import { blogs } from '../../../web/src/data/blogs';
import { beforeAfterResults } from '../../../web/src/data/before-after';
import { homepageFaqs } from '../../../web/src/data/faqs';
import { galleryItems } from '../../../web/src/data/content';

const API_BASE_URL = process.env.API_BASE_URL ?? 'http://localhost:4000/api';

let accessToken = '';

async function login() {
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;
  if (!email || !password) throw new Error('SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD must be set');

  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error(`Login failed: ${res.status} ${await res.text()}`);
  const data = (await res.json()) as { accessToken: string };
  accessToken = data.accessToken;
}

async function post(path: string, body: unknown): Promise<'created' | 'skipped' | 'error'> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify(body),
  });
  if (res.ok) return 'created';
  if (res.status === 409) return 'skipped';
  console.error(`  ✗ POST ${path} failed (${res.status}):`, (await res.text()).slice(0, 200));
  return 'error';
}

async function migrate(label: string, path: string, items: unknown[]) {
  let created = 0;
  let skipped = 0;
  let errored = 0;
  for (const item of items) {
    const result = await post(path, item);
    if (result === 'created') created += 1;
    else if (result === 'skipped') skipped += 1;
    else errored += 1;
  }
  console.log(`  ${label}: ${created} created, ${skipped} already existed, ${errored} failed`);
}

async function main() {
  console.log('Logging in as seeded super admin...');
  await login();

  console.log('Migrating content...');
  await migrate('clinics', '/clinics', clinics);
  await migrate('doctors', '/doctors', doctors);
  await migrate('services', '/services', services);
  await migrate('packages', '/packages', packages);
  await migrate('offers', '/offers', offers);
  await migrate('concerns', '/concerns', concerns);
  await migrate('blogs', '/blogs', blogs);
  await migrate(
    'testimonials',
    '/testimonials',
    testimonials.map(({ id: _id, ...rest }) => rest),
  );
  await migrate(
    'before-after',
    '/before-after',
    beforeAfterResults.map(({ id: _id, ...rest }) => rest),
  );
  await migrate(
    'gallery',
    '/gallery',
    galleryItems.map(({ id: _id, ...rest }) => rest),
  );
  await migrate(
    'faqs',
    '/faqs',
    homepageFaqs.map((f, i) => ({ ...f, order: i })),
  );

  console.log('\nMigration complete.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
