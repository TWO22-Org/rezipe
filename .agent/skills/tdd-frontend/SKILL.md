---
skill: tdd-frontend
name: TDD Frontend Development
version: 1.0
description: "Test-driven development workflow for frontend components and features"
triggers:
  - "implement component"
  - "create UI"
  - "add frontend"
---

# TDD Frontend Development

## Metadata

| name         | description |
|--------------|-------------|
| tdd-frontend | Test-driven development workflow for frontend components. Use when implementing React/Vue/Angular components, hooks, or UI features. |

**Purpose:** Ensure frontend code is thoroughly tested, accessible, and follows TDD principles.

---

## When to Use

- Creating new React/Vue/Angular components
- Implementing custom hooks
- Building forms and input handling
- Adding UI interactions
- Refactoring existing frontend code

---

## Workflow

### 1) Read Requirements

- Read PRD and acceptance criteria focusing on user interactions
- Identify user flows and expected behaviors
- Check accessibility requirements
- Review design specs or mockups

### 2) Write Tests FIRST

**Location:** Co-located with component (e.g., `Button/Button.test.tsx`)

**Testing Library Principles:**
- Test behavior, not implementation
- Query by accessibility (role, label, text)
- Avoid testing CSS/styling

**Example (React + Testing Library):**
```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchBar } from './SearchBar';

describe('SearchBar', () => {
  it('renders search input with placeholder', () => {
    render(<SearchBar onSearch={jest.fn()} />);
    
    expect(screen.getByPlaceholderText('Search recipes...')).toBeInTheDocument();
  });

  it('calls onSearch when user submits', async () => {
    const user = userEvent.setup();
    const mockOnSearch = jest.fn();
    render(<SearchBar onSearch={mockOnSearch} />);
    
    const input = screen.getByRole('searchbox');
    await user.type(input, 'pasta');
    await user.keyboard('{Enter}');
    
    expect(mockOnSearch).toHaveBeenCalledWith('pasta');
  });

  it('shows error message when search fails', async () => {
    const mockOnSearch = jest.fn().mockRejectedValue(new Error('API error'));
    render(<SearchBar onSearch={mockOnSearch} />);
    
    const input = screen.getByRole('searchbox');
    await userEvent.type(input, 'pasta');
    await userEvent.keyboard('{Enter}');
    
    expect(await screen.findByRole('alert')).toHaveTextContent('Search failed');
  });

  it('disables submit during search', async () => {
    const mockOnSearch = jest.fn(() => new Promise(resolve => setTimeout(resolve, 100)));
    render(<SearchBar onSearch={mockOnSearch} />);
    
    const button = screen.getByRole('button', { name: /search/i });
    await userEvent.click(button);
    
    expect(button).toBeDisabled();
    
    await waitFor(() => {
      expect(button).not.toBeDisabled();
    });
  });
});
```

### 3) Run Tests - Should FAIL

```bash
npm test SearchBar.test.tsx

# Expected: Tests fail because component doesn't exist yet
```

### 4) Implement Minimal Component

```typescript
import { useState } from 'react';

interface SearchBarProps {
  onSearch: (query: string) => Promise<void>;
}

export function SearchBar({ onSearch }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      await onSearch(query);
    } catch (err) {
      setError('Search failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="search"
        role="searchbox"
        placeholder="Search recipes..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <button type="submit" disabled={isLoading}>
        Search
      </button>
      {error && <div role="alert">{error}</div>}
    </form>
  );
}
```

### 5) Run Tests - Should PASS

```bash
npm test SearchBar.test.tsx

# Expected: All tests pass
```

### 6) Refactor & Style

Add CSS/styling while keeping tests green:
```tsx
// SearchBar.module.css
.container { /* styles */ }
.input { /* styles */ }
.button { /* styles */ }
.error { /* styles */ }
```

### 7) Commit

```bash
git add src/components/SearchBar/
git commit -m "test: add SearchBar component tests (bd-[id], #[issue])

Co-Authored-By: Warp <agent@warp.dev>"

git add src/components/SearchBar/SearchBar.tsx
git commit -m "feat: implement SearchBar component (bd-[id], #[issue])

Co-Authored-By: Warp <agent@warp.dev>"
```

---

## Constraints / NEVER

- **NEVER** write component before tests
- **NEVER** test implementation details (state, props directly)
- **NEVER** use `data-testid` as first choice (prefer accessible queries)
- **NEVER** test CSS/styling (test behavior)
- **NEVER** skip accessibility attributes

---

## Best Practices

