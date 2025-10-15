import * as path from "path"
import os from "os"
import crypto from "crypto"
import EventEmitter from "events"

import { Anthropic } from "@anthropic-ai/sdk"
import delay from "delay"
import pWaitFor from "p-wait-for"
import { serializeError } from "serialize-error"

import {
	type ProviderSettings,
	type TokenUsage,
	type ToolUsage,
	type ToolName,
	type ContextCondense,
	type DarbotAsk,
	type DarbotMessage,
	type DarbotSay,
	type ToolProgressStatus,
	DEFAULT_CONSECUTIVE_MISTAKE_LIMIT,
	type HistoryItem,
	TelemetryEventName,
	TodoItem,
	getApiProtocol,
	getModelId,
} from "@darbot-code/types"
import { TelemetryService } from "@darbot-code/telemetry"
import { CloudService } from "@darbot-code/cloud"

// api
import { ApiHandler, ApiHandlerCreateMessageMetadata, buildApiHandler } from "../../api"
import { ApiStream } from "../../api/transform/stream"

// shared
import { findLastIndex } from "../../shared/array"
import { combineApiRequests } from "../../shared/combineApiRequests"
import { combineCommandSequences } from "../../shared/combineCommandSequences"
import { t } from "../../i18n"
import { DarbotApiReqCancelReason, DarbotApiReqInfo } from "../../shared/ExtensionMessage"
import { getApiMetrics } from "../../shared/getApiMetrics"
import { DarbotAskResponse } from "../../shared/WebviewMessage"
import { defaultModeSlug } from "../../shared/modes"
import { DiffStrategy } from "../../shared/tools"
import { EXPERIMENT_IDS, experiments } from "../../shared/experiments"
import { getModelMaxOutputTokens } from "../../shared/api"

// services
import { UrlContentFetcher } from "../../services/browser/UrlContentFetcher"
import { BrowserSession } from "../../services/browser/BrowserSession"
import { McpHub } from "../../services/mcp/McpHub"
import { McpServerManager } from "../../services/mcp/McpServerManager"
import { RepoPerTaskCheckpointService } from "../../services/checkpoints"

// integrations
import { DiffViewProvider } from "../../integrations/editor/DiffViewProvider"
import { findToolName, formatContentBlockToMarkdown } from "../../integrations/misc/export-markdown"
import { DarbotTerminalProcess } from "../../integrations/terminal/types"
import { TerminalRegistry } from "../../integrations/terminal/TerminalRegistry"

// utils
import { calculateApiCostAnthropic } from "../../shared/cost"
import { getWorkspacePath } from "../../utils/path"

// prompts
import { formatResponse } from "../prompts/responses"
import { SYSTEM_PROMPT } from "../prompts/system"

// core modules
import { ToolRepetitionDetector } from "../tools/ToolRepetitionDetector"
import { FileContextTracker } from "../context-tracking/FileContextTracker"
import { DarbotIgnoreController } from "../ignore/DarbotIgnoreController"
import { DarbotProtectedController } from "../protect/DarbotProtectedController"
import { type AssistantMessageContent, parseAssistantMessage, presentAssistantMessage } from "../assistant-message"
import { truncateConversationIfNeeded } from "../sliding-window"
import { DarbotProvider } from "../webview/DarbotProvider"
import { MultiSearchReplaceDiffStrategy } from "../diff/strategies/multi-search-replace"
import { MultiFileSearchReplaceDiffStrategy } from "../diff/strategies/multi-file-search-replace"
import { readApiMessages, saveApiMessages, readTaskMessages, saveTaskMessages, taskMetadata } from "../task-persistence"
import { getEnvironmentDetails } from "../environment/getEnvironmentDetails"
import {
	type CheckpointDiffOptions,
	type CheckpointRestoreOptions,
	getCheckpointService,
	checkpointSave,
	checkpointRestore,
	checkpointDiff,
} from "../checkpoints"
import { processUserContentMentions } from "../mentions/processUserContentMentions"
import { ApiMessage } from "../task-persistence/apiMessages"
import { getMessagesSinceLastSummary, summarizeConversation } from "../condense"
import { maybeRemoveImageBlocks } from "../../api/transform/image-cleaning"
import { restoreTodoListForTask } from "../tools/updateTodoListTool"
import { MemlmEngine, type MemlmExecutionStepLog, type MemlmExecutionSummary } from "../memory/MemlmEngine"

