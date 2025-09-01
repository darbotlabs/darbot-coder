import * as vscode from "vscode"
import { OrchestrationEngine, type ExecutionPlan, type ExecutionStep } from "./OrchestrationEngine"
import { logger } from "../../utils/logging"

/**
 * Workflow template types for common development scenarios
 */
export type WorkflowTemplateType = 
	| 'feature_development'
	| 'bug_fix'
	| 'code_review'
	| 'refactoring'
	| 'documentation'
	| 'testing'
	| 'security_audit'
	| 'performance_optimization'
	| 'deployment'
	| 'custom'

/**
 * Workflow template configuration
 */
export interface WorkflowTemplate {
	id: string
	name: string
	description: string
	type: WorkflowTemplateType
	requiredAgents: string[]
	optionalAgents: string[]
	estimatedDuration: number // minutes
	complexity: 'simple' | 'medium' | 'complex' | 'enterprise'
	parallel: boolean
	steps: WorkflowStep[]
	successCriteria: string[]
}

/**
 * Individual workflow step
 */
export interface WorkflowStep {
	id: string
	name: string
	description: string
	agentType: string
	action: string
	dependencies: string[]
	parallel: boolean
	estimatedTime: number // minutes
	optional: boolean
	inputs?: Record<string, any>
	outputs?: string[]
	validation?: string[]
}

/**
 * Workflow execution context
 */
export interface WorkflowContext {
	projectType?: string
	language?: string
	framework?: string
	requirements?: string[]
	constraints?: string[]
	customParameters?: Record<string, any>
}

/**
 * Workflow execution result
 */
export interface WorkflowExecutionResult {
	workflowId: string
	templateUsed: string
	success: boolean
	duration: number
	stepsCompleted: number
	stepsTotal: number
	cost: number
	qualityScore: number
	outputs: Record<string, any>
	recommendations: string[]
}

/**
 * WorkflowTemplateEngine - Provides pre-defined workflow templates for common development scenarios
 * 
 * This engine enables developers to quickly execute complex multi-agent workflows
 * with industry best practices built-in.
 */
export class WorkflowTemplateEngine {
	private templates: Map<string, WorkflowTemplate> = new Map()
	private activeWorkflows: Map<string, ExecutionPlan> = new Map()

	constructor(
		private readonly orchestrationEngine: OrchestrationEngine,
		private readonly context: vscode.ExtensionContext
	) {
		this.initializeBuiltInTemplates()
		logger.info('WorkflowTemplateEngine initialized')
	}

	/**
	 * Initialize built-in workflow templates
	 */
	private initializeBuiltInTemplates(): void {
		const builtInTemplates: WorkflowTemplate[] = [
			this.createFeatureDevelopmentTemplate(),
			this.createBugFixTemplate(),
			this.createCodeReviewTemplate(),
			this.createRefactoringTemplate(),
			this.createDocumentationTemplate(),
			this.createTestingTemplate(),
			this.createSecurityAuditTemplate(),
			this.createPerformanceOptimizationTemplate()
		]

		for (const template of builtInTemplates) {
			this.templates.set(template.id, template)
		}

		logger.info('Built-in workflow templates loaded', { 
			templateCount: this.templates.size 
		})
	}

