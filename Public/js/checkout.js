// Global variables
let cart = JSON.parse(localStorage.getItem("cart")) || []
const currentUser = JSON.parse(localStorage.getItem("currentUser")) || null
const API_BASE = window.location.origin + "/api"

async function apiCall(endpoint, options = {}) {
  const token = localStorage.getItem("token")
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  }
  if (token) headers.Authorization = `Bearer ${token}`

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  })
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  return response.json()
}
let orderTotal = 0
const shippingCost = 9.99
const taxRate = 0.08

// DOM Elements
const elements = {
  orderItems: document.getElementById("orderItems"),
  subtotal: document.getElementById("subtotal"),
  shipping: document.getElementById("shipping"),
  tax: document.getElementById("tax"),
  finalTotal: document.getElementById("finalTotal"),
  placeOrderBtn: document.getElementById("placeOrderBtn"),
  shippingForm: document.getElementById("shippingForm"),
  paymentForm: document.getElementById("paymentForm"),
  confirmationModal: document.getElementById("confirmationModal"),
  orderNumber: document.getElementById("orderNumber"),
  deliveryDate: document.getElementById("deliveryDate"),
  loading: document.getElementById("loading"),
  toastContainer: document.getElementById("toastContainer"),
  cardDetails: document.getElementById("cardDetails"),
  paypalDetails: document.getElementById("paypalDetails"),
  codDetails: document.getElementById("codDetails"),
  cardNumber: document.getElementById("cardNumber"),
  expiryDate: document.getElementById("expiryDate"),
  cvv: document.getElementById("cvv"),
  savedAddresses: document.getElementById("savedAddresses"),
  addressOptions: document.getElementById("addressOptions"),
  useSavedAddressBtn: document.getElementById("useSavedAddressBtn"),
  useNewAddressBtn: document.getElementById("useNewAddressBtn"),
}

// Initialize checkout
document.addEventListener("DOMContentLoaded", async () => {
  initializeCheckout()
  setupEventListeners()
  loadOrderSummary()
  await prefillUserData()
})

function initializeCheckout() {
  // Redirect if cart is empty
  if (cart.length === 0) {
    showToast("Your cart is empty. Redirecting to shop...", "error")
    setTimeout(() => {
      window.location.href = "index.html"
    }, 2000)
    return
  }

  // Check if user is logged in
  if (!currentUser) {
    showToast("Please login to continue with checkout", "error")
    setTimeout(() => {
      window.location.href = "index.html"
    }, 2000)
    return
  }
}

function setupEventListeners() {
  // Payment method selection
  document.querySelectorAll('input[name="paymentMethod"]').forEach((radio) => {
    radio.addEventListener("change", handlePaymentMethodChange)
  })

  // Form validation
  elements.shippingForm.addEventListener("input", validateShippingForm)
  elements.paymentForm.addEventListener("input", validatePaymentForm)

  // Card number formatting
  elements.cardNumber.addEventListener("input", formatCardNumber)
  elements.expiryDate.addEventListener("input", formatExpiryDate)
  elements.cvv.addEventListener("input", formatCVV)

  // Phone number formatting
  document.getElementById("phone").addEventListener("input", formatPhoneNumber)

  // Place order
  elements.placeOrderBtn.addEventListener("click", handlePlaceOrder)

  // Track order button
  document.getElementById("trackOrderBtn").addEventListener("click", () => {
    showToast("Order tracking feature coming soon!")
    elements.confirmationModal.style.display = "none"
  })

  // Saved address functionality
  elements.useSavedAddressBtn.addEventListener("click", showSavedAddresses)
  elements.useNewAddressBtn.addEventListener("click", hideSavedAddresses)
}

async function loadOrderSummary() {
  let subtotal = 0
  let itemsHTML = ""

  // Fetch real product details to get accurate names, images, prices
  for (const [index, item] of cart.entries()) {
    let product
    try {
      product = await apiCall(`/products/${item.productId}`)
    } catch (e) {
      showToast("Failed to load a product in your cart", "error")
      continue
    }

    const itemTotal = (product.price || 0) * item.quantity
    subtotal += itemTotal

    itemsHTML += `
            <div class="order-item">
                <img src="${product.image}" alt="${product.name}">
                <div class="order-item-info">
                    <div class="order-item-name">${product.name}</div>
                    <div class="order-item-details">Qty: ${item.quantity}</div>
                </div>
                <div class="order-item-price">₹${itemTotal.toFixed(2)}</div>
            </div>
        `
  }

  elements.orderItems.innerHTML = itemsHTML

  // Calculate totals
  const tax = subtotal * taxRate
  const total = subtotal + shippingCost + tax

  elements.subtotal.textContent = `₹${subtotal.toFixed(2)}`
  elements.shipping.textContent = `₹${shippingCost.toFixed(2)}`
  elements.tax.textContent = `₹${tax.toFixed(2)}`
  elements.finalTotal.textContent = `₹${total.toFixed(2)}`

  orderTotal = total
}