// Constants
const MAX_EXPONENTIAL_BACKOFF_SECONDS = 600 // 10 minutes

export type DarbotEvents = {
	message: [{ action: "created" | "updated"; message: DarbotMessage }]
	taskStarted: []
	taskModeSwitched: [taskId: string, mode: string]
	taskPaused: []
	taskUnpaused: []
	taskAskResponded: []
	taskAborted: []
	taskSpawned: [taskId: string]
	taskCompleted: [taskId: string, tokenUsage: TokenUsage, toolUsage: ToolUsage]
	taskTokenUsageUpdated: [taskId: string, tokenUsage: TokenUsage]
	taskToolFailed: [taskId: string, tool: ToolName, error: string]
}

export type TaskOptions = {
	provider: DarbotProvider
	apiConfiguration: ProviderSettings
	enableDiff?: boolean
	enableCheckpoints?: boolean
	fuzzyMatchThreshold?: number
	consecutiveMistakeLimit?: number
	task?: string
	images?: string[]
	historyItem?: HistoryItem
	experiments?: Record<string, boolean>
	startTask?: boolean
	rootTask?: Task
	parentTask?: Task
	taskNumber?: number
	onCreated?: (darbot: Task) => void
}

export class Task extends EventEmitter<DarbotEvents> {
	todoList?: TodoItem[]
	readonly taskId: string
	readonly instanceId: string

	readonly rootTask: Task | undefined = undefined
	readonly parentTask: Task | undefined = undefined
	readonly taskNumber: number
	readonly workspacePath: string

	providerRef: WeakRef<DarbotProvider>
	private readonly globalStoragePath: string
	abort: boolean = false
	didFinishAbortingStream = false
	abandoned = false
	isInitialized = false
	isPaused: boolean = false
	pausedModeSlug: string = defaultModeSlug
	private pauseInterval: NodeJS.Timeout | undefined

	// API
	readonly apiConfiguration: ProviderSettings
	api: ApiHandler
	private static lastGlobalApiRequestTime?: number
	private consecutiveAutoApprovedRequestsCount: number = 0

	/**
	 * Reset the global API request timestamp. This should only be used for testing.
	 * @internal
	 */
	static resetGlobalApiRequestTime(): void {
		Task.lastGlobalApiRequestTime = undefined
	}

	toolRepetitionDetector: ToolRepetitionDetector
	darbotIgnoreController?: DarbotIgnoreController
	darbotProtectedController?: DarbotProtectedController
	fileContextTracker: FileContextTracker
	urlContentFetcher: UrlContentFetcher
	terminalProcess?: DarbotTerminalProcess

	// Computer User
	browserSession: BrowserSession

	// Editing
	diffViewProvider: DiffViewProvider
	diffStrategy?: DiffStrategy
	diffEnabled: boolean = false
	fuzzyMatchThreshold: number
	didEditFile: boolean = false

	// Parallel Execution Support - Phase 2 Enhancement
	private retryCount: number = 0
	private maxRetries: number = 2
	private expectedOutputs: string[] = []
	private executionStartTime?: Date
	private executionEndTime?: Date
	private isParallelExecution: boolean = false
	private parallelExecutionId?: string
	private parallelDependencies: string[] = []
	private parallelResult?: any
	private parallelExecutionStatus: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled' = 'pending'

	// LLM Messages & Chat Messages
	apiConversationHistory: ApiMessage[] = []
	darbotMessages: DarbotMessage[] = []

	// Ask
	private askResponse?: DarbotAskResponse
	private askResponseText?: string
	private askResponseImages?: string[]
	public lastMessageTs?: number

	// Tool Use
	consecutiveMistakeCount: number = 0
	consecutiveMistakeLimit: number
	consecutiveMistakeCountForApplyDiff: Map<string, number> = new Map()
	toolUsage: ToolUsage = {}

