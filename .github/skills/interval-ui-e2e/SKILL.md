---
name: interval-ui-e2e
description: "Modify interval sidebar, search filtering, song cards, empty states, or responsive layout in metal-intervals. Use when changing MetalEarGymApp, MetalEarGymSidebar, MetalEarGymSongResults, drawer labels, mobile overlay behavior, or Playwright UI tests."
argument-hint: "[describe the UI or interaction change]"
---

# Interval UI And E2E

## When To Use

- Change interval selection, search filtering, header text, or song result rendering.
- Modify sidebar open and close behavior or mobile overlay behavior.
- Update empty states, button labels, placeholders, or song card interactions.
- Add or repair Playwright coverage for desktop, mobile, or tablet behavior.

## Relevant Files

- `src/components/MetalEarGymApp.tsx`
- `src/components/MetalEarGymSidebar.tsx`
- `src/components/MetalEarGymSongResults/`
- `src/components/__tests__/MetalEarGymSidebar.test.tsx`
- `src/components/__tests__/SongCard.test.tsx`
- `src/components/__tests__/EmptyResults.test.tsx`
- `e2e/app.spec.ts`

## Procedure

1. Keep state ownership in `MetalEarGymApp.tsx`. Do not move parsing rules into presentation components.
2. Preserve test-critical accessible text unless the change intentionally updates tests too. Current Playwright coverage depends on names like `Show interval drawer`, `Hide interval drawer`, `All Intervals`, `Void Detected`, the search placeholder, and the `Play` control.
3. For responsive work, verify that the sidebar stays hidden by default, opens via the drawer toggle, overlays the content on small screens, and can close from repeated toggle interaction or mobile backdrop clicks.
4. Update nearby tests in the same change. Use `e2e/app.spec.ts` for search, drawer, viewport, and popup behavior; use the component tests for focused rendering and interaction behavior.
5. Run `npm run test:e2e` for UI and interaction changes. Also run `npm run test` when touched code is covered by Vitest.
