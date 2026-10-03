import { defineConfig } from "@playwright/test";
export default defineConfig({ testDir: ".", testMatch: "*.spec.js", reporter: "line", workers: 1,
  use: { baseURL: "http://127.0.0.1:4196", browserName: "chromium",
    launchOptions: process.env.PLAYWRIGHT_EXECUTABLE_PATH ? { executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH } : {} },
  webServer: { command: "python3 -m http.server 4196 --bind 127.0.0.1 --directory public",
    url: "http://127.0.0.1:4196/sub/app/harness.html", reuseExistingServer: false }
});
