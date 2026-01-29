import SwiftUI

struct SettingsView: View {
    @StateObject private var transcriptionManager = TranscriptionManager.shared
    @StateObject private var overlayManager = OverlayManager.shared
    @StateObject private var launchManager = LaunchAtLoginManager.shared
    @StateObject private var audioManager = AudioDeviceManager.shared
    @StateObject private var historyManager = TranscriptionHistoryManager.shared
    
    @State private var showingClearConfirm = false
    @State private var showingExportSuccess = false
    @State private var lastExportPath = ""
    
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
                Picker("Input Device", selection: Binding(
                    get: { audioManager.selectedDeviceId },
                    set: { audioManager.selectDevice($0) }
                )) {
                    ForEach(audioManager.devices) { device in
                        HStack {
                            Text(device.name)
                            if device.isDefault {
                                Text("(Default)")
                                    .foregroundColor(.secondary)
                            }
                        }
                        .tag(device.id)
                    }
                }
                .pickerStyle(.menu)
                
                Toggle("Auto-switch to new devices", isOn: Binding(
                    get: { audioManager.autoSwitchToNew },
                    set: { audioManager.setAutoSwitch($0) }
                ))
                .help("Automatically switch to newly connected audio devices (e.g., AirPods)")
                
                if let change = audioManager.lastDeviceChange {
                    HStack {
                        Image(systemName: "speaker.wave.2")
                            .foregroundColor(.accentColor)
                        Text(change)
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                }
                
                Button("Refresh Devices") {
                    audioManager.refreshDevices()
                }
                .font(.caption)
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
            
            Section("History & Export") {
                HStack {
                    Text("Entries")
                    Spacer()
                    Text("\(historyManager.history.count)")
                        .foregroundColor(.secondary)
                }
                
                HStack {
                    Text("Total Words")
                    Spacer()
                    Text("\(historyManager.totalWordCount)")
                        .foregroundColor(.secondary)
                }
                
                Toggle("Auto-save on stop", isOn: $historyManager.autoSaveEnabled)
                    .help("Automatically save transcriptions to file when recording stops")
                
                Picker("Export Format", selection: $historyManager.exportFormat) {
                    ForEach(TranscriptionHistoryManager.ExportFormat.allCases, id: \.self) { format in
                        Text(format.displayName).tag(format)
                    }
                }
                .pickerStyle(.menu)
                
                HStack {
                    Text("Export Location")
                    Spacer()
                    Button(action: selectExportPath) {
                        Text(historyManager.exportPath?.lastPathComponent ?? "Documents")
                            .font(.caption)
                            .foregroundColor(.accentColor)
                    }
                    .buttonStyle(.plain)
                }
                
                HStack(spacing: 12) {
                    Button("Export All") {
                        exportAllHistory()
                    }
                    .disabled(historyManager.history.isEmpty)
                    
                    Button("Clear History") {
                        showingClearConfirm = true
                    }
                    .disabled(historyManager.history.isEmpty)
                    .foregroundColor(.red)
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
        .frame(width: 400, height: 700)
        .alert("Clear History", isPresented: $showingClearConfirm) {
            Button("Cancel", role: .cancel) { }
            Button("Clear", role: .destructive) {
                historyManager.clearHistory()
            }
        } message: {
            Text("This will permanently delete all \(historyManager.history.count) transcription entries. This cannot be undone.")
        }
        .alert("Export Complete", isPresented: $showingExportSuccess) {
            Button("Show in Finder") {
                if let url = URL(string: lastExportPath) {
                    NSWorkspace.shared.selectFile(url.path, inFileViewerRootedAtPath: url.deletingLastPathComponent().path)
                }
            }
            Button("OK", role: .cancel) { }
        } message: {
            Text("Exported to:\n\(URL(string: lastExportPath)?.lastPathComponent ?? lastExportPath)")
        }
    }
    
    private func selectExportPath() {
        let panel = NSOpenPanel()
        panel.canChooseFiles = false
        panel.canChooseDirectories = true
        panel.allowsMultipleSelection = false
        panel.prompt = "Select Export Location"
        
        if let currentPath = historyManager.exportPath {
            panel.directoryURL = currentPath
        }
        
        if panel.runModal() == .OK, let url = panel.url {
            historyManager.exportPath = url
        }
    }
    
    private func exportAllHistory() {
        do {
            let url = try historyManager.exportHistory()
            lastExportPath = url.absoluteString
            showingExportSuccess = true
        } catch {
            // Could show an error alert here
            print("Export failed: \(error)")
        }
    }
}

#Preview {
    SettingsView()
}
