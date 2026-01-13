# Coding Conventions - ChefStream (Rezipe)

**Last Updated**: 2026-01-13

This document defines coding standards and best practices for the ChefStream project. All agents and developers MUST follow these conventions.

---

## General Principles

1. **Clarity over cleverness** - Write code that is easy to understand
2. **Consistency** - Follow established patterns in the codebase
3. **Test-first** - Write tests before implementation (TDD)
4. **Document decisions** - Use ADRs for architectural choices
5. **Fail gracefully** - Handle errors, show user-friendly messages

---

## iOS (Swift) Conventions

### Naming

#### Types
```swift
// ✅ PascalCase for types
struct Video { }
class RecipeService { }
enum RecipeState { }
protocol YouTubeServiceProtocol { }
```

#### Variables & Functions
```swift
// ✅ camelCase for variables and functions
let videoId = "abc123"
func fetchRecipe(for videoId: String) async throws -> Recipe { }

// ❌ Avoid
let video_id = "abc123"  // snake_case
let VideoId = "abc123"   // PascalCase
```

#### Constants
```swift
// ✅ Namespaced constants
enum Constants {
    static let maxCacheSize = 100
    static let apiTimeout: TimeInterval = 30
}

// ✅ Or grouped by feature
enum Recipe {
    enum Cache {
        static let expirationDays = 7
    }
}
```

### File Organization

```swift
// MARK: - Lifecycle
override func viewDidLoad() { }

// MARK: - Public Methods
func fetchRecipe() { }

// MARK: - Private Methods
private func updateUI() { }

// MARK: - Actions
@objc private func didTapButton() { }
```

### SwiftUI Views & State Management

#### Modern Approach (iOS 17+): Use @Observable

```swift
import Observation

// ✅ Use @Observable macro (iOS 17+) - PREFERRED
@Observable
class RecipeDetailViewModel {
    var recipe: Recipe?
    var isLoading = false
    var errorMessage: String?
    
    func loadRecipe() async {
        // No @Published needed!
        isLoading = true
        // ... fetch recipe
        isLoading = false
    }
}

struct RecipeDetailView: View {
    // MARK: - Properties
    // ✅ Simple property, no @StateObject wrapper!
    let viewModel: RecipeDetailViewModel
    @State private var showError = false
    
    // MARK: - Initializer
    init(videoId: String) {
        self.viewModel = RecipeDetailViewModel(videoId: videoId)
    }
    
    // MARK: - Body
    var body: some View {
        content
            .task { await viewModel.loadRecipe() }
    }
    
    // MARK: - Subviews
    private var content: some View {
        VStack {
            if viewModel.isLoading {
                SkeletonView()
            } else if let recipe = viewModel.recipe {
                RecipeCardView(recipe: recipe)
            }
        }
    }
}
```

**Benefits of @Observable:**
- No `@Published` wrappers needed
- No `@StateObject` or `@ObservedObject` wrappers in views
- Simpler, cleaner code
- Better performance (fine-grained observation)
- Less boilerplate

#### Legacy Approach (Pre-iOS 17): ObservableObject

```swift
// ⚠️ Only use if supporting iOS 16 or below
class RecipeDetailViewModel: ObservableObject {
    @Published var recipe: Recipe?
    @Published var isLoading = false
}

struct RecipeDetailView: View {
    @StateObject private var viewModel: RecipeDetailViewModel
}
```

### Async/Await

```swift
// ✅ Use async/await
func fetchRecipe() async throws -> Recipe {
    let data = try await api.get("/recipe")
    return try decode(data)
}

// ✅ Handle on MainActor when updating UI
@MainActor
func updateUI(with recipe: Recipe) {
    self.recipe = recipe
    self.isLoading = false
}

// ❌ Avoid completion handlers for new code
func fetchRecipe(completion: @escaping (Result<Recipe, Error>) -> Void) { }
```

### Error Handling

```swift
// ✅ Use typed errors
enum RecipeError: LocalizedError {
    case notFound
    case extractionFailed
    case networkError(Error)
    
    var errorDescription: String? {
        switch self {
        case .notFound:
            return "Recipe not found for this video."
        case .extractionFailed:
            return "Could not extract recipe. Please try again."
        case .networkError:
            return "Network error. Please check your connection."
        }
    }
}

// ✅ Handle gracefully
do {
    let recipe = try await service.fetchRecipe(videoId: id)
    self.state = .loaded(recipe)
} catch {
    self.state = .error(error.localizedDescription)
}
```

