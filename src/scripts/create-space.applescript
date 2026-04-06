-- create-space.applescript
-- Creates a new macOS Space and switches to it.

on run
	-- Open Mission Control
	tell application "System Events"
		key code 160 -- Mission Control
	end tell
	delay 2

	-- Record space names before adding
	set namesBefore to {}
	tell application "System Events"
		tell process "Dock"
			set spacesBar to group "Spaces Bar" of group 1 of group "Mission Control"
			repeat with b in buttons of list 1 of spacesBar
				try
					set end of namesBefore to name of b
				end try
			end repeat
		end tell
	end tell

	-- Click the "+" button
	tell application "System Events"
		tell process "Dock"
			set spacesBar to group "Spaces Bar" of group 1 of group "Mission Control"
			click button 1 of spacesBar
		end tell
	end tell
	delay 2

	-- Find and click the new space
	tell application "System Events"
		tell process "Dock"
			set spacesBar to group "Spaces Bar" of group 1 of group "Mission Control"
			set btns to buttons of list 1 of spacesBar
			repeat with i from 1 to count of btns
				set bName to name of item i of btns
				if bName is not in namesBefore then
					click item i of btns
					exit repeat
				end if
			end repeat
		end tell
	end tell
	delay 1
end run
