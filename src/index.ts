import * as p from "@clack/prompts";
import { showHelp } from "~/help";
import { showConfigHelp } from "~/config/help";
import { open } from "~/config/open";
import { template } from "~/config/template";
import { install } from "~/config/install";
import { showWorktreeHelp } from "~/worktree/help";
import { openWorkspace } from "~/worktree/open";

const [command, subcommand, ...args] = process.argv.slice(2);

switch (command) {
  case "config":
    switch (subcommand) {
      case "open":
        await open();
        break;
      case "template":
        await template(args[0]);
        break;
      case "install": {
        const source = args[0];
        if (!source) {
          p.log.error("Usage: superspaces config install <path-to-config.json>");
          process.exit(1);
        }
        await install(source);
        break;
      }
      default:
        showConfigHelp();
    }
    break;
  case "worktree":
    switch (subcommand) {
      case "open": {
        const branch = args[0];
        if (!branch) {
          p.log.error("Usage: superspaces worktree open <branch>");
          process.exit(1);
        }
        await openWorkspace(branch);
        break;
      }
      default:
        showWorktreeHelp();
    }
    break;
  default:
    showHelp();
}
