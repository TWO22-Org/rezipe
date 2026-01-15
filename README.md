# ChefStream (Rezipe)

**A recipe-first YouTube experience for iOS**

Transform YouTube cooking videos into structured, followable recipes with automatic translation and curation.

---

## Project Overview

ChefStream is an iOS app that:
- Discovers recipe-focused YouTube videos through curated categories and search
- Displays videos in a compliant YouTube embedded player
- Automatically extracts and translates recipes from video descriptions and transcripts
- Provides a kitchen-ready recipe card beneath each video

**Status:** MVP Development  
**Platform:** iOS 17+  
**Backend:** Supabase (Postgres + Edge Functions)

---

## Quick Start

### For Agents

1. **Read the agent instructions:**
   ```bash
   cat AGENTS.md
   ```

2. **Install beads (if needed):**
   ```bash
   curl -fsSL https://raw.githubusercontent.com/steveyegge/beads/main/scripts/install.sh | bash
   # or: brew install steveyegge/beads/bd
   # or: npm install -g @beads/bd
   # or: go install github.com/steveyegge/beads/cmd/bd@latest
   ```

3. **Initialize beads (once per repo):**
   ```bash
   bd init
   ```

4. **Check ready tasks:**
   ```bash
   bd ready
   ```

5. **Before starting work:**
   - Read relevant PRD: `.claude/prds/` (CCPM source of truth)
   - Check conventions: `docs/context/conventions.md`
   - Review tech stack: `docs/context/tech-stack.md`
   - Check past mistakes: `.claude/learnings/reflection-log.md`
   - Check recent learnings: `.claude/learnings/`

### For Humans

1. **Clone and setup:**
   ```bash
   git clone <repo-url>
   cd rezipe
   ```

2. **Install dependencies:**
   - iOS: Xcode 15+
   - Backend: Deno (via Supabase), Supabase CLI

3. **Install beads (if needed):**
   ```bash
   curl -fsSL https://raw.githubusercontent.com/steveyegge/beads/main/scripts/install.sh | bash
   # or: brew install steveyegge/beads/bd
   # or: npm install -g @beads/bd
   # or: go install github.com/steveyegge/beads/cmd/bd@latest
   ```

4. **Initialize beads:**
   ```bash
   bd init
   ```

5. **Initialize CCPM (once per repo):**
   ```bash
   /pm:init
   /context:create
   ```

---

## Documentation

### Core Documents
- **[Tech Stack](docs/context/tech-stack.md)** - Technologies used
- **[Conventions](docs/context/conventions.md)** - Coding standards
- **[Agent Instructions](AGENTS.md)** - Workflow for AI agents

### Observability (Sentry)
- **Projects**: `rezipe-ios` (iOS) and `rezipe-edge` (Edge Functions)
- **Local env**: copy `.env.example` to `.env.local` and add DSNs (do not commit)
- **Privacy**: default to high privacy (no PII); keep `sendDefaultPii=false` in SDK configs
- **Tag taxonomy** (for MCP queries): `surface`, `feature`, `flow`, `environment`, `release`
- **MCP**: Sentry MCP is configured in Warp and Codex for issue queries

### CCPM System
- **[PRDs](.claude/prds/)** - Source of truth planning docs
- **[Epics/Tasks](.claude/epics/)** - CCPM execution planning
- **[Skills](.claude/skills/README.md)** - Reusable workflow patterns
- **[Learnings](.claude/learnings/)** - Learning from mistakes
- **Note**: We use root `CLAUDE.md` as the canonical rules file (not `.claude/CLAUDE.md`).

### Feature PRDs
- See `.claude/prds/` for feature-specific requirements

### Architecture Decisions
- See `docs/adr/` for architecture decision records

---

## Project Structure

```
rezipe/
├── AGENTS.md                      # Agent workflow instructions
├── README.md                      # This file
├── .claude/                       # CCPM system
│   ├── prds/                       # PRDs (source of truth)
│   ├── epics/                      # Epics and tasks
│   ├── skills/                     # Skills
│   └── learnings/                  # Learnings and reflection log
├── docs/
│   ├── adr/                      # Architecture decisions
│   └── context/
│       ├── tech-stack.md         # Technologies
│       ├── conventions.md        # Coding standards
│       └── api-contracts.md      # API specs
├── src/
│   ├── backend/                  # Supabase Edge Functions
│   └── frontend/                 # iOS app (TBD structure)
├── .beads/                       # Beads task database
└── .github/
    ├── workflows/                # CI/CD
    └── ISSUE_TEMPLATE/
```

---

## Development Workflow

