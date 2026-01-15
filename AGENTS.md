# Rezipe Agent Instructions

**Version**: 1.1  
**Project**: rezipe  
**Last Updated**: 2026-01-14

## Purpose

Single source of truth for agent workflow, standards, and execution. All agents must follow this document.

This repo uses **CCPM** as the primary workflow system and **bd** (beads) for execution tracking. CCPM is the source of truth for PRDs/epics/tasks; beads mirrors work items for execution.

---

## Source of Truth

- **Primary rules file**: `CLAUDE.md`
- **PRDs**: `.claude/prds/` (CCPM)
- **Epics/Tasks**: `.claude/epics/` (CCPM)
- **Skills**: `.claude/skills/`
- **Learnings**: `.claude/learnings/`
- **Learnings log**: `.claude/learnings/reflection-log.md`
- **Product north star**: `.claude/prds/global-prd.md` (vision/why/goals must guide all work)

---

## Core Principles

### 1) Test-Driven Development (TDD)
**Always follow this order:**
1. Read PRD + acceptance criteria
2. Write failing tests first
3. Implement minimal code to pass tests
4. Refactor while keeping tests green
5. Validate with full test suite

### 2) CCPM-First + Beads for Execution
- Create PRDs in `.claude/prds/` and generate epics/tasks in `.claude/epics/`
- Mirror CCPM tasks into beads for execution tracking
- Update beads status as you start/finish work

### 3) Context-Aware Development
Before starting any task, read:
1. PRD from `.claude/prds/`
2. ADRs from `docs/adr/`
3. Conventions from `docs/context/conventions.md`
4. Skills from `.claude/skills/`
5. Past mistakes from `.claude/learnings/reflection-log.md`
6. Recent learnings from `.claude/learnings/`

### 4) Self-Annealing
After completing any task:
1. Add a note in `.claude/learnings/`
2. Update `.claude/learnings/reflection-log.md` if mistakes were made
3. Update skills in `.claude/skills/` if new patterns emerge
4. Use `/reflect` to formalize improvements

---

## Canonical Workflow

### Repo Setup (Once)
```bash
# CCPM setup
/pm:init
/context:create

# Beads setup
bd init
```

### A) CCPM Planning & Issue Flow
```bash
# Create PRD (source of truth)
/pm:prd-new <feature-name>

# Parse PRD into epic/tasks
/pm:prd-parse <feature-name>

# Create/sync GitHub issues
/pm:epic-oneshot <feature-name>
# or: /pm:issue-sync <issue-id>

# Mirror CCPM tasks into beads
bd ready
bd update bd-[task-id] --status in-progress
```

### B) Branching & PR (Required)
```bash
# Branch from main after CCPM planning
git checkout main
git pull --rebase
git switch -c feat/<feature-name>

# Keep commits small and scoped to a beads task
git commit -m "feat: <summary> (bd-[task-id], #[issue-id])"

# Push and open PR
git push -u origin feat/<feature-name>
gh pr create --title "feat: <feature> (closes #[issue-id])" --body "PRD: .claude/prds/<feature>.md"
```

Branch naming:
- `feat/<feature-name>` for features
- `fix/<short-description>` for bug fixes
- `chore/<short-description>` for maintenance

PR rules:
- Title: `feat: <feature> (closes #[issue])`
- Body must include: PRD path and beads IDs
- Keep PRs small and scoped to one PRD/epic when possible
- Ensure all tests pass before requesting review

### C) Test Guidance (iOS + Supabase)
- **iOS**: Use Xcode or `xcodebuild` with the correct scheme/workspace.
- **Backend**: Use `deno test` from `src/backend/`.
- Use `.claude/scripts/test-and-log.sh` when it fits the project.

---

## File Structure Standards

### Backend (Supabase Edge Functions)
```
src/backend/
├── functions/            # Edge Functions (TypeScript/Deno)
├── tests/                # Deno tests
└── supabase/             # Supabase config/migrations
```

### iOS App (SwiftUI)
```
src/frontend/
├── App/                  # App entry, scenes
├── Features/             # Feature modules
├── Components/           # Reusable UI components
├── Services/             # API clients, data access
├── Models/               # Domain models
└── Tests/                # XCTest and snapshot tests
```

---

## Commit Message Standards

Conventional Commits:
```
<type>(<scope>): <description> (bd-[task-id], #[issue-id])
```
Types: `feat`, `fix`, `test`, `refactor`, `docs`, `chore`

---

## Quality Gates (Before Closing Tasks)
- Tests pass (iOS via Xcode/xcodebuild, backend via `deno test`)
- Linting passes (if configured)
- Code follows conventions
- Beads status updated
- Learnings recorded (if needed)

---

## Landing the Plane (Session Completion)

When ending a work session, complete **all** steps:
1. File issues for remaining work
2. Run quality gates
3. Update issue status
4. **Push to remote**:
   ```bash
   git pull --rebase
   bd sync
   git push
   git status  # must show "up to date with origin"
   ```
5. Clean up (clear stashes, prune branches)
6. Verify changes committed and pushed
7. Hand off context for next session

**Critical rule:** work is not complete until `git push` succeeds.

<!-- bv-agent-instructions-v1 -->

---

## Beads Workflow Integration

This project uses [beads_viewer](https://github.com/Dicklesworthstone/beads_viewer) for issue tracking. Issues are stored in `.beads/` and tracked in git.

### Essential Commands

```bash
# View issues (launches TUI - avoid in automated sessions)
bv

# CLI commands for agents (use these instead)
bd ready              # Show issues ready to work (no blockers)
bd list --status=open # All open issues
bd show <id>          # Full issue details with dependencies
bd create --title="..." --type=task --priority=2
bd update <id> --status=in_progress
bd close <id> --reason="Completed"
bd close <id1> <id2>  # Close multiple issues at once
bd sync               # Commit and push changes
```

### Workflow Pattern

1. **Start**: Run `bd ready` to find actionable work
2. **Claim**: Use `bd update <id> --status=in_progress`
3. **Work**: Implement the task
4. **Complete**: Use `bd close <id>`
5. **Sync**: Always run `bd sync` at session end

### Key Concepts

- **Dependencies**: Issues can block other issues. `bd ready` shows only unblocked work.
- **Priority**: P0=critical, P1=high, P2=medium, P3=low, P4=backlog (use numbers, not words)
- **Types**: task, bug, feature, epic, question, docs
- **Blocking**: `bd dep add <issue> <depends-on>` to add dependencies

### Session Protocol

**Before ending any session, run this checklist:**

```bash
git status              # Check what changed
git add <files>         # Stage code changes
bd sync                 # Commit beads changes
git commit -m "..."     # Commit code
bd sync                 # Commit any new beads changes
git push                # Push to remote
```

### Best Practices

- Check `bd ready` at session start to find available work
- Update status as you work (in_progress → closed)
- Create new issues with `bd create` when you discover tasks
- Use descriptive titles and set appropriate priority/type
- Always `bd sync` before ending session

<!-- end-bv-agent-instructions -->