async function prefillUserData() {
  if (currentUser) {
    document.getElementById("firstName").value = currentUser.name?.split(" ")[0] || ""
    document.getElementById("lastName").value = currentUser.name?.split(" ")[1] || ""
    document.getElementById("email").value = currentUser.email || ""
    document.getElementById("phone").value = currentUser.phone || ""

    // Try to load user's default address from saved addresses
    try {
      const addresses = await apiCall("/users/addresses")
      const defaultAddress = addresses.find(addr => addr.isDefault) || addresses[0]
      
      if (defaultAddress) {
        document.getElementById("address").value = defaultAddress.street || ""
        document.getElementById("city").value = defaultAddress.city || ""
        document.getElementById("state").value = defaultAddress.state || ""
        document.getElementById("zipCode").value = defaultAddress.zipCode || ""
        document.getElementById("country").value = defaultAddress.country || ""
      }
    } catch (error) {
      console.log("Could not load saved addresses, using empty form")
    }
  }
}

async function showSavedAddresses() {
  try {
    const addresses = await apiCall("/users/addresses")
    
    if (addresses.length === 0) {
      showToast("No saved addresses found. Please add an address in your profile first.", "info")
      return
    }

    let addressHTML = ""
    addresses.forEach(address => {
      addressHTML += `
        <div class="address-option" data-address='${JSON.stringify(address)}'>
          <div class="address-info">
            <h4>${address.label} ${address.isDefault ? '(Default)' : ''}</h4>
            <p>${address.street}, ${address.city}, ${address.state} ${address.zipCode}</p>
            <p>${address.country}</p>
          </div>
          <button type="button" class="btn-primary" onclick="selectAddress('${address._id}')">Use This Address</button>
        </div>
      `
    })

    elements.addressOptions.innerHTML = addressHTML
    elements.savedAddresses.style.display = "block"
    elements.shippingForm.style.display = "none"
  } catch (error) {
    showToast("Error loading saved addresses: " + error.message, "error")
  }
}

function hideSavedAddresses() {
  elements.savedAddresses.style.display = "none"
  elements.shippingForm.style.display = "block"
}

function selectAddress(addressId) {
  const addressElement = document.querySelector(`[data-address]`)
  if (addressElement) {
    const address = JSON.parse(addressElement.dataset.address)
    
    // Fill the form with selected address (keep existing phone number)
    document.getElementById("address").value = address.street || ""
    document.getElementById("city").value = address.city || ""
    document.getElementById("state").value = address.state || ""
    document.getElementById("zipCode").value = address.zipCode || ""
    document.getElementById("country").value = address.country || ""
    // Note: Phone number is not stored in addresses, so we keep the current value
    
    // Hide saved addresses and show form
    hideSavedAddresses()
    showToast("Address selected successfully!", "success")
  }
}

function handlePaymentMethodChange(e) {
  const method = e.target.value

  // Hide all payment details
  elements.cardDetails.style.display = "none"
  elements.paypalDetails.style.display = "none"
  elements.codDetails.style.display = "none"

  // Show selected payment method details
  switch (method) {
    case "credit_card":
      elements.cardDetails.style.display = "block"
      break
    case "paypal":
      elements.paypalDetails.style.display = "block"
      break
    case "cash_on_delivery":
      elements.codDetails.style.display = "block"
      break
  }

  validateForms()
}

function formatCardNumber(e) {
  const value = e.target.value.replace(/\s/g, "").replace(/[^0-9]/gi, "")
  const formattedValue = value.match(/.{1,4}/g)?.join(" ") || value
  e.target.value = formattedValue
}

function formatExpiryDate(e) {
  let value = e.target.value.replace(/\D/g, "")
  if (value.length >= 2) {
    value = value.substring(0, 2) + "/" + value.substring(2, 4)
  }
  e.target.value = value
}

function formatCVV(e) {
  e.target.value = e.target.value.replace(/[^0-9]/g, "")
}

