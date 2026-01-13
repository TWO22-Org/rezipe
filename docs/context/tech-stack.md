# Tech Stack - ChefStream (Rezipe)

**Last Updated**: 2026-01-13  
**Status**: Mandated per Global PRD

This document describes the technologies used in the ChefStream (rezipe) project, as defined in the [Global PRD](../prd/global-prd.md).

---

## Platform

### iOS
- **Target**: iOS 17+
- **Framework**: SwiftUI
- **Language**: Swift (with async/await concurrency)
- **Why**: Native iOS experience, modern declarative UI, performance

---

## Frontend (iOS)

### UI Framework
- **SwiftUI**: iOS 17+
- **Architecture**: MVVM with explicit async state management
- **Why**: Modern, declarative, native performance

### Image Loading & Caching
- **Nuke** (or equivalent fast caching library)
- **Why**: Fast image loading with built-in memory/disk caching for video thumbnails

### YouTube Player
- **IFrame-based wrapper library** (compliant)
- **Constraint**: MUST use YouTube embedded playback, NO overlays on player
- **Why**: YouTube API compliance, no TOS violations

### Local Persistence
- **SwiftData** (or Core Data)
- **Purpose**: Lightweight offline caching of recipes
- **Why**: Fast cached recipe retrieval, offline viewing

### Navigation
- **SwiftUI NavigationStack**
- **Pattern**: Coordinator pattern (optional) or direct navigation

---

## Backend

### Platform
- **Supabase** (all-in-one backend)
- **Why**: Managed Postgres, edge functions, auth, real-time, RLS built-in

### Database
- **PostgreSQL** (via Supabase)
- **Version**: Latest Supabase-managed version
- **Why**: Relational model for recipes/videos, JSONB for flexible schema, mature ecosystem

### API Layer
- **Supabase Edge Functions**
- **Language**: TypeScript
- **Runtime**: Deno
- **Why**: Serverless, TypeScript, close to data, fast cold starts

### Authentication
- **Supabase Auth**
- **Providers**: 
  - Sign in with Apple (MVP required)
  - Google Sign-In (MVP required)
  - Email/password (post-MVP)
- **Why**: Native OAuth flows, JWT tokens, Row Level Security integration

### Security
- **Row Level Security (RLS)** policies in Postgres
- **Why**: Database-level security, prevents unauthorized access

---

## AI / Recipe Extraction

### Model
- **Fast/cheap LLM tier** (e.g., GPT-4o-mini, Claude Haiku, Gemini Flash)
- **Must support**:
  - JSON mode or structured output constraints
  - Translation (output in English)
  - Classification ("not a recipe" detection)
- **Why**: Cost-effective, fast extraction, translation built-in

### Extraction Strategy
- **Inputs**:
  - Video description (always)
  - Transcript/captions (when available)
- **Output**: Strict versioned JSON schema
- **Translation**: Always translate to target language (English in MVP)

---

## External Services

### YouTube Data API v3
- **Usage**:
  - Search with guardrails (recipe-biased)
  - Video metadata (title, thumbnail, channel)
  - Captions/transcript when available
- **Quota management**: 24h search caching
- **Why**: Only source of YouTube video metadata

### YouTube IFrame Player API
- **Usage**: Embedded video playback
- **Compliance**: No overlays, no downloading
- **Why**: YouTube TOS compliant playback

---

## Data Model

### Core Tables

#### `videos`
- **video_id** (PK, text)
- **title** (text)
- **channel_title** (text)
- **thumbnail_url** (text)
- **source** (enum: curated | search | user)
- **tags** (JSONB or text[])
- **language_hint** (text, nullable)
- **created_at**, **updated_at** (timestamptz)

#### `recipes`
- **video_id** (PK, FK → videos.video_id)
- **status** (enum: ready | generating | failed | not_recipe)
- **recipe_version** (int)
- **recipe_json** (JSONB) - versioned schema
- **confidence** (float, nullable)
- **source_hash** (text) - hash of inputs for re-extraction detection
- **created_at**, **updated_at** (timestamptz)

