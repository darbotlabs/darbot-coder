import {
	Book,
	Code,
	Cpu,
	FileText,
	Zap,
	Terminal,
	Puzzle,
	Settings,
	CheckCircle,
	ArrowRight,
	Download,
	Key,
	Layers,
	GitBranch,
	Play,
	FileCode,
	Box,
	Cog,
} from "lucide-react"

import { Button } from "@/components/ui"
import { AnimatedText } from "@/components/animated-text"
import { AnimatedBackground } from "@/components/homepage"
import { EXTERNAL_LINKS } from "@/lib/constants"

export default async function Documentation() {
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
									<span className="block">Complete</span>
									<AnimatedText className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
										Documentation
									</AnimatedText>
								</h1>
								<p className="mt-4 max-w-md text-base text-muted-foreground sm:mt-6 sm:text-lg">
									Everything you need to master{" "}
									<AnimatedText className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
										darbot-coder
									</AnimatedText>
									—from installation to advanced API integration and custom mode creation.
								</p>
							</div>
							<div className="flex flex-col space-y-3 sm:flex-row sm:space-x-4 sm:space-y-0">
								<Button
									size="lg"
									className="w-full hover:bg-gray-200 dark:bg-white dark:text-black sm:w-auto"
									asChild>
									<a href="#getting-started" className="flex w-full items-center justify-center">
										Get Started
										<ArrowRight className="ml-2 h-4 w-4" />
									</a>
								</Button>
								<Button variant="outline" size="lg" className="w-full sm:w-auto" asChild>
									<a
										href={EXTERNAL_LINKS.GITHUB}
										target="_blank"
										rel="noopener noreferrer"
										className="flex w-full items-center justify-center">
										View on GitHub
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
									<Book className="h-6 w-6 text-blue-400" />
									<h3 className="text-lg font-semibold">Documentation Hub</h3>
								</div>
								<p className="mb-4 text-sm text-muted-foreground">
									Comprehensive guides, API references, and tutorials for all skill levels.
								</p>
								<div className="space-y-2">
									<div className="flex items-center space-x-2">
										<CheckCircle className="h-4 w-4 text-green-400" />
										<span className="text-sm">Installation guides</span>
									</div>
									<div className="flex items-center space-x-2">
										<CheckCircle className="h-4 w-4 text-green-400" />
										<span className="text-sm">API references</span>
									</div>
									<div className="flex items-center space-x-2">
										<CheckCircle className="h-4 w-4 text-green-400" />
										<span className="text-sm">Code examples</span>
									</div>
									<div className="flex items-center space-x-2">
										<CheckCircle className="h-4 w-4 text-green-400" />
										<span className="text-sm">Advanced tutorials</span>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Quick Start Guide */}
			<section id="getting-started" className="bg-secondary/50 py-16">
				<div className="container mx-auto px-4 sm:px-6 lg:px-8">
					<div className="mb-12 text-center">
						<h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Getting Started</h2>
						<p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
							Get up and running with darbot-coder in minutes
						</p>
					</div>

					<div className="grid gap-8 lg:grid-cols-3">
						{/* Step 1 */}
						<div className="rounded-lg border border-border bg-card p-6 shadow-sm">
							<div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
								<Download className="h-6 w-6 text-blue-500" />
							</div>
							<h3 className="mb-2 text-xl font-bold">1. Install the Extension</h3>
							<p className="mb-4 text-muted-foreground">
								Install darbot-coder from the VS Code Marketplace or via CLI.
							</p>
							<div className="rounded-md bg-secondary/50 p-3">
								<code className="text-sm">code --install-extension DarbotLabs.darbot-coder</code>
							</div>
							<div className="mt-4">
								<Button size="sm" variant="outline" asChild className="w-full">
									<a href={EXTERNAL_LINKS.MARKETPLACE} target="_blank" rel="noopener noreferrer">
										Open in Marketplace
									</a>
								</Button>
							</div>
						</div>

						{/* Step 2 */}
						<div className="rounded-lg border border-border bg-card p-6 shadow-sm">
							<div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
								<Key className="h-6 w-6 text-blue-500" />
							</div>
							<h3 className="mb-2 text-xl font-bold">2. Configure API Keys</h3>
							<p className="mb-4 text-muted-foreground">
								Add your AI provider API keys in the extension settings.
							</p>
							<ul className="space-y-2 text-sm">
								<li className="flex items-start">
									<CheckCircle className="mr-2 mt-0.5 h-4 w-4 shrink-0 text-green-500" />
									<span>OpenAI (GPT-4, GPT-3.5)</span>
								</li>
								<li className="flex items-start">
									<CheckCircle className="mr-2 mt-0.5 h-4 w-4 shrink-0 text-green-500" />
									<span>Anthropic (Claude)</span>
								</li>
								<li className="flex items-start">
									<CheckCircle className="mr-2 mt-0.5 h-4 w-4 shrink-0 text-green-500" />
									<span>Azure OpenAI</span>
								</li>
								<li className="flex items-start">
									<CheckCircle className="mr-2 mt-0.5 h-4 w-4 shrink-0 text-green-500" />
									<span>Local models</span>
								</li>
							</ul>
						</div>

						{/* Step 3 */}
						<div className="rounded-lg border border-border bg-card p-6 shadow-sm">
							<div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
								<Play className="h-6 w-6 text-blue-500" />
							</div>
							<h3 className="mb-2 text-xl font-bold">3. Start Coding</h3>
							<p className="mb-4 text-muted-foreground">
								Open the darbot panel and start interacting with your AI coding assistant.
							</p>
							<div className="space-y-2 text-sm">
								<div className="flex items-start">
									<ArrowRight className="mr-2 mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
									<span>Press Cmd/Ctrl+Shift+P</span>
								</div>
								<div className="flex items-start">
									<ArrowRight className="mr-2 mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
									<span>Type &quot;darbot-coder&quot;</span>
								</div>
								<div className="flex items-start">
									<ArrowRight className="mr-2 mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
									<span>Select &quot;Open darbot-coder&quot;</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Core Concepts */}
			<section className="py-16">
				<div className="container mx-auto px-4 sm:px-6 lg:px-8">
					<div className="mb-12 text-center">
						<h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Core Concepts</h2>
						<p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
							Understand the fundamental building blocks of darbot-coder
						</p>
					</div>

					<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
						{/* Modes */}
						<div className="rounded-lg border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md">
							<Layers className="mb-4 h-8 w-8 text-blue-500" />
							<h3 className="mb-2 text-xl font-bold">Custom Modes</h3>
							<p className="mb-4 text-sm text-muted-foreground">
								Modes are specialized AI configurations tailored for specific tasks like coding,
								debugging, or architecture.
							</p>
							<ul className="space-y-2 text-sm">
								<li className="flex items-start">
									<CheckCircle className="mr-2 mt-0.5 h-4 w-4 shrink-0 text-green-500" />
									<span>Role-based specialization</span>
								</li>
								<li className="flex items-start">
									<CheckCircle className="mr-2 mt-0.5 h-4 w-4 shrink-0 text-green-500" />
									<span>Custom instructions</span>
								</li>
								<li className="flex items-start">
									<CheckCircle className="mr-2 mt-0.5 h-4 w-4 shrink-0 text-green-500" />
									<span>Tool permissions</span>
								</li>
							</ul>
						</div>

						{/* MCP */}
						<div className="rounded-lg border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md">
							<Puzzle className="mb-4 h-8 w-8 text-blue-500" />
							<h3 className="mb-2 text-xl font-bold">Model Context Protocol</h3>
							<p className="mb-4 text-sm text-muted-foreground">
								MCP enables darbot-coder to connect with external tools, databases, and services through a
								standardized interface.
							</p>
							<ul className="space-y-2 text-sm">
								<li className="flex items-start">
									<CheckCircle className="mr-2 mt-0.5 h-4 w-4 shrink-0 text-green-500" />
									<span>Tool integration</span>
								</li>
								<li className="flex items-start">
									<CheckCircle className="mr-2 mt-0.5 h-4 w-4 shrink-0 text-green-500" />
									<span>Resource access</span>
								</li>
								<li className="flex items-start">
									<CheckCircle className="mr-2 mt-0.5 h-4 w-4 shrink-0 text-green-500" />
									<span>Prompt templates</span>
								</li>
							</ul>
						</div>

						{/* Context Management */}
						<div className="rounded-lg border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md">
							<FileCode className="mb-4 h-8 w-8 text-blue-500" />
							<h3 className="mb-2 text-xl font-bold">Context Management</h3>
							<p className="mb-4 text-sm text-muted-foreground">
								Smart context gathering ensures the AI has relevant code and documentation without
								overwhelming the token limit.
							</p>
							<ul className="space-y-2 text-sm">
								<li className="flex items-start">
									<CheckCircle className="mr-2 mt-0.5 h-4 w-4 shrink-0 text-green-500" />
									<span>Workspace analysis</span>
								</li>
								<li className="flex items-start">
									<CheckCircle className="mr-2 mt-0.5 h-4 w-4 shrink-0 text-green-500" />
									<span>Semantic search</span>
								</li>
								<li className="flex items-start">
									<CheckCircle className="mr-2 mt-0.5 h-4 w-4 shrink-0 text-green-500" />
									<span>Smart file selection</span>
								</li>
							</ul>
						</div>

						{/* Agentic Workflows */}
						<div className="rounded-lg border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md">
							<GitBranch className="mb-4 h-8 w-8 text-blue-500" />
							<h3 className="mb-2 text-xl font-bold">Agentic Workflows</h3>
							<p className="mb-4 text-sm text-muted-foreground">
								Multi-step autonomous workflows where the AI plans, executes, and verifies complex tasks
								across multiple files.
							</p>
							<ul className="space-y-2 text-sm">
								<li className="flex items-start">
									<CheckCircle className="mr-2 mt-0.5 h-4 w-4 shrink-0 text-green-500" />
									<span>Task decomposition</span>
								</li>
								<li className="flex items-start">
									<CheckCircle className="mr-2 mt-0.5 h-4 w-4 shrink-0 text-green-500" />
									<span>Parallel execution</span>
								</li>
								<li className="flex items-start">
									<CheckCircle className="mr-2 mt-0.5 h-4 w-4 shrink-0 text-green-500" />
									<span>Error recovery</span>
								</li>
							</ul>
						</div>

						{/* Tool System */}
						<div className="rounded-lg border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md">
							<Box className="mb-4 h-8 w-8 text-blue-500" />
							<h3 className="mb-2 text-xl font-bold">Tool System</h3>
							<p className="mb-4 text-sm text-muted-foreground">
								Built-in and custom tools that the AI can use to read files, run commands, search code,
								and interact with your environment.
							</p>
							<ul className="space-y-2 text-sm">
								<li className="flex items-start">
									<CheckCircle className="mr-2 mt-0.5 h-4 w-4 shrink-0 text-green-500" />
									<span>File operations</span>
								</li>
								<li className="flex items-start">
									<CheckCircle className="mr-2 mt-0.5 h-4 w-4 shrink-0 text-green-500" />
									<span>Terminal commands</span>
								</li>
								<li className="flex items-start">
									<CheckCircle className="mr-2 mt-0.5 h-4 w-4 shrink-0 text-green-500" />
									<span>Browser automation</span>
								</li>
							</ul>
						</div>

						{/* Configuration */}
						<div className="rounded-lg border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md">
							<Cog className="mb-4 h-8 w-8 text-blue-500" />
							<h3 className="mb-2 text-xl font-bold">Configuration</h3>
							<p className="mb-4 text-sm text-muted-foreground">
								Fine-tune darbot-coder&apos;s behavior with extensive configuration options for models,
								tools, and workflows.
							</p>
							<ul className="space-y-2 text-sm">
								<li className="flex items-start">
									<CheckCircle className="mr-2 mt-0.5 h-4 w-4 shrink-0 text-green-500" />
									<span>Model selection</span>
								</li>
								<li className="flex items-start">
									<CheckCircle className="mr-2 mt-0.5 h-4 w-4 shrink-0 text-green-500" />
									<span>Tool permissions</span>
								</li>
								<li className="flex items-start">
									<CheckCircle className="mr-2 mt-0.5 h-4 w-4 shrink-0 text-green-500" />
									<span>Workspace rules</span>
								</li>
							</ul>
						</div>
					</div>
				</div>
			</section>

			{/* API Reference */}
			<section className="bg-secondary/50 py-16">
				<div className="container mx-auto px-4 sm:px-6 lg:px-8">
					<div className="mb-12 text-center">
						<h2 className="text-3xl font-bold tracking-tight sm:text-4xl">API Reference</h2>
						<p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
							Comprehensive API documentation for extending and integrating with darbot-coder
						</p>
					</div>

					<div className="space-y-8">
						{/* Extension API */}
						<div className="rounded-lg border border-border bg-card p-8 shadow-sm">
							<div className="mb-6 flex items-start justify-between">
								<div>
									<h3 className="mb-2 text-2xl font-bold">Extension API</h3>
									<p className="text-muted-foreground">
										Core extension APIs for integrating with VS Code and darbot-coder internals
									</p>
								</div>
								<Code className="h-8 w-8 text-blue-500" />
							</div>
							<div className="grid gap-4 md:grid-cols-2">
								<div className="rounded-md border border-border p-4">
									<h4 className="mb-2 font-mono text-sm font-bold">DarbotAPI</h4>
									<p className="mb-3 text-sm text-muted-foreground">
										Main API interface for interacting with darbot-coder
									</p>
									<code className="block rounded bg-secondary/50 p-2 text-xs">
										interface DarbotAPI &#123;
										<br />
										&nbsp;&nbsp;startConversation(): void
										<br />
										&nbsp;&nbsp;sendMessage(msg: string): void
										<br />
										&nbsp;&nbsp;getCurrentMode(): Mode
										<br />
										&#125;
									</code>
								</div>
								<div className="rounded-md border border-border p-4">
									<h4 className="mb-2 font-mono text-sm font-bold">ModeManager</h4>
									<p className="mb-3 text-sm text-muted-foreground">
										Manage and switch between custom modes
									</p>
									<code className="block rounded bg-secondary/50 p-2 text-xs">
										interface ModeManager &#123;
										<br />
										&nbsp;&nbsp;listModes(): Mode[]
										<br />
										&nbsp;&nbsp;switchMode(id: string): void
										<br />
										&nbsp;&nbsp;createMode(config): Mode
										<br />
										&#125;
									</code>
								</div>
								<div className="rounded-md border border-border p-4">
									<h4 className="mb-2 font-mono text-sm font-bold">ToolRegistry</h4>
									<p className="mb-3 text-sm text-muted-foreground">
										Register custom tools for AI to use
									</p>
									<code className="block rounded bg-secondary/50 p-2 text-xs">
										interface ToolRegistry &#123;
										<br />
										&nbsp;&nbsp;register(tool: Tool): void
										<br />
										&nbsp;&nbsp;unregister(name: string): void
										<br />
										&nbsp;&nbsp;invoke(name, args): any
										<br />
										&#125;
									</code>
								</div>
								<div className="rounded-md border border-border p-4">
									<h4 className="mb-2 font-mono text-sm font-bold">ContextProvider</h4>
									<p className="mb-3 text-sm text-muted-foreground">
										Provide custom context to the AI
									</p>
									<code className="block rounded bg-secondary/50 p-2 text-xs">
										interface ContextProvider &#123;
										<br />
										&nbsp;&nbsp;getContext(): Context
										<br />
										&nbsp;&nbsp;updateContext(ctx): void
										<br />
										&nbsp;&nbsp;clearContext(): void
										<br />
										&#125;
									</code>
								</div>
							</div>
						</div>

						{/* MCP Server API */}
						<div className="rounded-lg border border-border bg-card p-8 shadow-sm">
							<div className="mb-6 flex items-start justify-between">
								<div>
									<h3 className="mb-2 text-2xl font-bold">MCP Server API</h3>
									<p className="text-muted-foreground">
										Create custom MCP servers to extend darbot-coder&apos;s capabilities
									</p>
								</div>
								<Cpu className="h-8 w-8 text-blue-500" />
							</div>
							<div className="space-y-4">
								<div className="rounded-md border border-border p-4">
									<h4 className="mb-2 font-mono text-sm font-bold">Server Interface</h4>
									<p className="mb-3 text-sm text-muted-foreground">
										Implement this interface to create an MCP server
									</p>
									<code className="block rounded bg-secondary/50 p-3 text-xs">
										interface MCPServer &#123;
										<br />
										&nbsp;&nbsp;name: string
										<br />
										&nbsp;&nbsp;version: string
										<br />
										&nbsp;&nbsp;tools: Tool[]
										<br />
										&nbsp;&nbsp;resources: Resource[]
										<br />
										&nbsp;&nbsp;prompts: Prompt[]
										<br />
										&nbsp;&nbsp;onToolCall(name: string, args: any): Promise&lt;any&gt;
										<br />
										&nbsp;&nbsp;onResourceRequest(uri: string): Promise&lt;Resource&gt;
										<br />
										&#125;
									</code>
								</div>
								<div className="rounded-md bg-blue-50 p-4 dark:bg-blue-900/10">
									<h4 className="mb-2 flex items-center text-sm font-bold">
										<FileText className="mr-2 h-4 w-4" />
										Example: Custom Database MCP Server
									</h4>
									<code className="block rounded bg-white p-3 text-xs dark:bg-slate-900">
										const dbServer: MCPServer = &#123;
										<br />
										&nbsp;&nbsp;name: &quot;database-connector&quot;,
										<br />
										&nbsp;&nbsp;version: &quot;1.0.0&quot;,
										<br />
										&nbsp;&nbsp;tools: [
										<br />
										&nbsp;&nbsp;&nbsp;&nbsp;&#123;
										<br />
										&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;name: &quot;query_db&quot;,
										<br />
										&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;description: &quot;Execute SQL query&quot;,
										<br />
										&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;parameters: &#123; query: &quot;string&quot;
										&#125;
										<br />
										&nbsp;&nbsp;&nbsp;&nbsp;&#125;
										<br />
										&nbsp;&nbsp;],
										<br />
										&nbsp;&nbsp;async onToolCall(name, args) &#123;
										<br />
										&nbsp;&nbsp;&nbsp;&nbsp;return await executeQuery(args.query)
										<br />
										&nbsp;&nbsp;&#125;
										<br />
										&#125;
									</code>
								</div>
							</div>
						</div>

						{/* Custom Mode API */}
						<div className="rounded-lg border border-border bg-card p-8 shadow-sm">
							<div className="mb-6 flex items-start justify-between">
								<div>
									<h3 className="mb-2 text-2xl font-bold">Custom Mode Configuration</h3>
									<p className="text-muted-foreground">
										Define custom modes with specialized instructions and tool permissions
									</p>
								</div>
								<Settings className="h-8 w-8 text-blue-500" />
							</div>
							<div className="space-y-4">
								<div className="rounded-md border border-border p-4">
									<h4 className="mb-2 font-mono text-sm font-bold">Mode Schema (.darbotmodes XML)</h4>
									<code className="block rounded bg-secondary/50 p-3 text-xs">
										&lt;mode&gt;
										<br />
										&nbsp;&nbsp;&lt;name&gt;security-auditor&lt;/name&gt;
										<br />
										&nbsp;&nbsp;&lt;slug&gt;security&lt;/slug&gt;
										<br />
										&nbsp;&nbsp;&lt;roleDefinition&gt;
										<br />
										&nbsp;&nbsp;&nbsp;&nbsp;You are a security expert...
										<br />
										&nbsp;&nbsp;&lt;/roleDefinition&gt;
										<br />
										&nbsp;&nbsp;&lt;groups&gt;
										<br />
										&nbsp;&nbsp;&nbsp;&nbsp;&lt;group&gt;read&lt;/group&gt;
										<br />
										&nbsp;&nbsp;&nbsp;&nbsp;&lt;group&gt;mcp&lt;/group&gt;
										<br />
										&nbsp;&nbsp;&lt;/groups&gt;
										<br />
										&nbsp;&nbsp;&lt;fileRegexRestrictions&gt;
										<br />
										&nbsp;&nbsp;&nbsp;&nbsp;&lt;regex&gt;.*\.(js|ts)$&lt;/regex&gt;
										<br />
										&nbsp;&nbsp;&lt;/fileRegexRestrictions&gt;
										<br />
										&lt;/mode&gt;
									</code>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Advanced Topics */}
			<section className="py-16">
				<div className="container mx-auto px-4 sm:px-6 lg:px-8">
					<div className="mb-12 text-center">
						<h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Advanced Topics</h2>
						<p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
							Deep dives into advanced features and use cases
						</p>
					</div>

					<div className="grid gap-6 md:grid-cols-2">
						{/* Topic 1 */}
						<div className="rounded-lg border border-border bg-card p-6 shadow-sm">
							<Zap className="mb-4 h-8 w-8 text-blue-500" />
							<h3 className="mb-3 text-xl font-bold">Workflow Orchestration</h3>
							<p className="mb-4 text-sm text-muted-foreground">
								Build complex multi-agent workflows with task decomposition, parallel execution, and
								dependency management.
							</p>
							<ul className="mb-4 space-y-2 text-sm">
								<li className="flex items-start">
									<ArrowRight className="mr-2 mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
									<span>Define workflow templates</span>
								</li>
								<li className="flex items-start">
									<ArrowRight className="mr-2 mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
									<span>Parallel task execution</span>
								</li>
								<li className="flex items-start">
									<ArrowRight className="mr-2 mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
									<span>Error handling & recovery</span>
								</li>
							</ul>
							<Button size="sm" variant="outline" className="w-full">
								View Workflow Docs
							</Button>
						</div>

						{/* Topic 2 */}
						<div className="rounded-lg border border-border bg-card p-6 shadow-sm">
							<Terminal className="mb-4 h-8 w-8 text-blue-500" />
							<h3 className="mb-3 text-xl font-bold">CLI Integration</h3>
							<p className="mb-4 text-sm text-muted-foreground">
								Use darbot-coder from the command line for automation, CI/CD pipelines, and scripting.
							</p>
							<ul className="mb-4 space-y-2 text-sm">
								<li className="flex items-start">
									<ArrowRight className="mr-2 mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
									<span>CLI commands reference</span>
								</li>
								<li className="flex items-start">
									<ArrowRight className="mr-2 mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
									<span>Scripting with darbot</span>
								</li>
								<li className="flex items-start">
									<ArrowRight className="mr-2 mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
									<span>CI/CD integration</span>
								</li>
							</ul>
							<Button size="sm" variant="outline" className="w-full">
								View CLI Docs
							</Button>
						</div>

						{/* Topic 3 */}
						<div className="rounded-lg border border-border bg-card p-6 shadow-sm">
							<FileCode className="mb-4 h-8 w-8 text-blue-500" />
							<h3 className="mb-3 text-xl font-bold">Custom Tool Development</h3>
							<p className="mb-4 text-sm text-muted-foreground">
								Create custom tools to extend darbot-coder&apos;s capabilities with your own
								integrations and APIs.
							</p>
							<ul className="mb-4 space-y-2 text-sm">
								<li className="flex items-start">
									<ArrowRight className="mr-2 mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
									<span>Tool interface specification</span>
								</li>
								<li className="flex items-start">
									<ArrowRight className="mr-2 mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
									<span>Registration & lifecycle</span>
								</li>
								<li className="flex items-start">
									<ArrowRight className="mr-2 mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
									<span>Best practices & examples</span>
								</li>
							</ul>
							<Button size="sm" variant="outline" className="w-full">
								View Tool Development
							</Button>
						</div>

						{/* Topic 4 */}
						<div className="rounded-lg border border-border bg-card p-6 shadow-sm">
							<GitBranch className="mb-4 h-8 w-8 text-blue-500" />
							<h3 className="mb-3 text-xl font-bold">Multi-Repository Management</h3>
							<p className="mb-4 text-sm text-muted-foreground">
								Work across multiple repositories and codebases with unified context and cross-repo
								refactoring.
							</p>
							<ul className="mb-4 space-y-2 text-sm">
								<li className="flex items-start">
									<ArrowRight className="mr-2 mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
									<span>Cross-repo context</span>
								</li>
								<li className="flex items-start">
									<ArrowRight className="mr-2 mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
									<span>Monorepo support</span>
								</li>
								<li className="flex items-start">
									<ArrowRight className="mr-2 mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
									<span>Dependency tracking</span>
								</li>
							</ul>
							<Button size="sm" variant="outline" className="w-full">
								View Multi-Repo Docs
							</Button>
						</div>
					</div>
				</div>
			</section>

			{/* Code Examples */}
			<section className="bg-secondary/50 py-16">
				<div className="container mx-auto px-4 sm:px-6 lg:px-8">
					<div className="mb-12 text-center">
						<h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Code Examples</h2>
						<p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
							Real-world examples to get you started quickly
						</p>
					</div>

					<div className="grid gap-8 lg:grid-cols-2">
						{/* Example 1 */}
						<div className="rounded-lg border border-border bg-card p-6 shadow-sm">
							<h3 className="mb-4 text-lg font-bold">Creating a Custom MCP Server</h3>
							<div className="rounded-md bg-slate-900 p-4">
								<code className="block text-xs text-green-400">
									<span className="text-purple-400">import</span> &#123; MCPServer &#125;{" "}
									<span className="text-purple-400">from</span>{" "}
									<span className="text-yellow-300">&apos;@darbot-code/mcp&apos;</span>
									<br />
									<br />
									<span className="text-purple-400">const</span> server: MCPServer = &#123;
									<br />
									&nbsp;&nbsp;name: <span className="text-yellow-300">&apos;my-tools&apos;</span>,
									<br />
									&nbsp;&nbsp;version: <span className="text-yellow-300">&apos;1.0.0&apos;</span>,
									<br />
									&nbsp;&nbsp;tools: [&#123;
									<br />
									&nbsp;&nbsp;&nbsp;&nbsp;name:{" "}
									<span className="text-yellow-300">&apos;analyze_code&apos;</span>,
									<br />
									&nbsp;&nbsp;&nbsp;&nbsp;description:{" "}
									<span className="text-yellow-300">&apos;Analyze code quality&apos;</span>,
									<br />
									&nbsp;&nbsp;&nbsp;&nbsp;parameters: &#123;
									<br />
									&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;code: <span className="text-yellow-300">&apos;string&apos;</span>
									<br />
									&nbsp;&nbsp;&nbsp;&nbsp;&#125;
									<br />
									&nbsp;&nbsp;&#125;],
									<br />
									&nbsp;&nbsp;<span className="text-purple-400">async</span> onToolCall(name, args) &#123;
									<br />
									&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-purple-400">return</span>{" "}
									analyzeCode(args.code)
									<br />
									&nbsp;&nbsp;&#125;
									<br />
									&#125;
								</code>
							</div>
						</div>

						{/* Example 2 */}
						<div className="rounded-lg border border-border bg-card p-6 shadow-sm">
							<h3 className="mb-4 text-lg font-bold">Defining a Custom Mode</h3>
							<div className="rounded-md bg-slate-900 p-4">
								<code className="block text-xs text-green-400">
									<span className="text-gray-400">&lt;!-- .darbotmodes/reviewer.xml --&gt;</span>
									<br />
									<span className="text-blue-400">&lt;mode&gt;</span>
									<br />
									&nbsp;&nbsp;<span className="text-blue-400">&lt;name&gt;</span>Code Reviewer
									<span className="text-blue-400">&lt;/name&gt;</span>
									<br />
									&nbsp;&nbsp;<span className="text-blue-400">&lt;slug&gt;</span>reviewer
									<span className="text-blue-400">&lt;/slug&gt;</span>
									<br />
									&nbsp;&nbsp;<span className="text-blue-400">&lt;roleDefinition&gt;</span>
									<br />
									&nbsp;&nbsp;&nbsp;&nbsp;You are an expert code reviewer.
									<br />
									&nbsp;&nbsp;&nbsp;&nbsp;Focus on security, performance,
									<br />
									&nbsp;&nbsp;&nbsp;&nbsp;and best practices.
									<br />
									&nbsp;&nbsp;<span className="text-blue-400">&lt;/roleDefinition&gt;</span>
									<br />
									&nbsp;&nbsp;<span className="text-blue-400">&lt;groups&gt;</span>
									<br />
									&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-blue-400">&lt;group&gt;</span>read
									<span className="text-blue-400">&lt;/group&gt;</span>
									<br />
									&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-blue-400">&lt;group&gt;</span>mcp
									<span className="text-blue-400">&lt;/group&gt;</span>
									<br />
									&nbsp;&nbsp;<span className="text-blue-400">&lt;/groups&gt;</span>
									<br />
									<span className="text-blue-400">&lt;/mode&gt;</span>
								</code>
							</div>
						</div>

						{/* Example 3 */}
						<div className="rounded-lg border border-border bg-card p-6 shadow-sm">
							<h3 className="mb-4 text-lg font-bold">Using the Extension API</h3>
							<div className="rounded-md bg-slate-900 p-4">
								<code className="block text-xs text-green-400">
									<span className="text-purple-400">import</span> * <span className="text-purple-400">as</span>{" "}
									vscode <span className="text-purple-400">from</span>{" "}
									<span className="text-yellow-300">&apos;vscode&apos;</span>
									<br />
									<span className="text-purple-400">import</span> &#123; DarbotAPI &#125;{" "}
									<span className="text-purple-400">from</span>{" "}
									<span className="text-yellow-300">&apos;darbot-coder&apos;</span>
									<br />
									<br />
									<span className="text-gray-400">								<br />
								<br />
								{"// Get the darbot API"}
								<br /></span>
									<br />
									<span className="text-purple-400">const</span> darbot = vscode.extensions
									<br />
									&nbsp;&nbsp;.getExtension(<span className="text-yellow-300">&apos;DarbotLabs.darbot-coder&apos;</span>)
									<br />
									&nbsp;&nbsp;?.exports <span className="text-purple-400">as</span> DarbotAPI
									<br />
									<br />
									<span className="text-gray-400">								<br />
								<br />
								{"// Start a conversation"}
								<br /></span>
									<br />
									darbot.startConversation()
									<br />
									darbot.sendMessage(<span className="text-yellow-300">&apos;Refactor this file&apos;</span>)
								</code>
							</div>
						</div>

						{/* Example 4 */}
						<div className="rounded-lg border border-border bg-card p-6 shadow-sm">
							<h3 className="mb-4 text-lg font-bold">Workflow Template</h3>
							<div className="rounded-md bg-slate-900 p-4">
								<code className="block text-xs text-green-400">
									<span className="text-purple-400">const</span> workflow = &#123;
									<br />
									&nbsp;&nbsp;name: <span className="text-yellow-300">&apos;full-stack-feature&apos;</span>,
									<br />
									&nbsp;&nbsp;agents: [
									<br />
									&nbsp;&nbsp;&nbsp;&nbsp;&#123; role:{" "}
									<span className="text-yellow-300">&apos;architect&apos;</span>, task:{" "}
									<span className="text-yellow-300">&apos;design&apos;</span> &#125;,
									<br />
									&nbsp;&nbsp;&nbsp;&nbsp;&#123; role: <span className="text-yellow-300">&apos;coder&apos;</span>,
									task: <span className="text-yellow-300">&apos;implement&apos;</span> &#125;,
									<br />
									&nbsp;&nbsp;&nbsp;&nbsp;&#123; role: <span className="text-yellow-300">&apos;tester&apos;</span>,
									task: <span className="text-yellow-300">&apos;test&apos;</span> &#125;
									<br />
									&nbsp;&nbsp;],
									<br />
									&nbsp;&nbsp;dependencies: &#123;
									<br />
									&nbsp;&nbsp;&nbsp;&nbsp;implement: [<span className="text-yellow-300">&apos;design&apos;</span>],
									<br />
									&nbsp;&nbsp;&nbsp;&nbsp;test: [<span className="text-yellow-300">&apos;implement&apos;</span>]
									<br />
									&nbsp;&nbsp;&#125;
									<br />
									&#125;
								</code>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Resources & Community */}
			<section className="py-16">
				<div className="container mx-auto px-4 sm:px-6 lg:px-8">
					<div className="mx-auto max-w-3xl text-center">
						<h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">Resources &amp; Community</h2>
						<p className="mb-8 text-lg text-muted-foreground">
							Join our community and explore additional resources to get the most out of darbot-coder
						</p>
						<div className="grid gap-6 sm:grid-cols-3">
							<div className="rounded-lg border border-border bg-card p-6">
								<Book className="mx-auto mb-3 h-10 w-10 text-blue-500" />
								<h3 className="mb-2 text-lg font-bold">GitHub Docs</h3>
								<p className="mb-4 text-sm text-muted-foreground">
									In-depth guides and tutorials
								</p>
								<Button size="sm" variant="outline" asChild className="w-full">
									<a href={EXTERNAL_LINKS.GITHUB} target="_blank" rel="noopener noreferrer">
										View Docs
									</a>
								</Button>
							</div>
							<div className="rounded-lg border border-border bg-card p-6">
								<Terminal className="mx-auto mb-3 h-10 w-10 text-blue-500" />
								<h3 className="mb-2 text-lg font-bold">Discord Community</h3>
								<p className="mb-4 text-sm text-muted-foreground">Get help and share ideas</p>
								<Button size="sm" variant="outline" asChild className="w-full">
									<a href={EXTERNAL_LINKS.DISCORD} target="_blank" rel="noopener noreferrer">
										Join Discord
									</a>
								</Button>
							</div>
							<div className="rounded-lg border border-border bg-card p-6">
								<FileText className="mx-auto mb-3 h-10 w-10 text-blue-500" />
								<h3 className="mb-2 text-lg font-bold">Video Tutorials</h3>
								<p className="mb-4 text-sm text-muted-foreground">Learn with video guides</p>
								<Button size="sm" variant="outline" asChild className="w-full">
									<a href={EXTERNAL_LINKS.YOUTUBE} target="_blank" rel="noopener noreferrer">
										Watch Videos
									</a>
								</Button>
							</div>
						</div>
						<div className="mt-8">
							<Button size="lg" asChild>
								<a href={EXTERNAL_LINKS.COMMUNITY} target="_blank" rel="noopener noreferrer">
									Join the Community Discussion
								</a>
							</Button>
						</div>
					</div>
				</div>
			</section>
		</>
	)
}
