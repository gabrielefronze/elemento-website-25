class SuccessStoriesCarousel {
    constructor(containerId, dataUrl) {
        this.container = document.getElementById(containerId);
        this.dataUrl = dataUrl;
        this.stories = [];
        this.currentIndex = 0;
        this.autoplayInterval = null;
        this.autoplayDelay = 8000; // 8 seconds - better for engagement
        this.autoplayRestartDelay = 3000; // 3 seconds delay before restarting after user interaction
        
        this.init();
    }
    
    async init() {
        try {
            console.log('🚀 Initializing Success Stories Carousel...');
            await this.loadStories();
            console.log(`📊 Loaded ${this.stories.length} success stories`);
            this.render();
            this.startAutoplay();
            this.bindEvents();
            console.log('✅ Carousel initialized successfully');
        } catch (error) {
            console.error('❌ Error initializing carousel:', error);
            this.showFallback();
        }
    }
    
    async loadStories() {
        const response = await fetch(this.dataUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        this.stories = await response.json();
    }
    
    render() {
        if (!this.container || this.stories.length === 0) {
            console.log('❌ Container not found or no stories loaded');
            return;
        }
        
        console.log('🎨 Rendering carousel with', this.stories.length, 'stories');
        
        this.container.innerHTML = `
            <div class="success-stories-carousel">
                <button class="carousel-btn carousel-prev" aria-label="Previous story">
                    <i class="fas fa-chevron-left"></i>
                </button>
                
                <div class="carousel" title="Hover to pause autoplay">
                    <div class="carousel-track">
                        ${this.stories.map((story, index) => this.renderStory(story, index)).join('')}
                    </div>
                </div>
                
                <button class="carousel-btn carousel-next" aria-label="Next story">
                    <i class="fas fa-chevron-right"></i>
                </button>
                
                <div class="carousel-controls">
                    <div class="carousel-indicators">
                        ${this.stories.map((_, index) => `
                            <button class="carousel-indicator ${index === 0 ? 'active' : ''}" 
                                    data-index="${index}" 
                                    aria-label="Go to story ${index + 1}">
                            </button>
                        `).join('')}
                    </div>
                </div>
                
                <div class="carousel-hint">
                    <small><i class="fas fa-pause"></i> Hover to pause autoplay</small>
                </div>
            </div>
        `;
        
        console.log('🎯 Setting initial active story to index 0');
        this.updateActiveStory(0);
    }
    
    mediaUrl(path) {
        if (!path || /^(https?:|\/\/|\/)/.test(path)) return path;
        return window.ElementoI18n?.assetUrl ? window.ElementoI18n.assetUrl(path) : path;
    }

    renderStory(story, index) {
        console.log(`📝 Rendering story for ${story.company} with ${story.results ? story.results.length : 0} results`);
        return `
            <div class="carousel-slide ${index === 0 ? 'active' : ''}" data-index="${index}">
                <div class="story-card">
                    <div class="story-header">
                        <div class="company-info">
                            <img src="${this.mediaUrl(story.logo)}" alt="${story.company} logo" class="company-logo" 
                                onload="this.classList.add('loaded')" 
                                onerror="this.style.display='none'; this.nextElementSibling.style.marginLeft='0';">
                            <div class="company-details">
                                <h3 class="company-name">${story.company}</h3>
                                <p class="company-industry">${story.industry}</p>
                            </div>
                        </div>
                    </div>
                    
                    <blockquote class="story-quote">
                        <p>&nbsp;&nbsp;${story.quote}</p>
                        <footer class="story-author">
                            <strong>${story.author}</strong>
                            <span class="author-role">${story.role}</span>
                        </footer>
                    </blockquote>
                    
                    <div class="story-details">
                        <div class="story-challenge">
                            <h4>Challenge</h4>
                            <p>${story.challenge}</p>
                        </div>
                        
                        <div class="story-solution">
                            <h4>Solution</h4>
                            <p>${story.solution}</p>
                        </div>
                    </div>

                    <div class="story-details">
                        <div class="story-results">
                            <h4>Results</h4>
                            <ul>
                                ${story.results && story.results.length > 0 
                                    ? story.results.map(result => `<li>${result}</li>`).join('')
                                    : '<li>No results available</li>'
                                }
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    renderStats(story) {
        const metrics = story.metrics;
        return Object.entries(metrics).map(([key, value]) => {
            const label = this.formatMetricLabel(key);
            return `
                <div class="stat-item">
                    <div class="stat-value">${value}</div>
                    <div class="stat-label">${label}</div>
                </div>
            `;
        }).join('');
    }
    
    formatMetricLabel(key) {
        const labels = {
            'cost_savings': 'Cost Savings',
            'deployment_time': 'Deployment Time',
            'uptime': 'Uptime',
            'gpu_availability': 'GPU Availability',
            'processing_speed': 'Processing Speed',
            'migration_time': 'Migration Time',
            'downtime': 'Downtime',
            'deployment_speed': 'Deployment Speed',
            'reliability': 'Reliability',
            'carbon_footprint': 'Carbon Reduction',
            'processing_power': 'Processing Power',
            'compliance_time': 'Compliance Time',
            'security_score': 'Security Score',
            'audit_time': 'Audit Time'
        };
        return labels[key] || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
    
    updateActiveStory(index) {
        console.log(`🔄 Updating active story to index ${index}`);
        
        // Update slides with smooth transition
        const slides = this.container.querySelectorAll('.carousel-slide');
        console.log(`📄 Found ${slides.length} slides`);
        
        slides.forEach((slide, i) => {
            if (i === index) {
                slide.classList.add('active');
                console.log(`✅ Activated slide ${i}`);
                // Debug: Check if slide is visible
                const rect = slide.getBoundingClientRect();
                console.log(`📏 Slide ${i} dimensions:`, rect.width, 'x', rect.height);
            } else {
                slide.classList.remove('active');
            }
        });
        
        // Update indicators
        const indicators = this.container.querySelectorAll('.carousel-indicator');
        indicators.forEach((indicator, i) => {
            indicator.classList.toggle('active', i === index);
        });
        
        this.currentIndex = index;
        console.log(`📊 Current index set to ${index}`);
    }
    
    next() {
        const nextIndex = (this.currentIndex + 1) % this.stories.length;
        this.updateActiveStory(nextIndex);
    }
    
    prev() {
        const prevIndex = this.currentIndex === 0 ? this.stories.length - 1 : this.currentIndex - 1;
        this.updateActiveStory(prevIndex);
    }
    
    goTo(index) {
        if (index >= 0 && index < this.stories.length) {
            this.updateActiveStory(index);
        }
    }
    
    startAutoplay() {
        console.log('▶️ Starting autoplay');
        this.autoplayInterval = setInterval(() => {
            console.log(' Autoplay advancing to next story');
            this.next();
        }, this.autoplayDelay);
        this.updateAutoplayStatus(false); // Not paused
    }
    
    stopAutoplay() {
        console.log('⏸️ Stopping autoplay');
        if (this.autoplayInterval) {
            clearInterval(this.autoplayInterval);
            this.autoplayInterval = null;
        }
        this.updateAutoplayStatus(true); // Paused
    }
    
    updateAutoplayStatus(isPaused) {
        const carousel = this.container.querySelector('.success-stories-carousel');
        if (carousel) {
            if (isPaused) {
                carousel.classList.add('autoplay-paused');
            } else {
                carousel.classList.remove('autoplay-paused');
            }
        }
    }
    
    delayedStartAutoplay() {
        console.log('⏰ Starting delayed autoplay restart');
        setTimeout(() => {
            this.startAutoplay();
        }, this.autoplayRestartDelay);
    }
    
    bindEvents() {
        // Previous/Next buttons
        const prevBtn = this.container.querySelector('.carousel-prev');
        const nextBtn = this.container.querySelector('.carousel-next');
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                this.stopAutoplay();
                this.prev();
                this.delayedStartAutoplay();
            });
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                this.stopAutoplay();
                this.next();
                this.delayedStartAutoplay();
            });
        }
        
        // Indicators
        const indicators = this.container.querySelectorAll('.carousel-indicator');
        indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => {
                this.stopAutoplay();
                this.goTo(index);
                this.delayedStartAutoplay();
            });
        });
        
        // Pause autoplay on hover - Use the .carousel element instead
        const carousel = this.container.querySelector('.carousel');
        if (carousel) {
            console.log('🎯 Setting up hover events for carousel');
            carousel.addEventListener('mouseenter', (e) => {
                console.log('️ Mouse entered carousel - stopping autoplay', e.target);
                this.stopAutoplay();
            });
            carousel.addEventListener('mouseleave', (e) => {
                console.log('🖱️ Mouse left carousel - resuming autoplay', e.target);
                this.startAutoplay();
            });
        } else {
            console.error('❌ Could not find carousel element for hover events');
        }
        
        // Alternative: Use event delegation on the container
        this.container.addEventListener('mouseenter', (e) => {
            // Only stop if hovering over the actual carousel content
            if (e.target.closest('.carousel')) {
                console.log('️ Mouse entered carousel area - stopping autoplay', e.target);
                this.stopAutoplay();
            }
        });
        
        this.container.addEventListener('mouseleave', (e) => {
            // Only resume if leaving the carousel area completely
            if (!e.relatedTarget || !this.container.contains(e.relatedTarget)) {
                console.log('🖱️ Mouse left carousel area - resuming autoplay', e.target);
                this.startAutoplay();
            }
        });
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                this.stopAutoplay();
                this.prev();
                this.delayedStartAutoplay();
            } else if (e.key === 'ArrowRight') {
                this.stopAutoplay();
                this.next();
                this.delayedStartAutoplay();
            }
        });
    }
    
    showFallback() {
        if (this.container) {
            console.log('🔄 Showing fallback content');
            if (this.stories.length > 0) {
                // Show all stories in a grid if carousel fails
                this.container.innerHTML = `
                    <div class="success-stories-fallback">
                        <h3>Success Stories from Our Customers</h3>
                        <div class="fallback-stories-grid">
                            ${this.stories.map(story => `
                                <div class="fallback-story-card">
                                    <div class="company-info">
                                        <img src="${this.mediaUrl(story.logo)}" alt="${story.company} logo" class="company-logo" onerror="this.style.display='none'">
                                        <div class="company-details">
                                            <h4>${story.company}</h4>
                                            <p>${story.industry}</p>
                                        </div>
                                    </div>
                                    <blockquote>"${story.quote}"</blockquote>
                                    <p><strong>${story.author}</strong> - ${story.role}</p>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
            } else {
                this.container.innerHTML = `
                    <div class="success-stories-fallback">
                        <h3>Success Stories</h3>
                        <p>Our customers are achieving remarkable results with Elemento. Check back soon for detailed case studies.</p>
                    </div>
                `;
            }
        }
    }
}

// Initialize carousel when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('🌐 DOM loaded, looking for carousel container...');
    const carouselContainer = document.getElementById('success-stories-carousel');
    if (carouselContainer) {
        console.log('🎯 Found carousel container, initializing...');
        const dataUrl = window.ElementoI18n?.assetUrl
            ? window.ElementoI18n.assetUrl('CMS/success-stories.json')
            : 'CMS/success-stories.json';
        new SuccessStoriesCarousel('success-stories-carousel', dataUrl);
    } else {
        console.error('❌ Carousel container not found!');
    }
});
