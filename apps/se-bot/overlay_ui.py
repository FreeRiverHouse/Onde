#!/usr/bin/env python3
"""
SE-Bot Meeting Overlay UI

macOS transparent overlay for displaying meeting suggestions in real-time.
Uses PyObjC for native macOS integration with always-on-top panel.

Features:
- Transparent always-on-top overlay window
- 1-3 suggested responses displayed
- Click or keyboard (1/2/3) to copy to clipboard
- Global hotkey (Cmd+Shift+S) to toggle visibility
- Live transcript display (optional)
- Draggable window positioning

Usage:
    python overlay_ui.py                    # Start overlay
    python overlay_ui.py --test             # Demo mode with test data
    python overlay_ui.py --position right   # Position: left/right/center
"""

import sys
import json
import threading
import argparse
from pathlib import Path
from typing import Optional, Callable

try:
    import objc
    from AppKit import (
        NSApplication, NSApp, NSWindow, NSPanel,
        NSView, NSTextField, NSButton, NSColor, NSFont,
        NSBackingStoreBuffered, NSWindowStyleMaskBorderless,
        NSWindowStyleMaskNonactivatingPanel, NSWindowStyleMaskUtilityWindow,
        NSWindowCollectionBehaviorCanJoinAllSpaces, NSWindowCollectionBehaviorFullScreenAuxiliary,
        NSWindowCollectionBehaviorStationary, NSFloatingWindowLevel, NSStatusWindowLevel,
        NSScreen, NSMakeRect, NSImage, NSBezierPath, NSLayoutConstraint,
        NSStackView, NSUserInterfaceLayoutOrientationVertical,
        NSAlertFirstButtonReturn, NSTrackingArea, NSTrackingMouseEnteredAndExited,
        NSTrackingActiveAlways, NSTrackingInVisibleRect, NSEvent, NSEventMask,
        NSEventModifierFlagCommand, NSEventModifierFlagShift,
        NSPasteboard, NSStringPboardType,
        NSVisualEffectView, NSVisualEffectMaterialHUDWindow, NSVisualEffectBlendingModeBehindWindow,
        NSAppearance
    )
    from Foundation import NSObject, NSTimer, NSRunLoop, NSDefaultRunLoopMode
    from Quartz import CGEventMaskBit, kCGEventKeyDown
except ImportError:
    print("Error: PyObjC not installed. Run: pip install pyobjc")
    print("Or: pip install pyobjc-framework-Cocoa pyobjc-framework-Quartz")
    sys.exit(1)


# Constants
WINDOW_WIDTH = 380
CARD_HEIGHT = 90
HEADER_HEIGHT = 40
FOOTER_HEIGHT = 30
MAX_SUGGESTIONS = 3
SUGGESTION_COLORS = [
    (0.2, 0.6, 0.9, 0.9),  # Blue
    (0.3, 0.7, 0.4, 0.9),  # Green
    (0.8, 0.5, 0.2, 0.9),  # Orange
]

# Battle card style colors
STYLE_COLORS = {
    "battle-card-strength": (0.2, 0.75, 0.3, 0.95),   # Strong Green - strengths
    "battle-card-caution": (0.9, 0.75, 0.1, 0.95),    # Yellow - cautions
    "battle-card-neutral": (0.4, 0.5, 0.9, 0.95),     # Blue - neutral info
    "competitive-battle-card": (0.85, 0.4, 0.2, 0.95), # Orange - competitive
}
HOTKEY_CODE = 1  # 'S' key


