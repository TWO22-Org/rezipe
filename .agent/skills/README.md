# Agent Skills System

This directory contains reusable skills that agents can reference when working on the rezipe project. Each skill is a self-contained workflow with examples, best practices, and gotchas.

---

## Structure

Each skill lives in its own folder with a `SKILL.md` file:

```
.agent/skills/
├── README.md                    # This file
├── reflect/
│   └── SKILL.md                # Reflection skill
├── tdd-backend/
│   └── SKILL.md                # Backend TDD workflow
├── tdd-frontend/
│   └── SKILL.md                # Frontend TDD workflow
├── code-review/
│   └── SKILL.md                # Code review checklist
├── api-design/
│   └── SKILL.md                # API design patterns
└── ...                         # More skills as needed
```

---

## How Skills Work

### 1. Discovery

Agents should:
- **Before starting work:** Search skills for relevant patterns
- **During work:** Reference skills for best practices
- **After work:** Use `/reflect` to improve skills

**Example:**
```bash
# Agent checks for TDD backend skill before implementing API
cat .agent/skills/tdd-backend/SKILL.md

# Agent follows workflow from skill
# ...

# After completion, agent reflects
/reflect tdd-backend
```

### 2. Using a Skill

Each `SKILL.md` contains:
- **Metadata:** Name, version, triggers
- **When to Use:** Context for applying skill
- **Workflow:** Step-by-step process
- **Constraints:** What to NEVER do
- **Best Practices:** Proven patterns
- **Gotchas:** Common mistakes
- **Examples:** Code samples
- **Checklist:** Completion criteria

**Follow the workflow exactly** for consistent results.

### 3. Improving Skills

Use the `/reflect [skill-name]` command to:
1. Analyze recent work for corrections, successes, edge cases
2. Propose improvements to the skill
3. Apply changes if approved
4. Commit updated skill

**Example flow:**
```
User: /reflect tdd-backend

Agent: 
┌─ Skill Reflection: tdd-backend ─────────────────────────────┐
│                                                             │
│ Signals: 1 correction, 3 successes                          │
│                                                             │
│ Proposed changes:                                            │
│                                                             │
│ 🔴 [HIGH] + Gotchas:                                         │
│   "Always mock external APIs in unit tests"                 │
│                                                             │
│ Commit: "tdd-backend: add external API mocking constraint"  │
└─────────────────────────────────────────────────────────────┘
Apply these changes? [Y/n]

User: Y

Agent: [edits tdd-backend/SKILL.md, commits, pushes]
Skill updated and pushed to GitHub.
```

---

## Available Skills

### Core Development Skills

#### **reflect** - Reflection & Learning
- **Purpose:** Analyze sessions and improve skills
- **When:** After completing tasks, when mistakes found
- **Key feature:** Self-annealing feedback loop

#### **tdd-backend** - Backend TDD
- **Purpose:** Test-driven development for APIs/services
- **When:** Implementing backend features
- **Key feature:** Write tests FIRST, always mock external dependencies

#### **tdd-frontend** - Frontend TDD
- **Purpose:** Test-driven development for UI components
- **When:** Implementing React/Vue/Angular components
- **Key feature:** Test behavior not implementation, accessibility-first

### Code Quality Skills

#### **code-review** (to be created)
- **Purpose:** Comprehensive code review checklist
- **When:** Reviewing PRs
- **Key feature:** Security, performance, conventions

#### **debugging** (to be created)
- **Purpose:** Systematic debugging process
- **When:** Tests fail, bugs found
- **Key feature:** Root cause analysis

### Design Skills

#### **api-design** (to be created)
- **Purpose:** RESTful API design patterns
- **When:** Creating new endpoints
- **Key feature:** Consistent REST conventions

---

## Creating New Skills

When you discover a repeatable pattern, create a new skill:

### 1. Create folder and SKILL.md

```bash
mkdir .agent/skills/[skill-name]
touch .agent/skills/[skill-name]/SKILL.md
```

### 2. Use this template

