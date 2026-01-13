# Rezipe Agent Instructions

**Version**: 1.0  
**Project**: rezipe  
**Last Updated**: 2026-01-13

## Purpose

This document defines the canonical workflow, standards, and practices for all AI agents working on the rezipe project. All agents MUST follow these instructions to ensure consistent, production-ready code delivery.

**Note:** This project uses **bd** (beads) for task tracking. See [root AGENTS.md](../AGENTS.md) for beads quick reference and "landing the plane" workflow.

---

## Agent Roles

### 1. Main Implementation Agent
**Responsibilities:**
- Implement features following TDD methodology
- Execute beads tasks in dependency order
- Validate code compiles and passes tests
- Update documentation and reflection logs
- Coordinate with other agents via beads tasks

### 2. Code Review Agent (Codex)
**Responsibilities:**
- Review PRs for code quality, security, performance
- Check test coverage and adherence to conventions
- Provide actionable feedback
- Update reflection log with patterns found

### 3. Planning Agent (Optional)
**Responsibilities:**
- Break down PRDs into beads task graphs
- Identify dependencies and blockers
- Estimate complexity and priority

---

## Core Principles

### 1. Test-Driven Development (TDD)
**ALWAYS follow this order:**
1. Read PRD and acceptance criteria
2. Write failing tests FIRST
3. Implement minimal code to pass tests
4. Refactor while keeping tests green
5. Validate with full test suite

**Never skip tests. Never write implementation before tests.**

### 2. Beads-First Task Management
- **ALWAYS** check `bd ready` before starting work
- **ALWAYS** update beads status when starting/completing tasks
- **ALWAYS** create blocking tasks for discovered dependencies
- **NEVER** work on blocked tasks
- **NEVER** leave tasks in "in-progress" state when done

### 3. Context-Aware Development
**Before starting ANY task, read:**
1. Relevant PRD from `docs/prd/`
2. Related ADRs from `docs/adr/`
3. Conventions from `docs/context/conventions.md`
4. Patterns from `.agent/skills/[skill-name]/SKILL.md`
5. Past mistakes from `.agent/reflection-log.md`

### 4. Self-Annealing Through Reflection
**After completing ANY task:**
1. Reflect on what worked and what didn't
2. Document mistakes in `.agent/reflection-log.md`
3. Extract reusable patterns to `.agent/skills.md`
4. Use `/reflect` command to analyze and improve

---

## Standard Workflow

### Phase 1: Context Gathering

```bash
# 1. Check ready tasks
bd ready

# 2. Select task and mark in progress
bd update bd-[task-id] --status in-progress

# 3. Read relevant context
# - PRD: docs/prd/features/[feature].md
# - ADRs: docs/adr/*.md
# - Conventions: docs/context/conventions.md
# - Skills: .agent/skills/[skill-name]/SKILL.md
# - Reflection: .agent/reflection-log.md
```

### Phase 2: Test-First Implementation

```bash
# 4. Write tests FIRST
# - Backend: src/backend/tests/
# - Frontend: src/frontend/tests/
# - Commit: git commit -m "test: add tests for [feature] (bd-[task-id])"

# 5. Run tests (should FAIL)
./.agent/scripts/run-tests.sh

# 6. Implement minimal code
# - Follow conventions from docs/context/
# - Use patterns from .agent/skills/[skill-name]/SKILL.md

# 7. Run tests (should PASS)
./.agent/scripts/run-tests.sh

# 8. Commit implementation
git commit -m "feat: implement [feature] (bd-[task-id], #[issue-id])"
```

### Phase 3: Validation

```bash
# 9. Run linting
npm run lint  # or relevant linter

# 10. Run type checking
npm run typecheck  # or relevant checker

# 11. Run full test suite
./.agent/scripts/run-tests.sh

# 12. If any failures, fix and repeat
```

### Phase 4: Documentation & Reflection

