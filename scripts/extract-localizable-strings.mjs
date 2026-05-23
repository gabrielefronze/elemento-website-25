#!/usr/bin/env node
/**
 * Extract all localizable strings into localization/strings.json + strings.csv
 *
 * Sources: src/i18n/ui/*.json, CMS JSON, legacy HTML bodies (pages-manifest)
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const OUT_DIR = join(ROOT, 'localization');
const MANIFEST = join(ROOT, 'src', 'data', 'pages-manifest.json');

const SKIP_KEYS = new Set([
  'id',
  'slug',
  'stem',
  'legacyPath',
  'group',
  'locales',
  'type',
  'robots',
  'ogType',
  'extraCss',
  'extraScripts',
  'url',
  'link',
  'logo',
  'icon',
  'photo',
  'src',
  'href',
  'number',
  'division',
  'regions',
  'status',
  'level',
  'provider',
  'name', // product name AtomOS often kept in EN
]);

const TEXT_LIKE_KEYS = new Set([
  'text',
  'title',
  'subtitle',
  'description',
  'label',
  'tagline',
  'heading',
  'quote',
  'role',
  'bio',
  'highlight',
  'company',
  'author',
  'industry',
  'name',
  'heroTitle',
  'heroSubtitle',
  'readMore',
  'note',
  'message',
  'placeholder',
  'cta',
  'tagline',
  'items',
  'question',
  'answer',
]);

/** @type {Map<string, { id: string, en: string, it: string, source: string, context?: string }>} */
const store = new Map();

function add(id, en, it = '', source = '', context = '') {
  if (!en || typeof en !== 'string') return;
  const text = en.replace(/\s+/g, ' ').trim();
  if (!text || text.length < 2) return;
  if (/^https?:\/\//i.test(text)) return;
  if (/^[\d\s.,+%€$|-]+$/.test(text)) return;

  const safeId = id.replace(/[^a-zA-Z0-9._-]/g, '_').replace(/_+/g, '_');
  if (store.has(safeId)) {
    const existing = store.get(safeId);
    if (existing.en !== text) {
      const altId = `${safeId}_${hash(text).slice(0, 6)}`;
      store.set(altId, { id: altId, en: text, it: it || '', source, context });
    } else if (it && !existing.it) {
      existing.it = it;
    }
    return;
  }
  store.set(safeId, { id: safeId, en: text, it: it || '', source, context });
}

function hash(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h).toString(36);
}

function stripHtml(fragment) {
  return fragment
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/\s+/g, ' ')
    .trim();
}

function flattenUi(en, it, prefix = 'ui') {
  function walk(a, b, path) {
    if (typeof a === 'string') {
      const bVal = typeof b === 'string' ? b : '';
      add(path, a, bVal, 'src/i18n/ui');
      return;
    }
    if (!a || typeof a !== 'object' || Array.isArray(a)) return;
    for (const key of Object.keys(a)) {
      walk(a[key], b && typeof b === 'object' ? b[key] : undefined, `${path}.${key}`);
    }
  }
  walk(en, it, prefix);
}

function shouldCollectKey(key) {
  if (SKIP_KEYS.has(key)) return false;
  if (TEXT_LIKE_KEYS.has(key)) return true;
  return /title|subtitle|description|label|text|tagline|heading|quote|role|bio|name|message|cta/i.test(
    key
  );
}

function collectFromJson(obj, idPrefix, source, enBranch, itBranch) {
  if (typeof obj === 'string') {
    if (shouldCollectKey(idPrefix.split('.').pop() || '')) {
      add(idPrefix, obj, '', source);
    }
    return;
  }
  if (Array.isArray(obj)) {
    obj.forEach((item, i) => collectFromJson(item, `${idPrefix}.${i}`, source, enBranch, itBranch));
    return;
  }
  if (!obj || typeof obj !== 'object') return;

  if (obj.en && obj.it && typeof obj.en === 'object' && !Array.isArray(obj.en)) {
    collectFromJson(obj.en, idPrefix, source, obj.en, obj.it);
    return;
  }

  for (const [key, val] of Object.entries(obj)) {
    if (key === 'en' && enBranch === undefined && itBranch === undefined) {
      continue;
    }
    if (key === 'it' && enBranch === undefined) continue;
    if (SKIP_KEYS.has(key) && typeof val !== 'object') continue;

    const nextEn = enBranch?.[key] ?? (key === 'en' ? val : undefined);
    const nextIt = itBranch?.[key] ?? (key === 'it' ? val : undefined);

    if (key === 'en' && typeof val === 'object') {
      collectFromJson(val, idPrefix, source, val, obj.it);
      continue;
    }

    if (shouldCollectKey(key) || typeof val === 'object') {
      const itVal = itBranch?.[key];
      const enVal = enBranch?.[key] ?? val;
      if (typeof enVal === 'string' && typeof itVal === 'string') {
        add(`${idPrefix}.${key}`, enVal, itVal, source);
      } else {
        collectFromJson(
          val,
          `${idPrefix}.${key}`,
          source,
          typeof enVal === 'object' ? enVal : enBranch,
          typeof itVal === 'object' ? itVal : itBranch
        );
      }
    }
  }
}

function extractLegacyBody(html) {
  const navIdx = html.indexOf('id="navbar-placeholder"');
  const footerIdx = html.indexOf('id="footer-placeholder"');
  if (navIdx === -1 || footerIdx === -1) {
    const m = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
    return m?.[1]?.trim() ?? html;
  }
  const afterNav = html.indexOf('>', navIdx) + 1;
  return html.slice(afterNav, footerIdx).trim();
}

