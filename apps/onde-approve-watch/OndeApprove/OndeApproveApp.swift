import SwiftUI
import WatchKit
import UserNotifications

@main
struct OndeApproveApp: App {
    @WKApplicationDelegateAdaptor(AppDelegate.self) var appDelegate

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(PushNotificationService.shared)
        }
    }
}

// MARK: - App Delegate

class AppDelegate: NSObject, WKApplicationDelegate {

    // MARK: - Application Lifecycle

    func applicationDidFinishLaunching() {
        // Configure notification categories
        PushNotificationService.shared.configureNotificationCategories()

        // Set notification delegate
        UNUserNotificationCenter.current().delegate = self

        // Request notification permissions on first launch
        Task {
            let status = await PushNotificationService.shared.checkNotificationSettings()
            if status == .notDetermined {
                await PushNotificationService.shared.requestAuthorization()
            } else if status == .authorized {
                await PushNotificationService.shared.registerForRemoteNotifications()
            }
        }
    }

    func applicationDidBecomeActive() {
        // Clear badge count when app becomes active
        WKApplication.shared().applicationIconBadgeNumber = 0
    }

    // MARK: - Remote Notifications

    func didRegisterForRemoteNotifications(withDeviceToken deviceToken: Data) {
        PushNotificationService.shared.didRegisterForRemoteNotifications(withDeviceToken: deviceToken)
    }

    func didFailToRegisterForRemoteNotificationsWithError(_ error: Error) {
        PushNotificationService.shared.didFailToRegisterForRemoteNotifications(withError: error)
    }

    // MARK: - Background Tasks

    func handle(_ backgroundTasks: Set<WKRefreshBackgroundTask>) {
        for task in backgroundTasks {
            switch task {
            case let pushTask as WKUserNotificationBackgroundTask:
                // Handle push notification received in background
                handlePushNotificationTask(pushTask)

            case let refreshTask as WKApplicationRefreshBackgroundTask:
                // Handle background refresh
                handleBackgroundRefresh(refreshTask)

            case let snapshotTask as WKSnapshotRefreshBackgroundTask:
                // Update snapshot for dock
                snapshotTask.setTaskCompleted(
                    restoredDefaultState: true,
                    estimatedSnapshotExpiration: Date.distantFuture,
                    userInfo: nil
                )

            default:
                task.setTaskCompletedWithSnapshot(false)
            }
        }
    }

    private func handlePushNotificationTask(_ task: WKUserNotificationBackgroundTask) {
        // Play haptic for new notification
        WKInterfaceDevice.current().play(.notification)

        // Mark task complete
        task.setTaskCompletedWithSnapshot(true)
    }

    private func handleBackgroundRefresh(_ task: WKApplicationRefreshBackgroundTask) {
        // Schedule next background refresh
        scheduleNextBackgroundRefresh()

        // Fetch blocked tasks in background
        Task {
            let service = AgentQueueService()
            await service.fetchBlockedTasks()

            await MainActor.run {
                task.setTaskCompletedWithSnapshot(true)
            }
        }
    }

    private func scheduleNextBackgroundRefresh() {
        // Schedule refresh in 15 minutes
        let refreshDate = Date(timeIntervalSinceNow: 15 * 60)

        WKApplication.shared().scheduleBackgroundRefresh(
            withPreferredDate: refreshDate,
            userInfo: nil
        ) { error in
            if let error = error {
                print("❌ Background refresh scheduling failed: \(error)")
            }
        }
    }
}

// MARK: - UNUserNotificationCenterDelegate

extension AppDelegate: UNUserNotificationCenterDelegate {

    // Handle notification when app is in foreground
    func userNotificationCenter(
        _ center: UNUserNotificationCenter,
        willPresent notification: UNNotification
    ) async -> UNNotificationPresentationOptions {
        // Process the notification
        await MainActor.run {
            PushNotificationService.shared.handleNotification(notification)
        }

        // Show banner + sound even when app is active
        return [.banner, .sound, .badge]
    }

    // Handle user interaction with notification
    func userNotificationCenter(
        _ center: UNUserNotificationCenter,
        didReceive response: UNNotificationResponse
    ) async {
        await PushNotificationService.shared.handleNotificationResponse(response)
    }
}
