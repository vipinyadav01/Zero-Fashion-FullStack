// Modern Checkout Management System
class CheckoutManager {
    constructor() {
        this.cart = [];
        this.shippingCost = 50;
        this.taxRate = 0.18;
        this.form = document.getElementById('checkout-form');
        this.placeOrderBtn = document.getElementById('placeOrderBtn');
        this.orderItemsContainer = document.getElementById('order-items');
        
        this.init();
    }

    init() {
        this.loadCartData();
        this.renderOrderSummary();
        this.bindEvents();
        this.addFormValidation();
    }

    // Load cart data from localStorage
    loadCartData() {
        try {
            const savedCart = localStorage.getItem('cart');
            if (savedCart) {
                const parsedCart = JSON.parse(savedCart);
                
                // Handle both old format (strings) and new format (objects)
                this.cart = parsedCart.map(item => {
                    if (typeof item === 'string') {
                        // Convert old format "Name || Rs.Price" to new format
                        const [name, priceStr] = item.split('||');
                        const price = parseFloat(priceStr.replace(/[^0-9.]/g, ''));
                        return {
                            id: this.generateId(name.trim()),
                            name: name.trim(),
                            price: price,
                            quantity: 1,
                            image: this.getDefaultImage(name.trim())
                        };
                    } else {
                        // Already in new format
                        return {
                            id: item.id || this.generateId(item.name),
                            name: item.name,
                            price: item.price,
                            quantity: item.quantity || 1,
                            image: item.image || this.getDefaultImage(item.name)
                        };
                    }
                });
            }
        } catch (error) {
            console.error('Error loading cart data:', error);
            this.cart = [];
        }
    }
    // Generate unique ID for items
    generateId(name) {
        return name.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Date.now();
    }

    // Get default image based on product name
    getDefaultImage(name) {
        const nameLower = name.toLowerCase();
        if (nameLower.includes('shoe') || nameLower.includes('nike') || nameLower.includes('adidas')) {
            return 'fas fa-shoe-prints';
        } else if (nameLower.includes('shirt') || nameLower.includes('t-shirt')) {
            return 'fas fa-tshirt';
        } else if (nameLower.includes('jean') || nameLower.includes('pant')) {
            return 'fas fa-user-tie';
        } else {
            return 'fas fa-shopping-bag';
        }
    }

    // Calculate totals
    calculateTotals() {
        const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const shipping = this.cart.length > 0 ? this.shippingCost : 0;
        const tax = subtotal * this.taxRate;
        const total = subtotal + shipping + tax;

        return { subtotal, shipping, tax, total };
    }

    // Render order summary
    renderOrderSummary() {
        if (this.cart.length === 0) {
            this.showEmptyCart();
            return;
        }

        // Render order items
        this.orderItemsContainer.innerHTML = this.cart.map(item => `
            <div class="order-item">
                <div class="item-image">
                    <i class="${item.image}"></i>
                </div>
                <div class="item-details">
                    <h4>${item.name}</h4>
                    <p>Quantity: ${item.quantity}</p>
                </div>
                <div class="item-price">
                    ₹${(item.price * item.quantity).toFixed(2)}
                </div>
            </div>
        `).join('');

        // Update totals
        this.updateTotals();
    }

    // Update totals display
    updateTotals() {
        const totals = this.calculateTotals();
        
        const elements = {
            subtotal: document.getElementById('subtotal-amount'),
            shipping: document.getElementById('shipping-amount'),
            tax: document.getElementById('tax-amount'),
            total: document.getElementById('total-amount')
        };

        if (elements.subtotal) elements.subtotal.textContent = `₹${totals.subtotal.toFixed(2)}`;
        if (elements.shipping) elements.shipping.textContent = totals.shipping > 0 ? `₹${totals.shipping.toFixed(2)}` : 'Free';
        if (elements.tax) elements.tax.textContent = `₹${totals.tax.toFixed(2)}`;
        if (elements.total) elements.total.textContent = `₹${totals.total.toFixed(2)}`;
    }

    // Show empty cart message
    showEmptyCart() {
        this.orderItemsContainer.innerHTML = `
            <div class="empty-cart-message">
                <i class="fas fa-shopping-cart"></i>
                <h3>Your cart is empty</h3>
                <p>Add some items to your cart before checkout</p>
                <a href="products.html" class="continue-shopping-btn">
                    <i class="fas fa-arrow-left"></i>
                    Continue Shopping
                </a>
            </div>
        `;
        
        // Hide other sections
        const sections = ['.order-totals', '.payment-section', '.place-order-btn', '.secure-payment'];
        sections.forEach(selector => {
            const element = document.querySelector(selector);
            if (element) element.style.display = 'none';
        });
    }

    // Add form validation
    addFormValidation() {
        const style = document.createElement('style');
        style.textContent = `
            .form-group.error input, .form-group.error select {
                border-color: #e74c3c;
                box-shadow: 0 0 0 3px rgba(231, 76, 60, 0.1);
            }
            .form-group.success input, .form-group.success select {
                border-color: #27ae60;
                box-shadow: 0 0 0 3px rgba(39, 174, 96, 0.1);
            }
        `;
        document.head.appendChild(style);
    }

    // Validate form
    validateForm() {
        const requiredFields = this.form.querySelectorAll('[required]');
        let isFormValid = true;

        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                isFormValid = false;
                const formGroup = field.closest('.form-group');
                formGroup.classList.add('error');
            }
        });

        return isFormValid;
    }

    // Handle place order
    async handlePlaceOrder() {
        if (this.cart.length === 0) {
            alert('Your cart is empty!');
            return;
        }

        if (!this.validateForm()) {
            alert('Please fill in all required fields.');
            return;
        }

        const totals = this.calculateTotals();
        const orderId = 'ZF' + Date.now();
        
        // Clear cart
        localStorage.removeItem('cart');
        
        // Redirect to payment
        window.location.href = `payment.html?orderId=${orderId}&total=${totals.total.toFixed(2)}`;
    }

    // Bind events
    bindEvents() {
        if (this.placeOrderBtn) {
            this.placeOrderBtn.addEventListener('click', () => this.handlePlaceOrder());
        }

        if (this.form) {
            const inputs = this.form.querySelectorAll('input, select');
            inputs.forEach(input => {
                input.addEventListener('blur', () => {
                    const formGroup = input.closest('.form-group');
                    if (input.hasAttribute('required') && !input.value.trim()) {
                        formGroup.classList.add('error');
                        formGroup.classList.remove('success');
                    } else if (input.value.trim()) {
                        formGroup.classList.add('success');
                        formGroup.classList.remove('error');
                    }
                });
            });
        }
    }
}

// Initialize checkout manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new CheckoutManager();
});
