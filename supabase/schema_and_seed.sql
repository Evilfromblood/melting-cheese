-- ============================================================
-- Melting Cheese - Database Schema & Menu Seed Migration
-- Restaurant: Melting Cheese, 14, Sant Ravidas Nagar, Bhadohi
-- Phone/WhatsApp: +918090485140
-- ============================================================

-- 1. Enable pgcrypto for UUID generation if needed
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Create customer_profiles Table (for logged-in customers)
CREATE TABLE IF NOT EXISTS customer_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    phone TEXT,
    default_address TEXT,
    gps_link TEXT,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Ensure columns exist if table was created previously
ALTER TABLE customer_profiles ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE customer_profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE customer_profiles ADD COLUMN IF NOT EXISTS default_address TEXT;
ALTER TABLE customer_profiles ADD COLUMN IF NOT EXISTS gps_link TEXT;
ALTER TABLE customer_profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- 3. Create menu_items Table
CREATE TABLE IF NOT EXISTS menu_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL,
    dietary TEXT NOT NULL CHECK (dietary IN ('veg', 'non-veg')),
    base_price INTEGER NOT NULL,
    customizable BOOLEAN DEFAULT false,
    description TEXT,
    is_available BOOLEAN DEFAULT true,
    image TEXT,
    badge TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Ensure image and badge columns exist if table was created previously
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS image TEXT;
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS badge TEXT;

-- Ensure unique constraint exists for idempotent upserts
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'menu_items_name_key'
    ) THEN
        BEGIN
            ALTER TABLE menu_items ADD CONSTRAINT menu_items_name_key UNIQUE (name);
        EXCEPTION
            WHEN OTHERS THEN
                NULL;
        END;
    END IF;
END $$;

