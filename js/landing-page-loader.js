/**
 * Landing Page Component Loader
 * Loads modular HTML components and injects persona-specific content
 */

(function() {
    'use strict';
    
    console.log('Landing page loader script loaded');

    // Component cache to avoid reloading
    const componentCache = {};

    /**
     * Load an HTML component from /solutions/components/
     */
    async function loadComponent(componentName) {
        if (componentCache[componentName]) {
            console.log(`Using cached component: ${componentName}`);
            return componentCache[componentName];
        }

        const componentUrl = `components/${componentName}.html`;
        console.log(`Fetching component: ${componentUrl}`);
        
        try {
            const response = await fetch(componentUrl);
            if (!response.ok) {
                throw new Error(`Failed to load component: ${componentName} (${response.status})`);
            }
            const html = await response.text();
            componentCache[componentName] = html;
            console.log(`Successfully loaded component: ${componentName}`);
            return html;
        } catch (error) {
            console.error(`Error loading component ${componentName}:`, error);
            return `<div class="component-error">Failed to load ${componentName}</div>`;
        }
    }

    /**
     * Replace template variables with actual content
     * Supports nested objects with dot notation (e.g., {{primaryCTA.text}})
     */
    function replaceVariables(template, data) {
        console.log('replaceVariables called with data:', data);
        return template.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
            const keys = path.trim().split('.');
            let value = data;
            
            console.log(`Processing variable: ${match}, path: ${path}, keys:`, keys);
            
            for (const key of keys) {
                if (value && typeof value === 'object' && key in value) {
                    value = value[key];
                    console.log(`Found key ${key}, value:`, value);
                } else {
                    console.log(`Key ${key} not found in:`, value);
                    return match; // Return original if path not found
                }
            }
            
            console.log(`Final value for ${match}:`, value);
            return value !== undefined ? value : match;
        });
    }

    /**
     * Render an array of items (for lists, grids, etc.)
     */
    function renderArray(template, items, itemKey = 'item') {
        if (!Array.isArray(items) || items.length === 0) {
            return '';
        }

        // Find the repeatable section in template
        const repeatRegex = new RegExp(`<!-- repeat:${itemKey} -->([\\s\\S]*?)<!-- endrepeat:${itemKey} -->`, 'g');
        
        return template.replace(repeatRegex, (match, itemTemplate) => {
            return items.map(item => {
                // Create a data object with the itemKey as the key for the individual item
                const itemData = { [itemKey]: item };
                return replaceVariables(itemTemplate, itemData);
            }).join('');
        });
    }

    /**
     * Load and render a component with data
     */
    async function renderComponent(componentName, data) {
        let template = await loadComponent(componentName);
        console.log(`Template for ${componentName}:`, template.substring(0, 200) + '...');
        
        // Handle array rendering first - try different array keys
        let itemCount = 0;
        if (data.items && Array.isArray(data.items)) {
            itemCount = data.items.length;
            template = renderArray(template, data.items, 'item');
        } else if (data.item && Array.isArray(data.item)) {
            itemCount = data.item.length;
            template = renderArray(template, data.item, 'item');
        } else if (Array.isArray(data)) {
            itemCount = data.length;
            template = renderArray(template, data, 'item');
        } else {
            // For non-array components, just proceed with variable replacement
            console.log(`No array processing needed for ${componentName}`);
        }
        
        // Add grid class based on item count
        if (itemCount > 0) {
            let gridClass;
            if (itemCount <= 2) {
                gridClass = 'grid-2';
            } else if (itemCount === 4) {
                gridClass = 'grid-2'; // 4 items work better in 2x2 grid
            } else {
                gridClass = 'grid-3'; // 3, 5, 6+ items use 3-column grid
            }
            data.gridClass = gridClass;
        }
        
        // Then replace simple variables
        template = replaceVariables(template, data);
        console.log(`Final rendered template for ${componentName}:`, template.substring(0, 200) + '...');
        
        return template;
    }

    /**
     * Initialize all components on the page
     */
    async function initializePage() {
        console.log('Landing page loader initializing...');
        
        // Check if pageConfig exists
        if (typeof window.pageConfig === 'undefined') {
            console.error('window.pageConfig not found. Please define pageConfig before loading landing-page-loader.js');
            return;
        }
        
        console.log('pageConfig found:', window.pageConfig);
        console.log('Available pageConfig keys:', Object.keys(window.pageConfig));

        // Find all component placeholders
        const componentElements = document.querySelectorAll('[data-component]');
        console.log(`Found ${componentElements.length} components to load:`, Array.from(componentElements).map(el => el.getAttribute('data-component')));
        
        // Check for duplicate components
        const componentNames = Array.from(componentElements).map(el => el.getAttribute('data-component'));
        const duplicates = componentNames.filter((name, index) => componentNames.indexOf(name) !== index);
        if (duplicates.length > 0) {
            console.warn('Duplicate components found:', duplicates);
        }
        
        // Load and render each component
        const renderPromises = Array.from(componentElements).map(async (element) => {
            const componentName = element.getAttribute('data-component');
            const elementId = element.id;
            
            // Try multiple ways to find the data
            let componentData = window.pageConfig[elementId] || 
                              window.pageConfig[componentName] || 
                              window.pageConfig[elementId.replace('-section', '')] ||
                              window.pageConfig[elementId.replace('-', '')] ||
                              {};
            
            // Special handling for specific component mappings
            if (elementId === 'hero-section' && window.pageConfig.hero) {
                componentData = window.pageConfig.hero;
            } else if (elementId === 'pain-points' && window.pageConfig.painPoints) {
                componentData = window.pageConfig.painPoints;
            } else if (elementId === 'solution' && window.pageConfig.solution) {
                componentData = window.pageConfig.solution;
            } else if (elementId === 'features' && window.pageConfig.features) {
                componentData = window.pageConfig.features;
            } else if (elementId === 'use-case' && window.pageConfig.useCase) {
                componentData = window.pageConfig.useCase;
            } else if (elementId === 'code-example' && window.pageConfig.codeExample) {
                componentData = window.pageConfig.codeExample;
            } else if (elementId === 'stats' && window.pageConfig.stats) {
                componentData = window.pageConfig.stats;
            } else if (elementId === 'products' && window.pageConfig.products) {
                componentData = window.pageConfig.products;
            } else if (elementId === 'faq' && window.pageConfig.faq) {
                componentData = window.pageConfig.faq;
            } else if (elementId === 'cta-final' && window.pageConfig.ctaFinal) {
                componentData = window.pageConfig.ctaFinal;
            }
            
            console.log(`Loading component: ${componentName} (id: ${elementId})`, componentData);
            console.log(`Available pageConfig keys:`, Object.keys(window.pageConfig));
            
            try {
                const rendered = await renderComponent(componentName, componentData);
                element.innerHTML = rendered;
                element.removeAttribute('data-component'); // Clean up
                console.log(`Successfully loaded component: ${componentName}`);
            } catch (error) {
                console.error(`Error rendering component ${componentName}:`, error);
                element.innerHTML = `<div class="component-error">Error loading content</div>`;
            }
        });

        // Wait for all components to load
        await Promise.all(renderPromises);

        // Initialize any interactive elements after components are loaded
        initializeInteractiveElements();
        
        // Dispatch custom event to notify other scripts that components are loaded
        document.dispatchEvent(new CustomEvent('componentsLoaded'));
    }

    /**
     * Initialize interactive elements (accordions, tabs, etc.)
     */
    function initializeInteractiveElements() {
        // FAQ accordions
        const faqQuestions = document.querySelectorAll('.faq-question');
        faqQuestions.forEach(question => {
            question.addEventListener('click', function() {
                const answer = this.nextElementSibling;
                const isOpen = answer.style.maxHeight;
                
                // Close all other FAQs
                document.querySelectorAll('.faq-answer').forEach(ans => {
                    ans.style.maxHeight = null;
                    ans.previousElementSibling.classList.remove('active');
                });
                
                // Toggle current FAQ
                if (!isOpen) {
                    answer.style.maxHeight = answer.scrollHeight + 'px';
                    this.classList.add('active');
                }
            });
        });

        // Scroll animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, observerOptions);

        document.querySelectorAll('.fade-in, .scroll-animate').forEach(el => {
            observer.observe(el);
        });
    }

    /**
     * Helper function to format numbers with commas
     */
    window.formatNumber = function(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };

    /**
     * Helper function to escape HTML
     */
    window.escapeHtml = function(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    };

    function start() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initializePage);
        } else {
            initializePage();
        }
    }

    // Wait for async solution config when using solution-config-loader.js
    if (document.querySelector('script[data-solution-config]') && typeof window.pageConfig === 'undefined') {
        document.addEventListener('pageConfigReady', start, { once: true });
        setTimeout(start, 3000);
    } else {
        start();
    }

})();

