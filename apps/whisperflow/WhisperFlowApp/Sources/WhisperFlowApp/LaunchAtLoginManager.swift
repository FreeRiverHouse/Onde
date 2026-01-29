import Foundation
import ServiceManagement

/// Manages "Launch at Login" functionality using SMAppService (macOS 13+)
class LaunchAtLoginManager: ObservableObject {
    static let shared = LaunchAtLoginManager()
    
    @Published var isEnabled: Bool {
        didSet {
            if isEnabled != oldValue {
                updateLoginItem()
            }
        }
    }
    
    private init() {
        // Check current status
        if #available(macOS 13.0, *) {
            isEnabled = SMAppService.mainApp.status == .enabled
        } else {
            isEnabled = false
        }
    }
    
    private func updateLoginItem() {
        if #available(macOS 13.0, *) {
            do {
                if isEnabled {
                    try SMAppService.mainApp.register()
                } else {
                    try SMAppService.mainApp.unregister()
                }
            } catch {
                print("Failed to update login item: \(error)")
                // Revert the value if failed
                DispatchQueue.main.async {
                    self.isEnabled = SMAppService.mainApp.status == .enabled
                }
            }
        }
    }
    
    /// Check if SMAppService is available (macOS 13+)
    var isAvailable: Bool {
        if #available(macOS 13.0, *) {
            return true
        }
        return false
    }
    
    /// Get the current status description
    var statusDescription: String {
        if #available(macOS 13.0, *) {
            switch SMAppService.mainApp.status {
            case .notRegistered:
                return "Not registered"
            case .enabled:
                return "Enabled"
            case .requiresApproval:
                return "Requires approval in System Settings"
            case .notFound:
                return "App not found"
            @unknown default:
                return "Unknown"
            }
        }
        return "Requires macOS 13+"
    }
}
