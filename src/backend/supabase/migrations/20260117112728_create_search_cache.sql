-- Migration: Create search_cache table for YouTube API result caching
-- Epic: search-backend (Task #14)
-- Ticket: https://github.com/TWO22-Org/rezipe/issues/14

-- =============================================================================
-- TABLE: search_cache
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.search_cache (
    query_key    TEXT PRIMARY KEY,
    results_json JSONB NOT NULL,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at   TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '24 hours'),

    CONSTRAINT expires_after_created CHECK (expires_at > created_at)
);

-- =============================================================================
-- INDEXES
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_search_cache_expires_at
ON public.search_cache(expires_at);

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

-- Enable RLS (Edge Functions use service_role which bypasses RLS)
-- Note: No anon/authenticated policies = client access blocked (expected)
ALTER TABLE public.search_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access"
ON public.search_cache
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- =============================================================================
-- DOCUMENTATION
-- =============================================================================

COMMENT ON TABLE public.search_cache IS
    'Cache for YouTube search results. TTL: 24 hours. Accessed via Edge Functions only.';
COMMENT ON COLUMN public.search_cache.query_key IS
    'Normalized query + locale (format: "query|locale")';
COMMENT ON COLUMN public.search_cache.results_json IS
    'YouTube API response: [{video_id, title, channel_title, thumbnail_url}, ...]';
COMMENT ON COLUMN public.search_cache.expires_at IS
    'Cache expiration. Default: created_at + 24 hours.';
