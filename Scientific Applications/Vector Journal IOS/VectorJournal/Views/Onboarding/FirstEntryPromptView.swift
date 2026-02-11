import SwiftUI

struct FirstEntryPromptView: View {
    let onBegin: () -> Void

    @State private var showContent = false

    var body: some View {
        VStack(spacing: 40) {
            Spacer()

            if showContent {
                VStack(spacing: 20) {
                    // Xi symbol
                    Text("\u{039E}")
                        .font(.system(size: 48, weight: .light, design: .monospaced))
                        .foregroundStyle(CanonColors.xiPrimary)

                    Text("Write your first entry.")
                        .font(CanonFonts.heading)
                        .foregroundStyle(CanonColors.xiPrimary)

                    Text("No analysis will appear\nuntil you save.")
                        .font(CanonFonts.body)
                        .foregroundStyle(CanonColors.xiTertiary)
                        .multilineTextAlignment(.center)
                }
                .transition(.opacity.combined(with: .move(edge: .bottom)))
            }

            Spacer()

            if showContent {
                Button(action: onBegin) {
                    Text("Write")
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
            withAnimation(.easeOut(duration: 0.6).delay(0.2)) {
                showContent = true
            }
        }
    }
}
