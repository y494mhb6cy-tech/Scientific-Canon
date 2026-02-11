import Foundation
import SwiftData

@MainActor @Observable
final class OnboardingViewModel {
    var currentStep: OnboardingStep = .glyphIntro
    var reference0: String = ""
    var reference1: String = ""
    var reference2: String = ""
    var hasAcknowledged: Bool = false

    var validationErrors: [Int: String] = [:]

    var canProceedFromReferences: Bool {
        let refs = [reference0, reference1, reference2]
        return refs.allSatisfy { CanonPolicy.isValidReference($0) }
    }

    func validateReferences() -> Bool {
        validationErrors.removeAll()
        let refs = [reference0, reference1, reference2]
        for (i, ref) in refs.enumerated() {
            if !CanonPolicy.isValidReference(ref) {
                if ref.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
                    validationErrors[i] = "Reference cannot be empty."
                } else {
                    validationErrors[i] = "Must be a noun-identity anchor, not a goal, verb, or emotion."
                }
            }
        }
        return validationErrors.isEmpty
    }

    func completeOnboarding(context: ModelContext) {
        let refs = [reference0, reference1, reference2]
        for (i, label) in refs.enumerated() {
            let ref = PrimaryReference(
                label: label.trimmingCharacters(in: .whitespacesAndNewlines),
                ordinal: i
            )
            context.insert(ref)
        }

        let profile = UserProfile()
        profile.hasCompletedOnboarding = true
        context.insert(profile)

        try? context.save()
    }
}

enum OnboardingStep: Int, CaseIterable {
    case glyphIntro = 0
    case referenceSelection = 1
    case referenceConfirmation = 2
    case firstEntry = 3
}
