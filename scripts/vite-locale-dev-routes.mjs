/**
 * Dev-only: map /{locale}/*.html URLs to Astro routes (file format + locale/ folder).
 */
const LOCALES = ['it', 'fr'];

export function localeDevRoutes() {
  return {
    name: 'locale-dev-routes',
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        const raw = req.url ?? '';
        const q = raw.indexOf('?');
        const pathname = q === -1 ? raw : raw.slice(0, q);
        const qs = q === -1 ? '' : raw.slice(q);

        for (const locale of LOCALES) {
          const base = `/${locale}`;
          if (pathname === `${base}/` || pathname === `${base}/index.html`) {
            req.url = `/${locale}.html${qs}`;
            return next();
          }
          const m = pathname.match(new RegExp(`^/${locale}/([^/]+)\\.html$`));
          if (m) {
            req.url = `/${locale}/${m[1]}${qs}`;
            return next();
          }
        }
        next();
      });
    },
  };
}

/** @deprecated Use localeDevRoutes */
export const itDevRoutes = localeDevRoutes;
