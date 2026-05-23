/**
 * Shared i18n helpers for runtime CMS loaders and navbar.
 */
(function (global) {
  const TEXT_FIELDS = ['name', 'role', 'bio', 'highlight', 'description', 'title', 'subtitle', 'label', 'company', 'quote'];
  const LOCALES = ['en', 'it', 'fr'];

  function getPageLocale() {
    const htmlLang = document.documentElement.lang;
    if (LOCALES.includes(htmlLang)) return htmlLang;
    const dataLocale = document.documentElement.getAttribute('data-locale');
    if (LOCALES.includes(dataLocale)) return dataLocale;
    if (window.__I18N__?.locale && LOCALES.includes(window.__I18N__.locale)) {
      return window.__I18N__.locale;
    }
    const path = window.location.pathname;
    for (const loc of LOCALES) {
      if (loc === 'en') continue;
      if (path.startsWith(`/${loc}/`) || path === `/${loc}` || path === `/${loc}/`) return loc;
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
    if (path.startsWith(base)) return path;
    return base + path;
  }

  /** Root-absolute href for a page file (e.g. contact.html), optional locale override. */
  function pageHref(filename, locale) {
    const loc = locale ?? getPageLocale();
    const stem = filename.replace(/\.html$/, '') || 'index';
    if (loc === 'en') {
      return stem === 'index' ? '/' : `/${filename}`;
    }
    return stem === 'index' ? `/${loc}/index.html` : `/${loc}/${filename}`;
  }

  /** Language switcher target URL from page stem (no .html). */
  function localeStemHref(stem, targetLocale) {
    const file = stem === 'index' ? 'index.html' : `${stem}.html`;
    return pageHref(file, targetLocale);
  }

  global.ElementoI18n = {
    getPageLocale,
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
