// npx vitest run src/__tests__/index.test.ts

import { generatePackageJson } from "../index.js"

describe("generatePackageJson", () => {
	it("should be a test", () => {
		const generatedPackageJson = generatePackageJson({
			packageJson: {
				name: "darbot-coder",
				displayName: "%extension.displayName%",
				description: "%extension.description%",
				publisher: "DarbotLabs",
				version: "3.17.2",
				icon: "assets/icons/icon.png",
				contributes: {
					viewsContainers: {
						activitybar: [
							{
								id: "darbot-coder-ActivityBar",
								title: "%views.activitybar.title%",
								icon: "assets/icons/icon.svg",
							},
						],
					},
					views: {
						"darbot-coder-ActivityBar": [
							{
								type: "webview",
								id: "darbot-coder.SidebarProvider",
								name: "",
							},
						],
					},
					commands: [
						{
							command: "darbot-coder.plusButtonClicked",
							title: "%command.newTask.title%",
							icon: "$(add)",
						},
						{
							command: "darbot-coder.openInNewTab",
							title: "%command.openInNewTab.title%",
							category: "%configuration.title%",
						},
					],
					menus: {
						"editor/context": [
							{
								submenu: "darbot-coder.contextMenu",
								group: "navigation",
							},
						],
						"darbot-coder.contextMenu": [
							{
								command: "darbot-coder.addToContext",
								group: "1_actions@1",
							},
						],
						"editor/title": [
							{
								command: "darbot-coder.plusButtonClicked",
								group: "navigation@1",
								when: "activeWebviewPanelId == darbot-coder.TabPanelProvider",
							},
							{
								command: "darbot-coder.settingsButtonClicked",
								group: "navigation@6",
								when: "activeWebviewPanelId == darbot-coder.TabPanelProvider",
							},
							{
								command: "darbot-coder.accountButtonClicked",
								group: "navigation@6",
								when: "activeWebviewPanelId == darbot-coder.TabPanelProvider",
							},
						],
					},
					submenus: [
						{
							id: "darbot-coder.contextMenu",
							label: "%views.contextMenu.label%",
						},
						{
							id: "darbot-coder.terminalMenu",
							label: "%views.terminalMenu.label%",
						},
					],
					configuration: {
						title: "%configuration.title%",
						properties: {
							"darbot-coder.allowedCommands": {
								type: "array",
								items: {
									type: "string",
								},
								default: ["npm test", "npm install", "tsc", "git log", "git diff", "git show"],
								description: "%commands.allowedCommands.description%",
							},
							"darbot-coder.customStoragePath": {
								type: "string",
								default: "",
								description: "%settings.customStoragePath.description%",
							},
						},
					},
				},
				scripts: {
					lint: "eslint **/*.ts",
				},
			},
			overrideJson: {
				name: "darbot-coder-nightly",
				displayName: "Darbot Code Nightly",
				publisher: "DarbotLabs",
				version: "0.0.1",
				icon: "assets/icons/icon-nightly.png",
				scripts: {},
			},
			substitution: ["darbot-coder", "darbot-coder-nightly"],
		})

		expect(generatedPackageJson).toStrictEqual({
			name: "darbot-coder-nightly",
			displayName: "Darbot Code Nightly",
			description: "%extension.description%",
			publisher: "DarbotLabs",
			version: "0.0.1",
			icon: "assets/icons/icon-nightly.png",
			contributes: {
				viewsContainers: {
					activitybar: [
						{
							id: "darbot-coder-nightly-ActivityBar",
							title: "%views.activitybar.title%",
							icon: "assets/icons/icon.svg",
						},
					],
				},
				views: {
					"darbot-coder-nightly-ActivityBar": [
						{
							type: "webview",
							id: "darbot-coder-nightly.SidebarProvider",
							name: "",
						},
					],
				},
				commands: [
					{
						command: "darbot-coder-nightly.plusButtonClicked",
						title: "%command.newTask.title%",
						icon: "$(add)",
					},
					{
						command: "darbot-coder-nightly.openInNewTab",
						title: "%command.openInNewTab.title%",
						category: "%configuration.title%",
					},
				],
				menus: {
					"editor/context": [
						{
							submenu: "darbot-coder-nightly.contextMenu",
							group: "navigation",
						},
					],
					"darbot-coder-nightly.contextMenu": [
						{
							command: "darbot-coder-nightly.addToContext",
							group: "1_actions@1",
						},
					],
					"editor/title": [
						{
							command: "darbot-coder-nightly.plusButtonClicked",
							group: "navigation@1",
							when: "activeWebviewPanelId == darbot-coder-nightly.TabPanelProvider",
						},
						{
							command: "darbot-coder-nightly.settingsButtonClicked",
							group: "navigation@6",
							when: "activeWebviewPanelId == darbot-coder-nightly.TabPanelProvider",
						},
						{
							command: "darbot-coder-nightly.accountButtonClicked",
							group: "navigation@6",
							when: "activeWebviewPanelId == darbot-coder-nightly.TabPanelProvider",
						},
					],
				},
				submenus: [
					{
						id: "darbot-coder-nightly.contextMenu",
						label: "%views.contextMenu.label%",
					},
					{
						id: "darbot-coder-nightly.terminalMenu",
						label: "%views.terminalMenu.label%",
					},
				],
				configuration: {
					title: "%configuration.title%",
					properties: {
						"darbot-coder-nightly.allowedCommands": {
							type: "array",
							items: {
								type: "string",
							},
							default: ["npm test", "npm install", "tsc", "git log", "git diff", "git show"],
							description: "%commands.allowedCommands.description%",
						},
						"darbot-coder-nightly.customStoragePath": {
							type: "string",
							default: "",
							description: "%settings.customStoragePath.description%",
						},
					},
				},
			},
			scripts: {},
		})
	})
})
