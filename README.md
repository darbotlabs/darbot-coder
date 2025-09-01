# 🤖 darbot-coder

> **AI Agent Orchestration Platform for Software Development**

## 🙏 **Attribution & Inspiration**

**darbot-coder is a research prototype**, an excellent VSCode extension for AI-assisted coding. We are deeply grateful to the original development team for their foundational work and open-source contribution that made this orchestration platform possible.

**darbot-coder** builds a foundation to create an AI agent orchestration platform that embodies the **darbotian philosophy**: *"Proficiency and determination through ethical results driven outcomes."*

**Key enhancements:**
- **Multi-agent coordination** for complex workflows
- **Intelligent task orchestration** with parallel execution
- **Cost optimization** through smart routing
- **Darbotian philosophy** integration for ethical AI development
<br>
<br>

<div align="center">


</div>

**darbot-coder** is an AI-powered **autonomous coding agent** that lives in your editor. This research platform can:

- Communicate in natural language
- Read and write files directly in your workspace
- Run terminal commands
- Automate browser actions
- Integrate with any OpenAI-compatible or custom API/model
- Adapt its “personality” and capabilities through **Custom Modes**

Whether you’re seeking a flexible coding partner, a system architect, or specialized roles like a QA engineer or product manager, darbot-coder can help you build software more efficiently.


---


## What Can darbot-coder Do?

- 🚀 **Generate Code** from natural language descriptions
- 🔧 **Refactor & Debug** existing code
- 📝 **Write & Update** documentation
- 🤔 **Answer Questions** about your codebase
- 🔄 **Automate** repetitive tasks
- 🏗️ **Create** new files and projects


## Key Features

### Multiple Modes



- **Code Mode:** For general-purpose coding tasks
- **Architect Mode:** For planning and technical leadership
- **Ask Mode:** For answering questions and providing information
- **Debug Mode:** For systematic problem diagnosis
- **[Custom Modes](https://docs.darbotcoder.com/advanced-usage/custom-modes):** Create unlimited specialized personas for security auditing, performance optimization, documentation, or any other task

### Smart Tools

darbot-coder comes with powerful tools that can:

- Read and write files in your project
- Execute commands in your VS Code terminal
- Control a web browser
- Use external tools via [MCP (Model Context Protocol)](https://docs.darbotcoder.com/advanced-usage/mcp)

MCP extends darbot-coder's capabilities by allowing you to add unlimited custom tools. Integrate with external APIs, connect to databases, or create specialized development tools - MCP provides the framework to expand darbot-coder's functionality to meet your specific needs.

### Customization

Make darbot-coder work your way with:

- [Custom Instructions](https://docs.darbotcoder.com/advanced-usage/custom-instructions) for personalized behavior
- [Custom Modes](https://docs.darbotcoder.com/advanced-usage/custom-modes) for specialized tasks
- [Local Models](https://docs.darbotcoder.com/advanced-usage/local-models) for offline use
- [Auto-Approval Settings](https://docs.darbotcoder.com/advanced-usage/auto-approving-actions) for faster workflows

## Resources

### Documentation

- [Basic Usage Guide](https://docs.darbotcoder.com/basic-usage/the-chat-interface)
- [Advanced Features](https://docs.darbotcoder.com/advanced-usage/auto-approving-actions)
- [Frequently Asked Questions](https://docs.darbotcoder.com/faq)

### Community

- **Discord:** [Join our Discord server](https://discord.gg/darbotcoder) for real-time help and discussions
- **Reddit:** [Visit our subreddit](https://www.reddit.com/r/DarbotCoder) to share experiences and tips
- **GitHub:** Report [issues](https://github.com/darbotlabs/darbot-coder/issues) or request [features](https://github.com/darbotlabs/darbot-coder/discussions/categories/feature-requests)

---

## Local Setup & Development

1. **Clone** the repo:

```sh
git clone https://github.com/darbotlabs/darbot-coder
```

2. **Install dependencies**:

```sh
pnpm install
```

3. **Run the extension**:

There are several ways to run the darbot-coder extension:

### Development Mode (F5)

For active development, use VSCode's built-in debugging:

Press `F5` (or go to **Run** → **Start Debugging**) in VSCode. This will open a new VSCode window with the darbot-coder extension running.

- Changes to the webview will appear immediately.
- Changes to the core extension will also hot reload automatically.

### Automated VSIX Installation

To build and install the extension as a VSIX package directly into VSCode:

```sh
pnpm install:vsix [-y] [--editor=<command>]
```

This command will:

- Ask which editor command to use (code/cursor/code-insiders) - defaults to 'code'
- Uninstall any existing version of the extension.
- Build the latest VSIX package.
- Install the newly built VSIX.
- Prompt you to restart VS Code for changes to take effect.

Options:

- `-y`: Skip all confirmation prompts and use defaults
- `--editor=<command>`: Specify the editor command (e.g., `--editor=cursor` or `--editor=code-insiders`)

### Manual VSIX Installation

If you prefer to install the VSIX package manually:

1.  First, build the VSIX package:
    ```sh
    pnpm vsix
    ```
2.  A `.vsix` file will be generated in the `bin/` directory (e.g., `bin/darbot-coder-<version>.vsix`).
3.  Install it manually using the VSCode CLI:
    ```sh
    code --install-extension bin/darbot-coder-<version>.vsix
    ```

---

## Disclaimer

**Please note** that Darbot Framework does **not** make any representations or warranties regarding any code, models, or other tools provided or made available in connection with darbot-coder, any associated third-party tools, or any resulting outputs. You assume **all risks** associated with the use of any such tools or outputs; such tools are provided on an **"AS IS"** and **"AS AVAILABLE"** basis. Such risks may include, without limitation, intellectual property infringement, cyber vulnerabilities or attacks, bias, inaccuracies, errors, defects, viruses, downtime, property loss or damage, and/or personal injury. You are solely responsible for your use of any such tools or outputs (including, without limitation, the legality, appropriateness, and results thereof).

---



