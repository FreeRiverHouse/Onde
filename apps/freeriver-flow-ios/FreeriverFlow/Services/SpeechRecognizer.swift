//
//  SpeechRecognizer.swift
//  FreeriverFlow
//
//  Handles speech-to-text using Apple Speech Recognition
//

import Foundation
import Speech
import AVFoundation

class SpeechRecognizer: NSObject, ObservableObject {
    @Published var transcript = ""
    @Published var isListening = false
    @Published var hasPermission = false
    @Published var errorMessage: String?

    private var recognitionRequest: SFSpeechAudioBufferRecognitionRequest?
    private var recognitionTask: SFSpeechRecognitionTask?
    private let speechRecognizer: SFSpeechRecognizer?
    private let audioEngine = AVAudioEngine()

    override init() {
        // Initialize with Italian locale, fallback to device locale
        speechRecognizer = SFSpeechRecognizer(locale: Locale(identifier: "it-IT"))
            ?? SFSpeechRecognizer(locale: Locale.current)
        super.init()
        checkPermissions()
    }

    func checkPermissions() {
        SFSpeechRecognizer.requestAuthorization { [weak self] status in
            DispatchQueue.main.async {
                switch status {
                case .authorized:
                    self?.hasPermission = true
                case .denied:
                    self?.hasPermission = false
                    self?.errorMessage = "Permesso riconoscimento vocale negato"
                case .restricted:
                    self?.hasPermission = false
                    self?.errorMessage = "Riconoscimento vocale non disponibile"
                case .notDetermined:
                    self?.hasPermission = false
                @unknown default:
                    self?.hasPermission = false
                }
            }
        }
    }

    func startListening() {
        guard let speechRecognizer = speechRecognizer, speechRecognizer.isAvailable else {
            errorMessage = "Riconoscimento vocale non disponibile"
            return
        }

        guard hasPermission else {
            errorMessage = "Permesso non concesso"
            return
        }

        // Stop any existing task
        stopListening()

        do {
            let audioSession = AVAudioSession.sharedInstance()
            try audioSession.setCategory(.record, mode: .measurement, options: .duckOthers)
            try audioSession.setActive(true, options: .notifyOthersOnDeactivation)

            recognitionRequest = SFSpeechAudioBufferRecognitionRequest()

            guard let recognitionRequest = recognitionRequest else {
                errorMessage = "Impossibile creare richiesta di riconoscimento"
                return
            }

            recognitionRequest.shouldReportPartialResults = true
            recognitionRequest.requiresOnDeviceRecognition = false

            let inputNode = audioEngine.inputNode
            let recordingFormat = inputNode.outputFormat(forBus: 0)

            inputNode.installTap(onBus: 0, bufferSize: 1024, format: recordingFormat) { [weak self] buffer, _ in
                self?.recognitionRequest?.append(buffer)
            }

            audioEngine.prepare()
            try audioEngine.start()

            isListening = true
            transcript = ""

            recognitionTask = speechRecognizer.recognitionTask(with: recognitionRequest) { [weak self] result, error in
                if let result = result {
                    DispatchQueue.main.async {
                        self?.transcript = result.bestTranscription.formattedString
                    }
                }

                if error != nil || result?.isFinal == true {
                    self?.stopListening()
                }
            }

        } catch {
            errorMessage = "Errore avvio riconoscimento: \(error.localizedDescription)"
            stopListening()
        }
    }

    func stopListening() {
        audioEngine.stop()
        audioEngine.inputNode.removeTap(onBus: 0)
        recognitionRequest?.endAudio()
        recognitionRequest = nil
        recognitionTask?.cancel()
        recognitionTask = nil

        DispatchQueue.main.async {
            self.isListening = false
        }

        do {
            try AVAudioSession.sharedInstance().setActive(false)
        } catch {
            print("Error deactivating audio session: \(error)")
        }
    }

    /// Transcribe audio file using Speech Recognition
    func transcribeAudioFile(url: URL) async throws -> String {
        guard let speechRecognizer = speechRecognizer, speechRecognizer.isAvailable else {
            throw SpeechError.recognizerNotAvailable
        }

        guard hasPermission else {
            throw SpeechError.permissionDenied
        }

        let request = SFSpeechURLRecognitionRequest(url: url)
        request.shouldReportPartialResults = false

        return try await withCheckedThrowingContinuation { continuation in
            speechRecognizer.recognitionTask(with: request) { result, error in
                if let error = error {
                    continuation.resume(throwing: error)
                    return
                }

                if let result = result, result.isFinal {
                    continuation.resume(returning: result.bestTranscription.formattedString)
                }
            }
        }
    }
}

// MARK: - Errors
enum SpeechError: LocalizedError {
    case recognizerNotAvailable
    case permissionDenied

    var errorDescription: String? {
        switch self {
        case .recognizerNotAvailable:
            return "Riconoscimento vocale non disponibile"
        case .permissionDenied:
            return "Permesso riconoscimento vocale negato"
        }
    }
}
