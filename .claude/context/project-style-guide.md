---
created: 2026-01-14T11:21:24Z
last_updated: 2026-01-14T11:21:24Z
version: 1.0
author: Claude Code PM System
---

# Project Style Guide

## General
- Clarity over cleverness
- Follow existing patterns and conventions
- TDD: tests before implementation
- Record architectural decisions in ADRs

## Swift / SwiftUI
- PascalCase for types, camelCase for variables and functions
- Prefer `@Observable` for iOS 17+ view models
- Use async/await for new code
- Organize files with `// MARK:` sections

## Backend (Supabase)
- TypeScript on Deno Edge Functions
- Validate inputs (Zod or similar)
- Return strict, versioned JSON schemas

## Error Handling
- Prefer typed errors with user-friendly messages
- Fail gracefully and report clear error states
