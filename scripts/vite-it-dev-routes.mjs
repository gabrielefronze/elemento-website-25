/**
 * Dev-only: map /it/*.html URLs to Astro routes (file format + it/ folder).
 */
export function itDevRoutes() {
  return {
    name: 'it-dev-routes',
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        const raw = req.url ?? '';
        const q = raw.indexOf('?');
        const pathname = q === -1 ? raw : raw.slice(0, q);
        const qs = q === -1 ? '' : raw.slice(q);

        if (pathname === '/it/' || pathname === '/it/index.html') {
          req.url = `/it.html${qs}`;
        } else {
          const m = pathname.match(/^\/it\/([^/]+)\.html$/);
          if (m) req.url = `/it/${m[1]}${qs}`;
        }
        next();
      });
    },
  };
}
