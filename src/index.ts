import * as p from "@clack/prompts";
import { showHelp } from "~/help";
import { showConfigHelp } from "~/config/help";
import { open } from "~/config/open";
import { template } from "~/config/template";
import { install } from "~/config/install";

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
  default:
    showHelp();
}
