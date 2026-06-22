/**
 * Shared i18n helpers for runtime CMS loaders and navbar.
 */
(function (global) {
  const TEXT_FIELDS = ['name', 'role', 'bio', 'highlight', 'description', 'title', 'subtitle', 'label', 'company', 'quote'];
  const LOCALES = ['en', 'it', 'fr'];
  const NON_EN_LOCALES = ['it', 'fr'];
  /** First path segments that are site routes, not a GitHub Pages project prefix. */
  const KNOWN_SITE_ROOTS = new Set([
    'about', 'atomos', 'atomosphere', 'blog', 'blog-posts', 'bookings', 'brand-guidelines',
    'careers', 'compare-costs', 'contact', 'editor', 'electros', 'forms', 'getintouch',
    'grazie', 'install-atomos', 'orbital', 'products', 'provider-candidature', 'provider-success',
    'signup', 'signup-success', 'solutions', 'technology', 'thank-you', 'videos', '404',
    'assets', 'css', 'js', 'CMS', 'components',
  ]);

  /** GitHub Pages project sites live under /repo-name/; custom domains do not. */
  function getSiteBase() {
    if (window.__I18N__?.siteBase !== undefined) return window.__I18N__.siteBase;
    const parts = window.location.pathname.split('/').filter(Boolean);
    if (parts.length === 0) return '';
    if (parts.length >= 2 && NON_EN_LOCALES.includes(parts[1])) return `/${parts[0]}`;
    const first = parts[0];
    if (NON_EN_LOCALES.includes(first) || first.endsWith('.html') || KNOWN_SITE_ROOTS.has(first)) {
      return '';
    }
    return `/${first}`;
  }

  function stripSiteBase(pathname) {
    const base = getSiteBase();
    if (!base) return pathname;
    if (pathname === base || pathname === `${base}/`) return '/';
    if (pathname.startsWith(`${base}/`)) return pathname.slice(base.length) || '/';
    return pathname;
  }

  function withSiteBase(path) {
    if (!path || !path.startsWith('/')) return path;
    const base = getSiteBase();
    return base ? `${base}${path}` : path;
  }

  function getPageLocale() {
    const htmlLang = document.documentElement.lang;
    if (LOCALES.includes(htmlLang)) return htmlLang;
    const dataLocale = document.documentElement.getAttribute('data-locale');
    if (LOCALES.includes(dataLocale)) return dataLocale;
    if (window.__I18N__?.locale && LOCALES.includes(window.__I18N__.locale)) {
      return window.__I18N__.locale;
    }
    const path = stripSiteBase(window.location.pathname);
    for (const loc of NON_EN_LOCALES) {
      if (path.startsWith(`/${loc}/`) || path === `/${loc}`) return loc;
    }
    return 'en';
  }

  function getCmsBasePath() {
    return getAssetBase();
  }

  function resolveCmsEntry(entry, locale) {
    if (!entry || typeof entry !== 'object') return entry;
    if (entry[locale] && typeof entry[locale] === 'object') {
      return { ...entry, ...entry[locale] };
    }
    if (locale !== 'en' && entry.en && typeof entry.en === 'object') {
      return { ...entry, ...entry.en };
    }
    return entry;
  }

  function getUiStrings() {
    return window.__I18N__?.ui || null;
  }

  /** Prefix from site root (e.g. "" or "../" or "../../") for assets, css, js. */
  function getAssetBase() {
    if (window.__I18N__?.base !== undefined) return window.__I18N__.base;
    const parts = window.location.pathname.split('/').filter(Boolean);
    const last = parts[parts.length - 1] || '';
    const depth = last.endsWith('.html') ? parts.length - 1 : parts.length;
    return depth ? '../'.repeat(depth) : '';
  }

  /** Resolve a site-root-relative path (css/foo.css, js/bar.js, assets/…). */
  function assetUrl(relativePath) {
    const base = getAssetBase();
    const path = String(relativePath).replace(/^\//, '').replace(/^\.\//, '');
    if (!base) return path;
    if (base === '/') return `/${path}`;
    if (path.startsWith(base)) return path;
    return base + path;
  }

  /** Root-absolute href for a page file (e.g. contact.html), optional locale override. */
  function pageHref(filename, locale) {
    const loc = locale ?? getPageLocale();
    const stem = filename.replace(/\.html$/, '') || 'index';
    const isNestedIndex = stem.endsWith('/index') && stem !== 'index';
    let path;
    if (loc === 'en') {
      if (stem === 'index') path = '/';
      else if (isNestedIndex) path = `/${stem.slice(0, -'/index'.length)}`;
      else path = `/${filename}`;
    } else if (stem === 'index') {
      path = `/${loc}/index.html`;
    } else if (isNestedIndex) {
      path = `/${loc}/${stem.slice(0, -'/index'.length)}`;
    } else {
      path = `/${loc}/${filename}`;
    }
    return withSiteBase(path);
  }

  /** Language switcher target URL from page stem (no .html). */
  function localeStemHref(stem, targetLocale) {
    const file = stem === 'index' ? 'index.html' : `${stem}.html`;
    return pageHref(file, targetLocale);
  }

  global.ElementoI18n = {
    getPageLocale,
    getSiteBase,
    stripSiteBase,
    withSiteBase,
    getCmsBasePath,
    getAssetBase,
    assetUrl,
    resolveCmsEntry,
    getUiStrings,
    pageHref,
    localeStemHref,
    TEXT_FIELDS,
  };
})(typeof window !== 'undefined' ? window : globalThis);
