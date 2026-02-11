import SwiftUI

/// Small inline indicator showing dominant reference weight as a colored arc.
/// Used in journal list rows.
struct MiniVectorIndicator: View {
    let vector: EntryVector?

    var body: some View {
        Canvas { context, size in
            guard let v = vector else {
                // Draw empty circle
                let rect = CGRect(origin: .zero, size: size).insetBy(dx: 2, dy: 2)
                context.stroke(
                    Path(ellipseIn: rect),
                    with: .color(CanonColors.border),
                    lineWidth: 1
                )
                return
            }

            let center = CGPoint(x: size.width / 2, y: size.height / 2)
            let radius = min(size.width, size.height) / 2 - 2

            // Background ring
            let ringRect = CGRect(
                x: center.x - radius,
                y: center.y - radius,
                width: radius * 2,
                height: radius * 2
            )
            context.stroke(
                Path(ellipseIn: ringRect),
                with: .color(CanonColors.border),
                lineWidth: 1
            )

            // Dominant reference arc
            let weights = [v.referenceWeight0, v.referenceWeight1, v.referenceWeight2]
            let colors: [Color] = [CanonColors.frameMid, CanonColors.gradientMid, CanonColors.vectorMid]
            let totalWeight = weights.reduce(0, +)
            guard totalWeight > 0 else { return }

            var startAngle: Double = -.pi / 2
            for i in 0..<3 {
                let fraction = Double(weights[i] / totalWeight)
                let endAngle = startAngle + fraction * 2 * .pi

                var path = Path()
                path.addArc(
                    center: center,
                    radius: radius,
                    startAngle: .radians(startAngle),
                    endAngle: .radians(endAngle),
                    clockwise: false
                )

                context.stroke(
                    path,
                    with: .color(colors[i]),
                    lineWidth: 2.5
                )

                startAngle = endAngle
            }
        }
        .frame(width: 24, height: 24)
    }
}
