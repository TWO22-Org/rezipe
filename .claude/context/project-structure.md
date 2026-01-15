---
created: 2026-01-14T11:21:24Z
last_updated: 2026-01-14T11:21:24Z
version: 1.0
author: Claude Code PM System
---

# Project Structure

## Top-Level Layout
- `AGENTS.md`: Beads quick reference
- `README.md`: Project overview, workflow, and commands
- `.agent/`: Agent workflow, skills, and reflection log
- `.beads/`: Beads task database
- `.claude/`: CCPM system (agents, commands, rules, scripts)
- `docs/`: PRDs, ADRs, and context documents
- `src/`: Application code (backend + iOS app)

## Docs Structure
- `docs/prd/`: Product requirements (global + feature PRDs)
- `docs/adr/`: Architecture decision records
- `docs/context/`: Tech stack and coding conventions

## Source Layout
- `src/backend/`: Supabase Edge Functions (TypeScript/Deno)
- `src/frontend/`: iOS app (SwiftUI) placeholder structure

## Operational Files
- `.github/`: GitHub Actions and issue templates
- `.gitignore`: repo ignore rules
- `.gitattributes`: git attributes
