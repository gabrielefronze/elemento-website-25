(function () {
    'use strict';
    document.addEventListener('DOMContentLoaded', async function () {
        const mount = document.querySelector('[data-product-crosslinks]');
        if (!mount) return;
        const current = mount.getAttribute('data-product-crosslinks');
        try {
            const url = window.ElementoI18n?.assetUrl
                ? window.ElementoI18n.assetUrl('components/product-crosslinks.html')
                : 'components/product-crosslinks.html';
            const res = await fetch(url);
            let html = await res.text();
            if (current) {
                html = html.replace(
                    `href="${current}.html"`,
                    `href="${current}.html" aria-current="page" class="product-crosslinks__item product-crosslinks__item--current"`
                );
            }
            mount.innerHTML = html;
        } catch (e) {
            console.error('Product crosslinks failed', e);
        }
    });
})();
