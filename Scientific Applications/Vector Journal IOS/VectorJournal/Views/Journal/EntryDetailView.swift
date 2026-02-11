import SwiftUI
import SwiftData

struct EntryDetailView: View {
    let entry: JournalEntry

    @Query private var references: [PrimaryReference]
    @Query private var profiles: [UserProfile]

    private var tier: SubscriptionTier {
        profiles.first?.tier ?? .free
    }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 24) {
                // Section 1: Entry text
                VStack(alignment: .leading, spacing: 8) {
                    Text(entry.body)
                        .font(CanonFonts.body)
                        .foregroundStyle(CanonColors.xiPrimary)
                        .lineSpacing(4)

                    if let tag = entry.contextTag {
                        Text(tag)
                            .font(CanonFonts.caption)
                            .foregroundStyle(CanonColors.vectorMid.opacity(0.7))
                            .padding(.horizontal, 8)
                            .padding(.vertical, 4)
                            .background(CanonColors.vectorMid.opacity(0.1))
                            .clipShape(RoundedRectangle(cornerRadius: 4))
                    }
                }
                .padding(.horizontal, 16)

                // Section 2: Vector Visualization
                if entry.analysisStatus == .complete, let vector = entry.vector {
                    VectorFieldView(
                        vectors: [vector],
                        references: references,
                        showTimeSeries: false
                    )
                    .padding(.horizontal, 16)
                } else if entry.analysisStatus == .analyzing {
                    analysisInProgress
                } else if entry.analysisStatus == .failed {
                    analysisFailedView
                }

                // Section 3: Perspective (Plus only)
                if CanonPolicy.perspectiveAvailable(for: tier) {
                    PerspectiveCardView(
                        perspective: entry.perspective,
                        isLocked: false
                    )
                    .padding(.horizontal, 16)
                } else {
                    PerspectiveCardView(
                        perspective: nil,
                        isLocked: true
                    )
                    .padding(.horizontal, 16)
                }

                // Section 4: Metadata
                if let vector = entry.vector {
                    metadataSection(vector: vector)
                }
            }
            .padding(.vertical, 16)
        }
        .background(CanonColors.backgroundPrimary)
        .navigationTitle(entry.createdAt.formatted(date: .abbreviated, time: .shortened))
        .navigationBarTitleDisplayMode(.inline)
        .toolbarColorScheme(.dark, for: .navigationBar)
    }

    private var analysisInProgress: some View {
        HStack(spacing: 12) {
            ProgressView()
                .tint(CanonColors.xiTertiary)
            Text("Analyzing orientation...")
                .font(CanonFonts.caption)
                .foregroundStyle(CanonColors.xiTertiary)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 40)
    }

    private var analysisFailedView: some View {
        VStack(spacing: 8) {
            Image(systemName: "exclamationmark.circle")
                .font(.system(size: 20))
                .foregroundStyle(CanonColors.collapse)

            Text("Analysis unavailable")
                .font(CanonFonts.caption)
                .foregroundStyle(CanonColors.xiTertiary)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 40)
    }

    private func metadataSection(vector: EntryVector) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("METADATA")
                .font(CanonFonts.label)
                .foregroundStyle(CanonColors.xiTertiary)
                .tracking(2)

            HStack(spacing: 16) {
                MetadataItem(label: "coherence", value: String(format: "%.2f", vector.coherence))
                MetadataItem(label: "magnitude", value: String(format: "%.2f", vector.orientationMagnitude))
                MetadataItem(label: "drift", value: vector.driftTimescale.rawValue)
            }
        }
        .padding(.horizontal, 16)
    }
}

private struct MetadataItem: View {
    let label: String
    let value: String

    var body: some View {
        VStack(alignment: .leading, spacing: 2) {
            Text(label)
                .font(CanonFonts.caption)
                .foregroundStyle(CanonColors.xiTertiary)
            Text(value)
                .font(CanonFonts.body)
                .foregroundStyle(CanonColors.xiSecondary)
        }
    }
}
