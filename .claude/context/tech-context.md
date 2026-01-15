---
created: 2026-01-14T11:21:24Z
last_updated: 2026-01-14T11:21:24Z
version: 1.0
author: Claude Code PM System
---

# Tech Context

## Platforms
- iOS 17+ app built with SwiftUI
- Backend on Supabase (Postgres + Edge Functions)

## Languages & Runtimes
- Swift 5.9+ for iOS
- TypeScript 5.x on Deno for Edge Functions

## Key Libraries / Services
- Nuke for image caching
- YouTube IFrame Player API (compliant embedded playback)
- Supabase Auth + RLS policies
- LLM tier for recipe extraction (fast/cheap models)

## Tooling
- Beads for task tracking
- GitHub Issues for human-facing work
- SwiftLint + swift-format (iOS)
- ESLint (backend)
- Xcode 15+ for iOS development

## Data Model Highlights
- `videos`, `recipes`, `recipe_sources`, `search_cache`
- Recipe extraction pipeline from description/transcript -> structured JSON

## Notes
- No root-level `package.json` or `pyproject.toml` detected; backend tooling likely under `src/backend/`.
