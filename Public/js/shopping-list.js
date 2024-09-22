let shoppingList = [];

function add(id) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    let [name, price] = id.split(' || ');
    price = parseFloat(price.replace('Rs.', ''));
    
    let existingItem = cart.find(item => item.name === name);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ name, price, quantity: 1 });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    console.log('Item added to cart:', { name, price });
    alert('Item added to cart!');
    updateCartDisplay();
}

function updateCartDisplay() {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    let ul = document.getElementById('ul_pr');
    ul.innerHTML = '';
    cart.forEach(item => {
        let li = document.createElement('li');
        li.textContent = `${item.name} - Quantity: ${item.quantity}`;
        ul.appendChild(li);
    });
}

// Call this function when the page loads
document.addEventListener('DOMContentLoaded', updateCartDisplay);

function emptyList() {
    shoppingList = [];
    updateShoppingList();
}
