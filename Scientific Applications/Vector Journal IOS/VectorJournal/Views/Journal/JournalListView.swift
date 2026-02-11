import SwiftUI
import SwiftData

struct JournalListView: View {
    @Environment(\.modelContext) private var modelContext
    @Query(sort: \JournalEntry.createdAt, order: .reverse) private var entries: [JournalEntry]
    @Query private var profiles: [UserProfile]

    @State private var viewModel = JournalListViewModel()
    @State private var showCompose = false
    @State private var showSettings = false

    private var tier: SubscriptionTier {
        profiles.first?.tier ?? .free
    }

    var body: some View {
        NavigationStack {
            ZStack {
                CanonColors.backgroundPrimary
                    .ignoresSafeArea()

                if entries.isEmpty {
                    emptyState
                } else {
                    entryList
                }
            }
            .navigationTitle("Vector Journal")
            .navigationBarTitleDisplayMode(.inline)
            .toolbarColorScheme(.dark, for: .navigationBar)
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    Button {
                        showSettings = true
                    } label: {
                        Image(systemName: "gearshape")
                            .foregroundStyle(CanonColors.xiTertiary)
                    }
                }

                ToolbarItem(placement: .topBarTrailing) {
                    HStack(spacing: 12) {
                        if tier == .free {
                            Text("\(entries.count) / 30")
                                .font(CanonFonts.caption)
                                .foregroundStyle(CanonColors.xiTertiary)
                        }

                        Button {
                            showCompose = true
                        } label: {
                            Image(systemName: "plus")
                                .foregroundStyle(CanonColors.xiPrimary)
                        }
                        .disabled(!viewModel.canCreateEntry(tier: tier))
                    }
                }
            }
            .fullScreenCover(isPresented: $showCompose) {
                NavigationStack {
                    ComposeView()
                }
            }
            .sheet(isPresented: $showSettings) {
                SettingsView()
            }
            .onAppear {
                viewModel.refreshCount(context: modelContext)
            }
        }
    }

    private var emptyState: some View {
        VStack(spacing: 20) {
            Text("\u{039E}")
                .font(.system(size: 44, weight: .light, design: .monospaced))
                .foregroundStyle(CanonColors.xiTertiary)

            Text("No entries yet")
                .font(CanonFonts.heading)
                .foregroundStyle(CanonColors.xiTertiary)

            Button {
                showCompose = true
            } label: {
                Text("Write your first entry")
                    .font(CanonFonts.body)
                    .foregroundStyle(CanonColors.xiPrimary)
            }
        }
    }

    private var entryList: some View {
        List {
            ForEach(entries) { entry in
                NavigationLink(destination: EntryDetailView(entry: entry)) {
                    JournalEntryRow(entry: entry)
                }
                .listRowBackground(CanonColors.backgroundPrimary)
                .listRowSeparatorTint(CanonColors.border)
            }
            .onDelete { indexSet in
                for index in indexSet {
                    viewModel.deleteEntry(entries[index], context: modelContext)
                }
            }
        }
        .listStyle(.plain)
        .scrollContentBackground(.hidden)
    }
}

// MARK: - Entry Row

struct JournalEntryRow: View {
    let entry: JournalEntry

    var body: some View {
        HStack(spacing: 12) {
            MiniVectorIndicator(vector: entry.vector)

            VStack(alignment: .leading, spacing: 4) {
                Text(entry.body.prefix(60) + (entry.body.count > 60 ? "..." : ""))
                    .font(CanonFonts.body)
                    .foregroundStyle(CanonColors.xiSecondary)
                    .lineLimit(1)

                HStack(spacing: 8) {
                    Text(entry.createdAt, style: .relative)
                        .font(CanonFonts.caption)
                        .foregroundStyle(CanonColors.xiTertiary)

                    if let tag = entry.contextTag {
                        Text(tag)
                            .font(CanonFonts.caption)
                            .foregroundStyle(CanonColors.vectorMid.opacity(0.7))
                            .padding(.horizontal, 6)
                            .padding(.vertical, 2)
                            .background(CanonColors.vectorMid.opacity(0.1))
                            .clipShape(RoundedRectangle(cornerRadius: 4))
                    }

                    if entry.analysisStatus == .analyzing {
                        ProgressView()
                            .scaleEffect(0.6)
                            .tint(CanonColors.xiTertiary)
                    }
                }
            }
        }
        .padding(.vertical, 4)
    }
}
