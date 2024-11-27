let totalAmout = document.querySelectorAll(".totalAmount");
let totalCount = document.querySelector(".totalCount");

function loadCart() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  let total =0;
  cart.forEach((item) => {
    const splittedItem = item.split("||")
    total += parseInt(splittedItem[1].split("Rs.")[1]);
  });

  totalCount.textContent = `Product Name x ${cart.length}(Qty)`;

  totalAmout.forEach((amount) => {
    console.log(amount);
    
    amount.textContent = `₹ ${total}`;
  });
}
document.addEventListener("DOMContentLoaded", function () {
  loadCart();

  const placeOrderBtn = document.getElementById("placeOrderBtn");
  if (placeOrderBtn) {
    placeOrderBtn.addEventListener("click", function () {
      console.log("Place Order button clicked via event listener");
      window.location.href = "payment.html";
    });
  }
});

// This function is called directly from the HTML
function placeOrder() {
  console.log("Place Order function called");
  window.location.href = "payment.html";
}

// Get the total cost from the query parameter
const urlParams = new URLSearchParams(window.location.search);
const totalCost = urlParams.get("total");

// Update the hidden input field and display the total cost
document.getElementById("total-cost").value = totalCost;
document.getElementById("total-amount").innerText = totalCost;
