function requireAdmin() {
  if (!isAdmin()) {
    document.body.innerHTML = `
      <div class="container" style="padding: 3rem 1.25rem;">
        <div class="alert alert-error">Access denied — admin privileges required.</div>
        <a href="index.html" class="btn btn-secondary" style="margin-top:1rem;">Back to home</a>
      </div>
    `;
    return false;
  }
  return true;
}

function initAdminPage() {
  initTabs();
  initProductForm();
  loadAdminProducts();
  loadAdminOrders();
}

// ---- Tabs ----
function initTabs() {
  document.querySelectorAll('.tab-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach((b) => b.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach((p) => p.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(btn.dataset.tab).classList.add('active');
    });
  });
}

// ---- Products: list ----
async function loadAdminProducts() {
  const mount = document.getElementById('admin-products-list');
  try {
    const res = await apiRequest('/products?sort=newest');
    renderAdminProducts(res.data);
  } catch (err) {
    mount.innerHTML = `<div class="alert alert-error">${err.message}</div>`;
  }
}

function renderAdminProducts(products) {
  const mount = document.getElementById('admin-products-list');

  if (products.length === 0) {
    mount.innerHTML = `<div class="empty-state">No products yet. Add your first one above.</div>`;
    return;
  }

  mount.innerHTML = `
    <table class="admin-table">
      <thead>
        <tr><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th></th></tr>
      </thead>
      <tbody>
        ${products
          .map(
            (p) => `
          <tr>
            <td>${p.name}</td>
            <td>${p.category}</td>
            <td>$${p.price.toFixed(2)}</td>
            <td>${p.stock}</td>
            <td class="admin-table-actions">
              <button class="btn btn-secondary btn-sm" data-edit="${p._id}">Edit</button>
              <button class="btn btn-danger btn-sm" data-delete="${p._id}">Delete</button>
            </td>
          </tr>
        `
          )
          .join('')}
      </tbody>
    </table>
  `;

  mount.querySelectorAll('[data-edit]').forEach((btn) =>
    btn.addEventListener('click', () => {
      const product = products.find((p) => p._id === btn.dataset.edit);
      openProductForm(product);
    })
  );

  mount.querySelectorAll('[data-delete]').forEach((btn) =>
    btn.addEventListener('click', () => handleDeleteProduct(btn.dataset.delete))
  );
}

async function handleDeleteProduct(id) {
  if (!confirm('Delete this product? This cannot be undone.')) return;

  try {
    await apiRequest(`/products/${id}`, { method: 'DELETE', auth: true });
    loadAdminProducts();
  } catch (err) {
    alert(err.message);
  }
}

// ---- Products: add/edit form ----
function initProductForm() {
  document.getElementById('new-product-btn').addEventListener('click', () => openProductForm(null));
  document.getElementById('product-form-cancel').addEventListener('click', closeProductForm);
  document.getElementById('product-form').addEventListener('submit', handleProductFormSubmit);
}

