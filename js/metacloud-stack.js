/**
 * Mobile portrait Metacloud stack — public clouds above, hub in the middle,
 * hypervisors / private cloud below. Shown when the hero orbit is hidden.
 */
(function () {
    'use strict';

    var MOBILE_PORTRAIT_MQ = '(max-width: 768px) and (orientation: portrait)';
    var SVGNS = 'http://www.w3.org/2000/svg';
    var MIGRATION_MAX = 2;
    var MIGRATION_POOL = 3;
    var MIGRATION_SPAWN_MIN = 2800;
    var MIGRATION_SPAWN_JITTER = 2000;
    var MIGRATION_DURATION_MIN = 1800;
    var MIGRATION_DURATION_JITTER = 800;
    var MIGRATION_SPARK_LEN = 9;
    var CARD_PULSE_DECAY = 7000;
    var CARD_PULSE_FADE_IN = 400;

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
    var connectorsEl;
    var migrationsEl;
    var publicEl;
    var privateEl;
    var hubEl;
    var built = false;
    var migrationPool = [];
    var activeMigrations = [];
    var migrationNextAt = 0;
    var migrationTimer = null;
    var anchors = { public: [], private: [], atomos: null, hub: null };
    var reducedMotion = false;

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

    /** Arc between two cards — bows toward the Metacloud hub. */
    function tierBridgePath(x1, y1, x2, y2, hubX, hubY) {
        var mx = (x1 + x2) * 0.5;
        var my = (y1 + y2) * 0.5;
        var dx = x2 - x1;
        var dy = y2 - y1;
        var len = Math.hypot(dx, dy) || 1;
        var tx = hubX - mx;
        var ty = hubY - my;
        var tLen = Math.hypot(tx, ty) || 1;
        var bow = Math.min(32, len * 0.22);
        var cxp = mx + (tx / tLen) * bow;
        var cyp = my + (ty / tLen) * bow;
        return 'M ' + x1.toFixed(1) + ' ' + y1.toFixed(1) +
            ' Q ' + cxp.toFixed(1) + ' ' + cyp.toFixed(1) +
            ' ' + x2.toFixed(1) + ' ' + y2.toFixed(1);
    }

    function addConnector(d, stroke, index, options) {
        options = options || {};
        var baseClass = 'hero-link-base';
        var flowClass = 'hero-link';
        if (options.branch) {
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
        flow.style.animationDelay = (index * 0.09).toFixed(2) + 's';

        connectorsEl.appendChild(base);
        connectorsEl.appendChild(flow);
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

    function cardCenterAnchor(card, graphRect) {
        var rect = card.getBoundingClientRect();
        return {
            x: rect.left - graphRect.left + rect.width * 0.5,
            y: rect.top - graphRect.top + rect.height * 0.5
        };
    }

    function initMigrationPool() {
        migrationsEl = document.createElementNS(SVGNS, 'g');
        migrationsEl.setAttribute('class', 'metacloud-stack__migrations');
        svgEl.appendChild(migrationsEl);

        migrationPool = [];
        for (var i = 0; i < MIGRATION_POOL; i++) {
            var trail = document.createElementNS(SVGNS, 'path');
            trail.setAttribute('class', 'metacloud-migration-trail');
            trail.style.display = 'none';
            var spark = document.createElementNS(SVGNS, 'path');
            spark.setAttribute('class', 'metacloud-migration-spark');
            spark.style.display = 'none';
            migrationsEl.appendChild(trail);
            migrationsEl.appendChild(spark);
            migrationPool.push({ trail: trail, spark: spark, active: false });
        }
    }

    function releaseMigration(paths) {
        paths.active = false;
        paths.trail.style.display = 'none';
        paths.spark.style.display = 'none';
        paths.trail.removeAttribute('d');
        paths.spark.removeAttribute('d');
    }

    function showMigrationPaths(paths) {
        paths.trail.style.display = '';
        paths.spark.style.display = '';
    }

    function setMigrationPathD(paths, d) {
        paths.trail.setAttribute('d', d);
        paths.spark.setAttribute('d', d);
    }

    function applyMigrationStroke(paths, pathLen, progress, alpha) {
        var progressLen = Math.max(1, pathLen * progress);
        var sparkLen = Math.min(MIGRATION_SPARK_LEN, progressLen);
        var trailDash = progressLen.toFixed(1) + ' ' + pathLen.toFixed(1);
        var sparkOff = Math.max(0, progressLen - sparkLen);

        paths.trail.setAttribute('stroke-dasharray', trailDash);
        paths.trail.setAttribute('stroke-dashoffset', '0');

        paths.spark.setAttribute(
            'stroke-dasharray',
            sparkLen.toFixed(1) + ' ' + (pathLen + sparkLen).toFixed(1)
        );
        paths.spark.setAttribute('stroke-dashoffset', String(-sparkOff));

        paths.trail.style.opacity = (0.62 * alpha).toFixed(3);
        paths.spark.style.opacity = alpha.toFixed(3);
    }

    function updateAnchors(graphRect) {
        anchors.public = [];
        anchors.private = [];
        anchors.atomos = null;

        publicEl.querySelectorAll('.provider-float').forEach(function (card, index) {
            anchors.public[index] = cardCenterAnchor(card, graphRect);
        });
        privateEl.querySelectorAll('.provider-float').forEach(function (card, index) {
            var pt = cardCenterAnchor(card, graphRect);
            anchors.private[index] = pt;
            if (PRIVATE_CLOUDS[index].name === 'AtomOS') {
                anchors.atomos = { index: index, x: pt.x, y: pt.y };
            }
        });

        var hubRect = hubEl.getBoundingClientRect();
        anchors.hub = {
            x: hubRect.left - graphRect.left + hubRect.width * 0.5,
            y: hubRect.top - graphRect.top + hubRect.height * 0.5
        };
    }

    function migrationEnvelope(t) {
        if (t <= 0 || t >= 1) return 0;
        if (t < 0.14) return t / 0.14;
        if (t > 0.78) return (1 - t) / 0.22;
        return 1;
    }

    function migrationEase(t) {
        return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    }

    function acquireMigrationPaths() {
        for (var i = 0; i < migrationPool.length; i++) {
            if (!migrationPool[i].active) return migrationPool[i];
        }
        return null;
    }

    function cardPulseStrength(now, start) {
        if (!start) return 0;
        var t = now - start;
        if (t < 0 || t > CARD_PULSE_DECAY) return 0;
        if (t < CARD_PULSE_FADE_IN) return t / CARD_PULSE_FADE_IN;
        var decayLen = CARD_PULSE_DECAY - CARD_PULSE_FADE_IN;
        if (decayLen <= 0) return 0;
        return Math.max(0, 1 - (t - CARD_PULSE_FADE_IN) / decayLen);
    }

    function getStackCard(tier, index) {
        var container = tier === 'public' ? publicEl : privateEl;
        if (!container) return null;
        var cards = container.querySelectorAll('.provider-float');
        return cards[index] || null;
    }

    function pulseStackCard(tier, index, now) {
        var card = getStackCard(tier, index);
        if (!card) return;
        card._migrationPulseStart = now;
    }

    function clearStackCardPulse(tier, index) {
        var card = getStackCard(tier, index);
        if (!card) return;
        card._migrationPulseStart = 0;
        card.classList.remove('provider-float--hub-pulse');
        card.style.removeProperty('--hub-pulse');
    }

    function updateStackCardPulses(now) {
        [publicEl, privateEl].forEach(function (container) {
            if (!container) return;
            container.querySelectorAll('.provider-float').forEach(function (card) {
                var start = card._migrationPulseStart;
                if (!start) return;
                var strength = cardPulseStrength(now, start);
                if (strength > 0) {
                    card.style.setProperty('--hub-pulse', strength.toFixed(3));
                    card.classList.add('provider-float--hub-pulse');
                } else {
                    card.classList.remove('provider-float--hub-pulse');
                    card.style.removeProperty('--hub-pulse');
                    card._migrationPulseStart = 0;
                }
            });
        });
    }

    function pickMigrationRoute() {
        if (!anchors.hub) return null;
        var hubX = anchors.hub.x;
        var hubY = anchors.hub.y;

        if (anchors.atomos && Math.random() < 0.55) {
            var sources = [1, 2, 3];
            var fromIdx = sources[Math.floor(Math.random() * sources.length)];
            return {
                type: 'atomos',
                fromTier: 'private',
                fromIdx: fromIdx,
                toTier: 'private',
                toIdx: anchors.atomos.index,
                d: tierBridgePath(
                    anchors.private[fromIdx].x,
                    anchors.private[fromIdx].y,
                    anchors.atomos.x,
                    anchors.atomos.y,
                    hubX,
                    hubY
                )
            };
        }

        if (anchors.public.length >= 2) {
            var a = Math.floor(Math.random() * anchors.public.length);
            var b = Math.floor(Math.random() * anchors.public.length);
            while (b === a) b = Math.floor(Math.random() * anchors.public.length);
            return {
                type: 'cloud',
                fromTier: 'public',
                fromIdx: a,
                toTier: 'public',
                toIdx: b,
                d: tierBridgePath(
                    anchors.public[a].x,
                    anchors.public[a].y,
                    anchors.public[b].x,
                    anchors.public[b].y,
                    hubX,
                    hubY
                )
            };
        }
        return null;
    }

    function spawnMigration(now) {
        if (reducedMotion || !isMobilePortrait() || activeMigrations.length >= MIGRATION_MAX) {
            return;
        }

        var route = pickMigrationRoute();
        if (!route) return;

        var paths = acquireMigrationPaths();
        if (!paths) return;

        paths.active = true;
        showMigrationPaths(paths);
        setMigrationPathD(paths, route.d);
        pulseStackCard(route.fromTier, route.fromIdx, now);

        activeMigrations.push({
            paths: paths,
            d: route.d,
            pathLen: paths.spark.getTotalLength(),
            start: now,
            duration: MIGRATION_DURATION_MIN + Math.random() * MIGRATION_DURATION_JITTER,
            fromTier: route.fromTier,
            fromIdx: route.fromIdx,
            toTier: route.toTier,
            toIdx: route.toIdx,
            _toPulsed: false
        });
    }

    function tickMigrations(now) {
        activeMigrations = activeMigrations.filter(function (m) {
            if (now - m.start >= m.duration) {
                releaseMigration(m.paths);
                return false;
            }
            return true;
        });

        if (now < migrationNextAt) return;
        spawnMigration(now);
        migrationNextAt = now + MIGRATION_SPAWN_MIN + Math.random() * MIGRATION_SPAWN_JITTER;
    }

    function renderMigrations(now) {
        if (!activeMigrations.length) return;

        activeMigrations.forEach(function (m) {
            var t = (now - m.start) / m.duration;
            var alpha = migrationEnvelope(t);
            if (alpha <= 0) return;

            var eased = migrationEase(Math.min(1, Math.max(0, t)));
            var pathLen = m.pathLen || 1;
            applyMigrationStroke(m.paths, pathLen, eased, alpha);

            if (!m._toPulsed && eased >= 0.95) {
                clearStackCardPulse(m.fromTier, m.fromIdx);
                pulseStackCard(m.toTier, m.toIdx, now);
                m._toPulsed = true;
            }
        });
    }

    function migrationFrame(now) {
        if (!built || !isMobilePortrait() || reducedMotion) return;
        tickMigrations(now);
        renderMigrations(now);
        updateStackCardPulses(now);
        migrationTimer = window.requestAnimationFrame(migrationFrame);
    }

    function startMigrationLoop() {
        if (migrationTimer || reducedMotion) return;
        migrationNextAt = performance.now() + 1200;
        migrationTimer = window.requestAnimationFrame(migrationFrame);
    }

    function stopMigrationLoop() {
        if (migrationTimer) {
            window.cancelAnimationFrame(migrationTimer);
            migrationTimer = null;
        }
        activeMigrations.forEach(function (m) { releaseMigration(m.paths); });
        activeMigrations = [];
    }

    function layoutLines() {
        if (!built || !isMobilePortrait()) {
            stopMigrationLoop();
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
        connectorsEl.innerHTML = '';

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

        updateAnchors(graphRect);
        startMigrationLoop();
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

        reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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

        connectorsEl = document.createElementNS(SVGNS, 'g');
        connectorsEl.setAttribute('class', 'metacloud-stack__connectors');
        svgEl.appendChild(connectorsEl);
        initMigrationPool();

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
