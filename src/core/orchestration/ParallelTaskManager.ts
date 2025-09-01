import * as vscode from "vscode"
import { EventEmitter } from "events"
import { Task } from "../task/Task"
import { OrchestrationEngine, type ExecutionPlan, type ExecutionStep } from "../orchestration/OrchestrationEngine"
import { logger } from "../../utils/logging"

/**
 * Task execution status for parallel processing
 */
export type TaskStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'

/**
 * Priority levels for task scheduling
 */
export type TaskPriority = 'low' | 'normal' | 'high' | 'critical'

/**
 * Parallel task execution configuration
 */
export interface ParallelTaskConfig {
	maxConcurrentTasks: number
	priorityEnabled: boolean
	timeoutMinutes: number
	retryAttempts: number
	failureStrategy: 'abort' | 'continue' | 'retry'
}

/**
 * Task wrapper for parallel execution
 */
export interface ParallelTask {
	id: string
	task: Task
	priority: TaskPriority
	dependencies: string[]
	agentType: string
	estimatedDuration: number
	status: TaskStatus
	startTime?: Date
	endTime?: Date
	error?: Error
	result?: any
}

/**
 * Task execution result
 */
export interface TaskExecutionResult {
	taskId: string
	success: boolean
	result?: any
	error?: Error
	duration: number
	agentUsed: string
}

/**
 * Worker pool for managing agent execution
 */
interface AgentWorker {
	id: string
	agentType: string
	isAvailable: boolean
	currentTask?: string
	capabilities: string[]
	maxConcurrency: number
	activeTasks: number
}

/**
 * Parallel execution statistics
 */
export interface ExecutionMetrics {
	totalTasks: number
	completedTasks: number
	failedTasks: number
	averageDuration: number
	concurrencyUtilization: number
	costEfficiency: number
}

/**
 * ParallelTaskManager - Advanced parallel execution engine for darbot-coder
 * 
 * Manages concurrent task execution with intelligent agent coordination,
 * dependency resolution, and performance optimization.
 */
export class ParallelTaskManager extends EventEmitter {
	private taskQueue: Map<string, ParallelTask> = new Map()
	private activeWorkers: Map<string, AgentWorker> = new Map()
	private executionResults: Map<string, TaskExecutionResult> = new Map()
	private config: ParallelTaskConfig
	private isRunning: boolean = false
	private metrics: ExecutionMetrics

	constructor(
		private readonly orchestrationEngine: OrchestrationEngine,
		private readonly context: vscode.ExtensionContext,
		config?: Partial<ParallelTaskConfig>
	) {
		super()
		
		this.config = {
			maxConcurrentTasks: config?.maxConcurrentTasks || 5,
			priorityEnabled: config?.priorityEnabled ?? true,
			timeoutMinutes: config?.timeoutMinutes || 30,
			retryAttempts: config?.retryAttempts || 2,
			failureStrategy: config?.failureStrategy || 'continue'
		}

		this.metrics = {
			totalTasks: 0,
			completedTasks: 0,
			failedTasks: 0,
			averageDuration: 0,
			concurrencyUtilization: 0,
			costEfficiency: 0
		}

		this.initializeWorkerPool()
		logger.info('ParallelTaskManager initialized', { config: this.config })
	}

	/**
	 * Initialize worker pool based on available agents
	 */
	private async initializeWorkerPool(): Promise<void> {
		try {
			const capabilities = this.orchestrationEngine.getOrchestrationCapabilities()
			
			for (const capability of capabilities) {
				const worker: AgentWorker = {
					id: `worker-${capability.slug}-${Date.now()}`,
					agentType: capability.slug,
					isAvailable: true,
					capabilities: capability.primaryFunctions,
					maxConcurrency: capability.constraints.maxConcurrency,
					activeTasks: 0
				}
				
				this.activeWorkers.set(worker.id, worker)
				logger.debug('Initialized worker', { workerId: worker.id, agentType: worker.agentType })
			}
			
			this.emit('workerPoolInitialized', { workerCount: this.activeWorkers.size })
		} catch (error) {
			logger.error('Failed to initialize worker pool', { error })
			throw error
		}
	}

