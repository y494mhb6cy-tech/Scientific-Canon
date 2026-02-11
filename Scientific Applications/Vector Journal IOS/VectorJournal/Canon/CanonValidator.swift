import Foundation

/// Post-hoc validator for AI-generated text.
/// Rejects any output that violates the Canon's prohibitions.
enum CanonValidator {
    private static let forbiddenPatterns: [String] = [
        // Directive language
        "you should", "you could try", "try to", "consider ", "i recommend",
        "you might", "it would be good", "you need to", "you ought to",
        "make sure", "don't forget", "remember to", "be sure to",
        "why not", "how about", "what if you",
        // Evaluative language
        "great job", "well done", "keep it up", "good work",
        "impressive", "excellent", "wonderful", "amazing",
        "poor", "bad ", "wrong", "correct",
        // Sentiment scoring
        "positive", "negative", "score", "rating", "rank",
        // Optimization
        "optimize", "improve", "better", "worse", "progress",
        "goal", "target", "achieve",
        // Questions
        "?",
    ]

    /// Returns true if the text passes Canon validation.
    static func validate(_ text: String) -> Bool {
        let lowered = text.lowercased()
        return !forbiddenPatterns.contains { lowered.contains($0) }
    }

    /// Returns the specific violations found, if any.
    static func violations(in text: String) -> [String] {
        let lowered = text.lowercased()
        return forbiddenPatterns.filter { lowered.contains($0) }
    }
}
