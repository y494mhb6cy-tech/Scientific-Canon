import SwiftUI
import SwiftData

struct OnboardingContainerView: View {
    @Environment(\.modelContext) private var modelContext
    @State private var viewModel = OnboardingViewModel()
    @State private var showCompose = false

    var body: some View {
        ZStack {
            CanonColors.backgroundPrimary
                .ignoresSafeArea()

            TabView(selection: $viewModel.currentStep) {
                GlyphIntroView(onContinue: {
                    withAnimation { viewModel.currentStep = .referenceSelection }
                })
                .tag(OnboardingStep.glyphIntro)

                ReferenceSelectionView(viewModel: viewModel, onContinue: {
                    if viewModel.validateReferences() {
                        withAnimation { viewModel.currentStep = .referenceConfirmation }
                    }
                })
                .tag(OnboardingStep.referenceSelection)

                ReferenceConfirmationView(viewModel: viewModel, onConfirm: {
                    viewModel.completeOnboarding(context: modelContext)
                    withAnimation { viewModel.currentStep = .firstEntry }
                })
                .tag(OnboardingStep.referenceConfirmation)

                FirstEntryPromptView(onBegin: {
                    showCompose = true
                })
                .tag(OnboardingStep.firstEntry)
            }
            .tabViewStyle(.page(indexDisplayMode: .never))
            .animation(.easeInOut, value: viewModel.currentStep)
        }
        .fullScreenCover(isPresented: $showCompose) {
            NavigationStack {
                ComposeView()
            }
        }
    }
}
