import SwiftUI

/// Video detail view placeholder - will display YouTube player + recipe card
struct VideoDetailView: View {
    let videoId: String

    var body: some View {
        ScrollView {
            VStack(spacing: 20) {
                // Placeholder for YouTube player
                RoundedRectangle(cornerRadius: 12)
                    .fill(Color.black)
                    .aspectRatio(16/9, contentMode: .fit)
                    .overlay {
                        VStack(spacing: 8) {
                            Image(systemName: "play.circle.fill")
                                .font(.system(size: 50))
                                .foregroundStyle(.white)
                            Text("Video Player")
                                .foregroundStyle(.white)
                                .font(.caption)
                        }
                    }

                // Placeholder for recipe card
                VStack(alignment: .leading, spacing: 12) {
                    Text("Recipe Title")
                        .font(.title2)
                        .fontWeight(.bold)

                    Text("Video ID: \(videoId)")
                        .font(.caption)
                        .foregroundStyle(.secondary)

                    Divider()

                    Text("Recipe content will appear here once extracted from the video.")
                        .foregroundStyle(.secondary)
                }
                .padding()
                .background(.quaternary)
                .clipShape(RoundedRectangle(cornerRadius: 12))
            }
            .padding()
        }
        .navigationTitle("Recipe")
        .navigationBarTitleDisplayMode(.inline)
    }
}

#Preview {
    NavigationStack {
        VideoDetailView(videoId: "sample-video-123")
    }
}
