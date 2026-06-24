/**
 * Approved CTA registry — single source for commercial button labels and hrefs.
 * Sync with src/data/ctas.json
 */
(function () {
    'use strict';

    const CTAS = {
        bookMetacloudAssessment: {
            label: 'Book a Metacloud Assessment',
            href: 'https://book.elemento.cloud/',
            external: true,
        },
        tryElectros: {
            label: 'Try Electros',
            href: 'electros.html',
        },
        getAtomos: {
            label: 'Get AtomOS',
            href: 'atomos.html',
        },
        vmwareExitAssessment: {
            label: 'Run VMware Exit Assessment',
            href: 'https://book.elemento.cloud/',
            external: true,
        },
        readDocs: {
            label: 'Read the Docs',
            href: 'https://bookstack.elemento.cloud',
            external: true,
        },
        viewGithub: {
            label: 'View on GitHub',
            href: 'https://github.com/elemento-modular-cloud',
            external: true,
        },
        estimateCost: {
            label: 'Estimate Your Cost',
            href: 'pricing.html',
        },
        exploreAtomos: {
            label: 'Explore AtomOS',
            href: 'atomos.html',
        },
        explorePlatform: {
            label: 'Explore Platform',
            href: 'platform.html',
        },
        bookArchitectureWalkthrough: {
            label: 'Book Architecture Walkthrough',
            href: 'https://book.elemento.cloud/',
            external: true,
        },
        planAiInfrastructure: {
            label: 'Plan AI Infrastructure',
            href: 'solutions/ai-gpu-infrastructure.html',
        },
        launchProviderFederation: {
            label: 'Launch Provider Federation',
            href: 'solutions/service-providers.html',
        },
        viewC4: {
            label: 'View C4',
            href: 'c4-protocol.html',
        },
    };

    function localizeHref(href, locale) {
        if (/^https?:\/\//.test(href)) return href;
        if (window.ElementoI18n?.pageHref) {
            return window.ElementoI18n.pageHref(href, locale || 'en');
        }
        return href;
    }

    function getCta(id, locale) {
        const cta = CTAS[id];
        if (!cta) return null;
        const loc = locale || window.__I18N__?.locale || 'en';
        return {
            ...cta,
            id,
            href: localizeHref(cta.href, loc),
        };
    }

    function ctaAttrs(id) {
        return `data-cta-id="${id}"`;
    }

    function renderLink(id, className, locale) {
        const cta = getCta(id, locale);
        if (!cta) return '';
        const ext = cta.external ? ' target="_blank" rel="noopener noreferrer"' : '';
        return `<a href="${cta.href}" class="${className}" ${ctaAttrs(id)}${ext}>${cta.label}</a>`;
    }

    window.ElementoCTAs = {
        CTAS,
        getCta,
        ctaAttrs,
        renderLink,
        localizeHref,
    };
})();
