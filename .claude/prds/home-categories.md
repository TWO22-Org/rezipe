---
name: home-categories
description: Curated home categories feed for recipe discovery in the iOS app
status: backlog
created: 2026-01-14T12:15:14Z
---

# PRD: home-categories

## Executive Summary
Build the MVP home screen with curated recipe categories that link to a list of YouTube cooking videos. This provides a fast, compliant discovery path without requiring search.

## Problem Statement
Users need a quick way to discover trustworthy recipe videos without typing queries or wading through non-recipe content. A curated home feed reduces friction and preserves YouTube quota.

## User Stories
1) As a busy home cook, I want to browse curated categories so I can pick a recipe quickly.
   - Acceptance Criteria:
     - [ ] Home shows a list of categories on first launch
     - [ ] Tapping a category opens a results list
2) As a fitness-focused eater, I want categories like “High Protein” so I can find aligned recipes.
   - Acceptance Criteria:
     - [ ] Category list includes at least 5 MVP categories
3) As a guest user, I want to browse categories without logging in.
   - Acceptance Criteria:
     - [ ] Home loads without auth

## Requirements

### Functional Requirements
- Home screen renders a curated list of categories (title + short description)
- Categories are fetched from backend (seeded list)
- Tapping a category fetches and displays a list of video results for that category
- Results list shows thumbnail, title, and channel name

### Non-Functional Requirements
- Home should render within acceptable iOS cold-start norms
- Category list should load quickly and cache locally for repeat visits
- No YouTube player on the home screen

## Success Criteria
- Median home screen render time under 300ms after app launch
- Category list fetch under 1s on a typical network
- 90% of sessions see at least one category tap (instrumentation-ready)

## Constraints & Assumptions
- Categories are curated and stored in backend (no user-generated categories for MVP)
- English-only category labels for MVP
- Guest mode only (no login gating)

## Out of Scope
- Personalized category ordering
- User-created categories
- Advanced filtering or dietary preference filters

## Dependencies
- Backend endpoint to return curated categories
- Video list endpoint that can accept category tag/seed
- iOS navigation structure to push a results list

## Open Questions
- What is the authoritative source of curated categories (hardcoded table vs. CMS later)?
- Should categories include a thumbnail image or icon?

