import { Task } from "../task/Task"
import { fetchInstructions } from "../prompts/instructions/instructions"
import { DarbotSayTool } from "../../shared/ExtensionMessage"
import { formatResponse } from "../prompts/responses"
import { ToolUse, AskApproval, HandleError, PushToolResult } from "../../shared/tools"

export async function fetchInstructionsTool(
	darbot: Task,
	block: ToolUse,
	askApproval: AskApproval,
	handleError: HandleError,
	pushToolResult: PushToolResult,
) {
	const task: string | undefined = block.params.task
	const sharedMessageProps: DarbotSayTool = { tool: "fetchInstructions", content: task }

	try {
		if (block.partial) {
			const partialMessage = JSON.stringify({ ...sharedMessageProps, content: undefined } satisfies DarbotSayTool)
			await darbot.ask("tool", partialMessage, block.partial).catch(() => {})
			return
		} else {
			if (!task) {
				darbot.consecutiveMistakeCount++
				darbot.recordToolError("fetch_instructions")
				pushToolResult(await darbot.sayAndCreateMissingParamError("fetch_instructions", "task"))
				return
			}

			darbot.consecutiveMistakeCount = 0

			const completeMessage = JSON.stringify({ ...sharedMessageProps, content: task } satisfies DarbotSayTool)
			const didApprove = await askApproval("tool", completeMessage)

			if (!didApprove) {
				return
			}

			// Bow fetch the content and provide it to the agent.
			const provider = darbot.providerRef.deref()
			const mcpHub = provider?.getMcpHub()

			if (!mcpHub) {
				throw new Error("MCP hub not available")
			}

			const diffStrategy = darbot.diffStrategy
			const context = provider?.context
			const content = await fetchInstructions(task, { mcpHub, diffStrategy, context })

			if (!content) {
				pushToolResult(formatResponse.toolError(`Invalid instructions request: ${task}`))
				return
			}

			pushToolResult(content)

			return
		}
	} catch (error) {
		await handleError("fetch instructions", error)
	}
}

