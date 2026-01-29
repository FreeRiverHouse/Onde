import SwiftUI

struct MenuBarView: View {
    @EnvironmentObject var transcriptionManager: TranscriptionManager
    @StateObject private var overlayManager = OverlayManager.shared
    @StateObject private var audioManager = AudioDeviceManager.shared
    @StateObject private var historyManager = TranscriptionHistoryManager.shared
    @State private var isHovering = false
    @State private var showingExportAlert = false
    @State private var exportMessage = ""
    @State private var showingHistory = false
    
    var body: some View {
        VStack(spacing: 0) {
            // Header
            HStack {
                Image(systemName: "waveform")
                    .font(.title2)
                    .foregroundColor(.accentColor)
                
                Text("WhisperFlow")
                    .font(.headline)
                
                Spacer()
                
                // Settings button
                Button(action: openSettings) {
                    Image(systemName: "gear")
                        .font(.title3)
                        .foregroundColor(.secondary)
                }
                .buttonStyle(.plain)
            }
            .padding()
            .background(Color(NSColor.windowBackgroundColor))
            
            Divider()
            
            // Status section
            VStack(spacing: 12) {
                // Device change notification
                if let change = audioManager.lastDeviceChange {
                    HStack {
                        Image(systemName: "speaker.wave.2")
                            .foregroundColor(.accentColor)
                        Text(change)
                            .font(.caption)
                    }
                    .padding(.horizontal, 12)
                    .padding(.vertical, 6)
                    .background(Color.accentColor.opacity(0.1))
                    .cornerRadius(8)
                    .padding(.horizontal)
                    .padding(.top, 8)
                }
                
                // Recording indicator
                HStack {
                    Circle()
                        .fill(transcriptionManager.isRecording ? Color.red : Color.gray.opacity(0.3))
                        .frame(width: 12, height: 12)
                        .overlay(
                            Circle()
                                .stroke(Color.white.opacity(0.3), lineWidth: 1)
                        )
                        .shadow(color: transcriptionManager.isRecording ? .red.opacity(0.5) : .clear, radius: 4)
                    
                    Text(transcriptionManager.isRecording ? "Recording..." : "Ready")
                        .font(.subheadline)
                        .foregroundColor(transcriptionManager.isRecording ? .red : .secondary)
                    
                    // Detected language indicator
                    if let lang = transcriptionManager.detectedLanguage, transcriptionManager.language == "auto" {
                        Text(languageFlag(for: lang))
                            .font(.caption)
                            .padding(.horizontal, 4)
                            .padding(.vertical, 2)
                            .background(Color.accentColor.opacity(0.2))
                            .cornerRadius(4)
                            .help("Detected: \(languageName(for: lang))")
                    }
                    
                    Spacer()
                    
                    // Current device indicator
                    if let device = audioManager.devices.first(where: { $0.id == audioManager.selectedDeviceId }) {
                        Text(device.name)
                            .font(.caption2)
                            .foregroundColor(.secondary)
                            .lineLimit(1)
                    }
                    
                    if transcriptionManager.isProcessing {
                        ProgressView()
                            .scaleEffect(0.7)
                    }
                }
                .padding(.horizontal)
                .padding(.top, audioManager.lastDeviceChange == nil ? 12 : 4)
                
                // Main record button
                Button(action: toggleRecording) {
                    HStack {
                        Image(systemName: transcriptionManager.isRecording ? "stop.circle.fill" : "mic.circle.fill")
                            .font(.system(size: 24))
                        
                        Text(transcriptionManager.isRecording ? "Stop" : "Start Recording")
                            .fontWeight(.medium)
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 12)
                    .background(transcriptionManager.isRecording ? Color.red : Color.accentColor)
                    .foregroundColor(.white)
                    .cornerRadius(10)
                }
                .buttonStyle(.plain)
                .padding(.horizontal)
                
                // Overlay toggle button
                Button(action: { overlayManager.toggleOverlay() }) {
                    HStack {
                        Image(systemName: overlayManager.isOverlayVisible ? "rectangle.on.rectangle.slash" : "rectangle.on.rectangle")
                            .font(.system(size: 16))
                        
                        Text(overlayManager.isOverlayVisible ? "Hide Overlay" : "Show Overlay")
                            .fontWeight(.medium)
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 10)
                    .background(overlayManager.isOverlayVisible ? Color.orange : Color.secondary.opacity(0.2))
                    .foregroundColor(overlayManager.isOverlayVisible ? .white : .primary)
                    .cornerRadius(8)
                }
                .buttonStyle(.plain)
                .padding(.horizontal)
            }
            
            Divider()
                .padding(.vertical, 8)
            
            // Transcription output
            VStack(alignment: .leading, spacing: 8) {
                HStack {
                    Text("Transcription")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                    
                    Spacer()
                    
                    if !transcriptionManager.transcribedText.isEmpty {
                        Button(action: saveToHistory) {
                            Image(systemName: "square.and.arrow.down")
                                .font(.caption)
                        }
                        .buttonStyle(.plain)
                        .help("Save to history")
                        
                        Button(action: copyToClipboard) {
                            Image(systemName: "doc.on.doc")
                                .font(.caption)
                        }
                        .buttonStyle(.plain)
                        .help("Copy to clipboard")
                        
                        Button(action: clearText) {
                            Image(systemName: "trash")
                                .font(.caption)
                        }
                        .buttonStyle(.plain)
                        .help("Clear")
                    }
                }
                .padding(.horizontal)
                
                ScrollView {
                    Text(transcriptionManager.transcribedText.isEmpty ? "Speak to transcribe..." : transcriptionManager.transcribedText)
                        .font(.body)
                        .foregroundColor(transcriptionManager.transcribedText.isEmpty ? .secondary : .primary)
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .textSelection(.enabled)
                }
                .frame(height: 120)
                .padding(.horizontal)
                .background(Color(NSColor.textBackgroundColor).opacity(0.5))
                .cornerRadius(8)
                .padding(.horizontal)
                
                // History section
                HStack {
                    Button(action: { showingHistory.toggle() }) {
                        HStack(spacing: 4) {
                            Image(systemName: "clock.arrow.circlepath")
                                .font(.caption)
                            Text("History (\(historyManager.history.count))")
                                .font(.caption)
                        }
                    }
                    .buttonStyle(.plain)
                    .foregroundColor(.secondary)
                    
                    Spacer()
                    
                    if !historyManager.history.isEmpty {
                        Button(action: exportHistory) {
                            HStack(spacing: 4) {
                                Image(systemName: "square.and.arrow.up")
                                    .font(.caption)
                                Text("Export")
                                    .font(.caption)
                            }
                        }
                        .buttonStyle(.plain)
                        .foregroundColor(.accentColor)
                    }
                }
                .padding(.horizontal)
            }
            
            // Collapsible history list
            if showingHistory && !historyManager.history.isEmpty {
                ScrollView {
                    VStack(alignment: .leading, spacing: 6) {
                        ForEach(historyManager.history.prefix(5)) { entry in
                            HistoryEntryRow(entry: entry)
                        }
                        if historyManager.history.count > 5 {
                            Text("+ \(historyManager.history.count - 5) more...")
                                .font(.caption2)
                                .foregroundColor(.secondary)
                                .padding(.horizontal, 8)
                        }
                    }
                    .padding(.horizontal)
                }
                .frame(maxHeight: 100)
            }
            
            Spacer()
            
            Divider()
            
            // Footer
            HStack {
                Text("⌘⇧T to toggle")
                    .font(.caption)
                    .foregroundColor(.secondary)
                
                Spacer()
                
                Button("Quit") {
                    NSApp.terminate(nil)
                }
                .buttonStyle(.plain)
                .font(.caption)
                .foregroundColor(.secondary)
            }
            .padding(.horizontal)
            .padding(.vertical, 8)
        }
        .frame(width: 320, height: 480)
        .alert("Export Complete", isPresented: $showingExportAlert) {
            Button("OK", role: .cancel) { }
        } message: {
            Text(exportMessage)
        }
    }
    
