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

    // angle: degrees start position around the word (0 = right, 90 = down, 180 = left, 270 = up)
    var PROVIDERS = [
        // Hypervisors / virtualization
        { name: 'AtomOS', tag: 'Sovereign hypervisor', img: '/assets/logos/Atomos.svg', accent: 'var(--atomos-color, #ffa600)', ring: 0, angle: 182 },
        { name: 'Proxmox', tag: 'Hypervisor', icon: 'fas fa-box', accent: '#E57000', ring: 0, angle: 150 },
        { name: 'VMware', tag: 'Hypervisor', icon: 'fas fa-layer-group', accent: '#9AAEC0', ring: 0, angle: 214 },
        { name: 'KVM', tag: 'Virtualization', icon: 'fas fa-microchip', accent: '#D33', ring: 1, angle: 140 },
        { name: 'Hyper-V', tag: 'Hypervisor', icon: 'fab fa-windows', accent: '#2E8DEF', ring: 1, angle: 180 },
        { name: 'Nutanix', tag: 'Hypervisor', icon: 'fas fa-cubes', accent: '#3B82C4', ring: 1, angle: 220 },
        { name: 'Citrix', tag: 'Hypervisor', icon: 'fas fa-server', accent: '#7A52C7', ring: 2, angle: 132 },
        { name: 'Red Hat', tag: 'Virtualization', icon: 'fab fa-redhat', accent: '#EE0000', ring: 2, angle: 159 },
        { name: 'XCP-ng', tag: 'Hypervisor', icon: 'fas fa-server', accent: '#1BA0E2', ring: 2, angle: 192 },
        { name: 'OpenStack', tag: 'Private cloud', icon: 'fas fa-server', accent: '#E0408A', ring: 2, angle: 226 },

        // Clouds
        { name: 'AWS', tag: 'Public cloud', icon: 'fab fa-aws', accent: '#FF9900', ring: 0, angle: 338 },
        { name: 'Azure', tag: 'Public cloud', icon: 'fab fa-microsoft', accent: '#2E8DEF', ring: 0, angle: 22 },
        { name: 'Google Cloud', tag: 'Public cloud', icon: 'fab fa-google', accent: '#4285F4', ring: 1, angle: 312 },
        { name: 'OVHcloud', tag: 'Sovereign cloud', icon: 'fas fa-cloud', accent: '#2272C9', ring: 1, angle: 0 },
        { name: 'Scaleway', tag: 'Sovereign cloud', icon: 'fas fa-server', accent: '#8C52FF', ring: 1, angle: 48 },
        { name: 'Oracle', tag: 'Public cloud', icon: 'fas fa-database', accent: '#C74634', ring: 2, angle: 326 },
        { name: 'IBM Cloud', tag: 'Public cloud', icon: 'fas fa-cloud', accent: '#0F62FE', ring: 2, angle: 348 },
        { name: 'Alibaba', tag: 'Public cloud', icon: 'fas fa-cloud', accent: '#FF6A00', ring: 2, angle: 19 },
        { name: 'DigitalOcean', tag: 'Public cloud', icon: 'fab fa-digital-ocean', accent: '#0080FF', ring: 2, angle: 48 }
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
        var baseLine = document.createElementNS(SVGNS, 'path');
        baseLine.setAttribute('class', 'hero-link-base');
        baseLine.style.stroke = p.accent;

        var flow = document.createElementNS(SVGNS, 'path');
        flow.setAttribute('class', 'hero-link');
        flow.style.stroke = p.accent;
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

        var svg = document.createElementNS(SVGNS, 'svg');
        svg.setAttribute('class', 'hero-link-svg');
        svg.setAttribute('preserveAspectRatio', 'none');
        providers.appendChild(svg);

        var cards = [];
        var lines = [];
        var items = [];
        PROVIDERS.forEach(function (p, i) {
            var line = buildLine(p, i);
            svg.appendChild(line.base);
            svg.appendChild(line.flow);
            lines.push(line);

            var card = buildCard(p);
            providers.appendChild(card);
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
        var reduced = prefersReducedMotion();
        if (wrap) {
            wrap.classList.add('hero-wow--providers');
            if (reduced) wrap.classList.add('hero-wow--static');
        }

        state = {
            providers: providers, svg: svg, cards: cards, lines: lines,
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
        var compact = vw <= 992;
        var tiny = vw <= 560;

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
            it.rH = Math.min(RING_H[it.ring] * W, maxH);
            it.rV = Math.min(RING_V[it.ring] * H, maxV);
        });

        if (state.reduced) render(0);
    }

    function render(now) {
        var items = state.items;
        if (!items.length || !state.W) return;
        var cx = state.cx;
        var cy = state.cy;
        var fadeSpan = 0.2 * state.W;

        for (var i = 0; i < items.length; i++) {
            var it = items[i];
            if (it.hidden) continue;
            var ang = state.reduced ? it.baseAngle : it.baseAngle + now * it.omega;
            var x = cx + it.rH * Math.cos(ang);
            var y = cy + it.rV * Math.sin(ang);

            var card = state.cards[i];
            card.style.left = x + 'px';
            card.style.top = y + 'px';
            card.style.transform = 'translate(-50%, -50%) scale(' + it.scale + ')';

            // Reveal progress + depth fade. Only dim below the word, where
            // cards pass over the subtitle / CTAs; leave the top at full
            // opacity since there's nothing to preserve there.
            var reveal = state.reduced ? 1 : Math.max(0, Math.min(1, (now - it.revealStart) / 500));
            var prox = Math.min(1, Math.abs(x - cx) / fadeSpan);
            var bottomGate = Math.max(0, Math.sin(ang));
            var depth = 1 - bottomGate * (0.7 - 0.7 * prox);
            card.style.opacity = (it.op * reveal * depth).toFixed(3);

            var d = archPath(x, y, cx, cy);
            var line = state.lines[i];
            line.base.setAttribute('d', d);
            line.flow.setAttribute('d', d);
            line.flow.style.opacity = (0.7 * reveal * depth).toFixed(3);
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
