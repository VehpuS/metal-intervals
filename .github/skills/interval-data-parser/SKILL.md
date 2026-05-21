---
name: interval-data-parser
description: "Update CSV ingestion, Google Sheets parsing, or YouTube link normalization in metal-intervals. Use when changing AppFetcher, metalEarGymData.ts, sheet column behavior, HYPERLINK formulas, missing rows, or parser tests."
argument-hint: "[describe the data or parsing change]"
---

# Interval Data Parser

## When To Use

- Update the Google Sheets CSV ingest path.
- Change parsing rules for interval, direction, song, part, or link cells.
- Fix or extend YouTube link handling, `=HYPERLINK()` parsing, or bare-title search URL generation.
- Adjust loading and error behavior around `VITE_SHEET_CSV_URL`.

## Relevant Files

- `src/components/AppFetcher.tsx`
- `src/components/metalEarGymData.ts`
- `src/components/metalEarGymTypes.ts`
- `src/components/__tests__/metalEarGymData.test.ts`
- `e2e/app.spec.ts`

## Procedure

1. Decide whether the change belongs in fetch-time state handling or row parsing. Keep `AppFetcher.tsx` focused on loading and errors and `metalEarGymData.ts` focused on normalization.
2. Preserve current parser invariants unless the task explicitly changes them: skip the header row, ignore blank rows and blank song names, carry forward interval and direction values across empty cells, and normalize YouTube watch, shorts, embed, clip, short-link, and `=HYPERLINK()` inputs.
3. If the sheet starts carrying bare song titles instead of URLs, continue generating YouTube search URLs only for strings that look like searchable song titles.
4. Add or update focused coverage in `src/components/__tests__/metalEarGymData.test.ts` for every parser rule change.
5. Run `npm run test`. If the change affects visible loading, errors, counts, or song output, also run `npm run test:e2e`.
