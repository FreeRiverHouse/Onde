#!/usr/bin/env python3
"""
Polymarket Phone Mirror Navigator
===================================
Unified CLI tool for interacting with Polymarket via iPhone Mirroring.

Uses CGEvent API for clicks/scrolls and screencapture for screenshots.
Auto-detects iPhone Mirroring window position.

⛔ NEVER USE BROWSER FOR POLYMARKET - PHONE MIRROR ONLY! ⛔

Usage:
    python polymarket-navigator.py screenshot [--output PATH]
    python polymarket-navigator.py click <rel_x> <rel_y>
    python polymarket-navigator.py scroll <up|down> [--amount N]
    python polymarket-navigator.py back
    python polymarket-navigator.py home
    python polymarket-navigator.py nba
    python polymarket-navigator.py nhl
    python polymarket-navigator.py cbb
    python polymarket-navigator.py ufc
    python polymarket-navigator.py politics
    python polymarket-navigator.py today
    python polymarket-navigator.py bet <left|right> [--game N]
    python polymarket-navigator.py search
    python polymarket-navigator.py deposit
    python polymarket-navigator.py swipe <up|down|left|right> [--distance N]
    python polymarket-navigator.py info
"""

import argparse
import json
import os
import subprocess
import sys
import time
from datetime import datetime
from pathlib import Path

# ==============================================================================
# Quartz imports (macOS native)
# ==============================================================================
try:
    from Quartz import (
        CGEventCreateMouseEvent,
        CGEventCreateScrollWheelEvent,
        CGEventPost,
        CGEventSetIntegerValueField,
        CGWindowListCopyWindowInfo,
        kCGEventLeftMouseDown,
        kCGEventLeftMouseUp,
        kCGEventMouseMoved,
        kCGMouseButtonLeft,
        kCGHIDEventTap,
        kCGScrollEventUnitPixel,
        kCGWindowListOptionAll,
        kCGNullWindowID,
    )
    from Quartz.CoreGraphics import CGPointMake, CGEventSetType
    QUARTZ_AVAILABLE = True
except ImportError:
    QUARTZ_AVAILABLE = False

# ==============================================================================
# Constants
# ==============================================================================

# Window chrome: title bar height in logical points
TITLE_BAR_HEIGHT = 28

# Retina scale factor (logical -> capture pixels)
# iPhone Mirroring window: 348x766 logical -> 920x1756 capture
RETINA_SCALE = 2.644

# Default screenshot directory
DEFAULT_SCREENSHOT_DIR = "/tmp"

# Timing constants (seconds)
ACTIVATE_DELAY = 0.3
CLICK_HOLD_TIME = 0.15
MOVE_DELAY = 0.05
POST_CLICK_DELAY = 0.1
SCROLL_STEP_DELAY = 0.03

# ==============================================================================
# Polymarket UI Layout (logical coordinates relative to phone screen content)
# These are measured from the top-left of the PHONE SCREEN area (below title bar)
#
# Coordinate system:
#   (0, 0) = top-left of phone screen content area
#   Window content area is typically ~348 x ~738 (766 - 28 title bar)
# ==============================================================================

UI_ELEMENTS = {
    # Top navigation bar
    "back_button":      (20, 48),      # iOS back chevron (top-left area)
    "polymarket_logo":  (76, 55),      # "Polymarket" text/logo

    # Sport category tabs (horizontal row)
    "today_tab":        (64, 89),      # Today (first tab)
    "nba_tab":          (100, 89),     # NBA
    "nhl_tab":          (132, 89),     # NHL
    "cbb_tab":          (165, 89),     # CBB
    "ufc_tab":          (197, 89),     # UFC
    "politics_tab":     (231, 89),     # Politics

    # Action buttons
    "deposit_button":   (265, 55),     # Blue "Deposit" button (top-right)
    "search_button":    (212, 611),    # Search icon (bottom nav)

    # Bottom navigation bar
    "home_button":      (123, 611),    # Home icon (bottom nav)
    "balance_text":     (163, 611),    # Balance display

    # Game card bet buttons (relative to screen, for first visible game)
    # Each game card has two bet buttons side by side
    # Game 1 (first visible game)
    "bet_left_1":       (106, 184),    # Left bet button, game 1 (team A / underdog)
    "bet_right_1":      (219, 184),    # Right bet button, game 1 (team B / favorite)
    # Game 2
    "bet_left_2":       (106, 328),    # Left bet button, game 2
    "bet_right_2":      (219, 328),    # Right bet button, game 2
    # Game 3
    "bet_left_3":       (106, 472),    # Left bet button, game 3
    "bet_right_3":      (219, 472),    # Right bet button, game 3

    # Scroll target (center of scrollable area)
    "scroll_center":    (174, 400),    # Center of the main content area
}

