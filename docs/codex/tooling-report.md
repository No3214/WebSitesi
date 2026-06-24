# Codex Tooling Report

Date: 2026-06-24

## Stack Detected

- Next.js 15.5.x
- React 19
- Payload CMS 3
- Tailwind CSS 4
- npm 11.8.0
- Node 24.x
- Playwright, Vitest, Storybook, Remotion

## Skills Applied In This Pass

- Kozbeyli hospitality operations: brand, media provenance, booking, and launch risk lens.
- Frontend design: premium, domain-specific visual direction and mobile UX lens.
- React best practices: component, accessibility, and performance checklist.
- shadcn guidance: use primitives deliberately, avoid blind component installs.
- Vercel verification guidance: verify full browser to API to deployment story with evidence.

## MCP Configuration

Project file: `.codex/config.toml`

- `shadcn`: enabled, project-scoped, optional. Restart Codex before expecting the MCP tools to be live.
- `chrome-devtools`: enabled, project-scoped, optional, with usage statistics disabled and network header redaction requested.
- `magic`: present but disabled because no `API_KEY` is available and it is optional.
- `motion-ai`: not declared as an MCP server because the official entrypoint is an installer (`npx motion-ai`) that requires Motion+ authentication.

Guard command:

```powershell
npm run codex:tooling
```

This verifies the project MCP config, Motion installer guard, Codex docs, AGENTS.md tooling rules and package scripts without running an interactive installer.

## Motion AI Kit Status

Official install command checked:

```powershell
npx -y motion-ai --help
```

Result: `motion-ai 13.1.0` is reachable and documents `MOTION_TOKEN` as the pre-fill environment variable. This session has no `MOTION_TOKEN`, so the installer was not run to avoid an unauthenticated interactive write.

Activation gate:

```powershell
$env:MOTION_TOKEN="<Motion+ API key>"
npx motion-ai
```

After the installer proposes file changes, review the diff before committing. Do not use Motion-generated assets as hotel product proof.

## Vercel CLI Note

Repo scripts can verify production endpoints and Vercel readiness evidence. This desktop session still treats Vercel CLI availability as an operator prerequisite: if the user's terminal cannot run Vercel commands, install and authenticate explicitly:

```powershell
npm i -g vercel
vercel login
```

## Tooling Rollback

- Remove or disable the relevant block in `.codex/config.toml`.
- Restart Codex.
- Re-run `npm run domain:verify:json` and `npm run readiness:summary:json` if release evidence is affected.