class SuggestionCard(NSView):
    """A single suggestion card with hover effects, click to copy, and voice output."""
    
    def initWithFrame_index_callback_voiceCallback_(self, frame, index, callback, voice_callback):
        self = objc.super(SuggestionCard, self).initWithFrame_(frame)
        if self is None:
            return None
        
        self.index = index
        self.callback = callback
        self.voice_callback = voice_callback
        self.suggestion_text = ""
        self.is_hovered = False
        self.is_speaking = False
        
        # Background with rounded corners
        self.wantsLayer = True
        r, g, b, a = SUGGESTION_COLORS[index % len(SUGGESTION_COLORS)]
        self.layer().setBackgroundColor_(NSColor.colorWithCalibratedRed_green_blue_alpha_(r, g, b, a).CGColor())
        self.layer().setCornerRadius_(10)
        
        # Number badge
        self.badge = NSTextField.alloc().initWithFrame_(NSMakeRect(10, frame.size.height - 30, 24, 24))
        self.badge.setStringValue_(str(index + 1))
        self.badge.setFont_(NSFont.boldSystemFontOfSize_(14))
        self.badge.setTextColor_(NSColor.whiteColor())
        self.badge.setBezeled_(False)
        self.badge.setDrawsBackground_(False)
        self.badge.setEditable_(False)
        self.badge.setSelectable_(False)
        self.addSubview_(self.badge)
        
        # Speaker button (🔊)
        self.speaker_btn = NSTextField.alloc().initWithFrame_(NSMakeRect(frame.size.width - 35, frame.size.height - 30, 28, 24))
        self.speaker_btn.setStringValue_("🔊")
        self.speaker_btn.setFont_(NSFont.systemFontOfSize_(14))
        self.speaker_btn.setTextColor_(NSColor.whiteColor())
        self.speaker_btn.setBezeled_(False)
        self.speaker_btn.setDrawsBackground_(False)
        self.speaker_btn.setEditable_(False)
        self.speaker_btn.setSelectable_(False)
        self.speaker_btn.setToolTip_("Click or Shift+{} to speak".format(index + 1))
        self.addSubview_(self.speaker_btn)
        
        # Text label (adjusted width for speaker button)
        self.label = NSTextField.alloc().initWithFrame_(NSMakeRect(40, 10, frame.size.width - 80, frame.size.height - 20))
        self.label.setFont_(NSFont.systemFontOfSize_(12))
        self.label.setTextColor_(NSColor.whiteColor())
        self.label.setBezeled_(False)
        self.label.setDrawsBackground_(False)
        self.label.setEditable_(False)
        self.label.setSelectable_(False)
        self.label.setLineBreakMode_(0)  # Word wrap
        self.label.setMaximumNumberOfLines_(4)
        self.addSubview_(self.label)
        
        # Tracking area for hover
        tracking = NSTrackingArea.alloc().initWithRect_options_owner_userInfo_(
            self.bounds(),
            NSTrackingMouseEnteredAndExited | NSTrackingActiveAlways | NSTrackingInVisibleRect,
            self,
            None
        )
        self.addTrackingArea_(tracking)
        
        return self
    
    # Backward compatibility - old init without voice callback
    def initWithFrame_index_callback_(self, frame, index, callback):
        return self.initWithFrame_index_callback_voiceCallback_(frame, index, callback, None)
    
    def setText_(self, text):
        self.suggestion_text = text
        # Truncate if too long
        display_text = text[:200] + "..." if len(text) > 200 else text
        self.label.setStringValue_(display_text)
    
    def setStyle_(self, style):
        """Set card color based on style type (for battle cards)."""
        if style in STYLE_COLORS:
            r, g, b, a = STYLE_COLORS[style]
        else:
            # Fall back to default color for this index
            r, g, b, a = SUGGESTION_COLORS[self.index % len(SUGGESTION_COLORS)]
        self.layer().setBackgroundColor_(
            NSColor.colorWithCalibratedRed_green_blue_alpha_(r, g, b, a).CGColor()
        )
    
    def setBadge_(self, badge_text):
        """Set the badge text (e.g., '✓ Strength', '⚠️ Caution')."""
        if badge_text:
            self.badge.setStringValue_(badge_text)
        else:
            self.badge.setStringValue_(str(self.index + 1))
    
    def setSpeaking_(self, speaking):
        """Update speaker icon based on speaking state."""
        self.is_speaking = speaking
        if speaking:
            self.speaker_btn.setStringValue_("🔈")  # Speaking indicator
            self.speaker_btn.setTextColor_(NSColor.colorWithCalibratedRed_green_blue_alpha_(1.0, 0.9, 0.3, 1.0))
        else:
            self.speaker_btn.setStringValue_("🔊")
            self.speaker_btn.setTextColor_(NSColor.whiteColor())
    
    def mouseEntered_(self, event):
        self.is_hovered = True
        self.layer().setOpacity_(0.8)
    
    def mouseExited_(self, event):
        self.is_hovered = False
        self.layer().setOpacity_(1.0)
    
    def mouseDown_(self, event):
        if not self.suggestion_text:
            return
            
        # Check if click is on speaker button area (right side)
        click_location = self.convertPoint_fromView_(event.locationInWindow(), None)
        if click_location.x > self.bounds().size.width - 45:
            # Speaker button clicked - trigger voice
            if self.voice_callback:
                self.voice_callback(self.index, self.suggestion_text)
        else:
            # Regular click - copy to clipboard
            if self.callback:
                self.callback(self.index, self.suggestion_text)
        
        # Visual feedback
        self.layer().setOpacity_(0.5)
        NSTimer.scheduledTimerWithTimeInterval_target_selector_userInfo_repeats_(
            0.1, self, objc.selector(self.resetOpacity, signature=b'v@:'), None, False
        )
    
    def resetOpacity(self):
        self.layer().setOpacity_(1.0)