	/**
	 * Feature Development Workflow Template
	 */
	private createFeatureDevelopmentTemplate(): WorkflowTemplate {
		return {
			id: 'feature_development',
			name: 'Feature Development',
			description: 'Complete feature development with architecture, implementation, testing, and documentation',
			type: 'feature_development',
			requiredAgents: ['architect', 'coder', 'tester'],
			optionalAgents: ['security', 'docs'],
			estimatedDuration: 120, // 2 hours
			complexity: 'medium',
			parallel: true,
			successCriteria: [
				'Feature implemented according to requirements',
				'All tests passing',
				'Code review approved',
				'Documentation updated'
			],
			steps: [
				{
					id: 'analyze_requirements',
					name: 'Analyze Requirements',
					description: 'Analyze feature requirements and create technical specification',
					agentType: 'architect',
					action: 'analyze_and_design',
					dependencies: [],
					parallel: false,
					estimatedTime: 20,
					optional: false,
					outputs: ['technical_spec', 'architecture_plan']
				},
				{
					id: 'security_review_design',
					name: 'Security Review of Design',
					description: 'Review architectural design for security implications',
					agentType: 'security',
					action: 'security_review',
					dependencies: ['analyze_requirements'],
					parallel: true,
					estimatedTime: 15,
					optional: true,
					outputs: ['security_considerations']
				},
				{
					id: 'implement_feature',
					name: 'Implement Feature',
					description: 'Implement the feature based on technical specification',
					agentType: 'coder',
					action: 'implement',
					dependencies: ['analyze_requirements'],
					parallel: true,
					estimatedTime: 60,
					optional: false,
					outputs: ['implementation', 'code_changes']
				},
				{
					id: 'create_tests',
					name: 'Create Tests',
					description: 'Create comprehensive test suite for the feature',
					agentType: 'tester',
					action: 'create_tests',
					dependencies: ['implement_feature'],
					parallel: true,
					estimatedTime: 30,
					optional: false,
					outputs: ['test_suite', 'test_coverage_report']
				},
				{
					id: 'security_scan',
					name: 'Security Scan',
					description: 'Perform security scan on implemented feature',
					agentType: 'security',
					action: 'security_scan',
					dependencies: ['implement_feature'],
					parallel: true,
					estimatedTime: 15,
					optional: true,
					outputs: ['security_report']
				},
				{
					id: 'update_documentation',
					name: 'Update Documentation',
					description: 'Update project documentation with new feature',
					agentType: 'docs',
					action: 'update_docs',
					dependencies: ['implement_feature', 'create_tests'],
					parallel: true,
					estimatedTime: 20,
					optional: true,
					outputs: ['updated_docs', 'api_docs']
				},
				{
					id: 'integration_validation',
					name: 'Integration Validation',
					description: 'Validate feature integration and overall system health',
					agentType: 'tester',
					action: 'integration_test',
					dependencies: ['create_tests', 'security_scan'],
					parallel: false,
					estimatedTime: 25,
					optional: false,
					outputs: ['integration_report', 'quality_metrics']
				}
			]
		}
	}

	/**
	 * Bug Fix Workflow Template
	 */
	private createBugFixTemplate(): WorkflowTemplate {
		return {
			id: 'bug_fix',
			name: 'Bug Fix',
			description: 'Systematic bug investigation, fix, and validation',
			type: 'bug_fix',
			requiredAgents: ['coder', 'tester'],
			optionalAgents: ['architect', 'security'],
			estimatedDuration: 45,
			complexity: 'simple',
			parallel: true,
			successCriteria: [
				'Bug reproduced and root cause identified',
				'Fix implemented and tested',
				'Regression tests added',
				'No new issues introduced'
			],
			steps: [
				{
					id: 'investigate_bug',
					name: 'Investigate Bug',
					description: 'Reproduce bug and identify root cause',
					agentType: 'coder',
					action: 'debug_and_analyze',
					dependencies: [],
					parallel: false,
					estimatedTime: 15,
					optional: false,
					outputs: ['bug_analysis', 'root_cause']
				},
				{
					id: 'design_fix',
					name: 'Design Fix',
					description: 'Design appropriate fix for the identified issue',
					agentType: 'architect',
					action: 'design_solution',
					dependencies: ['investigate_bug'],
					parallel: false,
					estimatedTime: 10,
					optional: true,
					outputs: ['fix_design', 'impact_analysis']
				},
				{
					id: 'implement_fix',
					name: 'Implement Fix',
					description: 'Implement the bug fix',
					agentType: 'coder',
					action: 'implement_fix',
					dependencies: ['investigate_bug'],
					parallel: false,
					estimatedTime: 15,
					optional: false,
					outputs: ['bug_fix', 'code_changes']
				},
				{
					id: 'create_regression_tests',
					name: 'Create Regression Tests',
					description: 'Create tests to prevent regression of this bug',
					agentType: 'tester',
					action: 'create_regression_tests',
					dependencies: ['implement_fix'],
					parallel: true,
					estimatedTime: 10,
					optional: false,
					outputs: ['regression_tests']
				},
				{
					id: 'validate_fix',
					name: 'Validate Fix',
					description: 'Validate that fix resolves issue without side effects',
					agentType: 'tester',
					action: 'validate_fix',
					dependencies: ['implement_fix', 'create_regression_tests'],
					parallel: false,
					estimatedTime: 10,
					optional: false,
					outputs: ['validation_report', 'test_results']
				}
			]
		}
	}

