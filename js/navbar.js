// Navbar Component
class Navbar {
    constructor() {
        this.currentPage = this.getCurrentPage();
        this.init();
    }

    // Add logging utility
    log(message, data = null) {
        const timestamp = new Date().toISOString();
        const logMessage = `[Navbar ${timestamp}] ${message}`;
        console.log(logMessage, data || '');
    }

    getLocale() {
        if (window.__I18N__?.locale) return window.__I18N__.locale;
        if (window.ElementoI18n?.getPageLocale) return window.ElementoI18n.getPageLocale();
        const path = window.ElementoI18n?.stripSiteBase
            ? window.ElementoI18n.stripSiteBase(window.location.pathname)
            : window.location.pathname;
        if (path.startsWith('/it/') || path === '/it') return 'it';
        if (path.startsWith('/fr/') || path === '/fr') return 'fr';
        const htmlLang = document.documentElement.lang;
        if (htmlLang === 'it' || htmlLang === 'fr') return htmlLang;
        return 'en';
    }

    getUi() {
        return window.__I18N__?.ui || null;
    }

    t(key, fallback) {
        const ui = this.getUi();
        if (!ui) return fallback;
        const parts = key.split('.');
        let cur = ui;
        for (const p of parts) {
            if (cur && typeof cur === 'object' && p in cur) cur = cur[p];
            else return fallback;
        }
        return typeof cur === 'string' ? cur : fallback;
    }

    getCurrentPage() {
        const path = window.location.pathname;
        let filename = path.split('/').pop() || 'index.html';
        if (filename === 'it' || !filename.endsWith('.html')) {
            const parts = path.split('/').filter(Boolean);
            if (parts[0] === 'it') {
                filename = parts.length > 1 ? parts[parts.length - 1] : 'index.html';
                if (!filename.endsWith('.html')) filename = 'index.html';
            }
        }
        return filename;
    }

    getPageStem() {
        if (window.__I18N__?.stem) return window.__I18N__.stem;
        const path = (window.ElementoI18n?.stripSiteBase
            ? window.ElementoI18n.stripSiteBase(window.location.pathname)
            : window.location.pathname
        ).replace(/\/+$/, '') || '/';
        let p = path;
        if (p.startsWith('/it/')) p = p.slice(3) || '/';
        else if (p === '/it') return 'index';
        else if (p.startsWith('/fr/')) p = p.slice(3) || '/';
        else if (p === '/fr') return 'index';
        if (p === '/' || p === '/index.html') return 'index';
        const htmlMatch = p.match(/^\/(.+?)\.html$/);
        if (htmlMatch) return htmlMatch[1];
        const bareMatch = p.match(/^\/([^/]+)$/);
        if (bareMatch) return bareMatch[1];
        const nested = p.match(/^\/(.+)$/);
        return nested ? nested[1] : 'index';
    }

    getPathPrefix() {
        const parts = window.location.pathname.split('/').filter(Boolean);
        if (parts.length && parts[parts.length - 1].endsWith('.html')) {
            parts.pop();
        }
        return parts.length ? '../'.repeat(parts.length) : './';
    }

    getLocalizedHref(filename) {
        if (window.ElementoI18n?.pageHref) {
            return window.ElementoI18n.pageHref(filename, this.getLocale());
        }
        const locale = this.getLocale();
        const siteBase = window.ElementoI18n?.getSiteBase ? window.ElementoI18n.getSiteBase() : '';
        if (locale !== 'en') {
            const path = filename === 'index.html' ? `/${locale}/index.html` : `/${locale}/${filename}`;
            return `${siteBase}${path}`;
        }
        const path = filename === 'index.html' ? '/' : `/${filename}`;
        return siteBase ? `${siteBase}${path === '/' ? '/' : path}` : path;
    }