function openProductForm(product) {
  const panel = document.getElementById('product-form-panel');
  const title = document.getElementById('product-form-title');
  document.getElementById('product-form-alert').innerHTML = '';
  clearFieldErrors(['p-name', 'p-description', 'p-price', 'p-image', 'p-stock']);

  if (product) {
    title.textContent = 'Edit product';
    document.getElementById('product-id').value = product._id;
    document.getElementById('p-name').value = product.name;
    document.getElementById('p-description').value = product.description;
    document.getElementById('p-price').value = product.price;
    document.getElementById('p-image').value = product.image;
    document.getElementById('p-category').value = product.category;
    document.getElementById('p-stock').value = product.stock;
  } else {
    title.textContent = 'Add product';
    document.getElementById('product-form').reset();
    document.getElementById('product-id').value = '';
  }

  panel.style.display = 'block';
  panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function closeProductForm() {
  document.getElementById('product-form-panel').style.display = 'none';
}

async function handleProductFormSubmit(e) {
  e.preventDefault();

  const fields = ['p-name', 'p-description', 'p-price', 'p-image', 'p-stock'];
  clearFieldErrors(fields);
  document.getElementById('product-form-alert').innerHTML = '';

  const id = document.getElementById('product-id').value;
  const payload = {
    name: document.getElementById('p-name').value.trim(),
    description: document.getElementById('p-description').value.trim(),
    price: parseFloat(document.getElementById('p-price').value),
    image: document.getElementById('p-image').value.trim(),
    category: document.getElementById('p-category').value,
    stock: parseInt(document.getElementById('p-stock').value, 10),
  };

  let hasError = false;
  if (!payload.name) { showFieldError('p-name', 'Name is required'); hasError = true; }
  if (!payload.description) { showFieldError('p-description', 'Description is required'); hasError = true; }
  if (!(payload.price >= 0)) { showFieldError('p-price', 'Enter a valid price'); hasError = true; }
  if (!payload.image) { showFieldError('p-image', 'Image URL is required'); hasError = true; }
  if (!(payload.stock >= 0)) { showFieldError('p-stock', 'Enter a valid stock quantity'); hasError = true; }
  if (hasError) return;

  const submitBtn = document.getElementById('product-form-submit');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Saving…';

  try {
    if (id) {
      await apiRequest(`/products/${id}`, { method: 'PUT', auth: true, body: payload });
    } else {
      await apiRequest('/products', { method: 'POST', auth: true, body: payload });
    }
    closeProductForm();
    loadAdminProducts();
  } catch (err) {
    document.getElementById('product-form-alert').innerHTML = `<div class="alert alert-error">${err.message}</div>`;
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Save product';
  }
}

// ---- Orders: list + status update ----
async function loadAdminOrders() {
  const mount = document.getElementById('admin-orders-list');
  try {
    const res = await apiRequest('/orders?all=true', { auth: true });
    renderAdminOrders(res.data);
  } catch (err) {
    mount.innerHTML = `<div class="alert alert-error">${err.message}</div>`;
  }
}

const STATUS_OPTIONS = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

function renderAdminOrders(orders) {
  const mount = document.getElementById('admin-orders-list');

  if (orders.length === 0) {
    mount.innerHTML = `<div class="empty-state">No orders have been placed yet.</div>`;
    return;
  }

  mount.innerHTML = orders
    .map(
      (order) => `
    <div class="order-card" data-order-id="${order._id}">
      <div class="flex-between order-card-header">
        <div>
          <strong>Order #${order._id.slice(-8).toUpperCase()}</strong>
          <span class="order-date">${order.user?.name || 'Unknown user'} — ${order.user?.email || ''}</span>
        </div>
        <select class="form-select status-select" style="width: auto;">
          ${STATUS_OPTIONS.map(
            (s) => `<option value="${s}" ${s === order.status ? 'selected' : ''}>${s}</option>`
          ).join('')}
        </select>
      </div>
      <div class="order-card-items">
        ${order.items
          .map((i) => `<div class="flex-between summary-line"><span>${i.name} × ${i.quantity}</span><span>$${(i.price * i.quantity).toFixed(2)}</span></div>`)
          .join('')}
      </div>
      <div class="flex-between order-card-total">
        <strong>Total</strong><strong>$${order.totalAmount.toFixed(2)}</strong>
      </div>
      <div class="status-save-alert"></div>
    </div>
  `
    )
    .join('');

  mount.querySelectorAll('.status-select').forEach((select) => {
    select.addEventListener('change', () => handleStatusChange(select));
  });
}

async function handleStatusChange(select) {
  const card = select.closest('.order-card');
  const orderId = card.dataset.orderId;
  const alertBox = card.querySelector('.status-save-alert');

  try {
    await apiRequest(`/orders/${orderId}/status`, {
      method: 'PUT',
      auth: true,
      body: { status: select.value },
    });
    alertBox.innerHTML = `<div class="alert alert-success" style="margin-top:0.75rem;">Status updated.</div>`;
    setTimeout(() => { alertBox.innerHTML = ''; }, 2000);
  } catch (err) {
    alertBox.innerHTML = `<div class="alert alert-error" style="margin-top:0.75rem;">${err.message}</div>`;
  }
}
