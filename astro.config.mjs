import { defineConfig } from 'astro/config';
import { localeDevRoutes } from './scripts/vite-locale-dev-routes.mjs';

const SITE = 'https://elemento.cloud';

/** @type {import('astro').AstroUserConfig} */
export default defineConfig({
  site: SITE,
  output: 'static',
  trailingSlash: 'never',
  build: {
    format: 'file',
    assets: '_astro',
  },
  redirects: {
    '/products': '/platform.html',
    '/products/': '/platform.html',
    '/products.html': '/platform.html',
    '/technology': '/platform.html',
    '/technology/': '/platform.html',
    '/technology.html': '/platform.html',
    '/solutions/index.html': '/solutions',
    '/solutions/index': '/solutions',
    '/solutions/vmware-alternative.html': '/solutions/vmware-exit.html',
    '/solutions/ai': '/solutions/ai-gpu-infrastructure.html',
    '/solutions/ai.html': '/solutions/ai-gpu-infrastructure.html',
    '/solutions/system-integrators': '/solutions/service-providers.html',
    '/solutions/system-integrators.html': '/solutions/service-providers.html',
    '/solutions/regulated': '/solutions/sovereign-cloud-governance.html',
    '/solutions/regulated.html': '/solutions/sovereign-cloud-governance.html',
    '/solutions/public-sector': '/solutions/sovereign-cloud-governance.html',
    '/solutions/public-sector.html': '/solutions/sovereign-cloud-governance.html',
    '/solutions/devops': '/solutions/hybrid-multi-cloud.html',
    '/solutions/devops.html': '/solutions/hybrid-multi-cloud.html',
    '/solutions/industrial': '/solutions/hybrid-multi-cloud.html',
    '/solutions/industrial.html': '/solutions/hybrid-multi-cloud.html',
    '/en/technology': '/platform.html',
    '/en/technology/': '/platform.html',
    '/en/technology/index.html': '/platform.html',
    '/en/technology/atomos.html': '/atomos.html',
    '/en/technology/electros.html': '/electros.html',
    '/en/technology/blog.html': '/blog.html',
    '/en/technology/sign-up.html': '/signup.html',
    '/en/technology/cloud-network.html': '/platform.html',
    '/en/technology/404.html': '/404.html',
    '/grazie/atomos-demo-it': '/it/grazie/atomos-demo.html',
    '/grazie/full-solution-demo-it': '/it/grazie/full-solution-demo.html',
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