	/**
	 * Code Review Workflow Template
	 */
	private createCodeReviewTemplate(): WorkflowTemplate {
		return {
			id: 'code_review',
			name: 'Code Review',
			description: 'Comprehensive code review with multiple perspectives',
			type: 'code_review',
			requiredAgents: ['architect', 'security'],
			optionalAgents: ['tester', 'docs'],
			estimatedDuration: 30,
			complexity: 'simple',
			parallel: true,
			successCriteria: [
				'Code quality standards met',
				'Security vulnerabilities identified and addressed',
				'Architecture principles followed',
				'Test coverage adequate'
			],
			steps: [
				{
					id: 'architecture_review',
					name: 'Architecture Review',
					description: 'Review code for architectural compliance and best practices',
					agentType: 'architect',
					action: 'architecture_review',
					dependencies: [],
					parallel: true,
					estimatedTime: 15,
					optional: false,
					outputs: ['architecture_feedback', 'design_recommendations']
				},
				{
					id: 'security_review',
					name: 'Security Review',
					description: 'Review code for security vulnerabilities and concerns',
					agentType: 'security',
					action: 'security_code_review',
					dependencies: [],
					parallel: true,
					estimatedTime: 15,
					optional: false,
					outputs: ['security_feedback', 'vulnerability_report']
				},
				{
					id: 'test_coverage_review',
					name: 'Test Coverage Review',
					description: 'Review test coverage and test quality',
					agentType: 'tester',
					action: 'test_review',
					dependencies: [],
					parallel: true,
					estimatedTime: 10,
					optional: true,
					outputs: ['test_feedback', 'coverage_analysis']
				},
				{
					id: 'documentation_review',
					name: 'Documentation Review',
					description: 'Review code documentation and comments',
					agentType: 'docs',
					action: 'documentation_review',
					dependencies: [],
					parallel: true,
					estimatedTime: 10,
					optional: true,
					outputs: ['documentation_feedback']
				},
				{
					id: 'consolidate_feedback',
					name: 'Consolidate Feedback',
					description: 'Consolidate all review feedback into actionable items',
					agentType: 'architect',
					action: 'consolidate_review',
					dependencies: ['architecture_review', 'security_review'],
					parallel: false,
					estimatedTime: 5,
					optional: false,
					outputs: ['consolidated_feedback', 'action_items']
				}
			]
		}
	}

