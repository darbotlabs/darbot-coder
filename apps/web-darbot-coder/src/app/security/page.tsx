import { Shield, Lock, Eye, FileCheck, Server, Key, CheckCircle, AlertTriangle, User } from "lucide-react"

import { Button } from "@/components/ui"
import { AnimatedText } from "@/components/animated-text"
import { AnimatedBackground } from "@/components/homepage"
import { EXTERNAL_LINKS } from "@/lib/constants"

export default async function Security() {
	return (
		<>
			{/* Hero Section */}
			<section className="relative flex h-[calc(100vh-theme(spacing.16))] items-center overflow-hidden">
				<AnimatedBackground />
				<div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
					<div className="grid gap-8 md:gap-12 lg:grid-cols-2 lg:gap-16">
						<div className="flex flex-col justify-center space-y-6 sm:space-y-8">
							<div>
								<h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl">
									<span className="block">Security &amp;</span>
									<AnimatedText className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
										Trust by Design
									</AnimatedText>
								</h1>
								<p className="mt-4 max-w-md text-base text-muted-foreground sm:mt-6 sm:text-lg">
									Built from the ground up with{" "}
									<AnimatedText className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
										security-first architecture
									</AnimatedText>
									. Your code stays private, your data stays protected, and your trust stays intact.
								</p>
							</div>
							<div className="flex flex-col space-y-3 sm:flex-row sm:space-x-4 sm:space-y-0">
								<Button
									size="lg"
									className="w-full hover:bg-gray-200 dark:bg-white dark:text-black sm:w-auto"
									asChild>
									<a href="#certifications" className="flex w-full items-center justify-center">
										View Certifications
										<svg
											xmlns="http://www.w3.org/2000/svg"
											className="ml-2 h-4 w-4"
											viewBox="0 0 20 20"
											fill="currentColor">
											<path
												fillRule="evenodd"
												d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
												clipRule="evenodd"
											/>
										</svg>
									</a>
								</Button>
								<Button variant="outline" size="lg" className="w-full sm:w-auto">
									<a
										href={EXTERNAL_LINKS.GITHUB}
										target="_blank"
										rel="noopener noreferrer"
										className="flex w-full items-center justify-center">
										View Source Code
									</a>
								</Button>
							</div>
						</div>
						<div className="relative mt-8 flex items-center justify-center lg:mt-0">
							<div className="absolute inset-0 flex items-center justify-center">
								<div className="h-[250px] w-[250px] rounded-full bg-blue-500/20 blur-[100px] sm:h-[300px] sm:w-[300px] md:h-[350px] md:w-[350px]" />
							</div>
							<div className="relative z-10 rounded-lg border border-border bg-card p-6 shadow-lg">
								<div className="mb-4 flex items-center space-x-2">
									<Shield className="h-6 w-6 text-blue-400" />
									<h3 className="text-lg font-semibold">Security-First Architecture</h3>
								</div>
								<p className="mb-4 text-sm text-muted-foreground">
									Every feature, every integration, every line of code is designed with security as the
									foundational principle.
								</p>
								<div className="space-y-2">
									<div className="flex items-center space-x-2">
										<CheckCircle className="h-4 w-4 text-green-400" />
										<span className="text-sm">SOC 2 Type I Certified</span>
									</div>
									<div className="flex items-center space-x-2">
										<CheckCircle className="h-4 w-4 text-green-400" />
										<span className="text-sm">Open-source transparency</span>
									</div>
									<div className="flex items-center space-x-2">
										<CheckCircle className="h-4 w-4 text-green-400" />
										<span className="text-sm">End-to-end encryption</span>
									</div>
									<div className="flex items-center space-x-2">
										<CheckCircle className="h-4 w-4 text-green-400" />
										<span className="text-sm">Zero data retention</span>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Core Security Principles */}
			<section id="principles" className="bg-secondary/50 py-16">
				<div className="container mx-auto px-4 sm:px-6 lg:px-8">
					<div className="mb-12 text-center">
						<h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Core Security Principles</h2>
						<p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
							Our commitment to security is embedded in every aspect of darbot-coder, from architecture to
							implementation.
						</p>
					</div>

					<div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
						{/* Principle 1 */}
						<div className="rounded-lg border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md">
							<div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
								<Lock className="h-6 w-6 text-blue-500" />
							</div>
							<h3 className="mb-2 text-xl font-bold">Privacy by Default</h3>
							<p className="text-muted-foreground">
								Your code never leaves your machine unless explicitly shared. Local-first architecture ensures
								complete privacy.
							</p>
							<ul className="mt-4 space-y-2">
								<li className="flex items-start">
									<CheckCircle className="mr-2 mt-0.5 h-5 w-5 shrink-0 text-green-500" />
									<span>Local code analysis</span>
								</li>
								<li className="flex items-start">
									<CheckCircle className="mr-2 mt-0.5 h-5 w-5 shrink-0 text-green-500" />
									<span>No code storage on servers</span>
								</li>
								<li className="flex items-start">
									<CheckCircle className="mr-2 mt-0.5 h-5 w-5 shrink-0 text-green-500" />
									<span>Explicit permission model</span>
								</li>
							</ul>
						</div>

						{/* Principle 2 */}
						<div className="rounded-lg border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md">
							<div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
								<Eye className="h-6 w-6 text-blue-500" />
							</div>
							<h3 className="mb-2 text-xl font-bold">Full Transparency</h3>
							<p className="text-muted-foreground">
								100% open-source codebase allows complete security audit and verification by anyone.
							</p>
							<ul className="mt-4 space-y-2">
								<li className="flex items-start">
									<CheckCircle className="mr-2 mt-0.5 h-5 w-5 shrink-0 text-green-500" />
									<span>Open-source architecture</span>
								</li>
								<li className="flex items-start">
									<CheckCircle className="mr-2 mt-0.5 h-5 w-5 shrink-0 text-green-500" />
									<span>Public security disclosures</span>
								</li>
								<li className="flex items-start">
									<CheckCircle className="mr-2 mt-0.5 h-5 w-5 shrink-0 text-green-500" />
									<span>Community-verified security</span>
								</li>
							</ul>
						</div>

						{/* Principle 3 */}
						<div className="rounded-lg border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md">
							<div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
								<Key className="h-6 w-6 text-blue-500" />
							</div>
							<h3 className="mb-2 text-xl font-bold">User-Controlled Access</h3>
							<p className="text-muted-foreground">
								You maintain complete control over API keys, permissions, and data access at all times.
							</p>
							<ul className="mt-4 space-y-2">
								<li className="flex items-start">
									<CheckCircle className="mr-2 mt-0.5 h-5 w-5 shrink-0 text-green-500" />
									<span>Your API keys, your control</span>
								</li>
								<li className="flex items-start">
									<CheckCircle className="mr-2 mt-0.5 h-5 w-5 shrink-0 text-green-500" />
									<span>Granular permission settings</span>
								</li>
								<li className="flex items-start">
									<CheckCircle className="mr-2 mt-0.5 h-5 w-5 shrink-0 text-green-500" />
									<span>Revocable access anytime</span>
								</li>
							</ul>
						</div>

						{/* Principle 4 */}
						<div className="rounded-lg border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md">
							<div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
								<Server className="h-6 w-6 text-blue-500" />
							</div>
							<h3 className="mb-2 text-xl font-bold">Zero Data Retention</h3>
							<p className="text-muted-foreground">
								We don&apos;t store your code, conversations, or context. Your data is yours alone.
							</p>
							<ul className="mt-4 space-y-2">
								<li className="flex items-start">
									<CheckCircle className="mr-2 mt-0.5 h-5 w-5 shrink-0 text-green-500" />
									<span>No conversation logging</span>
								</li>
								<li className="flex items-start">
									<CheckCircle className="mr-2 mt-0.5 h-5 w-5 shrink-0 text-green-500" />
									<span>No code storage</span>
								</li>
								<li className="flex items-start">
									<CheckCircle className="mr-2 mt-0.5 h-5 w-5 shrink-0 text-green-500" />
									<span>Ephemeral processing only</span>
								</li>
							</ul>
						</div>

						{/* Principle 5 */}
						<div className="rounded-lg border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md">
							<div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
								<FileCheck className="h-6 w-6 text-blue-500" />
							</div>
							<h3 className="mb-2 text-xl font-bold">Regular Security Audits</h3>
							<p className="text-muted-foreground">
								Continuous third-party security assessments and penetration testing ensure ongoing protection.
							</p>
							<ul className="mt-4 space-y-2">
								<li className="flex items-start">
									<CheckCircle className="mr-2 mt-0.5 h-5 w-5 shrink-0 text-green-500" />
									<span>Annual penetration tests</span>
								</li>
								<li className="flex items-start">
									<CheckCircle className="mr-2 mt-0.5 h-5 w-5 shrink-0 text-green-500" />
									<span>Third-party audits</span>
								</li>
								<li className="flex items-start">
									<CheckCircle className="mr-2 mt-0.5 h-5 w-5 shrink-0 text-green-500" />
									<span>Vulnerability disclosure program</span>
								</li>
							</ul>
						</div>

						{/* Principle 6 */}
						<div className="rounded-lg border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md">
							<div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
								<User className="h-6 w-6 text-blue-500" />
							</div>
							<h3 className="mb-2 text-xl font-bold">Explicit User Consent</h3>
							<p className="text-muted-foreground">
								Every action requires clear user approval. No silent background operations or hidden data
								sharing.
							</p>
							<ul className="mt-4 space-y-2">
								<li className="flex items-start">
									<CheckCircle className="mr-2 mt-0.5 h-5 w-5 shrink-0 text-green-500" />
									<span>Permission-based operations</span>
								</li>
								<li className="flex items-start">
									<CheckCircle className="mr-2 mt-0.5 h-5 w-5 shrink-0 text-green-500" />
									<span>Clear action confirmations</span>
								</li>
								<li className="flex items-start">
									<CheckCircle className="mr-2 mt-0.5 h-5 w-5 shrink-0 text-green-500" />
									<span>No surprise behaviors</span>
								</li>
							</ul>
						</div>
					</div>
				</div>
			</section>

			{/* Certifications & Compliance */}
			<section id="certifications" className="py-16">
				<div className="container mx-auto px-4 sm:px-6 lg:px-8">
					<div className="mb-12 text-center">
						<h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
							Certifications &amp; Compliance
						</h2>
						<p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
							Meeting and exceeding industry-standard security certifications and compliance requirements.
						</p>
					</div>

					<div className="grid gap-8 md:grid-cols-2">
						{/* SOC 2 Type I */}
						<div className="rounded-lg border border-border bg-card p-8 shadow-sm">
							<div className="mb-4 flex items-center space-x-3">
								<div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
									<Shield className="h-6 w-6 text-blue-500" />
								</div>
								<h3 className="text-2xl font-bold">SOC 2 Type I Certified</h3>
							</div>
							<p className="mb-4 text-muted-foreground">
								Successfully completed SOC 2 Type I certification, demonstrating our commitment to security,
								availability, and confidentiality. Type II observation period in progress.
							</p>
							<ul className="space-y-2">
								<li className="flex items-start">
									<CheckCircle className="mr-2 mt-0.5 h-5 w-5 shrink-0 text-green-500" />
									<span>Security controls validated</span>
								</li>
								<li className="flex items-start">
									<CheckCircle className="mr-2 mt-0.5 h-5 w-5 shrink-0 text-green-500" />
									<span>Third-party audit completed</span>
								</li>
								<li className="flex items-start">
									<CheckCircle className="mr-2 mt-0.5 h-5 w-5 shrink-0 text-green-500" />
									<span>Type II in observation period</span>
								</li>
							</ul>
						</div>

						{/* GDPR Compliance */}
						<div className="rounded-lg border border-border bg-card p-8 shadow-sm">
							<div className="mb-4 flex items-center space-x-3">
								<div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
									<FileCheck className="h-6 w-6 text-blue-500" />
								</div>
								<h3 className="text-2xl font-bold">GDPR Compliant</h3>
							</div>
							<p className="mb-4 text-muted-foreground">
								Full compliance with the General Data Protection Regulation (GDPR), ensuring European users
								have complete data protection and privacy rights.
							</p>
							<ul className="space-y-2">
								<li className="flex items-start">
									<CheckCircle className="mr-2 mt-0.5 h-5 w-5 shrink-0 text-green-500" />
									<span>Data processing transparency</span>
								</li>
								<li className="flex items-start">
									<CheckCircle className="mr-2 mt-0.5 h-5 w-5 shrink-0 text-green-500" />
									<span>Right to data deletion</span>
								</li>
								<li className="flex items-start">
									<CheckCircle className="mr-2 mt-0.5 h-5 w-5 shrink-0 text-green-500" />
									<span>Data portability support</span>
								</li>
							</ul>
						</div>
					</div>
				</div>
			</section>

			{/* Security Features */}
			<section className="bg-secondary/50 py-16">
				<div className="container mx-auto px-4 sm:px-6 lg:px-8">
					<div className="mb-12 text-center">
						<h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Security Features</h2>
						<p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
							Comprehensive security capabilities built into every layer of darbot-coder.
						</p>
					</div>

					<div className="space-y-8">
						{/* Feature 1 */}
						<div className="rounded-lg border border-border bg-card p-6 shadow-sm">
							<div className="grid gap-6 md:grid-cols-3 md:items-start">
								<div className="md:col-span-1">
									<h3 className="mb-2 flex items-center text-xl font-bold">
										<Lock className="mr-2 h-5 w-5 text-blue-500" />
										End-to-End Encryption
									</h3>
								</div>
								<div className="md:col-span-2">
									<p className="mb-3 text-muted-foreground">
										All data transmission between your machine and AI providers is encrypted using
										industry-standard TLS 1.3 protocols.
									</p>
									<div className="grid gap-3 sm:grid-cols-2">
										<div className="flex items-start">
											<CheckCircle className="mr-2 mt-0.5 h-4 w-4 shrink-0 text-green-500" />
											<span className="text-sm">TLS 1.3 encryption</span>
										</div>
										<div className="flex items-start">
											<CheckCircle className="mr-2 mt-0.5 h-4 w-4 shrink-0 text-green-500" />
											<span className="text-sm">Certificate pinning</span>
										</div>
										<div className="flex items-start">
											<CheckCircle className="mr-2 mt-0.5 h-4 w-4 shrink-0 text-green-500" />
											<span className="text-sm">Perfect forward secrecy</span>
										</div>
										<div className="flex items-start">
											<CheckCircle className="mr-2 mt-0.5 h-4 w-4 shrink-0 text-green-500" />
											<span className="text-sm">No plaintext transmission</span>
										</div>
									</div>
								</div>
							</div>
						</div>

						{/* Feature 2 */}
						<div className="rounded-lg border border-border bg-card p-6 shadow-sm">
							<div className="grid gap-6 md:grid-cols-3 md:items-start">
								<div className="md:col-span-1">
									<h3 className="mb-2 flex items-center text-xl font-bold">
										<Eye className="mr-2 h-5 w-5 text-blue-500" />
										Audit Trail &amp; Logging
									</h3>
								</div>
								<div className="md:col-span-2">
									<p className="mb-3 text-muted-foreground">
										Comprehensive audit trails for all actions, providing complete visibility into system
										operations and user activities.
									</p>
									<div className="grid gap-3 sm:grid-cols-2">
										<div className="flex items-start">
											<CheckCircle className="mr-2 mt-0.5 h-4 w-4 shrink-0 text-green-500" />
											<span className="text-sm">Complete action history</span>
										</div>
										<div className="flex items-start">
											<CheckCircle className="mr-2 mt-0.5 h-4 w-4 shrink-0 text-green-500" />
											<span className="text-sm">Tamper-proof logs</span>
										</div>
										<div className="flex items-start">
											<CheckCircle className="mr-2 mt-0.5 h-4 w-4 shrink-0 text-green-500" />
											<span className="text-sm">Export capabilities</span>
										</div>
										<div className="flex items-start">
											<CheckCircle className="mr-2 mt-0.5 h-4 w-4 shrink-0 text-green-500" />
											<span className="text-sm">Compliance reporting</span>
										</div>
									</div>
								</div>
							</div>
						</div>

						{/* Feature 3 */}
						<div className="rounded-lg border border-border bg-card p-6 shadow-sm">
							<div className="grid gap-6 md:grid-cols-3 md:items-start">
								<div className="md:col-span-1">
									<h3 className="mb-2 flex items-center text-xl font-bold">
										<Key className="mr-2 h-5 w-5 text-blue-500" />
										Secure Credential Management
									</h3>
								</div>
								<div className="md:col-span-2">
									<p className="mb-3 text-muted-foreground">
										API keys and credentials are stored securely using VS Code&apos;s built-in secret
										storage with OS-level encryption.
									</p>
									<div className="grid gap-3 sm:grid-cols-2">
										<div className="flex items-start">
											<CheckCircle className="mr-2 mt-0.5 h-4 w-4 shrink-0 text-green-500" />
											<span className="text-sm">OS keychain integration</span>
										</div>
										<div className="flex items-start">
											<CheckCircle className="mr-2 mt-0.5 h-4 w-4 shrink-0 text-green-500" />
											<span className="text-sm">Encrypted storage</span>
										</div>
										<div className="flex items-start">
											<CheckCircle className="mr-2 mt-0.5 h-4 w-4 shrink-0 text-green-500" />
											<span className="text-sm">No plaintext credentials</span>
										</div>
										<div className="flex items-start">
											<CheckCircle className="mr-2 mt-0.5 h-4 w-4 shrink-0 text-green-500" />
											<span className="text-sm">User-controlled access</span>
										</div>
									</div>
								</div>
							</div>
						</div>

						{/* Feature 4 */}
						<div className="rounded-lg border border-border bg-card p-6 shadow-sm">
							<div className="grid gap-6 md:grid-cols-3 md:items-start">
								<div className="md:col-span-1">
									<h3 className="mb-2 flex items-center text-xl font-bold">
										<Server className="mr-2 h-5 w-5 text-blue-500" />
										Data Residency Control
									</h3>
								</div>
								<div className="md:col-span-2">
									<p className="mb-3 text-muted-foreground">
										Choose where your data is processed by selecting AI providers with specific regional
										deployments and data residency guarantees.
									</p>
									<div className="grid gap-3 sm:grid-cols-2">
										<div className="flex items-start">
											<CheckCircle className="mr-2 mt-0.5 h-4 w-4 shrink-0 text-green-500" />
											<span className="text-sm">Provider selection control</span>
										</div>
										<div className="flex items-start">
											<CheckCircle className="mr-2 mt-0.5 h-4 w-4 shrink-0 text-green-500" />
											<span className="text-sm">Regional deployment options</span>
										</div>
										<div className="flex items-start">
											<CheckCircle className="mr-2 mt-0.5 h-4 w-4 shrink-0 text-green-500" />
											<span className="text-sm">Data sovereignty compliance</span>
										</div>
										<div className="flex items-start">
											<CheckCircle className="mr-2 mt-0.5 h-4 w-4 shrink-0 text-green-500" />
											<span className="text-sm">Self-hosted options available</span>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Responsible Disclosure */}
			<section className="py-16">
				<div className="container mx-auto px-4 sm:px-6 lg:px-8">
					<div className="rounded-lg border border-border bg-card p-8 shadow-sm">
						<div className="grid gap-8 md:grid-cols-2 md:items-center">
							<div>
								<div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
									<AlertTriangle className="h-6 w-6 text-blue-500" />
								</div>
								<h3 className="mb-4 text-2xl font-bold">Responsible Disclosure Program</h3>
								<p className="mb-6 text-muted-foreground">
									We welcome security researchers to help us maintain the highest security standards. Report
									vulnerabilities responsibly and we&apos;ll work with you to address them promptly.
								</p>
								<div className="space-y-3">
									<div className="flex items-start">
										<CheckCircle className="mr-2 mt-0.5 h-5 w-5 shrink-0 text-green-500" />
										<div>
											<strong>Public disclosure coordination</strong>
											<p className="text-sm text-muted-foreground">
												We coordinate on timing for public disclosure
											</p>
										</div>
									</div>
									<div className="flex items-start">
										<CheckCircle className="mr-2 mt-0.5 h-5 w-5 shrink-0 text-green-500" />
										<div>
											<strong>Rapid response commitment</strong>
											<p className="text-sm text-muted-foreground">
												We acknowledge reports within 48 hours
											</p>
										</div>
									</div>
									<div className="flex items-start">
										<CheckCircle className="mr-2 mt-0.5 h-5 w-5 shrink-0 text-green-500" />
										<div>
											<strong>Security hall of fame</strong>
											<p className="text-sm text-muted-foreground">
												Recognition for responsible disclosures
											</p>
										</div>
									</div>
								</div>
							</div>
							<div className="flex flex-col space-y-4">
								<div className="rounded-lg border border-border bg-secondary/50 p-6">
									<h4 className="mb-3 text-lg font-semibold">How to Report</h4>
									<p className="mb-4 text-sm text-muted-foreground">
										If you discover a security vulnerability, please report it via:
									</p>
									<ul className="space-y-2 text-sm">
										<li className="flex items-start">
											<CheckCircle className="mr-2 mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
											<span>
												Email:{" "}
												<a
													href="mailto:security@darbotcode.com"
													className="text-blue-500 underline hover:text-blue-600">
													security@darbotcode.com
												</a>
											</span>
										</li>
										<li className="flex items-start">
											<CheckCircle className="mr-2 mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
											<span>
												GitHub Security Advisories:{" "}
												<a
													href={`${EXTERNAL_LINKS.GITHUB}/security/advisories`}
													target="_blank"
													rel="noopener noreferrer"
													className="text-blue-500 underline hover:text-blue-600">
													Report privately
												</a>
											</span>
										</li>
									</ul>
								</div>
								<Button size="lg" variant="outline" asChild className="w-full">
									<a href={EXTERNAL_LINKS.GITHUB} target="_blank" rel="noopener noreferrer">
										View Security Policy
										<Shield className="ml-2 h-4 w-4" />
									</a>
								</Button>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Trust & Transparency */}
			<section className="bg-secondary/50 py-16">
				<div className="container mx-auto px-4 sm:px-6 lg:px-8">
					<div className="mx-auto max-w-3xl text-center">
						<h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
							Built on Trust &amp; Transparency
						</h2>
						<p className="mb-8 text-lg text-muted-foreground">
							Security isn&apos;t just a feature—it&apos;s the foundation of everything we build. Our
							open-source approach means you can verify our security claims yourself.
						</p>
						<div className="grid gap-6 sm:grid-cols-3">
							<div className="rounded-lg border border-border bg-card p-6">
								<div className="mx-auto mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
									<Shield className="h-6 w-6 text-blue-500" />
								</div>
								<h3 className="mb-2 text-lg font-bold">Open Source</h3>
								<p className="text-sm text-muted-foreground">
									100% of our code is publicly available for security review
								</p>
							</div>
							<div className="rounded-lg border border-border bg-card p-6">
								<div className="mx-auto mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
									<FileCheck className="h-6 w-6 text-blue-500" />
								</div>
								<h3 className="mb-2 text-lg font-bold">Regular Audits</h3>
								<p className="text-sm text-muted-foreground">
									Third-party security assessments and penetration testing
								</p>
							</div>
							<div className="rounded-lg border border-border bg-card p-6">
								<div className="mx-auto mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
									<Eye className="h-6 w-6 text-blue-500" />
								</div>
								<h3 className="mb-2 text-lg font-bold">Full Disclosure</h3>
								<p className="text-sm text-muted-foreground">
									Transparent communication about security incidents and fixes
								</p>
							</div>
						</div>
						<div className="mt-8 flex justify-center gap-4">
							<Button size="lg" asChild>
								<a href={EXTERNAL_LINKS.GITHUB} target="_blank" rel="noopener noreferrer">
									View Source Code
								</a>
							</Button>
							<Button size="lg" variant="outline" asChild>
								<a href={EXTERNAL_LINKS.PRIVACY_POLICY_EXTENSION} target="_blank" rel="noopener noreferrer">
									Read Privacy Policy
								</a>
							</Button>
						</div>
					</div>
				</div>
			</section>
		</>
	)
}
