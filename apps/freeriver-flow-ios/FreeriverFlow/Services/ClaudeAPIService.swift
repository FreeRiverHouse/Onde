//
//  ClaudeAPIService.swift
//  FreeriverFlow
//
//  Claude API integration for AI responses
//

import Foundation

class ClaudeAPIService: ObservableObject {
    @Published var isLoading = false
    @Published var errorMessage: String?

    // IMPORTANT: Replace with your actual API key or use environment/keychain
    private var apiKey: String {
        // Try to get from environment or use placeholder
        ProcessInfo.processInfo.environment["ANTHROPIC_API_KEY"] ?? "YOUR_API_KEY_HERE"
    }

    private let baseURL = "https://api.anthropic.com/v1/messages"
    private let model = "claude-sonnet-4-20250514"

    /// System prompt for the voice assistant
    private let systemPrompt = """
    Sei un assistente vocale intelligente chiamato Freeriver Flow, creato da Onde.
    Rispondi in modo conciso e naturale, come in una conversazione parlata.
    Mantieni le risposte brevi (2-3 frasi massimo) a meno che non venga richiesto diversamente.
    Rispondi sempre in italiano a meno che l'utente non parli in un'altra lingua.
    Sii amichevole, utile e professionale.
    """

    /// Send a message to Claude API
    func sendMessage(_ text: String, conversationHistory: [Message] = []) async throws -> String {
        guard !apiKey.isEmpty && apiKey != "YOUR_API_KEY_HERE" else {
            throw ClaudeError.missingAPIKey
        }

        await MainActor.run {
            isLoading = true
            errorMessage = nil
        }

        defer {
            Task { @MainActor in
                isLoading = false
            }
        }

        guard let url = URL(string: baseURL) else {
            throw ClaudeError.invalidURL
        }

        // Build messages array with conversation history
        var messages: [[String: String]] = []

        for message in conversationHistory {
            messages.append([
                "role": message.claudeRole,
                "content": message.content
            ])
        }

        // Add current user message
        messages.append([
            "role": "user",
            "content": text
        ])

        let requestBody: [String: Any] = [
            "model": model,
            "max_tokens": 1024,
            "system": systemPrompt,
            "messages": messages
        ]

        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue(apiKey, forHTTPHeaderField: "x-api-key")
        request.setValue("2023-06-01", forHTTPHeaderField: "anthropic-version")

        request.httpBody = try JSONSerialization.data(withJSONObject: requestBody)

        let (data, response) = try await URLSession.shared.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse else {
            throw ClaudeError.invalidResponse
        }

        guard httpResponse.statusCode == 200 else {
            if let errorResponse = try? JSONDecoder().decode(ClaudeErrorResponse.self, from: data) {
                throw ClaudeError.apiError(errorResponse.error.message)
            }
            throw ClaudeError.httpError(httpResponse.statusCode)
        }

        let claudeResponse = try JSONDecoder().decode(ClaudeResponse.self, from: data)

        guard let textContent = claudeResponse.content.first?.text else {
            throw ClaudeError.emptyResponse
        }

        return textContent
    }
}

// MARK: - Response Models
struct ClaudeResponse: Codable {
    let id: String
    let type: String
    let role: String
    let content: [ContentBlock]
    let model: String
    let stopReason: String?
    let usage: Usage

    enum CodingKeys: String, CodingKey {
        case id, type, role, content, model
        case stopReason = "stop_reason"
        case usage
    }
}

struct ContentBlock: Codable {
    let type: String
    let text: String?
}

struct Usage: Codable {
    let inputTokens: Int
    let outputTokens: Int

    enum CodingKeys: String, CodingKey {
        case inputTokens = "input_tokens"
        case outputTokens = "output_tokens"
    }
}

struct ClaudeErrorResponse: Codable {
    let type: String
    let error: ClaudeAPIError
}

struct ClaudeAPIError: Codable {
    let type: String
    let message: String
}

// MARK: - Errors
enum ClaudeError: LocalizedError {
    case missingAPIKey
    case invalidURL
    case invalidResponse
    case httpError(Int)
    case apiError(String)
    case emptyResponse

    var errorDescription: String? {
        switch self {
        case .missingAPIKey:
            return "API key mancante. Configura ANTHROPIC_API_KEY."
        case .invalidURL:
            return "URL API non valido"
        case .invalidResponse:
            return "Risposta non valida dal server"
        case .httpError(let code):
            return "Errore HTTP: \(code)"
        case .apiError(let message):
            return "Errore API: \(message)"
        case .emptyResponse:
            return "Risposta vuota dal server"
        }
    }
}
