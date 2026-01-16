import SwiftUI

/// Video detail view placeholder - will display YouTube player + recipe card
struct VideoDetailView: View {
    let videoId: String

    var body: some View {
        ScrollView {
            VStack(spacing: Theme.Spacing.large) {
                // Placeholder for YouTube player (black is semantically correct for video)
                RoundedRectangle(cornerRadius: 12)
                    .fill(Color.black)
                    .aspectRatio(16/9, contentMode: .fit)
                    .overlay {
                        VStack(spacing: Theme.Spacing.small) {
                            Image(systemName: "play.circle.fill")
                                .font(.system(size: 50))
                                .foregroundStyle(.white)
                            Text("Video Player")
                                .foregroundStyle(.white)
                                .font(Theme.Typography.caption)
                        }
                    }

                // Placeholder for recipe card
                VStack(alignment: .leading, spacing: 12) {
                    Text("Recipe Title")
                        .font(Theme.Typography.title)
                        .fontWeight(.bold)

                    Text("Video ID: \(videoId)")
                        .font(Theme.Typography.caption)
                        .foregroundStyle(.secondary)

                    Divider()

                    Text("Recipe content will appear here once extracted from the video.")
                        .font(Theme.Typography.body)
                        .foregroundStyle(.secondary)
                }
                .padding()
                .background(Theme.Colors.background)
                .clipShape(RoundedRectangle(cornerRadius: 12))
            }
            .padding()
        }
        .background(Theme.Colors.background.opacity(0.5))
        .navigationTitle("Recipe")
        .navigationBarTitleDisplayMode(.inline)
    }
}

#Preview {
    NavigationStack {
        VideoDetailView(videoId: "sample-video-123")
    }
}
