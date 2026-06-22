import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '../..');

const BASE_SCRIPTS = new Set([
  'js/i18n-utils.js',
  'js/splash-screen.js',
  'js/navbar.js',
  'js/footer.js',
  'js/main.js',
  'js/themes.js',
]);

function readHtml(relativeHtmlPath: string): string {
  return readFileSync(resolve(ROOT, relativeHtmlPath), 'utf-8');
}

/**
 * Index of the opening tag for an element identified by id="…".
 */
function findElementStart(html: string, id: string): number {
  const marker = `id="${id}"`;
  const markerIdx = html.indexOf(marker);
  if (markerIdx === -1) return -1;
  let start = markerIdx;
  while (start > 0 && html[start] !== '<') start--;
  return start;
}

/**
 * Extract main page markup between navbar and footer placeholders from legacy HTML.
 */
export function extractLegacyBody(relativeHtmlPath: string): string {
  const html = readHtml(relativeHtmlPath);

  const navMarker = 'id="navbar-placeholder"';
  const footerMarker = 'id="footer-placeholder"';
  const navIdx = html.indexOf(navMarker);
  const footerStart = findElementStart(html, 'footer-placeholder');

  if (navIdx === -1 || footerStart === -1) {
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
    return bodyMatch?.[1]?.trim() ?? html;
  }

  const afterNav = html.indexOf('>', navIdx) + 1;
  return html.slice(afterNav, footerStart).trim();
}

/** Scripts after footer placeholder (page-specific), excluding layout defaults. */
export function extractLegacyScripts(relativeHtmlPath: string): string[] {
  const html = readHtml(relativeHtmlPath);
  const footerIdx = html.indexOf('id="footer-placeholder"');
  const chunk = footerIdx >= 0 ? html.slice(footerIdx) : html;
  const scripts: string[] = [];
  const re = /<script[^>]+src=["']([^"']+)["']/gi;
  let m;
  while ((m = re.exec(chunk)) !== null) {
    let src = m[1];
    if (src.startsWith('http')) {
      if (!scripts.includes(src)) scripts.push(src);
      continue;
    }
    if (src.startsWith('../')) src = src.slice(3);
    if (BASE_SCRIPTS.has(src)) continue;
    if (src.includes('matomo') || src.includes('iubenda')) continue;
    if (!scripts.includes(src)) scripts.push(src);
  }
  return scripts;
}

export function hasSolutionConfig(relativeHtmlPath: string): boolean {
  const html = readHtml(relativeHtmlPath);
  return html.includes('data-solution-config');
}

/** Markup for iframe embeds: legacy form body only (no site navbar/footer). */
export function extractFormEmbedBody(relativeHtmlPath: string): string {
  const html = readHtml(relativeHtmlPath);
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  return bodyMatch?.[1]?.trim() ?? '';
}
