//
//  Message.swift
//  FreeriverFlow
//
//  Model for chat messages
//

import Foundation

struct Message: Identifiable, Equatable {
    let id: UUID
    let content: String
    let isUser: Bool
    let timestamp: Date

    init(id: UUID = UUID(), content: String, isUser: Bool, timestamp: Date = Date()) {
        self.id = id
        self.content = content
        self.isUser = isUser
        self.timestamp = timestamp
    }
}

// MARK: - Conversation History for Claude API
extension Message {
    var claudeRole: String {
        isUser ? "user" : "assistant"
    }
}
