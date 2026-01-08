import Foundation

// MARK: - Agent Queue Service

@MainActor
class AgentQueueService: ObservableObject {
    @Published var tasks: [AgentTask] = []
    @Published var blockedTasks: [AgentTask] = []
    @Published var isLoading = false
    @Published var errorMessage: String?

    // API Base URL - configurable for local dev or production
    // For Watch, this needs to be accessible (not localhost)
    // Options: 1) Use iPhone as proxy via WatchConnectivity
    //          2) Use ngrok/cloudflare tunnel for local dev
    //          3) Deploy API to cloud
    private var baseURL: String {
        // Check for stored URL or use default
        UserDefaults.standard.string(forKey: "apiBaseURL") ?? "http://192.168.1.100:3002"
    }

    func setBaseURL(_ url: String) {
        UserDefaults.standard.set(url, forKey: "apiBaseURL")
    }

    // MARK: - Fetch All Tasks

    func fetchTasks() async {
        isLoading = true
        errorMessage = nil

        guard let url = URL(string: "\(baseURL)/tasks") else {
            errorMessage = "Invalid URL"
            isLoading = false
            return
        }

        do {
            let (data, response) = try await URLSession.shared.data(from: url)

            guard let httpResponse = response as? HTTPURLResponse,
                  httpResponse.statusCode == 200 else {
                errorMessage = "Server error"
                isLoading = false
                return
            }

            let decoded = try JSONDecoder().decode(TasksResponse.self, from: data)
            tasks = decoded.tasks
            blockedTasks = tasks.filter { $0.isBlocked }
            isLoading = false
        } catch {
            errorMessage = "Connessione fallita"
            isLoading = false
        }
    }

    // MARK: - Fetch Blocked Tasks Only

    func fetchBlockedTasks() async {
        isLoading = true
        errorMessage = nil

        guard let url = URL(string: "\(baseURL)/tasks/blocked") else {
            errorMessage = "Invalid URL"
            isLoading = false
            return
        }

        do {
            let (data, response) = try await URLSession.shared.data(from: url)

            guard let httpResponse = response as? HTTPURLResponse,
                  httpResponse.statusCode == 200 else {
                errorMessage = "Server error"
                isLoading = false
                return
            }

            let decoded = try JSONDecoder().decode(TasksResponse.self, from: data)
            blockedTasks = decoded.tasks
            isLoading = false
        } catch {
            errorMessage = "Connessione fallita"
            isLoading = false
        }
    }

    // MARK: - Approve Task

    func approveTask(_ taskId: String) async -> Bool {
        guard let url = URL(string: "\(baseURL)/tasks/\(taskId)/approve") else {
            errorMessage = "Invalid URL"
            return false
        }

        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")

        do {
            let (data, response) = try await URLSession.shared.data(for: request)

            guard let httpResponse = response as? HTTPURLResponse,
                  httpResponse.statusCode == 200 else {
                errorMessage = "Approvazione fallita"
                return false
            }

            let decoded = try JSONDecoder().decode(ApproveResponse.self, from: data)

            if decoded.success {
                // Remove from blocked tasks list
                blockedTasks.removeAll { $0.id == taskId }

                // Update in main tasks list
                if let index = tasks.firstIndex(where: { $0.id == taskId }),
                   let updatedTask = decoded.task {
                    tasks[index] = updatedTask
                }
                return true
            } else {
                errorMessage = decoded.message ?? "Errore sconosciuto"
                return false
            }
        } catch {
            errorMessage = "Errore di rete"
            return false
        }
    }

    // MARK: - Send Message to Agent

    func sendMessage(_ taskId: String, message: String) async -> Bool {
        guard let url = URL(string: "\(baseURL)/tasks/\(taskId)/message") else {
            errorMessage = "Invalid URL"
            return false
        }

        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")

        let body = ["message": message]
        request.httpBody = try? JSONEncoder().encode(body)

        do {
            let (_, response) = try await URLSession.shared.data(for: request)

            guard let httpResponse = response as? HTTPURLResponse,
                  httpResponse.statusCode == 200 else {
                errorMessage = "Invio fallito"
                return false
            }

            return true
        } catch {
            errorMessage = "Errore di rete"
            return false
        }
    }
}
