import SwiftUI
import StoreKit

struct SubscriptionView: View {
    @Environment(\.dismiss) private var dismiss
    @State private var subscriptionService = SubscriptionService()
    @State private var isPurchasing = false
    @State private var errorMessage: String?

    var body: some View {
        NavigationStack {
            ZStack {
                CanonColors.backgroundPrimary
                    .ignoresSafeArea()

                ScrollView {
                    VStack(spacing: 32) {
                        // Header
                        VStack(spacing: 12) {
                            Text("\u{039E}")
                                .font(.system(size: 44, weight: .light, design: .monospaced))
                                .foregroundStyle(CanonColors.vectorMid)

                            Text("Vector Journal Plus")
                                .font(CanonFonts.title)
                                .foregroundStyle(CanonColors.xiPrimary)

                            Text("Deepen your orientation over time")
                                .font(CanonFonts.body)
                                .foregroundStyle(CanonColors.xiTertiary)
                        }
                        .padding(.top, 20)

                        // Feature comparison
                        VStack(spacing: 0) {
                            FeatureRow(feature: "Journal entries", free: "30", plus: "Unlimited")
                            FeatureRow(feature: "Vector visualization", free: "Single", plus: "Time series")
                            FeatureRow(feature: "Perspective layer", free: "—", plus: "Included")
                            FeatureRow(feature: "Reference changes", free: "0 / year", plus: "1 / year")
                        }
                        .clipShape(RoundedRectangle(cornerRadius: 12))
                        .overlay(
                            RoundedRectangle(cornerRadius: 12)
                                .stroke(CanonColors.border, lineWidth: 1)
                        )
                        .padding(.horizontal, 20)

                        // Purchase buttons
                        VStack(spacing: 12) {
                            ForEach(subscriptionService.availableProducts, id: \.id) { product in
                                Button {
                                    Task { await purchase(product) }
                                } label: {
                                    VStack(spacing: 4) {
                                        Text(product.displayName)
                                            .font(CanonFonts.heading)
                                            .foregroundStyle(CanonColors.backgroundPrimary)
                                        Text(product.displayPrice)
                                            .font(CanonFonts.caption)
                                            .foregroundStyle(CanonColors.backgroundPrimary.opacity(0.8))
                                    }
                                    .frame(maxWidth: .infinity)
                                    .padding(.vertical, 14)
                                    .background(CanonColors.vectorMid)
                                    .clipShape(RoundedRectangle(cornerRadius: 10))
                                }
                                .disabled(isPurchasing)
                            }

                            Button {
                                Task {
                                    await subscriptionService.restorePurchases()
                                }
                            } label: {
                                Text("Restore Purchases")
                                    .font(CanonFonts.body)
                                    .foregroundStyle(CanonColors.xiTertiary)
                            }
                            .padding(.top, 8)
                        }
                        .padding(.horizontal, 40)

                        if let error = errorMessage {
                            Text(error)
                                .font(CanonFonts.caption)
                                .foregroundStyle(CanonColors.collapse)
                        }
                    }
                    .padding(.bottom, 40)
                }
            }
            .navigationBarTitleDisplayMode(.inline)
            .toolbarColorScheme(.dark, for: .navigationBar)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Close") { dismiss() }
                        .foregroundStyle(CanonColors.xiTertiary)
                }
            }
            .onAppear {
                subscriptionService.start()
            }
        }
    }

    private func purchase(_ product: Product) async {
        isPurchasing = true
        errorMessage = nil
        do {
            let tier = try await subscriptionService.purchase(product)
            if tier == .plus {
                dismiss()
            }
        } catch {
            errorMessage = error.localizedDescription
        }
        isPurchasing = false
    }
}

private struct FeatureRow: View {
    let feature: String
    let free: String
    let plus: String

    var body: some View {
        HStack(spacing: 0) {
            Text(feature)
                .font(CanonFonts.caption)
                .foregroundStyle(CanonColors.xiSecondary)
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding(.leading, 16)

            Text(free)
                .font(CanonFonts.caption)
                .foregroundStyle(CanonColors.xiTertiary)
                .frame(width: 80)

            Text(plus)
                .font(CanonFonts.caption)
                .foregroundStyle(CanonColors.vectorMid)
                .frame(width: 80)
                .padding(.trailing, 8)
        }
        .padding(.vertical, 10)
        .background(CanonColors.surfaceRaised)
    }
}
