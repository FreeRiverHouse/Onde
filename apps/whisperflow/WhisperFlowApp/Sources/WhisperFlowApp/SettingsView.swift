import SwiftUI

struct SettingsView: View {
    @StateObject private var transcriptionManager = TranscriptionManager.shared
    
    private let languages = [
        ("auto", "Auto-detect"),
        ("en", "English"),
        ("it", "Italian"),
        ("es", "Spanish"),
        ("fr", "French"),
        ("de", "German"),
        ("pt", "Portuguese"),
        ("zh", "Chinese"),
        ("ja", "Japanese"),
        ("ko", "Korean"),
        ("ru", "Russian"),
        ("ar", "Arabic")
    ]
    
    var body: some View {
        Form {
            Section("Transcription") {
                Picker("Language", selection: $transcriptionManager.language) {
                    ForEach(languages, id: \.0) { lang in
                        Text(lang.1).tag(lang.0)
                    }
                }
                .pickerStyle(.menu)
                
                VStack(alignment: .leading) {
                    Text("VAD Sensitivity: \(Int(transcriptionManager.vadThreshold * 100))%")
                    Slider(value: $transcriptionManager.vadThreshold, in: 0.1...0.9, step: 0.1)
                }
                .help("Lower = more sensitive (picks up quieter speech)")
            }
            
            Section("Audio") {
                Picker("Input Device", selection: $transcriptionManager.selectedDevice) {
                    ForEach(transcriptionManager.getAudioDevices(), id: \.id) { device in
                        Text(device.name).tag(device.id)
                    }
                }
                .pickerStyle(.menu)
            }
            
            Section("Keyboard Shortcut") {
                HStack {
                    Text("Toggle Recording")
                    Spacer()
                    Text("⌘⇧T")
                        .font(.system(.body, design: .monospaced))
                        .padding(.horizontal, 8)
                        .padding(.vertical, 4)
                        .background(Color.secondary.opacity(0.2))
                        .cornerRadius(4)
                }
            }
            
            Section("About") {
                HStack {
                    Text("Version")
                    Spacer()
                    Text("1.0.0")
                        .foregroundColor(.secondary)
                }
                
                HStack {
                    Text("Engine")
                    Spacer()
                    Text("whisper.cpp + Silero VAD")
                        .foregroundColor(.secondary)
                }
                
                Link("View on GitHub", destination: URL(string: "https://github.com/FreeRiverHouse/Onde")!)
            }
        }
        .padding()
        .frame(width: 400, height: 350)
    }
}

#Preview {
    SettingsView()
}
