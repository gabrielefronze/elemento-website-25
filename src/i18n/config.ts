export const SITE_URL = 'https://elemento.cloud';
export const LOCALES = ['en', 'it', 'fr'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'en';

export const NON_DEFAULT_LOCALES = LOCALES.filter((l) => l !== DEFAULT_LOCALE) as Exclude<
  Locale,
  'en'
>[];

export const LOCALE_LABELS: Record<Locale, string> = {
  en: 'English',
  it: 'Italiano',
  fr: 'Français',
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

export function localePrefix(locale: Locale): string {
  if (locale === DEFAULT_LOCALE) return '';
  return `/${locale}`;
}

export function localePath(locale: Locale, stem: string = 'index'): string {
  const file = stem === 'index' ? 'index.html' : `${stem}.html`;
  if (locale === DEFAULT_LOCALE) {
    return stem === 'index' ? '/' : `/${file}`;
  }
  const prefix = localePrefix(locale);
  return stem === 'index' ? `${prefix}/` : `${prefix}/${file}`;
}

function stripLocalePrefix(pathname: string): string {
  let p = pathname.replace(/\/+$/, '') || '/';
  for (const loc of NON_DEFAULT_LOCALES) {
    const prefix = `/${loc}`;
    if (p === prefix) return '/';
    if (p.startsWith(`${prefix}/`)) return p.slice(prefix.length) || '/';
  }
  return p;
}

/** Normalize pathname to page stem for language switcher */
export function stemFromPathname(pathname: string): string {
  const p = stripLocalePrefix(pathname);
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
  return stemFromPathname(pathname);
}

export function getLocaleFromPath(pathname: string): Locale {
  const p = pathname.replace(/\/+$/, '') || '/';
  for (const loc of NON_DEFAULT_LOCALES) {
    if (p === `/${loc}` || p.startsWith(`/${loc}/`)) return loc;
  }
  return 'en';
}
