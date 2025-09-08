import React from "react"
import { render, screen } from "@/utils/test-utils"

import DarbotTips from "../DarbotTips"

vi.mock("react-i18next", () => ({
	useTranslation: () => ({
		t: (key: string) => key, // Simple mock that returns the key
	}),
}))

vi.mock("../../vscode-components", () => ({
	VSCodeLink: ({ href, children }: { href: string; children: React.ReactNode }) => <a href={href}>{children}</a>,
}))

describe("DarbotTips Component", () => {
	beforeEach(() => {
		vi.useFakeTimers()
	})

	afterEach(() => {
		vi.runOnlyPendingTimers()
		vi.useRealTimers()
	})

	describe("when cycle is false (default)", () => {
		beforeEach(() => {
				render(<DarbotTips cycle={false} />)
		})

		test("renders only the top two tips", () => {
			// Ensure only two tips are present (check by link role)
			expect(screen.getAllByRole("link")).toHaveLength(2)
		})
	})
})