	/**
	 * Create additional workflow templates
	 */
	private createRefactoringTemplate(): WorkflowTemplate {
		return {
			id: 'refactoring',
			name: 'Code Refactoring',
			description: 'Systematic code refactoring with safety validation',
			type: 'refactoring',
			requiredAgents: ['architect', 'coder', 'tester'],
			optionalAgents: ['security'],
			estimatedDuration: 90,
			complexity: 'medium',
			parallel: true,
			successCriteria: [
				'Code maintainability improved',
				'Functionality preserved',
				'Performance maintained or improved',
				'All tests still passing'
			],
			steps: [
				{
					id: 'analyze_refactoring_target',
					name: 'Analyze Refactoring Target',
					description: 'Analyze code to be refactored and plan approach',
					agentType: 'architect',
					action: 'analyze_refactoring',
					dependencies: [],
					parallel: false,
					estimatedTime: 20,
					optional: false,
					outputs: ['refactoring_plan', 'risk_assessment']
				},
				{
					id: 'create_safety_tests',
					name: 'Create Safety Tests',
					description: 'Create comprehensive tests to ensure functionality preservation',
					agentType: 'tester',
					action: 'create_safety_tests',
					dependencies: ['analyze_refactoring_target'],
					parallel: true,
					estimatedTime: 25,
					optional: false,
					outputs: ['safety_test_suite']
				},
				{
					id: 'perform_refactoring',
					name: 'Perform Refactoring',
					description: 'Execute the refactoring plan',
					agentType: 'coder',
					action: 'refactor_code',
					dependencies: ['create_safety_tests'],
					parallel: false,
					estimatedTime: 40,
					optional: false,
					outputs: ['refactored_code', 'migration_notes']
				},
				{
					id: 'validate_refactoring',
					name: 'Validate Refactoring',
					description: 'Validate that refactoring preserves functionality',
					agentType: 'tester',
					action: 'validate_refactoring',
					dependencies: ['perform_refactoring'],
					parallel: false,
					estimatedTime: 15,
					optional: false,
					outputs: ['validation_report', 'performance_comparison']
				}
			]
		}
	}

	private createDocumentationTemplate(): WorkflowTemplate {
		return {
			id: 'documentation',
			name: 'Documentation Update',
			description: 'Comprehensive documentation update and validation',
			type: 'documentation',
			requiredAgents: ['docs'],
			optionalAgents: ['architect', 'tester'],
			estimatedDuration: 60,
			complexity: 'simple',
			parallel: true,
			successCriteria: [
				'Documentation is comprehensive and accurate',
				'Examples are working and tested',
				'Documentation follows style guide'
			],
			steps: [
				{
					id: 'audit_existing_docs',
					name: 'Audit Existing Documentation',
					description: 'Review current documentation for gaps and outdated content',
					agentType: 'docs',
					action: 'audit_documentation',
					dependencies: [],
					parallel: false,
					estimatedTime: 15,
					optional: false,
					outputs: ['documentation_audit', 'update_plan']
				},
				{
					id: 'update_documentation',
					name: 'Update Documentation',
					description: 'Update documentation based on audit findings',
					agentType: 'docs',
					action: 'update_documentation',
					dependencies: ['audit_existing_docs'],
					parallel: false,
					estimatedTime: 35,
					optional: false,
					outputs: ['updated_documentation']
				},
				{
					id: 'validate_examples',
					name: 'Validate Examples',
					description: 'Test all code examples in documentation',
					agentType: 'tester',
					action: 'test_documentation_examples',
					dependencies: ['update_documentation'],
					parallel: true,
					estimatedTime: 15,
					optional: true,
					outputs: ['example_validation_report']
				}
			]
		}
	}

	private createTestingTemplate(): WorkflowTemplate {
		return {
			id: 'testing',
			name: 'Comprehensive Testing',
			description: 'Multi-layer testing strategy implementation',
			type: 'testing',
			requiredAgents: ['tester'],
			optionalAgents: ['security', 'architect'],
			estimatedDuration: 75,
			complexity: 'medium',
			parallel: true,
			successCriteria: [
				'Unit test coverage > 80%',
				'Integration tests covering major workflows',
				'Performance tests within acceptable thresholds'
			],
			steps: [
				{
					id: 'create_unit_tests',
					name: 'Create Unit Tests',
					description: 'Create comprehensive unit test suite',
					agentType: 'tester',
					action: 'create_unit_tests',
					dependencies: [],
					parallel: true,
					estimatedTime: 30,
					optional: false,
					outputs: ['unit_test_suite', 'coverage_report']
				},
				{
					id: 'create_integration_tests',
					name: 'Create Integration Tests',
					description: 'Create integration test suite',
					agentType: 'tester',
					action: 'create_integration_tests',
					dependencies: [],
					parallel: true,
					estimatedTime: 25,
					optional: false,
					outputs: ['integration_test_suite']
				},
				{
					id: 'create_performance_tests',
					name: 'Create Performance Tests',
					description: 'Create performance and load test suite',
					agentType: 'tester',
					action: 'create_performance_tests',
					dependencies: [],
					parallel: true,
					estimatedTime: 20,
					optional: false,
					outputs: ['performance_test_suite', 'baseline_metrics']
				}
			]
		}
	}

