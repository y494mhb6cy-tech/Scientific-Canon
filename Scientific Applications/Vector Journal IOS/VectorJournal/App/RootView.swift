import SwiftUI
import SwiftData

struct RootView: View {
    @Query private var profiles: [UserProfile]

    private var hasCompletedOnboarding: Bool {
        profiles.first?.hasCompletedOnboarding ?? false
    }

    var body: some View {
        Group {
            if hasCompletedOnboarding {
                JournalListView()
            } else {
                OnboardingContainerView()
            }
        }
        .preferredColorScheme(.dark)
    }
}
