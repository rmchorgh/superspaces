import type { SuperspacesPlugin } from "~/worktree/plugins/types";
import { shortcutPlugin } from "~/worktree/plugins/shortcut";

export const plugins: Record<string, SuperspacesPlugin<string>> = {
	shortcut: shortcutPlugin,
};
