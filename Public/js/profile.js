// Global variables
let currentUser = JSON.parse(localStorage.getItem("currentUser")) || null
let currentSection = "profile"
let userOrders = []
let userAddresses = []
let editingAddressId = null

// API Base URL
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
  
  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`HTTP ${response.status}: ${errorText}`)
  }
  
  return response.json()
}

// DOM Elements
const elements = {
  userName: document.getElementById("userName"),
  userEmail: document.getElementById("userEmail"),
  cartCount: document.getElementById("cartCount"),
  logoutBtn: document.getElementById("logoutBtn"),
  loading: document.getElementById("loading"),
  toastContainer: document.getElementById("toastContainer"),

  // Profile
  profileForm: document.getElementById("profileForm"),
  editProfileBtn: document.getElementById("editProfileBtn"),
  cancelEditBtn: document.getElementById("cancelEditBtn"),
  profileActions: document.getElementById("profileActions"),

  // Orders
  ordersList: document.getElementById("ordersList"),
  orderFilter: document.getElementById("orderFilter"),
  ordersPagination: document.getElementById("ordersPagination"),
  orderDetailsModal: document.getElementById("orderDetailsModal"),
  closeOrderDetailsModal: document.getElementById("closeOrderDetailsModal"),
  orderDetailsContent: document.getElementById("orderDetailsContent"),

  // Addresses
  addressesGrid: document.getElementById("addressesGrid"),
  addAddressBtn: document.getElementById("addAddressBtn"),
  addressModal: document.getElementById("addressModal"),
  closeAddressModal: document.getElementById("closeAddressModal"),
  addressForm: document.getElementById("addressForm"),
  cancelAddressBtn: document.getElementById("cancelAddressBtn"),

  // Security
  passwordForm: document.getElementById("passwordForm"),
  lastLogin: document.getElementById("lastLogin"),
  memberSince: document.getElementById("memberSince"),
}

// Initialize profile page
document.addEventListener("DOMContentLoaded", async () => {
  await checkAuth()
  setupEventListeners()
  loadUserData()
  updateCartCount()
})

async function checkAuth() {
  if (currentUser) return
  const token = localStorage.getItem("token")
  if (!token) {
    showToast("Please login to access your profile", "error")
    setTimeout(() => {
      window.location.href = "index.html"
    }, 1500)
    return
  }
  try {
    const user = await apiCall("/auth/me")
    currentUser = user
    localStorage.setItem("currentUser", JSON.stringify(user))
  } catch (e) {
    localStorage.removeItem("token")
    showToast("Session expired. Please login again.", "error")
    setTimeout(() => {
      window.location.href = "index.html"
    }, 1500)
  }
}

function setupEventListeners() {
  // Navigation
  document.querySelectorAll(".profile-nav-item").forEach((item) => {
    item.addEventListener("click", (e) => {
      e.preventDefault()
      const section = item.dataset.section
      switchSection(section)
    })
  })

  // Profile editing
  elements.editProfileBtn.addEventListener("click", enableProfileEdit)
  elements.cancelEditBtn.addEventListener("click", cancelProfileEdit)
  elements.profileForm.addEventListener("submit", handleProfileUpdate)

  // Orders
  elements.orderFilter.addEventListener("change", loadUserOrders)
  elements.closeOrderDetailsModal.addEventListener("click", () => {
    elements.orderDetailsModal.style.display = "none"
  })

  // Addresses
  elements.addAddressBtn.addEventListener("click", () => openAddressModal())
  elements.closeAddressModal.addEventListener("click", closeAddressModal)
  elements.cancelAddressBtn.addEventListener("click", closeAddressModal)
  elements.addressForm.addEventListener("submit", handleAddressSubmit)

  // Security
  elements.passwordForm.addEventListener("submit", handlePasswordChange)

  // Logout
  elements.logoutBtn.addEventListener("click", logout)

  // Close modals on outside click
  window.addEventListener("click", (e) => {
    if (e.target === elements.orderDetailsModal) {
      elements.orderDetailsModal.style.display = "none"
    }
    if (e.target === elements.addressModal) {
      closeAddressModal()
    }
  })

  // Cart button navigates home
  const cartBtn = document.getElementById("cartBtn")
  if (cartBtn) {
    cartBtn.addEventListener("click", () => (window.location.href = "index.html"))
  }
}

function switchSection(section) {
  // Update navigation
  document.querySelectorAll(".profile-nav-item").forEach((item) => {
    item.classList.remove("active")
  })
  document.querySelector(`[data-section="${section}"]`).classList.add("active")

  // Update content
  document.querySelectorAll(".profile-section").forEach((section) => {
    section.classList.remove("active")
  })
  document.getElementById(`${section}-section`).classList.add("active")

  currentSection = section

  // Load section data
  switch (section) {
    case "orders":
      loadUserOrders()
      break
    case "addresses":
      loadUserAddresses()
      break
  }
}

