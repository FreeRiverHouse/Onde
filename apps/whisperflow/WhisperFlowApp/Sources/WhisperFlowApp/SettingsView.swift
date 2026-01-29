import SwiftUI

struct SettingsView: View {
    @StateObject private var transcriptionManager = TranscriptionManager.shared
    @StateObject private var overlayManager = OverlayManager.shared
    @StateObject private var launchManager = LaunchAtLoginManager.shared
    
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
            
            Section("Overlay") {
                Toggle("Show Overlay", isOn: Binding(
                    get: { overlayManager.isOverlayVisible },
                    set: { if $0 { overlayManager.showOverlay() } else { overlayManager.hideOverlay() } }
                ))
                
                Picker("Position", selection: Binding(
                    get: { overlayManager.overlayPosition },
                    set: { overlayManager.updatePosition($0) }
                )) {
                    ForEach(OverlayManager.OverlayPosition.allCases, id: \.self) { position in
                        Text(position.rawValue).tag(position)
                    }
                }
                .pickerStyle(.segmented)
                .disabled(!overlayManager.isOverlayVisible)
                
                VStack(alignment: .leading) {
                    Text("Background Opacity: \(Int(overlayManager.overlayOpacity * 100))%")
                    Slider(
                        value: Binding(
                            get: { overlayManager.overlayOpacity },
                            set: { overlayManager.updateOpacity($0) }
                        ),
                        in: 0.3...1.0,
                        step: 0.1
                    )
                }
            }
            
            Section("Startup") {
                if launchManager.isAvailable {
                    Toggle("Launch at Login", isOn: $launchManager.isEnabled)
                    
                    if launchManager.statusDescription == "Requires approval in System Settings" {
                        Button("Open System Settings") {
                            if let url = URL(string: "x-apple.systempreferences:com.apple.LoginItems-Settings.extension") {
                                NSWorkspace.shared.open(url)
                            }
                        }
                        .font(.caption)
                    }
                } else {
                    Text("Launch at Login requires macOS 13+")
                        .foregroundColor(.secondary)
                        .font(.caption)
                }
            }
            
            Section("Keyboard Shortcuts") {
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
        .frame(width: 400, height: 540)
    }
}

#Preview {
    SettingsView()
}