### Testing

#### Unit Tests

```swift
// ✅ Arrange-Act-Assert pattern
func testFetchRecipe_Success() async throws {
    // Arrange
    let service = RecipeService(api: MockAPI())
    
    // Act
    let recipe = try await service.fetchRecipe(videoId: "test123")
    
    // Assert
    XCTAssertEqual(recipe.title, "Expected Title")
    XCTAssertTrue(recipe.ingredients.count > 0)
}

// ✅ Use protocols for testability
protocol APIProtocol {
    func get(_ path: String) async throws -> Data
}

class RecipeService {
    private let api: APIProtocol
    init(api: APIProtocol) { self.api = api }
}
```

#### Snapshot Testing (REQUIRED for Recipe Card)

```swift
// ✅ Use swift-snapshot-testing for UI states
import SnapshotTesting
import XCTest

class RecipeCardSnapshotTests: XCTestCase {
    
    func testRecipeCard_skeleton() {
        let view = RecipeCardView(state: .skeleton)
        assertSnapshot(matching: view, as: .image)
    }
    
    func testRecipeCard_loaded() {
        let recipe = Recipe.mock
        let view = RecipeCardView(state: .loaded(recipe))
        assertSnapshot(matching: view, as: .image)
    }
    
    func testRecipeCard_error() {
        let view = RecipeCardView(state: .error("No recipe available"))
        assertSnapshot(matching: view, as: .image)
    }
    
    func testRecipeCard_notRecipe() {
        let view = RecipeCardView(state: .notRecipe)
        assertSnapshot(matching: view, as: .image)
    }
    
    func testRecipeCard_darkMode() {
        let recipe = Recipe.mock
        let view = RecipeCardView(state: .loaded(recipe))
            .preferredColorScheme(.dark)
        assertSnapshot(matching: view, as: .image)
    }
}
```

**Why snapshot testing for Recipe Card:**
- Multiple visual states (skeleton, loaded, error, notRecipe)
- "Liquid Glass" design requires pixel-perfect consistency
- Prevents accidental UI regressions during refactoring
- Fast visual regression detection
- Catches unintended changes to spacing, colors, fonts

**Setup:**
```swift
// Package.swift dependencies
.package(url: "https://github.com/pointfreeco/swift-snapshot-testing.git", from: "1.15.0")
```

**Recording snapshots:**
```bash
# First run records snapshots
# Subsequent runs compare against recorded snapshots
# To update snapshots: delete old ones and re-run tests
```

---

## Backend (TypeScript) Conventions

### Naming

```typescript
// ✅ camelCase for variables and functions
const videoId = "abc123";
function fetchRecipe(videoId: string): Promise<Recipe> { }

// ✅ PascalCase for types/interfaces
interface Recipe { }
type RecipeState = "ready" | "generating" | "failed";

// ✅ UPPER_SNAKE_CASE for constants
const MAX_CACHE_SIZE = 100;
const API_TIMEOUT_MS = 30000;
```

### File Organization

```typescript
// services/recipeService.ts

// Imports
import { supabase } from './supabase';
import { extractRecipe } from './llm';

// Types
export interface RecipeOptions {
  videoId: string;
  locale: string;
}

// Constants
const CACHE_TTL_HOURS = 24;

// Main exports
export async function getRecipe(options: RecipeOptions): Promise<Recipe> {
  // Implementation
}

// Private helpers
async function checkCache(videoId: string): Promise<Recipe | null> {
  // Implementation
}
```

### Async/Await

```typescript
// ✅ Use async/await
async function fetchRecipe(videoId: string): Promise<Recipe> {
  const cached = await checkCache(videoId);
  if (cached) return cached;
  
  const recipe = await extractRecipe(videoId);
  await cacheRecipe(videoId, recipe);
  return recipe;
}

// ❌ Avoid callback hell
function fetchRecipe(videoId: string, callback: (err, recipe) => void) { }
```

### Error Handling

```typescript
// ✅ Use custom error classes
export class RecipeNotFoundError extends Error {
  constructor(videoId: string) {
    super(`Recipe not found for video: ${videoId}`);
    this.name = "RecipeNotFoundError";
  }
}

// ✅ Handle errors gracefully
try {
  const recipe = await getRecipe({ videoId, locale });
  return new Response(JSON.stringify(recipe), { status: 200 });
} catch (error) {
  if (error instanceof RecipeNotFoundError) {
    return new Response(JSON.stringify({ error: error.message }), { status: 404 });
  }
  return new Response(JSON.stringify({ error: "Internal error" }), { status: 500 });
}
```

