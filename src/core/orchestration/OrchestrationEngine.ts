import * as vscode from "vscode"
import { type ModeConfig, type DarbotMessage, type ProviderSettings } from "@darbot-code/types"
import { Task } from "../task/Task"
import { CustomModesManager } from "../config/CustomModesManager"
import { logger } from "../../utils/logging"
import crypto from "crypto"
import { MemlmEngine, type MemlmTaskContext, type MemlmAgentRecommendation, type MemlmExecutionStepLog, type MemlmExecutionSummary } from "../memory/MemlmEngine"
/**
 * Agent capability definitions for intelligent orchestration
 */
export interface AgentCapability {
	slug: string
	name: string
	primaryFunctions: string[]
	complexity: 'low' | 'medium' | 'high'
	costLevel: 'efficient' | 'balanced' | 'premium'
	executionType: 'sequential' | 'parallel' | 'background'
	dependencies: string[]
	constraints: {
		maxConcurrency?: number
		timeoutMinutes?: number
		retryCount?: number
	}
}

/**
 * Task analysis result for intelligent agent selection
 */
export interface TaskAnalysis {
	complexity: 'simple' | 'medium' | 'complex' | 'enterprise'
	primaryDomains: string[]
	estimatedEffort: number
	parallelizable: boolean
	requiredCapabilities: string[]
	suggestedAgents: AgentSelection[]
	executionPlan: ExecutionStep[]
	memoryContext: MemlmTaskContext
}

/**
 * Agent selection with reasoning
 */
export interface AgentSelection {
	slug: string
	confidence: number
	reasoning: string
	estimatedCost: number
	estimatedTime: number
}

/**
 * Execution step in the orchestration plan
 */
export interface ExecutionStep {
	stepId: string
	agentSlug: string
	action: string
	dependencies: string[]
	parallel: boolean
	inputs: Record<string, any>
	expectedOutputs: string[]
}

interface StepExecutionResult {
	success: boolean
	cost?: number
	outputSummary?: string
	signals?: string[]
	error?: string
}

/**
 * Orchestration result with performance metrics
 */
export interface OrchestrationResult {
	success: boolean
	taskId: string
	executedSteps: ExecutionStep[]
	totalCost: number
	totalTime: number
	qualityScore: number
	errors: string[]
	recommendations: string[]
	memoryContext: MemlmTaskContext
}

/**
 * Core orchestration engine that provides intelligent agent selection,
 * task distribution, and coordination for the darbot-coder platform
 */
export class OrchestrationEngine {
	private capabilities: Map<string, AgentCapability> = new Map()
	private activeExecutions: Map<string, ExecutionStep[]> = new Map()

	constructor(
		private readonly customModesManager: CustomModesManager,
		private readonly context: vscode.ExtensionContext,
		private readonly memlm: MemlmEngine
	) {
		this.initializeAgentCapabilities()
	}

