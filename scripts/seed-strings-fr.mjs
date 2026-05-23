#!/usr/bin/env node
/**
 * Create localization/strings-fr.json from strings.json with empty fr column.
 * Run: node scripts/seed-strings-fr.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = join(ROOT, 'localization/strings.json');
const out = join(ROOT, 'localization/strings-fr.json');

const payload = JSON.parse(readFileSync(src, 'utf-8'));
payload.locales = ['en', 'it', 'fr'];
payload.note =
  'Fill the "fr" column in CSV or edit strings.fr in JSON. UI keys under ui.* are wired in the app; body.* keys are reference until imported. Empty fr falls back to English at runtime.';
payload.strings = payload.strings.map((row) => ({
  ...row,
  fr: row.fr ?? '',
}));

writeFileSync(out, JSON.stringify(payload, null, 2) + '\n');
console.log(`Wrote ${out} (${payload.strings.length} strings)`);
