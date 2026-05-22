// Orbital Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    loadOrbitalConfigurations();
});

async function loadOrbitalConfigurations() {
    const container = document.getElementById('orbital-configurations');
    
    if (!container) {
        console.error('Orbital configurations container not found');
        return;
    }

    // Show loading state
    container.innerHTML = '<div class="orbital-loading">Loading server configurations...</div>';

    try {
        const url = window.ElementoI18n?.assetUrl
            ? window.ElementoI18n.assetUrl('CMS/orbital.json')
            : 'CMS/orbital.json';
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const configurations = await response.json();
        const locale = window.ElementoI18n ? window.ElementoI18n.getPageLocale() : 'en';
        const resolved = configurations.map((c) =>
            window.ElementoI18n ? window.ElementoI18n.resolveCmsEntry(c, locale) : c
        );
        renderOrbitalConfigurations(resolved);
    } catch (error) {
        console.error('Error loading orbital configurations:', error);
        container.innerHTML = `
            <div class="orbital-error">
                <div class="orbital-error-icon">⚠️</div>
                <h3>Error Loading Configurations</h3>
                <p>Unable to load server configurations. Please try again later.</p>
            </div>
        `;
    }
}

function renderOrbitalConfigurations(configurations) {
    const container = document.getElementById('orbital-configurations');
    
    if (!container || !configurations || configurations.length === 0) {
        container.innerHTML = '<div class="orbital-error">No configurations available</div>';
        return;
    }

    const html = configurations.map(config => `
        <div class="orbital-config-card ${config.name.toLowerCase().includes('custom') ? 'custom-quote' : ''} fade-in">
            <div class="orbital-config-header">
                <h3 class="orbital-config-name">${config.name}</h3>
                <p class="orbital-config-description">${config.description}</p>
            </div>

            <div class="orbital-config-specs">
                <div class="orbital-spec-item">
                    <span class="orbital-spec-label">CPU</span>
                    <span class="orbital-spec-value">${config.specs.cpu}</span>
                </div>
                <div class="orbital-spec-item">
                    <span class="orbital-spec-label">RAM</span>
                    <span class="orbital-spec-value">${config.specs.ram}</span>
                </div>
                <div class="orbital-spec-item">
                    <span class="orbital-spec-label">Storage</span>
                    <span class="orbital-spec-value">${config.specs.storage}</span>
                </div>
                <div class="orbital-spec-item">
                    <span class="orbital-spec-label">Network</span>
                    <span class="orbital-spec-value">${config.specs.network}</span>
                </div>
                ${config.specs.gpu && config.specs.gpu !== 'None' ? `
                <div class="orbital-spec-item">
                    <span class="orbital-spec-label">GPU</span>
                    <span class="orbital-spec-value">${config.specs.gpu}</span>
                </div>
                ` : ''}
            </div>

            <div class="orbital-config-features">
                <h4 class="orbital-features-title">Key Features</h4>
                <ul class="orbital-features-list">
                    ${config.features.map(feature => `
                        <li class="orbital-feature-item">${feature}</li>
                    `).join('')}
                </ul>
            </div>

            <div class="orbital-config-use-cases">
                <h4 class="orbital-use-cases-title">Ideal For</h4>
                <ul class="orbital-use-cases-list">
                    ${config.use_cases.map(useCase => `
                        <li class="orbital-use-case-item">${useCase}</li>
                    `).join('')}
                </ul>
            </div>

            <div class="orbital-config-pricing">
                <div class="orbital-pricing-monthly">
                    <div class="price">${config.pricing.monthly}</div>
                    <div class="period">per month</div>
                </div>
                <div class="orbital-pricing-setup">
                    <div class="price">${config.pricing.setup}</div>
                    <div class="label">setup fee</div>
                </div>
            </div>

            <div class="orbital-config-availability">
                <div class="orbital-availability-status ${config.availability.toLowerCase().replace(' ', '-')}">
                    <div class="orbital-availability-dot"></div>
                    ${config.availability}
                </div>
            </div>

            <div class="orbital-config-cta">
                ${config.name.toLowerCase().includes('custom') ? 
                    '<a href="contact.html" class="btn btn-primary">Get Custom Quote</a>' :
                    '<a href="contact.html" class="btn btn-primary">Request Quote</a>'
                }
            </div>
        </div>
    `).join('');

    container.innerHTML = html;

    // Add fade-in animation to cards
    const cards = container.querySelectorAll('.orbital-config-card');
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            card.style.transition = 'all 0.6s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 100);
    });
}

// Add smooth scrolling for anchor links
document.addEventListener('DOMContentLoaded', function() {
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    
    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});