	/**
	 * Initialize agent capabilities based on available modes
	 */
	private async initializeAgentCapabilities(): Promise<void> {
		// Define core agent capabilities
		const coreCapabilities: AgentCapability[] = [
			{
				slug: 'architect',
				name: 'System Architect',
				primaryFunctions: ['system_design', 'architecture_planning', 'technical_leadership'],
				complexity: 'high',
				costLevel: 'premium',
				executionType: 'sequential',
				dependencies: [],
				constraints: { maxConcurrency: 1, timeoutMinutes: 30 }
			},
			{
				slug: 'coder',
				name: 'Code Implementation Specialist',
				primaryFunctions: ['code_generation', 'implementation', 'refactoring'],
				complexity: 'medium',
				costLevel: 'balanced',
				executionType: 'parallel',
				dependencies: ['architect'],
				constraints: { maxConcurrency: 3, timeoutMinutes: 20 }
			},
			{
				slug: 'tester',
				name: 'Quality Assurance Engineer',
				primaryFunctions: ['test_creation', 'validation', 'quality_control'],
				complexity: 'medium',
				costLevel: 'efficient',
				executionType: 'parallel',
				dependencies: ['coder'],
				constraints: { maxConcurrency: 2, timeoutMinutes: 15 }
			},
			{
				slug: 'security',
				name: 'Security Analyst',
				primaryFunctions: ['security_review', 'vulnerability_analysis', 'compliance'],
				complexity: 'high',
				costLevel: 'premium',
				executionType: 'background',
				dependencies: ['coder'],
				constraints: { maxConcurrency: 1, timeoutMinutes: 25 }
			},
			{
				slug: 'docs',
				name: 'Documentation Specialist',
				primaryFunctions: ['documentation', 'user_guides', 'api_docs'],
				complexity: 'low',
				costLevel: 'efficient',
				executionType: 'parallel',
				dependencies: ['coder'],
				constraints: { maxConcurrency: 2, timeoutMinutes: 10 }
			}
		]

		// Store capabilities
		for (const capability of coreCapabilities) {
			this.capabilities.set(capability.slug, capability)
		}

		// Enhance with custom modes
		await this.loadCustomModeCapabilities()

		logger.info('OrchestrationEngine initialized with capabilities', {
			capabilities: Array.from(this.capabilities.keys())
		})
	}

	/**
	 * Load and enhance capabilities from custom modes
	 */
	private async loadCustomModeCapabilities(): Promise<void> {
		try {
			const customModes = await this.customModesManager.getCustomModes()
			
			for (const mode of customModes) {
				if (!this.capabilities.has(mode.slug)) {
					// Create capability from custom mode
					const capability: AgentCapability = {
						slug: mode.slug,
						name: mode.name,
						primaryFunctions: this.inferFunctionsFromMode(mode),
						complexity: this.inferComplexityFromMode(mode),
						costLevel: 'balanced',
						executionType: 'sequential',
						dependencies: [],
						constraints: { maxConcurrency: 1, timeoutMinutes: 20 }
					}
					
					this.capabilities.set(mode.slug, capability)
				}
			}
		} catch (error) {
			logger.error('Failed to load custom mode capabilities', { error })
		}
	}

	/**
	 * Analyze a task to determine optimal orchestration strategy
	 */
	public async analyzeTask(userRequest: string, context?: Record<string, any>): Promise<TaskAnalysis> {
		logger.info('Analyzing task for orchestration', { request: userRequest.substring(0, 100) })

		// Task complexity analysis
		const complexity = this.assessComplexity(userRequest)
		const primaryDomains = this.identifyDomains(userRequest)
		const parallelizable = this.assessParallelizability(userRequest)
		const requiredCapabilities = this.identifyRequiredCapabilities(userRequest, primaryDomains)

		const memoryMetadata = { ...(context ?? {}), keywords: primaryDomains }
		const memoryContext = await this.memlm.getTaskContext(userRequest, memoryMetadata)

		// Agent selection
		let suggestedAgents = this.selectOptimalAgents(requiredCapabilities, complexity)
		if (memoryContext.recommendedAgents.length > 0) {
			suggestedAgents = this.mergeAgentRecommendations(suggestedAgents, memoryContext.recommendedAgents, complexity)
		}
		
		// Execution planning
		const executionPlan = this.createExecutionPlan(suggestedAgents, parallelizable)

		const analysis: TaskAnalysis = {
			complexity,
			primaryDomains,
			estimatedEffort: this.estimateEffort(complexity, primaryDomains.length),
			parallelizable,
			requiredCapabilities,
			suggestedAgents,
			executionPlan,
			memoryContext
		}

		logger.info('Task analysis completed', {
			complexity,
			domains: primaryDomains,
			agents: suggestedAgents.length,
			steps: executionPlan.length,
			memorySignals: memoryContext.signals
		})

		return analysis
	}

