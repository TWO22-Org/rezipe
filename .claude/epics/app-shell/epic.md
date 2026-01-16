---
name: app-shell
status: completed
created: 2026-01-15T13:53:21Z
updated: 2026-01-16T17:23:30Z
progress: 100%
prd: .claude/prds/app-shell.md
github: [Will be updated when synced to GitHub]
---

# Epic: app-shell

## Overview
Build the foundational iOS app shell with tab-based navigation (Home + Search), NavigationStack per tab, and placeholder views. This establishes the structural foundation for all MVP features.

## Architecture Decisions
- SwiftUI with iOS 17+ deployment target
- Tab-based navigation with TabView
- NavigationStack per tab (not NavigationView)
- @Observable macro for state management (not ObservableObject)
- MVVM pattern with explicit async state

## Technical Approach
### Frontend Components
- ChefStreamApp: Main app entry with WindowGroup
- MainTabView: Tab container with Home and Search tabs
- HomeView: Placeholder for curated categories
- SearchView: Placeholder for search interface
- VideoDetailView: Placeholder for video + recipe detail
- Reusable VideoGridView component stub

### Backend Services
- None required for this epic (placeholder data only)

### Infrastructure
- Xcode project configuration
- App icon and launch screen assets
- Info.plist for iOS 17+ deployment

## Implementation Strategy
- Phase 1: Xcode project setup and configuration
- Phase 2: Tab navigation structure
- Phase 3: Navigation stacks per tab
- Phase 4: Placeholder views and theming foundation

## Task Breakdown Preview
- [x] Xcode project setup + iOS 17 configuration
- [x] Tab navigation with Home + Search
- [x] NavigationStack per tab with detail push
- [x] Placeholder views + theming foundation

## Dependencies
- Xcode 15+ with iOS 17 SDK
- Apple Developer account (for device testing)

## Success Criteria (Technical)
- App launches without crashes on iOS 17+ simulators
- Tab switching works correctly
- Navigation push/pop works in both tabs
- No console warnings about navigation state

## Estimated Effort
- Resources: 1 iOS developer
- Critical path: Tab navigation structure

## Tasks Created
- [x] 001.md - Xcode project setup + iOS 17 configuration (parallel: false)
- [x] 002.md - Tab navigation with Home + Search (parallel: false)
- [x] 003.md - NavigationStack per tab with detail push (parallel: false)
- [x] 004.md - Placeholder views + theming foundation (parallel: false)

Total tasks: 4
Parallel tasks: 0
Sequential tasks: 4
Estimated total effort: 12 hours
