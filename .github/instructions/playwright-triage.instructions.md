---
description: "Use when running, triaging, or fixing Playwright tests in metal-intervals. Covers targeted Playwright commands, reading error-context.md, avoiding oversized logs, and rerunning the smallest failing slice."
name: "Playwright Triage"
---

# Playwright Triage

- Prefer a summarized execution path for Playwright runs so only failing excerpts come back. If raw terminal output is necessary, keep the run scoped to one file, one project, or one `--grep` match.
- Do not start a separate dev server for normal Playwright runs. `playwright.config.ts` already starts Vite on port `5174` with the mock CSV URL.
- Start with the narrowest command that can falsify the current hypothesis.

## Targeted Commands

- Preflight a filter without running tests: `npm run test:e2e -- --list e2e/app.spec.ts --project=chromium-desktop --grep "opens sidebar when toggle is clicked"`
- Single spec: `npm run test:e2e -- e2e/app.spec.ts`
- Single project: `npm run test:e2e -- e2e/app.spec.ts --project=chromium-desktop`
- Single test name: `npm run test:e2e -- e2e/app.spec.ts --project=chromium-desktop --grep "opens sidebar when toggle is clicked"`
- Rerun only the last failing set: `npm run test:e2e -- --last-failed`

## Full Suite Mode

- Use full suite mode only for the initial sweep or after wide app changes that can affect many projects at once.
- For an all-project run, keep stdout terse and write the rich results under `test-results/` instead of the repo root: `npm run test:e2e:sweep`
- To confirm collection without executing tests, use the same command with `--list`.
- When running the full suite with an agent, ask for only the totals, failing test titles, project names, and artifact paths. Do not paste the full console stream or the full JSON report into context.
- After the initial sweep, switch back to narrowed repair mode with `npm run test:e2e -- --last-failed` or a targeted `--project` and `--grep` rerun.

## How To Read Results

- First capture only the failing test title, project, file and line, locator or assertion text, and the top error message.
- For a full sweep, prefer the execution summary first. Use `test-results/playwright-results.json` or `test-results/playwright-report/` only as lookup artifacts, not as files to dump into chat.
- Next inspect `test-results/.last-run.json` only to confirm whether the last run failed.
- Then read only the matching `test-results/<failed-case>/error-context.md` file for the failure being fixed.
- In `error-context.md`, extract the minimal useful clues: strict mode violations, the duplicated or missing accessible name, the failing selector, and the few page snapshot lines around the relevant element.
- Do not paste the full page snapshot or full suite output into context unless the failure cannot be understood from the failing block.

## Repair Loop

- If a broad run already failed, use `npm run test:e2e -- --list --last-failed` to inspect the saved failing set without rerunning the suite.
- Change the smallest relevant code or test slice.
- Rerun the same narrowed Playwright command first.
- Only after that passes, widen to the related project set, `npm run test:e2e -- --last-failed`, or the full `npm run test:e2e` suite.

## Repo-Specific Notes

- Projects are `chromium-desktop`, `mobile-iphone-se`, `mobile-iphone-14`, and `tablet-ipad`.
- This repo often fails on accessible names, duplicate headings, placeholder text, sidebar drawer behavior, and mobile overlay interactions. Use the error message and `error-context.md` snapshot to decide whether the fix belongs in `e2e/app.spec.ts` or the component under `src/components/`.
