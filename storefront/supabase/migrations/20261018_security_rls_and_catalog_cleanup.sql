-- 20261018_security_rls_and_catalog_cleanup.sql
-- RareEmber: Product catalog clean URLs, B2B wholesale copy removal, and database security RLS locks

-- ==============================================================================
-- 1. CATALOG URL SLUGS CLEANUP
-- Strip 'qikink-' prefix and trailing wholesale SKU codes (e.g., -ut58, -fc38)
-- from product slugs, converting them into clean retail URLs (/product/rare-ember-...)
-- ==============================================================================
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'products') THEN
        UPDATE products
        SET slug = regexp_replace(
            regexp_replace(slug, '^qikink-(t-shirts-|tops-|hoodies-|accessories-)?', 'rare-ember-'),
            '-[a-z]{1,3}[0-9]{1,4}$',
            ''
        )
        WHERE slug LIKE '%qikink%';
    END IF;
END $$;

-- ==============================================================================
-- 2. WHOLESALE COPY REPLACEMENT
-- Find and rewrite supplier B2B wholesale pitch text in product descriptions into retail copy
-- ==============================================================================
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'products') THEN
        UPDATE products
        SET description = regexp_replace(
            description,
            '^Sell .* with (Qikink|Rare Ember Studio)''s print-on-demand model\.',
            'Crafted in small batches at our Tirupur studio for everyday comfort and durability.',
            'i'
        )
        WHERE description ILIKE '%print-on-demand model%' OR description ILIKE '%Sell %';
    END IF;
END $$;

-- ==============================================================================
-- 3. HIDE NON-STREETWEAR / NON-TECH-DESK BLOG POSTS
-- Unpublish old home-decor/mandir/diya/festive lighting articles from the journal
-- ==============================================================================
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'blog_posts') THEN
        UPDATE blog_posts
        SET published = false
        WHERE title ILIKE '%mandir%'
           OR title ILIKE '%diya%'
           OR title ILIKE '%lighting ideas%'
           OR title ILIKE '%home decor%'
           OR slug ILIKE '%mandir%'
           OR slug ILIKE '%diya%';
    END IF;
END $$;

-- ==============================================================================
-- 4. ROW LEVEL SECURITY (RLS) LOCKDOWN
-- Ensure all sensitive tables have RLS enabled so anon/public cannot read or write
-- confidential business data, financial records, agent memory, or customer orders directly.
-- Server-side Next.js routes using service_role key bypass RLS automatically.
-- ==============================================================================

-- 4a. Orders Table
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'orders') THEN
        ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
        -- Block all direct public/anon access. Server routes handle order creation & tracking via service_role
        DROP POLICY IF EXISTS "orders_public_insert" ON orders;
        DROP POLICY IF EXISTS "orders_public_read" ON orders;
        DROP POLICY IF EXISTS "orders_public_update" ON orders;
        DROP POLICY IF EXISTS "orders_public_delete" ON orders;
    END IF;
END $$;

-- 4b. Per-Order Unit Economics & P&L (Kabir's Ledger)
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'orders_pnl') THEN
        ALTER TABLE orders_pnl ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "orders_pnl_public_all" ON orders_pnl;
    END IF;
END $$;

-- 4c. Agent Memory (Hermes CEO + 6-Agent Team)
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'agent_memory') THEN
        ALTER TABLE agent_memory ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "agent_memory_public_all" ON agent_memory;
    END IF;
END $$;

-- 4d. Store Goals & Financial Performance
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'store_goals') THEN
        ALTER TABLE store_goals ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "store_goals_public_all" ON store_goals;
    END IF;
END $$;

-- 4e. Scouted Winning Products Queue
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'scouted_products') THEN
        ALTER TABLE scouted_products ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "scouted_products_public_all" ON scouted_products;
    END IF;
END $$;

-- 4f. Customer RTO Risk Scoring (Pooja's Delivery Guard)
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'rto_risk_scores') THEN
        ALTER TABLE rto_risk_scores ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "rto_risk_scores_public_all" ON rto_risk_scores;
    END IF;
END $$;

-- 4g. Public Read-Only Access for Published Products & Published Blog Posts
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'products') THEN
        ALTER TABLE products ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "public read products" ON products;
        CREATE POLICY "public read products" ON products FOR SELECT USING (true);
    END IF;

    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'blog_posts') THEN
        ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "public read published blog_posts" ON blog_posts;
        CREATE POLICY "public read published blog_posts" ON blog_posts FOR SELECT USING (published = true);
    END IF;
END $$;
