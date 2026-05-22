/**
 * Elemento Website - Main JavaScript
 * Based on elemento-gui-new styling and functionality
 */

const COOKIE_PREFERENCE_KEY = 'elemento_cookie_preference';
const COOKIE_CONSENT_VERSION = '2026-04-iubenda-db-enforced';

// Helper function to get saved cookie preference
function getCookiePreference() {
    try {
        const saved = localStorage.getItem(COOKIE_PREFERENCE_KEY);
        if (!saved) {
            return null;
        }

        const parsed = JSON.parse(saved);
        if (!parsed || parsed.consentVersion !== COOKIE_CONSENT_VERSION) {
            // Rotate legacy consent so all existing users are prompted again.
            localStorage.removeItem(COOKIE_PREFERENCE_KEY);
            sessionStorage.removeItem(COOKIE_PREFERENCE_KEY);
            return null;
        }

        return parsed;
    } catch (error) {
        console.error('Failed to get cookie preference:', error);
        return null;
    }
}

function getIubendaConsentSyncConfig() {
    const globalConfig = window.elementoIubendaConsentConfig || {};
    const endpoint = globalConfig.endpoint || 'https://consent.iubenda.com/public/consent';
    const apiKey = globalConfig.publicApiKey || 'sxLUEyAyNL0U7vRevCJj7IqOklkcEx0C';
    const legalNotices = Array.isArray(globalConfig.legalNotices) && globalConfig.legalNotices.length > 0
        ? globalConfig.legalNotices
        : [{ identifier: 'privacy_policy' }, { identifier: 'cookie_policy' }];

    return {
        enabled: Boolean(apiKey),
        endpoint,
        apiKey,
        legalNotices,
        subjectEmail: globalConfig.subjectEmail || null,
        subjectIdPrefix: globalConfig.subjectIdPrefix || 'elemento',
        proofForm: globalConfig.proofForm || 'iubenda-banner-click',
        sourcePage: globalConfig.sourcePage || window.location.pathname
    };
}

function getOrCreateIubendaSubjectId(prefix = 'elemento') {
    const storageKey = 'elemento_iubenda_subject_id';
    const existing = localStorage.getItem(storageKey);
    if (existing) {
        return existing;
    }

    const randomPart = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    const subjectId = `${prefix}-${randomPart}`;
    localStorage.setItem(storageKey, subjectId);
    return subjectId;
}

async function sendConsentToIubenda(choice, timestamp = Date.now()) {
    const config = getIubendaConsentSyncConfig();
    if (!config.enabled) {
        return;
    }

    const consentGranted = choice === 'accepted' || choice === 'customized';
    const subject = { id: getOrCreateIubendaSubjectId(config.subjectIdPrefix) };
    if (config.subjectEmail) {
        subject.email = config.subjectEmail;
    }

    const payload = {
        timestamp: new Date(timestamp).toISOString(),
        subject,
        legal_notices: config.legalNotices,
        preferences: {
            cookie_consent: consentGranted,
            cookie_choice: choice
        },
        proofs: [
            {
                content: `Cookie banner action: ${choice}`,
                form: config.proofForm
            }
        ]
    };

    if (config.sourcePage) {
        payload.proofs[0].content += ` on ${config.sourcePage}`;
    }

    try {
        const response = await fetch(config.endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ApiKey: config.apiKey
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Failed to sync consent to iubenda:', response.status, errorText);
        }
    } catch (error) {
        console.error('Error while syncing consent to iubenda:', error);
    }
}

