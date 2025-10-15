import { memo, useMemo } from "react"
import { Brain, Clock, DollarSign, Lightbulb, Sparkles, Tag } from "lucide-react"

import type { SerializedAgentSuggestion, SerializedMemlmContext } from "@darbot/ExtensionMessage"

import { Badge } from "@/components/ui/badge"
import { useAppTranslation } from "@/i18n/TranslationContext"

interface MemlmInsightsProps {
	context?: SerializedMemlmContext
	agentSuggestion?: SerializedAgentSuggestion
}

// MEMLM confidence values arrive as 0-1 decimals; clamp to a display-ready percentage.
const clampPercent = (value?: number | null) => {
	if (typeof value !== "number" || Number.isNaN(value)) {
		return undefined
	}

	const clamped = Math.min(Math.max(value, 0), value > 1 ? value : 1)
	return Math.round(clamped * 100)
}

// Provide a compact human readable estimate for cost projections.
const formatCurrency = (value?: number | null) => {
	if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
		return undefined
	}

	if (value >= 100) {
		return `~$${value.toFixed(0)}`
	}

	if (value >= 10) {
		return `~$${value.toFixed(1)}`
	}

	return `~$${value.toFixed(2)}`
}

// Estimated durations are expressed in minutes; round while keeping a sensible minimum.
const formatMinutes = (value?: number | null) => {
	if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
		return undefined
	}

	return Math.max(1, Math.round(value))
}

