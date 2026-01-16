import SwiftUI

/// Main tab navigation container with Home and Search tabs
/// Navigation paths are lifted here to preserve state across tab switches
struct MainTabView: View {
    @State private var selectedTab: Tab = .home
    @State private var homeNavigationPath = NavigationPath()
    @State private var searchNavigationPath = NavigationPath()

    enum Tab: Hashable {
        case home
        case search
    }

    var body: some View {
        TabView(selection: $selectedTab) {
            HomeView(navigationPath: $homeNavigationPath)
                .tabItem {
                    Label("Home", systemImage: "house.fill")
                }
                .tag(Tab.home)

            SearchView(navigationPath: $searchNavigationPath)
                .tabItem {
                    Label("Search", systemImage: "magnifyingglass")
                }
                .tag(Tab.search)
        }
    }
}

#Preview {
    MainTabView()
}
