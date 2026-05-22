# Elemento Website

A modern, responsive website for Elemento - a company specializing in modular cloud solutions. This website showcases Elemento's products and services with a beautiful, interactive design.

## Features

### 🎨 Design
- **Modern Glassmorphism Design**: Beautiful glass-like effects with backdrop blur
- **Animated Background**: Spinning gradient background with smooth animations
- **Responsive Layout**: Fully responsive design that works on all devices
- **Smooth Animations**: CSS animations and transitions throughout the site
- **Dark Mode Support**: Automatic dark mode detection and styling

### 📱 Responsive Design
- **Mobile-First**: Optimized for mobile devices
- **Tablet Support**: Responsive design for tablets
- **Desktop Experience**: Enhanced experience for larger screens
- **Touch-Friendly**: Optimized for touch interactions

### 🚀 Performance
- **Fast Loading**: Optimized CSS and JavaScript
- **Lazy Loading**: Images load as needed
- **Smooth Scrolling**: Enhanced navigation experience
- **Throttled Events**: Performance-optimized scroll handlers

### 🎯 Interactive Elements
- **Navigation**: Smooth scrolling navigation with active states
- **Mobile Menu**: Hamburger menu for mobile devices
- **Contact Form**: Interactive form with validation
- **Toast Notifications**: User feedback system
- **Hover Effects**: Engaging hover animations

## Local preview (Live Server + GitHub Pages)

The site is built to static HTML in `dist/` (same output deployed to GitHub Pages).

1. Run `npm run build` (or **Terminal → Run Build Task** in VS Code).
2. Start **Live Server** — workspace settings serve from `dist/`, not the repo root.
3. Open e.g. `http://127.0.0.1:5500/it/contact.html`.

After changing pages or i18n, rebuild before refreshing Live Server. For hot reload while editing, use `npm run dev` instead.

## Structure

```
elemento-website/
├── index.html              # Main homepage
├── css/
│   ├── style.css          # Main stylesheet
│   ├── components.css     # Component styles
│   └── responsive.css     # Responsive design
├── js/
│   └── main.js           # Main JavaScript
├── assets/
│   └── favicon/          # Favicon files
└── README.md             # This file
```

## Pages & Sections

### Homepage (`index.html`)
- **Hero Section**: Eye-catching introduction with floating cards
- **About Section**: Company information with statistics
- **Services Section**: Four main service offerings
- **Products Section**: Featured products with descriptions
- **Contact Section**: Contact information and form
- **Footer**: Links and company information

## Technologies Used

### Frontend
- **HTML5**: Semantic markup
- **CSS3**: Modern styling with custom properties
- **JavaScript (ES6+)**: Interactive functionality
- **Font Awesome**: Icons
- **Google Fonts**: Typography (Red Hat Display, Open Sans)

### Design System
- **Color Palette**: Based on Elemento's brand colors
- **Typography**: Red Hat Display for headings, Open Sans for body text
- **Spacing**: Consistent spacing system
- **Shadows**: Layered shadow system for depth
- **Border Radius**: Consistent rounded corners

## Browser Support

- **Chrome**: 90+
- **Firefox**: 88+
- **Safari**: 14+
- **Edge**: 90+

## Getting Started

### Prerequisites
- A modern web browser
- A local web server (for development)

### Installation

1. **Clone or download** the website files
2. **Open** `index.html` in your web browser
3. **Or serve locally** using a web server:
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js
   npx serve .
   
   # Using PHP
   php -S localhost:8000
   ```

### Development

1. **Edit HTML**: Modify `index.html` for content changes
2. **Edit CSS**: Update styles in the `css/` directory
3. **Edit JavaScript**: Modify functionality in `js/main.js`
4. **Test**: Check responsiveness across different devices

## Customization

### Colors
The website uses CSS custom properties for easy color customization. Edit the `:root` section in `css/style.css`:

```css
:root {
    --primary-color: #FFA600;    /* Main brand color */
    --accent-color: #2CA5FF;     /* Secondary color */
    --background-color: #F5F5FA; /* Background color */
    /* ... other colors */
}
```

### Content
- **Company Information**: Update the About section
- **Services**: Modify the Services section content
- **Products**: Update product descriptions and features
- **Contact**: Change contact information and form fields

### Styling
- **Typography**: Change fonts in the CSS variables
- **Spacing**: Adjust spacing values in CSS custom properties
- **Animations**: Modify animation durations and effects

## Features in Detail

### Navigation
- **Smooth Scrolling**: Click navigation links to smoothly scroll to sections
- **Active States**: Navigation highlights the current section
- **Mobile Menu**: Collapsible hamburger menu for mobile devices
- **Scroll Effects**: Header changes on scroll

### Forms
- **Contact Form**: Interactive form with validation
- **Loading States**: Visual feedback during form submission
- **Success Messages**: Toast notifications for user feedback
- **Focus Effects**: Enhanced focus states for better UX

### Animations
- **Scroll Animations**: Elements animate in as they come into view
- **Hover Effects**: Interactive hover states on cards and buttons
- **Background Animation**: Spinning gradient background
- **Floating Cards**: Animated cards in the hero section

### Performance
- **Optimized Images**: Proper image sizing and formats
- **Minimal JavaScript**: Efficient, non-blocking JavaScript
- **CSS Optimization**: Optimized stylesheets
- **Lazy Loading**: Images load as needed

## SEO Features

- **Semantic HTML**: Proper heading hierarchy and semantic elements
- **Meta Tags**: Comprehensive meta information
- **Structured Data**: Ready for schema markup
- **Performance**: Fast loading times for better SEO

## Accessibility

- **Keyboard Navigation**: Full keyboard accessibility
- **Screen Reader Support**: Proper ARIA labels and semantic HTML
- **Color Contrast**: WCAG compliant color combinations
- **Focus Indicators**: Clear focus states for all interactive elements

## Browser Compatibility

The website is designed to work on modern browsers with graceful degradation for older browsers. Key features:

- **CSS Grid**: Modern layout system
- **CSS Custom Properties**: Dynamic theming
- **Intersection Observer**: Scroll animations
- **Backdrop Filter**: Glassmorphism effects

## Future Enhancements

Potential improvements for future versions:

- **Blog Section**: Company news and updates
- **Product Pages**: Detailed product information
- **Multi-language Support**: EN + IT via Astro — all pages in `src/data/pages-manifest.json` (run `npm run build`, deploy `dist/`)
- **CMS Integration**: Content management system
- **Analytics**: User behavior tracking
- **A/B Testing**: Performance optimization

## Support

For questions or support regarding this website:

- **Email**: info@elemento.cloud
- **Documentation**: This README file
- **Issues**: Report bugs or feature requests

## License

This website is created for Elemento srl. All rights reserved.

---

**Built with ❤️ for Elemento** 