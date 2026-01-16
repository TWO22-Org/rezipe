import SwiftUI

/// Home screen - displays curated recipe categories with navigation to detail
struct HomeView: View {
    @Binding var navigationPath: NavigationPath

    // Sample video IDs for demonstration
    private let sampleVideos = [
        ("pasta-101", "Italian Pasta Basics"),
        ("sushi-guide", "Sushi Making Guide"),
        ("dessert-tips", "Quick Dessert Tips")
    ]

    var body: some View {
        NavigationStack(path: $navigationPath) {
            List {
                Section("Featured Recipes") {
                    ForEach(sampleVideos, id: \.0) { video in
                        NavigationLink(value: video.0) {
                            HStack(spacing: 12) {
                                Image(systemName: "play.rectangle.fill")
                                    .font(.title2)
                                    .foregroundStyle(.orange)

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

                Section {
                    Text("More categories coming soon...")
                        .foregroundStyle(.secondary)
                }
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
