import { defineConfig, devices } from "@playwright/test";

const liveUrl = process.env.PW_BASE_URL;

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  use: {
    baseURL: liveUrl || "http://127.0.0.1:3000"
  },
  webServer: liveUrl ? undefined : {
    command: "npm run dev",
    url: "http://127.0.0.1:3000",
    reuseExistingServer: true
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } }
  ]
});
