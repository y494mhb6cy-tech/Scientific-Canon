import Foundation
import SwiftData

@Model
final class UserProfile {
    @Attribute(.unique) var id: UUID
    var hasCompletedOnboarding: Bool
    var tierRaw: String
    var referenceChangesThisYear: Int
    var lastReferenceChangeYear: Int
    var createdAt: Date

    var tier: SubscriptionTier {
        get { SubscriptionTier(rawValue: tierRaw) ?? .free }
        set { tierRaw = newValue.rawValue }
    }

    init() {
        self.id = UUID()
        self.hasCompletedOnboarding = false
        self.tierRaw = SubscriptionTier.free.rawValue
        self.referenceChangesThisYear = 0
        self.lastReferenceChangeYear = Calendar.current.component(.year, from: Date())
        self.createdAt = Date()
    }
}