# Swipe distances (in logical points)
SWIPE_DISTANCES = {
    "short": 100,
    "medium": 200,
    "long": 350,
}


# ==============================================================================
# Window Detection
# ==============================================================================

def get_iphone_window_info():
    """
    Get iPhone Mirroring window position and size using CGWindowList API.
    Returns the main content window (not menu bar or auxiliary windows).
    """
    if not QUARTZ_AVAILABLE:
        return _get_window_via_applescript()

    windows = CGWindowListCopyWindowInfo(kCGWindowListOptionAll, kCGNullWindowID)
    best_window = None

    for w in windows:
        owner = w.get("kCGWindowOwnerName", "")
        if owner != "iPhone Mirroring":
            continue

        bounds = w.get("kCGWindowBounds", {})
        h = bounds.get("Height", 0)
        wd = bounds.get("Width", 0)

        # The main window is tall and narrow (phone aspect ratio ~348x766)
        # Filter out menu bars (30px high) and rendering surfaces (wider)
        if h > 700 and wd < 400:
            window_id = w.get("kCGWindowNumber")
            best_window = {
                "id": window_id,
                "x": int(bounds.get("X", 0)),
                "y": int(bounds.get("Y", 0)),
                "width": int(wd),
                "height": int(h),
            }
            break

    if best_window is None:
        # Fallback: try AppleScript
        return _get_window_via_applescript()

    return best_window


def _get_window_via_applescript():
    """Fallback: get window info via AppleScript."""
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
    result = subprocess.run(["osascript", "-e", script], capture_output=True, text=True)
    if result.returncode != 0:
        return None

    parts = result.stdout.strip().split()
    if len(parts) != 4:
        return None

    return {
        "id": None,
        "x": int(parts[0]),
        "y": int(parts[1]),
        "width": int(parts[2]),
        "height": int(parts[3]),
    }


def activate_iphone_mirroring():
    """Bring iPhone Mirroring window to front."""
    subprocess.run(
        ["osascript", "-e", 'tell application "iPhone Mirroring" to activate'],
        capture_output=True,
    )
    time.sleep(ACTIVATE_DELAY)


def phone_to_screen(rel_x, rel_y, window=None):
    """
    Convert phone-relative coordinates to absolute screen coordinates.
    
    rel_x, rel_y: position relative to phone screen content area (0,0 = top-left)
    Returns: (abs_x, abs_y) in screen coordinates
    """
    if window is None:
        window = get_iphone_window_info()
    if window is None:
        raise RuntimeError("Cannot find iPhone Mirroring window")

    abs_x = window["x"] + rel_x
    abs_y = window["y"] + TITLE_BAR_HEIGHT + rel_y
    return abs_x, abs_y


# ==============================================================================
# Input Actions
# ==============================================================================

