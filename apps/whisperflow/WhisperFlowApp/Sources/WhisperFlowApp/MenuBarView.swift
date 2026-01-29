import SwiftUI

struct MenuBarView: View {
    @EnvironmentObject var transcriptionManager: TranscriptionManager
    @State private var isHovering = false
    
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
                    
                    Spacer()
                    
                    if transcriptionManager.isProcessing {
                        ProgressView()
                            .scaleEffect(0.7)
                    }
                }
                .padding(.horizontal)
                .padding(.top, 12)
                
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
                .frame(height: 150)
                .padding(.horizontal)
                .background(Color(NSColor.textBackgroundColor).opacity(0.5))
                .cornerRadius(8)
                .padding(.horizontal)
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
        .frame(width: 320, height: 400)
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
        transcriptionManager.transcribedText = ""
    }
    
    private func openSettings() {
        NSApp.sendAction(Selector(("showSettingsWindow:")), to: nil, from: nil)
    }
}

#Preview {
    MenuBarView()
        .environmentObject(TranscriptionManager.shared)
}
