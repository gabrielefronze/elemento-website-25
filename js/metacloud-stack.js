/**
 * Mobile portrait Metacloud stack — public clouds above, hub in the middle,
 * hypervisors / private cloud below. Shown when the hero orbit is hidden.
 */
(function () {
    'use strict';

    var MOBILE_PORTRAIT_MQ = '(max-width: 768px) and (orientation: portrait)';
    var SVGNS = 'http://www.w3.org/2000/svg';

    var PUBLIC_CLOUDS = [
        { name: 'AWS', icon: 'fab fa-aws', accent: '#FF9900' },
        { name: 'Azure', icon: 'fab fa-microsoft', accent: '#2E8DEF' },
        { name: 'GCP', icon: 'fab fa-google', accent: '#4285F4' },
        { name: 'OVHcloud', icon: 'fas fa-cloud', accent: '#2272C9' }
    ];

    var PRIVATE_CLOUDS = [
        { name: 'AtomOS', img: 'assets/logos/Atomos.svg', accent: 'var(--atomos-color, #007bff)' },
        { name: 'VMware', icon: 'fas fa-layer-group', accent: '#9AAEC0' },
        { name: 'Proxmox', icon: 'fas fa-box', accent: '#E57000' },
        { name: 'KVM', icon: 'fas fa-microchip', accent: '#D33' }
    ];

    var graphEl;
    var svgEl;
    var publicEl;
    var privateEl;
    var hubEl;
    var built = false;

    function assetUrl(path) {
        var normalized = String(path).replace(/^\//, '');
        if (window.ElementoI18n && window.ElementoI18n.assetUrl) {
            return window.ElementoI18n.assetUrl(normalized);
        }
        return normalized;
    }

    function isMobilePortrait() {
        return window.matchMedia(MOBILE_PORTRAIT_MQ).matches;
    }

    function buildCard(provider) {
        var media = provider.img
            ? '<img class="provider-float__img" src="' + assetUrl(provider.img) + '" alt="" aria-hidden="true">'
            : '<i class="' + provider.icon + '" aria-hidden="true"></i>';
        var card = document.createElement('div');
        card.className = 'provider-float';
        card.style.setProperty('--accent', provider.accent);
        card.innerHTML =
            '<span class="provider-float__logo">' + media + '</span>' +
            '<span class="provider-float__text"><strong>' + provider.name + '</strong></span>';
        return card;
    }

    function hubHorizAnchor(hubRect, graphRect, edge) {
        return {
            x: hubRect.left + hubRect.width * 0.5 - graphRect.left,
            y: edge === 'top'
                ? hubRect.top - graphRect.top + 1
                : hubRect.bottom - graphRect.top - 1
        };
    }

    /** Curve bowing inward through the center gutter. */
    function curvePath(x1, y1, x2, y2, hubX) {
        var mx = (x1 + x2) * 0.5;
        var my = (y1 + y2) * 0.5;
        var cxp = mx + (hubX - mx) * 0.28;
        var cyp = my;
        return 'M ' + x1.toFixed(1) + ' ' + y1.toFixed(1) +
            ' Q ' + cxp.toFixed(1) + ' ' + cyp.toFixed(1) +
            ' ' + x2.toFixed(1) + ' ' + y2.toFixed(1);
    }

    function addConnector(d, stroke, index, options) {
        options = options || {};
        var baseClass = 'hero-link-base';
        var flowClass = 'hero-link';
        if (options.spine) {
            baseClass += ' hero-link-base--spine';
            flowClass += ' hero-link--spine';
        } else if (options.bus) {
            baseClass += ' hero-link-base--bus';
            flowClass += ' hero-link--bus';
        } else if (options.branch) {
            baseClass += ' hero-link-base--branch';
            flowClass += ' hero-link--branch';
        }

        var base = document.createElementNS(SVGNS, 'path');
        base.setAttribute('class', baseClass);
        base.setAttribute('d', d);
        base.style.stroke = stroke;

        var flow = document.createElementNS(SVGNS, 'path');
        flow.setAttribute('class', flowClass);
        flow.setAttribute('d', d);
        flow.style.stroke = stroke;
        if (!options.static) {
            flow.style.animationDelay = (index * 0.09).toFixed(2) + 's';
        }

        svgEl.appendChild(base);
        svgEl.appendChild(flow);
    }

    /** Anchor on the inner vertical edge (gutter-facing side), vertically centred. */
    function cardInnerAnchor(card, graphRect) {
        var rect = card.getBoundingClientRect();
        var isLeft = card.dataset.side === 'left';
        var x = isLeft
            ? rect.right - graphRect.left - 1
            : rect.left - graphRect.left + 1;
        return {
            x: x,
            y: rect.top - graphRect.top + rect.height * 0.5
        };
    }

    function layoutLines() {
        if (!built || !isMobilePortrait()) {
            return;
        }

        var graphRect = graphEl.getBoundingClientRect();
        var width = graphRect.width;
        var height = graphRect.height;
        if (!width || !height) {
            return;
        }

        var hubRect = hubEl.getBoundingClientRect();
        var hubCenterX = hubRect.left + hubRect.width * 0.5 - graphRect.left;

        svgEl.setAttribute('width', String(width));
        svgEl.setAttribute('height', String(height));
        svgEl.setAttribute('viewBox', '0 0 ' + width + ' ' + height);
        svgEl.innerHTML = '';

        var publicCards = publicEl.querySelectorAll('.provider-float');
        var privateCards = privateEl.querySelectorAll('.provider-float');
        var lineIndex = 0;

        publicCards.forEach(function (card, index) {
            var cardPt = cardInnerAnchor(card, graphRect);
            var hubPt = hubHorizAnchor(hubRect, graphRect, 'top');
            addConnector(
                curvePath(cardPt.x, cardPt.y, hubPt.x, hubPt.y, hubCenterX),
                PUBLIC_CLOUDS[index].accent,
                lineIndex++,
                { branch: true }
            );
        });

        privateCards.forEach(function (card, index) {
            var cardPt = cardInnerAnchor(card, graphRect);
            var hubPt = hubHorizAnchor(hubRect, graphRect, 'bottom');
            addConnector(
                curvePath(hubPt.x, hubPt.y, cardPt.x, cardPt.y, hubCenterX),
                PRIVATE_CLOUDS[index].accent,
                lineIndex++,
                { branch: true }
            );
        });
    }

    function buildTier(container, providers) {
        container.innerHTML = '';
        providers.forEach(function (provider, index) {
            var card = buildCard(provider);
            card.dataset.side = index % 2 === 0 ? 'left' : 'right';
            container.appendChild(card);
        });
    }

    function init() {
        var section = document.getElementById('metacloud-stack');
        if (!section) {
            return;
        }

        graphEl = document.getElementById('metacloud-stack-graph');
        publicEl = document.getElementById('metacloud-stack-public');
        privateEl = document.getElementById('metacloud-stack-private');
        hubEl = document.getElementById('metacloud-stack-hub');
        if (!graphEl || !publicEl || !privateEl || !hubEl) {
            return;
        }

        svgEl = graphEl.querySelector('.metacloud-stack__svg');
        if (!svgEl) {
            return;
        }

        buildTier(publicEl, PUBLIC_CLOUDS);
        buildTier(privateEl, PRIVATE_CLOUDS);
        built = true;

        var resizeTimer;
        function scheduleLayout() {
            window.clearTimeout(resizeTimer);
            resizeTimer = window.setTimeout(layoutLines, 80);
        }

        window.addEventListener('resize', scheduleLayout);
        window.addEventListener('orientationchange', scheduleLayout);
        window.addEventListener('load', layoutLines);
        if (document.fonts && document.fonts.ready) {
            document.fonts.ready.then(layoutLines);
        }
        scheduleLayout();
        window.setTimeout(layoutLines, 400);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
