import Foundation
import SwiftData

@Model
final class PrimaryReference {
    @Attribute(.unique) var id: UUID
    var label: String
    var ordinal: Int          // 0, 1, 2
    var createdAt: Date

    init(label: String, ordinal: Int) {
        self.id = UUID()
        self.label = label
        self.ordinal = ordinal
        self.createdAt = Date()
    }
}
