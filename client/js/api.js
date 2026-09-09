const API_BASE = '/api';
const TOKEN_KEY = 'ecom_token';
const USER_KEY = 'ecom_user';
const CART_KEY = 'ecom_cart';

// ---- Auth state helpers ----
function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function getUser() {
  const raw = localStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

function setAuth(token, user) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

function isLoggedIn() {
  return !!getToken();
}

function isAdmin() {
  const user = getUser();
  return !!user && user.role === 'admin';
}

function logout() {
  clearAuth();
  window.location.href = 'index.html';
}

// Add near the other auth helpers
function handleSessionExpiry() {
  clearAuth();
  const currentPage = window.location.pathname.split('/').pop();
  const protectedPages = ['checkout.html', 'orders.html', 'admin.html'];

  if (protectedPages.includes(currentPage)) {
    window.location.href = `login.html?redirect=${currentPage}&expired=true`;
  } else {
    renderNav(); // just refresh nav state on public pages
  }
}

// ---- Cart count helper (full cart logic lives in cart.js) ----
function getCartCount() {
  const raw = localStorage.getItem(CART_KEY);
  if (!raw) return 0;
  const cart = JSON.parse(raw);
  return cart.reduce((sum, item) => sum + item.quantity, 0);
}

// ---- Core request wrapper ----
async function apiRequest(endpoint, { method = 'GET', body, auth = false } = {}) {
  const headers = { 'Content-Type': 'application/json' };

  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(`${API_BASE}${endpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (networkErr) {
    throw new Error('Could not reach the server. Check your connection and try again.');
  }

  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error('Unexpected response from the server.');
  }

  if (!response.ok) {
    // Session expired or invalid — clear stale auth so the nav reflects it
    if (response.status === 401 && auth) {
      clearAuth();
    }
    throw new Error(data.message || 'Something went wrong. Please try again.');
  }

  return data;
}

// ---- Nav rendering ----
function renderNav() {
  const mount = document.getElementById('main-nav');
  if (!mount) return;

  const user = getUser();
  const cartCount = getCartCount();
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';

  const isActive = (page) => (currentPage === page ? 'active' : '');

  let links = '';

  if (!user) {
    links = `
      <a href="index.html" class="${isActive('index.html')}">Home</a>
      <a href="products.html" class="${isActive('products.html')}">Products</a>
      <a href="login.html" class="${isActive('login.html')}">Login</a>
      <a href="register.html" class="${isActive('register.html')}">Register</a>
      <a href="cart.html" class="nav-cart ${isActive('cart.html')}">Cart
        ${cartCount > 0 ? `<span class="cart-badge">${cartCount}</span>` : ''}
      </a>
    `;
  } else if (user.role === 'admin') {
    links = `
      <a href="index.html" class="${isActive('index.html')}">Home</a>
      <a href="products.html" class="${isActive('products.html')}">Products</a>
      <a href="admin.html" class="${isActive('admin.html')}">Admin Dashboard</a>
      <a href="#" id="logout-link">Logout</a>
    `;
  } else {
    links = `
      <a href="index.html" class="${isActive('index.html')}">Home</a>
      <a href="products.html" class="${isActive('products.html')}">Products</a>
      <a href="orders.html" class="${isActive('orders.html')}">My Orders</a>
      <a href="cart.html" class="nav-cart ${isActive('cart.html')}">Cart
        ${cartCount > 0 ? `<span class="cart-badge">${cartCount}</span>` : ''}
      </a>
      <a href="#" id="logout-link">Logout</a>
    `;
  }

  mount.innerHTML = `
    <div class="navbar-inner">
      <a href="index.html" class="brand">CodeAlpha Store</a>
      <button class="nav-toggle" id="nav-toggle" aria-label="Toggle menu">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
        </svg>
      </button>
      <div class="nav-links" id="nav-links">${links}</div>
    </div>
  `;

  const logoutLink = document.getElementById('logout-link');
  if (logoutLink) {
    logoutLink.addEventListener('click', (e) => {
      e.preventDefault();
      logout();
    });
  }

  const toggle = document.getElementById('nav-toggle');
  const navLinksEl = document.getElementById('nav-links');
  if (toggle && navLinksEl) {
    toggle.addEventListener('click', () => navLinksEl.classList.toggle('open'));
  }
}

document.addEventListener('DOMContentLoaded', renderNav);
