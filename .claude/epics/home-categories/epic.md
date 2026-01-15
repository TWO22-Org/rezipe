---
name: home-categories
status: backlog
created: 2026-01-14T12:15:31Z
progress: 0%
prd: .claude/prds/home-categories.md
github: [Will be updated when synced to GitHub]
---

# Epic: home-categories

## Overview
Implement curated home categories for MVP discovery, including backend category feed, iOS list UI, and category-based video results.

## Architecture Decisions
- Store curated categories in backend (Supabase table or static config)
- Expose a lightweight Edge Function endpoint for category list
- Reuse existing video list UI for category results
- Cache categories locally for fast repeat load

## Technical Approach
### Frontend Components
- HomeView: category list UI
- CategoryResultsView: grid/list of videos for a selected category
- ViewModel(s) using @Observable and async/await

### Backend Services
- GET /categories: returns curated categories with id, title, description, tags
- GET /search (existing/next): accept category seed terms for results
- Database seed for categories

### Infrastructure
- Supabase Edge Functions for categories
- Optional seed migration for categories
- Basic logging for endpoint usage

## Implementation Strategy
- Phase 1: Define category model and backend endpoint
- Phase 2: iOS Home UI and navigation
- Phase 3: Integrate category tap to video results
- Phase 4: Cache and polish

## Task Breakdown Preview
- [ ] Backend: categories endpoint + seed data
- [ ] iOS: Home categories UI + navigation
- [ ] iOS: Category results list integration
- [ ] Quality: caching + basic tests

## Dependencies
- Supabase project configured for Edge Functions
- YouTube search endpoint or placeholder data for category results
- iOS navigation shell in place

## Success Criteria (Technical)
- Home categories load in <1s on typical network
- Category selection navigates without crashes
- Cached categories render near-instantly on repeat

## Estimated Effort
- Timeline: 3-5 days
- Resources: 1 iOS dev + 1 backend dev (or 1 full-stack)
- Critical path: backend endpoint + iOS integration

## Tasks Created
- [ ] 001.md - Categories endpoint + seed data (parallel: true)
- [ ] 002.md - Home categories UI (parallel: true)
- [ ] 003.md - Category results list integration (parallel: false)
- [ ] 004.md - Category caching + basic tests (parallel: false)

Total tasks: 4
Parallel tasks: 2
Sequential tasks: 2
Estimated total effort: 34 hours
