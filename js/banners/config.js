/**
 * Site-wide campaign banner configuration.
 * Variants: default (AtomOS BSL) | enterprise (VMware exit).
 */
(function () {
    'use strict';

    const STORAGE_KEY = 'elemento_banner_intent';
    const VMWARE_UTM = 'vmware-exit';

    const variants = {
        default: {
            id: 'default',
            i18nTextKey: 'banner.defaultText',
            i18nCtaKey: 'banner.defaultCta',
            i18nAriaKey: 'banner.defaultAria',
            ctaId: 'exploreAtomos',
            href: 'atomos.html',
            cssClass: 'announcement-banner--campaign-default',
        },
        enterprise: {
            id: 'enterprise',
            i18nTextKey: 'banner.enterpriseText',
            i18nCtaKey: 'banner.enterpriseCta',
            i18nAriaKey: 'banner.enterpriseAria',
            ctaId: 'vmwareExitAssessment',
            href: 'solutions/vmware-exit.html',
            cssClass: 'announcement-banner--campaign-enterprise',
        },
    };

    function getSearchParams() {
        try {
            return new URLSearchParams(window.location.search);
        } catch {
            return new URLSearchParams();
        }
    }

    function detectIntent() {
        const params = getSearchParams();
        const utm = params.get('utm_campaign') || '';
        if (utm === VMWARE_UTM || utm.includes('vmware')) {
            return 'enterprise';
        }
        try {
            if (sessionStorage.getItem(STORAGE_KEY) === 'enterprise') {
                return 'enterprise';
            }
        } catch {
            /* ignore */
        }
        const stem = window.__I18N__?.stem || '';
        const path = window.location.pathname || '';
        if (stem === 'solutions/vmware-exit' || path.includes('vmware-exit')) {
            return 'enterprise';
        }
        const ref = document.referrer || '';
        if (/vmware|broadcom/i.test(ref) && params.get('utm_campaign')) {
            return 'enterprise';
        }
        return 'default';
    }

    function setEnterpriseIntent() {
        try {
            sessionStorage.setItem(STORAGE_KEY, 'enterprise');
        } catch {
            /* ignore */
        }
    }

    function resolveVariant() {
        const id = detectIntent();
        return variants[id] || variants.default;
    }

    window.ElementoBanner = {
        variants,
        STORAGE_KEY,
        detectIntent,
        setEnterpriseIntent,
        resolveVariant,
    };
})();
