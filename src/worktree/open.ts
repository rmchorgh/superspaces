import { dirname, join } from "node:path";
import * as p from "@clack/prompts";
import { loadConfig } from "~/config/install";
import type { Config } from "~/config/schema";
import { plugins } from "~/worktree/plugins/registry";

const POSITION_APPLESCRIPT_PATH = join(
	dirname(import.meta.dir),
	"src",
	"scripts",
	"position-window.applescript",
);

const CREATE_SPACE_APPLESCRIPT_PATH = join(
	dirname(import.meta.dir),
	"src",
	"scripts",
	"create-space.applescript",
);

const APPLICATION_SCRIPTS_DIR = join(
	dirname(import.meta.dir),
	"src",
	"scripts",
	"applications",
);

function getValidPlugins(config: Config): string[] {
	const valid: string[] = [];
	for (const [name, plugin] of Object.entries(plugins)) {
		if (!(name in (config.plugins ?? {}))) continue;
		try {
			plugin.validSchema(config);
			valid.push(name);
		} catch {
			p.log.warn(`Plugin "${name}" has invalid config, skipping.`);
		}
	}
	return valid;
}

type PluginVariables = Record<string, Record<string, string>>;

async function collectPluginVariables(
	input: string,
	config: Config,
	validPluginNames: string[],
): Promise<PluginVariables> {
	let vars: PluginVariables = {};
	for (const name of validPluginNames) {
		const plugin = plugins[name];
		if (!plugin) continue;
		const result = await plugin.getBranchVariables(
			input,
			config as Parameters<typeof plugin.getBranchVariables>[1],
		);
		vars = { ...vars, ...result };
	}
	return vars;
}

function formatBranchName(
	format: string,
	pluginVars: PluginVariables,
): string {
	return format.replace(/\{(\w+)\.(\w+)\}/g, (match, ns, key) => {
		const nsVars = pluginVars[ns as string];
		if (!nsVars) return match;
		return nsVars[key as string] ?? match;
	});
}

async function getScreenAspectRatio(): Promise<number> {
	const output = await Bun.$`osascript -e '
		tell application "Finder"
			set _bounds to bounds of window of desktop
			set screenWidth to item 3 of _bounds
			set screenHeight to item 4 of _bounds
		end tell
		return (screenWidth as text) & ":" & (screenHeight as text)
	'`
		.quiet()
		.text();

	const [width, height] = output.trim().split(":").map(Number);
	if (!width || !height) return 0;
	return width / height;
}

function findWindowSet(config: Config, screenRatio: number) {
	const sets = config.windowSets;
	let bestMatch = sets[0] ?? null;
	let bestDiff = Number.POSITIVE_INFINITY;

	for (const ws of sets) {
		const diff = Math.abs(ws.aspectRatio - screenRatio);
		if (diff < bestDiff) {
			bestDiff = diff;
			bestMatch = ws;
		}
	}

	return bestMatch;
}

function resolveApplicationScripts(command: string): string {
	return command.replace(/applicationScripts\.(\w+)/g, (_, name) =>
		join(APPLICATION_SCRIPTS_DIR, `${name}.sh`),
	);
}

function shellEscape(s: string): string {
	return s.replace(/'/g, "'\\''");
}

function substituteVars(
	command: string,
	vars: Record<string, string>,
): string {
	const replaced = command.replace(/\{(\w+(?:\.\w+)*)\}/g, (match, key) => {
		return vars[key as string] !== undefined
			? shellEscape(vars[key as string] as string)
			: match;
	});
	return resolveApplicationScripts(replaced);
}

async function createWorktree(
	branchName: string,
	repoPath: string,
): Promise<{ path: string; created: boolean }> {
	const worktreePath = join(repoPath, ".worktrees", branchName);
	const worktreeFile = Bun.file(join(worktreePath, ".git"));

	if (await worktreeFile.exists()) {
		return { path: worktreePath, created: false };
	}

	await Bun.$`git -C ${repoPath} worktree add ${worktreePath} -b ${branchName}`.quiet();
	return { path: worktreePath, created: true };
}

async function positionWindow(
	app: string,
	position: { startX: number; startY: number; width: number; height: number } | { maximized: boolean },
): Promise<void> {
	if ("maximized" in position) {
		if (position.maximized) {
			await Bun.$`osascript ${POSITION_APPLESCRIPT_PATH} ${app} maximized`.quiet();
		}
		return;
	}

	const { startX, startY, width, height } = position;
	await Bun.$`osascript ${POSITION_APPLESCRIPT_PATH} ${app} ${String(startX)} ${String(startY)} ${String(width)} ${String(height)}`.quiet();
}

export async function openWorkspace(input: string): Promise<void> {
	const config = await loadConfig();
	if (!config) {
		p.log.error(
			"No configuration found. Run `superspaces config install` first.",
		);
		process.exit(1);
	}

	p.intro("superspaces");

	const validPluginNames = getValidPlugins(config);
	const pluginVars = await collectPluginVariables(
		input,
		config,
		validPluginNames,
	);

	const branchName = formatBranchName(config.branchFormat, pluginVars);
	p.log.info(`Branch: ${branchName}`);

	const worktree = await createWorktree(
		branchName,
		config.defaultRepositoryPath,
	);
	p.log.info(
		worktree.created
			? `Worktree created at ${worktree.path}`
			: `Worktree already exists at ${worktree.path}`,
	);

	const screenRatio = await getScreenAspectRatio();
	const windowSet = findWindowSet(config, screenRatio);

	if (!windowSet) {
		p.log.error("No matching window set found for this display.");
		process.exit(1);
	}

	// Flatten plugin vars for start command substitution
	const flatVars: Record<string, string> = {
		project_root_path: worktree.path,
		branch_name: branchName,
	};
	for (const [ns, nsVars] of Object.entries(pluginVars)) {
		for (const [key, val] of Object.entries(nsVars)) {
			flatVars[`${ns}.${key}`] = val;
		}
	}

	const s = p.spinner();
	s.start(
		worktree.created ? "Opening workspace..." : "Reopening workspace...",
	);

	await Bun.$`osascript ${CREATE_SPACE_APPLESCRIPT_PATH}`.quiet();

	for (const window of windowSet.windows) {
		const command = substituteVars(window.startCommand, flatVars);
		await Bun.$`sh -c ${command}`.quiet();
		await Bun.sleep(500);
		await positionWindow(window.app, window.position);
		await Bun.sleep(500);
	}

	s.stop("Workspace opened!");
	p.outro("Done");
}
