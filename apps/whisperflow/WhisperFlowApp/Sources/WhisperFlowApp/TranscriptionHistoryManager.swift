import Foundation
import Combine

/// Manages transcription history persistence and export
class TranscriptionHistoryManager: ObservableObject {
    static let shared = TranscriptionHistoryManager()
    
    // MARK: - Published Properties
    @Published var history: [TranscriptionEntry] = []
    @Published var autoSaveEnabled: Bool = false {
        didSet {
            UserDefaults.standard.set(autoSaveEnabled, forKey: "WF_AutoSaveEnabled")
        }
    }
    @Published var exportFormat: ExportFormat = .markdown {
        didSet {
            UserDefaults.standard.set(exportFormat.rawValue, forKey: "WF_ExportFormat")
        }
    }
    @Published var exportPath: URL? {
        didSet {
            if let path = exportPath {
                UserDefaults.standard.set(path.path, forKey: "WF_ExportPath")
            }
        }
    }
    
    // MARK: - Types
    struct TranscriptionEntry: Codable, Identifiable {
        let id: UUID
        let timestamp: Date
        let text: String
        let language: String
        let duration: TimeInterval? // Duration of the audio, if available
        
        init(text: String, language: String = "auto", duration: TimeInterval? = nil) {
            self.id = UUID()
            self.timestamp = Date()
            self.text = text
            self.language = language
            self.duration = duration
        }
    }
    
    enum ExportFormat: String, CaseIterable {
        case plainText = "txt"
        case markdown = "md"
        case json = "json"
        
        var displayName: String {
            switch self {
            case .plainText: return "Plain Text (.txt)"
            case .markdown: return "Markdown (.md)"
            case .json: return "JSON (.json)"
            }
        }
        
        var fileExtension: String { rawValue }
    }
    
    // MARK: - Private Properties
    private let historyFileURL: URL
    private var cancellables = Set<AnyCancellable>()
    
    // MARK: - Initialization
    init() {
        // Set up history file in Application Support
        let appSupport = FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask).first!
        let appDir = appSupport.appendingPathComponent("WhisperFlow", isDirectory: true)
        
        // Create directory if needed
        try? FileManager.default.createDirectory(at: appDir, withIntermediateDirectories: true)
        
        self.historyFileURL = appDir.appendingPathComponent("transcription-history.json")
        