	// Checkpoints
	enableCheckpoints: boolean
	checkpointService?: RepoPerTaskCheckpointService
	checkpointServiceInitializing = false

	// Streaming
	isWaitingForFirstChunk = false
	isStreaming = false
	currentStreamingContentIndex = 0
	assistantMessageContent: AssistantMessageContent[] = []
	presentAssistantMessageLocked = false
	presentAssistantMessageHasPendingUpdates = false
	userMessageContent: (Anthropic.TextBlockParam | Anthropic.ImageBlockParam)[] = []
	userMessageContentReady = false
	didRejectTool = false
	didAlreadyUseTool = false
	didCompleteReadingStream = false

	private memlmEngine?: MemlmEngine
	private memlmRecordedSteps: Set<string> = new Set()
	private memlmStepHistory: Array<{
		id: string
		action: string
		success: boolean
		signals: string[]
		keywords: string[]
	}> = []
	private memlmFinalized = false
	private memlmCurrentMode: string = defaultModeSlug

	constructor({
		provider,
		apiConfiguration,
		enableDiff = false,
		enableCheckpoints = true,
		fuzzyMatchThreshold = 1.0,
		consecutiveMistakeLimit = DEFAULT_CONSECUTIVE_MISTAKE_LIMIT,
		task,
		images,
		historyItem,
		startTask = true,
		rootTask,
		parentTask,
		taskNumber = -1,
		onCreated,
	}: TaskOptions) {
		super()

		if (startTask && !task && !images && !historyItem) {
			throw new Error("Either historyItem or task/images must be provided")
		}

		this.taskId = historyItem ? historyItem.id : crypto.randomUUID()
		// normal use-case is usually retry similar history task with new workspace
		this.workspacePath = parentTask
			? parentTask.workspacePath
			: getWorkspacePath(path.join(os.homedir(), "Desktop"))
		this.instanceId = crypto.randomUUID().slice(0, 8)
		this.taskNumber = -1

		this.darbotIgnoreController = new DarbotIgnoreController(this.cwd)
		this.darbotProtectedController = new DarbotProtectedController(this.cwd)
		this.fileContextTracker = new FileContextTracker(provider, this.taskId)

		this.darbotIgnoreController.initialize().catch((error) => {
			console.error("Failed to initialize DarbotIgnoreController:", error)
		})

		this.apiConfiguration = apiConfiguration
		this.api = buildApiHandler(apiConfiguration)

		this.urlContentFetcher = new UrlContentFetcher(provider.context)
		this.browserSession = new BrowserSession(provider.context)
		this.diffEnabled = enableDiff
		this.fuzzyMatchThreshold = fuzzyMatchThreshold
		this.consecutiveMistakeLimit = consecutiveMistakeLimit ?? DEFAULT_CONSECUTIVE_MISTAKE_LIMIT
		this.providerRef = new WeakRef(provider)
		this.memlmEngine = provider.customModesManager.getMemlmEngine()
		this.memlmEngine
			?.initialize()
			.catch((error) => {
				console.error("[MemLM] Failed to initialize engine:", error)
			})
		provider
			.getState()
			.then((state) => {
				if (state?.mode) {
					this.memlmCurrentMode = state.mode
				}
			})
			.catch((error) => {
				console.error("[MemLM] Failed to resolve initial mode:", error)
			})
		this.on("taskModeSwitched", (_, mode) => {
			if (typeof mode === "string" && mode.length > 0) {
				this.memlmCurrentMode = mode
			}
		})
		this.globalStoragePath = provider.context.globalStorageUri.fsPath
		this.diffViewProvider = new DiffViewProvider(this.cwd)
		this.enableCheckpoints = enableCheckpoints

		this.darbotTask = rootTask
		this.parentTask = parentTask
		this.taskNumber = taskNumber

		if (historyItem) {
			TelemetryService.instance.captureTaskRestarted(this.taskId)
		} else {
			TelemetryService.instance.captureTaskCreated(this.taskId)
		}

		// Only set up diff strategy if diff is enabled
		if (this.diffEnabled) {
			// Default to old strategy, will be updated if experiment is enabled
			this.diffStrategy = new MultiSearchReplaceDiffStrategy(this.fuzzyMatchThreshold)

			// Check experiment asynchronously and update strategy if needed
			provider.getState().then((state) => {
				const isMultiFileApplyDiffEnabled = experiments.isEnabled(
					state.experiments ?? {},
					EXPERIMENT_IDS.MULTI_FILE_APPLY_DIFF,
				)

				if (isMultiFileApplyDiffEnabled) {
					this.diffStrategy = new MultiFileSearchReplaceDiffStrategy(this.fuzzyMatchThreshold)
				}
			})
		}

		this.toolRepetitionDetector = new ToolRepetitionDetector(this.consecutiveMistakeLimit)

		onCreated?.(this)

		if (startTask) {
			if (task || images) {
				this.startTask(task, images)
			} else if (historyItem) {
				this.resumeTaskFromHistory()
			} else {
				throw new Error("Either historyItem or task/images must be provided")
			}
		}
	}