	private createSecurityAuditTemplate(): WorkflowTemplate {
		return {
			id: 'security_audit',
			name: 'Security Audit',
			description: 'Comprehensive security audit and vulnerability assessment',
			type: 'security_audit',
			requiredAgents: ['security'],
			optionalAgents: ['architect', 'tester'],
			estimatedDuration: 90,
			complexity: 'complex',
			parallel: true,
			successCriteria: [
				'No high-severity vulnerabilities',
				'Security best practices implemented',
				'Compliance requirements met'
			],
			steps: [
				{
					id: 'static_security_analysis',
					name: 'Static Security Analysis',
					description: 'Perform static code analysis for security vulnerabilities',
					agentType: 'security',
					action: 'static_security_scan',
					dependencies: [],
					parallel: true,
					estimatedTime: 30,
					optional: false,
					outputs: ['static_analysis_report', 'vulnerability_list']
				},
				{
					id: 'dependency_audit',
					name: 'Dependency Security Audit',
					description: 'Audit third-party dependencies for known vulnerabilities',
					agentType: 'security',
					action: 'dependency_audit',
					dependencies: [],
					parallel: true,
					estimatedTime: 20,
					optional: false,
					outputs: ['dependency_audit_report']
				},
				{
					id: 'penetration_testing',
					name: 'Penetration Testing',
					description: 'Perform penetration testing on application',
					agentType: 'security',
					action: 'penetration_test',
					dependencies: ['static_security_analysis'],
					parallel: false,
					estimatedTime: 40,
					optional: false,
					outputs: ['penetration_test_report', 'security_recommendations']
				}
			]
		}
	}

	private createPerformanceOptimizationTemplate(): WorkflowTemplate {
		return {
			id: 'performance_optimization',
			name: 'Performance Optimization',
			description: 'Systematic performance analysis and optimization',
			type: 'performance_optimization',
			requiredAgents: ['architect', 'coder'],
			optionalAgents: ['tester'],
			estimatedDuration: 100,
			complexity: 'complex',
			parallel: true,
			successCriteria: [
				'Performance bottlenecks identified and addressed',
				'Performance targets met',
				'No functionality regression'
			],
			steps: [
				{
					id: 'performance_profiling',
					name: 'Performance Profiling',
					description: 'Profile application to identify performance bottlenecks',
					agentType: 'architect',
					action: 'performance_profile',
					dependencies: [],
					parallel: false,
					estimatedTime: 25,
					optional: false,
					outputs: ['profiling_report', 'bottleneck_analysis']
				},
				{
					id: 'optimization_planning',
					name: 'Optimization Planning',
					description: 'Plan optimization strategy based on profiling results',
					agentType: 'architect',
					action: 'plan_optimization',
					dependencies: ['performance_profiling'],
					parallel: false,
					estimatedTime: 15,
					optional: false,
					outputs: ['optimization_plan', 'priority_matrix']
				},
				{
					id: 'implement_optimizations',
					name: 'Implement Optimizations',
					description: 'Implement planned performance optimizations',
					agentType: 'coder',
					action: 'implement_optimizations',
					dependencies: ['optimization_planning'],
					parallel: false,
					estimatedTime: 45,
					optional: false,
					outputs: ['optimized_code', 'optimization_notes']
				},
				{
					id: 'validate_performance',
					name: 'Validate Performance',
					description: 'Validate that optimizations meet performance targets',
					agentType: 'tester',
					action: 'validate_performance',
					dependencies: ['implement_optimizations'],
					parallel: false,
					estimatedTime: 15,
					optional: true,
					outputs: ['performance_validation_report', 'benchmark_comparison']
				}
			]
		}
	}

