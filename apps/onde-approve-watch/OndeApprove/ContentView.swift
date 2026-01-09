import SwiftUI
import WatchKit

struct ContentView: View {
    @StateObject private var service = AgentQueueService()
    @State private var showSettings = false
    @State private var previousTaskCount = 0

    var body: some View {
        NavigationStack {
            Group {
                if service.isLoading && service.blockedTasks.isEmpty {
                    ProgressView()
                        .progressViewStyle(.circular)
                } else if let error = service.errorMessage, service.blockedTasks.isEmpty {
                    VStack(spacing: 8) {
                        Image(systemName: "wifi.slash")
                            .font(.title2)
                            .foregroundColor(.red)
                        Text(error)
                            .font(.caption)
                            .multilineTextAlignment(.center)
                        Button("Riprova") {
                            Task { await service.fetchBlockedTasks() }
                        }
                        .buttonStyle(.borderedProminent)
                        .tint(.blue)
                    }
                } else if service.blockedTasks.isEmpty {
                    VStack(spacing: 8) {
                        Image(systemName: "checkmark.circle.fill")
                            .font(.largeTitle)
                            .foregroundColor(.green)
                        Text("Tutto OK")
                            .font(.headline)
                        Text("Nessun agente bloccato")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                } else {
                    List {
                        ForEach(service.blockedTasks) { task in
                            NavigationLink(destination: TaskDetailView(task: task, service: service)) {
                                TaskRowView(task: task)
                            }
                        }
                    }
                }
            }
            .navigationTitle("Onde")
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button {
                        showSettings = true
                    } label: {
                        Image(systemName: "gear")
                    }
                }
            }
            .sheet(isPresented: $showSettings) {
                SettingsView(service: service)
            }
        }
        .task {
            await service.fetchBlockedTasks()
        }
        .refreshable {
            await service.fetchBlockedTasks()
        }
        .onChange(of: service.blockedTasks.count) { oldValue, newValue in
            // Haptic feedback when new tasks arrive
            if newValue > oldValue && newValue > 0 {
                // New blocked task - alert the user
                WKInterfaceDevice.current().play(.notification)
            } else if newValue == 0 && oldValue > 0 {
                // All tasks cleared - success
                WKInterfaceDevice.current().play(.success)
            }
            previousTaskCount = newValue
        }
    }
}

// MARK: - Task Row View

struct TaskRowView: View {
    let task: AgentTask

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            HStack {
                Text(task.agentEmoji)
                Text(task.agentName)
                    .font(.headline)
                    .lineLimit(1)
            }

            Text(task.blockedReason ?? task.task)
                .font(.caption)
                .foregroundColor(.secondary)
                .lineLimit(2)

            HStack {
                Circle()
                    .fill(priorityColor(task.priority))
                    .frame(width: 8, height: 8)
                Text(task.priority.rawValue.capitalized)
                    .font(.caption2)
                    .foregroundColor(.secondary)
            }
        }
        .padding(.vertical, 4)
    }

    private func priorityColor(_ priority: AgentTask.Priority) -> Color {
        switch priority {
        case .high: return .red
        case .medium: return .orange
        case .low: return .green
        }
    }
}

// MARK: - Settings View

struct SettingsView: View {
    @ObservedObject var service: AgentQueueService
    @State private var apiURL: String = ""
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationStack {
            Form {
                Section("API Server") {
                    TextField("URL", text: $apiURL)
                        .textContentType(.URL)
                        .autocapitalization(.none)
                }

                Section {
                    Button("Salva") {
                        service.setBaseURL(apiURL)
                        // Haptic feedback on save
                        WKInterfaceDevice.current().play(.click)
                        dismiss()
                        Task { await service.fetchBlockedTasks() }
                    }
                    .buttonStyle(.borderedProminent)
                }
            }
            .navigationTitle("Impostazioni")
            .onAppear {
                apiURL = UserDefaults.standard.string(forKey: "apiBaseURL") ?? ""
            }
        }
    }
}

#Preview {
    ContentView()
}
