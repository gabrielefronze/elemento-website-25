#!/usr/bin/env node
/** Move dist/it.html → dist/it/index.html (Astro file format quirk for it/index.astro) */
import { existsSync, mkdirSync, renameSync, writeFileSync, cpSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dist = join(__dirname, '..', 'dist');
const src = join(dist, 'it.html');
const dest = join(dist, 'it', 'index.html');

if (existsSync(src)) {
  mkdirSync(join(dist, 'it'), { recursive: true });
  renameSync(src, dest);
  console.log('Moved dist/it.html → dist/it/index.html');
}

// GitHub Pages: disable Jekyll so _astro/ assets are served
writeFileSync(join(dist, '.nojekyll'), '');

const cname = join(__dirname, '..', 'CNAME');
if (existsSync(cname)) {
  cpSync(cname, join(dist, 'CNAME'));
}
