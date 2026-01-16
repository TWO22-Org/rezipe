import SwiftUI

/// Search screen placeholder - will provide recipe video search
struct SearchView: View {
    var body: some View {
        NavigationStack {
            VStack(spacing: 16) {
                Image(systemName: "magnifyingglass.circle.fill")
                    .font(.system(size: 60))
                    .foregroundStyle(.blue)

                Text("Search")
                    .font(.largeTitle)
                    .fontWeight(.bold)

                Text("Search for recipe videos here")
                    .foregroundStyle(.secondary)
                    .multilineTextAlignment(.center)
            }
            .padding()
            .navigationTitle("Search")
        }
    }
}

#Preview {
    SearchView()
}
