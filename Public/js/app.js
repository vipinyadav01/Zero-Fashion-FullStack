// Global variables
let currentUser = null
let cart = JSON.parse(localStorage.getItem("cart")) || []
let currentPage = 1
let currentCategory = "all"
let currentSort = "createdAt"

// API Base URL
const API_BASE = window.location.origin + "/api"

// DOM Elements
const elements = {
  searchInput: document.getElementById("searchInput"),
  searchBtn: document.getElementById("searchBtn"),
  loginBtn: document.getElementById("loginBtn"),
  cartBtn: document.getElementById("cartBtn"),
  cartCount: document.getElementById("cartCount"),
  shopNowBtn: document.getElementById("shopNowBtn"),
  categoryGrid: document.getElementById("categoryGrid"),
  featuredProducts: document.getElementById("featuredProducts"),
  allProducts: document.getElementById("allProducts"),
  categoryFilter: document.getElementById("categoryFilter"),
  sortFilter: document.getElementById("sortFilter"),
  pagination: document.getElementById("pagination"),
  productModal: document.getElementById("productModal"),
  closeModal: document.getElementById("closeModal"),
  productDetails: document.getElementById("productDetails"),
  cartSidebar: document.getElementById("cartSidebar"),
  closeCart: document.getElementById("closeCart"),
  cartItems: document.getElementById("cartItems"),
  cartTotal: document.getElementById("cartTotal"),
  checkoutBtn: document.getElementById("checkoutBtn"),
  loginModal: document.getElementById("loginModal"),
  closeLoginModal: document.getElementById("closeLoginModal"),
  loginForm: document.getElementById("loginForm"),
  registerForm: document.getElementById("registerForm"),
  loading: document.getElementById("loading"),
  toastContainer: document.getElementById("toastContainer"),
}

// Initialize app
document.addEventListener("DOMContentLoaded", () => {
  initializeApp()
  setupEventListeners()
  loadInitialData()
})

// Initialize application
function initializeApp() {
  updateCartUI()
  checkAuthStatus()
}

// Setup event listeners
function setupEventListeners() {
  // Navigation
  elements.searchBtn.addEventListener("click", handleSearch)
  elements.searchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") handleSearch()
  })

  elements.loginBtn.addEventListener("click", () => {
    if (currentUser) {
      if (currentUser.role === "admin") {
        window.location.href = "admin.html"
      } else {
        window.location.href = "profile.html"
      }
    } else {
      elements.loginModal.style.display = "block"
    }
  })

  elements.cartBtn.addEventListener("click", () => {
    elements.cartSidebar.classList.add("open")
  })

  elements.closeCart.addEventListener("click", () => {
    elements.cartSidebar.classList.remove("open")
  })

  // Hero
  elements.shopNowBtn.addEventListener("click", () => {
    document.querySelector(".all-products").scrollIntoView({ behavior: "smooth" })
  })

  // Filters
  elements.categoryFilter.addEventListener("change", handleCategoryFilter)
  elements.sortFilter.addEventListener("change", handleSortFilter)

  // Modals
  elements.closeModal.addEventListener("click", () => {
    elements.productModal.style.display = "none"
  })

  elements.closeLoginModal.addEventListener("click", () => {
    elements.loginModal.style.display = "none"
  })

  // Auth tabs
  document.querySelectorAll(".auth-tab").forEach((tab) => {
    tab.addEventListener("click", function () {
      const tabName = this.dataset.tab
      switchAuthTab(tabName)
    })
  })

  // Auth forms
  elements.loginForm.addEventListener("submit", handleLogin)
  elements.registerForm.addEventListener("submit", handleRegister)

  // Checkout
  elements.checkoutBtn.addEventListener("click", handleCheckout)

  // Close modals on outside click
  window.addEventListener("click", (e) => {
    if (e.target === elements.productModal) {
      elements.productModal.style.display = "none"
    }
    if (e.target === elements.loginModal) {
      elements.loginModal.style.display = "none"
    }
  })
}

// Load initial data
async function loadInitialData() {
  showLoading(true)
  try {
    await Promise.all([loadCategories(), loadFeaturedProducts(), loadProducts()])
  } catch (error) {
    showToast("Error loading data", "error")
  } finally {
    showLoading(false)
  }
}

