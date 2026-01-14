---
name: sentry-monitoring
status: backlog
created: 2026-01-14T12:46:49Z
progress: 0%
prd: .claude/prds/sentry-monitoring.md
github: [Will be updated when synced to GitHub]
---

# Epic: sentry-monitoring

## Overview
Implement Sentry error + performance monitoring for iOS and Supabase Edge Functions, and configure Warp MCP for issue categorization.

## Architecture Decisions
- Two Sentry projects for surface separation: iOS and Edge Functions
- Centralized tagging taxonomy for consistent categorization
- High-privacy defaults (do not send PII)

## Technical Approach
### Frontend Components
- Add Sentry SDK to iOS app
- Initialize Sentry at app startup with performance enabled
- Set tags per screen/flow

### Backend Services
- Add Sentry SDK to Edge Functions (Deno)
- Initialize per function (or shared module)
- Capture exceptions and attach tags

### Infrastructure
- Store DSNs in env vars / secrets
- Configure Warp MCP with Sentry MCP server

## Implementation Strategy
- Phase 1: Sentry org + projects + DSNs
- Phase 2: iOS SDK integration + tags
- Phase 3: Edge Functions SDK integration + tags
- Phase 4: Warp MCP setup + verification

## Task Breakdown Preview
- [ ] Sentry projects + DSNs + privacy defaults
- [ ] iOS SDK integration + tagging
- [ ] Edge Functions SDK integration + tagging
- [ ] Warp MCP setup + verification

## Dependencies
- Sentry org access
- Supabase Edge Functions environment
- iOS app entry point

## Success Criteria (Technical)
- Issues and transactions visible in both Sentry projects
- Tags support MCP filtering by surface/feature/flow
- Privacy defaults verified (no PII)

## Estimated Effort
- Timeline: 2-4 days
- Resources: 1 full-stack
- Critical path: SDK initialization + DSN wiring

## Tasks Created
- [ ] 001.md - Sentry projects + DSNs + privacy defaults (parallel: true)
- [ ] 002.md - iOS Sentry SDK + performance + tags (parallel: false)
- [ ] 003.md - Edge Functions Sentry SDK + performance + tags (parallel: false)
- [ ] 004.md - Warp MCP setup + verification (parallel: true)

Total tasks: 4
Parallel tasks: 2
Sequential tasks: 2
Estimated total effort: 24 hours