function formatPhoneNumber(e) {
  let value = e.target.value.replace(/\D/g, "")
  
  // Format as +1 (XXX) XXX-XXXX for US numbers or similar international format
  if (value.length >= 10) {
    if (value.startsWith("1") && value.length === 11) {
      // US number with country code
      value = `+1 (${value.substring(1, 4)}) ${value.substring(4, 7)}-${value.substring(7)}`
    } else if (value.length === 10) {
      // US number without country code
      value = `(${value.substring(0, 3)}) ${value.substring(3, 6)}-${value.substring(6)}`
    } else if (value.length > 10) {
      // International number
      value = `+${value}`
    }
  }
  
  e.target.value = value
}

function validateShippingForm() {
  const form = elements.shippingForm
  const inputs = form.querySelectorAll("input[required], select[required]")
  let isValid = true

  inputs.forEach((input) => {
    if (!input.value.trim()) {
      isValid = false
    }
  })

  return isValid
}

function validatePaymentForm() {
  const selectedMethod = document.querySelector('input[name="paymentMethod"]:checked').value

  if (selectedMethod === "credit_card") {
    const form = elements.paymentForm
    const inputs = form.querySelectorAll("input[required]")
    let isValid = true

    inputs.forEach((input) => {
      if (!input.value.trim()) {
        isValid = false
      }
    })

    // Additional card validation
    const cardNumber = elements.cardNumber.value.replace(/\s/g, "")
    const expiryDate = elements.expiryDate.value
    const cvv = elements.cvv.value

    if (cardNumber.length < 13 || cardNumber.length > 19) {
      isValid = false
    }

    if (!/^\d{2}\/\d{2}$/.test(expiryDate)) {
      isValid = false
    }

    if (cvv.length < 3 || cvv.length > 4) {
      isValid = false
    }

    return isValid
  }

  return true // PayPal and COD don't need additional validation
}

function validateForms() {
  const shippingValid = validateShippingForm()
  const paymentValid = validatePaymentForm()
  const isValid = shippingValid && paymentValid

  elements.placeOrderBtn.disabled = !isValid
  return isValid
}

async function handlePlaceOrder() {
  if (!validateForms()) {
    showToast("Please fill in all required fields", "error")
    return
  }

  showLoading(true)
  elements.placeOrderBtn.disabled = true

  try {
    // Collect form data
    const shippingData = new FormData(elements.shippingForm)
    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value

    const orderData = {
      items: cart.map((item) => ({
        product: item.productId,
        quantity: item.quantity,
      })),
      totalAmount: orderTotal,
      shippingAddress: {
        firstName: shippingData.get("firstName"),
        lastName: shippingData.get("lastName"),
        email: shippingData.get("email"),
        phone: shippingData.get("phone"),
        street: shippingData.get("address"),
        city: shippingData.get("city"),
        state: shippingData.get("state"),
        zipCode: shippingData.get("zipCode"),
        country: shippingData.get("country"),
      },
      paymentMethod: paymentMethod,
    }

    await apiCall("/orders", {
      method: "POST",
      body: JSON.stringify(orderData),
    })

    // Clear cart
    cart = []
    localStorage.setItem("cart", JSON.stringify(cart))

    // Show confirmation
    showOrderConfirmation()
  } catch (error) {
    showToast("Failed to place order. Please try again.", "error")
    elements.placeOrderBtn.disabled = false
  } finally {
    showLoading(false)
  }
}

// Removed simulateOrderCreation; using real API

function showOrderConfirmation() {
  const orderNumber = "ORD-" + Date.now()
  const deliveryDate = new Date()
  deliveryDate.setDate(deliveryDate.getDate() + 5)

  elements.orderNumber.textContent = orderNumber
  elements.deliveryDate.textContent = deliveryDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  elements.confirmationModal.style.display = "block"

  // Update progress
  document.querySelectorAll(".progress-step").forEach((step) => {
    step.classList.add("active")
  })
}

// Utility Functions
function showLoading(show) {
  elements.loading.style.display = show ? "flex" : "none"
}

function showToast(message, type = "success") {
  const toast = document.createElement("div")
  toast.className = `toast ${type}`
  toast.textContent = message

  elements.toastContainer.appendChild(toast)

  setTimeout(() => {
    toast.remove()
  }, 3000)
}

// Add toast styles if not already present
if (!document.querySelector(".toast")) {
  const style = document.createElement("style")
  style.textContent = `
        .toast {
            background: #10b981;
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            margin-bottom: 0.5rem;
            animation: slideIn 0.3s ease;
        }
        
        .toast.error {
            background: #ef4444;
        }
        
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
    `
  document.head.appendChild(style)
}
