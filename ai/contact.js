(() => {
  const form = document.getElementById('inquiry-form');
  const button = document.getElementById('inquiry-submit');
  const status = document.getElementById('inquiry-status');
  const endpoint = form.getAttribute('action');
  const isConfigured = /^https:\/\/formsubmit\.co\/[^/?#\s]+$/.test(endpoint || '');

  button.disabled = !isConfigured;

  if (!isConfigured) {
    status.textContent = 'This form is not accepting requests yet. Please check back soon.';
    status.hidden = false;
  }

  form.addEventListener('submit', (event) => {
    if (!isConfigured) {
      event.preventDefault();
    }
  });
})();
