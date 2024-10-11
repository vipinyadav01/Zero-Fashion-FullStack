// Navigation items
const navItems = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
  { href: "/categories", label: "Categories" },
  { href: "/cart", label: "Cart" },
  { href: "/contact", label: "Contact" },
  { href: "/logout", label: "Logout" },
  { href: "/orders", label: "Orders" },
];

function createNavigation() {
  const nav = document.createElement("nav");
  nav.className = "bg-white shadow-md";

  const container = document.createElement("div");
  container.className = "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8";

  const innerContainer = document.createElement("div");
  innerContainer.className = "flex justify-between h-16";

  // Logo
  const logoContainer = document.createElement("div");
  logoContainer.className = "flex";
  const logoLink = document.createElement("a");
  logoLink.href = "/";
  logoLink.className = "flex-shrink-0 flex items-center";
  const logoImg = document.createElement("img");
  logoImg.src = "/placeholder.svg?height=32&width=32";
  logoImg.alt = "Your Logo";
  logoImg.className = "h-8 w-auto";
  logoLink.appendChild(logoImg);
  logoContainer.appendChild(logoLink);

  // Desktop menu
  const desktopMenu = document.createElement("div");
  desktopMenu.className = "hidden sm:ml-6 sm:flex sm:space-x-8";
  navItems.forEach((item) => {
    const link = document.createElement("a");
    link.href = item.href;
    link.className =
      "text-gray-900 inline-flex items-center px-1 pt-1 text-sm font-medium";
    link.textContent = item.label;
    desktopMenu.appendChild(link);
  });

  // Desktop icons
  const desktopIcons = document.createElement("div");
  desktopIcons.className = "hidden sm:ml-6 sm:flex sm:items-center";
  const cartLink = document.createElement("a");
  cartLink.href = "/cart";
  cartLink.className = "p-2 text-gray-400 hover:text-gray-500";
  cartLink.innerHTML =
    '<span class="sr-only">View cart</span><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-6 w-6"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>';
  const userLink = document.createElement("a");
  userLink.href = "/profile";
  userLink.className = "p-2 text-gray-400 hover:text-gray-500";
  userLink.innerHTML =
    '<span class="sr-only">View profile</span><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-6 w-6"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>';
  desktopIcons.appendChild(cartLink);
  desktopIcons.appendChild(userLink);

  // Mobile menu button
  const mobileMenuButton = document.createElement("button");
  mobileMenuButton.className = "-mr-2 flex items-center sm:hidden";
  mobileMenuButton.innerHTML =
    '<span class="sr-only">Open main menu</span><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-6 w-6"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>';

  innerContainer.appendChild(logoContainer);
  innerContainer.appendChild(desktopMenu);
  innerContainer.appendChild(desktopIcons);
  innerContainer.appendChild(mobileMenuButton);

  container.appendChild(innerContainer);
  nav.appendChild(container);

  // Mobile menu (hidden by default)
  const mobileMenu = document.createElement("div");
  mobileMenu.className = "sm:hidden hidden";
  const mobileMenuLinks = document.createElement("div");
  mobileMenuLinks.className = "pt-2 pb-3 space-y-1";
  navItems.forEach((item) => {
    const link = document.createElement("a");
    link.href = item.href;
    link.className = "text-gray-900 block px-3 py-2 text-base font-medium";
    link.textContent = item.label;
    mobileMenuLinks.appendChild(link);
  });
  mobileMenu.appendChild(mobileMenuLinks);

  const mobileMenuProfile = document.createElement("div");
  mobileMenuProfile.className = "pt-4 pb-3 border-t border-gray-200";
  mobileMenuProfile.innerHTML = `
    <div class="flex items-center px-4">
      <div class="flex-shrink-0">
        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-10 w-10 rounded-full"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
      </div>
      <div class="ml-3">
        <div class="text-base font-medium text-gray-800">User Name</div>
        <div class="text-sm font-medium text-gray-500">user@example.com</div>
      </div>
    </div>
    <div class="mt-3 space-y-1">
      <a href="/profile" class="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100">Your Profile</a>
      <a href="/settings" class="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100">Settings</a>
      <a href="/logout" class="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100">Sign out</a>
    </div>
  `;
  mobileMenu.appendChild(mobileMenuProfile);

  nav.appendChild(mobileMenu);

  // Toggle mobile menu
  mobileMenuButton.addEventListener("click", () => {
    mobileMenu.classList.toggle("hidden");
  });

  return nav;
}

// Initialize navigation when the DOM is fully loaded
document.addEventListener("DOMContentLoaded", () => {
  const navigation = createNavigation();
  document.body.prepend(navigation);
});
