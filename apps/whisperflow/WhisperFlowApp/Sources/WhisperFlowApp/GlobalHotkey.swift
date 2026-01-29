import Foundation
import Carbon
import AppKit

/// Global hotkey manager using Carbon API
class GlobalHotkeyManager {
    static let shared = GlobalHotkeyManager()
    
    private var hotKeyRef: EventHotKeyRef?
    private var hotKeyID = EventHotKeyID()
    private var callback: (() -> Void)?
    
    private init() {
        hotKeyID.signature = OSType(0x5746_4C57) // "WFLW"
        hotKeyID.id = 1
    }
    
    /// Register a global hotkey (⌘⇧T by default)
    func register(callback: @escaping () -> Void) {
        self.callback = callback
        
        // Unregister any existing hotkey
        unregister()
        
        // Register for ⌘⇧T (Cmd+Shift+T)
        // keyCode 17 = T
        let modifiers: UInt32 = UInt32(cmdKey | shiftKey)
        let keyCode: UInt32 = 17
        
        var eventType = EventTypeSpec(
            eventClass: OSType(kEventClassKeyboard),
            eventKind: UInt32(kEventHotKeyPressed)
        )
        
        // Install event handler
        let status = InstallEventHandler(
            GetApplicationEventTarget(),
            { (_, event, userData) -> OSStatus in
                guard let userData = userData else { return noErr }
                let manager = Unmanaged<GlobalHotkeyManager>.fromOpaque(userData).takeUnretainedValue()
                manager.callback?()
                return noErr
            },
            1,
            &eventType,
            Unmanaged.passUnretained(self).toOpaque(),
            nil
        )
        
        if status != noErr {
            print("Failed to install event handler: \(status)")
            return
        }
        
        // Register the hotkey
        let registerStatus = RegisterEventHotKey(
            keyCode,
            modifiers,
            hotKeyID,
            GetApplicationEventTarget(),
            0,
            &hotKeyRef
        )
        
        if registerStatus != noErr {
            print("Failed to register hotkey: \(registerStatus)")
        } else {
            print("Global hotkey ⌘⇧T registered successfully")
        }
    }
    
    /// Unregister the global hotkey
    func unregister() {
        if let ref = hotKeyRef {
            UnregisterEventHotKey(ref)
            hotKeyRef = nil
        }
    }
    
    deinit {
        unregister()
    }
}

// Extension to register hotkey in AppDelegate
extension AppDelegate {
    func registerGlobalHotkey() {
        GlobalHotkeyManager.shared.register { [weak self] in
            // Toggle popover when hotkey pressed
            DispatchQueue.main.async {
                self?.togglePopoverFromHotkey()
            }
        }
    }
    
    @objc func togglePopoverFromHotkey() {
        // Toggle recording directly when hotkey is pressed
        let manager = TranscriptionManager.shared
        if manager.isRecording {
            manager.stopRecording()
        } else {
            manager.startRecording()
        }
    }
}
