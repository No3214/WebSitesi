import { defineConfig, devices } from "@playwright/test";

const liveUrl = process.env.PW_BASE_URL;
const useSystemChrome = process.env.PW_USE_SYSTEM_CHROME === "1";

export default defineConfig({
  testDir: "./tests",
  testMatch: "**/*.spec.ts",
  outputDir: "test-results/playwright-artifacts",
  fullyParallel: true,
  use: {
    baseURL: liveUrl || "http://127.0.0.1:3006"
  },
  webServer: liveUrl ? undefined : {
    command: "npx next start --port 3006",
    url: "http://127.0.0.1:3006",
    reuseExistingServer: false
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        ...(useSystemChrome ? { channel: "chrome" } : {}),
      },
    }
  ]
});
