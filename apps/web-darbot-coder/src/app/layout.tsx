import React from "react"
import type { Metadata } from "next"

import { Providers } from "@/components/providers"

import Shell from "./shell"

import "./globals.css"

export const metadata: Metadata = {
	title: "Darbot Coder – Your AI-Powered Dev Team in VS Code",
	description:
		"Darbot Coder puts an entire AI dev team right in your editor, outpacing closed tools with deep project-wide context, multi-step agentic coding, and unmatched developer-centric flexibility.",
	alternates: {
		canonical: "https://github.com/DarbotLabs/darbot-coder",
	},
	icons: {
		icon: [
			{ url: "/favicon.ico" },
			{ url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
			{ url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
		],
		apple: [{ url: "/apple-touch-icon.png" }],
		other: [
			{
				rel: "android-chrome-192x192",
				url: "/android-chrome-192x192.png",
				sizes: "192x192",
				type: "image/png",
			},
			{
				rel: "android-chrome-512x512",
				url: "/android-chrome-512x512.png",
				sizes: "512x512",
				type: "image/png",
			},
		],
	},
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<link
					rel="stylesheet"
					type="text/css"
					href="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/devicon.min.css"
				/>
			</head>
			<body className="font-sans">
				<div itemScope itemType="https://schema.org/WebSite">
					<link itemProp="url" href="https://github.com/DarbotLabs/darbot-coder" />
					<meta itemProp="name" content="darbot-coder" />
				</div>
				<Providers>
					<Shell>{children}</Shell>
				</Providers>
			</body>
		</html>
	)
}
