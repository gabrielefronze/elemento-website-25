// Atmosphere Hero with Logo loader
document.addEventListener('DOMContentLoaded', function() {
    const atmosphereHeroWithLogoPlaceholder = document.getElementById('atmosphere-hero-with-logo-placeholder');
    if (atmosphereHeroWithLogoPlaceholder) {
        const base = window.ElementoI18n?.getAssetBase
            ? window.ElementoI18n.getAssetBase()
            : (() => {
                const parts = window.location.pathname.split('/').filter(Boolean);
                const last = parts[parts.length - 1] || '';
                const depth = last.endsWith('.html') ? parts.length - 1 : parts.length;
                return depth ? '../'.repeat(depth) : '';
            })();
        const atmosphereHeroWithLogoPath = `${base}components/atmosphere_hero_with_logo.html`;

        fetch(atmosphereHeroWithLogoPath)
            .then(response => response.text())
            .then(html => {
                if (base) {
                    html = html.replace(/src="assets\//g, `src="${base}assets/`);
                    html = html.replace(/href="([^"]*\.html)"/g, (_, href) => {
                        if (href.startsWith('http') || href.startsWith('/')) return `href="${href}"`;
                        return `href="${base}${href}"`;
                    });
                }
                atmosphereHeroWithLogoPlaceholder.innerHTML = html;
            })
            .catch(error => {
                console.error('Error loading atmosphere hero with logo:', error);
                // Fallback atmosphere hero with logo if loading fails
                const fallbackHtml = `
                    <div class="atmosphere-container">
                        <div class="fadeout"></div>
                        
                        <!-- Static atmosphere elements -->
                        <div class="atmosphere-wrapper">
                            <div class="atmosphere"></div>
                            <div class="center-glow"></div>
                            <div class="atmosphere-left"></div>
                            <div class="atmosphere-right"></div>
                        </div>

                        <div class="orbit-object orbit-object-center"></div>
                        <div class="orbit-object orbit-object-bottom-center"></div>
                        <div class="planet-radial-glow"></div>
                        <div class="planet-linear-glow"></div>
                        <div class="planet"></div>
                        <div class="planet-halo"></div>
                        
                        <!-- Particle System -->
                        <div class="particles-container">
                            <div class="particle particle-1"></div>
                            <div class="particle particle-2"></div>
                            <div class="particle particle-3"></div>
                            <div class="particle particle-4"></div>
                            <div class="particle particle-5"></div>
                            <div class="particle particle-6"></div>
                            <div class="particle particle-7"></div>
                            <div class="particle particle-8"></div>
                            <div class="particle particle-9"></div>
                            <div class="particle particle-10"></div>
                            <div class="particle particle-11"></div>
                            <div class="particle particle-12"></div>
                            <div class="particle particle-13"></div>
                            <div class="particle particle-14"></div>
                            <div class="particle particle-15"></div>
                            <div class="particle particle-16"></div>
                            <div class="particle particle-17"></div>
                            <div class="particle particle-18"></div>
                            <div class="particle particle-19"></div>
                            <div class="particle particle-20"></div>
                            <div class="particle particle-21"></div>
                            <div class="particle particle-22"></div>
                            <div class="particle particle-23"></div>
                            <div class="particle particle-24"></div>
                            <div class="particle particle-25"></div>
                            <div class="particle particle-26"></div>
                            <div class="particle particle-27"></div>
                            <div class="particle particle-28"></div>
                            <div class="particle particle-29"></div>
                            <div class="particle particle-30"></div>
                            <div class="particle particle-31"></div>
                            <div class="particle particle-32"></div>
                            <div class="particle particle-33"></div>
                            <div class="particle particle-34"></div>
                            <div class="particle particle-35"></div>
                            <div class="particle particle-36"></div>
                            <div class="particle particle-37"></div>
                            <div class="particle particle-38"></div>
                            <div class="particle particle-39"></div>
                            <div class="particle particle-40"></div>
                            <div class="particle particle-41"></div>
                            <div class="particle particle-42"></div>
                            <div class="particle particle-43"></div>
                            <div class="particle particle-44"></div>
                            <div class="particle particle-45"></div>
                            <div class="particle particle-46"></div>
                            <div class="particle particle-47"></div>
                            <div class="particle particle-48"></div>
                            <div class="particle particle-49"></div>
                            <div class="particle particle-50"></div>
                        </div>
                        
                        <!-- Hero Logo Elements -->
                        <div class="hero-logo-contrast"></div>
                        <div class="hero-logo"></div>
                    </div>
                `;
                atmosphereHeroWithLogoPlaceholder.innerHTML = fallbackHtml;
            });
    }
});

