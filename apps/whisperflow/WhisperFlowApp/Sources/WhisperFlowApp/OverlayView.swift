import SwiftUI

struct OverlayView: View {
    @EnvironmentObject var transcriptionManager: TranscriptionManager
    @EnvironmentObject var overlayManager: OverlayManager
    
    @State private var isHovering = false
    
    var body: some View {
        HStack(spacing: 12) {
            // Recording indicator with language
            HStack(spacing: 6) {
                Circle()
                    .fill(transcriptionManager.isRecording ? Color.red : Color.gray.opacity(0.5))
                    .frame(width: 14, height: 14)
                    .shadow(color: transcriptionManager.isRecording ? .red.opacity(0.6) : .clear, radius: 6)
                    .animation(.easeInOut(duration: 0.5).repeatForever(autoreverses: true), value: transcriptionManager.isRecording)
                
                // Detected language indicator
                if let lang = transcriptionManager.detectedLanguage, transcriptionManager.language == "auto" {
                    Text(overlayLanguageFlag(for: lang))
                        .font(.system(size: 12))
                        .padding(.horizontal, 4)
                        .padding(.vertical, 2)
                        .background(Color.white.opacity(0.15))
                        .cornerRadius(4)
                }
            }
            
            // Transcription text
            ScrollView(.horizontal, showsIndicators: false) {
                Text(displayText)
                    .font(.system(size: 16, weight: .medium, design: .rounded))
                    .foregroundColor(.white)
                    .lineLimit(2)
                    .multilineTextAlignment(.leading)
                    .textSelection(.enabled)
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            
            // Processing indicator
            if transcriptionManager.isProcessing {
                ProgressView()
                    .scaleEffect(0.7)
                    .colorInvert()
            }
            
            // Control buttons (show on hover)
            if isHovering {
                HStack(spacing: 8) {
                    // Copy button
                    Button(action: copyToClipboard) {
                        Image(systemName: "doc.on.doc")
                            .font(.caption)
                            .foregroundColor(.white.opacity(0.8))
                    }
                    .buttonStyle(.plain)
                    .help("Copy to clipboard")
                    
                    // Close button
                    Button(action: { overlayManager.hideOverlay() }) {
                        Image(systemName: "xmark.circle.fill")
                            .font(.caption)
                            .foregroundColor(.white.opacity(0.8))
                    }
                    .buttonStyle(.plain)
                    .help("Hide overlay")
                }
            }
        }
        .padding(.horizontal, 20)
        .padding(.vertical, 16)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(
            RoundedRectangle(cornerRadius: 16)
                .fill(Color.black.opacity(overlayManager.overlayOpacity))
                .overlay(
                    RoundedRectangle(cornerRadius: 16)
                        .stroke(transcriptionManager.isRecording ? Color.red.opacity(0.5) : Color.white.opacity(0.1), lineWidth: 1)
                )
        )
        .onHover { hovering in
            withAnimation(.easeInOut(duration: 0.2)) {
                isHovering = hovering
            }
        }
    }
    
    private var displayText: String {
        if transcriptionManager.transcribedText.isEmpty {
            if transcriptionManager.isRecording {
                return "Listening... (⌘⇧T to stop)"
            } else {
                return "Press ⌘⇧T to start transcribing"
            }
        }
        
        // Show last 200 characters for overlay
        let text = transcriptionManager.transcribedText
        if text.count > 200 {
            return "..." + String(text.suffix(200))
        }
        return text
    }
    
    private func copyToClipboard() {
        let pasteboard = NSPasteboard.general
        pasteboard.clearContents()
        pasteboard.setString(transcriptionManager.transcribedText, forType: .string)
    }
    
    private func overlayLanguageFlag(for code: String) -> String {
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
        default: return "🌍"
        }
    }
}

#Preview {
    OverlayView()
        .environmentObject(TranscriptionManager.shared)
        .environmentObject(OverlayManager.shared)
        .frame(width: 500, height: 80)
        .background(Color.gray)
}
