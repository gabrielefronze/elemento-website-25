#!/usr/bin/env node
/**
 * Generate sitemap.xml from pages-manifest.json (all EN + IT + FR URLs).
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DIST = join(ROOT, 'dist');
const SITE = 'https://elemento.cloud';
const MANIFEST = join(ROOT, 'src', 'data', 'pages-manifest.json');

function urlFor(locale, stem) {
  if (locale === 'en') {
    return stem === 'index' ? `${SITE}/` : `${SITE}/${stem}.html`;
  }
  return stem === 'index' ? `${SITE}/${locale}/` : `${SITE}/${locale}/${stem}.html`;
}

function main() {
  const pages = JSON.parse(readFileSync(MANIFEST, 'utf-8'));
  const today = new Date().toISOString().slice(0, 10);
  const urls = [];

  for (const p of pages) {
    for (const locale of p.locales) {
      const loc = urlFor(locale, p.stem);
      const priority =
        p.stem === 'index'
          ? locale === 'en'
            ? 1.0
            : 0.9
          : p.group === 'blog-posts'
            ? 0.5
            : p.robots?.includes('noindex')
              ? 0.3
              : 0.7;
      urls.push({ loc, stem: p.stem, locale, priority, changefreq: p.stem === 'index' ? 'weekly' : 'monthly' });
    }
  }

  const byStem = new Map();
  for (const u of urls) {
    if (!byStem.has(u.stem)) byStem.set(u.stem, []);
    byStem.get(u.stem).push(u);
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls
  .map((u) => {
    const pair = byStem.get(u.stem) || [];
    const en = pair.find((x) => x.locale === 'en');
    const it = pair.find((x) => x.locale === 'it');
    const fr = pair.find((x) => x.locale === 'fr');
    const alternates = [en, it, fr]
      .filter(Boolean)
      .map(
        (alt) =>
          `\n    <xhtml:link rel="alternate" hreflang="${alt.locale}" href="${alt.loc}"/>`
      )
      .join('');
    const xDefault = en
      ? `\n    <xhtml:link rel="alternate" hreflang="x-default" href="${en.loc}"/>`
      : '';
    return `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>${alternates}${xDefault}
  </url>`;
  })
  .join('\n')}
</urlset>
`;

  const out = existsSync(DIST) ? join(DIST, 'sitemap.xml') : join(ROOT, 'sitemap.xml');
  writeFileSync(out, xml);
  console.log(`Wrote ${out} (${urls.length} URLs from ${pages.length} pages)`);
}

main();
