import { expect, test } from "@playwright/test";

// Minimal CSV fixture that covers two intervals with multiple songs
const MOCK_CSV = `Interval,Direction,Song,Part,Link
Minor 2nd,Ascending,Walk - Pantera,Riff,https://www.youtube.com/watch?v=abc1
,Descending,Smoke on the Water - Deep Purple,Intro,https://youtu.be/abc2
Major 2nd,Ascending,Wherever I May Roam - Metallica,Verse,https://www.youtube.com/watch?v=abc3
,,Iron Man - Black Sabbath,Riff,
`;

test.beforeEach(async ({ page }) => {
  // Intercept the mock CSV URL configured via VITE_SHEET_CSV_URL in playwright.config.ts
  await page.route("**/__mock__/data.csv", (route) =>
    route.fulfill({ contentType: "text/csv", body: MOCK_CSV }),
  );
  await page.goto("/");
  // Wait until at least one song card is rendered
  await page.waitForSelector("h3", { timeout: 5000 });
});

test.describe("initial render", () => {
  test("shows the app with songs loaded", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: /walk - pantera/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /iron man/i }),
    ).toBeVisible();
  });

  test("header shows All Intervals with correct song count", async ({
    page,
  }) => {
    await expect(
      page.getByRole("heading", { name: /all intervals/i }),
    ).toBeVisible();
    await expect(page.getByText(/4 active examples/i)).toBeVisible();
  });
});

test.describe("search", () => {
  test("filters cards by song title", async ({ page }) => {
    await page.getByPlaceholder(/search/i).fill("pantera");
    await expect(
      page.getByRole("heading", { name: /walk - pantera/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /iron man/i }),
    ).not.toBeVisible();
  });

  test("filters cards by part", async ({ page }) => {
    await page.getByPlaceholder(/search/i).fill("riff");
    await expect(
      page.getByRole("heading", { name: /walk - pantera/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /iron man/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /smoke on the water/i }),
    ).not.toBeVisible();
  });

  test("shows EmptyResults when search has no matches", async ({ page }) => {
    await page.getByPlaceholder(/search/i).fill("xyznonexistent");
    await expect(
      page.getByRole("heading", { name: /void detected/i }),
    ).toBeVisible();
  });

  test("restoring search shows all songs again", async ({ page }) => {
    const input = page.getByPlaceholder(/search/i);
    await input.fill("pantera");
    await input.clear();
    await expect(
      page.getByRole("heading", { name: /iron man/i }),
    ).toBeVisible();
  });
});

test.describe("interval sidebar", () => {
  test("sidebar is hidden by default", async ({ page }) => {
    await expect(page.getByRole("navigation")).not.toBeVisible();
  });

  test("opens sidebar when toggle is clicked", async ({ page }) => {
    await page.getByRole("button", { name: /show interval drawer/i }).click();
    await expect(page.getByRole("navigation")).toBeVisible();
    await expect(
      page.getByRole("button", { name: /^minor 2nd$/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /^major 2nd$/i }),
    ).toBeVisible();
  });

  test("closes sidebar when toggle is clicked again", async ({ page }) => {
    const toggle = page.getByRole("button", { name: /show interval drawer/i });
    await toggle.click();
    await page.getByRole("button", { name: /hide interval drawer/i }).click();
    await expect(page.getByRole("navigation")).not.toBeVisible();
  });

  test("deselecting an interval removes its songs from results", async ({
    page,
  }) => {
    await page.getByRole("button", { name: /show interval drawer/i }).click();
    // Deselect Minor 2nd
    await page.getByRole("button", { name: /minor 2nd/i }).click();
    await expect(
      page.getByRole("heading", { name: /walk - pantera/i }),
    ).not.toBeVisible();
    await expect(
      page.getByRole("heading", { name: /wherever i may roam/i }),
    ).toBeVisible();
  });

  test("header reflects filtered interval count", async ({ page }) => {
    await page.getByRole("button", { name: /show interval drawer/i }).click();
    await page.getByRole("button", { name: /minor 2nd/i }).click();
    await expect(
      page.getByRole("heading", { name: /1 intervals/i }),
    ).not.toBeVisible();
    // Should now show "Major 2nd" as the active label (single interval)
    await expect(
      page.getByRole("heading", { name: /major 2nd/i }),
    ).toBeVisible();
  });

  test("deselecting all intervals shows EmptyResults", async ({ page }) => {
    await page.getByRole("button", { name: /show interval drawer/i }).click();
    await page.getByRole("button", { name: /deselect all/i }).click();
    await expect(
      page.getByRole("heading", { name: /void detected/i }),
    ).toBeVisible();
  });
});

test.describe("mobile viewport — sidebar overlay", () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test("sidebar renders as overlay (not push) on mobile", async ({ page }) => {
    await page.getByRole("button", { name: /show interval drawer/i }).click();
    // The sidebar should exist and main content should still be in the DOM behind it
    await expect(page.getByRole("navigation")).toBeVisible();
    await expect(page.getByRole("main")).toBeVisible();
  });

  test("tapping backdrop closes the sidebar on mobile", async ({ page }) => {
    await page.getByRole("button", { name: /show interval drawer/i }).click();
    await expect(page.getByRole("navigation")).toBeVisible();
    // Click in the backdrop area (right of the 320px sidebar)
    await page.mouse.click(360, 400);
    await expect(page.getByRole("navigation")).not.toBeVisible();
  });

  test("search bar is visible below the header on mobile", async ({ page }) => {
    await expect(page.getByPlaceholder(/search/i)).toBeVisible();
  });

  test("play button works on mobile", async ({ page }) => {
    const popupPromise = page.waitForEvent("popup");
    await page.getByTitle("Play").first().click();
    const popup = await popupPromise;
    expect(popup.url()).toContain("youtube.com");
    await popup.close();
  });
});
