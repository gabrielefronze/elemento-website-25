#!/usr/bin/env node
/**
 * Apply localization/strings-{locale}.json to ui, CMS, body replacements, and page meta.
 * Usage: node scripts/import-localization.mjs [it|fr]
 * Default locale: it (strings-it.json)
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const LOCALE = process.argv[2] || process.env.I18N_LOCALE || 'it';
if (!['it', 'fr'].includes(LOCALE)) {
  console.error(`Unsupported locale: ${LOCALE}. Use it or fr.`);
  process.exit(1);
}

const INPUT = existsSync(join(ROOT, `localization/strings-${LOCALE}.json`))
  ? join(ROOT, `localization/strings-${LOCALE}.json`)
  : join(ROOT, 'localization/strings.json');

const SKIP = new Set(['url', 'link', 'logo', 'icon', 'photo', 'id', 'type', 'division', 'number']);

function loadJson(path) {
  return JSON.parse(readFileSync(path, 'utf-8'));
}

function saveJson(path, data) {
  writeFileSync(path, JSON.stringify(data, null, 2) + '\n');
}

function setNested(obj, path, value) {
  const parts = path.split('.');
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const p = parts[i];
    if (!(p in cur) || typeof cur[p] !== 'object' || cur[p] === null) cur[p] = {};
    cur = cur[p];
  }
  cur[parts[parts.length - 1]] = value;
}

function applyLocaleTree(en, target, prefix, map, localeKey) {
  if (!en || !target) return;
  if (typeof en === 'string') {
    const v = map.get(prefix);
    if (v) return;
    return;
  }
  if (Array.isArray(en)) {
    en.forEach((item, i) => {
      if (item && typeof item === 'object') {
        if (item.en && item[localeKey]) {
          applyLocaleTree(item.en, item[localeKey], `${prefix}.${i}`, map, localeKey);
        } else {
          applyLocaleTree(item, target[i], `${prefix}.${i}`, map, localeKey);
        }
      }
    });
    return;
  }
  if (typeof en === 'object') {
    for (const [key, val] of Object.entries(en)) {
      if (SKIP.has(key)) continue;
      const path = `${prefix}.${key}`;
      if (typeof val === 'string') {
        const tr = map.get(path);
        if (tr) target[key] = tr;
      } else if (val && typeof val === 'object') {
        if (!target[key]) target[key] = Array.isArray(val) ? [] : {};
        applyLocaleTree(val, target[key], path, map, localeKey);
      }
    }
  }
}

function ensureLocaleBlock(data, localeKey) {
  if (data.en && !data[localeKey]) {
    data[localeKey] = JSON.parse(JSON.stringify(data.en));
  }
}

function applyCmsFile(cmsPath, map, localeKey) {
  const full = join(ROOT, cmsPath);
  if (!existsSync(full)) return;
  const data = loadJson(full);
  const prefix = cmsPath.replace(/\//g, '.').replace(/\.json$/, '');

  ensureLocaleBlock(data, localeKey);
  if (data.en && data[localeKey]) {
    applyLocaleTree(data.en, data[localeKey], prefix, map, localeKey);
  } else if (Array.isArray(data)) {
    data.forEach((item, i) => {
      ensureLocaleBlock(item, localeKey);
      if (item?.en && item[localeKey]) {
        applyLocaleTree(item.en, item[localeKey], `${prefix}.${i}`, map, localeKey);
      }
    });
  } else {
    applyLocaleTree(data, data, prefix, map, localeKey);
  }
  saveJson(full, data);
}

function main() {
  const payload = loadJson(INPUT);
  const strings = payload.strings || payload;
  const map = new Map();
  const metaLocale = {};
  let bodyCount = 0;

  for (const row of strings) {
    const tr = (row[LOCALE] || '').trim();
    const en = (row.en || '').trim();
    if (!tr || tr === en) continue;
    map.set(row.id, tr);
    if (row.id.startsWith('body.')) bodyCount += 1;
    if (row.id.startsWith('meta.')) {
      const parts = row.id.split('.');
      const field = parts.pop();
      const stem = parts.slice(1).join('.');
      if (!metaLocale[stem]) metaLocale[stem] = {};
      metaLocale[stem][field] = tr;
    }
  }

  const localeUi = loadJson(join(ROOT, `src/i18n/ui/${LOCALE}.json`));
  const UI_SKIP = new Set([
    'langSwitcher.en',
    'langSwitcher.it',
    'langSwitcher.fr',
    `langSwitcher.${LOCALE}`,
  ]);
  for (const [id, tr] of map) {
    if (!id.startsWith('ui.')) continue;
    const path = id.slice(3);
    if (UI_SKIP.has(path)) continue;
    setNested(localeUi, path, tr);
  }
  if (localeUi.langSwitcher) {
    localeUi.langSwitcher.en = 'EN';
    localeUi.langSwitcher.it = 'IT';
    localeUi.langSwitcher.fr = 'FR';
  }
  if (!localeUi.pages) localeUi.pages = {};
  const manifestPath = join(ROOT, 'src/data/pages-manifest.json');
  if (existsSync(manifestPath)) {
    const manifest = loadJson(manifestPath);
    for (const page of manifest) {
      const safeStem = page.stem.replace(/[^a-zA-Z0-9._-]/g, '_').replace(/_+/g, '_');
      const fields = metaLocale[safeStem] || metaLocale[page.stem.replace(/\//g, '_')];
      if (!fields) continue;
      const key = page.stem.includes('/') ? page.stem.split('/').pop() : page.stem;
      if (!localeUi.pages[key]) localeUi.pages[key] = {};
      Object.assign(localeUi.pages[key], fields);
    }
  }
  for (const [stem, fields] of Object.entries(metaLocale)) {
    if (!localeUi.pages[stem]) localeUi.pages[stem] = {};
    Object.assign(localeUi.pages[stem], fields);
  }
  saveJson(join(ROOT, `src/i18n/ui/${LOCALE}.json`), localeUi);

  const byStem = {};
  for (const row of strings) {
    const tr = (row[LOCALE] || '').trim();
    const en = (row.en || '').trim();
    if (!tr || tr === en || !row.id.startsWith('body.')) continue;
    const stem = row.id.split('.')[1];
    if (!byStem[stem]) byStem[stem] = [];
    const entry = { en, [LOCALE]: tr };
    byStem[stem].push(entry);
  }
  for (const list of Object.values(byStem)) {
    list.sort((a, b) => b.en.length - a.en.length);
  }
  saveJson(join(ROOT, `src/i18n/replacements/${LOCALE}.json`), { byStem });

  const cmsFiles = [
    'CMS/team.json',
    'CMS/orbital.json',
    'CMS/success-stories.json',
    'CMS/provider-integrations.json',
    'CMS/partners.json',
    'CMS/solutions/ai.json',
    'CMS/solutions/devops.json',
    'CMS/solutions/industrial.json',
    'CMS/solutions/public-sector.json',
    'CMS/solutions/regulated.json',
    'CMS/solutions/system-integrators.json',
    'CMS/solutions/vmware-alternative.json',
  ];
  for (const f of cmsFiles) applyCmsFile(f, map, LOCALE);

  console.log(
    `[${LOCALE}] Imported ${map.size} strings → ui, ${bodyCount} body strings in ${Object.keys(byStem).length} pages, ${cmsFiles.length} CMS files`
  );
}

main();
