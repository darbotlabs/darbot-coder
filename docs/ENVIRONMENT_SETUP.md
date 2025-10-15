# Environment Configuration Guide

This guide explains how to configure environment variables for the different parts of the **darbot-coder** monorepo. Copy the provided examples into local `.env` or `.env.local` files and update the placeholders with your own credentials. Never commit real secrets to the repository.

## Repository Root (`./.env`)

The root `.env` demonstrates every supported AI and infrastructure integration. Treat it as a catalogue of optional providers rather than a minimum required list. When running the VS Code extension locally you should:

- Copy `./.env` to `./.env.local` (ignored by git).
- Remove any providers you do not use.
- Populate only the keys required by your chosen model providers (Azure OpenAI, Foundry, GitHub, Dataverse, etc.).

**Required for basic operation**

- `MODEL_PROVIDER` – Provider identifier (`azure`, `foundry`, etc.).
- `AOAI_API_VERSION` – API version for Azure OpenAI compatible endpoints.
- A matching set of credentials for at least one LLM provider (for example `LLM_AOAI_RESOURCE`, `LLM_DEPLOYMENT`, `LLM_AOAI_API_KEY`).

**Optional integrations**

- Vision / image generation (`SORA_*`, `IMAGEGEN_*`, `FOUNDRY_*`, `GPT_IMAGE_1_*`).
- Model router and experimental GPT-5 family deployments (`MODEL_ROUTER_*`, `GPT_5_*`, `O4_MINI_*`).
- Foundry and Grok access (`FOUNDRY_*`, `GROK_*`).
- Dataverse storage (`DATAVERSE_*`).
- GitHub automation (`GITHUB_TOKEN`, `GITHUB_REPO_*`).

> **Tip:** Keep a minimal `.env.local` that only contains the providers you actively use. Refer back to the committed `.env` when you need to enable additional integrations.

## Marketing Website (`apps/web-darbot-coder`)

Copy `apps/web-darbot-coder/.env.example` to `.env.local` in the same directory and adjust the values.

| Variable | Required | Description |
| --- | --- | --- |
| `GITHUB_API_TOKEN` | Recommended | Server-side GitHub PAT used to fetch repository statistics without hitting rate limits. Grant only `public_repo` scope. |
| `NEXT_PUBLIC_GITHUB_TOKEN` | Optional | Public fallback for GitHub stats. Only set if you intentionally expose a low-privilege token to the browser. |
| `NEXT_PUBLIC_POSTHOG_KEY` | Optional | PostHog API key. Leave empty to disable analytics. |
| `NEXT_PUBLIC_POSTHOG_HOST` | Optional | Custom PostHog host. Defaults to `https://us.i.posthog.com`. |
| `NEXT_PUBLIC_BASIN_ENDPOINT` | Optional | Form submission endpoint (e.g. a usebasin.com form URL). Required for the enterprise contact form. |

## Evaluations Dashboard (`apps/web-evals`)

Copy `apps/web-evals/.env.example` to `.env.local` and configure the following keys:

| Variable | Required | Description |
| --- | --- | --- |
| `DATABASE_URL` | Required | PostgreSQL connection string used by the evaluations dashboard. |
| `REDIS_URL` | Optional | Redis connection string enabling request caching. Leave blank to disable. |

## Extension Webview (`webview-ui`)

The webview package does not consume any runtime environment variables. All configuration is delivered via messages from the extension.

## Best Practices

- Keep `.env`, `.env.local`, and other secret files out of version control. Templates ending in `.env.example` are intentionally tracked to document required keys.
- Prefer per-package `.env.local` files so that each application can be deployed independently.
- Regenerate API tokens regularly and restrict scopes to the smallest surface area required.
- When running in CI, inject secrets via the pipeline provider rather than committing them to the repository.

By maintaining these environment templates you ensure new contributors can set up the project quickly while keeping production credentials secure.
