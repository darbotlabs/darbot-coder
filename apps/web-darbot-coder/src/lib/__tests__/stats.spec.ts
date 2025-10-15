import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import {
	__resetStatsTestState,
	formatCount,
	getGitHubStars,
	getVSCodeDownloads,
	getVSCodeReviews,
} from "../stats"

type FetchResponseOptions = {
	status?: number
	body?: unknown
	headers?: Record<string, string>
}

const MARKETPLACE_SUCCESS_BODY = {
	results: [
		{
			extensions: [
				{
					statistics: [
						{ statisticName: "install", value: 12345 },
						{ statisticName: "averagerating", value: 4.8 },
						{ statisticName: "ratingcount", value: 27 },
					],
					reviews: [
						{
							reviewer: { displayName: "Test Reviewer" },
							rating: 5,
							text: "Excellent extension!",
							date: "2024-06-01T12:00:00.000Z",
						},
					],
				},
			],
		},
	],
}

const MARKETPLACE_EMPTY_STATS_BODY = {
	results: [
		{
			extensions: [
				{
					statistics: [],
					reviews: [],
				},
			],
		},
	],
}

beforeEach(() => {
	__resetStatsTestState()
})

afterEach(() => {
	vi.restoreAllMocks()
	vi.unstubAllGlobals()
})

describe("formatCount", () => {
	it("formats numbers below one thousand without suffix", () => {
		expect(formatCount(999)).toBe("999")
	})

	it("formats large numbers using compact notation", () => {
		expect(formatCount(12_345)).toBe("12.3k")
	})

	it("returns fallback label for invalid input", () => {
		expect(formatCount(-5)).toBe("Unavailable")
	})
})

describe("getGitHubStars", () => {
	it("returns live stats when the API responds with a valid count", async () => {
		stubFetch(
			createFetchResponse({
				body: { stargazers_count: 1700 },
				headers: { "x-ratelimit-remaining": "4999" },
			}),
		)

		const result = await getGitHubStars()
		expect(result.label).toBe("1.7k")
		expect(result.source).toBe("live")
		expect(result.message).toBeUndefined()
	})

	it("falls back to cached data when rate limited", async () => {
		vi.useFakeTimers()
		const now = Date.now()
		vi.setSystemTime(now)

		const fetchMock = vi.fn()
		fetchMock.mockResolvedValueOnce(
			createFetchResponse({
				body: { stargazers_count: 2400 },
				headers: { "x-ratelimit-remaining": "4999" },
			}),
		)
		fetchMock.mockResolvedValueOnce(
			createFetchResponse({
				status: 403,
				headers: {
					"x-ratelimit-remaining": "0",
					"x-ratelimit-reset": `${Math.floor(Date.now() / 1000) + 60}`,
				},
			}),
		)
		vi.stubGlobal("fetch", fetchMock as unknown as typeof fetch)

		try {
			const live = await getGitHubStars()
			expect(live.label).toBe("2.4k")
			expect(live.source).toBe("live")

			vi.advanceTimersByTime(15 * 60 * 1000 + 10)

			const cached = await getGitHubStars()
			expect(cached.label).toBe(live.label)
			expect(cached.source).toBe("cached")
			expect(cached.message).toContain("rate-limited")
		} finally {
			vi.useRealTimers()
		}
	})

	it("returns fallback when the API payload is invalid", async () => {
		stubFetch(createFetchResponse({ body: { unexpected: true } }))

		const result = await getGitHubStars()
		expect(result.label).toBe("Unavailable")
		expect(result.source).toBe("fallback")
		expect(result.message).toMatch(/invalid/i)
	})
})

describe("getVSCodeDownloads", () => {
	it("returns formatted installs when marketplace data is present", async () => {
		stubFetch(createFetchResponse({ body: MARKETPLACE_SUCCESS_BODY }))

		const result = await getVSCodeDownloads()
		expect(result.label).toBe("12.3k")
		expect(result.source).toBe("live")
	})

	it("falls back when install statistic is missing", async () => {
		stubFetch(createFetchResponse({ body: MARKETPLACE_EMPTY_STATS_BODY }))

		const result = await getVSCodeDownloads()
		expect(result.label).toBe("Unavailable")
		expect(result.message).toMatch(/downloads are not available/i)
	})

	it("returns cached installs when the marketplace request fails after expiry", async () => {
		vi.useFakeTimers()
		const now = Date.now()
		vi.setSystemTime(now)

		const fetchMock = vi.fn()
		fetchMock.mockResolvedValueOnce(createFetchResponse({ body: MARKETPLACE_SUCCESS_BODY }))
		fetchMock.mockResolvedValueOnce(
			createFetchResponse({
				status: 503,
				body: { error: "Service Unavailable" },
			})
		)
		vi.stubGlobal("fetch", fetchMock as unknown as typeof fetch)

		try {
			const live = await getVSCodeDownloads()
			expect(live.source).toBe("live")

			vi.advanceTimersByTime(10 * 60 * 1000 + 10)

			const cached = await getVSCodeDownloads()
			expect(cached.source).toBe("cached")
			expect(cached.label).toBe(live.label)
		} finally {
			vi.useRealTimers()
		}
	})
})

describe("getVSCodeReviews", () => {
	it("filters and formats reviews", async () => {
		stubFetch(createFetchResponse({ body: MARKETPLACE_SUCCESS_BODY }))

		const reviews = await getVSCodeReviews()
		expect(reviews).toHaveLength(1)
		expect(reviews[0]).toMatchObject({
			name: "Test Reviewer",
			rating: 5,
			content: "Excellent extension!",
		})
	})
})

function stubFetch(response: ReturnType<typeof createFetchResponse>) {
	vi.stubGlobal("fetch", vi.fn().mockResolvedValue(response) as unknown as typeof fetch)
}

function createFetchResponse({ status = 200, body = {}, headers = {} }: FetchResponseOptions) {
	const headerMap = new Map<string, string>()
	for (const [key, value] of Object.entries(headers)) {
		headerMap.set(key.toLowerCase(), value)
	}

	return {
		ok: status >= 200 && status < 300,
		status,
		headers: {
			get: (key: string) => headerMap.get(key.toLowerCase()) ?? null,
		},
		async json() {
			return body
		},
	} as unknown as Response
}
