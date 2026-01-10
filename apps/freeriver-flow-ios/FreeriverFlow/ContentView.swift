//
//  ContentView.swift
//  FreeriverFlow
//
//  Main voice-first UI
//

import SwiftUI

struct ContentView: View {
    @StateObject private var viewModel = VoiceAssistantViewModel()
    @State private var textInput = ""
    @State private var showSettings = false

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                // Messages List
                messagesListView

                // Current Transcript
                if !viewModel.currentTranscript.isEmpty {
                    transcriptView
                }

                // Error Banner
                if let error = viewModel.errorMessage {
                    errorBannerView(error)
                }

                // Bottom Controls
                controlsView
            }
            .navigationTitle("Freeriver Flow")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    Button {
                        viewModel.clearConversation()
                    } label: {
                        Image(systemName: "trash")
                    }
                    .disabled(viewModel.messages.isEmpty)
                }

                ToolbarItem(placement: .topBarTrailing) {
                    Button {
                        showSettings = true
                    } label: {
                        Image(systemName: "gear")
                    }
                }
            }
            .sheet(isPresented: $showSettings) {
                SettingsView()
            }
        }
    }

    // MARK: - Messages List
    private var messagesListView: some View {
        ScrollViewReader { proxy in
            ScrollView {
                LazyVStack(spacing: 12) {
                    ForEach(viewModel.messages) { message in
                        MessageBubbleView(message: message)
                            .id(message.id)
                    }
                }
                .padding()
            }
            .onChange(of: viewModel.messages.count) { _, _ in
                if let lastMessage = viewModel.messages.last {
                    withAnimation {
                        proxy.scrollTo(lastMessage.id, anchor: .bottom)
                    }
                }
            }
        }
    }

    // MARK: - Transcript View
    private var transcriptView: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text("Trascrizione in tempo reale:")
                .font(.caption)
                .foregroundStyle(.secondary)
            Text(viewModel.currentTranscript)
                .font(.body)
                .italic()
        }
        .padding()
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Color(.systemGray6))
    }

    // MARK: - Error Banner
    private func errorBannerView(_ error: String) -> some View {
        HStack {
            Image(systemName: "exclamationmark.triangle.fill")
                .foregroundStyle(.orange)
            Text(error)
                .font(.caption)
            Spacer()
            Button {
                viewModel.errorMessage = nil
            } label: {
                Image(systemName: "xmark.circle.fill")
            }
        }
        .padding()
        .background(Color.orange.opacity(0.1))
    }

    // MARK: - Controls View
    private var controlsView: some View {
        VStack(spacing: 16) {
            // State Indicator
            HStack {
                Image(systemName: viewModel.assistantState.icon)
                    .font(.title2)
                    .foregroundStyle(stateColor)
                    .symbolEffect(.pulse, isActive: viewModel.assistantState != .idle)

                Text(viewModel.assistantState.rawValue)
                    .font(.headline)
                    .foregroundStyle(.secondary)
            }
            .padding(.top)

            // Main Voice Button
            VoiceButton(
                isListening: viewModel.speechRecognizer.isListening,
                isProcessing: viewModel.isProcessing,
                onTapStart: {
                    viewModel.startListening()
                },
                onTapStop: {
                    viewModel.stopListeningAndProcess()
                }
            )

            // Text Input Alternative
            HStack {
                TextField("Oppure scrivi qui...", text: $textInput)
                    .textFieldStyle(.roundedBorder)
                    .submitLabel(.send)
                    .onSubmit {
                        sendTextMessage()
                    }

                Button {
                    sendTextMessage()
                } label: {
                    Image(systemName: "arrow.up.circle.fill")
                        .font(.title2)
                }
                .disabled(textInput.trimmingCharacters(in: .whitespaces).isEmpty)
            }
            .padding(.horizontal)
            .padding(.bottom)
        }
        .background(Color(.systemBackground))
        .shadow(color: .black.opacity(0.1), radius: 5, y: -2)
    }

    private var stateColor: Color {
        switch viewModel.assistantState {
        case .idle: return .gray
        case .listening: return .red
        case .thinking: return .orange
        case .speaking: return .green
        }
    }

    private func sendTextMessage() {
        guard !textInput.trimmingCharacters(in: .whitespaces).isEmpty else { return }
        viewModel.sendTextMessage(textInput)
        textInput = ""
    }
}

// MARK: - Message Bubble View
struct MessageBubbleView: View {
    let message: Message

    var body: some View {
        HStack {
            if message.isUser { Spacer(minLength: 50) }

            VStack(alignment: message.isUser ? .trailing : .leading, spacing: 4) {
                Text(message.content)
                    .padding(12)
                    .background(message.isUser ? Color.blue : Color(.systemGray5))
                    .foregroundStyle(message.isUser ? .white : .primary)
                    .clipShape(RoundedRectangle(cornerRadius: 16))

                Text(message.timestamp, style: .time)
                    .font(.caption2)
                    .foregroundStyle(.secondary)
            }

            if !message.isUser { Spacer(minLength: 50) }
        }
    }
}

// MARK: - Voice Button
struct VoiceButton: View {
    let isListening: Bool
    let isProcessing: Bool
    let onTapStart: () -> Void
    let onTapStop: () -> Void

    @State private var scale: CGFloat = 1.0

    var body: some View {
        Button {
            if isListening {
                onTapStop()
            } else {
                onTapStart()
            }
        } label: {
            ZStack {
                // Outer ring animation when listening
                if isListening {
                    Circle()
                        .stroke(Color.red.opacity(0.3), lineWidth: 4)
                        .frame(width: 100, height: 100)
                        .scaleEffect(scale)
                        .animation(
                            .easeInOut(duration: 1.0).repeatForever(autoreverses: true),
                            value: scale
                        )
                        .onAppear { scale = 1.3 }
                        .onDisappear { scale = 1.0 }
                }

                // Main button
                Circle()
                    .fill(isListening ? Color.red : Color.blue)
                    .frame(width: 80, height: 80)
                    .shadow(color: (isListening ? Color.red : Color.blue).opacity(0.4), radius: 10)

                // Icon
                if isProcessing {
                    ProgressView()
                        .tint(.white)
                } else {
                    Image(systemName: isListening ? "stop.fill" : "mic.fill")
                        .font(.system(size: 30))
                        .foregroundStyle(.white)
                }
            }
        }
        .disabled(isProcessing)
        .accessibilityLabel(isListening ? "Ferma registrazione" : "Inizia registrazione")
    }
}

// MARK: - Settings View
struct SettingsView: View {
    @Environment(\.dismiss) var dismiss
    @AppStorage("apiKey") private var apiKey = ""

    var body: some View {
        NavigationStack {
            Form {
                Section("Claude API") {
                    SecureField("API Key", text: $apiKey)
                        .textContentType(.password)

                    Text("Ottieni la tua API key da console.anthropic.com")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }

                Section("Informazioni") {
                    LabeledContent("Versione", value: "1.0.0")
                    LabeledContent("Sviluppato da", value: "Onde")
                }
            }
            .navigationTitle("Impostazioni")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Fatto") {
                        dismiss()
                    }
                }
            }
        }
    }
}

// MARK: - Preview
#Preview {
    ContentView()
}