    private func toggleRecording() {
        if transcriptionManager.isRecording {
            transcriptionManager.stopRecording()
        } else {
            transcriptionManager.startRecording()
        }
    }
    
    private func copyToClipboard() {
        let pasteboard = NSPasteboard.general
        pasteboard.clearContents()
        pasteboard.setString(transcriptionManager.transcribedText, forType: .string)
    }
    
    private func clearText() {
        transcriptionManager.clearTranscription(saveFirst: false)
    }
    
    private func saveToHistory() {
        transcriptionManager.saveCurrentToHistory()
        // Visual feedback could be added here
    }
    
    private func exportHistory() {
        do {
            let url = try historyManager.exportHistory()
            exportMessage = "Exported to:\n\(url.lastPathComponent)"
            showingExportAlert = true
            
            // Reveal in Finder
            NSWorkspace.shared.selectFile(url.path, inFileViewerRootedAtPath: url.deletingLastPathComponent().path)
        } catch {
            exportMessage = "Export failed: \(error.localizedDescription)"
            showingExportAlert = true
        }
    }
    
    private func openSettings() {
        NSApp.sendAction(Selector(("showSettingsWindow:")), to: nil, from: nil)
    }
}

// MARK: - History Entry Row
struct HistoryEntryRow: View {
    let entry: TranscriptionHistoryManager.TranscriptionEntry
    