	static create(options: TaskOptions): [Task, Promise<void>] {
		const instance = new Task({ ...options, startTask: false })
		const { images, task, historyItem } = options
		let promise

		if (images || task) {
			promise = instance.startTask(task, images)
		} else if (historyItem) {
			promise = instance.resumeTaskFromHistory()
		} else {
			throw new Error("Either historyItem or task/images must be provided")
		}

		return [instance, promise]
	}

	// API Messages

	private async getSavedApiConversationHistory(): Promise<ApiMessage[]> {
		return readApiMessages({ taskId: this.taskId, globalStoragePath: this.globalStoragePath })
	}

	private async addToApiConversationHistory(message: Anthropic.MessageParam) {
		const messageWithTs = { ...message, ts: Date.now() }
		this.apiConversationHistory.push(messageWithTs)
		await this.saveApiConversationHistory()
	}

	async overwriteApiConversationHistory(newHistory: ApiMessage[]) {
		this.apiConversationHistory = newHistory
		await this.saveApiConversationHistory()
	}

	private async saveApiConversationHistory() {
		try {
			await saveApiMessages({
				messages: this.apiConversationHistory,
				taskId: this.taskId,
				globalStoragePath: this.globalStoragePath,
			})
		} catch (error) {
			// In the off chance this fails, we don't want to stop the task.
			console.error("Failed to save API conversation history:", error)
		}
	}

	// darbot Messages

	private async getSavedDarbotMessages(): Promise<DarbotMessage[]> {
		return readTaskMessages({ taskId: this.taskId, globalStoragePath: this.globalStoragePath })
	}

	private async addToDarbotMessages(message: DarbotMessage) {
		this.darbotMessages.push(message)
		const provider = this.providerRef.deref()
		await provider?.postStateToWebview()
		this.emit("message", { action: "created", message })
		await this.saveDarbotMessages()

		try {
			await this.captureMemlmFromMessage(message)
		} catch (error) {
			console.error("[MemLM] Failed to capture step:", error)
		}

		const shouldCaptureMessage = message.partial !== true && CloudService.isEnabled()

		if (shouldCaptureMessage) {
			CloudService.instance.captureEvent({
				event: TelemetryEventName.TASK_MESSAGE,
				properties: { taskId: this.taskId, message },
			})
		}
	}

	public async overwriteDarbotMessages(newMessages: DarbotMessage[]) {
		this.darbotMessages = newMessages
		restoreTodoListForTask(this)
		await this.saveDarbotMessages()
	}

	private async updateDarbotMessage(message: DarbotMessage) {
		const provider = this.providerRef.deref()
		await provider?.postMessageToWebview({ type: "messageUpdated", darbotMessage: message })
		this.emit("message", { action: "updated", message })

		const shouldCaptureMessage = message.partial !== true && CloudService.isEnabled()

		if (shouldCaptureMessage) {
			CloudService.instance.captureEvent({
				event: TelemetryEventName.TASK_MESSAGE,
				properties: { taskId: this.taskId, message },
			})
		}
	}

