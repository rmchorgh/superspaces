# superspaces

Spawn and manage macOS workspaces for git worktrees. Define window layouts in a config file, and superspaces will create a worktree, open a new macOS Space, launch your apps, and position every window automatically.

## Install

```bash
bun install
bun link
```

## Commands

```
superspaces config template       Create a config file with the correct schema and open it in $EDITOR
superspaces config install <path> Validate and install a config file
superspaces config open           Open the installed config file in $EDITOR

superspaces worktree open <input> Open a workspace for a branch (creates worktree, Space, and windows)
superspaces worktree close <branch> Remove a worktree and close its windows

superspaces search <query>        Search worktrees with open windows
```

## Config

Configs live at `~/.config/superspaces/config.json`. Use `superspaces config template` to generate a starter file.

A config defines:

- **branchFormat** — branch naming pattern with plugin variables (e.g. `{shortcut.story_id}-{shortcut.story_title}`)
- **defaultRepositoryPath** — absolute path to the git repo where worktrees are created
- **windowSets** — window layouts keyed by monitor aspect ratio, each containing a list of apps with start commands and fractional screen positions
- **plugins** — optional integrations (e.g. Shortcut) that provide variables for branch names and start commands

### Variables

Start commands and branch formats support variable substitution with `{variable}` syntax:

| Variable | Available in |
|---|---|
| `project_root_path` | start commands |
| `branch_name` | start commands |
| `shortcut.story_id` | branch format, start commands |
| `shortcut.story_title` | branch format, start commands |
| `shortcut.story_description` | start commands |

## Plugins

Plugins are validated at workspace open time. If a plugin's config is present and valid, its `getBranchVariables` function is called to resolve variables for branch naming and command substitution.

### Shortcut

Resolves a Shortcut story ID (e.g. `sc-123456`, `123456`) into branch variables. Requires a `token` and `workspaceSlug` in the config:

```json
{
  "plugins": {
    "shortcut": {
      "token": "your-shortcut-api-token",
      "workspaceSlug": "your-workspace"
    }
  }
}
```

## Requirements

- macOS (uses AppleScript for window management and Space creation)
- [Bun](https://bun.sh)
- Accessibility permissions in System Settings > Privacy & Security > Accessibility
