/**
 * Matomo analytics — executed only after Iubenda Cookie Solution activates the script tag
 * (type="text/plain" + class="_iub_cs_activate" + data-iub-purposes).
 */
var _paq = window._paq = window._paq || [];
_paq.push(['trackPageView']);
_paq.push(['enableLinkTracking']);
(function () {
    var u = '//matomo.elemento.cloud/';
    _paq.push(['setTrackerUrl', u + 'matomo.php']);
    _paq.push(['setSiteId', '1']);
    var d = document,
        g = d.createElement('script'),
        s = d.getElementsByTagName('script')[0];
    g.async = true;
    g.src = u + 'matomo.js';
    s.parentNode.insertBefore(g, s);
})();

(function () {
    'use strict';

    function getPageStem() {
        if (window.__I18N__?.stem) return window.__I18N__.stem;
        var path = window.location.pathname.replace(/\/+$/, '') || '/';
        if (path === '/' || path.endsWith('/index.html')) return 'index';
        var match = path.match(/\/([^/]+)\.html$/);
        return match ? match[1] : path.replace(/^\//, '');
    }

    function trackCtaClick(ctaId) {
        if (!ctaId || typeof _paq === 'undefined') return;
        _paq.push(['trackEvent', 'CTA', ctaId, getPageStem()]);
    }

    document.addEventListener(
        'click',
        function (e) {
            var el = e.target.closest('[data-cta-id]');
            if (!el) return;
            trackCtaClick(el.getAttribute('data-cta-id'));
        },
        true
    );

    window.ElementoMatomo = {
        trackCtaClick: trackCtaClick,
        getPageStem: getPageStem,
    };
})();