	private async saveDarbotMessages() {
		try {
			await saveTaskMessages({
				messages: this.darbotMessages,
				taskId: this.taskId,
				globalStoragePath: this.globalStoragePath,
			})

			const { historyItem, tokenUsage } = await taskMetadata({
				messages: this.darbotMessages,
				taskId: this.taskId,
				taskNumber: this.taskNumber,
				globalStoragePath: this.globalStoragePath,
				workspace: this.cwd,
			})

			this.emit("taskTokenUsageUpdated", this.taskId, tokenUsage)

			await this.providerRef.deref()?.updateTaskHistory(historyItem)
		} catch (error) {
			console.error("Failed to save darbot messages:", error)
		}
	}

	private async captureMemlmFromMessage(message: DarbotMessage): Promise<void> {
		if (!this.memlmEngine) {
			return
		}

		if (message.type !== "say" || message.partial) {
			return
		}

		const stepType = message.say
		if (!stepType) {
			return
		}

		if (this.darbotMessages.length === 1 && stepType === "text") {
			return
		}

		const successSteps = new Set<string>([
			"api_req_finished",
			"command_output",
			"browser_action_result",
			"subtask_result",
			"text",
		])
		const failureSteps = new Set<string>([
			"error",
			"api_req_failed",
			"diff_error",
			"darbotignore_error",
			"condense_context_error",
		])

		let shouldRecord = false
		let success = true

		if (successSteps.has(stepType)) {
			shouldRecord = true
			success = true
		} else if (failureSteps.has(stepType)) {
			shouldRecord = true
			success = false
		} else if (stepType === "completion_result") {
			shouldRecord = true
			success = !this.containsFailureIndicator(message.text)
		}

		if (!shouldRecord) {
			return
		}

		await this.memlmEngine.initialize()

		const executionId = this.taskId
		const stepIdBase = message.ts ? String(message.ts) : String(Date.now())
		const stepId = `${executionId}:${stepIdBase}`

		if (this.memlmRecordedSteps.has(stepId)) {
			return
		}

		const keywords = this.extractMemlmKeywords(message.text, [stepType, this.memlmCurrentMode])
		const signals = this.deriveMemlmSignals(stepType)
		const log: MemlmExecutionStepLog = {
			executionId,
			stepId,
			agentSlug: this.memlmCurrentMode,
			action: this.describeMemlmAction(stepType, message.text),
			success,
			order: Math.max(0, this.darbotMessages.length - 1),
			keywords,
			outputSummary: this.buildMemlmOutputSummary(message),
			cost: this.extractMemlmCost(message),
			signals,
		}

		await this.memlmEngine.recordExecutionStep(log)
		this.memlmRecordedSteps.add(stepId)
		this.memlmStepHistory.push({
			id: stepId,
			action: log.action,
			success,
			signals,
			keywords,
		})
		if (this.memlmStepHistory.length > 50) {
			this.memlmStepHistory.shift()
		}

		if (stepType === "completion_result") {
			await this.finalizeMemlmExecution(success, message.text)
		}
	}

	private deriveMemlmSignals(stepType: string): string[] {
		switch (stepType) {
			case "command_output":
				return ["terminal"]
			case "browser_action_result":
				return ["browser"]
			case "api_req_finished":
				return ["llm"]
			case "subtask_result":
				return ["subtask"]
			case "completion_result":
				return ["summary"]
			case "error":
			case "api_req_failed":
			case "diff_error":
			case "darbotignore_error":
			case "condense_context_error":
				return ["error"]
			default:
				return ["assistant"]
		}
	}

	private describeMemlmAction(stepType: string, text?: string): string {
		const snippet = text ? text.replace(/\s+/g, " " ).trim().slice(0, 120) : ""
		switch (stepType) {
			case "api_req_finished":
				return snippet ? `LLM output: ${snippet}` : "LLM output"
			case "command_output":
				return snippet ? `Command output: ${snippet}` : "Command output"
			case "browser_action_result":
				return snippet ? `Browser action: ${snippet}` : "Browser action"
			case "subtask_result":
				return snippet ? `Subtask result: ${snippet}` : "Subtask result"
			case "completion_result":
				return snippet ? `Completion: ${snippet}` : "Completion"
			case "error":
				return snippet ? `Error: ${snippet}` : "Error"
			case "api_req_failed":
				return snippet ? `LLM failure: ${snippet}` : "LLM failure"
			default:
				return snippet ? `${stepType}: ${snippet}` : stepType
		}
	}