    renderLanguageSwitcher() {
        const locale = this.getLocale();
        const stem = this.getPageStem();
        const enHref = window.ElementoI18n?.localeStemHref
            ? window.ElementoI18n.localeStemHref(stem, 'en')
            : (() => {
                const siteBase = window.ElementoI18n?.getSiteBase ? window.ElementoI18n.getSiteBase() : '';
                const path = stem === 'index' ? '/' : `/${stem}.html`;
                return siteBase ? `${siteBase}${path === '/' ? '/' : path}` : path;
            })();
        const itHref = window.ElementoI18n?.localeStemHref
            ? window.ElementoI18n.localeStemHref(stem, 'it')
            : (() => {
                const siteBase = window.ElementoI18n?.getSiteBase ? window.ElementoI18n.getSiteBase() : '';
                const path = stem === 'index' ? '/it/index.html' : `/it/${stem}.html`;
                return `${siteBase}${path}`;
            })();
        const frHref = window.ElementoI18n?.localeStemHref
            ? window.ElementoI18n.localeStemHref(stem, 'fr')
            : (() => {
                const siteBase = window.ElementoI18n?.getSiteBase ? window.ElementoI18n.getSiteBase() : '';
                const path = stem === 'index' ? '/fr/index.html' : `/fr/${stem}.html`;
                return `${siteBase}${path}`;
            })();
        const label = this.t('langSwitcher.label', 'Language');
        const flagUrl = (code) =>
            window.ElementoI18n?.assetUrl
                ? window.ElementoI18n.assetUrl(`assets/flags/${code}.svg`)
                : `/assets/flags/${code}.svg`;

        const locales = [
            {
                code: 'en',
                href: enHref,
                flag: 'gb',
                label: this.t('langSwitcher.enAria', 'English'),
                short: this.t('langSwitcher.en', 'EN'),
            },
            {
                code: 'it',
                href: itHref,
                flag: 'it',
                label: this.t('langSwitcher.itAria', 'Italian'),
                short: this.t('langSwitcher.it', 'IT'),
            },
            {
                code: 'fr',
                href: frHref,
                flag: 'fr',
                label: this.t('langSwitcher.frAria', 'French'),
                short: this.t('langSwitcher.fr', 'FR'),
            },
        ];
        const current = locales.find((l) => l.code === locale) || locales[0];

        const menuItems = locales
            .map(
                (l) => `
            <li role="presentation">
                <a
                    href="${l.href}"
                    class="lang-switcher__option${locale === l.code ? ' lang-switcher__option--active' : ''}"
                    role="option"
                    aria-selected="${locale === l.code ? 'true' : 'false'}"
                    hreflang="${l.code}"
                    lang="${l.code}"
                    title="${l.label}"
                >
                    <img class="lang-switcher__flag" src="${flagUrl(l.flag)}" alt="" width="22" height="22" loading="lazy" decoding="async" />
                    <span class="lang-switcher__option-label">${l.label}</span>
                    <span class="lang-switcher__option-code">${l.short}</span>
                </a>
            </li>`
            )
            .join('');

        return `
            <div class="lang-switcher" data-lang-switcher>
                <button
                    type="button"
                    class="lang-switcher__trigger"
                    aria-haspopup="listbox"
                    aria-expanded="false"
                    aria-label="${label}"
                >
                    <span class="lang-switcher__trigger-inner">
                        <img class="lang-switcher__flag" src="${flagUrl(current.flag)}" alt="" width="20" height="20" loading="eager" decoding="async" />
                        <span class="lang-switcher__current">${current.short}</span>
                    </span>
                    <svg class="lang-switcher__chevron" width="12" height="12" viewBox="0 0 12 12" aria-hidden="true" focusable="false">
                        <path fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" d="M2.2 4.2 6 8 9.8 4.2"/>
                    </svg>
                </button>
                <ul class="lang-switcher__menu" role="listbox" aria-label="${label}" hidden>
                    ${menuItems}
                </ul>
            </div>`;
    }

    // Platform pages (Metacloud product hierarchy)
    isPlatformPage() {
        const platformStems = ['platform', 'electros', 'c4-protocol', 'atomosphere', 'atomosquare', 'atomos', 'products', 'technology'];
        return platformStems.includes(this.getPageStem());
    }

    isSolutionsPage() {
        const stem = this.getPageStem();
        return stem.startsWith('solutions/') || stem === 'solutions';
    }

    isPricingPage() {
        return this.getPageStem() === 'pricing' || this.getPageStem() === 'deployment';
    }

    isCompanyPage() {
        const companyStems = ['about', 'contact', 'careers'];
        return companyStems.includes(this.getPageStem());
    }

    isResourcesPage() {
        const resourceStems = ['blog', 'videos', 'resources', 'brand-guidelines'];
        const resourcePages = ['blog.html', 'videos.html', 'resources.html'];
        return resourceStems.includes(this.getPageStem()) || resourcePages.includes(this.currentPage);
    }

    getActiveClassByStem(stem) {
        return this.getPageStem() === stem ? 'active' : '';
    }

    getSectionNavActiveClass(section) {
        if (section === 'platform' && this.isPlatformPage()) return 'active';
        if (section === 'solutions' && this.isSolutionsPage()) return 'active';
        if (section === 'pricing' && this.isPricingPage()) return 'active';
        if (section === 'resources' && this.isResourcesPage()) return 'active';
        if (section === 'company' && this.isCompanyPage()) return 'active';
        return '';
    }