class TranscriptView(NSView):
    """Live transcript display with scrolling."""
    
    def initWithFrame_(self, frame):
        self = objc.super(TranscriptView, self).initWithFrame_(frame)
        if self is None:
            return None
        
        self.wantsLayer = True
        self.layer().setBackgroundColor_(NSColor.colorWithCalibratedRed_green_blue_alpha_(0.1, 0.1, 0.1, 0.7).CGColor())
        self.layer().setCornerRadius_(8)
        
        self.transcript_label = NSTextField.alloc().initWithFrame_(NSMakeRect(10, 5, frame.size.width - 20, frame.size.height - 10))
        self.transcript_label.setFont_(NSFont.monospacedSystemFontOfSize_weight_(10, 0.4))
        self.transcript_label.setTextColor_(NSColor.colorWithCalibratedRed_green_blue_alpha_(0.7, 0.7, 0.7, 1.0))
        self.transcript_label.setBezeled_(False)
        self.transcript_label.setDrawsBackground_(False)
        self.transcript_label.setEditable_(False)
        self.transcript_label.setSelectable_(False)
        self.transcript_label.setMaximumNumberOfLines_(3)
        self.addSubview_(self.transcript_label)
        
        return self
    
    def setText_(self, text):
        # Show last 150 chars
        display = text[-150:] if len(text) > 150 else text
        self.transcript_label.setStringValue_(display)


