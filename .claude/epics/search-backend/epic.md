---
name: search-backend
status: backlog
created: 2026-01-15T21:17:57Z
updated: 2026-01-17T08:23:26Z
progress: 0%
prd: .claude/prds/search-backend.md
github: https://github.com/TWO22-Org/rezipe/issues/13
---

# Epic: search-backend

## Overview
Implement GET /search Supabase Edge Function with recipe-biased YouTube query augmentation and 24-hour result caching to preserve API quota.

## Architecture Decisions
- Supabase Edge Functions (TypeScript/Deno)
- YouTube Data API v3 for search
- Postgres for search_cache table
- Query normalization for consistent cache keys
- Zod for request/response validation
- Standard error response format for client consistency

## Recommended Packages (Backend/Deno)
- **youtube-api-v2** (v1.0.4) - YouTube Data API client with TypeScript support
  - Repo: https://github.com/msp67/youtube-api
  - Why: Recent (Dec 2025), covers Search/Video/Channel APIs, TypeScript native
  - Alternative: Use googleapis package directly for more control
- **zod** (v3.25+) - Schema validation (already planned)
  - For request/response validation and type safety
- **axios** (v1.12+) - HTTP client (if not using youtube-api-v2's built-in)
  - For direct YouTube API calls if needed

## Technical Approach
### Frontend Components
- None (backend only, iOS consumes via SearchService)

### Backend Services
- GET /search Edge Function
  - Params: q, locale, pageToken
  - Query augmentation: append "recipe", "cooking", "ingredients"
  - Category restriction: How-to & Style (id: 26)
  - SafeSearch: strict
  - Uses youtube-api-v2 for API calls
- Search cache lookup/store
- Response transformation to app format
- Error responses: { error, code, retryable }

### Infrastructure
- search_cache Postgres table
- YouTube API key in secrets (YOUTUBE_API_KEY)
- Edge Function deployment with 30s timeout

## Implementation Strategy
- Phase 1: Database schema for search_cache
- Phase 2: YouTube API integration with augmentation using youtube-api-v2
- Phase 3: Caching layer with 24h TTL
- Phase 4: Edge Function deployment + testing

## Task Breakdown Preview
- [ ] search_cache table schema + migration
- [ ] YouTube API integration with recipe bias (youtube-api-v2)
- [ ] Caching layer + cache key normalization
- [ ] GET /search Edge Function deployment

## Dependencies
- Supabase project with Edge Functions enabled
- YouTube Data API v3 quota (10,000 units/day default)
- API key stored in Supabase secrets
- npm packages: youtube-api-v2, zod

## Success Criteria (Technical)
- Search returns recipe-biased results (How-to & Style category)
- Cache hit returns < 500ms
- Cache miss stores results for 24h
- Proper error responses for API failures
- Expired cache entries are ignored on read
- Query augmentation invisible to users

## Estimated Effort
- Resources: 1 backend developer
- Critical path: YouTube API integration

## Tasks Created
- [ ] 14.md - search_cache table schema + migration (parallel: true)
- [ ] 15.md - YouTube API integration with recipe bias (parallel: true)
- [ ] 16.md - Caching layer + cache key normalization (parallel: false)
- [ ] 17.md - GET /search Edge Function deployment (parallel: false)

Total tasks: 4
Parallel tasks: 2
Sequential tasks: 2
Estimated total effort: 13 hours
