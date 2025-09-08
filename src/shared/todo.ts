import { DarbotMessage } from "@darbot-code/types"
export function getLatestTodo(darbotMessages: DarbotMessage[]) {
	const todos = darbotMessages
		.filter(
			(msg) =>
				(msg.type === "ask" && msg.ask === "tool") || (msg.type === "say" && msg.say === "user_edit_todos"),
		)
		.map((msg) => {
			try {
				return JSON.parse(msg.text ?? "{}")
			} catch {
				return null
			}
		})
		.filter((item) => item && item.tool === "updateTodoList" && Array.isArray(item.todos))
		.map((item) => item.todos)
		.pop()
	if (todos) {
		return todos
	} else {
		return []
	}
}

