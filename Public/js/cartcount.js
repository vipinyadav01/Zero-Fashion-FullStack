function updateCartCount() {
  let cartCount = localStorage.getItem("cart");
  const cart = document.getElementById("cart");
  
  if (!cart) return; // Exit if cart element doesn't exist
  
  try {
    if (cartCount) {
      cartCount = JSON.parse(cartCount);
      cartCount = Array.isArray(cartCount) ? cartCount.length : 0;
    } else {
      cartCount = 0;
    }
  } catch (error) {
    console.error("Error parsing cart data:", error);
    cartCount = 0;
  }
  
  cart.textContent = `Cart (${cartCount})`;
}

// Update cart count on page load
document.addEventListener('DOMContentLoaded', updateCartCount);

// Update cart count when storage changes (for cross-tab updates)
window.addEventListener('storage', function(e) {
  if (e.key === 'cart') {
    updateCartCount();
  }
});