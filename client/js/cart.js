// Cart is stored client-side in localStorage as an array of:
// { productId, name, price, image, stock, quantity }
// Server-side stock/price are re-validated at checkout (Stage 10) regardless.

function getCart() {
  const raw = localStorage.getItem('ecom_cart');
  return raw ? JSON.parse(raw) : [];
}

function saveCart(cart) {
  localStorage.setItem('ecom_cart', JSON.stringify(cart));
}

function addToCart(product, quantity) {
  const cart = getCart();
  const existing = cart.find((item) => item.productId === product._id);
  const currentQty = existing ? existing.quantity : 0;
  const desiredQty = currentQty + quantity;

  if (desiredQty > product.stock) {
    return {
      success: false,
      message: `Only ${product.stock} in stock — you already have ${currentQty} in your cart.`,
    };
  }

  if (existing) {
    existing.quantity = desiredQty;
  } else {
    cart.push({
      productId: product._id,
      name: product.name,
      price: product.price,
      image: product.image,
      stock: product.stock,
      quantity,
    });
  }

  saveCart(cart);
  return { success: true };
}

function updateCartQuantity(productId, quantity) {
  const cart = getCart();
  const item = cart.find((i) => i.productId === productId);
  if (!item) return { success: false, message: 'Item not found in cart.' };

  if (quantity < 1) return removeFromCart(productId);

  if (quantity > item.stock) {
    return { success: false, message: `Only ${item.stock} in stock.` };
  }

  item.quantity = quantity;
  saveCart(cart);
  return { success: true };
}

function removeFromCart(productId) {
  const cart = getCart().filter((i) => i.productId !== productId);
  saveCart(cart);
  return { success: true };
}

function clearCart() {
  localStorage.removeItem('ecom_cart');
}

function getCartTotals() {
  const cart = getCart();
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  return { totalItems, totalPrice };
}

// ---- Cart page rendering ----
function renderCartPage() {
  const cart = getCart();
  const mount = document.getElementById('cart-content');

  if (cart.length === 0) {
    mount.innerHTML = `
      <div class="empty-state">
        Your cart is empty.
        <div style="margin-top: 1rem;">
          <a href="products.html" class="btn btn-primary">Continue shopping</a>
        </div>
      </div>
    `;
    return;
  }

  const rows = cart
    .map(
      (item) => `
    <div class="cart-row" data-id="${item.productId}">
      <img src="${item.image}" alt="${item.name}" class="cart-row-image">
      <div class="cart-row-info">
        <h3>${item.name}</h3>
        <p class="product-card-price">$${item.price.toFixed(2)}</p>
      </div>
      <div class="qty-control">
        <button type="button" class="btn btn-secondary btn-sm cart-qty-minus" aria-label="Decrease quantity">−</button>
        <input type="number" class="form-input cart-qty-input" value="${item.quantity}" min="1" max="${item.stock}" style="width: 56px; text-align: center;">
        <button type="button" class="btn btn-secondary btn-sm cart-qty-plus" aria-label="Increase quantity">+</button>
      </div>
      <p class="cart-row-subtotal">$${(item.price * item.quantity).toFixed(2)}</p>
      <button type="button" class="btn btn-secondary btn-sm cart-remove" aria-label="Remove item">Remove</button>
    </div>
  `
    )
    .join('');

  const { totalItems, totalPrice } = getCartTotals();

  mount.innerHTML = `
    <div class="cart-rows">${rows}</div>
    <div class="cart-summary">
      <div class="flex-between"><span>Items</span><span>${totalItems}</span></div>
      <div class="flex-between"><strong>Total</strong><strong>$${totalPrice.toFixed(2)}</strong></div>
      <div class="cart-actions">
        <a href="products.html" class="btn btn-secondary">Continue shopping</a>
        <a href="checkout.html" class="btn btn-primary">Proceed to checkout</a>
      </div>
    </div>
  `;

  attachCartRowEvents();
}

function attachCartRowEvents() {
  document.querySelectorAll('.cart-row').forEach((row) => {
    const productId = row.dataset.id;
    const input = row.querySelector('.cart-qty-input');

    row.querySelector('.cart-qty-minus').addEventListener('click', () => {
      const value = Math.max(1, parseInt(input.value, 10) - 1);
      applyCartQuantityChange(productId, value);
    });

    row.querySelector('.cart-qty-plus').addEventListener('click', () => {
      const value = parseInt(input.value, 10) + 1;
      applyCartQuantityChange(productId, value);
    });

    input.addEventListener('change', () => {
      applyCartQuantityChange(productId, parseInt(input.value, 10) || 1);
    });

    row.querySelector('.cart-remove').addEventListener('click', () => {
      removeFromCart(productId);
      renderCartPage();
      renderNav();
    });
  });
}

function applyCartQuantityChange(productId, quantity) {
  const result = updateCartQuantity(productId, quantity);
  if (!result.success) {
    alert(result.message); // simple inline feedback; cart re-renders regardless below
  }
  renderCartPage();
  renderNav();
}