  renderPlatformDropdownItem(item, basePath) {
        const iconHtml = item.icon
            ? `<img src="${basePath}assets/logos/${item.icon}" alt="" class="dropdown-product-icon" width="20" height="20">`
            : '';
        const featuredClass = item.featured ? ' dropdown-link--featured' : '';
        const nestedClass = item.nested ? ' dropdown-platform-nested' : '';
        const sublabelHtml = item.sublabel
            ? `<span class="dropdown-link-sublabel">${item.sublabel}</span>`
            : '';
        const labelInner = item.sublabel
            ? `<span class="dropdown-link-label"><span class="dropdown-link-title">${item.label}</span>${sublabelHtml}</span>`
            : `<span>${item.label}</span>`;
        return `<li class="${item.liClass || ''}${nestedClass}"><a href="${this.getLocalizedHref(item.file)}" class="dropdown-link${featuredClass} ${this.getActiveClassByStem(item.stem)}">${iconHtml}${labelInner}</a></li>`;
    }

    renderPlatformDropdownLinks(basePath) {
        const c4Sublabel = this.t('nav.c4Sublabel', 'Open interoperability protocol');
        const atomosSublabel = this.t('nav.atomosSublabel', 'Native hypervisor endpoint');
        const items = [
            { stem: 'platform', file: 'platform.html', label: this.t('nav.platformOverview', 'Overview'), icon: null },
            {
                stem: 'electros',
                file: 'electros.html',
                label: 'Electros',
                icon: 'Electros.svg',
                featured: true,
            },
            { stem: 'c4-protocol', file: 'c4-protocol.html', label: 'C4 Protocol', icon: null, sublabel: c4Sublabel },
            { stem: 'atomosphere', file: 'atomosphere.html', label: 'Atomosphere', icon: 'Atomosphere.svg' },
            { stem: 'atomosquare', file: 'atomosquare.html', label: 'Atomosquare', icon: 'Atomosquare.svg' },
            {
                stem: 'atomos',
                file: 'atomos.html',
                label: 'AtomOS',
                icon: 'Atomos.svg',
                sublabel: atomosSublabel,
                nested: true,
            },
        ];
        return items.map((item) => this.renderPlatformDropdownItem(item, basePath)).join('');
    }

    renderNavCta(id, extraClass) {
        const navLabelKeys = {
            tryElectros: 'nav.tryElectros',
            getAtomos: 'nav.getAtomos',
            bookMetacloudAssessment: 'nav.bookAssessment',
        };
        const cta = window.ElementoCTAs?.getCta(id, this.getLocale());
        if (!cta) {
            return '';
        }
        const label = navLabelKeys[id]
            ? this.t(navLabelKeys[id], cta.label)
            : cta.label;
        const ext = cta.external ? ' target="_blank" rel="noopener noreferrer"' : '';
        return `<a href="${cta.href}" class="nav-link nav-cta-link ${extraClass}" data-cta-id="${id}"${ext}>${label}</a>`;
    }

    renderSolutionsDropdownLinks() {
        const items = [
            { slug: 'solutions/vmware-exit.html', stem: 'solutions/vmware-exit', label: this.t('nav.solVmwareExit', 'VMware Exit') },
            { slug: 'solutions/sovereign-cloud-governance.html', stem: 'solutions/sovereign-cloud-governance', label: this.t('nav.solSovereign', 'Sovereign Governance') },
            { slug: 'solutions/hybrid-multi-cloud.html', stem: 'solutions/hybrid-multi-cloud', label: this.t('nav.solHybrid', 'Hybrid & Multi-Cloud') },
            { slug: 'solutions/ai-gpu-infrastructure.html', stem: 'solutions/ai-gpu-infrastructure', label: this.t('nav.solAiGpu', 'AI / GPU') },
            { slug: 'solutions/service-providers.html', stem: 'solutions/service-providers', label: this.t('nav.solProviders', 'Service Providers') },
            { slug: 'solutions/cross-provider-dr.html', stem: 'solutions/cross-provider-dr', label: this.t('nav.solDr', 'Cross-Provider DR') },
            { slug: 'solutions/data-repatriation.html', stem: 'solutions/data-repatriation', label: this.t('nav.solRepatriation', 'Data Repatriation') },
            { slug: 'solutions/index.html', stem: 'solutions', label: this.t('nav.allSolutions', 'All Solutions') },
        ];
        return items.map((item) =>
            `<li><a href="${this.getLocalizedHref(item.slug)}" class="dropdown-link ${this.getActiveClassByStem(item.stem)}">${item.label}</a></li>`
        ).join('');
    }