	/**
	 * Execute orchestrated task with multiple agents
	 */
	public async executeOrchestration(
		analysis: TaskAnalysis,
		userRequest: string,
		providerSettings: ProviderSettings,
		taskId?: string
	): Promise<OrchestrationResult> {
		const executionId = taskId || crypto.randomUUID()
		const startTime = Date.now()

		logger.info('Starting orchestrated execution', {
			taskId: executionId,
			agents: analysis.suggestedAgents.length,
			steps: analysis.executionPlan.length,
			memorySignals: analysis.memoryContext.signals
		})

		let totalCost = 0
		const executedSteps: ExecutionStep[] = []
		const errors: string[] = []
		const recommendations: string[] = []
		let orchestrationResult: OrchestrationResult | null = null

		try {
			this.activeExecutions.set(executionId, analysis.executionPlan)

			for (const step of analysis.executionPlan) {
				try {
					const stepResult = await this.executeStep(step, userRequest, providerSettings)
					executedSteps.push(step)
					totalCost += stepResult.cost ?? 0

					const stepLog: MemlmExecutionStepLog = {
						executionId,
						stepId: step.stepId,
						agentSlug: step.agentSlug,
						action: step.action,
						success: stepResult.success,
						cost: stepResult.cost,
						order: executedSteps.length - 1,
						keywords: this.deriveStepKeywords(step, userRequest),
						outputSummary: stepResult.outputSummary,
						signals: stepResult.signals,
					}

					await this.safeRecordStep(stepLog)

					if (stepResult.success) {
						logger.info(`Step ${step.stepId} completed successfully`, { agentSlug: step.agentSlug })
					} else {
						const errorMessage = stepResult.error ?? `Step ${step.stepId} reported failure`
						errors.push(errorMessage)
						logger.error(`Step ${step.stepId} failed`, { error: errorMessage })
					}

				} catch (stepError) {
					const errorMessage = stepError instanceof Error ? stepError.message : String(stepError)
					errors.push(`Step ${step.stepId} encountered error: ${errorMessage}`)
					logger.error('Step execution failed', { stepId: step.stepId, error: errorMessage })
				}
			}

			const qualityScore = executedSteps.length === 0 ? 0 : this.calculateQualityScore(executedSteps, errors)
			recommendations.push(...this.generateRecommendations(analysis, executedSteps, errors))

			orchestrationResult = {
				success: errors.length === 0,
				taskId: executionId,
				executedSteps,
				totalCost,
				totalTime: Date.now() - startTime,
				qualityScore,
				errors,
				recommendations,
				memoryContext: analysis.memoryContext
			}

			logger.info('Orchestration completed', {
				taskId: executionId,
				success: orchestrationResult.success,
				steps: executedSteps.length,
				cost: totalCost,
				time: orchestrationResult.totalTime,
				quality: orchestrationResult.qualityScore
			})

		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : String(error)
			errors.push(errorMessage)
			const qualityScore = executedSteps.length === 0 ? 0 : this.calculateQualityScore(executedSteps, errors)
			recommendations.push(...this.generateRecommendations(analysis, executedSteps, errors))
			orchestrationResult = {
				success: false,
				taskId: executionId,
				executedSteps,
				totalCost,
				totalTime: Date.now() - startTime,
				qualityScore,
				errors,
				recommendations,
				memoryContext: analysis.memoryContext
			}
			logger.error('Orchestration failed', { taskId: executionId, error: errorMessage })
		} finally {
			try {
				await this.finalizeMemlm(executionId, analysis, orchestrationResult, errors, recommendations, userRequest)
			} catch (memError) {
				const message = memError instanceof Error ? memError.message : String(memError)
				logger.warn('Failed to persist MEMLM summary', { error: message })
			}
			this.activeExecutions.delete(executionId)
		}

		if (!orchestrationResult) {
			orchestrationResult = {
				success: false,
				taskId: executionId,
				executedSteps,
				totalCost,
				totalTime: Date.now() - startTime,
				qualityScore: 0,
				errors: errors.length ? errors : ['Unknown orchestration outcome'],
				recommendations,
				memoryContext: analysis.memoryContext
			}
		}

		return orchestrationResult
	}
	/**
	 * Get intelligent agent suggestion for a user request
	 */
	public async getAgentSuggestion(userRequest: string): Promise<AgentSelection | null> {
		const analysis = await this.analyzeTask(userRequest)
		return analysis.suggestedAgents.length > 0 ? analysis.suggestedAgents[0] : null
	}

