import manifest from '../data/pages-manifest.json';
import type { PageEntry } from './page-types';

export const PAGES = manifest as PageEntry[];

export function pagesByGroup(group: string, locale: 'en' | 'it'): PageEntry[] {
  return PAGES.filter((p) => p.group === group && p.locales.includes(locale));
}

export function pageByStem(stem: string, locale: 'en' | 'it'): PageEntry | undefined {
  return PAGES.find((p) => p.stem === stem && p.locales.includes(locale));
}
