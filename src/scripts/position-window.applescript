-- position-window.applescript
-- Usage:
--   osascript position-window.applescript <appName> maximized
--   osascript position-window.applescript <appName> <startX> <startY> <width> <height>
-- startX/startY/width/height are fractions (0–1) of the usable screen area.

on run argv
	set appName to item 1 of argv
	set mode to item 2 of argv

	-- Get the visible frame (excludes menu bar, Dock, and Stage Manager)
	set frameInfo to do shell script "swift -e '
import AppKit
let f = NSScreen.main!.visibleFrame
let s = NSScreen.main!.frame
let x = Int(f.origin.x)
let y = Int(s.size.height - f.origin.y - f.size.height)
let w = Int(f.size.width)
let h = Int(f.size.height)
print(\"\\(x) \\(y) \\(w) \\(h)\")
'"
	set {usableX, usableY, usableWidth, usableHeight} to words of frameInfo
	set usableX to usableX as integer
	set usableY to usableY as integer
	set usableWidth to usableWidth as integer
	set usableHeight to usableHeight as integer

	tell application "System Events"
		tell process appName
			set frontmost to true
			delay 0.3

			if mode is "maximized" then
				-- Enter native macOS full screen (green button / zoom)
				set value of attribute "AXFullScreen" of window 1 to true
			else
				set startX to (mode as real)
				set startY to (item 3 of argv as real)
				set winWidth to (item 4 of argv as real)
				set winHeight to (item 5 of argv as real)

				set pixelX to usableX + ((startX * usableWidth) as integer)
				set pixelY to usableY + ((startY * usableHeight) as integer)
				set pixelW to (winWidth * usableWidth) as integer
				set pixelH to (winHeight * usableHeight) as integer

				set position of window 1 to {pixelX, pixelY}
				set size of window 1 to {pixelW, pixelH}
			end if
		end tell
	end tell
end run
