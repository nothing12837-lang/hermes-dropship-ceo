-- 20261014_cloud_autonomous_tables.sql
-- Enables RareEmber Autonomous Cloud Business Architecture

-- 1. Agent Persistent Memory (Hermes CEO + 6-Agent Team)
CREATE TABLE IF NOT EXISTS agent_memory (
    id SERIAL PRIMARY KEY,
    agent_name VARCHAR(50) NOT NULL,
    memory_type VARCHAR(50) NOT NULL,
    key VARCHAR(255) NOT NULL,
    content JSONB NOT NULL DEFAULT '{}'::jsonb,
    confidence NUMERIC(4,3) DEFAULT 1.000,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(agent_name, memory_type, key)
);
CREATE INDEX IF NOT EXISTS idx_agent_memory_lookup ON agent_memory(agent_name, memory_type);

-- 2. Store Business Goals & Real-Time Performance
CREATE TABLE IF NOT EXISTS store_goals (
    id SERIAL PRIMARY KEY,
    period VARCHAR(50) NOT NULL UNIQUE,
    target_gmv_inr NUMERIC(12,2) DEFAULT 10000.00,
    current_gmv_inr NUMERIC(12,2) DEFAULT 0.00,
    target_conversion_pct NUMERIC(5,2) DEFAULT 2.50,
    current_conversion_pct NUMERIC(5,2) DEFAULT 0.00,
    target_aov_inr NUMERIC(10,2) DEFAULT 1850.00,
    current_aov_inr NUMERIC(10,2) DEFAULT 0.00,
    target_rto_pct NUMERIC(5,2) DEFAULT 12.00,
    current_rto_pct NUMERIC(5,2) DEFAULT 0.00,
    progress_pct NUMERIC(5,2) DEFAULT 0.00,
    notes JSONB DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Dynamic AI SEO Blog Posts (Aarav's Content Engine)
CREATE TABLE IF NOT EXISTS blog_posts (
    id SERIAL PRIMARY KEY,
    slug VARCHAR(255) NOT NULL UNIQUE,
    title VARCHAR(500) NOT NULL,
    excerpt TEXT,
    content TEXT NOT NULL,
    category VARCHAR(100) DEFAULT 'Lifestyle',
    cover_image TEXT,
    author VARCHAR(100) DEFAULT 'Aarav - RareEmber Editorial',
    published BOOLEAN DEFAULT true,
    views INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_blog_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_published ON blog_posts(published, created_at DESC);

-- 4. Scouted Winning Products Queue (Arjun + Kabir + CEO Pipeline)
CREATE TABLE IF NOT EXISTS scouted_products (
    id VARCHAR(255) PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    category VARCHAR(100) DEFAULT 'home-living',
    meesho_url TEXT NOT NULL,
    meesho_cost_inr NUMERIC(10,2) NOT NULL,
    target_price_inr NUMERIC(10,2) NOT NULL,
    mrp_inr NUMERIC(10,2) NOT NULL,
    projected_profit_inr NUMERIC(10,2) NOT NULL,
    margin_pct NUMERIC(5,2) NOT NULL,
    rating NUMERIC(3,2) DEFAULT 4.80,
    reviews_count INTEGER DEFAULT 1500,
    image_url TEXT,
    features JSONB DEFAULT '[]'::jsonb,
    status VARCHAR(50) DEFAULT 'pending_approval',
    scouted_by VARCHAR(50) DEFAULT 'Arjun',
    reviewed_by VARCHAR(50) DEFAULT 'Kabir',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_scouted_status ON scouted_products(status);

-- 5. Per-Order Unit Economics & P&L (Kabir's Ledger)
CREATE TABLE IF NOT EXISTS orders_pnl (
    order_id VARCHAR(255) PRIMARY KEY,
    revenue_inr NUMERIC(10,2) NOT NULL,
    meesho_cogs_inr NUMERIC(10,2) DEFAULT 0.00,
    shipping_cost_inr NUMERIC(10,2) DEFAULT 79.00,
    rto_reserve_inr NUMERIC(10,2) DEFAULT 50.00,
    gateway_fee_inr NUMERIC(10,2) DEFAULT 0.00,
    net_profit_inr NUMERIC(10,2) NOT NULL,
    margin_pct NUMERIC(5,2) NOT NULL,
    is_cod BOOLEAN DEFAULT false,
    settled BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Pincode & Customer RTO Risk Scoring (Pooja's Delivery Guard)
CREATE TABLE IF NOT EXISTS rto_risk_scores (
    phone VARCHAR(50) PRIMARY KEY,
    pincode VARCHAR(20),
    risk_score INTEGER DEFAULT 20,
    order_count INTEGER DEFAULT 1,
    delivered_count INTEGER DEFAULT 0,
    rto_count INTEGER DEFAULT 0,
    recommendation VARCHAR(50) DEFAULT 'ALLOW_COD',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Add Missing Columns to Orders Table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='cod_confirmed') THEN
        ALTER TABLE orders ADD COLUMN cod_confirmed BOOLEAN DEFAULT false;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='whatsapp_confirmed_at') THEN
        ALTER TABLE orders ADD COLUMN whatsapp_confirmed_at TIMESTAMPTZ;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='rto_risk_level') THEN
        ALTER TABLE orders ADD COLUMN rto_risk_level VARCHAR(50) DEFAULT 'low';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='meesho_order_id') THEN
        ALTER TABLE orders ADD COLUMN meesho_order_id VARCHAR(100);
    END IF;
END $$;