	private buildMemlmOutputSummary(message: DarbotMessage): string | undefined {
		if (!message.text) {
			return undefined
		}
		const trimmed = message.text.trim()
		if (!trimmed) {
			return undefined
		}
		return trimmed.replace(/\s+/g, " " ).slice(0, 200)
	}

	private extractMemlmKeywords(text?: string, extras: string[] = []): string[] {
		const base = (text ?? "")
			.toLowerCase()
			.replace(/[^a-z0-9_\-\s]/g, " " )
			.split(/[\s_\-]+/g)
			.filter((token) => token.length > 2)

		const additional = extras.map((token) => token.toLowerCase())
		const combined: string[] = []

		for (const token of [...base, ...additional]) {
			if (token && !combined.includes(token)) {
				combined.push(token)
			}
		}

		return combined.slice(0, 40)
	}

	private extractMemlmCost(message: DarbotMessage): number | undefined {
		if (!message.text) {
			return undefined
		}
		const trimmed = message.text.trim()
		if (!trimmed.startsWith("{")) {
			return undefined
		}
		try {
			const parsed = JSON.parse(trimmed)
			return typeof parsed?.cost === "number" ? parsed.cost : undefined
		} catch {
			return undefined
		}
	}

	private containsFailureIndicator(text?: string): boolean {
		if (!text) {
			return false
		}
		const lowered = text.toLowerCase()
		return lowered.includes("fail") || lowered.includes("error") || lowered.includes("unable")
	}

