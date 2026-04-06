/**
 * Creates a config file with the correct schema and opens it in the $EDITOR application
 */

import * as p from "@clack/prompts";
import { resolve } from "node:path";

export async function template(raw_export_path?: string) {
  const export_path = resolveExportPath(raw_export_path ?? "superspaces.json");

  if (await Bun.file(export_path).exists()) {
    p.log.warn(`File already exists at ${export_path}`);
    const overwrite = await p.confirm({ message: "Overwrite?" });
    if (p.isCancel(overwrite) || !overwrite) {
      p.log.info("Aborted.");
      return;
    }
  }

  await Bun.write(
    export_path,
    `{
  "$schema": "https://superspaces.richardmch.org/schema.json",
  // Fill out your config here
}
`,
  );

  p.log.success(`Config template created at ${export_path}`);

  const editor = Bun.env.EDITOR ?? "vi";
  const proc = Bun.spawn([editor, export_path], {
    stdin: "inherit",
    stdout: "inherit",
    stderr: "inherit",
  });
  await proc.exited;
}

function resolveExportPath(raw: string): string {
  const resolved = resolve(raw);
  if (resolved.endsWith(".json")) return resolved;
  return resolve(resolved, "superspaces.json");
}