-- 4. Create orders Table
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number SERIAL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    delivery_address TEXT NOT NULL,
    gps_link TEXT,
    items JSONB NOT NULL,
    subtotal INTEGER NOT NULL,
    discount INTEGER NOT NULL DEFAULT 0,
    free_item TEXT,
    total INTEGER NOT NULL,
    payment_method TEXT NOT NULL CHECK (payment_method IN ('UPI', 'COD')),
    payment_status TEXT NOT NULL CHECK (payment_status IN ('PENDING', 'PAID')) DEFAULT 'PENDING',
    order_status TEXT NOT NULL CHECK (order_status IN ('NEW', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED')) DEFAULT 'NEW',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Ensure user_id and gps_link exist if table was created previously
ALTER TABLE orders ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS gps_link TEXT;

-- 5. Enable Row Level Security (RLS)
ALTER TABLE customer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- 6. Define RLS Policies for customer_profiles
DROP POLICY IF EXISTS "Users can view own profile" ON customer_profiles;
CREATE POLICY "Users can view own profile"
    ON customer_profiles FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON customer_profiles;
CREATE POLICY "Users can insert own profile"
    ON customer_profiles FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON customer_profiles;
CREATE POLICY "Users can update own profile"
    ON customer_profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- 7. Define RLS Policies for menu_items
DROP POLICY IF EXISTS "Public can view menu items" ON menu_items;
CREATE POLICY "Public can view menu items"
    ON menu_items FOR SELECT
    TO anon, authenticated
    USING (true);

DROP POLICY IF EXISTS "Authenticated admins can manage menu items" ON menu_items;
CREATE POLICY "Authenticated admins can manage menu items"
    ON menu_items FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- 8. Define RLS Policies for orders
DROP POLICY IF EXISTS "Public can insert orders" ON orders;
DROP POLICY IF EXISTS "Anon and authenticated can insert orders" ON orders;
CREATE POLICY "Public can insert orders"
    ON orders FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

DROP POLICY IF EXISTS "Users can view own orders" ON orders;
CREATE POLICY "Users can view own orders"
    ON orders FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Authenticated admins can manage orders" ON orders;
CREATE POLICY "Authenticated admins can manage orders"
    ON orders FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- 9. Enable Supabase Realtime for orders, menu_items, and customer_profiles
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'orders'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE orders;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'menu_items'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE menu_items;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'customer_profiles'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE customer_profiles;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Realtime publication setup note: %', SQLERRM;
END $$;

-- 10. Seed 29 Menu Items (Idempotent upsert by name with dish-specific photos)
INSERT INTO menu_items (name, category, dietary, base_price, customizable, description, is_available, badge, image)
VALUES
    -- Pizza (8 inches, customizable)
    ('Sweetcorn Pizza', 'Pizza', 'veg', 289, true, '8 inch crisp crust loaded with golden sweet corn and rich melted mozzarella.', true, 'bestseller', 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=80'),
    ('Paneer Pizza', 'Pizza', 'veg', 309, true, '8 inch pizza loaded with spiced fresh cottage cheese cubes and golden cheese.', true, 'bestseller', 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600&auto=format&fit=crop&q=80'),
    ('Classic Chicken Pizza', 'Pizza', 'non-veg', 309, true, '8 inch pizza loaded with tender chicken chunks, herb tomato sauce, and mozzarella.', true, 'bestseller', 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&auto=format&fit=crop&q=80'),
    ('Paneer Makhani Pizza', 'Pizza', 'veg', 319, true, '8 inch pizza with rich creamy makhani gravy base topped with marinated paneer.', true, 'chef-special', 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=600&auto=format&fit=crop&q=80'),
    ('Tandoori Paneer Pizza', 'Pizza', 'veg', 319, true, '8 inch pizza infused with fiery tandoori spices, char-grilled paneer, and peppers.', true, 'spicy', 'https://images.unsplash.com/photo-1594007654729-407eedc4be65?w=600&auto=format&fit=crop&q=80'),
    ('Tandoori Chicken Pizza', 'Pizza', 'non-veg', 319, true, '8 inch pizza with smokey tandoori roasted chicken, onion, capsicum, and herbs.', true, 'spicy', 'https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?w=600&auto=format&fit=crop&q=80'),
    ('Butter Chicken Pizza', 'Pizza', 'non-veg', 319, true, '8 inch pizza smothered in buttery tomato gravy and succulent shredded chicken.', true, 'chef-special', 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=600&auto=format&fit=crop&q=80'),
    ('Barbeque Chicken Pizza', 'Pizza', 'non-veg', 319, true, '8 inch pizza drizzled with smoky BBQ sauce, grilled chicken, and caramelized onion.', true, 'bestseller', 'https://images.unsplash.com/photo-1588315029754-2dd089d39a1a?w=600&auto=format&fit=crop&q=80'),

    -- Burgers
    ('Veg Classic Burger', 'Burgers', 'veg', 149, false, 'Crispy golden vegetable patty nestled with fresh lettuce, onions, and signature house mayo.', true, NULL, 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=600&auto=format&fit=crop&q=80'),
    ('Veg Makhani Burger', 'Burgers', 'veg', 149, false, 'Crunchy spiced vegetable patty drenched in rich butter makhani sauce and crisp veggies.', true, 'chef-special', 'https://images.unsplash.com/photo-1520072959219-c595dc870360?w=600&auto=format&fit=crop&q=80'),
    ('Classic Grill Chicken', 'Burgers', 'non-veg', 169, false, 'Tender grilled chicken fillet seasoned with aromatic herbs, crisp lettuce, and mayo.', true, NULL, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80'),
    ('Butter Chicken Grill', 'Burgers', 'non-veg', 179, false, 'Juicy grilled chicken patty coated in velvety butter chicken sauce inside a toasted bun.', true, 'chef-special', 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&auto=format&fit=crop&q=80'),
    ('Tandoori Grill Chicken', 'Burgers', 'non-veg', 179, false, 'Flavour-packed grilled chicken breast patty steeped in roasted Indian tandoori spices.', true, 'spicy', 'https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?w=600&auto=format&fit=crop&q=80'),
    ('Bbq chicken grill', 'Burgers', 'non-veg', 179, false, 'Smoky grilled chicken patty drenched in thick barbeque glaze, fresh onions, and cheese.', true, NULL, 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=600&auto=format&fit=crop&q=80'),
    ('Big Smokey Grill Chicken Burger', 'Burgers', 'non-veg', 249, false, 'Double-layer smokey grilled chicken fillets, melted cheese slice, crisp greens, and special sauce.', true, 'bestseller', 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=600&auto=format&fit=crop&q=80'),
    ('Crispy Chicken Burger', 'Burgers', 'non-veg', 249, false, 'Ultra-crunchy fried chicken fillet seasoned to perfection with creamy sauce and pickles.', true, 'bestseller', 'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?w=600&auto=format&fit=crop&q=80'),

    -- Snacks
    ('Salted Fries', 'Snacks', 'veg', 119, false, 'Golden crispy potato fries tossed in light sea salt. Classic & crunchy.', true, NULL, 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600&auto=format&fit=crop&q=80'),
    ('Peri Peri Fries', 'Snacks', 'veg', 149, false, 'Crispy French fries generously dusted with zesty, hot African peri-peri spice mix.', true, 'spicy', 'https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?w=600&auto=format&fit=crop&q=80'),
    ('Saucy Cheesy Fries', 'Snacks', 'veg', 199, false, 'Crispy fries submerged in warm molten cheddar cheese and seasoned herb drizzle.', true, 'bestseller', 'https://images.unsplash.com/photo-1585109649139-366815a0d713?w=600&auto=format&fit=crop&q=80'),

    -- Chicken Wings & Strips
    ('Signature Chicken Wings - 5 Pcs', 'Chicken Wings & Strips', 'non-veg', 299, false, '5 pieces of succulent, crispy fried chicken wings tossed in chef special seasoning.', true, 'bestseller', 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=600&auto=format&fit=crop&q=80'),
    ('Signature Chicken Strips - 5 Pcs', 'Chicken Wings & Strips', 'non-veg', 299, false, '5 pieces of tender, boneless crispy chicken strips served with tangy dipping sauce.', true, 'chef-special', 'https://images.unsplash.com/photo-1562967914-608f82629710?w=600&auto=format&fit=crop&q=80'),

    -- Mocktails (all ₹99, veg)
    ('Blue Lagoon Mocktail', 'Mocktails', 'veg', 99, false, 'Refreshing blend of blue curacao citrus syrup, lemon fizz, and chilled soda.', true, 'bestseller', 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop&q=80'),
    ('Pineapple Mocktail', 'Mocktails', 'veg', 99, false, 'Tropical pineapple nectar with a punch of citrus and bubbly refreshing soda.', true, NULL, 'https://images.unsplash.com/photo-1546171753-97d7676e4602?w=600&auto=format&fit=crop&q=80'),
    ('Strawberry Mocktail', 'Mocktails', 'veg', 99, false, 'Sweet and tangy crushed strawberry infusion over ice and sparkling soda.', true, NULL, 'https://images.unsplash.com/photo-1556881286-fc6915169721?w=600&auto=format&fit=crop&q=80'),
    ('Green Mint Mocktail', 'Mocktails', 'veg', 99, false, 'Revitalizing fresh garden mint muddled with lime juice and cold soda.', true, NULL, 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&auto=format&fit=crop&q=80'),
    ('Green Apple Mocktail', 'Mocktails', 'veg', 99, false, 'Crisp green apple essence balanced with sweet-tart citrus notes and sparkling fizz.', true, NULL, 'https://images.unsplash.com/photo-1536935338788-846bb9981813?w=600&auto=format&fit=crop&q=80'),
    ('Blueberry Mocktail', 'Mocktails', 'veg', 99, false, 'Vibrant wild blueberry puree stirred with fresh lime and chilled sparkling water.', true, 'chef-special', 'https://images.unsplash.com/photo-1595981267035-7b04ca84a82d?w=600&auto=format&fit=crop&q=80'),
    ('Orange Mocktail', 'Mocktails', 'veg', 99, false, 'Zesty sunshine orange citrus blend infused with lemon twists and soda.', true, NULL, 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=600&auto=format&fit=crop&q=80'),
    ('Lemon Tea', 'Mocktails', 'veg', 99, false, 'Chilled invigorating brewed black tea infused with fresh lemon and mint leaves.', true, NULL, 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600&auto=format&fit=crop&q=80')
ON CONFLICT (name) DO UPDATE SET
    category = EXCLUDED.category,
    dietary = EXCLUDED.dietary,
    base_price = EXCLUDED.base_price,
    customizable = EXCLUDED.customizable,
    description = EXCLUDED.description,
    is_available = EXCLUDED.is_available,
    badge = EXCLUDED.badge,
    image = EXCLUDED.image;