```bash
# 13. Update docs if needed
# - New ADR if architectural decision made
# - Update context docs if patterns changed
# - Update .agent/skills/[skill-name]/SKILL.md with new patterns

# 14. Reflect and learn
# Use /reflect [skill-name] or update reflection log directly

# 15. Close beads task
bd close bd-[task-id]

# 16. Update GitHub issue (if at milestone)
gh issue comment [issue-id] --body "✅ Completed: [description] (bd-[task-id])"
```

### Phase 5: Code Review

```bash
# 17. When feature complete, create PR
gh pr create \
  --title "feat: [feature name] (closes #[issue-id])" \
  --body "PRD: docs/prd/features/[feature].md
Beads parent: bd-[parent-id]
GitHub Issue: #[issue-id]

Completed tasks:
- bd-[id1]: [description]
- bd-[id2]: [description]

All tests passing. Ready for review."

# 18. Code review agent provides feedback
# 19. Address feedback, close review task
# 20. Merge PR, close issue, close all beads tasks
```

---

## File Structure Standards

### Backend (Go/Node.js)

```
src/backend/
├── cmd/                    # Entry points (main.go)
├── internal/
│   ├── domain/            # Business logic (pure, testable)
│   ├── repository/        # Data access layer
│   ├── service/           # Application services
│   └── handler/           # HTTP/API handlers
├── pkg/                   # Public libraries
└── tests/
    ├── unit/             # Fast, isolated tests
    ├── integration/      # Database, API tests
    └── e2e/              # End-to-end scenarios
```

**Test files:** Place next to code or in `tests/` subdirectory.

### Frontend (React/Next.js)

```
src/frontend/src/
├── components/           # Reusable UI components
│   └── [Component]/
│       ├── index.tsx
│       ├── [Component].test.tsx
│       └── [Component].module.css
├── pages/               # Route pages
├── services/            # API clients
├── hooks/               # Custom React hooks
└── utils/               # Helper functions
```

**Test files:** Co-locate with implementation (`[file].test.tsx`).

---

## Commit Message Standards

Follow Conventional Commits:

```
<type>(<scope>): <description> (bd-[task-id], #[issue-id])

[optional body]

[optional footer]
Co-Authored-By: Warp <agent@warp.dev>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `test`: Adding/updating tests
- `refactor`: Code refactoring
- `docs`: Documentation changes
- `chore`: Build, dependencies, tooling

**Examples:**
```
test: add unit tests for recipe search (bd-e5f6, #456)

feat: implement search filters (bd-i9j0, #456)

docs: add ADR for database choice (bd-c3d4)

Co-Authored-By: Warp <agent@warp.dev>
```

---

## Error Handling & Recovery

### When Tests Fail
1. **Read error output carefully**
2. **Check reflection-log.md** for similar past issues
3. **Fix root cause**, not symptoms
4. **Document learning** in reflection log
5. **Verify fix** with full test suite

### When Beads Task is Blocked
1. **DO NOT** attempt to work on blocked task
2. **Identify** what's blocking (missing dependency, unclear requirement)
3. **Create** new task for blocker if needed
4. **Update** GitHub issue with blocker information
5. **Work on** other ready tasks

### When Requirements are Unclear
1. **DO NOT** guess or make assumptions
2. **Review** PRD and acceptance criteria
3. **Check** GitHub issue for clarifications
4. **Ask** human for clarification via GitHub comment
5. **Block** beads task until clarity obtained

---

## Skills System

### Using Skills

Skills are reusable patterns stored in `.agent/skills/[skill-name]/SKILL.md`. Before implementing:

1. **Read relevant skill** (e.g., `.agent/skills/tdd-backend/SKILL.md`)
2. **Follow workflow** from skill exactly
3. **Adapt** as needed for context
4. **Update skill** if improvement discovered via `/reflect`

### Reflecting on Skills

After completing a task, run:

```bash
/reflect [skill-name]
```

The reflection workflow will:
1. Analyze the session for corrections, successes, edge cases
2. Propose improvements to the skill
3. Apply changes if approved
4. Update `.agent/skills/[skill-name]/SKILL.md`

**Example output:**
```
┌─ Skill Reflection: tdd-backend ────────────────────────────┐
│                                                             │
│ Signals: 1 correction, 4 successes                          │
│                                                             │
│ Proposed changes:                                            │
│                                                             │
│ 🔴 [HIGH] + Add constraint: "Always mock external APIs"     │
│ 🟡 [MED]  + Add preference: "Use table-driven tests"        │
│                                                             │
│ Commit: "tdd-backend: always mock external APIs"            │
└─────────────────────────────────────────────────────────────┘
```

### Creating New Skills

When you discover a repeatable pattern:

1. Create new folder: `.agent/skills/[skill-name]/`
2. Create `SKILL.md` following template in `.agent/skills/README.md`
3. Include:
   - **Metadata**: Name, version, description, triggers
   - **When to use**: Context
   - **Workflow**: Step-by-step process
   - **Constraints**: What to NEVER do
   - **Best Practices**: Proven patterns
   - **Examples**: Code samples
   - **Gotchas**: Common mistakes
   - **Checklist**: Completion criteria

**See:** `.agent/skills/README.md` for full template and guidelines.

---

## Reflection Log Format

**Location:** `.agent/reflection-log.md`

**Entry template:**
```markdown
## [YYYY-MM-DD] - [Task/Feature] (bd-[task-id], #[issue-id])

**What went wrong:**
[Description of mistake or issue]

**Root cause:**
[Why it happened - be specific]

**Prevention:**
[How to avoid in future - actionable steps]

**Pattern added to skills:** [Yes/No]
[If yes, reference skill name and path: .agent/skills/[name]/SKILL.md]

**Commits affected:**
- [commit hash]: [commit message]

---
```

**Example:**
```markdown
## 2026-01-13 - Recipe Search Implementation (bd-g7h8, #456)

**What went wrong:**
Tests failed in CI due to missing mock for external recipe API.

**Root cause:**
Forgot to mock external API dependency. Tests worked locally because
dev environment had API credentials, but CI did not.

**Prevention:**
- ALWAYS mock external APIs in unit tests
- Add check to CI that fails if external network calls detected
- Update tdd-backend skill with this constraint

**Pattern added to skills:** Yes
Updated .agent/skills/tdd-backend/SKILL.md: "Always mock external APIs"

**Commits affected:**
- a1b2c3d: test: add search service tests (bd-e5f6)
- e4f5g6h: fix: mock external API in tests (bd-e5f6)

---
```

---

## Multi-Agent Coordination

### Triggering Code Review Agent

**Manual:**
```bash
# After PR created
gh pr comment [pr-number] --body "@codex-review-bot please review"
```

**Automatic:**
Via GitHub Actions (`.github/workflows/code-review-agent.yml`):
- Triggers on PR creation
- Runs on every push to PR
- Posts review comments inline

### Code Review Agent Checklist

When reviewing, check:
- [ ] Tests exist and cover acceptance criteria
- [ ] All tests pass
- [ ] Code follows conventions (docs/context/conventions.md)
- [ ] No security vulnerabilities
- [ ] Error handling present
- [ ] Performance considerations addressed
- [ ] Documentation updated
- [ ] Beads tasks properly closed
- [ ] GitHub issue properly referenced

### Review Feedback Format

```markdown
## Code Review - bd-[task-id] (#[issue-id])

### ✅ Strengths
- [What was done well]

### ⚠️ Issues Found
- **[Severity]**: [Issue description]
  - **Location**: [file:line]
  - **Fix**: [Suggested fix]

### 📝 Recommendations
- [Improvement suggestion]

### 🔄 Status
- [ ] Address issues
- [ ] Re-run tests
- [ ] Update reflection log
```

---

## Documentation Standards

### PRD (Product Requirements Document)

**Location:** `docs/prd/features/[feature-name].md`

**Template:**
```markdown
# [Feature Name]

**GitHub Issue**: #[issue-id]
**Beads Task**: bd-[task-id]
**Status**: [Draft/In Progress/Complete]

## Problem Statement
[What problem does this solve?]

## Requirements
- REQ-1: [Requirement]
- REQ-2: [Requirement]

## Acceptance Criteria
- AC-1: [Testable criterion]
- AC-2: [Testable criterion]

## Technical Considerations
[Any technical constraints, dependencies, or considerations]

## Out of Scope
[What this feature explicitly does NOT include]
```

### ADR (Architecture Decision Record)

**Location:** `docs/adr/###-[title].md`

**Template:**
```markdown
# [Number]. [Title]

**Date**: YYYY-MM-DD
**Status**: [Proposed/Accepted/Deprecated/Superseded by ADR-###]
**Beads Task**: bd-[task-id] (if applicable)
**GitHub Issue**: #[issue-id] (if applicable)

## Context
[What is the issue motivating this decision?]

## Decision
[What is the change we're making?]

## Consequences
**Positive:**
- [Benefit 1]

**Negative:**
- [Trade-off 1]

**Risks:**
- [Risk 1]

## Alternatives Considered
1. **[Alternative]**: [Why rejected]
```

### Context Documents

**Location:** `docs/context/`

Update when patterns or conventions change:
- `conventions.md`: Coding standards
- `tech-stack.md`: Technologies used
- `api-contracts.md`: API specifications

---

## Commands Reference

**Location:** `.agent/commands.md`

Quick reference for common operations:

```markdown
# Common Commands

## Development
\`\`\`bash
# Start dev server
npm run dev

# Run tests
./.agent/scripts/run-tests.sh

# Lint
npm run lint

# Type check
npm run typecheck
\`\`\`

## Beads
\`\`\`bash
# Check ready tasks
bd ready

# Create task
bd create "Title" -p [priority]

# Update status
bd update bd-[id] --status [todo|in-progress|blocked|done]

# Close task
bd close bd-[id]
\`\`\`

## Git/GitHub
\`\`\`bash
# Create PR
gh pr create --title "feat: [title]" --body "[body]"

# Comment on issue
gh issue comment [id] --body "[comment]"

# View issue
gh issue view [id]
\`\`\`
```

---

## Checklist: Before Closing Task

Before running `bd close bd-[task-id]`, verify:

- [ ] All tests pass (`./agent/scripts/run-tests.sh`)
- [ ] Linting passes
- [ ] Type checking passes
- [ ] Code follows conventions
- [ ] Commits follow format (includes bd-id, issue-id, co-author)
- [ ] Reflection log updated (if mistakes made)
- [ ] Skills updated via `/reflect` (if new pattern discovered)
- [ ] Documentation updated (if needed)
- [ ] GitHub issue commented (if at milestone)

---

## Emergency Procedures

### Build is Broken
1. **Stop all work** on new features
2. **Create high-priority beads task**: `bd create "FIX: Broken build" -p 0`
3. **Identify** last working commit
4. **Revert** or fix forward
5. **Document** in reflection log

### Security Issue Found
1. **DO NOT commit** sensitive data
2. **Create private beads task** (if beads supports)
3. **Notify** human immediately via GitHub issue (private)
4. **Fix** immediately
5. **Document** in reflection log (sanitize sensitive details)

### Stuck on Task
1. **Document** what you've tried in beads task notes
2. **Update** task status to "blocked"
3. **Create** GitHub issue comment explaining blocker
4. **Move to** next ready task
5. **Wait** for human clarification

---

## Version History

| Version | Date       | Changes                          |
|---------|------------|----------------------------------|
| 1.0     | 2026-01-13 | Initial agent instructions       |

---

## Questions?

If these instructions are unclear or incomplete:
1. Document the gap in `.agent/reflection-log.md`
2. Comment on GitHub issue or create new issue
3. Propose update to this document

**This document is living. Update it as learnings emerge.**

---

*End of agent instructions.*