// Add click interception functionality
function setupIubendaClickInterception() {
    console.log('Setting up iubenda click interception');
    
    // Helper function to save cookie preference
    function saveCookiePreference(choice, timestamp = Date.now()) {
        console.log('Saving cookie preference', choice);
        const preference = {
            choice: choice, // 'accepted', 'rejected', or 'customized'
            timestamp: timestamp,
            date: new Date(timestamp).toISOString(),
            consentVersion: COOKIE_CONSENT_VERSION
        };
        
        try {
            localStorage.setItem(COOKIE_PREFERENCE_KEY, JSON.stringify(preference));
            console.log('Cookie preference saved:', preference);
            
            // Also save to sessionStorage for immediate access
            sessionStorage.setItem(COOKIE_PREFERENCE_KEY, JSON.stringify(preference));
            
            // Dispatch custom event for other parts of the app to listen to
            const event = new CustomEvent('cookiePreferenceChanged', { 
                detail: preference 
            });
            document.dispatchEvent(event);
            sendConsentToIubenda(choice, timestamp);
            
        } catch (error) {
            console.error('Failed to save cookie preference:', error);
        }
    }
    
    // Function to intercept clicks on iubenda banner buttons
    function interceptiubendaClicks() {
        // Wait for the iubenda banner to be created
        const checkForBanner = setInterval(() => {
            const iubendaBanner = document.querySelector('#iubenda-cs-banner');
            
            if (iubendaBanner) {
                // More comprehensive selector matching
                const selectors = {
                    acceptBtn: '.iubenda-cs-accept-btn, [data-iubenda-cs-accept], button[data-iubenda-cs-accept]',
                    rejectBtn: '.iubenda-cs-reject-btn, [data-iubenda-cs-reject], button[data-iubenda-cs-reject]',
                    customizeBtn: '.iubenda-cs-customize-btn, [data-iubenda-cs-customize], button[data-iubenda-cs-customize]',
                    privacyLink: '.iubenda-privacy-policy-link, a[href*="privacy"], [data-iubenda-privacy]',
                    cookiePolicyLink: '.iubenda-cs-cookie-policy-lnk, a[href*="cookie"], [data-iubenda-cookie]',
                    vendorListLink: '.iubenda-vendor-list-link, a[href*="vendor"], [data-iubenda-vendor]',
                    advertisingPrefsLink: '.iubenda-advertising-preferences-link, a[href*="advertising"], [data-iubenda-advertising]',
                    privacyChoicesLink: '.iubenda-cs-preferences-link, a[href*="preferences"], [data-iubenda-preferences]'
                };
                
                // Intercept clicks on Accept button
                const acceptBtn = iubendaBanner.querySelector(selectors.acceptBtn);
                if (acceptBtn) {
                    acceptBtn.addEventListener('click', function(e) {
                        saveCookiePreference('accepted');
                    });
                }
                
                // Intercept clicks on Reject button
                const rejectBtn = iubendaBanner.querySelector(selectors.rejectBtn);
                if (rejectBtn) {
                    rejectBtn.addEventListener('click', function(e) {
                        saveCookiePreference('rejected');
                    });
                }
                
                // Intercept clicks on Customize button
                const customizeBtn = iubendaBanner.querySelector(selectors.customizeBtn);
                if (customizeBtn) {
                    customizeBtn.addEventListener('click', function(e) {
                        saveCookiePreference('customized');
                    });
                }
                
                // Intercept clicks on privacy policy link
                const privacyLink = iubendaBanner.querySelector(selectors.privacyLink);
                if (privacyLink) {
                    privacyLink.addEventListener('click', function(e) {
                        // Privacy policy link clicked
                    });
                }
                
                // Intercept clicks on cookie policy link
                const cookiePolicyLink = iubendaBanner.querySelector(selectors.cookiePolicyLink);
                if (cookiePolicyLink) {
                    cookiePolicyLink.addEventListener('click', function(e) {
                        // Cookie policy link clicked
                    });
                }
                
                // Intercept clicks on vendor list link
                const vendorListLink = iubendaBanner.querySelector(selectors.vendorListLink);
                if (vendorListLink) {
                    vendorListLink.addEventListener('click', function(e) {
                        // Vendor list link clicked
                    });
                }
                
                // Intercept clicks on advertising preferences link
                const advertisingPrefsLink = iubendaBanner.querySelector(selectors.advertisingPrefsLink);
                if (advertisingPrefsLink) {
                    advertisingPrefsLink.addEventListener('click', function(e) {
                        // Advertising preferences link clicked
                    });
                }
                
                // Intercept clicks on privacy choices panel link
                const privacyChoicesLink = iubendaBanner.querySelector(selectors.privacyChoicesLink);
                if (privacyChoicesLink) {
                    privacyChoicesLink.addEventListener('click', function(e) {
                        // Privacy choices panel link clicked
                    });
                }
                
                // Also try to intercept any click within the banner as a fallback
                iubendaBanner.addEventListener('click', function(e) {
                    // General click handling if needed
                });
                
                // Clear the interval since we found the banner
                clearInterval(checkForBanner);
            }
        }, 100); // Check every 100ms
        
        // Stop checking after 10 seconds to avoid infinite loop
        setTimeout(() => {
            clearInterval(checkForBanner);
        }, 10000);
    }
    
    // Run the interception function
    interceptiubendaClicks();
    
    // Also run when the DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', interceptiubendaClicks);
    } else {
        interceptiubendaClicks();
    }
    
    // Also run when the page is fully loaded
    window.addEventListener('load', interceptiubendaClicks);
    
    // Monitor for new iubenda banners being added to the DOM
    const bannerObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === 1) { // Element node
                    if (node.id === 'iubenda-cs-banner' || 
                        (node.querySelector && node.querySelector('#iubenda-cs-banner'))) {
                        console.log('New iubenda banner detected');
                        setTimeout(() => interceptiubendaClicks(), 100);
                    }
                }
            });
        });
    });
    
    // Start observing
    bannerObserver.observe(document.body, {
        childList: true,
        subtree: true
    });
    
    // Expose helper functions globally for other scripts to use
    window.elementoCookieUtils = {
        saveCookiePreference,
        getCookiePreference
    };
}

