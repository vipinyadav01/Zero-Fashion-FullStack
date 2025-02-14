const burger = document.querySelector('.burger');
const nav = document.querySelector('.nav-links');
const navLinks = document.querySelectorAll('.nav-links li');

navLinks.forEach((link, index) => {
    link.style.animation = `navLinkFade 0.5s ease forwards ${index / 7 + 0.3}s`;
});
const body = document.body;

function toggleNav() {
    nav.classList.toggle('nav-active');
    body.classList.toggle('nav-open');
    burger.classList.toggle('toggle');
}

function closeNav() {
    nav.classList.remove('nav-active');
    body.classList.remove('nav-open');
    burger.classList.remove('toggle');
}

burger.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleNav();
});
document.addEventListener('click', (e) => {
    if (!nav.contains(e.target) && !burger.contains(e.target)) {
        closeNav();
    }
});
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeNav();
    }
});
window.addEventListener('resize', () => {
    if (window.innerWidth > 599 && nav.classList.contains('nav-active')) {
        closeNav();
    }
});
