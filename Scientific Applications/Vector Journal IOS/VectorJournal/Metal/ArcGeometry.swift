import Foundation
import simd

/// CPU-side geometry generation for the vector field visualization.
enum ArcGeometry {
    /// Canonical anchor positions at 120° spacing.
    /// F (Frame): top, G (Gradient): bottom-left, V (Vector): bottom-right.
    static func anchorPositions() -> [SIMD2<Float>] {
        let r: Float = 0.65
        return [
            SIMD2(0, r),                                          // F: top
            SIMD2(-r * sin(.pi / 3), -r * cos(.pi / 3)),        // G: bottom-left
            SIMD2(r * sin(.pi / 3), -r * cos(.pi / 3))          // V: bottom-right
        ]
    }

    /// Canonical anchor colors matching the SVG glyph.
    static func anchorColors() -> [SIMD4<Float>] {
        [
            SIMD4(0.345, 0.651, 1.0, 1.0),    // Frame: #58a6ff
            SIMD4(0.824, 0.600, 0.133, 1.0),   // Gradient: #d29922
            SIMD4(0.640, 0.443, 0.967, 1.0)    // Vector: #a371f7
        ]
    }

    /// Compute target position as weighted combination of anchors, scaled by magnitude.
    static func weightedPosition(
        anchors: [SIMD2<Float>],
        weights: SIMD3<Float>,
        magnitude: Float
    ) -> SIMD2<Float> {
        guard anchors.count == 3 else { return .zero }

        let totalWeight = weights.x + weights.y + weights.z
        guard totalWeight > 0 else { return .zero }

        let normalized = weights / totalWeight
        let target = anchors[0] * normalized.x
                   + anchors[1] * normalized.y
                   + anchors[2] * normalized.z

        return target * magnitude
    }

    /// Opacity based on entry age. Recent = 1.0, fades over 90 days.
    static func opacityForAge(_ age: TimeInterval) -> Float {
        let days = Float(age / 86400)
        let maxDays: Float = 90
        return max(0.15, 1.0 - (days / maxDays))
    }

    /// Tessellate a quadratic Bezier arc from origin to target with curvature.
    static func tessellateArc(
        from origin: SIMD2<Float>,
        to target: SIMD2<Float>,
        curvature: Float,
        weights: SIMD3<Float>,
        anchors: [SIMD2<Float>],
        opacity: Float,
        segments: Int = 64
    ) -> [VectorArcVertex] {
        let colors = anchorColors()

        // Compute blended color from weights
        let totalWeight = weights.x + weights.y + weights.z
        let nw: SIMD3<Float> = totalWeight > 0 ? weights / totalWeight : SIMD3<Float>(repeating: 1.0 / 3.0)
        let blendedColor = colors[0] * nw.x + colors[1] * nw.y + colors[2] * nw.z

        // Bezier control point: perpendicular offset from midpoint
        let midpoint = (origin + target) * 0.5
        let direction = target - origin
        let perpendicular = SIMD2<Float>(-direction.y, direction.x)
        let controlPoint = midpoint + perpendicular * curvature * 0.5

        var vertices: [VectorArcVertex] = []
        vertices.reserveCapacity(segments + 1)

        for i in 0...segments {
            let t = Float(i) / Float(segments)

            // Quadratic Bezier: B(t) = (1-t)²·P0 + 2(1-t)t·P1 + t²·P2
            let oneMinusT = 1.0 - t
            let point = origin * (oneMinusT * oneMinusT)
                      + controlPoint * (2.0 * oneMinusT * t)
                      + target * (t * t)

            // Color interpolates from white at origin to blended reference color
            let color = mix(SIMD4<Float>(0.94, 0.96, 0.99, 1.0), blendedColor, t: t)

            vertices.append(VectorArcVertex(
                position: point,
                color: color,
                opacity: opacity
            ))
        }

        return vertices
    }
}

/// Linear interpolation between two SIMD4 values.
private func mix(_ a: SIMD4<Float>, _ b: SIMD4<Float>, t: Float) -> SIMD4<Float> {
    a * (1.0 - t) + b * t
}
