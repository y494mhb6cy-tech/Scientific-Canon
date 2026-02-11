import Foundation
import SwiftData

@Model
final class PerspectiveResult {
    @Attribute(.unique) var id: UUID
    var text: String
    var functionUsed: String
    var generatedAt: Date

    var entry: JournalEntry?

    init(text: String, functionUsed: String) {
        self.id = UUID()
        self.text = text
        self.functionUsed = functionUsed
        self.generatedAt = Date()
    }
}
