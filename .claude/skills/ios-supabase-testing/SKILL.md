# Skill: iOS + Supabase Testing

**Version**: 1.0
**Applies to**: iOS SwiftUI app + Supabase Edge Functions
**When to use**: Any feature touching iOS UI, iOS networking, or Supabase Edge Functions

---

## Goals
- Ensure tests are written first (TDD)
- Cover iOS view logic and backend edge functions separately
- Keep test runs deterministic and CI-friendly

---

## iOS Testing (Swift/XCTest)

### What to test
- ViewModels: state transitions, loading/error paths
- Services: request/response mapping, error handling
- Views: snapshot tests where available

### Commands
- Use Xcode or `xcodebuild` with the correct scheme/workspace.
- Example (adjust scheme + destination):
  ```bash
  xcodebuild -scheme <scheme> -destination "platform=iOS Simulator,name=iPhone 15" test
  ```

### Guidelines
- Prefer `@Observable` view models for iOS 17+
- Use dependency injection for services to enable mocks
- No network calls in unit tests

---

## Supabase Edge Functions (Deno)

### What to test
- Input validation (Zod or equivalent)
- Expected JSON shape and status codes
- Error paths (invalid input, external service failure)

### Commands
```bash
cd src/backend
# Run all tests
deno test
```

### Guidelines
- Keep tests pure (no live Supabase calls unless explicitly integration tests)
- Mock external APIs
- Validate output schema in tests

---

## Logging & Repro
- Use `.claude/scripts/test-and-log.sh` when it fits the project to capture output.
- Always paste failing output into the beads task or PR description.

---

## Definition of Done
- Tests added and failing before implementation
- Tests pass locally for iOS and backend
- Coverage includes success + failure paths