#### `recipe_sources`
- **id** (PK, uuid)
- **video_id** (FK)
- **source_type** (enum: description | transcript | chapters)
- **payload** (text)
- **created_at** (timestamptz)

#### `search_cache`
- **query_key** (PK, text) - normalized query + locale
- **results_json** (JSONB)
- **expires_at** (timestamptz)

### Future Tables (Post-MVP)
- `user_favorites`
- `collections`
- `user_submissions`
- `moderation_queue`

---

## API Design

### Edge Functions (Supabase)

#### `GET /search`
**Purpose**: Return recipe-biased YouTube results (cached)
- **Params**: `q` (query), `locale`, `pageToken?`
- **Caching**: 24h by query_key
- **Guardrails**: Recipe bias, category filter, SafeSearch strict

#### `GET /recipe`
**Purpose**: Return cached recipe or generate synchronously
- **Params**: `videoId`, `locale`
- **States**: ready | generating | failed | not_recipe
- **Generation**: Fetch description + transcript → LLM → store → return

#### `POST /extract` (Optional)
**Purpose**: Force re-extraction (admin tools)

---

## Development Tools

### Version Control
- **Git**: GitHub
- **Branching Strategy**: Feature branches from `main`
- **Task Management**: 
  - Beads (agent task tracking)
  - GitHub Issues (human-facing)

### iOS Development
- **IDE**: Xcode 15+
- **Swift**: 5.9+
- **Package Manager**: Swift Package Manager (SPM)

### Backend Development
- **Runtime**: Deno (via Supabase Edge Functions)
- **Language**: TypeScript 5.x
- **Package Manager**: npm/pnpm

### Code Quality
- **iOS Linting**: SwiftLint
- **iOS Formatting**: swift-format
- **Backend Linting**: ESLint
- **Backend Formatting**: Prettier

### Testing

#### iOS
- **Unit Tests**: XCTest
- **UI Tests**: XCTest UI
- **Mocking**: Manual mocks or protocol-based testing

#### Backend
- **Unit Tests**: Deno.test
- **Integration Tests**: Supertest (or Deno equivalent)
- **Mocking**: MSW or manual mocks

---

## Infrastructure

### Hosting
- **iOS**: App Store (TestFlight for beta)
- **Backend**: Supabase (managed)
- **Database**: Supabase Postgres (managed)

### CI/CD
- **Platform**: GitHub Actions
- **iOS Workflows**:
  - Build & test on PR
  - TestFlight deployment on release
- **Backend Workflows**:
  - Edge function deployment
  - Database migration checks

### Monitoring
- **Backend**: Supabase logs & metrics
- **iOS**: Xcode Instruments, Console logs
- **Error Tracking**: TBD (Sentry or similar post-MVP)
- **Analytics**: TBD (basic event hooks in MVP)

---

## Recipe JSON Schema

### Version 1 (recipe_json_v1)

**Full recipe:**
```json
{
  "title": "string",
  "language": "en",
  "ingredients": [
    {
      "item": "string",
      "quantity": "string|null",
      "unit": "string|null",
      "notes": "string|null"
    }
  ],
  "steps": [
    { "order": 1, "text": "string" }
  ],
  "nutrition": {
    "calories": "number|null",
    "protein": "string|null",
    "note": "string|null"
  },
  "meta": {
    "servings": "string|null",
    "prep_time": "string|null",
    "cook_time": "string|null",
    "total_time": "string|null",
    "source": ["description", "transcript"]
  },
  "flags": {
    "is_recipe": true,
    "is_estimated": false
  }
}
```

**Not a recipe:**
```json
{
  "flags": { "is_recipe": false },
  "reason": "string"
}
```

---

## iOS Architecture