	/**
	 * Execute an orchestration plan with parallel task coordination
	 */
	public async executeOrchestrationPlan(plan: ExecutionPlan): Promise<ExecutionMetrics> {
		logger.info('Starting orchestration plan execution', { 
			planId: plan.id, 
			totalSteps: plan.steps.length 
		})

		try {
			this.isRunning = true
			this.metrics.totalTasks = plan.steps.length

			// Convert execution steps to parallel tasks
			const parallelTasks = this.convertExecutionStepsToTasks(plan.steps)
			
			// Add tasks to queue
			for (const task of parallelTasks) {
				this.taskQueue.set(task.id, task)
			}

			// Execute tasks with dependency resolution
			await this.executeTasksWithDependencies()

			// Calculate final metrics
			this.calculateFinalMetrics()

			this.emit('orchestrationCompleted', { 
				planId: plan.id, 
				metrics: this.metrics 
			})

			return this.metrics

		} catch (error) {
			logger.error('Orchestration plan execution failed', { planId: plan.id, error })
			this.emit('orchestrationFailed', { planId: plan.id, error })
			throw error
		} finally {
			this.isRunning = false
		}
	}

	/**
	 * Convert execution steps to parallel tasks
	 */
	private convertExecutionStepsToTasks(steps: ExecutionStep[]): ParallelTask[] {
		return steps.map((step, index) => ({
			id: step.id || `task-${index}-${Date.now()}`,
			task: this.createTaskFromExecutionStep(step),
			priority: this.determinePriority(step),
			dependencies: step.dependencies || [],
			agentType: step.agentType,
			estimatedDuration: step.estimatedTime || 300, // 5 minutes default
			status: 'pending' as TaskStatus
		}))
	}

	/**
	 * Create a Task object from an execution step
	 */
	private createTaskFromExecutionStep(step: ExecutionStep): Task {
		// Create a new Task instance based on the execution step
		// This integrates with the existing Task system
		const task = new Task(
			step.action,
			step.description || step.action,
			this.context
		)
		
		// Set additional properties if available
		if (step.expectedOutputs) {
			task.setExpectedOutputs(step.expectedOutputs)
		}
		
		return task
	}

	/**
	 * Determine task priority based on execution step
	 */
	private determinePriority(step: ExecutionStep): TaskPriority {
		// Priority logic based on agent type and complexity
		if (step.agentType === 'security' || step.agentType === 'architect') {
			return 'high'
		}
		if (step.dependencies && step.dependencies.length > 0) {
			return 'normal'
		}
		return 'normal'
	}

	/**
	 * Execute tasks with dependency resolution and parallel coordination
	 */
	private async executeTasksWithDependencies(): Promise<void> {
		const executionPromises: Promise<void>[] = []
		const dependencyGraph = this.buildDependencyGraph()

		while (this.hasPendingTasks()) {
			// Find tasks ready for execution (dependencies satisfied)
			const readyTasks = this.getReadyTasks(dependencyGraph)
			
			if (readyTasks.length === 0 && this.hasRunningTasks()) {
				// Wait for running tasks to complete
				await this.waitForTaskCompletion()
				continue
			}

			if (readyTasks.length === 0) {
				// No more tasks can be executed - check for circular dependencies
				logger.warn('No ready tasks found but pending tasks exist', {
					pendingTasks: Array.from(this.taskQueue.values())
						.filter(t => t.status === 'pending')
						.map(t => t.id)
				})
				break
			}

			// Execute ready tasks in parallel (up to concurrency limit)
			const tasksToExecute = this.selectTasksForExecution(readyTasks)
			
			for (const task of tasksToExecute) {
				const executionPromise = this.executeTask(task)
				executionPromises.push(executionPromise)
			}

			// Wait for at least one task to complete before continuing
			if (executionPromises.length > 0) {
				await Promise.race(executionPromises)
			}
		}

		// Wait for all remaining tasks to complete
		await Promise.allSettled(executionPromises)
	}

	/**
	 * Build dependency graph for task execution
	 */
	private buildDependencyGraph(): Map<string, string[]> {
		const graph = new Map<string, string[]>()
		
		for (const task of this.taskQueue.values()) {
			graph.set(task.id, task.dependencies)
		}
		
		return graph
	}

