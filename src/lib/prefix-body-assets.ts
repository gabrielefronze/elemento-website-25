import type { Locale } from '../i18n/config';
import { localePath } from '../i18n/config';

/**
 * Rewrite root-relative asset paths in legacy HTML body for nested locales (e.g. /it/).
 */
export function prefixBodyAssets(html: string, assetBase: string): string {
  const base = assetBase || '/';
  const prefix = base.endsWith('/') ? base : `${base}/`;

  let out = html;

  const rewrite = (attr: string, root: string) => {
    const re = new RegExp(`(${attr}=["'])(?:\\.\\/?)?(${root})`, 'g');
    out = out.replace(re, `$1${prefix}$2`);
  };

  rewrite('src', 'assets');
  rewrite('href', 'assets');
  rewrite('src', 'components');
  rewrite('href', 'components');
  rewrite('src', 'CMS');
  rewrite('href', 'CMS');
  rewrite('src', 'css');
  rewrite('href', 'css');
  rewrite('src', 'js');
  rewrite('href', 'js');

  out = out.replace(/url\(\s*['"]?(?:\.\/)?assets\//g, `url(${prefix}assets/`);
  out = out.replace(/url\(\s*['"]?(?:\.\/)?CMS\//g, `url(${prefix}CMS/`);

  return out;
}

/** Prefix a single site-root-relative URL (CMS/…, assets/…). */
export function prefixAssetPath(path: string, assetBase: string): string {
  if (!path || !assetBase) return path;
  if (/^(https?:|\/\/|\/|data:|#)/.test(path)) return path;
  const clean = path.replace(/^\.\//, '');
  if (clean.startsWith(assetBase)) return clean;
  return assetBase + clean;
}

function resolvePageStem(href: string, pageStem?: string): string | null {
  if (href.startsWith('/')) {
    const rootFile = href.match(/^\/([^/?#]+\.html)$/);
    if (rootFile) return rootFile[1].replace(/\.html$/, '') || 'index';
    const localeFile = href.match(/^\/(?:it|fr)\/(.+?)\.html$/);
    if (localeFile) return localeFile[1].replace(/\.html$/, '') || 'index';
    const nestedRoot = href.match(/^\/([\w.-]+\/[\w./-]+)\.html$/);
    if (nestedRoot) return nestedRoot[1];
    return null;
  }

  const clean = href.replace(/^\.\//, '');
  const pageDir = pageStem?.includes('/') ? pageStem.slice(0, pageStem.lastIndexOf('/')) : '';

  if (clean.startsWith('../')) {
    const parts = pageDir ? pageDir.split('/') : [];
    let rest = clean;
    while (rest.startsWith('../')) {
      parts.pop();
      rest = rest.slice(3);
    }
    const stem = rest.replace(/\.html$/, '');
    if (!stem || stem.includes('/')) return parts.length ? `${parts.join('/')}/${stem}` : stem;
    return parts.length ? `${parts.join('/')}/${stem}` : stem;
  }

  if (/^[^/?#]+\.html$/.test(clean)) {
    const name = clean.replace(/\.html$/, '') || 'index';
    return pageDir ? `${pageDir}/${name}` : name;
  }
  const nested = clean.match(/^([\w.-]+\/[\w./-]+)\.html$/);
  if (nested) return nested[1];
  return null;
}

/** Rewrite internal *.html links to site-root paths (e.g. /blog.html), safe under /videos/ in dev. */
export function prefixBodyPageLinks(
  html: string,
  pageStem: string,
  locale: Locale = 'en'
): string {
  const rewrite = (match: string, open: string, href: string, close: string) => {
    if (/^(https?:|\/\/|mailto:|tel:|#|javascript:)/i.test(href)) return match;
    const resolvedStem = resolvePageStem(href, pageStem);
    if (!resolvedStem) return match;
    return `${open}${localePath(locale, resolvedStem)}${close}`;
  };

  return html.replace(/(\shref=["'])([^"'#]+)(["'])/gi, rewrite);
}

/** Blog images are shared assets under /blog-posts/img/ (not locale-prefixed). */
export function prefixBlogPostImages(html: string): string {
  return html.replace(/(\ssrc=["'])img\//g, `$1/blog-posts/img/`);
}
