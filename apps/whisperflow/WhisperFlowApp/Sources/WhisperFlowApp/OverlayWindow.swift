import SwiftUI
import AppKit

/// A floating panel window that displays transcription overlay
class OverlayWindow: NSPanel {
    init() {
        super.init(
            contentRect: NSRect(x: 0, y: 0, width: 400, height: 100),
            styleMask: [.borderless, .nonactivatingPanel, .utilityWindow],
            backing: .buffered,
            defer: false
        )
        
        // Configure as floating overlay
        self.level = .floating
        self.backgroundColor = .clear
        self.isOpaque = false
        self.hasShadow = true
        self.collectionBehavior = [.canJoinAllSpaces, .fullScreenAuxiliary, .stationary]
        self.isMovableByWindowBackground = true
        self.hidesOnDeactivate = false
        
        // Position at bottom center of main screen
        positionAtBottom()
        
        // Make it ignore mouse events except for dragging
        self.ignoresMouseEvents = false
    }
    
    func positionAtBottom() {
        guard let screen = NSScreen.main else { return }
        
        let screenFrame = screen.visibleFrame
        let windowWidth: CGFloat = 500
        let windowHeight: CGFloat = 80
        let bottomMargin: CGFloat = 100
        
        let x = screenFrame.origin.x + (screenFrame.width - windowWidth) / 2
        let y = screenFrame.origin.y + bottomMargin
        
        self.setFrame(NSRect(x: x, y: y, width: windowWidth, height: windowHeight), display: true)
    }
    
    func positionAtTop() {
        guard let screen = NSScreen.main else { return }
        
        let screenFrame = screen.visibleFrame
        let windowWidth: CGFloat = 500
        let windowHeight: CGFloat = 80
        let topMargin: CGFloat = 100
        
        let x = screenFrame.origin.x + (screenFrame.width - windowWidth) / 2
        let y = screenFrame.origin.y + screenFrame.height - windowHeight - topMargin
        
        self.setFrame(NSRect(x: x, y: y, width: windowWidth, height: windowHeight), display: true)
    }
}

/// Manager for the overlay window
class OverlayManager: ObservableObject {
    static let shared = OverlayManager()
    
    @Published var isOverlayVisible = false
    @Published var overlayPosition: OverlayPosition = .bottom
    @Published var overlayOpacity: Double = 0.9
    
    private var overlayWindow: OverlayWindow?
    
    enum OverlayPosition: String, CaseIterable {
        case top = "Top"
        case bottom = "Bottom"
    }
    
    private init() {
        // Load saved preferences
        if let saved = UserDefaults.standard.string(forKey: "overlayPosition"),
           let position = OverlayPosition(rawValue: saved) {
            overlayPosition = position
        }
        overlayOpacity = UserDefaults.standard.double(forKey: "overlayOpacity")
        if overlayOpacity == 0 { overlayOpacity = 0.9 }
    }
    
    func showOverlay() {
        guard overlayWindow == nil else {
            overlayWindow?.orderFront(nil)
            isOverlayVisible = true
            return
        }
        
        let window = OverlayWindow()
        
        let hostingView = NSHostingView(
            rootView: OverlayView()
                .environmentObject(TranscriptionManager.shared)
                .environmentObject(self)
        )
        hostingView.frame = window.contentView?.bounds ?? .zero
        hostingView.autoresizingMask = [.width, .height]
        
        window.contentView = hostingView
        
        // Apply position
        switch overlayPosition {
        case .top:
            window.positionAtTop()
        case .bottom:
            window.positionAtBottom()
        }
        
        window.orderFront(nil)
        overlayWindow = window
        isOverlayVisible = true
    }
    
    func hideOverlay() {
        overlayWindow?.orderOut(nil)
        overlayWindow = nil
        isOverlayVisible = false
    }
    
    func toggleOverlay() {
        if isOverlayVisible {
            hideOverlay()
        } else {
            showOverlay()
        }
    }
    
    func updatePosition(_ position: OverlayPosition) {
        overlayPosition = position
        UserDefaults.standard.set(position.rawValue, forKey: "overlayPosition")
        
        if let window = overlayWindow {
            switch position {
            case .top:
                window.positionAtTop()
            case .bottom:
                window.positionAtBottom()
            }
        }
    }
    
    func updateOpacity(_ opacity: Double) {
        overlayOpacity = opacity
        UserDefaults.standard.set(opacity, forKey: "overlayOpacity")
    }
}