    getBasePath() {
        const path = window.location.pathname;
        const locale = this.getLocale();
        let pathParts = path.split('/').filter(part => part !== '');
        const inIt = pathParts[0] === 'it';
        if (inIt) {
            pathParts = pathParts.slice(1);
        }
        if (pathParts.length === 0) {
            return inIt ? '../' : './';
        }
        const last = pathParts[pathParts.length - 1];
        const hasHtmlFile = last.endsWith('.html');
        let directoryDepth = hasHtmlFile ? pathParts.length - 1 : pathParts.length;
        if (inIt) {
            directoryDepth += 1;
        }
        if (directoryDepth <= 0) {
            return './';
        }
        return '../'.repeat(directoryDepth);
    }

    getActiveClass(page) {
        if (page === 'index.html') {
            return this.isHomePage() ? 'active' : '';
        }
        return this.currentPage === page ? 'active' : '';
    }

    // True only for site root, not for nested routes that use index.html (e.g. /thank-you/.../)
    isHomePage() {
        const raw = window.location.pathname.replace(/\/+$/, '');
        const path = raw === '' ? '/' : raw;
        const parts = path.split('/').filter(Boolean);
        if (parts.length === 0) {
            return true;
        }
        if (parts.length === 1 && parts[0] === 'index.html') {
            return true;
        }
        return false;
    }

    getBannerVariant() {
        if (window.ElementoBanner?.resolveVariant) {
            return window.ElementoBanner.resolveVariant();
        }
        return {
            i18nTextKey: 'banner.defaultText',
            i18nCtaKey: 'banner.defaultCta',
            i18nAriaKey: 'banner.defaultAria',
            ctaId: 'exploreAtomos',
            href: 'atomos.html',
            cssClass: 'announcement-banner--campaign-default',
        };
    }

    getBannerStrings(variant) {
        const locale = this.getLocale();
        const fallbacks = {
            default: {
                en: {
                    text: 'New: AtomOS is moving to BSL, free to use, Apache 2.0 after 3 years.',
                    cta: 'Explore AtomOS',
                    aria: 'New: AtomOS is moving to BSL, free to use, Apache 2.0 after 3 years. Explore AtomOS.',
                },
                it: {
                    text: 'Novità: AtomOS passa a BSL, gratuito, Apache 2.0 dopo 3 anni.',
                    cta: 'Scopri AtomOS',
                    aria: 'Novità: AtomOS passa a BSL, gratuito, Apache 2.0 dopo 3 anni. Scopri AtomOS.',
                },
                fr: {
                    text: 'Nouveau : AtomOS passe en BSL, gratuit, Apache 2.0 après 3 ans.',
                    cta: 'Découvrir AtomOS',
                    aria: 'Nouveau : AtomOS passe en BSL, gratuit, Apache 2.0 après 3 ans. Découvrir AtomOS.',
                },
            },
            enterprise: {
                en: {
                    text: 'Planning a VMware exit? Govern VMware and AtomOS side by side.',
                    cta: 'Run VMware Exit Assessment',
                    aria: 'Planning a VMware exit? Govern VMware and AtomOS side by side. Run VMware Exit Assessment.',
                },
                it: {
                    text: 'Stai pianificando un exit da VMware? Gestisci VMware e AtomOS insieme.',
                    cta: 'Valutazione exit VMware',
                    aria: 'Stai pianificando un exit da VMware? Gestisci VMware e AtomOS insieme.',
                },
                fr: {
                    text: 'Vous préparez une sortie VMware ? Gouvernez VMware et AtomOS ensemble.',
                    cta: 'Évaluation sortie VMware',
                    aria: 'Vous préparez une sortie VMware ? Gouvernez VMware et AtomOS ensemble.',
                },
            },
        };
        const kind = variant.id === 'enterprise' ? 'enterprise' : 'default';
        const fb = (fallbacks[kind][locale] || fallbacks[kind].en);
        return {
            text: this.t(variant.i18nTextKey, fb.text),
            cta: this.t(variant.i18nCtaKey, fb.cta),
            aria: this.t(variant.i18nAriaKey, fb.aria),
        };
    }

    // Site-wide top announcement banner. Config: js/banners/config.js
    renderBanner() {
        const variant = this.getBannerVariant();
        const { text, cta, aria } = this.getBannerStrings(variant);
        const ctaData = window.ElementoCTAs?.getCta(variant.ctaId, this.getLocale());
        const href = ctaData?.href || this.getLocalizedHref(variant.href);
        const ext = ctaData?.external ? ' target="_blank" rel="noopener noreferrer"' : '';
        return `
            <a href="${href}" class="announcement-banner ${variant.cssClass}" aria-label="${aria}" data-cta-id="${variant.ctaId}"${ext}>
                <div class="banner-content">
                    <span class="banner-text">${text}</span>
                    <span class="banner-cta">${cta} →</span>
                </div>
            </a>
        `;
    }

