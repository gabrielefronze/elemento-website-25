import type { Locale } from '../i18n/config';

function normalizeBase(): string {
  const base = import.meta.env.BASE_URL || '/';
  return base.endsWith('/') ? base : `${base}/`;
}

/**
 * Prefix for assets/, css/, js/ from site root.
 * Uses Astro `base` so GitHub Pages project sites resolve under /repo-name/.
 */
export function assetBaseFor(_locale: Locale, _stem: string): string {
  return normalizeBase();
}

/** Path prefix without trailing slash (e.g. "" or "/elemento-website-25"). */
export function siteBasePath(): string {
  const base = normalizeBase();
  if (base === '/') return '';
  return base.endsWith('/') ? base.slice(0, -1) : base;
}

/** Prefix a root-absolute site path with Astro base. */
export function withSitePath(path: string): string {
  const base = normalizeBase();
  if (!path || path === '/') {
    return base === '/' ? '/' : base;
  }
  const clean = path.startsWith('/') ? path.slice(1) : path;
  return base === '/' ? `/${clean}` : `${base}${clean}`;
}
