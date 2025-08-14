// Modern Shopping List Integration with Cart System

function add(id) {
    try {
        // Parse the item string (format: "Name || Rs.Price")
        const [name, priceStr] = id.split('||');
        const price = parseFloat(priceStr.replace(/[^0-9.]/g, ''));
        
        if (!name || isNaN(price)) {
            throw new Error('Invalid item format');
        }

        // Get existing cart or initialize empty array
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        
        // Convert old format items to new format if needed
        cart = cart.map(item => {
            if (typeof item === 'string') {
                const [itemName, itemPriceStr] = item.split('||');
                return {
                    id: generateId(itemName.trim()),
                    name: itemName.trim(),
                    price: parseFloat(itemPriceStr.replace(/[^0-9.]/g, '')),
                    quantity: 1,
                    image: getDefaultImage(itemName.trim())
                };
            }
            return item;
        });

        // Check if item already exists
        const existingItem = cart.find(item => item.name === name.trim());
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                id: generateId(name.trim()),
                name: name.trim(),
                price: price,
                quantity: 1,
                image: getDefaultImage(name.trim())
            });
        }
        
        // Save to localStorage
        localStorage.setItem('cart', JSON.stringify(cart));
        
        // Show success message
        showAddToCartMessage(name.trim());
        
        // Update cart count
        updateCartCount();
        
        // Update display if on products page
        updateCartDisplay();
        
        console.log('Item added to cart:', { name: name.trim(), price, quantity: 1 });
        
    } catch (error) {
        console.error('Error adding item to cart:', error);
        alert('Error adding item to cart. Please try again.');
    }
}

function generateId(name) {
    return name.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Date.now();
}

function getDefaultImage(name) {
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

function showAddToCartMessage(itemName) {
    // Create floating success message
    const message = document.createElement('div');
    message.className = 'add-to-cart-message';
    message.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>${itemName} added to cart!</span>
    `;
    
    // Add styles
    message.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #27ae60;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-family: 'Poppins', sans-serif;
        font-weight: 500;
        animation: slideInRight 0.3s ease;
    `;
    
    // Add animation styles
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOutRight {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(message);
    
    // Remove after 3 seconds
    setTimeout(() => {
        message.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            if (message.parentNode) {
                message.remove();
            }
            if (style.parentNode) {
                style.remove();
            }
        }, 300);
    }, 3000);
}

function updateCartCount() {
    try {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const totalItems = cart.reduce((sum, item) => {
            return sum + (item.quantity || 1);
        }, 0);
        
        const cartElement = document.getElementById('cart');
        if (cartElement) {
            cartElement.textContent = `Cart (${totalItems})`;
        }
    } catch (error) {
        console.error('Error updating cart count:', error);
    }
}

function updateCartDisplay() {
    try {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const ul = document.getElementById('ul_pr');
        
        if (!ul) return;
        
        ul.innerHTML = '';
        
        if (cart.length === 0) {
            const li = document.createElement('li');
            li.textContent = 'Your cart is empty';
            li.style.color = '#666';
            li.style.fontStyle = 'italic';
            ul.appendChild(li);
            return;
        }
        
        cart.forEach(item => {
            const li = document.createElement('li');
            li.innerHTML = `
                <strong>${item.name}</strong> - 
                ₹${item.price.toFixed(2)} × ${item.quantity} = 
                <span style="color: #f84258; font-weight: bold;">₹${(item.price * item.quantity).toFixed(2)}</span>
            `;
            li.style.marginBottom = '0.5rem';
            li.style.padding = '0.5rem';
            li.style.background = '#f8f9fa';
            li.style.borderRadius = '4px';
            li.style.listStyle = 'none';
            ul.appendChild(li);
        });
        
        // Add total
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const totalLi = document.createElement('li');
        totalLi.innerHTML = `
            <strong style="color: #2c3e50; font-size: 1.1rem;">
                Total: ₹${total.toFixed(2)}
            </strong>
        `;
        totalLi.style.marginTop = '1rem';
        totalLi.style.padding = '1rem';
        totalLi.style.background = '#e9ecef';
        totalLi.style.borderRadius = '4px';
        totalLi.style.listStyle = 'none';
        totalLi.style.textAlign = 'center';
        ul.appendChild(totalLi);
        
    } catch (error) {
        console.error('Error updating cart display:', error);
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    updateCartDisplay();
    updateCartCount();
});

// Listen for storage changes (cross-tab updates)
window.addEventListener('storage', (e) => {
    if (e.key === 'cart') {
        updateCartDisplay();
        updateCartCount();
    }
});

// Legacy function for compatibility
function emptyList() {
    localStorage.removeItem('cart');
    updateCartDisplay();
    updateCartCount();
}
