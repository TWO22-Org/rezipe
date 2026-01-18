# Epic Closure Checklist Guardrails

**Date:** 2026-01-18
**Context:** Epic completion for search-backend (#13)

## Learnings

### 1) Epic status wins over generic task status rules
When closing an epic, use the epic checklist as the source of truth. Tasks in `.claude/epics/<epic>/` must be set to `status: completed` with updated timestamps, even though the general frontmatter rule lists task statuses as `open/in-progress/closed`. Follow the epic completion checklist to avoid inconsistency.

### 2) Always scan for unchecked boxes before the final epic commit
Run `grep "\[ \]" .claude/epics/<epic>/*.md` right before the epic completion commit. Dependency checkboxes are easy to miss and will fail the final verification if left unchecked.
