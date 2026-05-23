#!/usr/bin/env node
/**
 * Move dist/{locale}.html → dist/{locale}/index.html (Astro quirk for {locale}/index.astro).
 * Also writes .nojekyll and copies CNAME into dist.
 */
import { existsSync, mkdirSync, renameSync, writeFileSync, cpSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dist = join(__dirname, '..', 'dist');
const LOCALES = ['it', 'fr'];

for (const locale of LOCALES) {
  const src = join(dist, `${locale}.html`);
  const dest = join(dist, locale, 'index.html');
  if (existsSync(src)) {
    mkdirSync(join(dist, locale), { recursive: true });
    renameSync(src, dest);
    console.log(`Moved dist/${locale}.html → dist/${locale}/index.html`);
  }
}

writeFileSync(join(dist, '.nojekyll'), '');

const cname = join(__dirname, '..', 'CNAME');
if (existsSync(cname)) {
  cpSync(cname, join(dist, 'CNAME'));
}
