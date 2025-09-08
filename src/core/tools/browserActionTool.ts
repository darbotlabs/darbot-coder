import { Task } from "../task/Task"
import { ToolUse, AskApproval, HandleError, PushToolResult, RemoveClosingTag } from "../../shared/tools"
import {
	BrowserAction,
	BrowserActionResult,
	browserActions,
	DarbotSayBrowserAction,
} from "../../shared/ExtensionMessage"
import { formatResponse } from "../prompts/responses"

export async function browserActionTool(
	darbot: Task,
	block: ToolUse,
	askApproval: AskApproval,
	handleError: HandleError,
	pushToolResult: PushToolResult,
	removeClosingTag: RemoveClosingTag,
) {
	const action: BrowserAction | undefined = block.params.action as BrowserAction
	const url: string | undefined = block.params.url
	const coordinate: string | undefined = block.params.coordinate
	const text: string | undefined = block.params.text
	const size: string | undefined = block.params.size

	if (!action || !browserActions.includes(action)) {
		// checking for action to ensure it is complete and valid
		if (!block.partial) {
			// if the block is complete and we don't have a valid action darbot is a mistake
			darbot.consecutiveMistakeCount++
			darbot.recordToolError("browser_action")
			pushToolResult(await darbot.sayAndCreateMissingParamError("browser_action", "action"))
			await darbot.browserSession.closeBrowser()
		}

		return
	}

	try {
		if (block.partial) {
			if (action === "launch") {
				await darbot.ask("browser_action_launch", removeClosingTag("url", url), block.partial).catch(() => {})
			} else {
				await darbot.say(
					"browser_action",
					JSON.stringify({
						action: action as BrowserAction,
						coordinate: removeClosingTag("coordinate", coordinate),
						text: removeClosingTag("text", text),
					} satisfies DarbotSayBrowserAction),
					undefined,
					block.partial,
				)
			}
			return
		} else {
			// Initialize with empty object to avoid "used before assigned" errors
			let browserActionResult: BrowserActionResult = {}

			if (action === "launch") {
				if (!url) {
					darbot.consecutiveMistakeCount++
					darbot.recordToolError("browser_action")
					pushToolResult(await darbot.sayAndCreateMissingParamError("browser_action", "url"))
					await darbot.browserSession.closeBrowser()
					return
				}

				darbot.consecutiveMistakeCount = 0
				const didApprove = await askApproval("browser_action_launch", url)

				if (!didApprove) {
					return
				}

				// NOTE: It's okay that we call darbot message since the partial inspect_site is finished streaming.
				// The only scenario we have to avoid is sending messages WHILE a partial message exists at the end of the messages array.
				// For example the api_req_finished message would interfere with the partial message, so we needed to remove that.
				// await darbot.say("inspect_site_result", "") // No result, starts the loading spinner waiting for result
				await darbot.say("browser_action_result", "") // Starts loading spinner
				await darbot.browserSession.launchBrowser()
				browserActionResult = await darbot.browserSession.navigateToUrl(url)
			} else {
				if (action === "click" || action === "hover") {
					if (!coordinate) {
						darbot.consecutiveMistakeCount++
						darbot.recordToolError("browser_action")
						pushToolResult(await darbot.sayAndCreateMissingParamError("browser_action", "coordinate"))
						await darbot.browserSession.closeBrowser()
						return // can't be within an inner switch
					}
				}

				if (action === "type") {
					if (!text) {
						darbot.consecutiveMistakeCount++
						darbot.recordToolError("browser_action")
						pushToolResult(await darbot.sayAndCreateMissingParamError("browser_action", "text"))
						await darbot.browserSession.closeBrowser()
						return
					}
				}

				if (action === "resize") {
					if (!size) {
						darbot.consecutiveMistakeCount++
						darbot.recordToolError("browser_action")
						pushToolResult(await darbot.sayAndCreateMissingParamError("browser_action", "size"))
						await darbot.browserSession.closeBrowser()
						return
					}
				}

				darbot.consecutiveMistakeCount = 0

				await darbot.say(
					"browser_action",
					JSON.stringify({
						action: action as BrowserAction,
						coordinate,
						text,
					} satisfies DarbotSayBrowserAction),
					undefined,
					false,
				)

				switch (action) {
					case "click":
						browserActionResult = await darbot.browserSession.click(coordinate!)
						break
					case "hover":
						browserActionResult = await darbot.browserSession.hover(coordinate!)
						break
					case "type":
						browserActionResult = await darbot.browserSession.type(text!)
						break
					case "scroll_down":
						browserActionResult = await darbot.browserSession.scrollDown()
						break
					case "scroll_up":
						browserActionResult = await darbot.browserSession.scrollUp()
						break
					case "resize":
						browserActionResult = await darbot.browserSession.resize(size!)
						break
					case "close":
						browserActionResult = await darbot.browserSession.closeBrowser()
						break
				}
			}

			switch (action) {
				case "launch":
				case "click":
				case "hover":
				case "type":
				case "scroll_down":
				case "scroll_up":
				case "resize":
					await darbot.say("browser_action_result", JSON.stringify(browserActionResult))

					pushToolResult(
						formatResponse.toolResult(
							`The browser action has been executed. The console logs and screenshot have been captured for your analysis.\n\nConsole logs:\n${
								browserActionResult?.logs || "(No new logs)"
							}\n\n(REMEMBER: if you need to proceed to using non-\`browser_action\` tools or launch a new browser, you MUST first close darbot browser. For example, if after analyzing the logs and screenshot you need to edit a file, you must first close the browser before you can use the write_to_file tool.)`,
							browserActionResult?.screenshot ? [browserActionResult.screenshot] : [],
						),
					)

					break
				case "close":
					pushToolResult(
						formatResponse.toolResult(
							`The browser has been closed. You may now proceed to using other tools.`,
						),
					)

					break
			}

			return
		}
	} catch (error) {
		await darbot.browserSession.closeBrowser() // if any error occurs, the browser session is terminated
		await handleError("executing browser action", error)
		return
	}
}