    render() {
        const basePath = window.ElementoI18n?.getAssetBase
            ? window.ElementoI18n.getAssetBase()
            : this.getPathPrefix();
        const bannerHtml = this.renderBanner();
        const indexHref = this.getLocalizedHref('index.html');
        const langSwitcher = this.renderLanguageSwitcher();

        const hasBanner = Boolean(bannerHtml && bannerHtml.trim());
        const siteHeaderClass = hasBanner ? 'site-header site-header--has-banner' : 'site-header';

        return `
            <header class="${siteHeaderClass}" id="site-header">
            ${bannerHtml}
            <nav class="navbar ${hasBanner ? 'has-banner' : ''}">
                <div class="nav-container">
                    <a href="${indexHref}" class="logo" aria-label="${this.t('nav.homeAria', 'Elemento home')}">
                        <span class="logo-lockup" aria-hidden="true"></span>
                    </a>
                    
                    <ul class="nav-menu">
                        <li class="dropdown" data-nav-dropdown="platform">
                            <a href="${this.getLocalizedHref('platform.html')}" class="nav-link ${this.getSectionNavActiveClass('platform')}">${this.t('nav.platform', 'Platform')} <span class="dropdown-arrow">▼</span></a>
                            <div class="dropdown-menu mobile-dropdown">
                                <ul>
                                    ${this.renderPlatformDropdownLinks(basePath)}
                                </ul>
                            </div>
                        </li>
                        <li class="dropdown" data-nav-dropdown="solutions">
                            <a href="${this.getLocalizedHref('solutions/index.html')}" class="nav-link ${this.getSectionNavActiveClass('solutions')}">${this.t('nav.solutions', 'Solutions')} <span class="dropdown-arrow">▼</span></a>
                            <div class="dropdown-menu mobile-dropdown">
                                <ul>
                                    ${this.renderSolutionsDropdownLinks()}
                                </ul>
                            </div>
                        </li>
                        <li><a href="${this.getLocalizedHref('pricing.html')}" class="nav-link ${this.getSectionNavActiveClass('pricing')}">${this.t('nav.pricing', 'Pricing')}</a></li>
                        <li class="dropdown" data-nav-dropdown="resources">
                            <a href="${this.getLocalizedHref('blog.html')}" class="nav-link ${this.getSectionNavActiveClass('resources')}">${this.t('nav.resources', 'Resources')} <span class="dropdown-arrow">▼</span></a>
                            <div class="dropdown-menu mobile-dropdown">
                                <ul>
                                    <li><a href="${this.getLocalizedHref('blog.html')}" class="dropdown-link ${this.getActiveClassByStem('blog')}">${this.t('nav.blog', 'Blog')}</a></li>
                                    <li><a href="${this.getLocalizedHref('videos.html')}" class="dropdown-link ${this.getActiveClassByStem('videos')}">${this.t('nav.videos', 'Videos')}</a></li>
                                    <li><a href="${this.getLocalizedHref('resources.html')}" class="dropdown-link ${this.getActiveClassByStem('resources')}">${this.t('nav.productBriefs', 'Product Briefs')}</a></li>
                                    <li><a href="https://bookstack.elemento.cloud" class="dropdown-link" target="_blank" rel="noopener noreferrer">${this.t('nav.documentation', 'Documentation')}</a></li>
                                </ul>
                            </div>
                        </li>
                        <li class="dropdown" data-nav-dropdown="company">
                            <a href="${this.getLocalizedHref('about.html')}" class="nav-link ${this.getSectionNavActiveClass('company')}">${this.t('nav.company', 'Company')} <span class="dropdown-arrow">▼</span></a>
                            <div class="dropdown-menu mobile-dropdown">
                                <ul>
                                    <li><a href="${this.getLocalizedHref('about.html')}" class="dropdown-link ${this.getActiveClassByStem('about')}">${this.t('nav.about', 'About')}</a></li>
                                    <li><a href="${this.getLocalizedHref('about.html')}#team" class="dropdown-link">${this.t('nav.team', 'Team')}</a></li>
                                    <li><a href="${this.getLocalizedHref('contact.html')}" class="dropdown-link ${this.getActiveClassByStem('contact')}">${this.t('nav.contact', 'Contact')}</a></li>
                                </ul>
                            </div>
                        </li>
                        <li class="nav-cta-group nav-cta-group--mobile">
                            ${this.renderNavCta('tryElectros', 'nav-cta-link--electros')}
                            ${this.renderNavCta('getAtomos', 'nav-cta-link--atomos')}
                            ${this.renderNavCta('bookMetacloudAssessment', 'nav-cta-link--book')}
                        </li>
                    </ul>

                    <div class="nav-cta">
                        ${this.renderNavCta('tryElectros', 'nav-cta-link--electros')}
                        ${this.renderNavCta('getAtomos', 'nav-cta-link--atomos')}
                        ${this.renderNavCta('bookMetacloudAssessment', 'nav-cta-link--book')}
                    </div>

                    <div class="dropdown-menu desktop-dropdown" data-nav-dropdown-panel="platform">
                        <div class="container">
                            <ul>
                                ${this.renderPlatformDropdownLinks(basePath)}
                            </ul>
                        </div>
                    </div>
                    <div class="dropdown-menu desktop-dropdown dropdown-menu--solutions" data-nav-dropdown-panel="solutions">
                        <div class="container">
                            <ul class="dropdown-solutions-grid">
                                ${this.renderSolutionsDropdownLinks()}
                            </ul>
                        </div>
                    </div>
                    <div class="dropdown-menu desktop-dropdown" data-nav-dropdown-panel="resources">
                        <div class="container">
                            <ul>
                                <li><a href="${this.getLocalizedHref('blog.html')}" class="dropdown-link ${this.getActiveClassByStem('blog')}">${this.t('nav.blog', 'Blog')}</a></li>
                                <li><a href="${this.getLocalizedHref('videos.html')}" class="dropdown-link ${this.getActiveClassByStem('videos')}">${this.t('nav.videos', 'Videos')}</a></li>
                                <li><a href="${this.getLocalizedHref('resources.html')}" class="dropdown-link ${this.getActiveClassByStem('resources')}">${this.t('nav.productBriefs', 'Product Briefs')}</a></li>
                                <li><a href="https://bookstack.elemento.cloud" class="dropdown-link" target="_blank" rel="noopener noreferrer">${this.t('nav.documentation', 'Documentation')}</a></li>
                            </ul>
                        </div>
                    </div>
                    <div class="dropdown-menu desktop-dropdown" data-nav-dropdown-panel="company">
                        <div class="container">
                            <ul>
                                <li><a href="${this.getLocalizedHref('about.html')}" class="dropdown-link ${this.getActiveClassByStem('about')}">${this.t('nav.about', 'About')}</a></li>
                                <li><a href="${this.getLocalizedHref('about.html')}#team" class="dropdown-link">${this.t('nav.team', 'Team')}</a></li>
                                <li><a href="${this.getLocalizedHref('contact.html')}" class="dropdown-link ${this.getActiveClassByStem('contact')}">${this.t('nav.contact', 'Contact')}</a></li>
                            </ul>
                        </div>
                    </div>
                    
                    <div class="nav-controls">
                        ${langSwitcher}
                        <button class="theme-toggle" aria-label="Toggle theme">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z"/>
                            </svg>
                        </button>
                        <button class="mobile-menu-btn" aria-label="Toggle mobile menu">
                            <span></span>
                            <span></span>
                            <span></span>
                        </button>
                    </div>
                </div>
            </nav>
            </header>
        `;
    }

