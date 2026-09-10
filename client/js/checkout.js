function initCheckoutPage() {
  const cart = getCart();
  const mount = document.getElementById('checkout-content');

  if (cart.length === 0) {
    mount.innerHTML = `
      <div class="empty-state">
        Your cart is empty — add something before checking out.
        <div style="margin-top: 1rem;">
          <a href="products.html" class="btn btn-primary">Browse products</a>
        </div>
      </div>
    `;
    return;
  }

  const { totalItems, totalPrice } = getCartTotals();

  mount.innerHTML = `
    <div class="checkout-grid">
      <form id="checkout-form" novalidate class="checkout-form">
        <h2 style="margin-bottom: 1rem;">Delivery information</h2>

        <div class="form-group">
          <label class="form-label" for="fullName">Full name</label>
          <input type="text" id="fullName" class="form-input" required>
          <div class="form-error" id="fullName-error"></div>
        </div>

        <div class="form-group">
          <label class="form-label" for="address">Street address</label>
          <input type="text" id="address" class="form-input" required>
          <div class="form-error" id="address-error"></div>
        </div>

        <div class="form-group">
          <label class="form-label" for="city">City</label>
          <input type="text" id="city" class="form-input" required>
          <div class="form-error" id="city-error"></div>
        </div>

        <div class="form-group">
          <label class="form-label" for="postalCode">Postal code</label>
          <input type="text" id="postalCode" class="form-input" required>
          <div class="form-error" id="postalCode-error"></div>
        </div>

        <div class="form-group">
          <label class="form-label" for="phone">Phone number</label>
          <input type="tel" id="phone" class="form-input" required>
          <div class="form-error" id="phone-error"></div>
        </div>

        <div id="checkout-alert"></div>

        <button type="submit" class="btn btn-primary btn-block" id="place-order-btn">
          Place order — $${totalPrice.toFixed(2)}
        </button>
      </form>

      <div class="order-summary">
        <h2 style="margin-bottom: 1rem;">Order summary</h2>
        ${cart
          .map(
            (item) => `
          <div class="flex-between summary-line">
            <span>${item.name} × ${item.quantity}</span>
            <span>$${(item.price * item.quantity).toFixed(2)}</span>
          </div>
        `
          )
          .join('')}
        <div class="flex-between summary-line"><span>Items</span><span>${totalItems}</span></div>
        <div class="flex-between summary-total"><strong>Total</strong><strong>$${totalPrice.toFixed(2)}</strong></div>
      </div>
    </div>
  `;

  document.getElementById('checkout-form').addEventListener('submit', handleOrderSubmit);
}

async function handleOrderSubmit(e) {
  e.preventDefault();

  const fields = ['fullName', 'address', 'city', 'postalCode', 'phone'];
  clearFieldErrors(fields);
  document.getElementById('checkout-alert').innerHTML = '';

  const values = {};
  let hasError = false;
  fields.forEach((field) => {
    const value = document.getElementById(field).value.trim();
    values[field] = value;
    if (!value) {
      showFieldError(field, 'This field is required');
      hasError = true;
    }
  });
  if (hasError) return;

  const cart = getCart();
  const items = cart.map((item) => ({
    productId: item.productId,
    quantity: item.quantity,
  }));

  const submitBtn = document.getElementById('place-order-btn');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Placing order…';

  try {
    await apiRequest('/orders', {
      method: 'POST',
      auth: true,
      body: { items, deliveryInfo: values },
    });

    clearCart();
    window.location.href = 'orders.html?placed=true';
  } catch (err) {
    document.getElementById('checkout-alert').innerHTML = `<div class="alert alert-error">${err.message}</div>`;
    submitBtn.disabled = false;
    submitBtn.textContent = 'Place order';
  }
}
