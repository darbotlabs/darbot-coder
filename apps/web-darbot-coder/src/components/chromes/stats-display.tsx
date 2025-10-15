import Link from "next/link"
import { RxGithubLogo } from "react-icons/rx"
import { VscVscode } from "react-icons/vsc"

import { getGitHubStars, getVSCodeDownloads } from "@/lib/stats"
import type { StatDisplayValue } from "@/lib/stats"

export default async function StatsDisplay() {
	const stars = await getGitHubStars()
	const downloads = await getVSCodeDownloads()

	return (
		<>
			<Link
				href="https://github.com/DarbotFramework/darbot-coder"
				target="_blank"
				className="hidden md:flex items-center gap-1.5 text-sm font-medium text-gray-400 hover:text-gray-200"
				title={buildTitle(stars, "View darbot-coder on GitHub")}
				data-source={stars.source}>
				<RxGithubLogo className="h-4 w-4" />
				<StatLabel stat={stars} srFallback="Live GitHub star data is temporarily unavailable." />
			</Link>
			<Link
				href="https://marketplace.visualstudio.com/items?itemName=DarbotLabs.darbot-coder"
				target="_blank"
				className="hidden md:flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
				title={buildTitle(downloads, "View extension on VS Code Marketplace")}
				data-source={downloads.source}>
				<VscVscode className="h-4 w-4" />
				<span>
					Install <span className="font-black">&middot;</span>
				</span>
				<StatLabel stat={downloads} srFallback="Live install statistics are temporarily unavailable." />
			</Link>
		</>
	)
}

function buildTitle(stat: StatDisplayValue, fallback: string): string {
	if (stat.message) {
		return stat.message
	}
	if (stat.source === "cached") {
		return `${fallback}. Showing cached data while we refresh stats.`
	}
	if (stat.source === "fallback") {
		return `${fallback}. Live data is unavailable.`
	}
	return fallback
}

function StatLabel({ stat, srFallback }: { stat: StatDisplayValue; srFallback: string }) {
	return (
		<span aria-live="polite">
			{stat.label}
			{stat.source !== "live" && <span className="sr-only">{stat.message ?? srFallback}</span>}
		</span>
	)
}
