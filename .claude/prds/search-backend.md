---
name: search-backend
status: draft
created: 2026-01-17T11:08:39Z
updated: 2026-01-17T11:08:39Z
---

# Search Backend

**GitHub Issue**: #13
**Beads Task**: bd-TBD
**Status**: Draft

## Problem Statement
We need a backend search endpoint that returns recipe-biased YouTube results while preserving API quota through caching.

## Goals
- Deliver a GET /search Edge Function with recipe-biased queries.
- Cache results for 24 hours to reduce YouTube API usage.
- Provide consistent error responses for the iOS client.

## Non-Goals
- Frontend UX changes or iOS UI updates.

## Requirements
- REQ-1: Implement YouTube Data API v3 search with query augmentation.
- REQ-2: Cache search results by normalized query + locale for 24 hours.
- REQ-3: Return standard error payloads: { error, code, retryable }.

## Acceptance Criteria
- AC-1: Cache hits return in under 500ms for repeated queries.
- AC-2: Cache misses store results with 24h TTL.
- AC-3: Search results are recipe-biased (category 26, safeSearch strict).

## User Experience
- The iOS client receives recipe-relevant results without exposing query augmentation.

## Technical Considerations
- Supabase Edge Functions (TypeScript/Deno) and Postgres search_cache table.
- Environment secret: YOUTUBE_API_KEY.
- Zod for request/response validation.

## Edge Cases
- Empty or malformed queries should return validation errors.
- Expired cache entries are ignored on read.

## Rollout / Release
- Deploy Edge Function after migration and shared services are in place.

## Metrics
- Cache hit rate and average response time for GET /search.
