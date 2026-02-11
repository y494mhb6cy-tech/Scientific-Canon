import SwiftUI

struct ReferenceSelectionView: View {
    @Bindable var viewModel: OnboardingViewModel
    let onContinue: () -> Void

    var body: some View {
        VStack(spacing: 32) {
            Spacer()

            VStack(spacing: 12) {
                Text("Define your orientation")
                    .font(CanonFonts.heading)
                    .foregroundStyle(CanonColors.xiPrimary)

                Text("Name three things that define\nwhere you are pointed.")
                    .font(CanonFonts.body)
                    .foregroundStyle(CanonColors.xiTertiary)
                    .multilineTextAlignment(.center)
            }

            VStack(spacing: 20) {
                ReferenceField(
                    label: "F",
                    color: CanonColors.frameMid,
                    text: $viewModel.reference0,
                    error: viewModel.validationErrors[0]
                )

                ReferenceField(
                    label: "G",
                    color: CanonColors.gradientMid,
                    text: $viewModel.reference1,
                    error: viewModel.validationErrors[1]
                )

                ReferenceField(
                    label: "V",
                    color: CanonColors.vectorMid,
                    text: $viewModel.reference2,
                    error: viewModel.validationErrors[2]
                )
            }
            .padding(.horizontal, 32)

            Spacer()

            Button(action: onContinue) {
                Text("Continue")
                    .font(CanonFonts.heading)
                    .foregroundStyle(
                        viewModel.canProceedFromReferences
                            ? CanonColors.backgroundPrimary
                            : CanonColors.xiTertiary
                    )
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 14)
                    .background(
                        viewModel.canProceedFromReferences
                            ? CanonColors.xiPrimary
                            : CanonColors.surfaceRaised
                    )
                    .clipShape(RoundedRectangle(cornerRadius: 10))
            }
            .disabled(!viewModel.canProceedFromReferences)
            .padding(.horizontal, 40)
            .padding(.bottom, 40)
        }
    }
}

private struct ReferenceField: View {
    let label: String
    let color: Color
    @Binding var text: String
    let error: String?

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            HStack(spacing: 12) {
                Text(label)
                    .font(CanonFonts.glyph)
                    .foregroundStyle(color)
                    .frame(width: 30)

                TextField("", text: $text, prompt: Text("noun-identity anchor")
                    .foregroundStyle(CanonColors.xiTertiary.opacity(0.5)))
                    .font(CanonFonts.body)
                    .foregroundStyle(CanonColors.xiPrimary)
                    .autocorrectionDisabled()
                    .textInputAutocapitalization(.words)
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 12)
            .background(CanonColors.surfaceRaised)
            .clipShape(RoundedRectangle(cornerRadius: 8))
            .overlay(
                RoundedRectangle(cornerRadius: 8)
                    .stroke(error != nil ? CanonColors.collapse : color.opacity(0.3), lineWidth: 1)
            )

            if let error {
                Text(error)
                    .font(CanonFonts.caption)
                    .foregroundStyle(CanonColors.collapse)
                    .padding(.leading, 42)
            }
        }
    }
}
