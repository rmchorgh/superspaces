import { z } from "zod";
import { zConfig as zShortcutConfig } from "~/worktree/plugins/shortcut";

const zFraction = z.number().min(0).max(1);
const zAspectRatio = z.number().min(0).describe("Aspect ratio of the monitor");
/**
 * @plugin shortcut
 * @variables shortcut.story.id, shortcut.story.title
 */
const zBranch = z
  .string()
  .describe("Branch naming format. Can contain variables.");

/**
 * @variables project_root_path, branch_name
 *
 * @plugin shortcut
 * @variables shortcut.story.id, shortcut.story.title, shortcut.story.description
 */
const zStartCommand = z
  .string()
  .describe(
    "Terminal command for starting the application. Can contain variables.",
  );

const zWindowPosition = z.union([
  z.object({
    startX: zFraction,
    startY: zFraction,
    width: zFraction,
    height: zFraction,
  }),
  z.object({ maximized: z.boolean() }),
]);

const zWindow = z.object({
  app: z
    .string()
    .describe("macOS app name (as it appears in Activity Monitor)"),
  startCommand: zStartCommand,
  position: zWindowPosition,
});

const zWindowSet = z.object({
  aspectRatio: zAspectRatio,
  windows: zWindow.array(),
});

export const zConfig = z.object({
  $schema: z
    .string()
    .optional()
    .default(`${Bun.env.HOME}/.config/superspaces/`)
    .describe("Path to the JSON schema file"),
  branchFormat: zBranch,
  defaultRepositoryPath: z
    .string()
    .describe("Absolute path to the default git repository"),
  windowSets: zWindowSet
    .array()
    .describe(
      "Window layouts keyed by aspect ratio. The matching set is chosen at runtime.",
    ),
  plugins: z
    .object({
      shortcut: zShortcutConfig,
    })
    .partial(),
});

export type Config = z.infer<typeof zConfig>;
