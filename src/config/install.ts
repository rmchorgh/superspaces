/**
 * Installs the config
 */

import * as p from "@clack/prompts";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { zConfig, type Config } from "~/config/schema";
import { CONFIG_PATH } from "~/config/constants";

export async function install(source_path: string) {
  const file = Bun.file(source_path);
  if (!(await file.exists())) {
    p.log.error(`File not found: ${source_path}`);
    process.exit(1);
  }

  const raw = await file.json();
  const result = zConfig.safeParse(raw);

  if (!result.success) {
    p.log.error("Invalid config:");
    for (const issue of result.error.issues) {
      p.log.error(`  ${issue.path.join(".")}: ${issue.message}`);
    }
    process.exit(1);
  }

  mkdirSync(dirname(CONFIG_PATH), { recursive: true });
  await Bun.write(
    CONFIG_PATH,
    `${JSON.stringify({ ...result.data, $schema: "https://superspaces.richardmch.org/schema.json" }, null, 2)}\n`,
  );

  p.log.success(`Config installed to ${CONFIG_PATH}`);
}

export async function loadConfig(): Promise<Config | null> {
  const file = Bun.file(CONFIG_PATH);
  if (!(await file.exists())) return null;
  const raw = await file.json();
  return zConfig.parse(raw);
}

export async function saveConfig(config: Config): Promise<void> {
  const withSchema = {
    ...config,
    $schema: `https://superspaces.richardmch.org/schema.json`,
  };
  await Bun.write(CONFIG_PATH, `${JSON.stringify(withSchema, null, 2)}\n`);
}
