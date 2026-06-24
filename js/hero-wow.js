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

    // angle: degrees start position around the word (0 = right, 90 = down, 180 = left, 270 = up)
    var PROVIDERS = [
        // Hypervisors / virtualization
        { name: 'AtomOS', tag: 'Sovereign hypervisor', img: '/assets/logos/Atomos.svg', accent: 'var(--atomos-color, #007bff)', kind: 'hypervisor', ring: 0, angle: 182 },
        { name: 'Proxmox', tag: 'Hypervisor', icon: 'fas fa-box', accent: '#E57000', kind: 'hypervisor', ring: 0, angle: 150 },
        { name: 'VMware', tag: 'Hypervisor', icon: 'fas fa-layer-group', accent: '#9AAEC0', kind: 'hypervisor', ring: 0, angle: 214 },
        { name: 'KVM', tag: 'Virtualization', icon: 'fas fa-microchip', accent: '#D33', kind: 'hypervisor', ring: 1, angle: 140 },
        { name: 'Hyper-V', tag: 'Hypervisor', icon: 'fab fa-windows', accent: '#2E8DEF', kind: 'hypervisor', ring: 1, angle: 180 },
        { name: 'Nutanix', tag: 'Hypervisor', icon: 'fas fa-cubes', accent: '#3B82C4', kind: 'hypervisor', ring: 1, angle: 220 },
        { name: 'Citrix', tag: 'Hypervisor', icon: 'fas fa-server', accent: '#7A52C7', kind: 'hypervisor', ring: 2, angle: 132 },
        { name: 'Red Hat', tag: 'Virtualization', icon: 'fab fa-redhat', accent: '#EE0000', kind: 'hypervisor', ring: 2, angle: 159 },
        { name: 'XCP-ng', tag: 'Hypervisor', icon: 'fas fa-server', accent: '#1BA0E2', kind: 'hypervisor', ring: 2, angle: 192 },
        { name: 'OpenStack', tag: 'Private cloud', icon: 'fas fa-server', accent: '#E0408A', kind: 'hypervisor', ring: 2, angle: 226 },

        // Clouds
        { name: 'AWS', tag: 'Public cloud', icon: 'fab fa-aws', accent: '#FF9900', kind: 'cloud', ring: 0, angle: 338 },
        { name: 'Azure', tag: 'Public cloud', icon: 'fab fa-microsoft', accent: '#2E8DEF', kind: 'cloud', ring: 0, angle: 22 },
        { name: 'Google Cloud', tag: 'Public cloud', icon: 'fab fa-google', accent: '#4285F4', kind: 'cloud', ring: 1, angle: 312 },
        { name: 'OVHcloud', tag: 'Sovereign cloud', icon: 'fas fa-cloud', accent: '#2272C9', kind: 'cloud', ring: 1, angle: 0 },
        { name: 'Scaleway', tag: 'Sovereign cloud', icon: 'fas fa-server', accent: '#8C52FF', kind: 'cloud', ring: 1, angle: 48 },
        { name: 'Oracle', tag: 'Public cloud', icon: 'fas fa-database', accent: '#C74634', kind: 'cloud', ring: 2, angle: 326 },
        { name: 'IBM Cloud', tag: 'Public cloud', icon: 'fas fa-cloud', accent: '#0F62FE', kind: 'cloud', ring: 2, angle: 348 },
        { name: 'Alibaba', tag: 'Public cloud', icon: 'fas fa-cloud', accent: '#FF6A00', kind: 'cloud', ring: 2, angle: 19 },
        { name: 'DigitalOcean', tag: 'Public cloud', icon: 'fab fa-digital-ocean', accent: '#0080FF', kind: 'cloud', ring: 2, angle: 48 }
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

    var state = null;

    function buildCard(p) {
        var media = p.img
            ? '<img class="provider-float__img" src="' + p.img + '" alt="" aria-hidden="true">'
            : '<i class="' + p.icon + '"></i>';
        var el = document.createElement('div');
        el.className = 'provider-float provider-float--r' + p.ring;
        el.style.setProperty('--accent', p.accent);
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
        flow.style.animationDelay = '0s, ' + (index * 0.12).toFixed(2) + 's';

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
                baseAngle: p.angle * Math.PI / 180,
                omega: (2 * Math.PI) / RING_PERIOD[p.ring],
                scale: RING_SCALE[p.ring],
                op: RING_OP[p.ring],
                revealStart: 250 + i * 60,
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
            items: items, cx: 0, cy: 0, W: 0, reduced: reduced
        };

        layout();

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
            window.requestAnimationFrame(frame);
        } else {
            render(0);
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
        });

        if (state.reduced) render(0);
    }

    function render(now) {
        var items = state.items;
        if (!items.length || !state.W) return;
        var cx = state.cx;
        var cy = state.cy;

        for (var i = 0; i < items.length; i++) {
            var it = items[i];
            if (it.hidden) continue;
            var ang = state.reduced ? it.baseAngle : it.baseAngle + now * it.omega;
            var x = cx + it.rH * Math.cos(ang);
            var y = cy + it.rV * Math.sin(ang);

            // Perspective: bottom of the ellipse reads as "near" (bigger,
            // sharp, on top), the top as "far" (smaller, blurred, behind).
            var near = (Math.sin(ang) + 1) / 2; // 0 far (top) .. 1 near (bottom)
            var pMin = state.perspMin != null ? state.perspMin : 0.7;
            var pMax = state.perspMax != null ? state.perspMax : 1.55;
            var persp = pMin + (pMax - pMin) * near;
            var blur = (1 - near) * .9;

            var card = state.cards[i];
            card.style.left = x + 'px';
            card.style.top = y + 'px';
            card.style.transform = 'translate(-50%, -50%) scale(' + (it.scale * persp).toFixed(3) + ')';
            card.style.filter = blur > 0.06 ? 'blur(' + blur.toFixed(2) + 'px)' : 'none';
            card.style.zIndex = String(Math.round(near * 100));

            var reveal = state.reduced ? 1 : Math.max(0, Math.min(1, (now - it.revealStart) / 500));
            card.style.opacity = (it.op * reveal).toFixed(3);

            var d = archPath(x, y, cx, cy);
            var lineBlur = blur > 0.06 ? 'blur(' + blur.toFixed(2) + 'px)' : 'none';
            // Far cards (top): finer dash pattern; near cards: standard dashes.
            var dash = 1 + 1.2 * near;
            var gap = 6.5 + 3.5 * near;
            var period = dash + gap;
            var line = state.lines[i];
            line.base.setAttribute('d', d);
            line.flow.setAttribute('d', d);
            line.base.style.filter = lineBlur;
            line.flow.style.filter = lineBlur;
            line.flow.style.strokeDasharray = dash.toFixed(2) + ' ' + gap.toFixed(2);
            line.flow.style.strokeDashoffset = (-(now / 1300 * period) % period).toFixed(2);
            line.flow.style.animation = 'none';
            line.flow.style.opacity = (0.7 * reveal).toFixed(3);
        }
    }

    function frame(now) {
        if (state && !state.reduced) {
            render(now);
            window.requestAnimationFrame(frame);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
