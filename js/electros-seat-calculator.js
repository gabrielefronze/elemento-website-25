/**
 * Electros per-seat-per-organisation pricing estimator.
 */
(function () {
    'use strict';

    const TIER_PLACEHOLDER = {
        standard: { monthlyPerSeat: null, label: 'Standard' },
        professional: { monthlyPerSeat: null, label: 'Professional' },
        enterprise: { monthlyPerSeat: null, label: 'Enterprise' },
    };

    const SUPPORT_ANNUAL = {
        community: 0,
        standard: 1200,
        production: 2400,
    };

    function formatMoney(n) {
        if (n === null || n === undefined) return 'Contact sales';
        return '€' + n.toLocaleString('en', { maximumFractionDigits: 0 });
    }

    function calc(orgs, usersPerOrg, tier, support) {
        const seats = orgs * usersPerOrg;
        const perSeat = TIER_PLACEHOLDER[tier]?.monthlyPerSeat;
        const monthly = perSeat !== null ? seats * perSeat : null;
        const annual = monthly !== null ? monthly * 12 : null;
        const supportCost = SUPPORT_ANNUAL[support] || 0;
        return { seats, monthly, annual, supportCost };
    }

    function bind(root) {
        const inputs = {
            orgs: root.querySelector('[data-input="orgs"]'),
            usersPerOrg: root.querySelector('[data-input="usersPerOrg"]'),
            tier: root.querySelector('[data-input="tier"]'),
            support: root.querySelector('[data-input="support"]'),
        };
        const outputs = {
            seats: root.querySelector('[data-output="seats"]'),
            monthly: root.querySelector('[data-output="monthly"]'),
            annual: root.querySelector('[data-output="annual"]'),
            supportCost: root.querySelector('[data-output="supportCost"]'),
        };

        function update() {
            const orgs = Math.max(1, parseInt(inputs.orgs.value, 10) || 1);
            const usersPerOrg = Math.max(1, parseInt(inputs.usersPerOrg.value, 10) || 1);
            const result = calc(orgs, usersPerOrg, inputs.tier.value, inputs.support.value);
            outputs.seats.textContent = String(result.seats);
            outputs.monthly.textContent = formatMoney(result.monthly);
            outputs.annual.textContent = formatMoney(result.annual);
            outputs.supportCost.textContent = formatMoney(result.supportCost);
        }

        Object.values(inputs).forEach((el) => el.addEventListener('input', update));
        Object.values(inputs).forEach((el) => el.addEventListener('change', update));
        update();
    }

    async function init() {
        const mount = document.querySelector('[data-seat-calculator-mount]');
        if (!mount) return;
        try {
            const base = window.ElementoI18n?.assetUrl ? window.ElementoI18n.assetUrl('components/seat-calculator.html') : 'components/seat-calculator.html';
            const res = await fetch(base);
            mount.innerHTML = await res.text();
            const calc = mount.querySelector('[data-seat-calculator]');
            if (calc) bind(calc);
        } catch (e) {
            console.error('Seat calculator load failed', e);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
