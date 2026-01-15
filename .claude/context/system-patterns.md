---
created: 2026-01-14T11:21:24Z
last_updated: 2026-01-14T11:21:24Z
version: 1.0
author: Claude Code PM System
---

# System Patterns

## Process Patterns
- Spec-driven development: PRDs in `docs/prd/`, ADRs in `docs/adr/`
- TDD workflow is expected (tests first)
- Beads tasks coordinate work for agents

## Architecture Patterns
- Mobile client + serverless backend split
- Edge Function API layer in Supabase
- Structured recipe extraction pipeline with versioned JSON output

## Compliance & UX Rules
- YouTube embedded playback only (no overlays)
- Fast, skeleton-first UX while data loads
- English translation default for MVP

## Operational Patterns
- Context docs in `docs/context/` define tech stack and conventions
- `.claude/` provides command-driven workflows and scripts
