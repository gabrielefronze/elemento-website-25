#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..', 'solutions');

const FILES = [
  'ai.html',
  'industrial.html',
  'public-sector.html',
  'regulated.html',
  'system-integrators.html',
  'devops.html',
  'vmware-alternative.html',
];

for (const file of FILES) {
  const stem = file.replace('.html', '');
  let html = readFileSync(join(ROOT, file), 'utf-8');
  html = html.replace(
    /<!-- Page Configuration -->[\s\S]*?<script>\s*window\.pageConfig\s*=[\s\S]*?<\/script>/,
    `<!-- Page Configuration -->
    <script data-solution-config="${stem}" defer src="../js/i18n-utils.js"></script>
    <script data-solution-config="${stem}" defer src="../js/solution-config-loader.js"></script>`
  );
  if (!html.includes('hreflang="it"')) {
    html = html.replace(
      /<link rel="canonical" href="([^"]+)">/,
      (m, url) => `${m}
    <link rel="alternate" hreflang="en" href="${url}">
    <link rel="alternate" hreflang="it" href="${url.replace('elemento.cloud/', 'elemento.cloud/it/')}">
    <link rel="alternate" hreflang="x-default" href="${url}">`
    );
  }
  writeFileSync(join(ROOT, file), html);
  console.log(`Patched ${file}`);
}
