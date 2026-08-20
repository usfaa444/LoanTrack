# Idea Drawer — Features Saved for Later

Features analyzed and deferred from the Souga competitor research.

---

## #5 — Merchant Stock-to-Credit Link

**Source:** Souga competitor analysis — Souga mentions boutiques but doesn't connect inventory to credit.

**Concept:** "Boutique mode" — shopkeeper adds a product → customer takes it on credit → inventory auto-decrements. Makes the app a sales tool, not just a lending tool.

**Why deferred:** Requires mobile UI (CMP) for the merchant dashboard + inventory management. Backend-only implementation would lack the interactive storefront component.

**When to revisit:** After CMP mobile app is built and LoanTrack core features are stable.

**Backend prep work suggested:**
- `MerchantInventory` Prisma model (product name, price, quantity)
- `StockCredit` relation model
- API endpoints: CRUD inventory, link credit to stock items

---

## #7 — Multi-Language UI: French + Mooré + Dioula + Fulfulde

**Source:** Souga competitor analysis — they named themselves a Dioula word but only ship French UI.

**Concept:** Build actual Mooré and Dioula UI (not just French), for real trust in Burkina Faso. Local language UI is a massive trust signal.

**Why deferred:** Requires translation infrastructure (i18n keys for all 4 languages), native speaker review, and mobile UI (CMP) for the language switcher. Complex cross-cutting concern.

**When to revisit:** After CMP mobile app is stable, before Burkina Faso rural launch.

**Backend prep work suggested:**
- Add `language` field to User model
- Localization support in API error messages
- Content management for multilingual templates