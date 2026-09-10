// Shared product-fetching and rendering logic for the home and products pages.

function productCardHTML(product) {
  const outOfStock = product.stock === 0;
  return `
    <a href="product.html?id=${product._id}" class="product-card">
      <div class="product-card-image">
        <img src="${product.image}" alt="${product.name}" loading="lazy">
      </div>
      <div class="product-card-body">
        <span class="product-card-category">${product.category}</span>
        <h3 class="product-card-name">${product.name}</h3>
        ${outOfStock ? '<span class="badge badge-status-Cancelled">Out of stock</span>' : ''}
        <span class="product-card-price">$${product.price.toFixed(2)}</span>
      </div>
    </a>
  `;
}

function renderProductGrid(mountId, products) {
  const grid = document.getElementById(mountId);
  if (!grid) return;

  if (products.length === 0) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        No products found. Try a different search or category.
      </div>
    `;
    return;
  }

  grid.innerHTML = products.map(productCardHTML).join('');
}

function showGridError(mountId, message) {
  const grid = document.getElementById(mountId);
  if (!grid) return;
  grid.innerHTML = `
    <div class="alert alert-error" style="grid-column: 1 / -1;">${message}</div>
  `;
}

// ---- Home page: featured products (just the latest few) ----
async function loadFeaturedProducts() {
  try {
    const res = await apiRequest('/products?sort=newest');
    renderProductGrid('featured-grid', res.data.slice(0, 4));
  } catch (err) {
    showGridError('featured-grid', err.message);
  }
}

// ---- Products page: full browse/search/filter/sort ----
function initProductsPage() {
  const searchInput = document.getElementById('search-input');
  const categorySelect = document.getElementById('category-select');
  const sortSelect = document.getElementById('sort-select');

  // Pre-fill category from a query string, e.g. products.html?category=Electronics
  const params = new URLSearchParams(window.location.search);
  const initialCategory = params.get('category');
  if (initialCategory) categorySelect.value = initialCategory;

  let debounceTimer;
  const triggerSearch = () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(fetchAndRenderProducts, 300);
  };

  searchInput.addEventListener('input', triggerSearch);
  categorySelect.addEventListener('change', fetchAndRenderProducts);
  sortSelect.addEventListener('change', fetchAndRenderProducts);

  fetchAndRenderProducts();
}

async function fetchAndRenderProducts() {
  const search = document.getElementById('search-input').value.trim();
  const category = document.getElementById('category-select').value;
  const sort = document.getElementById('sort-select').value;

  const query = new URLSearchParams();
  if (search) query.set('search', search);
  if (category) query.set('category', category);
  if (sort) query.set('sort', sort);

  const grid = document.getElementById('products-grid');
  grid.innerHTML = `<div class="loading-state"><div class="spinner"></div>Loading products…</div>`;

  try {
    const res = await apiRequest(`/products?${query.toString()}`);
    renderProductGrid('products-grid', res.data);
  } catch (err) {
    showGridError('products-grid', err.message);
  }
}
