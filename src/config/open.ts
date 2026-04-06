/**
 * Opens the installed config file in $EDITOR
 */

import * as p from "@clack/prompts";
import { CONFIG_PATH } from "~/config/constants";

export async function open() {
  const file = Bun.file(CONFIG_PATH);
  if (!(await file.exists())) {
    p.log.error(
      `No config found at ${CONFIG_PATH}. Run \`superspaces config install\` first.`,
    );
    process.exit(1);
  }

  const editor = Bun.env.EDITOR ?? "vi";
  const proc = Bun.spawn([editor, CONFIG_PATH], {
    stdin: "inherit",
    stdout: "inherit",
    stderr: "inherit",
  });
  await proc.exited;
}
