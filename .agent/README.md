# Agent System Documentation

This directory contains all agent-related configuration, workflows, and learning systems for the rezipe project.

---

## Overview

The agent system is designed to enable **self-improving, production-ready development** through:

1. **Structured workflows** - Clear processes for TDD, code review, deployment
2. **Skills system** - Reusable patterns that evolve through reflection
3. **Learning feedback loop** - Mistakes captured and patterns extracted
4. **Multi-agent coordination** - Multiple agents working together via Beads

---

## Directory Structure

```
.agent/
├── README.md              # This file - overview of agent system
├── AGENTS.md              # Main agent instructions (START HERE)
├── commands.md            # Quick reference for common commands
├── reflection-log.md      # Log of mistakes and learnings
└── skills/                # Modular skills system
    ├── README.md          # Skills system overview
    ├── reflect/
    │   └── SKILL.md       # Self-reflection skill
    ├── tdd-backend/
    │   └── SKILL.md       # Backend TDD workflow
    ├── tdd-frontend/
    │   └── SKILL.md       # Frontend TDD workflow
    └── ...                # More skills as needed
```

---

## Quick Start for Agents

### First Time Setup

1. **Read the main instructions:**
   ```bash
   cat .agent/AGENTS.md
   ```

2. **Understand the workflow:**
   - PRD → GitHub Issue → Beads Tasks
   - Test-First Development (TDD)
   - Skills-based execution
   - Reflection & learning

3. **Check available skills:**
   ```bash
   ls .agent/skills/
   cat .agent/skills/README.md
   ```

### Starting a New Task

```bash
# 1. Check ready beads tasks
bd ready

# 2. Select and mark in progress
bd update bd-[task-id] --status in-progress

# 3. Read context
cat docs/prd/features/[feature].md
cat docs/context/conventions.md
cat .agent/reflection-log.md  # Check for past mistakes

# 4. Choose relevant skill
cat .agent/skills/tdd-backend/SKILL.md  # or tdd-frontend, etc.

# 5. Follow skill workflow exactly
# ...

# 6. After completing, reflect
/reflect [skill-name]

# 7. Close task
bd close bd-[task-id]
```

---

## Core Files

### AGENTS.md - Main Instructions

**Purpose:** Canonical workflow and standards for all agents

**Contains:**
- Agent roles (Implementation, Code Review, Planning)
- Core principles (TDD, Beads-first, Context-aware, Self-annealing)
- 5-phase workflow (Context → Test-First → Validation → Documentation → Review)
- File structure standards
- Error handling procedures
- Documentation templates
- Multi-agent coordination

**When to read:** Before starting ANY work on the project

### skills/ - Skills System

**Purpose:** Modular, reusable workflow patterns

**Structure:** Each skill in its own folder with `SKILL.md`

**Available skills:**
- `reflect` - Self-improvement through reflection
- `tdd-backend` - Backend test-driven development
- `tdd-frontend` - Frontend test-driven development

**When to read:** Before implementing features, after completing work

**See:** `.agent/skills/README.md` for full details

### reflection-log.md - Learning Log

**Purpose:** Track mistakes and extract learnings

**Format:**
```markdown
## [Date] - [Task] (bd-[id], #[issue])

**What went wrong:** [Description]
**Root cause:** [Why it happened]
**Prevention:** [How to avoid]
**Pattern added to skills:** [Yes/No]
```

**When to update:** After making mistakes, after completing complex tasks

### commands.md - Quick Reference

**Purpose:** Common commands for development, testing, deployment

**Contains:**
- Beads commands
- Development commands (backend/frontend)
- Git/GitHub CLI
- Database operations
- Docker/deployment
- Agent-specific commands

**When to read:** When you need a command reference

---

## Key Concepts

### 1. Three-Layer Task Management

```
PRD (WHY) → GitHub Issue (WHAT) → Beads Tasks (HOW)
```

- **PRD:** Requirements, acceptance criteria
- **GitHub Issue:** Human-facing tracking, milestones
- **Beads Tasks:** Fine-grained agent working memory

### 2. Test-Driven Development (TDD)

**Always follow this order:**
1. Write tests FIRST
2. Run tests (should FAIL)
3. Implement code
4. Run tests (should PASS)
5. Refactor
6. Commit

**NEVER skip tests. NEVER write code before tests.**

### 3. Skills-Based Execution

Before implementing, read the relevant skill:
- Backend API? Read `skills/tdd-backend/SKILL.md`
- Frontend UI? Read `skills/tdd-frontend/SKILL.md`
- Code review? Read `skills/code-review/SKILL.md`

Follow the workflow exactly for consistent results.

### 4. Self-Annealing via Reflection

After completing work:
```bash
/reflect [skill-name]
```

This will:
1. Analyze the session for corrections, successes, edge cases
2. Propose improvements to the skill
3. Apply changes if approved
4. Update the skill file

