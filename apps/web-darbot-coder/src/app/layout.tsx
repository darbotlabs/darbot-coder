import React from "react"
import type { Metadata } from "next"

import { Providers } from "@/components/providers"

import Shell from "./shell"

import "./globals.css"

const siteUrl = "https://darbot.ai"

export const metadata: Metadata = {
	metadataBase: new URL(siteUrl),
	title: {
		default: "Darbot Coder – Your AI-Powered Dev Team in VS Code",
		template: "%s | Darbot Coder",
	},
	description:
		"Darbot Coder puts an entire AI dev team right in your editor, outpacing closed tools with deep project-wide context, multi-step agentic coding, and unmatched developer-centric flexibility.",
	keywords: [
		"AI coding assistant",
		"VS Code extension",
		"multi-agent orchestration",
		"autonomous coding",
		"Darbot",
	],
	authors: [{ name: "Darbot Labs" }],
	creator: "Darbot Labs",
	openGraph: {
		type: "website",
		locale: "en_US",
		url: siteUrl,
		title: "Darbot Coder – AI-Powered Dev Team",
		description:
			"Run an orchestrated troupe of AI coding agents directly inside VS Code. Plan, build, test, and ship faster with deep project context and human-in-the-loop safeguards.",
		siteName: "Darbot Coder",
		images: [
			{
				url: "/og-image.png",
				width: 1200,
				height: 630,
				alt: "Darbot Coder hero graphic",
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title: "Darbot Coder – AI-Powered Dev Team",
		description:
			"Turn VS Code into an AI-driven development workstation with orchestrated, specialized agents.",
		creator: "@darbot_code",
		images: ["/og-image.png"],
	},
	robots: {
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
			"max-video-preview": -1,
			"max-image-preview": "large",
			"max-snippet": -1,
		},
	},
	alternates: {
		canonical: siteUrl,
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

const softwareJsonLd = {
	"@context": "https://schema.org",
	"@type": "SoftwareApplication",
	name: "Darbot Coder",
	applicationCategory: "DeveloperApplication",
	opratingSystem: "Windows, macOS, Linux",
	description:
		"Open-source AI coding assistant that orchestrates multiple agents inside VS Code to plan, implement, test, and document software projects.",
	softwareVersion: "1.0.0",
	url: siteUrl,
	image: `${siteUrl}/og-image.png`,
	author: {
		"@type": "Organization",
		name: "Darbot Labs",
	},
	offers: {
		"@type": "Offer",
		price: "0",
		priceCurrency: "USD",
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
				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareJsonLd) }}
				/>
			</head>
			<body className="font-sans">
				<div itemScope itemType="https://schema.org/WebSite">
					<link itemProp="url" href={siteUrl} />
					<meta itemProp="name" content="darbot-coder" />
				</div>
				<Providers>
					<Shell>{children}</Shell>
				</Providers>
			</body>
		</html>
	)
}
