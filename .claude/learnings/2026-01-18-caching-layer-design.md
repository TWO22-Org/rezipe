# Caching Layer Implementation: Meta-Learnings

**Task:** rezipe-7ve - Caching layer + cache key normalization (#16)
**Date:** 2026-01-18
**Status:** Completed (24/24 tests passing)

## High-Level Meta-Learnings

### 1. Testability as First-Class Design Goal
Testability shouldn't be bolted on after implementation. When designing systems, injectable dependencies and callbacks should be part of the initial architecture, not a post-hoc addition. Code that's easy to test is code that's easy to understand and change.

### 2. Explicit Beats Implicit
Versioning, onConflict clauses, error codes, clear function signatures—these small explicit choices prevent silent failures and make systems self-documenting. Future maintainers (including future-me) will understand intent faster.

### 3. Async Boundaries Need Upfront Clarity
When core functions become async (like `normalizeQueryKey`), it propagates throughout the codebase. Signal this clearly in naming, documentation, and types so callers don't accidentally forget to await.

### 4. Versioning Enables Evolution
The `v1:` prefix is cheap insurance. Systems that plan for versioning from day one can change without breaking. This applies to APIs, cache keys, data formats—always think about the next generation.

### 5. Graceful Degradation > Hard Failures
The corrupted cache cleanup pattern shows that systems should heal themselves when possible. Not every error needs to bubble up—sometimes monitoring and self-correction is better than failing loudly.

### 6. Separate Concerns Clearly
Keep validation logic, client creation, error handling, and core operations distinct. This makes each piece easier to reason about and test independently.

### 7. Documentation Through Code Structure
A well-designed module that separates `normalizeQueryKey`, `getCachedResults`, `setCachedResults`, `deleteCachedResult` is more self-documenting than any README. The structure itself communicates intent.

### 8. Tests Must Match Runtime Constraints
Design tests to run under the same permissions and environment as production (or at least the documented `deno test` command). If production uses `Deno.env` or ESM-only modules, tests should use injection or abstractions, not privileged APIs or brittle module stubbing.

**Application:** Instead of trying to stub Deno.env or ESM module namespaces in tests, used injected options (`supabaseUrl`, `supabaseServiceKey`, `createClientFn`) and injectable error callbacks. This keeps tests pure and compatible with restrictive test permissions.

### 9. Cache Correctness is More Important than Cache Hits
Caching is only a win if it preserves correctness. Page-token aware keys (or explicit cache bypass for paginated requests) is a good example: a fast wrong result is worse than a slow correct one.

**Application:** The cache key includes `pageToken`, ensuring each page is cached separately. Without this, pagination would silently return wrong data (page 1 cached as page 2). Also, Zod validation with auto-cleanup of corrupted entries prioritizes correctness over uptime.

### Core Principle
Design for the maintainer (including future-me) first, then optimize. A system that's easy to understand, extend, and test is worth the upfront investment.

## Implementation Patterns Applied

- **Dependency injection** for all external dependencies (Supabase client, error handlers)
- **Versioned cache keys** (`v1:`) for forward compatibility
- **Self-healing cache** (corrupted entries auto-deleted)
- **Explicit conflict resolution** (`onConflict: "query_key"`)
- **Preserved creation timestamps** (omit `created_at` from upserts)
- **Injectable callbacks** instead of module stubbing
- **Fire-and-forget error handling** with Sentry monitoring

## Test Coverage
- 24 test cases, all passing
- Tests run under standard `deno test` permissions
- No environment variable mutations
- No module stubbing required

## Commits
- `0e24541` - Issue #16: Implement caching layer with SHA-256 hashed keys
- `89e8aa3` - docs: mark task 16 as closed
