-- Migration: Update search_cache query_key column comment
-- Epic: search-backend (Task #16)
-- Purpose: Document the new SHA-256 hashed key format implemented in cache.ts

COMMENT ON COLUMN public.search_cache.query_key IS
    'SHA-256 hash of "v1:normalized_query|locale|pageToken". See cache.ts normalizeQueryKey().';
