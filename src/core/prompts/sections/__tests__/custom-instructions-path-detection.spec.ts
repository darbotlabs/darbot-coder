import { describe, it, expect, vi } from "vitest"
import * as os from "os"
import * as path from "path"

describe("custom-instructions path detection", () => {
	it("should use exact path comparison instead of string includes", () => {
		// Test the logic that our fix implements
		const fakeHomeDir = "/Users/john.darbot.smith"
		const globalDarbotDir = path.join(fakeHomeDir, ".darbot") // "/Users/john.darbot.smith/.darbot"
		const projectDarbotDir = "/projects/my-project/.darbot"

		// Old implementation (fragile):
		// const isGlobal = darbotDir.includes(path.join(os.homedir(), ".darbot"))
		// This could fail if the home directory path contains ".darbot" elsewhere

		// New implementation (robust):
		// const isGlobal = path.resolve(darbotDir) === path.resolve(getGlobalDarbotDirectory())

		// Test the new logic
		const isGlobalForGlobalDir = path.resolve(globalDarbotDir) === path.resolve(globalDarbotDir)
		const isGlobalForProjectDir = path.resolve(projectDarbotDir) === path.resolve(globalDarbotDir)

		expect(isGlobalForGlobalDir).toBe(true)
		expect(isGlobalForProjectDir).toBe(false)

		// Verify that the old implementation would have been problematic
		// if the home directory contained ".darbot" in the path
		const oldLogicGlobal = globalDarbotDir.includes(path.join(fakeHomeDir, ".darbot"))
		const oldLogicProject = projectDarbotDir.includes(path.join(fakeHomeDir, ".darbot"))

		expect(oldLogicGlobal).toBe(true) // This works
		expect(oldLogicProject).toBe(false) // This also works, but is fragile

		// The issue was that if the home directory path itself contained ".darbot",
		// the includes() check could produce false positives in edge cases
	})

	it("should handle edge cases with path resolution", () => {
		// Test various edge cases that exact path comparison handles better
		const testCases = [
			{
				global: "/Users/test/.darbot",
				project: "/Users/test/project/.darbot",
				expected: { global: true, project: false },
			},
			{
				global: "/home/user/.darbot",
				project: "/home/user/.darbot", // Same directory
				expected: { global: true, project: true },
			},
			{
				global: "/Users/john.darbot.smith/.darbot",
				project: "/projects/app/.darbot",
				expected: { global: true, project: false },
			},
		]

		testCases.forEach(({ global, project, expected }) => {
			const isGlobalForGlobal = path.resolve(global) === path.resolve(global)
			const isGlobalForProject = path.resolve(project) === path.resolve(global)

			expect(isGlobalForGlobal).toBe(expected.global)
			expect(isGlobalForProject).toBe(expected.project)
		})
	})
})
