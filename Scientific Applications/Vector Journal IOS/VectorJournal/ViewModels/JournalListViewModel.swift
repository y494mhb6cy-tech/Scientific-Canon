import Foundation
import SwiftData

@MainActor @Observable
final class JournalListViewModel {
    var entryCount: Int = 0

    func refreshCount(context: ModelContext) {
        let descriptor = FetchDescriptor<JournalEntry>()
        entryCount = (try? context.fetchCount(descriptor)) ?? 0
    }

    func canCreateEntry(tier: SubscriptionTier) -> Bool {
        guard let max = CanonPolicy.maxEntries(for: tier) else { return true }
        return entryCount < max
    }

    func deleteEntry(_ entry: JournalEntry, context: ModelContext) {
        context.delete(entry)
        try? context.save()
        refreshCount(context: context)
    }
}
