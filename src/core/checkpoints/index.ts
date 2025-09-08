import pWaitFor from "p-wait-for"
import * as vscode from "vscode"

import { TelemetryService } from "@darbot-code/telemetry"

import { Task } from "../task/Task"

import { getWorkspacePath } from "../../utils/path"

import { DarbotApiReqInfo } from "../../shared/ExtensionMessage"
import { getApiMetrics } from "../../shared/getApiMetrics"

import { DIFF_VIEW_URI_SCHEME } from "../../integrations/editor/DiffViewProvider"

import { CheckpointServiceOptions, RepoPerTaskCheckpointService } from "../../services/checkpoints"

export function getCheckpointService(darbot: Task) {
	if (!darbot.enableCheckpoints) {
		return undefined
	}

	if (darbot.checkpointService) {
		return darbot.checkpointService
	}

	if (darbot.checkpointServiceInitializing) {
		console.log("[Task#getCheckpointService] checkpoint service is still initializing")
		return undefined
	}

	const provider = darbot.providerRef.deref()

	const log = (message: string) => {
		console.log(message)

		try {
			provider?.log(message)
		} catch (err) {
			// NO-OP
		}
	}

	console.log("[Task#getCheckpointService] initializing checkpoints service")

	try {
		const workspaceDir = getWorkspacePath()

		if (!workspaceDir) {
			log("[Task#getCheckpointService] workspace folder not found, disabling checkpoints")
			darbot.enableCheckpoints = false
			return undefined
		}

		const globalStorageDir = provider?.context.globalStorageUri.fsPath

		if (!globalStorageDir) {
			log("[Task#getCheckpointService] globalStorageDir not found, disabling checkpoints")
			darbot.enableCheckpoints = false
			return undefined
		}

		const options: CheckpointServiceOptions = {
			taskId: darbot.taskId,
			workspaceDir,
			shadowDir: globalStorageDir,
			log,
		}

		const service = RepoPerTaskCheckpointService.create(options)

		darbot.checkpointServiceInitializing = true

		service.on("initialize", () => {
			log("[Task#getCheckpointService] service initialized")

			try {
				const isCheckpointNeeded =
					typeof darbot.darbotMessages.find(({ say }) => say === "checkpoint_saved") === "undefined"

				darbot.checkpointService = service
				darbot.checkpointServiceInitializing = false

				if (isCheckpointNeeded) {
					log("[Task#getCheckpointService] no checkpoints found, saving initial checkpoint")
					checkpointSave(darbot)
				}
			} catch (err) {
				log("[Task#getCheckpointService] caught error in on('initialize'), disabling checkpoints")
				darbot.enableCheckpoints = false
			}
		})

		service.on("checkpoint", ({ isFirst, fromHash: from, toHash: to }) => {
			try {
				provider?.postMessageToWebview({ type: "currentCheckpointUpdated", text: to })

				darbot
					.say("checkpoint_saved", to, undefined, undefined, { isFirst, from, to }, undefined, {
						isNonInteractive: true,
					})
					.catch((err) => {
						log("[Task#getCheckpointService] caught unexpected error in say('checkpoint_saved')")
						console.error(err)
					})
			} catch (err) {
				log("[Task#getCheckpointService] caught unexpected error in on('checkpoint'), disabling checkpoints")
				console.error(err)
				darbot.enableCheckpoints = false
			}
		})

		log("[Task#getCheckpointService] initializing shadow git")

		service.initShadowGit().catch((err) => {
			log(`[Task#getCheckpointService] initShadowGit -> ${err.message}`)
			darbot.enableCheckpoints = false
		})

		return service
	} catch (err) {
		log(`[Task#getCheckpointService] ${err.message}`)
		darbot.enableCheckpoints = false
		return undefined
	}
}

async function getInitializedCheckpointService(
	darbot: Task,
	{ interval = 250, timeout = 15_000 }: { interval?: number; timeout?: number } = {},
) {
	const service = getCheckpointService(darbot)

	if (!service || service.isInitialized) {
		return service
	}

	try {
		await pWaitFor(
			() => {
				console.log("[Task#getCheckpointService] waiting for service to initialize")
				return service.isInitialized
			},
			{ interval, timeout },
		)

		return service
	} catch (err) {
		return undefined
	}
}

