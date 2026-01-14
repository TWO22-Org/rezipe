---
skill: reflect
name: Reflect Skill
version: 1.0
description: "Analyze the current session and propose improvements to skills. Run after using a skill to capture learnings."
triggers:
  - "/reflect"
  - "/reflect [skill-name]"
---

# Reflect Skill

## Metadata

| name    | description |
|---------|-------------|
| reflect | Analyze the current session and propose improvements to skills. Run after using a skill to capture learnings. Use when user says "reflect", "improve skill", "learn from this", or at the end of skill-heavy sessions. |

**Purpose:** Analyze the conversation and propose improvements to a named skill based on what worked, what didn't, and edge cases discovered.

---

## Trigger

Run `/reflect` or `/reflect [skill-name]` after completing a task or when you need to improve a skill.

**Common use cases:**
- After completing a feature implementation
- After a code review
- When user points out a repeated mistake
- End of a complex development session

---

## Workflow

This section is the canonical workflow the skill follows. Keep formatting and prompts exact so automations can parse sections when needed.

### 1) Identify the Skill

- If the skill name is not provided, ask the user:

```text
Which skill should I analyze this session for?
- tdd-backend
- tdd-frontend
- code-review
- api-design
- git-workflow
- debugging
- other (reply with a name)
```

### 2) Analyze the Conversation

Scan the session for the following signal types and collect counts / examples for each.

- **Corrections** (HIGH confidence)
  - User said "no", "not like that", "I meant … "
  - User explicitly corrected generated output
  - User asked for changes immediately after generation
  - Tests failed due to incorrect implementation

- **Successes** (MEDIUM confidence)
  - User said "perfect", "great", "yes", "exactly"
  - User accepted output without modification
  - User built on top of the output
  - All tests passed on first run

- **Edge cases** (MEDIUM confidence)
  - Questions the skill didn't anticipate
  - Scenarios requiring workarounds
  - Features the user asked for that weren't covered
  - Unexpected test failures

- **Preferences** (accumulate over sessions)
  - Repeated patterns in user choices
  - Style preferences shown implicitly
  - Tool or framework preferences
  - Testing strategy preferences

### 3) Propose Changes

Summarize findings in a compact, actionable template. Use the ASCII board below as the canonical output format so it can be copy/pasted into skill files or PR descriptions.

```
┌─ Skill Reflection: [skill-name] ────────────────────────────┐
│                                                             │
│ Signals: X corrections, Y successes                          │
│                                                             │
│ Proposed changes:                                            │
│                                                             │
│ 🔴 [HIGH] + Add constraint: "[specific constraint]"          │
│ 🟡 [MED]  + Add preference: "[specific preference]"          │
│ 🔵 [LOW]  ~ Note for review: "[observation]"                 │
│                                                             │
│ Commit: "[skill]: [summary of changes]"                      │
└─────────────────────────────────────────────────────────────┘
Apply these changes? [Y/n] or describe tweaks.
```

---

## Accessible Color Palette

When emitting colored terminal output, prefer these ANSI-safe mappings (WCAG AA contrast considerations):

- HIGH: 🔴 (red indicator for critical items)
- MED:  🟡 (yellow indicator for medium priority)
- LOW:  🔵 (blue indicator for low priority)

**Avoid:** pure red (#FF0000) on black; green-on-red combinations (problematic for colorblind users).

---

## Options / Actions

- `Y` — Apply changes, edit the SKILL.md file, commit, and push.
- `n` — Skip and optionally append observations to reflection-log.md.
- Or reply with tweaks to the proposed changes.

---

## Applying Changes (If Approved)

When the user approves, the canonical edit flow is:

```bash
# Update the specific skill's SKILL.md
cd .agent/skills/[skill-name]

# Edit SKILL.md with proposed changes
# (agent edits the file)

# Commit with conventional commit format
git add .agent/skills/[skill-name]/SKILL.md
git commit -m "[skill]: [summary of changes]

Co-Authored-By: Warp <agent@warp.dev>"

# Push to main
git push origin main
```

After pushing, confirm: **"Skill updated and pushed to GitHub"**.

---

## If Declined

Ask the user:

> Would you like to save these observations for later review?

If yes, append them to: `.agent/reflection-log.md`.

**Format:**
```markdown
## [YYYY-MM-DD] - Reflection Deferred: [skill-name]

**Proposed changes (not applied):**
[List proposed changes]

**Reason for deferral:**
[User's reason or "needs more data"]

---
```

---

## Example Session

**User runs:** `/reflect tdd-backend`

Expected compact output:

```
┌─ Skill Reflection: tdd-backend ─────────────────────────────┐
│                                                             │
│ Signals: 2 corrections, 4 successes                          │
│                                                             │
│ Proposed changes:                                            │
│                                                             │
│ 🔴 [HIGH] + Gotchas:                                         │
│   "Always mock external APIs in unit tests"                 │
│                                                             │
│ 🔴 [HIGH] + Steps:                                           │
│   "Add step 3.5: Verify no external network calls"         │
│                                                             │
│ 🟡 [MED]  + Example:                                         │
│   "Add table-driven test example with mocks"               │
│                                                             │
│ Commit: "tdd-backend: always mock external APIs"            │
└─────────────────────────────────────────────────────────────┘
Apply these changes? [Y/n]
```

---

## Integration with Other Systems

### Reflection Log
Always update `.agent/reflection-log.md` when mistakes are found, even if the skill is updated. The reflection log captures the specific instance, while the skill update captures the general pattern.

### Beads Tasks
If a skill improvement is complex or requires discussion, create a beads task:
```bash
bd create "Update [skill-name] skill: [description]" -p 2
```

### GitHub Issues
For major skill overhauls, create a GitHub issue to track discussion and approval.

---

## Notes

- This file is intended to be used as `.agent/skills/reflect/SKILL.md`.
- Skills should be edited via the canonical apply flow when changes are approved.
- Always test skill improvements by using the updated skill in practice.
- Version the skill if making breaking changes to the workflow.

---

*End of skill definition.*
