import Foundation
import CoreAudio
import AVFoundation
import Combine
import UserNotifications

/// Represents an audio input device
struct AudioDevice: Identifiable, Equatable {
    let id: AudioDeviceID
    let name: String
    let isDefault: Bool
    
    static func == (lhs: AudioDevice, rhs: AudioDevice) -> Bool {
        lhs.id == rhs.id
    }
}

/// Manages audio input devices and hot-swap detection
class AudioDeviceManager: ObservableObject {
    static let shared = AudioDeviceManager()
    
    @Published var devices: [AudioDevice] = []
    @Published var selectedDeviceId: AudioDeviceID = 0
    @Published var lastDeviceChange: String?
    @Published var autoSwitchToNew: Bool = true
    
    private var propertyListenerBlock: AudioObjectPropertyListenerBlock?
    
    private init() {
        // Load preferences
        autoSwitchToNew = UserDefaults.standard.bool(forKey: "autoSwitchAudioDevice")
        if UserDefaults.standard.object(forKey: "autoSwitchAudioDevice") == nil {
            autoSwitchToNew = true // Default to true
        }
        
        // Initial device enumeration
        refreshDevices()
        
        // Listen for device changes
        setupDeviceChangeListener()
    }
    
    deinit {
        removeDeviceChangeListener()
    }
    
    /// Refresh the list of audio input devices
    func refreshDevices() {
        var propertyAddress = AudioObjectPropertyAddress(
            mSelector: kAudioHardwarePropertyDevices,
            mScope: kAudioObjectPropertyScopeGlobal,
            mElement: kAudioObjectPropertyElementMain
        )
        
        var dataSize: UInt32 = 0
        var status = AudioObjectGetPropertyDataSize(
            AudioObjectID(kAudioObjectSystemObject),
            &propertyAddress,
            0,
            nil,
            &dataSize
        )
        
        guard status == noErr else {
            print("Failed to get device list size: \(status)")
            return
        }
        
        let deviceCount = Int(dataSize) / MemoryLayout<AudioDeviceID>.size
        var deviceIds = [AudioDeviceID](repeating: 0, count: deviceCount)
        
        status = AudioObjectGetPropertyData(
            AudioObjectID(kAudioObjectSystemObject),
            &propertyAddress,
            0,
            nil,
            &dataSize,
            &deviceIds
        )
        
        guard status == noErr else {
            print("Failed to get device list: \(status)")
            return
        }
        
        // Get default input device
        let defaultInputId = getDefaultInputDevice()
        
        // Filter to input devices only
        var inputDevices: [AudioDevice] = []
        for deviceId in deviceIds {
            if hasInputChannels(deviceId: deviceId) {
                let name = getDeviceName(deviceId: deviceId)
                inputDevices.append(AudioDevice(
                    id: deviceId,
                    name: name,
                    isDefault: deviceId == defaultInputId
                ))
            }
        }
        
        DispatchQueue.main.async {
            let previousDevices = self.devices
            self.devices = inputDevices
            
            // If selected device no longer exists, switch to default
            if !inputDevices.contains(where: { $0.id == self.selectedDeviceId }) {
                self.selectedDeviceId = defaultInputId
            }
            
            // Detect new devices
            if self.autoSwitchToNew {
                for device in inputDevices {
                    if !previousDevices.contains(where: { $0.id == device.id }) {
                        // New device connected!
                        self.lastDeviceChange = "Connected: \(device.name)"
                        self.selectedDeviceId = device.id
                        self.postDeviceChangeNotification(connected: true, deviceName: device.name)
                    }
                }
            }
            
            // Detect removed devices
            for device in previousDevices {
                if !inputDevices.contains(where: { $0.id == device.id }) {
                    self.lastDeviceChange = "Disconnected: \(device.name)"
                    self.postDeviceChangeNotification(connected: false, deviceName: device.name)
                }
            }
        }
    }
    
    /// Get the default input device ID
    private func getDefaultInputDevice() -> AudioDeviceID {
        var propertyAddress = AudioObjectPropertyAddress(
            mSelector: kAudioHardwarePropertyDefaultInputDevice,
            mScope: kAudioObjectPropertyScopeGlobal,
            mElement: kAudioObjectPropertyElementMain
        )
        
        var deviceId: AudioDeviceID = 0
        var dataSize = UInt32(MemoryLayout<AudioDeviceID>.size)
        
        let status = AudioObjectGetPropertyData(
            AudioObjectID(kAudioObjectSystemObject),
            &propertyAddress,
            0,
            nil,
            &dataSize,
            &deviceId
        )
        
        return status == noErr ? deviceId : 0
    }
    