	/**
	 * Get all available workflow templates
	 */
	public getAvailableTemplates(): WorkflowTemplate[] {
		return Array.from(this.templates.values())
	}

	/**
	 * Get workflow template by ID
	 */
	public getTemplate(templateId: string): WorkflowTemplate | null {
		return this.templates.get(templateId) || null
	}

	/**
	 * Get templates by type
	 */
	public getTemplatesByType(type: WorkflowTemplateType): WorkflowTemplate[] {
		return Array.from(this.templates.values()).filter(template => template.type === type)
	}

	/**
	 * Execute a workflow template
	 */
	public async executeWorkflow(
		templateId: string,
		context: WorkflowContext,
		userRequest: string
	): Promise<WorkflowExecutionResult> {
		const template = this.templates.get(templateId)
		if (!template) {
			throw new Error(`Workflow template not found: ${templateId}`)
		}

		logger.info('Starting workflow execution', { 
			templateId, 
			templateName: template.name,
			userRequest: userRequest.substring(0, 100) + '...'
		})

		try {
			// Convert workflow template to execution plan
			const executionPlan = await this.convertTemplateToExecutionPlan(template, context, userRequest)
			
			// Store active workflow
			this.activeWorkflows.set(executionPlan.id, executionPlan)

			// Execute via orchestration engine
			const startTime = Date.now()
			const orchestrationResult = await this.orchestrationEngine.executeOrchestrationPlan(executionPlan)
			const duration = Date.now() - startTime

			// Calculate workflow-specific metrics
			const result: WorkflowExecutionResult = {
				workflowId: executionPlan.id,
				templateUsed: templateId,
				success: orchestrationResult.success,
				duration,
				stepsCompleted: orchestrationResult.executedSteps.length,
				stepsTotal: template.steps.length,
				cost: orchestrationResult.totalCost,
				qualityScore: orchestrationResult.qualityScore,
				outputs: this.extractWorkflowOutputs(orchestrationResult.executedSteps),
				recommendations: orchestrationResult.recommendations
			}

			// Clean up active workflow
			this.activeWorkflows.delete(executionPlan.id)

			logger.info('Workflow execution completed', { 
				workflowId: result.workflowId,
				success: result.success,
				duration: result.duration
			})

			return result

		} catch (error) {
			logger.error('Workflow execution failed', { templateId, error })
			throw error
		}
	}

	/**
	 * Convert workflow template to execution plan
	 */
	private async convertTemplateToExecutionPlan(
		template: WorkflowTemplate,
		context: WorkflowContext,
		userRequest: string
	): Promise<ExecutionPlan> {
		const executionSteps: ExecutionStep[] = template.steps.map(step => ({
			id: step.id,
			agentType: step.agentType,
			action: step.action,
			description: step.description,
			dependencies: step.dependencies,
			parallel: step.parallel,
			estimatedTime: step.estimatedTime * 60, // Convert minutes to seconds
			expectedOutputs: step.outputs || [],
			validation: step.validation || []
		}))

		const executionPlan: ExecutionPlan = {
			id: `workflow-${template.id}-${Date.now()}`,
			description: `${template.name}: ${userRequest}`,
			steps: executionSteps,
			estimatedTime: template.estimatedDuration * 60, // Convert to seconds
			estimatedCost: this.estimateWorkflowCost(template),
			complexity: template.complexity,
			parallelizable: template.parallel,
			qualityTargets: template.successCriteria,
			context: {
				template: template.id,
				userRequest,
				workflowContext: context
			}
		}

		return executionPlan
	}

	/**
	 * Estimate workflow cost based on template
	 */
	private estimateWorkflowCost(template: WorkflowTemplate): number {
		// Simple cost estimation based on agents and time
		const baseCostPerMinute = 0.1 // $0.10 per minute
		const agentCostMultipliers: Record<string, number> = {
			'architect': 1.5,
			'security': 1.4,
			'coder': 1.0,
			'tester': 0.8,
			'docs': 0.6
		}

		let totalCost = 0
		for (const step of template.steps) {
			const multiplier = agentCostMultipliers[step.agentType] || 1.0
			totalCost += step.estimatedTime * baseCostPerMinute * multiplier
		}

		return Math.round(totalCost * 100) / 100 // Round to 2 decimal places
	}

