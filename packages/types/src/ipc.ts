import { z } from "zod"

import { clineMessageSchema, tokenUsageSchema } from "./message.js"
import { toolNamesSchema, toolUsageSchema } from "./tool.js"
import { rooCodeSettingsSchema } from "./global-settings.js"

/**
 * isSubtaskSchema
 */
export const isSubtaskSchema = z.object({
	isSubtask: z.boolean(),
})
export type IsSubtask = z.infer<typeof isSubtaskSchema>

/**
 * DarbotCodeEvent
 */

export enum DarbotCodeEventName {
	Message = "message",
	TaskCreated = "taskCreated",
	TaskStarted = "taskStarted",
	TaskModeSwitched = "taskModeSwitched",
	TaskPaused = "taskPaused",
	TaskUnpaused = "taskUnpaused",
	TaskAskResponded = "taskAskResponded",
	TaskAborted = "taskAborted",
	TaskSpawned = "taskSpawned",
	TaskCompleted = "taskCompleted",
	TaskTokenUsageUpdated = "taskTokenUsageUpdated",
	TaskToolFailed = "taskToolFailed",
	EvalPass = "evalPass",
	EvalFail = "evalFail",
}

export const rooCodeEventsSchema = z.object({
	[DarbotCodeEventName.Message]: z.tuple([
		z.object({
			taskId: z.string(),
			action: z.union([z.literal("created"), z.literal("updated")]),
			message: clineMessageSchema,
		}),
	]),
	[DarbotCodeEventName.TaskCreated]: z.tuple([z.string()]),
	[DarbotCodeEventName.TaskStarted]: z.tuple([z.string()]),
	[DarbotCodeEventName.TaskModeSwitched]: z.tuple([z.string(), z.string()]),
	[DarbotCodeEventName.TaskPaused]: z.tuple([z.string()]),
	[DarbotCodeEventName.TaskUnpaused]: z.tuple([z.string()]),
	[DarbotCodeEventName.TaskAskResponded]: z.tuple([z.string()]),
	[DarbotCodeEventName.TaskAborted]: z.tuple([z.string()]),
	[DarbotCodeEventName.TaskSpawned]: z.tuple([z.string(), z.string()]),
	[DarbotCodeEventName.TaskCompleted]: z.tuple([z.string(), tokenUsageSchema, toolUsageSchema, isSubtaskSchema]),
	[DarbotCodeEventName.TaskTokenUsageUpdated]: z.tuple([z.string(), tokenUsageSchema]),
	[DarbotCodeEventName.TaskToolFailed]: z.tuple([z.string(), toolNamesSchema, z.string()]),
})

export type DarbotCodeEvents = z.infer<typeof rooCodeEventsSchema>

/**
 * Ack
 */

export const ackSchema = z.object({
	clientId: z.string(),
	pid: z.number(),
	ppid: z.number(),
})

export type Ack = z.infer<typeof ackSchema>

/**
 * TaskCommand
 */

export enum TaskCommandName {
	StartNewTask = "StartNewTask",
	CancelTask = "CancelTask",
	CloseTask = "CloseTask",
}

export const taskCommandSchema = z.discriminatedUnion("commandName", [
	z.object({
		commandName: z.literal(TaskCommandName.StartNewTask),
		data: z.object({
			configuration: rooCodeSettingsSchema,
			text: z.string(),
			images: z.array(z.string()).optional(),
			newTab: z.boolean().optional(),
		}),
	}),
	z.object({
		commandName: z.literal(TaskCommandName.CancelTask),
		data: z.string(),
	}),
	z.object({
		commandName: z.literal(TaskCommandName.CloseTask),
		data: z.string(),
	}),
])

export type TaskCommand = z.infer<typeof taskCommandSchema>

/**
 * TaskEvent
 */

