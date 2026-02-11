import SwiftUI
import SwiftData

/// SwiftUI wrapper for the Metal vector field visualization.
/// Shows anchor nodes, Xi center, bonds, and vector arcs for entries.
struct VectorFieldView: View {
    let vectors: [EntryVector]
    let references: [PrimaryReference]
    let showTimeSeries: Bool

    @State private var viewModel = VectorFieldViewModel()

    var body: some View {
        VStack(spacing: 8) {
            VectorMetalView(renderData: viewModel.renderData)
                .frame(height: 300)
                .clipShape(RoundedRectangle(cornerRadius: 12))
                .overlay(
                    RoundedRectangle(cornerRadius: 12)
                        .stroke(CanonColors.border, lineWidth: 1)
                )

            // Reference labels beneath
            HStack(spacing: 0) {
                ForEach(Array(viewModel.referenceLabels.enumerated()), id: \.offset) { index, label in
                    Text(label)
                        .font(CanonFonts.label)
                        .foregroundStyle(referenceColor(for: index))
                        .frame(maxWidth: .infinity)
                }
            }
            .padding(.horizontal, 8)
        }
        .onAppear {
            viewModel.prepare(
                vectors: vectors,
                references: references,
                showTimeSeries: showTimeSeries
            )
        }
        .onChange(of: vectors.count) {
            viewModel.prepare(
                vectors: vectors,
                references: references,
                showTimeSeries: showTimeSeries
            )
        }
    }

    private func referenceColor(for index: Int) -> Color {
        switch index {
        case 0: return CanonColors.frameMid
        case 1: return CanonColors.gradientMid
        case 2: return CanonColors.vectorMid
        default: return CanonColors.xiTertiary
        }
    }
}
