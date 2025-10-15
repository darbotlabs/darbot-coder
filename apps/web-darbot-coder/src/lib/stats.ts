import { z } from "zod"

export type StatSource = "live" | "cached" | "fallback"

export interface StatDisplayValue {
	label: string
	source: StatSource
	message?: string
}

export interface MarketplaceReview {
	id: string
	name: string
	rating: number | null
	content: string
	date: string | null
}

interface MarketplaceSnapshot {
	installs: number | null
	averageRating: number | null
	ratingCount: number | null
	reviews: MarketplaceReview[]
	fetchedAt: number
}

interface MarketplaceSnapshotResult {
	snapshot: MarketplaceSnapshot | null
	source: StatSource
	reason?: string
}

const IS_DEVELOPMENT = process.env.NODE_ENV === "development"

const FALLBACK_STAT_LABEL = "Unavailable"

// Development mock data
const DEV_MOCK_GITHUB_STARS = 1247
const DEV_MOCK_VS_CODE_DOWNLOADS = 12534

const FALLBACK_STAT: StatDisplayValue = {
	label: FALLBACK_STAT_LABEL,
	source: "fallback",
	message: "Live data is temporarily unavailable.",
}

const GITHUB_REPO_SLUG = "DarbotLabs/darbot-coder"
const GITHUB_API_URL = `https://api.github.com/repos/${GITHUB_REPO_SLUG}`
const GITHUB_CACHE_TTL_MS = 15 * 60 * 1000
const GITHUB_BASE_BACKOFF_MS = 60_000
const GITHUB_MAX_BACKOFF_MS = 60 * 60 * 1000
const GITHUB_FETCH_REVALIDATE_SECONDS = 60 * 60
const GITHUB_API_TOKEN = (process.env.GITHUB_API_TOKEN || process.env.NEXT_PUBLIC_GITHUB_TOKEN || "").trim()

const MARKETPLACE_URL = "https://marketplace.visualstudio.com/_apis/public/gallery/extensionquery"
const MARKETPLACE_CACHE_TTL_MS = 10 * 60 * 1000
const MARKETPLACE_REQUEST_BODY = {
	filters: [
		{
			criteria: [
				{
					filterType: 7,
					value: "DarbotLabs.darbot-coder",
				},
			],
		},
	],
	flags: 0x1 | 0x2 | 0x4 | 0x8 | 0x10 | 0x80 | 0x100 | 0x200, // 0x39F (927) - includes extension metadata, statistics, files, and version properties
}

const GithubRepositorySchema = z.object({
	stargazers_count: z.number().nonnegative().optional(),
})

const MarketplaceStatisticSchema = z.object({
	statisticName: z.string(),
	value: z.number().nullable().optional(),
})

const MarketplaceReviewerSchema = z
	.object({
		displayName: z.string().optional().nullable(),
	})
	.optional()
	.nullable()

const MarketplaceReviewSchema = z.object({
	reviewer: MarketplaceReviewerSchema,
	rating: z.number().optional().nullable(),
	text: z.string().optional().nullable(),
	date: z.string().optional().nullable(),
	// identifier fields are optional; we derive an id later if missing
	reviewId: z.string().optional().nullable(),
	updateDate: z.string().optional().nullable(),
})

const MarketplaceExtensionSchema = z.object({
	statistics: z.array(MarketplaceStatisticSchema).optional().nullable(),
	reviews: z.array(MarketplaceReviewSchema).optional().nullable(),
})

const MarketplaceResponseSchema = z.object({
	results: z
		.array(
			z.object({
				extensions: z.array(MarketplaceExtensionSchema).optional().nullable(),
			}),
		)
		.optional()
		.nullable(),
})

type GitHubResponse = z.infer<typeof GithubRepositorySchema>
type MarketplaceResponse = z.infer<typeof MarketplaceResponseSchema>
type MarketplaceStatistic = z.infer<typeof MarketplaceStatisticSchema>
type MarketplaceReviewPayload = z.infer<typeof MarketplaceReviewSchema>