class OverlayWindow(NSPanel):
    """Main overlay window - always on top, transparent, draggable."""
    
    def initWithPosition_(self, position):
        # Calculate frame based on position
        screen = NSScreen.mainScreen()
        screen_frame = screen.visibleFrame()
        
        height = HEADER_HEIGHT + (CARD_HEIGHT + 10) * MAX_SUGGESTIONS + FOOTER_HEIGHT + 60  # Extra for transcript
        
        if position == "right":
            x = screen_frame.origin.x + screen_frame.size.width - WINDOW_WIDTH - 20
        elif position == "left":
            x = screen_frame.origin.x + 20
        else:  # center
            x = screen_frame.origin.x + (screen_frame.size.width - WINDOW_WIDTH) / 2
        
        y = screen_frame.origin.y + screen_frame.size.height - height - 50
        
        frame = NSMakeRect(x, y, WINDOW_WIDTH, height)
        
        style = (NSWindowStyleMaskBorderless | 
                 NSWindowStyleMaskNonactivatingPanel |
                 NSWindowStyleMaskUtilityWindow)
        
        self = objc.super(OverlayWindow, self).initWithContentRect_styleMask_backing_defer_(
            frame, style, NSBackingStoreBuffered, False
        )
        if self is None:
            return None
        
        # Window properties
        self.setLevel_(NSStatusWindowLevel)
        self.setOpaque_(False)
        self.setBackgroundColor_(NSColor.clearColor())
        self.setHasShadow_(True)
        self.setMovableByWindowBackground_(True)
        self.setCollectionBehavior_(
            NSWindowCollectionBehaviorCanJoinAllSpaces |
            NSWindowCollectionBehaviorFullScreenAuxiliary |
            NSWindowCollectionBehaviorStationary
        )
        
        # Visual effect background (vibrancy)
        visual_effect = NSVisualEffectView.alloc().initWithFrame_(self.contentView().bounds())
        visual_effect.setAutoresizingMask_(18)  # Width + Height
        visual_effect.setMaterial_(NSVisualEffectMaterialHUDWindow)
        visual_effect.setBlendingMode_(NSVisualEffectBlendingModeBehindWindow)
        visual_effect.setState_(1)  # Active
        visual_effect.wantsLayer = True
        visual_effect.layer().setCornerRadius_(15)
        visual_effect.layer().setMasksToBounds_(True)
        self.contentView().addSubview_(visual_effect)
        
        self.visual_effect = visual_effect
        self.suggestion_cards = []
        self.on_copy_callback = None
        self.on_voice_callback = None
        
        self._setup_ui()
        
        return self
    
    def _setup_ui(self):
        content = self.visual_effect
        width = content.bounds().size.width
        y_offset = content.bounds().size.height - HEADER_HEIGHT
        
        # Header
        header = NSTextField.alloc().initWithFrame_(NSMakeRect(15, y_offset, width - 30, 30))
        header.setStringValue_("🎯 SE-Bot Suggestions")
        header.setFont_(NSFont.boldSystemFontOfSize_(14))
        header.setTextColor_(NSColor.whiteColor())
        header.setBezeled_(False)
        header.setDrawsBackground_(False)
        header.setEditable_(False)
        content.addSubview_(header)
        self.header = header
        
        # Status badge
        self.status = NSTextField.alloc().initWithFrame_(NSMakeRect(width - 80, y_offset + 5, 70, 20))
        self.status.setStringValue_("● Listening")
        self.status.setFont_(NSFont.systemFontOfSize_(10))
        self.status.setTextColor_(NSColor.colorWithCalibratedRed_green_blue_alpha_(0.3, 0.9, 0.4, 1.0))
        self.status.setBezeled_(False)
        self.status.setDrawsBackground_(False)
        self.status.setEditable_(False)
        self.status.setAlignment_(2)  # Right aligned
        content.addSubview_(self.status)
        
        y_offset -= 10
        
        # Suggestion cards
        for i in range(MAX_SUGGESTIONS):
            y_offset -= CARD_HEIGHT + 5
            card_frame = NSMakeRect(10, y_offset, width - 20, CARD_HEIGHT)
            card = SuggestionCard.alloc().initWithFrame_index_callback_voiceCallback_(
                card_frame, i, self._on_card_click, self._on_card_voice
            )
            card.setText_(f"Waiting for suggestions...")
            content.addSubview_(card)
            self.suggestion_cards.append(card)
        
        y_offset -= 10
        
        # Transcript view
        y_offset -= 50
        self.transcript = TranscriptView.alloc().initWithFrame_(NSMakeRect(10, y_offset, width - 20, 45))
        self.transcript.setText_("Transcript will appear here...")
        content.addSubview_(self.transcript)
        
        # Footer hint
        footer = NSTextField.alloc().initWithFrame_(NSMakeRect(10, 5, width - 20, 20))
        footer.setStringValue_("1/2/3 copy • Shift+1/2/3 speak • Cmd+Shift+S toggle")
        footer.setFont_(NSFont.systemFontOfSize_(9))
        footer.setTextColor_(NSColor.colorWithCalibratedRed_green_blue_alpha_(0.6, 0.6, 0.6, 1.0))
        footer.setBezeled_(False)
        footer.setDrawsBackground_(False)
        footer.setEditable_(False)
        footer.setAlignment_(1)  # Center
        content.addSubview_(footer)
    
    def _on_card_click(self, index, text):
        self._copy_to_clipboard(text)
        if self.on_copy_callback:
            self.on_copy_callback(index, text)
    
    def _on_card_voice(self, index, text):
        """Called when a suggestion's speaker button is clicked."""
        if self.on_voice_callback:
            self.on_voice_callback(index, text)
        # Update status
        self.status.setStringValue_("🎤 Speaking...")
        self.status.setTextColor_(NSColor.colorWithCalibratedRed_green_blue_alpha_(0.9, 0.7, 0.2, 1.0))
        # Update card speaking state
        if index < len(self.suggestion_cards):
            self.suggestion_cards[index].setSpeaking_(True)
    
    def setSpeakingDone_(self, index):
        """Called when TTS playback completes."""
        self.status.setStringValue_("● Listening")
        self.status.setTextColor_(NSColor.colorWithCalibratedRed_green_blue_alpha_(0.3, 0.9, 0.4, 1.0))
        if index < len(self.suggestion_cards):
            self.suggestion_cards[index].setSpeaking_(False)
    
    def _copy_to_clipboard(self, text):
        pasteboard = NSPasteboard.generalPasteboard()
        pasteboard.clearContents()
        pasteboard.setString_forType_(text, NSStringPboardType)
        # Visual feedback
        self.status.setStringValue_("✓ Copied!")
        self.status.setTextColor_(NSColor.colorWithCalibratedRed_green_blue_alpha_(0.3, 0.9, 0.4, 1.0))
        NSTimer.scheduledTimerWithTimeInterval_target_selector_userInfo_repeats_(
            1.5, self, objc.selector(self.resetStatus, signature=b'v@:'), None, False
        )
    
    def resetStatus(self):
        self.status.setStringValue_("● Listening")
    
    def setSuggestions_(self, suggestions):
        """
        Update displayed suggestions.
        
        Suggestions can be:
        - List of strings
        - List of dicts with keys: text, style (optional), badge (optional)
        
        For battle cards, style determines color:
        - battle-card-strength: Green
        - battle-card-caution: Yellow
        - battle-card-neutral: Blue
        """
        for i, card in enumerate(self.suggestion_cards):
            if i < len(suggestions):
                sugg = suggestions[i]
                if isinstance(sugg, dict):
                    text = sugg.get('text', '')
                    style = sugg.get('style', '')
                    badge = sugg.get('badge', '')
                else:
                    text = str(sugg)
                    style = ''
                    badge = ''
                
                card.setText_(text)
                card.setStyle_(style)
                card.setBadge_(badge)
                card.setHidden_(False)
            else:
                card.setText_("...")
                card.setStyle_('')  # Reset to default color
                card.setBadge_('')
                card.setHidden_(True)
    
    def setTranscript_(self, text):
        """Update live transcript display."""
        self.transcript.setText_(text)
    
    def setStatus_(self, status, color=None):
        """Update status indicator."""
        self.status.setStringValue_(status)
        if color:
            r, g, b = color
            self.status.setTextColor_(NSColor.colorWithCalibratedRed_green_blue_alpha_(r, g, b, 1.0))
    
    def handleKeyPress_modifiers_(self, key_code, modifiers):
        """Handle keyboard shortcuts for suggestion selection."""
        # Keys 1, 2, 3 (codes 18, 19, 20)
        if key_code in (18, 19, 20):
            index = key_code - 18
            if index < len(self.suggestion_cards):
                card = self.suggestion_cards[index]
                if card.suggestion_text:
                    # Shift+1/2/3 = speak, 1/2/3 = copy
                    if modifiers & NSEventModifierFlagShift:
                        self._on_card_voice(index, card.suggestion_text)
                    else:
                        self._copy_to_clipboard(card.suggestion_text)
                    return True
        return False
    
    # Backward compatibility
    def handleKeyPress_(self, key_code):
        return self.handleKeyPress_modifiers_(key_code, 0)


