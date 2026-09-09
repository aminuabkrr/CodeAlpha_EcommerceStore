document.addEventListener('DOMContentLoaded', loadProductDetail);

async function loadProductDetail() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  const mount = document.getElementById('product-detail');

  if (!id) {
    mount.innerHTML = `<div class="alert alert-error">No product specified.</div>`;
    return;
  }

  try {
    const res = await apiRequest(`/products/${id}`);
    renderProductDetail(res.data);
  } catch (err) {
    mount.innerHTML = `<div class="alert alert-error">${err.message}</div>`;
  }
}

function renderProductDetail(product) {
  const mount = document.getElementById('product-detail');
  const outOfStock = product.stock === 0;

  mount.innerHTML = `
    <div class="product-detail-grid">
      <div class="product-detail-image">
        <img src="${product.image}" alt="${product.name}">
      </div>
      <div class="product-detail-info">
        <span class="product-card-category">${product.category}</span>
        <h1>${product.name}</h1>
        <p class="product-detail-price">$${product.price.toFixed(2)}</p>
        <p class="product-detail-desc">${product.description}</p>

        <p class="stock-line ${outOfStock ? 'out' : ''}">
          ${outOfStock ? 'Out of stock' : `${product.stock} in stock`}
        </p>

        <div id="add-to-cart-alert"></div>

        ${
          outOfStock
            ? `<button class="btn btn-secondary" disabled>Out of stock</button>`
            : `
              <div class="qty-row">
                <label for="qty-input" class="form-label">Quantity</label>
                <div class="qty-control">
                  <button type="button" id="qty-minus" class="btn btn-secondary btn-sm" aria-label="Decrease quantity">−</button>
                  <input type="number" id="qty-input" class="form-input" value="1" min="1" max="${product.stock}" style="width: 64px; text-align: center;">
                  <button type="button" id="qty-plus" class="btn btn-secondary btn-sm" aria-label="Increase quantity">+</button>
                </div>
              </div>
              <button class="btn btn-primary btn-block" id="add-to-cart-btn" style="margin-top: 1rem;">
                Add to cart
              </button>
            `
        }
      </div>
    </div>
  `;

  if (outOfStock) return;

  const qtyInput = document.getElementById('qty-input');
  const maxStock = product.stock;

  document.getElementById('qty-minus').addEventListener('click', () => {
    const current = parseInt(qtyInput.value, 10) || 1;
    qtyInput.value = Math.max(1, current - 1);
  });

  document.getElementById('qty-plus').addEventListener('click', () => {
    const current = parseInt(qtyInput.value, 10) || 1;
    qtyInput.value = Math.min(maxStock, current + 1);
  });

  qtyInput.addEventListener('change', () => {
    let value = parseInt(qtyInput.value, 10) || 1;
    value = Math.max(1, Math.min(maxStock, value));
    qtyInput.value = value;
  });

  document.getElementById('add-to-cart-btn').addEventListener('click', () => {
    const quantity = Math.max(1, Math.min(maxStock, parseInt(qtyInput.value, 10) || 1));
    const alertBox = document.getElementById('add-to-cart-alert');

    const result = addToCart(product, quantity);

    if (result.success) {
      alertBox.innerHTML = `<div class="alert alert-success">Added ${quantity} to your cart.</div>`;
      renderNav(); // refresh the cart badge
    } else {
      alertBox.innerHTML = `<div class="alert alert-error">${result.message}</div>`;
    }
  });
}