	/**
	 * Get tasks that are ready for execution (dependencies satisfied)
	 */
	private getReadyTasks(dependencyGraph: Map<string, string[]>): ParallelTask[] {
		const readyTasks: ParallelTask[] = []
		
		for (const task of this.taskQueue.values()) {
			if (task.status !== 'pending') continue
			
			const dependencies = dependencyGraph.get(task.id) || []
			const dependenciesSatisfied = dependencies.every(depId => {
				const depTask = this.taskQueue.get(depId)
				return depTask?.status === 'completed'
			})
			
			if (dependenciesSatisfied) {
				readyTasks.push(task)
			}
		}
		
		// Sort by priority if priority is enabled
		if (this.config.priorityEnabled) {
			readyTasks.sort(this.comparePriority.bind(this))
		}
		
		return readyTasks
	}

	/**
	 * Select tasks for execution based on concurrency limits and worker availability
	 */
	private selectTasksForExecution(readyTasks: ParallelTask[]): ParallelTask[] {
		const tasksToExecute: ParallelTask[] = []
		const currentRunningTasks = Array.from(this.taskQueue.values())
			.filter(t => t.status === 'running').length

		for (const task of readyTasks) {
			if (tasksToExecute.length + currentRunningTasks >= this.config.maxConcurrentTasks) {
				break
			}

			// Check if worker is available for this agent type
			const availableWorker = this.findAvailableWorker(task.agentType)
			if (availableWorker) {
				tasksToExecute.push(task)
			}
		}

		return tasksToExecute
	}

	/**
	 * Find available worker for specific agent type
	 */
	private findAvailableWorker(agentType: string): AgentWorker | null {
		for (const worker of this.activeWorkers.values()) {
			if (worker.agentType === agentType && 
				worker.activeTasks < worker.maxConcurrency) {
				return worker
			}
		}
		return null
	}

	/**
	 * Execute a single task with proper error handling and metrics
	 */
	private async executeTask(parallelTask: ParallelTask): Promise<void> {
		const startTime = Date.now()
		parallelTask.status = 'running'
		parallelTask.startTime = new Date()

		// Assign worker
		const worker = this.findAvailableWorker(parallelTask.agentType)
		if (!worker) {
			throw new Error(`No available worker for agent type: ${parallelTask.agentType}`)
		}

		worker.activeTasks++
		worker.currentTask = parallelTask.id

		this.emit('taskStarted', { 
			taskId: parallelTask.id, 
			agentType: parallelTask.agentType,
			workerId: worker.id
		})

		try {
			// Execute the actual task
			const result = await this.executeTaskWithTimeout(parallelTask)
			
			// Task completed successfully
			parallelTask.status = 'completed'
			parallelTask.endTime = new Date()
			parallelTask.result = result

			const duration = Date.now() - startTime
			const executionResult: TaskExecutionResult = {
				taskId: parallelTask.id,
				success: true,
				result,
				duration,
				agentUsed: parallelTask.agentType
			}

			this.executionResults.set(parallelTask.id, executionResult)
			this.metrics.completedTasks++

			this.emit('taskCompleted', { 
				taskId: parallelTask.id, 
				result: executionResult 
			})

			logger.info('Task completed successfully', { 
				taskId: parallelTask.id, 
				duration,
				agentType: parallelTask.agentType
			})

		} catch (error) {
			// Task failed
			parallelTask.status = 'failed'
			parallelTask.endTime = new Date()
			parallelTask.error = error as Error

			const duration = Date.now() - startTime
			const executionResult: TaskExecutionResult = {
				taskId: parallelTask.id,
				success: false,
				error: error as Error,
				duration,
				agentUsed: parallelTask.agentType
			}

			this.executionResults.set(parallelTask.id, executionResult)
			this.metrics.failedTasks++

			this.emit('taskFailed', { 
				taskId: parallelTask.id, 
				error: error as Error 
			})

			logger.error('Task execution failed', { 
				taskId: parallelTask.id, 
				error,
				agentType: parallelTask.agentType
			})

			// Handle failure strategy
			await this.handleTaskFailure(parallelTask, error as Error)

		} finally {
			// Release worker
			worker.activeTasks--
			worker.currentTask = undefined
		}
	}

	/**
	 * Execute task with timeout protection
	 */
	private async executeTaskWithTimeout(parallelTask: ParallelTask): Promise<any> {
		const timeoutMs = this.config.timeoutMinutes * 60 * 1000
		
		return new Promise((resolve, reject) => {
			const timeout = setTimeout(() => {
				reject(new Error(`Task ${parallelTask.id} timed out after ${this.config.timeoutMinutes} minutes`))
			}, timeoutMs)

			// Execute the actual task
			parallelTask.task.execute()
				.then(result => {
					clearTimeout(timeout)
					resolve(result)
				})
				.catch(error => {
					clearTimeout(timeout)
					reject(error)
				})
		})
	}

