import SwiftUI
import SwiftData

struct ComposeView: View {
    @Environment(\.modelContext) private var modelContext
    @Environment(\.dismiss) private var dismiss
    @Query private var references: [PrimaryReference]
    @Query private var profiles: [UserProfile]

    @State private var viewModel = ComposeViewModel()
    @State private var showTagField = false

    private var tier: SubscriptionTier {
        profiles.first?.tier ?? .free
    }

    var body: some View {
        ZStack {
            CanonColors.backgroundPrimary
                .ignoresSafeArea()

            VStack(spacing: 0) {
                // Text editor — no prompts, no suggestions (Canon-enforced)
                TextEditor(text: $viewModel.bodyText)
                    .font(CanonFonts.body)
                    .foregroundStyle(CanonColors.xiPrimary)
                    .scrollContentBackground(.hidden)
                    .padding(.horizontal, 16)
                    .padding(.top, 8)

                // Context tag
                if showTagField {
                    HStack(spacing: 8) {
                        Image(systemName: "tag")
                            .font(.system(size: 14))
                            .foregroundStyle(CanonColors.vectorMid)

                        TextField("", text: $viewModel.contextTag, prompt: Text("context tag")
                            .foregroundStyle(CanonColors.xiTertiary.opacity(0.5)))
                            .font(CanonFonts.caption)
                            .foregroundStyle(CanonColors.xiSecondary)
                            .autocorrectionDisabled()
                            .textInputAutocapitalization(.never)
                    }
                    .padding(.horizontal, 16)
                    .padding(.vertical, 10)
                    .background(CanonColors.surfaceRaised)
                }
            }
        }
        .navigationTitle("New Entry")
        .navigationBarTitleDisplayMode(.inline)
        .toolbarColorScheme(.dark, for: .navigationBar)
        .toolbar {
            ToolbarItem(placement: .cancellationAction) {
                Button("Cancel") {
                    dismiss()
                }
                .foregroundStyle(CanonColors.xiTertiary)
            }

            ToolbarItem(placement: .primaryAction) {
                HStack(spacing: 16) {
                    Button {
                        withAnimation { showTagField.toggle() }
                    } label: {
                        Image(systemName: "tag")
                            .foregroundStyle(
                                showTagField ? CanonColors.vectorMid : CanonColors.xiTertiary
                            )
                    }

                    Button("Save") {
                        Task {
                            _ = await viewModel.saveEntry(
                                context: modelContext,
                                references: references,
                                tier: tier
                            )
                            dismiss()
                        }
                    }
                    .font(CanonFonts.heading)
                    .foregroundStyle(
                        viewModel.canSave ? CanonColors.xiPrimary : CanonColors.xiTertiary
                    )
                    .disabled(!viewModel.canSave)
                }
            }
        }
    }
}
