import * as p from "@clack/prompts";
import { showConfigHelp } from "./config/help";
import { showWorktreeHelp } from "./worktree/help";

const COMMANDS = [
  { cmd: "superspaces config", desc: "Help for config subcommands" },
  { cmd: "superspaces worktree", desc: "Help for the worktree subcommands" },
  {
    cmd: "superspaces search <query>",
    desc: "Search worktrees with open windows",
  },
];

export function showHelp() {
  p.intro("superspaces");

  const usage = COMMANDS.map(({ cmd, desc }) => `  ${cmd}\n    ${desc}`).join(
    "\n\n",
  );

  p.note(usage, "Usage");
  p.outro("Spawn and search windows for worktrees");

  showConfigHelp();
  showWorktreeHelp();
}
