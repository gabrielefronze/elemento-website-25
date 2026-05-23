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
        const path = window.location.pathname;
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
        const path = window.location.pathname.replace(/\/+$/, '') || '/';
        let p = path;
        if (p.startsWith('/it/')) p = p.slice(3) || '/';
        else if (p === '/it') return 'index';
        else if (p.startsWith('/fr/')) p = p.slice(3) || '/';
        else if (p === '/fr') return 'index';
        if (p === '/' || p === '/index.html') return 'index';
        const m = p.match(/^\/(.+?)\.html$/);
        return m ? m[1] : 'index';
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
        if (locale !== 'en') {
            return filename === 'index.html' ? `/${locale}/index.html` : `/${locale}/${filename}`;
        }
        return filename === 'index.html' ? '/' : `/${filename}`;
    }

    renderLanguageSwitcher() {
        const locale = this.getLocale();
        const stem = this.getPageStem();
        const enHref = window.ElementoI18n?.localeStemHref
            ? window.ElementoI18n.localeStemHref(stem, 'en')
            : stem === 'index'
              ? '/'
              : `/${stem}.html`;
        const itHref = window.ElementoI18n?.localeStemHref
            ? window.ElementoI18n.localeStemHref(stem, 'it')
            : stem === 'index'
              ? '/it/index.html'
              : `/it/${stem}.html`;
        const frHref = window.ElementoI18n?.localeStemHref
            ? window.ElementoI18n.localeStemHref(stem, 'fr')
            : stem === 'index'
              ? '/fr/index.html'
              : `/fr/${stem}.html`;
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

    // Add method to check if current page is a product page
    isProductPage() {
        const productPages = ['atomos.html', 'electros.html', 'atomosphere.html', /* 'orbital.html', */ 'products.html'];
        return productPages.includes(this.currentPage);
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

    // Home top announcement banner (e.g. Keynote) — remove `return ''` and uncomment block to restore
    renderBanner() {
        if (!this.isHomePage()) {
            return '';
        }
        /*
        return `
            <a href="https://youtube.com/live/urhPkWeF3Yg" class="announcement-banner" aria-label="Keynote 2025 YouTube recording" target="_blank" rel="noopener noreferrer">
                <div class="banner-content">
                    <span class="banner-text">Recover our Keynote 2025!</span>
                    <span class="banner-cta">click here to watch the recording</span>
                </div>
            </a>
        `;
        */
        return '';
    }

    render() {
        const basePath = window.ElementoI18n?.getAssetBase
            ? window.ElementoI18n.getAssetBase()
            : this.getPathPrefix();
        const bannerHtml = this.renderBanner();
        const indexHref = this.getLocalizedHref('index.html');
        const langSwitcher = this.renderLanguageSwitcher();

        return `
            ${bannerHtml}
            <nav class="navbar ${bannerHtml ? 'has-banner' : ''}">
                <div class="nav-container">
                    <a href="${indexHref}" class="logo" aria-label="${this.t('nav.homeAria', 'Elemento home')}">
                        <span class="logo-lockup" aria-hidden="true"></span>
                    </a>
                    
                    <ul class="nav-menu">
                        <li class="dropdown">
                            <a href="${this.getLocalizedHref('products.html')}" class="nav-link ${this.getActiveClass('products.html')}">${this.t('nav.products', 'Products')} <span class="dropdown-arrow">▼</span></a>
                            <!-- Mobile dropdown menu integrated into nav-menu -->
                            <div class="dropdown-menu mobile-dropdown">
                                <ul>
                                    <li><a href="${this.getLocalizedHref('atomos.html')}" class="dropdown-link ${this.getActiveClass('atomos.html')}">
                                        <img src="${basePath}assets/logos/Atomos.svg" alt="AtomOS icon" class="product-icon" width="20" height="20">
                                        <span class="">AtomOS</span>
                                    </a></li>
                                    <li><a href="${this.getLocalizedHref('electros.html')}" class="dropdown-link ${this.getActiveClass('electros.html')}">
                                        <img src="${basePath}assets/logos/Electros.svg" alt="Electros icon" class="product-icon" width="20" height="20">
                                        <span class="">Electros</span>
                                    </a></li>
                                    <li><a href="${this.getLocalizedHref('atomosphere.html')}" class="dropdown-link ${this.getActiveClass('atomosphere.html')}">
                                        <img src="${basePath}assets/logos/Atomosphere.svg" alt="Atomosphere icon" class="product-icon" width="20" height="20">
                                        <span class="">Atomosphere</span>
                                    </a></li>
                                </ul>
                            </div>
                        </li>
                        <li><a href="${this.getLocalizedHref('technology.html')}" class="nav-link ${this.getActiveClass('technology.html')}">${this.t('nav.technology', 'Technology')}</a></li>
                        <li><a href="${this.getLocalizedHref('about.html')}" class="nav-link ${this.getActiveClass('about.html')}">${this.t('nav.about', 'About')}</a></li>
                        <li><a href="${this.getLocalizedHref('contact.html')}" class="nav-link ${this.getActiveClass('contact.html')}">${this.t('nav.contact', 'Contact')}</a></li>
                        <li><a href="${this.getLocalizedHref('blog.html')}" class="nav-link ${this.getActiveClass('blog.html')}">${this.t('nav.blog', 'Blog')}</a></li>
                        <li class="nav-cta-group">
                            <a href="${this.getLocalizedHref('signup.html')}" class="nav-link nav-cta-link">${this.t('nav.signup', 'Signup')}</a>
                            <a href="https://book.elemento.cloud/" class="nav-link nav-cta-link nav-cta-link--book" target="_blank" rel="noopener noreferrer">${this.t('nav.bookCall', 'Book a Call')}</a>
                        </li>
                    </ul>

                    <!-- Desktop dropdown menu (separate from mobile) -->
                    <div class="dropdown-menu desktop-dropdown">
                        <div class="container">
                            <ul>
                                <li><a href="${this.getLocalizedHref('atomos.html')}" class="dropdown-link ${this.getActiveClass('atomos.html')}">
                                    <img src="${basePath}assets/logos/Atomos.svg" alt="Atomos icon" class="product-icon" width="20" height="20">
                                    <span class="">AtomOS</span>
                                </a></li>
                                <li><a href="${this.getLocalizedHref('electros.html')}" class="dropdown-link ${this.getActiveClass('electros.html')}">
                                    <img src="${basePath}assets/logos/Electros.svg" alt="Electros icon" class="product-icon" width="20" height="20">
                                    <span class="">Electros</span>
                                </a></li>
                                <li><a href="${this.getLocalizedHref('atomosphere.html')}" class="dropdown-link ${this.getActiveClass('atomosphere.html')}">
                                    <img src="${basePath}assets/logos/Atomosphere.svg" alt="Atomosphere icon" class="product-icon" width="20" height="20">
                                    <span class="">Atomosphere</span>
                                </a></li>
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

        // Show dropdown menu if on a product page
        this.showProductDropdown();
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

    // Add method to show dropdown menu on product pages
    showProductDropdown() {
        if (this.isProductPage()) {
            const desktopDropdownMenu = document.querySelector('.desktop-dropdown');
            
            if (desktopDropdownMenu) {
                desktopDropdownMenu.classList.add('show');
            }
            // Mobile dropdown is always visible when mobile menu is active
        }
    }

    initDropdowns() {
        const dropdowns = document.querySelectorAll('.dropdown');
        const desktopDropdownMenu = document.querySelector('.desktop-dropdown'); // Desktop dropdown
        const mobileDropdownMenu = document.querySelector('.mobile-dropdown'); // Mobile dropdown
        
        // Add timeout variables for delay functionality
        let hideTimeout;
        let showTimeout;
        
        dropdowns.forEach(dropdown => {
            const dropdownLink = dropdown.querySelector('.nav-link');
            
            if (dropdownLink) {
                // Desktop hover functionality with delay
                dropdown.addEventListener('mouseenter', () => {
                    if (window.innerWidth > 768 && desktopDropdownMenu) {
                        // Clear any existing hide timeout
                        clearTimeout(hideTimeout);
                        
                        // Show dropdown immediately on enter
                        desktopDropdownMenu.classList.add('show');
                    }
                });
                
                dropdown.addEventListener('mouseleave', () => {
                    if (window.innerWidth > 768 && !this.isProductPage() && desktopDropdownMenu) {
                        // Set a delay before hiding the dropdown
                        hideTimeout = setTimeout(() => {
                            desktopDropdownMenu.classList.remove('show');
                        }, 300); // 300ms delay
                    }
                });
                
                // Also add mouseenter/mouseleave to the dropdown menu itself
                if (desktopDropdownMenu) {
                    desktopDropdownMenu.addEventListener('mouseenter', () => {
                        if (window.innerWidth > 768) {
                            // Clear any existing hide timeout when hovering over the menu
                            clearTimeout(hideTimeout);
                        }
                    });
                    
                    desktopDropdownMenu.addEventListener('mouseleave', () => {
                        if (window.innerWidth > 768 && !this.isProductPage()) {
                            // Set a delay before hiding the dropdown
                            hideTimeout = setTimeout(() => {
                                desktopDropdownMenu.classList.remove('show');
                            }, 300); // 300ms delay
                        }
                    });
                }
                
                // Mobile/tablet click functionality - Products link is always clickable
                dropdownLink.addEventListener('click', (e) => {
                    if (window.innerWidth <= 768) {
                        // Allow normal navigation to products page
                        // The dropdown is always visible in mobile menu
                    }
                });
                

            }
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
    new Navbar();
});

// Export for manual initialization if needed
window.Navbar = Navbar; 