#!/usr/bin/env python3
"""
iPhone Mirroring Click Tool
===========================
Uses CGEvent API to send mouse clicks directly to iPhone Mirroring window.
This bypasses normal event routing and may work better with special rendering.

Usage: python iphone-click.py <x> <y> [--window-pos X,Y]
"""

import subprocess
import sys
import time

try:
    from Quartz import (
        CGEventCreateMouseEvent,
        CGEventPost,
        kCGEventLeftMouseDown,
        kCGEventLeftMouseUp,
        kCGMouseButtonLeft,
        kCGHIDEventTap,
        CGEventSetType,
        CGMainDisplayID,
        CGDisplayBounds,
    )
    from Quartz.CoreGraphics import CGPointMake
    QUARTZ_AVAILABLE = True
except ImportError:
    QUARTZ_AVAILABLE = False
    print("Quartz not available, using fallback method")


def get_iphone_window_position():
    """Get iPhone Mirroring window position using AppleScript"""
    script = '''
    tell application "System Events"
        tell process "iPhone Mirroring"
            set winPos to position of window 1
            set winSize to size of window 1
            set x to item 1 of winPos as integer
            set y to item 2 of winPos as integer
            set w to item 1 of winSize as integer
            set h to item 2 of winSize as integer
            return (x as string) & " " & (y as string) & " " & (w as string) & " " & (h as string)
        end tell
    end tell
    '''
    result = subprocess.run(['osascript', '-e', script], capture_output=True, text=True)
    if result.returncode == 0:
        # Parse output like "0 30 348 766"
        parts = result.stdout.strip().split()
        return {
            'x': int(parts[0]),
            'y': int(parts[1]),
            'width': int(parts[2]),
            'height': int(parts[3])
        }
    return None


def activate_iphone_mirroring():
    """Bring iPhone Mirroring to front"""
    subprocess.run(['osascript', '-e', 'tell application "iPhone Mirroring" to activate'], 
                   capture_output=True)
    time.sleep(0.3)


def click_cgevent(x, y):
    """Click using CGEvent API (low-level)"""
    if not QUARTZ_AVAILABLE:
        return False
    
    point = CGPointMake(float(x), float(y))
    
    # Create mouse down event
    mouse_down = CGEventCreateMouseEvent(None, kCGEventLeftMouseDown, point, kCGMouseButtonLeft)
    # Create mouse up event
    mouse_up = CGEventCreateMouseEvent(None, kCGEventLeftMouseUp, point, kCGMouseButtonLeft)
    
    # Post events
    CGEventPost(kCGHIDEventTap, mouse_down)
    time.sleep(0.05)
    CGEventPost(kCGHIDEventTap, mouse_up)
    
    return True


def click_applescript_mouse(x, y):
    """Click using AppleScript do shell script with cliclick"""
    # First move mouse to position
    subprocess.run(['cliclick', f'm:{x},{y}'], capture_output=True)
    time.sleep(0.1)
    # Then click
    subprocess.run(['cliclick', f'c:{x},{y}'], capture_output=True)
    return True


def click_with_hold(x, y, hold_time=0.1):
    """Click with a brief hold using CGEvent"""
    if not QUARTZ_AVAILABLE:
        return click_applescript_mouse(x, y)
    
    point = CGPointMake(float(x), float(y))
    
    # Move mouse first
    mouse_move = CGEventCreateMouseEvent(None, kCGEventLeftMouseDown, point, kCGMouseButtonLeft)
    CGEventSetType(mouse_move, 5)  # kCGEventMouseMoved
    CGEventPost(kCGHIDEventTap, mouse_move)
    time.sleep(0.05)
    
    # Mouse down
    mouse_down = CGEventCreateMouseEvent(None, kCGEventLeftMouseDown, point, kCGMouseButtonLeft)
    CGEventPost(kCGHIDEventTap, mouse_down)
    
    # Hold
    time.sleep(hold_time)
    
    # Mouse up
    mouse_up = CGEventCreateMouseEvent(None, kCGEventLeftMouseUp, point, kCGMouseButtonLeft)
    CGEventPost(kCGHIDEventTap, mouse_up)
    
    return True


def tap_iphone(rel_x, rel_y, window_pos=None):
    """
    Tap on iPhone screen at relative position.
    rel_x, rel_y are relative to the phone screen area within the window.
    """
    if window_pos is None:
        window_pos = get_iphone_window_position()
    
    if window_pos is None:
        print("Error: Could not get iPhone Mirroring window position")
        return False
    
    # Window chrome offsets (title bar, etc.)
    TITLE_BAR_HEIGHT = 28  # Window title bar
    PHONE_PADDING_LEFT = 0
    PHONE_PADDING_TOP = 0
    
    # Calculate absolute screen position
    abs_x = window_pos['x'] + PHONE_PADDING_LEFT + rel_x
    abs_y = window_pos['y'] + TITLE_BAR_HEIGHT + PHONE_PADDING_TOP + rel_y
    
    print(f"Window at: ({window_pos['x']}, {window_pos['y']})")
    print(f"Clicking at absolute: ({abs_x}, {abs_y})")
    print(f"  (relative to phone: {rel_x}, {rel_y})")
    
    # Activate window first
    activate_iphone_mirroring()
    
    # Try CGEvent click
    if QUARTZ_AVAILABLE:
        print("Using CGEvent API...")
        return click_with_hold(abs_x, abs_y, hold_time=0.15)
    else:
        print("Using cliclick fallback...")
        return click_applescript_mouse(abs_x, abs_y)


def main():
    if len(sys.argv) < 3:
        print("Usage: python iphone-click.py <rel_x> <rel_y>")
        print("  rel_x, rel_y are relative to the phone screen (not window)")
        print("")
        print("Common positions for Polymarket (348x766 window):")
        print("  Back button: 20 48")
        print("  Home tab: 60 700")
        print("  Center tap: 174 400")
        sys.exit(1)
    
    rel_x = int(sys.argv[1])
    rel_y = int(sys.argv[2])
    
    success = tap_iphone(rel_x, rel_y)
    if success:
        print("Click sent successfully")
    else:
        print("Click failed")
    
    return 0 if success else 1


if __name__ == "__main__":
    sys.exit(main())
