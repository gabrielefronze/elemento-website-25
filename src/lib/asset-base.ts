import type { Locale } from '../i18n/config';

/** Relative prefix from page URL to site root (for assets/, css/, js/). */
export function assetBaseFor(locale: Locale, stem: string): string {
  const folderDepth = stem === 'index' ? 0 : stem.split('/').length - 1;
  const total = folderDepth + (locale === 'en' ? 0 : 1);
  return total === 0 ? '' : '../'.repeat(total);
}