function handleCookiePreference() {
    const cookiePreference = getCookiePreference();
    console.log('cookie preference', cookiePreference);
        
    const checkForBanner = setInterval(() => {
        const iubendaBanner = document.querySelector('#iubenda-cs-banner');
        console.log('iubenda banner', iubendaBanner);

        if (cookiePreference) {
            // Simulate click on the appropriate button based on stored preference
            const selectors = {
                acceptBtn: '.iubenda-cs-accept-btn, [data-iubenda-cs-accept], button[data-iubenda-cs-accept]',
                rejectBtn: '.iubenda-cs-reject-btn, [data-iubenda-cs-reject], button[data-iubenda-cs-reject]',
                customizeBtn: '.iubenda-cs-customize-btn, [data-iubenda-cs-customize], button[data-iubenda-cs-customize]'
            };
            
            let targetButton = null;
            
            try {
                if (cookiePreference.choice === 'accepted' || cookiePreference.choice === 'customized') {
                    targetButton = iubendaBanner.querySelector(selectors.acceptBtn);
                } else if (cookiePreference.choice === 'rejected') {
                    targetButton = iubendaBanner.querySelector(selectors.rejectBtn);
                }
                
                if (targetButton) {
                    // Simulate click on the appropriate button
                    targetButton.click();
                    console.log(`Automatically clicked ${cookiePreference.choice} button based on stored preference`);
                }
            } catch (error) {
                clearInterval(checkForBanner);
                return;
            }
        }
    }, 100); // Check every 100ms

    // Stop checking after 10 seconds to avoid infinite loop
    setTimeout(() => {
        clearInterval(checkForBanner);
    }, 10000);
}

class ElementoWebsite {
    constructor() {
        // this.currentTheme = localStorage.getItem('theme') || 'light';
        this.isScrolled = false;
        // this.backgroundCanvas = null;
        this.init();
    }

    init() {
        // this.setupTheme(); // Removed - theme system now handled by themes.js
        this.setupNavigation();
        // this.setupBackgroundCanvas();
        this.setupScrollEffects();
        this.setupAnimations();
        this.setupForms();
        // Mobile menu is handled by navbar.js
        this.setupKeyboardShortcuts();
        this.setupPerformanceOptimizations();
        this.setupAccessibility();
        this.setupiubendaScripts();
    }

