-- 20261022_ai_agent_analytics.sql
-- RareEmber AI Store Manager (Hermes Ops Agent)
-- Adds: passive visitor analytics, security event log, agent report log.
-- Idempotent. Runtime access is service-role ONLY (RLS enabled, no policies)
-- except analytics_events which allows ANON INSERT ONLY (pageview beacons of
-- a storefront with no auth) -- no SELECT/UPDATE/DELETE for any non-service role.

CREATE TABLE IF NOT EXISTS public.analytics_events (
    id BIGSERIAL PRIMARY KEY,
    ts TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    type VARCHAR(40) NOT NULL,
    session_id VARCHAR(64),
    path VARCHAR(300),
    referrer VARCHAR(700),
    product_id VARCHAR(200),
    meta JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_ae_ts ON public.analytics_events (ts DESC);
CREATE INDEX IF NOT EXISTS idx_ae_type_ts ON public.analytics_events (type, ts DESC);
CREATE INDEX IF NOT EXISTS idx_ae_session ON public.analytics_events (session_id);

ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon insert events only" ON public.analytics_events;
CREATE POLICY "anon insert events only" ON public.analytics_events FOR INSERT TO anon WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.security_events (
    id BIGSERIAL PRIMARY KEY,
    ts TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    kind VARCHAR(60) NOT NULL,
    ip_hash VARCHAR(64),
    detail JSONB DEFAULT '{}'::jsonb
);
CREATE INDEX IF NOT EXISTS idx_se_ts ON public.security_events (ts DESC);

ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.agent_reports (
    id BIGSERIAL PRIMARY KEY,
    ts TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    kind VARCHAR(20) NOT NULL,
    summary TEXT NOT NULL,
    body JSONB DEFAULT '{}'::jsonb
);
CREATE INDEX IF NOT EXISTS idx_ar_ts ON public.agent_reports (ts DESC);
CREATE INDEX IF NOT EXISTS idx_ar_kind ON public.agent_reports (kind, ts DESC);

ALTER TABLE public.agent_reports ENABLE ROW LEVEL SECURITY;