### Type Safety

#### Supabase Automatic Type Generation (REQUIRED)

```bash
# ✅ Generate types from your Supabase database schema
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > types/supabase.ts

# ✅ Add to package.json scripts:
# "types:generate": "supabase gen types typescript --project-id $SUPABASE_PROJECT_ID > types/supabase.ts"
# "types:watch": "nodemon --watch supabase/migrations -e sql --exec npm run types:generate"
```

```typescript
// ✅ Import generated types
import { Database } from './types/supabase';

// ✅ Extract table types
type Recipe = Database['public']['Tables']['recipes']['Row'];
type RecipeInsert = Database['public']['Tables']['recipes']['Insert'];
type RecipeUpdate = Database['public']['Tables']['recipes']['Update'];

// ✅ Use with Supabase client for full type safety
const { data, error } = await supabase
  .from('recipes')
  .select('*')
  .eq('video_id', videoId)
  .single();
// data is automatically typed as Recipe | null!

// ✅ Type-safe inserts
const newRecipe: RecipeInsert = {
  video_id: "abc123",
  status: "ready",
  recipe_json: recipeData,
  // TypeScript enforces all required fields!
};
```

**Benefits:**
- Database schema changes automatically reflected in types
- Catch typos and schema mismatches at compile time
- Auto-complete for columns and relationships
- No manual type definitions to maintain

**Workflow:**
1. Make schema change in Supabase or migration
2. Run `npm run types:generate`
3. TypeScript errors show you what to update
4. Commit both migration and generated types

#### Manual Types & Runtime Validation

```typescript
// ✅ Use strict types for non-database data
interface RecipeJSON {
  title: string;
  language: string;
  ingredients: Ingredient[];
  steps: Step[];
}

// ✅ Use Zod for runtime validation of external data (LLM output, API responses)
import { z } from 'zod';

const IngredientSchema = z.object({
  item: z.string(),
  quantity: z.string().nullable(),
  unit: z.string().nullable(),
  notes: z.string().nullable(),
});

const RecipeJSONSchema = z.object({
  title: z.string(),
  language: z.string(),
  ingredients: z.array(IngredientSchema),
  steps: z.array(z.object({
    order: z.number(),
    text: z.string(),
  })),
  flags: z.object({
    is_recipe: z.boolean(),
    is_estimated: z.boolean().optional(),
  }),
});

// Validate LLM output before storing
try {
  const recipeJson = RecipeJSONSchema.parse(llmResponse);
  // Type-safe and validated!
} catch (error) {
  // Handle validation errors
  console.error("Invalid recipe JSON from LLM:", error);
}
```

### Testing

```typescript
// ✅ Deno.test for backend
Deno.test("fetchRecipe returns cached recipe", async () => {
  // Arrange
  const mockDb = createMockDb();
  const service = new RecipeService(mockDb);
  
  // Act
  const recipe = await service.fetchRecipe("test123");
  
  // Assert
  assertEquals(recipe.title, "Expected Title");
});

// ✅ Use MSW for API mocking
import { rest } from 'msw';
import { setupServer } from 'msw/node';

const server = setupServer(
  rest.get('/api/recipe', (req, res, ctx) => {
    return res(ctx.json({ title: "Test Recipe" }));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

---

## Database Conventions

### Table Naming
```sql
-- ✅ Plural, snake_case
CREATE TABLE videos ();
CREATE TABLE recipe_sources ();

