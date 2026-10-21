# Stripe pricing table return page

The AI Concierge pricing tables can redirect here after a customer finishes Stripe Checkout. In each pricing table's **Confirmation page** settings, choose a custom redirect URL:

- AI Advisory / Steward: `https://wyrmtech.com/ai/order-confirmed/?service=advisory&session_id={CHECKOUT_SESSION_ID}`
- AI Team Program / Guild: `https://wyrmtech.com/ai/order-confirmed/?service=team&session_id={CHECKOUT_SESSION_ID}`

Keep `{CHECKOUT_SESSION_ID}` exactly as written; Stripe replaces it during the redirect. Publish this page before setting the URLs in Stripe.

The page uses the service parameter to choose copy and displays the Checkout Session ID as a support reference. The ID is opaque. This static page cannot retrieve or verify the plan, price, seats, or payment status from Stripe. The Google Analytics page location omits the query string so the session ID is not included in that field. Use Stripe payment events for fulfillment and verified purchase attribution.
