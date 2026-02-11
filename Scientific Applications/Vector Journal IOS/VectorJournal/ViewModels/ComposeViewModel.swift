import Foundation
import SwiftData

@MainActor @Observable
final class ComposeViewModel {
    var bodyText: String = ""
    var contextTag: String = ""
    var isSaving: Bool = false

    private let analysisService: VectorAnalysisService
    private let perspectiveService: PerspectiveService

    init(analysisService: VectorAnalysisService = VectorAnalysisService(),
         perspectiveService: PerspectiveService = PerspectiveService()) {
        self.analysisService = analysisService
        self.perspectiveService = perspectiveService
    }

    var canSave: Bool {
        !bodyText.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty && !isSaving
    }

    func saveEntry(
        context: ModelContext,
        references: [PrimaryReference],
        tier: SubscriptionTier
    ) async -> JournalEntry? {
        guard canSave else { return nil }

        isSaving = true
        defer { isSaving = false }

        let tag = contextTag.trimmingCharacters(in: .whitespacesAndNewlines)
        let entry = JournalEntry(
            body: bodyText.trimmingCharacters(in: .whitespacesAndNewlines),
            contextTag: tag.isEmpty ? nil : tag
        )
        context.insert(entry)
        try? context.save()

        // Background analysis
        entry.analysisStatus = .analyzing

        do {
            let vector = try await analysisService.analyze(
                entry: entry,
                references: references,
                context: context
            )

            if CanonPolicy.perspectiveAvailable(for: tier) {
                let recentVectors = fetchRecentVectors(context: context, limit: 5)
                _ = try await perspectiveService.describe(
                    entry: entry,
                    vector: vector,
                    references: references,
                    recentVectors: recentVectors,
                    context: context
                )
            }

            entry.analysisStatus = .complete
        } catch {
            entry.analysisStatus = .failed
        }

        try? context.save()
        return entry
    }

    private func fetchRecentVectors(context: ModelContext, limit: Int) -> [EntryVector] {
        let descriptor = FetchDescriptor<EntryVector>(
            sortBy: [SortDescriptor(\.computedAt, order: .reverse)]
        )
        let results = (try? context.fetch(descriptor)) ?? []
        return Array(results.prefix(limit))
    }
}
