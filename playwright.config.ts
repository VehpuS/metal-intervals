import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  retries: 1,
  outputDir: "test-results",
  reporter: "list",
  use: {
    baseURL: "http://localhost:5174",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium-desktop",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "mobile-iphone-se",
      use: { ...devices["iPhone SE"] },
    },
    {
      name: "mobile-iphone-14",
      use: { ...devices["iPhone 14 Pro Max"] },
    },
    {
      name: "tablet-ipad",
      use: { ...devices["iPad Mini"] },
    },
  ],
  webServer: {
    command:
      "VITE_SHEET_CSV_URL=http://localhost:5174/__mock__/data.csv npm run dev -- --port 5174",
    url: "http://localhost:5174",
    reuseExistingServer: false,
  },
});
