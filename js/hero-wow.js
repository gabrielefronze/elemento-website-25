/**
 * Hero Metacloud constellation.
 *
 * Provider + hypervisor glassmorphism cards revolve around the word "Metacloud"
 * in the headline along concentric ellipses (ring 0 closest), each joined to the
 * word by a smoothly arched, animated link line. The word is the shared orbit
 * center; rings rotate at different speeds for a galaxy feel. Cards on each
 * ring share a fixed radius and angular velocity so slots never collide. The far
 * arc compresses vertically for forced perspective.
 * Disabled on small portrait viewports — phones get copy + CTAs only.
 */
(function () {
    'use strict';

    var SMALL_PORTRAIT_MQ = '(max-width: 768px) and (orientation: portrait)';

    var SVGNS = 'http://www.w3.org/2000/svg';

    // angle: optional fixed angle (degrees); slot: optional index on ring (default: array order).
    var PROVIDERS = [
        // Hypervisors / virtualization
        { name: 'AtomOS', tag: 'Sovereign hypervisor', img: '/assets/logos/Atomos.svg', accent: 'var(--atomos-color, #007bff)', kind: 'hypervisor', ring: 0 },
        { name: 'Proxmox', tag: 'Hypervisor', icon: 'fas fa-box', accent: '#E57000', kind: 'hypervisor', ring: 0 },
        { name: 'VMware', tag: 'Hypervisor', icon: 'fas fa-layer-group', accent: '#9AAEC0', kind: 'hypervisor', ring: 0 },
        { name: 'KVM', tag: 'Virtualization', icon: 'fas fa-microchip', accent: '#D33', kind: 'hypervisor', ring: 1 },
        { name: 'Hyper-V', tag: 'Hypervisor', icon: 'fab fa-windows', accent: '#2E8DEF', kind: 'hypervisor', ring: 1 },
        { name: 'Nutanix', tag: 'Hypervisor', icon: 'fas fa-cubes', accent: '#3B82C4', kind: 'hypervisor', ring: 1 },
        { name: 'Citrix', tag: 'Hypervisor', icon: 'fas fa-server', accent: '#7A52C7', kind: 'hypervisor', ring: 2 },
        { name: 'Red Hat', tag: 'Virtualization', icon: 'fab fa-redhat', accent: '#EE0000', kind: 'hypervisor', ring: 2 },
        { name: 'XCP-ng', tag: 'Hypervisor', icon: 'fas fa-server', accent: '#1BA0E2', kind: 'hypervisor', ring: 2 },
        { name: 'OpenStack', tag: 'Private cloud', icon: 'fas fa-server', accent: '#E0408A', kind: 'hypervisor', ring: 2 },

        // Clouds
        { name: 'AWS', tag: 'Public cloud', icon: 'fab fa-aws', accent: '#FF9900', kind: 'cloud', ring: 0 },
        { name: 'Azure', tag: 'Public cloud', icon: 'fab fa-microsoft', accent: '#2E8DEF', kind: 'cloud', ring: 0 },
        { name: 'Google Cloud', tag: 'Public cloud', icon: 'fab fa-google', accent: '#4285F4', kind: 'cloud', ring: 1 },
        { name: 'OVHcloud', tag: 'Sovereign cloud', icon: 'fas fa-cloud', accent: '#2272C9', kind: 'cloud', ring: 1 },
        { name: 'Scaleway', tag: 'Sovereign cloud', icon: 'fas fa-server', accent: '#8C52FF', kind: 'cloud', ring: 1 },
        { name: 'Oracle', tag: 'Public cloud', icon: 'fas fa-database', accent: '#C74634', kind: 'cloud', ring: 2 },
        { name: 'IBM Cloud', tag: 'Public cloud', icon: 'fas fa-cloud', accent: '#0F62FE', kind: 'cloud', ring: 2 },
        { name: 'Alibaba', tag: 'Public cloud', icon: 'fas fa-cloud', accent: '#FF6A00', kind: 'cloud', ring: 2 },
        { name: 'DigitalOcean', tag: 'Public cloud', icon: 'fab fa-digital-ocean', accent: '#0080FF', kind: 'cloud', ring: 2 }
    ];

    var RING_H = [0.24, 0.33, 0.42];
    var RING_V = [0.17, 0.27, 0.36];
    var RING_SCALE = [1, 0.94, 0.86];
    var RING_OP = [1, 0.92, 0.82];
    // Orbital period per ring, in ms (inner faster, outer slower). All cards on a ring share this period.
    var RING_PERIOD = [72000, 98000, 138000];
    var RING_OMEGA = RING_PERIOD.map(function (period) {
        return (2 * Math.PI) / period;
    });
    // Fixed ring phase offsets (rad) so adjacent rings interleave rather than stack.
    var RING_PHASE = [0, Math.PI / 6, Math.PI / 8];
    // Far arc (top of ellipse): squash vertical reach for forced perspective.
    var FAR_V_COMPRESS = 0.38;
    // Curve amount for the arched link lines (fraction of chord length).
    var ARCH = 0.16;
    // Link dash: near side full weight; far side thinner stroke + tighter dashes.
    var LINE_DASH_FLOW_MS = 1300;
    var LINE_DASH_NEAR = { len: 2, gap: 9, width: 1.4 };
    var LINE_DASH_FAR = { len: 0.75, gap: 4.5, width: 0.7 };
    var LINE_BASE_NEAR = 1;
    var LINE_BASE_FAR = 0.5;
    // Far-side depth cue: subtle gaussian blur instead of opacity fade.
    var FAR_BLUR_MAX = 2;
    var FAR_BLUR_MAX_SAFARI = 1.1;
    // Mouse parallax (pointer: fine only; disabled with reduced motion). Orbit only — hero copy stays fixed.
    var PARALLAX_ORBIT_MAX = 30;
    var PARALLAX_LERP = 0.09;
    var PARALLAX_RING_FACTOR = [1, 0.68, 0.42];
    // Scroll parallax — headline + orbit exit the fold faster than the page scroll.
    var SCROLL_PARALLAX_RATE = 0.42;
    // Cap render rate — 60fps; Safari keeps separate path throttle below.
    var FRAME_MS = 16;
    // SVG path retessellation is costly in Safari — update lines less often.
    var PATH_MS_SAFARI = 80;

    var IS_SAFARI = (function () {
        var ua = navigator.userAgent;
        return /AppleWebKit/i.test(ua) && !/Chrome|CriOS|Chromium|Edg/i.test(ua);
    })();

    function prefersReducedMotion() {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    function isSmallPortraitViewport() {
        return window.matchMedia(SMALL_PORTRAIT_MQ).matches;
    }

    function resetHeroBlocks() {
        document.querySelectorAll('.hero-home__headline, .hero-home__cta').forEach(function (el) {
            el.style.transform = '';
            el.style.position = '';
            el.style.zIndex = '';
        });
    }

    /**
     * Assign a fixed angular slot to each provider on its ring.
     * Cards on the same ring are evenly spaced; optional p.angle (degrees) or p.slot overrides.
     */
    function assignStartAngles(providers) {
        var byRing = [[], [], []];
        providers.forEach(function (p) {
            if (typeof p.angle === 'number') {
                p.startAngle = p.angle * Math.PI / 180;
                return;
            }
            byRing[p.ring].push(p);
        });

        byRing.forEach(function (group, ring) {
            if (!group.length) return;
            var n = group.length;
            var step = (Math.PI * 2) / n;
            var phase = RING_PHASE[ring] || 0;
            group.forEach(function (p, i) {
                var slot = typeof p.slot === 'number' ? p.slot : i;
                p.startAngle = phase + step * slot;
            });
        });
    }

    var state = null;

    function buildCard(p) {
        var media = p.img
            ? '<img class="provider-float__img" src="' + p.img + '" alt="" aria-hidden="true">'
            : '<i class="' + p.icon + '"></i>';
        var el = document.createElement('div');
        el.className = 'provider-float provider-float--r' + p.ring;
        el.style.setProperty('--accent', p.accent);
        el.style.left = '0';
        el.style.top = '0';
        el.innerHTML =
            '<span class="provider-float__logo">' + media + '</span>' +
            '<span class="provider-float__text"><strong>' + p.name + '</strong><small>' + p.tag + '</small></span>';
        return el;
    }

    function buildLine(p, index) {
        var stroke = p.accent;
        var baseLine = document.createElementNS(SVGNS, 'path');
        baseLine.setAttribute('class', 'hero-link-base');
        baseLine.style.stroke = stroke;

        var flow = document.createElementNS(SVGNS, 'path');
        flow.setAttribute('class', 'hero-link');
        flow.style.stroke = stroke;
        flow.style.animationDelay = (index * 0.12).toFixed(2) + 's';

        return { base: baseLine, flow: flow };
    }

    function archPath(x1, y1, x2, y2, round) {
        if (round) {
            x1 = Math.round(x1);
            y1 = Math.round(y1);
            x2 = Math.round(x2);
            y2 = Math.round(y2);
        }
        var mx = (x1 + x2) / 2;
        var my = (y1 + y2) / 2;
        var dx = x2 - x1;
        var dy = y2 - y1;
        var len = Math.hypot(dx, dy) || 1;
        // Always bow the control point upward so every arch curves toward
        // the top, regardless of the line's radial direction.
        var cxp = mx;
        var cyp = my - len * ARCH;
        return 'M ' + x1.toFixed(1) + ' ' + y1.toFixed(1) +
            ' Q ' + cxp.toFixed(1) + ' ' + cyp.toFixed(1) +
            ' ' + x2.toFixed(1) + ' ' + y2.toFixed(1);
    }

    /** Ellipse position with forced perspective: far arc (sin < 0) has reduced vertical reach. */
    function orbitXY(cx, cy, rH, rV, ang) {
        var sinRaw = Math.sin(ang);
        var sinV = sinRaw < 0 ? sinRaw * FAR_V_COMPRESS : sinRaw;
        return {
            x: cx + rH * Math.cos(ang),
            y: cy + rV * sinV
        };
    }

    /** Interpolate dash geometry by orbital depth (0 = far, 1 = near). */
    function lineDashStyle(near) {
        var t = Math.max(0, Math.min(1, near));
        var len = LINE_DASH_FAR.len + (LINE_DASH_NEAR.len - LINE_DASH_FAR.len) * t;
        var gap = LINE_DASH_FAR.gap + (LINE_DASH_NEAR.gap - LINE_DASH_FAR.gap) * t;
        var flowW = LINE_DASH_FAR.width + (LINE_DASH_NEAR.width - LINE_DASH_FAR.width) * t;
        var baseW = LINE_BASE_FAR + (LINE_BASE_NEAR - LINE_BASE_FAR) * t;
        return {
            dashArray: len.toFixed(2) + ' ' + gap.toFixed(2),
            period: len + gap,
            flowWidth: flowW.toFixed(2),
            baseWidth: baseW.toFixed(2)
        };
    }

    /** Blur ramps up on the far arc; none at the near side. */
    function farPerspectiveBlur(near) {
        var far = 1 - Math.max(0, Math.min(1, near));
        var max = IS_SAFARI ? FAR_BLUR_MAX_SAFARI : FAR_BLUR_MAX;
        return far * far * max;
    }

    function blurFilter(px) {
        return px < 0.05 ? 'none' : 'blur(' + px.toFixed(2) + 'px)';
    }

    function canUseParallax() {
        return window.matchMedia('(pointer: fine)').matches;
    }

    function orbitCenter(ring) {
        var f = PARALLAX_RING_FACTOR[ring] || 1;
        if (!state || !state.parallaxEnabled) {
            return { x: state.cx, y: state.cy };
        }
        return {
            x: state.cx + state.parallaxX * f,
            y: state.cy + state.parallaxY * f
        };
    }

    function applyHeadlineShift() {
        if (!state) return;
        var shiftY = (state.headlineShiftY || 0) + (state.scrollParallaxY || 0);
        var t = shiftY
            ? 'translate3d(0,' + shiftY.toFixed(1) + 'px,0)'
            : '';
        document.querySelectorAll('.hero-home__headline, .hero-home__cta').forEach(function (el) {
            if (el.style.transform !== t) {
                el.style.transform = t;
            }
        });
    }

    function applyOrbitScrollShift() {
        if (!state || !state.linkLayer) return;
        var y = state.scrollParallaxY || 0;
        var t = y
            ? 'translate3d(0,' + y.toFixed(1) + 'px,0)'
            : '';
        [state.providers, state.linkLayer, state.cardLayer].forEach(function (el) {
            if (el && el.style.transform !== t) {
                el.style.transform = t;
            }
        });
    }

    function computeScrollParallaxY(hero) {
        if (!hero) return 0;
        var scrollY = window.scrollY || window.pageYOffset || 0;
        var max = Math.min(hero.offsetHeight * 0.45, window.innerHeight * 0.55);
        return -Math.min(scrollY * SCROLL_PARALLAX_RATE, max);
    }

    function updateScrollParallax() {
        if (!state || !state._hero || prefersReducedMotion()) return false;
        var y = computeScrollParallaxY(state._hero);
        if (state.scrollParallaxY === y) return false;
        state.scrollParallaxY = y;
        applyHeadlineShift();
        applyOrbitScrollShift();
        if (state.items) {
            state.items.forEach(function (it) {
                it._path = undefined;
            });
        }
        return true;
    }

    function scrollParallaxNeedsFrame() {
        if (!state || !state._hero || prefersReducedMotion()) return false;
        var target = computeScrollParallaxY(state._hero);
        return Math.abs((state.scrollParallaxY || 0) - target) > 0.1;
    }

    function bindScrollParallax(hero) {
        if (!hero || prefersReducedMotion() || (state && state._scrollParallaxBound)) return;

        if (!state) {
            state = { _hero: hero, scrollParallaxY: 0, headlineShiftY: 0 };
        } else {
            state._hero = hero;
        }
        state.scrollParallaxY = state.scrollParallaxY || 0;

        function onScroll() {
            updateScrollParallax();
            updateLoop();
        }

        window.addEventListener('scroll', onScroll, { passive: true });
        state._onScrollParallax = onScroll;
        state._scrollParallaxBound = true;
        updateScrollParallax();
    }

    function updateParallax() {
        if (!state || !state.parallaxEnabled) return;
        var lerp = PARALLAX_LERP;
        state.parallaxX += (state.pointerNX * PARALLAX_ORBIT_MAX - state.parallaxX) * lerp;
        state.parallaxY += (state.pointerNY * PARALLAX_ORBIT_MAX - state.parallaxY) * lerp;
        state.items.forEach(function (it) {
            it._path = undefined;
        });
    }

    function parallaxNeedsFrame() {
        if (!state || !state.parallaxEnabled) return false;
        return Math.abs(state.parallaxX) > 0.15
            || Math.abs(state.parallaxY) > 0.15
            || Math.abs(state.pointerNX) > 0.002
            || Math.abs(state.pointerNY) > 0.002;
    }

    function motionNeedsFrame() {
        return parallaxNeedsFrame() || scrollParallaxNeedsFrame();
    }

    function bindParallax(hero) {
        if (!hero || !state || state.reduced || !canUseParallax()) return;

        state.parallaxEnabled = true;
        state.pointerNX = 0;
        state.pointerNY = 0;
        state.parallaxX = 0;
        state.parallaxY = 0;
        state.headlineShiftY = 0;

        function onMove(e) {
            var r = hero.getBoundingClientRect();
            if (!r.width || !r.height) return;
            var nx = ((e.clientX - r.left) / r.width - 0.5) * 2;
            var ny = ((e.clientY - r.top) / r.height - 0.5) * 2;
            state.pointerNX = Math.max(-1, Math.min(1, nx));
            state.pointerNY = Math.max(-1, Math.min(1, ny));
            updateLoop();
        }

        function onLeave() {
            state.pointerNX = 0;
            state.pointerNY = 0;
            updateLoop();
        }

        hero.addEventListener('mousemove', onMove);
        hero.addEventListener('mouseleave', onLeave);
        state._parallaxHero = hero;
        state._onParallaxMove = onMove;
        state._onParallaxLeave = onLeave;
    }

    function measureSubtitleZone(base) {
        var el = document.querySelector('.hero-home .hero-subtitle');
        if (!el) return null;
        var r = el.getBoundingClientRect();
        return {
            left: r.left - base.left,
            top: r.top - base.top,
            right: r.right - base.left,
            bottom: r.bottom - base.top
        };
    }

    /** 0 outside zone; 1 at centre (smooth falloff within pad). */
    function zoneInfluence(x, y, zone, pad) {
        if (!zone) return 0;
        var dx = Math.max(zone.left - x, 0, x - zone.right);
        var dy = Math.max(zone.top - y, 0, y - zone.bottom);
        var d = Math.hypot(dx, dy);
        if (d >= pad) return 0;
        return 1 - d / pad;
    }

    /** 1 outside subtitle; fades toward SUBTITLE_MIN_OP inside/near the copy block. */
    var SUBTITLE_MIN_OP = 0.18;

    function subtitleFadeFactor(x, y, zone, pad) {
        var t = zoneInfluence(x, y, zone, pad);
        return 1 - t * (1 - SUBTITLE_MIN_OP);
    }

    function init() {
        var container = document.getElementById('hero-wow-placeholder');
        if (!container) return;
        if (isSmallPortraitViewport()) {
            resetHeroBlocks();
            bindScrollParallax(container.closest('.hero') || document.querySelector('.hero.hero-home'));
            return;
        }

        var wrap = container.closest('.hero-wow');

        var providers = document.createElement('div');
        providers.className = 'hero-providers';
        providers.setAttribute('aria-hidden', 'true');

        var glow = document.createElement('span');
        glow.className = 'hero-providers__glow';
        providers.appendChild(glow);

        var linkLayer = document.createElement('div');
        linkLayer.className = 'hero-links';
        linkLayer.setAttribute('aria-hidden', 'true');

        var svg = document.createElementNS(SVGNS, 'svg');
        svg.setAttribute('class', 'hero-link-svg');
        svg.setAttribute('preserveAspectRatio', 'none');
        linkLayer.appendChild(svg);

        // Cards live in their own layer above the CTAs; lines sit between
        // CTAs and cards so both render over the buttons but under the hub.
        var cardLayer = document.createElement('div');
        cardLayer.className = 'hero-cards';
        cardLayer.setAttribute('aria-hidden', 'true');

        var cards = [];
        var lines = [];
        var items = [];
        assignStartAngles(PROVIDERS);
        PROVIDERS.forEach(function (p, i) {
            var line = buildLine(p, i);
            svg.appendChild(line.base);
            svg.appendChild(line.flow);
            lines.push(line);

            var card = buildCard(p);
            cardLayer.appendChild(card);
            cards.push(card);

            items.push({
                ring: p.ring,
                baseAngle: p.startAngle,
                omega: RING_OMEGA[p.ring],
                scale: RING_SCALE[p.ring],
                op: RING_OP[p.ring],
                revealStart: 180 + i * 40,
                rH: 0,
                rV: 0
            });
        });

        container.innerHTML = '';
        container.appendChild(providers);
        var hero = container.closest('.hero') || wrap.parentNode;
        if (hero) {
            hero.appendChild(linkLayer);
            hero.appendChild(cardLayer);
        }

        // Enforce stacking: headline (10) > CTAs (5) > cards (3) > lines (2).
        var headline = document.querySelector('.hero-home__headline');
        var cta = document.querySelector('.hero-home__cta');
        if (headline) {
            headline.style.position = 'relative';
            headline.style.zIndex = '10';
        }
        if (cta) {
            cta.style.position = 'relative';
            cta.style.zIndex = '5';
        }
        linkLayer.style.zIndex = '2';
        cardLayer.style.zIndex = '3';

        var reduced = prefersReducedMotion();
        if (wrap) {
            wrap.classList.add('hero-wow--providers');
            if (reduced) wrap.classList.add('hero-wow--static');
            if (IS_SAFARI) wrap.classList.add('hero-wow--safari');
        }

        state = {
            providers: providers, linkLayer: linkLayer, cardLayer: cardLayer,
            svg: svg, cards: cards, lines: lines,
            items: items, cx: 0, cy: 0, W: 0, reduced: reduced,
            inView: true, docVisible: !document.hidden,
            running: false, rafId: null, lastFrame: 0, lastPath: 0,
            frameMs: FRAME_MS,
            pathMs: IS_SAFARI ? PATH_MS_SAFARI : 0,
            roundPath: IS_SAFARI,
            _hero: hero, scrollParallaxY: 0, headlineShiftY: 0
        };

        layout();
        bindVisibility(hero || wrap);
        bindParallax(hero);
        bindScrollParallax(hero);

        var resizeTimer = null;
        window.addEventListener('resize', function () {
            window.clearTimeout(resizeTimer);
            resizeTimer = window.setTimeout(layout, 120);
        });
        window.addEventListener('load', layout);
        if (document.fonts && document.fonts.ready) {
            document.fonts.ready.then(layout);
        }
        document.addEventListener('componentsLoaded', layout);
        window.setTimeout(layout, 600);

        if (!reduced) {
            updateLoop();
        } else {
            renderCards(0);
            renderLines(0);
        }
    }

    function bindVisibility(target) {
        document.addEventListener('visibilitychange', function () {
            if (!state) return;
            state.docVisible = !document.hidden;
            updateLoop();
        });

        if (!target || !('IntersectionObserver' in window)) return;

        var io = new IntersectionObserver(function (entries) {
            if (!state) return;
            state.inView = entries[0].isIntersecting;
            updateLoop();
        }, { root: null, rootMargin: '80px 0px', threshold: 0 });

        io.observe(target);
    }

    function shouldAnimate() {
        return state && !state.reduced && state.inView && state.docVisible;
    }

    function shouldRenderFrame() {
        return shouldAnimate()
            || (state && state.inView && state.docVisible && motionNeedsFrame());
    }

    function updateLoop() {
        if (shouldRenderFrame()) startLoop();
        else stopLoop();
    }

    function startLoop() {
        if (!state || state.running) return;
        state.running = true;
        state.lastFrame = 0;
        state.lastPath = 0;
        state.rafId = window.requestAnimationFrame(frame);
    }

    function stopLoop() {
        if (!state) return;
        state.running = false;
        if (state.rafId) {
            window.cancelAnimationFrame(state.rafId);
            state.rafId = null;
        }
    }

    function frame(now) {
        if (!shouldRenderFrame()) {
            stopLoop();
            return;
        }
        state.rafId = window.requestAnimationFrame(frame);
        updateParallax();
        updateScrollParallax();
        if (now - state.lastFrame < state.frameMs) return;
        state.lastFrame = now;
        renderCards(now);
        if (!state.pathMs || now - state.lastPath >= state.pathMs) {
            state.lastPath = now;
            renderLines(now);
        }
    }

    function layout() {
        if (!state) return;
        var base = state.providers.getBoundingClientRect();
        var W = base.width;
        var H = base.height;
        if (!W || !H) return;

        var word = document.getElementById('hero-metacloud');
        var cx, cy;
        if (word) {
            // Keep the word locked to the vertical center of the page by
            // shifting the headline + CTA blocks together.
            var blocks = document.querySelectorAll('.hero-home__headline, .hero-home__cta');
            blocks.forEach(function (el) { el.style.transform = ''; });
            var nat = word.getBoundingClientRect();
            var deltaY = window.innerHeight / 2 - (nat.top + nat.height / 2);
            deltaY = Math.max(-160, Math.min(220, deltaY));
            state.headlineShiftY = deltaY;
            applyHeadlineShift();
            applyOrbitScrollShift();
            var r = word.getBoundingClientRect();
            cx = r.left - base.left + r.width / 2;
            cy = r.top - base.top + r.height / 2;
        } else {
            cx = W / 2;
            cy = H * 0.34;
        }
        state.cx = cx;
        state.cy = cy;
        state.W = W;
        state.subtitleZone = measureSubtitleZone(base);
        state.subtitleFadePad = Math.max(36, Math.min(72, W * 0.05));

        state.svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);

        // Density + margins scale down on narrow screens so the orbit still fits.
        var vw = window.innerWidth;
        var vh = window.innerHeight;
        var compact = vw <= 992;
        var tiny = vw <= 560;
        var dim = Math.min(vw, vh);

        // Perspective scale range shrinks on smaller viewports so near cards
        // never dominate the headline / subtitle (full range at ~1500px+).
        var perspMax = Math.min(1.55, Math.max(0.82, 0.75 + (dim - 600) / 800 * 0.8));
        if (vw < 1500) {
            perspMax = Math.min(perspMax, 0.88 + Math.max(0, vw - 720) / 780 * 0.67);
        }
        var perspMin = Math.max(0.52, 0.58 + (perspMax - 0.82) * 0.15);
        if (compact) {
            perspMax = Math.min(perspMax, 0.92 + (perspMax - 0.92) * Math.max(0, (dim - 560) / 440));
            perspMin = Math.min(perspMin, 0.62);
        }
        state.perspMin = perspMin;
        state.perspMax = perspMax;

        // Pull orbits in on smaller viewports / hero areas so bottom cards
        // don't overlap the hero copy below the Metacloud word.
        var orbitV = Math.min(1, dim / 980, H / 900);
        var orbitH = Math.min(1, vw / 1350);
        state.orbitV = orbitV;
        state.orbitH = orbitH;

        var marginX = Math.max(20, Math.min(96, W * 0.08));
        var marginTop = Math.max(72, H * 0.12);
        var marginBottom = Math.max(48, H * 0.08);

        // Cap radii so full ellipses stay on screen without distorting the orbit.
        var maxH = Math.min(cx - marginX, W - marginX - cx);
        var maxV = Math.min(cy - marginTop, H - marginBottom - cy);

        state.items.forEach(function (it, idx) {
            var hidden = (it.ring === 2 && compact) || (it.ring >= 1 && tiny);
            it.hidden = hidden;
            var card = state.cards[idx];
            var line = state.lines[idx];
            card.style.display = hidden ? 'none' : '';
            line.base.style.display = hidden ? 'none' : '';
            line.flow.style.display = hidden ? 'none' : '';
            it.rH = Math.min(RING_H[it.ring] * W * orbitH, maxH);
            it.rV = Math.min(RING_V[it.ring] * H * orbitV, maxV);
            it._path = it._transform = it._opacity = it._z = it._lineOp = it._lineDash = it._lineDashOff = it._near = it._farBlur = undefined;
        });

        if (state.reduced) {
            renderCards(0);
            renderLines(0);
        } else if (shouldAnimate()) {
            var t = performance.now();
            renderCards(t);
            renderLines(t);
        }

        updateScrollParallax();
    }

    function renderCards(now) {
        var items = state.items;
        if (!items.length || !state.W) return;
        var pMin = state.perspMin != null ? state.perspMin : 0.7;
        var pMax = state.perspMax != null ? state.perspMax : 1.55;
        var roundPos = state.roundPath;

        for (var i = 0; i < items.length; i++) {
            var it = items[i];
            if (it.hidden) continue;

            var ang = state.reduced ? it.baseAngle : it.baseAngle + now * it.omega;
            var center = orbitCenter(it.ring);
            var pos = orbitXY(center.x, center.y, it.rH, it.rV, ang);
            var x = pos.x;
            var y = pos.y;
            if (roundPos) {
                x = Math.round(x);
                y = Math.round(y);
            }
            var near = (Math.sin(ang) + 1) / 2;
            var persp = pMin + (pMax - pMin) * near;
            var reveal = state.reduced ? 1 : Math.max(0, Math.min(1, (now - it.revealStart) / 500));
            var subFade = subtitleFadeFactor(x, y, state.subtitleZone, state.subtitleFadePad);
            var line = state.lines[i];
            var blur = blurFilter(farPerspectiveBlur(near));

            var scale = (it.scale * persp).toFixed(3);
            var px = roundPos ? String(x) : x.toFixed(1);
            var py = roundPos ? String(y) : y.toFixed(1);
            var transform = 'translate3d(' + px + 'px,' + py + 'px,0) translate(-50%,-50%) scale(' + scale + ')';
            var card = state.cards[i];
            if (it._transform !== transform) {
                card.style.transform = transform;
                it._transform = transform;
            }

            var z = String(1 + Math.round(near * 9));
            if (it._z !== z) {
                card.style.zIndex = z;
                it._z = z;
            }

            var opacity = (it.op * reveal * subFade).toFixed(3);
            if (it._opacity !== opacity) {
                card.style.opacity = opacity;
                it._opacity = opacity;
            }

            if (it._farBlur !== blur) {
                card.style.filter = blur;
                line.flow.style.filter = blur;
                line.base.style.filter = blur;
                it._farBlur = blur;
            }

            it._x = x;
            it._y = y;
            it._near = near;
            it._lineOpVal = 0.7 * reveal * subFade;

            var dash = lineDashStyle(near);
            var dashKey = dash.dashArray + '|' + dash.flowWidth;
            if (it._lineDash !== dashKey) {
                line.flow.style.strokeDasharray = dash.dashArray;
                line.flow.style.strokeWidth = dash.flowWidth;
                line.base.style.strokeWidth = dash.baseWidth;
                it._lineDash = dashKey;
                it._lineDashPeriod = dash.period;
            }
            if (!state.reduced && shouldAnimate()) {
                line.flow.style.animation = 'none';
                var period = it._lineDashPeriod || 11;
                var off = -((now % LINE_DASH_FLOW_MS) / LINE_DASH_FLOW_MS) * period;
                var offStr = off.toFixed(2);
                if (it._lineDashOff !== offStr) {
                    line.flow.style.strokeDashoffset = offStr;
                    it._lineDashOff = offStr;
                }
            } else if (it._lineDashOff !== '0') {
                line.flow.style.strokeDashoffset = '0';
                it._lineDashOff = '0';
            }
        }
    }

    function renderLines(now) {
        var items = state.items;
        if (!items.length || !state.W) return;
        var hubX = state.cx;
        var hubY = state.cy;

        for (var i = 0; i < items.length; i++) {
            var it = items[i];
            if (it.hidden) continue;

            var x = it._x;
            var y = it._y;
            if (x == null) {
                var ang = state.reduced ? it.baseAngle : it.baseAngle + now * it.omega;
                var center = orbitCenter(it.ring);
                var pos = orbitXY(center.x, center.y, it.rH, it.rV, ang);
                x = pos.x;
                y = pos.y;
                if (state.roundPath) {
                    x = Math.round(x);
                    y = Math.round(y);
                }
            }

            var d = archPath(x, y, hubX, hubY, state.roundPath);
            var line = state.lines[i];
            if (it._path !== d) {
                line.base.setAttribute('d', d);
                line.flow.setAttribute('d', d);
                it._path = d;
            }

            var lineOp = (it._lineOpVal != null ? it._lineOpVal : 0.7).toFixed(3);
            if (it._lineOp !== lineOp) {
                line.flow.style.opacity = lineOp;
                it._lineOp = lineOp;
            }
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
