(() => {
  const params = new URLSearchParams(window.location.search);
  const sessionId = params.get('session_id') || '';
  const service = params.get('service');
  const isCheckoutId = /^cs_(?:test|live)_[A-Za-z0-9_]{10,}$/.test(sessionId) && sessionId.length <= 255;

  if (!isCheckoutId) return;

  const messages = {
    advisory: {
      lead: 'Thanks for choosing',
      accent: 'AI Advisory.',
      intro: 'Your AI Advisory (Steward) checkout has finished. Keep the Stripe reference below if you need help with your order.',
      next: 'After Stripe confirms your payment, we’ll email you to arrange your first private consultation and help you access the guidance included in your plan.',
    },
    team: {
      lead: 'Thanks for bringing',
      accent: 'your team aboard.',
      intro: 'Your AI Team Program (Guild) checkout has finished. Keep the Stripe reference below if you need help with your order.',
      next: 'After Stripe confirms your payment, we’ll email you to arrange your first team consultation and help your group get started.',
    },
  };

  document.getElementById('order-status').textContent = 'Stripe checkout finished';
  document.getElementById('checkout-session-id').textContent = sessionId;
  document.getElementById('checkout-reference').hidden = false;
  const isTest = sessionId.startsWith('cs_test_');
  if (isTest) document.getElementById('test-note').hidden = false;

  if (!Object.prototype.hasOwnProperty.call(messages, service)) {
    if (isTest) document.getElementById('order-next').textContent = 'For live orders, our team will follow up at the email address used at checkout after Stripe confirms payment.';
    return;
  }

  const message = messages[service];
  document.getElementById('order-title-lead').textContent = message.lead;
  document.getElementById('order-title-accent').textContent = message.accent;
  document.getElementById('order-intro').textContent = message.intro;
  document.getElementById('order-next').textContent = isTest
    ? 'This is a test run. For live orders, our team will email you to arrange your first consultation after Stripe confirms payment.'
    : message.next;
})();
