document.addEventListener("DOMContentLoaded", () => {
  const cartItems = document.getElementById("cart-items");
  const cartTotal = document.getElementById("cart-total");
  const clearCartButton = document.getElementById("clear-cart");

  function loadCart() {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    console.log("Cart data:", cart);

    cartItems.innerHTML = "";

    if (cart.length === 0) {
      cartItems.innerHTML = "<p>Your cart is empty.</p>";
      cartTotal.textContent = "0.00";
      return;
    }

    let total = 0;

    cart.forEach((item) => {
      const itemElement = document.createElement("div");
      itemElement.classList.add("cart-item");
      itemElement.innerHTML = `
                <h3>${item.name}</h3>
                <p>Price: $${item.price.toFixed(2)}</p>
                <p>Quantity: ${item.quantity}</p>
                <button class="remove-item" data-name="${
                  item.name
                }">Remove</button>
            `;
      cartItems.appendChild(itemElement);

      total += item.price * item.quantity;
    });

    cartTotal.textContent = total.toFixed(2);
  }

  function clearCart() {
    localStorage.removeItem("cart");
    loadCart();
  }

  clearCartButton.addEventListener("click", clearCart);


  cartItems.addEventListener("click", (e) => {
    if (e.target.classList.contains("remove-item")) {
      const itemName = e.target.getAttribute("data-name");
      removeItemFromCart(itemName);
      loadCart();
    }
  });

  function removeItemFromCart(itemName) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    cart = cart.filter((item) => item.name !== itemName);
    localStorage.setItem("cart", JSON.stringify(cart));
  }

  loadCart();
});
