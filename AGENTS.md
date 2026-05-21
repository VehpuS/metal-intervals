# Metal Intervals Agent Guide

Detailed repo guidance lives in `.github/copilot-instructions.md`. Keep this file aligned with that guidance so open-standard tooling and Copilot behave the same way.

## Project Facts

- The app uses Vite, React 19, TypeScript, and Tailwind v4.
- Runtime data comes from `VITE_SHEET_CSV_URL` and is loaded in `src/components/AppFetcher.tsx`.
- Parser and normalization logic belong in `src/components/metalEarGymData.ts`.
- Search, interval selection, and drawer state belong in `src/components/MetalEarGymApp.tsx`.

## Guardrails

- Preserve accessible labels and headings that Playwright asserts in `e2e/app.spec.ts` unless tests are updated in the same change.
- When debugging Playwright failures, prefer a single file, project, or `--grep` run and inspect only the matching `test-results/<case>/error-context.md` artifact instead of broad log dumps.
- Treat `dist/`, `test-results/`, `.playwright-mcp/`, and checked-in screenshots as generated artifacts, not normal edit targets.
- Keep data-shaping concerns separate from UI presentation concerns.
- For GitHub Pages changes, preserve the `vite.config.ts` base path logic and the workflow fallback order for `VITE_SHEET_CSV_URL` in `.github/workflows/deploy.yml`.

## Validation

- Run `npm run test` for parser, presentation helper, and component logic changes.
- Run `npm run test:e2e` for search, sidebar, responsive layout, or interaction changes.
- Run `VITE_SHEET_CSV_URL="..." npm run build` for env, build, or deployment changes.
