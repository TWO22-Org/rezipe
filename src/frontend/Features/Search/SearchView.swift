import SwiftUI

/// Search screen - provides recipe video search with navigation to detail
struct SearchView: View {
    @Binding var navigationPath: NavigationPath
    @State private var searchText = ""

    // Sample search results for demonstration (using VideoItem for consistency)
    private let sampleResults = [
        VideoItem(id: "chicken-curry", title: "Easy Chicken Curry"),
        VideoItem(id: "veggie-stir-fry", title: "Vegetable Stir Fry"),
        VideoItem(id: "chocolate-cake", title: "Chocolate Cake Recipe")
    ]

    var body: some View {
        NavigationStack(path: $navigationPath) {
            List {
                if searchText.isEmpty {
                    Section {
                        Text("Enter a search term to find recipes")
                            .foregroundStyle(.secondary)
                    }
                }

                Section("Recent Searches") {
                    ForEach(sampleResults) { video in
                        NavigationLink(value: video.id) {
                            HStack(spacing: 12) {
                                Image(systemName: "clock.arrow.circlepath")
                                    .font(.title3)
                                    .foregroundStyle(Theme.Colors.secondary)

                                VStack(alignment: .leading) {
                                    Text(video.title)
                                        .font(Theme.Typography.headline)
                                    Text("Tap to view recipe")
                                        .font(Theme.Typography.caption)
                                        .foregroundStyle(.secondary)
                                }
                            }
                            .padding(.vertical, 4)
                        }
                    }
                }
            }
            .navigationTitle("Search")
            .searchable(text: $searchText, prompt: "Search recipes...")
            .navigationDestination(for: String.self) { videoId in
                VideoDetailView(videoId: videoId)
            }
        }
    }
}

#Preview {
    @Previewable @State var path = NavigationPath()
    SearchView(navigationPath: $path)
}