class SEBotOverlayApp:
    """Main application controller."""
    
    def __init__(self, position="right"):
        self.position = position
        self.window = None
        self.is_visible = True
        self.app = None
        self.global_monitor = None
        self.local_monitor = None
        
        # Voice output (optional - requires ElevenLabs API key)
        self.voice_output = None
        self.voice_enabled = False
        self._init_voice_output()
        
        # Callbacks for integration
        self.on_suggestion_copied = None
        self.on_visibility_changed = None
        self.on_suggestion_spoken = None
    
    def _init_voice_output(self):
        """Initialize voice output if ElevenLabs API key is available."""
        try:
            from voice_output import VoiceOutput
            self.voice_output = VoiceOutput()
            if self.voice_output.api_key:
                self.voice_enabled = True
                print("🎤 Voice output enabled (ElevenLabs)")
            else:
                # Fall back to macOS TTS
                self.voice_enabled = True  # macOS TTS always available
                print("🎤 Voice output enabled (macOS TTS fallback)")
        except ImportError as e:
            print(f"⚠️  Voice output not available: {e}")
            self.voice_output = None
            self.voice_enabled = False
    
    def start(self):
        """Start the overlay application."""
        self.app = NSApplication.sharedApplication()
        self.app.setActivationPolicy_(1)  # Accessory (no dock icon)
        
        # Create overlay window
        self.window = OverlayWindow.alloc().initWithPosition_(self.position)
        self.window.on_copy_callback = self._on_copy
        self.window.on_voice_callback = self._on_voice
        
        # Register global hotkey (Cmd+Shift+S)
        self._setup_hotkey()
        
        # Show window
        self.window.orderFront_(None)
        
        print("SE-Bot Overlay started. Press Cmd+Shift+S to toggle visibility.")
        print("Press 1/2/3 to copy, Shift+1/2/3 to speak. Drag to reposition.")
        
        # Run event loop
        self.app.run()
    
    def _setup_hotkey(self):
        """Set up global hotkey monitoring."""
        # Global monitor for hotkey (works when app is not focused)
        def global_handler(event):
            if event.type() == 10:  # NSEventTypeKeyDown
                flags = event.modifierFlags()
                if (flags & NSEventModifierFlagCommand and 
                    flags & NSEventModifierFlagShift and 
                    event.keyCode() == HOTKEY_CODE):
                    self.toggle_visibility()
                    return None
            return event
        
        self.global_monitor = NSEvent.addGlobalMonitorForEventsMatchingMask_handler_(
            NSEventMask.NSEventMaskKeyDown, global_handler
        )
        
        # Local monitor for number keys when overlay is focused
        def local_handler(event):
            if event.type() == 10:  # NSEventTypeKeyDown
                # Handle toggle hotkey
                flags = event.modifierFlags()
                if (flags & NSEventModifierFlagCommand and 
                    flags & NSEventModifierFlagShift and 
                    event.keyCode() == HOTKEY_CODE):
                    self.toggle_visibility()
                    return None
                # Handle number keys (with or without Shift for voice)
                if self.window and self.window.handleKeyPress_modifiers_(event.keyCode(), flags):
                    return None
            return event
        
        self.local_monitor = NSEvent.addLocalMonitorForEventsMatchingMask_handler_(
            NSEventMask.NSEventMaskKeyDown, local_handler
        )
    
    def toggle_visibility(self):
        """Toggle overlay visibility."""
        self.is_visible = not self.is_visible
        if self.is_visible:
            self.window.orderFront_(None)
        else:
            self.window.orderOut_(None)
        
        if self.on_visibility_changed:
            self.on_visibility_changed(self.is_visible)
    
    def _on_copy(self, index, text):
        """Called when a suggestion is copied."""
        if self.on_suggestion_copied:
            self.on_suggestion_copied(index, text)
        print(f"Copied suggestion {index + 1}: {text[:50]}...")
    
    def _on_voice(self, index, text):
        """Called when a suggestion should be spoken."""
        if not self.voice_enabled:
            print("⚠️  Voice output not available")
            return
        
        if self.on_suggestion_spoken:
            self.on_suggestion_spoken(index, text)
        
        print(f"🎤 Speaking suggestion {index + 1}: {text[:50]}...")
        
        # Speak in background thread to not block UI
        def speak_thread():
            try:
                if self.voice_output and self.voice_output.api_key:
                    # Use ElevenLabs
                    self.voice_output.speak(text, blocking=True)
                else:
                    # Fall back to macOS TTS
                    import subprocess
                    subprocess.run(["say", text], check=True, capture_output=True)
            except Exception as e:
                print(f"⚠️  Voice error: {e}")
            finally:
                # Update UI when done (on main thread)
                if self.window:
                    self.window.performSelectorOnMainThread_withObject_waitUntilDone_(
                        objc.selector(self.window.setSpeakingDone_, signature=b'v@:i'),
                        index, False
                    )
        
        import threading
        threading.Thread(target=speak_thread, daemon=True).start()
    
    def update_suggestions(self, suggestions):
        """Update displayed suggestions from external source."""
        if self.window:
            self.window.performSelectorOnMainThread_withObject_waitUntilDone_(
                objc.selector(self.window.setSuggestions_, signature=b'v@:@'),
                suggestions, False
            )
    
    def update_transcript(self, text):
        """Update live transcript display."""
        if self.window:
            self.window.performSelectorOnMainThread_withObject_waitUntilDone_(
                objc.selector(self.window.setTranscript_, signature=b'v@:@'),
                text, False
            )
    
    def update_status(self, status, color=None):
        """Update status indicator."""
        if self.window:
            # Schedule on main thread
            def update():
                self.window.setStatus_(status, color)
            NSTimer.scheduledTimerWithTimeInterval_target_selector_userInfo_repeats_(
                0.01, self.window, objc.selector(update, signature=b'v@:'), None, False
            )
    
    def stop(self):
        """Stop the overlay application."""
        if self.global_monitor:
            NSEvent.removeMonitor_(self.global_monitor)
        if self.local_monitor:
            NSEvent.removeMonitor_(self.local_monitor)
        if self.app:
            self.app.stop_(None)