    // setupTheme method removed - now handled by themes.js

    // toggleTheme method removed - now handled by themes.js

    // updateThemeIcon method removed - now handled by themes.js

    setupNavigation() {
        const navbar = document.querySelector('.navbar');
        const navLinks = document.querySelectorAll('.nav-link');

        // Smooth scrolling for anchor links
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                
                // Only prevent default for in-page anchors
                if (href && href.startsWith('#') && href.length > 1) {
                    e.preventDefault();
                    const target = document.querySelector(href);
                    if (target) {
                        target.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });
                    }
                }
            });
        });

        // Navbar scroll effect
        window.addEventListener('scroll', () => {
            const scrolled = window.scrollY > 50;
            if (scrolled !== this.isScrolled) {
                this.isScrolled = scrolled;
                navbar.classList.toggle('scrolled', scrolled);
                

            }
        });

        // Active link highlighting
        this.updateActiveNavLink();
        window.addEventListener('scroll', () => this.updateActiveNavLink());
    }

    updateActiveNavLink() {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-link');
        
        let current = '';
        
        // Batch DOM reads to avoid forced reflows
        const sectionData = Array.from(sections).map(section => ({
            id: section.getAttribute('id'),
            top: section.offsetTop,
            height: section.clientHeight
        }));
        
        sectionData.forEach(section => {
            if (window.scrollY >= section.top - 200) {
                current = section.id;
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    }

    setupScrollEffects() {
        // Background fade effect on scroll
        let lastScrollY = window.scrollY;
        let ticking = false;

        const updateBackgroundOpacity = () => {
            const scrollY = window.scrollY;
            const windowHeight = window.innerHeight;
            const documentHeight = document.documentElement.scrollHeight;
            const scrollProgress = scrollY / (documentHeight - windowHeight);
            
            // Mobile scroll effects for product icon and background blob
            if (window.innerWidth <= 1000) {
                this.updateMobileScrollEffects(scrollY, windowHeight);
            }
            
            ticking = false;
        };

        window.addEventListener('scroll', () => {
            lastScrollY = window.scrollY;
            if (!ticking) {
                requestAnimationFrame(updateBackgroundOpacity);
                ticking = true;
            }
        });

        // Scroll-based animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate');
                }
            });
        }, observerOptions);

        document.querySelectorAll('.scroll-animate').forEach(el => {
            observer.observe(el);
        });
    }

    updateMobileScrollEffects(scrollY, windowHeight) {
        // Get the hero product icon and background blur elements
        const productIcon = document.querySelector('.hero-product-icon');
        const heroBlur = document.querySelector('.hero-blur');
        
        if (!heroBlur) return; // Only require heroBlur to exist
        
        // Calculate fade progress based on scroll position
        // Start fading when scroll reaches 20% of viewport height
        const fadeStart = windowHeight * 0;
        const fadeEnd = windowHeight * 1;
        const scrollProgress = Math.max(0, Math.min(1, (scrollY - fadeStart) / (fadeEnd - fadeStart)));
        
        // Product icon: fade to completely transparent (if it exists)
        if (productIcon) {
            productIcon.style.transform = `translate(-50%, calc(-50% - ${scrollY}px * .9))`;
        }
        
        // Background blob: fade to more subtle (reduce blur and opacity)
        const blurOpacity = Math.max(0.3, 1 - (scrollProgress * 0.7)); // Keep some opacity
        
        heroBlur.style.opacity = blurOpacity;
    }

    setupAnimations() {
        // Fade in animations on page load
        const fadeElements = document.querySelectorAll('.fade-in');
        fadeElements.forEach((el, index) => {
            setTimeout(() => {
                el.classList.add('visible');
            }, index * 100);
        });

        // Card hover effects
        document.querySelectorAll('.card').forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-8px)';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0)';
            });
        });

        // Button hover effects
        document.querySelectorAll('.btn').forEach(btn => {
            btn.addEventListener('mouseenter', () => {
                btn.style.transform = 'translateY(-2px)';
            });
            
            btn.addEventListener('mouseleave', () => {
                btn.style.transform = 'translateY(0)';
            });
        });
    }

    setupForms() {
        const forms = document.querySelectorAll('form');
        
        forms.forEach(form => {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleFormSubmit(form);
            });

            // Form validation
            const inputs = form.querySelectorAll('input, textarea, select');
            inputs.forEach(input => {
                input.addEventListener('blur', () => this.validateField(input));
                input.addEventListener('input', () => this.clearFieldError(input));
            });
        });
    }

    handleFormSubmit(form) {
        const formData = new FormData(form);
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;

        // Show loading state
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending...';

        // Simulate form submission (replace with actual API call)
        setTimeout(() => {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
            form.reset();
        }, 2000);
    }

    validateField(field) {
        const value = field.value.trim();
        const fieldName = field.name || field.id;
        
        // Remove existing error
        this.clearFieldError(field);
        
        // Basic validation
        if (field.hasAttribute('required') && !value) {
            this.showFieldError(field, `${fieldName} is required`);
            return false;
        }
        
        if (field.type === 'email' && value && !this.isValidEmail(value)) {
            this.showFieldError(field, 'Please enter a valid email address');
            return false;
        }
        
        return true;
    }

    showFieldError(field, message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        errorDiv.textContent = message;
        errorDiv.style.color = 'var(--red)';
        errorDiv.style.fontSize = '0.875rem';
        errorDiv.style.marginTop = '0.25rem';
        
        field.parentNode.appendChild(errorDiv);
        field.style.borderColor = 'var(--red)';
    }

    clearFieldError(field) {
        const errorDiv = field.parentNode.querySelector('.field-error');
        if (errorDiv) {
            errorDiv.remove();
        }
        field.style.borderColor = '';
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }



    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Theme toggle (Ctrl/Cmd + T) is now handled by themes.js
            
            // Escape key handling is managed by navbar.js for mobile menu
        });
    }

    setupPerformanceOptimizations() {
        // Lazy loading for images
        const images = document.querySelectorAll('img[data-src]');
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });

        images.forEach(img => imageObserver.observe(img));

        // Debounced scroll handler
        let scrollTimeout;
        window.addEventListener('scroll', () => {
            if (scrollTimeout) {
                clearTimeout(scrollTimeout);
            }
            scrollTimeout = setTimeout(() => {
                // Perform scroll-based operations
                this.updateActiveNavLink();
            }, 16); // ~60fps
        });
    }

    setupAccessibility() {
        // Skip to main content link
        const skipLink = document.createElement('a');
        skipLink.href = '#main-content';
        skipLink.textContent = 'Skip to main content';
        skipLink.className = 'skip-link';
        skipLink.style.cssText = `
            position: absolute;
            top: -40px;
            left: 6px;
            background: var(--primary-color);
            color: var(--button-text-color);
            padding: 8px;
            text-decoration: none;
            border-radius: 4px;
            z-index: 10000;
        `;
        
        skipLink.addEventListener('focus', () => {
            skipLink.style.top = '6px';
        });
        
        skipLink.addEventListener('blur', () => {
            skipLink.style.top = '-40px';
        });
        
        document.body.insertBefore(skipLink, document.body.firstChild);

        // ARIA labels for interactive elements
        document.querySelectorAll('.btn').forEach(btn => {
            if (!btn.getAttribute('aria-label')) {
                btn.setAttribute('aria-label', btn.textContent.trim());
            }
        });

        // Focus management
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                document.body.classList.add('keyboard-navigation');
            }
        });

        document.addEventListener('mousedown', () => {
            document.body.classList.remove('keyboard-navigation');
        });
    }

    setupiubendaScripts() {
        // Detect whether the iubenda widget script is already present.
        // Important: we must still run our local fix script even if iubenda is preloaded.
        const hasIubendaScript = Boolean(document.querySelector('script[src*="iubenda"]'));

        // Create and add the iubenda widget only when not already loaded.
        if (!hasIubendaScript) {
            const iubendaWidgetScript = document.createElement('script');
            iubendaWidgetScript.type = 'text/javascript';
            iubendaWidgetScript.src = '//embeds.iubenda.com/widgets/b519d485-6db6-11ee-8bfc-5ad8d8c564c0.js';
            document.head.insertBefore(iubendaWidgetScript, document.head.firstChild);
        }

        const preference = getCookiePreference();
        console.log('preference', preference);
        let isExpired = false;

        if (preference) {
            const validDate = new Date(preference.timestamp);
            const currentDate = new Date();
            const timeDifference = currentDate - validDate;
            const oneYear = 365 * 24 * 60 * 60 * 1000;
            isExpired = timeDifference > oneYear;
            console.log('isExpired', isExpired);
        }

        // Run the click interception setup
        if (getCookiePreference() && !isExpired) {

            handleCookiePreference();
            // Inject CSS to hide iubenda buttons immediately
            const hideiubendaBannerCSS = `
                html {
                    overflow-y: visible !important;
                }
                #iubenda-cs-banner {
                    opacity: 0 !important;
                    visibility: hidden !important;
                    pointer-events: none !important;
                }
            `;
            const style = document.createElement('style');
            style.textContent = hideiubendaBannerCSS;
            document.head.appendChild(style);
            
        } else {
            setupIubendaClickInterception();
        }

        // Load the iubenda fix script immediately (no delay)
        // Avoid injecting duplicate fix scripts.
        if (!document.querySelector('script[src*="iubenda_fix.js"]')) {
            const iubendaFixScript = document.createElement('script');
            iubendaFixScript.type = 'text/javascript';

            iubendaFixScript.src = window.ElementoI18n?.assetUrl
                ? window.ElementoI18n.assetUrl('js/iubenda_fix.js')
                : (() => {
                    const parts = window.location.pathname.split('/').filter(Boolean);
                    const last = parts[parts.length - 1] || '';
                    const depth = last.endsWith('.html') ? parts.length - 1 : parts.length;
                    const base = depth ? '../'.repeat(depth) : '';
                    return `${base}js/iubenda_fix.js`;
                })();
            document.head.appendChild(iubendaFixScript);
        }
    }

    showToast(message, type = 'info', duration = 5000) {
        // Remove existing toasts
        const existingToasts = document.querySelectorAll('.toast');
        existingToasts.forEach(toast => toast.remove());

        // Create toast element
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <span class="toast-message">${message}</span>
                <button class="toast-close" aria-label="Close notification">×</button>
            </div>
        `;

        // Add styles
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--glassmorphism-background);
            backdrop-filter: blur(20px);
            border: 1px solid var(--glassmorphism-border);
            border-radius: var(--card-border-radius);
            padding: var(--space-lg);
            box-shadow: var(--glassmorphism-shadow);
            z-index: 1001;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            max-width: 400px;
            color: var(--text-color);
        `;

        // Add to page
        document.body.appendChild(toast);

        // Show toast
        setTimeout(() => {
            toast.style.transform = 'translateX(0)';
        }, 100);

        // Close button functionality
        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.addEventListener('click', () => {
            this.hideToast(toast);
        });

        // Auto-hide after duration
        setTimeout(() => {
            this.hideToast(toast);
        }, duration);
    }

    hideToast(toast) {
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.remove();
            }
        }, 300);
    }

    // Utility methods
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    // SVG Injection functionality
    async injectSVGDiagram(containerSelector, svgPath = null) {
        try {
            const container = typeof containerSelector === 'string' 
                ? document.querySelector(containerSelector) 
                : containerSelector;
            if (!container) {
                console.error(`Container not found: ${containerSelector}`);
                return;
            }

            // Get the SVG path from the src attribute if not provided
            const pathToUse = svgPath || container.getAttribute('src');
            if (!pathToUse) {
                console.error(`No SVG path provided and no src attribute found on ${containerSelector}`);
                return;
            }

            // Fetch the SVG content
            const response = await fetch(pathToUse);
            if (!response.ok) {
                throw new Error(`Failed to fetch SVG: ${response.status} ${response.statusText}`);
            }

            const svgContent = await response.text();
            
            // Parse the SVG to extract dimensions and transforms
            const parser = new DOMParser();
            const svgDoc = parser.parseFromString(svgContent, 'image/svg+xml');
            const svgElement = svgDoc.querySelector('svg');
            
            if (!svgElement) {
                throw new Error('No SVG element found in the content');
            }

            // Extract original dimensions
            const originalWidth = parseFloat(svgElement.getAttribute('width') || '0');
            const originalHeight = parseFloat(svgElement.getAttribute('height') || '0');
            
            // Find the main group with transform to calculate actual content bounds
            const mainGroup = svgElement.querySelector('g[transform]');
            let viewBox = null;
            
            if (mainGroup) {
                const transform = mainGroup.getAttribute('transform');
                const translateMatch = transform.match(/translate\(([^,]+),\s*([^)]+)\)/);
                
                if (translateMatch) {
                    const translateX = parseFloat(translateMatch[1]);
                    const translateY = parseFloat(translateMatch[2]);
                    
                    // Calculate the actual content bounds
                    const contentWidth = originalWidth + Math.abs(translateX);
                    const contentHeight = originalHeight + Math.abs(translateY);
                    
                    // Create a viewBox that encompasses all the content
                    viewBox = `0 0 ${contentWidth} ${contentHeight}`;
                }
            }
            
            // If we couldn't calculate viewBox, use the original dimensions
            if (!viewBox) {
                viewBox = `0 0 ${originalWidth} ${originalHeight}`;
            }
            
            // Add viewBox and make the SVG responsive
            let processedSvgContent = svgContent;
            
            // Remove existing viewBox if present
            processedSvgContent = processedSvgContent.replace(/viewBox="[^"]*"/g, '');
            
            // Add the calculated viewBox and make it responsive
            processedSvgContent = processedSvgContent.replace(
                /<svg([^>]*)>/,
                `<svg$1 viewBox="${viewBox}" preserveAspectRatio="xMidYMid meet" style="width: 100%; height: 100%;">`
            );
            
            // Use requestAnimationFrame to batch DOM writes and avoid forced reflows
            requestAnimationFrame(() => {
                container.innerHTML = processedSvgContent;
            });
            
            console.log(`SVG injected successfully into ${containerSelector} from ${pathToUse} with viewBox: ${viewBox}`);
        } catch (error) {
            console.error('Error injecting SVG:', error);
            // Fallback: show error message in container
            const container = document.querySelector(containerSelector);
            if (container) {
                requestAnimationFrame(() => {
                    container.innerHTML = `
                        <div style="text-align: center; padding: 2rem; color: var(--text-muted);">
                            <p>Unable to load diagram</p>
                            <small>Please refresh the page to try again</small>
                        </div>
                    `;
                });
            }
        }
    }

    // Initialize SVG diagrams when DOM is ready
    setupSVGDiagrams() {
        // Find all containers with diagram-svg class and inject their SVGs
        const diagramContainers = document.querySelectorAll('.diagram-svg');
        diagramContainers.forEach((container) => {
            const src = container.getAttribute('src');
            if (src) {
                // Pass the container element directly
                this.injectSVGDiagram(container, src);
            } else {
                console.error('No src attribute found on diagram-svg container at:', container);
            }
        });
    }
}

// FAQ functionality is now handled by js/faq.js

// Initialize the website when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.elementoWebsite = new ElementoWebsite();
    
    // Setup SVG diagrams after initialization
    if (window.elementoWebsite) {
        window.elementoWebsite.setupSVGDiagrams();
    }
});

 