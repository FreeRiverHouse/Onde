import Foundation

// MARK: - Agent Task Model

enum TaskStatus: String, Codable {
    case todo
    case inProgress = "in_progress"
    case blocked
    case done
}

enum AgentType: String, Codable {
    case editoreCapo = "editore_capo"
    case gianniParola = "gianni_parola"
    case pinaPennello = "pina_pennello"
    case paAgent = "pa_agent"
    case prAgent = "pr_agent"
    case devAgent = "dev_agent"
}

struct AgentTask: Codable, Identifiable {
    let id: String
    let agentName: String
    let agentType: AgentType
    let task: String
    let status: TaskStatus
    let blockedReason: String?
    let priority: Priority
    let createdAt: String
    let startedAt: String?
    let completedAt: String?

    enum Priority: String, Codable {
        case low
        case medium
        case high
    }

    var isBlocked: Bool {
        status == .blocked
    }

    var priorityColor: String {
        switch priority {
        case .high: return "red"
        case .medium: return "orange"
        case .low: return "green"
        }
    }

    var agentEmoji: String {
        switch agentType {
        case .editoreCapo: return "📚"
        case .gianniParola: return "✍️"
        case .pinaPennello: return "🎨"
        case .paAgent: return "🤖"
        case .prAgent: return "📱"
        case .devAgent: return "💻"
        }
    }
}

// MARK: - API Response

struct TasksResponse: Codable {
    let tasks: [AgentTask]
    let total: Int
    let blocked: Int
}

struct ApproveResponse: Codable {
    let success: Bool
    let task: AgentTask?
    let message: String?
}