// API Functions
async function apiCall(endpoint, options = {}) {
  const token = localStorage.getItem("token")
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  return response.json()
}

// Load categories
async function loadCategories() {
  const categories = [
    { name: "Electronics", icon: "fas fa-laptop" },
    { name: "Clothing", icon: "fas fa-tshirt" },
    { name: "Home & Garden", icon: "fas fa-home" },
    { name: "Sports", icon: "fas fa-dumbbell" },
    { name: "Books", icon: "fas fa-book" },
    { name: "Beauty", icon: "fas fa-heart" },
  ]

  elements.categoryGrid.innerHTML = categories
    .map(
      (category) => `
        <div class="category-card" onclick="filterByCategory('${category.name}')">
            <i class="${category.icon}"></i>
            <h3>${category.name}</h3>
        </div>
    `,
    )
    .join("")

  // Populate category filter
  const categoryOptions = categories.map((cat) => `<option value="${cat.name}">${cat.name}</option>`).join("")
  elements.categoryFilter.innerHTML = `
        <option value="all">All Categories</option>
        ${categoryOptions}
    `
}

// Load featured products
async function loadFeaturedProducts() {
  try {
    const data = await apiCall("/products/featured")
    displayProducts(data, elements.featuredProducts)
  } catch (error) {
    // Fallback to sample data if API fails
    const sampleProducts = generateSampleProducts(8)
    displayProducts(sampleProducts, elements.featuredProducts)
  }
}

// Load products with pagination
async function loadProducts(page = 1, category = "all", sort = "createdAt", search = "") {
  try {
    const params = new URLSearchParams({
      page,
      category,
      sort,
      search,
    })

    const data = await apiCall(`/products?${params}`)
    displayProducts(data.products, elements.allProducts)
    displayPagination(data.currentPage, data.totalPages)
  } catch (error) {
    // Fallback to sample data if API fails
    const sampleProducts = generateSampleProducts(12)
    displayProducts(sampleProducts, elements.allProducts)
    displayPagination(1, 3)
  }
}

// Generate sample products for demo
function generateSampleProducts(count) {
  const categories = ["Electronics", "Clothing", "Home & Garden", "Sports", "Books", "Beauty"]
  const products = []

  for (let i = 1; i <= count; i++) {
    products.push({
      _id: `sample-${i}`,
      name: `Sample Product ${i}`,
      description: `This is a great product with amazing features and excellent quality.`,
      price: Math.floor(Math.random() * 200) + 20,
      category: categories[Math.floor(Math.random() * categories.length)],
      image: `/placeholder.svg?height=200&width=280&query=product ${i}`,
      stock: Math.floor(Math.random() * 50) + 1,
      ratings: {
        average: (Math.random() * 2 + 3).toFixed(1),
        count: Math.floor(Math.random() * 100) + 1,
      },
    })
  }

  return products
}

// Display products
function displayProducts(products, container) {
  container.innerHTML = products
    .map(
      (product) => `
        <div class="product-card" onclick="showProductDetails('${product._id}')">
            <img src="${product.image}" alt="${product.name}" class="product-image">
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-price">$${product.price}</p>
                <p class="product-description">${product.description}</p>
                <button class="add-to-cart" onclick="event.stopPropagation(); addToCart('${product._id}')">
                    Add to Cart
                </button>
            </div>
        </div>
    `,
    )
    .join("")
}

// Display pagination
function displayPagination(currentPage, totalPages) {
  let paginationHTML = ""

  // Previous button
  if (currentPage > 1) {
    paginationHTML += `<button onclick="changePage(${currentPage - 1})">Previous</button>`
  }

  // Page numbers
  for (let i = 1; i <= totalPages; i++) {
    const activeClass = i === currentPage ? "active" : ""
    paginationHTML += `<button class="${activeClass}" onclick="changePage(${i})">${i}</button>`
  }

  // Next button
  if (currentPage < totalPages) {
    paginationHTML += `<button onclick="changePage(${currentPage + 1})">Next</button>`
  }

  elements.pagination.innerHTML = paginationHTML
}