```markdown
---
skill: [skill-name]
name: [Human Readable Name]
version: 1.0
description: "One-line description"
triggers:
  - "trigger phrase 1"
  - "trigger phrase 2"
---

# [Skill Name]

## Metadata

| name | description |
|------|-------------|
| [skill-name] | Full description of when to use this skill |

**Purpose:** What problem does this skill solve?

---

## When to Use

- Context 1
- Context 2
- Context 3

---

## Workflow

### 1) Step One

Description and example

### 2) Step Two

Description and example

### 3) Step Three

Description and example

---

## Constraints / NEVER

- **NEVER** do X
- **NEVER** do Y

---

## Best Practices

### Pattern 1

Explanation and example

### Pattern 2

Explanation and example

---

## Gotchas

- Common mistake 1
- Common mistake 2

---

## Checklist

- [ ] Criterion 1
- [ ] Criterion 2

---

## Related Skills

- `related-skill-1` - Description
- `related-skill-2` - Description

---

## Version History

| Version | Date       | Changes           |
|---------|------------|-------------------|
| 1.0     | YYYY-MM-DD | Initial version   |

---

*End of skill definition.*
```

### 3. Test the skill

Use it on actual work and iterate based on results.

### 4. Commit

```bash
git add .agent/skills/[skill-name]/
git commit -m "docs: add [skill-name] skill

Co-Authored-By: Warp <agent@warp.dev>"
git push origin main
```

---

## Integration with Other Systems

### Reflection Log

Skills capture **general patterns**.  
`.agent/reflection-log.md` captures **specific instances**.

When a mistake is made:
1. Log it in reflection-log.md with context
2. Extract the pattern to skills/
3. Reference skill in future work

### Beads Tasks

Skills inform how beads tasks are executed:
- Task: "Implement recipe search API"
- Skill: `tdd-backend` guides the implementation
- Reflection: Updates skill based on learnings

### AGENTS.md

`AGENTS.md` references skills as part of the standard workflow:
- Phase 1: Read skills before starting
- Phase 4: Update skills after completing
- Core Principle: Use skills for consistency

---

## Skill Naming Conventions

- Use lowercase with hyphens: `tdd-backend`, not `TDD_Backend`
- Be specific: `api-design` not `design`
- Use verb-noun when possible: `debug-tests`, `review-code`
- Avoid generic names: `development`, `implementation`

---

## Versioning

Skills should be versioned when making breaking changes:

- **Patch (1.0 → 1.1):** Minor improvements, added gotchas
- **Minor (1.0 → 2.0):** New steps in workflow, changed best practices
- **Major (1.0 → 2.0):** Complete workflow overhaul

When versioning, add to version history table in SKILL.md.

---

## Tips for Effective Skills

### 1. Be Specific

❌ **Bad:** "Write good tests"  
✅ **Good:** "Write table-driven tests with Arrange-Act-Assert pattern"

### 2. Include Examples

Every workflow step should have a code example showing exactly what to do.

### 3. Document Gotchas

Capture common mistakes so they're not repeated:
- "Always mock external APIs"
- "Use accessible queries, not test IDs"
- "Check reflection log before starting"

### 4. Keep Updated

Skills should evolve based on learnings:
- Use `/reflect` regularly
- Update when project patterns change
- Archive outdated skills

### 5. Cross-Reference

Link related skills:
- `tdd-backend` → `api-design`, `code-review`
- `debugging` → `tdd-backend`, `tdd-frontend`
- `reflect` → all skills

---

## Maintenance

### Regular Reviews

Monthly review of skills:
- Are they being used?
- Are they still accurate?
- Have project conventions changed?

### Archiving Old Skills

When a skill becomes obsolete:
1. Move to `.agent/skills/_archived/[skill-name]/`
2. Update README to note archival
3. Commit with reason

---

## Questions?

If you need to:
- **Create a new skill:** Follow template above
- **Update existing skill:** Use `/reflect [skill-name]`
- **Discuss major changes:** Create GitHub issue

Skills are living documents. Keep them updated and they'll keep improving your work.

---

*Last updated: 2026-01-13*
