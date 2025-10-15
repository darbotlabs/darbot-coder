import crypto from "crypto"
import { logger } from "../../utils/logging"

export interface MemlmOptions {
	sessionRetention: number
	projectRetention: number
	longTermRetention: number
	importanceThreshold: number
}

export interface MementoLike {
	get<T>(key: string, defaultValue?: T): T | undefined
	update(key: string, value: any): Thenable<void>
}

export interface MemlmEngineDependencies {
	globalState: MementoLike
	workspaceState: MementoLike
}

export interface MemlmMemoryRecord {
	id: string
	agentSlug?: string
	summary: string
	detail: string
	tags: string[]
	signals: string[]
	importance: number
	createdAt: number
	updatedAt: number
	lastAccessedAt: number
	successes: number
	retries: number
}

export interface MemlmRelatedMemory extends MemlmMemoryRecord {
	score: number
	relevance: number
}

export interface MemlmAgentRecommendation {
	slug: string
	confidence: number
	reason: string
	signals: string[]
}

export interface MemlmTaskContext {
	traceId: string
	keywords: string[]
	relatedMemories: MemlmRelatedMemory[]
	recommendedAgents: MemlmAgentRecommendation[]
	summary: string
	signals: string[]
}

export interface MemlmExecutionStepLog {
	executionId: string
	stepId: string
	agentSlug: string
	action: string
	success: boolean
	cost?: number
	order: number
	keywords: string[]
	outputSummary?: string
	signals?: string[]
}

export interface MemlmExecutionSummary {
	executionId: string
	success: boolean
	userRequest: string
	analysisSummary: string
	recommendations: string[]
	errors: string[]
}

const PROJECT_STATE_KEY = "memlm.project.records"
const LONG_TERM_STATE_KEY = "memlm.longTerm.records"

const DEFAULT_OPTIONS: MemlmOptions = {
	sessionRetention: 25,
	projectRetention: 200,
	longTermRetention: 500,
	importanceThreshold: 0.35,
}

export class MemlmEngine {
	private readonly options: MemlmOptions
	private readonly globalState: MementoLike
	private readonly workspaceState: MementoLike

	private sessionRecords: Map<string, MemlmMemoryRecord[]> = new Map()
	private projectRecords: MemlmMemoryRecord[] = []
	private longTermRecords: MemlmMemoryRecord[] = []

	private isInitialized = false

	constructor({ globalState, workspaceState }: MemlmEngineDependencies, options?: Partial<MemlmOptions>) {
		this.globalState = globalState
		this.workspaceState = workspaceState
		this.options = { ...DEFAULT_OPTIONS, ...options }
	}

	public async initialize(): Promise<void> {
		if (this.isInitialized) {
			return
		}

		try {
			await Promise.all([
				this.loadProjectRecords(),
				this.loadLongTermRecords(),
			])
			this.isInitialized = true
			logger.info("MEMLM engine initialised", {
				projectRecords: this.projectRecords.length,
				longTermRecords: this.longTermRecords.length,
			})
		} catch (error) {
			logger.error("Failed to initialise MEMLM engine", { error })
		}
	}

	public async getTaskContext(userRequest: string, metadata?: Record<string, any>): Promise<MemlmTaskContext> {
		await this.ensureInitialised()

		const keywords = this.extractKeywords(userRequest, metadata)
		const allRecords = this.collectRecords()
		const ranked = this.rankRecords(keywords, allRecords)
		const recommendedAgents = this.buildAgentRecommendations(ranked)
		const signals = this.buildSignals(ranked, metadata)

		return {
			traceId: crypto.randomUUID(),
			keywords,
			relatedMemories: ranked,
			recommendedAgents,
			summary: this.composeContextSummary(keywords, ranked, recommendedAgents),
			signals,
		}
	}

	public async recordExecutionStep(log: MemlmExecutionStepLog): Promise<void> {
		await this.ensureInitialised()

		const record: MemlmMemoryRecord = {
			id: `${log.executionId}:${log.stepId}`,
			agentSlug: log.agentSlug,
			summary: `${log.agentSlug} handled ${log.action}`,
			detail: this.composeDetail(log),
			tags: Array.from(new Set([...log.keywords, log.agentSlug])),
			signals: log.signals ?? [],
			importance: this.deriveImportance(log),
			createdAt: Date.now(),
			updatedAt: Date.now(),
			lastAccessedAt: Date.now(),
			successes: log.success ? 1 : 0,
			retries: log.success ? 0 : 1,
		}

		const session = this.sessionRecords.get(log.executionId) ?? []
		session.push(record)
		this.sessionRecords.set(log.executionId, session.slice(-this.options.sessionRetention))

		this.upsertProjectRecord(record)
		await this.persistProjectRecords()
	}

