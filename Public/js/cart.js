document.addEventListener("DOMContentLoaded", () => {
  const cartItems = document.getElementById("cart-items");
  const cartTotal = document.getElementById("cart-total");
  const clearCartButton = document.getElementById("clear-cart");

  function loadCart() {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];

    cartItems.innerHTML = "";

    if (cart.length === 0) {
      cartItems.innerHTML = "<p>Your cart is empty.</p>";
      cartTotal.textContent = "₹0.00";
      return;
    }

    let total = 0;

    cart.forEach((item, index) => {
      const [name, price] = item.split("||");
      const priceValue = parseFloat(price.replace("Rs.", "").trim());

      const itemElement = document.createElement("div");
      itemElement.classList.add("cart-item");
      itemElement.innerHTML = `
        <h3>${name}</h3>
        <p>Price: ${price}</p>
        <button class="remove-item" data-index="${index}">Remove</button>
      `;
      cartItems.appendChild(itemElement);

      total += priceValue;
    });

    cartTotal.textContent = `₹${total.toFixed(2)}`;
  }

  function clearCart() {
    localStorage.removeItem("cart");
    loadCart();
  }

  function removeItemFromCart(index) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    cart.splice(index, 1);
    localStorage.setItem("cart", JSON.stringify(cart));
    loadCart();
  }

  clearCartButton.addEventListener("click", clearCart);

  cartItems.addEventListener("click", (e) => {
    if (e.target.classList.contains("remove-item")) {
      const index = parseInt(e.target.getAttribute("data-index"), 10);
      removeItemFromCart(index);
    }
  });

  loadCart();
});
