import delay from "delay"
import fs from "fs/promises"
import path from "path"

import { getReadablePath } from "../../utils/path"
import { Task } from "../task/Task"
import { ToolUse, AskApproval, HandleError, PushToolResult, RemoveClosingTag } from "../../shared/tools"
import { formatResponse } from "../prompts/responses"
import { DarbotSayTool } from "../../shared/ExtensionMessage"
import { RecordSource } from "../context-tracking/FileContextTrackerTypes"
import { fileExistsAtPath } from "../../utils/fs"
import { insertGroups } from "../diff/insert-groups"
import { DEFAULT_WRITE_DELAY_MS } from "@darbot-code/types"

export async function insertContentTool(
	darbot: Task,
	block: ToolUse,
	askApproval: AskApproval,
	handleError: HandleError,
	pushToolResult: PushToolResult,
	removeClosingTag: RemoveClosingTag,
) {
	const relPath: string | undefined = block.params.path
	const line: string | undefined = block.params.line
	const content: string | undefined = block.params.content

	const sharedMessageProps: DarbotSayTool = {
		tool: "insertContent",
		path: getReadablePath(darbot.cwd, removeClosingTag("path", relPath)),
		diff: content,
		lineNumber: line ? parseInt(line, 10) : undefined,
	}

	try {
		if (block.partial) {
			await darbot.ask("tool", JSON.stringify(sharedMessageProps), block.partial).catch(() => {})
			return
		}

		// Validate required parameters
		if (!relPath) {
			darbot.consecutiveMistakeCount++
			darbot.recordToolError("insert_content")
			pushToolResult(await darbot.sayAndCreateMissingParamError("insert_content", "path"))
			return
		}

		if (!line) {
			darbot.consecutiveMistakeCount++
			darbot.recordToolError("insert_content")
			pushToolResult(await darbot.sayAndCreateMissingParamError("insert_content", "line"))
			return
		}

		if (content === undefined) {
			darbot.consecutiveMistakeCount++
			darbot.recordToolError("insert_content")
			pushToolResult(await darbot.sayAndCreateMissingParamError("insert_content", "content"))
			return
		}

		const accessAllowed = darbot.darbotIgnoreController?.validateAccess(relPath)

		if (!accessAllowed) {
			await darbot.say("darbotignore_error", relPath)
			pushToolResult(formatResponse.toolError(formatResponse.darbotIgnoreError(relPath)))
			return
		}

		// Check if file is write-protected
		const isWriteProtected = darbot.darbotProtectedController?.isWriteProtected(relPath) || false

		const absolutePath = path.resolve(darbot.cwd, relPath)
		const lineNumber = parseInt(line, 10)
		if (isNaN(lineNumber) || lineNumber < 0) {
			darbot.consecutiveMistakeCount++
			darbot.recordToolError("insert_content")
			pushToolResult(formatResponse.toolError("Invalid line number. Must be a non-negative integer."))
			return
		}

		const fileExists = await fileExistsAtPath(absolutePath)
		let fileContent: string = ""
		if (!fileExists) {
			if (lineNumber > 1) {
				darbot.consecutiveMistakeCount++
				darbot.recordToolError("insert_content")
				const formattedError = `Cannot insert content at line ${lineNumber} into a non-existent file. For new files, 'line' must be 0 (to append) or 1 (to insert at the beginning).`
				await darbot.say("error", formattedError)
				pushToolResult(formattedError)
				return
			}
		} else {
			fileContent = await fs.readFile(absolutePath, "utf8")
		}

		darbot.consecutiveMistakeCount = 0

		darbot.diffViewProvider.editType = fileExists ? "modify" : "create"
		darbot.diffViewProvider.originalContent = fileContent
		const lines = fileExists ? fileContent.split("\n") : []

		const updatedContent = insertGroups(lines, [
			{
				index: lineNumber - 1,
				elements: content.split("\n"),
			},
		]).join("\n")

		// Show changes in diff view
		if (!darbot.diffViewProvider.isEditing) {
			await darbot.ask("tool", JSON.stringify(sharedMessageProps), true).catch(() => {})
			// First open with original content
			await darbot.diffViewProvider.open(relPath)
			await darbot.diffViewProvider.update(fileContent, false)
			darbot.diffViewProvider.scrollToFirstDiff()
			await delay(200)
		}

		// For consistency with writeToFileTool, handle new files differently
		let diff: string | undefined
		let approvalContent: string | undefined

		if (fileExists) {
			// For existing files, generate diff and check for changes
			diff = formatResponse.createPrettyPatch(relPath, fileContent, updatedContent)
			if (!diff) {
				pushToolResult(`No changes needed for '${relPath}'`)
				return
			}
			approvalContent = undefined
		} else {
			// For new files, skip diff generation and provide full content
			diff = undefined
			approvalContent = updatedContent
		}

		await darbot.diffViewProvider.update(updatedContent, true)

		const completeMessage = JSON.stringify({
			...sharedMessageProps,
			diff,
			content: approvalContent,
			lineNumber: lineNumber,
			isProtected: isWriteProtected,
		} satisfies DarbotSayTool)

		const didApprove = await darbot
			.ask("tool", completeMessage, isWriteProtected)
			.then((response) => response.response === "yesButtonClicked")

		if (!didApprove) {
			await darbot.diffViewProvider.revertChanges()
			pushToolResult("Changes were rejected by the user.")
			return
		}

		// Call saveChanges to update the DiffViewProvider properties
		const provider = darbot.providerRef.deref()
		const state = await provider?.getState()
		const diagnosticsEnabled = state?.diagnosticsEnabled ?? true
		const writeDelayMs = state?.writeDelayMs ?? DEFAULT_WRITE_DELAY_MS
		await darbot.diffViewProvider.saveChanges(diagnosticsEnabled, writeDelayMs)

		// Track file edit operation
		if (relPath) {
			await darbot.fileContextTracker.trackFileContext(relPath, "darbot_edited" as RecordSource)
		}

		darbot.didEditFile = true

		// Get the formatted response message
		const message = await darbot.diffViewProvider.pushToolWriteResult(darbot, darbot.cwd, !fileExists)

		pushToolResult(message)

		await darbot.diffViewProvider.reset()
	} catch (error) {
		handleError("insert content", error)
		await darbot.diffViewProvider.reset()
	}
}

