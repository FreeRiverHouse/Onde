//
//  VoiceAssistantViewModel.swift
//  FreeriverFlow
//
//  Main ViewModel orchestrating voice assistant functionality
//

import Foundation
import Combine

@MainActor
class VoiceAssistantViewModel: ObservableObject {
    // MARK: - Published Properties
    @Published var messages: [Message] = []
    @Published var currentTranscript = ""
    @Published var isProcessing = false
    @Published var errorMessage: String?
    @Published var assistantState: AssistantState = .idle

    // MARK: - Services
    let speechRecognizer = SpeechRecognizer()
    let claudeService = ClaudeAPIService()
    let textToSpeech = TextToSpeech()

    // MARK: - Private
    private var cancellables = Set<AnyCancellable>()

    // MARK: - Initialization
    init() {
        setupBindings()
    }

    private func setupBindings() {
        // Observe speech recognizer transcript
        speechRecognizer.$transcript
            .receive(on: DispatchQueue.main)
            .sink { [weak self] transcript in
                self?.currentTranscript = transcript
            }
            .store(in: &cancellables)

        // Observe speech recognizer state
        speechRecognizer.$isListening
            .receive(on: DispatchQueue.main)
            .sink { [weak self] isListening in
                if isListening {
                    self?.assistantState = .listening
                } else if self?.assistantState == .listening {
                    self?.assistantState = .idle
                }
            }
            .store(in: &cancellables)

        // Observe Claude service state
        claudeService.$isLoading
            .receive(on: DispatchQueue.main)
            .sink { [weak self] isLoading in
                if isLoading {
                    self?.assistantState = .thinking
                }
            }
            .store(in: &cancellables)

        // Observe TTS state
        textToSpeech.$isSpeaking
            .receive(on: DispatchQueue.main)
            .sink { [weak self] isSpeaking in
                if isSpeaking {
                    self?.assistantState = .speaking
                } else if self?.assistantState == .speaking {
                    self?.assistantState = .idle
                }
            }
            .store(in: &cancellables)

        // Combine errors
        Publishers.Merge3(
            speechRecognizer.$errorMessage,
            claudeService.$errorMessage,
            textToSpeech.$errorMessage
        )
        .compactMap { $0 }
        .receive(on: DispatchQueue.main)
        .sink { [weak self] error in
            self?.errorMessage = error
        }
        .store(in: &cancellables)
    }

    // MARK: - Voice Interaction

    /// Start listening for voice input
    func startListening() {
        errorMessage = nil
        currentTranscript = ""
        textToSpeech.stopSpeaking()
        speechRecognizer.startListening()
    }

    /// Stop listening and process the transcript
    func stopListeningAndProcess() {
        speechRecognizer.stopListening()

        let transcript = currentTranscript.trimmingCharacters(in: .whitespacesAndNewlines)

        guard !transcript.isEmpty else {
            errorMessage = "Nessun testo riconosciuto"
            assistantState = .idle
            return
        }

        Task {
            await processUserInput(transcript)
        }
    }

    /// Cancel current operation
    func cancel() {
        speechRecognizer.stopListening()
        textToSpeech.stopSpeaking()
        currentTranscript = ""
        isProcessing = false
        assistantState = .idle
    }

    // MARK: - Text Input (alternative to voice)

    /// Process text input directly
    func sendTextMessage(_ text: String) {
        let trimmedText = text.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmedText.isEmpty else { return }

        Task {
            await processUserInput(trimmedText)
        }
    }

    // MARK: - Private Methods

    private func processUserInput(_ text: String) async {
        isProcessing = true
        assistantState = .thinking

        // Add user message
        let userMessage = Message(content: text, isUser: true)
        messages.append(userMessage)
        currentTranscript = ""

        do {
            // Get Claude response
            let response = try await claudeService.sendMessage(text, conversationHistory: Array(messages.dropLast()))

            // Add assistant message
            let assistantMessage = Message(content: response, isUser: false)
            messages.append(assistantMessage)

            // Speak the response
            assistantState = .speaking
            textToSpeech.speak(response)

        } catch {
            errorMessage = error.localizedDescription
            assistantState = .idle
        }

        isProcessing = false
    }

    /// Clear conversation history
    func clearConversation() {
        messages.removeAll()
        currentTranscript = ""
        errorMessage = nil
        assistantState = .idle
    }
}

// MARK: - Assistant State
enum AssistantState: String {
    case idle = "In attesa"
    case listening = "Ascolto..."
    case thinking = "Elaboro..."
    case speaking = "Parlo..."

    var icon: String {
        switch self {
        case .idle: return "waveform.circle"
        case .listening: return "mic.fill"
        case .thinking: return "brain"
        case .speaking: return "speaker.wave.3.fill"
        }
    }

    var color: String {
        switch self {
        case .idle: return "gray"
        case .listening: return "red"
        case .thinking: return "orange"
        case .speaking: return "green"
        }
    }
}
