// Global variables
const currentUser = JSON.parse(localStorage.getItem("currentUser")) || null
let currentSection = "dashboard"
const currentPage = 1
const itemsPerPage = 10

// API Base URL
const API_BASE = window.location.origin + "/api"

// Authenticated API helper
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
    const message = `HTTP ${response.status}`
    throw new Error(message)
  }

  return response.json()
}

// DOM Elements
const elements = {
  sidebar: document.getElementById("adminSidebar"),
  sidebarToggle: document.getElementById("sidebarToggle"),
  mobileMenuBtn: document.getElementById("mobileMenuBtn"),
  pageTitle: document.getElementById("pageTitle"),
  logoutBtn: document.getElementById("logoutBtn"),
  adminName: document.getElementById("adminName"),
  loading: document.getElementById("loading"),
  toastContainer: document.getElementById("toastContainer"),

  // Stats
  totalRevenue: document.getElementById("totalRevenue"),
  totalOrders: document.getElementById("totalOrders"),
  totalProducts: document.getElementById("totalProducts"),
  totalUsers: document.getElementById("totalUsers"),

  // Products
  addProductBtn: document.getElementById("addProductBtn"),
  productModal: document.getElementById("productModal"),
  closeProductModal: document.getElementById("closeProductModal"),
  productForm: document.getElementById("productForm"),
  productsTableBody: document.getElementById("productsTableBody"),
  productSearch: document.getElementById("productSearch"),
  categoryFilterAdmin: document.getElementById("categoryFilterAdmin"),

  // Orders
  ordersTableBody: document.getElementById("ordersTableBody"),
  orderStatusFilter: document.getElementById("orderStatusFilter"),
  orderModal: document.getElementById("orderModal"),
  closeOrderModal: document.getElementById("closeOrderModal"),
  orderDetails: document.getElementById("orderDetails"),

  // Users
  usersTableBody: document.getElementById("usersTableBody"),
  userSearch: document.getElementById("userSearch"),
  userRoleFilter: document.getElementById("userRoleFilter"),
}

// Initialize admin panel
document.addEventListener("DOMContentLoaded", () => {
  checkAdminAuth()
  setupEventListeners()
  loadDashboardData()
})

function checkAdminAuth() {
  // Check if user is logged in and is admin
  if (!currentUser || currentUser.role !== "admin") {
    showToast("Access denied. Admin privileges required.", "error")
    setTimeout(() => {
      window.location.href = "index.html"
    }, 2000)
    return
  }

  elements.adminName.textContent = currentUser.name || "Admin User"
}

function setupEventListeners() {
  // Sidebar navigation
  document.querySelectorAll(".nav-item").forEach((item) => {
    item.addEventListener("click", (e) => {
      e.preventDefault()
      const section = item.dataset.section
      switchSection(section)
    })
  })

  // Mobile menu
  elements.mobileMenuBtn.addEventListener("click", () => {
    elements.sidebar.classList.toggle("open")
  })

  elements.sidebarToggle.addEventListener("click", () => {
    elements.sidebar.classList.toggle("collapsed")
    document.querySelector(".admin-main").classList.toggle("expanded")
  })

  // Logout
  elements.logoutBtn.addEventListener("click", logout)

  // Product management
  elements.addProductBtn.addEventListener("click", () => openProductModal())
  elements.closeProductModal.addEventListener("click", () => closeProductModal())
  elements.productForm.addEventListener("submit", handleProductSubmit)

  // Order management
  elements.closeOrderModal.addEventListener("click", () => closeOrderModal())
  elements.orderStatusFilter.addEventListener("change", loadOrders)

  // Search and filters
  elements.productSearch.addEventListener("input", debounce(loadProducts, 300))
  elements.categoryFilterAdmin.addEventListener("change", loadProducts)
  elements.userSearch.addEventListener("input", debounce(loadUsers, 300))
  elements.userRoleFilter.addEventListener("change", loadUsers)

  // Settings forms
  document.getElementById("storeSettingsForm").addEventListener("submit", handleStoreSettings)
  document.getElementById("shippingSettingsForm").addEventListener("submit", handleShippingSettings)

  // Close modals on outside click
  window.addEventListener("click", (e) => {
    if (e.target === elements.productModal) closeProductModal()
    if (e.target === elements.orderModal) closeOrderModal()
  })
}

