function initOrdersPage() {
  const params = new URLSearchParams(window.location.search);
  if (params.get('placed') === 'true') {
    document.getElementById('orders-alert').innerHTML =
      `<div class="alert alert-success">Your order was placed successfully!</div>`;
  }
  loadOrders();
}

async function loadOrders() {
  const mount = document.getElementById('orders-list');

  try {
    const res = await apiRequest('/orders', { auth: true });
    renderOrdersList(res.data);
  } catch (err) {
    mount.innerHTML = `<div class="alert alert-error">${err.message}</div>`;
  }
}

function renderOrdersList(orders) {
  const mount = document.getElementById('orders-list');

  if (orders.length === 0) {
    mount.innerHTML = `
      <div class="empty-state">
        You haven't placed any orders yet.
        <div style="margin-top: 1rem;">
          <a href="products.html" class="btn btn-primary">Start shopping</a>
        </div>
      </div>
    `;
    return;
  }

  mount.innerHTML = orders.map(orderCardHTML).join('');
}

function orderCardHTML(order) {
  const date = new Date(order.createdAt).toLocaleDateString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric',
  });

  const itemsHTML = order.items
    .map((item) => `<div class="flex-between summary-line"><span>${item.name} × ${item.quantity}</span><span>$${(item.price * item.quantity).toFixed(2)}</span></div>`)
    .join('');

  return `
    <div class="order-card">
      <div class="flex-between order-card-header">
        <div>
          <strong>Order #${order._id.slice(-8).toUpperCase()}</strong>
          <span class="order-date">${date}</span>
        </div>
        <span class="badge badge-status-${order.status}">${order.status}</span>
      </div>
      <div class="order-card-items">${itemsHTML}</div>
      <div class="flex-between order-card-total">
        <strong>Total</strong>
        <strong>$${order.totalAmount.toFixed(2)}</strong>
      </div>
    </div>
  `;
}
