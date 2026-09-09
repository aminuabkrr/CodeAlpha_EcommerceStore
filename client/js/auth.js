function initLoginForm() {
  const params = new URLSearchParams(window.location.search);
  if (params.get('expired') === 'true') {
    alertBox.innerHTML = `<div class="alert alert-info">Your session expired — please log in again.</div>`;
  }
  const form = document.getElementById('login-form');
  const alertBox = document.getElementById('login-alert');
  const submitBtn = document.getElementById('login-submit');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearFieldErrors(['email', 'password']);
    alertBox.innerHTML = '';

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    let hasError = false;
    if (!email) { showFieldError('email', 'Email is required'); hasError = true; }
    if (!password) { showFieldError('password', 'Password is required'); hasError = true; }
    if (hasError) return;

    submitBtn.disabled = true;
    submitBtn.textContent = 'Logging in…';

    try {
      const res = await apiRequest('/auth/login', {
        method: 'POST',
        body: { email, password },
      });

      setAuth(res.data.token, res.data.user);

      // Redirect back to wherever the user was headed, if checkout sent them here
      const params = new URLSearchParams(window.location.search);
      const redirect = params.get('redirect') || 'index.html';
      window.location.href = redirect;
    } catch (err) {
      alertBox.innerHTML = `<div class="alert alert-error">${err.message}</div>`;
      submitBtn.disabled = false;
      submitBtn.textContent = 'Log in';
    }
  });
}

function initRegisterForm() {
  const form = document.getElementById('register-form');
  const alertBox = document.getElementById('register-alert');
  const submitBtn = document.getElementById('register-submit');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearFieldErrors(['name', 'email', 'password']);
    alertBox.innerHTML = '';

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    let hasError = false;
    if (!name) { showFieldError('name', 'Name is required'); hasError = true; }
    if (!email) { showFieldError('email', 'Email is required'); hasError = true; }
    if (password.length < 6) { showFieldError('password', 'Password must be at least 6 characters'); hasError = true; }
    if (hasError) return;

    submitBtn.disabled = true;
    submitBtn.textContent = 'Creating account…';

    try {
      const res = await apiRequest('/auth/register', {
        method: 'POST',
        body: { name, email, password },
      });

      setAuth(res.data.token, res.data.user);
      window.location.href = 'index.html';
    } catch (err) {
      alertBox.innerHTML = `<div class="alert alert-error">${err.message}</div>`;
      submitBtn.disabled = false;
      submitBtn.textContent = 'Create account';
    }
  });
}

// ---- Shared form-error helpers ----
function showFieldError(fieldId, message) {
  const input = document.getElementById(fieldId);
  const errorEl = document.getElementById(`${fieldId}-error`);
  if (input) input.classList.add('error');
  if (errorEl) errorEl.textContent = message;
}

function clearFieldErrors(fieldIds) {
  fieldIds.forEach((id) => {
    const input = document.getElementById(id);
    const errorEl = document.getElementById(`${id}-error`);
    if (input) input.classList.remove('error');
    if (errorEl) errorEl.textContent = '';
  });
}

// ---- Guard used by checkout.html and orders.html ----
function requireAuth() {
  if (!isLoggedIn()) {
    const redirect = encodeURIComponent(window.location.pathname.split('/').pop());
    window.location.href = `login.html?redirect=${redirect}`;
    return false;
  }
  return true;
}
