import type { PermissionAction } from '../schemas/permission.schema';

export interface CatalogEntry {
  module: string;
  actions: PermissionAction[];
}

/**
 * Canonical permission catalog. Seeded in full (Phase 1 modules + the full future
 * module list) so the Roles admin page's permission matrix is complete from day one —
 * later phases add enforcing guards against modules that already have rows here,
 * with zero RBAC schema changes.
 */
export const PERMISSIONS_CATALOG: CatalogEntry[] = [
  // Phase 1 — enforced now
  { module: 'users', actions: ['create', 'read', 'update', 'delete'] },
  { module: 'roles', actions: ['create', 'read', 'update', 'delete'] },
  { module: 'settings', actions: ['read', 'update'] },
  { module: 'audit-log', actions: ['read'] },

  // Future modules — rows exist for the permission matrix UI; no guards enforce them yet
  { module: 'services', actions: ['create', 'read', 'update', 'delete', 'publish'] },
  { module: 'concerns', actions: ['create', 'read', 'update', 'delete', 'publish'] },
  { module: 'packages', actions: ['create', 'read', 'update', 'delete', 'publish'] },
  { module: 'doctors', actions: ['create', 'read', 'update', 'delete', 'publish'] },
  { module: 'clinics', actions: ['create', 'read', 'update', 'delete'] },
  { module: 'before-after', actions: ['create', 'read', 'update', 'delete', 'publish'] },
  { module: 'offers', actions: ['create', 'read', 'update', 'delete', 'publish'] },
  { module: 'testimonials', actions: ['create', 'read', 'update', 'delete', 'publish'] },
  { module: 'blogs', actions: ['create', 'read', 'update', 'delete', 'publish'] },
  { module: 'gallery', actions: ['create', 'read', 'update', 'delete'] },
  { module: 'faqs', actions: ['create', 'read', 'update', 'delete'] },
  { module: 'homepage-cms', actions: ['read', 'update', 'publish'] },
  { module: 'page-builder', actions: ['create', 'read', 'update', 'delete', 'publish'] },
  { module: 'leads', actions: ['create', 'read', 'update', 'delete', 'manage'] },
  { module: 'appointments', actions: ['create', 'read', 'update', 'delete'] },
  { module: 'campaigns', actions: ['create', 'read', 'update', 'delete'] },
  { module: 'analytics', actions: ['read'] },
  { module: 'seo', actions: ['read', 'update'] },
  { module: 'media', actions: ['create', 'read', 'update', 'delete'] },
  { module: 'customers', actions: ['read'] },
];

export function buildPermissionKey(module: string, action: PermissionAction): string {
  return `${module}:${action}`;
}
