import Foundation
import StoreKit

enum StoreProduct {
    static let plusMonthly = "com.vectorjournal.plus.monthly"
    static let plusYearly = "com.vectorjournal.plus.yearly"

    static let allIDs: Set<String> = [plusMonthly, plusYearly]
}

/// Manages StoreKit 2 subscriptions and tier resolution.
@MainActor @Observable
final class SubscriptionService {
    private(set) var currentTier: SubscriptionTier = .free
    private(set) var availableProducts: [Product] = []
    nonisolated(unsafe) private var updateListenerTask: Task<Void, Never>?

    func start() {
        updateListenerTask = Task {
            for await result in Transaction.updates {
                if let transaction = try? checkVerified(result) {
                    await transaction.finish()
                    await refreshStatus()
                }
            }
        }
        Task {
            await loadProducts()
            await refreshStatus()
        }
    }

    func loadProducts() async {
        do {
            availableProducts = try await Product.products(for: StoreProduct.allIDs)
                .sorted { $0.price < $1.price }
        } catch {
            availableProducts = []
        }
    }

    func purchase(_ product: Product) async throws -> SubscriptionTier {
        let result = try await product.purchase()
        switch result {
        case .success(let verification):
            let transaction = try checkVerified(verification)
            await transaction.finish()
            await refreshStatus()
            return currentTier
        case .userCancelled, .pending:
            return currentTier
        @unknown default:
            return currentTier
        }
    }

    func refreshStatus() async {
        for await result in Transaction.currentEntitlements {
            if let transaction = try? checkVerified(result),
               StoreProduct.allIDs.contains(transaction.productID) {
                currentTier = .plus
                return
            }
        }
        currentTier = .free
    }

    func restorePurchases() async {
        try? await AppStore.sync()
        await refreshStatus()
    }

    private func checkVerified<T>(_ result: VerificationResult<T>) throws -> T {
        switch result {
        case .unverified:
            throw SubscriptionError.unverifiedTransaction
        case .verified(let value):
            return value
        }
    }

    deinit {
        updateListenerTask?.cancel()
    }
}

enum SubscriptionError: Error {
    case unverifiedTransaction
}