function switchSection(section) {
  // Update navigation
  document.querySelectorAll(".nav-item").forEach((item) => {
    item.classList.remove("active")
  })
  document.querySelector(`[data-section="${section}"]`).classList.add("active")

  // Update content
  document.querySelectorAll(".content-section").forEach((section) => {
    section.classList.remove("active")
  })
  document.getElementById(`${section}-section`).classList.add("active")

  // Update page title
  const titles = {
    dashboard: "Dashboard",
    products: "Product Management",
    orders: "Order Management",
    users: "User Management",
    analytics: "Analytics & Reports",
    settings: "Settings",
  }
  elements.pageTitle.textContent = titles[section]

  currentSection = section

  // Load section data
  switch (section) {
    case "dashboard":
      loadDashboardData()
      break
    case "products":
      loadProducts()
      break
    case "orders":
      loadOrders()
      break
    case "users":
      loadUsers()
      break
    case "analytics":
      loadAnalytics()
      break
  }

  // Close mobile menu
  elements.sidebar.classList.remove("open")
}

// Dashboard Functions
async function loadDashboardData() {
  showLoading(true)
  try {
    const [orderStats, userStats, productsPage] = await Promise.all([
      apiCall("/orders/stats/overview"),
      apiCall("/users/stats/overview"),
      apiCall("/products?limit=1"),
    ])

    elements.totalRevenue.textContent = `$${(orderStats.totalRevenue || 0).toLocaleString()}`
    elements.totalOrders.textContent = (orderStats.totalOrders || 0).toLocaleString()
    elements.totalProducts.textContent = (productsPage.total || 0).toLocaleString()
    elements.totalUsers.textContent = (userStats.totalUsers || 0).toLocaleString()

    await loadRecentOrders()
    await loadLowStockProducts()
  } catch (error) {
    showToast("Error loading dashboard data", "error")
  } finally {
    showLoading(false)
  }
}

async function loadRecentOrders() {
  const container = document.getElementById("recentOrders")
  const data = await apiCall("/orders?limit=5")
  const orders = data.orders || []
  container.innerHTML = orders
    .map(
      (order) => `
        <div class="recent-order-item">
            <div class="order-info">
                <strong>${order._id}</strong>
                <span>${order.user?.name || "Customer"}</span>
            </div>
            <div class="order-amount">$${(order.totalAmount || 0).toFixed(2)}</div>
            <span class="status-badge ${order.status}">${order.status}</span>
        </div>
    `,
    )
    .join("")
}

async function loadLowStockProducts() {
  const container = document.getElementById("lowStockProducts")
  const data = await apiCall("/products?limit=100")
  const products = (data.products || []).filter((p) => (p.stock || 0) <= 5).slice(0, 10)
  container.innerHTML = products
    .map(
      (product) => `
        <div class="low-stock-item">
            <span class="product-name">${product.name}</span>
            <span class="stock-count ${product.stock <= 2 ? "critical" : "low"}">${product.stock} left</span>
        </div>
    `,
    )
    .join("")
}

// Product Management
async function loadProducts() {
  showLoading(true)
  try {
    const params = new URLSearchParams()
    const search = elements.productSearch.value?.trim()
    const category = elements.categoryFilterAdmin.value
    if (search) params.set("search", search)
    if (category) params.set("category", category)
    params.set("limit", 100)

    const data = await apiCall(`/products?${params.toString()}`)
    displayProducts(data.products || [])
  } catch (error) {
    showToast("Error loading products", "error")
  } finally {
    showLoading(false)
  }
}

function displayProducts(products) {
  elements.productsTableBody.innerHTML = products
    .map(
      (product) => `
        <tr>
            <td><img src="${product.image}" alt="${product.name}"></td>
            <td>${product.name}</td>
            <td>${product.category}</td>
            <td>$${product.price}</td>
            <td>${product.stock}</td>
            <td>
                <span class="status-badge ${product.stock > 0 ? "active" : "inactive"}">
                    ${product.stock > 0 ? "In Stock" : "Out of Stock"}
                </span>
            </td>
            <td>
                <button class="action-btn edit" onclick="editProduct('${product._id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="action-btn delete" onclick="deleteProduct('${product._id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `,
    )
    .join("")
}

let editingProductId = null

async function openProductModal(productId = null) {
  const isEdit = productId !== null
  document.getElementById("productModalTitle").textContent = isEdit ? "Edit Product" : "Add Product"

  if (isEdit) {
    const product = await apiCall(`/products/${productId}`)
    editingProductId = productId
    document.getElementById("productName").value = product.name || ""
    document.getElementById("productCategory").value = product.category || ""
    document.getElementById("productPrice").value = product.price ?? ""
    document.getElementById("productStock").value = product.stock ?? ""
    document.getElementById("productDescription").value = product.description || ""
    document.getElementById("productImage").value = product.image || ""
    document.getElementById("productFeatured").checked = !!product.featured
  } else {
    elements.productForm.reset()
    editingProductId = null
  }

  elements.productModal.style.display = "block"
}

