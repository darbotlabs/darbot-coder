import path from "path"
import fs from "fs/promises"

import { ToolUse, AskApproval, HandleError, PushToolResult, RemoveClosingTag } from "../../shared/tools"
import { Task } from "../task/Task"
import { DarbotSayTool } from "../../shared/ExtensionMessage"
import { getReadablePath } from "../../utils/path"
import { isPathOutsideWorkspace } from "../../utils/pathUtils"
import { parseSourceCodeForDefinitionsTopLevel, parseSourceCodeDefinitionsForFile } from "../../services/tree-sitter"
import { RecordSource } from "../context-tracking/FileContextTrackerTypes"

export async function listCodeDefinitionNamesTool(
	darbot: Task,
	block: ToolUse,
	askApproval: AskApproval,
	handleError: HandleError,
	pushToolResult: PushToolResult,
	removeClosingTag: RemoveClosingTag,
) {
	const relPath: string | undefined = block.params.path

	// Calculate if the path is outside workspace
	const absolutePath = relPath ? path.resolve(darbot.cwd, relPath) : darbot.cwd
	const isOutsideWorkspace = isPathOutsideWorkspace(absolutePath)

	const sharedMessageProps: DarbotSayTool = {
		tool: "listCodeDefinitionNames",
		path: getReadablePath(darbot.cwd, removeClosingTag("path", relPath)),
		isOutsideWorkspace,
	}

	try {
		if (block.partial) {
			const partialMessage = JSON.stringify({ ...sharedMessageProps, content: "" } satisfies DarbotSayTool)
			await darbot.ask("tool", partialMessage, block.partial).catch(() => {})
			return
		} else {
			if (!relPath) {
				darbot.consecutiveMistakeCount++
				darbot.recordToolError("list_code_definition_names")
				pushToolResult(await darbot.sayAndCreateMissingParamError("list_code_definition_names", "path"))
				return
			}

			darbot.consecutiveMistakeCount = 0

			let result: string

			try {
				const stats = await fs.stat(absolutePath)

				if (stats.isFile()) {
					const fileResult = await parseSourceCodeDefinitionsForFile(absolutePath, darbot.darbotIgnoreController)
					result = fileResult ?? "No source code definitions found in darbot file."
				} else if (stats.isDirectory()) {
					result = await parseSourceCodeForDefinitionsTopLevel(absolutePath, darbot.darbotIgnoreController)
				} else {
					result = "The specified path is neither a file nor a directory."
				}
			} catch {
				result = `${absolutePath}: does not exist or cannot be accessed.`
			}

			const completeMessage = JSON.stringify({ ...sharedMessageProps, content: result } satisfies DarbotSayTool)
			const didApprove = await askApproval("tool", completeMessage)

			if (!didApprove) {
				return
			}

			if (relPath) {
				await darbot.fileContextTracker.trackFileContext(relPath, "read_tool" as RecordSource)
			}

			pushToolResult(result)
			return
		}
	} catch (error) {
		await handleError("parsing source code definitions", error)
		return
	}
}