// Event Handlers
function handleSearch() {
  const searchTerm = elements.searchInput.value.trim()
  currentPage = 1
  loadProducts(currentPage, currentCategory, currentSort, searchTerm)
}

function handleCategoryFilter() {
  currentCategory = elements.categoryFilter.value
  currentPage = 1
  loadProducts(currentPage, currentCategory, currentSort)
}

function handleSortFilter() {
  currentSort = elements.sortFilter.value
  currentPage = 1
  loadProducts(currentPage, currentCategory, currentSort)
}

function filterByCategory(category) {
  elements.categoryFilter.value = category
  handleCategoryFilter()
  document.querySelector(".all-products").scrollIntoView({ behavior: "smooth" })
}

function changePage(page) {
  currentPage = page
  loadProducts(currentPage, currentCategory, currentSort)
}

// Product Details
async function showProductDetails(productId) {
  try {
    showLoading(true)

    // Try to get product from API, fallback to sample data
    let product
    try {
      product = await apiCall(`/products/${productId}`)
    } catch (error) {
      // Generate sample product for demo
      product = {
        _id: productId,
        name: `Sample Product ${productId.split("-")[1] || "1"}`,
        description:
          "This is a detailed description of an amazing product with excellent features and high quality materials.",
        price: Math.floor(Math.random() * 200) + 20,
        category: "Electronics",
        image: `/placeholder.svg?height=400&width=400&query=detailed product view`,
        stock: Math.floor(Math.random() * 50) + 1,
        ratings: {
          average: (Math.random() * 2 + 3).toFixed(1),
          count: Math.floor(Math.random() * 100) + 1,
        },
      }
    }

    elements.productDetails.innerHTML = `
            <div class="product-detail-container">
                <div class="product-detail-image">
                    <img src="${product.image}" alt="${product.name}">
                </div>
                <div class="product-detail-info">
                    <h2>${product.name}</h2>
                    <p class="product-detail-price">$${product.price}</p>
                    <div class="product-rating">
                        <span>⭐ ${product.ratings.average} (${product.ratings.count} reviews)</span>
                    </div>
                    <p class="product-detail-description">${product.description}</p>
                    <div class="product-stock">
                        <span>In Stock: ${product.stock} items</span>
                    </div>
                    <div class="product-actions">
                        <button class="add-to-cart" onclick="addToCart('${product._id}')">
                            Add to Cart
                        </button>
                    </div>
                </div>
            </div>
        `

    elements.productModal.style.display = "block"
  } catch (error) {
    showToast("Error loading product details", "error")
  } finally {
    showLoading(false)
  }
}

// Cart Functions
function addToCart(productId) {
  const existingItem = cart.find((item) => item.productId === productId)

  if (existingItem) {
    existingItem.quantity += 1
  } else {
    cart.push({
      productId,
      quantity: 1,
      addedAt: new Date().toISOString(),
    })
  }

  localStorage.setItem("cart", JSON.stringify(cart))
  updateCartUI()
  showToast("Product added to cart!")
}

function removeFromCart(productId) {
  cart = cart.filter((item) => item.productId !== productId)
  localStorage.setItem("cart", JSON.stringify(cart))
  updateCartUI()
  displayCartItems()
}

function updateQuantity(productId, newQuantity) {
  if (newQuantity <= 0) {
    removeFromCart(productId)
    return
  }

  const item = cart.find((item) => item.productId === productId)
  if (item) {
    item.quantity = newQuantity
    localStorage.setItem("cart", JSON.stringify(cart))
    updateCartUI()
    displayCartItems()
  }
}

function updateCartUI() {
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)
  elements.cartCount.textContent = totalItems
  displayCartItems()
}