### 1. Planning (Human)
1. Write PRD in `.claude/prds/` (`/pm:prd-new`)
2. Parse PRD into epic/tasks (`/pm:prd-parse` or `/pm:epic-oneshot`)
3. Sync issues (`/pm:epic-oneshot` or `/pm:issue-sync`)
4. Mirror CCPM tasks into beads

### 2. Implementation (Agent - TDD)
1. Read context (PRD, ADRs, conventions, reflection log, skills)
2. Write tests FIRST
3. Implement code
4. Validate (tests, lint, type check)
5. Reflect and learn

### 3. Review
1. Create PR with proper description
2. Code review agent checks quality
3. Address feedback
4. Merge

### 4. Completion
1. Close beads tasks: `bd close bd-[id]`
2. Close GitHub issue
3. Update learnings if mistakes made
4. Update skills if patterns discovered

---

## Tech Stack

### iOS
- **SwiftUI** (iOS 17+) with **@Observable**
- **Swift** 5.9+ with async/await
- **Nuke** for image caching
- **SwiftData** for local persistence
- **YouTube IFrame Player** (compliant)

### Backend
- **Supabase**: Postgres + Edge Functions + Auth
- **TypeScript** for Edge Functions
- **Zod** for validation
- **LLM** (GPT-4o-mini/Claude Haiku) for recipe extraction

### Development
- **Beads** for task tracking
- **GitHub Actions** for CI/CD
- **XCTest** for iOS testing
- **swift-snapshot-testing** for UI regression tests
- **Deno.test** for backend testing

---

## Key Principles

1. **YouTube Compliance**: No overlays on player, use embedded IFrame
2. **Speed-First UX**: Skeleton UI immediately, load data async
3. **Test-Driven Development**: Tests first, always
4. **Guest Mode First**: No login required for browsing
5. **Translation Default**: All recipes in English (MVP)

---

## Commands

### Beads (Task Management)
```bash
bd ready                          # Find available work
bd show bd-[id]                   # View task details
bd update bd-[id] --status in_progress
bd close bd-[id]                  # Complete task
bd sync                           # Sync with git
```

### CCPM (Planning & Sync)
```bash
/pm:prd-new <feature>             # Create PRD
/pm:prd-parse <feature>           # Create epic/tasks
/pm:epic-oneshot <feature>        # Decompose + sync to GitHub
/pm:issue-start <id>              # Start issue
/pm:issue-sync <id>               # Push updates
```

### Development
```bash
# iOS
open ChefStream.xcodeproj        # Open in Xcode
# Use Xcode or xcodebuild for tests

# Backend
cd src/backend
deno test                        # Run tests
# Use Supabase CLI for local dev (from repo root)
# supabase start
# supabase functions serve <function-name>
```

### Git
```bash
git checkout main
git pull --rebase
git switch -c feat/<feature-name>
git commit -m "feat: <summary> (bd-[id], #[issue])"
git push -u origin feat/<feature-name>
gh pr create --title "feat: <feature> (closes #[issue])" --body "PRD: .claude/prds/<feature>.md"
```

---

## Milestones

### Milestone 1: Foundation
- [ ] iOS app shell with navigation
- [ ] Home with curated categories
- [ ] Video grid UI
- [ ] Detail screen with player + skeleton

### Milestone 2: Search & Caching
- [ ] Edge Function: /search with caching
- [ ] Search UI with explicit button
- [ ] Results display

### Milestone 3: Recipe Extraction
- [ ] Edge Function: /recipe with cache + generation
- [ ] LLM integration with strict JSON schema
- [ ] Recipe storage and retrieval

### Milestone 4: Hardening
- [ ] Error states and retries
- [ ] Basic analytics
- [ ] Auth scaffolding (Apple/Google)
- [ ] TestFlight deployment

---

## Testing

### iOS
```bash
swift test                       # Unit tests
swift test --filter RecipeCard   # Snapshot tests
```

### Backend
```bash
deno test                        # All tests
deno test --filter recipe        # Specific tests
```

### Coverage Targets
- Minimum: 80%
- Critical paths: 100%
- Recipe Card: 100% snapshot coverage

---

## Contributing

1. **Read agent instructions**: `AGENTS.md`
2. **Follow conventions**: `docs/context/conventions.md`
3. **Use TDD**: Tests first, always
4. **Reference beads tasks**: Include `bd-[id]` in commits
5. **Co-author commits**: Include Warp co-author line

---

## Resources

- [Beads Documentation](https://github.com/steveyegge/beads)
- [Supabase Docs](https://supabase.com/docs)
- [SwiftUI Documentation](https://developer.apple.com/documentation/swiftui)
- [YouTube IFrame API](https://developers.google.com/youtube/iframe_api_reference)

---

## License

[TBD]

---

**Built with ❤️ using agent-driven development with TDD, Beads, and continuous learning.**
