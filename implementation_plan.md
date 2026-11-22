# Implementation Plan: Melting Cheese Direct Food Ordering & Kitchen Admin Dashboard

A mobile-first direct food ordering web application and realtime kitchen admin dashboard for **Melting Cheese** (14, Sant Ravidas Nagar, Bhadohi, UP; Phone/WhatsApp: `+918090485140`; Hours: Open till 12:00 AM).

---

## 1. Architecture & Tech Stack

- **Framework**: Next.js 15+ (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS, Lucide Icons, Mobile-First Viewports
- **Backend & Database**: Supabase (`@supabase/supabase-js`, `@supabase/ssr`)
- **Realtime**: Supabase Realtime Channels (PostgreSQL CDC on `orders` & `menu_items`)
- **Checkout & Payments**:
  - Dynamic UPI deep link (`upi://pay?pa=rhythm8@slc&pn=Melting%20Cheese&am=...&cu=INR`)
  - Dynamic QR code generation (`qrcode.react`)
  - WhatsApp order handoff API (`https://wa.me/918090485140?text=...`)
- **Audio Chime**: Native Web Audio API synthesizer for instant order arrival alert without external asset dependency.

---

## 2. Folder Structure

```
melting-cheese/
├── .env.local                          # Supabase URL/Key, UPI ID, Restaurant Phone
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.mjs
├── next.config.ts
├── supabase/
│   └── schema_and_seed.sql             # Migration script with 29 items, RLS & Realtime
├── src/
│   ├── app/
│   │   ├── layout.tsx                  # Root layout with fonts, metadata, providers
│   │   ├── page.tsx                    # Customer storefront page
│   │   ├── globals.css                 # Tailwind directives, animations & custom styling
│   │   └── admin/
│   │       ├── page.tsx                # Kitchen Admin Dashboard (Live Orders & Stock)
│   │       └── login/
│   │           └── page.tsx            # Supabase Auth Login for Admin
│   ├── components/
│   │   ├── storefront/
│   │   │   ├── Header.tsx              # Brand banner, location, open hours, WhatsApp link
│   │   │   ├── CategoryBar.tsx         # Sticky category tabs with Veg filter toggle
│   │   │   ├── MenuItemCard.tsx        # Mobile-first food card with veg/non-veg indicator
│   │   │   ├── PizzaCustomizerSheet.tsx# Bottom drawer for Crust & Extra Cheese
│   │   │   ├── CartDrawer.tsx          # Slide-over cart, promo bar & bill breakdown
│   │   │   ├── CheckoutModal.tsx       # Name, phone, address, GPS link, UPI QR / COD
│   │   │   └── OrderSuccessModal.tsx   # Order confirmation & WhatsApp launch button
│   │   └── admin/
│   │       ├── LiveOrdersTab.tsx       # Realtime orders queue with status transition
│   │       ├── StockToggleTab.tsx      # Realtime inventory toggle for 29 menu items
│   │       └── OrderCard.tsx           # Individual kitchen order ticket with customer details
│   ├── context/
│   │   └── CartContext.tsx             # Cart state, customization keys, DIRECT50 promo logic
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts               # Browser Supabase client
│   │   │   └── server.ts               # Server Supabase client
│   │   ├── menu-data.ts                # Robust 29-item fallback menu dataset
│   │   ├── upi.ts                      # UPI intent string and payload builder
│   │   ├── whatsapp.ts                 # Clean WhatsApp order formatting
│   │   └── sound.ts                    # Web Audio kitchen chime synthesizer
│   └── types/
│       └── index.ts                    # TypeScript types (MenuItem, CartItem, Order, etc.)
```

---

## 3. SQL Schema & Migration (`supabase/schema_and_seed.sql`)

### Tables
1. **`menu_items`**:
   - `id`: UUID PRIMARY KEY DEFAULT `gen_random_uuid()`
   - `name`: TEXT NOT NULL
   - `category`: TEXT NOT NULL (`Pizza`, `Burgers`, `Snacks`, `Chicken Wings & Strips`, `Mocktails`)
   - `dietary`: TEXT NOT NULL CHECK (`dietary` IN ('veg', 'non-veg'))
   - `base_price`: INTEGER NOT NULL
   - `customizable`: BOOLEAN DEFAULT false
   - `description`: TEXT
   - `is_available`: BOOLEAN DEFAULT true
   - `created_at`: TIMESTAMPTZ DEFAULT now()

2. **`orders`**:
   - `id`: UUID PRIMARY KEY DEFAULT `gen_random_uuid()`
   - `order_number`: SERIAL
   - `customer_name`: TEXT NOT NULL
   - `customer_phone`: TEXT NOT NULL
   - `delivery_address`: TEXT NOT NULL
   - `gps_link`: TEXT
   - `items`: JSONB NOT NULL (array of ordered items with customizations, prices, quantities)
   - `subtotal`: INTEGER NOT NULL
   - `discount`: INTEGER NOT NULL DEFAULT 0
   - `free_item`: TEXT
   - `total`: INTEGER NOT NULL
   - `payment_method`: TEXT NOT NULL CHECK (`payment_method` IN ('UPI', 'COD'))
   - `payment_status`: TEXT NOT NULL CHECK (`payment_status` IN ('PENDING', 'PAID')) DEFAULT 'PENDING'
   - `order_status`: TEXT NOT NULL CHECK (`order_status` IN ('NEW', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED')) DEFAULT 'NEW'
   - `created_at`: TIMESTAMPTZ DEFAULT now()

### Row-Level Security (RLS) & Realtime
- Enable RLS on `menu_items` and `orders`.
- `menu_items`:
  - `anon` / `authenticated`: SELECT permitted (`USING (true)`)
  - `authenticated`: ALL operations permitted (`USING (auth.role() = 'authenticated')`)
- `orders`:
  - `anon` / `authenticated`: INSERT permitted (`WITH CHECK (true)`)
  - `authenticated`: ALL operations permitted (`USING (auth.role() = 'authenticated')`)
- Realtime Publication:
  - `ALTER PUBLICATION supabase_realtime ADD TABLE orders;`
  - `ALTER PUBLICATION supabase_realtime ADD TABLE menu_items;`

### 29 Seed Menu Items
- **Pizzas (8"):** Sweetcorn Pizza (₹289, veg), Paneer Pizza (₹309, veg), Classic Chicken Pizza (₹309, non-veg), Paneer Makhani Pizza (₹319, veg), Tandoori Paneer Pizza (₹319, veg), Tandoori Chicken Pizza (₹319, non-veg), Butter Chicken Pizza (₹319, non-veg), Barbeque Chicken Pizza (₹319, non-veg). *(All marked customizable)*
- **Burgers:** Veg Classic Burger (₹149, veg), Veg Makhani Burger (₹149, veg), Classic Grill Chicken (₹169, non-veg), Butter Chicken Grill (₹179, non-veg), Tandoori Grill Chicken (₹179, non-veg), Bbq chicken grill (₹179, non-veg), Big Smokey Grill Chicken Burger (₹249, non-veg, customizable), Crispy Chicken Burger (₹249, non-veg).
- **Snacks:** Salted Fries (₹119, veg, customizable), Peri Peri Fries (₹149, veg, customizable), Saucy Cheesy Fries (₹199, veg, customizable).
- **Chicken Wings & Strips:** Signature Chicken Wings - 5 Pcs (₹299, non-veg), Signature Chicken Strips - 5 Pcs (₹299, non-veg).
- **Mocktails (all ₹99, veg):** Blue Lagoon Mocktail, Pineapple Mocktail, Strawberry Mocktail, Green Mint Mocktail, Green Apple Mocktail, Blueberry Mocktail, Orange Mocktail, Lemon Tea.

---

## 4. Cart & Promo State Logic (`DIRECT50`)

### Promo Code Rules
- **Code:** `DIRECT50`
- **Activation:**
  - Auto-detected from URL query param `?promo=DIRECT50`.
  - Or manually applied in the CartDrawer promo input.
- **Threshold & Perks:**
  - When active and `subtotal >= 299`:
    - Discount: ₹50 deducted immediately.
    - Attached Free Item: `1x FREE Salted Fries (DIRECT50 Perk)` at ₹0.
    - Final calculation: `total = subtotal - 50`.
  - When active and `subtotal < 299`:
    - Show live visual progress bar: `Add ₹${299 - subtotal} more to unlock ₹50 OFF + FREE Salted Fries!`.
    - No discount or free item attached until ₹299 threshold is reached.

### Item Customization Cart Mechanics
- Customized pizzas have unique cart IDs generated from item ID + selected options:
  - Crust: `Standard` (+₹0) | `Cheese Burst` (+₹120)
  - Extra Cheese: No (+₹0) | Yes (+₹40)
- Allows adding multiple variations of the same pizza (e.g. 1 Standard + 1 Cheese Burst) without overwriting.

---

## 5. UI Layout & User Experience

### 1. Storefront (`/`)
- **Brand Hero Header:**
  - Restaurant Name: **Melting Cheese** (warm cheese-gold & dark slate palette)
  - Address: 14, Sant Ravidas Nagar, Bhadohi, UP
  - Badge: "Open till 12:00 AM" (green pulse indicator)
  - Instant direct call & WhatsApp buttons
- **Navigation & Filters:**
  - Search input with clear button
  - Veg-only filter toggle switch with green indicator
  - Sticky category tabs with item count pills
- **Menu Card:**
  - Veg (green square-dot) / Non-Veg (red triangle-dot) badge
  - Item name, category, price, mouthwatering description
  - Customization tag (`Customizable`)
  - Quick `+ ADD` button with quantity control when in cart
- **Pizza Customizer Drawer:**
  - Sleek mobile bottom drawer
  - Radio options for Crust (Standard +₹0 / Cheese Burst +₹120)
  - Checkbox for Extra Cheese (+₹40)
  - Total price preview & "Add to Cart" button
- **Bottom Floating Cart Pill:**
  - Visible on mobile when `cartCount > 0`
  - Shows total items and total price, slides up `CartDrawer` on tap
- **Checkout Modal:**
  - Name, 10-digit Phone input
  - Bhadohi Delivery Address / Landmark
  - "Attach GPS Pin" button (`navigator.geolocation` -> Google Maps link)
  - Payment method switch (UPI / COD)
  - UPI Screen: Dynamic QR code via `qrcode.react` + "Pay via UPI App" mobile intent link
  - Submit: Saves to Supabase `orders` table + generates formatted WhatsApp link and redirects customer to chat.

### 2. Kitchen Admin Dashboard (`/admin`)
- **Supabase Auth Gate:** Simple email/password login screen; redirects authenticated admin to `/admin`.
- **Live Orders Tab:**
  - Supabase Realtime subscription to `orders` table
  - Automatic chime sound upon receiving new orders
  - Order cards grouped by status with timestamps
  - Quick action buttons: `Accept & Prepare` -> `Out for Delivery` -> `Delivered`
  - Instant `Mark UPI Paid` toggle
  - Direct links to Call Customer and Open GPS Pin
- **Stock Toggle Tab:**
  - All 29 items listed with category filters
  - One-tap toggle to mark In Stock / Sold Out with immediate Supabase update.

---

## 6. Implementation Steps

1. **Step 1:** Review and Approval of this Implementation Plan *(Current Step)*.
2. **Step 2:** Generate `supabase/schema_and_seed.sql` with tables, RLS policies, 29 seed items, and realtime publication.
3. **Step 3:** Scaffold Next.js application, configure Tailwind, setup Supabase client/server helpers, types, local fallback menu data, Web Audio chime, UPI and WhatsApp utility handlers.
4. **Step 4:** Build Storefront (`/`), Cart Context with `DIRECT50` promo logic, Pizza Customizer Sheet, and Checkout with UPI QR & WhatsApp handoff.
5. **Step 5:** Build Kitchen Admin Dashboard (`/admin`) with Supabase Auth, Live Orders Realtime queue with audio chime, and Stock Toggle tab.
6. **Step 6:** Run `npm run build` to verify zero TypeScript/lint/build errors, test local execution, and review in browser.
