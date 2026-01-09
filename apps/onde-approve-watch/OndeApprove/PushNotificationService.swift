import Foundation
import UserNotifications
import WatchKit

// MARK: - Push Notification Service

@MainActor
class PushNotificationService: NSObject, ObservableObject {
    static let shared = PushNotificationService()

    @Published var isRegistered = false
    @Published var deviceToken: String?
    @Published var lastError: String?

    // Server endpoint for registering device tokens
    private var serverURL: String {
        UserDefaults.standard.string(forKey: "apiBaseURL") ?? "http://192.168.1.100:3002"
    }

    private override init() {
        super.init()
    }

    // MARK: - Request Authorization

    /// Request permission to send notifications
    func requestAuthorization() async -> Bool {
        let center = UNUserNotificationCenter.current()

        do {
            let granted = try await center.requestAuthorization(options: [.alert, .sound, .badge])

            if granted {
                await MainActor.run {
                    self.isRegistered = true
                }
                // Register for remote notifications
                await registerForRemoteNotifications()
                return true
            } else {
                await MainActor.run {
                    self.lastError = "Permesso notifiche negato"
                }
                return false
            }
        } catch {
            await MainActor.run {
                self.lastError = "Errore richiesta permesso: \(error.localizedDescription)"
            }
            return false
        }
    }

    // MARK: - Register for Remote Notifications

    /// Register with APNs to get device token
    func registerForRemoteNotifications() async {
        await MainActor.run {
            WKApplication.shared().registerForRemoteNotifications()
        }
    }

    // MARK: - Handle Device Token

    /// Called when APNs registration succeeds
    func didRegisterForRemoteNotifications(withDeviceToken deviceToken: Data) {
        let tokenParts = deviceToken.map { data in String(format: "%02.2hhx", data) }
        let token = tokenParts.joined()

        Task { @MainActor in
            self.deviceToken = token
            print("📱 APNs Device Token: \(token)")

            // Register token with our server
            await self.registerTokenWithServer(token)
        }
    }

    /// Called when APNs registration fails
    func didFailToRegisterForRemoteNotifications(withError error: Error) {
        Task { @MainActor in
            self.lastError = "Registrazione APNs fallita: \(error.localizedDescription)"
            print("❌ APNs Registration failed: \(error)")
        }
    }

    // MARK: - Register Token with Server

    /// Send device token to our backend server
    private func registerTokenWithServer(_ token: String) async {
        guard let url = URL(string: "\(serverURL)/devices/register") else {
            lastError = "URL server non valido"
            return
        }

        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")

        let body: [String: Any] = [
            "deviceToken": token,
            "platform": "watchos",
            "appVersion": Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? "1.0",
            "deviceModel": WKInterfaceDevice.current().model,
            "osVersion": WKInterfaceDevice.current().systemVersion
        ]

        do {
            request.httpBody = try JSONSerialization.data(withJSONObject: body)
            let (_, response) = try await URLSession.shared.data(for: request)

            if let httpResponse = response as? HTTPURLResponse, httpResponse.statusCode == 200 {
                print("✅ Token registrato con il server")
            } else {
                lastError = "Registrazione token fallita"
            }
        } catch {
            lastError = "Errore registrazione token: \(error.localizedDescription)"
        }
    }

    // MARK: - Handle Notification

    /// Process incoming notification
    func handleNotification(_ notification: UNNotification) {
        let userInfo = notification.request.content.userInfo

        // Extract task info from notification payload
        if let taskId = userInfo["taskId"] as? String,
           let agentName = userInfo["agentName"] as? String,
           let reason = userInfo["blockedReason"] as? String {

            // Post notification for the app to handle
            NotificationCenter.default.post(
                name: .newBlockedTask,
                object: nil,
                userInfo: [
                    "taskId": taskId,
                    "agentName": agentName,
                    "blockedReason": reason
                ]
            )

            // Play haptic feedback
            WKInterfaceDevice.current().play(.notification)
        }
    }

    // MARK: - Handle Notification Response

    /// Handle user interaction with notification
    func handleNotificationResponse(_ response: UNNotificationResponse) async {
        let userInfo = response.notification.request.content.userInfo

        guard let taskId = userInfo["taskId"] as? String else { return }

        switch response.actionIdentifier {
        case "APPROVE_ACTION":
            // Quick approve from notification
            await approveTaskFromNotification(taskId)

        case "VIEW_ACTION", UNNotificationDefaultActionIdentifier:
            // Open app to task detail
            NotificationCenter.default.post(
                name: .openTaskDetail,
                object: nil,
                userInfo: ["taskId": taskId]
            )

        default:
            break
        }
    }

