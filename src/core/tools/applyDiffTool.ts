import path from "path"
import fs from "fs/promises"

import { TelemetryService } from "@darbot-code/telemetry"
import { DEFAULT_WRITE_DELAY_MS } from "@darbot-code/types"

import { DarbotSayTool } from "../../shared/ExtensionMessage"
import { getReadablePath } from "../../utils/path"
import { Task } from "../task/Task"
import { ToolUse, RemoveClosingTag, AskApproval, HandleError, PushToolResult } from "../../shared/tools"
import { formatResponse } from "../prompts/responses"
import { fileExistsAtPath } from "../../utils/fs"
import { RecordSource } from "../context-tracking/FileContextTrackerTypes"
import { unescapeHtmlEntities } from "../../utils/text-normalization"

export async function applyDiffToolLegacy(
	darbot: Task,
	block: ToolUse,
	askApproval: AskApproval,
	handleError: HandleError,
	pushToolResult: PushToolResult,
	removeClosingTag: RemoveClosingTag,
) {
	const relPath: string | undefined = block.params.path
	let diffContent: string | undefined = block.params.diff

	if (diffContent && !darbot.api.getModel().id.includes("claude")) {
		diffContent = unescapeHtmlEntities(diffContent)
	}

	const sharedMessageProps: DarbotSayTool = {
		tool: "appliedDiff",
		path: getReadablePath(darbot.cwd, removeClosingTag("path", relPath)),
		diff: diffContent,
	}

	try {
		if (block.partial) {
			// Update GUI message
			let toolProgressStatus

			if (darbot.diffStrategy && darbot.diffStrategy.getProgressStatus) {
				toolProgressStatus = darbot.diffStrategy.getProgressStatus(block)
			}

			if (toolProgressStatus && Object.keys(toolProgressStatus).length === 0) {
				return
			}

			await darbot
				.ask("tool", JSON.stringify(sharedMessageProps), block.partial, toolProgressStatus)
				.catch(() => {})

			return
		} else {
			if (!relPath) {
				darbot.consecutiveMistakeCount++
				darbot.recordToolError("apply_diff")
				pushToolResult(await darbot.sayAndCreateMissingParamError("apply_diff", "path"))
				return
			}

			if (!diffContent) {
				darbot.consecutiveMistakeCount++
				darbot.recordToolError("apply_diff")
				pushToolResult(await darbot.sayAndCreateMissingParamError("apply_diff", "diff"))
				return
			}

			const accessAllowed = darbot.darbotIgnoreController?.validateAccess(relPath)

			if (!accessAllowed) {
				await darbot.say("darbotignore_error", relPath)
				pushToolResult(formatResponse.toolError(formatResponse.darbotIgnoreError(relPath)))
				return
			}

			const absolutePath = path.resolve(darbot.cwd, relPath)
			const fileExists = await fileExistsAtPath(absolutePath)

			if (!fileExists) {
				darbot.consecutiveMistakeCount++
				darbot.recordToolError("apply_diff")
				const formattedError = `File does not exist at path: ${absolutePath}\n\n<error_details>\nThe specified file could not be found. Please verify the file path and try again.\n</error_details>`
				await darbot.say("error", formattedError)
				pushToolResult(formattedError)
				return
			}

			let originalContent: string | null = await fs.readFile(absolutePath, "utf-8")

			// Apply the diff to the original content
			const diffResult = (await darbot.diffStrategy?.applyDiff(
				originalContent,
				diffContent,
				parseInt(block.params.start_line ?? ""),
			)) ?? {
				success: false,
				error: "No diff strategy available",
			}

			// Release the original content from memory as it's no longer needed
			originalContent = null

			if (!diffResult.success) {
				darbot.consecutiveMistakeCount++
				const currentCount = (darbot.consecutiveMistakeCountForApplyDiff.get(relPath) || 0) + 1
				darbot.consecutiveMistakeCountForApplyDiff.set(relPath, currentCount)
				let formattedError = ""
				TelemetryService.instance.captureDiffApplicationError(darbot.taskId, currentCount)

				if (diffResult.failParts && diffResult.failParts.length > 0) {
					for (const failPart of diffResult.failParts) {
						if (failPart.success) {
							continue
						}

						const errorDetails = failPart.details ? JSON.stringify(failPart.details, null, 2) : ""

						formattedError = `<error_details>\n${
							failPart.error
						}${errorDetails ? `\n\nDetails:\n${errorDetails}` : ""}\n</error_details>`
					}
				} else {
					const errorDetails = diffResult.details ? JSON.stringify(diffResult.details, null, 2) : ""

					formattedError = `Unable to apply diff to file: ${absolutePath}\n\n<error_details>\n${
						diffResult.error
					}${errorDetails ? `\n\nDetails:\n${errorDetails}` : ""}\n</error_details>`
				}

				if (currentCount >= 2) {
					await darbot.say("diff_error", formattedError)
				}

				darbot.recordToolError("apply_diff", formattedError)

				pushToolResult(formattedError)
				return
			}

			darbot.consecutiveMistakeCount = 0
			darbot.consecutiveMistakeCountForApplyDiff.delete(relPath)

			// Show diff view before asking for approval
			darbot.diffViewProvider.editType = "modify"
			await darbot.diffViewProvider.open(relPath)
			await darbot.diffViewProvider.update(diffResult.content, true)
			darbot.diffViewProvider.scrollToFirstDiff()

			// Check if file is write-protected
			const isWriteProtected = darbot.darbotProtectedController?.isWriteProtected(relPath) || false

			const completeMessage = JSON.stringify({
				...sharedMessageProps,
				diff: diffContent,
				isProtected: isWriteProtected,
			} satisfies DarbotSayTool)

			let toolProgressStatus

			if (darbot.diffStrategy && darbot.diffStrategy.getProgressStatus) {
				toolProgressStatus = darbot.diffStrategy.getProgressStatus(block, diffResult)
			}

			const didApprove = await askApproval("tool", completeMessage, toolProgressStatus, isWriteProtected)

			if (!didApprove) {
				await darbot.diffViewProvider.revertChanges() // darbot likely handles closing the diff view
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

			// Used to determine if we should wait for busy terminal to update before sending api request
			darbot.didEditFile = true
			let partFailHint = ""

			if (diffResult.failParts && diffResult.failParts.length > 0) {
				partFailHint = `But unable to apply all diff parts to file: ${absolutePath}, silently use <read_file> tool to check newest file version and re-apply diffs\n`
			}

			// Get the formatted response message
			const message = await darbot.diffViewProvider.pushToolWriteResult(darbot, darbot.cwd, !fileExists)

			if (partFailHint) {
				pushToolResult(partFailHint + message)
			} else {
				pushToolResult(message)
			}

			await darbot.diffViewProvider.reset()

			return
		}
	} catch (error) {
		await handleError("applying diff", error)
		await darbot.diffViewProvider.reset()
		return
	}
}

