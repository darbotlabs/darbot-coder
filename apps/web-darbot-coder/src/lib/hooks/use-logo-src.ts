"use client"

import { useTheme } from "next-themes"

export function useLogoSrc(): string {
	const { resolvedTheme } = useTheme()
	return resolvedTheme === "light" ? "/darbot-coder-logo-horizontal.svg" : "/darbot-coder-logo-horizontal-white.svg"
}
