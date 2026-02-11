import SwiftUI

struct ReferenceConfirmationView: View {
    @Bindable var viewModel: OnboardingViewModel
    let onConfirm: () -> Void

    var body: some View {
        VStack(spacing: 32) {
            Spacer()

            VStack(spacing: 24) {
                Text("Your orientation anchors")
                    .font(CanonFonts.heading)
                    .foregroundStyle(CanonColors.xiPrimary)

                VStack(spacing: 16) {
                    ReferenceDisplay(label: "F", name: viewModel.reference0, color: CanonColors.frameMid)
                    ReferenceDisplay(label: "G", name: viewModel.reference1, color: CanonColors.gradientMid)
                    ReferenceDisplay(label: "V", name: viewModel.reference2, color: CanonColors.vectorMid)
                }
                .padding(.horizontal, 32)
            }

            // Acknowledgment
            VStack(spacing: 16) {
                Text("These are not goals.\nThey are orientation anchors.")
                    .font(CanonFonts.body)
                    .foregroundStyle(CanonColors.xiSecondary)
                    .multilineTextAlignment(.center)

                Button {
                    withAnimation { viewModel.hasAcknowledged.toggle() }
                } label: {
                    HStack(spacing: 10) {
                        Image(systemName: viewModel.hasAcknowledged ? "checkmark.circle.fill" : "circle")
                            .foregroundStyle(viewModel.hasAcknowledged ? CanonColors.xiPrimary : CanonColors.xiTertiary)
                            .font(.system(size: 22))

                        Text("I understand")
                            .font(CanonFonts.body)
                            .foregroundStyle(CanonColors.xiSecondary)
                    }
                }
            }

            Spacer()

            Button(action: onConfirm) {
                Text("Confirm")
                    .font(CanonFonts.heading)
                    .foregroundStyle(
                        viewModel.hasAcknowledged
                            ? CanonColors.backgroundPrimary
                            : CanonColors.xiTertiary
                    )
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 14)
                    .background(
                        viewModel.hasAcknowledged
                            ? CanonColors.xiPrimary
                            : CanonColors.surfaceRaised
                    )
                    .clipShape(RoundedRectangle(cornerRadius: 10))
            }
            .disabled(!viewModel.hasAcknowledged)
            .padding(.horizontal, 40)
            .padding(.bottom, 40)
        }
    }
}

private struct ReferenceDisplay: View {
    let label: String
    let name: String
    let color: Color

    var body: some View {
        HStack(spacing: 16) {
            Text(label)
                .font(CanonFonts.glyph)
                .foregroundStyle(color)
                .frame(width: 30)

            Text(name)
                .font(CanonFonts.body)
                .foregroundStyle(CanonColors.xiPrimary)

            Spacer()
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 12)
        .background(CanonColors.surfaceRaised)
        .clipShape(RoundedRectangle(cornerRadius: 8))
        .overlay(
            RoundedRectangle(cornerRadius: 8)
                .stroke(color.opacity(0.3), lineWidth: 1)
        )
    }
}
