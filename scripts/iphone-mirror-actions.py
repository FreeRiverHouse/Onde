#!/usr/bin/env python3
"""
iPhone Mirroring - Azioni programmatiche
Usa cliclick per click e CGEvent per scroll.

Usage:
    python3 scripts/iphone-mirror-actions.py click X Y
    python3 scripts/iphone-mirror-actions.py scroll_down [steps] [amount]
    python3 scripts/iphone-mirror-actions.py scroll_up [steps] [amount]
    python3 scripts/iphone-mirror-actions.py swipe_confirm
    python3 scripts/iphone-mirror-actions.py screenshot [output_path]
    python3 scripts/iphone-mirror-actions.py window_info
    python3 scripts/iphone-mirror-actions.py pixel_to_point PX PY
"""

import sys
import os
import subprocess
import time

def get_window_info():
    """Get iPhone Mirroring window position and size."""
    result = subprocess.run(
        ['osascript', '-e', 
         'tell application "System Events" to tell process "iPhone Mirroring" to get {position, size} of window 1'],
        capture_output=True, text=True
    )
    if result.returncode != 0:
        print(f"ERROR: {result.stderr.strip()}")
        sys.exit(1)
    parts = [int(x.strip()) for x in result.stdout.strip().split(',')]
    return {'x': parts[0], 'y': parts[1], 'w': parts[2], 'h': parts[3]}

def click(abs_x, abs_y):
    """Click at absolute point coordinates."""
    result = subprocess.run(['cliclick', f'c:{abs_x},{abs_y}'], capture_output=True, text=True)
    if result.returncode != 0:
        print(f"ERROR: {result.stderr.strip()}")
        return False
    print(f"Click at ({abs_x},{abs_y}) OK")
    return True

def scroll(direction='down', steps=10, amount=30):
    """Scroll using CGEvent pixel scroll."""
    import Quartz
    
    win = get_window_info()
    cx = win['x'] + win['w'] // 2
    cy = win['y'] + win['h'] // 2
    
    delta = -amount if direction == 'down' else amount
    
    for i in range(steps):
        ev = Quartz.CGEventCreateScrollWheelEvent(
            None, Quartz.kCGScrollEventUnitPixel, 1, delta)
        Quartz.CGEventSetLocation(ev, Quartz.CGPointMake(cx, cy))
        Quartz.CGEventPost(Quartz.kCGHIDEventTap, ev)
        time.sleep(0.03)
    
    print(f"Scroll {direction} ({steps} steps, {amount}px each) at ({cx},{cy}) OK")

def swipe_confirm():
    """Swipe to confirm (e.g., Polymarket 'Swipe to buy')."""
    import Quartz
    
    win = get_window_info()
    cx = win['x'] + win['w'] // 2
    # Bottom area of the screen (~93%)
    cy = win['y'] + int(win['h'] * 0.93)
    
    for i in range(15):
        ev = Quartz.CGEventCreateScrollWheelEvent(
            None, Quartz.kCGScrollEventUnitPixel, 1, -50)
        Quartz.CGEventSetLocation(ev, Quartz.CGPointMake(cx, cy))
        Quartz.CGEventPost(Quartz.kCGHIDEventTap, ev)
        time.sleep(0.02)
    
    print(f"Swipe confirm at ({cx},{cy}) OK")

def screenshot(output_path='/tmp/iphone-mirror-screenshot.png'):
    """Take screenshot of iPhone Mirroring window."""
    win = get_window_info()
    region = f"{win['x']},{win['y']},{win['w']},{win['h']}"
    result = subprocess.run(
        ['/usr/sbin/screencapture', '-R', region, output_path],
        capture_output=True, text=True
    )
    if result.returncode != 0:
        print(f"ERROR: {result.stderr.strip()}")
        return None
    print(f"Screenshot saved: {output_path}")
    return output_path

def pixel_to_point(px, py):
    """Convert image pixel coordinates to absolute point coordinates."""
    win = get_window_info()
    abs_x = win['x'] + px // 2
    abs_y = win['y'] + py // 2
    print(f"Pixel ({px},{py}) → Point ({abs_x},{abs_y})")
    print(f"Window: ({win['x']},{win['y']}) {win['w']}x{win['h']}")
    return abs_x, abs_y

def main():
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)
    
    action = sys.argv[1]
    
    if action == 'click':
        if len(sys.argv) < 4:
            print("Usage: click X Y")
            sys.exit(1)
        click(int(sys.argv[2]), int(sys.argv[3]))
    
    elif action == 'scroll_down':
        steps = int(sys.argv[2]) if len(sys.argv) > 2 else 10
        amount = int(sys.argv[3]) if len(sys.argv) > 3 else 30
        scroll('down', steps, amount)
    
    elif action == 'scroll_up':
        steps = int(sys.argv[2]) if len(sys.argv) > 2 else 10
        amount = int(sys.argv[3]) if len(sys.argv) > 3 else 30
        scroll('up', steps, amount)
    
    elif action == 'swipe_confirm':
        swipe_confirm()
    
    elif action == 'screenshot':
        output = sys.argv[2] if len(sys.argv) > 2 else '/tmp/iphone-mirror-screenshot.png'
        screenshot(output)
    
    elif action == 'window_info':
        win = get_window_info()
        print(f"Position: ({win['x']},{win['y']})")
        print(f"Size: {win['w']}x{win['h']}")
        print(f"Center: ({win['x']+win['w']//2},{win['y']+win['h']//2})")
    
    elif action == 'pixel_to_point':
        if len(sys.argv) < 4:
            print("Usage: pixel_to_point PX PY")
            sys.exit(1)
        pixel_to_point(int(sys.argv[2]), int(sys.argv[3]))
    
    else:
        print(f"Unknown action: {action}")
        print(__doc__)
        sys.exit(1)

if __name__ == '__main__':
    main()
