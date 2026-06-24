/**
 * Hero infrastructure graph animation — desktop; static SVG on mobile.
 */
(function () {
    'use strict';

    function prefersReducedMotion() {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    function isMobile() {
        return window.matchMedia('(max-width: 768px)').matches;
    }

    function buildSvg() {
        const clouds = ['AWS', 'Azure', 'GCP', 'OVH', 'Scaleway'];
        const hypervisors = ['VMware', 'Proxmox', 'Nutanix', 'Hyper-V', 'AtomOS'];
        const w = 800;
        const h = 400;
        let svg = `<svg class="hero-wow__graph" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">`;
        clouds.forEach((label, i) => {
            const y = 60 + i * 55;
            svg += `<g class="hero-wow-cloud" style="--delay:${i * 0.15}s"><circle cx="80" cy="${y}" r="28" fill="rgba(0,106,201,0.15)" stroke="rgba(0,106,201,0.4)"/><text x="80" y="${y + 4}" text-anchor="middle" font-size="9" fill="currentColor">${label}</text></g>`;
        });
        hypervisors.forEach((label, i) => {
            const y = 60 + i * 55;
            svg += `<g class="hero-wow-hv" style="--delay:${i * 0.15}s"><circle cx="720" cy="${y}" r="28" fill="rgba(255,166,0,0.12)" stroke="rgba(255,166,0,0.45)"/><text x="720" y="${y + 4}" text-anchor="middle" font-size="9" fill="currentColor">${label}</text></g>`;
        });
        svg += `<line class="hero-wow-line hero-wow-animate" x1="108" y1="200" x2="320" y2="200" stroke="rgba(255,166,0,0.5)" stroke-width="2"/>`;
        svg += `<line class="hero-wow-line hero-wow-animate" x1="480" y1="200" x2="692" y2="200" stroke="rgba(255,166,0,0.5)" stroke-width="2"/>`;
        svg += `<g class="hero-wow-center"><rect x="340" y="165" width="120" height="70" rx="8" fill="rgba(255,166,0,0.2)" stroke="var(--primary-color)" stroke-width="2"/><text x="400" y="195" text-anchor="middle" font-size="11" font-weight="700" fill="currentColor">Electros</text><text x="400" y="212" text-anchor="middle" font-size="8" fill="currentColor">Control plane</text></g>`;
        svg += `<text x="400" y="155" text-anchor="middle" font-size="9" fill="currentColor" class="hero-wow-animate">C4</text>`;
        svg += '</svg>';
        return svg;
    }

    function init() {
        const container = document.getElementById('hero-wow-placeholder');
        if (!container) return;
        container.innerHTML = buildSvg();
        if (prefersReducedMotion() || isMobile()) {
            container.closest('.hero-wow')?.classList.add('hero-wow--static');
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
