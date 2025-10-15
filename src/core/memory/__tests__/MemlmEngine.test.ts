import { describe, it, expect, beforeEach } from "vitest"
import { MemlmEngine, type MemlmExecutionSummary, type MemlmExecutionStepLog } from "../MemlmEngine"

class FakeMemento {
	private store = new Map<string, unknown>()

	get<T>(key: string, defaultValue?: T): T | undefined {
		if (this.store.has(key)) {
			return this.store.get(key) as T
		}
		return defaultValue
	}

	update(key: string, value: unknown): Promise<void> {
		this.store.set(key, value)
		return Promise.resolve()
	}
}

describe("MemlmEngine", () => {
	let engine: MemlmEngine

	beforeEach(async () => {
		engine = new MemlmEngine({
			globalState: new FakeMemento() as any,
			workspaceState: new FakeMemento() as any,
		})
		await engine.initialize()
	})

	it("generates task context with recommended agents", async () => {
		const stepLog: MemlmExecutionStepLog = {
			executionId: "exec-1",
			stepId: "step-1",
			agentSlug: "coder",
			action: "Implement core API",
			success: true,
			cost: 0.12,
			order: 0,
			keywords: ["implement", "api", "endpoint"],
			outputSummary: "Added endpoint for project sync",
			signals: ["api"],
		}

		await engine.recordExecutionStep(stepLog)

		const summary: MemlmExecutionSummary = {
			executionId: "exec-1",
			success: true,
			userRequest: "Implement API endpoint for project sync",
			analysisSummary: "keywords: api, endpoint; context: Initial implementation",
			recommendations: ["Reuse coder agent"],
			errors: [],
		}

		await engine.finalizeExecution(summary)

		const context = await engine.getTaskContext("Implement project sync API", { domains: ["backend"] })

		expect(context.recommendedAgents.length).toBeGreaterThan(0)
		expect(context.recommendedAgents[0].slug).toBe("coder")
		expect(context.relatedMemories.length).toBeGreaterThan(0)
		expect(context.summary).toContain("keywords")
	})

	it("records unsuccessful steps and surfaces signals", async () => {
		const failingStep: MemlmExecutionStepLog = {
			executionId: "exec-2",
			stepId: "step-1",
			agentSlug: "tester",
			action: "Run smoke tests",
			success: false,
			order: 0,
			keywords: ["test", "smoke"],
			signals: ["tests"],
		}

		await engine.recordExecutionStep(failingStep)
		await engine.finalizeExecution({
			executionId: "exec-2",
			success: false,
			userRequest: "Validate smoke suite",
			analysisSummary: "keywords: smoke, tester",
			recommendations: [],
			errors: ["Smoke run failed"],
		})

		const context = await engine.getTaskContext("Investigate smoke test failure", {})

		expect(context.signals).toContain("tests")
		expect(context.relatedMemories.some((memory) => memory.agentSlug === "tester")).toBe(true)
	})
})