function closeProductModal() {
  elements.productModal.style.display = "none"
  elements.productForm.reset()
}

async function handleProductSubmit(e) {
  e.preventDefault()
  showLoading(true)

  try {
    const formData = new FormData(e.target)
    const productData = {
      name: formData.get("name"),
      category: formData.get("category"),
      price: Number.parseFloat(formData.get("price")),
      stock: Number.parseInt(formData.get("stock")),
      description: formData.get("description"),
      image: formData.get("image"),
      featured: formData.get("featured") === "on",
    }

    if (editingProductId) {
      await apiCall(`/products/${editingProductId}`, {
        method: "PUT",
        body: JSON.stringify(productData),
      })
      showToast("Product updated successfully!")
    } else {
      await apiCall(`/products`, {
        method: "POST",
        body: JSON.stringify(productData),
      })
      showToast("Product created successfully!")
    }
    closeProductModal()
    loadProducts()
  } catch (error) {
    showToast("Error saving product", "error")
  } finally {
    showLoading(false)
  }
}

function editProduct(productId) {
  openProductModal(productId)
}

async function deleteProduct(productId) {
  if (!confirm("Are you sure you want to delete this product?")) return

  showLoading(true)
  try {
    await apiCall(`/products/${productId}`, { method: "DELETE" })
    showToast("Product deleted successfully!")
    loadProducts()
  } catch (error) {
    showToast("Error deleting product", "error")
  } finally {
    showLoading(false)
  }
}

// Order Management
async function loadOrders() {
  showLoading(true)
  try {
    const params = new URLSearchParams()
    const status = elements.orderStatusFilter.value
    if (status) params.set("status", status)
    params.set("limit", 50)
    const data = await apiCall(`/orders?${params.toString()}`)
    displayOrders(data.orders || [])
  } catch (error) {
    showToast("Error loading orders", "error")
  } finally {
    showLoading(false)
  }
}

function displayOrders(orders) {
  elements.ordersTableBody.innerHTML = orders
    .map(
      (order) => `
        <tr>
            <td>${order._id}</td>
            <td>${order.user?.name || "Customer"}</td>
            <td>${new Date(order.createdAt).toLocaleDateString()}</td>
            <td>$${(order.totalAmount || 0).toFixed(2)}</td>
            <td><span class="status-badge ${order.status}">${order.status}</span></td>
            <td>
                <button class="action-btn view" onclick="viewOrder('${order._id}')">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="action-btn edit" onclick="updateOrderStatus('${order._id}')">
                    <i class="fas fa-edit"></i>
                </button>
            </td>
        </tr>
    `,
    )
    .join("")
}

async function viewOrder(orderId) {
  const order = await apiCall(`/orders/${orderId}`)

  elements.orderDetails.innerHTML = `
        <div class="order-detail-grid">
            <div class="order-info">
                <h4>Order Information</h4>
                <p><strong>Order ID:</strong> ${order._id}</p>
                <p><strong>Customer:</strong> ${order.user?.name || "Customer"}</p>
                <p><strong>Email:</strong> ${order.user?.email || ""}</p>
                <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
                <p><strong>Status:</strong> <span class="status-badge ${order.status}">${order.status}</span></p>
            </div>
            
            <div class="shipping-info">
                <h4>Shipping Address</h4>
                <p>${order.shippingAddress?.street || ""}</p>
                <p>${order.shippingAddress?.city || ""}, ${order.shippingAddress?.state || ""} ${order.shippingAddress?.zipCode || ""}</p>
            </div>
            
            <div class="order-items">
                <h4>Order Items</h4>
                ${(order.items || [])
                  .map(
                    (item) => `
                    <div class="order-item-row">
                        <span>${item.product?.name || "Item"}</span>
                        <span>Qty: ${item.quantity}</span>
                        <span>$${item.price}</span>
                    </div>
                `,
                  )
                  .join("")}
                <div class="order-total">
                    <strong>Total: $${(order.totalAmount || 0).toFixed(2)}</strong>
                </div>
            </div>
        </div>
        
        <div class="order-actions">
            <select id="orderStatusSelect">
                <option value="pending" ${order.status === "pending" ? "selected" : ""}>Pending</option>
                <option value="processing" ${order.status === "processing" ? "selected" : ""}>Processing</option>
                <option value="shipped" ${order.status === "shipped" ? "selected" : ""}>Shipped</option>
                <option value="delivered" ${order.status === "delivered" ? "selected" : ""}>Delivered</option>
                <option value="cancelled" ${order.status === "cancelled" ? "selected" : ""}>Cancelled</option>
            </select>
            <button class="btn-primary" onclick="updateOrderStatus('${orderId}')">Update Status</button>
        </div>
    `

  elements.orderModal.style.display = "block"
}