	private async finalizeMemlmExecution(success: boolean, failureReason?: string): Promise<void> {
		if (this.memlmFinalized || !this.memlmEngine) {
			return
		}

		this.memlmFinalized = true

		try {
			await this.memlmEngine.initialize()

			const userTask = this.darbotMessages[0]?.text?.trim() ?? ""
			const keywords = [...new Set(this.memlmStepHistory.flatMap((step) => step.keywords))].slice(0, 12)
			const stepSummaries = this.memlmStepHistory.slice(-3).map((step) => step.action)
			const signals = [...new Set(this.memlmStepHistory.flatMap((step) => step.signals))]

			const summaryLines: string[] = []
			if (keywords.length) {
				summaryLines.push(`keywords: ${keywords.join(", ")}`)
			}
			if (stepSummaries.length) {
				summaryLines.push(`steps: ${stepSummaries.join(" | ")}`)
			}
			if (signals.length) {
				summaryLines.push(`signals: ${signals.join(", ")}`)
			}
			const analysisSummary = summaryLines.length ? summaryLines.join("\n") : `mode: ${this.memlmCurrentMode}`

			const errors: string[] = []
			for (const step of this.memlmStepHistory) {
				if (!step.success) {
					errors.push(step.action)
				}
			}
			if (!success && failureReason) {
				errors.push(failureReason)
			}

			const summary: MemlmExecutionSummary = {
				executionId: this.taskId,
				success,
				userRequest: userTask,
				analysisSummary,
				recommendations: [],
				errors,
			}

			await this.memlmEngine.finalizeExecution(summary)
		} catch (error) {
			console.error("[MemLM] Failed to finalize execution:", error)
		}
	}
	// Note that `partial` has three valid states true (partial message),
	// false (completion of partial message), undefined (individual complete
	// message).
	async ask(
		type: DarbotAsk,
		text?: string,
		partial?: boolean,
		progressStatus?: ToolProgressStatus,
		isProtected?: boolean,
	): Promise<{ response: DarbotAskResponse; text?: string; images?: string[] }> {
		// If this darbot instance was aborted by the provider, then the only
		// thing keeping us alive is a promise still running in the background,
		// in which case we don't want to send its result to the webview as it
		// is attached to a new instance of darbot now. So we can safely ignore
		// the result of any active promises, and this class will be
		// deallocated. (Although we set darbot = undefined in provider, that
		// simply removes the reference to this instance, but the instance is
		// still alive until this promise resolves or rejects.)
		if (this.abort) {
			throw new Error(`[DarbotCode#ask] task ${this.taskId}.${this.instanceId} aborted`)
		}

		let askTs: number

		if (partial !== undefined) {
			const lastMessage = this.darbotMessages.at(-1)

			const isUpdatingPreviousPartial =
				lastMessage && lastMessage.partial && lastMessage.type === "ask" && lastMessage.ask === type

			if (partial) {
				if (isUpdatingPreviousPartial) {
					// Existing partial message, so update it.
					lastMessage.text = text
					lastMessage.partial = partial
					lastMessage.progressStatus = progressStatus
					lastMessage.isProtected = isProtected
					// TODO: Be more efficient about saving and posting only new
					// data or one whole message at a time so ignore partial for
					// saves, and only post parts of partial message instead of
					// whole array in new listener.
					this.updateDarbotMessage(lastMessage)
					throw new Error("Current ask promise was ignored (#1)")
				} else {
					// This is a new partial message, so add it with partial
					// state.
					askTs = Date.now()
					this.lastMessageTs = askTs
					await this.addToDarbotMessages({ ts: askTs, type: "ask", ask: type, text, partial, isProtected })
					throw new Error("Current ask promise was ignored (#2)")
				}
			} else {
				if (isUpdatingPreviousPartial) {
					// This is the complete version of a previously partial
					// message, so replace the partial with the complete version.
					this.askResponse = undefined
					this.askResponseText = undefined
					this.askResponseImages = undefined

					// Bug for the history books:
					// In the webview we use the ts as the chatrow key for the
					// virtuoso list. Since we would update this ts right at the
					// end of streaming, it would cause the view to flicker. The
					// key prop has to be stable otherwise react has trouble
					// reconciling items between renders, causing unmounting and
					// remounting of components (flickering).
					// The lesson here is if you see flickering when rendering
					// lists, it's likely because the key prop is not stable.
					// So in this case we must make sure that the message ts is
					// never altered after first setting it.
					askTs = lastMessage.ts
					this.lastMessageTs = askTs
					lastMessage.text = text
					lastMessage.partial = false
					lastMessage.progressStatus = progressStatus
					lastMessage.isProtected = isProtected
					await this.saveDarbotMessages()
					this.updateDarbotMessage(lastMessage)
				} else {
					// This is a new and complete message, so add it like normal.
					this.askResponse = undefined
					this.askResponseText = undefined
					this.askResponseImages = undefined
					askTs = Date.now()
					this.lastMessageTs = askTs
					await this.addToDarbotMessages({ ts: askTs, type: "ask", ask: type, text, isProtected })
				}
			}
		} else {
			// This is a new non-partial message, so add it like normal.
			this.askResponse = undefined
			this.askResponseText = undefined
			this.askResponseImages = undefined
			askTs = Date.now()
			this.lastMessageTs = askTs
			await this.addToDarbotMessages({ ts: askTs, type: "ask", ask: type, text, isProtected })
		}

		await pWaitFor(() => this.askResponse !== undefined || this.lastMessageTs !== askTs, { interval: 100 })

		if (this.lastMessageTs !== askTs) {
			// Could happen if we send multiple asks in a row i.e. with
			// command_output. It's important that when we know an ask could
			// fail, it is handled gracefully.
			throw new Error("Current ask promise was ignored")
		}

		const result = { response: this.askResponse!, text: this.askResponseText, images: this.askResponseImages }
		this.askResponse = undefined
		this.askResponseText = undefined
		this.askResponseImages = undefined
		this.emit("taskAskResponded")
		return result
	}

	/**
	 * Execute task in parallel execution mode
	 */
	private async executeParallelTask(): Promise<any> {
		try {
			// Check if dependencies are satisfied (for parallel execution)
			if (!this.areDependenciesSatisfied()) {
				throw new Error(`Dependencies not satisfied for task ${this.taskId}`)
			}

			// Execute the actual task logic
			const result = await this.performTaskWork()
			
			this.parallelExecutionStatus = 'completed'
			this.executionEndTime = new Date()
			this.parallelResult = result
			
			return result

		} catch (error) {
			this.parallelExecutionStatus = 'failed'
			this.executionEndTime = new Date()
			
			// Handle retry logic
			if (this.shouldRetry(error as Error)) {
				return await this.retry()
			}
			
			throw error
		}
	}