    private var timeString: String {
        let formatter = DateFormatter()
        formatter.dateStyle = .none
        formatter.timeStyle = .short
        return formatter.string(from: entry.timestamp)
    }
    
    private var dateString: String {
        let formatter = DateFormatter()
        formatter.dateStyle = .short
        formatter.timeStyle = .none
        return formatter.string(from: entry.timestamp)
    }
    
    var body: some View {
        HStack(alignment: .top, spacing: 8) {
            VStack(alignment: .leading, spacing: 2) {
                Text(timeString)
                    .font(.caption2)
                    .foregroundColor(.secondary)
                Text(dateString)
                    .font(.caption2)
                    .foregroundColor(.secondary.opacity(0.7))
            }
            .frame(width: 50, alignment: .leading)
            
            Text(entry.text)
                .font(.caption)
                .lineLimit(2)
                .foregroundColor(.primary)
            
            Spacer()
        }
        .padding(.vertical, 4)
        .padding(.horizontal, 8)
        .background(Color.secondary.opacity(0.1))
        .cornerRadius(6)
    }
}

// MARK: - Language Helpers
private func languageFlag(for code: String) -> String {
    switch code.lowercased() {
    case "en": return "🇬🇧"
    case "it": return "🇮🇹"
    case "es": return "🇪🇸"
    case "fr": return "🇫🇷"
    case "de": return "🇩🇪"
    case "pt": return "🇵🇹"
    case "zh": return "🇨🇳"
    case "ja": return "🇯🇵"
    case "ko": return "🇰🇷"
    case "ru": return "🇷🇺"
    case "ar": return "🇸🇦"
    case "nl": return "🇳🇱"
    case "pl": return "🇵🇱"
    case "sv": return "🇸🇪"
    case "tr": return "🇹🇷"
    default: return "🌍"
    }
}

private func languageName(for code: String) -> String {
    switch code.lowercased() {
    case "en": return "English"
    case "it": return "Italian"
    case "es": return "Spanish"
    case "fr": return "French"
    case "de": return "German"
    case "pt": return "Portuguese"
    case "zh": return "Chinese"
    case "ja": return "Japanese"
    case "ko": return "Korean"
    case "ru": return "Russian"
    case "ar": return "Arabic"
    case "nl": return "Dutch"
    case "pl": return "Polish"
    case "sv": return "Swedish"
    case "tr": return "Turkish"
    default: return code.uppercased()
    }
}

#Preview {
    MenuBarView()
        .environmentObject(TranscriptionManager.shared)
}
