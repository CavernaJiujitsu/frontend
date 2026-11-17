import { defineConfig } from "@playwright/test";

const port = Number(process.env.E2E_PORT ?? 8081);
const baseURL = `http://localhost:${port}`;

/**
 * E2E against the real Expo web dev server and the real API. The API must be
 * running on http://localhost:3000 (see `.env`); the suite never cleans the
 * database and creates a new student per execution.
 */
export default defineConfig({
  testDir: "./e2e",
  timeout: 180_000,
  expect: { timeout: 20_000 },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  forbidOnly: Boolean(process.env.CI),
  reporter: [["list"]],
  use: {
    baseURL,
    channel: "chrome",
    headless: true,
    locale: "pt-BR",
    timezoneId: "America/Sao_Paulo",
    viewport: { width: 1280, height: 900 },
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "off",
  },
  webServer: {
    command: `bun run web -- --port ${port}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 240_000,
    env: {
      CI: "1",
      EXPO_NO_TELEMETRY: "1",
    },
  },
});
