---
skill: tdd-backend
name: TDD Backend Development
version: 1.0
description: "Test-driven development workflow for backend features (APIs, services, repositories)"
triggers:
  - "implement backend"
  - "create API"
  - "add service"
---

# TDD Backend Development

## Metadata

| name        | description |
|-------------|-------------|
| tdd-backend | Test-driven development workflow for backend features. Use when implementing APIs, services, database layers, or business logic. |

**Purpose:** Ensure backend code is thoroughly tested, maintainable, and follows TDD principles.

---

## When to Use

- Implementing new API endpoints
- Creating business logic services
- Building database repository layers
- Adding data processing functions
- Refactoring existing backend code

---

## Workflow

### 1) Read Requirements

Before writing ANY code:
- Read the PRD and acceptance criteria
- Identify all test cases from requirements
- Check `.agent/reflection-log.md` for similar past issues
- Review API contracts in `docs/context/api-contracts.md`

### 2) Write Tests FIRST

**Location:** `src/backend/tests/unit/` or co-located with implementation

Write tests in this order:
1. **Happy path** - Normal operation with valid inputs
2. **Validation** - Invalid inputs, missing fields
3. **Error handling** - Database errors, external API failures
4. **Edge cases** - Empty results, boundary conditions

**Example (Go - Table-Driven Tests):**
```go
func TestSearchRecipes(t *testing.T) {
    tests := []struct {
        name    string
        query   string
        want    []Recipe
        wantErr bool
    }{
        {
            name:  "valid search",
            query: "pasta",
            want:  []Recipe{{ID: "1", Name: "Pasta Carbonara"}},
            wantErr: false,
        },
        {
            name:    "empty query",
            query:   "",
            want:    nil,
            wantErr: true,
        },
        {
            name:    "no results",
            query:   "zzzzz",
            want:    []Recipe{},
            wantErr: false,
        },
    }
    
    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            // Arrange
            mockRepo := &MockRecipeRepository{
                recipes: []Recipe{{ID: "1", Name: "Pasta Carbonara"}},
            }
            service := NewRecipeService(mockRepo)
            
            // Act
            got, err := service.SearchRecipes(context.Background(), tt.query)
            
            // Assert
            if (err != nil) != tt.wantErr {
                t.Errorf("SearchRecipes() error = %v, wantErr %v", err, tt.wantErr)
                return
            }
            if !reflect.DeepEqual(got, tt.want) {
                t.Errorf("SearchRecipes() = %v, want %v", got, tt.want)
            }
        })
    }
}
```

**Example (Node.js/TypeScript):**
```typescript
describe('RecipeService', () => {
  let service: RecipeService;
  let mockRepo: jest.Mocked<RecipeRepository>;

  beforeEach(() => {
    mockRepo = {
      search: jest.fn(),
    } as any;
    service = new RecipeService(mockRepo);
  });

  describe('searchRecipes', () => {
    it('should return recipes for valid query', async () => {
      // Arrange
      mockRepo.search.mockResolvedValue([
        { id: '1', name: 'Pasta Carbonara' },
      ]);

      // Act
      const result = await service.searchRecipes('pasta');

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Pasta Carbonara');
      expect(mockRepo.search).toHaveBeenCalledWith('pasta');
    });

    it('should throw error for empty query', async () => {
      // Act & Assert
      await expect(service.searchRecipes('')).rejects.toThrow('Query cannot be empty');
    });

    it('should return empty array when no results', async () => {
      // Arrange
      mockRepo.search.mockResolvedValue([]);

      // Act
      const result = await service.searchRecipes('zzzzz');

      // Assert
      expect(result).toEqual([]);
    });
  });
});
```

### 3) Run Tests - Should FAIL

```bash
# Backend tests
go test ./...
# or
npm test

# Expected: Tests fail because implementation doesn't exist yet
```

**If tests pass at this stage, something is wrong!**

### 4) Implement Minimal Code

Write the simplest code that makes tests pass:
- No premature optimization
- No extra features beyond requirements
- Clear, readable code

**Structure:**
```
src/backend/
├── internal/
│   ├── domain/         # Business entities
│   │   └── recipe.go
│   ├── repository/     # Data access
│   │   └── recipe_repo.go
│   ├── service/        # Business logic
│   │   └── recipe_service.go
│   └── handler/        # HTTP handlers
│       └── recipe_handler.go
```

