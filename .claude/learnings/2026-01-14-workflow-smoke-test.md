# Learnings - 2026-01-14 workflow smoke test

- Beads daemon can be slow to start; use `bd list --no-daemon` or `bd ready --no-daemon` to avoid timeouts during verification.
- Beads status uses `in_progress` (underscore), not `in-progress` (hyphen).
- `bd update` does not accept `--blocks`; record dependencies in `--notes` (or use parent/labels if needed).
- Git operations in this repo may require elevated permissions to write `.git` locks/refs; be ready to re-run with escalation.
