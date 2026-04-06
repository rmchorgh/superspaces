import * as p from "@clack/prompts";
import { loadConfig } from "~/config/install";

type Worktree = {
	branch: string;
	path: string;
};

async function listWorktrees(repoPath: string): Promise<Worktree[]> {
	const output = await Bun.$`git -C ${repoPath} worktree list --porcelain`
		.quiet()
		.text();

	const worktrees: Worktree[] = [];
	let current: Partial<Worktree> = {};

	for (const line of output.split("\n")) {
		if (line.startsWith("worktree ")) {
			current.path = line.slice("worktree ".length);
		} else if (line.startsWith("branch ")) {
			const ref = line.slice("branch ".length);
			current.branch = ref.replace("refs/heads/", "");
		} else if (line === "") {
			if (current.path && current.branch) {
				worktrees.push(current as Worktree);
			}
			current = {};
		}
	}

	return worktrees;
}

async function getOpenApps(): Promise<Set<string>> {
	const output = await Bun.$`osascript -e '
		tell application "System Events"
			set appNames to name of every application process whose visible is true
			set output to ""
			repeat with appName in appNames
				set output to output & appName & linefeed
			end repeat
			return output
		end tell
	'`
		.quiet()
		.text();

	return new Set(
		output
			.trim()
			.split("\n")
			.map((s) => s.trim())
			.filter(Boolean),
	);
}

function matchesQuery(branch: string, query: string): boolean {
	const lower = branch.toLowerCase();
	const q = query.toLowerCase();
	if (lower.includes(q)) return true;

	// Simple fuzzy: all query chars appear in order
	let qi = 0;
	for (let i = 0; i < lower.length && qi < q.length; i++) {
		if (lower[i] === q[qi]) qi++;
	}
	return qi === q.length;
}

async function focusApp(app: string): Promise<void> {
	await Bun.$`osascript -e 'tell application "${app}" to activate'`.quiet();
}

export async function search(query: string): Promise<void> {
	const config = await loadConfig();
	if (!config) {
		p.log.error(
			"No configuration found. Run `superspaces config install` first.",
		);
		process.exit(1);
	}

	const configuredApps = new Set(
		config.windowSets.flatMap((ws) => ws.windows.map((w) => w.app)),
	);

	const [worktrees, openApps] = await Promise.all([
		listWorktrees(config.defaultRepositoryPath),
		getOpenApps(),
	]);

	const matchingApps = [...configuredApps].filter((app) => openApps.has(app));

	const matches = worktrees.filter((wt) => matchesQuery(wt.branch, query));

	if (matches.length === 0) {
		p.log.warn(`No worktrees matching "${query}"`);
		return;
	}

	const options = matches.map((wt) => ({
		value: wt,
		label: wt.branch,
		hint: `${wt.path}${matchingApps.length > 0 ? ` — apps: ${matchingApps.join(", ")}` : ""}`,
	}));

	if (options.length === 1 && options[0]) {
		const wt = options[0].value;
		p.log.info(`Found: ${wt.branch} (${wt.path})`);
		for (const app of matchingApps) {
			await focusApp(app);
		}
		return;
	}

	const selected = await p.select({
		message: `Worktrees matching "${query}"`,
		options,
	});

	if (p.isCancel(selected)) return;

	for (const app of matchingApps) {
		await focusApp(app);
	}
}
