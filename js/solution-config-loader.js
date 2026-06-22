/**
 * Loads locale-specific pageConfig from CMS/solutions/{slug}.json
 * Must run before landing-page-loader.js (both defer, order preserved).
 */
(function () {
  'use strict';

  const script = document.querySelector('script[data-solution-config]');
  if (!script) return;

  const slug = script.getAttribute('data-solution-config');
  const locale =
    (window.ElementoI18n && window.ElementoI18n.getPageLocale()) ||
    (document.documentElement.lang === 'it' || document.documentElement.lang === 'fr'
      ? document.documentElement.lang
      : 'en');

  const path = window.location.pathname;
  const localized = locale !== 'en' && path.includes(`/${locale}/`);

  const url = window.ElementoI18n?.assetUrl
    ? window.ElementoI18n.assetUrl(`CMS/solutions/${slug}.json`)
    : (() => {
        const depth = path.split('/').filter(Boolean).length;
        const prefix = localized
          ? depth <= 2
            ? '../'
            : '../../'
          : depth <= 1
            ? ''
            : '../';
        return `${prefix}CMS/solutions/${slug}.json`;
      })();

  fetch(url)
    .then((r) => {
      if (!r.ok) throw new Error(r.status);
      return r.json();
    })
    .then((data) => {
      const cfg = data[locale] || data.en;
      if (locale !== 'en' && cfg) {
        const fixLink = (link) => {
          if (typeof link !== 'string') return link;
          if (link.startsWith('../signup')) {
            return localized ? '../../signup.html' : '../signup.html';
          }
          if (link.startsWith('../products')) {
            return localized ? '../../platform.html' : '../platform.html';
          }
          if (link.startsWith('../technology')) {
            return localized ? '../../platform.html' : '../platform.html';
          }
          if (link.startsWith('../') && localized) return `../../${link.slice(3)}`;
          return link;
        };
        const walk = (o) => {
          if (!o || typeof o !== 'object') return;
          for (const k of Object.keys(o)) {
            if (k === 'link' && typeof o[k] === 'string') o[k] = fixLink(o[k]);
            else if (typeof o[k] === 'object') walk(o[k]);
          }
        };
        walk(cfg);
      }
      window.pageConfig = cfg;
      document.dispatchEvent(new CustomEvent('pageConfigReady'));
    })
    .catch((err) => {
      console.error('solution-config-loader:', err);
    });
})();
