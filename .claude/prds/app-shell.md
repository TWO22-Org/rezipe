---
name: app-shell
description: SwiftUI app shell with navigation structure for iOS 17+
status: backlog
created: 2026-01-15T13:53:21Z
---

# PRD: app-shell

## Executive Summary
Build the foundational iOS app shell with navigation structure, tab bar, and core view containers. This provides the structural foundation upon which all other MVP features are built.

## Problem Statement
The app needs a solid navigation foundation before any feature views can be implemented. Without a proper shell, features cannot be integrated, tested, or demonstrated in context.

## User Stories
1) As a user, I want a clear tab-based navigation so I can easily switch between Home and Search.
   - Acceptance Criteria:
     - [ ] App launches to a tab bar with Home and Search tabs
     - [ ] Tapping tabs switches views without animation glitches
     - [ ] Tab selection state persists during the session

2) As a user, I want to navigate from lists to detail views seamlessly.
   - Acceptance Criteria:
     - [ ] Tapping a video in any list pushes a detail view
     - [ ] Back navigation returns to the originating list
     - [ ] Navigation stack is preserved per tab

## Requirements

### Functional Requirements
- Tab bar with two tabs: Home and Search
- Navigation stack per tab (using NavigationStack)
- Placeholder views for Home, Search, and Detail screens
- App-wide theming foundation (colors, typography)
- Launch screen with app branding

### Non-Functional Requirements
- App cold start under iOS norms (< 1s to first meaningful paint)
- No memory leaks in navigation transitions
- Support for iOS 17+ only (no backwards compatibility needed)
- Accessibility: VoiceOver support for navigation elements

## Success Criteria
- App launches without crashes on iOS 17+ devices/simulators
- All navigation paths work correctly (Home→Detail, Search→Detail, back)
- Tab state is preserved when switching tabs
- No console warnings about navigation or state issues

## Constraints & Assumptions
- SwiftUI only (no UIKit unless absolutely necessary)
- iOS 17+ minimum deployment target
- @Observable for state management (not ObservableObject)
- async/await for all asynchronous operations

## Out of Scope
- Actual data fetching (use placeholder data)
- Real YouTube player integration
- Authentication flows
- Deep linking or URL schemes

## Dependencies
- Xcode project setup with correct bundle ID and team
- iOS 17+ SDK
- No external dependencies for core shell

## Open Questions
- Should we include a settings tab for MVP or defer?
- What is the app icon and branding for launch screen?
