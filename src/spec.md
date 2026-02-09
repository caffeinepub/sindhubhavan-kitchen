# Specification

## Summary
**Goal:** Replace all menu items in the “Curry” category with the items/prices from the uploaded Curry.PNG, and enable admins to perform category-wide bulk replacement from the Admin UI.

**Planned changes:**
- Backend: add an admin-only operation to bulk replace all menu items in a single category with a provided list (name, description, priceInINR), leaving other categories unchanged.
- Backend: update seeded/stored menu data so the “Curry” category contains exactly 32 items matching Curry.PNG (names + prices), with empty descriptions allowed.
- Frontend (Admin > Menu Management): replace the simulated “Add Menu Item” action with real backend mutations and success/failure feedback.
- Frontend (Admin > Menu Management): add a bulk replace UI for a selected category (default “Curry”) that previews parsed items and requires explicit confirmation before applying, then refreshes menu data.

**User-visible outcome:** Admins can add menu items using real backend actions and can bulk replace the entire “Curry” category from the Admin UI; the Menu page updates to show the new Curry list without manual refresh.