	public async finalizeExecution(summary: MemlmExecutionSummary): Promise<void> {
		await this.ensureInitialised()

		const sessionRecords = this.sessionRecords.get(summary.executionId) ?? []
		const combinedSignals = Array.from(new Set(sessionRecords.flatMap((record) => record.signals)))

		const record: MemlmMemoryRecord = {
			id: `summary:${summary.executionId}`,
			summary: `Task ${summary.executionId} ${summary.success ? "completed" : "failed"}`,
			detail: this.composeSummaryDetail(summary, sessionRecords),
			tags: this.extractKeywords(summary.userRequest),
			signals: combinedSignals,
			importance: summary.success ? 0.6 : 0.4,
			createdAt: Date.now(),
			updatedAt: Date.now(),
			lastAccessedAt: Date.now(),
			successes: summary.success ? 1 : 0,
			retries: summary.success ? 0 : 1,
		}

		this.longTermRecords.unshift(record)
		this.longTermRecords = this.longTermRecords.slice(0, this.options.longTermRetention)
		await this.persistLongTermRecords()
		this.sessionRecords.delete(summary.executionId)
	}

	private async ensureInitialised(): Promise<void> {
		if (!this.isInitialized) {
			await this.initialize()
		}
	}

	private collectRecords(): MemlmMemoryRecord[] {
		return [
			...this.projectRecords,
			...this.longTermRecords,
			...Array.from(this.sessionRecords.values()).flat(),
		]
	}

	private rankRecords(keywords: string[], records: MemlmMemoryRecord[]): MemlmRelatedMemory[] {
		const matches = records
			.map((record) => ({
				record,
				score: this.scoreRecord(record, keywords),
			}))
			.filter(({ score }) => score > 0)
			.sort((a, b) => b.score - a.score)
			.slice(0, this.options.sessionRetention)

		return matches.map(({ record, score }) => ({
			...record,
			score,
			relevance: Math.round(Math.min(1, score) * 100) / 100,
		}))
	}

	private buildAgentRecommendations(records: MemlmRelatedMemory[]): MemlmAgentRecommendation[] {
		const aggregate = new Map<string, { score: number; reasons: string[]; signals: Set<string> }>()

		for (const record of records) {
			if (!record.agentSlug) {
				continue
			}

			const entry = aggregate.get(record.agentSlug) ?? {
				score: 0,
				reasons: [],
				signals: new Set<string>(),
			}

			entry.score += record.score + record.importance
			if (record.summary) {
				entry.reasons.push(record.summary)
			}
			for (const signal of record.signals) {
				entry.signals.add(signal)
			}

			aggregate.set(record.agentSlug, entry)
		}

		const maxScore = Math.max(...Array.from(aggregate.values()).map(({ score }) => score), 1)

		return Array.from(aggregate.entries())
			.map(([slug, { score, reasons, signals }]) => ({
				slug,
				confidence: Math.round(Math.min(0.95, 0.3 + (score / maxScore) * 0.7) * 100) / 100,
				reason: reasons.join("; ") || `Historical performance for ${slug}`,
				signals: Array.from(signals),
			}))
	}

	private buildSignals(records: MemlmRelatedMemory[], metadata?: Record<string, any>): string[] {
		const signals = new Set<string>()
		for (const record of records) {
			for (const signal of record.signals) {
				signals.add(signal)
			}
		}

		if (metadata?.contextSignals && Array.isArray(metadata.contextSignals)) {
			for (const signal of metadata.contextSignals) {
				signals.add(signal)
			}
		}

		return Array.from(signals)
	}

	private composeContextSummary(
		keywords: string[],
		records: MemlmRelatedMemory[],
		agents: MemlmAgentRecommendation[],
	): string {
		const topMemories = records.slice(0, 3).map((record) => record.summary)
		const agentHints = agents.map((agent) => `${agent.slug} (${Math.round(agent.confidence * 100)}%)`)

		const parts: string[] = []
		if (keywords.length > 0) {
			parts.push(`keywords: ${keywords.slice(0, 8).join(", ")}`)
		}
		if (topMemories.length > 0) {
			parts.push(`context: ${topMemories.join(" | ")}`)
		}
		if (agentHints.length > 0) {
			parts.push(`agents: ${agentHints.join(", ")}`)
		}

		return parts.join("; ")
	}

