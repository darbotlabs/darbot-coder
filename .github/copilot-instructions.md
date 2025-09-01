# Copilot Instructions for darbot-coder

## Project Overview

This is **darbot-coder**, an AI-powered autonomous coding agent VSCode extension built on sophisticated agent orchestration. It's a complex monorepo with multiple apps, packages, and advanced AI orchestration capabilities.

## Architecture & Key Components

### Monorepo Structure
- **`src/`** - Main VSCode extension code (entry point: `extension.ts`)
- **`webview-ui/`** - React webview interface using Vite
- **`apps/`** - Additional applications (`vscode-nightly`, `web-darbot-coder`, `web-evals`)  
- **`packages/`** - Shared utilities (`types`, `telemetry`, `cloud`, `ipc`, etc.)
- **`tests/`** - Validation and test suites

### Build System
- **pnpm workspace** with Turborepo for monorepo management
- **esbuild** for extension bundling (`src/esbuild.mjs`, `apps/vscode-nightly/esbuild.mjs`)
- **Vitest** for testing across the codebase
- Build commands: `pnpm build`, `pnpm bundle`, `pnpm vsix`

### Critical Core Systems

#### AI Orchestration Engine (`src/core/orchestration/`)
- **WorkflowTemplateEngine** - Pre-defined multi-agent workflows (8 built-in templates)
- **ParallelTaskManager** - Advanced parallel execution with dependency resolution
- **Task.ts** - Enhanced with parallel execution support and retry logic
- Agent types: `architect`, `coder`, `tester`, `security`, `docs`

#### Custom Mode System (`.darbotmodes`)
- XML-based mode definitions with role specialization
- File regex restrictions for targeted editing permissions
- Tool group assignments (`read`, `edit`, `command`, `browser`, `mcp`)

## Development Patterns

### File Organization Conventions
- Core logic in `src/core/` with feature-based subdirectories
- Services in `src/services/` (mcp, code-index, mdm)
- Integrations in `src/integrations/` (terminal, editor)
- Utilities in `src/utils/`
- Types centralized in `packages/types/`

### Testing Approach
- **Vitest** configuration in `vitest.config.ts` files
- Test files: `__tests__/`, `*.test.ts`, `*.spec.ts`
- Test command: `pnpm test` (uses Turbo)
- Integration tests in `apps/vscode-e2e/` with command: `npm run test:run`

### Build & Bundle Workflow
```bash
# Development
pnpm install          # Install all workspace dependencies
pnpm build           # Build all packages 
pnpm bundle          # Bundle extension for development
F5                   # Run extension in new VS Code window

# Production
pnpm vsix            # Create VSIX package in bin/
pnpm install:vsix    # Build and install VSIX automatically
```

### TypeScript & ESLint Setup
- TypeScript 5.8.3 with strict configuration
- ESLint v9 with custom config packages
- Shared configs in `packages/config-typescript/` and `packages/config-eslint/`

## Key Development Commands

**Never use `npm test` directly** - it doesn't exist. Use:
- `pnpm test` (from root)
- `cd apps/vscode-e2e && npm run test:run` (for E2E tests)
- `TEST_FILE="filename.test" npm run test:run` (specific test file)

## Critical Integration Points

### MCP (Model Context Protocol)
- Server management in `src/services/mcp/McpServerManager.ts`
- External tool integrations via MCP servers

### VS Code Extension APIs
- Main extension entry: `src/extension.ts`
- Webview providers in `src/core/webview/`
- Commands registered in `src/activate/`
- Configuration in `src/package.json` (contributes section)

### Internationalization
- Multi-language support via `package.nls.*.json` files
- i18n system in `src/i18n/`

## When Working on This Codebase

1. **Always check existing workflow templates** in `WorkflowTemplateEngine.ts` before creating new orchestration logic
2. **Use the custom mode system** - check `.darbotmodes` for specialized editing permissions
3. **Follow the esbuild pipeline** - changes to core extension require bundling
4. **Test incrementally** - run tests after changes to catch issues early
5. **Respect the monorepo structure** - use workspace dependencies, not relative imports across packages

## Common Gotchas

- Extension bundling required for VS Code testing (F5 or `pnpm bundle`)
- E2E tests must run from `apps/vscode-e2e/` directory with specific npm scripts
- Locale files are auto-copied during build - don't edit in dist/
- WebAssembly files need special copy handling in esbuild plugins