	/**
	 * Get available agent capabilities
	 */
	public getAvailableCapabilities(): AgentCapability[] {
		return Array.from(this.capabilities.values())
	}

	// Private helper methods
	private assessComplexity(request: string): 'simple' | 'medium' | 'complex' | 'enterprise' {
		const keywords = {
			simple: ['fix', 'update', 'change', 'add'],
			medium: ['implement', 'create', 'refactor', 'integrate'],
			complex: ['architecture', 'system', 'migrate', 'optimize'],
			enterprise: ['multi-service', 'microservices', 'infrastructure', 'scale']
		}

		for (const [level, terms] of Object.entries(keywords)) {
			if (terms.some(term => request.toLowerCase().includes(term))) {
				return level as any
			}
		}

		return request.length > 200 ? 'complex' : 'simple'
	}

	private identifyDomains(request: string): string[] {
		const domainKeywords = {
			'frontend': ['ui', 'interface', 'react', 'vue', 'angular', 'css', 'html'],
			'backend': ['api', 'server', 'database', 'service', 'endpoint'],
			'security': ['auth', 'security', 'permission', 'encrypt', 'secure'],
			'testing': ['test', 'validate', 'verify', 'check', 'spec'],
			'documentation': ['docs', 'documentation', 'readme', 'guide'],
			'infrastructure': ['deploy', 'docker', 'kubernetes', 'cloud', 'infrastructure']
		}

		const domains: string[] = []
		const lowerRequest = request.toLowerCase()

		for (const [domain, keywords] of Object.entries(domainKeywords)) {
			if (keywords.some(keyword => lowerRequest.includes(keyword))) {
				domains.push(domain)
			}
		}

		return domains.length > 0 ? domains : ['general']
	}

	private assessParallelizability(request: string): boolean {
		const parallelIndicators = ['multiple', 'several', 'various', 'different', 'independent']
		const sequentialIndicators = ['step by step', 'sequential', 'ordered', 'depends on']
		
		const lowerRequest = request.toLowerCase()
		const hasParallelIndicators = parallelIndicators.some(indicator => lowerRequest.includes(indicator))
		const hasSequentialIndicators = sequentialIndicators.some(indicator => lowerRequest.includes(indicator))
		
		return hasParallelIndicators && !hasSequentialIndicators
	}

	private identifyRequiredCapabilities(request: string, domains: string[]): string[] {
		const capabilityMap = {
			'frontend': ['coder', 'tester'],
			'backend': ['architect', 'coder', 'security', 'tester'],
			'security': ['security', 'tester'],
			'testing': ['tester'],
			'documentation': ['docs'],
			'infrastructure': ['architect', 'security'],
			'general': ['coder']
		}

		const capabilities = new Set<string>()
		
		for (const domain of domains) {
			const domainCapabilities = capabilityMap[domain] || ['coder']
			domainCapabilities.forEach(cap => capabilities.add(cap))
		}

		return Array.from(capabilities)
	}

