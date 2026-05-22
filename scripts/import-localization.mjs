#!/usr/bin/env node
/**
 * Apply localization/strings-it.json to ui, CMS, body replacements, and page meta.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const INPUT = existsSync(join(ROOT, 'localization/strings-it.json'))
  ? join(ROOT, 'localization/strings-it.json')
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

function applyLocaleTree(en, it, prefix, map) {
  if (!en || !it) return;
  if (typeof en === 'string') {
    const v = map.get(prefix);
    if (v) return;
    return;
  }
  if (Array.isArray(en)) {
    en.forEach((item, i) => {
      if (item && typeof item === 'object') {
        if (item.en && item.it) {
          applyLocaleTree(item.en, item.it, `${prefix}.${i}`, map);
        } else {
          applyLocaleTree(item, it[i], `${prefix}.${i}`, map);
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
        if (tr) it[key] = tr;
      } else if (val && typeof val === 'object') {
        if (!it[key]) it[key] = Array.isArray(val) ? [] : {};
        applyLocaleTree(val, it[key], path, map);
      }
    }
  }
}

function applyCmsFile(cmsPath, map) {
  const full = join(ROOT, cmsPath);
  if (!existsSync(full)) return;
  const data = loadJson(full);
  const prefix = cmsPath.replace(/\//g, '.').replace(/\.json$/, '');

  if (data.en && data.it) {
    applyLocaleTree(data.en, data.it, prefix, map);
  } else if (Array.isArray(data)) {
    data.forEach((item, i) => {
      if (item?.en && item?.it) applyLocaleTree(item.en, item.it, `${prefix}.${i}`, map);
    });
  } else {
    applyLocaleTree(data, data, prefix, map);
  }
  saveJson(full, data);
}

function main() {
  const payload = loadJson(INPUT);
  const strings = payload.strings || payload;
  const map = new Map();
  const metaIt = {};
  let bodyCount = 0;

  for (const row of strings) {
    const it = (row.it || '').trim();
    const en = (row.en || '').trim();
    if (!it || it === en) continue;
    map.set(row.id, it);
    if (row.id.startsWith('body.')) bodyCount += 1;
    if (row.id.startsWith('meta.')) {
      const parts = row.id.split('.');
      const field = parts.pop();
      const stem = parts.slice(1).join('.');
      if (!metaIt[stem]) metaIt[stem] = {};
      metaIt[stem][field] = it;
    }
  }

  const itUi = loadJson(join(ROOT, 'src/i18n/ui/it.json'));
  const UI_SKIP = new Set(['langSwitcher.en', 'langSwitcher.it']);
  for (const [id, it] of map) {
    if (!id.startsWith('ui.')) continue;
    const path = id.slice(3);
    if (UI_SKIP.has(path)) continue;
    setNested(itUi, path, it);
  }
  if (itUi.langSwitcher) {
    itUi.langSwitcher.en = 'EN';
    itUi.langSwitcher.it = 'IT';
  }
  if (!itUi.pages) itUi.pages = {};
  const manifestPath = join(ROOT, 'src/data/pages-manifest.json');
  if (existsSync(manifestPath)) {
    const manifest = loadJson(manifestPath);
    for (const page of manifest) {
      const safeStem = page.stem.replace(/[^a-zA-Z0-9._-]/g, '_').replace(/_+/g, '_');
      const fields = metaIt[safeStem] || metaIt[page.stem.replace(/\//g, '_')];
      if (!fields) continue;
      const key = page.stem.includes('/') ? page.stem.split('/').pop() : page.stem;
      if (!itUi.pages[key]) itUi.pages[key] = {};
      Object.assign(itUi.pages[key], fields);
    }
  }
  for (const [stem, fields] of Object.entries(metaIt)) {
    if (!itUi.pages[stem]) itUi.pages[stem] = {};
    Object.assign(itUi.pages[stem], fields);
  }
  saveJson(join(ROOT, 'src/i18n/ui/it.json'), itUi);

  const byStem = {};
  for (const row of strings) {
    const it = (row.it || '').trim();
    const en = (row.en || '').trim();
    if (!it || it === en || !row.id.startsWith('body.')) continue;
    const stem = row.id.split('.')[1];
    if (!byStem[stem]) byStem[stem] = [];
    byStem[stem].push({ en, it });
  }
  for (const list of Object.values(byStem)) {
    list.sort((a, b) => b.en.length - a.en.length);
  }
  saveJson(join(ROOT, 'src/i18n/replacements/it.json'), { byStem });

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
  for (const f of cmsFiles) applyCmsFile(f, map);

  console.log(
    `Imported ${map.size} strings → ui, ${bodyCount} body strings in ${Object.keys(byStem).length} pages, ${cmsFiles.length} CMS files`
  );
}

main();
