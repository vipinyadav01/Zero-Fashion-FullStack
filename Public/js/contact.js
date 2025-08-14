// Modern Contact Form Management System
class ContactForm {
    constructor() {
        this.form = document.getElementById('contact-form');
        this.messagesContainer = document.getElementById('form-messages');
        this.submitBtn = document.querySelector('.submit-btn');
        this.btnText = document.querySelector('.btn-text');
        this.loadingSpinner = document.querySelector('.loading-spinner');
        
        this.init();
    }

    init() {
        this.initEmailJS();
        this.bindEvents();
        this.setCurrentYear();
        this.addFormValidation();
    }

    // Initialize EmailJS
    initEmailJS() {
        try {
  emailjs.init("pkUX04LW-xpS5P2H6");
        } catch (error) {
            console.error('EmailJS initialization failed:', error);
        }
    }

    // Bind event listeners
    bindEvents() {
        if (this.form) {
            this.form.addEventListener('submit', (e) => this.handleSubmit(e));
            
            // Add real-time validation
            const inputs = this.form.querySelectorAll('input, textarea, select');
            inputs.forEach(input => {
                input.addEventListener('blur', () => this.validateField(input));
                input.addEventListener('input', () => this.clearFieldError(input));
            });
        }
    }

    // Set current year
    setCurrentYear() {
        const yearElement = document.getElementById('current-year');
        if (yearElement) {
            yearElement.textContent = new Date().getFullYear();
        }
    }

    // Add form validation styles
    addFormValidation() {
        const style = document.createElement('style');
        style.textContent = `
            .form-group.error input,
            .form-group.error textarea,
            .form-group.error select {
                border-color: #e74c3c;
                box-shadow: 0 0 0 3px rgba(231, 76, 60, 0.1);
            }
            
            .form-group.success input,
            .form-group.success textarea,
            .form-group.success select {
                border-color: #27ae60;
                box-shadow: 0 0 0 3px rgba(39, 174, 96, 0.1);
            }
            
            .field-error {
                color: #e74c3c;
                font-size: 0.875rem;
                margin-top: 0.25rem;
                display: flex;
                align-items: center;
                gap: 0.25rem;
            }
            
            .field-success {
                color: #27ae60;
                font-size: 0.875rem;
                margin-top: 0.25rem;
                display: flex;
                align-items: center;
                gap: 0.25rem;
            }
        `;
        document.head.appendChild(style);
    }

