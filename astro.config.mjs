import { defineConfig } from 'astro/config';
import { localeDevRoutes } from './scripts/vite-locale-dev-routes.mjs';

const SITE = 'https://elemento.cloud';

/** @type {import('astro').AstroUserConfig} */
export default defineConfig({
  site: SITE,
  output: 'static',
  build: {
    format: 'file',
    assets: '_astro',
  },
  redirects: {
    '/en/technology': '/technology.html',
    '/en/technology/': '/technology.html',
    '/en/technology/index.html': '/technology.html',
    '/en/technology/atomos.html': '/atomos.html',
    '/en/technology/electros.html': '/electros.html',
    '/en/technology/blog.html': '/blog.html',
    '/en/technology/sign-up.html': '/signup.html',
    '/en/technology/cloud-network.html': '/technology.html',
    '/en/technology/404.html': '/404.html',
    '/grazie/atomos-demo-it': '/it/grazie/atomos-demo.html',
    '/grazie/atomos-demo-it/': '/it/grazie/atomos-demo.html',
    '/grazie/atomos-demo-it/index.html': '/it/grazie/atomos-demo.html',
    '/grazie/full-solution-demo-it': '/it/grazie/full-solution-demo.html',
    '/grazie/full-solution-demo-it/': '/it/grazie/full-solution-demo.html',
    '/grazie/full-solution-demo-it/index.html': '/it/grazie/full-solution-demo.html',
  },
  vite: {
    build: {
      rollupOptions: {
        external: [],
      },
    },
    plugins: [localeDevRoutes()],
  },
});
