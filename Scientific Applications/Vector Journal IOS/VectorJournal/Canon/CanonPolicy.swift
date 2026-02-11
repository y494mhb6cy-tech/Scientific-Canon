import Foundation

/// Canon enforcement gate. Validates that outputs conform to the Canon of Symmetry.
/// No role may dominate, collapse into, or substitute for another.
enum CanonPolicy {
    /// Validates that a reference label is a noun-identity anchor, not a goal, verb, or emotion.
    static func isValidReference(_ label: String) -> Bool {
        let trimmed = label.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty else { return false }
        guard trimmed.count >= 2 else { return false }

        let lowered = trimmed.lowercased()

        // Reject common verb/goal/emotion patterns
        let forbiddenPrefixes = ["to ", "be ", "become ", "get ", "start ", "stop ", "achieve ", "improve "]
        for prefix in forbiddenPrefixes {
            if lowered.hasPrefix(prefix) { return false }
        }

        let forbiddenWords: Set<String> = [
            // Emotions
            "happiness", "sadness", "anger", "fear", "joy", "anxiety", "love", "hate",
            "excitement", "calm", "peace", "stress", "hope", "despair",
            // Goals / time-bound
            "success", "wealth", "promotion", "graduation", "retirement",
            // Verbs as nouns
            "running", "winning", "losing", "growing", "healing"
        ]

        if forbiddenWords.contains(lowered) { return false }

        return true
    }

    /// Maximum entries allowed for a given tier.
    static func maxEntries(for tier: SubscriptionTier) -> Int? {
        switch tier {
        case .free: return 30
        case .plus: return nil // unlimited
        }
    }

    /// Whether the perspective layer is available for a tier.
    static func perspectiveAvailable(for tier: SubscriptionTier) -> Bool {
        tier == .plus
    }

    /// Whether time-series visualization is available for a tier.
    static func timeSeriesAvailable(for tier: SubscriptionTier) -> Bool {
        tier == .plus
    }

    /// Reference changes allowed per year for a tier.
    static func referenceChangesPerYear(for tier: SubscriptionTier) -> Int {
        switch tier {
        case .free: return 0
        case .plus: return 1
        }
    }
}
