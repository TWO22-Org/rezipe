# Task Preparation Checklist

Use this checklist when starting a new implementation task to apply learnings from previous work.

## Pre-Implementation

- [ ] Read task description and acceptance criteria
- [ ] Extract PRD constraints relevant to task
- [ ] Check CLAUDE.md for tech stack requirements (Swift version, API constraints, etc.)
- [ ] Identify state lifecycle from requirements (what must be preserved across views/actions)
- [ ] List required APIs and whether they're SwiftUI-only or require UIKit bridging
- [ ] Plan asset/resource generation (images, colors, fonts) upfront

## During Implementation

- [ ] Verify build settings align with Swift version requirements
- [ ] Use pure SwiftUI APIs exclusively (check for UIKit bridging)
- [ ] Lift state to parent views where lifecycle requires preservation
- [ ] Test instantiation and accessibility immediately after creating views
- [ ] Add NavigationPath/state tests to verify preservation logic
- [ ] Run verification loop after each implementation step

## Before Commit

- [ ] Review code for UIKit bridging (Color(.system*), UIView, etc.)
- [ ] Check state ownership - is state at the right level?
- [ ] Verify all required assets/images are included
- [ ] Run full test suite
- [ ] Create meaningful commit message with task ID

## After Commit

- [ ] `bd update <task-id> --status closed`
- [ ] `bd sync`
- [ ] Update learnings if new patterns discovered
