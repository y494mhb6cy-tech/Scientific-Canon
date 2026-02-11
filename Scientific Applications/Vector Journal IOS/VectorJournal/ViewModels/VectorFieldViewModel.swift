import Foundation
import simd

/// Converts EntryVector models into render-ready data for the Metal pipeline.
@MainActor @Observable
final class VectorFieldViewModel {
    var renderData: [VectorRenderData] = []
    var referenceLabels: [String] = []

    func prepare(
        vectors: [EntryVector],
        references: [PrimaryReference],
        showTimeSeries: Bool
    ) {
        let sorted = references.sorted { $0.ordinal < $1.ordinal }
        referenceLabels = sorted.map(\.label)

        let anchors = ArcGeometry.anchorPositions()
        let now = Date()

        let source: [EntryVector]
        if showTimeSeries {
            source = vectors.sorted { $0.computedAt < $1.computedAt }
        } else if let latest = vectors.max(by: { $0.computedAt < $1.computedAt }) {
            source = [latest]
        } else {
            renderData = []
            return
        }

        renderData = source.map { vector in
            let weights = SIMD3<Float>(
                vector.referenceWeight0,
                vector.referenceWeight1,
                vector.referenceWeight2
            )

            // Compute target position as weighted combination of anchors
            let target = ArcGeometry.weightedPosition(
                anchors: anchors,
                weights: weights,
                magnitude: vector.orientationMagnitude
            )

            // Compute opacity based on age
            let age = now.timeIntervalSince(vector.computedAt)
            let opacity = ArcGeometry.opacityForAge(age)

            // Tessellate arc from origin to target
            let vertices = ArcGeometry.tessellateArc(
                from: .zero,
                to: target,
                curvature: vector.driftCurvature,
                weights: weights,
                anchors: anchors,
                opacity: opacity
            )

            return VectorRenderData(
                vertices: vertices,
            
                coherence: vector.coherence
            )
        }
    }
}
