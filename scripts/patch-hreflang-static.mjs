#!/usr/bin/env node
/** Add hreflang it + x-default to static HTML pages in repo root */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const SITE = 'https://elemento.cloud';

const PAGES = [
  'atomos.html',
  'electros.html',
  'atomosphere.html',
  'orbital.html',
  'technology.html',
  'careers.html',
  'brand-guidelines.html',
  'vmware-alternative.html',
  'compare-costs.html',
  'install-atomos.html',
  'blog.html',
];

function patch(file) {
  let html = readFileSync(join(ROOT, file), 'utf-8');
  if (html.includes('hreflang="it"')) return;
  const canonical = html.match(/<link rel="canonical" href="([^"]+)">/);
  if (!canonical) return;
  const enUrl = canonical[1];
  const itUrl = enUrl.replace(SITE, `${SITE}/it`).replace(/\/it\/it\//, '/it/');
  const block = `
    <link rel="alternate" hreflang="en" href="${enUrl}">
    <link rel="alternate" hreflang="it" href="${itUrl}">
    <link rel="alternate" hreflang="x-default" href="${enUrl}">`;
  html = html.replace(/<link rel="canonical" href="[^"]+">/, (m) => m + block);
  writeFileSync(join(ROOT, file), html);
  console.log('Patched', file);
}

for (const f of PAGES) {
  try {
    patch(f);
  } catch (e) {
    console.warn(f, e.message);
  }
}
