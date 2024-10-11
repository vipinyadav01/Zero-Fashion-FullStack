// Navigation items
const navItems = [
  { href: "index.html", label: "Home" },
  { href: "products.html", label: "Products" },
  { href: "categories.html", label: "Categories" },
  { href: "cart.html", label: "Cart" },
  { href: "contact.html", label: "Contact" },
  { href: "logout.html", label: "Logout" },
  { href: "orders.html", label: "Orders" },
];

// Slider items
const slides = [
  { id: 1, image: "images/si/si1.jpg", alt: "Slide 1" },
  { id: 2, image: "images/si/si2.jpg", alt: "Slide 2" },
  { id: 3, image: "images/si/si3.jpg", alt: "Slide 3" },
];

// Navigation logic
function initNavigation() {
  const navbar = document.querySelector(".navbar");
  if (!navbar) {
    console.error("Navbar element not found");
    return;
  }

  // Create navbar HTML
  navbar.innerHTML = `
    <div class="navbar-container">
      <a href="index.html" class="navbar-logo">
        <img src="path/to/your-logo.png" alt="Your Logo" class="h-8 w-auto">
      </a>
      <ul class="navbar-list"></ul>
      <div class="navbar-icons">
        <a href="cart.html" class="cart-icon" aria-label="View cart">
          <i class="fas fa-shopping-cart"></i>
        </a>
        <a href="login.html" class="user-icon" aria-label="View profile">
          <i class="fas fa-user"></i>
        </a>
      </div>
      <button class="burger" aria-label="Toggle navigation menu" aria-expanded="false">
        <span></span>
        <span></span>
        <span></span>
      </button>
    </div>
  `;

  const navList = navbar.querySelector(".navbar-list");
  navItems.forEach((item) => {
    const li = document.createElement("li");
    li.innerHTML = `<a href="${item.href}">${item.label}</a>`;
    navList.appendChild(li);
  });

  const burger = navbar.querySelector(".burger");
  const nav = navbar.querySelector(".navbar-list");

  burger.addEventListener("click", () => {
    const isExpanded = nav.classList.toggle("nav-active");
    burger.classList.toggle("toggle");
    burger.setAttribute("aria-expanded", isExpanded);
  });
}

// Slider logic
function initSlider() {
  const sliderContainer = document.querySelector(".slider");
  if (!sliderContainer) {
    console.error("Slider container not found");
    return;
  }

  let currentSlide = 0;
  const interval = 3000; // 3 seconds

  // Create slider HTML
  sliderContainer.innerHTML = `
    <div class="slides"></div>
    <button class="prev" aria-label="Previous slide">&#10094;</button>
    <button class="next" aria-label="Next slide">&#10095;</button>
  `;

  const slidesContainer = sliderContainer.querySelector(".slides");
  slides.forEach((slide, index) => {
    const slideElement = document.createElement("div");
    slideElement.className = "slide";
    slideElement.style.display = index === 0 ? "block" : "none";
    slideElement.innerHTML = `<img src="${slide.image}" alt="${slide.alt}">`;
    slidesContainer.appendChild(slideElement);
  });

  function showSlide(index) {
    const slideElements = slidesContainer.querySelectorAll(".slide");
    slideElements[currentSlide].style.display = "none";
    slideElements[index].style.display = "block";
    currentSlide = index;
  }

  function nextSlide() {
    showSlide((currentSlide + 1) % slides.length);
  }

  function prevSlide() {
    showSlide((currentSlide - 1 + slides.length) % slides.length);
  }

  const nextButton = sliderContainer.querySelector(".next");
  const prevButton = sliderContainer.querySelector(".prev");

  nextButton.addEventListener("click", () => {
    nextSlide();
    resetInterval();
  });

  prevButton.addEventListener("click", () => {
    prevSlide();
    resetInterval();
  });

  let slideInterval = setInterval(nextSlide, interval);

  function resetInterval() {
    clearInterval(slideInterval);
    slideInterval = setInterval(nextSlide, interval);
  }

  // Pause auto-advance on hover
  sliderContainer.addEventListener("mouseenter", () =>
    clearInterval(slideInterval)
  );
  sliderContainer.addEventListener("mouseleave", () => {
    slideInterval = setInterval(nextSlide, interval);
  });
}

// Initialize everything when the DOM is fully loaded
document.addEventListener("DOMContentLoaded", () => {
  initNavigation();
  initSlider();
});