// User Data Functions
async function loadUserData() {
  showLoading(true)
  try {
    // For demo, use stored user data
    if (currentUser) {
      elements.userName.textContent = currentUser.name || "User"
      elements.userEmail.textContent = currentUser.email || "user@example.com"

      // Populate profile form
      document.getElementById("fullName").value = currentUser.name || ""
      document.getElementById("email").value = currentUser.email || ""
      document.getElementById("phone").value = currentUser.phone || ""

      // Set security info
      elements.lastLogin.textContent = "Today at 2:30 PM"
      elements.memberSince.textContent = new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    }
  } catch (error) {
    showToast("Error loading user data", "error")
  } finally {
    showLoading(false)
  }
}

// Profile Management
function enableProfileEdit() {
  const inputs = elements.profileForm.querySelectorAll("input")
  inputs.forEach((input) => {
    input.disabled = false
  })

  elements.editProfileBtn.style.display = "none"
  elements.profileActions.style.display = "flex"
}

function cancelProfileEdit() {
  const inputs = elements.profileForm.querySelectorAll("input")
  inputs.forEach((input) => {
    input.disabled = true
  })

  elements.editProfileBtn.style.display = "inline-flex"
  elements.profileActions.style.display = "none"

  // Reset form values
  loadUserData()
}

async function handleProfileUpdate(e) {
  e.preventDefault()
  showLoading(true)

  try {
    const formData = new FormData(e.target)
    const userData = {
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
    }

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Update stored user data
    currentUser = { ...currentUser, ...userData }
    localStorage.setItem("currentUser", JSON.stringify(currentUser))

    showToast("Profile updated successfully!")
    cancelProfileEdit()
  } catch (error) {
    showToast("Error updating profile", "error")
  } finally {
    showLoading(false)
  }
}

// Orders Management
async function loadUserOrders() {
  showLoading(true)
  try {
    const data = await apiCall(`/orders/my-orders`)
    userOrders = data.orders || []
    displayUserOrders(userOrders)
  } catch (error) {
    showToast("Error loading orders", "error")
  } finally {
    showLoading(false)
  }
}

function generateSampleUserOrders(count) {
  const statuses = ["pending", "processing", "shipped", "delivered", "cancelled"]
  const orders = []

  for (let i = 1; i <= count; i++) {
    const date = new Date()
    date.setDate(date.getDate() - Math.floor(Math.random() * 60))

    const items = [
      {
        name: `Product ${i}`,
        quantity: Math.floor(Math.random() * 3) + 1,
        price: Math.floor(Math.random() * 100) + 20,
        image: `/placeholder.svg?height=50&width=50&query=order product ${i}`,
      },
    ]

    orders.push({
      _id: `order-${i}`,
      orderNumber: `ORD-${String(i).padStart(4, "0")}`,
      date: date.toISOString(),
      status: statuses[Math.floor(Math.random() * statuses.length)],
      items: items,
      total: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
      trackingNumber: Math.random() > 0.5 ? `TRK${Math.random().toString(36).substr(2, 9).toUpperCase()}` : null,
    })
  }

  return orders.sort((a, b) => new Date(b.date) - new Date(a.date))
}

