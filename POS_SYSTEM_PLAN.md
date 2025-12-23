# Omni-channel POS & Purchase Order System Plan

This plan outlines the architecture for a unified Point of Sale (POS) system that synchronizes sales from multiple channels (Website, In-store, Talabat) and manages restocking via Purchase Orders (POs) from suppliers.

## 1. Database Architecture (The Backend)

### Sales Channel Integration
We need to modify the `orders` table to track *where* a sale originated.
- **Table:** `public.orders`
- **New Column:** `channel` (Type: Enum or Text) 
    - Values: `website`, `pos_store`, `talabat`, `other_delivery`
- **New Column:** `external_order_id` (To track Talabat/Partner reference numbers)

### Purchase Management (New Tables)
To track supplier relationships and restocking:
- **`suppliers`**: Stores vendor name, contact, address, and category.
- **`purchase_orders`**: 
    - Tracks orders *sent to* suppliers.
    - Statuses: `draft`, `sent`, `partially_received`, `received`, `cancelled`.
- **`purchase_order_items`**: Line items for each PO.
- **`inventory_transactions`**: (Existing) Will link to PO IDs for "Stock In" events.

---

## 2. Managing Modes of Sales

### A. Website (Automated)
- **Flow:** Customer orders online -> `channel` is set to `website`.
- **Inventory:** Deducted immediately upon payment (already implemented).

### B. In-Store (Physical Shop POS)
- **The Interface:** A simplified, high-speed checkout page.
- **Tools:** 
    - **Barcode Scanning:** Use the existing `barcode` field on products for instant lookup.
    - **Thermal Print Support:** Integration with generic 80mm printers.
- **Flow:** Staff scans items -> Total calculated -> Payment type selected (Cash/Benefit/Card) -> `channel` set to `pos_store`.

### C. Talabat & Delivery Partners
- **Entry Mode:**
    - **Initial:** A manual "Talabat Order Entry" screen where staff copy-paste the items from the Talabat tablet into your system to keep inventory in sync.
    - **Manual ID:** Capture the Talabat Order ID for reconcilliation.
- **Pricing:** Handle Talabat-specific pricing (often higher due to commission).

---

## 3. Managing Modes of Purchase (Purchase Orders)

### The Supplier Workflow
1. **Identify Need:** System flags "Low Stock" items (based on `low_stock_threshold`).
2. **Draft PO:** Admin selects a Supplier and adds items.
3. **Send PO:** Status changes to `sent`. A PDF can be auto-generated and emailed to the supplier.
4. **Receive Goods:** When the delivery truck arrives, staff marks items as "Received".
    - **Auto-Restock:** The system automatically adds the received quantity to the `stock_quantity` of the products and logs an `inventory_transaction` as `stock_in`.

---

## 4. UI/UX Design

### The "Unified Orders" Dashboard
- A single list showing orders from **all channels**.
- Color-coded badges: [Website: Blue] [Store: Green] [Talabat: Orange].
- Quick toggle to filter by channel for multi-channel performance reports.

### The "Supplier Portal"
- A new section in the Admin panel to:
    - Manage Supplier database.
    - View all PO history.
    - Track outstanding payments and delivery status from vendors.

---

## 5. Security & Roles
- **Cashier Role:** Can only access the POS interface and view basic product info.
- **Admin Role:** Full access to POs, Supplier data, and Channel-wise revenue analytics.

---
*End of Plan*