def run_demo():
    """Run demo mode with test suggestions."""
    app = SEBotOverlayApp(position="right")
    
    # Demo suggestions
    demo_suggestions = [
        {"text": "Our SASE architecture provides unified security with single-pass inspection, reducing latency by 40% compared to traditional solutions. The integrated SD-WAN eliminates backhaul costs."},
        {"text": "Unlike Palo Alto's bolt-on approach, we offer true convergence - ZTNA, SWG, CASB, and FWaaS in a single platform. This means one policy engine, one management console."},
        {"text": "For your 500+ remote sites, our flexible deployment model supports physical, virtual, and cloud-native options. We can start with a pilot of 5-10 sites in just 2 weeks."},
    ]
    
    def update_demo_data():
        app.update_suggestions(demo_suggestions)
        app.update_transcript("...so what I'm really looking for is a solution that can handle our multi-cloud environment and provide consistent security policies...")
    
    # Update after app starts
    threading.Timer(1.0, update_demo_data).start()
    
    # Start app (blocks)
    app.start()


def main():
    parser = argparse.ArgumentParser(description="SE-Bot Meeting Overlay UI")
    parser.add_argument("--test", action="store_true", help="Run in demo mode with test data")
    parser.add_argument("--position", choices=["left", "right", "center"], default="right",
                       help="Screen position (default: right)")
    
    args = parser.parse_args()
    
    if args.test:
        run_demo()
    else:
        app = SEBotOverlayApp(position=args.position)
        app.start()


if __name__ == "__main__":
    main()
