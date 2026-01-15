---
name: sentry-monitoring
description: Add Sentry error + performance monitoring with Warp MCP access
status: backlog
created: 2026-01-14T12:46:33Z
---

# PRD: sentry-monitoring

## Executive Summary
Integrate Sentry across the iOS app and Supabase Edge Functions to capture errors and performance traces, and connect Sentry MCP in Warp to categorize and investigate issues quickly.

## Problem Statement
We currently lack centralized error tracking and performance visibility. This makes debugging slow and prevents proactive detection of regressions. We need Sentry for both app surfaces and MCP access for fast categorization.

## User Stories
1) As a developer, I want app crashes and errors captured with context so I can fix issues quickly.
   - Acceptance Criteria:
     - [ ] iOS errors appear in Sentry (rezipe-ios)
     - [ ] Edge Function errors appear in Sentry (rezipe-edge)
2) As a developer, I want performance traces to identify slow screens or endpoints.
   - Acceptance Criteria:
     - [ ] iOS performance transactions appear
     - [ ] Edge Function transactions appear
3) As a developer, I want to use Warp MCP to query and categorize Sentry issues.
   - Acceptance Criteria:
     - [ ] Sentry MCP server is configured in Warp
     - [ ] MCP can list projects and search issues

## Requirements

### Functional Requirements
- Create two Sentry projects: `rezipe-ios` and `rezipe-edge`
- Integrate Sentry SDK into iOS app with error + performance capture
- Integrate Sentry SDK into Supabase Edge Functions with error + performance capture
- Configure Warp MCP to connect to Sentry MCP server
- Apply consistent tagging taxonomy for categorization (surface, feature, flow, environment, release)

### Non-Functional Requirements
- High privacy: do not send PII by default
- Minimal performance overhead in local/dev
- Configuration managed via environment variables/secrets

## Success Criteria
- Errors and performance traces visible in Sentry for both projects
- MCP queries in Warp can filter by surface/feature/flow
- Privacy settings prevent PII capture by default

## Constraints & Assumptions
- Current environment is local + git only (no official production)
- Use Sentry default sampling unless overridden for local verification
- Use high-privacy settings (e.g., sendDefaultPii=false)

## Out of Scope
- Advanced alerting rules or SLOs
- Full release health automation
- User-facing error reporting UI

## Dependencies
- Sentry org access: #next-click-media (stefano.manese@gmail.com)
- Warp MCP settings access
- Supabase Edge Functions codebase
- iOS SwiftUI app codebase

## Open Questions
- Should we add a staging environment later?
- Which feature tags should be enforced first (home/search/recipe/auth)?
