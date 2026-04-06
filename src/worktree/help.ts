import * as p from "@clack/prompts";

const COMMANDS = [
  {
    cmd: "superspaces worktree open <branch>",
    desc: "Open a workspace for a ticket",
  },
  {
    cmd: "superspaces worktree close <branch>",
    desc: "Remove a workspace's worktree and close its windows",
  },
];

export function showWorktreeHelp() {
  p.intro("superspaces worktree");

  const usage = COMMANDS.map(({ cmd, desc }) => `  ${cmd}\n    ${desc}`).join(
    "\n\n",
  );

  p.note(usage, "Usage");
  p.outro("Manage worktree workspaces");
}
