import type { Config } from "~/config/schema";

type ConfigWithPlugin<N extends string> = Config & {
  plugins: Required<Pick<Config["plugins"], N & keyof Config["plugins"]>>;
};

export type SuperspacesPlugin<
  N extends string,
  V extends Record<string, string> = Record<string, string>,
> = {
  /**
   * The name of the plugin as referenced in the Config
   */
  name: N;
  /**
   * Run on install
   * @param config Loaded JSON Config
   * @throws if the Config is invalid for the plugin
   */
  validSchema(config: Config): void;
  /**
   * Run
   * @param terminal_input
   */
  getBranchVariables(
    terminal_input: string,
    config: ConfigWithPlugin<N>,
  ): Promise<{ [K in N]: V }>;
};
