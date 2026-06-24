// Footer loader with i18n support
document.addEventListener('DOMContentLoaded', function() {
    if (window.self !== window.top) {
        return;
    }
    function injectLinkedInInsightTag() {
        if (document.getElementById('linkedin-insight-tag-script')) {
            return;
        }

        window._linkedin_partner_id = "10034337";
        window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
        if (!window._linkedin_data_partner_ids.includes(window._linkedin_partner_id)) {
            window._linkedin_data_partner_ids.push(window._linkedin_partner_id);
        }

        if (!window.lintrk) {
            window.lintrk = function (a, b) { window.lintrk.q.push([a, b]); };
            window.lintrk.q = [];
        }

        const insightScript = document.createElement('script');
        insightScript.id = 'linkedin-insight-tag-script';
        insightScript.type = 'text/javascript';
        insightScript.async = true;
        insightScript.src = 'https://snap.licdn.com/li.lms-analytics/insight.min.js';
        document.head.appendChild(insightScript);

        const noScript = document.createElement('noscript');
        noScript.id = 'linkedin-insight-tag-noscript';
        noScript.innerHTML = '<img height="1" width="1" style="display:none;" alt="" src="https://px.ads.linkedin.com/collect/?pid=10034337&fmt=gif" />';
        document.body.appendChild(noScript);
    }

    function injectMetricoolTracker() {
        if (document.getElementById('metricool-tracker-script')) {
            return;
        }

        function loadScript(callback) {
            var head = document.getElementsByTagName('head')[0];
            var script = document.createElement('script');
            script.id = 'metricool-tracker-script';
            script.type = 'text/javascript';
            script.src = 'https://tracker.metricool.com/resources/be.js';
            script.onreadystatechange = callback;
            script.onload = callback;
            head.appendChild(script);
        }

        loadScript(function() {
            beTracker.t({ hash: '788f4c6e2088d06d988cc33b8f1d217a' });
        });
    }

    function getPathPrefix() {
        const parts = window.location.pathname.split('/').filter(Boolean);
        if (parts.length && parts[parts.length - 1].endsWith('.html')) {
            parts.pop();
        }
        return parts.length ? '../'.repeat(parts.length) : './';
    }

    function getLocale() {
        if (window.ElementoI18n) return window.ElementoI18n.getPageLocale();
        const lang = document.documentElement.lang;
        return lang === 'it' || lang === 'fr' ? lang : 'en';
    }

    function localizedHref(filename) {
        if (window.ElementoI18n?.pageHref) {
            return window.ElementoI18n.pageHref(filename, getLocale());
        }
        const locale = getLocale();
        const siteBase = window.ElementoI18n?.getSiteBase ? window.ElementoI18n.getSiteBase() : '';
        if (locale !== 'en') {
            const path = filename === 'index.html' ? `/${locale}/index.html` : `/${locale}/${filename}`;
            return `${siteBase}${path}`;
        }
        const path = filename === 'index.html' ? '/' : `/${filename}`;
        return siteBase ? `${siteBase}${path === '/' ? '/' : path}` : path;
    }

    function renderFooterHtml(ui, assetPrefix) {
        const f = ui.footer;
        return `
    <section class="section">
        <div class="container">
            <div class="footer-content">
                <div class="footer-section">
                    <div class="footer-logo-section">
                        <div class="footer-logo-container" role="img" aria-label="Elemento Modular Cloud"></div>
                    </div>
                    <p>${f.tagline}</p>
                </div>
                <div class="footer-section">
                    <h3>${f.platform}</h3>
                    <ul>
                        <li><a href="${localizedHref('platform.html')}">${f.platformOverview}</a></li>
                        <li><a href="${localizedHref('electros.html')}" class="footer-link--featured">Electros</a></li>
                        <li><a href="${localizedHref('c4-protocol.html')}">C4 Protocol <span class="footer-sublabel">${f.c4Sublabel || 'Open interoperability protocol'}</span></a></li>
                        <li><a href="${localizedHref('atomosphere.html')}">Atomosphere</a></li>
                        <li><a href="${localizedHref('atomosquare.html')}">Atomosquare</a></li>
                        <li><a href="${localizedHref('atomos.html')}">AtomOS <span class="footer-sublabel">${f.atomosSublabel || 'Native hypervisor endpoint'}</span></a></li>
                    </ul>
                </div>
                <div class="footer-section">
                    <h3>${f.solutions}</h3>
                    <ul>
                        <li><a href="${localizedHref('solutions/vmware-exit.html')}">${f.solVmwareExit}</a></li>
                        <li><a href="${localizedHref('solutions/sovereign-cloud-governance.html')}">${f.solSovereign}</a></li>
                        <li><a href="${localizedHref('solutions/hybrid-multi-cloud.html')}">${f.solHybrid}</a></li>
                        <li><a href="${localizedHref('solutions/index.html')}">${f.allSolutions}</a></li>
                    </ul>
                </div>
                <div class="footer-section">
                    <h3>${f.company}</h3>
                    <ul>
                        <li><a href="${localizedHref('about.html')}">${f.aboutUs}</a></li>
                        <li><a href="${localizedHref('about.html')}#team">${f.team}</a></li>
                        <li><a href="${localizedHref('contact.html')}">${ui.nav.contact}</a></li>
                        <li><a href="${localizedHref('pricing.html')}">${ui.nav.pricing}</a></li>
                    </ul>
                </div>
                <div class="footer-section">
                    <h3>${f.resources}</h3>
                    <ul>
                        <li><a href="https://bookstack.elemento.cloud" target="_blank" rel="noopener noreferrer">${f.documentation}</a></li>
                        <li><a href="${localizedHref('brand-guidelines.html')}">${f.brandGuidelines}</a></li>
                        <li><a href="${localizedHref('blog.html')}">${ui.nav.blog}</a></li>
                    </ul>
                </div>
                <div class="footer-section">
                    <h3>${f.connect}</h3>
                    <div class="social-links">
                        <a href="https://www.youtube.com/@elementocloud" class="social-link" target="_blank" rel="noopener noreferrer">
                            <i class="fab fa-youtube"></i><span>YouTube</span>
                        </a>
                        <a href="https://www.linkedin.com/company/elemento-modular-cloud/" class="social-link" target="_blank" rel="noopener noreferrer">
                            <i class="fab fa-linkedin"></i><span>LinkedIn</span>
                        </a>
                        <a href="https://github.com/elemento-modular-cloud" class="social-link" target="_blank" rel="noopener noreferrer">
                            <i class="fab fa-github"></i><span>GitHub</span>
                        </a>
                        <a href="https://www.instagram.com/elementocloud/" class="social-link" target="_blank" rel="noopener noreferrer">
                            <i class="fab fa-instagram"></i><span>Instagram</span>
                        </a>
                    </div>
                </div>
            </div>
            <div class="footer-bottom">
                <p>${f.legal}</p>
                <p>${f.copyright} | <a href="https://www.iubenda.com/privacy-policy/96232937">${f.privacy}</a> | <a href="https://www.iubenda.com/privacy-policy/96232937/cookie-policy">${f.cookies}</a></p>
            </div>
        </div>
    </section>`;
    }

    injectLinkedInInsightTag();
    injectMetricoolTracker();

    const footerPlaceholder = document.getElementById('footer-placeholder');
    if (!footerPlaceholder) return;

    const ui = window.__I18N__?.ui;
    if (ui) {
        footerPlaceholder.innerHTML = renderFooterHtml(ui, getPathPrefix());
        return;
    }

    const isInBlogPost = window.location.pathname.includes('blog-posts/');
    const isInSolutions = window.location.pathname.includes('solutions/');
    const isInTechnology = window.location.pathname.includes('technology/');
    let footerPath;

    if (isInBlogPost || isInSolutions || isInTechnology) {
        footerPath = '../components/footer.html';
    } else {
        footerPath = 'components/footer.html';
    }

    fetch(footerPath)
        .then(response => response.text())
        .then(html => {
            if (isInBlogPost || isInSolutions || isInTechnology) {
                html = html.replace(/href="([^"]*\.html)"/g, 'href="../$1"');
            }
            footerPlaceholder.innerHTML = html;
        })
        .catch(error => {
            console.error('Error loading footer:', error);
        });
});
