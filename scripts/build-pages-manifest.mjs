#!/usr/bin/env node
/**
 * Discover migratable HTML pages and build src/data/pages-manifest.json
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const OUT = join(ROOT, 'src', 'data', 'pages-manifest.json');

const SKIP_DIRS = new Set([
  'node_modules',
  'dist',
  'public',
  'src',
  'components',
  'solutions/components',
  'assets',
  'en',
  '.git',
]);

const BASE_SCRIPTS = new Set([
  'js/i18n-utils.js',
  'js/splash-screen.js',
  'js/navbar.js',
  'js/footer.js',
  'js/main.js',
  'js/themes.js',
]);

const SOLUTION_SLUGS = new Set([
  'ai',
  'industrial',
  'devops',
  'public-sector',
  'regulated',
  'system-integrators',
  'vmware-alternative',
  'products',
  'index',
]);

function walk(dir, files = []) {
  for (const name of readdirSync(dir)) {
    if (SKIP_DIRS.has(name)) continue;
    const path = join(dir, name);
    const st = statSync(path);
    if (st.isDirectory()) walk(path, files);
    else if (name.endsWith('.html')) files.push(path);
  }
  return files;
}

function extractMeta(html) {
  const title = html.match(/<title>([^<]*)<\/title>/i)?.[1]?.trim() ?? 'Elemento';
  const description =
    html.match(/<meta\s+name="description"\s+content="([^"]*)"/i)?.[1]?.trim() ?? '';
  const robots = html.match(/<meta\s+name="robots"\s+content="([^"]*)"/i)?.[1]?.trim();
  const ogType = html.match(/<meta\s+property="og:type"\s+content="([^"]*)"/i)?.[1]?.trim();
  return { title, description, robots, ogType };
}

function extractExtraCss(html, legacyPath) {
  const css = [];
  const re = /<link[^>]+rel=["']stylesheet["'][^>]+href=["']([^"']+)["']/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    let href = m[1];
    if (href.startsWith('http') || href.includes('fonts.googleapis')) continue;
    if (href.startsWith('../')) href = href.slice(3);
    if (['css/style.css', 'css/themes.css', 'css/lang-switcher.css'].includes(href)) continue;
    if (href.startsWith('css/') && !css.includes(href)) css.push(href);
  }
  if (legacyPath.startsWith('solutions/') && !css.includes('css/solutions.css')) {
    css.push('css/solutions.css');
  }
  return css;
}

function extractExtraScripts(html) {
  const scripts = [];
  const footerIdx = html.indexOf('id="footer-placeholder"');
  const chunk = footerIdx >= 0 ? html.slice(footerIdx) : html;
  // Also scan before footer (e.g. team.js on about.html)
  const bodyChunk = footerIdx >= 0 ? html.slice(0, footerIdx) : '';
  const re = /<script[^>]+src=["']([^"']+)["']/gi;
  const scan = (text) => {
  let m;
  while ((m = re.exec(text)) !== null) {
    let src = m[1];
    if (src.startsWith('http')) {
      scripts.push(src);
      continue;
    }
    if (src.startsWith('../')) src = src.slice(3);
    if (BASE_SCRIPTS.has(src)) continue;
    if (src.includes('matomo') || src.includes('iubenda')) continue;
    if (!scripts.includes(src)) scripts.push(src);
  }
  };
  scan(chunk);
  re.lastIndex = 0;
  scan(bodyChunk);
  const inlineSolution = html.includes('data-solution-config');
  return { scripts, isSolution: inlineSolution };
}

function classify(relPath) {
  if (relPath.startsWith('blog-posts/')) {
    return { group: 'blog-posts', slug: relPath.replace('blog-posts/', '').replace('.html', '') };
  }
  if (relPath.startsWith('solutions/')) {
    const slug = relPath.replace('solutions/', '').replace('.html', '');
    return { group: 'solutions', slug };
  }
  if (relPath.startsWith('forms/')) {
    return { group: 'forms', slug: relPath.replace('forms/', '').replace('.html', '') };
  }
  if (relPath.startsWith('thank-you/')) {
    return { group: 'thank-you', slug: relPath.replace('thank-you/', '').replace('/index.html', '').replace('.html', '') };
  }
  if (relPath.startsWith('bookings/')) {
    return { group: 'bookings', slug: relPath.replace('bookings/', '').replace('.html', '') };
  }
  if (relPath.startsWith('grazie/')) {
    const slug = relPath.replace('grazie/', '').replace('/index.html', '').replace('.html', '');
    return { group: 'grazie', slug, stemOverride: `grazie/${slug.replace(/-it$/, '')}` };
  }
  const stem = relPath.replace('.html', '');
  return { group: 'root', slug: stem === 'index' ? 'index' : stem };
}

function main() {
  const files = walk(ROOT).filter((f) => !f.includes('EULA'));
  const pages = [];

  for (const abs of files) {
    const rel = relative(ROOT, abs).replace(/\\/g, '/');
    const html = readFileSync(abs, 'utf-8');
    const meta = extractMeta(html);
    const classified = classify(rel);
    const { group, slug, stemOverride } = classified;
    const stem =
      stemOverride ??
      (group === 'root'
        ? slug
        : group === 'thank-you'
          ? `thank-you/${slug}`
          : `${group}/${slug}`);
    const { scripts, isSolution } = extractExtraScripts(html);
    const extraCss = extractExtraCss(html, rel);

    pages.push({
      stem,
      legacyPath: rel,
      group,
      slug,
      title: meta.title,
      description: meta.description,
      robots: meta.robots ?? 'index, follow',
      ogType: meta.ogType ?? 'website',
      extraCss,
      extraScripts: scripts,
      type: isSolution || (group === 'solutions' && SOLUTION_SLUGS.has(slug)) ? 'solution' : 'legacy',
      locales: group === 'grazie' ? ['it'] : ['en', 'it', 'fr'],
    });
  }

  pages.sort((a, b) => a.legacyPath.localeCompare(b.legacyPath));
  writeFileSync(OUT, JSON.stringify(pages, null, 2) + '\n');
  console.log(`Wrote ${pages.length} pages to pages-manifest.json`);
}

main();