        // Load saved settings
        autoSaveEnabled = UserDefaults.standard.bool(forKey: "WF_AutoSaveEnabled")
        if let formatRaw = UserDefaults.standard.string(forKey: "WF_ExportFormat"),
           let format = ExportFormat(rawValue: formatRaw) {
            exportFormat = format
        }
        if let pathString = UserDefaults.standard.string(forKey: "WF_ExportPath") {
            exportPath = URL(fileURLWithPath: pathString)
        } else {
            // Default to Documents
            exportPath = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask).first?
                .appendingPathComponent("WhisperFlow Transcriptions", isDirectory: true)
        }
        
        // Load history from disk
        loadHistory()
    }
    
    // MARK: - Public Methods
    
    /// Add a new transcription entry
    func addEntry(_ text: String, language: String = "auto", duration: TimeInterval? = nil) {
        guard !text.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty else { return }
        
        let entry = TranscriptionEntry(text: text, language: language, duration: duration)
        history.insert(entry, at: 0) // Most recent first
        
        // Save to disk
        saveHistory()
        
        // Auto-export if enabled
        if autoSaveEnabled, let path = exportPath {
            appendToExportFile(entry, at: path)
        }
    }
    
    /// Clear all history
    func clearHistory() {
        history.removeAll()
        saveHistory()
    }
    
    /// Delete specific entries
    func deleteEntries(at offsets: IndexSet) {
        history.remove(atOffsets: offsets)
        saveHistory()
    }
    
    /// Export history to a file
    func exportHistory(to url: URL? = nil, format: ExportFormat? = nil) throws -> URL {
        let targetFormat = format ?? exportFormat
        let baseURL = url ?? exportPath ?? FileManager.default.urls(for: .documentDirectory, in: .userDomainMask).first!
        
        // Ensure directory exists
        if !FileManager.default.fileExists(atPath: baseURL.path) {
            try FileManager.default.createDirectory(at: baseURL, withIntermediateDirectories: true)
        }
        
        let dateFormatter = DateFormatter()
        dateFormatter.dateFormat = "yyyy-MM-dd_HHmmss"
        let timestamp = dateFormatter.string(from: Date())
        
        let filename = "whisperflow-export-\(timestamp).\(targetFormat.fileExtension)"
        let fileURL = baseURL.appendingPathComponent(filename)
        
        let content: String
        switch targetFormat {
        case .plainText:
            content = exportAsPlainText()
        case .markdown:
            content = exportAsMarkdown()
        case .json:
            content = try exportAsJSON()
        }
        
        try content.write(to: fileURL, atomically: true, encoding: .utf8)
        return fileURL
    }
    
    /// Get total word count
    var totalWordCount: Int {
        history.reduce(0) { $0 + $1.text.split(separator: " ").count }
    }
    
    /// Get total duration if available
    var totalDuration: TimeInterval {
        history.compactMap { $0.duration }.reduce(0, +)
    }
    
    // MARK: - Private Methods
    
    private func loadHistory() {
        guard FileManager.default.fileExists(atPath: historyFileURL.path) else { return }
        
        do {
            let data = try Data(contentsOf: historyFileURL)
            history = try JSONDecoder().decode([TranscriptionEntry].self, from: data)
        } catch {
            print("Failed to load history: \(error)")
        }
    }
    
    private func saveHistory() {
        do {
            let data = try JSONEncoder().encode(history)
            try data.write(to: historyFileURL, options: .atomic)
        } catch {
            print("Failed to save history: \(error)")
        }
    }
    
    private func appendToExportFile(_ entry: TranscriptionEntry, at baseURL: URL) {
        let dateFormatter = DateFormatter()
        dateFormatter.dateFormat = "yyyy-MM-dd"
        let dateStr = dateFormatter.string(from: entry.timestamp)
        
        let filename = "whisperflow-\(dateStr).\(exportFormat.fileExtension)"
        let fileURL = baseURL.appendingPathComponent(filename)
        
        // Ensure directory exists
        try? FileManager.default.createDirectory(at: baseURL, withIntermediateDirectories: true)
        
        let line: String
        switch exportFormat {
        case .plainText:
            line = formatEntryPlainText(entry) + "\n\n"
        case .markdown:
            line = formatEntryMarkdown(entry) + "\n\n"
        case .json:
            line = (try? formatEntryJSON(entry) + "\n") ?? ""
        }
        
        if FileManager.default.fileExists(atPath: fileURL.path) {
            // Append to existing file
            if let handle = try? FileHandle(forWritingTo: fileURL) {
                handle.seekToEndOfFile()
                if let data = line.data(using: .utf8) {
                    handle.write(data)
                }
                handle.closeFile()
            }
        } else {
            // Create new file with header
            var content = ""
            if exportFormat == .markdown {
                content = "# WhisperFlow Transcriptions - \(dateStr)\n\n"
            }
            content += line
            try? content.write(to: fileURL, atomically: true, encoding: .utf8)
        }
    }
    
    private func formatEntryPlainText(_ entry: TranscriptionEntry) -> String {
        let formatter = DateFormatter()
        formatter.dateStyle = .short
        formatter.timeStyle = .medium
        return "[\(formatter.string(from: entry.timestamp))]\n\(entry.text)"
    }
    
    private func formatEntryMarkdown(_ entry: TranscriptionEntry) -> String {
        let formatter = DateFormatter()
        formatter.dateStyle = .medium
        formatter.timeStyle = .short
        return "## \(formatter.string(from: entry.timestamp))\n\n\(entry.text)"
    }
    
    private func formatEntryJSON(_ entry: TranscriptionEntry) throws -> String {
        let encoder = JSONEncoder()
        encoder.dateEncodingStrategy = .iso8601
        let data = try encoder.encode(entry)
        return String(data: data, encoding: .utf8) ?? "{}"
    }
    
    private func exportAsPlainText() -> String {
        var output = "WhisperFlow Transcription Export\n"
        output += "Generated: \(Date())\n"
        output += "Entries: \(history.count)\n"
        output += String(repeating: "=", count: 40) + "\n\n"
        
        for entry in history.reversed() { // Chronological order
            output += formatEntryPlainText(entry) + "\n\n"
        }
        
        return output
    }
    
    private func exportAsMarkdown() -> String {
        var output = "# WhisperFlow Transcription Export\n\n"
        output += "- **Generated:** \(Date())\n"
        output += "- **Entries:** \(history.count)\n"
        output += "- **Total Words:** \(totalWordCount)\n\n"
        output += "---\n\n"
        
        for entry in history.reversed() { // Chronological order
            output += formatEntryMarkdown(entry) + "\n\n"
        }
        
        return output
    }
    
    private func exportAsJSON() throws -> String {
        let encoder = JSONEncoder()
        encoder.dateEncodingStrategy = .iso8601
        encoder.outputFormatting = [.prettyPrinted, .sortedKeys]
        
        let export = ExportData(
            exportedAt: Date(),
            totalEntries: history.count,
            totalWords: totalWordCount,
            entries: history.reversed().map { $0 } // Chronological
        )
        
        let data = try encoder.encode(export)
        return String(data: data, encoding: .utf8) ?? "{}"
    }
    
    private struct ExportData: Codable {
        let exportedAt: Date
        let totalEntries: Int
        let totalWords: Int
        let entries: [TranscriptionEntry]
    }
}
