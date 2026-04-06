const HELP = `
superspaces — Spawn and search windows for worktrees

Usage:
  superspaces config --- Help for config subcommands
  superspaces config open --- Open the installed config file
  superspaces config template --- Creates a config file with the correct schema and opens it in the $EDITOR application
  superspaces config install --- Installs the config
  superspaces worktree --- Help for the worktree subcommands
  superspaces worktree open <branch_name or plugin_input> --- Open a workspace for a ticket
  superspaces worktree close <branch_name or plugin_input> --- Remove a workspace's worktree and close the windows opened for it
  superspaces search <query> --- Search worktrees with open windows
  superspaces --- Show this help message
`.trim();
