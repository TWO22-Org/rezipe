# CLAUDE.md (Primary Workflow)

This file defines the primary workflow rules for this repo. Always follow these rules before acting.

## Source of Truth
- CCPM is the source of truth for planning artifacts.
- PRDs live in `.claude/prds/` and epics/tasks live in `.claude/epics/`.
- Beads (bd) mirrors CCPM tasks for execution tracking.
- If rules conflict, prefer the most specific rule file in `.claude/rules/`.
- `.claude/prds/global-prd.md` is the product north star; all work must align to its vision/why/goals.

## Project Overview
ChefStream (Rezipe) is an iOS 17+ app that surfaces recipe-focused YouTube videos and renders a structured, translated recipe card beneath a compliant embedded player. Backend services use Supabase (Postgres + Edge Functions) to cache search results and extracted recipes.

## Tech Stack
- iOS: SwiftUI, Swift 5.9+, async/await, @Observable, Nuke, SwiftData, YouTube IFrame player wrapper
- Backend: Supabase (Postgres, Edge Functions), TypeScript/Deno, Zod
- Testing: XCTest (iOS), Deno.test (backend)

## Build Commands
- iOS: open the Xcode project and build via Xcode (or `xcodebuild` with the correct scheme/workspace)
- Backend: use Supabase CLI for local dev and Edge Functions

## Test Commands
- iOS: run via Xcode or `xcodebuild` with the correct scheme/workspace
- Backend: `cd src/backend && deno test`

## Architecture Overview
- iOS client: SwiftUI MVVM with async state; Home/Search/Detail flows; YouTube player at top with recipe card below
- Backend: Edge Functions for `/search` and `/recipe`, Postgres caching, LLM extraction pipeline with strict JSON schema

## Security Gatekeeper (Absolute Rules)

### NEVER EVER DO
- NEVER publish passwords, API keys, or tokens to git/npm/docker.
- NEVER commit `.env` files to git.
- NEVER hardcode credentials; always use environment variables.
- Before ANY commit, verify no secrets are included.

## New Project Setup (Scaffolding Standards)
When creating ANY new project in this repo, ALWAYS do the following:

### Required Files (Create Immediately)
- `.env` (NEVER commit)
- `.env.example` (template with placeholder values)
- `.gitignore` (must include: `.env`, `.env.*`, `node_modules/`, `dist/`, `.claude/`)
- `.dockerignore` (must include: `.env`, `.git/`, `node_modules/`)
- `README.md` (overview; reference env vars, do not hardcode)

### Required .gitignore Entries
Environment:
`.env`, `.env.*`, `.env.local`

Dependencies:
`node_modules/`, `vendor/`, `__pycache__/`

Build outputs:
`dist/`, `build/`, `.next/`

Claude local files:
`.claude/settings.local.json`, `CLAUDE.local.md`

Generated docs:
`docs/.generated/`

```

### Required CLAUDE.md Sections
Every project CLAUDE.md must include:
- Project overview
- Tech stack
- Build commands
- Test commands
- Architecture overview

## Required Workflow Behaviors
- Use real UTC timestamps from `date -u +"%Y-%m-%dT%H:%M:%SZ"` for frontmatter and logs.
- Use CCPM commands in `.claude/commands/` for PRD/epic/task operations.
- Keep context current: `/context:update` at session end, `/context:prime` at session start.
- Follow `.claude/commands/re-init.md` when updating this file.
- Record learnings in `.claude/learnings/` and update skills in `.claude/skills/`.

 ## Pre-Implementation Checklist (MANDATORY)
  Before implementing ANY task:
  1. Check beads first** - Every implementation task must start with `bd status` + `bd ready`. Run `bd ready` to see available tasks
  2. Find task ID for your work
  3. Update status: `bd update <task-id> --status in_progress`
  4. Create a todo list with task ID: `TodoWrite` with content starting with "[{task-id}]"
  5. Only then begin implementation

Example:
  - Task: Task 004 (rezipe-004)
  - Command: `bd update rezipe-004 --status in_progress`
  - Todo: `[rezipe-004] Implement placeholder views + theming`

## Epic Completion Checklist (MANDATORY)

When ALL tasks in an epic are implemented, complete the epic in this order:

### Step 1: Update Task Files
For each task in `.claude/epics/<epic-name>/`:
1. Get current timestamp: `date -u +"%Y-%m-%dT%H:%M:%SZ"`
2. Update frontmatter:
   - `status: completed`
   - `updated: <timestamp>`
   - `github: <issue-number>` (if synced)
3. Check ALL acceptance criteria boxes `[x]`

### Step 2: Update Epic File
In `.claude/epics/<epic-name>/epic.md`:
1. Update frontmatter:
   - `status: completed`
   - `updated: <timestamp>`
   - `progress: 100%`
   - `github: <issue-number>` (if synced)
2. Check all task boxes `[x]` in "Task Breakdown Preview"
3. Check all task boxes `[x]` in "Tasks Created"

### Step 3: Update Beads
For each task:
```bash
bd update <task-id> --status closed
```
Verify all tasks closed:
```bash
bd list --all | grep <epic-task-ids>
```

### Step 4: Close GitHub Issues
For each task issue:
```bash
gh issue close <issue-number> --comment "✅ Completed in commit <hash>. <summary>"
```
Close epic issue:
```bash
gh issue close <epic-number> --comment "✅ Epic completed. All tasks (#X, #Y, #Z) closed. <summary>"
```

### Step 5: Commit Everything Together
```bash
# Stage epic files and beads database
git add .claude/epics/<epic-name>/ .beads/issues.jsonl

