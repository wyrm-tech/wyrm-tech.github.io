# AI Concierge sales presentation

Open `/ai/pitch-deck/` from the existing site server. The Sales role on the join-the-team page links here.

- Use the chapter links, previous/next buttons, or arrow keys to navigate. Home and End go to the first and last slide. Keyboard navigation yields to form controls and links.
- Talking points appear on the same screen, so close them before screen sharing. They are ordinary page content, not private or access-controlled.
- Read all shows a continuous page. Print / PDF uses the browser print dialog and a landscape layout for the complete deck, excluding controls and talking points.
- Direct slide links use descriptive fragments, such as `#guild` or `#discovery`.

## Content and prices

The narrative incorporates the October 19 discussion: small and midsize businesses, cost and revenue motivations, learning versus delivery, consultation cycles, opportunity examples, discovery, proposals, and follow-up opportunities. The industry examples are explicitly illustrative. The proof slide uses the examples already published on the AI Concierge page.

Steward and Guild prices were verified against the Stripe test catalog on October 19, 2026. They are a static snapshot, not a live catalog connection. Update both the visible HTML defaults and the `guildPrices` arrays in `deck.js` when pricing changes. Yearly Guild billing is ten times monthly; every seat receives the volume rate for the selected band. The minimum is three seats, with the current checkout maximum of 99.

Butler has a $10,000 minimum per fixed-bid engagement. Payment arrangements and ongoing support require an agreed proposal. The deck does not submit payment or change Stripe settings.

The full narrative and three-seat monthly examples remain readable without JavaScript. Presentation controls and the Guild calculator require JavaScript.
