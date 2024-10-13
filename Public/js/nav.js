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
  const burger = document.querySelector(".burger");
  const nav = document.querySelector(".nav-links");

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
