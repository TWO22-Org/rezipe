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
   cat .agent/AGENTS.md
   cat AGENTS.md  # Beads quick reference
   ```

2. **Check ready tasks:**
   ```bash
   bd ready
   ```

3. **Before starting work:**
   - Read relevant PRD: `docs/prd/`
   - Check conventions: `docs/context/conventions.md`
   - Review tech stack: `docs/context/tech-stack.md`
   - Check past mistakes: `.agent/reflection-log.md`

### For Humans

1. **Clone and setup:**
   ```bash
   git clone <repo-url>
   cd rezipe
   ```

2. **Install dependencies:**
   - iOS: Xcode 15+
   - Backend: Node.js 18+, Deno (via Supabase)

3. **Initialize beads:**
   ```bash
   bd onboard
   ```

---

## Documentation

### Core Documents
- **[Global PRD](docs/prd/global-prd.md)** - Product vision and requirements
- **[Tech Stack](docs/context/tech-stack.md)** - Technologies used
- **[Conventions](docs/context/conventions.md)** - Coding standards
- **[Agent Instructions](.agent/AGENTS.md)** - Workflow for AI agents

### Agent System
- **[Skills](.agent/skills/README.md)** - Reusable workflow patterns
- **[Reflection Log](.agent/reflection-log.md)** - Learning from mistakes
- **[Commands](.agent/commands.md)** - Common command reference

### Feature PRDs
- See `docs/prd/features/` for feature-specific requirements

### Architecture Decisions
- See `docs/adr/` for architecture decision records

---

## Project Structure

```
rezipe/
├── AGENTS.md                      # Beads quick reference
├── README.md                      # This file
├── docs/
│   ├── prd/
│   │   ├── global-prd.md         # Product vision
│   │   └── features/             # Feature PRDs
│   ├── adr/                      # Architecture decisions
│   └── context/
│       ├── tech-stack.md         # Technologies
│       ├── conventions.md        # Coding standards
│       └── api-contracts.md      # API specs
├── src/
│   ├── backend/                  # Supabase Edge Functions
│   └── frontend/                 # iOS app (TBD structure)
├── .agent/
│   ├── AGENTS.md                 # Comprehensive agent workflow
│   ├── skills/                   # Reusable patterns
│   ├── reflection-log.md         # Learning log
│   └── commands.md               # Command reference
├── .beads/                       # Beads task database
└── .github/
    ├── workflows/                # CI/CD
    └── ISSUE_TEMPLATE/
```

---

## Development Workflow

### 1. Planning (Human)
1. Write PRD in `docs/prd/features/`
2. Create GitHub issue linking to PRD
3. Agent breaks down into beads tasks

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
3. Update reflection log if mistakes made
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

### Development
```bash
# iOS
open ChefStream.xcodeproj        # Open in Xcode
swift test                       # Run tests

# Backend
cd src/backend
npm run dev                      # Local development
npm test                         # Run tests
npm run types:generate           # Generate Supabase types
```

### Git
```bash
git checkout -b feature/bd-[id]-description
git commit -m "feat: description (bd-[id], #[issue])\n\nCo-Authored-By: Warp <agent@warp.dev>"
git push origin feature/bd-[id]-description
gh pr create
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

1. **Read agent instructions**: `.agent/AGENTS.md`
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
