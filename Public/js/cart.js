// Modern Cart Management System
class CartManager {
    constructor() {
        this.cart = [];
        this.shippingCost = 50;
        this.taxRate = 0.18;
        this.init();
    }

    init() {
        this.loadCartFromStorage();
        this.bindEvents();
        this.renderCart();
    }

    // Load cart from localStorage
    loadCartFromStorage() {
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
                
                this.saveCartToStorage();
            }
        } catch (error) {
            console.error('Error loading cart from storage:', error);
            this.cart = [];
        }
    }

    // Save cart to localStorage
    saveCartToStorage() {
        try {
            localStorage.setItem('cart', JSON.stringify(this.cart));
            this.updateCartCount();
            // Trigger storage event for other tabs
            window.dispatchEvent(new StorageEvent('storage', {
                key: 'cart',
                newValue: JSON.stringify(this.cart)
            }));
        } catch (error) {
            console.error('Error saving cart to storage:', error);
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

    // Add item to cart
    addItem(name, price, image = null) {
        const existingItem = this.cart.find(item => item.name === name);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.cart.push({
                id: this.generateId(name),
                name: name,
                price: parseFloat(price),
                quantity: 1,
                image: image || this.getDefaultImage(name)
            });
        }
        
        this.saveCartToStorage();
        this.renderCart();
        this.showMessage('Item added to cart!', 'success');
    }

    // Remove item from cart
    removeItem(itemId) {
        this.cart = this.cart.filter(item => item.id !== itemId);
        this.saveCartToStorage();
        this.renderCart();
        this.showMessage('Item removed from cart', 'success');
    }

    // Update item quantity
    updateQuantity(itemId, newQuantity) {
        const item = this.cart.find(item => item.id === itemId);
        if (item && newQuantity > 0) {
            item.quantity = newQuantity;
            this.saveCartToStorage();
            this.renderCart();
        } else if (newQuantity <= 0) {
            this.removeItem(itemId);
        }
    }

    // Clear entire cart
    clearCart() {
        if (this.cart.length === 0) {
            this.showMessage('Cart is already empty', 'error');
            return;
        }
        
        if (confirm('Are you sure you want to clear your cart?')) {
            this.cart = [];
            this.saveCartToStorage();
            this.renderCart();
            this.showMessage('Cart cleared successfully', 'success');
        }
    }

    // Calculate totals
    calculateTotals() {
        const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const shipping = this.cart.length > 0 ? this.shippingCost : 0;
        const tax = subtotal * this.taxRate;
        const total = subtotal + shipping + tax;

        return {
            subtotal: subtotal,
            shipping: shipping,
            tax: tax,
            total: total
        };
    }

    // Render cart items
    renderCart() {
        const cartItemsContainer = document.getElementById('cart-items');
        const emptyCartMessage = document.getElementById('empty-cart');
        
        if (!cartItemsContainer) return;

        if (this.cart.length === 0) {
            cartItemsContainer.style.display = 'none';
            emptyCartMessage.style.display = 'block';
        } else {
            cartItemsContainer.style.display = 'block';
            emptyCartMessage.style.display = 'none';
            
            cartItemsContainer.innerHTML = this.cart.map(item => `
                <div class="cart-item" data-id="${item.id}">
                    <div class="item-image">
                        <i class="${item.image}"></i>
                    </div>
                    <div class="item-details">
                        <h4>${item.name}</h4>
                        <p>₹${item.price.toFixed(2)} each</p>
                    </div>
                    <div class="item-price">
                        ₹${(item.price * item.quantity).toFixed(2)}
                    </div>
                    <div class="quantity-controls">
                        <button class="quantity-btn decrease" data-id="${item.id}" ${item.quantity <= 1 ? 'disabled' : ''}>
                            <i class="fas fa-minus"></i>
                        </button>
                        <span class="quantity-display">${item.quantity}</span>
                        <button class="quantity-btn increase" data-id="${item.id}">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                    <button class="remove-item" data-id="${item.id}">
                        <i class="fas fa-trash"></i>
                        Remove
                    </button>
                </div>
            `).join('');
        }

        this.updateSummary();
    }

    // Update cart summary
    updateSummary() {
        const totals = this.calculateTotals();
        
        const elements = {
            subtotal: document.getElementById('cart-subtotal'),
            shipping: document.getElementById('cart-shipping'),
            tax: document.getElementById('cart-tax'),
            total: document.getElementById('cart-total')
        };

        if (elements.subtotal) elements.subtotal.textContent = `₹${totals.subtotal.toFixed(2)}`;
        if (elements.shipping) elements.shipping.textContent = `₹${totals.shipping.toFixed(2)}`;
        if (elements.tax) elements.tax.textContent = `₹${totals.tax.toFixed(2)}`;
        if (elements.total) elements.total.textContent = `₹${totals.total.toFixed(2)}`;
    }

    // Update cart count in navbar
    updateCartCount() {
        const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
        const cartElement = document.getElementById('cart');
        if (cartElement) {
            cartElement.textContent = `Cart (${totalItems})`;
        }
    }

    // Show success/error messages
    showMessage(message, type = 'success') {
        // Remove existing messages
        const existingMessages = document.querySelectorAll('.message');
        existingMessages.forEach(msg => msg.remove());

        // Create new message
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.textContent = message;

        // Insert at top of cart container
        const cartContainer = document.querySelector('.cart-container');
        if (cartContainer) {
            cartContainer.insertBefore(messageDiv, cartContainer.firstChild);
            
            // Auto remove after 3 seconds
            setTimeout(() => {
                if (messageDiv.parentNode) {
                    messageDiv.remove();
                }
            }, 3000);
        }
    }

    // Bind event listeners
    bindEvents() {
        // Clear cart button
        const clearCartBtn = document.getElementById('clear-cart');
        if (clearCartBtn) {
            clearCartBtn.addEventListener('click', () => this.clearCart());
        }

        // Checkout button
        const checkoutBtn = document.getElementById('checkout-button');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => {
                if (this.cart.length === 0) {
                    this.showMessage('Your cart is empty. Add some items first!', 'error');
                    return;
                }
                window.location.href = 'checkout.html';
            });
        }

        // Delegate events for dynamic cart items
        const cartItemsContainer = document.getElementById('cart-items');
        if (cartItemsContainer) {
            cartItemsContainer.addEventListener('click', (e) => {
                const itemId = e.target.dataset.id || e.target.closest('[data-id]')?.dataset.id;
                if (!itemId) return;

                if (e.target.classList.contains('decrease') || e.target.closest('.decrease')) {
                    const item = this.cart.find(item => item.id === itemId);
                    if (item) {
                        this.updateQuantity(itemId, item.quantity - 1);
                    }
                } else if (e.target.classList.contains('increase') || e.target.closest('.increase')) {
                    const item = this.cart.find(item => item.id === itemId);
                    if (item) {
                        this.updateQuantity(itemId, item.quantity + 1);
                    }
                } else if (e.target.classList.contains('remove-item') || e.target.closest('.remove-item')) {
                    this.removeItem(itemId);
                }
            });
        }

        // Listen for storage changes (cross-tab updates)
        window.addEventListener('storage', (e) => {
            if (e.key === 'cart') {
                this.loadCartFromStorage();
                this.renderCart();
            }
        });
    }

    // Public method to get cart data
    getCartData() {
        return {
            items: this.cart,
            totals: this.calculateTotals()
        };
    }
}

// Global cart manager instance
let cartManager;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    cartManager = new CartManager();
});

// Global function for adding items (for compatibility with existing code)
window.addToCart = function(name, price, image = null) {
    if (cartManager) {
        cartManager.addItem(name, price, image);
    } else {
        console.error('Cart manager not initialized');
    }
};

// Global function for legacy add function
window.add = function(itemString) {
    if (cartManager) {
        const [name, priceStr] = itemString.split('||');
        const price = parseFloat(priceStr.replace(/[^0-9.]/g, ''));
        cartManager.addItem(name.trim(), price);
    } else {
        console.error('Cart manager not initialized');
    }
};

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CartManager;
}