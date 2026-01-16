import SwiftUI

/// A video item for display in the grid
struct VideoItem: Identifiable {
    let id: String
    let title: String
}

/// Reusable grid component for displaying video thumbnails with navigation
struct VideoGridView: View {
    let videos: [VideoItem]

    private let columns = [
        GridItem(.adaptive(minimum: 150), spacing: Theme.Spacing.medium)
    ]

    var body: some View {
        LazyVGrid(columns: columns, spacing: Theme.Spacing.medium) {
            ForEach(videos) { video in
                NavigationLink(value: video.id) {
                    VideoGridItemView(video: video)
                }
                .buttonStyle(.plain)
            }
        }
    }
}

/// Individual video item view within the grid
private struct VideoGridItemView: View {
    let video: VideoItem

    var body: some View {
        VStack(alignment: .leading, spacing: Theme.Spacing.small) {
            // Thumbnail placeholder
            RoundedRectangle(cornerRadius: 8)
                .fill(Theme.Colors.primary.opacity(0.15))
                .aspectRatio(16/9, contentMode: .fit)
                .overlay {
                    Image(systemName: "play.circle.fill")
                        .font(.title)
                        .foregroundStyle(Theme.Colors.primary)
                }

            // Title
            Text(video.title)
                .font(Theme.Typography.caption)
                .lineLimit(2)
                .foregroundStyle(.primary)
        }
    }
}

#Preview {
    NavigationStack {
        ScrollView {
            VideoGridView(videos: [
                VideoItem(id: "1", title: "Italian Pasta Basics"),
                VideoItem(id: "2", title: "Sushi Making Guide"),
                VideoItem(id: "3", title: "Quick Dessert Tips"),
                VideoItem(id: "4", title: "French Cuisine 101")
            ])
            .padding()
        }
        .navigationTitle("Recipes")
        .navigationDestination(for: String.self) { videoId in
            Text("Video: \(videoId)")
        }
    }
}
