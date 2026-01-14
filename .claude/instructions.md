# Claude Code Instructions for Rezipe

## Project Overview
This project uses **bd** (beads) for issue tracking and follows specific workflows for session management.

## Development Workflow
- Use `bd` commands for issue tracking (see AGENTS.md for details)
- Follow the "Landing the Plane" protocol when completing work sessions
- Always push changes to remote before ending sessions

## Important Files
- `AGENTS.md` - Agent instructions and bd workflow
- `README.md` - Project documentation
- `.beads/` - Issue tracking data
- `src/` - Source code
- `docs/` - Documentation
- `scripts/` - Utility scripts

## Quality Gates
Before completing work:
1. Run tests (if applicable)
2. Run linters (if applicable)
3. Ensure builds succeed (if applicable)
4. Update and push all changes

## Session Completion Checklist
1. File issues for remaining work
2. Run quality gates
3. Update issue status
4. Push to remote (MANDATORY)
5. Clean up
6. Verify all changes committed and pushed
7. Provide handoff context
