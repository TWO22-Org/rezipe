import SwiftUI

/// Home screen - displays curated recipe categories with navigation to detail
struct HomeView: View {
    @Binding var navigationPath: NavigationPath

    // Sample video items for demonstration
    private let sampleVideos = [
        VideoItem(id: "pasta-101", title: "Italian Pasta Basics"),
        VideoItem(id: "sushi-guide", title: "Sushi Making Guide"),
        VideoItem(id: "dessert-tips", title: "Quick Dessert Tips"),
        VideoItem(id: "thai-curry", title: "Thai Green Curry"),
        VideoItem(id: "bread-baking", title: "Artisan Bread Baking"),
        VideoItem(id: "salad-ideas", title: "Fresh Salad Ideas")
    ]

    var body: some View {
        NavigationStack(path: $navigationPath) {
            ScrollView {
                VStack(alignment: .leading, spacing: Theme.Spacing.large) {
                    // Featured grid section
                    VStack(alignment: .leading, spacing: Theme.Spacing.small) {
                        Text("Featured Recipes")
                            .font(Theme.Typography.headline)
                            .padding(.horizontal)

                        VideoGridView(videos: sampleVideos)
                            .padding(.horizontal)
                    }

                    // Coming soon section
                    VStack(alignment: .leading, spacing: Theme.Spacing.small) {
                        Text("More Coming Soon")
                            .font(Theme.Typography.headline)
                            .padding(.horizontal)

                        Text("More categories and recipes will be added in future updates.")
                            .font(Theme.Typography.caption)
                            .foregroundStyle(.secondary)
                            .padding(.horizontal)
                    }
                }
                .padding(.vertical)
            }
            .navigationTitle("ChefStream")
            .navigationDestination(for: String.self) { videoId in
                VideoDetailView(videoId: videoId)
            }
        }
    }
}

#Preview {
    @Previewable @State var path = NavigationPath()
    HomeView(navigationPath: $path)
}