	private composeDetail(log: MemlmExecutionStepLog): string {
		const fragments = [
			`Step ${log.order + 1}: ${log.action}`,
			log.success ? "Outcome: success" : "Outcome: retry",
		]
		if (typeof log.cost === "number") {
			fragments.push(`Cost: ${log.cost.toFixed(4)} tokens`)
		}
		if (log.outputSummary) {
			fragments.push(`Summary: ${log.outputSummary}`)
		}

		return fragments.join(" | ")
	}

	private composeSummaryDetail(summary: MemlmExecutionSummary, steps: MemlmMemoryRecord[]): string {
		const lines: string[] = []
		lines.push(`Request: ${summary.userRequest}`)
		lines.push(`Outcome: ${summary.success ? "success" : "failure"}`)
		if (summary.recommendations.length > 0) {
			lines.push(`Recommendations: ${summary.recommendations.join("; ")}`)
		}
		if (summary.errors.length > 0) {
			lines.push(`Errors: ${summary.errors.join("; ")}`)
		}
		if (steps.length > 0) {
			lines.push(`Key steps: ${steps.slice(0, 3).map((step) => step.summary).join(" | ")}`)
		}
		return lines.join("\n")
	}

	private extractKeywords(input: string, metadata?: Record<string, any>): string[] {
		const base = input
			.toLowerCase()
			.replace(/[^a-z0-9_\-\s]/g, " ")
			.split(/[\s_\-]+/g)
			.filter((token) => token.length > 2)

		const extras = metadata?.keywords && Array.isArray(metadata.keywords)
			? metadata.keywords.map((token: unknown) => String(token).toLowerCase())
			: []

		return Array.from(new Set([...base.slice(0, 32), ...extras])).slice(0, 40)
	}

	private scoreRecord(record: MemlmMemoryRecord, keywords: string[]): number {
		if (keywords.length === 0) {
			return record.importance
		}

		const keywordSet = new Set(keywords)
		let score = 0

		for (const tag of record.tags) {
			if (keywordSet.has(tag)) {
				score += 0.5
			}
		}

		if (record.summary) {
			const summaryTokens = this.extractKeywords(record.summary)
			for (const token of summaryTokens) {
				if (keywordSet.has(token)) {
					score += 0.25
				}
			}
		}

		return score + record.importance
	}

	private deriveImportance(log: MemlmExecutionStepLog): number {
		let importance = 0.3
		if (!log.success) {
			importance += 0.2
		}
		if ((log.outputSummary ?? "").length > 60) {
			importance += 0.1
		}
		if (log.cost && log.cost > 0.2) {
			importance += 0.1
		}
		return Math.min(1, importance)
	}

	private upsertProjectRecord(record: MemlmMemoryRecord): void {
		const existingIndex = this.projectRecords.findIndex((item) => item.id === record.id)
		if (existingIndex >= 0) {
			this.projectRecords[existingIndex] = { ...record }
		} else {
			this.projectRecords.unshift({ ...record })
		}

		this.projectRecords = this.projectRecords.slice(0, this.options.projectRetention)
	}

	private async loadProjectRecords(): Promise<void> {
		const stored = this.workspaceState.get<MemlmMemoryRecord[]>(PROJECT_STATE_KEY, [])
		if (Array.isArray(stored)) {
			this.projectRecords = stored
		}
	}

	private async loadLongTermRecords(): Promise<void> {
		const stored = this.globalState.get<MemlmMemoryRecord[]>(LONG_TERM_STATE_KEY, [])
		if (Array.isArray(stored)) {
			this.longTermRecords = stored
		}
	}

	private async persistProjectRecords(): Promise<void> {
		try {
			await this.workspaceState.update(PROJECT_STATE_KEY, this.projectRecords)
		} catch (error) {
			logger.warn("Failed to persist MEMLM project records", { error })
		}
	}

	private async persistLongTermRecords(): Promise<void> {
		try {
			await this.globalState.update(LONG_TERM_STATE_KEY, this.longTermRecords)
		} catch (error) {
			logger.warn("Failed to persist MEMLM long term records", { error })
		}
	}
}
