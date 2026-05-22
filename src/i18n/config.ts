export const SITE_URL = 'https://elemento.cloud';
export const LOCALES = ['en', 'it'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'en';

export const LOCALE_LABELS: Record<Locale, string> = {
  en: 'English',
  it: 'Italiano',
};

/** Map page stem (no .html) to localized path segment */
export const PAGE_STEMS = [
  'index',
  'about',
  'contact',
  'products',
  'signup',
  'blog',
  'atomos',
  'electros',
  'atomosphere',
  'technology',
  'orbital',
  'careers',
  'brand-guidelines',
] as const;

export type PageStem = (typeof PAGE_STEMS)[number];

export function localePath(locale: Locale, stem: string = 'index'): string {
  const file = stem === 'index' ? 'index.html' : `${stem}.html`;
  if (locale === DEFAULT_LOCALE) {
    return stem === 'index' ? '/' : `/${file}`;
  }
  return stem === 'index' ? `/it/` : `/it/${file}`;
}

/** Normalize pathname to page stem for language switcher */
export function stemFromPathname(pathname: string): string {
  let p = pathname.replace(/\/+$/, '') || '/';
  if (p.startsWith('/it/')) p = p.slice(3) || '/';
  else if (p === '/it') return 'index';
  if (p === '/' || p === '/index.html') return 'index';
  const m = p.match(/^\/(.+?)\.html$/);
  return m ? m[1] : 'index';
}

export function absoluteUrl(locale: Locale, stem: string = 'index'): string {
  const path = localePath(locale, stem);
  if (path === '/') return `${SITE_URL}/`;
  return `${SITE_URL}${path}`;
}

/** Switch locale while preserving page stem */
export function switchLocalePath(currentLocale: Locale, targetLocale: Locale, stem: string): string {
  return localePath(targetLocale, stem);
}

export function detectStemFromPath(pathname: string): string {
  let p = pathname.replace(/\/+$/, '') || '/';
  if (p.startsWith('/it')) {
    p = p.slice(3) || '/';
  }
  if (p === '/' || p === '/index.html') return 'index';
  const match = p.match(/\/([^/]+)\.html$/);
  return match ? match[1].replace(/\.html$/, '') : 'index';
}

export function getLocaleFromPath(pathname: string): Locale {
  return pathname.startsWith('/it/') || pathname === '/it' ? 'it' : 'en';
}