function displayUserOrders(orders) {
  const filterValue = elements.orderFilter.value
  const filteredOrders = filterValue ? orders.filter((order) => order.status === filterValue) : orders

  if (filteredOrders.length === 0) {
    elements.ordersList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-shopping-bag"></i>
                <h3>No orders found</h3>
                <p>You haven't placed any orders yet.</p>
                <a href="index.html" class="btn-primary">Start Shopping</a>
            </div>
        `
    return
  }

  elements.ordersList.innerHTML = filteredOrders
    .map(
      (order) => `
        <div class="order-card">
            <div class="order-header">
                <div class="order-info">
                    <h4>${order._id}</h4>
                    <p>Placed on ${new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <div class="order-status">
                    <span class="status-badge ${order.status}">${order.status}</span>
                    <span class="order-total">$${(order.totalAmount || 0).toFixed(2)}</span>
                </div>
            </div>
            
            <div class="order-items">
                ${(order.items || [])
                  .map(
                    (item) => `
                    <div class="order-item">
                        <img src="${item.product?.image || '/placeholder.svg?height=50&width=50'}" alt="${item.product?.name || 'Item'}">
                        <div class="order-item-info">
                            <div class="order-item-name">${item.product?.name || 'Item'}</div>
                            <div class="order-item-details">Qty: ${item.quantity} • $${item.price}</div>
                        </div>
                    </div>
                `,
                  )
                  .join("")}
            </div>
            
            <div class="order-actions">
                <button class="btn-secondary btn-small" onclick="viewOrderDetails('${order._id}')">
                    View Details
                </button>
                ${
                  order.trackingNumber
                    ? `<button class="btn-primary btn-small" onclick="trackOrder('${order.trackingNumber}')">
                        Track Order
                    </button>`
                    : ""
                }
                ${
                  ["pending", "processing"].includes(order.status)
                    ? `<button class="btn-secondary btn-small" onclick="cancelOrder('${order._id}')">
                        Cancel Order
                    </button>`
                    : ""
                }
            </div>
        </div>
    `,
    )
    .join("")
}

function viewOrderDetails(orderId) {
  const order = userOrders.find((o) => o._id === orderId)
  if (!order) return

  elements.orderDetailsContent.innerHTML = `
        <div class="order-detail-header">
            <h4>Order ${order._id}</h4>
            <span class="status-badge ${order.status}">${order.status}</span>
        </div>
        
        <div class="order-detail-info">
            <div class="detail-section">
                <h5>Order Information</h5>
                <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
                <p><strong>Status:</strong> ${order.status}</p>
                ${order.trackingNumber ? `<p><strong>Tracking:</strong> ${order.trackingNumber}</p>` : ""}
            </div>
            
            <div class="detail-section">
                <h5>Items Ordered</h5>
                ${(order.items || [])
                  .map(
                    (item) => `
                    <div class="detail-item">
                        <img src="${item.product?.image || '/placeholder.svg?height=50&width=50'}" alt="${item.product?.name || 'Item'}">
                        <div class="item-info">
                            <div class="item-name">${item.product?.name || 'Item'}</div>
                            <div class="item-details">Quantity: ${item.quantity} • Price: $${item.price}</div>
                        </div>
                        <div class="item-total">$${(item.price * item.quantity).toFixed(2)}</div>
                    </div>
                `,
                  )
                  .join("")}
            </div>
            
            <div class="detail-section">
                <div class="order-summary">
                    <div class="summary-row">
                        <span>Subtotal:</span>
                        <span>$${(order.totalAmount || 0).toFixed(2)}</span>
                    </div>
                    <div class="summary-row">
                        <span>Shipping:</span>
                        <span>$9.99</span>
                    </div>
                    <div class="summary-row total">
                        <span>Total:</span>
                        <span>$${((order.totalAmount || 0) + 9.99).toFixed(2)}</span>
                    </div>
                </div>
            </div>
        </div>
    `

  elements.orderDetailsModal.style.display = "block"
}

function trackOrder(trackingNumber) {
  showToast(`Tracking order with number: ${trackingNumber}`)
}

async function cancelOrder(orderId) {
  if (!confirm("Are you sure you want to cancel this order?")) return

  showLoading(true)
  try {
    await apiCall(`/orders/${orderId}/cancel`, { method: "PUT" })
    showToast("Order cancelled successfully!")
    loadUserOrders()
  } catch (error) {
    showToast("Error cancelling order", "error")
  } finally {
    showLoading(false)
  }
}

// Address Management
async function loadUserAddresses() {
  showLoading(true)
  try {
    const addresses = await apiCall("/users/addresses")
    userAddresses = addresses || []
    displayUserAddresses(userAddresses)
  } catch (error) {
    showToast("Error loading addresses: " + error.message, "error")
  } finally {
    showLoading(false)
  }
}

function displayUserAddresses(addresses) {
  if (addresses.length === 0) {
    elements.addressesGrid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-map-marker-alt"></i>
                <h3>No addresses saved</h3>
                <p>Add an address to make checkout faster.</p>
            </div>
        `
    return
  }

  elements.addressesGrid.innerHTML = addresses
    .map(
      (address) => `
        <div class="address-card ${address.isDefault ? "default" : ""}">
            <div class="address-header">
                <span class="address-label">${address.label}</span>
                <div class="address-actions">
                    <button class="btn-secondary btn-small" onclick="editAddress('${address._id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-secondary btn-small" onclick="deleteAddress('${address._id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="address-details">
                ${address.street}<br>
                ${address.city}, ${address.state} ${address.zipCode}<br>
                ${address.country}
            </div>
        </div>
    `,
    )
    .join("")
}

function openAddressModal(addressId = null) {
  const isEdit = addressId !== null
  editingAddressId = addressId
  document.getElementById("addressModalTitle").textContent = isEdit ? "Edit Address" : "Add Address"

  if (isEdit) {
    const address = userAddresses.find((a) => a._id === addressId)
    if (address) {
      document.getElementById("addressLabel").value = address.label
      document.getElementById("addressStreet").value = address.street
      document.getElementById("addressCity").value = address.city
      document.getElementById("addressState").value = address.state
      document.getElementById("addressZip").value = address.zipCode
      document.getElementById("addressCountry").value = address.country
      document.getElementById("defaultAddress").checked = address.isDefault
    }
  } else {
    elements.addressForm.reset()
    editingAddressId = null
  }

  elements.addressModal.style.display = "block"
}

function closeAddressModal() {
  elements.addressModal.style.display = "none"
  elements.addressForm.reset()
  editingAddressId = null
}

async function handleAddressSubmit(e) {
  e.preventDefault()
  showLoading(true)

  try {
    const formData = new FormData(e.target)
    const addressData = {
      label: formData.get("label"),
      street: formData.get("street"),
      city: formData.get("city"),
      state: formData.get("state"),
      zipCode: formData.get("zipCode"),
      country: formData.get("country"),
      isDefault: formData.get("isDefault") === "on",
    }

    const isEdit = editingAddressId !== null
    if (isEdit) {
      await apiCall(`/users/addresses/${editingAddressId}`, {
        method: "PUT",
        body: JSON.stringify(addressData),
      })
      showToast("Address updated successfully!")
    } else {
      await apiCall("/users/addresses", {
        method: "POST",
        body: JSON.stringify(addressData),
      })
      showToast("Address saved successfully!")
    }
    
    closeAddressModal()
    loadUserAddresses()
  } catch (error) {
    showToast("Error saving address", "error")
  } finally {
    showLoading(false)
  }
}

function editAddress(addressId) {
  openAddressModal(addressId)
}

async function deleteAddress(addressId) {
  if (!confirm("Are you sure you want to delete this address?")) return

  showLoading(true)
  try {
    await apiCall(`/users/addresses/${addressId}`, { method: "DELETE" })
    showToast("Address deleted successfully!")
    loadUserAddresses()
  } catch (error) {
    showToast("Error deleting address", "error")
  } finally {
    showLoading(false)
  }
}

// Security Management
async function handlePasswordChange(e) {
  e.preventDefault()

  const currentPassword = document.getElementById("currentPassword").value
  const newPassword = document.getElementById("newPassword").value
  const confirmPassword = document.getElementById("confirmPassword").value

  if (newPassword !== confirmPassword) {
    showToast("New passwords do not match", "error")
    return
  }

  if (newPassword.length < 6) {
    showToast("Password must be at least 6 characters long", "error")
    return
  }

  showLoading(true)
  try {
    await apiCall(`/users/${currentUser.id}/password`, {
      method: "PUT",
      body: JSON.stringify({ currentPassword, newPassword }),
    })

    showToast("Password updated successfully!")
    elements.passwordForm.reset()
  } catch (error) {
    showToast("Error updating password", "error")
  } finally {
    showLoading(false)
  }
}

// Utility Functions
function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem("cart")) || []
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)
  elements.cartCount.textContent = totalItems
}

