/**
 * Hero Metacloud constellation.
 *
 * Provider + hypervisor glassmorphism cards revolve around the word "Metacloud"
 * in the headline along concentric ellipses (ring 0 closest), each joined to the
 * word by a smoothly arched, animated link line. The word is the shared orbit
 * center; rings rotate at different speeds for a galaxy feel. Cards dim as they
 * sweep behind the headline. Hidden on small / portrait screens via CSS.
 */
(function () {
    'use strict';

    var SVGNS = 'http://www.w3.org/2000/svg';

    var LINE_CLOUD = 'var(--cloud-net-color, #DC3545)';
    var LINE_HYPERVISOR = 'var(--atomos-color, #007bff)';

    // angle: optional hint (degrees); omitted angles are assigned randomly per ring at init.
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
    // Orbital periods per ring, in ms (inner spins a touch faster).
    var RING_PERIOD = [82000, 104000, 128000];
    // Curve amount for the arched link lines (fraction of chord length).
    var ARCH = 0.16;

    function prefersReducedMotion() {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    /** Fisher–Yates shuffle (mutates array). */
    function shuffle(arr) {
        for (var i = arr.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var tmp = arr[i];
            arr[i] = arr[j];
            arr[j] = tmp;
        }
        return arr;
    }

    /**
     * Assign a random starting angle (radians) to each provider.
     * Cards on the same ring are evenly spaced with a random ring phase,
     * shuffled order, and light jitter so layouts differ on every load.
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

        byRing.forEach(function (group) {
            if (!group.length) return;
            shuffle(group);
            var phase = Math.random() * Math.PI * 2;
            var step = (Math.PI * 2) / group.length;
            var jitterMax = step * 0.28;
            group.forEach(function (p, i) {
                var jitter = (Math.random() - 0.5) * jitterMax;
                p.startAngle = phase + step * i + jitter;
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
        var stroke = p.kind === 'cloud' ? LINE_CLOUD : LINE_HYPERVISOR;
        var baseLine = document.createElementNS(SVGNS, 'path');
        baseLine.setAttribute('class', 'hero-link-base');
        baseLine.style.stroke = stroke;

        var flow = document.createElementNS(SVGNS, 'path');
        flow.setAttribute('class', 'hero-link');
        flow.style.stroke = stroke;
        flow.style.animationDelay = (index * 0.12).toFixed(2) + 's';

        return { base: baseLine, flow: flow };
    }

    function archPath(x1, y1, x2, y2) {
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

    function init() {
        var container = document.getElementById('hero-wow-placeholder');
        if (!container) return;
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
                omega: (2 * Math.PI) / RING_PERIOD[p.ring],
                scale: RING_SCALE[p.ring],
                op: RING_OP[p.ring],
                revealStart: 180 + Math.random() * 420 + i * 40,
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

        // Enforce stacking: headline (4) > cards (3) > lines (2) > CTAs (1).
        var headline = document.querySelector('.hero-home__headline');
        var cta = document.querySelector('.hero-home__cta');
        if (headline) {
            headline.style.position = 'relative';
            headline.style.zIndex = '4';
        }
        if (cta) {
            cta.style.position = 'relative';
            cta.style.zIndex = '1';
        }
        linkLayer.style.zIndex = '2';
        cardLayer.style.zIndex = '3';

        var reduced = prefersReducedMotion();
        if (wrap) {
            wrap.classList.add('hero-wow--providers');
            if (reduced) wrap.classList.add('hero-wow--static');
        }

        state = {
            providers: providers, linkLayer: linkLayer, cardLayer: cardLayer,
            svg: svg, cards: cards, lines: lines,
            items: items, cx: 0, cy: 0, W: 0, reduced: reduced,
            inView: true, docVisible: !document.hidden,
            running: false, rafId: null
        };

        layout();
        bindVisibility(hero || wrap);

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
            render(0);
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

    function updateLoop() {
        if (shouldAnimate()) startLoop();
        else stopLoop();
    }

    function startLoop() {
        if (!state || state.running) return;
        state.running = true;
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
        if (!shouldAnimate()) {
            stopLoop();
            return;
        }
        render(now);
        state.rafId = window.requestAnimationFrame(frame);
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
            blocks.forEach(function (el) {
                el.style.transform = 'translateY(' + deltaY.toFixed(1) + 'px)';
            });
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
            it._path = it._transform = it._opacity = it._z = it._lineOp = undefined;
        });

        if (state.reduced) {
            render(0);
        } else if (shouldAnimate()) {
            render(performance.now());
        }
    }

    function render(now) {
        var items = state.items;
        if (!items.length || !state.W) return;
        var cx = state.cx;
        var cy = state.cy;
        var pMin = state.perspMin != null ? state.perspMin : 0.7;
        var pMax = state.perspMax != null ? state.perspMax : 1.55;

        for (var i = 0; i < items.length; i++) {
            var it = items[i];
            if (it.hidden) continue;

            var ang = state.reduced ? it.baseAngle : it.baseAngle + now * it.omega;
            var x = cx + it.rH * Math.cos(ang);
            var y = cy + it.rV * Math.sin(ang);
            var near = (Math.sin(ang) + 1) / 2;
            var persp = pMin + (pMax - pMin) * near;
            var farFade = 0.58 + 0.42 * near;
            var reveal = state.reduced ? 1 : Math.max(0, Math.min(1, (now - it.revealStart) / 500));

            var scale = (it.scale * persp).toFixed(3);
            var transform = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0) translate(-50%,-50%) scale(' + scale + ')';
            var card = state.cards[i];
            if (it._transform !== transform) {
                card.style.transform = transform;
                it._transform = transform;
            }

            var z = String(Math.round(near * 100));
            if (it._z !== z) {
                card.style.zIndex = z;
                it._z = z;
            }

            var opacity = (it.op * reveal * farFade).toFixed(3);
            if (it._opacity !== opacity) {
                card.style.opacity = opacity;
                it._opacity = opacity;
            }

            var d = archPath(x, y, cx, cy);
            var line = state.lines[i];
            if (it._path !== d) {
                line.base.setAttribute('d', d);
                line.flow.setAttribute('d', d);
                it._path = d;
            }

            var lineOp = (0.7 * reveal * farFade).toFixed(3);
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
