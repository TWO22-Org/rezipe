import SwiftUI

/// Home screen placeholder - will display curated recipe categories
struct HomeView: View {
    var body: some View {
        NavigationStack {
            VStack(spacing: 16) {
                Image(systemName: "fork.knife.circle.fill")
                    .font(.system(size: 60))
                    .foregroundStyle(.orange)

                Text("Home")
                    .font(.largeTitle)
                    .fontWeight(.bold)

                Text("Curated recipe categories will appear here")
                    .foregroundStyle(.secondary)
                    .multilineTextAlignment(.center)
            }
            .padding()
            .navigationTitle("ChefStream")
        }
    }
}

#Preview {
    HomeView()
}
