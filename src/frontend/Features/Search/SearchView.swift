import SwiftUI

/// Search screen - provides recipe video search with navigation to detail
struct SearchView: View {
    @Binding var navigationPath: NavigationPath
    @State private var searchText = ""

    // Sample search results for demonstration
    private let sampleResults = [
        ("chicken-curry", "Easy Chicken Curry"),
        ("veggie-stir-fry", "Vegetable Stir Fry"),
        ("chocolate-cake", "Chocolate Cake Recipe")
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
                    ForEach(sampleResults, id: \.0) { video in
                        NavigationLink(value: video.0) {
                            HStack(spacing: 12) {
                                Image(systemName: "clock.arrow.circlepath")
                                    .font(.title3)
                                    .foregroundStyle(.blue)

                                VStack(alignment: .leading) {
                                    Text(video.1)
                                        .font(.headline)
                                    Text("Tap to view recipe")
                                        .font(.caption)
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
