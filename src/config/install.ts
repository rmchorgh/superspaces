/**
 * Installs the config
 */

import { zConfig, type Config } from "~/config/schema";

const CONFIG_PATH = `${Bun.env.HOME}/.config/superspaces/config.json`;

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
