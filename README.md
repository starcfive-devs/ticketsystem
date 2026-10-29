# Gather — Event Discovery & Ticketing Demo

A responsive event-discovery website prototype for Ghana. The original idea is an event feed with social actions, improved here with a modern discovery page, category filters, saved events, and a ticket-selection dialog.

## What's included

- Responsive desktop and mobile layouts.
- Temporary sample events around Accra and Winneba.
- Search by event title, category, description, or location.
- Category filters for Music, Campus, Nightlife, Arts, and Business.
- Save/unsave events.
- Ticket quantity selector and live total in Ghanaian cedi (GH₵).
- Informational account and organizer dialogs.
- Code comments throughout the HTML, CSS, and JavaScript explaining the major parts.

## Run it locally

No build tools are required for this first static prototype.

1. Clone this repository.
2. Open `index.html` in a browser.
3. Or run `python -m http.server 8000` in the project folder and visit `http://localhost:8000`.

## Important demo limitations

The events and prices are temporary examples. The ticket flow does **not** create an order, reserve inventory, issue a ticket, or collect payment. Saved events are stored only in the current page session and will reset when the page reloads.

Before launching, the next development stage should add:
- A backend API and database for users, events, ticket types, inventory, and orders.
- Authentication and organizer permissions.
- A payment-provider integration appropriate for Ghana, with verified payment callbacks.
- Server-side ticket availability checks and unique ticket/QR-code generation.
- Email or SMS confirmations, refunds, and an organizer dashboard.
- Validation, security controls, tests, and deployment configuration.

## Project files

- `index.html` — semantic page structure and dialogs.
- `styles.css` — responsive layout, colors, cards, and modal styling.
- `script.js` — temporary event data, filtering, saved events, and demo ticket calculations.

External photos, Google Fonts, and Font Awesome are loaded from third-party CDNs, so an internet connection is needed for those assets.