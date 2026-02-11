import Foundation
import SwiftData

@Model
final class JournalEntry {
    @Attribute(.unique) var id: UUID
    var body: String
    var contextTag: String?
    var createdAt: Date
    var analysisStatusRaw: String

    @Relationship(deleteRule: .cascade)
    var vector: EntryVector?

    @Relationship(deleteRule: .cascade)
    var perspective: PerspectiveResult?

    var analysisStatus: AnalysisStatus {
        get { AnalysisStatus(rawValue: analysisStatusRaw) ?? .pending }
        set { analysisStatusRaw = newValue.rawValue }
    }

    init(body: String, contextTag: String? = nil) {
        self.id = UUID()
        self.body = body
        self.contextTag = contextTag
        self.createdAt = Date()
        self.analysisStatusRaw = AnalysisStatus.pending.rawValue
    }
}

enum AnalysisStatus: String, Codable {
    case pending
    case analyzing
    case complete
    case failed
}
