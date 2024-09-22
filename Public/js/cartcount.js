let cartCount = localStorage.getItem("cart");


cartCount = JSON.parse(cartCount);
cartCount = cartCount.length;

const cart = document.getElementById("cart");

cart.textContent = `cart (${cartCount})`