/**
 * Mock VS Code API for standalone development/testing
 * This allows the webview-ui to run in a browser without the VS Code extension
 */

import { ExtensionState } from "@darbot/ExtensionMessage"
import { defaultModeSlug, defaultPrompts } from "@darbot/modes"
import { experimentDefault } from "@darbot/experiments"

export const mockExtensionState: ExtensionState = {
	version: "3.23.16-dev",
	darbotMessages: [],
	taskHistory: [],
	memlmContext: undefined,
	agentSuggestion: undefined,
	shouldShowAnnouncement: false,
	allowedCommands: [],
	deniedCommands: [],
	soundEnabled: false,
	soundVolume: 0.5,
	ttsEnabled: false,
	ttsSpeed: 1.0,
	diffEnabled: true,
	enableCheckpoints: true,
	fuzzyMatchThreshold: 1.0,
	language: "en",
	writeDelayMs: 1000,
	browserViewportSize: "900x600",
	screenshotQuality: 75,
	terminalOutputLineLimit: 500,
	terminalOutputCharacterLimit: 50000,
	terminalShellIntegrationTimeout: 4000,
	mcpEnabled: true,
	enableMcpServerCreation: false,
	alwaysApproveResubmit: false,
	requestDelaySeconds: 5,
	currentApiConfigName: "default",
	listApiConfigMeta: [
		{
			name: "default",
			apiProvider: "anthropic",
		},
	],
	mode: defaultModeSlug,
	customModePrompts: defaultPrompts,
	customSupportPrompts: {},
	experiments: experimentDefault,
	enhancementApiConfigId: "",
	condensingApiConfigId: "",
	customCondensingPrompt: "",
	hasOpenedModeSelector: false,
	autoApprovalEnabled: false,
	customModes: [],
	maxOpenTabsContext: 20,
	maxWorkspaceFiles: 200,
	cwd: "/mock/workspace",
	browserToolEnabled: true,
	telemetrySetting: "unset",
	showDarbotIgnoredFiles: true,
	renderContext: "sidebar",
	maxReadFileLine: -1,
	pinnedApiConfigs: {},
	terminalZshOhMy: false,
	maxConcurrentFileReads: 5,
	terminalZshP10k: false,
	terminalZdotdir: false,
	terminalCompressProgressBar: true,
	historyPreviewCollapsed: false,
	cloudUserInfo: null,
	cloudIsAuthenticated: false,
	sharingEnabled: false,
	autoCondenseContext: true,
	autoCondenseContextPercent: 100,
	profileThresholds: {},
	codebaseIndexConfig: {
		codebaseIndexEnabled: false,
		codebaseIndexQdrantUrl: "http://localhost:6333",
		codebaseIndexEmbedderProvider: "openai",
		codebaseIndexEmbedderBaseUrl: "",
		codebaseIndexEmbedderModelId: "",
		codebaseIndexSearchMaxResults: undefined,
		codebaseIndexSearchMinScore: undefined,
	},
	codebaseIndexModels: { ollama: {}, openai: {} },
	alwaysAllowUpdateTodoList: true,
	apiConfiguration: {
		apiProvider: "anthropic",
		apiModelId: "claude-3-5-sonnet-20241022",
	},
}

export interface MockVSCode {
	postMessage: (message: any) => void
	getState: () => any
	setState: (state: any) => void
}

/**
 * Creates a mock VS Code API that simulates the extension behavior
 */
export function createMockVSCode(): MockVSCode {
	const listeners: Set<(event: MessageEvent) => void> = new Set()
	let state: any = {}

	const mockVSCode: MockVSCode = {
		postMessage: (message: any) => {
			console.log('[Mock VS Code] Message from webview:', message)
			
			// Simulate responses for specific message types
			if (message.type === 'webviewDidLaunch') {
				// Simulate extension state hydration
				setTimeout(() => {
					const event = new MessageEvent('message', {
						data: {
							type: 'state',
							state: mockExtensionState,
							filePaths: [],
							openedTabs: [],
							theme: {
								name: 'Dark+ (default dark)',
								kind: 'vs-dark',
							},
							mcpServers: [],
						},
					})
					listeners.forEach(listener => listener(event))
				}, 100)
			}
		},
		getState: () => state,
		setState: (newState: any) => {
			state = newState
		},
	}

	// Setup window message listener for mock mode
	if (typeof window !== 'undefined') {
		const originalAddEventListener = window.addEventListener
		window.addEventListener = function(type: string, listener: any, ...args: any[]) {
			if (type === 'message') {
				listeners.add(listener)
			}
			return originalAddEventListener.call(this, type, listener, ...args)
		} as any
	}

	return mockVSCode
}

/**
 * Determines if we're running in development mode without VS Code
 */
export function isStandaloneDevelopment(): boolean {
	return typeof window !== 'undefined' && !Object.prototype.hasOwnProperty.call(window, 'vscode')
}