	private selectOptimalAgents(requiredCapabilities: string[], complexity: string): AgentSelection[] {
		const selections: AgentSelection[] = []
		
		for (const capabilitySlug of requiredCapabilities) {
			const capability = this.capabilities.get(capabilitySlug)
			if (capability) {
				const confidence = this.calculateConfidence(capability, complexity)
				const estimatedCost = this.estimateCost(capability, complexity)
				const estimatedTime = this.estimateTime(capability, complexity)
				
				selections.push({
					slug: capability.slug,
					confidence,
					reasoning: `Selected for ${capability.primaryFunctions.join(', ')} capabilities`,
					estimatedCost,
					estimatedTime
				})
			}
		}

		return selections.sort((a, b) => b.confidence - a.confidence)
	}

	private createExecutionPlan(agents: AgentSelection[], parallelizable: boolean): ExecutionStep[] {
		const steps: ExecutionStep[] = []
		
		// Create execution steps based on agent dependencies and capabilities
		for (let i = 0; i < agents.length; i++) {
			const agent = agents[i]
			const capability = this.capabilities.get(agent.slug)
			
			if (capability) {
				const step: ExecutionStep = {
					stepId: `step-${i + 1}`,
					agentSlug: agent.slug,
					action: `Execute ${capability.primaryFunctions[0]}`,
					dependencies: i > 0 ? [`step-${i}`] : [],
					parallel: parallelizable && capability.executionType === 'parallel',
					inputs: {},
					expectedOutputs: capability.primaryFunctions
				}
				
				steps.push(step)
			}
		}

		return steps
	}

	private async executeStep(
		step: ExecutionStep, 
		userRequest: string, 
		providerSettings: ProviderSettings
	): Promise<StepExecutionResult> {
		// This would integrate with the existing Task execution system
		// For now, return a mock result
		logger.info(`Executing step ${step.stepId} with agent ${step.agentSlug}`)
		
		// Simulate execution
		await new Promise(resolve => setTimeout(resolve, 1000))
		
		return {
			success: true,
			cost: Math.random() * 0.1, // Mock cost
			outputSummary: `Simulated output for ${step.agentSlug}`,
			signals: step.expectedOutputs
		}
	}

	private calculateQualityScore(executedSteps: ExecutionStep[], errors: string[]): number {
		const successRate = (executedSteps.length - errors.length) / executedSteps.length
		return Math.round(successRate * 100)
	}

	private generateRecommendations(
		analysis: TaskAnalysis, 
		executedSteps: ExecutionStep[], 
		errors: string[]
	): string[] {
		const recommendations: string[] = []
		
		if (errors.length > 0) {
			recommendations.push('Consider breaking down complex tasks into smaller steps')
		}
		
		if (analysis.parallelizable && executedSteps.every(s => !s.parallel)) {
			recommendations.push('Task could benefit from parallel execution for faster completion')
		}
		
		if (analysis.complexity === 'enterprise') {
			recommendations.push('Consider implementing checkpoints for long-running tasks')
		}

		return recommendations
	}


