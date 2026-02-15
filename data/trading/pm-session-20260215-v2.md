# Polymarket Session Report - 2026-02-15 08:42-09:15 PST

## Status: ❌ BLOCKED - Cannot confirm bets (Swipe to Buy gesture fails)

### Problem
iPhone Mirroring does NOT properly translate mouse drag events to iOS touch swipe gestures.
The Polymarket app requires "Swipe to buy" (upward swipe gesture on confirmation bar) to place bets.

**All of these approaches FAILED:**
1. `cliclick dd/dm/du` drag gestures
2. `CGEventCreateMouseEvent` with `kCGEventLeftMouseDragged`
3. Quartz `CGEventCreateScrollWheelEvent` (just scrolls the page)
4. AppleScript `click at` (only works for taps)
5. Swift `CGEvent` with mouseEventSubtype = 1 (gesture)
6. Long press + drag
7. Fast flick gestures
8. Starting drag from home indicator area
9. HID system state source events

**What DOES work:**
- Tapping buttons (click = tap) ✅
- Typing numbers on keypad ✅
- Navigating between screens ✅
- Closing overlays (X button) ✅
- Reading prices and game info ✅

### Live Game Data (as of 09:14 PST)
| Game | Score | Time | Away Odds | Home Odds |
|------|-------|------|-----------|-----------|
| UTSA @ Charlotte | 4-12 | H1 15:22 | 5¢ | 96¢ |
| Utah @ Cincinnati | 3-6 | H1 16:10 | 10¢ | 91¢ |
| Maryland @ Rutgers | 9-7 | H1 13:51 | 48¢ | 55¢ |

### Model Analysis (pre-game)
- **Utah @ 13¢**: Log5 model gave 32.1% prob, edge +19.1% → Bet $3 recommended
- **Maryland @ 45¢**: Log5 model gave 50.8% prob, edge +5.8% → Bet $2 recommended

### What's Needed to Fix
1. **Polymarket setting**: Check if there's a "Tap to Buy" option instead of "Swipe to Buy"
2. **iOS Shortcuts**: Create a shortcut that can place bets via Polymarket API
3. **Polymarket API**: Use direct API calls from the Mac (bypasses phone entirely)
4. **Physical interaction**: Someone physically does the swipe on the phone
5. **Different app**: Use Polymarket through Safari on the phone (might use tap-to-confirm)
6. **USB debugging**: Use iOS WebDriver or similar tool to send proper touch events

### Technical Details
- Window ID: 1972
- Window position: (355, 30) size 348x766
- Screenshot scale: 920x1756 (2.64x Retina)
- Keypad mapping (screen coords):
  - "+$10/+$25/Max" row: y≈489
  - "1,2,3" row: y≈532
  - "4,5,6" row: y≈577
  - "7,8,9" row: y≈621
  - ".,0,⌫" row: y≈665
  - Columns: left=444, center=529, right=616
- Swipe bar: y≈690-720 (red bar with "Swipe to buy" text)

### Wallet
- Balance: $58.83 (unchanged - no bets placed)
- No bets placed this session