    /// Check if device has input channels
    private func hasInputChannels(deviceId: AudioDeviceID) -> Bool {
        var propertyAddress = AudioObjectPropertyAddress(
            mSelector: kAudioDevicePropertyStreamConfiguration,
            mScope: kAudioDevicePropertyScopeInput,
            mElement: kAudioObjectPropertyElementMain
        )
        
        var dataSize: UInt32 = 0
        let status = AudioObjectGetPropertyDataSize(
            deviceId,
            &propertyAddress,
            0,
            nil,
            &dataSize
        )
        
        guard status == noErr, dataSize > 0 else { return false }
        
        let bufferListPtr = UnsafeMutablePointer<AudioBufferList>.allocate(capacity: 1)
        defer { bufferListPtr.deallocate() }
        
        let result = AudioObjectGetPropertyData(
            deviceId,
            &propertyAddress,
            0,
            nil,
            &dataSize,
            bufferListPtr
        )
        
        guard result == noErr else { return false }
        
        let bufferList = bufferListPtr.pointee
        return bufferList.mNumberBuffers > 0
    }
    
    /// Get device name
    private func getDeviceName(deviceId: AudioDeviceID) -> String {
        var propertyAddress = AudioObjectPropertyAddress(
            mSelector: kAudioDevicePropertyDeviceNameCFString,
            mScope: kAudioObjectPropertyScopeGlobal,
            mElement: kAudioObjectPropertyElementMain
        )
        
        var name: Unmanaged<CFString>?
        var dataSize = UInt32(MemoryLayout<CFString?>.size)
        
        let status = AudioObjectGetPropertyData(
            deviceId,
            &propertyAddress,
            0,
            nil,
            &dataSize,
            &name
        )
        
        guard status == noErr, let cfName = name?.takeRetainedValue() else {
            return "Unknown Device"
        }
        
        return cfName as String
    }
    
    /// Setup listener for device changes
    private func setupDeviceChangeListener() {
        var propertyAddress = AudioObjectPropertyAddress(
            mSelector: kAudioHardwarePropertyDevices,
            mScope: kAudioObjectPropertyScopeGlobal,
            mElement: kAudioObjectPropertyElementMain
        )
        
        propertyListenerBlock = { [weak self] _, _ in
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
                self?.refreshDevices()
            }
        }
        
        AudioObjectAddPropertyListenerBlock(
            AudioObjectID(kAudioObjectSystemObject),
            &propertyAddress,
            DispatchQueue.main,
            propertyListenerBlock!
        )
    }
    
    /// Remove device change listener
    private func removeDeviceChangeListener() {
        guard let block = propertyListenerBlock else { return }
        
        var propertyAddress = AudioObjectPropertyAddress(
            mSelector: kAudioHardwarePropertyDevices,
            mScope: kAudioObjectPropertyScopeGlobal,
            mElement: kAudioObjectPropertyElementMain
        )
        
        AudioObjectRemovePropertyListenerBlock(
            AudioObjectID(kAudioObjectSystemObject),
            &propertyAddress,
            DispatchQueue.main,
            block
        )
    }
    
    /// Post system notification about device change
    private func postDeviceChangeNotification(connected: Bool, deviceName: String) {
        let content = UNMutableNotificationContent()
        content.title = "WhisperFlow"
        content.body = connected ? "Switched to: \(deviceName)" : "\(deviceName) disconnected"
        
        let request = UNNotificationRequest(
            identifier: UUID().uuidString,
            content: content,
            trigger: nil
        )
        
        UNUserNotificationCenter.current().add(request) { error in
            if let error = error {
                print("Failed to post notification: \(error)")
            }
        }
        
        // Clear the change message after a few seconds
        DispatchQueue.main.asyncAfter(deadline: .now() + 5) {
            self.lastDeviceChange = nil
        }
    }
    
    /// Request notification permissions
    func requestNotificationPermission() {
        UNUserNotificationCenter.current().requestAuthorization(options: [.alert]) { granted, error in
            if let error = error {
                print("Notification permission error: \(error)")
            }
        }
    }
    
    /// Select a device by ID
    func selectDevice(_ deviceId: AudioDeviceID) {
        selectedDeviceId = deviceId
        UserDefaults.standard.set(deviceId, forKey: "selectedAudioDeviceId")
        
        if let device = devices.first(where: { $0.id == deviceId }) {
            lastDeviceChange = "Selected: \(device.name)"
        }
    }
    
    /// Toggle auto-switch preference
    func setAutoSwitch(_ enabled: Bool) {
        autoSwitchToNew = enabled
        UserDefaults.standard.set(enabled, forKey: "autoSwitchAudioDevice")
    }
    
    /// Get selected device index for compatibility with existing code
    var selectedDeviceIndex: Int {
        devices.firstIndex(where: { $0.id == selectedDeviceId }) ?? 0
    }
}