	/**
	 * Perform the actual task work
	 */
	private async performTaskWork(): Promise<any> {
		// This is where the actual task execution logic would go
		// For now, we'll simulate based on the task type or description
		
		// Simulate different execution times based on task complexity
		const simulatedDuration = Math.random() * 5000 + 1000 // 1-6 seconds
		await delay(simulatedDuration)
		
		// Check if we should simulate a failure
		if (Math.random() < 0.1) { // 10% failure rate for testing
			throw new Error(`Simulated failure for task ${this.taskId}`)
		}
		
		return {
			success: true,
			taskId: this.taskId,
			executionTime: simulatedDuration,
			outputs: this.expectedOutputs,
			message: 'Parallel task completed successfully'
		}
	}

	/**
	 * Check if task dependencies are satisfied
	 */
	private areDependenciesSatisfied(): boolean {
		// In a real implementation, this would check if all dependency tasks
		// have completed successfully
		return this.parallelDependencies.length === 0 // Simplified for now
	}

	/**
	 * Determine if the task should be retried
	 */
	private shouldRetry(error: Error): boolean {
		return this.retryCount < this.maxRetries && 
			   !this.abort && 
			   this.parallelExecutionStatus !== 'cancelled'
	}

	/**
	 * Retry the task execution
	 */
	private async retry(): Promise<any> {
		this.retryCount++
		this.parallelExecutionStatus = 'running'
		
		// Wait a bit before retrying (exponential backoff)
		const backoffTime = Math.pow(2, this.retryCount) * 1000
		await delay(backoffTime)
		
		return await this.executeParallelTask()
	}

	// Parallel Execution Configuration Methods

	/**
	 * Configure this task for parallel execution
	 */
	public configureForParallelExecution(config: {
		parallelExecutionId: string
		dependencies?: string[]
		expectedOutputs?: string[]
		maxRetries?: number
	}): void {
		this.isParallelExecution = true
		this.parallelExecutionId = config.parallelExecutionId
		this.parallelDependencies = config.dependencies || []
		this.expectedOutputs = config.expectedOutputs || []
		this.maxRetries = config.maxRetries || 2
	}

	/**
	 * Set expected outputs for validation
	 */
	public setExpectedOutputs(outputs: string[]): void {
		this.expectedOutputs = outputs
	}

	/**
	 * Get retry count for failure handling
	 */
	public getRetryCount(): number {
		return this.retryCount
	}

	/**
	 * Get parallel execution status
	 */
	public getParallelExecutionStatus(): {
		status: string
		startTime?: Date
		endTime?: Date
		duration?: number
		retryCount: number
		result?: any
	} {
		const duration = this.executionStartTime && this.executionEndTime 
			? this.executionEndTime.getTime() - this.executionStartTime.getTime()
			: undefined

		return {
			status: this.parallelExecutionStatus,
			startTime: this.executionStartTime,
			endTime: this.executionEndTime,
			duration,
			retryCount: this.retryCount,
			result: this.parallelResult
		}
	}

	/**
	 * Cancel parallel execution
	 */
	public cancelParallelExecution(): void {
		this.parallelExecutionStatus = 'cancelled'
		this.abort = true
		this.executionEndTime = new Date()
	}

	/**
	 * Check if this task can be executed in parallel with others
	 */
	public canRunInParallel(): boolean {
		return this.isParallelExecution && 
			   this.parallelExecutionStatus === 'pending' && 
			   this.areDependenciesSatisfied()
	}

	/**
	 * Get parallel execution metadata
	 */
	public getParallelExecutionMetadata(): {
		taskId: string
		parallelExecutionId?: string
		dependencies: string[]
		isParallelExecution: boolean
		status: string
		canRunInParallel: boolean
	} {
		return {
			taskId: this.taskId,
			parallelExecutionId: this.parallelExecutionId,
			dependencies: this.parallelDependencies,
			isParallelExecution: this.isParallelExecution,
			status: this.parallelExecutionStatus,
			canRunInParallel: this.canRunInParallel()
		}
	}
}


