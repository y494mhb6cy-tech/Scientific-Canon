import Foundation
import SwiftData

@Model
final class ReferenceChangeRecord {
    @Attribute(.unique) var id: UUID
    var ordinal: Int
    var previousLabel: String
    var newLabel: String
    var changedAt: Date

    init(ordinal: Int, previousLabel: String, newLabel: String) {
        self.id = UUID()
        self.ordinal = ordinal
        self.previousLabel = previousLabel
        self.newLabel = newLabel
        self.changedAt = Date()
    }
}