def click(rel_x, rel_y, window=None, hold_time=CLICK_HOLD_TIME):
    """
    Click at phone-relative coordinates.
    Uses CGEvent for reliable delivery to iPhone Mirroring.
    """
    abs_x, abs_y = phone_to_screen(rel_x, rel_y, window)

    activate_iphone_mirroring()

    if QUARTZ_AVAILABLE:
        point = CGPointMake(float(abs_x), float(abs_y))

        # Move mouse to position first
        move_event = CGEventCreateMouseEvent(None, kCGEventLeftMouseDown, point, kCGMouseButtonLeft)
        CGEventSetType(move_event, kCGEventMouseMoved)
        CGEventPost(kCGHIDEventTap, move_event)
        time.sleep(MOVE_DELAY)

        # Mouse down
        down_event = CGEventCreateMouseEvent(None, kCGEventLeftMouseDown, point, kCGMouseButtonLeft)
        CGEventPost(kCGHIDEventTap, down_event)

        # Hold briefly (iPhone Mirroring needs this)
        time.sleep(hold_time)

        # Mouse up
        up_event = CGEventCreateMouseEvent(None, kCGEventLeftMouseUp, point, kCGMouseButtonLeft)
        CGEventPost(kCGHIDEventTap, up_event)
    else:
        # Fallback: cliclick
        subprocess.run(["cliclick", f"m:{abs_x},{abs_y}"], capture_output=True)
        time.sleep(0.1)
        subprocess.run(["cliclick", f"c:{abs_x},{abs_y}"], capture_output=True)

    return True


def scroll(direction="down", amount=3, window=None):
    """
    Scroll the phone screen.
    
    direction: 'up' or 'down'
    amount: number of scroll steps (1-10, each step ~50px)
    """
    if not QUARTZ_AVAILABLE:
        print("Error: Scroll requires Quartz framework", file=sys.stderr)
        return False

    # Move mouse to scroll center first
    cx, cy = UI_ELEMENTS["scroll_center"]
    abs_x, abs_y = phone_to_screen(cx, cy, window)

    activate_iphone_mirroring()

    # Move mouse to scroll position
    point = CGPointMake(float(abs_x), float(abs_y))
    move_event = CGEventCreateMouseEvent(None, kCGEventLeftMouseDown, point, kCGMouseButtonLeft)
    CGEventSetType(move_event, kCGEventMouseMoved)
    CGEventPost(kCGHIDEventTap, move_event)
    time.sleep(MOVE_DELAY)

    # Scroll direction: positive = scroll up (content moves down), negative = scroll down
    pixels_per_step = 50
    delta = pixels_per_step if direction == "up" else -pixels_per_step

    for _ in range(amount):
        scroll_event = CGEventCreateScrollWheelEvent(
            None, kCGScrollEventUnitPixel, 1, delta
        )
        CGEventPost(kCGHIDEventTap, scroll_event)
        time.sleep(SCROLL_STEP_DELAY)

    return True


