import SwiftUI

struct GlyphIntroView: View {
    let onContinue: () -> Void

    @State private var showFrame = false
    @State private var showGradient = false
    @State private var showVector = false
    @State private var showXi = false
    @State private var showText = false

    var body: some View {
        VStack(spacing: 40) {
            Spacer()

            // Canonical glyph — triadic structure
            ZStack {
                // Co-dependence bonds
                if showXi {
                    CanonGlyphBonds()
                        .transition(.opacity)
                }

                // Frame node (top)
                if showFrame {
                    CanonNode(
                        label: "F",
                        sublabel: "FRAME",
                        color: CanonColors.frameMid,
                        offset: CGSize(width: 0, height: -100)
                    )
                    .transition(.opacity.combined(with: .scale))
                }

                // Gradient node (bottom-left)
                if showGradient {
                    CanonNode(
                        label: "G",
                        sublabel: "GRADIENT",
                        color: CanonColors.gradientMid,
                        offset: CGSize(width: -90, height: 60)
                    )
                    .transition(.opacity.combined(with: .scale))
                }

                // Vector node (bottom-right)
                if showVector {
                    CanonNode(
                        label: "V",
                        sublabel: "VECTOR",
                        color: CanonColors.vectorMid,
                        offset: CGSize(width: 90, height: 60)
                    )
                    .transition(.opacity.combined(with: .scale))
                }

                // Xi center
                if showXi {
                    VStack(spacing: 4) {
                        Text("\u{039E}")
                            .font(CanonFonts.title)
                            .foregroundStyle(CanonColors.xiPrimary)
                    }
                    .transition(.opacity.combined(with: .scale))
                }
            }
            .frame(height: 260)

            if showText {
                VStack(spacing: 16) {
                    Text("Meaning is directional.")
                        .font(CanonFonts.heading)
                        .foregroundStyle(CanonColors.xiPrimary)

                    Text("Clarity comes from knowing\nwhere you are pointed.")
                        .font(CanonFonts.body)
                        .foregroundStyle(CanonColors.xiTertiary)
                        .multilineTextAlignment(.center)
                }
                .transition(.opacity.combined(with: .move(edge: .bottom)))
            }

            Spacer()

            if showText {
                Button(action: onContinue) {
                    Text("Begin")
                        .font(CanonFonts.heading)
                        .foregroundStyle(CanonColors.backgroundPrimary)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 14)
                        .background(CanonColors.xiPrimary)
                        .clipShape(RoundedRectangle(cornerRadius: 10))
                }
                .padding(.horizontal, 40)
                .padding(.bottom, 40)
                .transition(.opacity)
            }
        }
        .onAppear {
            withAnimation(.easeOut(duration: 0.6).delay(0.3)) { showFrame = true }
            withAnimation(.easeOut(duration: 0.6).delay(0.7)) { showGradient = true }
            withAnimation(.easeOut(duration: 0.6).delay(1.1)) { showVector = true }
            withAnimation(.easeOut(duration: 0.8).delay(1.6)) { showXi = true }
            withAnimation(.easeOut(duration: 0.6).delay(2.2)) { showText = true }
        }
    }
}

// MARK: - Glyph Components

private struct CanonNode: View {
    let label: String
    let sublabel: String
    let color: Color
    let offset: CGSize

    var body: some View {
        VStack(spacing: 4) {
            Circle()
                .fill(color.opacity(0.15))
                .overlay(
                    Circle()
                        .stroke(color, lineWidth: 2)
                )
                .frame(width: 44, height: 44)
                .overlay(
                    Text(label)
                        .font(CanonFonts.glyph)
                        .foregroundStyle(color)
                )

            Text(sublabel)
                .font(CanonFonts.label)
                .foregroundStyle(color.opacity(0.8))
        }
        .offset(offset)
    }
}

private struct BondDescriptor {
    let from: CGPoint
    let to: CGPoint
    let color: Color
}

private struct CanonGlyphBonds: View {
    var body: some View {
        Canvas { context, size in
            let center = CGPoint(x: size.width / 2, y: size.height / 2)
            let top = CGPoint(x: center.x, y: center.y - 100)
            let bottomLeft = CGPoint(x: center.x - 90, y: center.y + 60)
            let bottomRight = CGPoint(x: center.x + 90, y: center.y + 60)

            let bonds: [BondDescriptor] = [
                BondDescriptor(from: top, to: bottomLeft, color: CanonColors.frameMid),
                BondDescriptor(from: bottomLeft, to: bottomRight, color: CanonColors.gradientMid),
                BondDescriptor(from: bottomRight, to: top, color: CanonColors.vectorMid)
            ]

            for bond in bonds {
                let midX = (bond.from.x + bond.to.x) / 2
                let midY = (bond.from.y + bond.to.y) / 2
                let control = CGPoint(
                    x: midX + (center.x - midX) * 0.4,
                    y: midY + (center.y - midY) * 0.4
                )
                var path = Path()
                path.move(to: bond.from)
                path.addQuadCurve(to: bond.to, control: control)
                context.stroke(
                    path,
                    with: .color(bond.color.opacity(0.3)),
                    style: StrokeStyle(lineWidth: 1.5, dash: [6, 4])
                )
            }
        }
    }
}