    init() {
        // Find the navbar placeholder or insert after body tag
        const navbarPlaceholder = document.getElementById('navbar-placeholder');
        if (navbarPlaceholder) {
            navbarPlaceholder.innerHTML = this.render();
        } else {
            // Insert navbar at the beginning of body
            const body = document.body;
            const navbarDiv = document.createElement('div');
            navbarDiv.innerHTML = this.render();
            body.insertBefore(navbarDiv.firstElementChild, body.firstChild);
        }

        // Initialize dropdown functionality
        this.initDropdowns();
        // Initialize mobile menu functionality
        this.initMobileMenu();
        // Initialize theme toggle functionality
        this.initThemeToggle();
        this.initLangSwitcher();

        document.body.classList.toggle(
            'site-has-banner',
            Boolean(document.querySelector('.announcement-banner'))
        );
    }

    showSectionDropdowns() {
        /* Dropdowns open on hover only — keeps navbar to a single line */
    }

    initLangSwitcher() {
        if (!window.__langSwitcherListeners) {
            window.__langSwitcherListeners = true;
            document.addEventListener('click', (e) => {
                document.querySelectorAll('.lang-switcher--open').forEach((root) => {
                    if (!root.contains(e.target)) {
                        root.classList.remove('lang-switcher--open');
                        root.querySelector('.lang-switcher__trigger')?.setAttribute('aria-expanded', 'false');
                        const menu = root.querySelector('.lang-switcher__menu');
                        if (menu) menu.hidden = true;
                    }
                });
            });
            document.addEventListener('keydown', (e) => {
                if (e.key !== 'Escape') return;
                document.querySelectorAll('.lang-switcher--open').forEach((root) => {
                    root.classList.remove('lang-switcher--open');
                    root.querySelector('.lang-switcher__trigger')?.setAttribute('aria-expanded', 'false');
                    const menu = root.querySelector('.lang-switcher__menu');
                    if (menu) menu.hidden = true;
                });
            });
        }
        if (window.ElementoLangSwitcher?.initAll) {
            window.ElementoLangSwitcher.initAll();
            return;
        }
        document.querySelectorAll('.lang-switcher').forEach((root) => {
            if (root.dataset.langSwitcherInit === 'true') return;
            const trigger = root.querySelector('.lang-switcher__trigger');
            const menu = root.querySelector('.lang-switcher__menu');
            if (!trigger || !menu) return;
            root.dataset.langSwitcherInit = 'true';
            trigger.addEventListener('click', (e) => {
                e.stopPropagation();
                const open = root.classList.contains('lang-switcher--open');
                document.querySelectorAll('.lang-switcher--open').forEach((el) => {
                    if (el !== root) {
                        el.classList.remove('lang-switcher--open');
                        el.querySelector('.lang-switcher__trigger')?.setAttribute('aria-expanded', 'false');
                        const m = el.querySelector('.lang-switcher__menu');
                        if (m) m.hidden = true;
                    }
                });
                if (open) {
                    root.classList.remove('lang-switcher--open');
                    trigger.setAttribute('aria-expanded', 'false');
                    menu.hidden = true;
                } else {
                    root.classList.add('lang-switcher--open');
                    trigger.setAttribute('aria-expanded', 'true');
                    menu.hidden = false;
                }
            });
        });
    }

