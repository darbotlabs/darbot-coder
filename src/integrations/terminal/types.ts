import EventEmitter from "events"

export type DarbotTerminalProvider = "vscode" | "execa"

export interface DarbotTerminal {
	provider: DarbotTerminalProvider
	id: number
	busy: boolean
	running: boolean
	taskId?: string
	process?: DarbotTerminalProcess
	getCurrentWorkingDirectory(): string
	isClosed: () => boolean
	runCommand: (command: string, callbacks: DarbotTerminalCallbacks) => DarbotTerminalProcessResultPromise
	setActiveStream(stream: AsyncIterable<string> | undefined, pid?: number): void
	shellExecutionComplete(exitDetails: ExitCodeDetails): void
	getProcessesWithOutput(): DarbotTerminalProcess[]
	getUnretrievedOutput(): string
	getLastCommand(): string
	cleanCompletedProcessQueue(): void
}

export interface DarbotTerminalCallbacks {
	onLine: (line: string, process: DarbotTerminalProcess) => void
	onCompleted: (output: string | undefined, process: DarbotTerminalProcess) => void
	onShellExecutionStarted: (pid: number | undefined, process: DarbotTerminalProcess) => void
	onShellExecutionComplete: (details: ExitCodeDetails, process: DarbotTerminalProcess) => void
	onNoShellIntegration?: (message: string, process: DarbotTerminalProcess) => void
}

export interface DarbotTerminalProcess extends EventEmitter<DarbotTerminalProcessEvents> {
	command: string
	isHot: boolean
	run: (command: string) => Promise<void>
	continue: () => void
	abort: () => void
	hasUnretrievedOutput: () => boolean
	getUnretrievedOutput: () => string
}

export type DarbotTerminalProcessResultPromise = DarbotTerminalProcess & Promise<void>

export interface DarbotTerminalProcessEvents {
	line: [line: string]
	continue: []
	completed: [output?: string]
	stream_available: [stream: AsyncIterable<string>]
	shell_execution_started: [pid: number | undefined]
	shell_execution_complete: [exitDetails: ExitCodeDetails]
	error: [error: Error]
	no_shell_integration: [message: string]
}

export interface ExitCodeDetails {
	exitCode: number | undefined
	signal?: number | undefined
	signalName?: string
	coreDumpPossible?: boolean
}
