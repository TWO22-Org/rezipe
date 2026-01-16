# SwiftUI State Management Rules

**Scope:** iOS app (ChefStream/Rezipe)
**Applies to:** All SwiftUI view implementations
**Constraint:** SwiftUI-only APIs, no UIKit bridging

---

## Principle: State Ownership

State must be owned by the view that needs to preserve it across lifecycle events. In container views (TabView, NavigationStack), child views can be recreated, so state must live in the stable parent.

---

## Pattern 1: Navigation State in TabView

**Problem:** Navigation state in child views gets lost when TabView recreates views on tab switch.

**Solution:** Lift NavigationPath to TabView parent.

```swift
// ✅ CORRECT
struct MainTabView: View {
    @State private var selectedTab: Tab = .home
    @State private var homeNavigationPath = NavigationPath()
    @State private var searchNavigationPath = NavigationPath()

    var body: some View {
        TabView(selection: $selectedTab) {
            HomeView(navigationPath: $homeNavigationPath)
                .tabItem { Label("Home", systemImage: "house.fill") }
                .tag(Tab.home)

            SearchView(navigationPath: $searchNavigationPath)
                .tabItem { Label("Search", systemImage: "magnifyingglass") }
                .tag(Tab.search)
        }
    }
}

struct HomeView: View {
    @Binding var navigationPath: NavigationPath  // Accept binding from parent

    var body: some View {
        NavigationStack(path: $navigationPath) {
            // Content here
        }
    }
}

// ❌ WRONG - State recreated when tab switches
struct HomeView: View {
    @State private var navigationPath = NavigationPath()  // Recreated!

    var body: some View {
        NavigationStack(path: $navigationPath) {
            // Content here
        }
    }
}
```

---

## Pattern 2: SwiftUI-Only Colors

**Rule:** Never use UIKit color bridging. Use pure SwiftUI color/material modifiers.

```swift
// ✅ CORRECT - Pure SwiftUI
.background(.quaternary)           // System gray (adaptive)
.foregroundStyle(.secondary)       // System text secondary
.fill(.ultraThickMaterial)         // Material blur
.background(Color.blue)            // Named colors
.background(Color(red: 1, green: 0.5, blue: 0))

// ❌ WRONG - UIKit bridging
.background(Color(.systemGray6))   // UIKit dependency
.foregroundStyle(UIColor.label)    // UIKit dependency
.fill(UIColor.systemBlue)          // UIKit dependency
```

**SwiftUI Color Palette:**
- `.primary` - Primary text
- `.secondary` - Secondary text
- `.tertiary` - Tertiary text
- `.quaternary` - Quaternary text
- `Color.blue`, `Color.red`, etc. - Named colors
- `.ultraThinMaterial`, `.thinMaterial`, `.regularMaterial`, `.thickMaterial`, `.ultraThickMaterial` - Materials
- `.background`, `.foreground`, `.fill` - Semantic colors

---

## Pattern 3: Testing @Binding Views

**Problem:** After refactoring views to use @Binding, tests fail because views need binding parameters.

**Solution:** Use `@Previewable @State` in previews; write integration tests for binding behavior.

```swift
// ✅ CORRECT Preview
#Preview {
    @Previewable @State var navigationPath = NavigationPath()
    HomeView(navigationPath: $navigationPath)
}

// ✅ CORRECT Unit Test
func testNavigationPathPreservation() {
    var path = NavigationPath()
    path.append("video-123")
    XCTAssertEqual(path.count, 1, "NavigationPath should store appended values")
}

// ❌ WRONG - Can't instantiate without binding
#Preview {
    HomeView()  // Error: Missing required parameter
}
```

---

## Pattern 4: Asset Generation

**Rule:** Asset catalogs must include actual image/color files before first build.

```swift
// ✅ CORRECT Structure
Assets.xcassets/
├── AppIcon.appiconset/
│   ├── Contents.json
│   └── AppIcon.png              // Actual 1024x1024 image
├── AccentColor.colorset/
│   └── Contents.json
└── LaunchBackground.colorset/
    └── Contents.json
```

**Automation:** Use Python PIL or similar to generate placeholder images programmatically during project setup, rather than requiring manual image creation.

---

## Checklist for New Views

When creating a new SwiftUI view:

- [ ] Identify required @State vs @Binding (will this view's state survive recreation?)
- [ ] If using TabView, lift navigation state to parent
- [ ] Use only pure SwiftUI color APIs
- [ ] Write unit tests for @State behavior
- [ ] Use @Previewable @State in #Preview for @Binding parameters
- [ ] Check for UIKit bridging before commit

---

## Common Mistakes

| Mistake | Why Wrong | Fix |
|---------|-----------|-----|
| `@State` navigation in TabView children | Lost on tab switch | Lift to TabView parent with @Binding |
| `Color(.systemGray6)` | UIKit bridging violates constraint | Use `.quaternary` |
| No preview for @Binding view | Preview won't compile | Use `@Previewable @State` |
| Missing asset image files | Build fails/warnings | Generate placeholder images upfront |
| Wrong Swift version in project | New features unavailable | Verify all 6 build config locations |

---

## References

- **Related:** `.claude/learnings/2026-01-16-app-shell-tasks-001-003.md`
- **Tech Stack:** CLAUDE.md (SwiftUI, iOS 17+, Swift 5.9+)
- **PRD Constraints:** `.claude/prds/global-prd.md` (SwiftUI only, no UIKit unless necessary)