# Commit with epic summary
git commit -m "docs: complete epic <name> - all tasks closed

Updated epic and task files:
- All tasks: status=completed, acceptance criteria checked
- Epic: status=completed, progress=100%
- Beads: all tasks closed
- GitHub: epic #X and tasks #A,#B,#C closed

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

### Step 6: Final Verification
Run these checks before considering epic complete:
```bash
# All task statuses should be "completed"
grep "status:" .claude/epics/<epic-name>/*.md

# All acceptance criteria should be [x]
grep "\[ \]" .claude/epics/<epic-name>/*.md  # Should return nothing

# All beads tasks should show ✓
bd list --all | grep <epic-tasks>

# All GitHub issues should be CLOSED
gh issue list --state closed | grep <epic-tasks>
```

**IMPORTANT**: Do NOT consider an epic complete until all 6 steps are done and committed.

## PR Creation and Merge Checklist (MANDATORY)

After epic completion, create PR and merge to main:

### Step 1: Push Branch to GitHub
```bash
# Ensure all commits are pushed
git push origin <branch-name>
```

### Step 2: Create Pull Request
```bash
# Create PR with detailed description
gh pr create --title "Epic: <name> - <summary>" \
  --body-file /tmp/pr-description.md \
  --base main \
  --head <branch-name>
```

**PR Description Template:**
```markdown
## Summary
Complete Epic: <name> (#<epic-issue>) - <one-line summary>

## Tasks Completed
- ✅ #X: Task 001 description
- ✅ #Y: Task 002 description
...

## Deliverables
- Feature/component descriptions
- Technical changes summary

## Test Plan
- [x] Build succeeds
- [x] Tests pass
- [x] Manual verification items

🤖 Generated with Claude Code
```

### Step 3: Merge Pull Request
```bash
# Merge with squash (keeps main history clean)
gh pr merge <pr-number> --squash --delete-branch
```

**If --delete-branch fails**, merge may succeed but branch cleanup may not. Continue to Step 4.

### Step 4: Post-Merge Branch Cleanup (ALWAYS RUN)

**Even if `--delete-branch` was used, ALWAYS verify cleanup:**

```bash
# 1. Switch to main
git checkout main

# 2. Pull latest
git pull origin main

# 3. Verify merge commit
git log --oneline -3

# 4. Delete remote branch (if still exists)
git push origin --delete <branch-name> 2>/dev/null || echo "Remote branch already deleted"

# 5. Delete local branch (if still exists)
git branch -d <branch-name> 2>/dev/null || echo "Local branch already deleted"

# 6. Prune stale remote references
git fetch --prune

# 7. Verify clean state
git branch -a  # Should NOT show the feature branch
```

### Step 5: Final Verification
```bash
# Verify build on main
<build-command>  # e.g., xcodebuild, npm run build, etc.

# Verify branch is gone
git branch -a | grep <branch-name>  # Should return nothing
```

### Common Issues and Fixes

**Issue**: `gh pr merge --delete-branch` doesn't delete the remote branch
- **Cause**: GitHub API timing, branch protection, or multiple PRs
- **Fix**: Manually run `git push origin --delete <branch-name>`

**Issue**: Local branch still exists after merge
- **Cause**: Git doesn't auto-delete local branches
- **Fix**: Run `git branch -d <branch-name>`

**Issue**: `git fetch` still shows deleted branch
- **Cause**: Stale remote-tracking references
- **Fix**: Run `git fetch --prune`

### Why This Matters

- **Clean repository**: No stale branches cluttering `git branch -a`
- **Clear history**: Easy to see what branches are active
- **No confusion**: No accidental commits to merged branches
- **CI/CD hygiene**: Automated builds don't reference old branches

**IMPORTANT**: Do NOT skip Step 4 post-merge cleanup, even if you used `--delete-branch`.

## CCPM + Beads Flow (Canonical)
1) Create PRD in `.claude/prds/` using `/pm:prd-new <feature-name>`.
2) Convert PRD to epic/tasks using `/pm:prd-parse <feature-name>` (or `/pm:epic-oneshot`).
3) Sync/track GitHub issues via CCPM commands.
4) Mirror CCPM tasks in beads for execution: `bd ready` → `bd update ... --status in_progress`.
5) Create a feature branch from `main` before implementation.

## Testing
- Use `.claude/scripts/test-and-log.sh` when running tests if it applies to the project.
- Follow TDD: tests first, then implementation.

## Paths and Git Hygiene
- Follow `.claude/rules/path-standards.md` (avoid absolute paths; use repo-relative paths).
- Follow worktree and branch rules in `.claude/rules/worktree-operations.md` and `.claude/rules/branch-operations.md`.

## GitHub / Issues
- Use `gh` CLI with repo auto-detected in `.claude/ccpm.config` when creating/updating issues.

## Stack Context (Do Not Drift)
- iOS app: SwiftUI (iOS 17+), Swift 5.9+, @Observable, async/await.
- Backend: Supabase (Postgres + Edge Functions), TypeScript on Deno.
