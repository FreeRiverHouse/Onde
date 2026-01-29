import Foundation
import AVFoundation
import Combine

class TranscriptionManager: NSObject, ObservableObject {
    static let shared = TranscriptionManager()
    
    @Published var isRecording = false
    @Published var isProcessing = false
    @Published var transcribedText = ""
    @Published var errorMessage: String?
    
    private var audioRecorder: AVAudioRecorder?
    private var recordingURL: URL?
    private var vadProcess: Process?
    private var outputPipe: Pipe?
    private var recordingStartTime: Date?
    
    // History manager
    private let historyManager = TranscriptionHistoryManager.shared
    
    // Settings
    @Published var language: String = "auto"
    @Published var vadThreshold: Float = 0.5
    @Published var selectedDevice: Int = 0
    
    private let whisperCppPath: String
    private let modelPath: String
    private let pythonVADPath: String
    
    override init() {
        // Find whisper-cpp
        let brewPath = "/opt/homebrew/bin/whisper-cpp"
        let usrPath = "/usr/local/bin/whisper-cpp"
        self.whisperCppPath = FileManager.default.fileExists(atPath: brewPath) ? brewPath : usrPath
        
        // Model path
        let homeDir = FileManager.default.homeDirectoryForCurrentUser.path
        self.modelPath = "\(homeDir)/.whisper-cpp/models/ggml-base.bin"
        
        // Python VAD script path
        let bundlePath = Bundle.main.bundlePath
        let projectPath = URL(fileURLWithPath: bundlePath)
            .deletingLastPathComponent()
            .deletingLastPathComponent()
            .deletingLastPathComponent()
            .path
        self.pythonVADPath = "\(projectPath)/whisperflow-vad.py"
        
        super.init()
    }
    
    func startRecording() {
        guard !isRecording else { return }
        
        // Check if whisper-cpp is available
        guard FileManager.default.fileExists(atPath: whisperCppPath) else {
            errorMessage = "whisper-cpp not found. Install with: brew install whisper-cpp"
            return
        }
        
        // Check if model exists
        guard FileManager.default.fileExists(atPath: modelPath) else {
            errorMessage = "Model not found at \(modelPath)"
            return
        }
        
        isRecording = true
        errorMessage = nil
        recordingStartTime = Date()
        
        // Start the Python VAD process
        startVADProcess()
    }
    
    func stopRecording() {
        isRecording = false
        vadProcess?.terminate()
        vadProcess = nil
        
        // Save to history if we have transcribed text
        saveCurrentToHistory()
    }
    
    /// Manually save current transcription to history
    func saveCurrentToHistory() {
        guard !transcribedText.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty else { return }
        
        let duration: TimeInterval?
        if let start = recordingStartTime {
            duration = Date().timeIntervalSince(start)
        } else {
            duration = nil
        }
        
        historyManager.addEntry(
            transcribedText,
            language: language,
            duration: duration
        )
    }
    
    /// Clear current transcription (optionally save to history first)
    func clearTranscription(saveFirst: Bool = false) {
        if saveFirst {
            saveCurrentToHistory()
        }
        transcribedText = ""
        recordingStartTime = nil
    }
    
    private func startVADProcess() {
        let process = Process()
        let outputPipe = Pipe()
        
        // Find Python in venv
        let bundlePath = Bundle.main.bundlePath
        let projectPath = URL(fileURLWithPath: bundlePath)
            .deletingLastPathComponent()
            .deletingLastPathComponent()
            .deletingLastPathComponent()
            .path
        let pythonPath = "\(projectPath)/venv/bin/python3"
        
        // Fallback to system Python
        let actualPythonPath = FileManager.default.fileExists(atPath: pythonPath) ? pythonPath : "/usr/bin/python3"
        
        process.executableURL = URL(fileURLWithPath: actualPythonPath)
        
        var args = [pythonVADPath]
        if language != "auto" {
            args += ["--language", language]
        }
        args += ["--threshold", String(vadThreshold)]
        if selectedDevice > 0 {
            args += ["--device", String(selectedDevice)]
        }
        
        process.arguments = args
        process.standardOutput = outputPipe
        process.standardError = outputPipe
        
        // Read output in real-time
        outputPipe.fileHandleForReading.readabilityHandler = { [weak self] handle in
            let data = handle.availableData
            if let output = String(data: data, encoding: .utf8), !output.isEmpty {
                DispatchQueue.main.async {
                    self?.handleTranscriptionOutput(output)
                }
            }
        }
        
        process.terminationHandler = { [weak self] _ in
            DispatchQueue.main.async {
                self?.isRecording = false
            }
        }
        
        do {
            try process.run()
            self.vadProcess = process
            self.outputPipe = outputPipe
        } catch {
            errorMessage = "Failed to start transcription: \(error.localizedDescription)"
            isRecording = false
        }
    }
    
    private func handleTranscriptionOutput(_ output: String) {
        // Parse the output from whisperflow-vad.py
        // Format: [timestamp] transcribed text
        let lines = output.components(separatedBy: "\n")
        for line in lines {
            let trimmed = line.trimmingCharacters(in: .whitespacesAndNewlines)
            
            // Skip status lines
            if trimmed.isEmpty || 
               trimmed.hasPrefix("🎤") || 
               trimmed.hasPrefix("🔇") ||
               trimmed.hasPrefix("⚡") ||
               trimmed.hasPrefix("🛑") ||
               trimmed.hasPrefix("✅") ||
               trimmed.hasPrefix("📝") ||
               trimmed.hasPrefix("[") {
                // Status line, update processing state
                if trimmed.contains("Transcribing") {
                    isProcessing = true
                } else if trimmed.contains("Done") || trimmed.hasPrefix("📝") {
                    isProcessing = false
                }
                continue
            }
            
            // Actual transcription - append
            if !trimmed.isEmpty && !trimmed.hasPrefix("WhisperFlow") {
                if !transcribedText.isEmpty {
                    transcribedText += " "
                }
                transcribedText += trimmed
            }
        }
    }
    
    func getAudioDevices() -> [(id: Int, name: String)] {
        // This would use CoreAudio to enumerate devices
        // For now, return placeholder
        return [(0, "Default Input")]
    }
}