**Result:** Skills improve over time based on real experience.

### 5. Multi-Agent Coordination

- **Main Agent:** Implements features via TDD
- **Review Agent (Codex):** Reviews PRs for quality/security
- **Planning Agent:** Breaks PRDs into Beads tasks

Coordination via:
- Beads task IDs
- GitHub issue references
- Shared skills and reflection log

---

## Workflow Summary

### Phase 1: Planning
1. Human writes PRD
2. Human creates GitHub issue
3. Agent breaks down into Beads tasks

### Phase 2: Implementation (TDD)
1. Agent reads context (PRD, ADRs, skills, reflection log)
2. Agent writes tests FIRST
3. Agent implements code
4. Agent validates (tests, linting, type checking)

### Phase 3: Review
1. Agent creates PR
2. Review agent checks quality
3. Main agent addresses feedback
4. PR merged

### Phase 4: Learning
1. Agent reflects on work (`/reflect`)
2. Updates reflection log if mistakes made
3. Updates skills if patterns discovered
4. Closes Beads tasks and GitHub issue

---

## Integration with Beads

**Beads** provides persistent task memory for agents.

### Why Beads?

- **Git-backed:** Tasks versioned like code
- **Dependency-aware:** Blocks/blockers managed automatically
- **Agent-optimized:** JSON output, ready task detection
- **Zero conflict:** Hash-based IDs prevent merge collisions

### Basic Beads Commands

```bash
# Initialize (once)
bd init

# Create task
bd create "Implement recipe search" -p 0

# Create with dependency
bd create "Write tests" --blocks bd-parent-id

# List ready tasks
bd ready

# Update status
bd update bd-[id] --status in-progress

# Close task
bd close bd-[id]
```

**See:** `commands.md` for full Beads reference

---

## Creating New Skills

As you discover repeatable patterns:

1. **Create skill folder:**
   ```bash
   mkdir .agent/skills/[skill-name]
   ```

2. **Create SKILL.md using template:**
   - See `.agent/skills/README.md` for full template
   - Include: metadata, workflow, constraints, examples, gotchas

3. **Test the skill:**
   - Use it on actual work
   - Iterate based on results

4. **Commit:**
   ```bash
   git add .agent/skills/[skill-name]/
   git commit -m "docs: add [skill-name] skill"
   ```

---

## Best Practices

### For All Agents

1. **Always read AGENTS.md first** - It's the source of truth
2. **Always check reflection log** - Don't repeat past mistakes
3. **Always use relevant skills** - Don't reinvent patterns
4. **Always reflect after work** - Help skills improve
5. **Always use Beads** - Keep task state synchronized

### For Implementation

1. **TDD is mandatory** - Tests first, always
2. **Mock external dependencies** - No network calls in unit tests
3. **Follow conventions** - Check `docs/context/conventions.md`
4. **Commit atomically** - Small, focused commits with proper messages

### For Learning

1. **Document mistakes immediately** - In reflection-log.md
2. **Extract patterns to skills** - Make learnings reusable
3. **Update skills via reflection** - Use `/reflect` command
4. **Review reflection log regularly** - Learn from past issues

---

## Troubleshooting

### "I don't know which skill to use"

Check the skill's **triggers** in its frontmatter:
```yaml
triggers:
  - "implement backend"
  - "create API"
```

Or check `.agent/skills/README.md` for skill overview.

### "The skill doesn't fit my exact situation"

Skills are guidelines, not rigid rules:
1. Follow the core workflow
2. Adapt details to your context
3. Use `/reflect` to propose improvements

### "Tests are failing"

1. Check `reflection-log.md` for similar past failures
2. Read error message carefully
3. Follow debugging skill (when created)
4. Document the issue and fix in reflection log

### "Beads task is blocked"

1. DO NOT work on blocked tasks
2. Identify the blocker
3. Create new task for blocker if needed
4. Work on other ready tasks
5. Return when blocker resolved

---

## Maintenance

### Weekly

- Review reflection log for patterns
- Update skills via `/reflect` if patterns found
- Check that all beads tasks are properly closed

### Monthly

- Review all skills for accuracy
- Archive obsolete skills
- Update AGENTS.md if workflow changes
- Clean up old closed beads tasks (compaction)

---

## Questions?

- **Unclear workflow?** Read `AGENTS.md` again
- **Need a command?** Check `commands.md`
- **Repeated mistake?** Check `reflection-log.md`
- **Need a pattern?** Check `skills/[skill-name]/SKILL.md`
- **Want to improve?** Use `/reflect [skill-name]`

---

## Version History

| Version | Date       | Changes                           |
|---------|------------|-----------------------------------|
| 1.0     | 2026-01-13 | Initial agent system setup        |

---

**The agent system is designed to be self-improving. Use it, reflect on it, and make it better.**

*Last updated: 2026-01-13*
