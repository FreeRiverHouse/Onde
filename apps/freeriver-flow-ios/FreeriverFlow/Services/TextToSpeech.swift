//
//  TextToSpeech.swift
//  FreeriverFlow
//
//  Text-to-Speech using AVSpeechSynthesizer
//

import Foundation
import AVFoundation

class TextToSpeech: NSObject, ObservableObject {
    @Published var isSpeaking = false
    @Published var errorMessage: String?

    private let synthesizer = AVSpeechSynthesizer()

    // Italian voice settings
    private let voiceIdentifier = "com.apple.voice.compact.it-IT.Alice"
    private let speechRate: Float = 0.52 // Slightly faster than default
    private let pitchMultiplier: Float = 1.0
    private let volume: Float = 1.0

    override init() {
        super.init()
        synthesizer.delegate = self
        configureAudioSession()
    }

    private func configureAudioSession() {
        do {
            let audioSession = AVAudioSession.sharedInstance()
            try audioSession.setCategory(.playback, mode: .voicePrompt, options: [.duckOthers])
        } catch {
            errorMessage = "Errore configurazione audio: \(error.localizedDescription)"
        }
    }

    /// Speak the given text
    func speak(_ text: String, language: String = "it-IT") {
        // Stop any ongoing speech
        if synthesizer.isSpeaking {
            synthesizer.stopSpeaking(at: .immediate)
        }

        let utterance = AVSpeechUtterance(string: text)

        // Try to use Italian voice, fallback to any available voice for the language
        if let voice = AVSpeechSynthesisVoice(identifier: voiceIdentifier) {
            utterance.voice = voice
        } else if let voice = AVSpeechSynthesisVoice(language: language) {
            utterance.voice = voice
        }

        utterance.rate = speechRate
        utterance.pitchMultiplier = pitchMultiplier
        utterance.volume = volume
        utterance.preUtteranceDelay = 0.1
        utterance.postUtteranceDelay = 0.1

        do {
            try AVAudioSession.sharedInstance().setActive(true)
        } catch {
            print("Error activating audio session: \(error)")
        }

        isSpeaking = true
        synthesizer.speak(utterance)
    }

    /// Stop speaking immediately
    func stopSpeaking() {
        if synthesizer.isSpeaking {
            synthesizer.stopSpeaking(at: .immediate)
        }
        isSpeaking = false
    }

    /// Pause speaking
    func pauseSpeaking() {
        if synthesizer.isSpeaking {
            synthesizer.pauseSpeaking(at: .word)
        }
    }

    /// Continue speaking
    func continueSpeaking() {
        if synthesizer.isPaused {
            synthesizer.continueSpeaking()
        }
    }

    /// Get available voices for a language
    static func availableVoices(for language: String = "it-IT") -> [AVSpeechSynthesisVoice] {
        return AVSpeechSynthesisVoice.speechVoices().filter { $0.language == language }
    }
}

// MARK: - AVSpeechSynthesizerDelegate
extension TextToSpeech: AVSpeechSynthesizerDelegate {
    func speechSynthesizer(_ synthesizer: AVSpeechSynthesizer, didStart utterance: AVSpeechUtterance) {
        DispatchQueue.main.async {
            self.isSpeaking = true
        }
    }

    func speechSynthesizer(_ synthesizer: AVSpeechSynthesizer, didFinish utterance: AVSpeechUtterance) {
        DispatchQueue.main.async {
            self.isSpeaking = false
        }
    }

    func speechSynthesizer(_ synthesizer: AVSpeechSynthesizer, didCancel utterance: AVSpeechUtterance) {
        DispatchQueue.main.async {
            self.isSpeaking = false
        }
    }
}
