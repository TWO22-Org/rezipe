# Reflection Log

Use this file to record mistakes, root causes, and prevention steps.

## Template

```
## YYYY-MM-DD - [Task/Feature] (bd-[task-id], #[issue-id])

**What went wrong:**

**Root cause:**

**Prevention:**

**Pattern added to skills:** [Yes/No]
[If yes, reference skill path: .claude/skills/<name>/SKILL.md]

**Commits affected:**
- <hash>: <message>
```

## 2026-01-16 - Epic Sync Hygiene (bd-n/a, #41)

**What went wrong:**
Ran epic sync with a dirty worktree and non-updated main, requiring a cleanup branch afterward.

**Root cause:**
Skipped the clean + up-to-date main precondition before /pm:epic-sync.

**Prevention:**
Always ensure main is pulled/rebased and worktree is clean before syncing epics; if not clean, commit changes to a temporary branch and rebase.

**Pattern added to skills:** No

**Commits affected:**
- 4e617fb: chore: capture local changes before sync