### 5) Run Tests - Should PASS

```bash
go test ./...
# or
npm test

# Expected: All tests pass
```

### 6) Refactor (Optional)

While keeping tests green:
- Extract duplicated code
- Improve naming
- Optimize performance (if needed)
- Add comments for complex logic

### 7) Commit

```bash
git add src/backend/tests/...
git commit -m "test: add tests for recipe search (bd-[task-id], #[issue-id])

Co-Authored-By: Warp <agent@warp.dev>"

git add src/backend/internal/...
git commit -m "feat: implement recipe search service (bd-[task-id], #[issue-id])

Co-Authored-By: Warp <agent@warp.dev>"
```

---

## Constraints / NEVER

- **NEVER** write implementation before tests
- **NEVER** skip tests for "simple" code
- **NEVER** rely on external network calls in unit tests (always mock)
- **NEVER** leave commented-out code
- **NEVER** commit without running full test suite

---

## Best Practices

### Mocking

**Always mock:**
- External APIs
- Database connections (in unit tests)
- Time-dependent functions
- File system operations

**Example (Go):**
```go
type RecipeRepository interface {
    Search(ctx context.Context, query string) ([]Recipe, error)
}

type MockRecipeRepository struct {
    SearchFunc func(ctx context.Context, query string) ([]Recipe, error)
}

func (m *MockRecipeRepository) Search(ctx context.Context, query string) ([]Recipe, error) {
    return m.SearchFunc(ctx, query)
}
```

### Test Organization

Use the **Arrange-Act-Assert** pattern:
```go
// Arrange - Set up test data and mocks
mockRepo := &MockRecipeRepository{...}
service := NewRecipeService(mockRepo)

// Act - Execute the function being tested
result, err := service.SearchRecipes(ctx, "pasta")

// Assert - Verify the results
if err != nil {
    t.Errorf("unexpected error: %v", err)
}
```

### Coverage Goals

- **Minimum:** 80% code coverage
- **Target:** 90%+ for critical business logic
- Check coverage: `go test -cover ./...` or `npm run test:coverage`

---

## Integration Tests

After unit tests pass, add integration tests:

**Location:** `src/backend/tests/integration/`

**What to test:**
- Database operations with test database
- API endpoints end-to-end
- Multiple services working together

**Example:**
```go
func TestRecipeAPI_Integration(t *testing.T) {
    // Skip in short mode
    if testing.Short() {
        t.Skip("skipping integration test")
    }
    
    // Setup test database
    db := setupTestDB(t)
    defer db.Close()
    
    // Create server
    server := NewServer(db)
    
    // Test API endpoint
    req := httptest.NewRequest("GET", "/api/recipes?q=pasta", nil)
    w := httptest.NewRecorder()
    server.ServeHTTP(w, req)
    
    // Assert
    assert.Equal(t, http.StatusOK, w.Code)
    // ... more assertions
}
```

---

## Gotchas

- **Mock external APIs** - Don't hit real APIs in tests. Use mocks or test servers.
- **Test error paths** - Don't just test happy paths. Test failures too.
- **Async operations** - Use proper context handling and timeouts.
- **Database tests** - Use test database or in-memory DB, never production.
- **Cleanup** - Always clean up test data in `defer` or `afterEach`.
- **Race conditions** - Run `go test -race` to detect data races.

---

## Checklist

Before closing the task:
- [ ] All acceptance criteria have tests
- [ ] Tests cover happy path, validation, errors, edge cases
- [ ] All tests pass
- [ ] No external network calls in unit tests
- [ ] Code follows project conventions
- [ ] Integration tests added (if applicable)
- [ ] Test coverage meets minimum threshold (80%)
- [ ] Commits follow conventional commit format

---

## Related Skills

- `api-design` - For designing REST APIs
- `code-review` - For reviewing backend code
- `debugging` - For fixing test failures
- `performance` - For optimizing slow code

---

## Version History

| Version | Date       | Changes                    |
|---------|------------|----------------------------|
| 1.0     | 2026-01-13 | Initial TDD backend skill  |

---

*End of skill definition.*