### Structure
```
ChefStream/
├── App/
│   └── ChefStreamApp.swift
├── Views/
│   ├── HomeView.swift (curated categories)
│   ├── SearchView.swift (explicit search)
│   ├── VideoGridView.swift (reusable)
│   └── RecipeDetailView.swift (player + recipe)
├── ViewModels/
│   ├── HomeViewModel.swift
│   ├── SearchViewModel.swift
│   └── RecipeDetailViewModel.swift
├── Services/
│   ├── YouTubeService.swift (search)
│   ├── RecipeService.swift (fetch/extract)
│   └── AuthService.swift (future)
├── Models/
│   ├── Video.swift
│   ├── Recipe.swift
│   └── RecipeState.swift
└── Utils/
    ├── ImageCache.swift
    └── Extensions/
```

### State Management
- **RecipeDetailState**: `.loadingSkeleton`, `.loaded(recipe)`, `.notRecipe`, `.error`
- **Pattern**: MVVM with `@Published` properties
- **Async**: async/await with `Task` and `MainActor`

---

## Performance Requirements

### iOS
- **Cold start**: Standard iOS app launch time
- **Detail screen**: Player placeholder + skeleton within ~100ms
- **Cached recipe**: Sub-second end-to-end (fetch + render)
- **Extraction**: Few seconds allowed, must not block UI

### Backend
- **Search (cached)**: < 200ms
- **Recipe (cached)**: < 500ms
- **Recipe (generate)**: 2-5 seconds acceptable (async from UI perspective)

---

## Compliance & Constraints

### YouTube TOS
- ✅ Use YouTube embedded IFrame player
- ❌ NO overlays on player
- ❌ NO downloading videos
- ❌ NO presenting extracted content as official YouTube metadata
- ✅ Clear labeling when content is inferred/estimated

### Privacy
- **Guest mode first**: No login required for browsing
- **Auth only for**: Saving, favorites, collections (post-MVP)
- **Data collection**: Minimal, no PII unless authenticated

---

## Cost & Quota Strategy

1. **Search caching** (24h) to reduce YouTube API calls
2. **Curated home** to push already-extracted recipes
3. **Recipe caching** (by video_id + version) so extraction runs once
4. **Graceful fallback** when YouTube or LLM fails
5. **Cheap LLM tier** for cost-effective extraction

---

## Dependencies

### iOS Dependencies (SPM)
```swift
dependencies: [
  .package(url: "https://github.com/kean/Nuke.git", from: "12.0.0"),
  // YouTube player wrapper (TBD)
  // Supabase Swift SDK (if available)
]
```

### Backend Dependencies (package.json)
```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.x.x",
    "openai": "^4.x.x", // or anthropic, google-ai
    "zod": "^3.x.x" // for schema validation
  }
}
```

---

## Decision Log

| Technology | Decided On | Rationale | ADR |
|------------|------------|-----------|-----|
| SwiftUI | 2026-01-13 | Modern iOS UI, declarative, async/await native | TBD |
| Supabase | 2026-01-13 | All-in-one backend, managed Postgres, auth, RLS | TBD |
| TypeScript Edge Functions | 2026-01-13 | Serverless, fast, close to data | TBD |
| Nuke | 2026-01-13 | Fast image caching for thumbnails | TBD |
| YouTube IFrame Player | 2026-01-13 | TOS compliance, no overlay allowed | TBD |

---

## References

- [Global PRD](../prd/global-prd.md)
- [API Contracts](./api-contracts.md)
- [Conventions](./conventions.md)
- [Architecture Diagrams](./architecture/) (TBD)

---

## Version Requirements

### iOS
- **iOS**: 17.0+
- **Xcode**: 15.0+
- **Swift**: 5.9+

### Backend
- **Deno**: Latest (via Supabase)
- **TypeScript**: 5.x
- **Node.js**: 18+ (for local development)

---

*This tech stack is mandated by the Global PRD. Changes require ADR and PRD update.*