interface GitHubCache {
	lastSuccessful: {
		count: number
		label: string
		fetchedAt: number
	} | null
	cooldownUntil: number
	backoffMs: number
	ongoing?: Promise<StatDisplayValue>
}

const gitHubCache: GitHubCache = {
	lastSuccessful: null,
	cooldownUntil: 0,
	backoffMs: GITHUB_BASE_BACKOFF_MS,
}

const marketplaceState: {
	lastSuccessful: MarketplaceSnapshot | null
	ongoing: Promise<MarketplaceSnapshot | null> | null
} = {
	lastSuccessful: null,
	ongoing: null,
}

export async function getGitHubStars(): Promise<StatDisplayValue> {
	// In development, use mock data to avoid API rate limits
	if (IS_DEVELOPMENT && !GITHUB_API_TOKEN) {
		return {
			label: formatCount(DEV_MOCK_GITHUB_STARS),
			source: "fallback",
			message: "Development mode: Using mock data. Set GITHUB_API_TOKEN for live stats.",
		}
	}

	const now = Date.now()
	if (now < gitHubCache.cooldownUntil) {
		const cachedStat = gitHubCache.lastSuccessful
		if (cachedStat) {
			return {
				label: cachedStat.label,
				source: "cached",
				message: "GitHub API rate-limited. Showing the last known star count.",
			}
		}
		return {
			...FALLBACK_STAT,
			message: "GitHub API rate-limited and no cached value is available yet.",
		}
	}

	if (gitHubCache.lastSuccessful && now - gitHubCache.lastSuccessful.fetchedAt < GITHUB_CACHE_TTL_MS) {
		return {
			label: gitHubCache.lastSuccessful.label,
			source: "live",
		}
	}

	if (gitHubCache.ongoing) {
		return gitHubCache.ongoing
	}

	gitHubCache.ongoing = (async () => {
		try {
			const githubHeaders: Record<string, string> = {
				Accept: "application/vnd.github+json",
				"User-Agent": "darbot-coder-marketing-site",
			}
			if (GITHUB_API_TOKEN) {
				githubHeaders.Authorization = `Bearer ${GITHUB_API_TOKEN}`
			}

			const requestInit: RequestInit & { next?: { revalidate: number } } = {
				headers: githubHeaders,
				next: { revalidate: GITHUB_FETCH_REVALIDATE_SECONDS },
			}

			const res = await fetch(GITHUB_API_URL, requestInit)
			const remaining = Number(res.headers.get("x-ratelimit-remaining"))
			const resetAt = Number(res.headers.get("x-ratelimit-reset"))

			if (!res.ok) {
				if (res.status === 401) {
					console.warn("GitHub API authentication failed. Check GITHUB_API_TOKEN configuration.")
				}
				if (res.status === 403 && remaining === 0) {
					console.warn("GitHub API rate limit reached. Serving cached star count if available.")
					setGitHubCooldown(resetAt)
					const cachedStat = gitHubCache.lastSuccessful
					if (cachedStat) {
						return {
							label: cachedStat.label,
							source: "cached",
							message: "GitHub API rate-limited. Showing the last known star count.",
						}
					}
					return {
						...FALLBACK_STAT,
						message: "GitHub API rate-limited and no cached value is available yet.",
					}
				}

				console.warn(
					`GitHub API request failed with status ${res.status}. Falling back to cached data if available.`,
				)
				return fallbackWithCachedGitHubStat("GitHub API request failed.")
			}

			const json = (await res.json()) as GitHubResponse
			const parsed = GithubRepositorySchema.safeParse(json)
			if (!parsed.success || typeof parsed.data?.stargazers_count !== "number") {
				console.warn("GitHub API: Invalid stargazers count in response. Falling back to cached value if available.")
				return fallbackWithCachedGitHubStat("Invalid stargazers count from GitHub API.")
			}

			const count = parsed.data.stargazers_count
			const label = formatCount(count)
			gitHubCache.lastSuccessful = {
				count,
				label,
				fetchedAt: Date.now(),
			}
			gitHubCache.backoffMs = GITHUB_BASE_BACKOFF_MS
			gitHubCache.cooldownUntil = 0

			return {
				label,
				source: "live",
			}
		} catch (error) {
			console.error("Error fetching GitHub stars:", error)
			return fallbackWithCachedGitHubStat("Error fetching GitHub stars.")
		} finally {
			gitHubCache.ongoing = undefined
		}
	})()

	return gitHubCache.ongoing
}

