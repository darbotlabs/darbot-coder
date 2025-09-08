import path from "path"

import { Task } from "../task/Task"
import { ToolUse, AskApproval, HandleError, PushToolResult, RemoveClosingTag } from "../../shared/tools"
import { DarbotSayTool } from "../../shared/ExtensionMessage"
import { getReadablePath } from "../../utils/path"
import { isPathOutsideWorkspace } from "../../utils/pathUtils"
import { regexSearchFiles } from "../../services/ripgrep"

export async function searchFilesTool(
	darbot: Task,
	block: ToolUse,
	askApproval: AskApproval,
	handleError: HandleError,
	pushToolResult: PushToolResult,
	removeClosingTag: RemoveClosingTag,
) {
	const relDirPath: string | undefined = block.params.path
	const regex: string | undefined = block.params.regex
	const filePattern: string | undefined = block.params.file_pattern

	const absolutePath = relDirPath ? path.resolve(darbot.cwd, relDirPath) : darbot.cwd
	const isOutsideWorkspace = isPathOutsideWorkspace(absolutePath)

	const sharedMessageProps: DarbotSayTool = {
		tool: "searchFiles",
		path: getReadablePath(darbot.cwd, removeClosingTag("path", relDirPath)),
		regex: removeClosingTag("regex", regex),
		filePattern: removeClosingTag("file_pattern", filePattern),
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
				darbot.recordToolError("search_files")
				pushToolResult(await darbot.sayAndCreateMissingParamError("search_files", "path"))
				return
			}

			if (!regex) {
				darbot.consecutiveMistakeCount++
				darbot.recordToolError("search_files")
				pushToolResult(await darbot.sayAndCreateMissingParamError("search_files", "regex"))
				return
			}

			darbot.consecutiveMistakeCount = 0

			const results = await regexSearchFiles(
				darbot.cwd,
				absolutePath,
				regex,
				filePattern,
				darbot.darbotIgnoreController,
			)

			const completeMessage = JSON.stringify({ ...sharedMessageProps, content: results } satisfies DarbotSayTool)
			const didApprove = await askApproval("tool", completeMessage)

			if (!didApprove) {
				return
			}

			pushToolResult(results)

			return
		}
	} catch (error) {
		await handleError("searching files", error)
		return
	}
}

