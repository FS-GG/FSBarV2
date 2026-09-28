import { defineConfig } from "@playwright/test";

const executablePath = process.env.PLAYWRIGHT_EXECUTABLE_PATH;

export default defineConfig({
  testDir: ".",
  testMatch: "*.spec.js",
  reporter: "line",
  workers: 1,
  use: {
    baseURL: "http://127.0.0.1:4193",
    browserName: "chromium",
    launchOptions: executablePath ? { executablePath } : {},
  },
  webServer: {
    command: "python3 -m http.server 4193 --bind 127.0.0.1",
    cwd: "../..",
    url: "http://127.0.0.1:4193/tests/Broker.Browser.Wasm.Tests/harness.html",
    reuseExistingServer: false,
  },
});