export async function getVSCodeDownloads(): Promise<StatDisplayValue> {
	// In development, use mock data when API fails
	if (IS_DEVELOPMENT) {
		const { snapshot, source, reason } = await ensureMarketplaceSnapshot()
		if (typeof snapshot?.installs === "number" && snapshot.installs >= 0) {
			return {
				label: formatCount(snapshot.installs),
				source,
				message: source === "cached" ? reason ?? "Using cached VS Code downloads." : undefined,
			}
		}
		// Fallback to mock data in development
		return {
			label: formatCount(DEV_MOCK_VS_CODE_DOWNLOADS),
			source: "fallback",
			message: "Development mode: Using mock data. Extension may not be published yet.",
		}
	}

	const { snapshot, source, reason } = await ensureMarketplaceSnapshot()
	if (typeof snapshot?.installs === "number" && snapshot.installs >= 0) {
		return {
			label: formatCount(snapshot.installs),
			source,
			message: source === "cached" ? reason ?? "Using cached VS Code downloads." : undefined,
		}
	}

	return {
		...FALLBACK_STAT,
		source,
		message: reason ?? "VS Code Marketplace downloads are not available right now.",
	}
}

export async function getVSCodeReviews(): Promise<MarketplaceReview[]> {
	const { snapshot } = await ensureMarketplaceSnapshot()
	return snapshot?.reviews ?? []
}

export function formatCount(value: number): string {
	if (!Number.isFinite(value) || value < 0) {
		return FALLBACK_STAT_LABEL
	}

	if (value < 1000) {
		return Math.round(value).toLocaleString("en-US")
	}

	const formatter = new Intl.NumberFormat("en-US", {
		notation: "compact",
		maximumFractionDigits: 1,
	})
	const formatted = formatter.format(value).replace("\u00A0", "")
	return formatted.replace("K", "k").replace("M", "M").replace("B", "B")
}

export function __resetStatsTestState() {
	gitHubCache.lastSuccessful = null
	gitHubCache.cooldownUntil = 0
	gitHubCache.backoffMs = GITHUB_BASE_BACKOFF_MS
	gitHubCache.ongoing = undefined
	marketplaceState.lastSuccessful = null
	marketplaceState.ongoing = null
}

function fallbackWithCachedGitHubStat(defaultMessage: string): StatDisplayValue {
	const cachedStat = gitHubCache.lastSuccessful
	if (cachedStat) {
		return {
			label: cachedStat.label,
			source: "cached",
			message: defaultMessage,
		}
	}
	return {
		...FALLBACK_STAT,
		message: defaultMessage,
	}
}

function setGitHubCooldown(resetAt: number) {
	const now = Date.now()
	if (resetAt > now / 1000) {
		const resetMs = resetAt * 1000 - now
		gitHubCache.cooldownUntil = now + Math.min(resetMs, GITHUB_MAX_BACKOFF_MS)
		gitHubCache.backoffMs = Math.min(Math.max(gitHubCache.backoffMs * 2, GITHUB_BASE_BACKOFF_MS), GITHUB_MAX_BACKOFF_MS)
	} else {
		gitHubCache.cooldownUntil = now + gitHubCache.backoffMs
		gitHubCache.backoffMs = Math.min(gitHubCache.backoffMs * 2, GITHUB_MAX_BACKOFF_MS)
	}
}