    setDropdownFront(panelId) {
        document.querySelectorAll('.desktop-dropdown').forEach((menu) => {
            const id = menu.getAttribute('data-nav-dropdown-panel');
            menu.classList.toggle('is-front', id === panelId && menu.classList.contains('show'));
        });
    }

    restoreDropdownLayers() {
        document.querySelectorAll('.desktop-dropdown.is-front').forEach((menu) => {
            menu.classList.remove('is-front');
        });
        const shown = [...document.querySelectorAll('.desktop-dropdown.show')];
        if (shown.length === 0) return;
        const pinned = shown.find((menu) =>
            this.shouldKeepDropdownOpen(menu.getAttribute('data-nav-dropdown-panel'))
        );
        (pinned || shown[shown.length - 1]).classList.add('is-front');
    }

    shouldKeepDropdownOpen() {
        return false;
    }

    hideAllDesktopDropdowns(exceptPanelId = null) {
        document.querySelectorAll('.desktop-dropdown').forEach((menu) => {
            const panelId = menu.getAttribute('data-nav-dropdown-panel');
            if (exceptPanelId && panelId === exceptPanelId) return;
            if (this.shouldKeepDropdownOpen(panelId)) return;
            menu.classList.remove('show', 'is-front');
        });
    }

    initDropdowns() {
        const dropdowns = document.querySelectorAll('.dropdown[data-nav-dropdown]');
        let hideTimeout;

        dropdowns.forEach((dropdown) => {
            const panelId = dropdown.dataset.navDropdown;
            const desktopDropdownMenu = document.querySelector(
                `[data-nav-dropdown-panel="${panelId}"]`
            );
            const dropdownLink = dropdown.querySelector('.nav-link');

            if (!dropdownLink || !desktopDropdownMenu) return;

            dropdown.addEventListener('mouseenter', () => {
                if (window.innerWidth > 768) {
                    clearTimeout(hideTimeout);
                    this.hideAllDesktopDropdowns(panelId);
                    desktopDropdownMenu.classList.add('show');
                    this.setDropdownFront(panelId);
                }
            });

            dropdown.addEventListener('mouseleave', () => {
                if (window.innerWidth > 768 && !this.shouldKeepDropdownOpen(panelId)) {
                    hideTimeout = setTimeout(() => {
                        desktopDropdownMenu.classList.remove('show', 'is-front');
                        this.restoreDropdownLayers();
                    }, 300);
                }
            });

            desktopDropdownMenu.addEventListener('mouseenter', () => {
                if (window.innerWidth > 768) {
                    clearTimeout(hideTimeout);
                    this.setDropdownFront(panelId);
                }
            });

            desktopDropdownMenu.addEventListener('mouseleave', () => {
                if (window.innerWidth > 768 && !this.shouldKeepDropdownOpen(panelId)) {
                    hideTimeout = setTimeout(() => {
                        desktopDropdownMenu.classList.remove('show', 'is-front');
                        this.restoreDropdownLayers();
                    }, 300);
                }
            });
        });
    }

