# Agent Reflection Log

**Version**: 1.0  
**Last Updated**: 2026-01-13

This document tracks mistakes, learnings, and improvements discovered by agents working on rezipe. Use this as a reference to avoid repeating past mistakes.

---

## Purpose

Every time an agent makes a mistake or discovers a better approach, it should be documented here. This creates a feedback loop for continuous improvement and self-annealing.

**Before starting work:** Check this log for similar past issues.  
**After completing work:** Add entry if mistakes were made.

---

## Log Format

Use this template for each entry:

```markdown
## [YYYY-MM-DD] - [Task/Feature] (bd-[task-id], #[issue-id])

**What went wrong:**
[Clear description of the mistake or issue]

**Root cause:**
[Why it happened - be specific and analytical]

**Prevention:**
[Actionable steps to avoid in future]

**Pattern added to skills.md:** [Yes/No]
[If yes, reference skill name]

**Commits affected:**
- [commit hash]: [commit message]

---
```

---

## 2026-01-13 - Initial Setup

**Setup complete:**
- Created agent instructions (AGENTS.md)
- Created skills document with reflection system (skills.md)
- Created reflection log (this file)
- Created commands reference (commands.md)

**No mistakes logged yet.**

Ready to begin tracking learnings as development progresses.

---

*New entries should be added below this line in reverse chronological order (newest first).*

---

## Tips for Effective Reflection

1. **Be specific**: Don't just say "forgot to test" - explain what test case was missing and why
2. **Find root cause**: Go beyond surface symptoms to understand why the mistake happened
3. **Make it actionable**: Prevention steps should be concrete, not vague advice
4. **Update skills**: If the learning is reusable, extract it to skills.md
5. **Review regularly**: Check this log before starting similar tasks

---

## Common Mistake Categories

Track patterns across entries to identify recurring issues:

### Testing
- Missing mocks for external dependencies
- Not testing error paths
- Async timing issues
- Missing edge cases

### Architecture
- Tight coupling between components
- Missing error handling
- Poor separation of concerns
- Inefficient database queries

### Process
- Skipping TDD cycle
- Not reading PRD thoroughly
- Not checking reflection log before starting
- Forgetting to update beads task status

### Documentation
- Missing ADR for architectural decisions
- Not updating API contracts
- Incomplete commit messages
- Forgetting co-author attribution

---

*End of reflection log.*
