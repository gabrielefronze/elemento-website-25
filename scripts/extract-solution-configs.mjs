#!/usr/bin/env node
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const OUT = join(ROOT, 'CMS', 'solutions');

const FILES = [
  'ai.html',
  'industrial.html',
  'public-sector.html',
  'regulated.html',
  'system-integrators.html',
  'devops.html',
  'vmware-alternative.html',
];

function extractConfig(html) {
  const match = html.match(/window\.pageConfig\s*=\s*(\{[\s\S]*?\n\s*\});/);
  if (!match) return null;
  return Function(`"use strict"; return (${match[1]});`)();
}

function main() {
  if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });
  for (const file of FILES) {
    const html = readFileSync(join(ROOT, 'solutions', file), 'utf-8');
    const config = extractConfig(html);
    if (!config) {
      console.warn(`No pageConfig in ${file}`);
      continue;
    }
    const stem = file.replace('.html', '');
    const outPath = join(OUT, `${stem}.json`);
    const existing = existsSync(outPath) ? JSON.parse(readFileSync(outPath, 'utf-8')) : {};
    writeFileSync(
      outPath,
      JSON.stringify({ en: config, it: existing.it || config }, null, 2) + '\n'
    );
    console.log(`Wrote ${stem}.json`);
  }
}

main();
