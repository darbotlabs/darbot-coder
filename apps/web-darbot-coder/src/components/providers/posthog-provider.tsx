"use client"

import { Suspense, useEffect, useState } from "react"
import { usePathname, useSearchParams } from "next/navigation"

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com"

type PosthogModule = typeof import("posthog-js")
type PosthogClient = PosthogModule["default"]
type PosthogReactModule = typeof import("posthog-js/react")
type PosthogProviderComponent = PosthogReactModule["PostHogProvider"]

export function PostHogProvider({ children }: { children: React.ReactNode }) {
	if (!POSTHOG_KEY) {
		if (process.env.NODE_ENV !== "production") {
			console.info("PostHog analytics disabled (no NEXT_PUBLIC_POSTHOG_KEY provided).")
		}
		return <>{children}</>
	}

	return <PostHogEnabledProvider>{children}</PostHogEnabledProvider>
}

function PostHogEnabledProvider({ children }: { children: React.ReactNode }) {
	const [client, setClient] = useState<PosthogClient | null>(null)
	const [ProviderComponent, setProviderComponent] = useState<PosthogProviderComponent | null>(null)

	useEffect(() => {
		let isMounted = true
		let loadedClient: PosthogClient | null = null

		;(async () => {
			try {
				const [{ default: posthog }, { PostHogProvider }] = await Promise.all([
					import("posthog-js"),
					import("posthog-js/react"),
				])

				posthog.init(POSTHOG_KEY!, {
					api_host: POSTHOG_HOST,
					capture_pageview: false,
					loaded(instance) {
						if (process.env.NODE_ENV === "development") {
							instance.debug()
						}
					},
					respect_dnt: true,
				})

				loadedClient = posthog

				if (!isMounted) {
					shutdownClient(loadedClient)
					return
				}

				setClient(posthog)
				setProviderComponent(() => PostHogProvider)
			} catch (error) {
				console.error("Failed to initialize PostHog analytics:", error)
			}
		})()

		return () => {
			isMounted = false
			shutdownClient(loadedClient)
		}
	}, [])

	if (!ProviderComponent || !client) {
		return <>{children}</>
	}

	return (
		<ProviderComponent client={client}>
			<Suspense fallback={null}>
				<PageViewTracker client={client} />
			</Suspense>
			{children}
		</ProviderComponent>
	)
}

function PageViewTracker({ client }: { client: PosthogClient }) {
	const pathname = usePathname()
	const searchParams = useSearchParams()
	const search = searchParams.toString()

	useEffect(() => {
		if (!pathname) {
			return
		}
		const origin = window.location.origin
		const url = search ? `${origin}${pathname}?${search}` : `${origin}${pathname}`
		client.capture("$pageview", {
			$current_url: url,
		})
	}, [client, pathname, search])

	return null
}

function shutdownClient(client: PosthogClient | null) {
	const candidate = client as unknown as { shutdown?: () => void }
	candidate.shutdown?.()
}