async function displayCartItems() {
  if (cart.length === 0) {
    elements.cartItems.innerHTML = '<p style="text-align: center; padding: 2rem;">Your cart is empty</p>'
    elements.cartTotal.textContent = "0.00"
    return
  }

  let total = 0
  let cartHTML = ""

  for (const item of cart) {
    // For demo, use sample product data
    const product = {
      _id: item.productId,
      name: `Product ${item.productId.split("-")[1] || "1"}`,
      price: Math.floor(Math.random() * 200) + 20,
      image: `/placeholder.svg?height=60&width=60&query=cart product`,
    }

    const itemTotal = product.price * item.quantity
    total += itemTotal

    cartHTML += `
            <div class="cart-item">
                <img src="${product.image}" alt="${product.name}">
                <div class="cart-item-info">
                    <div class="cart-item-name">${product.name}</div>
                    <div class="cart-item-price">$${product.price}</div>
                    <div class="quantity-controls">
                        <button class="quantity-btn" onclick="updateQuantity('${item.productId}', ${item.quantity - 1})">-</button>
                        <span>${item.quantity}</span>
                        <button class="quantity-btn" onclick="updateQuantity('${item.productId}', ${item.quantity + 1})">+</button>
                        <button onclick="removeFromCart('${item.productId}')" style="margin-left: 1rem; color: #ef4444;">Remove</button>
                    </div>
                </div>
            </div>
        `
  }

  elements.cartItems.innerHTML = cartHTML
  elements.cartTotal.textContent = total.toFixed(2)
}

// Authentication
function switchAuthTab(tabName) {
  document.querySelectorAll(".auth-tab").forEach((tab) => {
    tab.classList.remove("active")
  })
  document.querySelectorAll(".auth-form").forEach((form) => {
    form.classList.remove("active")
  })

  document.querySelector(`[data-tab="${tabName}"]`).classList.add("active")
  document.getElementById(`${tabName}Form`).classList.add("active")
}

async function handleLogin(e) {
  e.preventDefault()
  const formData = new FormData(e.target)
  const email = formData.get("email") || e.target.querySelector('input[type="email"]').value
  const password = formData.get("password") || e.target.querySelector('input[type="password"]').value

  try {
    showLoading(true)
    const data = await apiCall("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    })

    localStorage.setItem("token", data.token)
    localStorage.setItem("currentUser", JSON.stringify(data.user))
    currentUser = data.user
    updateAuthUI()
    elements.loginModal.style.display = "none"
    showToast("Login successful!")
  } catch (error) {
    showToast("Login failed. Please check your credentials.", "error")
  } finally {
    showLoading(false)
  }
}

async function handleRegister(e) {
  e.preventDefault()
  const formData = new FormData(e.target)
  const name = formData.get("name") || e.target.querySelector('input[type="text"]').value
  const email = formData.get("email") || e.target.querySelector('input[type="email"]').value
  const password = formData.get("password") || e.target.querySelector('input[type="password"]').value

  try {
    showLoading(true)
    const data = await apiCall("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    })

    localStorage.setItem("token", data.token)
    localStorage.setItem("currentUser", JSON.stringify(data.user))
    currentUser = data.user
    updateAuthUI()
    elements.loginModal.style.display = "none"
    showToast("Registration successful!")
  } catch (error) {
    showToast("Registration failed. Please try again.", "error")
  } finally {
    showLoading(false)
  }
}

function logout() {
  localStorage.removeItem("token")
  localStorage.removeItem("currentUser")
  currentUser = null
  updateAuthUI()
  showToast("Logged out successfully!")
}

function checkAuthStatus() {
  const token = localStorage.getItem("token")
  const storedUser = localStorage.getItem("currentUser")
  if (storedUser) {
    currentUser = JSON.parse(storedUser)
    updateAuthUI()
    return
  }
  if (token) {
    // In a real app, verify token with server and populate currentUser
    // For demo fallback, do nothing if no stored user
  }
}

function updateAuthUI() {
  if (currentUser) {
    elements.loginBtn.innerHTML = `
            <i class="fas fa-user"></i>
            <span>${currentUser.name}</span>
        `
  } else {
    elements.loginBtn.innerHTML = `
            <i class="fas fa-user"></i>
            <span>Login</span>
        `
  }
}

// Checkout
function handleCheckout() {
  if (cart.length === 0) {
    showToast("Your cart is empty!", "error")
    return
  }

  if (!currentUser) {
    elements.loginModal.style.display = "block"
    showToast("Please login to checkout", "error")
    return
  }
  window.location.href = "checkout.html"
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