export async function checkpointSave(darbot: Task, force = false) {
	const service = getCheckpointService(darbot)

	if (!service) {
		return
	}

	if (!service.isInitialized) {
		const provider = darbot.providerRef.deref()
		provider?.log("[checkpointSave] checkpoints didn't initialize in time, disabling checkpoints for this task")
		darbot.enableCheckpoints = false
		return
	}

	TelemetryService.instance.captureCheckpointCreated(darbot.taskId)

	// Start the checkpoint process in the background.
	return service.saveCheckpoint(`Task: ${darbot.taskId}, Time: ${Date.now()}`, { allowEmpty: force }).catch((err) => {
		console.error("[Task#checkpointSave] caught unexpected error, disabling checkpoints", err)
		darbot.enableCheckpoints = false
	})
}

export type CheckpointRestoreOptions = {
	ts: number
	commitHash: string
	mode: "preview" | "restore"
}

export async function checkpointRestore(darbot: Task, { ts, commitHash, mode }: CheckpointRestoreOptions) {
	const service = await getInitializedCheckpointService(darbot)

	if (!service) {
		return
	}

	const index = darbot.darbotMessages.findIndex((m) => m.ts === ts)

	if (index === -1) {
		return
	}

	const provider = darbot.providerRef.deref()

	try {
		await service.restoreCheckpoint(commitHash)
		TelemetryService.instance.captureCheckpointRestored(darbot.taskId)
		await provider?.postMessageToWebview({ type: "currentCheckpointUpdated", text: commitHash })

		if (mode === "restore") {
			await darbot.overwriteApiConversationHistory(darbot.apiConversationHistory.filter((m) => !m.ts || m.ts < ts))

			const deletedMessages = darbot.darbotMessages.slice(index + 1)

			const { totalTokensIn, totalTokensOut, totalCacheWrites, totalCacheReads, totalCost } = getApiMetrics(
				darbot.combineMessages(deletedMessages),
			)

			await darbot.overwriteDarbotMessages(darbot.darbotMessages.slice(0, index + 1))

			// TODO: Verify that this is working as expected.
			await darbot.say(
				"api_req_deleted",
				JSON.stringify({
					tokensIn: totalTokensIn,
					tokensOut: totalTokensOut,
					cacheWrites: totalCacheWrites,
					cacheReads: totalCacheReads,
					cost: totalCost,
				} satisfies DarbotApiReqInfo),
			)
		}

		// The task is already cancelled by the provider beforehand, but we
		// need to re-init to get the updated messages.
		//
		// This was take from darbot's implementation of the checkpoints
		// feature. The darbot instance will hang if we don't cancel twice,
		// so this is currently necessary, but it seems like a complicated
		// and hacky solution to a problem that I don't fully understand.
		// I'd like to revisit this in the future and try to improve the
		// task flow and the communication between the webview and the
		// darbot instance.
		provider?.cancelTask()
	} catch (err) {
		provider?.log("[checkpointRestore] disabling checkpoints for this task")
		darbot.enableCheckpoints = false
	}
}

export type CheckpointDiffOptions = {
	ts: number
	previousCommitHash?: string
	commitHash: string
	mode: "full" | "checkpoint"
}

export async function checkpointDiff(darbot: Task, { ts, previousCommitHash, commitHash, mode }: CheckpointDiffOptions) {
	const service = await getInitializedCheckpointService(darbot)

	if (!service) {
		return
	}

	TelemetryService.instance.captureCheckpointDiffed(darbot.taskId)

	if (!previousCommitHash && mode === "checkpoint") {
		const previousCheckpoint = darbot.darbotMessages
			.filter(({ say }) => say === "checkpoint_saved")
			.sort((a, b) => b.ts - a.ts)
			.find((message) => message.ts < ts)

		previousCommitHash = previousCheckpoint?.text
	}

	try {
		const changes = await service.getDiff({ from: previousCommitHash, to: commitHash })

		if (!changes?.length) {
			vscode.window.showInformationMessage("No changes found.")
			return
		}

		await vscode.commands.executeCommand(
			"vscode.changes",
			mode === "full" ? "Changes since task started" : "Changes since previous checkpoint",
			changes.map((change) => [
				vscode.Uri.file(change.paths.absolute),
				vscode.Uri.parse(`${DIFF_VIEW_URI_SCHEME}:${change.paths.relative}`).with({
					query: Buffer.from(change.content.before ?? "").toString("base64"),
				}),
				vscode.Uri.parse(`${DIFF_VIEW_URI_SCHEME}:${change.paths.relative}`).with({
					query: Buffer.from(change.content.after ?? "").toString("base64"),
				}),
			]),
		)
	} catch (err) {
		const provider = darbot.providerRef.deref()
		provider?.log("[checkpointDiff] disabling checkpoints for this task")
		darbot.enableCheckpoints = false
	}
}


