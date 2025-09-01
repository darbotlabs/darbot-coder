import path from "path"
import { RooProtectedController } from "../RooProtectedController"

describe("RooProtectedController", () => {
	const TEST_CWD = "/test/workspace"
	let controller: RooProtectedController

	beforeEach(() => {
		controller = new RooProtectedController(TEST_CWD)
	})

	describe("isWriteProtected", () => {
		it("should protect .darbotignore file", () => {
			expect(controller.isWriteProtected(".darbotignore")).toBe(true)
		})

		it("should protect files in .darbot directory", () => {
			expect(controller.isWriteProtected(".darbot/config.json")).toBe(true)
			expect(controller.isWriteProtected(".darbot/settings/user.json")).toBe(true)
			expect(controller.isWriteProtected(".darbot/modes/custom.json")).toBe(true)
		})

		it("should protect .darbotprotected file", () => {
			expect(controller.isWriteProtected(".darbotprotected")).toBe(true)
		})

		it("should protect .darbotmodes files", () => {
			expect(controller.isWriteProtected(".darbotmodes")).toBe(true)
		})

		it("should protect .darbotrules* files", () => {
			expect(controller.isWriteProtected(".darbotrules")).toBe(true)
			expect(controller.isWriteProtected(".darbotrules.md")).toBe(true)
		})

		it("should protect .clinerules* files", () => {
			expect(controller.isWriteProtected(".clinerules")).toBe(true)
			expect(controller.isWriteProtected(".clinerules.md")).toBe(true)
		})

		it("should protect files in .vscode directory", () => {
			expect(controller.isWriteProtected(".vscode/settings.json")).toBe(true)
			expect(controller.isWriteProtected(".vscode/launch.json")).toBe(true)
			expect(controller.isWriteProtected(".vscode/tasks.json")).toBe(true)
		})

		it("should not protect other files starting with .darbot", () => {
			expect(controller.isWriteProtected(".darbotsettings")).toBe(false)
			expect(controller.isWriteProtected(".darbotconfig")).toBe(false)
		})

		it("should not protect regular files", () => {
			expect(controller.isWriteProtected("src/index.ts")).toBe(false)
			expect(controller.isWriteProtected("package.json")).toBe(false)
			expect(controller.isWriteProtected("README.md")).toBe(false)
		})

		it("should not protect files that contain 'roo' but don't start with .darbot", () => {
			expect(controller.isWriteProtected("src/roo-utils.ts")).toBe(false)
			expect(controller.isWriteProtected("config/roo.config.js")).toBe(false)
		})

		it("should handle nested paths correctly", () => {
			expect(controller.isWriteProtected(".darbot/config.json")).toBe(true) // .darbot/** matches at root
			expect(controller.isWriteProtected("nested/.darbotignore")).toBe(true) // .darbotignore matches anywhere by default
			expect(controller.isWriteProtected("nested/.darbotmodes")).toBe(true) // .darbotmodes matches anywhere by default
			expect(controller.isWriteProtected("nested/.darbotrules.md")).toBe(true) // .darbotrules* matches anywhere by default
		})

		it("should handle absolute paths by converting to relative", () => {
			const absolutePath = path.join(TEST_CWD, ".darbotignore")
			expect(controller.isWriteProtected(absolutePath)).toBe(true)
		})

		it("should handle paths with different separators", () => {
			expect(controller.isWriteProtected(".darbot\\config.json")).toBe(true)
			expect(controller.isWriteProtected(".darbot/config.json")).toBe(true)
		})
	})

	describe("getProtectedFiles", () => {
		it("should return set of protected files from a list", () => {
			const files = ["src/index.ts", ".darbotignore", "package.json", ".darbot/config.json", "README.md"]

			const protectedFiles = controller.getProtectedFiles(files)

			expect(protectedFiles).toEqual(new Set([".darbotignore", ".darbot/config.json"]))
		})

		it("should return empty set when no files are protected", () => {
			const files = ["src/index.ts", "package.json", "README.md"]

			const protectedFiles = controller.getProtectedFiles(files)

			expect(protectedFiles).toEqual(new Set())
		})
	})

	describe("annotatePathsWithProtection", () => {
		it("should annotate paths with protection status", () => {
			const files = ["src/index.ts", ".darbotignore", ".darbot/config.json", "package.json"]

			const annotated = controller.annotatePathsWithProtection(files)

			expect(annotated).toEqual([
				{ path: "src/index.ts", isProtected: false },
				{ path: ".darbotignore", isProtected: true },
				{ path: ".darbot/config.json", isProtected: true },
				{ path: "package.json", isProtected: false },
			])
		})
	})

	describe("getProtectionMessage", () => {
		it("should return appropriate protection message", () => {
			const message = controller.getProtectionMessage()
			expect(message).toBe("This is a Roo configuration file and requires approval for modifications")
		})
	})

	describe("getInstructions", () => {
		it("should return formatted instructions about protected files", () => {
			const instructions = controller.getInstructions()

			expect(instructions).toContain("# Protected Files")
			expect(instructions).toContain("write-protected")
			expect(instructions).toContain(".darbotignore")
			expect(instructions).toContain(".darbot/**")
			expect(instructions).toContain("\u{1F6E1}") // Shield symbol
		})
	})

	describe("getProtectedPatterns", () => {
		it("should return the list of protected patterns", () => {
			const patterns = RooProtectedController.getProtectedPatterns()

			expect(patterns).toEqual([
				".darbotignore",
				".darbotmodes",
				".darbotrules*",
				".clinerules*",
				".darbot/**",
				".vscode/**",
				".darbotprotected",
			])
		})
	})
})