function extractHtmlStrings(html, stem, legacyPath) {
  const body = extractLegacyBody(html);
  const tags = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'li', 'button', 'label', 'th', 'td', 'blockquote', 'figcaption'];
  const counts = {};

  for (const tag of tags) {
    const re = new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`, 'gi');
    let m;
    while ((m = re.exec(body)) !== null) {
      const text = stripHtml(m[1]);
      if (!text || text.length < 2) continue;
      counts[tag] = (counts[tag] || 0) + 1;
      const n = counts[tag];
      add(`body.${stem}.${tag}.${n}`, text, '', legacyPath, `<${tag}>`);
    }
  }

  // span/div with common UI classes
  const classRe =
    /<(?:span|div|a)\s+[^>]*class="[^"]*(?:hero-tagline|hero-title|hero-subtitle|btn|card-title|section-title|faq-question)[^"]*"[^>]*>([\s\S]*?)<\/(?:span|div|a)>/gi;
  let cm;
  let c = 0;
  while ((cm = classRe.exec(body)) !== null) {
    const text = stripHtml(cm[1]);
    if (!text || text.length < 2) continue;
    c += 1;
    add(`body.${stem}.ui.${c}`, text, '', legacyPath, 'class');
  }

  // FAQ accordion: question text is in the first <span> inside .faq-question (arrow is separate)
  const faqRe =
    /<button[^>]*class="[^"]*faq-question[^"]*"[^>]*>\s*<span>([\s\S]*?)<\/span>/gi;
  let fq = 0;
  while ((cm = faqRe.exec(body)) !== null) {
    const text = stripHtml(cm[1]);
    if (!text || text.length < 2) continue;
    fq += 1;
    add(`body.${stem}.faq.q.${fq}`, text, '', legacyPath, 'faq-question');
  }
}

function walkJsonFiles(dir, prefix) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) {
      walkJsonFiles(path, `${prefix}/${name}`);
      continue;
    }
    if (!name.endsWith('.json')) continue;
    const rel = relative(ROOT, path).replace(/\\/g, '/');
    const data = JSON.parse(readFileSync(path, 'utf-8'));
    const baseId = rel.replace(/\//g, '.').replace(/\.json$/, '');
    if (data.en && data.it) {
      collectFromJson(data.en, baseId, rel, data.en, data.it);
    } else if (Array.isArray(data)) {
      data.forEach((item, i) => {
        if (item.en && item.it) {
          collectFromJson(item.en, `${baseId}.${i}`, rel, item.en, item.it);
        } else {
          collectFromJson(item, `${baseId}.${i}`, rel);
        }
      });
    } else {
      collectFromJson(data, baseId, rel);
    }
  }
}

function toCsv(rows) {
  const esc = (v) => {
    const s = String(v ?? '');
    if (s.includes('"') || s.includes(',') || s.includes('\n')) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };
  const header = ['id', 'en', 'it', 'source', 'context'];
  return [header.join(','), ...rows.map((r) => header.map((h) => esc(r[h])).join(','))].join('\n');
}

function main() {
  mkdirSync(OUT_DIR, { recursive: true });

  const enUi = JSON.parse(readFileSync(join(ROOT, 'src/i18n/ui/en.json'), 'utf-8'));
  const itUi = JSON.parse(readFileSync(join(ROOT, 'src/i18n/ui/it.json'), 'utf-8'));
  flattenUi(enUi, itUi);

  walkJsonFiles(join(ROOT, 'CMS'), 'CMS');

  const manifest = JSON.parse(readFileSync(MANIFEST, 'utf-8'));
  for (const page of manifest) {
    add(`meta.${page.stem}.title`, page.title, '', page.legacyPath, 'meta title');
    add(`meta.${page.stem}.description`, page.description, '', page.legacyPath, 'meta description');

    const htmlPath = join(ROOT, page.legacyPath);
    if (!statSync(htmlPath).isFile()) continue;
    const html = readFileSync(htmlPath, 'utf-8');
    extractHtmlStrings(html, page.stem.replace(/\//g, '_'), page.legacyPath);
  }

  const rows = [...store.values()].sort((a, b) => a.id.localeCompare(b.id));
  const payload = {
    generatedAt: new Date().toISOString(),
    total: rows.length,
    locales: ['en', 'it'],
    note: 'Fill the "it" column in CSV or edit strings.it in JSON. UI keys under ui.* are wired in the app; body.* keys are reference until imported.',
    strings: rows,
  };

  writeFileSync(join(OUT_DIR, 'strings.json'), JSON.stringify(payload, null, 2) + '\n');

  const byPage = {};
  for (const row of rows) {
    const pageKey = row.id.startsWith('body.')
      ? row.id.split('.')[1]
      : row.id.startsWith('meta.')
        ? row.id.split('.')[1]
        : row.id.startsWith('ui.')
          ? '_ui'
          : row.id.startsWith('CMS.')
            ? '_cms'
            : '_other';
    if (!byPage[pageKey]) byPage[pageKey] = [];
    byPage[pageKey].push(row);
  }
  mkdirSync(join(OUT_DIR, 'by-page'), { recursive: true });
  for (const [page, items] of Object.entries(byPage)) {
    writeFileSync(
      join(OUT_DIR, 'by-page', `${page}.json`),
      JSON.stringify({ page, count: items.length, strings: items }, null, 2) + '\n'
    );
  }

  writeFileSync(join(OUT_DIR, 'strings.csv'), toCsv(rows) + '\n');

  const missingIt = rows.filter((r) => !r.it).length;
  console.log(`Wrote ${rows.length} strings to localization/`);
  console.log(`  - strings.json (master)`);
  console.log(`  - strings.csv (for Excel / Google Sheets)`);
  console.log(`  - by-page/*.json (${Object.keys(byPage).length} files)`);
  console.log(`  ${rows.length - missingIt} already have Italian; ${missingIt} need translation`);
}

main();
