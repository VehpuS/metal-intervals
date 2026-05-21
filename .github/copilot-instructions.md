# Project Guidelines

## Stack And Structure

- This repo is a Vite + React 19 + TypeScript app with Tailwind v4 utilities.
- `src/components/AppFetcher.tsx` owns loading and error states and reads `import.meta.env.VITE_SHEET_CSV_URL`.
- `src/components/metalEarGymData.ts` is the single place for sheet row normalization, carry-forward interval and direction logic, and YouTube link classification.
- `src/components/MetalEarGymApp.tsx` owns search state, selected intervals, drawer state, and the active header label and count.
- Keep parsing and data-shaping logic out of presentation components. UI changes should stay near the relevant component in `src/components/`.

## Working Conventions

- Preserve the current dark, metal-themed visual language and the existing Tailwind-first styling approach.
- Keep accessible names stable unless the task explicitly includes test updates. Playwright relies on role and name queries such as `Show interval drawer`, `Hide interval drawer`, `All Intervals`, `Void Detected`, the search placeholder, and the `Play` title.
- For Playwright triage, run the smallest failing slice first and read only the concise failure output plus the matching `test-results/<case>/error-context.md` file. Do not dump full suite output or read the entire `test-results/` tree into context.
- Do not edit generated or captured artifacts unless the task is specifically about them: `dist/`, `test-results/`, `.playwright-mcp/`, and checked-in `*.png` screenshots.
- When changing CSV parsing or loader behavior, add or update focused Vitest coverage in `src/components/__tests__/`.
- When changing responsive layout, search or filter behavior, sidebar interactions, or visible copy, run or update the Playwright coverage in `e2e/app.spec.ts`.

## Build And Validation

- Install dependencies with `npm ci`.
- Use `npm run dev` for local development.
- Use `npm run test` for unit and component coverage.
- Use `npm run test:e2e` for interaction and responsive coverage. The Playwright config starts Vite on port `5174` and injects a mock CSV URL.
- Use `VITE_SHEET_CSV_URL="..." npm run build` for production build validation.
- For Pages or path-related changes, keep `vite.config.ts` deriving `base` from `GITHUB_REPOSITORY` and keep `.github/workflows/deploy.yml` sourcing `VITE_SHEET_CSV_URL` from repo variables or secrets before falling back to the published Google Sheet URL.

## Change Preferences

- Prefer small, localized edits with tests close to the affected behavior.
- Preserve the current sheet column format unless the task explicitly includes a schema change.
- If UI text changes break role or name based tests, update the tests in the same change.
