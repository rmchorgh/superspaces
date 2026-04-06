import { z } from "zod";
import type { SuperspacesPlugin } from "~/worktree/plugins/types";

export const zConfig = z.object({
  token: z
    .string()
    .describe("Shortcut personal access token with read permissions."),
  workspaceSlug: z
    .string()
    .describe("Shortcut workspace slug (used in ticket URLs)"),
});

const zStoryResponse = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable().default(""),
});

type Variables = {
  story_title: string;
  story_description: string;
  story_id: string;
};

const zStoryInput = z.string().transform((input) => {
  const match = input.match(/sc[_-]?(\d{6})/i) ?? input.match(/^(\d{6})$/);
  if (match == null || match[1] == null)
    throw new Error(`Could not extract a Shortcut story ID from: ${input}`);
  return match[1];
});

export const shortcutPlugin: SuperspacesPlugin<"shortcut", Variables> = {
  name: "shortcut",
  validSchema({ plugins }) {
    zConfig.parse(plugins.shortcut);
  },
  async getBranchVariables(raw_input, config) {
    const id = zStoryInput.parse(raw_input);
    const { token } = config.plugins.shortcut;

    const res = await fetch(
      `https://api.app.shortcut.com/api/v3/stories/${id}`,
      {
        headers: {
          "Shortcut-Token": token,
          "Content-Type": "application/json",
        },
      },
    );

    if (!res.ok) {
      throw new Error(
        `Shortcut API error (${res.status}): ${await res.text()}`,
      );
    }

    const { name, description } = zStoryResponse.parse(await res.json());

    return {
      shortcut: {
        story_id: id,
        story_title: name,
        story_description: description ?? "",
      },
    };
  },
};
