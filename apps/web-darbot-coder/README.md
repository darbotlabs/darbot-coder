# Web Marketing Site

The `apps/web-darbot-coder` package hosts the public marketing site for darbot-coder (Next.js 15). It surfaces live GitHub and VS Code Marketplace statistics alongside product copy.

## Environment Variables

| Variable | Required | Description |
| --- | --- | --- |
| `NEXT_PUBLIC_POSTHOG_KEY` | No | Public PostHog client key. When omitted, analytics are disabled and the bundle skips loading PostHog. |
| `NEXT_PUBLIC_POSTHOG_HOST` | No | Custom PostHog ingest URL. Defaults to `https://us.i.posthog.com` when `NEXT_PUBLIC_POSTHOG_KEY` is present. |
| `NEXT_PUBLIC_BASIN_ENDPOINT` | Yes (forms) | Basin endpoint for marketing form submissions. |

Analytics are entirely optional: leaving `NEXT_PUBLIC_POSTHOG_KEY` empty keeps the tracking bundle out of the client build, avoids console warnings, and still renders the site.

## Runtime Stat Fetching

- GitHub star counts cache for 15 minutes and automatically fall back to the last known value when the API rate limits or returns invalid payloads.
- VS Code Marketplace downloads, ratings, and recent reviews share a single query with schema validation, logging, and cached fallbacks. Missing fields render as `Unavailable` with accessible tooltips.
- All stat helpers expose structured data (`source`, `message`, `label`) so UI components can show tooltips or screen-reader hints when live data is unavailable.

## Commands

```sh
pnpm --filter @darbot-code/web-darbot-coder dev   # start Next dev server
pnpm --filter @darbot-code/web-darbot-coder build # production build
pnpm --filter @darbot-code/web-darbot-coder test  # run Vitest suite
```
