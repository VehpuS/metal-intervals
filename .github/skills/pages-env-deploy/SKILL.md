---
name: pages-env-deploy
description: 'Adjust GitHub Pages deployment, Vite base path handling, or VITE_SHEET_CSV_URL configuration in metal-intervals. Use when changing deploy.yml, vite.config.ts, .env.example, npm build behavior, or local versus Pages environment setup.'
argument-hint: '[describe the deploy or env change]'
---

# Pages Env And Deploy

## When To Use
- Change GitHub Pages build or deployment behavior.
- Update how the app resolves `VITE_SHEET_CSV_URL` locally or in CI.
- Modify Vite base path logic for Pages hosting.
- Sync `.env.example`, workflow settings, and local build expectations.

## Relevant Files
- `.github/workflows/deploy.yml`
- `vite.config.ts`
- `.env.example`
- `package.json`
- `playwright.config.ts`

## Procedure
1. Keep local development, Playwright, and production builds aligned around `VITE_SHEET_CSV_URL`. Playwright uses a mock CSV URL on port `5174`; production builds need a real CSV URL.
2. Preserve the current `vite.config.ts` behavior: when running in GitHub Actions with `GITHUB_REPOSITORY` set, derive `base` from the repository name; otherwise use `/`.
3. In `.github/workflows/deploy.yml`, prefer repository variables or secrets for `VITE_SHEET_CSV_URL` before the hardcoded fallback URL.
4. Do not hand-edit `dist/`; rebuild it through the normal build path.
5. Validate deployment-related changes with `VITE_SHEET_CSV_URL="..." npm run build`. Run `npm run test:e2e` as well if the change affects routing, base paths, or how the app fetches sheet data in the browser.