-- ❌ Avoid
CREATE TABLE Video ();  -- PascalCase
CREATE TABLE recipeSources ();  -- camelCase
```

### Column Naming
```sql
-- ✅ snake_case
CREATE TABLE recipes (
  video_id TEXT PRIMARY KEY,
  recipe_version INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Indexes
```sql
-- ✅ Descriptive names
CREATE INDEX idx_videos_source ON videos(source);
CREATE INDEX idx_recipes_status ON recipes(status) WHERE status != 'ready';
```

### Row Level Security (RLS)
```sql
-- ✅ Enable RLS on all tables
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

-- ✅ Create policies
CREATE POLICY "Videos are viewable by everyone"
  ON videos FOR SELECT
  USING (true);

CREATE POLICY "Users can only update their own favorites"
  ON user_favorites FOR UPDATE
  USING (auth.uid() = user_id);
```

---

## Git Conventions

### Branch Naming
```
feature/bd-[task-id]-short-description
fix/bd-[task-id]-bug-description
docs/update-readme
chore/setup-ci
```

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description> (bd-[task-id], #[issue-id])

[optional body]

Co-Authored-By: Warp <agent@warp.dev>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `test`: Add/update tests
- `refactor`: Code refactoring
- `docs`: Documentation
- `chore`: Build/tooling
- `perf`: Performance improvement

**Examples:**
```
feat(ios): add recipe detail skeleton view (bd-a1b2, #123)

test(backend): add unit tests for recipe extraction (bd-c3d4, #123)

fix(ios): prevent player overlay on iOS 17 (bd-e5f6, #124)

Co-Authored-By: Warp <agent@warp.dev>
```

---

## Documentation

### Code Comments

```swift
// ✅ Explain "why", not "what"
// Cache for 24h to avoid hitting YouTube quota
let cacheDuration = 24 * 60 * 60

// ❌ Don't state the obvious
// Set cache duration to 86400
let cacheDuration = 86400
```

### Function Documentation

```swift
/// Fetches a recipe for the given video ID.
///
/// - Parameter videoId: The YouTube video ID
/// - Returns: A `Recipe` if extraction succeeded
/// - Throws: `RecipeError.notFound` if no recipe exists
///          `RecipeError.extractionFailed` if extraction failed
func fetchRecipe(videoId: String) async throws -> Recipe {
  // Implementation
}
```

---

## Performance

### iOS
- **Lazy loading**: Load images lazily with Nuke
- **Main thread**: Keep UI updates on `@MainActor`
- **Caching**: Cache recipes locally with SwiftData
- **Skeleton UI**: Show skeleton immediately, load data async
- **@Observable**: Use iOS 17 Observation for better performance

### Backend
- **Database indexing**: Index frequently queried columns
- **Caching**: Cache search results (24h), recipes (indefinite)
- **Connection pooling**: Use Supabase connection pooling
- **Lazy loading**: Don't fetch unnecessary data
- **Type generation**: Use Supabase types for compile-time safety

---

## Security

### iOS
- **No hardcoded secrets**: Use Xcode configuration or environment
- **Keychain**: Store sensitive data in Keychain
- **HTTPS only**: All network calls over HTTPS
- **Input validation**: Validate all user input

### Backend
- **RLS enabled**: Always enable Row Level Security
- **Environment variables**: All secrets in environment
- **Input validation**: Validate with Zod before processing
- **Rate limiting**: Implement rate limiting on Edge Functions
- **SQL injection**: Use parameterized queries (Supabase client handles this)
- **Type safety**: Use generated Supabase types to prevent errors

---

## Testing Requirements

### Coverage Targets
- **Minimum**: 80% code coverage
- **Critical paths**: 100% coverage (auth, payment, data integrity)
- **Recipe Card**: 100% snapshot coverage (all states)

### Test Types
- **Unit**: Test individual functions/classes
- **Integration**: Test services working together
- **Snapshot**: Test UI visual states (especially Recipe Card)
- **UI/E2E**: Test user flows

### Test Naming
```swift
// ✅ test_method_scenario_expectedResult
func test_fetchRecipe_validId_returnsRecipe() { }
func test_fetchRecipe_invalidId_throwsError() { }

// ✅ Snapshot tests
func testRecipeCard_skeleton() { }
func testRecipeCard_loaded() { }
```

---

## Development Workflow

### Type Generation
```bash
# After database schema changes
npm run types:generate

# Watch for changes (optional)
npm run types:watch
```

### Snapshot Testing
```bash
# Run tests to record snapshots (first time)
swift test

# Run tests to verify snapshots
swift test

# Update snapshots after intentional UI changes
rm -rf __Snapshots__  # Delete old snapshots
swift test            # Record new ones
```

---

## References

- [Swift API Design Guidelines](https://www.swift.org/documentation/api-design-guidelines/)
- [Swift Observation Framework](https://developer.apple.com/documentation/observation)
- [TypeScript Style Guide](https://google.github.io/styleguide/tsguide.html)
- [Supabase Type Generation](https://supabase.com/docs/guides/api/generating-types)
- [swift-snapshot-testing](https://github.com/pointfreeco/swift-snapshot-testing)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Tech Stack](./tech-stack.md)

---

*These conventions are mandatory. Deviations require team discussion and ADR.*
