import SwiftUI
import SwiftData

struct SettingsView: View {
    @Environment(\.dismiss) private var dismiss
    @Query private var profiles: [UserProfile]
    @Query(sort: \PrimaryReference.ordinal) private var references: [PrimaryReference]

    @State private var showSubscription = false

    private var profile: UserProfile? {
        profiles.first
    }

    private var tier: SubscriptionTier {
        profile?.tier ?? .free
    }

    var body: some View {
        NavigationStack {
            ZStack {
                CanonColors.backgroundPrimary
                    .ignoresSafeArea()

                List {
                    // Tier
                    Section {
                        HStack {
                            Text("Current Tier")
                                .font(CanonFonts.body)
                                .foregroundStyle(CanonColors.xiSecondary)
                            Spacer()
                            Text(tier == .plus ? "Plus" : "Free")
                                .font(CanonFonts.body)
                                .foregroundStyle(tier == .plus ? CanonColors.vectorMid : CanonColors.xiTertiary)
                        }
                        .listRowBackground(CanonColors.surfaceRaised)

                        if tier == .free {
                            Button {
                                showSubscription = true
                            } label: {
                                Text("Upgrade to Plus")
                                    .font(CanonFonts.body)
                                    .foregroundStyle(CanonColors.vectorMid)
                            }
                            .listRowBackground(CanonColors.surfaceRaised)
                        }
                    } header: {
                        Text("SUBSCRIPTION")
                            .font(CanonFonts.label)
                            .foregroundStyle(CanonColors.xiTertiary)
                    }

                    // References
                    Section {
                        ForEach(references) { ref in
                            HStack(spacing: 12) {
                                Text(["F", "G", "V"][safe: ref.ordinal] ?? "?")
                                    .font(CanonFonts.glyph)
                                    .foregroundStyle(referenceColor(ref.ordinal))
                                    .frame(width: 24)

                                Text(ref.label)
                                    .font(CanonFonts.body)
                                    .foregroundStyle(CanonColors.xiPrimary)
                            }
                            .listRowBackground(CanonColors.surfaceRaised)
                        }

                        if CanonPolicy.referenceChangesPerYear(for: tier) > 0 {
                            let used = profile?.referenceChangesThisYear ?? 0
                            let allowed = CanonPolicy.referenceChangesPerYear(for: tier)
                            Text("Changes this year: \(used) / \(allowed)")
                                .font(CanonFonts.caption)
                                .foregroundStyle(CanonColors.xiTertiary)
                                .listRowBackground(CanonColors.surfaceRaised)
                        } else {
                            Text("Reference changes require Plus")
                                .font(CanonFonts.caption)
                                .foregroundStyle(CanonColors.xiTertiary)
                                .listRowBackground(CanonColors.surfaceRaised)
                        }
                    } header: {
                        Text("REFERENCES")
                            .font(CanonFonts.label)
                            .foregroundStyle(CanonColors.xiTertiary)
                    }

                    // About
                    Section {
                        VStack(alignment: .leading, spacing: 8) {
                            Text("Vector Journal")
                                .font(CanonFonts.heading)
                                .foregroundStyle(CanonColors.xiPrimary)

                            Text("This app does not tell you who to be.")
                                .font(CanonFonts.body)
                                .foregroundStyle(CanonColors.xiTertiary)
                                .italic()
                        }
                        .listRowBackground(CanonColors.surfaceRaised)

                        HStack {
                            Text("Version")
                                .font(CanonFonts.body)
                                .foregroundStyle(CanonColors.xiSecondary)
                            Spacer()
                            Text("1.0.0")
                                .font(CanonFonts.caption)
                                .foregroundStyle(CanonColors.xiTertiary)
                        }
                        .listRowBackground(CanonColors.surfaceRaised)
                    } header: {
                        Text("ABOUT")
                            .font(CanonFonts.label)
                            .foregroundStyle(CanonColors.xiTertiary)
                    }
                }
                .listStyle(.insetGrouped)
                .scrollContentBackground(.hidden)
            }
            .navigationTitle("Settings")
            .navigationBarTitleDisplayMode(.inline)
            .toolbarColorScheme(.dark, for: .navigationBar)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Done") { dismiss() }
                        .foregroundStyle(CanonColors.xiTertiary)
                }
            }
            .sheet(isPresented: $showSubscription) {
                SubscriptionView()
            }
        }
    }

    private func referenceColor(_ ordinal: Int) -> Color {
        switch ordinal {
        case 0: return CanonColors.frameMid
        case 1: return CanonColors.gradientMid
        case 2: return CanonColors.vectorMid
        default: return CanonColors.xiTertiary
        }
    }
}

extension Array where Element == String {
    subscript(safe index: Int) -> String? {
        indices.contains(index) ? self[index] : nil
    }
}