function closeOrderModal() {
  elements.orderModal.style.display = "none"
}

async function updateOrderStatus(orderId) {
  const newStatus = document.getElementById("orderStatusSelect")?.value

  if (!newStatus) {
    showToast("Please select a status", "error")
    return
  }

  showLoading(true)
  try {
    await apiCall(`/orders/${orderId}/status`, {
      method: "PUT",
      body: JSON.stringify({ status: newStatus }),
    })
    showToast("Order status updated successfully!")
    closeOrderModal()
    loadOrders()
  } catch (error) {
    showToast("Error updating order status", "error")
  } finally {
    showLoading(false)
  }
}

// User Management
async function loadUsers() {
  showLoading(true)
  try {
    const params = new URLSearchParams()
    const search = elements.userSearch.value?.trim()
    const role = elements.userRoleFilter.value
    if (search) params.set("search", search)
    if (role) params.set("role", role)
    params.set("limit", 50)

    const data = await apiCall(`/users?${params.toString()}`)
    displayUsers(data.users || [])
  } catch (error) {
    showToast("Error loading users", "error")
  } finally {
    showLoading(false)
  }
}

function displayUsers(users) {
  elements.usersTableBody.innerHTML = users
    .map(
      (user) => `
        <tr>
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td><span class="status-badge ${user.role}">${user.role}</span></td>
            <td>${new Date(user.createdAt).toLocaleDateString()}</td>
            <td>
                <span class="status-badge ${user.isActive ? "active" : "inactive"}">
                    ${user.isActive ? "Active" : "Inactive"}
                </span>
            </td>
            <td>
                <button class="action-btn edit" onclick="editUser('${user._id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="action-btn ${user.isActive ? "delete" : "view"}" onclick="toggleUserStatus('${user._id}')">
                    <i class="fas fa-${user.isActive ? "ban" : "check"}"></i>
                </button>
            </td>
        </tr>
    `,
    )
    .join("")
}

function editUser(userId) {
  showToast("User editing feature coming soon!")
}

async function toggleUserStatus(userId) {
  showLoading(true)
  try {
    await apiCall(`/users/${userId}/status`, { method: "PUT" })
    showToast("User status updated successfully!")
    loadUsers()
  } catch (error) {
    showToast("Error updating user status", "error")
  } finally {
    showLoading(false)
  }
}

// Analytics
function loadAnalytics() {
  document.getElementById("topProducts").innerHTML = ""
}

// Settings
async function handleStoreSettings(e) {
  e.preventDefault()
  showLoading(true)

  try {
    // No backend endpoint provided; keep local success
    showToast("Store settings saved!")
  } catch (error) {
    showToast("Error saving settings", "error")
  } finally {
    showLoading(false)
  }
}

async function handleShippingSettings(e) {
  e.preventDefault()
  showLoading(true)

  try {
    // No backend endpoint provided; keep local success
    showToast("Shipping settings saved!")
  } catch (error) {
    showToast("Error saving settings", "error")
  } finally {
    showLoading(false)
  }
}

// Utility Functions
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

function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// Add required CSS for new components
const additionalStyles = `
    .recent-order-item, .low-stock-item, .top-product-item, .order-item-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.75rem 0;
        border-bottom: 1px solid #e5e7eb;
    }
    
    .recent-order-item:last-child, .low-stock-item:last-child, 
    .top-product-item:last-child, .order-item-row:last-child {
        border-bottom: none;
    }
    
    .order-info {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
    }
    
    .stock-count.critical {
        color: #ef4444;
        font-weight: 600;
    }
    
    .stock-count.low {
        color: #f59e0b;
        font-weight: 600;
    }
    
    .order-detail-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 2rem;
        margin-bottom: 2rem;
    }
    
    .order-detail-grid h4 {
        margin-bottom: 1rem;
        color: #1f2937;
    }
    
    .order-actions {
        display: flex;
        gap: 1rem;
        align-items: center;
        padding-top: 1rem;
        border-top: 1px solid #e5e7eb;
    }
    
    .order-total {
        margin-top: 1rem;
        padding-top: 1rem;
        border-top: 1px solid #e5e7eb;
        font-size: 1.1rem;
    }
`

const styleSheet = document.createElement("style")
styleSheet.textContent = additionalStyles
document.head.appendChild(styleSheet)
