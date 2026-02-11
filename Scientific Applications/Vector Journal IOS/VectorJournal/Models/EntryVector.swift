import Foundation
import SwiftData

@Model
final class EntryVector {
    @Attribute(.unique) var id: UUID

    // Reference weights (each 0.0...1.0)
    var referenceWeight0: Float
    var referenceWeight1: Float
    var referenceWeight2: Float

    // Orientation
    var orientationAngle: Float       // radians, 0...2π
    var orientationMagnitude: Float   // 0.0...1.0

    // Coherence
    var coherence: Float              // 0.0...1.0

    // Drift
    var driftCurvature: Float
    var driftTimescaleRaw: String

    var computedAt: Date

    var entry: JournalEntry?

    var driftTimescale: DriftTimescale {
        get { DriftTimescale(rawValue: driftTimescaleRaw) ?? .entry }
        set { driftTimescaleRaw = newValue.rawValue }
    }

    var weights: (Float, Float, Float) {
        (referenceWeight0, referenceWeight1, referenceWeight2)
    }

    init(weights: (Float, Float, Float),
         angle: Float,
         magnitude: Float,
         coherence: Float,
         curvature: Float,
         timescale: DriftTimescale) {
        self.id = UUID()
        self.referenceWeight0 = weights.0
        self.referenceWeight1 = weights.1
        self.referenceWeight2 = weights.2
        self.orientationAngle = angle
        self.orientationMagnitude = magnitude
        self.coherence = coherence
        self.driftCurvature = curvature
        self.driftTimescaleRaw = timescale.rawValue
        self.computedAt = Date()
    }
}

enum DriftTimescale: String, Codable {
    case entry
    case week
    case month
}
