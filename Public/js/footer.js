class FooterManager {
    constructor() {
        this.currentYear = new Date().getFullYear();
        this.scrollToTopBtn = null;
        this.init();
    }

    init() {
        this.updateYear();
        this.setupScrollToTop();
        this.setupSocialLinks();
        this.setupAnimations();
    }

    // Update year in footer
    updateYear() {
        const yearElement = document.querySelector('#year');
        if (yearElement) {
            yearElement.textContent = this.currentYear;
        }
    }

    // Scroll-to-top setup
    setupScrollToTop() {
        if (!document.querySelector('.scroll-to-top')) {
            this.createScrollToTopButton();
        }
        this.scrollToTopBtn = document.querySelector('.scroll-to-top');

        window.addEventListener('scroll', () => {
            this.scrollToTopBtn.classList.toggle('visible', window.scrollY > 300);
        });

        this.scrollToTopBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    createScrollToTopButton() {
        const btn = document.createElement('button');
        btn.className = 'scroll-to-top';
        btn.innerHTML = '<i class="fas fa-chevron-up"></i>';
        btn.setAttribute('aria-label', 'Scroll to top');
        document.body.appendChild(btn);
    }

    // Track social icon clicks
    setupSocialLinks() {
        const socialLinks = document.querySelectorAll('.social-icons a');
        socialLinks.forEach(link => {
            link.addEventListener('click', () => {
                const platform = this.getPlatform(link);
                console.log(`Social click: ${platform}`);
                link.style.transform = 'scale(0.95)';
                setTimeout(() => link.style.transform = '', 150);
            });
        });
    }

    getPlatform(link) {
        const icon = link.querySelector('i');
        if (!icon) return 'Unknown';
        if (icon.classList.contains('fa-facebook-f')) return 'Facebook';
        if (icon.classList.contains('fa-twitter')) return 'Twitter';
        if (icon.classList.contains('fa-instagram')) return 'Instagram';
        if (icon.classList.contains('fa-pinterest')) return 'Pinterest';
        return 'Unknown';
    }

    // Fade-in footer columns
    setupAnimations() {
        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                    obs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.2 });

        document.querySelectorAll('.footer-column').forEach(col => {
            col.style.opacity = '0';
            col.style.transform = 'translateY(30px)';
            col.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(col);
        });
    }
}

// Init footer
document.addEventListener('DOMContentLoaded', () => {
    new FooterManager();
    const style = document.createElement('style');
    style.textContent = `
        .animate-in { opacity: 1 !important; transform: translateY(0) !important; }
    `;
    document.head.appendChild(style);
});
