// Navigation logic
const navSlide = () => {
  const burger = document.querySelector(".burger");
  const nav = document.querySelector(".nav-links");
  const navLinks = document.querySelectorAll(".nav-links li");

  burger.addEventListener("click", () => {
    nav.classList.toggle("nav-active");

    navLinks.forEach((link, index) => {
      if (link.style.animation) {
        link.style.animation = "";
      } else {
        link.style.animation = `navLinkFade 0.5s ease forwards ${
          index / 7 + 0.6
        }s`;
      }
    });
    burger.classList.toggle("toggle");
  });
};

// Initialize navigation
navSlide();

// DOM manipulation for navbar
document.addEventListener("DOMContentLoaded", () => {
  const navbarList = document.querySelector(".navbar");

  if (navbarList) {
    navbarList.innerHTML = `
      <div class="navbar-container">
        <a href="index.html" class="navbar-logo">Your Logo</a>
        <ul class="navbar-list">
          <li><a href="index.html">Home</a></li>
          <li><a href="products.html">Products</a></li>
          <li><a href="categories.html">Categories</a></li>
          <li><a href="cart.html">Cart</a></li>
          <li><a href="contact.html">Contact</a></li>
          <li><a href="login.html">logout</a></li>
          <li><a href="orders.html">Orders</a></li>

        </ul>
        <div class="navbar-icons">
          <a href="cart.html" class="cart-icon"><i class="fas fa-shopping-cart"></i></a>
          <a href="login.html" class="user-icon"><i class="fas fa-user"></i></a>
        </div>
      </div>
    `;
  } else {
    console.error("Navbar element not found");
  }
});

// Slider logic
const sliderContainer = document.querySelector(".slider");
const slides = document.querySelectorAll(".slide");

let slideIndex = 0;
const interval = 3000; // 3 seconds

function showNextSlide() {
  slides[slideIndex].style.display = "none";
  slideIndex = (slideIndex + 1) % slides.length;
  slides[slideIndex].style.display = "block";
}

function showPrevSlide() {
  slides[slideIndex].style.display = "none";
  slideIndex = (slideIndex - 1 + slides.length) % slides.length;
  slides[slideIndex].style.display = "block";
}

setInterval(showNextSlide, interval);

document.querySelector(".next").addEventListener("click", showNextSlide);
document.querySelector(".prev").addEventListener("click", showPrevSlide);