	private async safeRecordStep(log: MemlmExecutionStepLog): Promise<void> {
		try {
			await this.memlm.recordExecutionStep(log)
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error)
			logger.warn('Failed to record MEMLM step', { error: message })
		}
	}

	private async finalizeMemlm(
		executionId: string,
		analysis: TaskAnalysis,
		result: OrchestrationResult | null,
		errors: string[],
		recommendations: string[],
		userRequest: string,
	): Promise<void> {
		const summary: MemlmExecutionSummary = {
			executionId,
			success: result?.success ?? false,
			userRequest,
			analysisSummary: analysis.memoryContext.summary,
			recommendations,
			errors,
		}
		await this.memlm.finalizeExecution(summary)
	}

	private deriveStepKeywords(step: ExecutionStep, userRequest: string): string[] {
		const base = `${step.action} ${step.agentSlug} ${userRequest}`
		return base
			.toLowerCase()
			.replace(/[^a-z0-9_\-\s]/g, ' ')
			.split(/[\s_\-]+/g)
			.filter((token) => token.length > 2)
			.slice(0, 20)
	}

	private mergeAgentRecommendations(
		base: AgentSelection[],
		memoryAgents: MemlmAgentRecommendation[],
		complexity: string,
	): AgentSelection[] {
		const merged = [...base]
		const indexBySlug = new Map(base.map((agent, index) => [agent.slug, index]))

		for (const recommendation of memoryAgents) {
			const capability = this.capabilities.get(recommendation.slug)
			if (!capability) {
				continue
			}

			const estimatedCost = this.estimateCost(capability, complexity)
			const estimatedTime = this.estimateTime(capability, complexity)
			const memConfidence = Math.max(0, Math.min(1, recommendation.confidence))

			if (indexBySlug.has(recommendation.slug)) {
				const existingIndex = indexBySlug.get(recommendation.slug)!
				const existing = merged[existingIndex]
				const confidence = Math.round(Math.min(0.99, (existing.confidence + memConfidence) / 2) * 100) / 100
				merged[existingIndex] = {
					...existing,
					confidence,
					reasoning: `${existing.reasoning}; MEMLM: ${recommendation.reason}`,
				}
			} else {
				merged.push({
					slug: recommendation.slug,
					confidence: Math.round(Math.min(0.99, memConfidence) * 100) / 100,
					reasoning: `MEMLM: ${recommendation.reason}`,
					estimatedCost: estimatedCost,
					estimatedTime: estimatedTime,
				})
				indexBySlug.set(recommendation.slug, merged.length - 1)
			}
		}

		return merged
	}

	private inferFunctionsFromMode(mode: ModeConfig): string[] {
		const description = mode.description?.toLowerCase() || ''
		const name = mode.name.toLowerCase()
		
		// Infer functions from mode description and name
		if (description.includes('test') || name.includes('test')) {
			return ['testing', 'validation']
		}
		if (description.includes('security') || name.includes('security')) {
			return ['security_analysis', 'vulnerability_assessment']
		}
		if (description.includes('doc') || name.includes('doc')) {
			return ['documentation', 'technical_writing']
		}
		
		return ['general_assistance']
	}

	private inferComplexityFromMode(mode: ModeConfig): 'low' | 'medium' | 'high' {
		const description = mode.description?.toLowerCase() || ''
		
		if (description.includes('architect') || description.includes('design')) {
			return 'high'
		}
		if (description.includes('implement') || description.includes('code')) {
			return 'medium'
		}
		
		return 'low'
	}

	private calculateConfidence(capability: AgentCapability, complexity: string): number {
		const complexityScore = {
			'simple': 0.9,
			'medium': 0.8,
			'complex': 0.7,
			'enterprise': 0.6
		}[complexity] || 0.5
		
		const costScore = {
			'efficient': 0.9,
			'balanced': 0.8,
			'premium': 0.7
		}[capability.costLevel] || 0.5
		
		return Math.round((complexityScore + costScore) / 2 * 100) / 100
	}

	private estimateCost(capability: AgentCapability, complexity: string): number {
		const baseCost = {
			'efficient': 0.01,
			'balanced': 0.05,
			'premium': 0.15
		}[capability.costLevel] || 0.05
		
		const complexityMultiplier = {
			'simple': 1,
			'medium': 2,
			'complex': 4,
			'enterprise': 8
		}[complexity] || 1
		
		return baseCost * complexityMultiplier
	}

	private estimateTime(capability: AgentCapability, complexity: string): number {
		const baseTime = capability.constraints.timeoutMinutes || 15
		
		const complexityMultiplier = {
			'simple': 0.5,
			'medium': 1,
			'complex': 2,
			'enterprise': 3
		}[complexity] || 1
		
		return Math.round(baseTime * complexityMultiplier)
	}

	private estimateEffort(complexity: string, domainCount: number): number {
		const complexityScore = {
			'simple': 1,
			'medium': 3,
			'complex': 7,
			'enterprise': 15
		}[complexity] || 1
		
		return complexityScore * Math.max(1, domainCount)
	}
}



