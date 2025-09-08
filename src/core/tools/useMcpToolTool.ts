import { Task } from "../task/Task"
import { ToolUse, AskApproval, HandleError, PushToolResult, RemoveClosingTag } from "../../shared/tools"
import { formatResponse } from "../prompts/responses"
import { DarbotAskUseMcpServer } from "../../shared/ExtensionMessage"
import { McpExecutionStatus } from "@darbot-code/types"
import { t } from "../../i18n"

interface McpToolParams {
	server_name?: string
	tool_name?: string
	arguments?: string
}

type ValidationResult =
	| { isValid: false }
	| {
			isValid: true
			serverName: string
			toolName: string
			parsedArguments?: Record<string, unknown>
	  }

async function handlePartialRequest(
	darbot: Task,
	params: McpToolParams,
	removeClosingTag: RemoveClosingTag,
): Promise<void> {
	const partialMessage = JSON.stringify({
		type: "use_mcp_tool",
		serverName: removeClosingTag("server_name", params.server_name),
		toolName: removeClosingTag("tool_name", params.tool_name),
		arguments: removeClosingTag("arguments", params.arguments),
	} satisfies DarbotAskUseMcpServer)

	await darbot.ask("use_mcp_server", partialMessage, true).catch(() => {})
}

async function validateParams(
	darbot: Task,
	params: McpToolParams,
	pushToolResult: PushToolResult,
): Promise<ValidationResult> {
	if (!params.server_name) {
		darbot.consecutiveMistakeCount++
		darbot.recordToolError("use_mcp_tool")
		pushToolResult(await darbot.sayAndCreateMissingParamError("use_mcp_tool", "server_name"))
		return { isValid: false }
	}

	if (!params.tool_name) {
		darbot.consecutiveMistakeCount++
		darbot.recordToolError("use_mcp_tool")
		pushToolResult(await darbot.sayAndCreateMissingParamError("use_mcp_tool", "tool_name"))
		return { isValid: false }
	}

	let parsedArguments: Record<string, unknown> | undefined

	if (params.arguments) {
		try {
			parsedArguments = JSON.parse(params.arguments)
		} catch (error) {
			darbot.consecutiveMistakeCount++
			darbot.recordToolError("use_mcp_tool")
			await darbot.say("error", t("mcp:errors.invalidJsonArgument", { toolName: params.tool_name }))

			pushToolResult(
				formatResponse.toolError(
					formatResponse.invalidMcpToolArgumentError(params.server_name, params.tool_name),
				),
			)
			return { isValid: false }
		}
	}

	return {
		isValid: true,
		serverName: params.server_name,
		toolName: params.tool_name,
		parsedArguments,
	}
}

async function sendExecutionStatus(darbot: Task, status: McpExecutionStatus): Promise<void> {
	const darbotProvider = await darbot.providerRef.deref()
	darbotProvider?.postMessageToWebview({
		type: "mcpExecutionStatus",
		text: JSON.stringify(status),
	})
}

function processToolContent(toolResult: any): string {
	if (!toolResult?.content || toolResult.content.length === 0) {
		return ""
	}

	return toolResult.content
		.map((item: any) => {
			if (item.type === "text") {
				return item.text
			}
			if (item.type === "resource") {
				const { blob: _, ...rest } = item.resource
				return JSON.stringify(rest, null, 2)
			}
			return ""
		})
		.filter(Boolean)
		.join("\n\n")
}

async function executeToolAndProcessResult(
	darbot: Task,
	serverName: string,
	toolName: string,
	parsedArguments: Record<string, unknown> | undefined,
	executionId: string,
	pushToolResult: PushToolResult,
): Promise<void> {
	await darbot.say("mcp_server_request_started")

	// Send started status
	await sendExecutionStatus(darbot, {
		executionId,
		status: "started",
		serverName,
		toolName,
	})

	const toolResult = await darbot.providerRef.deref()?.getMcpHub()?.callTool(serverName, toolName, parsedArguments)

	let toolResultPretty = "(No response)"

	if (toolResult) {
		const outputText = processToolContent(toolResult)

		if (outputText) {
			await sendExecutionStatus(darbot, {
				executionId,
				status: "output",
				response: outputText,
			})

			toolResultPretty = (toolResult.isError ? "Error:\n" : "") + outputText
		}

		// Send completion status
		await sendExecutionStatus(darbot, {
			executionId,
			status: toolResult.isError ? "error" : "completed",
			response: toolResultPretty,
			error: toolResult.isError ? "Error executing MCP tool" : undefined,
		})
	} else {
		// Send error status if no result
		await sendExecutionStatus(darbot, {
			executionId,
			status: "error",
			error: "No response from MCP server",
		})
	}

	await darbot.say("mcp_server_response", toolResultPretty)
	pushToolResult(formatResponse.toolResult(toolResultPretty))
}

export async function useMcpToolTool(
	darbot: Task,
	block: ToolUse,
	askApproval: AskApproval,
	handleError: HandleError,
	pushToolResult: PushToolResult,
	removeClosingTag: RemoveClosingTag,
) {
	try {
		const params: McpToolParams = {
			server_name: block.params.server_name,
			tool_name: block.params.tool_name,
			arguments: block.params.arguments,
		}

		// Handle partial requests
		if (block.partial) {
			await handlePartialRequest(darbot, params, removeClosingTag)
			return
		}

		// Validate parameters
		const validation = await validateParams(darbot, params, pushToolResult)
		if (!validation.isValid) {
			return
		}

		const { serverName, toolName, parsedArguments } = validation

		// Reset mistake count on successful validation
		darbot.consecutiveMistakeCount = 0

		// Get user approval
		const completeMessage = JSON.stringify({
			type: "use_mcp_tool",
			serverName,
			toolName,
			arguments: params.arguments,
		} satisfies DarbotAskUseMcpServer)

		const executionId = darbot.lastMessageTs?.toString() ?? Date.now().toString()
		const didApprove = await askApproval("use_mcp_server", completeMessage)

		if (!didApprove) {
			return
		}

		// Execute the tool and process results
		await executeToolAndProcessResult(darbot, serverName!, toolName!, parsedArguments, executionId, pushToolResult)
	} catch (error) {
		await handleError("executing MCP tool", error)
	}
}