	/**
	 * Extract workflow outputs from execution steps
	 */
	private extractWorkflowOutputs(executedSteps: ExecutionStep[]): Record<string, any> {
		const outputs: Record<string, any> = {}
		
		for (const step of executedSteps) {
			if (step.expectedOutputs) {
				for (const output of step.expectedOutputs) {
					outputs[`${step.id}_${output}`] = `Generated ${output} from ${step.agentType}`
				}
			}
		}

		return outputs
	}

	/**
	 * Get active workflows
	 */
	public getActiveWorkflows(): ExecutionPlan[] {
		return Array.from(this.activeWorkflows.values())
	}

	/**
	 * Register custom workflow template
	 */
	public registerCustomTemplate(template: WorkflowTemplate): void {
		this.templates.set(template.id, template)
		logger.info('Custom workflow template registered', { 
			templateId: template.id,
			templateName: template.name
		})
	}

	/**
	 * Remove workflow template
	 */
	public removeTemplate(templateId: string): boolean {
		const removed = this.templates.delete(templateId)
		if (removed) {
			logger.info('Workflow template removed', { templateId })
		}
		return removed
	}

	/**
	 * Get workflow recommendations based on user request
	 */
	public async getWorkflowRecommendations(userRequest: string): Promise<{
		recommended: WorkflowTemplate[]
		reasoning: string[]
	}> {
		const recommendations: WorkflowTemplate[] = []
		const reasoning: string[] = []

		const lowercaseRequest = userRequest.toLowerCase()

		// Simple keyword-based recommendation logic
		if (lowercaseRequest.includes('feature') || lowercaseRequest.includes('implement') || lowercaseRequest.includes('add')) {
			recommendations.push(this.templates.get('feature_development')!)
			reasoning.push('Request appears to involve feature development')
		}

		if (lowercaseRequest.includes('bug') || lowercaseRequest.includes('fix') || lowercaseRequest.includes('issue')) {
			recommendations.push(this.templates.get('bug_fix')!)
			reasoning.push('Request appears to involve bug fixing')
		}

		if (lowercaseRequest.includes('review') || lowercaseRequest.includes('audit')) {
			recommendations.push(this.templates.get('code_review')!)
			reasoning.push('Request involves code review or auditing')
		}

		if (lowercaseRequest.includes('refactor') || lowercaseRequest.includes('clean') || lowercaseRequest.includes('restructure')) {
			recommendations.push(this.templates.get('refactoring')!)
			reasoning.push('Request involves code refactoring')
		}

		if (lowercaseRequest.includes('test') || lowercaseRequest.includes('testing')) {
			recommendations.push(this.templates.get('testing')!)
			reasoning.push('Request involves testing')
		}

		if (lowercaseRequest.includes('security') || lowercaseRequest.includes('vulnerability')) {
			recommendations.push(this.templates.get('security_audit')!)
			reasoning.push('Request involves security concerns')
		}

		if (lowercaseRequest.includes('performance') || lowercaseRequest.includes('optimize') || lowercaseRequest.includes('speed')) {
			recommendations.push(this.templates.get('performance_optimization')!)
			reasoning.push('Request involves performance optimization')
		}

		if (lowercaseRequest.includes('document') || lowercaseRequest.includes('docs')) {
			recommendations.push(this.templates.get('documentation')!)
			reasoning.push('Request involves documentation')
		}

		// If no specific matches, recommend feature development as default
		if (recommendations.length === 0) {
			recommendations.push(this.templates.get('feature_development')!)
			reasoning.push('Default recommendation for general development tasks')
		}

		return { recommended: recommendations, reasoning }
	}

	/**
	 * Clean up resources
	 */
	public dispose(): void {
		this.activeWorkflows.clear()
		this.templates.clear()
		logger.info('WorkflowTemplateEngine disposed')
	}
}