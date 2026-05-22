#!/usr/bin/env node
/** Remove stale static files from dist after Astro build */
import { existsSync, rmSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = join(__dirname, '..', 'dist');

function walkRemoveHtmlHtml(dir) {
  if (!existsSync(dir)) return;
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walkRemoveHtmlHtml(path);
    else if (name.endsWith('.html.html')) {
      rmSync(path);
      console.log('Removed', path);
    }
  }
}

for (const rel of ['en', 'grazie']) {
  const p = join(DIST, rel);
  if (existsSync(p)) {
    rmSync(p, { recursive: true, force: true });
    console.log('Removed', p);
  }
}

walkRemoveHtmlHtml(DIST);
