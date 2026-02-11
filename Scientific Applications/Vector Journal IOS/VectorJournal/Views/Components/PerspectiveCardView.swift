import SwiftUI

/// Displays the Canon-validated perspective text for an entry.
/// Non-interactive. Descriptive only.
struct PerspectiveCardView: View {
    let perspective: PerspectiveResult?
    let isLocked: Bool

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text("PERSPECTIVE")
                    .font(CanonFonts.label)
                    .foregroundStyle(CanonColors.xiTertiary)
                    .tracking(2)

                Spacer()

                if let p = perspective {
                    Text(p.functionUsed.replacingOccurrences(of: "_", with: " "))
                        .font(CanonFonts.caption)
                        .foregroundStyle(CanonColors.vectorMid.opacity(0.7))
                }
            }

            if isLocked {
                VStack(spacing: 8) {
                    Image(systemName: "lock")
                        .font(.system(size: 20))
                        .foregroundStyle(CanonColors.xiTertiary)

                    Text("Perspective available with Plus")
                        .font(CanonFonts.caption)
                        .foregroundStyle(CanonColors.xiTertiary)
                }
                .frame(maxWidth: .infinity)
                .padding(.vertical, 20)
            } else if let p = perspective {
                Text(p.text)
                    .font(CanonFonts.body)
                    .foregroundStyle(CanonColors.xiSecondary)
                    .lineSpacing(4)
            } else {
                Text("Perspective unavailable for this entry.")
                    .font(CanonFonts.caption)
                    .foregroundStyle(CanonColors.xiTertiary)
            }
        }
        .padding(16)
        .background(CanonColors.surfaceRaised)
        .clipShape(RoundedRectangle(cornerRadius: 12))
        .overlay(
            RoundedRectangle(cornerRadius: 12)
                .stroke(CanonColors.border, lineWidth: 1)
        )
    }
}