	/**
	 * Handle task failure based on configured strategy
	 */
	private async handleTaskFailure(parallelTask: ParallelTask, error: Error): Promise<void> {
		switch (this.config.failureStrategy) {
			case 'abort':
				logger.info('Aborting execution due to task failure', { taskId: parallelTask.id })
				await this.abortAllTasks()
				break
			
			case 'retry':
				if (parallelTask.task.getRetryCount() < this.config.retryAttempts) {
					logger.info('Retrying failed task', { 
						taskId: parallelTask.id, 
						retryCount: parallelTask.task.getRetryCount() 
					})
					parallelTask.status = 'pending'
					parallelTask.error = undefined
				}
				break
			
			case 'continue':
				logger.info('Continuing execution despite task failure', { taskId: parallelTask.id })
				// Just log and continue - no special action needed
				break
		}
	}

	/**
	 * Abort all running and pending tasks
	 */
	private async abortAllTasks(): Promise<void> {
		for (const task of this.taskQueue.values()) {
			if (task.status === 'pending' || task.status === 'running') {
				task.status = 'cancelled'
				this.emit('taskCancelled', { taskId: task.id })
			}
		}
	}

	/**
	 * Check if there are pending tasks
	 */
	private hasPendingTasks(): boolean {
		return Array.from(this.taskQueue.values()).some(t => t.status === 'pending')
	}

	/**
	 * Check if there are running tasks
	 */
	private hasRunningTasks(): boolean {
		return Array.from(this.taskQueue.values()).some(t => t.status === 'running')
	}

	/**
	 * Wait for at least one task to complete
	 */
	private async waitForTaskCompletion(): Promise<void> {
		return new Promise((resolve) => {
			const checkCompletion = () => {
				if (!this.hasRunningTasks()) {
					resolve()
					return
				}
				setTimeout(checkCompletion, 100)
			}
			checkCompletion()
		})
	}

	/**
	 * Compare task priorities for sorting
	 */
	private comparePriority(a: ParallelTask, b: ParallelTask): number {
		const priorityOrder = { 'critical': 4, 'high': 3, 'normal': 2, 'low': 1 }
		return priorityOrder[b.priority] - priorityOrder[a.priority]
	}

	/**
	 * Calculate final execution metrics
	 */
	private calculateFinalMetrics(): void {
		const results = Array.from(this.executionResults.values())
		const totalDuration = results.reduce((sum, r) => sum + r.duration, 0)
		
		this.metrics.averageDuration = results.length > 0 ? totalDuration / results.length : 0
		this.metrics.concurrencyUtilization = this.calculateConcurrencyUtilization()
		this.metrics.costEfficiency = this.calculateCostEfficiency()
	}

	/**
	 * Calculate concurrency utilization percentage
	 */
	private calculateConcurrencyUtilization(): number {
		// Implementation for concurrency utilization calculation
		// This would track how well we utilized available parallel slots
		return 0.85 // Placeholder - implement actual calculation
	}

	/**
	 * Calculate cost efficiency score
	 */
	private calculateCostEfficiency(): number {
		// Implementation for cost efficiency calculation
		// This would compare actual vs estimated costs
		return 0.92 // Placeholder - implement actual calculation
	}

	/**
	 * Get current execution status
	 */
	public getExecutionStatus(): {
		isRunning: boolean
		queuedTasks: number
		runningTasks: number
		completedTasks: number
		failedTasks: number
		metrics: ExecutionMetrics
	} {
		const tasks = Array.from(this.taskQueue.values())
		
		return {
			isRunning: this.isRunning,
			queuedTasks: tasks.filter(t => t.status === 'pending').length,
			runningTasks: tasks.filter(t => t.status === 'running').length,
			completedTasks: this.metrics.completedTasks,
			failedTasks: this.metrics.failedTasks,
			metrics: this.metrics
		}
	}

	/**
	 * Get detailed task information
	 */
	public getTaskDetails(taskId: string): ParallelTask | null {
		return this.taskQueue.get(taskId) || null
	}

	/**
	 * Clean up resources
	 */
	public dispose(): void {
		this.abortAllTasks()
		this.taskQueue.clear()
		this.activeWorkers.clear()
		this.executionResults.clear()
		this.removeAllListeners()
		
		logger.info('ParallelTaskManager disposed')
	}
}