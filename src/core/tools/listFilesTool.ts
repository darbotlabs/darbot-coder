import * as path from "path"

import { Task } from "../task/Task"
import { DarbotSayTool } from "../../shared/ExtensionMessage"
import { formatResponse } from "../prompts/responses"
import { listFiles } from "../../services/glob/list-files"
import { getReadablePath } from "../../utils/path"
import { isPathOutsideWorkspace } from "../../utils/pathUtils"
import { ToolUse, AskApproval, HandleError, PushToolResult, RemoveClosingTag } from "../../shared/tools"

/**
 * Implements the list_files tool.
 *
 * @param darbot - The instance of Darbot that is executing this tool.
 * @param block - The block of assistant message content that specifies the
 *   parameters for this tool.
 * @param askApproval - A function that asks the user for approval to show a
 *   message.
 * @param handleError - A function that handles an error that occurred while
 *   executing this tool.
 * @param pushToolResult - A function that pushes the result of this tool to the
 *   conversation.
 * @param removeClosingTag - A function that removes a closing tag from a string.
 */

export async function listFilesTool(
	darbot: Task,
	block: ToolUse,
	askApproval: AskApproval,
	handleError: HandleError,
	pushToolResult: PushToolResult,
	removeClosingTag: RemoveClosingTag,
) {
	const relDirPath: string | undefined = block.params.path
	const recursiveRaw: string | undefined = block.params.recursive
	const recursive = recursiveRaw?.toLowerCase() === "true"

	// Calculate if the path is outside workspace
	const absolutePath = relDirPath ? path.resolve(darbot.cwd, relDirPath) : darbot.cwd
	const isOutsideWorkspace = isPathOutsideWorkspace(absolutePath)

	const sharedMessageProps: DarbotSayTool = {
		tool: !recursive ? "listFilesTopLevel" : "listFilesRecursive",
		path: getReadablePath(darbot.cwd, removeClosingTag("path", relDirPath)),
		isOutsideWorkspace,
	}

	try {
		if (block.partial) {
			const partialMessage = JSON.stringify({ ...sharedMessageProps, content: "" } satisfies DarbotSayTool)
			await darbot.ask("tool", partialMessage, block.partial).catch(() => {})
			return
		} else {
			if (!relDirPath) {
				darbot.consecutiveMistakeCount++
				darbot.recordToolError("list_files")
				pushToolResult(await darbot.sayAndCreateMissingParamError("list_files", "path"))
				return
			}

			darbot.consecutiveMistakeCount = 0

			const [files, didHitLimit] = await listFiles(absolutePath, recursive, 200)
			const { showDarbotIgnoredFiles = true } = (await darbot.providerRef.deref()?.getState()) ?? {}

			const result = formatResponse.formatFilesList(
				absolutePath,
				files,
				didHitLimit,
				darbot.darbotIgnoreController,
				showDarbotIgnoredFiles,
				darbot.darbotProtectedController,
			)

			const completeMessage = JSON.stringify({ ...sharedMessageProps, content: result } satisfies DarbotSayTool)
			const didApprove = await askApproval("tool", completeMessage)

			if (!didApprove) {
				return
			}

			pushToolResult(result)
		}
	} catch (error) {
		await handleError("listing files", error)
	}
}

