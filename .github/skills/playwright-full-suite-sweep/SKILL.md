---
name: playwright-full-suite-sweep
description: "Run the full Playwright e2e matrix in metal-intervals without filling the context window. Use when the initial e2e sweep is needed, most Playwright tests are failing, all projects must run, or the agent needs dot/html/json reporters and a summary-first workflow."
argument-hint: "[describe the initial sweep goal or current failure cluster]"
---

# Playwright Full Suite Sweep

## When To Use

- The repo needs an initial Playwright sweep across all configured projects.
- Many e2e tests are already failing and the goal is to build a repair queue without flooding chat with logs.
- A broad UI or behavior change may have broken multiple projects at once.

## Relevant Files

- `playwright.config.ts`
- `e2e/app.spec.ts`
- `test-results/.last-run.json`
- `test-results/<failed-case>/error-context.md`
- `test-results/playwright-results.json`
- `test-results/playwright-report/`

## Procedure

1. Preflight the suite shape without running it when needed: `npm run test:e2e:sweep -- --list`.
2. Run the full suite with concise console output and file artifacts under `test-results/`: `npm run test:e2e:sweep`.
3. Use a summarized execution path so the agent returns only the totals, failing test titles, project names, and a short failure synopsis. Do not paste the full console log into chat.
4. Treat `test-results/playwright-results.json` and `test-results/playwright-report/` as lookup artifacts for navigation and later review. Do not read either file wholesale into context.
5. Build the repair queue from the summary first, then inspect `test-results/<failed-case>/error-context.md` one failure at a time for the current fix.
6. Group failures by shared cause before editing. In this repo the common clusters are accessible name drift, duplicate song headings, sidebar visibility and toggle behavior, search placeholder or empty-state text, and mobile overlay behavior.
7. Fix one root cause, then rerun with `npm run test:e2e -- --last-failed` or a narrower `--project` and `--grep` command. Do not repeat the full matrix after every edit.
8. Only rerun the full suite after the grouped local failures have been reduced or eliminated.

## Useful Command Shapes

- `npm run test:e2e:sweep -- --list`
- `npm run test:e2e:sweep`
- `npm run test:e2e -- --last-failed --reporter=dot`
- `npm run test:e2e -- e2e/app.spec.ts --project=chromium-desktop --grep "opens sidebar when toggle is clicked"`

## Repo-Specific Notes

- The Playwright config already starts Vite on port `5174` with the mock CSV source, so a normal full-suite sweep does not need a separate app server.
- The `test:e2e` npm script routes HTML, JSON, and blob reporter outputs into `test-results/` so agent runs do not litter the repo root.
- The installed Playwright CLI in this repo accepts comma-separated reporters, and `--list` works with `dot,html,json` without executing tests.
- Use `npx playwright show-report test-results/playwright-report` only when a human wants to inspect the HTML report locally. For agent work, the summary plus targeted `error-context.md` reads are the default path.
