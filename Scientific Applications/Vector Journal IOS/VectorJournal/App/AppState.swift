import SwiftUI

@Observable
final class AppState {
    var subscriptionTier: SubscriptionTier = .free
    var isAnalyzing: Bool = false
}

enum SubscriptionTier: String, Codable {
    case free
    case plus
}