const MemlmInsights = memo(({ context, agentSuggestion }: MemlmInsightsProps) => {
	const { t } = useAppTranslation()

	const hasContext = Boolean(context && (context.summary || context.keywords?.length || context.relatedMemories?.length))
	const hasSuggestion = Boolean(agentSuggestion)

	const keywords = useMemo(() => context?.keywords ?? [], [context?.keywords])
	const signals = useMemo(() => context?.signals ?? [], [context?.signals])

	const recommendedAgents = useMemo(() => context?.recommendedAgents ?? [], [context?.recommendedAgents])
	const relatedMemories = useMemo(() => context?.relatedMemories ?? [], [context?.relatedMemories])

	if (!hasContext && !hasSuggestion) {
		return null
	}

	const suggestionConfidence = clampPercent(agentSuggestion?.confidence)
	const formattedCost = formatCurrency(agentSuggestion?.estimatedCost)
	const formattedTime = formatMinutes(agentSuggestion?.estimatedTime)

	return (
		<div className="px-3">
			<div className="border border-vscode-panel-border bg-[color-mix(in_srgb,var(--vscode-sideBar-background)_85%,var(--vscode-editor-background))] rounded-xs p-2.5 flex flex-col gap-2.5">
				<div className="flex items-center justify-between gap-2">
					<span className="flex items-center gap-1 font-semibold text-vscode-foreground text-sm">
						<Brain size={16} className="text-[color-mix(in_srgb,var(--vscode-textLink-foreground)_80%,var(--vscode-foreground))]" />
						{t("chat:memlm.heading", { defaultValue: "Task Insights" })}
					</span>
					{(keywords.length > 0 || signals.length > 0) && (
						<span className="text-[10px] uppercase tracking-[0.08em] text-vscode-descriptionForeground">
							{t("chat:memlm.live", { defaultValue: "Live" })}
						</span>
					)}
				</div>

				{hasSuggestion && agentSuggestion && (
					<div className="rounded-xs border border-vscode-panel-border/70 bg-[color-mix(in_srgb,var(--vscode-input-background)_82%,var(--vscode-dropdown-background))] p-2 flex flex-col gap-1.5" data-testid="memlm-agent-suggestion">
						<div className="flex items-center justify-between gap-2">
							<div className="flex items-center gap-1.5">
								<Sparkles size={16} className="text-[color-mix(in_srgb,var(--vscode-textLink-foreground)_80%,var(--vscode-foreground))]" />
								<span className="text-xs font-semibold text-vscode-foreground/90">
									{t("chat:memlm.agent.title", { defaultValue: "Suggested Agent" })}
								</span>
							</div>
							<Badge variant="outline" className="text-[11px] uppercase tracking-wide px-2 py-[2px]">
								{agentSuggestion.slug}
							</Badge>
						</div>

						{agentSuggestion.reasoning && (
							<p className="text-xs leading-snug text-vscode-descriptionForeground">
								{agentSuggestion.reasoning}
							</p>
						)}

						<div className="flex flex-wrap items-center gap-2 text-[11px] text-vscode-descriptionForeground">
							{typeof suggestionConfidence === "number" && (
								<span className="flex items-center gap-1">
									<Lightbulb size={14} />
									{t("chat:memlm.agent.confidence", {
										defaultValue: "Confidence: {{value}}%",
										value: suggestionConfidence,
									})}
								</span>
							)}
							{formattedCost && (
								<span className="flex items-center gap-1">
									<DollarSign size={14} />
									{t("chat:memlm.agent.cost", {
										defaultValue: "Est. cost {{value}}",
										value: formattedCost,
									})}
								</span>
							)}
							{typeof formattedTime === "number" && (
								<span className="flex items-center gap-1">
									<Clock size={14} />
									{t("chat:memlm.agent.time", {
										defaultValue: "Est. time ~{{value}} min",
										value: formattedTime,
									})}
								</span>
							)}
						</div>
					</div>
				)}

				{hasContext && context?.summary && (
					<div className="text-sm text-vscode-foreground/90" data-testid="memlm-summary">
						{context.summary}
					</div>
				)}

				{keywords.length > 0 && (
					<div className="flex flex-col gap-1" data-testid="memlm-keywords">
						<span className="text-[11px] uppercase tracking-[0.08em] text-vscode-descriptionForeground flex items-center gap-1">
							<Tag size={12} />
							{t("chat:memlm.keywords", { defaultValue: "Keywords" })}
						</span>
						<div className="flex flex-wrap gap-1.5">
							{keywords.map((keyword) => (
								<Badge
									variant="outline"
									key={keyword}
									className="px-2 py-[1px] text-[11px] text-vscode-descriptionForeground bg-[color-mix(in_srgb,var(--vscode-input-background)_75%,transparent)]">
									{keyword}
								</Badge>
							))}
						</div>
					</div>
				)}

				{signals.length > 0 && (
					<div className="flex flex-col gap-1" data-testid="memlm-signals">
						<span className="text-[11px] uppercase tracking-[0.08em] text-vscode-descriptionForeground">
							{t("chat:memlm.signals", { defaultValue: "Signals" })}
						</span>
						<div className="flex flex-wrap gap-1.5">
							{signals.map((signal) => (
								<Badge
									variant="outline"
									key={signal}
									className="px-2 py-[1px] text-[11px] text-vscode-descriptionForeground bg-[color-mix(in_srgb,var(--vscode-input-background)_70%,transparent)]">
									{signal}
								</Badge>
							))}
						</div>
					</div>
				)}

				{recommendedAgents.length > 0 && (
					<div className="flex flex-col gap-1" data-testid="memlm-recommended-agents">
						<span className="text-[11px] uppercase tracking-[0.08em] text-vscode-descriptionForeground">
							{t("chat:memlm.recommendedAgents", { defaultValue: "Recommended agents" })}
						</span>
						<div className="flex flex-col gap-1.5">
							{recommendedAgents.map((agent) => {
								const agentConfidence = clampPercent(agent.confidence)
								return (
									<div
										key={`${agent.slug}-${agent.reason}`}
										className="rounded-xs border border-vscode-panel-border/60 bg-[color-mix(in_srgb,var(--vscode-sideBar-background)_88%,var(--vscode-editor-background))] p-2 flex flex-col gap-1">
										<div className="flex items-center justify-between gap-2">
											<div className="flex items-center gap-1.5">
												<Badge variant="outline" className="px-2 py-[2px] text-[11px] uppercase tracking-wide">
													{agent.slug}
												</Badge>
												{typeof agentConfidence === "number" && (
													<span className="text-[11px] text-vscode-descriptionForeground">
														{t("chat:memlm.confidence", {
															defaultValue: "{{value}}% confidence",
															value: agentConfidence,
														})}
													</span>
												)}
											</div>
											{agent.signals?.length > 0 && (
												<div className="flex flex-wrap gap-1">
													{agent.signals.slice(0, 6).map((signal) => (
														<Badge
															variant="outline"
															key={`${agent.slug}-${signal}`}
															className="px-2 py-[1px] text-[11px] text-vscode-descriptionForeground bg-[color-mix(in_srgb,var(--vscode-input-background)_70%,transparent)]">
															{signal}
														</Badge>
													))}
												</div>
											)}
										</div>
										{agent.reason && (
											<p className="text-[11px] leading-snug text-vscode-descriptionForeground">
												{agent.reason}
											</p>
										)}
									</div>
								)
							})}
						</div>
					</div>
				)}

				{relatedMemories.length > 0 && (
					<div className="flex flex-col gap-1" data-testid="memlm-related-memories">
						<span className="text-[11px] uppercase tracking-[0.08em] text-vscode-descriptionForeground">
							{t("chat:memlm.relatedMemories", { defaultValue: "Related memories" })}
						</span>
						<div className="flex flex-col gap-1.5">
							{relatedMemories.map((memory) => {
								const relevance = clampPercent(memory.relevance)
								return (
									<div key={memory.id} className="rounded-xs border border-vscode-panel-border/60 px-2 py-1.5 bg-[color-mix(in_srgb,var(--vscode-input-background)_85%,var(--vscode-editor-background))]">
										<div className="flex items-center justify-between gap-2">
											<span className="text-xs font-medium text-vscode-foreground/90 line-clamp-2">
												{memory.summary || t("chat:memlm.memoryFallback", { defaultValue: "Previous task insight" })}
											</span>
											{typeof relevance === "number" && (
												<span className="text-[11px] text-vscode-descriptionForeground">
													{t("chat:memlm.relevance", {
														defaultValue: "{{value}}% relevant",
														value: relevance,
													})}
												</span>
											)}
										</div>
										{memory.agentSlug && (
											<Badge variant="outline" className="mt-1 px-2 py-[1px] text-[11px] uppercase tracking-wide">
												{memory.agentSlug}
											</Badge>
										)}
									</div>
								)
							})}
						</div>
					</div>
				)}
			</div>
		</div>
	)
})

MemlmInsights.displayName = "MemlmInsights"

export { MemlmInsights }

export default MemlmInsights