    // MARK: - Quick Approve from Notification

    private func approveTaskFromNotification(_ taskId: String) async {
        guard let url = URL(string: "\(serverURL)/tasks/\(taskId)/approve") else { return }

        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")

        do {
            let (_, response) = try await URLSession.shared.data(for: request)

            if let httpResponse = response as? HTTPURLResponse, httpResponse.statusCode == 200 {
                // Success haptic
                WKInterfaceDevice.current().play(.success)

                // Show local confirmation
                await showLocalNotification(
                    title: "✅ Approvato",
                    body: "Task approvato con successo"
                )
            } else {
                // Failure haptic
                WKInterfaceDevice.current().play(.failure)
            }
        } catch {
            WKInterfaceDevice.current().play(.failure)
        }
    }

    // MARK: - Local Notifications

    /// Show a local notification on the watch
    func showLocalNotification(title: String, body: String) async {
        let content = UNMutableNotificationContent()
        content.title = title
        content.body = body
        content.sound = .default

        let request = UNNotificationRequest(
            identifier: UUID().uuidString,
            content: content,
            trigger: nil  // Deliver immediately
        )

        do {
            try await UNUserNotificationCenter.current().add(request)
        } catch {
            print("❌ Local notification error: \(error)")
        }
    }

    // MARK: - Configure Notification Categories

    /// Set up notification categories with actions
    func configureNotificationCategories() {
        // Approve action - quick approve without opening app
        let approveAction = UNNotificationAction(
            identifier: "APPROVE_ACTION",
            title: "✅ Approva",
            options: [.foreground]
        )

        // View action - open app to task detail
        let viewAction = UNNotificationAction(
            identifier: "VIEW_ACTION",
            title: "👁 Visualizza",
            options: [.foreground]
        )

        // Blocked task category
        let blockedCategory = UNNotificationCategory(
            identifier: "BLOCKED_TASK",
            actions: [approveAction, viewAction],
            intentIdentifiers: [],
            hiddenPreviewsBodyPlaceholder: "Agente in attesa di approvazione",
            options: .customDismissAction
        )

        // Info notification category (no actions)
        let infoCategory = UNNotificationCategory(
            identifier: "INFO",
            actions: [],
            intentIdentifiers: [],
            options: []
        )

        UNUserNotificationCenter.current().setNotificationCategories([
            blockedCategory,
            infoCategory
        ])
    }

    // MARK: - Check Notification Settings

    /// Check current notification authorization status
    func checkNotificationSettings() async -> UNAuthorizationStatus {
        let settings = await UNUserNotificationCenter.current().notificationSettings()
        return settings.authorizationStatus
    }

    // MARK: - Unregister

    /// Unregister device from push notifications
    func unregisterFromNotifications() async {
        guard let token = deviceToken else { return }

        guard let url = URL(string: "\(serverURL)/devices/unregister") else { return }

        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")

        let body = ["deviceToken": token]
        request.httpBody = try? JSONEncoder().encode(body)

        do {
            _ = try await URLSession.shared.data(for: request)
            deviceToken = nil
            isRegistered = false
        } catch {
            lastError = "Errore de-registrazione: \(error.localizedDescription)"
        }
    }
}

// MARK: - Notification Names

extension Notification.Name {
    static let newBlockedTask = Notification.Name("newBlockedTask")
    static let openTaskDetail = Notification.Name("openTaskDetail")
    static let pushTokenRegistered = Notification.Name("pushTokenRegistered")
}

// MARK: - Push Notification Payload Examples

/*
 Expected notification payload from server:

 {
   "aps": {
     "alert": {
       "title": "🎨 Pina Pennello",
       "subtitle": "Agente bloccato",
       "body": "Serve approvazione per generare immagini libro"
     },
     "sound": "default",
     "badge": 1,
     "category": "BLOCKED_TASK"
   },
   "taskId": "task-123",
   "agentName": "Pina Pennello",
   "agentType": "pina_pennello",
   "blockedReason": "Serve approvazione per generare immagini libro",
   "priority": "high",
   "timestamp": "2026-01-09T10:30:00Z"
 }
*/
