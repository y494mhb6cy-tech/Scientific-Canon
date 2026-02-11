import Foundation
import SwiftData

/// Generates Canon-validated perspective descriptions for journal entries.
/// Only available for Plus tier users.
@MainActor @Observable
final class PerspectiveService {
    private let client: OpenAIClient

    init(client: OpenAIClient = OpenAIClient()) {
        self.client = client
    }

    func describe(
        entry: JournalEntry,
        vector: EntryVector,
        references: [PrimaryReference],
        recentVectors: [EntryVector],
        context: ModelContext
    ) async throws -> PerspectiveResult? {
        let sortedRefs = references.sorted { $0.ordinal < $1.ordinal }
        let refLabels = sortedRefs.map(\.label)
        let weights = [vector.referenceWeight0, vector.referenceWeight1, vector.referenceWeight2]

        // Build recent context summary
        var recentContext: String? = nil
        if !recentVectors.isEmpty {
            let angles = recentVectors.map { String(format: "%.2f", $0.orientationAngle) }
            let coherences = recentVectors.map { String(format: "%.2f", $0.coherence) }
            recentContext = "Previous entries showed orientation at angles [\(angles.joined(separator: ", "))] with coherence [\(coherences.joined(separator: ", "))]"
        }

        let response = try await client.generatePerspective(
            entryBody: entry.body,
            references: refLabels,
            weights: weights,
            angle: vector.orientationAngle,
            magnitude: vector.orientationMagnitude,
            coherence: vector.coherence,
            curvature: vector.driftCurvature,
            recentContext: recentContext
        )

        // Canon validation — reject any advisory or evaluative language
        guard CanonValidator.validate(response.perspective) else {
            return nil
        }

        let result = PerspectiveResult(
            text: response.perspective,
            functionUsed: response.function_used
        )

        entry.perspective = result
        context.insert(result)

        return result
    }
}
