import type { Locale } from './config';
import en from './ui/en.json';
import it from './ui/it.json';

export type UiStrings = typeof en;

const dictionaries: Record<Locale, UiStrings> = { en, it };

export function getUi(locale: Locale): UiStrings {
  return dictionaries[locale] ?? dictionaries.en;
}

export function t(locale: Locale, key: string): string {
  const dict = getUi(locale) as Record<string, unknown>;
  const parts = key.split('.');
  let cur: unknown = dict;
  for (const p of parts) {
    if (cur && typeof cur === 'object' && p in (cur as object)) {
      cur = (cur as Record<string, unknown>)[p];
    } else {
      return key;
    }
  }
  return typeof cur === 'string' ? cur : key;
}
