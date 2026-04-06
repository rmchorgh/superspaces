import * as p from "@clack/prompts";

export const COMMANDS = [
	{ cmd: "superspaces config open", desc: "Open the installed config file" },
	{
		cmd: "superspaces config template",
		desc: "Creates a config file with the correct schema and opens it in the $EDITOR application",
	},
	{ cmd: "superspaces config install", desc: "Installs the config" },
];

export function showConfigHelp() {
	p.intro("superspaces config — Manage configuration");

	const usage = COMMANDS.map(
		({ cmd, desc }) => `  ${cmd}\n    ${desc}`,
	).join("\n\n");

	p.note(usage, "Usage");

	p.outro();
}