function logout() {
  localStorage.removeItem("currentUser")
  localStorage.removeItem("token")
  window.location.href = "index.html"
}

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

// Add required CSS for new components
const additionalStyles = `
    .empty-state {
        text-align: center;
        padding: 3rem;
        color: #6b7280;
    }
    
    .empty-state i {
        font-size: 3rem;
        margin-bottom: 1rem;
        color: #d1d5db;
    }
    
    .empty-state h3 {
        margin-bottom: 0.5rem;
        color: #374151;
    }
    
    .order-detail-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 2rem;
        padding-bottom: 1rem;
        border-bottom: 1px solid #e5e7eb;
    }
    
    .detail-section {
        margin-bottom: 2rem;
    }
    
    .detail-section h5 {
        margin-bottom: 1rem;
        color: #1f2937;
    }
    
    .detail-item {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1rem 0;
        border-bottom: 1px solid #e5e7eb;
    }
    
    .detail-item img {
        width: 60px;
        height: 60px;
        object-fit: cover;
        border-radius: 8px;
    }
    
    .item-info {
        flex: 1;
    }
    
    .item-name {
        font-weight: 600;
        margin-bottom: 0.25rem;
    }
    
    .item-details {
        color: #6b7280;
        font-size: 0.9rem;
    }
    
    .item-total {
        font-weight: 600;
        color: #1f2937;
    }
    
    .order-summary {
        background: #f9fafb;
        padding: 1rem;
        border-radius: 8px;
    }
    
    .summary-row {
        display: flex;
        justify-content: space-between;
        margin-bottom: 0.5rem;
    }
    
    .summary-row.total {
        font-weight: 600;
        font-size: 1.1rem;
        border-top: 1px solid #e5e7eb;
        padding-top: 0.5rem;
        margin-top: 0.5rem;
    }
`

const styleSheet = document.createElement("style")
styleSheet.textContent = additionalStyles
document.head.appendChild(styleSheet)
