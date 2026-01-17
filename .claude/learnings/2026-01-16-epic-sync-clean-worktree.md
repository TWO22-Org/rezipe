---
created: 2026-01-16T18:37:06Z
scope: workflow
---

# Epic sync requires a clean, up-to-date main

- Before running `/pm:epic-sync`, ensure `main` is up to date with origin and the worktree is clean.
- If local changes exist, commit them on a temporary branch and rebase onto `main` before syncing.
- Confirm GitHub labels exist or create them idempotently (e.g., `epic:<name>`, `task`) to avoid sync failures.