    initMobileMenu() {
        const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
        const navMenu = document.querySelector('.nav-menu');
        
        if (mobileMenuBtn && navMenu) {
            mobileMenuBtn.addEventListener('click', () => {
                navMenu.classList.toggle('active');
                mobileMenuBtn.classList.toggle('active');
            });

            // Close mobile menu when clicking on any nav link
            const navLinks = document.querySelectorAll('.nav-link');
            navLinks.forEach(link => {
                link.addEventListener('click', () => {
                    navMenu.classList.remove('active');
                    mobileMenuBtn.classList.remove('active');
                    // Close desktop dropdowns only
                    document.querySelectorAll('.desktop-dropdown.show').forEach(menu => {
                        menu.classList.remove('show');
                    });
                });
            });
            

            
            // Handle dropdown links - they should close the mobile menu
            const dropdownLinks = document.querySelectorAll('.dropdown-link');
            dropdownLinks.forEach(link => {
                link.addEventListener('click', () => {
                    navMenu.classList.remove('active');
                    mobileMenuBtn.classList.remove('active');
                    // Close desktop dropdown
                    document.querySelectorAll('.desktop-dropdown.show').forEach(menu => {
                        menu.classList.remove('show');
                    });
                });
            });
        }
    }



    initThemeToggle() {
        const themeToggle = document.querySelector('.theme-toggle');
        
        if (themeToggle) {
            // Use the new theme system instead of the old one
            if (window.ElementoThemes) {
                // Update the theme toggle to use the new system
                themeToggle.addEventListener('click', () => {
                    window.ElementoThemes.toggleTheme();
                });
                
                // Update the icon to match the current theme
                this.updateThemeIcon();
            } else {
                this.log('Warning: ElementoThemes not available, falling back to old theme system');
                // Fallback to old system if new system not available
                const savedTheme = localStorage.getItem('theme') || 'default';
                document.body.className = `theme-${savedTheme}`;
                this.updateThemeIcon(savedTheme);

                themeToggle.addEventListener('click', () => {
                    const currentTheme = document.body.className.replace('theme-', '');
                    const newTheme = currentTheme === 'default' ? 'dark' : 'default';
                    
                    document.body.className = `theme-${newTheme}`;
                    localStorage.setItem('theme', newTheme);
                    this.updateThemeIcon(newTheme);
                });
            }
        }
    }

    updateThemeIcon(theme = null) {
        const themeToggle = document.querySelector('.theme-toggle');
        if (themeToggle) {
            if (window.ElementoThemes) {
                // Use the new theme system
                const currentTheme = window.ElementoThemes.getCurrentTheme();
                const currentIndex = window.ElementoThemes.getCurrentThemeIndex();
                
                // Get the icon from the new theme system
                const icons = [
                    `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z"/>
                    </svg>`,
                    `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" transform="scale(1, -1) rotate(-10)">
                        <path d="M9 2c-1.05 0-2.05.16-3 .46 4.06 1.27 7 5.06 7 9.54 0 4.48-2.94 8.27-7 9.54.95.3 1.95.46 3 .46 5.52 0 10-4.48 10-10S14.52 2 9 2z"/>
                    </svg>`,
                    `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-3.31 0-6 2.69-6 6s2.69 6 6 6V6z"/>
                    </svg>`
                ];
                
                themeToggle.innerHTML = icons[currentIndex] || icons[0];
                themeToggle.title = `Current theme: ${window.ElementoThemes.getCurrentThemeName()}`;
            } else {
                // Fallback to old system
                const icons = {
                    'light': `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z"/>
                    </svg>`,
                    'dark': `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" transform="scale(-1, -1) rotate(-10)">
                        <path d="M9 2c-1.05 0-2.05.16-3 .46 4.06 1.27 7 5.06 7 9.54 0 4.48-2.94 8.27-7 9.54.95.3 1.95.46 3 .46 5.52 0 10-4.48 10-10S14.52 2 9 2z"/>
                    </svg>`
                };
                themeToggle.innerHTML = icons[theme] || icons['light'];
            }
        }
    }
}

// Auto-initialize navbar when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (window.self !== window.top) {
        return;
    }
    new Navbar();
});

// Export for manual initialization if needed
window.Navbar = Navbar; 