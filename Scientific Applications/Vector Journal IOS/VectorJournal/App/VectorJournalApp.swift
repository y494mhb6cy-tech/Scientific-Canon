import SwiftUI
import SwiftData

@main
struct VectorJournalApp: App {
    let container: ModelContainer

    init() {
        let schema = Schema([
            JournalEntry.self,
            EntryVector.self,
            PerspectiveResult.self,
            PrimaryReference.self,
            UserProfile.self,
            ReferenceChangeRecord.self
        ])
        let config = ModelConfiguration(
            schema: schema,
            isStoredInMemoryOnly: false
        )
        do {
            self.container = try ModelContainer(for: schema, configurations: [config])
        } catch {
            // Schema changed during development — delete old store and retry
            let url = config.url
            try? FileManager.default.removeItem(at: url)
            // Also remove WAL/SHM files
            try? FileManager.default.removeItem(at: url.appendingPathExtension("wal"))
            try? FileManager.default.removeItem(at: url.appendingPathExtension("shm"))
            do {
                self.container = try ModelContainer(for: schema, configurations: [config])
            } catch {
                fatalError("Failed to create ModelContainer after reset: \(error)")
            }
        }
    }

    var body: some Scene {
        WindowGroup {
            RootView()
        }
        .modelContainer(container)
    }
}
