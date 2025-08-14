// Modern Navigation Management System
class NavigationManager {
  constructor() {
    this.burger = document.querySelector('.burger');
    this.nav = document.querySelector('.nav-links');
    this.navLinks = document.querySelectorAll('.nav-links li');
    this.navbar = document.querySelector('nav');
    this.body = document.body;
    this.isOpen = false;
    
    this.init();
  }

  init() {
    // Check if elements exist
    if (!this.burger || !this.nav) {
      console.warn('Navigation elements not found');
      return;
    }

    this.setupEventListeners();
    this.setupScrollEffect();
    this.setupActiveLinks();
    this.setupAccessibility();
  }

  setupEventListeners() {
    // Burger menu click
    this.burger.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleNav();
    });

    // Close nav when clicking outside
    document.addEventListener('click', (e) => {
      if (this.isOpen && !this.nav.contains(e.target) && !this.burger.contains(e.target)) {
        this.closeNav();
      }
    });

    // Close nav with Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.closeNav();
      }
    });

    // Close nav on window resize
    window.addEventListener('resize', () => {
      if (window.innerWidth > 768 && this.isOpen) {
        this.closeNav();
      }
    });

    // Close nav when clicking on nav links (mobile)
    this.navLinks.forEach(link => {
      link.addEventListener('click', () => {
        if (window.innerWidth <= 768 && this.isOpen) {
          this.closeNav();
        }
      });
    });
  }

  toggleNav() {
    this.isOpen = !this.isOpen;
    
    if (this.isOpen) {
      this.openNav();
    } else {
      this.closeNav();
    }
  }

  openNav() {
    this.nav.classList.add('nav-active');
    this.body.classList.add('nav-open');
    this.burger.classList.add('toggle');
    this.burger.setAttribute('aria-expanded', 'true');
    this.isOpen = true;
    
    // Add animation delay to nav items
    this.navLinks.forEach((link, index) => {
      link.style.animationDelay = `${index * 0.1 + 0.1}s`;
    });
  }

  closeNav() {
    this.nav.classList.remove('nav-active');
    this.body.classList.remove('nav-open');
    this.burger.classList.remove('toggle');
    this.burger.setAttribute('aria-expanded', 'false');
    this.isOpen = false;
  }

  setupScrollEffect() {
    let lastScrollY = window.scrollY;
    
    window.addEventListener('scroll', () => {
      const currentScrollY = window.scrollY;
      
      // Add scrolled class for styling
      if (currentScrollY > 50) {
        this.navbar.classList.add('scrolled');
      } else {
        this.navbar.classList.remove('scrolled');
      }
      
      // Hide/show navbar on scroll (optional)
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        this.navbar.style.transform = 'translateY(-100%)';
      } else {
        this.navbar.style.transform = 'translateY(0)';
      }
      
      lastScrollY = currentScrollY;
    });
  }

  setupActiveLinks() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    this.navLinks.forEach(li => {
      const link = li.querySelector('a');
      if (link) {
        const href = link.getAttribute('href');
        
        // Remove existing active classes
        link.classList.remove('active');
        
        // Add active class to current page
        if (href === currentPage || 
            (currentPage === '' && href === 'index.html') ||
            (currentPage === 'index.html' && href === 'index.html')) {
          link.classList.add('active');
        }
      }
    });
  }

  setupAccessibility() {
    // Set initial ARIA attributes
    this.burger.setAttribute('aria-expanded', 'false');
    this.burger.setAttribute('aria-label', 'Toggle navigation menu');
    this.burger.setAttribute('role', 'button');
    this.burger.setAttribute('tabindex', '0');
    
    // Add keyboard support for burger menu
    this.burger.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.toggleNav();
      }
    });
    
    // Improve focus management
    this.nav.setAttribute('role', 'navigation');
    this.nav.setAttribute('aria-label', 'Main navigation');
  }

  // Public method to close nav (can be called from other scripts)
  forceClose() {
    this.closeNav();
  }

  // Public method to update cart badge
  updateCartBadge(hasItems) {
    const cartLink = document.getElementById('cart');
    if (cartLink) {
      if (hasItems) {
        cartLink.classList.add('has-items');
      } else {
        cartLink.classList.remove('has-items');
      }
    }
  }
}

// Initialize navigation when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.navManager = new NavigationManager();
  
  // Update cart badge if cart has items
  try {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    window.navManager.updateCartBadge(cart.length > 0);
  } catch (error) {
    console.error('Error checking cart status:', error);
  }
});

// Listen for cart updates to update badge
window.addEventListener('storage', (e) => {
  if (e.key === 'cart' && window.navManager) {
    try {
      const cart = JSON.parse(e.newValue) || [];
      window.navManager.updateCartBadge(cart.length > 0);
    } catch (error) {
      console.error('Error updating cart badge:', error);
    }
  }
});
