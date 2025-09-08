import delay from "delay"

import { ToolUse, AskApproval, HandleError, PushToolResult, RemoveClosingTag } from "../../shared/tools"
import { Task } from "../task/Task"
import { defaultModeSlug, getModeBySlug } from "../../shared/modes"
import { formatResponse } from "../prompts/responses"
import { t } from "../../i18n"

export async function newTaskTool(
	darbot: Task,
	block: ToolUse,
	askApproval: AskApproval,
	handleError: HandleError,
	pushToolResult: PushToolResult,
	removeClosingTag: RemoveClosingTag,
) {
	const mode: string | undefined = block.params.mode
	const message: string | undefined = block.params.message

	try {
		if (block.partial) {
			const partialMessage = JSON.stringify({
				tool: "newTask",
				mode: removeClosingTag("mode", mode),
				content: removeClosingTag("message", message),
			})

			await darbot.ask("tool", partialMessage, block.partial).catch(() => {})
			return
		} else {
			if (!mode) {
				darbot.consecutiveMistakeCount++
				darbot.recordToolError("new_task")
				pushToolResult(await darbot.sayAndCreateMissingParamError("new_task", "mode"))
				return
			}

			if (!message) {
				darbot.consecutiveMistakeCount++
				darbot.recordToolError("new_task")
				pushToolResult(await darbot.sayAndCreateMissingParamError("new_task", "message"))
				return
			}

			darbot.consecutiveMistakeCount = 0
			// Un-escape one level of backslashes before '@' for hierarchical subtasks
			// Un-escape one level: \\@ -> \@ (removes one backslash for hierarchical subtasks)
			const unescapedMessage = message.replace(/\\\\@/g, "\\@")

			// Verify the mode exists
			const targetMode = getModeBySlug(mode, (await darbot.providerRef.deref()?.getState())?.customModes)

			if (!targetMode) {
				pushToolResult(formatResponse.toolError(`Invalid mode: ${mode}`))
				return
			}

			const toolMessage = JSON.stringify({
				tool: "newTask",
				mode: targetMode.name,
				content: message,
			})

			const didApprove = await askApproval("tool", toolMessage)

			if (!didApprove) {
				return
			}

			const provider = darbot.providerRef.deref()

			if (!provider) {
				return
			}

			if (darbot.enableCheckpoints) {
				darbot.checkpointSave(true)
			}

			// Preserve the current mode so we can resume with it later.
			darbot.pausedModeSlug = (await provider.getState()).mode ?? defaultModeSlug

			// Switch mode first, then create new task instance.
			await provider.handleModeSwitch(mode)

			// Delay to allow mode change to take effect before next tool is executed.
			await delay(500)

			const newDarbot = await provider.initDarbotWithTask(unescapedMessage, undefined, darbot)
			if (!newDarbot) {
				pushToolResult(t("tools:newTask.errors.policy_restriction"))
				return
			}
			darbot.emit("taskSpawned", newDarbot.taskId)

			pushToolResult(`Successfully created new task in ${targetMode.name} mode with message: ${unescapedMessage}`)

			// Set the isPaused flag to true so the parent
			// task can wait for the sub-task to finish.
			darbot.isPaused = true
			darbot.emit("taskPaused")

			return
		}
	} catch (error) {
		await handleError("creating new task", error)
		return
	}
}