### Query Priority (Testing Library)

1. **Accessible to everyone:**
   - `getByRole` (button, heading, textbox, etc.)
   - `getByLabelText` (form inputs)
   - `getByPlaceholderText` (when no label)
   - `getByText` (for non-interactive elements)

2. **Semantic:**
   - `getByAltText` (images)
   - `getByTitle`

3. **Test IDs (last resort):**
   - `getByTestId` (only when nothing else works)

**Example:**
```typescript
// ✅ Good - accessible queries
screen.getByRole('button', { name: /submit/i });
screen.getByLabelText('Email address');
screen.getByText('Welcome back!');

// ❌ Bad - test IDs
screen.getByTestId('submit-button');
```

### Mocking API Calls

Use MSW (Mock Service Worker) for API mocking:

```typescript
import { rest } from 'msw';
import { setupServer } from 'msw/node';

const server = setupServer(
  rest.get('/api/recipes', (req, res, ctx) => {
    return res(ctx.json([
      { id: '1', name: 'Pasta Carbonara' }
    ]));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

### Testing Async Behavior

```typescript
// Use findBy for elements that appear async
expect(await screen.findByText('Loading complete')).toBeInTheDocument();

// Use waitFor for complex async assertions
await waitFor(() => {
  expect(screen.getByRole('list')).toHaveChildNodes();
});

// waitForElementToBeRemoved for disappearing elements
await waitForElementToBeRemoved(() => screen.queryByText('Loading...'));
```

### Testing User Interactions

```typescript
import userEvent from '@testing-library/user-event';

// Prefer userEvent over fireEvent (more realistic)
const user = userEvent.setup();

// Type text
await user.type(screen.getByRole('textbox'), 'Hello');

// Click
await user.click(screen.getByRole('button'));

// Select dropdown
await user.selectOptions(screen.getByRole('combobox'), 'option1');

// Upload file
const file = new File(['content'], 'test.png', { type: 'image/png' });
await user.upload(screen.getByLabelText('Upload'), file);
```

---

## Accessibility Testing

### Required Tests

Every component should test:
- **Keyboard navigation** - Can be used without mouse
- **Screen reader** - Has proper ARIA labels/roles
- **Focus management** - Focus moves logically

**Example:**
```typescript
it('can be navigated with keyboard', async () => {
  const user = userEvent.setup();
  render(<SearchBar onSearch={jest.fn()} />);
  
  // Tab to input
  await user.tab();
  expect(screen.getByRole('searchbox')).toHaveFocus();
  
  // Tab to button
  await user.tab();
  expect(screen.getByRole('button')).toHaveFocus();
  
  // Enter submits
  await user.keyboard('{Enter}');
  // assert submission
});
```

### ARIA Attributes

```tsx
// ✅ Good
<button aria-label="Close dialog">×</button>
<div role="alert" aria-live="polite">{error}</div>
<input aria-describedby="email-hint" />

// ❌ Bad
<div onClick={handleClick}>Click me</div> {/* Not accessible */}
<button>×</button> {/* No label for screen readers */}
```

---

## Component Structure

```
src/components/
└── SearchBar/
    ├── index.ts              # Export
    ├── SearchBar.tsx         # Component
    ├── SearchBar.test.tsx    # Tests
    ├── SearchBar.module.css  # Styles
    └── SearchBar.stories.tsx # Storybook (optional)
```

---

## Gotchas

- **Mock API calls** - Don't hit real APIs in tests (use MSW)
- **Test behavior, not implementation** - Don't test state directly
- **Use accessible queries** - Prefer role/label over test IDs
- **Test loading/error states** - Don't just test happy path
- **Clean up** - Use `cleanup()` or `afterEach` to reset state
- **Async timing** - Use `findBy`, `waitFor`, not arbitrary `setTimeout`

---

## Checklist

Before closing the task:
- [ ] All user interactions have tests
- [ ] Loading and error states tested
- [ ] Keyboard navigation tested
- [ ] Screen reader accessibility verified
- [ ] All tests pass
- [ ] No `data-testid` unless necessary
- [ ] API calls mocked (MSW or jest.mock)
- [ ] Commits follow conventional commit format

---

## Related Skills

- `code-review` - For reviewing frontend code
- `accessibility` - For deeper accessibility testing
- `debugging` - For fixing test failures

---

## Version History

| Version | Date       | Changes                     |
|---------|------------|-----------------------------|
| 1.0     | 2026-01-13 | Initial TDD frontend skill  |

---

*End of skill definition.*
