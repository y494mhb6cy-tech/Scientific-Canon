import Foundation
import SwiftData

/// Orchestrates vector analysis: calls OpenAI, maps response to EntryVector, persists.
@MainActor @Observable
final class VectorAnalysisService {
    private let client: OpenAIClient

    init(client: OpenAIClient = OpenAIClient()) {
        self.client = client
    }

    func analyze(
        entry: JournalEntry,
        references: [PrimaryReference],
        context: ModelContext
    ) async throws -> EntryVector {
        let sortedRefs = references.sorted { $0.ordinal < $1.ordinal }
        let refLabels = sortedRefs.map(\.label)

        let response = try await client.analyzeVector(
            entryBody: entry.body,
            contextTag: entry.contextTag,
            references: refLabels
        )

        let timescale = DriftTimescale(rawValue: response.drift.timescale) ?? .entry

        let vector = EntryVector(
            weights: (
                response.references[safe: 0]?.weight ?? 0,
                response.references[safe: 1]?.weight ?? 0,
                response.references[safe: 2]?.weight ?? 0
            ),
            angle: response.orientation.angle,
            magnitude: response.orientation.magnitude,
            coherence: response.coherence,
            curvature: response.drift.curvature,
            timescale: timescale
        )

        entry.vector = vector
        context.insert(vector)

        return vector
    }
}

// Safe array subscript
extension Array {
    subscript(safe index: Index) -> Element? {
        indices.contains(index) ? self[index] : nil
    }
}
