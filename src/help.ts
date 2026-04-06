import * as p from "@clack/prompts";
import { COMMANDS as CONFIG_COMMANDS } from "./config/help";
import { COMMANDS as WORKTREE_COMMANDS } from "./worktree/help";

const COMMANDS = [
	{ cmd: "superspaces config", desc: "Help for config subcommands" },
	...CONFIG_COMMANDS,
	{ cmd: "superspaces worktree", desc: "Help for the worktree subcommands" },
	...WORKTREE_COMMANDS,
	{
		cmd: "superspaces search <query>",
		desc: "Search worktrees with open windows",
	},
];

export function showHelp() {
	p.intro("superspaces — Spawn and search windows for worktrees");

	const usage = COMMANDS.map(
		({ cmd, desc }) => `  ${cmd}\n    ${desc}`,
	).join("\n\n");

	p.note(usage, "Usage");

	p.outro("Run any command with no arguments for more help.");
}
