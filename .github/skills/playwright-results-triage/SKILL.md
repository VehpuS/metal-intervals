---
name: playwright-results-triage
description: "Run, narrow, and read Playwright failures in metal-intervals without filling the context window. Use when debugging e2e failures, interpreting error-context.md, scoping by --project or --grep, or deciding whether the fix belongs in app code or e2e/app.spec.ts."
argument-hint: "[describe the failing test, project, or behavior]"
---

# Playwright Results Triage

## When To Use

- A Playwright run is failing and the agent needs to extract the useful signal without pasting huge logs.
- The failure needs to be narrowed to one test, one project, or one interaction.
- The agent needs to read `error-context.md` and decide whether the bug is in the app or the test.

## Relevant Files

- `playwright.config.ts`
- `e2e/app.spec.ts`
- `test-results/.last-run.json`
- `test-results/<failed-case>/error-context.md`
- `src/components/MetalEarGymApp.tsx`
- `src/components/MetalEarGymSidebar.tsx`
- `src/components/MetalEarGymSongResults/`

## Procedure

1. Start with the narrowest failing slice. Prefer a single spec, one `--project`, or one `--grep` match instead of `npm run test:e2e` across the whole matrix.
2. Preflight the filter with `--list` whenever the target is uncertain. That validates the file, project, and grep combination without running the suite.
3. Prefer a summarized execution tool for the test command so the output comes back as a concise failure summary. If that is not available, keep the raw run tightly scoped.
4. From the command output, capture only the failing test title, project, file and line, main assertion or locator, and the first error block.
5. Read `test-results/.last-run.json` only to confirm the run failed, then read only the matching `test-results/<failed-case>/error-context.md` folder for the specific failure under repair.
6. In `error-context.md`, focus on the exact mismatch: duplicate accessible names, missing text, wrong heading level, missing navigation state, or mobile overlay behavior. Quote only the small page snapshot section that explains the mismatch.
7. Fix the nearest owner of the behavior. If the snapshot shows the UI is correct and the locator is too broad, adjust `e2e/app.spec.ts`. If the snapshot shows incorrect text or missing state, fix the relevant component under `src/components/`.
8. Rerun the same narrowed command. If the initial failure came from a broader run, use `--last-failed` to keep follow-up runs focused before widening back out.

## Useful Command Shapes

- `npm run test:e2e -- --list e2e/app.spec.ts --project=chromium-desktop --grep "opens sidebar when toggle is clicked"`
- `npm run test:e2e -- e2e/app.spec.ts --project=chromium-desktop`
- `npm run test:e2e -- e2e/app.spec.ts --project=mobile-iphone-14 --grep "tapping backdrop closes the sidebar on mobile"`
- `npm run test:e2e -- e2e/app.spec.ts --grep "header shows All Intervals with correct song count"`
- `npm run test:e2e -- --list --last-failed`
- `npm run test:e2e -- --last-failed`

## Repo-Specific Notes

- The Playwright config already starts Vite on port `5174` and injects a mock CSV source. Do not start a separate app server for normal Playwright triage.
- Common failure surfaces in this repo are drawer button labels, `navigation` visibility, header text such as `All Intervals`, search placeholder text, `Void Detected`, and duplicate song headings.
- Treat `test-results/` as read-only diagnostics. Use it to understand the failure, not as an edit target.