export const taskEventSchema = z.discriminatedUnion("eventName", [
	z.object({
		eventName: z.literal(DarbotCodeEventName.Message),
		payload: rooCodeEventsSchema.shape[DarbotCodeEventName.Message],
		taskId: z.number().optional(),
	}),
	z.object({
		eventName: z.literal(DarbotCodeEventName.TaskCreated),
		payload: rooCodeEventsSchema.shape[DarbotCodeEventName.TaskCreated],
		taskId: z.number().optional(),
	}),
	z.object({
		eventName: z.literal(DarbotCodeEventName.TaskStarted),
		payload: rooCodeEventsSchema.shape[DarbotCodeEventName.TaskStarted],
		taskId: z.number().optional(),
	}),
	z.object({
		eventName: z.literal(DarbotCodeEventName.TaskModeSwitched),
		payload: rooCodeEventsSchema.shape[DarbotCodeEventName.TaskModeSwitched],
		taskId: z.number().optional(),
	}),
	z.object({
		eventName: z.literal(DarbotCodeEventName.TaskPaused),
		payload: rooCodeEventsSchema.shape[DarbotCodeEventName.TaskPaused],
		taskId: z.number().optional(),
	}),
	z.object({
		eventName: z.literal(DarbotCodeEventName.TaskUnpaused),
		payload: rooCodeEventsSchema.shape[DarbotCodeEventName.TaskUnpaused],
		taskId: z.number().optional(),
	}),
	z.object({
		eventName: z.literal(DarbotCodeEventName.TaskAskResponded),
		payload: rooCodeEventsSchema.shape[DarbotCodeEventName.TaskAskResponded],
		taskId: z.number().optional(),
	}),
	z.object({
		eventName: z.literal(DarbotCodeEventName.TaskAborted),
		payload: rooCodeEventsSchema.shape[DarbotCodeEventName.TaskAborted],
		taskId: z.number().optional(),
	}),
	z.object({
		eventName: z.literal(DarbotCodeEventName.TaskSpawned),
		payload: rooCodeEventsSchema.shape[DarbotCodeEventName.TaskSpawned],
		taskId: z.number().optional(),
	}),
	z.object({
		eventName: z.literal(DarbotCodeEventName.TaskCompleted),
		payload: rooCodeEventsSchema.shape[DarbotCodeEventName.TaskCompleted],
		taskId: z.number().optional(),
	}),
	z.object({
		eventName: z.literal(DarbotCodeEventName.TaskTokenUsageUpdated),
		payload: rooCodeEventsSchema.shape[DarbotCodeEventName.TaskTokenUsageUpdated],
		taskId: z.number().optional(),
	}),
	z.object({
		eventName: z.literal(DarbotCodeEventName.TaskToolFailed),
		payload: rooCodeEventsSchema.shape[DarbotCodeEventName.TaskToolFailed],
		taskId: z.number().optional(),
	}),
	z.object({
		eventName: z.literal(DarbotCodeEventName.EvalPass),
		payload: z.undefined(),
		taskId: z.number(),
	}),
	z.object({
		eventName: z.literal(DarbotCodeEventName.EvalFail),
		payload: z.undefined(),
		taskId: z.number(),
	}),
])

export type TaskEvent = z.infer<typeof taskEventSchema>

/**
 * IpcMessage
 */

export enum IpcMessageType {
	Connect = "Connect",
	Disconnect = "Disconnect",
	Ack = "Ack",
	TaskCommand = "TaskCommand",
	TaskEvent = "TaskEvent",
}

export enum IpcOrigin {
	Client = "client",
	Server = "server",
}

export const ipcMessageSchema = z.discriminatedUnion("type", [
	z.object({
		type: z.literal(IpcMessageType.Ack),
		origin: z.literal(IpcOrigin.Server),
		data: ackSchema,
	}),
	z.object({
		type: z.literal(IpcMessageType.TaskCommand),
		origin: z.literal(IpcOrigin.Client),
		clientId: z.string(),
		data: taskCommandSchema,
	}),
	z.object({
		type: z.literal(IpcMessageType.TaskEvent),
		origin: z.literal(IpcOrigin.Server),
		relayClientId: z.string().optional(),
		data: taskEventSchema,
	}),
])

export type IpcMessage = z.infer<typeof ipcMessageSchema>

/**
 * Client
 */

export type IpcClientEvents = {
	[IpcMessageType.Connect]: []
	[IpcMessageType.Disconnect]: []
	[IpcMessageType.Ack]: [data: Ack]
	[IpcMessageType.TaskCommand]: [data: TaskCommand]
	[IpcMessageType.TaskEvent]: [data: TaskEvent]
}

/**
 * Server
 */

export type IpcServerEvents = {
	[IpcMessageType.Connect]: [clientId: string]
	[IpcMessageType.Disconnect]: [clientId: string]
	[IpcMessageType.TaskCommand]: [clientId: string, data: TaskCommand]
	[IpcMessageType.TaskEvent]: [relayClientId: string | undefined, data: TaskEvent]
}
