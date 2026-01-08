import SwiftUI

struct TaskDetailView: View {
    let task: AgentTask
    @ObservedObject var service: AgentQueueService
    @Environment(\.dismiss) private var dismiss

    @State private var isApproving = false
    @State private var showVoiceInput = false
    @State private var approvalSuccess = false
    @State private var messageSent = false

    var body: some View {
        ScrollView {
            VStack(spacing: 16) {
                // Agent Header
                VStack(spacing: 8) {
                    Text(task.agentEmoji)
                        .font(.system(size: 40))

                    Text(task.agentName)
                        .font(.headline)

                    HStack {
                        Circle()
                            .fill(priorityColor(task.priority))
                            .frame(width: 10, height: 10)
                        Text(task.priority.rawValue.capitalized)
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                }

                Divider()

                // Task Details
                VStack(alignment: .leading, spacing: 8) {
                    Text("Task")
                        .font(.caption)
                        .foregroundColor(.secondary)
                    Text(task.task)
                        .font(.body)

                    if let reason = task.blockedReason {
                        Text("Motivo blocco")
                            .font(.caption)
                            .foregroundColor(.secondary)
                            .padding(.top, 8)
                        Text(reason)
                            .font(.body)
                            .foregroundColor(.red)
                    }
                }
                .frame(maxWidth: .infinity, alignment: .leading)

                Divider()

                // Action Buttons
                if approvalSuccess {
                    VStack(spacing: 8) {
                        Image(systemName: "checkmark.circle.fill")
                            .font(.largeTitle)
                            .foregroundColor(.green)
                        Text("Approvato!")
                            .font(.headline)
                    }
                    .onAppear {
                        DispatchQueue.main.asyncAfter(deadline: .now() + 1.5) {
                            dismiss()
                        }
                    }
                } else if messageSent {
                    VStack(spacing: 8) {
                        Image(systemName: "paperplane.circle.fill")
                            .font(.largeTitle)
                            .foregroundColor(.blue)
                        Text("Messaggio inviato!")
                            .font(.headline)
                    }
                    .onAppear {
                        DispatchQueue.main.asyncAfter(deadline: .now() + 1.5) {
                            dismiss()
                        }
                    }
                } else {
                    VStack(spacing: 12) {
                        // Approve Button
                        Button {
                            approveTask()
                        } label: {
                            HStack {
                                if isApproving {
                                    ProgressView()
                                        .progressViewStyle(.circular)
                                        .tint(.white)
                                } else {
                                    Image(systemName: "checkmark.circle.fill")
                                    Text("Approva")
                                }
                            }
                            .frame(maxWidth: .infinity)
                        }
                        .buttonStyle(.borderedProminent)
                        .tint(.green)
                        .disabled(isApproving)

                        // Talk Button (Voice Input)
                        Button {
                            showVoiceInput = true
                        } label: {
                            HStack {
                                Image(systemName: "mic.fill")
                                Text("Parla")
                            }
                            .frame(maxWidth: .infinity)
                        }
                        .buttonStyle(.borderedProminent)
                        .tint(.blue)
                        .disabled(isApproving)
                    }
                }
            }
            .padding()
        }
        .navigationTitle("Dettaglio")
        .navigationBarTitleDisplayMode(.inline)
        .sheet(isPresented: $showVoiceInput) {
            VoiceInputView(task: task, service: service, onSent: {
                messageSent = true
                showVoiceInput = false
            })
        }
    }

    private func approveTask() {
        isApproving = true
        Task {
            let success = await service.approveTask(task.id)
            isApproving = false
            if success {
                // Haptic feedback
                WKInterfaceDevice.current().play(.success)
                approvalSuccess = true
            } else {
                WKInterfaceDevice.current().play(.failure)
            }
        }
    }

    private func priorityColor(_ priority: AgentTask.Priority) -> Color {
        switch priority {
        case .high: return .red
        case .medium: return .orange
        case .low: return .green
        }
    }
}

// MARK: - Voice Input View

struct VoiceInputView: View {
    let task: AgentTask
    @ObservedObject var service: AgentQueueService
    var onSent: () -> Void

    @State private var message = ""
    @State private var isSending = false
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationStack {
            VStack(spacing: 16) {
                Text("Messaggio per \(task.agentName)")
                    .font(.headline)
                    .multilineTextAlignment(.center)

                // Text input with dictation
                TextField("Scrivi o detta...", text: $message, axis: .vertical)
                    .textFieldStyle(.roundedBorder)
                    .lineLimit(3...6)

                HStack(spacing: 12) {
                    Button("Annulla") {
                        dismiss()
                    }
                    .buttonStyle(.bordered)

                    Button {
                        sendMessage()
                    } label: {
                        if isSending {
                            ProgressView()
                                .progressViewStyle(.circular)
                        } else {
                            Text("Invia")
                        }
                    }
                    .buttonStyle(.borderedProminent)
                    .disabled(message.isEmpty || isSending)
                }
            }
            .padding()
            .navigationTitle("Parla")
            .navigationBarTitleDisplayMode(.inline)
        }
    }

    private func sendMessage() {
        guard !message.isEmpty else { return }
        isSending = true

        Task {
            let success = await service.sendMessage(task.id, message: message)
            isSending = false
            if success {
                WKInterfaceDevice.current().play(.success)
                onSent()
            } else {
                WKInterfaceDevice.current().play(.failure)
            }
        }
    }
}

#Preview {
    let mockTask = AgentTask(
        id: "1",
        agentName: "Pina Pennello",
        agentType: .pinaPennello,
        task: "Generare illustrazioni per libro",
        status: .blocked,
        blockedReason: "Stile visivo non definito",
        priority: .high,
        createdAt: "2026-01-07",
        startedAt: nil,
        completedAt: nil
    )
    return TaskDetailView(task: mockTask, service: AgentQueueService())
}
