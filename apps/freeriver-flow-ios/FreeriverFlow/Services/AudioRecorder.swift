//
//  AudioRecorder.swift
//  FreeriverFlow
//
//  Handles audio recording from microphone
//

import Foundation
import AVFoundation

class AudioRecorder: NSObject, ObservableObject {
    @Published var isRecording = false
    @Published var hasPermission = false
    @Published var errorMessage: String?

    private var audioRecorder: AVAudioRecorder?
    private var audioSession: AVAudioSession

    var recordingURL: URL {
        let documentsPath = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0]
        return documentsPath.appendingPathComponent("recording.m4a")
    }

    override init() {
        audioSession = AVAudioSession.sharedInstance()
        super.init()
        checkPermission()
    }

    func checkPermission() {
        switch audioSession.recordPermission {
        case .granted:
            hasPermission = true
        case .denied:
            hasPermission = false
            errorMessage = "Permesso microfono negato. Vai in Impostazioni per abilitarlo."
        case .undetermined:
            requestPermission()
        @unknown default:
            hasPermission = false
        }
    }

    func requestPermission() {
        audioSession.requestRecordPermission { [weak self] granted in
            DispatchQueue.main.async {
                self?.hasPermission = granted
                if !granted {
                    self?.errorMessage = "Permesso microfono negato"
                }
            }
        }
    }

    func startRecording() {
        guard hasPermission else {
            errorMessage = "Permesso microfono non concesso"
            return
        }

        do {
            try audioSession.setCategory(.playAndRecord, mode: .default, options: [.defaultToSpeaker])
            try audioSession.setActive(true)

            let settings: [String: Any] = [
                AVFormatIDKey: Int(kAudioFormatMPEG4AAC),
                AVSampleRateKey: 44100.0,
                AVNumberOfChannelsKey: 1,
                AVEncoderAudioQualityKey: AVAudioQuality.high.rawValue
            ]

            audioRecorder = try AVAudioRecorder(url: recordingURL, settings: settings)
            audioRecorder?.delegate = self
            audioRecorder?.record()

            isRecording = true
            errorMessage = nil
        } catch {
            errorMessage = "Errore avvio registrazione: \(error.localizedDescription)"
            isRecording = false
        }
    }

    func stopRecording() -> URL? {
        audioRecorder?.stop()
        isRecording = false

        do {
            try audioSession.setActive(false)
        } catch {
            print("Error deactivating audio session: \(error)")
        }

        return FileManager.default.fileExists(atPath: recordingURL.path) ? recordingURL : nil
    }
}

// MARK: - AVAudioRecorderDelegate
extension AudioRecorder: AVAudioRecorderDelegate {
    func audioRecorderDidFinishRecording(_ recorder: AVAudioRecorder, successfully flag: Bool) {
        isRecording = false
        if !flag {
            errorMessage = "Registrazione fallita"
        }
    }

    func audioRecorderEncodeErrorDidOccur(_ recorder: AVAudioRecorder, error: Error?) {
        isRecording = false
        errorMessage = error?.localizedDescription ?? "Errore di encoding"
    }
}