async function ensureMarketplaceSnapshot(): Promise<MarketplaceSnapshotResult> {
	const now = Date.now()
	if (marketplaceState.lastSuccessful && now - marketplaceState.lastSuccessful.fetchedAt < MARKETPLACE_CACHE_TTL_MS) {
		return { snapshot: marketplaceState.lastSuccessful, source: "live" }
	}

	if (marketplaceState.ongoing) {
		try {
			const snapshot = await marketplaceState.ongoing
			if (snapshot) {
				return { snapshot, source: "live" }
			}
			return marketplaceFallback("VS Code Marketplace request failed.")
		} catch (error) {
			console.error("Error fetching VS Code Marketplace statistics:", error)
			return marketplaceFallback("VS Code Marketplace request failed.")
		}
	}

	marketplaceState.ongoing = fetchMarketplaceSnapshot()

	try {
		const snapshot = await marketplaceState.ongoing
		if (snapshot) {
			marketplaceState.lastSuccessful = snapshot
			return { snapshot, source: "live" }
		}
		return marketplaceFallback("VS Code Marketplace request failed.")
	} catch (error) {
		console.error("Error fetching VS Code Marketplace statistics:", error)
		return marketplaceFallback("VS Code Marketplace request failed.")
	} finally {
		marketplaceState.ongoing = null
	}
}

async function fetchMarketplaceSnapshot(): Promise<MarketplaceSnapshot | null> {
	const res = await fetch(MARKETPLACE_URL, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Accept: "application/json;api-version=7.1-preview.1",
		},
		body: JSON.stringify(MARKETPLACE_REQUEST_BODY),
	})

	if (!res.ok) {
		throw new Error(`VS Code Marketplace request failed with status ${res.status}`)
	}

	const json = (await res.json()) as MarketplaceResponse
	const parsed = MarketplaceResponseSchema.safeParse(json)
	if (!parsed.success) {
		throw new Error("VS Code Marketplace response does not match the expected schema")
	}

	const extension = parsed.data.results?.[0]?.extensions?.[0]
	if (!extension) {
		throw new Error("VS Code Marketplace response did not include extension metadata")
	}

	const installs = pickStatistic(extension.statistics, "install")
	const averageRating = pickStatistic(extension.statistics, "averagerating")
	const ratingCount = pickStatistic(extension.statistics, "ratingcount")

	const reviews = (extension.reviews ?? [])
		.map((review, index) => formatMarketplaceReview(review, index))
		.filter((review): review is MarketplaceReview => Boolean(review))

	return {
		installs,
		averageRating,
		ratingCount,
		reviews,
		fetchedAt: Date.now(),
	}
}

function pickStatistic(collection: Array<MarketplaceStatistic> | undefined | null, key: string): number | null {
	if (!collection) {
		return null
	}
	const stat = collection.find((item) => item.statisticName === key)
	if (!stat || typeof stat.value !== "number") {
		return null
	}
	return stat.value
}

function formatMarketplaceReview(review: MarketplaceReviewPayload, index: number): MarketplaceReview | null {
	const content = review.text?.trim() ?? ""
	if (!content) {
		return null
	}

	const dateText = review.date ?? review.updateDate ?? null
	let formattedDate: string | null = null
	if (dateText) {
		const parsed = new Date(dateText)
		if (!Number.isNaN(parsed.getTime())) {
			formattedDate = parsed.toLocaleDateString("en-US", {
				year: "numeric",
				month: "short",
				day: "numeric",
			})
		}
	}

	return {
		id: review.reviewId ?? `${review.reviewer?.displayName ?? "anonymous"}-${dateText ?? index}`,
		name: review.reviewer?.displayName?.trim() || "Anonymous",
		rating: typeof review.rating === "number" ? review.rating : null,
		content,
		date: formattedDate,
	}
}

function marketplaceFallback(reason: string): MarketplaceSnapshotResult {
	if (marketplaceState.lastSuccessful) {
		console.warn(`${reason} Using cached VS Code Marketplace statistics.`)
		return {
			snapshot: marketplaceState.lastSuccessful,
			source: "cached",
			reason,
		}
	}
	console.warn(`${reason} No cached VS Code Marketplace statistics available.`)
	return {
		snapshot: null,
		source: "fallback",
		reason,
	}
}