def swipe(direction="up", distance=200, window=None):
    """
    Perform a swipe gesture via mouse drag.
    
    direction: 'up', 'down', 'left', 'right'
    distance: swipe distance in logical points
    """
    if not QUARTZ_AVAILABLE:
        print("Error: Swipe requires Quartz framework", file=sys.stderr)
        return False

    cx, cy = UI_ELEMENTS["scroll_center"]
    abs_x, abs_y = phone_to_screen(cx, cy, window)

    activate_iphone_mirroring()

    # Calculate start and end points
    if direction == "up":
        start = CGPointMake(float(abs_x), float(abs_y + distance // 2))
        end = CGPointMake(float(abs_x), float(abs_y - distance // 2))
    elif direction == "down":
        start = CGPointMake(float(abs_x), float(abs_y - distance // 2))
        end = CGPointMake(float(abs_x), float(abs_y + distance // 2))
    elif direction == "left":
        start = CGPointMake(float(abs_x + distance // 2), float(abs_y))
        end = CGPointMake(float(abs_x - distance // 2), float(abs_y))
    elif direction == "right":
        start = CGPointMake(float(abs_x - distance // 2), float(abs_y))
        end = CGPointMake(float(abs_x + distance // 2), float(abs_y))
    else:
        raise ValueError(f"Invalid direction: {direction}")

    # Drag: mouse down at start, move to end, mouse up
    down_event = CGEventCreateMouseEvent(None, kCGEventLeftMouseDown, start, kCGMouseButtonLeft)
    CGEventPost(kCGHIDEventTap, down_event)
    time.sleep(0.05)

    # Intermediate move steps for smooth drag
    steps = 10
    for i in range(1, steps + 1):
        t = i / steps
        ix = start.x + (end.x - start.x) * t
        iy = start.y + (end.y - start.y) * t
        mid = CGPointMake(ix, iy)
        # Use kCGEventLeftMouseDragged (6)
        drag_event = CGEventCreateMouseEvent(None, kCGEventLeftMouseDown, mid, kCGMouseButtonLeft)
        CGEventSetType(drag_event, 6)  # kCGEventLeftMouseDragged
        CGEventPost(kCGHIDEventTap, drag_event)
        time.sleep(0.02)

    up_event = CGEventCreateMouseEvent(None, kCGEventLeftMouseUp, end, kCGMouseButtonLeft)
    CGEventPost(kCGHIDEventTap, up_event)

    return True


# ==============================================================================
# Screenshot
# ==============================================================================

def take_screenshot(output_path=None):
    """
    Capture the iPhone Mirroring window.
    Uses screencapture -l<windowID> for exact window capture.
    Returns the path to the saved screenshot.
    """
    window = get_iphone_window_info()
    if window is None:
        raise RuntimeError("Cannot find iPhone Mirroring window")

    if output_path is None:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_path = os.path.join(DEFAULT_SCREENSHOT_DIR, f"polymarket_{timestamp}.png")

    # Ensure output directory exists
    os.makedirs(os.path.dirname(output_path) or ".", exist_ok=True)

    window_id = window.get("id")
    if window_id:
        # Best method: capture specific window by ID (no shadow)
        result = subprocess.run(
            ["/usr/sbin/screencapture", "-x", "-o", f"-l{window_id}", output_path],
            capture_output=True,
            text=True,
        )
    else:
        # Fallback: capture region based on window position
        x, y, w, h = window["x"], window["y"], window["width"], window["height"]
        result = subprocess.run(
            ["/usr/sbin/screencapture", "-x", "-R", f"{x},{y},{w},{h}", output_path],
            capture_output=True,
            text=True,
        )

    if result.returncode != 0:
        raise RuntimeError(f"screencapture failed: {result.stderr}")

    if not os.path.exists(output_path):
        raise RuntimeError("Screenshot file was not created")

    return output_path


# ==============================================================================
# High-Level Navigation Commands
# ==============================================================================

def cmd_screenshot(args):
    """Take a screenshot of the phone screen."""
    path = take_screenshot(args.output)
    print(f"Screenshot saved: {path}")
    return path


def cmd_click(args):
    """Click at relative coordinates on the phone screen."""
    click(args.x, args.y)
    print(f"Clicked at phone coords ({args.x}, {args.y})")


def cmd_scroll(args):
    """Scroll up or down."""
    scroll(args.direction, args.amount)
    print(f"Scrolled {args.direction} ({args.amount} steps)")


def cmd_swipe(args):
    """Swipe in a direction."""
    dist = SWIPE_DISTANCES.get(args.distance, None)
    if dist is None:
        try:
            dist = int(args.distance)
        except ValueError:
            dist = SWIPE_DISTANCES["medium"]
    swipe(args.direction, dist)
    print(f"Swiped {args.direction} ({dist}px)")


def cmd_back(args):
    """Tap the back button."""
    click(*UI_ELEMENTS["back_button"])
    print("Tapped back button")


def cmd_home(args):
    """Tap the home tab in bottom navigation."""
    click(*UI_ELEMENTS["home_button"])
    print("Tapped home tab")


def cmd_nba(args):
    """Tap the NBA category tab."""
    click(*UI_ELEMENTS["nba_tab"])
    print("Tapped NBA tab")


def cmd_nhl(args):
    """Tap the NHL category tab."""
    click(*UI_ELEMENTS["nhl_tab"])
    print("Tapped NHL tab")


def cmd_cbb(args):
    """Tap the CBB category tab."""
    click(*UI_ELEMENTS["cbb_tab"])
    print("Tapped CBB tab")


def cmd_ufc(args):
    """Tap the UFC category tab."""
    click(*UI_ELEMENTS["ufc_tab"])
    print("Tapped UFC tab")


def cmd_politics(args):
    """Tap the Politics category tab."""
    click(*UI_ELEMENTS["politics_tab"])
    print("Tapped Politics tab")


def cmd_today(args):
    """Tap the Today category tab."""
    click(*UI_ELEMENTS["today_tab"])
    print("Tapped Today tab")


def cmd_search(args):
    """Tap the search button."""
    click(*UI_ELEMENTS["search_button"])
    print("Tapped search")


def cmd_deposit(args):
    """Tap the deposit button."""
    click(*UI_ELEMENTS["deposit_button"])
    print("Tapped deposit button")


def cmd_bet(args):
    """Tap a bet button for a specific game."""
    game_num = args.game
    side = args.side  # 'left' or 'right'

    key = f"bet_{side}_{game_num}"
    if key not in UI_ELEMENTS:
        # Calculate position for games beyond the pre-mapped ones
        # Each game card is approximately 144px tall
        base_y = 184 + (game_num - 1) * 144
        x = 106 if side == "left" else 219
        coords = (x, base_y)
        print(f"Using calculated bet position for game {game_num}: {coords}")
    else:
        coords = UI_ELEMENTS[key]

    click(*coords)
    print(f"Tapped bet {side} for game {game_num} at ({coords[0]}, {coords[1]})")


def cmd_info(args):
    """Show window info and UI element map."""
    window = get_iphone_window_info()
    if window is None:
        print("ERROR: iPhone Mirroring window not found!")
        print("Make sure iPhone Mirroring.app is open and connected.")
        sys.exit(1)

    print("=" * 60)
    print("  POLYMARKET PHONE MIRROR - WINDOW INFO")
    print("=" * 60)
    print(f"  Window ID:    {window.get('id', 'N/A')}")
    print(f"  Position:     ({window['x']}, {window['y']})")
    print(f"  Size:         {window['width']} x {window['height']}")
    print(f"  Title bar:    {TITLE_BAR_HEIGHT}px")
    print(f"  Phone screen: {window['width']} x {window['height'] - TITLE_BAR_HEIGHT}")
    print()
    print("  UI ELEMENT MAP (phone-relative coords):")
    print("  " + "-" * 56)

    # Group elements
    groups = {
        "Navigation": ["back_button", "polymarket_logo", "deposit_button"],
        "Sport Tabs": ["today_tab", "nba_tab", "nhl_tab", "cbb_tab", "ufc_tab", "politics_tab"],
        "Bottom Bar": ["home_button", "balance_text", "search_button"],
        "Bet Buttons": ["bet_left_1", "bet_right_1", "bet_left_2", "bet_right_2", "bet_left_3", "bet_right_3"],
        "Scroll": ["scroll_center"],
    }

    for group_name, keys in groups.items():
        print(f"\n  {group_name}:")
        for key in keys:
            coords = UI_ELEMENTS[key]
            abs_x, abs_y = phone_to_screen(coords[0], coords[1], window)
            print(f"    {key:22s}  phone({coords[0]:3d}, {coords[1]:3d})  screen({abs_x:4d}, {abs_y:4d})")

    print()
    print("=" * 60)


# ==============================================================================
# CLI Parser
# ==============================================================================

def build_parser():
    parser = argparse.ArgumentParser(
        prog="polymarket-navigator",
        description="Navigate Polymarket via iPhone Mirroring phone mirror.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  %(prog)s screenshot                    # Capture phone screen
  %(prog)s screenshot -o /tmp/pm.png     # Save to specific path
  %(prog)s click 174 400                 # Click at phone coords (174, 400)
  %(prog)s scroll down                   # Scroll down 3 steps
  %(prog)s scroll up --amount 5          # Scroll up 5 steps
  %(prog)s back                          # Go back
  %(prog)s home                          # Tap home tab
  %(prog)s nba                           # Switch to NBA tab
  %(prog)s bet left                      # Bet on left team, game 1
  %(prog)s bet right --game 2            # Bet on right team, game 2
  %(prog)s swipe up --distance long      # Long swipe up
  %(prog)s info                          # Show window info & element map
""",
    )

    sub = parser.add_subparsers(dest="command", required=True)

    # screenshot
    p_ss = sub.add_parser("screenshot", aliases=["ss", "snap"], help="Capture iPhone screen")
    p_ss.add_argument("-o", "--output", default=None, help="Output file path")
    p_ss.set_defaults(func=cmd_screenshot)

    # click
    p_click = sub.add_parser("click", aliases=["tap"], help="Tap at phone-relative coordinates")
    p_click.add_argument("x", type=int, help="X coordinate (phone-relative)")
    p_click.add_argument("y", type=int, help="Y coordinate (phone-relative)")
    p_click.set_defaults(func=cmd_click)

    # scroll
    p_scroll = sub.add_parser("scroll", help="Scroll up or down")
    p_scroll.add_argument("direction", choices=["up", "down"], help="Scroll direction")
    p_scroll.add_argument("-n", "--amount", type=int, default=3, help="Number of scroll steps (default: 3)")
    p_scroll.set_defaults(func=cmd_scroll)

    # swipe
    p_swipe = sub.add_parser("swipe", help="Swipe gesture")
    p_swipe.add_argument("direction", choices=["up", "down", "left", "right"], help="Swipe direction")
    p_swipe.add_argument("-d", "--distance", default="medium", help="Distance: short/medium/long or pixels")
    p_swipe.set_defaults(func=cmd_swipe)

    # back
    p_back = sub.add_parser("back", help="Tap back button")
    p_back.set_defaults(func=cmd_back)

    # home
    p_home = sub.add_parser("home", help="Tap home tab")
    p_home.set_defaults(func=cmd_home)

    # Sport tabs
    for tab_name, tab_func in [("nba", cmd_nba), ("nhl", cmd_nhl), ("cbb", cmd_cbb),
                                 ("ufc", cmd_ufc), ("politics", cmd_politics), ("today", cmd_today)]:
        p_tab = sub.add_parser(tab_name, help=f"Tap {tab_name.upper()} category tab")
        p_tab.set_defaults(func=tab_func)

    # search
    p_search = sub.add_parser("search", help="Tap search button")
    p_search.set_defaults(func=cmd_search)

    # deposit
    p_deposit = sub.add_parser("deposit", help="Tap deposit button")
    p_deposit.set_defaults(func=cmd_deposit)

    # bet
    p_bet = sub.add_parser("bet", help="Tap a bet button")
    p_bet.add_argument("side", choices=["left", "right"], help="Which bet button (left=team A, right=team B)")
    p_bet.add_argument("-g", "--game", type=int, default=1, help="Game number (1=first visible, default: 1)")
    p_bet.set_defaults(func=cmd_bet)

    # info
    p_info = sub.add_parser("info", help="Show window info and UI element map")
    p_info.set_defaults(func=cmd_info)

    return parser


# ==============================================================================
# Main
# ==============================================================================

def main():
    parser = build_parser()
    args = parser.parse_args()

    # Verify iPhone Mirroring is running (except for info which handles its own error)
    if args.command != "info":
        window = get_iphone_window_info()
        if window is None:
            print("ERROR: iPhone Mirroring window not found!", file=sys.stderr)
            print("Make sure iPhone Mirroring.app is open and connected.", file=sys.stderr)
            sys.exit(1)

    try:
        result = args.func(args)
        # If screenshot, print just the path for easy piping
        if args.command in ("screenshot", "ss", "snap") and result:
            pass  # Already printed
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