    // Validate individual field
    validateField(field) {
        const formGroup = field.closest('.form-group');
        const fieldName = field.name;
        const fieldValue = field.value.trim();
        
        // Remove existing validation messages
        this.clearFieldError(field);
        
        let isValid = true;
        let errorMessage = '';

        // Required field validation
        if (field.hasAttribute('required') && !fieldValue) {
            isValid = false;
            errorMessage = `${this.getFieldLabel(fieldName)} is required`;
        }
        
        // Email validation
        else if (field.type === 'email' && fieldValue) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(fieldValue)) {
                isValid = false;
                errorMessage = 'Please enter a valid email address';
            }
        }
        
        // Phone validation
        else if (field.type === 'tel' && fieldValue) {
            const phoneRegex = /^[\+]?[\s\-\(\)]?[0-9\s\-\(\)]{10,}$/;
            if (!phoneRegex.test(fieldValue)) {
                isValid = false;
                errorMessage = 'Please enter a valid phone number';
            }
        }
        
        // Name validation
        else if ((fieldName === 'firstName' || fieldName === 'lastName') && fieldValue) {
            if (fieldValue.length < 2) {
                isValid = false;
                errorMessage = 'Name must be at least 2 characters long';
            } else if (!/^[a-zA-Z\s]+$/.test(fieldValue)) {
                isValid = false;
                errorMessage = 'Name can only contain letters and spaces';
            }
        }
        
        // Message validation
        else if (fieldName === 'message' && fieldValue) {
            if (fieldValue.length < 10) {
                isValid = false;
                errorMessage = 'Message must be at least 10 characters long';
            }
        }

        // Update field appearance
        if (isValid && fieldValue) {
            formGroup.classList.remove('error');
            formGroup.classList.add('success');
            this.showFieldMessage(field, 'Looks good!', 'success');
        } else if (!isValid) {
            formGroup.classList.remove('success');
            formGroup.classList.add('error');
            this.showFieldMessage(field, errorMessage, 'error');
        } else {
            formGroup.classList.remove('success', 'error');
        }

        return isValid;
    }

    // Clear field error
    clearFieldError(field) {
        const formGroup = field.closest('.form-group');
        const existingMessage = formGroup.querySelector('.field-error, .field-success');
        if (existingMessage) {
            existingMessage.remove();
        }
        formGroup.classList.remove('error', 'success');
    }

    // Show field validation message
    showFieldMessage(field, message, type) {
        const formGroup = field.closest('.form-group');
        const existingMessage = formGroup.querySelector('.field-error, .field-success');
        if (existingMessage) {
            existingMessage.remove();
        }

        const messageDiv = document.createElement('div');
        messageDiv.className = `field-${type}`;
        messageDiv.innerHTML = `
            <i class="fas fa-${type === 'error' ? 'exclamation-circle' : 'check-circle'}"></i>
            ${message}
        `;
        
        const inputWrapper = formGroup.querySelector('.input-wrapper');
        if (inputWrapper) {
            inputWrapper.after(messageDiv);
        } else {
            field.after(messageDiv);
        }
    }

    // Get field label
    getFieldLabel(fieldName) {
        const labels = {
            firstName: 'First Name',
            lastName: 'Last Name',
            email: 'Email Address',
            phone: 'Phone Number',
            company: 'Company',
            subject: 'Subject',
            message: 'Message'
        };
        return labels[fieldName] || fieldName;
    }

    // Validate entire form
    validateForm() {
        const requiredFields = this.form.querySelectorAll('[required]');
        let isFormValid = true;

        requiredFields.forEach(field => {
            if (!this.validateField(field)) {
                isFormValid = false;
            }
        });

        return isFormValid;
    }

    // Show form message
    showMessage(message, type = 'success', duration = 5000) {
        this.messagesContainer.innerHTML = `
            <div class="message ${type}">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
                ${message}
            </div>
        `;

        if (duration > 0) {
            setTimeout(() => {
                this.messagesContainer.innerHTML = '';
            }, duration);
        }
    }

    // Set loading state
    setLoadingState(isLoading) {
        if (isLoading) {
            this.submitBtn.classList.add('loading');
            this.submitBtn.disabled = true;
            this.loadingSpinner.style.display = 'block';
        } else {
            this.submitBtn.classList.remove('loading');
            this.submitBtn.disabled = false;
            this.loadingSpinner.style.display = 'none';
        }
    }

    // Handle form submission
    async handleSubmit(event) {
  event.preventDefault();

        // Validate form
        if (!this.validateForm()) {
            this.showMessage('Please fix the errors above and try again.', 'error');
            return;
        }

        // Set loading state
        this.setLoadingState(true);
        this.showMessage('Sending your message...', 'loading', 0);

        try {
            // Get form data
            const formData = new FormData(this.form);
  const templateParams = {
                from_name: `${formData.get('firstName')} ${formData.get('lastName')}`,
                from_email: formData.get('email'),
                phone: formData.get('phone') || 'N/A',
                company: formData.get('company') || 'N/A',
                subject: formData.get('subject'),
                message: formData.get('message'),
                newsletter: formData.get('newsletter') ? 'Yes' : 'No',
                timestamp: new Date().toLocaleString()
            };

            // Send email using EmailJS
            const response = await emailjs.send(
                'pkUX04LW-xpS5P2H6', 
                'template_1lcmxvw', 
                templateParams
            );

            if (response.status === 200) {
                this.showMessage(
                    'Thank you! Your message has been sent successfully. We\'ll get back to you within 24 hours.',
                    'success',
                    8000
                );
                this.form.reset();
                this.clearAllFieldStates();
                this.trackFormSubmission(templateParams);
            } else {
                throw new Error('Email service returned non-200 status');
            }

        } catch (error) {
            console.error('Form submission error:', error);
            this.showMessage(
                'Sorry, there was an error sending your message. Please try again or contact us directly.',
                'error',
                8000
            );
        } finally {
            this.setLoadingState(false);
        }
    }

    // Clear all field states
    clearAllFieldStates() {
        const formGroups = this.form.querySelectorAll('.form-group');
        formGroups.forEach(group => {
            group.classList.remove('error', 'success');
            const messages = group.querySelectorAll('.field-error, .field-success');
            messages.forEach(msg => msg.remove());
        });
    }

    // Track form submission (analytics)
    trackFormSubmission(data) {
        try {
            // Log to console for debugging
            console.log('Contact form submitted:', {
                subject: data.subject,
                timestamp: data.timestamp,
                newsletter: data.newsletter
            });

            // You can add analytics tracking here
            // Example: gtag('event', 'contact_form_submit', { subject: data.subject });
        } catch (error) {
            console.error('Analytics tracking error:', error);
        }
    }
}

// Initialize contact form when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ContactForm();
    
    // Add smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Add intersection observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'fadeInUp 0.8s ease forwards';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe elements for animation
    document.querySelectorAll('.info-card, .faq-item').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        observer.observe(el);
    });
});

// Add some utility functions
window.ContactUtils = {
    // Format phone number as user types
    formatPhoneNumber: (input) => {
        const phoneNumber = input.value.replace(/\D/g, '');
        const formatted = phoneNumber.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
        input.value = formatted;
    },

    // Validate email in real-time
    validateEmail: (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    // Copy contact info to clipboard
    copyToClipboard: (text, element) => {
        navigator.clipboard.writeText(text).then(() => {
            const originalText = element.textContent;
            element.textContent = 'Copied!';
            element.style.color = '#27ae60';
            setTimeout(() => {
                element.textContent = originalText;
                element.style.color = '';
            }, 2000);
        }).catch(err => {
            console.error('Could not copy text: ', err);
        });
    }
};